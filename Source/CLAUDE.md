# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run everything from `Source/` (the npm workspace root). Install once with `npm install`.

```bash
npm run dev:hub          # Central Login + App Hub on :4001 (auth dependency for every product)
npm run dev:alerts       # product dev servers: dev:school :4002, dev:money :4003, dev:alerts :4004,
                         # dev:parish :4005, dev:content :4006, dev:directory :4007,
                         # dev:support :4009, dev:lesson-plan :4010

npm run typecheck        # tsc -b across all workspaces
npm run lint             # eslint over apps/**/src and packages/shared/src
npm run build            # all workspaces
npm run build:hub        # single workspace (also build:school/money/alerts/parish/content/directory/support)
npm run build:production # .env.production + hosted auth config
npm run build:staging    # .env.production + VITE_DEPLOYMENT_TARGET=staging marker
```

Targeting one workspace directly:

```bash
npm run typecheck --workspace @catholic-solutions/arc-alerts
npm run build --workspace @catholic-solutions/arc-alerts
npx eslint "apps/app-hub/src/**/*.{ts,tsx}"
```

**There is no test runner in this repository** — no vitest/jest/playwright. The accepted validation loop for a change is: targeted `typecheck` → `eslint` on the touched paths → production `build` of the affected workspace. Run the full `npm run typecheck` when you touch `packages/shared`, since every product compiles against it. A change to `packages/shared/src/designSystem/styles.css` should also be sanity-checked for brace balance, and standalone exports regenerated if the release calls for it (`npm run export:solution -- <id>` / `npm run export:all`).

To run a single product against local auth you need two terminals: `npm run dev:hub` (Login on :4001) plus the product's own dev script.

## Architecture

Nine independently deployable React 19 + Vite + Tailwind applications in one npm workspace monorepo, sharing one platform package. Products are **deployment-independent but runtime-coupled to one central Login domain**.

```
apps/<solution>/src/solution/   product business logic — never imported across products
packages/shared/src/            the only cross-product code
config/solutions.json           workspace/port/deployment manifest
docs/SPECIFICATION.md           the living specification (source of truth)
```

Imports use `@/*` for the app's own `src` and `@shared/*` for `packages/shared/src` (declared in each app's `vite.config.ts` alias plus `tsconfig.app.json` paths).

### The three centralized sources of truth

Almost every cross-cutting behavior is derived from one of these — when adding a product, a destination, or a status, extend the data, do not add a parallel list:

1. **`packages/shared/src/app/config/appCatalog.ts`** — `APP_CATALOG` is the canonical product list (id, names, category, icon, gradient, `kind`, `status`/`statusLabel`, `route` or `externalUrl`, `navigationTarget`). Derived exports (`yourApps`, `availableApps`, `futureApps`, `launchableApps`, `availableSwitcherApps`, …) drive App Hub sections, the Login showcase, the App Switcher, and Details modals. `navigationTarget: 'new-tab'` is opt-in; same-tab is the default.
2. **`packages/shared/src/platform/config/solutionRegistry.ts`** — first-party workspaces only: origin, route, favicon, theme color, browser title. `solutionForApp(app)` is what distinguishes a hosted workspace from a catalog-only partner URL.
3. **`packages/shared/src/auth/appAuthConfig.ts`** — every environment's origins and the auth mode. Application `.env.development` / `.env.production` files hold only per-app metadata (`VITE_APP_ID`, title, base path, dev port); they never repeat the domain matrix.

`packages/shared/src/platform/navigation/solutionNavigation.ts` (`resolveAppUrl`, `resolveSolutionUrl`, `resolvePlatformUrl`, `useSolutionNavigation`) is the single destination resolver used by App Hub cards, the switcher, Details actions, and login redirects. An unconfigured origin resolves to an empty string, so callers filter destinations by truthiness rather than by hard-coded availability.

### Authentication flow

Only `apps/app-hub` owns `/login`, `/logout`, `/forgot-password`, `/reset-password`, and `/request-access`; the routes re-export shared components (`CentralLoginPage`, `AuthShell`, …). Products wrap their routes in the shared `ProtectedRoute`, which full-page-redirects to `${LOGIN_ORIGIN}/login?client_id=<app>&returnUrl=<absolute current URL>`. Return URLs are validated with the WHATWG URL parser against the configured origin allowlist — relative-looking inputs like `/\evil.com` must stay rejected. Never add a product-local login page.

Development uses a mock/preview session; hosted builds use a shared central-session cookie adapter across `*.optioncapp.com`. It is an interim frontend adapter, not a server-issued `HttpOnly` session.

### Shell composition

`AppLayout` → `PlatformTopbar` → `PlatformAppSwitcher` + `ProfileMenu` + `Footer` is how every product gets the 9-dot launcher, account dialogs, and footer. There is no per-product copy of these. The switcher also has a framework-neutral Web Component build (`packages/shared/src/platform/integrations/app-switcher/`) generated into the App Hub bundle at build time from the same `APP_CATALOG` — `apps/app-hub/vite.config.ts` and `tsconfig.node.json` own that build step.

The shared `Footer` has two variants: `auth` (Login/Request Access — brand block, Privacy/Terms/Support, legal row) and the default authenticated workspace variant (one compact SaaS row). They are deliberately different; changing one must not change the other.

### Styling

All styling lives in the single `packages/shared/src/designSystem/styles.css` (~6k lines) plus Tailwind utilities. The file is **append-layered by release**: later blocks (`/* ===== v1.7.x … ===== */`) override earlier ones by source order at equal specificity, and earlier superseded rules are usually left in place as dead style. When changing an existing surface, find the newest block that targets the selector and edit or extend there rather than editing the original definition — and check that no later block re-overrides you. Responsive rules are height-tiered as well as width-tiered (e.g. Login `100dvh` composition tiers at `max-height: 820px` / `min-height: 940px`).

## Working conventions

- **Spec-driven.** `docs/SPECIFICATION.md` is the authoritative product/architecture record, organized as numbered release sections. **The newest applicable section supersedes older ones**; do not rewrite historical sections. When a change alters an approved requirement, acceptance criterion, traceability entry, or validation record, append/amend the relevant section instead. Read only the sections relevant to the task — the file is ~2k lines.
- **Product vs. platform boundary.** Product-specific behavior stays inside `apps/<solution>/src`; only genuine cross-product concerns belong in `packages/shared/src`. A product must never import another product's source.
- **Display names vs. technical identifiers are decoupled.** User-facing names live in `APP_CATALOG` / `SOLUTION_REGISTRY` / `VITE_APP_TITLE`; app ids, workspace names, folders, component names, origin keys, and ports are stable and are not renamed with the product (e.g. Parish Hub is still `optionc-parish` everywhere technical).
- **External/partner products are catalog-only**: add an `APP_CATALOG` entry with an absolute HTTP(S) `externalUrl`. Do not create an `apps/*` workspace or `SOLUTION_REGISTRY` entry just to expose one in the launcher.
- **No new dependencies** without explicit approval; TypeScript stays `strict`.
- `.artifacts/` is generated release output (standalone exports), not development source.
- No browser is available in this environment, so never claim visual verification — state what was checked statically and leave rendered confirmation to QA.
