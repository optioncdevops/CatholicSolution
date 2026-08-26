# Database Contract — Acutis Authentication

Scope and date: Task 2, 2026-08-26 (original, code-only analysis). **Task 8, 2026-08-26 — a live verification attempt was made** (see below); it did not succeed, so everything in this document remains derived from source-code references only, not a live schema. Per the task's rules ("treat unsupported database operations as explicit blockers," "do not silently invent database tables, stored procedures, or fields"), every object below is labeled **Confirmed-in-reference-code** or **Not found / must be confirmed**, and nothing is presented as guaranteed to exist in the target database. **Task 12, 2026-08-26** added the configuration/DI *scaffolding* a real repository will need (mode selection, connection-string key, fail-fast checks) without implementing or connecting to one — see [Configuration scaffolding (Task 12)](#configuration-scaffolding-task-12) below.

## Configuration scaffolding (Task 12)

`CFR.Acutis` now has a config-driven switch between two `IAcutisAuthenticationRepository` registrations, selected by `AcutisAuthRepositorySelection.AddAcutisAuthRepository` (`backend/Microservices/CFR.Acutis/AcutisAuthRepositorySelection.cs`, called from `Program.cs`):

| `AcutisAuth:RepositoryMode` | Registers | Behavior |
|---|---|---|
| `DevelopmentFake` (**default** — used when the key is absent) | `AcutisAuthenticationRepositoryDevFake` (unchanged from prior tasks) | One hardcoded credential pair; no database call |
| `Database` | `AcutisAuthenticationRepositoryNotImplemented` (new — a placeholder, NOT a real repository) | Every method throws `NotImplementedException` immediately — never silently behaves like the fake |

Neither path connects to a database. `Database` mode's only job today is to (a) fail fast at startup if `ConnectionStrings:{ConnectionStringKey}` (default key name `AcutisDb`) isn't configured, and (b) register a repository that fails loudly rather than pretending to work, so the moment someone points `RepositoryMode` at `Database` without a real implementation behind it, that's immediately obvious — not a silent no-op.

**Production safeguard:** `DevelopmentFake` mode is rejected at startup (`InvalidOperationException`) outside a Development environment unless `AcutisAuth:AllowDevelopmentFakeOutsideDevelopment=true` is explicitly set — a clearly-named, off-by-default escape hatch, not an implicit allowance.

**Where the real connection string goes when one exists:** never a tracked `appsettings*.json` file. Local development: `dotnet user-secrets set "ConnectionStrings:AcutisDb" "..."` (wired via `builder.Configuration.AddUserSecrets<Program>()`, Development-only, `CFR.Acutis.csproj`'s new `<UserSecretsId>`). Any other environment: the environment variable `ConnectionStrings__AcutisDb` (or your platform's secret-injection mechanism). See [operations-runbook.md](operations-runbook.md) for exact commands (no real values shown).

This scaffolding does **not** change the actual blocker: whether `NewViper.DoLogin` exists with the assumed shape, and whether the approved development database is reachable from wherever implementation work happens, remain exactly as Tasks 8 and 10 left them — see below.

## Task 8 verification attempt — result: BLOCKED, no approved development database available

A live-verification attempt was made this task, per its Phase 1 instructions. Findings:

1. **`CFR.Acutis` has no `ConnectionStrings` configuration at all** — confirmed again by direct read of `backend/Microservices/CFR.Acutis/appsettings.json` and `appsettings.Development.json` (unchanged since Task 1). No connection-string key, no target server/database name, is specified anywhere for this project.
2. **A local SQL Server instance (`SQLEXPRESS`) is running on this machine.** Connected to it read-only via Windows-integrated authentication (`sqlcmd -S .\SQLEXPRESS -E`, no password/credential ever supplied or printed) and listed its databases: `ECommerceShopDB`, plus the standard `master`/`model`/`msdb`/`tempdb` system databases. **None of these is a plausible Acutis/Viper/OptionC/CFR database** — `ECommerceShopDB` is clearly an unrelated local database from a different project. This rules out the only reachable SQL Server instance as the "approved development database."
3. No `.env` file, configuration file, or document anywhere in either repository names a specific dev database server, instance, or connection string for Acutis. `CFR.Common/Constant.cs`'s `DBConectionName` class defines connection-string *key names* (`ConnString`, `OptionCConnString`, `OptionCComConnString`, `AuditLogDB`) but no corresponding values exist in any `appsettings*.json` for `CFR.Acutis` to bind them to.

