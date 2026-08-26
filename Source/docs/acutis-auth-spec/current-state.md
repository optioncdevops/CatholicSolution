# Current State — CFR.Acutis and Supporting CFR.* Platform

Scope: exact, source-verified state of the ongoing repo (`D:\Besp Task\GitHub\Catholic_Solution\Source`) as of 2026-08-26, for everything the Acutis-auth work would touch. Nothing here was modified.

## CFR.Acutis (the target microservice)

| | |
|---|---|
| **File path** | `backend\Microservices\CFR.Acutis\` |
| **Current behavior** | Untouched `dotnet new webapi` scaffold. `CFR.Acutis.csproj` — Sdk `Microsoft.NET.Sdk.Web`, `net10.0`, **zero `<ProjectReference>` entries** (not even to `CFR.Base`), single package `Microsoft.AspNetCore.OpenApi`, and an empty `<Folder Include="Controllers\" />` placeholder (the directory doesn't exist on disk yet). `Program.cs` is the generic template: `AddControllers()`, `AddOpenApi()`, `UseHttpsRedirection()`, `UseAuthorization()`, `MapControllers()` — no `AddAuthenticationSetup`, no `AddCommonServicesSetup`, no Swagger/Scalar, no Serilog, no custom middleware. `appsettings.json` has only `Logging`/`AllowedHosts` — **no `JWTSetting` section at all**, no connection string. `appsettings.Development.json` exists but wasn't more informative for auth purposes. |
| **Gap vs. reference** | Total — none of the reference `OptionC.Acutis` host wiring (`UseSecureKestrel`, `ConfigurationLoader.LoadConfiguration`, `AddCommonServicesSetup`, `AddDIServicesSetup`, `AddAuthenticationSetup`, `DisableAuthenticationPolicy`, Serilog, `UseCustomMiddlewareSetup`, Scalar) exists here yet. |
| **Decision** | This project needs `create`-level work to reach parity with the reference host wiring, then `adapt`/`reuse` for the auth-specific pieces detailed in [reference-comparison.md](reference-comparison.md). |

## CFR.Base (platform/shared library — Gateway + would-be microservice host code)

