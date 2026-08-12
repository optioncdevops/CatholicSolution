# Catholic Solutions Workspace

**Release:** v1.3.2  
**Architecture:** independent-domain multi-app SaaS monorepo with centralized login

This repository contains one independently deployable React/Vite application per Catholic Solutions product. Product applications are deployment-independent, while authentication entry is centralized on one Catholic Solutions Login domain. Shared platform source is maintained once under `packages/shared`.

## Repository structure

```text
apps/
  app-hub/                 # Central Login, Request Access, App Hub
  optionc-school/
  matt-money/
  arc-alerts/
  optionc-parish/
  catholic-content/
  unified-directory/
  support-center/
packages/
  shared/
config/
  solutions.json
scripts/
  export-solution.mjs
docs/
  SPECIFICATION.md
```

## Local port plan

Port `4000` remains reserved for a future/local identity provider. The user-facing centralized Login and App Hub run on `4001`; product applications use `4002`-`4009`.

| Application | Workspace | Development URL |
|---|---|---|
| Central Login + App Hub | `@catholic-solutions/app-hub` | `http://localhost:4001` |
| OptionC School | `@catholic-solutions/optionc-school` | `http://localhost:4002` |
| Matt Money | `@catholic-solutions/matt-money` | `http://localhost:4003` |
| ArcAlerts | `@catholic-solutions/arc-alerts` | `http://localhost:4004` |
| OptionC Parish | `@catholic-solutions/optionc-parish` | `http://localhost:4005` |
| Catholic Content | `@catholic-solutions/catholic-content` | `http://localhost:4006` |
| Unified Directory | `@catholic-solutions/unified-directory` | `http://localhost:4007` |
| Support Center | `@catholic-solutions/support-center` | `http://localhost:4009` |

Port `4008` remains intentionally unassigned after Volunteer Manager retirement.

## First-time local setup

Install dependencies once from the repository root:

```bash
npm install
```

## Centralized login development flow

Opening the App Hub root (`http://localhost:4001/`) is an explicit interactive entry point and always lands on the Catholic Solutions Sign In surface before `/apps`, even when a remembered development session exists. The dedicated `/login` handoff route still preserves existing-session auto-return behavior for product-to-login SSO simulation.

Product domains no longer own a login page. If a user directly opens an unauthenticated product URL, the product redirects to the centralized Login domain with the original absolute URL preserved.

For ArcAlerts, run the two runtime dependencies in separate terminals:

**Terminal 1 - Central Login/App Hub**

```bash
npm run dev:hub
```

**Terminal 2 - ArcAlerts**

```bash
npm run dev:alerts
```

Now open:

```text
http://localhost:4004
```

Expected flow:

```text
http://localhost:4004
        ↓ unauthenticated
http://localhost:4001/login?client_id=arc-alerts&returnUrl=http%3A%2F%2Flocalhost%3A4004%2F
        ↓ successful development login
http://localhost:4004/
```

Deep links preserve the complete destination:

```text
http://localhost:4004/members
        ↓
Central Login on localhost:4001
        ↓
http://localhost:4004/members
```

ArcAlerts is still built and deployed independently; the centralized Login domain is a runtime authentication dependency, not a deployment coupling to the App Hub product bundle.

## Authentication configuration

Every application declares both:

```env
VITE_LOGIN_ORIGIN=http://localhost:4001
VITE_AUTH_ORIGIN=http://localhost:4000
```

`VITE_LOGIN_ORIGIN` is the user-facing Catholic Solutions Login application. `VITE_AUTH_ORIGIN` is reserved for the real identity/SSO service. Keeping them separate allows the Login UI and the underlying identity provider to evolve independently.

### Development

```env
VITE_AUTH_MODE=mock
VITE_LOGIN_ORIGIN=http://localhost:4001
VITE_AUTH_ORIGIN=http://localhost:4000
```

Mock mode simulates the central sign-in handoff for frontend development. Port `4000` does not need to run in mock mode.

### Staging / production

```env
VITE_AUTH_MODE=sso
VITE_LOGIN_ORIGIN=https://cfr.optionc.com/
VITE_AUTH_ORIGIN=https://cfr.optionc.com/
```

The checked-in `.env.staging` and `.env.production` files carry the approved Catholic Solutions domain allocation. `.env.example` remains a template with placeholder hostnames. `VITE_*` variables are public browser configuration and must never contain secrets.

## Direct solution build

Build only ArcAlerts:

```bash
npm run typecheck --workspace @catholic-solutions/arc-alerts
npm run build --workspace @catholic-solutions/arc-alerts
npm run build:staging --workspace @catholic-solutions/arc-alerts
```

Deploy only:

```text
apps/arc-alerts/dist/
```

No sibling solution is built or deployed.

## Standalone source export

A selected product can still be exported as a self-contained source package:

```bash
npm run export:solution -- arc-alerts
cd .artifacts/standalone/arc-alerts
npm install
npm run dev
```

The exported product contains its required shared platform code but intentionally does not include the Central Login application. Configure `VITE_LOGIN_ORIGIN` to a running central-login environment.

Generate all standalone deliverables with:

```bash
npm run export:all
```

Generated `.artifacts/` content is release output, not development source of truth.

## Shared source rules

`packages/shared` contains only cross-solution concerns: centralized-auth redirect/return handling, authentication guard/shell, common topbar, 9-dot app switcher, profile/account UI, footer, catalog, environment/domain resolver, browser branding, user context, toasts, common UI primitives, and design-system styles.

Product business logic must remain under its owning `apps/<solution>/src` boundary. A product must never import another product's business source.

## Environment files

Every application owns:

```text
.env.development
.env.staging
.env.production
.env.example
```

Machine-specific overrides should use ignored `.env.local` or `.env.<mode>.local` files.

## Useful commands

```bash
npm run dev:hub
npm run dev:school
npm run dev:money
npm run dev:alerts
npm run dev:parish
npm run dev:content
npm run dev:directory
npm run dev:support

npm run typecheck
npm run lint
npm run build
# Build every application with .env.staging
npm run build:staging --workspaces --if-present
```

The single maintained product/architecture source of truth is [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).
