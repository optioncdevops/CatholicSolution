# Catholic Solutions (CFR) — Project Knowledge Document

**Purpose of this document:** a single, evidence-based reference to the architecture, business functionality, data flow, integrations, and testing structure of this repository, so a developer, QA engineer, architect, or AI agent can work on it without re-exploring from scratch. Every claim is grounded in repository evidence with a file path; where evidence was insufficient, the item is marked `Not Found`, `Cannot Be Determined`, or `Requires Business Clarification`. Confidence levels (**High / Medium / Low**) are given for non-trivial conclusions.

All paths are relative to `Source/` unless stated otherwise. Generated 2026-09-17.

> **Correction notice**: this document supersedes two stale claims in the existing `CLAUDE.md` files:
> 1. `Source/CLAUDE.md` says `CFR.Portal` is "scaffolded... no controllers yet." **This is out of date** — `CFR.Portal` has 3 fully working controllers (Administration/AccessRequest, Authentication, CFRLaunch) with full service/repository/DI wiring. See §9.
> 2. `Source/CLAUDE.md` says `Tests/CFR.Acutis.Tests` is "currently empty (no .csproj)." **This is out of date** — it now has a real `.csproj` and a small NUnit API-negative-test suite. See §20.

---

# 1. Project Overview

**Catholic Solutions** (also internally called **CFR**) is a SaaS platform built by **OptionC** (copyright headers throughout, e.g. `backend/Service/CFR.AcutisService/Service/Organization/OrganizationService.cs:1`) serving Catholic dioceses/archdioceses, parishes, Catholic schools, and Catholic ministries/nonprofits. It provides:
- An **end-user portal + "App Hub"** (`frontend/CFR`) where an organization's members log in and launch the suite of Catholic Solutions apps they're entitled to, or request access to new ones.
- A **Super Admin console** (`frontend/CFR_Admin`) where OptionC staff manage organizations, users, products/licenses, access requests, and platform email configuration (email settings/templates, roles/rights).
- A **.NET 10 microservices backend** (`backend/`) fronted by a YARP API gateway, providing the API surface for both frontends and, per checked-in documentation (`Docs/*.docx`), intended to support an embeddable "Universal App Switcher" web component for partner apps (that part of the architecture is **not present** in this repository — see §3 caveat).

The platform appears to have evolved out of **OptionC's pre-existing school/diocese administration system** — legacy permission enums (`DiocesePermissions`, `SchoolPermissions` in `backend/Platform/CFR.DBEngine/EnumCommand.cs:350-461`) and a real data-migration script (`backend/Infrastructure/organization_migration.sql`, merging `optionccom` + `optionccom_ffis` source databases) corroborate this. Confidence: **Medium-High** (inferred from code/schema evidence, not stated as such anywhere).

`CFR` and `Acutis` are used pervasively as namespace/product names but their literal meanings/etymology are **Cannot Be Determined** — never spelled out in any doc or code comment.

---

# 2. Business Domain

**Domain**: Catholic-organization administration SaaS (school/parish/diocese management + a cross-product app marketplace/launcher).

**Main business entities** (see §11 for schema detail):
- **Organization** — the tenant-like entity: a Catholic school, parish, diocese/archdiocese, or ministry/nonprofit (`frontend/CFR_Admin/src/modules/organizations/utils/organizationHelpers.ts:29-35`, `ORG_TYPE_OPTIONS`). Has a status (`active`/`inactive`/`suspended`, enforced by a live SQL Server CHECK constraint referenced in code, `backend/Service/CFR.AcutisService/Service/Organization/OrganizationService.cs:17`).
- **Product / License** — a suite application (e.g. OptionC School, Parish Hub, Matt Money) that an Organization can be assigned/licensed for.
- **User** (Acutis admin-side "Users", distinct from **CFR end-customer users** exposed read-only via `GetCFRUsers`) — an account with a Role and page-level Rights.
- **Access Request** — a workflow entity: an org/individual requests access to one or more products; an admin approves/rejects/asks-for-info.
- **UserRole / UserRights** — role-based, page/module-level access-right matrix (Denied/Access/Read-Only).

**Primary user roles** (see §7 for full detail — **role names beyond "Admin" are not enumerated anywhere as a fixed list**; the system is rights/menu-based, not named-role-based):
- OptionC **Super Admin** staff (via `CFR_Admin` console).
- **Organization member/admin** users of a Catholic organization (via `CFR` end-user portal), who sign in and launch entitled apps.
- **Public/anonymous visitors** who can submit a public "Request Access" form without an account.

**Core business workflows** identified (traced end-to-end in §30):
1. Public/organization access request → admin review → approve/reject → (implied) entitlement grant.
2. Organization onboarding: create org → assign products/licenses → add/manage org users.
3. End-user login → view entitled apps ("Your Apps"/"Available Apps"/"Future Apps") → launch (SSO-style redirect) or request access to a new one.
4. Admin user/role/rights management: create roles, assign page-level rights, manage admin user accounts.
5. Platform configuration: email settings/branding, email templates (with merge tags and test-send).
6. Dashboard/operational-integrity monitoring: KPIs and automatically-detected data-integrity issues (e.g. approved requests with no actual grant).

**Business rules** are detailed in §13.

---

# 3. Repository Structure

```text
CatholicSolution/                                  (repo root)
├── README.md                                       "Catholic Solution SaaS Apps" (one line)
├── Docs/
│   ├── Catholic_Solutions_App.docx                 App Registry / Universal App Switcher dev guide v1.0.0
│   └── Catholic_Solutions_App_Switcher_Developer_Guide_v1.6.7.docx
└── Source/
    ├── CLAUDE.md                                   repo-wide guidance (see correction notice above)
    ├── backend/                                     .NET 10 solution — CatholicSolution.slnx
    │   ├── Platform/          CFR.Base, CFR.Common, CFR.DBEngine       (cross-cutting)
    │   ├── Infrastructure/    CFR.AcutisInfrastructure, CFR.PortalInfrastructure  (Dapper data layer, StoredProc.cs, SQLParams.cs, Models, Scripts/*.sql)
    │   ├── Service/           CFR.AcutisService, CFR.PortalService, CFR.CommonService  (business layer)
    │   ├── Microservices/     CFR.Acutis (full API), CFR.Portal (also full API — see correction notice)
    │   ├── Gateway/           CFR.Gateway (YARP reverse proxy + Swagger/Scalar aggregation)
    │   ├── Tests/             CFR.Acutis.Tests (small NUnit API-negative-test project — see correction notice)
    │   ├── Automation/        Automation.Acutis (Reqnroll/Selenium BDD suite) + Automation.Framework (shared page objects/DB/env support)
    │   └── README.md
    ├── frontend/
    │   ├── CLAUDE.md          documents the "two independent projects, no workspace" boundary
    │   ├── CFR/               end-user portal + App Hub (React 19 + Vite)
    │   ├── CFR_Admin/         Super Admin console (React 19 + Vite)
    │   ├── package-lock.json  (root-level; no root package.json — not a real workspace)
    │   └── README.md
    └── docs/
        └── skillFile/         source-of-truth coding-standard docs, mirrored as Claude Code skills
            ├── backend-api-standards-SKILL.md
            └── frontend-standards-SKILL.md
```

**Not present in this repo** (confirmed by direct search): CI/CD pipeline files (`.github/workflows`, `azure-pipelines.yml`), Dockerfiles/`docker-compose`, any container/orchestration config. See §24.

**Solution/projects** (`backend/CatholicSolution.slnx`): CFR.Base, CFR.Common, CFR.DBEngine, CFR.AcutisInfrastructure, CFR.PortalInfrastructure, CFR.AcutisService, CFR.PortalService, CFR.CommonService, CFR.Acutis, CFR.Portal, CFR.Gateway, CFR.Acutis.Tests, Automation.Acutis, Automation.Framework.

---

# 4. Technology Stack

## Frontend (both `CFR` and `CFR_Admin`, independently)
| Aspect | Technology | Evidence |
|---|---|---|
| Framework | React 19.2.8 | `frontend/CFR/package.json`, `frontend/CFR_Admin/package.json` |
| Language | TypeScript `~6.0.3` (strict), deliberately pinned below npm-stable 7.x | `package.json`; `frontend/CLAUDE.md:59` explains the pin (typescript-eslint v8 warns on TS7) |
| Build tool | Vite ~8.2.1 + `@vitejs/plugin-react` | `package.json` |
| CSS | Tailwind CSS v4 (`@tailwindcss/vite`) + a large hand-written BEM-like design-system stylesheet (`src/shared/designSystem/styles.css`, 6,333 lines) | `frontend/CFR/vite.config.ts`; agent finding |
| Routing | react-router-dom v7 (declarative `<Routes>`, no data router/loaders) | `src/App.tsx` both projects |
| State management | None (no Redux/Zustand/React Query) — local `useState`/`useEffect`/React Context only | confirmed via `package.json` dependency absence |
| Forms | `CFR`: fully manual (`validator/*.ts` files, no library). `CFR_Admin`: `react-hook-form` | `package.json` (`react-hook-form` only in CFR_Admin) |
| HTTP client | `CFR`: hand-rolled `fetch` wrappers (`appAcutisClient.ts`, `appPortalClient.ts`). `CFR_Admin`: `axios` with interceptors (`AxiosInstance.ts`) | agent findings |
| Charts | `recharts` (CFR_Admin dashboard only) | `frontend/CFR_Admin/package.json` |
| Package manager | npm (per-project `package-lock.json`, no workspace) | `frontend/CLAUDE.md` |
| Linting | ESLint 10 + typescript-eslint 8 | `package.json` |

## Backend
| Aspect | Technology | Evidence |
|---|---|---|
| Runtime/Framework | .NET 10, ASP.NET Core Web API | `backend/CatholicSolution.slnx`, `.csproj` `TargetFramework=net10.0` |
| Data access | Dapper (`IDapperHandler`/`DapperHandler`, raw ADO `SqlConnection`) — **not** Entity Framework | `backend/Platform/CFR.DBEngine/DapperHandler.cs` |
| DI | Built-in ASP.NET Core DI (`AddScoped`/`AddTransient`/`AddSingleton` via per-service `ServiceExtension.cs`) | e.g. `backend/Microservices/CFR.Acutis/ServiceExtension.cs` |
| API docs | Swashbuckle (Swagger) + Scalar (`MapScalarForSwashbuckle`) | `backend/Microservices/CFR.Acutis/Program.cs` |
| AuthN | Custom JWT bearer (HMAC-SHA256, self-issued) — **effectively neutralized**, see §15 Critical Finding | `backend/Platform/CFR.Base/CommonServiceExtension.cs` |
| Background jobs | Hangfire infrastructure exists in `CFR.Base` but is **not wired into any microservice** — zero concrete jobs | `backend/Platform/CFR.Base/Hangfire/**` |
| Reverse proxy | YARP (`CFR.Gateway`) | `backend/Gateway/CFR.Gateway/Program.cs` |
| Logging | Serilog-style call sites (`AppLogger`, `Log.Information`) exist throughout, but the Serilog pipeline itself appears **not wired** in `Program.cs` (commented out) — see §18 | `backend/Microservices/CFR.Acutis/Program.cs:33` (commented `AddSerilogConfiguration`) |
| Mail | Custom SMTP wrapper (`SMTPMailService`, raw `SmtpClient`/hand-rolled `TcpClient`/`SslStream` handshake for connection testing) | `backend/Service/CFR.CommonService/Services/SMTPMailService.cs` |
| File storage | Local disk (`FileHandlerService`) + an Azure Blob Storage wrapper (`CloudFileStorage.cs`, presence confirmed, active usage **not verified**) | `backend/Service/CFR.CommonService/Services/*` |

## Database
| Aspect | Detail | Evidence |
|---|---|---|
| Type | Microsoft SQL Server | connection strings (`Microsoft.Data.SqlClient`), `.sql` scripts use T-SQL syntax |
| Version | Live/Pilot/Staging point at `192.168.1.7\MSSQL2022` (SQL Server 2022 named instance) | `Microservices/CFR.Acutis/appsettings.{Pilot,Staging,Live}.json` (host name only cited; credentials omitted) |
| ORM | None — raw Dapper + stored procedures | `DapperHandler.cs` |
| Migrations | No formal migration framework (no EF Migrations/Flyway/DbUp) — incremental hand-numbered `.sql` scripts (`00N_*.sql`) checked in per infrastructure project | `Infrastructure/CFR.AcutisInfrastructure/Scripts/*.sql` (17 files), `CFR.PortalInfrastructure/Scripts/*.sql` (4 files) |
| Schema completeness in-repo | Only **3** `CREATE TABLE` statements exist in the whole repo (`auth.CFRLaunch`, and a rebuild of `core.Organization` + `lic.OrganizationProduct`) — most referenced tables pre-exist in the live DB and are not defined in-repo | grep across `backend/` confirmed 3 hits total |