| | |
|---|---|
| **File path** | `backend\Platform\CFR.Base\` |
| **Current behavior** | Already contains close mirrors of the reference `OptionC.Base`: `BaseController.cs` (same `ApiResultArgs`/`GetResponseByStatusCode` pattern, but built on `MSResultArgs`/`MSResultArgs<T>` instead of `ResultArgs`/`ResultArgs<T>`; class-level `[Authorize(...)]` is likewise commented out, same as the reference — `//[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]`), `IJwtTokenGenerator.cs` (interface `GenerateToken(UserContextData)` + `GenerateRefreshToken()`, same fat-claims SSO-style shape as `OptionC.Base`'s — **no Acutis-specific thin-claims overload exists here**, unlike the reference where Acutis has its own project-local generator), `JWTSetting.cs` (identical shape: `SecurityKey`, `AllowOrigin`, `Audience`, `Issuer`, `ScriptPath`), `CommonServiceExtension.cs` (has `AddAuthenticationSetup`, `AddCommonServicesSetup`, `AddSwaggerGenSetup`, `AddRateLimiterSetup`, `ConfigureLocationCounterBasedServices`/`ConfigureKestrelForCertificates`, and `DisableAuthenticationPolicy`). |
| **Known defect inherited from reference** | `DisableAuthenticationPolicy(IServiceCollection, IWebHostEnvironment)` in `CFR.Base\CommonServiceExtension.cs` has the **identical bug** found in the reference `OptionC.Base`: the `if (env.IsDevelopment())` and `else` branches both execute the exact same two lines (`RemoveAll<IPolicyEvaluator>()` + `AddSingleton<IPolicyEvaluator, DisableAuthenticationPolicyEvaluator>()`), so calling this method disables authentication/authorization enforcement **unconditionally, in every environment**, not just Development. It is not currently called from any `Program.cs` in this repo (only the Gateway wires `AddAuthenticationSetup`/`DisableAuthenticationPolicy` per the earlier repo-wide audit) — but it exists, ready to be copied into `CFR.Acutis\Program.cs` the same way the reference wired it into every one of its microservices, which is exactly the trap flagged in [reference-comparison.md §9](reference-comparison.md#9-session-expiry-and-unauthorized-handling). |
| **CORS setup already present** | `AddAuthenticationSetup` in `CFR.Base` (unlike the reference, which reads `JWTSetting:AllowOrigin` to decide) hardcodes `SetIsOriginAllowed(_ => true).AllowAnyMethod().AllowAnyHeader().AllowCredentials()` unconditionally — i.e., it's *always* wildcard-with-credentials regardless of config. This is a pre-existing platform-level choice, not something introduced by this study; flagged here because Acutis auth work would inherit it as-is unless explicitly changed. |
| **Decision** | `CFR.Base` is largely **reuse-ready** for the generic hosting/response-envelope/JWT-bearer-registration plumbing. The Acutis-specific thin-claims token generator must be **created** here or in `CFR.Acutis` directly (reference puts it project-local to Acutis, not in the shared Base project — same placement is recommended to avoid colliding with the existing `UserContextData`-shaped generator). `DisableAuthenticationPolicy` must be **not reused as-is** for `CFR.Acutis` — see [implementation-plan.md](implementation-plan.md). |

## CFR.DBEngine (Dapper data-access layer)

| | |
|---|---|
| **File path** | `backend\Platform\CFR.DBEngine\` |
| **Current behavior** | Contains `DapperHandler.cs`, `DataMapper.cs`, `MSResultArgs.cs`, `ErrorLog.cs`, `EnumCommand.cs`, `DataValueBase.cs` — the same shape as the reference `OptionC.DBEngine` (which the earlier audit confirmed exposes `IDapperHandler` with `QueryAsync`/`QueryMultipleAsync`/`ExecuteScalarAsync`/etc., all Dapper-based, no EF Core in active use). Not read line-by-line in this pass (out of scope for Task 1 beyond confirming the class exists and the project structure matches), but its presence means the *mechanism* the reference `AcutisAuthenticationRepository` uses (`IDapperHandler.QueryMultipleAsync(storedProcName, parameters, CommandType.StoredProcedure)`) has a direct equivalent already available to build against. |
| **Decision** | **Reuse** — no evidence of gaps for what Acutis auth would need (a couple of stored-procedure calls with `DynamicParameters`). |

## CFR.CommonService (shared service-layer helpers)

| | |
|---|---|
| **File path** | `backend\Service\CFR.CommonService\` |
| **Current behavior** | Contains `ICurrentUserService`/`CurrentUserService` (needed for "current user" and the future authenticated `ChangePassword` endpoint — see [reference-comparison.md §5–6](reference-comparison.md#5-change-password)), `CommonMethods.cs` (likely home for a `CFR.CommonService` equivalent of the reference's `CommonMethods.EncryptValue`, used by the reference's Acutis JWT claim encryption — not yet confirmed to contain the same method, needs a direct check in Task 2), `HashEncryption.cs` (relevant to whatever password-hashing approach Change/Reset Password ends up needing), `MailService/SMTPService.cs` + `Services/SMTPMailService.cs` (needed for the Forgot Password email step), `APIActionName.cs` (the `[ActionName(...)]` constant-holder pattern, mirroring the reference's `API_Acutis`/`API_Administration` static classes — confirms the action-name-constant convention is already established here and should be followed, not reinvented). |
| **Decision** | **Reuse** — the building blocks for email dispatch, current-user resolution, and hashing/encryption utilities already exist; Task 2 should verify method-level parity (e.g., does `CommonMethods` here already have an `EncryptValue`-equivalent, or does it need adding) rather than assume it from naming alone. |

## Frontend — no Acutis app exists

| | |
|---|---|
| **File path** | Searched all of `frontend\` (`cfr`, `cfr-admin`, `SaaS_Apps\*`) for anything named/related to "Acutis" — **zero matches.** `frontend\SaaS_Apps\` currently contains: `ai-lesson-plan`, `arc-alerts`, `catholic-content`, `linked-partner-saas` (docs-only), `matt-money`, `optionc-parish`, `optionc-school`, `support-center`, `unified-directory`. None of these is an Acutis-equivalent admin/ops console. |
| **Current behavior** | N/A — does not exist. |
| **Decision** | **Create**, and — per `frontend\CLAUDE.md`'s repository-boundary rule ("Never move a `SaaS_Apps/*` project under `cfr/` or `cfr-admin/`... it gets its own project root") — this almost certainly means a brand-new `frontend\SaaS_Apps\acutis\` (or similarly named) project root, not a folder inside `cfr` or `cfr-admin`. This is a decision for the user to confirm before Task 2 begins — see [implementation-plan.md](implementation-plan.md#open-question-frontend-home). |

## Database

No database inspection was performed in this study (the task explicitly says "study the ongoing CFR_Acutis backend and frontend" and "do not modify the database initially" — code-level comparison only). Every place in [reference-comparison.md](reference-comparison.md) that depends on a specific stored procedure or table (`Viper.DoLogin` and its rights/menu shaping, a would-be password-write procedure, a would-be reset-token store) is marked as **needing confirmation against the actual target database** in Task 2, not assumed to exist or be absent.
