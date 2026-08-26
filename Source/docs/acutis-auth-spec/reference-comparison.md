# Reference Comparison — Completed Acutis Authentication

Scope: everything the completed reference app (`D:\Besp Task\GitHub\OptionC_Conversion\Source\acutis`) actually does for the 9 requested features. Read-only analysis; nothing in this tree was modified. Every row states what exists in source — where a feature doesn't exist in the reference, that is reported plainly rather than inferred.

Legend for **Decision**: `reuse` = port with only namespace/config changes; `adapt` = same shape, meaningful changes needed; `create` = no reference implementation exists, must be designed new.

## 1. Login

| | |
|---|---|
| **Source project** | `OptionCMicroservice/OptionC.Acutis` (controller), `OptionCService/OptionC.AcutisService` (service), `OptionCInfrastructure/OptionC.AcutisInfrastructure` (repository), `OptionCMicroservice/OptionC.Acutis` (local `JwtTokenGenerator`) |
| **File path** | `Controllers/AcutisAuthentication/AcutisLoginController.cs`; `Service/AcutisAuthentication/AcutisAuthenticationService.cs`; `Repositorys/AcutisAuthentication/AcutisAuthenticationRepository.cs`; `Models/Input/AcutisAuthenticationDTO.cs`; `OptionCMicroservice/OptionC.Acutis/IJwtTokenGenerator.cs` |
| **Current behavior** | `POST api/v1/AcutisLogin/LoginAuthentication`, `[AllowAnonymous]`, body `AcutisAuthenticationDTO { UserName, Password, IPAddress? }` (both `[Required]`). Controller null-checks the body, calls `service.LoginAuthenticationAsync`. Service calls `repository.AuthenticateAsync`, which runs stored procedure **`Viper.DoLogin`** via `IDapperHandler.QueryMultipleAsync`, passing `EMail` (trimmed), `Password`, empty `IPAddress`/`LoginTransferID`, and reads two result grids: a single `ViperLoginUserResult` row and a `List<ViperLoginModuleRightRow>`. If no user row comes back, returns `ErrorCodes.Failed` / `ErrorMessages.InvaildLogin` (a repo-wide misspelling, kept as-is upstream). On success, the service also fires-and-forgets a background task (`HandleStartupImagesAsync`) that rotates theme startup images on disk — a legacy, purely cosmetic side effect, not a security-relevant step. Back in the controller, if `StatusCode == Success`, it casts `ResultData` to `ViperLoginQueryResult`, calls the **project-local** `IJwtTokenGenerator.GenerateToken(userDetail.User)` (type `ViperLoginUserResult`, not the shared `OptionC.Base` one), and assigns the resulting JWT onto `userDetail.User.Token` before returning. The JWT itself (`OptionCMicroservice/OptionC.Acutis/IJwtTokenGenerator.cs`) carries exactly three claims — `Email`, `Sub` (=UserId), `Name` (=FullName) — each individually passed through `CommonMethods.EncryptValue` before being placed in the token, 1-day expiry, HMAC-SHA256 signed from `JWTSetting:SecurityKey`. Role/module-right data is **not** in the token; it travels in the HTTP response body as `ModuleRights` (filtered to `UserRight > 0`) and a derived `MenuItems` tree (`AcutisAuthenticationRepository.MapModuleRightsToMenu`, a 4-level parent/link/activity/tab grouping keyed by `LevelId`/`ParentId`/`FeatureID` off the same flat rights rowset). |
| **Proposed CFR_Acutis behavior** | Same request/response shape and same separation of concerns (thin identity-only JWT + rights/menu in the body), reusing the existing `Viper.DoLogin`-equivalent stored procedure and result contract from the shared database (no DB changes — see Database impact). Controller inherits `CFR.Base.BaseController`, uses `MSResultArgs`/`ApiResultArgs` (CFR's naming) in place of `ResultArgs`/`ApiResultArgs` (OptionC's naming) — see [current-state.md](current-state.md) for the exact rename mapping. |
| **Compatibility risk** | Low for the DB/contract shape (identical SP, DTOs can be renamed 1:1). Medium for the token-generator collision: `CFR.Base` already defines `IJwtTokenGenerator.GenerateToken(UserContextData)` (a copy of `OptionC.Base`'s fat-claims SSO variant, per `current-state.md`) — a second, Acutis-specific overload/class must be added without breaking whatever else in `CFR.Base` may come to depend on the existing signature. |
| **Database impact** | None if the same stored procedure (`Viper.DoLogin` or the CFR-side equivalent, if one already exists under a different schema name) is reused as-is per the "reuse existing DB contract" instruction. Needs confirmation in Task 2 that this procedure exists in the target database and returns the same two result sets. |
| **Decision** | **Adapt.** Contract and flow are reusable near-verbatim; naming (`ResultArgs`→`MSResultArgs`, namespace) and the token-generator wiring need CFR-side changes. |

## 2. Logout

| | |
|---|---|
| **Source project** | `FrontEnd/acutis` only — **no backend endpoint exists.** |
| **File path** | `src/app/contexts/AuthProvider.tsx` (`logout()` → `dispatch({type:"LOGOUT"})` → reducer calls `clearAcutisAuth()`); `src/modules/auth/services/LoginAction.ts` (`clearAcutisAuth()` removes `localStorage["acutis_auth_response"]` and deletes the Axios default `Authorization` header); invoked from `src/designSystem/theme/layouts/partials/main/MainHeader.tsx` (a menu item calling `logout`). |
| **Current behavior** | Purely client-side. No `POST .../Logout` call, no server-side token revocation, no refresh-token consumption (confirmed: `GenerateRefreshToken()` exists on the shared `IJwtTokenGenerator` interface but is never called anywhere in the Acutis vertical). The JWT remains valid server-side until its 1-day expiry regardless of client-side logout. |
| **Proposed CFR_Acutis behavior** | Same client-side-only pattern for parity and simplicity (matches the stateless-JWT design), unless the user wants a stronger guarantee (server-side token/session invalidation), which would be a genuinely new capability, not a port. |
| **Compatibility risk** | Low if kept client-side-only (exact port). If a real invalidation mechanism is added later, it changes the token model (needs a blacklist/short-lived-token+refresh scheme) — bigger design decision, out of scope for Task 1. |
| **Database impact** | None for the client-side-only version. |
| **Decision** | **Reuse** (client-side clear-and-redirect pattern) for parity. Server-side invalidation, if wanted, is a **create** — flagged as an open question in [implementation-plan.md](implementation-plan.md). |

## 3. Forgot Password

| | |
|---|---|
| **Source project** | `FrontEnd/acutis` only — **no backend endpoint, and the frontend page is a non-functional stub.** |
| **File path** | `src/modules/auth/pages/ForgotPassword.tsx`; route wired at `src/modules/auth/routes/index.tsx` (`/auth/forgot-password`) |
| **Current behavior** | The page collects and client-side-validates an email address, but `onSubmit` does **not** call any API — it only does `setLoading(true); setTimeout(() => setLoading(false), 1200);`. No network request is issued. There is no corresponding backend controller/service/repository anywhere under `OptionC.Acutis`, `OptionC.AcutisService`, or `OptionC.AcutisInfrastructure` for self-service password-reset-by-email. The only password-reset capability that exists anywhere in the Acutis vertical is **admin-triggered**: `StaffDirectoryController.ResetStaffPassword` (`POST api/v1/StaffDirectory/ResetStaffPassword`, query params `userId, sendTo, sendType`) → `IStaffDirectoryService.ResetPasswordAsync` — generates a random password server-side and emails it via SMTP; this is an administrator resetting *someone else's* password, not a self-service "I forgot my password" flow. |
| **Proposed CFR_Acutis behavior** | A genuinely new self-service flow is required: `POST .../ForgotPassword { email }` → look up the account, generate a signed/expiring reset token, email a reset link, and a corresponding `POST .../ResetPassword { token, newPassword }` endpoint (see §4). The SSO module elsewhere in the reference solution (`OptionCMicroservice/OptionC.SSO/Controllers/EmailSigninController.cs`, its `ForgotPassword`/`PreferredEmail`/`PreferredEmailVerify` actions) implements exactly this *shape* of flow, but for SSO accounts, not Acutis (`Viper`) accounts, and the task explicitly says "Use Acutis authentication, not SSO" — so it should inform the design (token/expiry/email pattern) without being copied wholesale, and without introducing an SSO dependency into Acutis. |
| **Compatibility risk** | Medium: needs a place to persist a reset token/expiry against the Acutis user record. Whether the existing `Viper`-schema user table already has reset-token columns (as the SSO-side `clogin` tables apparently do, per the security-review agent's findings on `EmailSigninController`) is unknown from the Acutis vertical's code alone — must be confirmed against the actual DB schema in Task 2 before deciding whether this is a pure new-endpoint job or also needs new columns. |
| **Database impact** | Likely **needs a new or existing-but-unused column/table** to store a reset token + expiry for Acutis accounts (schema investigation required — not confirmed by this study, and the task says not to modify the database *initially*, so this may force a phased design: build against existing columns if any exist, else flag for a follow-up DB task). |
| **Decision** | **Create.** No usable backend reference exists in the Acutis vertical; the frontend page is a shell to fill in, not a pattern to port. |

## 4. Reset Password

| | |
|---|---|
| **Source project** | None in the Acutis vertical. |
| **File path** | N/A — no `ResetPassword` controller, service, repository, or frontend page exists anywhere under `OptionC.Acutis*` or `FrontEnd/acutis/src/modules/auth`. |
| **Current behavior** | Does not exist. (The SSO vertical has an analogous concept — `EmailSigninController.ValidateLink`/`SaveEmail`/`EmailChangePassword`, which validate a Base64-encoded link and set a new password — but per the task's "Use Acutis authentication, not SSO" rule, this is reference-only inspiration, not a reusable Acutis component. It is also flagged by the earlier security review as having real issues, e.g. new passwords transmitted via GET query string, that should not be repeated regardless of module.) |
| **Proposed CFR_Acutis behavior** | New `POST .../ResetPassword { token, newPassword }` (body, not query string) that validates the token against whatever storage §3 settles on, and updates the Acutis account's password via a stored-procedure call analogous to `Viper.DoLogin`'s write-side counterpart (name TBD — needs schema discovery in Task 2). Needs a corresponding frontend page (`ResetPassword.tsx`), which does not exist in the reference app to copy from either — the reference has no such route registered in `AuthRoutes`. |
| **Compatibility risk** | Same as §3 — depends on schema discovery. |
| **Database impact** | Same as §3 — depends on schema discovery; a new stored procedure for the password write is likely needed even if the reset-token storage already exists, since no such procedure was found referenced anywhere in the Acutis vertical. |
| **Decision** | **Create**, both backend and frontend. |

## 5. Change Password

| | |
|---|---|
| **Source project** | None found in the Acutis vertical (backend or frontend). |
| **File path** | N/A. `src/modules/auth` contains only `Login.tsx` and `ForgotPassword.tsx` — no `ChangePassword.tsx`. No `ChangePassword`-named action exists under `OptionC.Acutis`/`OptionC.AcutisService`/`OptionC.AcutisInfrastructure`. (Contrast: `OptionC.SMS`'s `UserManagementController.UpdateUserPassword` and `EmailSigninController.EmailChangePassword` in SSO both exist for their respective modules, but neither is Acutis.) |
| **Current behavior** | Does not exist for a logged-in Acutis user to change their own password. |
| **Proposed CFR_Acutis behavior** | New `POST .../ChangePassword { currentPassword, newPassword }`, authenticated (requires a valid JWT — current user resolved via `ICurrentUserService`, which already exists in `CFR.CommonService`, see [current-state.md](current-state.md)), verifying `currentPassword` against the stored hash before writing `newPassword`. Needs a new frontend page/form as well — no reference UI to port. |
| **Compatibility risk** | Depends on how the underlying `Viper` user table stores/verifies passwords (hash algorithm, whether verification happens in .NET or entirely inside a stored procedure — the reference `Viper.DoLogin` procedure appears to do password comparison DB-side, based on parameters passed and no visible hashing/compare logic in the .NET repository code). This must be confirmed before designing the change-password write path, since it dictates whether "verify current password" can reuse `Viper.DoLogin` or needs a dedicated verify procedure. |
| **Database impact** | Likely a new or existing-but-unreferenced stored procedure for the password write; no schema change strictly required if a suitable write procedure already exists — needs Task 2 discovery. |
| **Decision** | **Create**, both backend and frontend. |

## 6. Current User

| | |
|---|---|
| **Source project** | Frontend: `OptionCMicroservice/OptionC.Acutis` FrontEnd equivalent is client-state-only. Backend equivalent concept: `ICurrentUserService` pattern used across the *other* verticals (e.g. `OptionC.Component`, `OptionC.eForm`), not specifically wired into Acutis's login response. |
| **File path** | `FrontEnd/acutis/src/app/contexts/AuthContext.tsx` / `AuthProvider.tsx` (frontend "current user" = whatever the last `LoginAuthentication` response put in `localStorage["acutis_auth_response"]`, rehydrated synchronously on app load via `getStoredAcutisAuth()`); no backend `GetCurrentUser`/`Me` endpoint exists under the Acutis vertical. |
| **Current behavior** | There is **no `GET .../CurrentUser` (or `/me`) endpoint** in the Acutis vertical. "Current user" on the frontend is derived entirely from the cached login response (`resultData.user`), not re-fetched from the server on each page load or token refresh — i.e., the frontend trusts its local cache as the source of truth for identity/permissions between logins. |
| **Proposed CFR_Acutis behavior** | Keep the same frontend pattern (avoids an extra round trip on every load) but consider adding a lightweight `GET .../CurrentUser` for the specific cases the reference app doesn't handle well: revalidating a token after a permission change server-side, or restoring state if `localStorage` is cleared but a valid token cookie/header persists elsewhere. This is a genuine gap in the reference design (permissions are baked into a point-in-time cache with no revalidation path), worth deciding deliberately rather than silently importing. |
| **Compatibility risk** | Low — additive; doesn't change the login contract. |
| **Database impact** | If added, reuses whatever query backs the rights/menu portion of `Viper.DoLogin` (likely re-invocable without the credential-check half, or a dedicated lighter procedure — needs Task 2 discovery). |
| **Decision** | **Reuse** the frontend cache-as-current-user pattern (adapt namespaces only). A server-side `GetCurrentUser` endpoint is a **create**, and its necessity is an open design question, not an established reference pattern. |

## 7. Role/Permission-Based Dynamic Menus

| | |
|---|---|
| **Source project** | `OptionCInfrastructure/OptionC.AcutisInfrastructure` (backend shaping); `FrontEnd/acutis` (`AuthContext`, plus a menu-enrichment utility) |
| **File path** | `Repositorys/AcutisAuthentication/AcutisAuthenticationRepository.cs` (`MapModuleRightsToMenu`, static helper); `FrontEnd/acutis/src/app/contexts/AuthContext.tsx` (`AuthState.menuItems: NavGroup[]`, `AuthState.permissions: AcutisModuleRight[]`, `hasPermission(moduleName)`, `hasModuleRole(moduleName, roleId)`); `FrontEnd/acutis/src/app/utilities/ticketMenuNav.ts` (referenced as `enrichNavMenuItems`, invoked on both initial load and every `LOGIN` dispatch — not opened in this pass, only its call sites were confirmed). |
| **Current behavior** | The backend returns a **flat list** of module-right rows (`ViperLoginModuleRightRow`: `ModuleName`, `UserRight`, `RoleId`, `ParentId`, `LevelId`, `FeatureID`, `DisplayOrder`, `IsHideMenu`, `DisplayName`, `RoutingUrl`, `Icon`) from the same `Viper.DoLogin` call as the login credentials check — i.e., rights are fetched once, at login time, not via a separate permissions endpoint. `MapModuleRightsToMenu` groups this flat list into a 4-level tree (`Title`/`Activity`/`Links`/`Btnlinks`/`Tablinks`) using `LevelId` (1/2/4/5) and `ParentId`/`FeatureID` matching, filtering by `UserRight > 0` and `IsHideMenu == 0` for the visible tree (a separate `allowedAllRights` — `UserRight > 0` without the hide filter — feeds the nested `Activity`/`Tablinks` collections). The frontend stores the already-shaped tree plus the flat `ModuleRights` array; `hasPermission`/`hasModuleRole` are simple array lookups against the cached data — no re-check against the server per navigation. |
| **Proposed CFR_Acutis behavior** | Reuse this shape as-is: same flat-rows-in/tree-out contract from the login call, same client-side `hasPermission`/`hasModuleRole` guard pattern. This is the most directly portable piece of the whole feature set — it's DB-driven (whatever rights table the `Viper` procedure already reads) and requires no new backend design, only renaming/repackaging into CFR's namespaces and (if the target DB is the *same* database) zero schema changes. |
| **Compatibility risk** | Low, contingent entirely on the target database having the same or an equivalent rights table/procedure — needs Task 2 confirmation, not assumed here. |
| **Database impact** | None if reusing the existing rights query; this is squarely within the "reuse existing database contract" instruction. |
| **Decision** | **Reuse** (backend shaping logic and frontend context/guard pattern), pending confirmation the underlying rights table/procedure exists in the target database. |

## 8. Protected Routes

| | |
|---|---|
| **Source project** | `FrontEnd/acutis` |
| **File path** | `src/app/routes/ProtectedLayout.tsx`; wired into the router tree at `src/app/routes/index.tsx` (not fully traced in this pass — only `ProtectedLayout.tsx` and its direct usage confirmed) |
| **Current behavior** | A single `ProtectedLayout` component wraps protected route subtrees: reads `isAuthenticated`/`logout` from `useAuth()`; if `!isAuthenticated` it calls `logout()` (redundant — clears already-empty state) and renders `<Navigate to="/auth/login" />`; otherwise renders `<Outlet />`. `isAuthenticated` is simply `!!state.token` from the reducer — a **presence check only**, not an expiry check (see §9 — an expired-but-still-present token is treated as "authenticated" by this guard). No per-route permission gating is visible in this component; permission-based UI hiding happens deeper (menu rendering, presumably individual page/component guards using `hasPermission`, not inspected further in this pass). |
| **Proposed CFR_Acutis behavior** | Reuse the same `ProtectedLayout`/`isAuthenticated`-presence-check pattern for parity, but pair it with a real expiry check (see §9) so a stale token doesn't render protected UI that then fails every API call. |
| **Compatibility risk** | Low structurally; the fix (expiry-aware guard) is additive, not a breaking change to the pattern. |
| **Database impact** | None — purely a frontend routing concern. |
| **Decision** | **Adapt** — reuse the component shape, strengthen the authentication check to include expiry (currently presence-only). |

## 9. Session Expiry and Unauthorized Handling

| | |
|---|---|
| **Source project** | `FrontEnd/acutis` (`AxiosInstance.ts`); backend token validation config in `OptionCMicroservice/OptionC.Base/CommonServiceExtension.cs` (shared JWT bearer setup, applies to all microservices Acutis included, per the earlier security-review agent's findings). |
| **File path** | `src/app/config/AxiosInstance.ts` (response interceptor); `OptionCMicroservice/OptionC.Base/CommonServiceExtension.cs:166-233` (`AddAuthenticationSetup`) and `CommonServiceExtension.cs:28-43` (`DisableAuthenticationPolicy`) |
| **Current behavior** | On any `401` response, the Axios interceptor does **only** `showToast.warning("Unauthorized")` — it does not clear stored auth state, does not call `logout()`, and does not redirect to `/auth/login`. Combined with `ProtectedLayout`'s presence-only check (§8), an expired/invalid token leaves the user sitting on a protected page showing a toast, not actually logged out. On the backend, JWT validation is configured with `ValidateIssuer=false`, `ValidateAudience=false`, `RequireHttpsMetadata=false`, default lifetime validation (so expiry *is* enforced by the token handler itself) — **but** `DisableAuthenticationPolicy` (called from every microservice's `Program.cs`, Acutis included) replaces ASP.NET Core's `IPolicyEvaluator` with one that *always* authenticates and authorizes successfully, regardless of environment (the `if (env.IsDevelopment())`/`else` branches are identical — this was independently confirmed by two separate review passes on the reference repo). In the reference app **today, no request to any Acutis endpoint is actually rejected for an invalid/expired/missing token**, which is also why the frontend's 401-handling gap has gone unnoticed — 401s essentially never occur in practice under this configuration. |
| **Proposed CFR_Acutis behavior** | This is the single most important thing to **not** port as-is. `CFR.Base.CommonServiceExtension.DisableAuthenticationPolicy` (confirmed present in the ongoing repo, same identical-branches bug — see [current-state.md](current-state.md#known-defect-inherited-from-reference)) must not be wired into `CFR.Acutis`'s `Program.cs` if real session-expiry/unauthorized enforcement is a goal, since it would silently defeat everything else built for this feature. Frontend: the Axios interceptor's `401` handler should be extended to clear stored auth (`clearAcutisAuth()`) and redirect to `/auth/login`, and `ProtectedLayout` should check token expiry (decode the JWT `exp` claim, or track a stored expiry timestamp from login) in addition to presence. |
| **Compatibility risk** | High if left unaddressed: this is the one area where "port the reference pattern" would directly reproduce a real bug rather than a merely-incomplete feature. Needs an explicit decision (see [implementation-plan.md](implementation-plan.md)) on whether `DisableAuthenticationPolicy` is dropped for `CFR.Acutis` entirely, gated properly (only in `Development`), or replaced. |
| **Database impact** | None. |
| **Decision** | **Adapt (backend auth-policy wiring) + create (frontend 401/expiry handling)** — do not reuse `DisableAuthenticationPolicy`'s current unconditional-bypass behavior; do not reuse the frontend's toast-only 401 handling. |

## Cross-cutting notes

- **Response envelope naming differs, not shape.** Reference uses `OptionC.Common.ResultArgs`/`ResultArgs<T>` and `BaseController.ApiResultArgs(...)`; the ongoing repo's `CFR.Base.BaseController` already uses the same pattern under the names `MSResultArgs`/`MSResultArgs<T>` (defined in `CFR.DBEngine/MSResultArgs.cs`) — functionally equivalent, just a different type name to target when porting DTOs/services.
- **Route template is identical**: both `BaseController`s use `api/v1/[controller]/[action]` (`OptionC.Common.Constant.ApiRouteConstants.APIController` vs. `CFR.Common.Constant.ApiRouteConstants.APIController`) — endpoint URLs can be ported 1:1 in shape.
- **`ErrorMessages.InvaildLogin`** (sic — misspelled in the reference `OptionC.Common`) — worth deciding in Task 2 whether `CFR.Common` should fix the spelling or intentionally match it for cross-team consistency; not a functional issue either way.
