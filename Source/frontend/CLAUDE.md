# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository boundary (read this first)

There is no npm workspace here. This repository is two **fully independent projects** living side by side:

```text
cfr/                      end-user portal + App Hub (own package.json, own build, own deploy)
cfr-admin/                Super Admin console (own package.json, own build, own deploy)
```

Each of `cfr/` and `cfr-admin/` is its own project root: own `package.json`, own lockfile, own `npm install`, own `tsconfig`, own `netlify.toml`/`vercel.json`/`web.config`. **None of them import from, or are compiled by, the other.** There is no shared workspace, no `packages/*`, no monorepo build pipeline.

`cfr/README.md` and `cfr-admin/README.md` describe `src/shared` and `src/registry` as "governed release snapshots" — treat that as aspirational, not implemented: there is currently no sync tooling, and each project's copy of shared/auth/registry code is hand-maintained independently. When editing one project's `src/shared/*`, do not assume the change reaches the other project.

## Commands

Every project is driven the same way, run from inside that project's own directory:

```bash
npm ci               # or npm install
npm run dev
npm run typecheck
npm run lint
npm run build:live   # or build:development / build:pilot / build:staging
```

There is no root-level `npm install`/`npm run dev:*` — always `cd` into the specific project (`cfr/` or `cfr-admin/`) first. Check that project's own `package.json` scripts before assuming a script name from the other project applies; most match the pattern above but confirm.

**There is no test runner anywhere in this repository.** The validation loop for a change is: `npm run typecheck` → `npm run lint` → `npm run build:live`, run inside every project you touched.

## Architecture

- **`cfr/`** — end-user login, request access, App Hub. React 19 + Vite + Tailwind, TypeScript `strict`.
- **`cfr-admin/`** — Super Admin control plane. Same stack as `cfr/`, structurally a sibling, not a package inside `cfr/`.

Each project has four Vite env files that match the backend names: `.env.development`, `.env.pilot`, `.env.staging`, `.env.live`. `npm run dev` uses development; `npm run build:pilot` / `build:staging` / `build:live` load the matching file.

### No single shared app registry — this is intentional, not drift

Each project keeps its **own** copy of the app catalog (`src/registry/appCatalog.ts`). These are **not required to be identical**. `cfr`'s catalog additionally carries App-Hub-only fields (`hubSection`, `launcherEnabled`, `deploymentModel`, `ownership`) that admin does not need. Do not attempt to force these into one shared file — instead, when adding or changing a product, update it directly in every project whose catalog references it.

`shared/platform/config/solutionRegistry.ts` (a separate, narrower registry of central-login-participating solutions) is likewise hand-duplicated per project today.

### Authentication

Auth code (`src/shared/auth/{appAuthConfig.ts, centralAuth.ts, AuthProvider.tsx, ProtectedRoute.tsx}`) is duplicated per project, not shared. `centralAuth.ts` manages a `cs_platform_preview_session` cookie — a mock/dev session adapter, not real SSO. `ProtectedRoute.tsx` is a **client-side-only** gate; it does not validate a session server-side.

**Hosted builds (`pilot` / `staging` / `live`) warn unless `authMode` is `'sso'`.** Until a real identity-provider integration exists, those builds stay on mock/preview auth by design — not a bug to "fix" by reverting the guard. Wiring a real SSO/federation contract is a distinct, larger effort — when that happens, set `authMode: 'sso'` for the project(s) that have it and update `origins`/`loginOrigin`/`authOrigin` accordingly.

### Styling

Each project keeps its own copy of the shared design-system CSS/components under `src/shared/` — same duplication model as the registry and auth code.

## Working conventions

- **Package upgrade rule**: prefer latest mutually-compatible versions within a single project; don't chase a breaking major just for the version number; update that project's `package.json` and lockfile together; run `typecheck`+`lint`+`build:live` in that project after. TypeScript is intentionally pinned to `~6.0.3` across all projects (not the npm-stable 7.x) because `typescript-eslint` v8 warns on TS7 — a deliberate compatibility hold, not a stale dependency.
- **No new dependencies** without explicit approval; TypeScript stays `strict`.
- A change to shared-looking code (auth, registry, design system) in one project does **not** propagate anywhere else — if the same fix is needed elsewhere, apply it in each affected project explicitly.
- No browser is available in this environment — never claim visual verification; state what was checked statically (typecheck/lint/build) and leave rendered confirmation to QA.
