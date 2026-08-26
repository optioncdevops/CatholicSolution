# API Contract — Acutis Authentication

Scope and date: Task 2, 2026-08-26 (specification). Endpoints implemented Tasks 4–6; JWT
issuance/validation implemented and live-verified Tasks 5–6 — this document now reflects what was
actually built (`AuthController`, plain `Login`/`Me`/`Logout`/`ChangePassword`/`ForgotPassword`/
`ResetPassword` action names via default `[controller]/[action]` routing, not the kebab-case
`[ActionName]` scheme originally sketched below) rather than only the original design intent.
Route notes further down that still describe the kebab-case scheme are historical/superseded by
the implemented routes in the table below — see [implementation-plan.md](implementation-plan.md)
and prior task reports for the exact reconciliation.

All six implemented endpoints use `CFR.Base.BaseController`'s existing route template `api/v1/[controller]/[action]` (`CFR.Common.Constant.ApiRouteConstants.APIController`, confirmed in [current-state.md](current-state.md)) and response wrapper (`MSResultArgs`/`MSResultArgs<T>` via `ApiResultArgs(...)`, confirmed in [current-state.md](current-state.md)). Gateway prefix `/acutis` is stripped by YARP before reaching the controller (`CFR.Gateway`'s `acutis-route`, `PathRemovePrefix: "/acutis"`, confirmed present in `backend/Gateway/CFR.Gateway/appsettings.Development.json` and `appsettings.Production.json`) — so `POST /acutis/api/v1/auth/login` at the gateway is `POST api/v1/Auth/Login` at `CFR.Acutis` (routing is case-insensitive).

**Implemented routes (`AuthController`, `backend/Microservices/CFR.Acutis/Controllers/Auth/AuthController.cs`):**

| Method | Route | Auth |
|---|---|---|
| POST | `api/v1/Auth/Login` | `[AllowAnonymous]` |
| GET | `api/v1/Auth/Me` | `[Authorize]` |
| POST | `api/v1/Auth/Logout` | `[Authorize]` |
| POST | `api/v1/Auth/ChangePassword` | `[Authorize]` |
| POST | `api/v1/Auth/ForgotPassword` | `[AllowAnonymous]` |
| POST | `api/v1/Auth/ResetPassword` | `[AllowAnonymous]` (reset token in body is the credential, not a bearer JWT — see [security-model.md](security-model.md)) |
| GET | `api/v1/Navigation/Menus` | `[Authorize]` (Task 14 — `NavigationController`) |

`GET /navigation/menus` (originally specified §7 below) was implemented in Task 14 — `NavigationController` (`backend/Microservices/CFR.Acutis/Controllers/Navigation/NavigationController.cs`) exposes `IAcutisAuthenticationService.GetMenusAsync` over `GET api/v1/Navigation/Menus`, `[Authorize]`-gated, user id resolved from the caller's own validated JWT via the shared `AcutisCurrentUserClaims.Resolve(User)` helper (also used by `AuthController`'s `Me`/`Logout`/`ChangePassword`). Still backed exclusively by the DEV FAKE repository, same as every other endpoint below.

## Response serialization fix (Task 7)

**Root cause:** `CFR.DBEngine.MSResultArgs` (the non-generic form — returned by `Logout`, `ChangePassword`, `ForgotPassword`, `ResetPassword`; `MSResultArgs<T>`, used by `Login`/`Me`, was never affected) carried a `#region DB result` block — `Success`, `IsShowExceptionMessage`, `RowsAffected`, `IsDeadLock`, `RowUniqueId`, `RowUniqueIdCollection`, `ReturnValue`, `DataSource` — intended as internal Dapper/repository plumbing, but left as plain public properties with no serialization exclusion. `DataSource`'s getter lazily constructs a live `System.Data.DataSet`; when `System.Text.Json` serialized the controller's response, it walked into `DataSource.TableSet` (a freshly-constructed empty `DataSet`) and hit `DataSet`'s cyclic `Locale`/`Parent` object graph, throwing `HTTP 500` — **"A possible object cycle was detected... Path: `$.DataSource.TableSet.Locale.Parent.Parent...`"**. Reproduced exactly against a running `CFR.Acutis` instance before the fix.