**Exact missing prerequisite:** an approved development database — its server/instance, database name, and a connection string (or the means to construct one, e.g. Windows-integrated auth against a named, confirmed instance) — has not been designated for `CFR.Acutis` anywhere in this repository or provided to this session. Without that target, `NewViper.DoLogin`'s existence, parameters, and result-set shapes cannot be verified, and per this task's explicit stop condition, **implementation (Phase 2) was not attempted.** The DEV FAKE repository (`AcutisAuthenticationRepositoryDevFake`) remains the only registered implementation of `IAcutisAuthenticationRepository` — unchanged by this task.

**What would unblock this:** someone with access to the actual target environment needs to supply (a) the database server/instance name, (b) the database name, and (c) either a connection string or confirmation that Windows-integrated auth against that instance is authorized — added to `CFR.Acutis`'s configuration (as a non-secret placeholder key structure at minimum, with the real value supplied via environment variable/secret store, never committed to source control, consistent with this task's own rules).

## Task 10 verification attempt — result: BLOCKED, reference dev database unreachable from this environment

A second attempt was made (2026-08-26), this time reading the reference application's own real `ConnectionStrings:ConnString` (`OptionCMicroservice/OptionC.Acutis/appsettings.Development.json`) to identify — not reuse verbatim — the approved development database's target, per this task's instruction to "use the same approved development database configured by the completed Acutis reference application."

**Findings (server address and instance name deliberately not repeated here or anywhere else in this repository):**

- The reference connection string uses SQL authentication (`User Id`/`Password`) against `Database=optionccom`, with `Encrypt=True;TrustServerCertificate=true`.
- The server portion resolves to a **private (RFC1918) LAN IP address** with a named SQL Server instance.
- A direct TCP reachability check to that address from this execution environment **failed** — no network path exists from here to that host. This is consistent with Task 8's finding that the only SQL Server instance actually reachable from this environment is an unrelated local `SQLEXPRESS` install containing no relevant database.

**Incident note:** while extracting metadata for this check, a shell command intended to redact the connection string instead printed a truncated fragment of it (the private IP and instance name) into this session's tool-call output. This was a mistake — even a truncated/partial connection-string fragment should never have been printed. No further extraction or display of that value was attempted after this was caught; the full connection string, username, and password were never printed at any point. Flagging this transparently rather than omitting it, since the fragment already exists in this session's transcript.

## Task 13 verification attempt — result: still BLOCKED (same target, refined signal)

A third attempt (2026-08-26), immediately before starting real-repository implementation as instructed. This time the reachability check was written to extract and use the server host **entirely inside a single script process**, printing only a yes/no reachability result — no fragment of the connection string, host, or port reached this session's visible output at any point (learning applied from the Task 10 incident).

