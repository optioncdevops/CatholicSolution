# Frontend Design — Acutis Authentication

Scope and date: Task 2, 2026-08-26 (specification). **Implemented Task 9, 2026-08-26** — the
project was scaffolded and integrated with `CFR.Acutis` in this pass (no prior session had created
a frontend project; confirmed absent immediately before this task). This revision documents what
was actually built, with deltas from the original spec called out explicitly rather than silently
replacing it.

## As-implemented summary (Task 9)

- **No react-hook-form, no Axios** — neither is used anywhere in the repo's other `SaaS_Apps/*`
  projects (confirmed by inspection before scaffolding), and adding either would need explicit
  approval per `frontend/CLAUDE.md`'s "no new dependencies" rule, which this task did not seek.
  Forms use plain controlled `useState`; the real API adapter uses the native `fetch` API via a
  small `src/lib/httpClient.ts` wrapper instead of Axios. Functionally equivalent (request/response
  handling, one shared 401 hook, and — as of Task 14 — one shared 403 hook), just without the extra
  dependency.
- **No `src/shared/` design-system port** — sibling `SaaS_Apps/*` projects' `shared/` folders are
  hand-copied snapshots centered on SSO-based auth (`centralAuth.ts`, mock preview sessions), which
  this project must not use (Acutis-only, no SSO). Screens use Tailwind utility classes directly
  instead. Build tooling conventions (Vite/React 19/TS ~6.0.3/Tailwind 4/`tsconfig`/`eslint.config.js`
  shape) were copied from `optionc-school`/`CFR` exactly, per NFR8.