## Testing
| Layer | Framework | Evidence |
|---|---|---|
| Backend API negative tests | NUnit 4.4.0 + plain `HttpClient` | `backend/Tests/CFR.Acutis.Tests/CFR.Acutis.Tests.csproj` |
| Backend/UI BDD automation | Reqnroll.NUnit (SpecFlow successor) + Selenium WebDriver (Chrome only) + ExtentReports | `backend/Automation/Automation.Acutis/Automation.Acutis.csproj` |
| Frontend unit/integration | **None** — no Vitest/Jest, no test files anywhere in either frontend project | confirmed via exhaustive glob/grep in both agent passes |
| Mocking | None found (no Moq/NSubstitute in backend `.csproj` files) | **Not Found** |

## DevOps
| Aspect | Status | Evidence |
|---|---|---|
| CI/CD | **Not Found** — no `.github/workflows`, no `azure-pipelines.yml`, no Jenkinsfile anywhere in the repo | direct search, this session |
| Containers | **Not Found** — no Dockerfile/`docker-compose.yml` | direct search, this session |
| Hosting model (inferred) | IIS on Windows — `ApplicationFilePath:Doc_BasePath` in Pilot/Staging/Live points to `C:\inetpub\catholicsolution\cfrapi.allnewoptionc.com\wwwroot`; `Gateway/CFR.Gateway/Program.cs` has IIS-specific `wwwroot`-exists workaround | `Microservices/CFR.Acutis/appsettings.{Pilot,Staging,Live}.json`; `Gateway/CFR.Gateway/Program.cs:16-17` |
| Cloud services | Azure Blob Storage wrapper present (`CloudFileStorage.cs`) but usage not confirmed active | Medium confidence |
| Deployment automation | `.pubxml` publish profiles exist per project (`Properties/PublishProfiles/`) — manual/Visual-Studio-driven publish, not scripted CI/CD | e.g. `Microservices/CFR.Acutis/Properties/PublishProfiles/` |

---

# 5. Application Architecture

**Pattern**: Layered / N-tier architecture per microservice (Controller → Service → Repository → Stored Procedure), with a thin API Gateway (YARP) in front. This is **not** Clean/Onion architecture (no domain-entity-centric core with inverted dependencies) and **not** CQRS/event-driven (no command/query buses, no message broker found). It is a conventional **modular monolith split into two deployable microservices** (Acutis, Portal) behind a Gateway — "microservices" in deployment topology, but the two services share almost all cross-cutting infrastructure (`CFR.Base`, `CFR.Common`, `CFR.DBEngine`) as compiled libraries rather than through network calls, so they are tightly coupled at the library level even though independently hostable. Confidence: **High**.

Verified real request flow (not just folder-name pattern-matching — traced actual code in agent passes):

```text
Client (CFR / CFR_Admin React app)
 ↓  fetch/axios → CFR.Gateway (YARP, path-prefix routed: /acutis/**, /portal/**)
 ↓  prefix stripped, forwarded to upstream origin
{Feature}Controller   (HTTP concern only; one-line `return ApiResultArgs(await service.XAsync(...), APIHttpType.X)`; BaseController)
 ↓
I{Feature}Service      (the ONLY layer with try/catch; Serilog-style logging via AppLogger; builds/normalizes MSResultArgs; maps SP sentinel return codes to ErrorCodes)
 ↓
I{Feature}Repository   (no try/catch; builds Dapper DynamicParameters incl. an @ActionId discriminator; one-line IDapperHandler call)
 ↓
SQL Server stored procedure (schema-qualified, e.g. [dbo].[Acutis_Users], [request].[AccessRequestManage])
 ↓
MSResultArgs<T> flows back up unchanged in shape, mapped to HTTP status/body by BaseController.ApiResultArgs / ResultArgsHandler
```

Two frontends are both thin clients: no server-side rendering, no BFF layer of their own — they call the Gateway directly. There is no shared frontend package/workspace (`frontend/CLAUDE.md`), so each React app independently re-implements its API client, auth, and design system.

Dependency direction between backend projects (compile-time, from `.csproj` `ProjectReference`s traced in agent passes): `Microservices/*` → `Service/*` → `Infrastructure/*` → `Platform/CFR.DBEngine`, and all layers reference `Platform/CFR.Common`/`CFR.Base` for cross-cutting concerns. `Gateway/CFR.Gateway` depends only on `Platform/CFR.Base` (for shared service/app extensions) — it does not reference any Service/Infrastructure project, consistent with it being a pure reverse proxy.

**Caveat on the documented "App Registry / App Switcher" architecture**: the two Word docs in `Docs/` describe a monorepo (`packages/app-registry`, `packages/app-switcher`, `apps/cfr`, `apps/platform-admin`) and an embeddable `<catholic-solutions-app-switcher>` web component for partner sites. **None of this exists in the current `Source/` tree** (confirmed: no `packages/` or `apps/` folders, no web-component build). Treat the docx content as an aspirational/external target architecture, not the current implementation. Confidence: **High** (direct structural comparison).

---

# 6. Module & Feature Inventory

| Module | Purpose | Main Users | Frontend | Backend/API | Database | Tests |
|---|---|---|---|---|---|---|
| Authentication (Acutis) | Admin-console login, JWT issuance | OptionC admin staff | `CFR_Admin/src/shared/auth`, `src/modules/*` login pages | `AcutisLoginController` (`CFR.Acutis`) | `[dbo].[Acutis_DoLogin]` | `Login.feature` |
| Authentication (Portal) | End-user portal login | Org members | `CFR/src/modules/authentication` | `PortalLoginController` (`CFR.Portal`) | `[dbo].[Portal_DoLogin]` | Not Found (no CFR-portal-specific automation) |
| Password self-service | Forgot/Reset/Change password | Both user bases | `ForgotPasswordPage`, `ResetPasswordPage`, admin `ChangePassword` | `AcutisPasswordController`, `ProfileController.ChangePassword` | `[dbo].[Acutis_PasswordReset]`, `[dbo].[Acutis_Profile]` | `ChangePassword.feature`, `ForgotPassword.feature`, `ResetPassword.feature` (env/mutation-gated) |
| Access Requests | Org/individual requests access to product(s); admin approves/rejects | Public visitors, org members, admins | `CFR/src/modules/requests`, `RequestAccessPage`, `RequestInterestModal`; `CFR_Admin/src/modules/requests` | `AccessRequestController` (Acutis: get/status; Portal: get/save) | `[request].[AccessRequestManage]` | `AdminAccessRequests.feature` (listing/filters only — no approve/reject scenario) |
| App Hub / Product Launch | Browse entitled/available apps, launch via SSO redirect | Org members | `CFR/src/modules/productlaunch` | `CFRLaunchController` (Portal) | `[dbo].[Portal_CFRLaunch]`, `[auth].[CFRLaunch]` (one-time launch code table) | **No coverage found** |
| Products catalog (public) | List products for pre-auth screens | Public/anon | `CFR/src/modules/products` | `ProductsController.GetProducts` (`[AllowAnonymous]`) | `[dbo].[Acutis_Products]` | Indirectly via `Product.feature` (admin side) |
| Products/Licenses (admin) | Manage product catalog, licenses, customers | Admins | `CFR_Admin/src/modules/cfrproducts` | `ProductsController` (full CRUD) | `[dbo].[Acutis_Products]` | `Product.feature` |
| Organizations | Manage Catholic-org accounts, product assignment, licenses, members | Admins | `CFR_Admin/src/modules/organizations` | `OrganizationController` (`[Authorize]`) | `[dbo].[Acutis_Organization]`, `core.Organization`, `lic.OrganizationProduct` | `Organization.feature` |
| Users (admin accounts) | Manage internal admin user accounts | Admins | `CFR_Admin/src/modules/users` | `UsersController` | `[dbo].[Acutis_Users]` | `UserDetails.feature` |
| CFR Users (directory) | Read-only directory of end-customer users across orgs | Admins | `CFR_Admin/src/modules/cfrUsers` | `UsersController.GetCFRUsers` | `[dbo].[Acutis_CFRUsers]` | Not Found |
| User Roles | CRUD roles | Admins | `CFR_Admin/src/modules/administration/userRoles` | `UserRolesController` (`[Authorize]`) | `[dbo].[Acutis_UserRoles]` | `UserRoles.feature` |
| User Rights | Page/module access-right matrix per role (legacy) | Admins | `CFR_Admin/src/modules/administration/userRights` | `UserRightsController` | `[auth].[GetRightByRoleId]`, `[auth].[SaveUserRights]` | `UserRights.feature` |
| Email Templates | Manage transactional email templates + merge tags | Admins | `CFR_Admin/src/modules/administration/emailTemplates` | `EmailTemplatesController` | `[dbo].[Acutis_EmailTemplates]` | `EmailTemplates.feature` |
| Email Settings | SMTP config + branding (logo/colors/fonts) | Admins | `CFR_Admin/src/modules/administration/emailSettings` | `EmailSettingsController` | File-based (`_configurationSettings.json`), not DB | `EmailSettings.feature` |
| Profile | Self-service profile edit | Any authenticated user | `CFR_Admin/src/modules/administration` (profile page) | `ProfileController` (`[Authorize]`) | `[dbo].[Acutis_Profile]` | Not Found (dedicated); indirectly via ChangePassword |
| Dashboard | Platform KPIs, integrity alerts, trend charts | Admins | `CFR_Admin/src/modules/dashboard` | `DashboardController` | `[dbo].[Acutis_Dashboard]` | **No dedicated coverage** (only "dashboard opens" smoke checks) |

---

# 7. User Roles & Permissions

**Confirmed mechanism**: access control is **not** a small fixed enum of named roles with hard-coded permissions. It is a **rights-matrix system**: a `UserRole` (admin-defined, CRUD via `UserRolesController`) is linked to a per-page/module **Right** (`Denied=0`, `Access=1`, `Read Only=2`) computed at login time and embedded in the login response's `moduleRights`/`menuRights` payload (`backend` `[dbo].[Acutis_DoLogin]` joins rights; frontend `useFeatureAccessLevel.ts` consumes it). Confidence: **High**.

**How authentication works**:
- Custom JWT (HMAC-SHA256), issued by `AcutisJwtTokenGenerator`/`PortalJwtTokenGenerator`, `Expires = UtcNow.AddDays(1)`. No refresh-token flow is actually implemented (a `RefreshToken` field exists in the model but is never populated). Confidence: **High**.
- Claims: `Email`/`Sub`/`Name` are encrypted (`EncryptionHelper.EncryptValue`); plaintext custom claims for `UserId`/`UserName`/`FirstName`/`LastName`/`RoleId`.
- No MFA/OTP found anywhere. No password-policy enforcement found server-side beyond what the frontend's manual `passwordScore` check implies client-side (`CFR/src/modules/authentication/ResetPasswordPage.tsx`) — **Cannot Be Determined** whether the backend independently enforces a password policy (not inspected at that depth).
- Frontend auth is **not real SSO** in either app today: both use a `cs_platform_preview_session` cookie (`CFR`) or a JWT stored in `localStorage`/`sessionStorage` plus the same preview cookie for central-login parity (`CFR_Admin`). Both apps' `appAuthConfig.ts` set `authMode: 'mock'` (dev) / `'preview'` (hosted), never `'sso'` — the SSO code path exists but is unreachable in current configs. This is **by design during a prototype phase**, per explicit code comments, not an oversight — but see §15 for the more serious backend-side authorization gap.

**Frontend authorization (CFR_Admin only)**: route-level gating via `isAdminRouteAllowed()` (menu-tree membership) plus per-page `useFeatureAccessLevel()` (`access`/`readOnly`/`denied`) that disables mutating UI controls. **Rights are cached at login — a rights change does not take effect until the affected user's next sign-in** (explicit code comments in `useFeatureAccessLevel.ts` and `menuHelpers.ts`). CFR (end-user app) has no equivalent per-feature rights system — it is authenticated-or-not only (`ProtectedRoute`).

**Backend authorization**: `[Authorize]` is present on only 3 of 12+ Acutis controllers (`UserRolesController`, `OrganizationController`, `ProfileController`); the rest rely on convention rather than enforced middleware. **Critical**: even where `[Authorize]` is applied, a custom `IPolicyEvaluator` (`DisableAuthenticationPolicyEvaluator`) unconditionally returns success for both authentication and authorization in **every environment**, neutralizing `[Authorize]` entirely at the framework level. See §15/§19 for full detail. Confidence: **High**.

