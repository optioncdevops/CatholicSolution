# Requirements — Acutis Authentication for CFR.Acutis

Scope and date: Task 2 (specification), 2026-08-26. Specification only — no application code, no database changes. Builds on [README.md](README.md), [reference-comparison.md](reference-comparison.md), [current-state.md](current-state.md) from Task 1.

## Functional requirements

| # | Requirement | Source |
|---|---|---|
| FR1 | A user can log in with username/password against the existing Acutis credential-check mechanism and receive a JWT plus role/permission/menu data. | Task instruction; reference `AcutisLoginController.LoginAuthentication` |
| FR2 | A logged-in user can log out, clearing client-held credentials. | Task instruction |
| FR3 | A user can request a password-reset email via a generic, enumeration-safe endpoint. | Task instruction |
| FR4 | A user can complete a password reset using a token from that email. | Task instruction |
| FR5 | An authenticated user can change their own password after verifying their current password. | Task instruction |
| FR6 | An authenticated user can retrieve their own identity/profile (`/me`). | Task instruction |
| FR7 | An authenticated user can retrieve their role/permission-scoped navigation menu. | Task instruction; reference `MapModuleRightsToMenu` |
| FR8 | Protected frontend routes redirect unauthenticated or session-expired users to login. | Task instruction; reference `ProtectedLayout` (adapted for expiry) |
| FR9 | The frontend renders navigation and page access based on returned permissions, without those checks substituting for backend enforcement. | Task instruction ("Frontend authorization must not replace backend authorization") |

## Non-functional / process requirements

| # | Requirement |
|---|---|
| NFR1 | Specification only in this task — no application code, no `.sql`, no schema, no migrations. |
| NFR2 | No SSO code path, dependency, or DB object may be used for Acutis authentication. |
| NFR3 | The reference application at `D:\Besp Task\GitHub\OptionC_Conversion\Source\acutis` is read-only inspiration; it is never modified. |
| NFR4 | Reuse existing Acutis database objects and response contracts (`MSResultArgs`/`MSResultArgs<T>`, `api/v1/[controller]/[action]` routing, `BaseController.ApiResultArgs`) wherever the reference confirms they exist; do not invent new stored procedures, tables, or columns as if they already exist. |
| NFR5 | Any capability whose backing database object cannot be confirmed from code (reset-token storage, a dedicated password-write procedure) is an explicit **blocker**, documented as such, not silently designed around. |
| NFR6 | Authentication/authorization must be enforced through normal ASP.NET Core `[Authorize]` + JWT bearer validation. `CFR.Base.DisableAuthenticationPolicy` must **not** be called from `CFR.Acutis`'s host wiring, in any environment. |
| NFR7 | Plaintext passwords and raw reset tokens are never logged or persisted anywhere outside the minimum necessary transport (request body over HTTPS, and — for tokens — whatever store is chosen for the reset-token contract). |
| NFR8 | The new frontend is an independent project under `frontend/SaaS_Apps/acutis`, following this repo's established Vite/React/TypeScript/Tailwind conventions (see [frontend-design.md](frontend-design.md)) — not a folder inside `cfr`/`cfr-admin`. |
| NFR9 | The frontend must support a "mock/prototype" data mode and a "real API" mode behind one seam, swappable without restructuring components (task instruction: "keep mock/prototype mode replaceable with real API mode"). |

## Explicit constraints carried over from Task 1

- `Viper.DoLogin` (or its target-database equivalent) is the only credential-check mechanism referenced by the reference app's Acutis vertical — no separate hashing/verification logic exists in the reference's .NET code, meaning verification appears to happen entirely inside the stored procedure. This must be **confirmed against the target database**, not assumed, before Login or the "verify current password" step of Change Password can be implemented (see [database-contract.md](database-contract.md)).
- No reset-token storage, password-reset stored procedure, or self-service password-write procedure was found referenced anywhere in the reference app's Acutis vertical. `CFR.Common/AuthModels.cs` in the **ongoing** repo already defines `ForgotPasswordRequest/Response`, `VerifyCurrentPasswordRequest/Response`, and `ChangePasswordRequest/Response` DTO shapes — but they are referenced nowhere else in the codebase (confirmed by repo-wide search), so their existence is a naming precedent to reuse, **not** evidence that a backing stored procedure exists.
- `CFR.Base.CommonServiceExtension.DisableAuthenticationPolicy` has the same always-bypass bug found in the reference `OptionC.Base` (identical `if`/`else` branches). Per NFR6, this method is excluded from the Acutis auth design entirely.

## Out of scope for this specification

- Any database schema change (table/column/procedure creation) — captured as blockers/future work only.
- SSO integration of any kind.
- Implementation of any code, test, or configuration file.
- Non-Acutis verticals (SMS, Diocese, Reports, etc.) in either repository.
