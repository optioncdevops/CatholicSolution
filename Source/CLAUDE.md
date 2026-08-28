# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This repo holds two independent halves that are not wired together in this workspace (no shared build, no proxy config linking them here):

```text
backend/    .NET 10 microservices solution (CatholicSolution.slnx)
frontend/   Independent React/Vite projects (cfr, cfr-admin, SaaS_Apps/*) — see frontend/CLAUDE.md
docs/skillFile/   Source-of-truth coding-standard docs, mirrored as invocable skills
```

Read `frontend/CLAUDE.md` before touching anything under `frontend/` — it documents the project-boundary rules (no npm workspace, no shared registry) for that half in detail. This file only covers `backend/` and repo-wide notes.

## Skills already encode the coding standards — use them

- `docs/skillFile/backend-api-standards-SKILL.md` — the full Controller → Service → Repository → Stored Procedure checklist for the .NET backend (naming, file locations, DTO style, XML comment templates, region ordering, ResultArgs/error codes).
- `docs/skillFile/frontend-standards-SKILL.md` — the full module/feature folder checklist for the frontend (list → partials → service → backend action, `#region` blocks, shared control catalog).

Both are registered as invocable skills. **Before adding, changing, or reviewing any backend endpoint or any frontend module/page, follow the matching skill file as the checklist** rather than improvising a structure — it is more detailed and more current than any summary here.

## Backend (`backend/`)

### Solution layout

.NET 10, layered per microservice, one shared `CatholicSolution.slnx`:

```text
Platform/
  CFR.Base          cross-cutting ASP.NET wiring: BaseController, JWT/auth setup, rate limiting,
                    Hangfire, Serilog/Scalar/Swagger setup, ConfigurationLoader
  CFR.Common        shared constants/helpers: ErrorCodes/ErrorMessages, APIActionName, Constant,
                    MessageCatalog (SerilogErrorMessages), AuthModels
  CFR.DBEngine      Dapper wrapper (IDapperHandler), MSResultArgs, ErrorLog
Infrastructure/
  CFR.AcutisInfrastructure, CFR.PortalInfrastructure
                    per-microservice data layer: StoredProc.cs, SQLParams.cs (DBParameterName),
                    Models/Input, Models/Output, Repositorys/{Module}/
Service/
  CFR.AcutisService, CFR.PortalService, CFR.CommonService
                    per-microservice business layer: Interfaces/{Module}/, Service/{Module}/
Microservices/
  CFR.Acutis, CFR.Portal
                    API hosts: Controllers/{Module}/, Program.cs, ServiceExtension.cs (DI),
                    appsettings.{Environment}.json
Gateway/
  CFR.Gateway       YARP reverse proxy in front of the microservices + Swagger/Scalar aggregation
Tests/
  CFR.Acutis.Tests  currently empty (no .csproj) — there is no working test suite yet
```

`CFR.Portal` is scaffolded (Program.cs/DI only, no controllers yet) — `CFR.Acutis` is the reference implementation to copy from.

### Request flow (every endpoint, every microservice)

```
Client -> {Feature}Controller (HTTP only, one-line return, BaseController.ApiResultArgs)
       -> I{Feature}Service    (try/catch + Serilog + MSResultArgs/ResultArgs — the ONLY layer with try/catch)
       -> I{Feature}Repository (DynamicParameters + one-line Dapper call — no try/catch)
       -> SQL Server stored procedure
```

A single stored procedure is commonly reused for a whole CRUD surface via an `ActionId` discriminator parameter (see `Acutis_Users_CRUD` / `UsersRepository.cs` — ActionId 1=save, 2=status update, 3=get by id, 4=list, 5=lookups) rather than one stored procedure per action. Follow that convention when extending an existing feature; check the skill file's per-action stored-procedure naming when creating a brand-new feature.

Controllers never hard-code route/action strings — they use `[ActionName(API_{Module}.{Name})]` constants from `CFR.Common/APIActionName.cs`. Route shape is `api/v1/{Controller}/{Action}` (`BaseController` already sets the controller route).

### Configuration

- `ConfigurationLoader.LoadConfiguration()` (`CFR.Base`) reads the **`Environment` key inside `appsettings.json`** (not `ASPNETCORE_ENVIRONMENT`) to decide which `appsettings.{Environment}.json` to layer on top. Each microservice's `appsettings.json` just sets `{"Environment": "Development"}` (or `QA`/`Pilot`/etc.) and the real per-environment values live in the matching `appsettings.{Environment}.json`.
- `CFR.Gateway` is a YARP reverse proxy: `Gateway/CFR.Gateway/appsettings.Development.json` defines `ReverseProxy.Routes`/`Clusters` mapping path prefixes (`/acutis`, `/portal`) to each microservice's local HTTPS port, and strips the prefix before forwarding. Swagger/Scalar on the gateway aggregate the downstream microservices' OpenAPI JSON.

### Commands

There is no documented build/test script beyond the standard .NET CLI, and `Tests/` has no working project yet — there is currently no test suite to run.

```bash
cd backend
dotnet build CatholicSolution.slnx
dotnet run --project Microservices/CFR.Acutis/CFR.Acutis.csproj
dotnet run --project Microservices/CFR.Portal/CFR.Portal.csproj
dotnet run --project Gateway/CFR.Gateway/CFR.Gateway.csproj
```

Run the gateway alongside whichever microservices it proxies to (their local HTTPS ports must match the gateway's `appsettings.Development.json` cluster addresses) when testing end-to-end through the gateway.