| Role/Persona | Module | View | Create | Edit | Delete | Approve | Special Permissions |
|---|---|---|---|---|---|---|---|
| OptionC Admin (rights-matrix–gated) | Organizations, Products, Users, Roles, Requests, Email Settings/Templates | Per rights matrix (`access`) | Per rights matrix | Per rights matrix (`readOnly` disables) | Per rights matrix | Access Requests (Approve/Reject/Info) | Full console access if granted `access` on all modules |
| Org member (Portal) | App Hub only | View entitled/available/future apps | Submit access request | own profile only (**Cannot Be Determined** — no dedicated profile screen found in `CFR`) | — | — | Launch entitled apps via SSO redirect |
| Public/anonymous | Public Request-Access form, public product catalog | View products, submit request | Submit access request | — | — | — | No login required |

`Requires Business Clarification`: the exact set of named business roles (e.g. "Org Admin" vs "Org Member" distinctions within an organization) is **not evidenced in code** — the platform appears to only distinguish Acutis admin accounts (with roles/rights) from generic "CFR users"/org members with no further role granularity found.

---

# 8. Frontend Architecture

Two independent SPAs, structurally identical in approach (per the "no shared workspace" boundary in `frontend/CLAUDE.md`), each following the feature-folder convention mandated by `docs/skillFile/frontend-standards-SKILL.md` (`pages/`, `partials/`, `types/`, `utils/`, `validator/`, `services/`, `routes/`, `index.ts` per module).

**CFR (end-user portal + App Hub)**
- Entry: `src/main.tsx` → `BrowserRouter` → `AuthProvider` → `UserProvider` → `ToastProvider` → `App`.
- Routes: `/login`, `/forgot-password`, `/reset-password`, `/logout`, `/request-access` (public); `/apps` (protected, the entire App Hub).
- Modules: `authentication` (login re-export + Request Access form), `productlaunch` (the App Hub itself — Your/Available/Future apps, launch, request-interest modal), `products` (data-only service layer), `requests` (data-only service layer for access requests).
- No component library dependency — hand-rolled inline-SVG icon set (`UiIcons.tsx`), 13 shared components in `src/shared/app/components/` (3 of which — `DashboardHeader`, `KpiCard`, `PanelHeader` — are **dead code**, never imported).
- Design system: one 6,333-line hand-written CSS file + Tailwind utility classes mixed in JSX (hybrid approach).

**CFR_Admin (Super Admin console)**
- Entry: same pattern, plus dev-only preloader-dismiss logic and `AdminDataProvider`/`AdminShell` wrapping all protected routes.
- Modules: `administration` (userRoles, userRights, emailTemplates, emailSettings sub-features), `cfrproducts`, `cfrUsers`, `dashboard`, `organizations`, `requests`, `users`, plus shared `components`/`lib`/`utils`.
- Larger, more mature component catalog under `src/app/components/*` (buttons, `DataTable` incl. server-side/expandable variants, rich form controls incl. rich-text editor/file-upload/color-picker, `BaseModal`, tabs, tree view) — this is the catalog the frontend skill file's naming (`CommonButton`, `CustomDataTable`, etc.) refers to.
- **Legacy mock data still live**: `AdminDataContext`/`AdminDataProvider` (`src/modules/AdminDataContext.tsx`, `mockData.ts`) is still mounted app-wide and still consumed by at least one real page (`cfrproducts/pages/LicenseDetails.tsx`) instead of a real API call — a genuine inconsistency, not merely legacy dead code. Confidence: **High**.

**State management** (both apps): no global state library. Data fetching is manual `useEffect`/`useState`/try-catch per page, errors surfaced via a shared toast component. **CFR_Admin** additionally uses `react-hook-form` for form state/validation; **CFR** validates manually via dedicated `validator/*.ts` files.

**Permissions affecting UI**: only `CFR_Admin` has rights-driven UI (read-only banners, disabled mutating controls) — see §7.

---

# 9. Backend Architecture

**CFR.Acutis** (`Microservices/CFR.Acutis`) — the larger, reference-implementation microservice. Modules/controllers: AcutisAuthentication (Login, Password), Administration (AccessRequest, EmailSettings, EmailTemplates, UserRights, UserRoles, Users), Dashboard, Organization, Products, Profile. Full endpoint inventory in §10.

