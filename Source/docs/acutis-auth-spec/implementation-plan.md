# Implementation Plan — Acutis Authentication for CFR.Acutis (Task 2 revision)

Scope and date: Task 2, 2026-08-26. This supersedes the Task 1 draft of this file. **Nothing below has been implemented — this is an ordered, reviewable task breakdown for future work**, per this task's explicit "do not implement anything" instruction.

Each task is written to be independently testable — completable and verifiable on its own, without requiring later tasks to already exist, so the sequence can pause after any task without leaving the codebase broken.

---

### Task 1 — CFR.Acutis project wiring

- **Preconditions:** None (first task).
- **Files likely to change:** `backend/Microservices/CFR.Acutis/CFR.Acutis.csproj` (add `ProjectReference`s to `CFR.Base`, `CFR.Common`, `CFR.DBEngine`, `CFR.CommonService`); `backend/Microservices/CFR.Acutis/Program.cs` (replace generic scaffold with `AddCommonServicesSetup`, `AddAuthenticationSetup`, Swagger/Scalar, Serilog wiring — mirroring reference `OptionC.Acutis/Program.cs` shape per [current-state.md](current-state.md), explicitly **excluding** `DisableAuthenticationPolicy`); `backend/Microservices/CFR.Acutis/appsettings.json` / `appsettings.Development.json` (add `JWTSetting` section, connection string key — see Task 2's precondition for which key).
- **API/database dependencies:** None yet — this task only wires hosting infrastructure, no endpoints, no DB calls.
- **Acceptance criteria:** `CFR.Acutis` builds and starts standalone (`dotnet run`), serves Swagger/Scalar at its configured port, and — critically — a request to any placeholder authenticated endpoint without a bearer token returns `401`, not `200` (proves `DisableAuthenticationPolicy` was not wired in).
- **Validation command:** `dotnet build backend/CatholicSolution.slnx` (or targeted `dotnet build backend/Microservices/CFR.Acutis/CFR.Acutis.csproj`); `dotnet run --project backend/Microservices/CFR.Acutis/CFR.Acutis.csproj` followed by a manual/curl request to confirm the 401 behavior above.
- **Rollback approach:** Revert `CFR.Acutis.csproj`/`Program.cs`/`appsettings.*.json` to their current scaffold state (git revert of this task's commit) — no other project is touched, so rollback is fully isolated.
- **Security considerations:** This is the task where the "never call `DisableAuthenticationPolicy`" rule (NFR6) is enforced or violated — the acceptance criterion's 401 check exists specifically to catch a violation immediately rather than downstream.

### Task 2 — JWT/authentication foundation

- **Preconditions:** Task 1 complete. **Also requires confirming, against the actual target database (not code alone), which connection-string key `CFR.Acutis` should use** — `CFR.Common/Constant.cs`'s `DBConectionName` offers `ConnString`/`OptionCConnString`/`OptionCComConnString`; which one (if any) points at the database containing `Viper.DoLogin`-equivalent is unconfirmed (see [database-contract.md](database-contract.md)) and must be resolved before this task can wire a working `IDapperHandler` connection.
- **Files likely to change:** New Acutis-local `IJwtTokenGenerator`/`JwtTokenGenerator` (thin claims, matching reference — see [security-model.md](security-model.md)), placed either in `CFR.Acutis` directly or a clearly-separate second implementation to avoid colliding with `CFR.Base`'s existing `UserContextData`-shaped one; DI registration in `CFR.Acutis`'s `ServiceExtension.cs` (new file, mirroring reference's per-vertical pattern).
- **API/database dependencies:** None yet (no endpoint calls this generator until Task 3); depends on the connection-string decision above only insofar as it blocks meaningful end-to-end testing.
- **Acceptance criteria:** A unit-level check that `GenerateToken(...)` produces a valid, correctly-signed JWT with exactly the three specified claims (each individually encrypted via `CommonMethods.EncryptValue`), decodable and verifiable against `JWTSetting:SecurityKey`.
- **Validation command:** A small isolated test/console harness invoking the generator directly (no HTTP round trip needed for this task alone) — exact form left to implementation, not prescribed here since no test project exists yet in this repo for `CFR.Acutis` (see [test-plan.md](test-plan.md)).
- **Rollback approach:** Delete the new generator file and its DI registration; no other component depends on it yet.
- **Security considerations:** Confirm the signing key is read from configuration only (never hardcoded), and that claim values are the encrypted form, not raw PII, matching [security-model.md](security-model.md).

### Task 3 — Login API

- **Preconditions:** Tasks 1–2 complete. **Hard precondition: confirm `Viper.DoLogin`-equivalent stored procedure exists in the target database with the same two-result-set shape** (user row + rights rowset) described in [database-contract.md](database-contract.md). If it does not exist or differs, this task cannot proceed as specified and must be re-scoped (this is the single largest risk in the whole plan — surfacing it here, first, is deliberate).
- **Files likely to change:** New `CFR.AcutisInfrastructure` (repository), `CFR.AcutisService` (service), and `Controllers/Auth/AuthController.cs` (with the `Login` action) under `CFR.Acutis`; new `AcutisLoginRequest`/`AcutisLoginResult` DTOs (likely in `CFR.AcutisInfrastructure` or `CFR.Common`, matching reference placement convention); `ServiceExtension.cs` DI registrations for the new repository/service.
- **API/database dependencies:** `POST /acutis/api/v1/auth/login` per [api-contract.md](api-contract.md); `Viper.DoLogin`-equivalent (confirmed target-DB dependency, per above).
- **Acceptance criteria:** Valid credentials return `200` with a populated `MSResultArgs<AcutisLoginResult>` including a valid JWT, non-empty `moduleRights`, and a shaped `menuItems` tree; invalid credentials return the documented failure envelope (not a raw exception); a malformed/empty body returns `400`.
- **Validation command:** Integration-style HTTP call (curl/Postman/http-file — `CFR.Acutis.http` already exists as a scaffold file for this) against a running `CFR.Acutis` instance pointed at a real target-database connection string, plus decoding the returned JWT to confirm its claim shape.
- **Rollback approach:** Remove the new controller/service/repository files and their DI registrations; Tasks 1–2 remain valid and unaffected.
- **Security considerations:** Confirm the failure path never echoes back `ex.Message`/inner-exception text (matches [security-model.md](security-model.md)'s generic-error rule, and avoids the internal-detail-leak pattern flagged against a couple of reference controllers in Task 1's endpoint-catalog findings); confirm `[AllowAnonymous]` is the *only* anonymous action added, not accidentally applied at the controller level.

### Task 4 — Current-user API

- **Preconditions:** Tasks 1–2 complete (does **not** depend on Task 3's database confirmation — this endpoint is JWT-claims-only, per [api-contract.md](api-contract.md)).
- **Files likely to change:** `AuthController`'s `Me` action; no new service/repository needed beyond the existing `ICurrentUserService` (already present per [current-state.md](current-state.md)).
- **API/database dependencies:** `GET /acutis/api/v1/auth/me`; no database dependency.
- **Acceptance criteria:** A request with a valid token (however obtained — can be hand-issued via Task 2's generator for testing, independent of Task 3 being done) returns the token's claims as `userId`/`email`/`fullName`; a request with no/invalid/expired token returns `401`.
- **Validation command:** HTTP call with a manually-generated test token (from Task 2's harness) — this task is explicitly independent of Login being wired, by design, so it can be validated in isolation.
- **Rollback approach:** Remove the `Me` action; no dependents.
- **Security considerations:** Confirm claims are read from the already-validated `HttpContext.User` (post-middleware), never re-parsed from a raw `Authorization` header string in the action body.

### Task 5 — Logout behavior

- **Preconditions:** Tasks 1–2 complete.
- **Files likely to change:** `AuthController`'s `Logout` action (trivial, per [api-contract.md](api-contract.md) — may be a near-no-op today).
- **API/database dependencies:** `POST /acutis/api/v1/auth/logout`; no database dependency.
- **Acceptance criteria:** A request with a valid token returns `200`; a request with no token returns `401` (matching the `[Authorize]` placement decided in [api-contract.md](api-contract.md)).
- **Validation command:** HTTP call with/without a token.
- **Rollback approach:** Remove the `Logout` action.
- **Security considerations:** Confirm no sensitive data is echoed in the response; confirm this endpoint doesn't become a dumping ground for future session-invalidation logic without a corresponding security review when that's added.

### Task 6 — Change-password API

- **Preconditions:** Tasks 1–3 complete (needs Login's credential-check path for the verify step, per [security-model.md](security-model.md) option 1). **The write step is a confirmed database blocker (see [database-contract.md](database-contract.md)) — this task can only deliver the verify step and the full request/response contract/validation; the actual password write cannot be marked done until the blocker is resolved.**
- **Files likely to change:** `AuthController`'s `ChangePassword` action; service-layer verify logic reusing Task 3's login-check path; a clearly-marked-`NotImplemented`/blocked write path (explicit, documented, not silently stubbed to "succeed").
- **API/database dependencies:** `POST /acutis/api/v1/auth/change-password`; verify step depends on Task 3's confirmed DB object; write step depends on an unresolved blocker.
- **Acceptance criteria:** Wrong `currentPassword` is correctly rejected (verify step provably works); correct `currentPassword` with the write step blocked returns an explicit, honest "not yet supported" response rather than a false success — this task's acceptance bar is **honesty about the blocker**, not a working end-to-end change.
- **Validation command:** HTTP call with a known-valid and a known-invalid `currentPassword` against a real login-capable environment (post-Task-3).
- **Rollback approach:** Remove the `ChangePassword` action and its verify-reuse call.
- **Security considerations:** Never log `currentPassword`/`newPassword`; confirm the blocked write path fails closed (returns an error) rather than silently doing nothing while claiming success.

### Task 7 — Forgot/reset-password contract or documented blocker

- **Preconditions:** Tasks 1–2 complete. **Both endpoints in this task are confirmed database blockers** (see [database-contract.md](database-contract.md)) — this task delivers the request/response contract, validation, enumeration-safe behavior, and the dev-only `IPasswordResetTokenStore`/`IPasswordResetEmailSender` interfaces (see [security-model.md](security-model.md)) wired to a non-durable dev backing, explicitly not claiming production readiness.
- **Files likely to change:** `AuthController`'s `ForgotPassword`/`ResetPassword` actions; new `IPasswordResetTokenStore` (dev/in-memory implementation) and `IPasswordResetEmailSender` (wired to existing `SMTPService`) interfaces and implementations, clearly labeled dev-only where applicable.
- **API/database dependencies:** `POST /acutis/api/v1/auth/forgot-password`, `POST /acutis/api/v1/auth/reset-password`; **no confirmed production database object for either** — this task's deliverable is explicitly bounded by that.
- **Acceptance criteria:** Forgot Password always returns the same generic response regardless of email validity (enumeration-safety provably holds); Reset Password correctly validates/consumes a dev-store token and returns a distinct generic failure for invalid/expired/reused tokens; **the documentation for this task must state plainly that the write is not durable/production-ready**, matching [database-contract.md](database-contract.md)'s blocker status.
- **Validation command:** HTTP calls exercising both valid and invalid/expired token cases against the dev-store backing.
- **Rollback approach:** Remove both actions and the dev-only store/sender implementations.
- **Security considerations:** Confirm the dev token store is never reachable from a Production configuration switch; confirm tokens are never logged; confirm the generic-response rule (no enumeration leak) is tested, not just assumed.

### Task 8 — Dynamic-menu API

- **Preconditions:** Task 3's database confirmation (this endpoint reuses the same rights rowset).
- **Files likely to change:** `Controllers/Navigation/NavigationController.cs` (new); service/repository reusing Task 3's rights query (exact reuse mechanism — full login re-check vs. a lighter standalone query — decided at implementation time based on what the target DB actually offers, per [database-contract.md](database-contract.md)).
- **API/database dependencies:** `GET /acutis/api/v1/navigation/menus`; same DB object as Login.
- **Acceptance criteria:** A valid token returns the requesting user's own `menuItems` tree (never another user's, never accepting a client-supplied user id); no token returns `401`.
- **Validation command:** HTTP call with a valid token from a real login (post-Task-3), comparing the returned tree shape against `MapModuleRightsToMenu`'s documented output in [api-contract.md](api-contract.md).
- **Rollback approach:** Remove the new controller/service/repository.
- **Security considerations:** Confirm the rights query is always scoped to the authenticated user's id from the token, never a request parameter.

### Tasks 9–12 — completed together (session Task 9, 2026-08-26)

The frontend shell, mock prototype, real-API integration, and protected-route/session handling described in the original Tasks 9–12 below were all implemented in a single pass, since no frontend project existed yet when that session task began and building the API-mode switch required both mock and real adapters to exist together from the start. Deltas from the original per-task plan:

- **No Axios** — resolving Open Question #3 below: `fetch` was used instead (native, no new dependency), via `src/lib/httpClient.ts`. Functionally equivalent for this scope (one shared 401 hook, bearer-token attachment).
- Task 10's "all six screens" became seven (a `DashboardPage` protected landing page was added, not in the original screen list, so `/Me`/menus/logout had somewhere to actually run).
- Verification used live `curl` calls against a running `CFR.Acutis` (backend endpoint shapes confirmed to match frontend types exactly) plus `typecheck`/`lint`/`build` in both mock and `api` mode, **not** manual browser click-through — no browser automation tool is available in this environment. See [frontend-design.md](frontend-design.md) for full detail.
- `GET /navigation/menus` (part of Task 8's original scope) is still not implemented server-side — the frontend's `getMenus()` on both adapters returns the cached login-time menu tree instead of calling that route, documented as an explicit, temporary choice.

The individual task breakdowns below are kept for historical/traceability reasons (what was originally planned) but should be read as **done**, per the above, not as remaining work.

### Task 9 — New frontend project shell

- **Preconditions:** None (can proceed in parallel with backend tasks, since it only scaffolds structure, not integration).
- **Files likely to change:** New `frontend/SaaS_Apps/acutis/` project (see [frontend-design.md](frontend-design.md) for full structure), matching sibling `SaaS_Apps/*` conventions.
- **API/database dependencies:** None.
- **Acceptance criteria:** `npm ci && npm run typecheck && npm run lint && npm run build:production` all succeed on an empty/shell app, matching the validation loop `frontend/CLAUDE.md` already documents for every other project in this repo.
- **Validation command:** `cd frontend/SaaS_Apps/acutis && npm ci && npm run typecheck && npm run lint && npm run build:production`.
- **Rollback approach:** Delete the new project directory; no other frontend project references it (per the repo's no-shared-workspace rule).
- **Security considerations:** None at this stage (no auth logic yet).

### Task 10 — Frontend authentication prototype

- **Preconditions:** Task 9 complete.
- **Files likely to change:** `src/modules/auth/*` (all six screens from [frontend-design.md](frontend-design.md)), `AuthContext`/`AuthProvider`, mock implementation of `AcutisAuthApi`.
- **API/database dependencies:** None — this task deliberately uses only the mock API implementation, so it doesn't wait on any backend task.
- **Acceptance criteria:** All six screens render and are navigable; login/logout/forgot/reset/change flows work end-to-end against mock data; protected routes correctly gate on mock auth state.
- **Validation command:** `npm run dev` + manual click-through of each screen and flow; `npm run typecheck && npm run lint`.
- **Rollback approach:** Revert to Task 9's shell state.
- **Security considerations:** Confirm the mock mode is clearly labeled/visually distinguishable (or config-gated) so it can never be mistaken for the real API in a deployed build.

### Task 11 — Frontend API integration

- **Preconditions:** Task 10 complete; relevant backend tasks (3–8, as available) complete for whichever endpoints are being switched from mock to real.
- **Files likely to change:** Real implementation of `AcutisAuthApi` (Axios-based, per [frontend-design.md](frontend-design.md)); the mode-selection mechanism (`VITE_ACUTIS_AUTH_MODE`).
- **API/database dependencies:** All seven endpoints in [api-contract.md](api-contract.md), to the extent each is unblocked by that point.
- **Acceptance criteria:** With `VITE_ACUTIS_AUTH_MODE=api`, Login/Logout/Current-User/Menus work end-to-end against a running `CFR.Acutis`; Forgot/Reset/Change-Password behave per whatever their backend status is at this point (fully working, or honestly reporting the blocker per Tasks 6–7) — this task must not silently mask an unresolved backend blocker with a frontend success message.
- **Validation command:** `npm run dev` against a locally running `CFR.Acutis` (+ `CFR.Gateway` if testing through the `/acutis` prefix), manual click-through; `npm run typecheck && npm run lint && npm run build:production`.
- **Rollback approach:** Revert the mode flag to `mock`; the mock implementation from Task 10 remains fully functional as a fallback.
- **Security considerations:** Confirm the real Axios instance's 401 handling (Task 12) is in place before this task is considered complete, not deferred silently.

### Task 12 — Protected routes and session handling

- **Preconditions:** Task 11 complete (needs the real API's actual 401 behavior to test against).
- **Files likely to change:** `ProtectedLayout`-equivalent (expiry-aware, per [frontend-design.md](frontend-design.md)); Axios response interceptor (401 → clear auth + redirect to `/auth/session-expired`).
- **API/database dependencies:** Relies on Task 2/3's JWT expiry being real (not bypassed by `DisableAuthenticationPolicy`, per NFR6) — this task is where a violation of that rule would first become visible as a *frontend* symptom (expired tokens silently continuing to work).
- **Acceptance criteria:** An expired or invalidated token results in an automatic redirect to `/auth/session-expired`, not a silent toast with stale UI still rendered (fixes [reference-comparison.md §9](reference-comparison.md#9-session-expiry-and-unauthorized-handling)); a genuinely unauthenticated visit to a protected route redirects to `/auth/login`, not `/auth/session-expired`.
- **Validation command:** Manual test with a deliberately expired/tampered token (e.g., a short-TTL token issued via Task 2's harness for testing) plus `npm run typecheck && npm run lint`.
- **Rollback approach:** Revert to Task 11's simpler (toast-only) interceptor if the expiry-aware version introduces regressions; this is a net-behavior change, not a structural one, so rollback is low-risk.
- **Security considerations:** Confirm client-side route gating still doesn't substitute for backend enforcement (NFR9) — this task changes UX, not the security boundary, which remains entirely server-side.

### Task 13 — End-to-end validation

- **Preconditions:** All prior tasks complete (or their blockers explicitly documented as still open).
- **Files likely to change:** None expected — this is a verification task, not a build task; may produce fixes to whatever it finds, tracked as follow-up items rather than pre-specified here.
- **API/database dependencies:** All seven endpoints, through the real `CFR.Gateway` `/acutis` prefix, against the target database.
- **Acceptance criteria:** Every scenario in [test-plan.md](test-plan.md) passes, or is explicitly logged as blocked with a reason tracing back to one of the database blockers in [database-contract.md](database-contract.md).
- **Validation command:** Full manual (or, if a test project has been added by this point, automated) run-through of [test-plan.md](test-plan.md)'s scenarios against a running `CFR.Gateway` + `CFR.Acutis` + the new frontend.
- **Rollback approach:** N/A (verification task) — any fix it produces follows that fix's own rollback approach.
- **Security considerations:** Explicit re-check that `DisableAuthenticationPolicy` was never reintroduced anywhere in the chain (NFR6), that no password/token value appears in any log produced during this validation pass, and that the CORS/JWT configuration inherited from `CFR.Base` (flagged in [current-state.md](current-state.md) — wildcard-with-credentials CORS by default) has been reviewed as appropriate for this feature's actual deployment target, not left as an unexamined default.

---

## Final decision table

| Feature | Decision | Basis |
|---|---|---|
| Login | Adapt (reuse reference contract; new CFR-side wiring) | [reference-comparison.md §1](reference-comparison.md#1-login) |
| Logout | Reuse (client-side pattern) + new trivial backend endpoint | [reference-comparison.md §2](reference-comparison.md#2-logout) |
| Forgot Password | Create (contract/interfaces only — write path blocked) | [database-contract.md](database-contract.md) |
| Reset Password | Create (contract/interfaces only — write path blocked) | [database-contract.md](database-contract.md) |
| Change Password | Adapt (verify step reuses Login; write path blocked) | [security-model.md](security-model.md) |
| Current User | Reuse (frontend cache) + new JWT-only backend endpoint | [reference-comparison.md §6](reference-comparison.md#6-current-user) |
| Dynamic menus | Reuse (backend shaping + frontend context/guard pattern) | [reference-comparison.md §7](reference-comparison.md#7-rolepermission-based-dynamic-menus) |
| Protected routes | Adapt (reuse shape, add expiry-awareness) | [reference-comparison.md §8](reference-comparison.md#8-protected-routes) |
| Session expiry/unauthorized | Adapt (backend: real enforcement, not `DisableAuthenticationPolicy`) + Create (frontend 401 handling) | [reference-comparison.md §9](reference-comparison.md#9-session-expiry-and-unauthorized-handling) |
| Frontend project | Create (`frontend/SaaS_Apps/acutis`) | [frontend-design.md](frontend-design.md) |

## Open questions

1. Which `CFR.Common.Constant.DBConectionName` key (or a new one) should `CFR.Acutis` use, and does that database actually contain a `Viper.DoLogin`-equivalent procedure? (Task 2/3 precondition.)
2. Is reusing the full login credential-check as Change Password's "verify current password" step acceptable, or is a dedicated verify-only procedure required before Task 6 ships? ([security-model.md](security-model.md))
3. ~~Should `frontend/SaaS_Apps/acutis` add Axios as a new dependency...~~ **Resolved (Task 9):** no — native `fetch` was used instead, avoiding a new dependency entirely.
4. What password policy (length/complexity) should Change/Reset Password enforce? Not specified by the reference app or found elsewhere in the ongoing repo — currently left to "whatever the eventual write procedure enforces," which is itself unconfirmed.
5. Is a 1-day token lifetime (matching the reference) acceptable for CFR.Acutis, or should this task revisit it now rather than inheriting it unexamined?

## Blocking issues

1. **No confirmed password-write path for Acutis accounts** (Change Password write step, Reset Password completion step) — see [database-contract.md](database-contract.md).
2. **No confirmed reset-token storage for Acutis accounts** (Forgot Password) — see [database-contract.md](database-contract.md).
3. **`NewViper.DoLogin`'s existence in the target database is unverified — three independent attempts, consistently blocked.** Session Task 8 (2026-08-26): `CFR.Acutis` had no `ConnectionStrings` configuration and the only locally-reachable SQL Server (`SQLEXPRESS`) had no relevant database. Session Task 10 (2026-08-26): identified the reference application's actual development database (`Database=optionccom`, real SQL auth) and attempted to reach it directly — hosted on a private LAN IP with no network path from this execution environment; a TCP-level reachability check failed (with an incident note — a connection-string fragment was briefly, mistakenly printed to tool output, flagged transparently there). Session Task 13 (2026-08-26): re-checked the same target with a corrected, secret-safe script — the host is now network-routable but the SQL Server port actively refuses the connection (`ECONNREFUSED`). See [database-contract.md](database-contract.md#task-13-verification-attempt--result-still-blocked-same-target-refined-signal) for full detail. This blocks the real-repository work and everything downstream of it until either this work runs from an environment with network access to that database, or an equivalently-reachable database with the same contract is provided.

## Database-supported features (buildable against the confirmed-in-reference-code contract, pending target-DB verification)

Login, Current User (JWT-only), Logout, Dynamic Menus, Change Password (verify step only) — **note:** "buildable" here still means "against a confirmed database contract, once one exists." The current implementation of these features (`AuthController`, `AcutisAuthenticationService`, JWT issuance/validation) is complete and live-verified, but is backed exclusively by `AcutisAuthenticationRepositoryDevFake` — see the session's task reports for exactly what has and hasn't been built.

## Features requiring future database work

Forgot Password (token issuance/lookup), Reset Password (token validation + write), Change Password (write step).

## Task 12 — configuration/DI scaffolding for repository switching (done, 2026-08-26)

Added the config-driven seam a real repository will plug into, without implementing or connecting to one: `AcutisAuth:RepositoryMode` (`DevelopmentFake` default / `Database`), a connection-string key name (`AcutisAuth:ConnectionStringKey`, default `AcutisDb`), fail-fast checks (unknown mode, `Database` mode with no configured connection string, `DevelopmentFake` mode outside Development without an explicit escape hatch), and a `Database`-mode placeholder (`AcutisAuthenticationRepositoryNotImplemented`) that throws on every call rather than ever silently resolving to the fake. `.NET User Secrets` wired for local development (`CFR.Acutis.csproj`'s `<UserSecretsId>`, `Program.cs`'s `AddUserSecrets<Program>()` in Development only); any other environment supplies the connection string via an environment variable. See [database-contract.md](database-contract.md#configuration-scaffolding-task-12) and [operations-runbook.md](operations-runbook.md). 11 new tests, all passing (67 total in the suite) — see the session's Task 12 report.

**This does not unblock real login.** It makes the *next* step (once a database is reachable) a configuration change plus a real repository class, rather than also requiring new DI plumbing at that time.

## Task 13 — real repository implementation attempt (blocked at Phase 1, 2026-08-26)

Attempted, per instructions, to verify the live `NewViper.DoLogin` contract before writing any repository code. Re-confirmed the Task 10 blocker with a corrected, secret-safe reachability check (see [database-contract.md](database-contract.md#task-13-verification-attempt--result-still-blocked-same-target-refined-signal)) — the reference database's host is now network-routable but its SQL Server port refuses the connection. Per the explicit stop condition, **Phase 2 (real repository implementation) was not started — zero repository code was written this task.** `AcutisAuthenticationRepositoryDevFake` and `AcutisAuthenticationRepositoryNotImplemented` are both unchanged.

## Task 14 — complete Acutis auth features without database changes (done, 2026-08-26)

Closed the one genuine backend gap left from prior tasks — `GET /navigation/menus` had a service
method (`IAcutisAuthenticationService.GetMenusAsync`, since Task 2) but no HTTP endpoint. Added
`NavigationController` (`[Authorize]`, user id from the caller's own validated JWT via a newly
extracted `AcutisCurrentUserClaims` helper, shared with `AuthController`'s `Me`/`Logout`/
`ChangePassword`), plus 4 new tests (71 total, all passing). Logout, change password, and
forgot/reset password were already fully implemented (Tasks 4–9) — verified no further backend
work was needed there. Frontend: wired the real adapter's `getMenus` to the new endpoint,
`DashboardPage` now refreshes menus on mount (falling back to the cached login-time tree on
failure, since menus are non-critical UI), and added a `403` handler (`registerForbiddenHandler`/
`onForbidden` in `httpClient.ts`, wired by `AuthProvider` to `/unauthorized` without clearing
session state — unlike the existing `401` handler). No database files changed; the manually
configured `ConnectionStrings:AcutisDb` connection was not touched, inspected, or printed.
`dotnet build`/`dotnet test` (71/71) and `npm run typecheck`/`lint`/`build` all pass. See
[api-contract.md](api-contract.md), [security-model.md](security-model.md), and
[frontend-design.md](frontend-design.md) for the updated contract/behavior detail.

## Task 15 — real database login attempt (blocked at Phase 1, 2026-08-26)

Instructed to verify `NewViper.DoLogin` against the live database before writing any repository code. `ConnectionStrings:AcutisDb` did not resolve in this session's environment at all (no User Secret, no env var) — a configuration-visibility blocker, distinct from Tasks 8/10/13's network-reachability blockers. Per the explicit stop condition, no SQL connection was attempted and no repository code was written. See [database-contract.md](database-contract.md#task-15-verification-attempt--result-still-blocked-at-item-1-connection-string-does-not-resolve-here).

## Session task — 5-phase real-login attempt (blocked at Phase 1, repeated; database-independent phases completed, 2026-08-26)

A 5-phase task (database verification → real repository → password capability → frontend final integration → validation) run immediately after Task 15. Phase 1 repeated the identical connection-string-visibility check and got the identical result — still not resolvable in this session's environment (see [database-contract.md](database-contract.md#session-task-2026-08-26-post-task-15--result-still-blocked-at-item-1-connection-string-does-not-resolve-here)). Per the task's own fallback instruction, Phases 2 and 3 (real repository, password capability) were skipped — both are explicitly gated on Phase 1 — and work continued only on Phases 4–5's database-independent items:

- `dotnet build`/`dotnet test`: 71/71 passing (after stopping two stale Visual-Studio-debug-launched processes, `CFR.Acutis`/`CFR.Gateway`, that were holding a file lock on `CFR.Base.dll` — done with explicit user confirmation before stopping them).
- `npm run typecheck`/`lint`/`build` in `frontend/SaaS_Apps/acutis`: all clean, no changes needed.
- Full live smoke pass against `DevelopmentFake` (the only mode this environment can run): valid login issues a JWT, invalid login returns the domain failure code, `/Me` and `/Navigation/Menus` both `200` for a valid token and `401` for none, Logout `200`, ForgotPassword byte-identical for known/unknown accounts, ResetPassword rejects a bogus token, ChangePassword never reports success. No secrets appeared in server logs or command output.

Five independent attempts now (Tasks 8, 10, 13, 15, and this session) have confirmed a real, database-backed repository remains implementable in design but not executable from this environment — see [database-contract.md](database-contract.md) for the complete attempt history.

## Session task — connection-string key correction (done, 2026-08-26)

Discovered and corrected a real, previously-undocumented configuration bug: `AcutisAuth:ConnectionStringKey` defaulted to `AcutisDb` (set up in Task 12), but the shared `CFR.DBEngine.DapperHandler.Connection` — the class any real `AcutisAuthenticationRepository` would use via `IDapperHandler` — is hardcoded to `configuration.GetConnectionString("ConnString")`, matching the reference app exactly. This meant `AcutisAuthRepositorySelection`'s Database-mode startup check could pass (connection string configured under `AcutisDb`) while the actual connection `IDapperHandler` opens would still fail (it never reads `AcutisDb` at all) — a discrepancy that would only have surfaced mid-implementation of the real repository, at the worst possible time.

**Fix:** `AcutisAuthRepositoryOptions.DefaultConnectionStringKey` changed from `AcutisDb` to `ConnString`; the tracked `AcutisAuth:ConnectionStringKey` in `appsettings.Development.json` and the tracked (empty) `ConnectionStrings:ConnString` placeholder updated to match; `Program.cs`'s User-Secrets-command comment updated; 8 tests in `AcutisAuthRepositorySelectionTests.cs` updated to the new key name, plus one new test asserting the default equals `ConnString` specifically because it must match `CFR.DBEngine.DapperHandler`'s hardcoded key. `dotnet build`/`dotnet test`: 71 passing (70 + 1 new). **`CFR.DBEngine.DapperHandler` itself was not changed** — this was a key-name-only correction on the `CFR.Acutis` side; no repository was implemented, `Database` mode still registers `AcutisAuthenticationRepositoryNotImplemented`, unchanged.

**Incident during this task, self-caught and corrected:** partway through, the tracked `appsettings.Development.json` was found to contain a real connection string (from the reference app, including a real password) in place of the safe empty placeholder — introduced outside of this session's own edits. Confirmed it was never committed (absent from `HEAD`, working-tree only) and immediately restored the safe empty-value structure before continuing. See the session transcript for detail; not reproduced here.

## Session task — real database verified and real Login repository implemented (done, 2026-08-26)

A connection string was supplied and stored via User Secrets (never in a tracked file, never committed). Read-only verification (an isolated tool, deleted after use) confirmed, live, for the first time in this project: SQL connection succeeds, `NewViper.DoLogin` exists, its parameters (`@EMail`, `@Password`, `@IPAddress`, `@LoginTransferID`), both result-set shapes, empty-result/password-verification behavior, and timeout behavior — see [database-contract.md](database-contract.md#verification-succeeded-this-session--newviperdologin-confirmed-live-full-contract) for the complete findings, including a genuinely new discovery (the second/rights result set is not conditioned on login success — success must be read from the first result set only).

Following that, `AcutisAuthenticationRepository` was implemented and registered for `AcutisAuth:RepositoryMode=Database`: `AuthenticateAsync` is real and live-verified end-to-end through the full HTTP pipeline (Controller → Service → Repository → SQL Server); `GetModuleRightsAsync`/`FindAccountByEmailAsync` throw an honest `NotImplementedException` (no confirmed standalone object exists for either); `SetPasswordAsync` remains an explicit "not supported" outcome, unchanged. `DevelopmentFake` remains the default, unaffected — re-verified live. `dotnet build`/`dotnet test`: 103/103 passing (11 new tests). See [database-contract.md](database-contract.md#phase-2--real-repository-implemented-this-session) for full detail.

## Session task — DevelopmentFake removed, real-time development only (done, 2026-08-26)

Per explicit instruction ("no fake account... real time development"), `AcutisAuthenticationRepositoryDevFake`, `AcutisAuthenticationRepositoryNotImplemented`, and the `AcutisAuthRepositoryMode`/`RepositoryMode` config switch were all deleted. `AcutisAuthRepositoryOptions` lost `RepositoryMode`/`AllowDevelopmentFakeOutsideDevelopment` — only `ConnectionStringKey` remains. `AcutisAuthRepositorySelection.AddAcutisAuthRepository` now unconditionally fails fast if `ConnectionStrings:ConnString` isn't configured, then registers `IDapperHandler`/`AcutisAuthenticationRepository` — no mode to select, no fallback. `Program.cs`'s call site simplified to match. Tracked `appsettings.Development.json` no longer references the removed keys.

Tests rewritten: `AcutisAuthRepositorySelectionTests.cs` no longer has any DevelopmentFake-mode tests — only "connection string missing → fails fast" and "connection string present → registers the real repository, unconfirmed operations still throw, SetPasswordAsync still honest." `dotnet build`/`dotnet test`: 97/97 passing.

**Live-verified:** in a non-Development environment with no connection string resolvable, the app now fails to start immediately with a clear `InvalidOperationException` — no silent fallback exists anywhere. With the real connection string (User Secrets, unchanged from the prior session task), a normal `dotnet run` still starts and Login still works end-to-end against the real database.

Frontend also extended this session (unrelated to the DevelopmentFake removal): a reusable `Modal` component, a `RequiredMark` star indicator, and a centralized `REQUIRED_FIELD_MESSAGE` ("This field is required") used by every auth form's required-field validation; `ChangePasswordPage` rebuilt as a modal dialog with show/hide password toggles, reachable from a new Dashboard link. `npm run typecheck`/`lint`/`build`: all clean.

## Exact next implementation task

**Resolve the `GetModuleRightsAsync`/`FindAccountByEmailAsync` gap.** Login now works against the real database, but a real (non-DEV-FAKE) user cannot yet get dynamic menus (`GET /navigation/menus` throws) or use Forgot Password meaningfully (the account lookup throws, silently absorbed into the existing generic response). No standalone database object for either was found during this session's verification — the next task should either search for one directly (a DBA/schema review, or a broader stored-procedure sweep of the confirmed-reachable database), or make a deliberate design decision (e.g., a short-lived in-memory cache of the rights rowset `AuthenticateAsync` already fetches at login, keyed by `UserId`, to serve `GetModuleRightsAsync` shortly after login without inventing a new query) — flagged here as an open question, not decided in this session. Password writes (Change/Reset Password) remain a separate, still-unresolved blocker, explicitly out of scope for the task that implemented `AuthenticateAsync`.
