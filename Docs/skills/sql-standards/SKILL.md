---
name: sql-standards
description: SQL Server stored-procedure and migration-script authoring standards for the Catholic Solutions / CFR platform (Dapper, no ORM, ActionId-discriminated stored procedures, incremental numbered .sql scripts). Use this skill whenever creating or changing a stored procedure, writing a new migration/DDL script under Infrastructure/*/Scripts/, adding a table/column, or reviewing any .sql change in this repo — even if the user only says "add a new SP action", "write a migration for this column", "why does this stored procedure return -1", or "add a table for X". Covers the actual conventions verified against the real Scripts/*.sql files: idempotent ALTER patterns, drop-and-recreate procedures, per-ActionId header documentation, the TRY/CATCH/TRANSACTION/sentinel-RETURN pattern, and the operational risk that Pilot/Staging/Live share one physical database with no formal migration framework. Complements backend-api-standards (the Controller->Service->Repository/.NET half of the same contract) rather than duplicating it.
---

# SQL Standards — Catholic Solutions (CFR)

This skill governs the **SQL half** of this platform's data layer: stored procedures and the incremental migration scripts under `backend/Infrastructure/{CFR.AcutisInfrastructure,CFR.PortalInfrastructure}/Scripts/*.sql`. The **.NET half** of the same contract (Repository classes, `StoredProc.cs`, `SQLParams.cs`, `IDapperHandler`, audit-column stamping from `ICurrentUserService`) is `backend-api-standards`' job — this skill assumes that boundary and does not repeat it; it tells you how to write the `.sql` side so that contract actually holds.

Read `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` §11 first if you don't already know the target module's stored-procedure/table layout.

---

## 0. Critical operational context — read before touching any script

- **No ORM, no migration framework.** Every data access is Dapper calling a named stored procedure with `DynamicParameters` — there is no Entity Framework, no Flyway/DbUp, and no automated version tracking of which scripts have been applied where. Applying a script to a target server is a **manual, unversioned act**. Write every script to be safely re-runnable (idempotent) — see §2 — because there is no tooling to stop someone from running it twice, or to guarantee it was only run once anywhere.
- **Pilot, Staging, and Live share one physical SQL Server instance and database** (`PROJECT_KNOWLEDGE_DOCUMENT.md` §16 — confirmed via `appsettings.{Pilot,Staging,Live}.json`, connection strings byte-for-byte identical host/database across all three; **Secret/credential detected — value intentionally omitted**). A script applied against what looks like a lower environment can be touching the same data as Live. Treat every script as production-affecting unless proven otherwise, and never include a destructive statement (`DROP TABLE`, unconditional `DELETE`/`TRUNCATE`) without an explicit, separate confirmation step in the accompanying instructions.
- **Almost none of the live schema is defined in this repository.** A repo-wide search found exactly **3** `CREATE TABLE` statements in the entire backend tree (`[auth].[CFRLaunch]`, `[core].[Organization]` and `[lic].[OrganizationProduct]`, both in `016_Acutis_Organization_Rebuild.sql`). Every other table referenced by any stored procedure (`auth.User`, `auth.UserProduct`, `auth.AcutisRole`, `core.Product`, `lic.License`, `request.AccessRequest*`, `adm.EmailTemplate`, etc.) **pre-exists on the live server and is not declared anywhere in source control.** Do not assume you know a table's full column list, constraints, or indexes from grepping the repo — see §7's discovery step before modifying any existing table.
- **Some stored procedures aren't checked into the repo at all.** The legacy `[auth].[GetRightByRoleId]`/`[auth].[SaveUserRights]` procedures (User Rights feature) are called from C# but have no corresponding script in either `Scripts/` folder. If you need to modify one of these, **first add a script that captures its current live definition** (script it out via SSMS/`sp_helptext` and commit that as the new baseline) before changing it — don't let a second undocumented procedure drift further from source control.

---

## 1. File location & naming

- One `Scripts/` folder per Infrastructure project: `backend/Infrastructure/CFR.AcutisInfrastructure/Scripts/` and `backend/Infrastructure/CFR.PortalInfrastructure/Scripts/`. Put a script in the project that owns the feature (Portal-only features like `CFRLaunch`/SSO go in `CFR.PortalInfrastructure`; everything else in `CFR.AcutisInfrastructure`).
- Naming: `0NN_{Project or Feature}_{Description}.sql`, e.g. `016_Acutis_Organization_Rebuild.sql`, `002_Portal_CFRLaunch.sql`. Pick the next number **higher than the current highest file in that folder** — but note the existing sequence already has genuine collisions (`005_Acutis_PasswordReset.sql` and `005_Acutis_Users.sql`; `008_AccessRequest.sql` and `008_Acutis_Organization.sql` both exist today), so treat the number as a rough chronological hint for humans, not a uniqueness constraint anything enforces — don't spend effort renumbering history to remove the collision, just don't make a *new* collision if you can avoid it.
- Don't drop a one-off script outside the `Scripts/` folder the way `Infrastructure/rename_crud_procs.sql` and `Infrastructure/organization_migration.sql` already did — both are now stranded, untracked-as-part-of-any-sequence ad hoc files. Every new script, including a "just this once" data-fix script, goes in the numbered `Scripts/` folder for the project it affects.
- One script per logical change (one feature's table/procedure, or one focused fix) — not one giant per-release script, matching the existing one-script-per-feature pattern.

---

## 2. Idempotent DDL — every script must be safely re-runnable

**Adding a column** (verified pattern, `008_AccessRequest.sql`):
```sql
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'ContactPhone'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [ContactPhone] NVARCHAR(30) NULL;
END
GO
```
Always schema-qualify (`[schema].[Table]`), always check `INFORMATION_SCHEMA.COLUMNS` (or the equivalent `sys.*` catalog view for other object types) before the `ALTER`, and always end the batch with `GO`.

**Creating or replacing a stored procedure** (verified pattern, every script in both `Scripts/` folders): this codebase **drops and recreates** rather than `ALTER PROCEDURE`s:
```sql
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[request].[AccessRequestManage]', N'P') IS NOT NULL
    DROP PROCEDURE [request].[AccessRequestManage];
GO

CREATE PROCEDURE [request].[AccessRequestManage]
    ...
AS
...
```
Include `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO` immediately before every `CREATE PROCEDURE` — every existing script does this, and SQL Server requires these session settings to be fixed at creation time for a procedure using indexed views/computed columns/etc.

**Creating a table**: only 3 precedents exist (`016_Acutis_Organization_Rebuild.sql`) — include an `IF OBJECT_ID(...) IS NULL` guard, explicit audit columns (§5), and an explicit `IsDeleted BIT NOT NULL DEFAULT 0` if the feature needs soft delete (it almost always does in this codebase).

---

## 3. Header documentation — mandatory, matches the project's own established practice

Every script starts with:
```sql
-- Copyright (c) OptionC. All rights reserved.
-- {one-line purpose of this script}
```
Every stored procedure additionally gets a comment block **directly above `CREATE PROCEDURE`** documenting every `ActionId` branch's purpose in one line each — this is the SQL-side equivalent of the XML-doc-comment mandate in `backend-api-standards`, and every existing procedure in this repo already does it:
```sql
-- ActionId 1: Save (insert header, product line, history, optional member comment).
-- ActionId 2: Update status (approve / reject / request info). Approving GRANTS real access as
-- part of the same transaction — activates/creates the org's [lic].[OrganizationProduct] row and
-- the requester's [auth].[UserProduct] row for this product — not just a status flag. ...
-- ActionId 3: Get by AccessRequestId (header, timeline, comments).
```
When a script changes something a *previous* script established, cross-reference that script by filename in a comment (e.g. `008_AccessRequest.sql`'s own header notes that `[core].[Organization]` "no longer has Address/City/State/Zip as of `016_Acutis_Organization_Rebuild.sql`") — this is the only durable trail connecting scattered schema history, given there's no migration framework to reconstruct it from.

---

## 4. The `ActionId` discriminator convention

One stored procedure is reused for a whole feature's CRUD surface via an `@ActionId INT` first parameter (`PROJECT_KNOWLEDGE_DOCUMENT.md` §11). **Numbering is per-procedure, not universal** — verified real examples: `Acutis_Users` uses 1=save, 2=status, 3=get-by-id, 4=list, 5=lookups, 6=delete; `Acutis_Organization` uses 1–11, 13, 14 (12 is not used); `AccessRequestManage` uses 1–7; `Portal_CFRLaunch` uses 1–3. **Before adding a new action to an existing procedure, read that procedure's own header comment and body to find its actual next free number** — do not assume any fixed 1–5 or 1–6 scheme applies to a procedure you haven't opened. Reserve the no-`ActionId` (single-purpose) style only for genuinely one-shot procedures like `Acutis_DoLogin`/`Portal_DoLogin`.

When adding a new `ActionId` branch: append its documentation line to the header comment block (§3), add the branch as `IF @ActionId = N BEGIN ... END`, and keep it inside the same procedure rather than creating a sibling procedure for "just one more action" — that's the whole point of the pattern.

---

## 5. Parameter & column conventions

- Every parameter is optional with a default (`@ProductId INT = NULL`, `@AccessRequestId BIGINT = 0`) so callers only need to supply what a given `ActionId` actually uses.
- Any mutating `ActionId` gets a **`@ReturnValue INT = NULL OUTPUT`** parameter as the last one declared — this is what the C# `IDapperHandler` call reads back (per `SQLParams.cs`'s own comment, "output `ReturnValue` param"), not a bare `RETURN` value from the batch (though procedures also `RETURN @ReturnValue;` redundantly to exit a branch early — the OUTPUT parameter is the one Dapper actually reads).
- Audit columns are always **parameters passed in**, not derived inside the procedure: `@InsertedBy BIGINT = NULL`, `@UpdatedBy BIGINT = NULL`. The stored procedure's job is only to persist whatever value it's given — **it is the .NET Repository's job (per `backend-api-standards`) to populate these from `ICurrentUserService.UserId`, never from the request DTO.** Don't add logic inside the SP that tries to derive an actor id from anything else (e.g. `SUSER_SNAME()`) — that would silently diverge from the app's actual authenticated-user concept.
- Every new parameter needs a matching `nameof()`-based constant added to the relevant nested static class in `SQLParams.cs` (e.g. `AccessRequestParams`, `OrganizationParams`) — never let a Repository hardcode a raw parameter-name string.
- Types, by observed convention: `NVARCHAR` for all text (never `VARCHAR`), `BIGINT` for entity ids that cross into C# `long` (`OrgId`, `AccessRequestId`, `LicenseId`), `INT` for smaller/legacy ids, `BIT` for booleans/soft-delete, `SYSUTCDATETIME()` for every audit timestamp (never `GETDATE()`, which is local-server time and inconsistent across environments).
- Soft delete: an `IsDeleted BIT NOT NULL DEFAULT 0` column, set on insert, flipped rather than physically deleted on a "delete" `ActionId` — matches every table this repo actually creates.

---

## 6. Error handling & transactions — the verified pattern

Every existing multi-statement mutating `ActionId` branch in this codebase follows this exact shape (verified in `008_AccessRequest.sql`):

```sql
IF @ActionId = 1
BEGIN
    -- ... expected-failure validation FIRST, before any transaction ...
    IF (/* e.g. a duplicate/conflict condition */)
    BEGIN
        SET @ReturnValue = -99;
        RETURN @ReturnValue;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO ... ;
        SET @NewId = SCOPE_IDENTITY();
        INSERT INTO ... ;  -- as many related inserts as the feature needs, same transaction

        COMMIT TRANSACTION;
        SET @ReturnValue = CAST(@NewId AS INT);
        RETURN @ReturnValue;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @ReturnValue = 0;
        RETURN @ReturnValue;
    END CATCH
