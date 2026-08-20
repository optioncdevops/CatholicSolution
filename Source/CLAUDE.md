# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository boundary (read this first)

This delivery has **two independent source boundaries** living side by side under `Source/`:

```text
Catholic_Solutions/      # the actual platform control plane repo (npm workspace)
External_SaaS_Apps/      # extracted standalone business-app projects, NOT part of the workspace
```

`Catholic_Solutions/` is a v2.0.3 rewrite that intentionally owns **only** the CFR end-user portal, the Super Admin console, and the shared platform/registry/switcher packages. All other business products (OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center, AI Lesson Plan) were removed from `apps/*` and now live under `External_SaaS_Apps/<project>/` as fully independent project roots (their own `package.json`, own `npm install`, own deploy config). **Never move an `External_SaaS_Apps/*` project back under `Catholic_Solutions/apps/`.**

Almost all work happens inside `Catholic_Solutions/`. Treat each `External_SaaS_Apps/<project>` folder as its own repo — `cd` into it and run its own `npm install`/`npm run dev` independently; it shares no workspace, no `packages/shared`, and no build pipeline with `Catholic_Solutions/`.

## Commands (run from `Catholic_Solutions/`)

```bash
npm install
npm run dev:cfr          # CFR / App Hub on :4001
npm run dev:admin        # Super Admin console on :4011

npm run typecheck        # app-switcher + cfr + platform-admin, in that order
npm run lint             # eslint over apps/{cfr,platform-admin}/src, packages/shared/src, packages/app-registry/src, packages/app-switcher
npm run build:production # build:platform (app-switcher) -> build:cfr -> build:admin -> build:legacy-switcher-bridge
npm run build:staging    # cfr + platform-admin staging builds
```

Single-workspace targeting:

```bash
npm run typecheck --workspace @catholic-solutions/cfr
npm run build --workspace @catholic-solutions/platform-admin
npx eslint "apps/cfr/src/**/*.{ts,tsx}"
```

**There is no test runner in this repository.** The validation loop for a change is: targeted `typecheck` → `lint` on touched paths → `npm run build:production`. Run the full `npm run typecheck` for any change under `packages/shared` or `packages/app-registry` since both CFR and Admin compile against them. For App Switcher changes, validate both a plain HTML integration and a React/TSX consumer (`packages/app-switcher/react.d.ts`).

Within an `External_SaaS_Apps/<project>` folder, each has its own `package.json` scripts (typically `dev`/`build`/`typecheck`) — check that project's own `README.md`/`package.json` rather than assuming the platform's script names apply.

## Architecture

Two React 19 + Vite + Tailwind apps and three framework-neutral platform packages in one npm workspace:

```
apps/cfr/                    end-user login, request access, App Hub
apps/platform-admin/         Super Admin control plane
packages/app-registry/       framework-neutral product catalog (the ONLY app list)
packages/app-switcher/       framework-neutral Web Component, distributed to any web stack
packages/shared/             internal React UI/auth/design-system code — used only by CFR/Admin
config/solutions.json        workspace/port/deployment manifest
docs/SPECIFICATION.md        the living specification (source of truth)
```

Do **not** add an independent business product under `apps/*`. A product does not need an `apps/*` workspace, and does not need a `packages/shared`-based UI, to appear in App Hub or the switcher — it needs only a registry record (see below).

### The app registry is the single source of truth

`packages/app-registry/src/appCatalog.ts` is the canonical, framework-neutral product list — id, names, category, `hubSection` (`your`/`available`/`future`), `launcherEnabled`, `deploymentModel`, `ownership` (`first-party`/`partner`), `externalUrl`, `navigationTarget`, status metadata. CFR's App Hub, the Super Admin console, and the published App Switcher projection all derive from this one file. Onboarding or promoting a product is a **registry-only change** — never add source, a workspace, or a `solutionRegistry`-style entry just to expose it.

Key invariants:
- `deploymentModel`, `hubSection`, and `launcherEnabled` are independent concerns: a product can be externally hosted while being Your/Available/Future in CFR.
- `Future Apps` are **never** published to the switcher, even with a known `externalUrl`.
- `Available Apps` (including partner SaaS) keep the v1.6.7 behavior: **Request access** is the primary card action, **Details** is secondary, and the external site opens via the product logo / App Switcher.

### Universal App Switcher

`packages/app-switcher` is a standards-based Custom Element (Shadow DOM) consumable from any stack — React, Angular, plain HTML, server-rendered templates:

```html
<script src="https://<platform-cdn>/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="YOUR_ASSIGNED_APP_ID"></catholic-solutions-app-switcher>
```

The `/v1/` contract is stable; consuming apps never hardcode a destination list. It carries navigation only — never tokens, cookies, or identity payloads. `scripts/copy-legacy-switcher-bridge.mjs` (via `build:legacy-switcher-bridge`) publishes a compatibility bridge alongside the CFR build.

### Authentication

CFR (`apps/cfr`) owns `/login`, `/request-access`, etc. Development uses a mock/preview session adapter shared by CFR and Admin; each app establishes its own session independently in production — do not design cross-domain shared-cookie SSO. Production SSO must go through a standards-based identity provider/federation contract, not client-only role checks. Super Admin mutation operations must call authenticated platform APIs in production; never trust client-side role checks for that surface.

### Styling

Shared styling lives in `packages/shared/src/designSystem/`, consumed by CFR and Admin only.

## Working conventions

- **Spec-driven.** `docs/SPECIFICATION.md` is authoritative, organized as numbered release sections; the newest applicable section supersedes older ones — append/amend rather than rewriting history. `docs/PLATFORM_ARCHITECTURE.md` and `docs/DEVELOPER_GUIDE.md` describe the current (v2.0.x) boundary and are more current than any older architecture notes you might recall from this codebase.
- **Package upgrade rule**: prefer latest mutually-compatible versions; don't chase a breaking major just for the version number; update `package.json` and `package-lock.json` together; run typecheck+lint+`build:production` after; record architecture-affecting upgrades in the Living Specification. Note: TypeScript is intentionally pinned to `~6.0.3` (not the npm-stable 7.x) because current `typescript-eslint` v8 warns on TS7 — this is a deliberate compatibility hold, not a stale dependency.
- **No new dependencies** without explicit approval; TypeScript stays `strict`.
- `.artifacts/` is generated release output (standalone exports), not development source.
- No browser is available in this environment — never claim visual verification; state what was checked statically (typecheck/lint/build) and leave rendered confirmation to QA.