**Result: TCP connection to port 1433 on the reference database's host was actively refused (`ECONNREFUSED`)** — a more specific signal than Task 10's DNS-resolution failure (which was actually an artifact of a parsing bug in that attempt's script, not a true network-layer result). `ECONNREFUSED` means the host is now network-routable from this environment but nothing accepted a connection on the SQL Server port — consistent with no SQL Server listening there reachable from here, a firewall rule rejecting the connection, or the instance using a dynamic port not discoverable without SQL Browser (UDP 1434) access, which was not attempted (out of scope for a read-only reachability check, and `NewViper.DoLogin` verification requires an actual authenticated connection regardless, not just port-level reachability).

## Task 13 resumed — result: BLOCKED at item 1 (connection string does not resolve here)

A fourth attempt (2026-08-26, same day) resumed after the developer reported having configured `ConnectionStrings:AcutisDb` locally via .NET User Secrets. Before attempting any SQL connection, this session re-verified resolution — using a small, isolated tool that resolves configuration the exact same way `CFR.Acutis` itself does (environment variable, then User Secrets by `CFR.Acutis`'s own `UserSecretsId`), so the value (if present) would never need to pass through any command this session types or prints.

**Finding: the secret is not visible from this execution environment.**
- `dotnet user-secrets list` (run from `backend/Microservices/CFR.Acutis`) reports no secrets configured.
- The User Secrets file location for `CFR.Acutis`'s exact `UserSecretsId` exists as an empty directory — no `secrets.json` has ever been written there.
- The environment variable `ConnectionStrings__AcutisDb` is not set in this session's shell.

**This is now understood to be a cross-environment visibility problem, not (necessarily) a database-reachability problem** — distinct from the Task 10/13-original blockers, which were about the target database itself being unreachable. Whatever the developer configured was set somewhere this session's tooling cannot see (a different machine/terminal session, the wrong project directory, or a command that didn't complete as expected). Per the explicit stop condition, **no SQL connectivity was attempted and no code was implemented** — item 1 of the required verification list already fails, so items 2–10 were not attempted this pass. `DevelopmentFake` remains active and unchanged.

**To move forward:** the secret needs to be set (or confirmed already set) in the exact environment/session that will run `dotnet build`/`dotnet test`/`dotnet run` for this repository — not merely "on the developer's machine" if that's a different environment than the one backing this session's tool execution. `dotnet user-secrets set "ConnectionStrings:AcutisDb" "..."` must be run from `backend/Microservices/CFR.Acutis` (or with `--id cfr-acutis-6f2b6e2e-9e3b-4a4b-8a6e-6f9c2a3ecfr1`), in a shell whose User Secrets store this session's tooling can subsequently read.

**Conclusion: verification still fails at Phase 1, before any query could even be attempted.** Per the explicit stop condition, Phase 2 (real repository implementation) was **not started** — no repository code was written this task. `AcutisAuthenticationRepositoryDevFake` remains the sole working implementation; `AcutisAuthenticationRepositoryNotImplemented` remains the `Database`-mode placeholder, unchanged.

**Three independent attempts (Tasks 8, 10, 13), three consistent outcomes:** this is not a transient or fixable-by-retrying problem from this session's vantage point. Someone with genuine network access to the reference application's development database (or an equivalent, reachable database with the same `NewViper.DoLogin` contract) needs to either perform this verification directly, or grant this execution environment a network path to it (VPN, SSH tunnel, bastion host, etc.).

**Conclusion: still blocked, for a different reason than Task 8.** The reference app's dev database is real and has a real, identifiable target — but it is not network-reachable from wherever this session's tool execution actually runs. Per this task's explicit stop condition, **Phase 2 (real repository implementation) was not attempted.** The DEV FAKE repository remains the only registered implementation of `IAcutisAuthenticationRepository` — unchanged.

**What would unblock this:** either (a) run this work from an environment that has network access to the reference app's development database (e.g., the original developer's own machine/LAN, or a CI runner with a VPN/network path to it), or (b) stand up a copy of the `optionccom` database (or at least the `NewViper` schema objects this feature needs) somewhere reachable from wherever implementation actually happens, or (c) provide a different, already-reachable approved development database with the same `NewViper.DoLogin` contract.

## Task 15 verification attempt — result: still BLOCKED at item 1 (connection string does not resolve here)

A fifth attempt (2026-08-26), per Task 15's explicit read-only-verification-first instruction. Checked, in this exact session's execution environment, before attempting any SQL connection:

