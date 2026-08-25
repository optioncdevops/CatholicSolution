# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository boundary (read this first)

There is no npm workspace here. This repository is a set of **fully independent projects** living side by side:

```text
cfr/                      end-user portal + App Hub (own package.json, own build, own deploy)
cfr-admin/                Super Admin console (own package.json, own build, own deploy)
SaaS_Apps/<project>/      independent business-app projects (OptionC School, Matt Money, ArcAlerts,
                          Parish Hub, Catholic Content, Unified Directory, Support Center, AI Lesson Plan)
```

Each of `cfr/`, `cfr-admin/`, and every `SaaS_Apps/<project>/` is its own project root: own `package.json`, own lockfile, own `npm install`, own `tsconfig`, own `netlify.toml`/`vercel.json`/`web.config`. **None of them import from, or are compiled by, any of the others.** There is no shared workspace, no `packages/*`, no monorepo build pipeline. **Never move a `SaaS_Apps/*` project under `cfr/` or `cfr-admin/`, and never add a new business product as a sub-path of `cfr`/`cfr-admin` — it gets its own project root under `SaaS_Apps/`.**

`cfr/README.md` and `cfr-admin/README.md` describe `src/shared` and `src/registry` as "governed release snapshots" — treat that as aspirational, not implemented: there is currently no sync tooling, and each project's copy of shared/auth/registry code is hand-maintained independently. When editing one project's `src/shared/*`, do not assume the change reaches any other project.

## Commands

Every project is driven the same way, run from inside that project's own directory:

```bash
npm ci               # or npm install
npm run dev
npm run typecheck
npm run lint
npm run build:production
```

There is no root-level `npm install`/`npm run dev:*` — always `cd` into the specific project (`cfr/`, `cfr-admin/`, or `SaaS_Apps/<project>/`) first. Check that project's own `package.json` scripts before assuming a script name from another project applies; most match the pattern above but confirm.

**There is no test runner anywhere in this repository.** The validation loop for a change is: `npm run typecheck` → `npm run lint` → `npm run build:production`, run inside every project you touched.

## Architecture

- **`cfr/`** — end-user login, request access, App Hub. React 19 + Vite + Tailwind, TypeScript `strict`.
- **`cfr-admin/`** — Super Admin control plane. Same stack as `cfr/`, structurally a sibling, not a package inside `cfr/`.
- **`SaaS_Apps/<project>/`** — one independent project per business product. Each has its own `src/shared/*` snapshot (auth, app catalog, solution registry, app-switcher integration) copied by hand from `cfr/`'s equivalent when it was created, not imported live.
- **`SaaS_Apps/linked-partner-saas/`** — documentation-only; these partner products (FerrerWorks, Mass Card Requests, Vincent Volunteer, Berchmans, Alive Date, Friar Friend) have no source in this repository, only catalog entries pointing at their own domains.

### No single shared app registry — this is intentional, not drift

Each project keeps its **own** copy of the app catalog (`src/registry/appCatalog.ts` in `cfr`/`cfr-admin`, `src/shared/app/config/appCatalog.ts` in `SaaS_Apps/*`). These are **not required to be identical**: a `SaaS_Apps/<project>` catalog deliberately lists its *own* entry with an in-app `route` (so its own switcher/hub doesn't navigate itself out to its own external domain), while every other entry uses `externalUrl`. `cfr`'s catalog additionally carries App-Hub-only fields (`hubSection`, `launcherEnabled`, `deploymentModel`, `ownership`) that other projects don't need. Do not attempt to force these into one shared file — instead, when adding or changing a product, update it directly in every project whose catalog references it, respecting each project's own self-entry convention.

`shared/platform/config/solutionRegistry.ts` (a separate, narrower registry of central-login-participating solutions) is likewise hand-duplicated per project today.

### App Switcher

Every project loads the switcher as a hosted script + custom element and never hardcodes a destination list beyond its own local catalog:

```html
<script src="https://<platform-cdn>/integrations/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="YOUR_ASSIGNED_APP_ID"></catholic-solutions-app-switcher>
```

Because every product is an independent solution, the switcher only needs an `externalUrl` in a project's local catalog to link to any other solution — adding a new destination never requires touching another project's source or a shared workspace package.

### Authentication

Auth code (`src/shared/auth/{appAuthConfig.ts, centralAuth.ts, AuthProvider.tsx, ProtectedRoute.tsx}`) is duplicated per project, not shared. `centralAuth.ts` manages a `cs_platform_preview_session` cookie — a mock/dev session adapter, not real SSO. `ProtectedRoute.tsx` is a **client-side-only** gate; it does not validate a session server-side.

**`getAppAuthConfig('production')` now throws unless `authMode` is `'sso'`** in every project (`cfr`, `cfr-admin`, and each `SaaS_Apps/*`) — production must not silently fall back to the mock/preview cookie session. Until a real identity-provider integration exists, a production build of any of these projects will throw at config-load time by design; this is intentional given the prototype's current non-functional auth state, not a bug to "fix" by reverting the guard. Wiring a real SSO/federation contract is a distinct, larger effort — when that happens, set `authMode: 'sso'` for the project(s) that have it and update `origins`/`loginOrigin`/`authOrigin` accordingly.

Known gap: `SaaS_Apps/ai-lesson-plan`'s production origin is still `''` (never assigned a hosted domain) — do not invent one; get the real domain before wiring this project's production config.

### Styling

Each project keeps its own copy of the shared design-system CSS/components under `src/shared/` — same duplication model as the registry and auth code.

## Working conventions

- **Package upgrade rule**: prefer latest mutually-compatible versions within a single project; don't chase a breaking major just for the version number; update that project's `package.json` and lockfile together; run `typecheck`+`lint`+`build:production` in that project after. TypeScript is intentionally pinned to `~6.0.3` across all projects (not the npm-stable 7.x) because `typescript-eslint` v8 warns on TS7 — a deliberate compatibility hold, not a stale dependency.
- **No new dependencies** without explicit approval; TypeScript stays `strict`.
- A change to shared-looking code (auth, registry, design system) in one project does **not** propagate anywhere else — if the same fix is needed elsewhere, apply it in each affected project explicitly.
- No browser is available in this environment — never claim visual verification; state what was checked statically (typecheck/lint/build) and leave rendered confirmation to QA.
