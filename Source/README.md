# Catholic Solutions Workspace — v1.3.3

**Release:** v1.3.3  
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

The user-facing centralized Login and App Hub run on `4001`; product applications use `4002`-`4009`. Port `4000` remains unassigned for future platform infrastructure and is not part of the current Login flow.

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

## Authentication and domain configuration

Domain routing is intentionally **not duplicated in Vite environment files**. The one common source of truth is:

```text
packages/shared/src/auth/appAuthConfig.ts
```

It contains the local development origins and the approved hosted origins (`cfr.optioncapp.com`, OptionC School, Matt Money, ArcAlerts, OptionC Parish, Catholic Content, Unified Directory, and Support Center). App Hub launch cards, the shared switcher, central Login redirects, return-URL allowlisting, and logout all consume that same configuration.

Each application has only `.env.development` and `.env.production`. Those files contain per-application metadata such as `VITE_APP_ID`, title, base path, domain-routing flag, and development port; they do not repeat the solution-domain matrix.

### Authentication modes

- Development uses the frontend-only central preview session for local UI testing.
- `build:staging` uses `.env.production` plus a build-time `VITE_DEPLOYMENT_TARGET=staging` flag. It enables a shared preview-session cookie across `*.optioncapp.com`, so the hosted staging Login, App Hub, switcher, and product handoff work without the not-yet-integrated identity backend.
- Production `npm run build` is fail-closed SSO. Because no separate identity provider endpoint is implemented in this frontend repository, production sign-in does not mint a browser-only session or redirect back to the same `/login` route.

The staging preview cookie is intentionally not presented as production authentication: it is JavaScript-managed and therefore cannot replace a server-issued `HttpOnly`, `Secure` session or an OIDC/OAuth authorization-code + PKCE integration.

### Approved hosted origins

```text
https://cfr.optioncapp.com
https://optionc-sms.optioncapp.com
https://matt-money.optioncapp.com
https://arc-alerts.optioncapp.com
https://optionc-parish.optioncapp.com
https://catholic-content.optioncapp.com
https://directory.optioncapp.com
https://support-center.optioncapp.com
```

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

The exported product contains its required shared platform code but intentionally does not include the Central Login application. The Central Login origin is resolved from the copied common `src/shared/auth/appAuthConfig.ts` configuration.

Generate all standalone deliverables with:

```bash
npm run export:all
```

Generated `.artifacts/` content is release output, not development source of truth.

## Shared source rules

`packages/shared` contains only cross-solution concerns: centralized-auth redirect/return handling, authentication guard/shell, common topbar, 9-dot app switcher, profile/account UI, footer, catalog, environment/domain resolver, browser branding, user context, toasts, common UI primitives, and design-system styles.

Product business logic must remain under its owning `apps/<solution>/src` boundary. A product must never import another product's business source.

## Environment files

Every application owns exactly:

```text
.env.development
.env.production
```

There is no `.env.staging` or `.env.example`. Staging intentionally consumes `.env.production`; the staging build helper injects only the non-secret deployment target used to select preview authentication.

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
# Hosted staging build: .env.production + staging preview-auth target
npm run build:staging

# Production build: .env.production + fail-closed SSO
npm run build:production
```

The single maintained product/architecture source of truth is [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).