- `dotnet user-secrets list` (run from `backend/Microservices/CFR.Acutis`): **"No secrets configured for this application."**
- The User Secrets directory for `CFR.Acutis`'s `UserSecretsId` (`cfr-acutis-6f2b6e2e-9e3b-4a4b-8a6e-6f9c2a3ecfr1`) exists but is **empty** — no `secrets.json` has ever been written there in this environment.
- The environment variable `ConnectionStrings__AcutisDb` is **not set** in this session's shell.
- `appsettings.json`/`appsettings.Development.json` still have no `ConnectionStrings` section (unchanged since Task 1).

This is the identical class of blocker found in the Task 13-resume attempt: not a database-reachability problem this time, but a configuration-visibility problem — whatever connection string might exist for this feature has not been supplied to (or is not visible from) the environment this session's tooling actually runs in. Per the explicit stop condition, **verification stopped at item 1 of 7** (SQL connection succeeds) — `NewViper.DoLogin`'s existence, parameter names/types, both result-set shapes, password-verification behavior, empty-result behavior, and error/timeout behavior were **not checked** this attempt. No repository code was written. `AcutisAuthenticationRepositoryDevFake` and `AcutisAuthenticationRepositoryNotImplemented` are both unchanged.

**Four independent attempts now (Tasks 8, 10, 13, 15), across three distinct root causes** (no designated target at all → target identified but network-unreachable → port actively refused → connection string not visible in this session's environment). To move forward: the connection string needs to be set as a User Secret or environment variable in the *exact* environment/session that will run `dotnet build`/`dotnet test`/`dotnet run` for this repository — see [operations-runbook.md](operations-runbook.md) for the exact (value-free) commands and the cross-session-visibility caveat already documented there from Task 13.

## Session task (2026-08-26, post-Task 15) — result: still BLOCKED at item 1 (connection string does not resolve here)

A sixth attempt, per this session's explicit Phase 1 instruction ("verify safely... print only success/failure, object names, column names and types — no credentials"). Checked, before attempting any SQL connection:

- `dotnet user-secrets list` (from `backend/Microservices/CFR.Acutis`): **"No secrets configured for this application."**
- The User Secrets directory for `CFR.Acutis`'s `UserSecretsId` exists but is **empty**.
- `ConnectionStrings__AcutisDb` is **not set** in this session's shell.

Identical result to the Task 15 attempt immediately prior — this is a standing condition of this session's execution environment, not something that changes attempt-to-attempt without an external action. Per the explicit fallback instruction, `DevelopmentFake` remains the default, no assumed mappings were written, and the rest of this task's work proceeded on database-independent items only (frontend verification, build/test, smoke tests against the fake, documentation). **Phase 2 (real repository) and Phase 3 (password capability) were not attempted** — both are explicitly gated on Phase 1 succeeding first.

**This is now the fifth documented occurrence of the connection-string-not-visible blocker specifically** (distinct from the earlier network-unreachable/port-refused blockers of Tasks 8/10/13): Task 13-resume, Task 15, and this session all found the same thing — whatever the developer configures via `dotnet user-secrets set` in their own terminal is not visible to the environment this tooling actually executes in. This strongly suggests the two are different machines, different OS user accounts, or different terminal sessions/shells that don't share a User Secrets store — see [operations-runbook.md](operations-runbook.md) for exactly what must be confirmed to close this gap.

## What "confirmed" means here

"Confirmed-in-reference-code" means: this exact object name appears in the reference app's `.cs` source and is executed via `IDapperHandler`. It does **not** mean confirmed to exist in the target CFR database — that connection has not been inspected. Before any implementation task in [implementation-plan.md](implementation-plan.md) that depends on one of these objects, its existence and shape in the actual target database must be verified as that task's first precondition.

## Connection target (inference, not verified)

`CFR.Common/Constant.cs` (`DBConectionName`) defines `ConnString`, `OptionCConnString` ("SSO database (`optioncom_sso`)"), `OptionCComConnString` ("Main OptionC database (`optioncom`)"), `AuditLogDB`. This strongly suggests the ongoing platform targets the *same database family* as the reference app (i.e., a `Viper`/`SIS`-schema-style database), consistent with `CFR.*` being a namespace-ported copy of `OptionC.*`. **This is an inference, not a verified fact** — `CFR.Acutis`'s own `appsettings.json` currently has no `ConnectionStrings` section at all (confirmed empty in Task 1's [current-state.md](current-state.md)), so which connection-string key and which physical database Acutis should target is itself an open item for Task 2's implementation preconditions.