END
```

Rules that follow from this:
- **Anticipated failure conditions (bad input, not-found, duplicate/conflict) are checked and given a specific, documented negative sentinel BEFORE entering `BEGIN TRY`** — don't rely on a thrown SQL error (e.g. a unique-constraint violation) to signal an expected business condition; check for it explicitly and return a controlled sentinel instead.
- **Unexpected errors inside `CATCH` are rolled back and mapped to a low-information generic sentinel (commonly `0`)** — this is the established convention, but be aware it means real SQL error detail (message, line, error number) is **not** propagated back to the .NET layer on an unexpected failure; the Service layer's generic `ErrorCodes.InternalServerError` fallback is the only signal that reaches the API response. Keep the CATCH block's surface area small by validating everything you can anticipate before the TRY, so genuinely unexpected errors stay rare.
- **Every sentinel value an `ActionId` can return must be documented in the header comment (§3) and must have a corresponding, exact mapping already written (or about to be written) in the calling C# Service** (see `unit-testing-standards` §3.4(4) and `api-testing-standards` §4, both of which depend on these being stable). **Never reuse the same numeric sentinel for two different meanings across two different procedures or `ActionId`s that a single Service method might confuse** — `CFRLaunchService.LaunchProductAsync`/`ExchangeTokenAsync` already demonstrates how easy this is to get wrong (both reuse `-2`..`-6` for entirely different meanings) even though that specific ambiguity lives in the .NET mapping layer; pick sentinel values deliberately and document them so a future reader isn't tempted to assume parity across procedures.
- `@@TRANCOUNT > 0` guard before `ROLLBACK` — always include it, since a `CATCH` block can be entered before a transaction was ever opened (e.g., a `TRY_CAST` failure in a `SELECT` that runs before `BEGIN TRANSACTION`).

---

## 7. Discovery step — required before modifying any existing table or legacy procedure

Since most schema (§0) isn't declared in this repo, **query the real target environment before writing an `ALTER`**, and paste what you found into the new script's header comment — exactly as `016_Acutis_Organization_Rebuild.sql` already does (its own comments cite real FK constraint names discovered via `sys.foreign_keys`, not anything visible elsewhere in the repo):

```sql
-- Discovery run against {environment} on {date}:
SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{schema}' AND TABLE_NAME = '{table}';
SELECT fk.name, OBJECT_NAME(fk.parent_object_id), OBJECT_NAME(fk.referenced_object_id)
  FROM sys.foreign_keys fk WHERE fk.parent_object_id = OBJECT_ID('{schema}.{table}');
