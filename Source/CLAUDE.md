# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This repo is two independent halves that share no build tooling — treat them as separate projects that happen to live in one tree:

```text
backend/     .NET 10 solution — API Gateway + microservices (see backend/CatholicSolution.slnx)
frontend/    a set of fully independent npm projects (see frontend/CLAUDE.md)
```

**Read `frontend/CLAUDE.md` before touching anything under `frontend/`** — it documents the no-shared-workspace boundary between `cfr/`, `cfr-admin/`, and each `SaaS_Apps/<project>/`, the duplicated auth/registry/design-system code, and per-project commands. That guidance is not repeated here.

## Backend

### Commands

Run from `backend/` (or point `dotnet` at `CatholicSolution.slnx`):

```bash
dotnet build CatholicSolution.slnx
dotnet run --project Gateway/CFR.Gateway/CFR.Gateway.csproj
dotnet run --project Microservices/CFR.Acutis/CFR.Acutis.csproj
dotnet run --project Microservices/CFR.Portal/CFR.Portal.csproj
```

There is no test project in the solution yet. TargetFramework is `net10.0` across all projects; SDK installed is `10.0.400`.

### Architecture

The solution is a **gateway + microservices** layout under `backend/`:

- **`Gateway/CFR.Gateway`** — the only public entry point. An ASP.NET Core app that is almost entirely a [YARP](https://microsoft.github.io/reverse-proxy/) reverse proxy: it terminates JWT auth, rate limiting, response caching, Swagger/Scalar docs, and forwards `/acutis/*` and `/portal/*` to the downstream services by stripping the path prefix and routing to the cluster in `appsettings.{Environment}.json` under `ReverseProxy`. Downstream origins/toggles live under the `Gateway:*` config keys (`AcutisUpstreamOrigin`, `PortalUpstreamOrigin`, `AcutisEnabled`, etc.) in the same file — add a new downstream service by adding a route + cluster pair there, not in code.
- **`Microservices/CFR.Acutis`, `Microservices/CFR.Portal`** — the two downstream services the gateway proxies to. Currently these are still bare `dotnet new webapi` scaffolds (no project references to `CFR.Base`/`CFR.Common`/`Infrastructure`/`Service` yet) — when building out real endpoints here, wire them up to the shared platform layers below rather than reinventing auth/logging/config locally.
- **`Infrastructure/CFR.AcutisInfrastructure`, `Infrastructure/CFR.PortalInfrastructure`** — per-service infrastructure layer (data access, external integrations), one per microservice. Currently empty scaffolds.
- **`Platform/CFR.Base`** — shared ASP.NET Core host-building blocks consumed by the Gateway (and intended for the microservices too): `WebApplicationBuilderExtensions`/`CommonServiceExtension`/`CommonAppExtension` (`AddCustomConfiguration`, `AddCommonServicesSetup`, `AddSwaggerGenSetup`, `AddAuthenticationSetup`, `UseCommonAppGatewaySetup`), `RateLimiterExtensions`, JWT (`JWTSetting`, `IJwtTokenGenerator`), global exception/client-info middlewares, and Scalar/Swagger UI wiring. This is the layer to extend for cross-cutting host concerns.
- **`Platform/CFR.Common`** — framework-agnostic shared helpers with no ASP.NET Core dependency: HTTP client helper, logging (`AppLogger`), auth models, constants/enums, message catalog, Excel/NPOI and XML/JSON helpers. Depended on by `CFR.DBEngine` and `CFR.CommonService`.
- **`Platform/CFR.DBEngine`** — Dapper + `Microsoft.Data.SqlClient` data-access layer, depends on `CFR.Common`.
- **`Service/CFR.CommonService`, `Service/CFR.AcutisService`, `Service/CFR.PortalService`** — service-layer projects; `CFR.CommonService` depends on `CFR.Common` and is itself a dependency of `CFR.Base`. `CFR.AcutisService`/`CFR.PortalService` are currently empty scaffolds intended to hold Acutis/Portal-specific business logic.

Dependency direction, low to high: `CFR.Common` → `CFR.DBEngine` / `CFR.CommonService` → `CFR.Base` → `Gateway`. The Acutis/Portal verticals (`Infrastructure/*`, `Service/CFR.*Service`, `Microservices/CFR.*`) are scaffolded as parallel per-service stacks but are not yet wired to each other or to `Platform/*` — expect to add those `ProjectReference`s as real functionality is built out.

Auth is JWT-based, configured via the `JWTSetting` section (`SecurityKey`, `Audience`, `Issuer`) in each project's `appsettings.json`; the Gateway also has a `DisableAuthenticationPolicy` escape hatch for local/system access — check `CFR.Base/DisablePolicy.cs` before relying on it outside development.

## Frontend

See `frontend/CLAUDE.md` for the full architecture writeup. In short: `frontend/cfr/`, `frontend/cfr-admin/`, and each `frontend/SaaS_Apps/<project>/` are independent React 19 + Vite + TypeScript(`strict`) projects — no shared workspace, no root `npm install`. Always `cd` into the specific project first, then:

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build:production
```

There is no test runner in any frontend project; the validation loop is `typecheck` → `lint` → `build:production`.