## Objects referenced by the reference app's Acutis login/menu flow

| Object | Type | Confirmed-in-reference-code at | Used for |
|---|---|---|---|
| `Viper.DoLogin` | Stored procedure | `OptionCInfrastructure/OptionC.AcutisInfrastructure/Repositorys/AcutisAuthentication/AcutisAuthenticationRepository.cs` (`AuthenticateAsync`, via `IDapperHandler.QueryMultipleAsync`) | Credential verification; returns one `ViperLoginUserResult` row + a `List<ViperLoginModuleRightRow>` grid (module rights used for both authorization and menu shaping) |
| `Viper.StartupSettingsImageBinding` | Stored procedure | Same file, `GetStartupSettingsImageBinding` | Cosmetic theme-image rotation on login — **not required** for the requested feature set; excluded from the CFR.Acutis auth design as out-of-scope/non-essential |
| (rights rowset shape) | Result-set contract | `ViperLoginModuleRightRow` model (fields: `ModuleName`, `UserRight`, `RoleId`, `ParentId`, `LevelId`, `FeatureID`, `DisplayOrder`, `IsHideMenu`, `DisplayName`, `RoutingUrl`, `Icon`) | Menu-tree shaping (`MapModuleRightsToMenu`) — the `GET /navigation/menus` endpoint depends on this exact shape being reproducible from the target database |

**Password verification mechanism:** no hashing, salting, or comparison logic is visible anywhere in the reference repository's .NET code path for this call — `AuthenticateAsync` passes the plaintext `UserName`/`Password` as `DynamicParameters` directly into `Viper.DoLogin` and trusts its single returned user row (or its absence) as the verification result. **This means password verification is presumed to happen entirely inside the stored procedure**, on the database side. This is stated here as the working assumption for [security-model.md](security-model.md) and [api-contract.md](api-contract.md); it is not something the .NET layer can independently confirm without either reading the procedure body (not available in this environment) or a DBA/schema review.

## Objects for the newly requested features — status