SELECT cc.name, cc.definition FROM sys.check_constraints cc WHERE cc.parent_object_id = OBJECT_ID('{schema}.{table}');
SELECT i.name, i.is_unique FROM sys.indexes i WHERE i.object_id = OBJECT_ID('{schema}.{table}');
```
This matters concretely: `PROJECT_KNOWLEDGE_DOCUMENT.md` §13 cites a real, discovered `CHECK` constraint on `core.Organization.OrgStatus` (`CK__Organizat__OrgSt__4B0D20AB`) that is enforced live but not declared in any script — an `ALTER`/new insert path that doesn't account for a constraint like this will fail at runtime with no warning from anything in source control.

---

## 8. Security

- Every C#-to-SQL call is already parameterized via Dapper `DynamicParameters` — never build a raw SQL string with interpolated values on the .NET side (that's `backend-api-standards`' territory, but it bears repeating here since it's the other half of "no SQL injection surface").
- **Inside a stored procedure, avoid dynamic SQL (`EXEC(@sql)`, unparameterized `sp_executesql`) entirely unless there is no alternative.** If dynamic SQL is genuinely required (e.g. a dynamic column list), use `sp_executesql` with proper parameter placeholders — never concatenate a parameter's value directly into the SQL string being executed, even for values that "can't" contain malicious input.

---

## 9. Business-logic placement — what belongs in the SP vs the Service

This codebase already has a clear, deliberate precedent: **`AccessRequestManage`'s `ActionId = 2` (approve/reject/info-request) performs the actual entitlement grant as part of the same transaction as the status change** — activating/creating the `[lic].[OrganizationProduct]` and `[auth].[UserProduct]` rows for the approved product, not just flipping a status flag, per its own header comment: *"Without this the request could be 'approved' yet the product would never appear in the member's App Hub / launch flow, since ActionId 6 and Portal_CFRLaunch gate purely on those two tables."* Follow this precedent for any future approval-style workflow: **when an action's whole point is to grant/revoke a downstream entitlement, do the grant/revoke in the same transaction as the status change**, inside the stored procedure — don't split it into a separate follow-up call from the Service layer, where a partial failure could leave the status changed but the entitlement ungranted (or vice versa).

---

## 10. Output discipline

- Cite the exact stored procedure/script file (and, for an existing procedure, its current highest `ActionId`) before proposing a change — don't invent a plausible-sounding `ActionId` number or sentinel value.
- State explicitly when a change touches a table whose full schema isn't in source control (§0/§7), and include the discovery-query results in the new script's header rather than guessing at column names/constraints.
- Flag any destructive statement (`DROP`, unconditional `DELETE`/`TRUNCATE`, a column drop) as needing explicit human confirmation before being run anywhere, given §0's shared-database risk.
- Hand off the .NET-side half of any new procedure/parameter (Repository wiring, `StoredProc.cs`/`SQLParams.cs` constants, Service-layer sentinel mapping) to `backend-api-standards` rather than duplicating that guidance here.