Comparison with the reference confirmed this was a CFR-side divergence, not something inherited: the reference's `OptionC.Common.ResultArgs` (the class `MSResultArgs` mirrors) is a flat 6-field DTO — `StatusCode`/`StatusMessage`/`ResultData`/`Errors`/`TraceId`/`Timestamp`/`RowUniqueId` (a plain `string?`, not a whole DB-result subsystem) — with no `DataSource`/`DataSet` concept at all.

**Fix:** `[JsonIgnore]` (from `System.Text.Json.Serialization`) added to every property in `MSResultArgs`'s `#region DB result` block. The properties remain fully usable in C# for any future internal repository code; they are simply excluded from the JSON the client ever sees. `MSResultArgs<T>` was not touched (it never had this region). `BaseController.ApiResultArgs`, `ResultArgsHandler`, and all status-code-to-HTTP mapping were **not** changed — only what gets serialized.

**Shared-service impact assessed before editing:** `MSResultArgs`/`BaseController` live in `CFR.DBEngine`/`CFR.Base`, both shared. `CFR.Gateway` has no controllers (pure YARP proxy, confirmed) and never serializes `MSResultArgs`. `CFR.Portal` has no controllers yet (still the unwired scaffold, confirmed). So the fix currently changes behavior for **`CFR.Acutis` only** — the sole existing consumer — while also closing the same latent bug for any future host that adopts `BaseController`, since the "DB result" fields were never meaningful in an HTTP response for any host.

**Live-verified after the fix**, against a running `CFR.Acutis` instance:

| Endpoint | Before | After |
|---|---|---|
| `Logout` | `500` | `200`, valid JSON, no `DataSet`/`DataSource`/`Table` anywhere in the body |
| `ChangePassword` (wrong current password) | `500` | `400`, `{"statusCode":203,"statusMessage":"Current password is incorrect.",...}` |
| `ForgotPassword` | `500` | `200`, generic message, unchanged enumeration-safety behavior |
| `ResetPassword` (bogus token) | `500` | `400`, `{"statusCode":203,"statusMessage":"This reset link is invalid or has expired.",...}` |
| `Login` | `200` | unchanged — same shape, same token issuance |
| `Me` | `200` | unchanged — same claims-derived identity |

No business-error status code changed as a result of this fix — `ChangePassword`/`ResetPassword`'s `203`→`400` mapping is `BaseController`'s existing, pre-existing behavior (unmapped domain codes default to `BadRequest`), not something this task introduced or altered.

## Repository backing (five independent blocked attempts — still no change)

Five independent session attempts to verify the real `NewViper.DoLogin` database contract and replace `AcutisAuthenticationRepositoryDevFake` with a real, Dapper-backed implementation have all stopped at Phase 1 (verification), never reaching implementation:

- **Task 8:** no approved development database was reachable at all (see [database-contract.md](database-contract.md#task-8-verification-attempt--result-blocked-no-approved-development-database-available)).
- **Task 10:** identified the specific database the reference application uses in development (`Database=optionccom`, real SQL authentication) — hosted on a private LAN with no network path from this execution environment (see [database-contract.md](database-contract.md#task-10-verification-attempt--result-blocked-reference-dev-database-unreachable-from-this-environment)).
- **Task 13:** re-checked the same target with a corrected, secret-safe reachability script — the host is now network-routable but actively refuses the SQL Server port (`ECONNREFUSED`), a more specific but equally blocking result (see [database-contract.md](database-contract.md#task-13-verification-attempt--result-still-blocked-same-target-refined-signal)).
- **Task 15 and this session:** a different blocker — `ConnectionStrings:AcutisDb` does not resolve at all in this session's environment (no User Secret configured, no environment variable set), so no SQL connection was even attempted, confirmed twice in a row (see [database-contract.md](database-contract.md#session-task-2026-08-26-post-task-15--result-still-blocked-at-item-1-connection-string-does-not-resolve-here)).

Per every task's explicit stop condition, no repository implementation was attempted in any of the five. Every endpoint in this document is still backed exclusively by the DEV FAKE repository (or, if `AcutisAuth:RepositoryMode=Database` is explicitly configured, by the `AcutisAuthenticationRepositoryNotImplemented` placeholder added in Task 12 — see [database-contract.md](database-contract.md#configuration-scaffolding-task-12)) — the request/response contracts, status-code mappings, and JWT behavior documented here are all live-verified against the fake, not against real account data.

## JWT issuance and validation (implemented, Task 5–6) — quick reference

Full detail and live-verification evidence: [security-model.md](security-model.md#incoming-jwt-validation-as-implemented-task-6). Summary:

| | |
|---|---|
| Claims | `sub` (UserId), `email`, `name` (FullName) — each individually AES-encrypted via `CommonMethods.EncryptValue`. No role/permission/menu/password data. |
| Signing algorithm | HMAC-SHA256, key from `JWTSetting:SecurityKey` |
| Issuer / Audience | `JWTSetting:Issuer` / `:Audience` (dev: `cfr-acutis` / `cfr-client`) — **validated** on incoming tokens (`ValidateIssuer`/`ValidateAudience` = `true`, Acutis-specific; the shared `CFR.Base` default leaves both `false` for other hosts) |
| Lifetime | Issued = request time; expires 1 day later; `ValidateLifetime = true` |
| Clock skew | `TimeSpan.Zero`, explicit (single process issues and validates; no distributed clock-drift scenario) |
| Required configuration | `JWTSetting:SecurityKey`, `:Issuer`, `:Audience` — application fails to start if any is missing (two independent checks: `CFR.Base.AddAuthenticationSetup` for `SecurityKey`; `CFR.Acutis.AcutisAuthenticationHardening` for all three) |
| 401 vs 400 | `401` = token itself invalid (bad signature/issuer/audience/expiry/missing). `400` = token valid but claims unreadable → no identity established. Never a fabricated identity. |

## Frontend integration (Task 9)

A frontend now calls all six implemented endpoints — `frontend/SaaS_Apps/acutis` (new project, scaffolded this task; see [frontend-design.md](frontend-design.md)). All six routes in the table above were live-exercised via `curl` against a running `CFR.Acutis` instance during this task and their exact JSON shapes confirmed to match the frontend's TypeScript types (`src/modules/auth/types.ts`) field-for-field:

- `Login` with invalid credentials → domain `203`, no `token` field present in the (absent) `resultData` — confirmed the frontend never treats this as a session.
- `Login` with the DEV FAKE's valid credentials → `200`, `resultData.user.token` present, `moduleRights`/`menuItems` populated.
- `Me` with that token → `200`, matches `AcutisCurrentUser`.
- `Me` with a tampered token, and with no token → both `401`.
- `Logout` with a valid token → `200`.
- `ForgotPassword` → `200`, generic message, regardless of email.
- `ResetPassword` with a bogus token → `400`, generic "invalid or expired" message.

`GET /navigation/menus` (Task 14) is now called by the frontend on Dashboard mount, refreshing `AuthContext.menuItems` from the live endpoint; the `menuItems` captured at login remain the fallback shown while that refresh is in flight or if it fails (menus are treated as non-critical UI — see [frontend-design.md](frontend-design.md#dynamic-menus-as-built)).

---

## 1. `POST /acutis/api/v1/auth/login`

| | |
|---|---|
| **Actual route** | `POST api/v1/Auth/login` behind gateway prefix `/acutis` → `POST /acutis/api/v1/auth/login` |
| **Request DTO** | `AcutisLoginRequest { string UserName, string Password }` — mirrors reference `AcutisAuthenticationDTO` (`UserName`/`Password` both `[Required]`); `IPAddress` is **not** accepted from the client (reference passes it through but the repository call always sends an empty string regardless — see [database-contract.md](database-contract.md) — so nothing is lost by dropping it from the request contract; server-derived `HttpContext.Connection.RemoteIpAddress` may be logged separately if ever needed, not client-supplied) |
| **Success response** | `MSResultArgs<AcutisLoginResult> { StatusCode = 200, StatusMessage = "Success", ResultData = { user: {...}, token: "<jwt>", moduleRights: [...], menuItems: [...] } }` — shape mirrors reference `ViperLoginQueryResult` (`User`, `ModuleRights` filtered to `UserRight > 0`, `MenuItems` from `MapModuleRightsToMenu`) |
| **Existing response wrapper** | `MSResultArgs<T>` (`CFR.DBEngine/MSResultArgs.cs`, confirmed present) via `BaseController.ApiResultArgs<T>(resultArgs, APIHttpType.HttpPost)` |
| **Validation errors** | `400 BadRequest` (`ErrorCodes.BadRequest`) if body is null or `UserName`/`Password` fail `[Required]` model validation — matches reference's `if (request == null) return BadRequest();` plus standard `[ApiController]` automatic model-state validation |
| **Unauthorized/forbidden behavior** | `[AllowAnonymous]` — no bearer token required to call this endpoint. On invalid credentials: **not** `401` — matches reference exactly, which returns `200` with `StatusCode = ErrorCodes.Failed (203)` and `StatusMessage = ErrorMessages.InvaildLogin` inside the `MSResultArgs` envelope (an HTTP-200-with-domain-error-code pattern, consistent with every other endpoint in this contract that follows `BaseController.GetResponseByStatusCode`, which only maps `Success`/`BadRequest`/etc. to distinct HTTP codes — `Failed` is not one of the codes explicitly switched, so it falls through to the `_ => BadRequest(resultArgs)` default, meaning actual failed-login HTTP status is `400`, with the domain code `203` inside the body distinguishing it from a validation `400`). This exact mapping must be verified against `CFR.Base.BaseController.GetResponseByStatusCode` (already read in full in Task 1 — confirmed to default unmapped codes to `BadRequest`) before implementation, not re-derived ad hoc. |
| **Existing database object used** | `Viper.DoLogin`-equivalent stored procedure — **status: confirmed-in-reference-code, not confirmed-in-target-database** (see [database-contract.md](database-contract.md)); this endpoint's first implementation precondition is confirming it. |
| **Service and repository method** | `IAcutisAuthService.LoginAsync(AcutisLoginRequest)` → `IAcutisAuthRepository.AuthenticateAsync(...)` → `IDapperHandler.QueryMultipleAsync(...)`, mirroring reference `AcutisAuthenticationService.LoginAuthenticationAsync` → `AcutisAuthenticationRepository.AuthenticateAsync` |
| **JWT/token behavior** | On `Success`, service (or controller, matching reference's placement) calls the Acutis-local `IJwtTokenGenerator.GenerateToken(user)` (thin claims: email/sub/name, each `CommonMethods.EncryptValue`-encrypted; see [security-model.md](security-model.md)) and attaches it to the response's `user.token` field. No token is issued on failed login. |
| **Frontend caller** | `src/modules/auth/services/authApi.ts` (new, mirrors reference `LoginAction.ts`) — `loginAuthentication({userName, password})`; persists the full response and sets the Axios default `Authorization` header, matching reference's `persistAcutisAuth`/`applyBearerFromPayload` pattern |
| **Unsupported/future behavior** | The reference's background "rotate startup theme images" side effect is **not** ported (cosmetic, unrelated to auth, adds an unconfirmed disk-path dependency — explicitly excluded, not silently dropped) |

## 2. `POST /acutis/api/v1/auth/logout`

| | |
|---|---|
| **Actual route** | `POST api/v1/Auth/logout` → `POST /acutis/api/v1/auth/logout` |
| **Request DTO** | None (empty body) |
| **Success response** | `MSResultArgs { StatusCode = 200, StatusMessage = "Success" }` |
| **Existing response wrapper** | `MSResultArgs` |
| **Validation errors** | None applicable (no body) |
| **Unauthorized/forbidden behavior** | `[Authorize]` — requires a valid bearer token to call (so the server can, at minimum, log the logout event against a known identity); an already-expired/invalid token yields the standard `401` from JWT bearer middleware, which is harmless since the client is logging out anyway |
| **Existing database object used** | None — matches reference (no backend logout endpoint exists there at all; this endpoint is new but trivial, added only so the frontend has a real server round-trip to call instead of being purely client-side, per this task's explicit request for a `POST /auth/logout` route) |
| **Service and repository method** | `IAcutisAuthService.LogoutAsync(currentUserId)` — may be a no-op today (no server-side session/token store exists to invalidate, per [reference-comparison.md §2](reference-comparison.md#2-logout)); reserved as a seam for future server-side revocation without changing the frontend contract |
| **JWT/token behavior** | No token invalidation occurs server-side in this design (stateless JWT, matching reference — see [reference-comparison.md §2](reference-comparison.md#2-logout)); the frontend clears its stored token regardless of this call's outcome |
| **Frontend caller** | `authApi.ts` `logout()`, called by `AuthProvider`'s `logout()` action before clearing local storage and redirecting to `/auth/login` |
| **Unsupported/future behavior** | Server-side token/session invalidation (blacklist, short-lived-token + refresh rotation) is **not** specified here — flagged as a future design decision, not assumed |

## 3. `POST /acutis/api/v1/auth/forgot-password`

| | |
|---|---|
| **Actual route** | `POST api/v1/Auth/forgot-password` → `POST /acutis/api/v1/auth/forgot-password` |
| **Request DTO** | `ForgotPasswordRequest { string Email }` — naming precedent from `CFR.Common/AuthModels.cs`'s existing (currently unused) `ForgotPasswordRequest.UserName`, adapted to `Email` to match the task's frontend field and the reference login field being an email address |
| **Success response** | `MSResultArgs { StatusCode = 200, StatusMessage = "If an account exists for that email, a reset link has been sent." }` — **always** this generic response, whether or not the email matches an account (see [security-model.md](security-model.md) — enumeration prevention) |
| **Existing response wrapper** | `MSResultArgs` |
| **Validation errors** | `400 BadRequest` only for a structurally invalid request (missing/malformed email per `[EmailAddress]`/`[Required]`) — never for "email not found," which is folded into the generic success response |
| **Unauthorized/forbidden behavior** | `[AllowAnonymous]` (pre-authentication flow, matching reference's SSO-module equivalent's anonymous placement, applied here to the Acutis-only version) |
| **Existing database object used** | **None confirmed — blocker.** No lookup-by-email-and-issue-token procedure exists in the reference Acutis vertical (see [database-contract.md](database-contract.md)). |
| **Service and repository method** | `IAcutisAuthService.ForgotPasswordAsync(email)` → (design-only) `IPasswordResetTokenStore.IssueResetTokenAsync(...)` + `IPasswordResetEmailSender.SendPasswordResetEmailAsync(...)` (see [security-model.md](security-model.md)) — repository-level DB lookup for "does this email belong to an Acutis account" is itself unconfirmed to have an existing query to reuse; would need the same schema-discovery precondition as Login |
| **JWT/token behavior** | Not applicable — no bearer token involved |
| **Frontend caller** | `authApi.ts` `forgotPassword({email})`, called from the Forgot Password screen (see [frontend-design.md](frontend-design.md)) |
| **Unsupported/future behavior** | **Marked unsupported pending database confirmation.** The endpoint's request/response contract, validation, and enumeration-safe behavior are fully specified and can be implemented and tested today against the dev-only `IPasswordResetTokenStore` backing (see [security-model.md](security-model.md)); the production email-actually-reaches-a-real-account path cannot be claimed complete until the blocker in [database-contract.md](database-contract.md) is resolved. |

## 4. `POST /acutis/api/v1/auth/reset-password`

| | |
|---|---|
| **Actual route** | `POST api/v1/Auth/reset-password` → `POST /acutis/api/v1/auth/reset-password` |
| **Request DTO** | `ResetPasswordRequest { string Token, string NewPassword, string ConfirmPassword }` |
| **Success response** | `MSResultArgs { StatusCode = 200, StatusMessage = "Password reset successfully." }` |
| **Existing response wrapper** | `MSResultArgs` |
| **Validation errors** | `400 BadRequest` for missing/malformed fields, `NewPassword != ConfirmPassword`, or password-policy violation (policy itself not specified in this task — reuse whatever the target database/procedure would eventually enforce, once confirmed; not invented here); a **distinct, generic** error (not revealing which reason) for an invalid/expired/already-used token — e.g. `StatusCode = ErrorCodes.Failed`, `StatusMessage = "This reset link is invalid or has expired."` |
| **Unauthorized/forbidden behavior** | `[AllowAnonymous]` (the token itself, not a bearer JWT, is the credential for this call) |
| **Existing database object used** | **None confirmed — blocker.** No token-validation-and-password-write procedure exists in the reference Acutis vertical (see [database-contract.md](database-contract.md)). |
| **Service and repository method** | `IAcutisAuthService.ResetPasswordAsync(token, newPassword)` → (design-only) `IPasswordResetTokenStore.ValidateAndConsumeTokenAsync(token)` then a password-write call — the write call is the same confirmed-blocker object needed by Change Password's write step (§6 below); this endpoint and Change Password should share one internal `IAcutisPasswordRepository.SetPasswordAsync(userId, newPassword)` method once that object exists, so the blocker only needs resolving once |
| **JWT/token behavior** | Not applicable |
| **Frontend caller** | `authApi.ts` `resetPassword({token, newPassword, confirmPassword})`, called from the Reset Password screen, which reads `token` from the URL query string (`/auth/reset-password?token=...`) |
| **Unsupported/future behavior** | **Marked unsupported pending database confirmation**, same status as Forgot Password — contract and validation are implementable now against the interface-ready token store; the actual password write is blocked. |

## 5. `POST /acutis/api/v1/auth/change-password`

| | |
|---|---|
| **Actual route** | `POST api/v1/Auth/change-password` → `POST /acutis/api/v1/auth/change-password` |
| **Request DTO** | `ChangePasswordRequest { string CurrentPassword, string NewPassword, string ConfirmPassword }` — matches the existing (currently unused elsewhere) shape in `CFR.Common/AuthModels.cs` exactly |
| **Success response** | `MSResultArgs { StatusCode = 200, StatusMessage = "Password changed successfully." }` |
| **Existing response wrapper** | `MSResultArgs` |
| **Validation errors** | `400 BadRequest` for missing fields or `NewPassword != ConfirmPassword`; `400` (domain code, e.g. `ErrorCodes.Failed`) with a generic "Current password is incorrect." message if the verify step (§ below) fails — never distinguishing "wrong password" from "account issue" beyond that generic message |
| **Unauthorized/forbidden behavior** | `[Authorize]` — the acting user is taken from the JWT (`ICurrentUserService`, already present per [current-state.md](current-state.md)), never from a client-supplied user id; a request with no/invalid/expired token gets the standard `401` from JWT bearer middleware before the action body even runs |
| **Existing database object used** | Verify step: reuses the Login credential-check object (see [security-model.md](security-model.md), option 1) — same confirmed-in-reference-code / not-confirmed-in-target-DB status as Login. Write step: **none confirmed — blocker**, same object needed by Reset Password's write step. |
| **Service and repository method** | `IAcutisAuthService.ChangePasswordAsync(userId, currentPassword, newPassword)` → verify via the reused login-check path, then (design-only, blocked) `IAcutisPasswordRepository.SetPasswordAsync(userId, newPassword)` |
| **JWT/token behavior** | No new token is issued on password change in this design (the existing token remains valid until its normal expiry); revisiting this — e.g., forcing re-login after a password change — is a future decision, not specified here |
| **Frontend caller** | `authApi.ts` `changePassword({currentPassword, newPassword, confirmPassword})`, called from an authenticated Change Password screen/form |
| **Unsupported/future behavior** | Verify step is implementable now (via login-check reuse); write step is a confirmed blocker, same as §3/§4 |

## 6. `GET /acutis/api/v1/auth/me`

| | |
|---|---|
| **Actual route** | `GET api/v1/Auth/me` → `GET /acutis/api/v1/auth/me` |
| **Request DTO** | None — identity resolved entirely from the bearer token |
| **Success response** | `MSResultArgs<AcutisCurrentUser> { StatusCode = 200, ResultData = { userId, email, fullName } }` — a **decode-the-JWT-claims-only** response by default (see Existing database object used, below) |
| **Existing response wrapper** | `MSResultArgs<T>` |
| **Validation errors** | Not applicable (no request body) |
| **Unauthorized/forbidden behavior** | `[Authorize]` — missing/invalid/expired token → standard `401` from JWT bearer middleware, no custom handling needed |
| **Existing database object used** | **None required for the minimal (JWT-claims-only) version** — this is the one endpoint in this contract with zero database dependency, since the reference's thin token already carries everything (`email`/`sub`/`name`) this endpoint needs to return, and the reference itself has no `/me`-equivalent database call to model this on (see [database-contract.md](database-contract.md)). |
| **Service and repository method** | `ICurrentUserService` (already present, per [current-state.md](current-state.md)) is sufficient for the minimal version — no new repository method needed. An optional revalidating variant (re-fetch fresh `moduleRights`/`menuItems` from the DB instead of trusting the cached login response) would reuse the same object as Login/Navigation — not specified as required here, listed as a future option only. |
| **JWT/token behavior** | Reads claims from the already-validated `HttpContext.User` — no new token issued |
| **Frontend caller** | `authApi.ts` `getCurrentUser()` — used narrowly (e.g., to validate a restored session on app load before trusting `localStorage`), since the reference pattern of trusting the cached login response is otherwise kept (see [reference-comparison.md §6](reference-comparison.md#6-current-user)) |
| **Unsupported/future behavior** | Revalidating (DB-backed) variant is future/optional, not required for this task's acceptance criteria |

## 7. `GET /acutis/api/v1/navigation/menus`

| | |
|---|---|
| **Actual route** | `GET api/v1/Navigation/menus` → `GET /acutis/api/v1/navigation/menus` |
| **Request DTO** | None |
| **Success response** | `MSResultArgs<List<NavGroup>> { StatusCode = 200, ResultData = [ { title, sessionKey, path, activity: [...], links: [...], btnlinks: [...] }, ... ] }` — shape matches reference `MenuItems`/`SubMenuItems`/`SubMenuTabItems` (`MapModuleRightsToMenu`) |
| **Existing response wrapper** | `MSResultArgs<T>` |
| **Validation errors** | Not applicable |
| **Unauthorized/forbidden behavior** | `[Authorize]` — missing/invalid/expired token → `401`; no per-menu-item authorization beyond "the requesting user's own rights determine the tree returned" (the rights rowset is filtered server-side by the acting user's id, same as reference — never accepts a client-supplied user id) |
| **Existing database object used** | Same rights rowset as Login (see [database-contract.md](database-contract.md)) — confirmed-in-reference-code as part of `Viper.DoLogin`'s second result grid; whether a standalone rights-only query exists (to avoid a full login re-check) is unconfirmed |
| **Service and repository method** | `IAcutisNavigationService.GetMenusAsync(userId)` → repository call reusing the same rights query Login uses (exact reuse mechanism — full re-login vs. a lighter standalone query — is a Task-3-time implementation decision, not fixed here, since it depends on what's actually confirmed to exist in the target DB) |
| **JWT/token behavior** | User id taken from `HttpContext.User` claims, never from a query parameter |
| **Frontend caller** | `authApi.ts` `getMenus(token, cachedMenuItems)` (Task 14) — called on Dashboard mount to refresh `AuthContext.menuItems` from the live endpoint; `cachedMenuItems` (the login-time snapshot) is shown until the refresh resolves and remains the fallback on failure, since menus are non-critical UI |
| **Unsupported/future behavior** | Implemented (Task 14), still backed by the DEV FAKE repository — real rights-driven filtering pending the same target-DB confirmation every other DB-touching endpoint here needs |

---

## Endpoint summary table

| Endpoint | Auth | DB status | Buildable now? |
|---|---|---|---|
| `POST /auth/login` | Anonymous | Confirmed-in-reference-code, target-DB unconfirmed | Yes, pending confirmation |
| `POST /auth/logout` | Authenticated | None needed | Yes |
| `POST /auth/forgot-password` | Anonymous | **Blocker** | Contract/validation yes; real delivery no |
| `POST /auth/reset-password` | Anonymous (token-authenticated) | **Blocker** | Contract/validation yes; real write no |
| `POST /auth/change-password` | Authenticated | Verify: reuse Login (unconfirmed target-DB); Write: **blocker** | Verify yes (pending); write no |
| `GET /auth/me` | Authenticated | None needed (JWT-only) | Yes |
| `GET /navigation/menus` | Authenticated | Confirmed-in-reference-code, target-DB unconfirmed | Implemented (Task 14), pending target-DB confirmation |
