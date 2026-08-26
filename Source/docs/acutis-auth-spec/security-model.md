# Security Model — Acutis Authentication

Scope and date: Task 2, 2026-08-26 (specification). Updated Task 6, 2026-08-26 — incoming JWT
validation was hardened and live-verified against a running `CFR.Acutis` instance (not just
specified); this revision documents what was actually built and confirmed, not only intent.

## Incoming JWT validation (as implemented, Task 6)

Enforced by two layers, both in `CFR.Acutis` — nothing in `CFR.Base` was changed, so `CFR.Gateway`
(and `CFR.Portal`, once wired) are unaffected:

1. `CFR.Base.CommonServiceExtension.AddAuthenticationSetup` (shared, unchanged) — registers the JWT
   bearer scheme, sets `ValidateIssuerSigningKey = true` with the key from `JWTSetting:SecurityKey`,
   and throws `InvalidOperationException` at **application startup** if `JWTSetting` or
   `SecurityKey` is missing.
2. `CFR.Acutis.AcutisAuthenticationHardening.AddAcutisJwtValidationHardening` (new, Acutis-local,
   called immediately after #1 in `Program.cs`) — `PostConfigure`s the same JWT bearer scheme's
   `TokenValidationParameters`:

| Setting | Value | Verified |
|---|---|---|
| `ValidateIssuerSigningKey` | `true` | Live-verified: a token re-signed with a different key → `401` |
| `ValidateIssuer` | `true`, `ValidIssuer` = `JWTSetting:Issuer` (`cfr-acutis` in dev) | Live-verified: a token with issuer `evil-issuer` → `401` |
| `ValidateAudience` | `true`, `ValidAudience` = `JWTSetting:Audience` (`cfr-client` in dev) | Live-verified: a token with audience `evil-audience` → `401` |
| `ValidateLifetime` | `true` (explicit — matches the framework default, restated for clarity/documentation) | Live-verified: a token expired 10 minutes ago → `401` |
| `ClockSkew` | `TimeSpan.Zero`, explicit | Same process issues and validates tokens; no multi-server clock-drift scenario exists in this deployment shape, so no allowance is needed. Documented explicitly rather than left as an unstated default. |
| `MapInboundClaims` | `false` | **Required**, not cosmetic — without it, ASP.NET Core's `JwtSecurityTokenHandler` silently remaps the short claim names `sub`/`email`/`name` to long legacy XML-namespace claim types on the way in, so `AuthController.ResolveCurrentUser`'s lookups by `JwtRegisteredClaimNames.Sub/Email/Name` never match. Found by live verification during Task 6 (a validly-signed, unexpired, correct-issuer/audience token produced `HTTP 400` from `/Me` before this fix, because no claim could be resolved under its issued name) — this was a real defect, not a hypothetical one. |

**Fail-safe configuration:** `AddAcutisJwtValidationHardening` reads `JWTSetting:Issuer`,
`:Audience`, and `:SecurityKey` **eagerly, at startup** (before `app.Build()`/`Run()`), throwing
`InvalidOperationException` with a specific message if any is missing or blank — the application
will not start with incomplete Acutis JWT configuration, in any environment. This is in addition
to, not instead of, `AddAuthenticationSetup`'s own existing `SecurityKey` check.

**Why not modify `CFR.Base.CommonServiceExtension.AddAuthenticationSetup` directly:** that method
is also called by `CFR.Gateway` (confirmed by repo-wide search) — its `JWTSetting` has a different
issuer (`optionc-gateway`) and audience (`optionc-client`), and enabling strict issuer/audience
validation there was neither requested nor verified safe for the Gateway's own token flows.
`CFR.Portal` does not call it yet (still an unwired scaffold), so it is unaffected either way.
Layering the hardening in `CFR.Acutis` via `PostConfigure` keeps every other host's behavior
byte-for-byte unchanged.

**A second, unrelated blocker to real JWT auth was found and fixed in the same pass:**
`CFR.Base.CommonAppSetupExtension.UseCustomMiddlewareSetup` (previously wired into
`CFR.Acutis/Program.cs`) also activates `CFR.Base.ClientInfoMiddleware`, which expects the
SSO-shaped claim set (`ClaimTypes.NameIdentifier` / `Constant.SessionField.*`) and returns its own
`401 Unauthorized: Invalid User ID` for any request that doesn't have those claims — which no
Acutis token ever will, by design. This middleware ran *before* the controller and rejected every
genuinely-valid Acutis-issued token outright. `CFR.Acutis/Program.cs` now wires only
`GlobalExceptionHandlerMiddleware` directly, not the full `UseCustomMiddlewareSetup()` bundle —
`CFR.Base` itself was not changed, so `CFR.Gateway` (which doesn't call `UseCustomMiddlewareSetup`
either, confirmed) is unaffected, and any future host that *does* need SSO-shaped
`ICurrentUserService` population can still opt into the full bundle. This is exactly the
"do not depend on SSO ClientInfoMiddleware" rule from earlier tasks, now enforced by removing the
dependency rather than merely stating it.

## 401 vs. 403 behavior

- **`401 Unauthorized`** is returned by the JWT bearer middleware itself, before any controller
  action runs, for: missing bearer token, invalid signature, wrong issuer, wrong audience, or
  expired token — all four confirmed by live verification (see the table above).
- **`400 Bad Request`** — not `401` — is what `AuthController`/`AcutisAuthenticationService` return
  when a token passes all of the above (it is genuinely valid) but its claims are malformed/absent
  (e.g. a `sub` claim whose decrypted value isn't a parseable user id): `GetCurrentUserAsync` sees
  `userId <= 0` and reports `"No authenticated user context was found."`. This is a deliberate
  layering distinction, live-verified with a validly-signed, correct-issuer/audience, unexpired
  token carrying deliberately un-encrypted garbage claim values: the token is authenticated (HTTP
  auth succeeded), but the application layer still refuses to establish an identity from
  unreadable claims — it does not fabricate a plausible-but-wrong user. This satisfies "malformed
  encrypted claims do not create a valid user identity" without conflating token validity with
  claim-content validity.
- **`403 Forbidden`** is still not currently produced by any Acutis endpoint — there is no
  role/permission gate on any endpoint beyond "authenticated or not" (unchanged from the Task 2
  specification). What changed in Task 14: the frontend now has a generic handler for it anyway
  (`registerForbiddenHandler` in `httpClient.ts`, wired by `AuthProvider` to navigate to
  `/unauthorized` without clearing the session — 403 means "authenticated but not permitted," not
  "session invalid," so unlike the 401 handler it must never log the user out). This is
  forward-wiring for whenever a role-gated endpoint is added; it does not itself introduce any new
  403-producing behavior server-side.

## Development limitations (Task 6 update)

- The DEV FAKE repository still only recognizes one hardcoded credential pair — real login remains
  blocked pending the database-contract confirmation in [database-contract.md](database-contract.md).
  What changed this task is that a **real, correctly-signed, correctly-validated JWT is now
  genuinely issued and enforced** for that one dev account — `[Authorize]` endpoints can be
  exercised end-to-end locally for the first time, which is what made the `ClientInfoMiddleware`
  conflict and the claim-mapping defect above discoverable at all.
- **Fixed in Task 7** (was open at the end of Task 6): `CFR.DBEngine.MSResultArgs` (the non-generic
  form, used by `Logout`/`ChangePassword`/`ForgotPassword`/`ResetPassword`) had a `DataSource`
  property that lazily constructed a live `System.Data.DataSet` on first access; System.Text.Json
  hit this getter during serialization and crashed with "A possible object cycle was detected"
  (`$.DataSource.TableSet.Locale.Parent.Parent...`), producing `HTTP 500` on all four of those
  endpoints even though their business logic ran correctly. See
  [api-contract.md](api-contract.md#response-serialization-fix-task-7) for the fix and
  live-verification evidence — this is no longer an open item.
- No refresh-token flow exists (out of scope for this task, per instructions) — a 1-day token with
  re-login on expiry remains the full lifecycle.

## Authentication mechanism

- **JWT bearer, normal ASP.NET Core pipeline** — `services.AddAuthentication(...).AddJwtBearer(...)` via `CFR.Base.CommonServiceExtension.AddAuthenticationSetup` (already present, confirmed in [current-state.md](current-state.md)), plus `app.UseAuthentication()` / `app.UseAuthorization()` in `CFR.Acutis`'s middleware pipeline, plus `[Authorize]` re-enabled at the point it's needed (either on `BaseController`, currently commented out, or per-controller/per-action — recommendation below).
- **`CFR.Base.CommonServiceExtension.DisableAuthenticationPolicy` must never be called from `CFR.Acutis`'s `Program.cs`.** This is a hard requirement (task instruction + NFR6 in [requirements.md](requirements.md)), not a style preference: that method unconditionally replaces `IPolicyEvaluator` with one that always authenticates and always authorizes, in every environment, which would silently defeat every other control in this document.
- **Token shape:** mirrors the reference's Acutis-specific *thin* token (see [reference-comparison.md §1](reference-comparison.md#1-login)), not the shared `CFR.Base.IJwtTokenGenerator`'s `UserContextData` (fat-claims, SSO-style) shape. A second, Acutis-local `IJwtTokenGenerator` implementation is required (or a distinctly-named second interface) to avoid colliding with the existing one. Claims: `email`, `sub` (user id), `name` (full name) — each value passed through `CFR.CommonService.CommonMethods.EncryptValue` before being placed in the token, matching the reference's approach exactly (that method already exists in the ongoing repo, confirmed in [current-state.md](current-state.md)). Signing: HMAC-SHA256, key from `JWTSetting:SecurityKey` (configuration, never hardcoded, never logged). Expiry: 1 day, matching the reference (open to revisiting in a later task, not changed here).
- **Role/permission data is not embedded in the JWT.** It travels in the Login response body (`moduleRights`, `menuItems`) and is re-derivable via `GET /navigation/menus` (implemented Task 14 — `NavigationController`, `[Authorize]`-gated, user id taken exclusively from the caller's own validated JWT claims via `AcutisCurrentUserClaims.Resolve`, never from a request parameter), exactly as in the reference design. This keeps the token small and avoids baking stale permissions into a signed artifact that can't be revoked mid-lifetime — a deliberate carry-over of the reference's better decision (see [reference-comparison.md §7](reference-comparison.md#7-rolepermission-based-dynamic-menus)).

## Authorization

- `[Authorize]` is applied to every Acutis auth-adjacent endpoint **except** `login`, `forgot-password`, and `reset-password`, which are `[AllowAnonymous]` by necessity (pre-authentication flows) — matching the reference's own `[AllowAnonymous]` placement on `AcutisLoginController.LoginAuthentication`.
- No custom authorization policies/roles are specified in this task beyond "authenticated vs. not" — the existing module-rights/menu system (reused, not reinvented) is the source of truth for what an authenticated user can see and do; this task does not add a new parallel permission model.
- **Forbidden (403) behavior:** reserved for a future authorization-policy task once role-gated *endpoints* (not just menu visibility) are defined; none of the seven endpoints in [api-contract.md](api-contract.md) currently have a role restriction beyond "must be authenticated," so 403 is specified as available but not exercised by this feature set — see each endpoint's row in [api-contract.md](api-contract.md) for the precise unauthorized/forbidden behavior expected of it.

## Password verification and change

- **Reuse the existing verification mechanism** (task instruction): the only credential-verification path confirmed anywhere in the reference Acutis vertical is the stored procedure invoked by Login (`Viper.DoLogin`-equivalent — see [database-contract.md](database-contract.md)), which appears to perform the comparison entirely DB-side (no hashing/compare logic visible in the reference's .NET code).
- **Change Password "verify current password" step — two design options, both documented, neither silently assumed:**
  1. **Recommended, buildable now:** re-invoke the same login verification path with the authenticated user's identity (from the JWT) and the submitted `currentPassword`. This reuses an object already confirmed to exist and requires no new database work, at the cost of running full login logic (including the rights-rowset query) just to check a password — an acceptable inefficiency for a low-frequency operation.
  2. **Future work:** a dedicated, lighter verify-only procedure, if one is later discovered or added. Not assumed to exist; not required for a working Change Password design.
- **Change Password "write new password" step is a confirmed blocker** (see [database-contract.md](database-contract.md)) — no procedure to perform this write was found anywhere in the reference Acutis vertical. The API contract for this step is specified (request/response shape, validation, response codes) so it is ready to wire up the moment a real write path is confirmed or added, but it cannot be marked implementable today. **Status unchanged as of the 2026-08-26 session task (Phase 3 of that task's scope):** the target database was never reachable (Phase 1 blocked before any query could run), so the required Phase 3 inspection — searching the live schema for a password-write/reset-token/policy/history procedure — was never performed. This remains a code-independent, environmental blocker, not a design gap; the "not yet supported" response `ChangePasswordAsync` returns today is still accurate and still the only honest behavior available.
- Passwords are never logged, never included in error messages, never round-tripped in a URL/query string (a mistake explicitly flagged against the SSO module's `EmailSigninController.SaveEmail` in [reference-comparison.md §4](reference-comparison.md#4-reset-password) and deliberately avoided here — every password-bearing request uses `[FromBody]` over HTTPS only).

## Forgot / reset password — interface-ready design

Because the backing database objects are a confirmed blocker (see [database-contract.md](database-contract.md)), this section specifies **interfaces and contracts**, not a working implementation.

### `IPasswordResetTokenStore` (interface-ready design, not implemented)

```
Task<string?> IssueResetTokenAsync(int userId, TimeSpan validity, CancellationToken ct);
Task<int?> ValidateAndConsumeTokenAsync(string token, CancellationToken ct);   // returns userId or null if invalid/expired/already used
```

- **Development-only backing implementation:** an in-memory or short-lived cache-based store (e.g. `IMemoryCache`, already available via `CFR.Base.CommonServiceExtension.AddCommonServicesSetup`'s `AddMemoryCache()`), clearly labeled dev/test-only, non-durable (lost on app restart), and **never** enabled in a Production configuration switch.
- **Production-ready backing implementation (future work, requires DB change):** a token/expiry/used-flag column set (or dedicated table) against the Acutis user record, written and read through a new stored procedure — explicitly deferred, not designed further here per "do not design database changes now."
- The interface boundary is what lets Task 2's frontend and API-contract work proceed against a real, testable seam today without pretending the production storage question is settled.

### `IPasswordResetEmailSender` (interface-ready design, not implemented)

```
Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct);
```

- Backed by the existing `CFR.CommonService.MailService.SMTPService`/`Services/SMTPMailService.cs` (confirmed present in [current-state.md](current-state.md)) — reused, not reinvented, once wired.
- Reset link format: `{frontendBaseUrl}/auth/reset-password?token={token}` — token passed as an opaque, single-use, time-limited value; **never** the account's email/username encoded into the link in a decodable way (the reference SSO module's Base64-encoded, non-cryptographic query-string identifiers are explicitly not reused — see [reference-comparison.md §3](reference-comparison.md#3-forgot-password)).

### Account-enumeration prevention

`POST /auth/forgot-password` always returns the same generic success response (`MSResultArgs { StatusCode = 200, StatusMessage = "If an account exists for that email, a reset link has been sent." }`) regardless of whether the submitted email matches an account — mirroring good practice and explicitly *not* mirroring the reference SSO module's `EmailSigninController.ForgotPassword`, which distinguishes valid/invalid emails via different status codes (a real enumeration weakness flagged in Task 1's security findings and deliberately not carried forward).

## Session expiry / unauthorized handling

- **Backend:** normal JWT expiry validation (`ValidateLifetime` — framework default `true`, not disabled) is what actually rejects an expired token with `401`, now that `DisableAuthenticationPolicy` is excluded. No refresh-token flow is specified in this task (the reference has `GenerateRefreshToken()` on its shared interface but never calls it anywhere in the Acutis vertical — out of scope here too; a 1-day token with re-login on expiry is the specified behavior, matching the reference's actual, not aspirational, behavior).
- **Frontend:** the Axios 401 interceptor must, in addition to whatever toast/notification it shows, clear stored auth state and redirect to `/auth/login` with a "session expired" indicator (see [frontend-design.md](frontend-design.md) for the dedicated Session Expired screen) — this is the fix to the reference's confirmed gap (toast-only, no logout) from [reference-comparison.md §9](reference-comparison.md#9-session-expiry-and-unauthorized-handling).
- **`ProtectedLayout`-equivalent** must check token expiry (not just presence) before rendering protected content, closing the second half of that same gap.

## Data handled and its sensitivity

| Data | Where it appears | Handling rule |
|---|---|---|
| Plaintext password (login, change, reset) | Request body only, over HTTPS | Never logged; never stored beyond the single request's processing; never included in exception messages returned to the client (matches `BaseController`'s existing pattern of returning `ErrorMessages.InternalServerError`, a generic string, on failure — not `ex.Message`, which Task 1's reference review flagged as leaking internals in a couple of other controllers) |
| Reset token | Query string of the emailed link (single use, short-lived, opaque, unguessable) + request body of `POST /auth/reset-password` | Never logged; store implementation (§ above) must not persist it in plaintext-readable logs either |
| JWT | `Authorization: Bearer` header; `localStorage` on the frontend (matching the reference's own storage choice, not changed here) | Never logged server-side beyond standard request-processing (which doesn't log header values in the existing Serilog wiring, per Task 1's cross-repo review); claims are individually encrypted, not just base64 (matching reference) |
| Module rights / menu tree | Login and `/navigation/menus` response bodies | Not sensitive beyond ordinary authorization data; no special handling beyond normal transport security |
| Internal DB-result state (`MSResultArgs.DataSource`/`DataSet`/`DataTable`/`RowUniqueId`/`ReturnValue`/etc.) | Never — `[JsonIgnore]`d on `CFR.DBEngine.MSResultArgs` as of Task 7 | Must never appear in any API response body. These fields are internal repository-to-caller plumbing, not part of the API contract (confirmed against the reference's flat `ResultArgs`, which never had them) — see [api-contract.md](api-contract.md#response-serialization-fix-task-7) |