- **`GET /navigation/menus` was implemented server-side in Task 14** (`NavigationController`, see
  [api-contract.md](api-contract.md)) — the real adapter now calls it (`authApi.real.ts`); see
  [Dynamic menus (as built)](#dynamic-menus-as-built) below for the current behavior.
- **No browser automation tool is available in this environment.** Verification performed:
  `npm run typecheck`/`lint`/`build` all pass (build exercises both the `mock`-mode and, via
  `.env.production`'s `VITE_ACUTIS_AUTH_MODE=api`, the real-adapter code path — both compile
  cleanly); the seven backend endpoints were independently exercised live via `curl` and their
  exact JSON shapes confirmed to match the frontend's TypeScript types field-for-field. Actual
  in-browser click-through was **not** performed and is not claimed — consistent with this repo's
  own convention ("no browser is available in this environment — never claim visual verification").

## Project location and conventions

New, independent project at `frontend/SaaS_Apps/acutis/`, per NFR8 in [requirements.md](requirements.md) and `frontend/CLAUDE.md`'s repository boundary rule (confirmed: no `SaaS_Apps/*` project may live under `cfr`/`cfr-admin`; each is its own root). Modeled on the existing `frontend/SaaS_Apps/optionc-school` project structure (confirmed in this study):

**As built (Task 9):**

```
frontend/SaaS_Apps/acutis/
  package.json            # name: "@catholic-solutions/acutis" — dev/build/build:production/build:staging/typecheck/lint/preview
  vite.config.ts / eslint.config.js / tsconfig*.json
  .env.development (VITE_ACUTIS_AUTH_MODE=mock) / .env.production (VITE_ACUTIS_AUTH_MODE=api)
  index.html
  src/
    main.tsx              # BrowserRouter > App
    App.tsx                # route table + AuthProvider
    vite-env.d.ts
    index.css              # @import "tailwindcss"
    lib/
      httpClient.ts         # fetch wrapper; single registerUnauthorizedHandler hook for 401s
      jwt.ts                 # dependency-free exp-claim decode, for client-side expiry checks only
    modules/auth/
      types.ts               # DTOs, field-for-field matching the backend's camelCase JSON
      constants/storageKeys.ts
      api/
        authApi.ts             # AcutisAuthApi interface + ApiError
        authApi.mock.ts        # mirrors the DEV FAKE's exact credential/behavior
        authApi.real.ts        # fetch-based, calls the six implemented endpoints
        index.ts                # VITE_ACUTIS_AUTH_MODE switch — the only mode-selection point
      context/AuthContext.tsx, AuthProvider.tsx
      hooks/useAuth.ts
      pages/LoginPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx, ChangePasswordPage.tsx, UnauthorizedPage.tsx, SessionExpiredPage.tsx
    routes/ProtectedRoute.tsx
    components/NavMenu.tsx
    pages/DashboardPage.tsx   # protected home page — exercises /Me, menus, logout
```

Package manifest mirrors sibling apps: React 19, React Router 7, Vite ~8, TypeScript ~6.0.3, Tailwind 4, same script set plus `lint` (copied from `frontend/CFR`'s `eslint.config.js`, since `optionc-school` has none). **No new runtime dependencies were added** — no Axios, no react-hook-form (see "As-implemented summary" above for why).

## Screens (as built)

| Screen | Route | Purpose |
|---|---|---|
| Login | `/auth/login` | Username/password form, calls `Login`. Adapted from the reference `Login.tsx`'s intent (branding/layout simplified to plain Tailwind, no design-system port — see above) |
| Forgot Password | `/auth/forgot-password` | Email form, calls `ForgotPassword`, always shows the same generic confirmation — **functional**, unlike the reference's `setTimeout`-only stub |
| Reset Password | `/auth/reset-password?token=...` | New password + confirm form, reads `token` from query string, calls `ResetPassword` — new screen, no reference precedent |
| Change Password | `/account/change-password` (protected) | Current + new + confirm password form, calls `ChangePassword` — new screen |
| Unauthorized | `/unauthorized` | Shown when `ProtectedRoute`'s optional `requiredPermission` check fails, or (Task 14) when any API call gets a `403` via `httpClient`'s shared 403 handler |
| Session Expired | `/auth/session-expired` | Shown when `httpClient`'s shared 401 handler fires |
| Dashboard | `/` (protected) | New — not in the original screen list, added as the protected landing page so `/Me`, menu rendering, and logout have somewhere to run end-to-end |

## Auth state and API layer (as built)

- `AuthContext`/`AuthProvider` store exactly: `user` (`AcutisLoginUser`), `token`, `moduleRights`, `menuItems`, plus `isAuthenticated` (expiry-aware — decodes the JWT `exp` claim via `lib/jwt.ts`, not presence-only) and `isInitializing` (so `ProtectedRoute` doesn't flash a redirect before the startup restore-from-`localStorage` effect runs). `hasModuleRole` from the original spec was **not implemented** — no screen needed it, and adding an unused method was avoided; `hasPermission` (by `moduleName`) is implemented and used by `ProtectedRoute`.
- `AcutisAuthApi` interface (`authApi.ts`) — implemented exactly as specified, methods: `login`, `getCurrentUser`, `logout`, `changePassword`, `forgotPassword`, `resetPassword`, `getMenus`. Two implementations (`authApi.mock.ts`, `authApi.real.ts`), switched by `VITE_ACUTIS_AUTH_MODE` in `api/index.ts` — the only file either a component or `AuthProvider` needs to import from.
- **Real implementation**: `fetch`-based (`lib/httpClient.ts`), not Axios. Attaches `Authorization: Bearer <token>` when a token is supplied; on any `401`, calls the single registered `onUnauthorized` handler (set once by `AuthProvider`) before throwing — this is the mechanism that clears session state and redirects to Session Expired, live-verified working end-to-end in Task 9. **Task 14** added the same pattern for `403`: `registerForbiddenHandler`/`onForbidden`, wired by `AuthProvider` to navigate to `/unauthorized` — deliberately *without* clearing session state, since a `403` means the caller is authenticated but not permitted for that one action, unlike `401`'s "this session is no longer valid."
- **Mock implementation**: mirrors the backend DEV FAKE's exact behavior — same one hardcoded credential pair, same "not supported" outcome for password change/reset writes, same always-generic Forgot Password response. This means switching modes changes *only* whether real HTTP requests happen, not observable behavior — verified by design, not just asserted (both adapters were written from the same live-verified backend responses).

## Protected routes (as built)

- `ProtectedRoute` (`routes/ProtectedRoute.tsx`): checks `isAuthenticated` (expiry-aware) → `/auth/login` if false; optional `requiredPermission` prop → `/unauthorized` if the user's `moduleRights` don't include it. The distinct Session-Expired path is **not** driven by this component — it's driven entirely by `httpClient`'s 401 hook, matching the design intent (a plain never-logged-in visit and a token that just expired mid-session are different situations, shown differently).
- Client-side permission gating is UX-only, as specified — the backend independently enforces `[Authorize]` on every endpoint regardless of what the frontend renders (unchanged, live-verified in prior backend tasks).

## Dynamic menus (as built)

- `menuItems` is seeded from the `Login` response and cached in `AuthContext`/`localStorage`, exactly
  as before Task 14 — this is still what renders immediately on login and on session restore.
- **As of Task 14**, `DashboardPage` additionally calls `getMenus(token, menuItems)` on mount to
  refresh from the live `GET /navigation/menus` endpoint (`NavigationController`). The real adapter
  (`authApi.real.ts`) now issues that request; the mock adapter (`authApi.mock.ts`) still returns
  the cached tree unchanged (there is no live backend to call in mock mode) after checking the token
  matches its one dev credential, matching every other mock-mode call's `401` behavior.
  `DashboardPage` treats a refresh failure as non-fatal: it silently keeps showing the
  already-cached `menuItems` rather than surfacing an error, since menus are non-critical UI and
  every other failure mode (401/403) is already handled globally by `httpClient`'s shared handlers.
- `NavMenu` (`components/NavMenu.tsx`) renders the `AcutisMenuGroup[]` tree exactly as returned — no
  client-side filtering/recomputation — and handles an empty array with a plain "no menu items"
  message instead of crashing. Since menu filtering happens entirely server-side (in
  `AcutisMenuMapper`, called from `IAcutisAuthenticationService.GetMenusAsync`), the frontend never
  needs to reason about which items a given user is authorized to see — an empty tree and a
  filtered-down tree look identical to this component, both are just "whatever the server returned."

## What remains unimplemented (honest gaps)

- No visual design system — plain Tailwind utility classes throughout. Acceptable for this task's actual goal (API integration correctness), but a future task could port a real design system if desired.
- Browser-based UI verification was not performed (no browser tool available) — see "As-implemented summary" above.
- `GET /navigation/menus` remains unimplemented server-side; the frontend's cached-menu workaround should be revisited once/if that endpoint is built.