**CFR.Portal** (`Microservices/CFR.Portal`) — **contrary to the stale `Source/CLAUDE.md` claim**, this is a working microservice with 3 controllers: `Administration/AccessRequestController` (`GetHubProducts`, `SaveAccessRequest`), `Authentication/PortalLoginController` (`LoginAuthentication`), `CFRLaunch/CFRLaunchController` (`GetAssignedProducts`, `LaunchProduct`, `ExchangeToken`). All wired through `ServiceExtension.cs` with real Service/Repository implementations. Confidence: **High** (git history: controllers predate the last CLAUDE.md edit, per agent's `git log` check).

**CFR.Gateway** — YARP reverse proxy, config-driven routing (`Gateway:Services` section) mapping `/acutis/**` and `/portal/**` to each microservice's upstream origin, with prefix-stripping transforms. Also aggregates both microservices' Swagger/Scalar docs into one UI. Rate limiting and response caching are configured here (not on the microservices themselves).

**Platform layer** (`CFR.Base`, `CFR.Common`, `CFR.DBEngine`) — shared: `BaseController` (the `ApiResultArgs` response-shaping funnel every controller action uses), JWT/CORS/auth setup, Serilog/Hangfire/rate-limiting *infrastructure* (much of it unwired — see §5/§18), `ConfigurationLoader`, `ErrorCodes`/`ErrorMessages`/`MessageCatalog`, `MSResultArgs`/`IDapperHandler`.

**Every controller action is a one-liner**: `return ApiResultArgs(await _service.XAsync(...), APIHttpType.X);` — this is enforced by the coding standard (`backend-api-standards-SKILL.md`) and confirmed as actual practice across every controller inspected. All business logic and error handling lives in the Service layer; Repositories are pure data-access with no error handling (per design — the SP itself/its ActionId discriminator is the unit of business operation).

**Background jobs**: Hangfire infrastructure (`Platform/CFR.Base/Hangfire/**`) is comprehensive (dashboard, health check, recurring-job registrar interface, correlation-id/queue-name plumbing) but **entirely unused** — no `AddHangfireInfrastructure`/`UseHangfireInfrastructure` call site exists in any `Program.cs`, and zero concrete job classes exist. Its own README describes it as ported from a different prior project ("LNTHCIApps"). Confidence: **High**.

---

# 10. API Inventory

All routes: `api/v1/{Controller}/{Action}` (`BaseController` route template, `Platform/CFR.Common/Constant.cs:18`). All responses go through `BaseController.ApiResultArgs`, envelope `{statusCode, statusMessage, resultData, errors, traceId, timestamp}`.

## CFR.Acutis

### AcutisAuthentication
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `AcutisLogin/LoginAuthentication` | Authenticate admin user, issue JWT | `[AllowAnonymous]` |
| POST | `AcutisPassword/ForgotPassword` | Issue reset-token email | `[AllowAnonymous]` |
| PUT | `AcutisPassword/ResetPassword` | Complete reset with token | `[AllowAnonymous]` |
| GET | `AcutisPassword/ValidateResetToken` | Validate reset token pre-submit | `[AllowAnonymous]` |

### Administration
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `AccessRequest/GetAccessRequests` | List access requests |
| GET | `AccessRequest/GetAccessRequestById` | Fetch one |
| PUT | `AccessRequest/UpdateAccessRequestStatus` | Approve/reject/info-request |
| GET | `EmailSettings/GetEmailSettings` | Read SMTP/branding config (file-based) |
| GET | `EmailSettings/GetEmailLogo` | Stream logo image (`[AllowAnonymous]`) |
| POST | `EmailSettings/SaveEmailSettings` | Persist SMTP/branding |
| POST | `EmailSettings/UploadEmailLogo` | Upload logo (≤2MB, jpg/png) |
| POST | `EmailSettings/RemoveEmailLogo` | Clear logo |
| POST | `EmailSettings/TestConnection` | Verify SMTP connectivity |
| GET | `EmailTemplates/GetEmailTemplates` | List templates |
| GET | `EmailTemplates/GetEmailTemplateById` | Fetch one |
| POST | `EmailTemplates/SaveEmailTemplate` | Create/update |
| POST | `EmailTemplates/SendTestEmail` | Send test email |
| GET | `UserRights/GetUserRights` | Access matrix for role+module (legacy `[auth]` schema SP) |
| POST | `UserRights/SaveUserRights` | Persist access matrix |
| GET | `UserRoles/GetUserRoles` | List roles (`[Authorize]`) |
| GET | `UserRoles/GetUserRoleById` | Fetch one |
| POST | `UserRoles/SaveUserRole` | Create/update (409 on dup name) |
| PUT | `UserRoles/UpdateUserRoleStatus` | Activate/deactivate |
| DELETE | `UserRoles/DeleteUserRole` | Soft-delete (409 if assigned) |
| GET | `Users/GetUsers` | List Acutis (admin) users |
| GET | `Users/GetUserById` | Fetch one |
| GET | `Users/GetUserLookups` | Org/role dropdowns |
| GET | `Users/GetCFRUsers` | End-customer membership rows across orgs |
| POST | `Users/SaveUser` | Create/update (409 on dup email) |
| PUT | `Users/UpdateUserStatus` | Activate/deactivate |
| DELETE | `Users/DeleteUser` | Soft-delete |

### Dashboard
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `Dashboard/GetDashboardSummary` | KPIs, integrity metrics, trend events (`startDate`/`endDate`) |
| GET | `Dashboard/GetIntegrityIssueDetail` | Drill-down rows behind one integrity KPI (`issueKey`) |

### Organization (`[Authorize]`, but see §15 — not actually enforced)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `Organization/GetOrganizations` | List |
| GET | `Organization/GetOrganizationById` | Fetch one |
| GET | `Organization/GetOrganizationUsers` | Users linked to org |
| GET | `Organization/GetOrganizationProducts` | Products assigned |
| GET | `Organization/GetOrganizationUserDetail` | Membership + effective access |
| GET | `Organization/GetAssignableProducts` | Unassigned products for org |
| GET | `Organization/GetOrganizationLicenses` | Licenses for org |
| GET | `Organization/GetAllLicenses` | Every license, all orgs |
| POST | `Organization/CreateOrganization` | Add org |
| POST | `Organization/AssignOrganizationProduct` | Grant product access |
| DELETE | `Organization/RemoveOrganizationProduct` | Revoke product |
| DELETE | `Organization/UnlinkOrganizationUser` | Remove user from org |
| PUT | `Organization/UpdateOrganization` | Update identity fields |

### Products
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `Products/GetProducts` | List | `[AllowAnonymous]` |
| GET | `Products/GetProductById` | Fetch one | |
| GET | `Products/GetLicenseDetails` | Product's licenses | |
| GET | `Products/GetLicenseById` | Fetch one license | |
| GET | `Products/GetProductLogo` | Stream logo | `[AllowAnonymous]` |
| GET | `Products/GetProductCustomers` | Orgs assigned to product | |
| GET | `Products/GetProductAssignmentSummary` | Per-product assignment counts | |
| POST | `Products/CreateLicense` | New license | |
| PUT | `Products/UpdateProduct` | Update fields | |
| PUT | `Products/UpdateProductLogo` | Replace logo | |
| PUT | `Products/UpdateLicense` | Update license | |
| DELETE | `Products/DeleteLicense` | Soft-delete license | |

### Profile (`[Authorize]`, see §15)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `Profile/GetProfile` | Own profile |
| PUT | `Profile/UpdateProfile` | Update fields + photo |
| PUT | `Profile/ChangePassword` | Change own password |

## CFR.Portal
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `AccessRequest/GetHubProducts` | List requestable products (Hub) | |
| POST | `AccessRequest/SaveAccessRequest` | Submit access request | `[AllowAnonymous]` |
| POST | `PortalLogin/LoginAuthentication` | Authenticate end-user, issue JWT | `[AllowAnonymous]` |
| GET | `CFRLaunch/GetAssignedProducts` | List entitled/available apps for signed-in user | |
| POST | `CFRLaunch/LaunchProduct` | Get one-time launch URL | |
| POST | `CFRLaunch/ExchangeToken` | Exchange one-time launch code | `[AllowAnonymous]` |

**Orphaned frontend call**: `CFR_Admin/src/modules/requests/services/requestsService.ts` defines `saveAccessRequest()` (POST `AccessRequest/SaveAccessRequest`) but **no such action exists on the Acutis `AccessRequestController`** (only on Portal's), and nothing in `CFR_Admin` calls this function — dead/orphaned code that would 404 if invoked. Confidence: **High**.

---

# 11. Database Architecture

**No ORM; no full schema DDL in-repo.** The database is Microsoft SQL Server, accessed exclusively through stored procedures via Dapper. Only 3 `CREATE TABLE` statements exist anywhere in the backend tree; everything else is inferred from `FROM`/`JOIN`/`ALTER TABLE` statements in the incremental `Scripts/*.sql` files and from repository/DTO code. Treat the following as **Medium confidence reconstruction**, not verified live schema.

### Tables created in-repo
| Table | Script | Key columns |
|---|---|---|
| `[auth].[CFRLaunch]` | `CFR.PortalInfrastructure/Scripts/001_Portal_Sso.sql` | `LaunchId` PK identity, `CFRUserId`, `ProductId`, `CodeHash` (unique, CHAR(64)), `CreatedAt`/`ExpiresAt`/`UsedAt`, `IsUsed`, `InsertedBy` — a one-time SSO launch-code table |
| `[core].[Organization]` (rebuilt) | `CFR.AcutisInfrastructure/Scripts/016_Acutis_Organization_Rebuild.sql` | `ID` PK identity (replacing a prior manual BIGINT `OrgId`), `OrgName`, `OrgState`/`OrgCountry`, `ContactEmail`/`Website`/`ContactPerson`/`ContactPhone`, audit (`InsertedDate/By`, `UpdatedDate/By`), `IsDeleted` |
| `[lic].[OrganizationProduct]` (rebuilt) | same file | `OrganizationProductId` PK identity, FK `CFROrgId → core.Organization.ID`, `ProductOrgId`, `ProductId`, `AssignStatus`, `AssignedBy`, `Remarks`, `ActiveStartDate/EndDate`, `IsDeleted` |

### Tables referenced (pre-existing in live DB, reconstructed from SP/script references)
| Schema | Tables |
|---|---|
| `auth` | `AcutisRole`, `AcutisUser`, `CFRLaunch`, `ModuleFeatures`, `ModuleRights`, `OrganizationUser`, `PasswordResetToken`, `User`, `UserProduct` |
| `core` | `Organization`, `Product`, `ProductEnvironment`, `ProductFeature` |
| `lic` | `License`, `OrganizationProduct`, `ProductAccessLog` |
| `request` | `AccessRequest`, `AccessRequestComment`, `AccessRequestProduct`, `AccessRequestStatusHistory` |
| `adm` | `EmailTemplate` |

### Relationships (reconstructed)
```text
core.Organization
 ├── lic.OrganizationProduct  (→ core.Product, license/assignment status)
 │     └── lic.License
 ├── auth.OrganizationUser    (→ auth.User)
 └── request.AccessRequest*   (org-scoped or public access requests)

auth.User
 ├── auth.UserProduct   (RoleId 4 or 9 = "canRequest", per frontend comment)
 ├── auth.AcutisRole → auth.ModuleRights → auth.ModuleFeatures  (rights matrix)
 └── auth.PasswordResetToken

core.Product
 ├── core.ProductEnvironment
 ├── core.ProductFeature
 └── lic.License / lic.OrganizationProduct / lic.ProductAccessLog

request.AccessRequest
 ├── request.AccessRequestProduct (1 request : many products, for public multi-app requests)
 ├── request.AccessRequestStatusHistory
 └── request.AccessRequestComment
```

Real FK constraints confirmed to exist live (discovered via `sys.foreign_keys`, documented in `016_Acutis_Organization_Rebuild.sql` comments but **not declared anywhere in-repo**): `FK_License_OrganizationProduct`, `FK_UserProduct_Organization`, `FK_ProductAccessLog_Organization`.

### Stored procedures (module-organized, ActionId-discriminated)
| SP | Module | ActionId scheme |
|---|---|---|
| `[dbo].[Acutis_DoLogin]` | Auth | single-purpose, no ActionId |
| `[dbo].[Acutis_PasswordReset]` | Auth | has ActionId (reset flow only) |
| `[dbo].[Acutis_Profile]` | Profile | 1=get, 2=update, 3=change-password |
| `[dbo].[Acutis_Users]` | Administration | 1=save, 2=status, 3=get-by-id, 4=list, 5=lookups, **6=delete** |
| `[dbo].[Acutis_UserRoles]` | Administration | roles CRUD (exact numbering not fully enumerated by agent pass) |
| `[dbo].[Acutis_GetFeatureAccessRight]` | Administration | per-role/page access check |
| `[dbo].[Acutis_EmailTemplates]` | Administration | templates CRUD |
| `[dbo].[Acutis_CFRUsers]` | Administration | CFR user directory (read) |
| `[auth].[GetRightByRoleId]` / `[auth].[SaveUserRights]` | Administration (legacy) | not ActionId-based; legacy `[auth]` schema, SPs not checked into repo scripts |
| `[request].[AccessRequestManage]` | Requests | 1=save, 2=status, 3=get-by-id, 4=list, 5=recipients-by-product, 6=hub-products-by-email |
| `[dbo].[Acutis_Organization]` | Organization | 1=list, 2=get-by-id, 3=update, 4=create, 5=org-users, 6=org-products, 7=assignable-products, 8=assign-product, 9=remove-product, 10=licenses, 11=all-licenses, 13=unlink-user, 14=user-detail |
| `[dbo].[Acutis_Products]` | Products | 11 actions via `EnumCommand.DefaultValues` enum (not raw ints) |
| `[dbo].[Acutis_Dashboard]` | Dashboard | 1=summary, 2=integrity-issue-detail |
| `[dbo].[Portal_DoLogin]` | Portal Auth | single-purpose |
| `[dbo].[Portal_CFRLaunch]` | Portal | 1=get-assigned-products, 2=create-launch, 3=exchange-code |

**Note for the doc**: the "ActionId 1=save,2=status,3=get,4=list,5=lookups" pattern documented in `Source/CLAUDE.md` is real but is the numbering for *`Acutis_Users` specifically* (which actually has a 6th action, delete) — other modules use their own independent numbering or an enum. Do not assume a single universal numbering scheme when extending a new feature; check the target SP's own convention.

**Transactions**: no explicit .NET-side transaction handling (`IDapperHandler` opens a new connection per call, no `TransactionScope`/`IDbTransaction`) — multi-step writes rely on the stored procedure's own T-SQL `BEGIN TRAN`/`COMMIT`. Confidence: **High**.

**Audit/status columns** consistently observed: `InsertedBy`/`UpdatedBy`, `InsertedDate`/`CreatedDate`/`UpdatedDate`, `IsDeleted` (soft-delete bit), various `*Status`/`IsActive` flags.

Two ad hoc SQL files outside either project's tracked `Scripts/` sequence: `Infrastructure/rename_crud_procs.sql`, `Infrastructure/organization_migration.sql` (one-time data migration from legacy `optionccom`/`optionccom_ffis` databases).

---

# 12. Data Flow

## Workflow A — Public Access Request → Admin Approval
```text
1. Visitor opens CFR portal → RequestAccessPage.tsx (no auth required)
2. Loads public product catalog: GET Products/GetProducts (Acutis, [AllowAnonymous])
3. User fills contact/org/applications/consent form
4. Client-side validation: validatePublicAccessRequest (requests/validator/AccessRequestValidator.ts)
5. POST AccessRequest/SaveAccessRequest (Portal, [AllowAnonymous])
   → AccessRequestService.SaveAccessRequestAsync
     - validates required fields server-side too
     - calls IAccessRequestRepository → [request].[AccessRequestManage] ActionId=1 (save)
     - repo sentinel codes -99/-98/-97/-96/-93 mapped to Conflict/NotFound/BadRequest by the Service
     - on success, fires NotifyAdminsOfNewRequestAsync → looks up "AccessRequested" email template
       → SMTPMailService.SendMailAsync (failure here is caught/logged, does NOT fail the request save)
6. Frontend shows a "CS-{year}-{id}" confirmation reference
7. Admin (CFR_Admin) → RequestsListPage → GET AccessRequest/GetAccessRequests (Acutis)
8. Admin opens RequestReviewModal → GET AccessRequest/GetAccessRequestById
9. Admin approves/rejects/asks-info → PUT AccessRequest/UpdateAccessRequestStatus
   (NOTE: no evidence found that approval automatically creates the OrganizationProduct
   grant/entitlement — this linkage is Cannot Be Determined from the code inspected;
   the Dashboard's own "Priority Alerts" flag "Approved requests missing an organization
   grant" as a known integrity issue, which is indirect evidence this linkage may be
   manual or incomplete today.)
```

## Workflow B — End-user Login → Launch an App
```text
1. User submits credentials on CFR portal login (CentralLoginPage, provider='password')
2. AuthProvider.signIn → loginPortal(email, password) (portalAuthService.ts)
3. POST PortalLogin/LoginAuthentication (Portal, [AllowAnonymous])
   → PortalAuthenticationService.LoginAuthenticationAsync
     → IPortalAuthenticationRepository.AuthenticateAsync → [dbo].[Portal_DoLogin]
     → on success, IPortalJwtTokenGenerator issues JWT
4. Frontend stores token/user in sessionStorage (setPortalSession), plus sets the
   cs_platform_preview_session cookie (central-login parity)
5. Navigate to /apps (ProtectedRoute passes since isAuthenticated=true)
6. ProductLaunchPage loads: GET CFRLaunch/GetAssignedProducts (Portal, bearer token)
   → CFRLaunchService.GetAssignedProductsAsync → ICFRLaunchRepository → [dbo].[Portal_CFRLaunch] ActionId=1
7. User clicks Launch on an entitled app → POST CFRLaunch/LaunchProduct {productId}
   → CFRLaunchService.LaunchProductAsync validates entitlement (maps SP codes -2..-6 to
     NotFound/ProductDisabled/ProductNotAssignedToUser etc.) → [dbo].[Portal_CFRLaunch] ActionId=2
     → inserts a one-time row into [auth].[CFRLaunch] (CodeHash, ExpiresAt, IsUsed=0)
   → returns a launchUrl (presumably {externalApp}?code=...)
8. Frontend window.open/location.assign(launchUrl)
9. (External app side, out of this repo's scope) presumably calls back
   POST CFRLaunch/ExchangeToken ([AllowAnonymous]) → ActionId=3 → validates+consumes the
   one-time code → issues its own session (exact external-side handling: Cannot Be Determined,
   outside this repository)
```

## Workflow C — Admin manages an Organization's product assignment
```text
1. Admin → OrganizationsListPage → GET Organization/GetOrganizations ([Authorize], Acutis)
2. Admin opens OrganizationDetailPage → OrganizationProductsPanel
   → GET Organization/GetOrganizationProducts, GET Organization/GetAssignableProducts
3. Admin assigns a product → POST Organization/AssignOrganizationProduct
   → OrganizationService → IOrganizationRepository → [dbo].[Acutis_Organization] ActionId=8
   → writes lic.OrganizationProduct row
4. Dashboard's "Application/App Access Overview" and integrity checks
   (GetProductAssignmentSummary, GetIntegrityIssueDetail) reflect this on next load
```

Error handling across all flows: Service layer catches exceptions, logs via `AppLogger.LogError` with a templated `SerilogErrorMessages` string, sets `MSResultArgs.StatusCode/StatusMessage` to `ErrorCodes.InternalServerError`; Controller never catches; any truly unhandled exception is caught by `GlobalExceptionHandlerMiddleware`, which returns a raw 500 with `ex.Message` (see §18) rather than a controlled error, and does **not** log it.

---

# 13. Business Rules

**Rule**: An Organization has one of a fixed set of statuses (active/inactive/suspended), enforced by a database CHECK constraint.
**Evidence**: `backend/Service/CFR.AcutisService/Service/Organization/OrganizationService.cs:17` (references the live constraint `CK__Organizat__OrgSt__4B0D20AB`).
**Implementation**: `OrganizationService`, `[dbo].[Acutis_Organization]`.
**Impact**: Invalid status values are rejected at the DB layer, not just app layer.
**QA Consideration**: Test status transitions and any value outside the allowed set; confirm the app surfaces the DB constraint violation as a friendly error, not a raw 500 (see §18's finger on `GlobalExceptionHandlerMiddleware` leaking raw messages).

**Rule**: A duplicate User Role name is rejected (409 Conflict); a Role cannot be deleted while users are assigned to it (409 Conflict).
**Evidence**: `UserRolesController`/`UserRolesService` per agent pass; UI toolbar behavior in `UserRoles.feature`.
**Implementation**: `backend/Service/CFR.AcutisService/Service/Administration/UserRolesService.cs` (path per convention), `[dbo].[Acutis_UserRoles]`.
**Impact**: Referential integrity for the rights system.
**QA Consideration**: Test duplicate-name (case-insensitivity?), delete-while-assigned, and delete-after-unassign paths — `UserRolesApiNegativeTests.cs` already covers some of this at the API layer.

**Rule**: A Product License cannot have a duplicate/overlapping duration for the same product (409 Conflict on create/update).
**Evidence**: agent finding on `CreateLicense`/`UpdateLicense` in `cfrproducts` module.
**Implementation**: `ProductsService`/`[dbo].[Acutis_Products]`.
**QA Consideration**: Test boundary dates (start=end of existing, exact overlap, adjacent-but-not-overlapping).

**Rule**: Access-request save applies different validation depending on whether it is a public multi-product request or a single-app in-app request (member vs. public); repository returns sentinel codes for duplicate/member-not-found/product-not-found/org-not-found/bad-request.
**Evidence**: `AccessRequestService.SaveAccessRequestAsync` mapping -99/-98/-97/-96/-93 codes (agent finding).
**Implementation**: `backend/Service/CFR.PortalService/Service/Administration/AccessRequestService.cs`, `[request].[AccessRequestManage]`.
**QA Consideration**: Test each sentinel path explicitly (duplicate request for same org+product, unknown product id, unknown org, missing required field) — no evidence any automated test currently exercises these specific negative paths for Portal's save endpoint.

**Rule**: A user's page/module rights are fixed for the duration of their session (evaluated once at login) — a rights change made by an admin does not affect an already-signed-in user until their next login.
**Evidence**: explicit code comments in `frontend/CFR_Admin/src/shared/auth/hooks/useFeatureAccessLevel.ts` and `utils/menuHelpers.ts`.
**Implementation**: rights embedded in the JWT-adjacent login payload, not re-fetched per request.
**Impact**: An admin revoking a user's access does not take effect immediately — a real operational/security consideration.
**QA Consideration**: Explicitly test "rights changed while user is logged in" — confirm whether the user must re-login, and whether backend endpoints (not just frontend UI) also fail to re-check rights per-request (this compounds with the §15 authorization-bypass finding — even a same-session re-check would currently be moot since `[Authorize]` isn't enforced at all).

**Rule**: A launch code (`[auth].[CFRLaunch]`) is one-time-use (`IsUsed` bit) and time-limited (`ExpiresAt`).
**Evidence**: `001_Portal_Sso.sql` schema; `CFRLaunchService.ExchangeTokenAsync` sentinel-code handling (agent finding).
**Impact**: Prevents replay of a launch URL.
**QA Consideration**: Test expired-code exchange, already-used-code exchange, and code-for-a-since-revoked-entitlement.

**Rule**: An org's organization type is used to backfill/infer classification from name text (e.g. names containing "Parish"/"Chapel"/"Cathedral" → `Parish`; containing "School" → `Catholic School`).
**Evidence**: `Infrastructure/CFR.AcutisInfrastructure/Scripts/012_Acutis_OrganizationTypeBackfill.sql:6-40`.
**Impact**: This was a one-time backfill migration, not an ongoing rule — **Requires Business Clarification** whether new organizations must still have `OrgType` inferred/validated this way going forward, or whether it's now purely an admin-selected dropdown value (`ORG_TYPE_OPTIONS`).

---

# 14. External Integrations

| Integration | Purpose | Direction | Protocol | Auth | Configuration | Failure Handling |
|---|---|---|---|---|---|---|
| SMTP mail server | Transactional email (access-request notifications, templates, test emails) | Outbound | SMTP (raw `SmtpClient` + hand-rolled `TcpClient`/`SslStream` handshake for connection test) | Username/password (config) | `EmailSettings` (admin UI, file-backed `_configurationSettings.json`); **Secret/credential detected — value intentionally omitted** wherever SMTP creds appear in config | Retry loop (max 2, 1s delay); email failures do not fail the parent business operation (e.g. access-request save still succeeds) |
| Azure Blob Storage | File storage (wrapper exists) | Outbound | Azure Storage SDK (`Microsoft.WindowsAzure.Storage`) | Connection string (`AppStrings:StorageConnectionString`) — **Secret/credential detected — value intentionally omitted** | `CloudFileStorage.cs` | **Cannot Be Determined** — active usage in a live request path not confirmed in this pass |
| Local disk file storage | Logos, uploaded profile photos, documents | N/A (local) | Filesystem | N/A | `ApplicationFilePath:Doc_BasePath` / `AppStrings:GatewayRoot` | Not deeply inspected |
| External "App Switcher" partner apps (documented, not implemented here) | Embeddable launcher web component for partner sites | N/A | N/A | N/A | Described only in `Docs/*.docx`; **no corresponding code found in this repo** | N/A |
| External SaaS product apps (OptionC School, Matt Money, ArcAlerts, Parish Hub, etc.) | The actual destination apps launched from the App Hub | Outbound (redirect) | HTTP redirect with one-time exchange code | One-time `CFRLaunch` code | `appCatalog.ts` `externalUrl` per app | **Cannot Be Determined** — external-side handling of `ExchangeToken` is outside this repo |

No payment provider, SMS provider, analytics/monitoring SaaS, or identity-provider (Azure AD/Okta/etc.) integration was found anywhere in the codebase — the "SSO" plumbing (`canRedirectToExternalIdentityProvider`) exists but is unreachable in current configs (no environment sets `authMode:'sso'`). Confidence: **High**.

---

# 15. Authentication & Authorization

See §7 for the role/rights model. This section consolidates the **security-relevant** implementation facts.

**JWT configuration** (`Platform/CFR.Base/CommonServiceExtension.cs:137-193`): HMAC-signed, `ValidateIssuer=false`, `ValidateAudience=false` (Issuer/Audience are configured in `JWTSetting` but not actually checked at validation time), `ClockSkew=Zero`. `RequireHttpsMetadata=false`.

**CRITICAL FINDING (High confidence)**: `DisableAuthenticationPolicy(env)` (`CommonServiceExtension.cs:26-41`) has dead `if(env.IsDevelopment())/else` branching — **both branches run identical code** that installs `DisableAuthenticationPolicyEvaluator` (`Platform/CFR.Base/DisablePolicy.cs`), which **always returns success** for both authentication and authorization regardless of environment. This is called unconditionally from both `CFR.Acutis/Program.cs:30` and `CFR.Gateway/Program.cs:67`. **Net effect: `[Authorize]` attributes do not actually block any request, in any environment, in the current codebase.** This is very likely leftover scaffolding from local development that was never removed before other environments were wired up, and is the single most important finding in this document for security/QA prioritization.

**CORS**: wide open — `SetIsOriginAllowed(_ => true)` + `AllowAnyMethod()` + `AllowAnyHeader()` + `AllowCredentials()`, applied identically to both hosts. The `JWTSetting.AllowOrigin` config key is read into a local variable but never actually used by the CORS policy (dead code).

**Secrets in source control**: JWT signing key and SQL Server connection strings (with embedded credentials) are committed in plaintext across `appsettings*.json` for all four environments. The **same JWT key is used in every environment including Development**, and Pilot/Staging/Live share **one physical SQL Server** (`192.168.1.7\MSSQL2022`, database `CFRPortal`) with the same credentials. **Secret/credential detected — values intentionally omitted from this report.**

**TLS trust**: `CFR.Gateway`'s YARP cluster config defaults `DangerousAcceptAnyServerCertificate=true` unless a service explicitly overrides it — the Gateway will accept any TLS certificate from a downstream microservice by default.

**Session/token storage** (frontend): `CFR` uses `sessionStorage` for the Portal JWT; `CFR_Admin` uses `localStorage` for the Acutis JWT (both are vulnerable to XSS-based token theft — no `HttpOnly` cookie option is used for either app's actual bearer token, only for the non-sensitive `cs_platform_preview_session` marker cookie).

---

# 16. Configuration & Environments

Four environments exist consistently across both microservices and the Gateway: **Development, Pilot, Staging, Live**. `ConfigurationLoader.LoadConfiguration()` (Acutis) / `AddCustomConfiguration()` (Gateway) resolve the environment name from (in order): `Environment` env var → `ASPNETCORE_ENVIRONMENT` → the `Environment` key inside `appsettings.json` → (Gateway only) falls back to literal `"Live"` if nothing else resolves.

| Setting | Development | Pilot | Staging | Live | Purpose |
|---|---|---|---|---|---|
| `JWTSetting.SecurityKey` | Secret/credential detected — value intentionally omitted (same value in every environment) | same | same | same | JWT signing |
| `ConnectionStrings:ConnString` | Secret/credential detected — value intentionally omitted (local dev DB) | Secret detected (points at `192.168.1.7\MSSQL2022`/`CFRPortal`) | same host/db as Pilot | same host/db as Pilot | Primary DB |
| `Gateway:Services:acutis:UpstreamOrigin` | `https://localhost:5051` | `http://localhost:5051` | `http://localhost:5051` | `http://localhost:5051` | Gateway routing (all non-dev environments assume co-located host) |
| `ApplicationFilePath:Doc_BasePath` | local dev path | `C:\inetpub\catholicsolution\cfrapi.allnewoptionc.com\wwwroot` | same as Pilot | same as Pilot | File storage base path (IIS-hosted) |
| `EmailSettings:ApiBaseUrl` | `https://localhost:5050/acutis` | `https://cfrapi.allnewoptionc.com` | same as Pilot | same as Pilot | Prevents localhost URLs leaking into outgoing emails |
| `FrontendSetting:CfrAdminBaseUrl` | `http://localhost:4011` | **not present** | **not present** | `https://cfracutis.allnewoptionc.com` | Frontend base URL reference — Pilot/Staging appear to lack this key (possible config gap, Medium confidence) |
| `VITE_APP_REST_API_BASE_URL` (frontend, both apps) | `https://localhost:5050` (CFR_Admin) | `https://cfr-api.newoptionc.com` | `https://cfrapi.allnewoptionc.com` (documented as sharing Live's backend/DB) | `https://cfrapi.allnewoptionc.com` | Gateway origin the SPA calls |

**Notable finding**: `.env.staging` in `CFR_Admin` contains an explicit code comment stating there is **no isolated staging backend** — staging points at the same API origin (and therefore the same database) as Live.

Feature flags: **none found** as a formal system — the closest equivalent is `import.meta.env.DEV`-gated dev-only routes in `CFR_Admin/src/App.tsx` (component-library sample pages stripped from hosted builds) and the `authMode` config switch (mock/preview/sso).

---

# 17. Validation

**Backend**: DTO-level validation is largely manual within the Service layer (not confirmed to use `[Required]`/DataAnnotations or FluentValidation attributes systematically — **Cannot Be Determined** without deeper DTO-by-DTO inspection beyond what agents covered); business validation (uniqueness, entitlement checks, status checks) happens in the Service layer before calling the repository, and some validation is pushed further down into the stored procedure itself (sentinel return codes for duplicate/not-found conditions).

**Frontend — CFR**: 100% manual, hand-written validator functions per module (`validator/AccessRequestValidator.ts`, `validator/ProductLaunchValidator.ts`). No schema library (Zod/Yup). Regex used for ZIP (`^(?:\d{5}(?:-\d{4})?|\d{6})$`); native HTML5 `required`/`type="email"` for the login form only.

**Frontend — CFR_Admin**: `react-hook-form` rules objects per module (email regex, 10-digit phone regex, 5-digit ZIP regex, `maxLength` caps, custom `onInvalid` → toast).

**Inconsistencies identified**:
- CFR's ZIP regex accepts 5, 5+4, or 6 digits (possibly accommodating non-US formats); CFR_Admin's organization ZIP validator is 5-digit only (`OrganizationValidator.ts`) — a frontend-to-frontend inconsistency, not frontend-to-backend, but still worth flagging for QA since both ultimately write to the same `core.Organization`/`request.AccessRequest*` tables.
- Password strength is validated only client-side (`ResetPasswordPage.tsx`'s `passwordScore`) with an explicit code comment admitting production password/reset-code validation should be server-side — **Requires Business Clarification / engineering follow-up** whether the backend independently enforces any password complexity rule today (not confirmed either way in this pass).

---

# 18. Error Handling & Logging

**Global exception handling**: `GlobalExceptionHandlerMiddleware` (`Platform/CFR.Base/Middlewares/GlobalExceptionHandlerMiddleware.cs`) catches all unhandled exceptions and returns HTTP 500 `{"StatusCode":500,"Message": exception.Message}` — **this leaks raw exception messages to API clients** and its own code comment admits the intended logging call ("Log exception details here if logging is enabled") was never implemented. High-confidence, direct-code finding.

**Structured logging**: Serilog-style call sites (`AppLogger.LogError`, `Log.Information` in `BaseController.AuditSeriLog`) are used pervasively throughout the Service layer with a large templated-message catalog (`MessageCatalog.SerilogErrorMessages`, ~50 messages split into `AcutisLogMessages`/`PortalLogMessages`). However, the actual Serilog pipeline/sink registration (`AddSerilogConfiguration`) is **commented out** in `CFR.Acutis/Program.cs:33`, no `"Serilog"` config section exists in any `appsettings*.json`, and no sink wiring was found despite `Serilog.Sinks.MSSqlServer` being referenced in `CFR.Base.csproj`. **Conclusion**: log calls exist but likely fall through to the default ASP.NET Core console `ILogger` rather than a configured Serilog sink — logs may not be durably captured/searchable in the deployed environments as the code's intent suggests. Confidence: **High** on the code facts, **Medium** on the exact runtime consequence (a default `ILogger<T>` still technically logs to console even without Serilog explicitly wired).

**Business-status codes vs HTTP codes**: `ErrorCodes` defines non-standard numeric codes (203=Failed, 204=NoRecordFound, 205=Deleted, 206/207 undefined-in-this-pass) threaded through `MSResultArgs.StatusCode`, then mapped to real HTTP status codes by `BaseController.GetResponseByStatusCode`. Notably, `NoRecordFound` (204) maps to an HTTP **204 No Content** response — meaning a "not found" business condition returns an **empty body**, discarding the `StatusMessage` that would have explained why. This could confuse frontend error handling that expects a message to display. QA should verify how each frontend module's "no data" state is actually triggered/displayed.

**Legacy/dead logging code**: `Platform/CFR.DBEngine/ErrorLog.cs` is a full file-based logger with domain-specific methods (`AttendanceWriteLog`, `ConductWriteLog`) unrelated to CFR — clearly carried over from a prior OptionC product and not part of the active request-handling path (the active path uses `AppLogger`/Serilog-style calls instead).

**Frontend error handling**: uniform pattern — service throws a plain string (not an `Error` object) on `statusCode>=400`; every calling component catches and shows it via a single global toast (`ToastProvider`, 2600ms auto-dismiss, no stacking — a second error while one is showing simply replaces it). No error boundaries (`componentDidCatch`) exist anywhere in either frontend app.

---

# 19. Security Analysis

Findings are code-evidenced; no exploitation was performed.

| # | Finding | Classification | Evidence |
|---|---|---|---|
| 1 | Authorization (`[Authorize]`) is neutralized in **all environments** via `DisableAuthenticationPolicyEvaluator`, which always returns success for authentication and authorization. | **Critical** | `Platform/CFR.Base/CommonServiceExtension.cs:26-41`, `Platform/CFR.Base/DisablePolicy.cs`; called unconditionally from both `CFR.Acutis/Program.cs:30` and `CFR.Gateway/Program.cs:67` |
| 2 | JWT signing key and SQL Server connection strings (with credentials) are committed in plaintext in `appsettings*.json`, identical across environments including production-adjacent (Live). | **Critical** | Multiple `appsettings.{Env}.json` files; values intentionally not quoted in this report |
| 3 | CORS allows any origin with credentials (`SetIsOriginAllowed(_ => true)` + `AllowCredentials()`), combined with finding #1 — a request from any origin can call any endpoint with any bearer/cookie state effectively unauthenticated. | **High** | `CommonServiceExtension.cs:179-188` |
| 4 | `GlobalExceptionHandlerMiddleware` returns raw exception messages to clients on unhandled 500s (information disclosure) and never logs them. | **Medium** | `Middlewares/GlobalExceptionHandlerMiddleware.cs` |
| 5 | Gateway YARP cluster defaults to accepting any downstream TLS certificate (`DangerousAcceptAnyServerCertificate=true` by default) unless explicitly overridden per service. | **Medium** | `Gateway/CFR.Gateway/GatewayServiceCatalog.cs:141` |
| 6 | Forwarded-headers trust is unrestricted (`KnownIPNetworks`/`KnownProxies` cleared) — the Gateway will trust `X-Forwarded-For`/`X-Forwarded-Proto` from any source if exposed directly. | **Medium** | `Gateway/CFR.Gateway/Program.cs:24-29` |
| 7 | JWT bearer tokens stored in `localStorage` (CFR_Admin) / `sessionStorage` (CFR) rather than an `HttpOnly` cookie — vulnerable to token theft via any XSS. | **Medium** | agent findings on `AxiosInstance.ts`, `appPortalClient.ts` |
| 8 | No rate limiting is enabled on `CFR.Acutis` at all (commented out); the Gateway's rate limiter is registered but its named policies (`"per-user"`, `"fixed"`) do not appear attached to any route, and a separate unused global limiter (`AddPlatformRateLimiting`) exists but is never called. | **Medium** | `CommonAppExtension.cs:64` (commented), `CommonServiceExtension.cs:43-66`, `RateLimiterExtensions.cs:10-41` |
| 9 | Password-reset and password-change flows are validated only client-side in the automation/prototype code paths inspected (`ResetPasswordPage.tsx`); server-side enforcement of password policy is **Cannot Be Determined** from this pass — flagged for follow-up, not asserted as a confirmed gap. | **Low/Informational** | `ResetPasswordPage.tsx:93` comment |
| 10 | No security-headers middleware (CSP, X-Frame-Options, HSTS beyond default) found; a `UseSecureKestrel()` helper that at least suppresses the `Server` header exists but is never called. | **Low** | `Platform/CFR.Base/WebApplicationBuilderExtensions.cs` (unused) |

No SQL injection evidence found — all data access goes through Dapper `DynamicParameters` into stored procedures (parameterized). No obvious XSS sinks were flagged in the agent passes (React's default escaping applies; no `dangerouslySetInnerHTML` usage was reported as found, though this was not exhaustively grepped for in this document's construction — **Cannot Be Determined** with full confidence without a dedicated pass). No hardcoded application-user credentials were found in source beyond the automation test-data JSON's intentionally-fake placeholder values (`backend/Automation/Automation.Acutis/TestData/AcutisTestData.json`).

---

# 20. Testing Architecture

| Test Project | Framework | Scope | Automation Type | Main Coverage |
|---|---|---|---|---|
| `Automation.Acutis` + `Automation.Framework` | Reqnroll.NUnit (Gherkin) + Selenium WebDriver (Chrome) + ExtentReports | End-to-end UI, CFR_Admin app only | BDD / browser automation | Login, MenuAccess, Products, Organizations, Users, UserRoles, UserRights, EmailTemplates, EmailSettings, AccessRequests (listing only), password self-service flows (env-gated), one composite `TestAllProcess` scenario |
| `CFR.Acutis.Tests` | NUnit 4.4.0 + plain `HttpClient` | API-level negative tests, `UserRoles` endpoints only | Integration/API | 401/403/409/404 cases for `SaveUserRole`/`UpdateUserRoleStatus`/`DeleteUserRole` — self-skips without env config |
| Frontend (`CFR`, `CFR_Admin`) | **None** | — | — | **No automated coverage of any kind** |

**Automation.Acutis details**:
- Selenium (Chrome only), heavy use of `IJavaScriptExecutor`-driven interaction because native Selenium events are reportedly swallowed/duplicated by the React app.
- Test data: one static JSON fixture (`AcutisTestData.json`), no DB-driven or randomized data generation (aside from a `RunId` suffix for mutating Organization scenarios).
- Environment/mutation safety: `TestEnvironmentContext` fails safe — an unset/unrecognized environment is treated as the most locked-down (**Live**), and mutating scenarios require explicit env-var opt-in flags, with Staging additionally requiring a literal confirmation string. DB-seeding (for password-reset token tests) is Development-only.
- Reporting: ExtentReports HTML output per run (`Result/Result_{timestamp}/`), with screenshot capture on step failure.
- **Dormant/vestigial pieces**: `AutoItX3.dll` (Windows native dialog automation) is referenced only in commented-out code; `BOJsonDataObjects.cs` (a "Back Office" POCO) is unused; a `"CFR"` project key exists in `JsonDataReader` but has no backing `CFRTestData.json` file.

**`CFR.Acutis.Tests` details**: explicitly documented in-code as a different, non-Selenium layer from `Automation.Acutis`, using the same NUnit runner but plain HTTP calls — covering negative-path cases the browser UI can't reach (disabled buttons) or that need two concurrently authenticated roles.

---

# 21. Test Coverage & QA Risk

| Area | Risk | Evidence | Existing Coverage | Recommended QA Focus |
|---|---|---|---|---|
| Authorization enforcement | **Critical** — `[Authorize]` does nothing in any environment | §15/§19 finding #1 | None found targeting this specifically | Add API tests asserting an unauthenticated/wrong-role request to an `[Authorize]`-marked endpoint is actually rejected; today it will likely succeed |
| CFR portal end-to-end (login, app hub, launch, request-interest) | **High** — zero automated coverage of any kind | Automation only targets CFR_Admin; no `.feature`/page object references the CFR portal | None | Prioritize E2E coverage of login → view apps → launch → SSO code exchange, and the in-app request-interest modal |
| Access Request approve/reject/info-request actions | **High** — only listing/filtering is tested; the actual state-changing admin actions are unexercised | `AdminAccessRequests.feature` (list/filter only) | Partial | Add scenarios that actually approve, reject, and request-info on a seeded request, and verify resulting entitlement (or confirm/flag if entitlement isn't auto-granted — see §13) |
| Dashboard integrity/KPI correctness | **Medium-High** — numbers feed operational decisions (data-integrity alerts) but have no dedicated test | No feature file exercises dashboard content, only "dashboard is open" as a login-landing smoke check | None | Verify KPI/integrity-issue calculations against seeded known-bad data (e.g. approved request w/ no grant) |
| Rights-change-takes-effect-only-on-next-login | **Medium** — real operational/security implication (§13) | Explicit code comments, no test found | None | Test revoking a right mid-session; confirm actual (not just intended) behavior end-to-end, including whether backend endpoints independently re-check |
| Frontend form validation drift (CFR vs CFR_Admin ZIP regex etc.) | **Low-Medium** | §17 | None (no frontend tests at all) | Add validator unit tests per module; reconcile regex inconsistencies |
| CFRLaunch one-time-code replay/expiry | **Medium** — security-relevant | `001_Portal_Sso.sql` schema, `ExchangeTokenAsync` sentinel handling | None found | Test expired code, already-used code, and code for a since-revoked product/org |
| SMTP failure handling in access-request flow | **Low** — by design, doesn't fail the parent operation | `AccessRequestService.NotifyAdminsOfNewRequestAsync` | None found | Confirm admins are alerted some other way if the notification email silently fails |
| `LicenseDetails.tsx`'s residual dependency on mock `AdminDataContext` | **Medium** — data-integrity risk (wrong/stale org name/data shown for a real invoice) | §8 finding | None | Verify this page against real data; likely needs migration to a real `getOrganizationById` call |
| Duplicate DI registrations (`IAccessRequestService`/`IProductsService` registered twice in `CFR.Acutis/ServiceExtension.cs`) | **Low** — currently harmless (last registration wins, same implementation) | §9 (backend agent) | N/A | Not a functional bug today; flag for cleanup, verify no future registration reordering silently changes behavior |
| Concurrency on Organization/Product/License mutations | **Cannot Be Determined** | No optimistic-concurrency/row-version columns confirmed in the schema evidence gathered | None found | Test two concurrent admins editing the same Organization/License record |

---

# 22. Requirement-to-Code Traceability

Given the absence of a requirements/ticket system in-repo, traceability is established from the two `Docs/*.docx` guides (aspirational App Registry/Switcher architecture) down to what actually exists:

```text
Docs: "App Registry" + "Universal App Switcher" concept
 ↓ (NOT IMPLEMENTED in this repo — no packages/app-registry, no packages/app-switcher, no web component build)
Actual implementation instead:
 App Hub UI  → frontend/CFR/src/modules/productlaunch  (screens exist)
             → backend CFRLaunchController/Service/Repository  (API exists)
             → [dbo].[Portal_CFRLaunch] + [auth].[CFRLaunch]  (DB exists)
             → NO test coverage (gap)
```

```text
Docs (implicit, via App Registry's per-app metadata) → static appCatalog.ts registry (both frontends)
 ↓ hand-duplicated, not code-generated from any central registry service
 → Requires Business Clarification: is a real backend-driven App Registry service planned to replace
   the static, hand-maintained appCatalog.ts files in each frontend?
```

```text
Feature exists but tests are missing: CFR portal (entire app), Dashboard content, Access-Request approve/reject actions
Tests exist but feature-overlap is narrow: CFR.Acutis.Tests only covers UserRoles negative paths — no other Acutis controller has API-level negative tests
Database logic exists but business purpose needs clarification: [auth].[GetRightByRoleId]/[auth].[SaveUserRights] (legacy UserRights SPs) — not checked into repo scripts, purpose/ongoing-relevance vs. the newer UserRoles system is Requires Business Clarification
```

---

# 23. Dependency Analysis

| Dependency | Version | Purpose | Used By | Risk/Notes |
|---|---|---|---|---|
| React | 19.2.8 | UI framework | Both frontends | Current major version |
| react-router-dom | 7.18.2 | Routing | Both frontends | Declarative API only, no data router features used |
| Vite | ~8.2.1 | Build tool | Both frontends | Current |
| TypeScript | ~6.0.3 | Language | Both frontends | **Deliberately pinned** below npm-stable 7.x (`typescript-eslint` v8 compatibility) — a documented hold, not staleness |
| axios | (CFR_Admin only) | HTTP client | CFR_Admin | CFR uses raw `fetch` instead — inconsistent choice between the two sibling apps |
| react-hook-form | (CFR_Admin only) | Form state/validation | CFR_Admin | CFR has no equivalent — manual validation instead |
| recharts | (CFR_Admin only) | Dashboard charts | CFR_Admin dashboard | — |
| Dapper | (backend, version not captured in this pass) | Data access | All Infrastructure projects | No ORM migrations; schema drift risk since most tables aren't defined in-repo |
| Reqnroll (+ .NUnit) | (per `Automation.Acutis.csproj`) | BDD test runner | `Automation.Acutis` | Successor to retired SpecFlow — current choice |
| Selenium.WebDriver / Selenium.Support | (per `Automation.Framework.csproj`) | Browser automation | `Automation.Framework` | Chrome-only; no cross-browser coverage |
| Hangfire (implied by `Platform/CFR.Base/Hangfire/**` + README) | (version not captured) | Background jobs | **Not actually used** anywhere | Dead weight / incomplete integration — either finish wiring it up or remove it |
| Serilog + `Serilog.Sinks.MSSqlServer` | (referenced in `CFR.Base.csproj`) | Structured logging | Referenced but **not wired** in `Program.cs` | Same as above — incomplete integration |
| Microsoft.WindowsAzure.Storage | (legacy Azure Storage SDK, not the newer `Azure.Storage.Blobs`) | Blob storage wrapper | `CloudFileStorage.cs` | **Outdated/deprecated package family** — Microsoft has deprecated `WindowsAzure.Storage` in favor of `Azure.Storage.Blobs`; flag for upgrade if this integration is actually in active use |
| AutoItX3.dll | n/a (native DLL) | Windows dialog automation | Referenced only in commented-out code | Dead dependency — safe to remove if confirmed permanently unused |

No dependency-vulnerability scan was run as part of this analysis — **Not Found / Cannot Be Determined** whether any current package has a known CVE; recommend running `npm audit` (both frontend projects) and `dotnet list package --vulnerable` (backend) as a follow-up, outside the scope of static code reading.

---

# 24. Deployment Architecture

**Confirmed from repository evidence**:
- No CI/CD pipeline definitions exist in-repo (no `.github/workflows`, `azure-pipelines.yml`, Jenkinsfile) — **Not Found**.
- No Dockerfile/`docker-compose.yml`/container orchestration config — **Not Found**.
- Each backend host (`CFR.Acutis`, `CFR.Portal`, `CFR.Gateway`) has Visual-Studio-style `.pubxml` publish profiles under `Properties/PublishProfiles/`, implying **manual or IDE-driven publish**, not scripted CI/CD.
- Production/Pilot/Staging file paths point at `C:\inetpub\catholicsolution\{host}\wwwroot` — strongly implies **IIS on Windows Server** hosting, not containers/Kubernetes/Azure App Service (no `web.config`-less Kestrel-only or container-specific config was found for the backend; **frontend** does reference `web.config`/`netlify.toml`/`vercel.json` per `frontend/CLAUDE.md`, suggesting the two frontends may deploy differently — e.g. Netlify/Vercel/static-hosting — from the IIS-hosted backend, though this is **Medium confidence**, inferred from config file presence rather than a documented deployment runbook).
- Build commands (manual, from `README.md`/`CLAUDE.md`): backend `dotnet build CatholicSolution.slnx` + `dotnet run --project ...`; frontend `npm run build:{development|pilot|staging|live}` per project.
- Database deployment: **no migration tool** — the incremental `.sql` scripts under `Scripts/` appear to require **manual execution against the target SQL Server instance**, with no evidence of an automated apply/versioning mechanism (no `_MigrationHistory` table or Flyway/DbUp usage found).
- Static assets: frontend build output (`vite build`) presumably deployed to whatever serves `web.config`/`netlify.toml`/`vercel.json` — **Cannot Be Determined** definitively which one is actually used in production without deployment/infra documentation outside this repo.

```text
Developer machine
 → dotnet build / npm run build:{env}     (manual)
 → .pubxml-driven publish (Visual Studio)  → IIS (Windows Server, C:\inetpub\...)   [backend]
 → (undetermined static host — web.config/Netlify/Vercel config all present)        [frontend]
 → SQL Server 192.168.1.7\MSSQL2022, database CFRPortal (Pilot/Staging/Live SHARE this instance)
```

---

# 25. Important Files

| File | Purpose | Why Important |
|---|---|---|
| `backend/Platform/CFR.Base/BaseController.cs` | Every controller's base class; `ApiResultArgs` response funnel | Understanding this is a prerequisite to reading any controller |
| `backend/Platform/CFR.Base/CommonServiceExtension.cs` | DI/auth/CORS/rate-limit wiring | Contains the critical `DisableAuthenticationPolicy` finding (§15) |
| `backend/Platform/CFR.Base/DisablePolicy.cs` | The `IPolicyEvaluator` that neutralizes `[Authorize]` | Security-critical |
| `backend/Platform/CFR.DBEngine/DapperHandler.cs` | All DB access goes through this | No transactions, no ORM — central to understanding data flow |
| `backend/Platform/CFR.DBEngine/MSResultArgs.cs` | The universal API response envelope | Used by literally every endpoint |
| `backend/Microservices/CFR.Acutis/Program.cs`, `backend/Microservices/CFR.Portal/Program.cs`, `backend/Gateway/CFR.Gateway/Program.cs` | Startup/DI/pipeline entry points | Where middleware order and Hangfire/Serilog gaps are visible |
| `backend/Infrastructure/CFR.AcutisInfrastructure/StoredProc.cs`, `SQLParams.cs` | Maps every SP call site | Primary reference for the ActionId convention |
| `backend/Service/CFR.CommonService/Services/SMTPMailService.cs` | Active mail sender | The real (non-legacy) email integration |
| `Source/docs/skillFile/backend-api-standards-SKILL.md` | Backend coding standard | Mandatory checklist for any new backend endpoint |
| `Source/docs/skillFile/frontend-standards-SKILL.md` | Frontend coding standard | Mandatory checklist for any new frontend module |
| `frontend/CFR/src/shared/auth/AuthProvider.tsx`, `centralAuth.ts`, `appAuthConfig.ts` | Auth mechanism | Understand mock/preview auth before touching login flows |
| `frontend/CFR_Admin/src/shared/auth/hooks/useFeatureAccessLevel.ts`, `utils/menuHelpers.ts` | Rights-based UI gating | Only real authorization enforcement in the whole system (frontend-only) |
| `frontend/CFR/src/registry/appCatalog.ts`, `frontend/CFR_Admin/src/registry/appCatalog.ts` | Static app catalog (hand-duplicated) | Source of the product list shown in the App Hub |
| `backend/Automation/Automation.Framework/EnvironmentSupport/TestEnvironmentContext.cs` | Automation safety gating | Prevents accidental mutation of Live data |
| `backend/Infrastructure/organization_migration.sql`, `.../012_Acutis_OrganizationTypeBackfill.sql` | Real data-migration evidence | Best evidence of the platform's legacy-system origin |

---

# 26. Project Glossary

| Term | Meaning | Evidence |
|---|---|---|
| **CFR** | Umbrella backend namespace/product prefix (`CFR.Acutis`, `CFR.Portal`, `CFR.Gateway`, etc.) and the name of the end-user portal + App Hub frontend. Literal acronym expansion: **Cannot Be Determined** (never spelled out anywhere in the repo or docs). | Pervasive across `backend/`, `frontend/CFR/README.md` |
| **Acutis** | Name of the primary/reference backend microservice handling Administration, Users, Organization, Products, Dashboard, Profile, Authentication for the end-user app. Origin/etymology of the name: **Cannot Be Determined**. | `backend/Microservices/CFR.Acutis`, `CFR.AcutisService`, `CFR.AcutisInfrastructure` |
| **Portal** | The smaller backend microservice + its authentication/launch responsibilities for the CFR end-user frontend (distinct from the Acutis/admin side). | `backend/Microservices/CFR.Portal` |
| **App Hub** | The end-user-facing screen (`/apps` in `CFR`) listing "Your/Available/Future" apps and launching them. | `frontend/CFR/src/modules/productlaunch`, `Docs/*.docx` |
| **App Switcher** | A documented (but **not implemented in this repo**) embeddable web component (`<catholic-solutions-app-switcher>`) for partner sites to surface the same app list. | `Docs/Catholic_Solutions_App_Switcher_Developer_Guide_v1.6.7.docx` |
| **App Registry** | A documented (but **not implemented as a standalone package in this repo**) centralized source of app metadata; in the actual code this role is filled by the hand-duplicated `appCatalog.ts` files per frontend. | `Docs/Catholic_Solutions_App.docx`; `frontend/*/src/registry/appCatalog.ts` |
| **ActionId** | A stored-procedure discriminator parameter selecting which CRUD/query operation to perform within one reused SP (numbering is per-SP, not universal — see §11). | `backend/Infrastructure/*/Repositorys/**` |
| **MSResultArgs / ResultArgs** | The shared response envelope (`StatusCode`, `StatusMessage`, `ResultData`, `Errors`, `TraceId`, `Timestamp`) returned by every Service method and shaped into an HTTP response by `BaseController`. | `backend/Platform/CFR.DBEngine/MSResultArgs.cs` |
| **Organization** | The tenant-like entity: a Catholic school, parish, diocese/archdiocese, or ministry/nonprofit customer account. | `frontend/CFR_Admin/src/modules/organizations` |
| **Diocese** | Both an organization type and a legacy administrative-hierarchy concept (a diocese oversees parishes/schools under it), evidenced by a large legacy `DiocesePermissions` enum. | `backend/Platform/CFR.DBEngine/EnumCommand.cs:350-461` |
| **CFR Users** | End-customer (organization-member) user accounts, exposed read-only to admins via `GetCFRUsers`, distinct from Acutis admin-console `Users`. | `frontend/CFR_Admin/src/modules/cfrUsers` |
| **cs_platform_preview_session** | The mock/dev session cookie used as a stand-in for a real SSO session in both frontends today. | `frontend/*/src/shared/auth/centralAuth.ts` |
| **hubSection** | An `appCatalog.ts` field classifying an app as `'your' \| 'available' \| 'future'` for App Hub display grouping. | `frontend/CFR/src/registry/appCatalog.ts` |
| **Viper** | Inferred internal/legacy codename for the CFR_Admin frontend, based on XPath constant naming in the Selenium page objects (`ViperLoginPage`, `ViperCommonVariable`, etc.). Confidence: **Low** (inferred from naming only, never explicitly defined). | `backend/Automation/Automation.Framework/ViperPages/**` |

---

# 27. Technical Debt

Confirmed technical debt (all with direct code evidence, not stylistic opinion):

1. **`DisableAuthenticationPolicy` neutralizes all authorization in every environment** — almost certainly leftover local-dev scaffolding never removed. See §15/§19. **(Critical — should be treated as a live security defect, not just debt.)**
2. **Hangfire infrastructure is fully built out but entirely unused** — no jobs, no wiring, ported wholesale from a prior project ("LNTHCIApps," per its own README) and left dormant.
3. **Serilog structured-logging pipeline is not wired** despite pervasive `AppLogger`/`Log.Information` call sites throughout the Service layer expecting it to be.
4. **Legacy dead code carried over from a prior OptionC product**: `Platform/CFR.DBEngine/ErrorLog.cs` (file-based logger with `AttendanceWriteLog`/`ConductWriteLog` methods unrelated to CFR), `AutoItX3.dll` (unused native dependency), `BOJsonDataObjects.cs` (unused "Back Office" test POCO), `DiocesePermissions`/`SchoolPermissions` legacy enums in `EnumCommand.cs` that may or may not still be consulted anywhere active (**Cannot Be Determined** without a dedicated usage trace).
5. **Legacy mock data (`AdminDataContext`/`mockData.ts`) still mounted app-wide in `CFR_Admin`**, and still actively consumed by at least one real page (`LicenseDetails.tsx`) instead of a live API call — a genuine data-integrity risk, not just leftover scaffolding.
6. **Dead/orphaned frontend code**: `CFR_Admin`'s `requestsService.saveAccessRequest()` has no matching backend action and no caller; `CFR`'s `DashboardHeader`/`KpiCard`/`PanelHeader` components are defined but never imported.
7. **Duplicate DI registrations** in `CFR.Acutis/ServiceExtension.cs` (`IAccessRequestService`, `IProductsService` each registered twice) — currently harmless but a maintenance smell.
8. **Dead CORS-related code**: `JWTSetting.AllowOrigin` is read into a variable that is never subsequently used (the CORS policy is hard-coded to allow any origin instead).
9. **Two independent, only-partially-used rate-limiter implementations** in `CFR.Base` (`AddRateLimiterSetup` vs. `AddPlatformRateLimiting`), with named policies defined but not attached to any route.
10. **Outdated/deprecated Azure Storage SDK** (`Microsoft.WindowsAzure.Storage` rather than `Azure.Storage.Blobs`) if `CloudFileStorage.cs` is in active use (usage not confirmed either way).
11. **Two `CLAUDE.md`-documented architectural claims are stale relative to the current code** (now corrected by this document): `CFR.Portal` "no controllers yet," and `CFR.Acutis.Tests` "currently empty." Recommend updating `Source/CLAUDE.md` to match.
12. **Legacy UserRights stored procedures (`[auth].[GetRightByRoleId]`, `[auth].[SaveUserRights]`) are not checked into the repo's `Scripts/` folders**, unlike every other SP — makes this one feature's schema/logic un-auditable from source control alone.
13. **No database migration tooling** — schema changes rely on manually running numbered `.sql` scripts against the target server with no automated version tracking, which risks environment drift (especially concerning given Pilot/Staging/Live already share one physical database).

---

# 28. Unknowns / Clarifications Required

- **Literal meaning of "CFR"** — Cannot Be Determined from any repo source.
- **Origin/meaning of "Acutis"** as a name — Cannot Be Determined.
- **Whether the `Docs/*.docx` "App Registry"/"App Switcher" monorepo architecture is a future target still being built toward, or a stale/abandoned plan** — Requires Business Clarification; it does not match the current repo structure at all.
- **What happens on the external-partner-app side of `ExchangeToken`** (session issuance after a launch code is exchanged) — outside this repo, Cannot Be Determined.
- **Whether approving an Access Request automatically creates the corresponding `OrganizationProduct` entitlement, or whether that's a manual follow-up admin action** — the Dashboard's own "Approved requests missing an organization grant" integrity check suggests this linkage may be incomplete or manual today; Requires Business Clarification.
- **Whether the legacy `[auth].[GetRightByRoleId]`/`[auth].[SaveUserRights]` UserRights feature is still the source of truth for rights, or is being phased out in favor of `UserRoles`/`Acutis_UserRoles`** — both exist and are both wired into the admin UI; Requires Business Clarification.
- **Whether `Pilot`/`Staging`/`Live` are meant to remain permanently pointed at one shared physical database**, or whether this is a temporary/interim state — Requires Business Clarification (has real data-safety implications for any Staging-environment testing).
- **Named business roles beyond "admin with a rights matrix"** — e.g. is there a concept of "Organization Admin" who manages their own org's users, distinct from a generic org member? Not evidenced in the code inspected — Requires Business Clarification.
- **Server-side password-policy enforcement** — not confirmed present or absent in this pass; Cannot Be Determined without deeper inspection of `Acutis_DoLogin`/`Acutis_Profile`/password-related SPs and any DataAnnotations on the relevant DTOs.
- **Active-vs-dormant status of `CloudFileStorage.cs` (Azure Blob)** — code exists but a live call site was not confirmed; Cannot Be Determined.
- **Actual production hosting for the two frontend SPAs** (IIS `web.config`, Netlify, or Vercel) — all three config types are present per `frontend/CLAUDE.md`; Cannot Be Determined which is authoritative without deployment documentation outside this repo.
- **Whether `DisableAuthenticationPolicy`'s neutralization of `[Authorize]` is a known/accepted temporary state (e.g. pre-production/demo phase) or an unintentional regression** — this is the single most important item to get an explicit answer on from the team, given its severity.

---

# 29. Architecture Diagram

```text
                         ┌─────────────────────────┐        ┌─────────────────────────┐
                         │   frontend/CFR (SPA)     │        │ frontend/CFR_Admin (SPA)│
                         │  React19+Vite, own build │        │ React19+Vite, own build │
                         └────────────┬─────────────┘        └────────────┬────────────┘
                                      │ fetch (hand-rolled)                │ axios (interceptors)
                                      ▼                                    ▼
                         ┌──────────────────────────────────────────────────────────┐
                         │                     CFR.Gateway (YARP)                    │
                         │  path-prefix routing: /acutis/** , /portal/**             │
                         │  Swagger/Scalar aggregation, rate limiting (partial),     │
                         │  response caching                                        │
                         └───────────────────────┬───────────────────┬──────────────┘
                                                  │                   │
                              ┌───────────────────▼───────┐   ┌───────▼────────────────────┐
                              │        CFR.Acutis          │   │        CFR.Portal          │
                              │  (Administration, Users,   │   │  (Auth, AccessRequest,     │
                              │   Roles, Rights, Org,      │   │   CFRLaunch)               │
                              │   Products, Dashboard,     │   │                            │
                              │   Profile, Auth)           │   │                            │
                              └──────────────┬─────────────┘   └─────────────┬───────────────┘
                                             │ Service (try/catch, Serilog-style, MSResultArgs) │
                                             ▼                                ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │   Infrastructure (Repository, Dapper, ActionId SPs)       │
                              │   CFR.AcutisInfrastructure  /  CFR.PortalInfrastructure   │
                              └──────────────────────────┬──────────────────────────────┘
                                                          ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │     SQL Server  (192.168.1.7\MSSQL2022 — CFRPortal DB)    │
                              │     schemas: dbo / auth / core / lic / request / adm      │
                              │     Pilot + Staging + Live SHARE this one instance        │
                              └─────────────────────────────────────────────────────────┘

  Cross-cutting (compiled into every layer above): CFR.Base (auth/CORS/middleware, mostly
  disabled auth), CFR.Common (constants/errors/enums), CFR.DBEngine (Dapper wrapper, MSResultArgs)

  Dormant/unwired infrastructure sitting in CFR.Base: Hangfire (no jobs), Serilog pipeline
  (call sites exist, sink not configured), a second unused rate-limiter implementation.

  Not present in this repo (documented in Docs/*.docx only): a standalone App Registry
  service/package and an embeddable App Switcher web component for partner sites.
```

---

# 30. End-to-End Business Workflows

See §12 for the three fully-traced workflows (Public Access Request → Approval; End-user Login → Launch; Admin Organization/Product Assignment). Additional workflows, traced at a lighter level:

**Admin creates a User Role and assigns Rights**
```
UserRolesListPage → SaveUserRole (POST) → [dbo].[Acutis_UserRoles] (create)
→ UserRightsPage (select role+module) → GetUserRights → [auth].[GetRightByRoleId]
→ toggle Access/ReadOnly/Denied per feature → SaveUserRights (comma-delimited featureId/accessRights)
→ [auth].[SaveUserRights] (via dbo.System_PopLongInts to unpack the lists)
→ takes effect only on the affected user's NEXT login (§13 rule)
```

**Admin manages Email Templates and tests delivery**
```
EmailTemplatesPage → GetEmailTemplates/GetEmailTemplateById → [dbo].[Acutis_EmailTemplates]
→ edit body with merge tags → SaveEmailTemplate
→ SendTestEmail → SMTPMailService.SendMailAsync (uses currently-configured SMTP settings,
  FormatMailContent for merge-tag substitution)
```

**Admin configures SMTP/branding**
```
EmailSettingsPage → GetEmailSettings (reads _configurationSettings.json, NOT a DB table)
→ edit SMTP host/port/creds, branding (logo/colors/font) → TestConnection (raw SMTP handshake,
  does not send an actual email) → SaveEmailSettings (writes back to the JSON file)
→ UploadEmailLogo / RemoveEmailLogo (multipart, ≤2MB, jpg/png)
```

**Dashboard integrity-alert drill-down**
```
DashboardPage loads GetDashboardSummary → summary.integrity (list of detected issues,
e.g. "Approved requests missing an organization grant", "Rejected requests with active
entitlements", "Inactive organizations with active app assignments", duplicate mappings,
expired licenses)
→ admin clicks an alert → navigates to OrganizationsListPage or RequestsListPage with a
  ?integrityIssue={key} query param → GetIntegrityIssueDetail(issueKey) → shows flagged rows
```

---

# 31. Executive Summary

**Catholic Solutions (CFR)** is a .NET 10 / React 19 SaaS platform, built by OptionC, that lets Catholic organizations (schools, parishes, dioceses, ministries) sign in to a shared **App Hub** and launch a suite of products (student information systems, parish record-keeping, payments, emergency alerts, faith-based content, and more), while a separate **Super Admin console** lets OptionC staff manage organizations, licenses, users, roles/rights, access requests, and platform email configuration. The backend is a small set of layered .NET microservices (`CFR.Acutis` for admin/organization/product data, `CFR.Portal` for end-user auth/launch) behind a YARP API gateway, talking to a single shared SQL Server database via Dapper and stored procedures — no ORM, no formal migrations, and (based on legacy permission enums and a real data-migration script) the platform appears to have grown out of OptionC's pre-existing school/diocese administration system rather than being greenfield.

**Architecture**: consistent Controller → Service → Repository → Stored-Procedure layering, enforced by a written coding standard the team actively follows (`docs/skillFile/*-SKILL.md`). **Frontend**: two fully independent React/Vite SPAs with no shared build, each hand-duplicating its own auth, design system, and app-catalog code by explicit team convention. **Authentication** today is a self-issued JWT plus a client-side mock/preview session cookie in every environment — real SSO plumbing exists in the code but is not turned on anywhere yet, which the team has documented as an intentional prototype-phase decision. **Testing**: a Selenium/Reqnroll BDD suite covers most of the Admin console's CRUD screens; the end-user CFR portal and the Dashboard have essentially no automated coverage; a small NUnit API-negative-test project covers a handful of `UserRoles` edge cases.

**The most important finding of this analysis** is not a testing gap but a **security defect**: a custom ASP.NET Core `IPolicyEvaluator` (`DisableAuthenticationPolicy`/`DisableAuthenticationPolicyEvaluator`) unconditionally short-circuits both authentication and authorization checks in **every** environment, meaning every `[Authorize]` attribute in the codebase is currently non-functional. Combined with wide-open CORS and plaintext, environment-shared secrets in source control, this should be the team's top priority to confirm (Is this intentional for a pre-production phase? If not, when does it need to be fixed before any environment is treated as production-grade?) before broader QA or security review effort is invested elsewhere.

**Architecture summary**: Frontend = 2 independent React/Vite SPAs, no shared workspace. Backend = 2 .NET 10 microservices + 1 YARP gateway, layered architecture, Dapper/stored-procedures, no ORM. Database = single shared SQL Server instance across Pilot/Staging/Live. Integrations = SMTP (active), Azure Blob Storage (present, activity unconfirmed); no payment/SMS/analytics/IdP integrations found. AuthN/Z = self-issued JWT + client-mock session, backend authorization currently non-functional. Testing = Selenium/Reqnroll BDD (Admin console only) + a small NUnit API suite; zero frontend test coverage. Deployment = manual/IIS-oriented (no CI/CD, no containers found in-repo).

**Core business workflows**: (1) public/member access-request → admin approval; (2) end-user login → browse entitled apps → SSO-style launch; (3) admin organization/product/license management; (4) admin role/rights management; (5) platform email configuration/templates; (6) operational-integrity dashboard monitoring.

**Critical business rules**: organization status is DB-constrained; role names/product licenses must be unique (409 on conflict); rights are evaluated once at login, not per-request; launch codes are one-time-use and time-limited; access-request save validation and outcome codes differ between the public multi-app form and the in-app single-app request.

**High-risk areas**: the authorization bypass (§15/§19 #1); zero automated coverage of the entire CFR end-user portal and the Dashboard; the unresolved question of whether request approval actually grants entitlement; residual mock-data dependency in a real admin page (`LicenseDetails.tsx`); shared Pilot/Staging/Live database.

**Technical debt**: unused Hangfire and Serilog infrastructure; several dead/orphaned code paths (frontend and backend); two stale claims in the existing `CLAUDE.md` files (now corrected here); no database migration tooling.

**Test gaps**: entire CFR portal app, Dashboard content/calculations, Access-Request approve/reject/info-request actions, and all frontend form validation — none have automated coverage today.

**Unknowns**: literal meanings of "CFR"/"Acutis"; the relationship between the documented (but unimplemented) App Registry/App Switcher architecture and this repo; whether request-approval auto-grants entitlement; whether the authorization bypass is a known/accepted interim state; server-side password-policy enforcement; production hosting specifics for the frontends.