| Feature | Required DB object(s) | Status |
|---|---|---|
| Login | `Viper.DoLogin`-equivalent (credential check + rights rowset) | **Confirmed-in-reference-code** (see above). Existence in the *target* database: **must be confirmed** before Task 3 (Login API) begins. |
| Current user (`/me`) | None strictly required — can be derived entirely from JWT claims set at login (see [api-contract.md](api-contract.md)) | **No DB dependency** for the minimal version. An optional revalidation variant (re-querying fresh rights) would reuse the same object as Login, or a lighter subset — not separately confirmed to exist. |
| Navigation menus | Same rights rowset as Login (`Viper.DoLogin`'s second grid, or an equivalent standalone rights query) | **Confirmed-in-reference-code** as part of `Viper.DoLogin`'s output; whether a *standalone* rights-only procedure exists (to avoid re-running full credential logic just to refresh a menu) is **not found** in the reference code — treated as a design option in [api-contract.md](api-contract.md), not assumed to exist. |
| Logout | None | No DB object needed for the client-side-only pattern (per [reference-comparison.md §2](reference-comparison.md#2-logout)). |
| Change password (verify step) | A way to re-verify `currentPassword` for the authenticated user | **Not found as a standalone procedure.** The only verification path found anywhere in the reference Acutis vertical is the full `Viper.DoLogin` credential check. See Decision Needed #2 in [implementation-plan.md](implementation-plan.md) (Task 1) — unresolved. |
| Change password (write step) | A procedure that updates the stored password for a given user | **Not found** anywhere in the reference Acutis vertical (`OptionC.Acutis`, `OptionC.AcutisService`, `OptionC.AcutisInfrastructure`). The only password-write capability found in the entire reference solution is `StaffDirectoryController.ResetStaffPassword` — an **admin-triggered, different-module** (`Component`/`Administration`) flow that generates a random password and emails it; it is not a self-service change-password procedure and was not built for the Acutis vertical. **This is a blocker** — see below. |
| Forgot password (request step) | A way to resolve an email address to an Acutis account, and to persist a reset token + expiry against that account | **Not found.** No reset-token column, table, or procedure is referenced anywhere in the reference Acutis vertical. `CFR.Common/AuthModels.cs` in the ongoing repo defines a `ForgotPasswordRequest`/`ForgotPasswordUserDetail` DTO shape, but it is unused elsewhere in the codebase — a naming precedent only, not evidence of a backing procedure. **This is a blocker.** |
| Reset password (completion step) | A way to validate a reset token and write a new password | **Not found**, for the same reasons as above. **This is a blocker.** |

## Blocking issues (explicit)

1. **BLOCKER — No confirmed password-write path exists for Acutis accounts.** Change Password (write step), Reset Password (completion step) cannot be implemented against a real database today without either (a) discovering an existing-but-undocumented procedure during Task 2's schema-verification precondition, or (b) new database work, which is explicitly out of scope for "do not modify the database initially." Until (a) is confirmed, both features are specified at the **interface/contract level only** (see [api-contract.md](api-contract.md) — marked "Unsupported/blocker"), not as buildable endpoints.
2. **BLOCKER — No confirmed reset-token storage exists for Acutis accounts.** Forgot Password (request step) has the same status. An interface-ready design (`IPasswordResetTokenStore`) is specified in [security-model.md](security-model.md) so the request/response contract, email-delivery seam, and enumeration-safety behavior can be built and tested against a temporary/dev-only token store now, and swapped for a real store once schema access confirms (or adds) the backing object — without changing the public API contract.
3. **NOT a blocker, but unverified — Login's own stored procedure.** `Viper.DoLogin` is confirmed to exist in the *reference* database; whether the *target* CFR database has the same or an equivalently-named/shaped procedure is unverified. Task 3 (Login API, in [implementation-plan.md](implementation-plan.md)) lists "confirm `Viper.DoLogin`-equivalent exists in the target DB" as its first precondition, precisely so this isn't discovered mid-implementation.

## Database-supported vs. future-work summary

| Feature | Buildable now against existing (confirmed-in-reference) DB contract | Requires future DB work |
|---|---|---|
| Login | Yes, pending target-DB confirmation of `Viper.DoLogin`-equivalent | — |
| Current user (`/me`), JWT-only variant | Yes — no DB dependency | — |
| Navigation menus | Yes, pending target-DB confirmation (same object as Login) | Optional: a standalone lightweight rights-only procedure, if re-running full login logic just to refresh a menu proves undesirable |
| Logout | Yes — no DB dependency | — |
| Change password — verify step | Partially — only by reusing the full login credential-check as verification (design option, see [security-model.md](security-model.md)); a dedicated verify-only procedure is future work | Optional dedicated verify procedure |
| Change password — write step | **No** | Yes — password-write procedure for Acutis accounts |
| Forgot password | **No** (beyond the generic-response contract itself, which needs no DB) | Yes — reset-token storage + lookup-by-email |
| Reset password | **No** | Yes — token validation + password-write procedure |
