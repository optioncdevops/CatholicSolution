---
name: playwright-ui-testing-standards
description: Playwright-based UI/UX test authoring standards for the Catholic Solutions / CFR frontends (CFR end-user portal + CFR_Admin console — React 19 + Vite). Use this skill whenever asked to write, add, or review real-browser UI tests with Playwright — e.g. "write a Playwright test for this page", "end-to-end test the App Hub", "test this modal/form in a real browser", "visual regression test", "accessibility test this screen", "test responsive layout", "UI/UX test coverage". Distinct from the project's existing Selenium+Reqnroll BDD suite (Automation.Acutis, CFR_Admin business workflows only — that stays test-case-design's domain) and from unit-testing-standards' Vitest+RTL component/pure-function tests (no real browser, no rendering pipeline). This skill's primary mandate is the frontend/CFR end-user portal, which has ZERO automated coverage of any kind today, plus a UI/UX-quality layer (visual, accessibility, responsive, network-mocked) for both frontends — not a rewrite of the existing Gherkin business-workflow suite.
---

# Playwright UI/UX Testing Standards — Catholic Solutions (CFR)

This skill is for **real-browser UI/UX tests written with Playwright** — actual rendering, actual clicks, actual visual/accessibility checks, optionally with network-level mocking. It sits alongside, not on top of, the project's existing test surfaces:

| Surface | Tool | Scope | Owned by |
|---|---|---|---|
| Business-workflow BDD | Selenium + Reqnroll (Chrome only) | `CFR_Admin` only, 14 `.feature` files | `test-case-design` skill |
| Mocked component/pure-function tests | Vitest + React Testing Library (not yet set up) | Both apps, no real browser | `unit-testing-standards` skill |
| Real-browser UI/UX | **Playwright** (not yet set up anywhere) | **`CFR` end-user portal (currently zero coverage of any kind) as primary target; both apps for visual/a11y/responsive quality** | **this skill** |

Read `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` first if you don't already know the target screen's architecture — this skill assumes that context.

---

## 0. Why Playwright, and why not just extend the existing Selenium suite

`PROJECT_KNOWLEDGE_DOCUMENT.md` §20 and `backend/Automation/Automation.Framework/ViperPages/BasePageObject.cs` document that the existing Selenium suite fights the React app constantly: it relies on `IJavaScriptExecutor`-driven clicks/typing because "the React app either swallows native Selenium key/click events or renders duplicate hidden nav copies," and `WaitFor`/`FindFirstDisplayed`/`ClickFirstDisplayed` polling helpers exist specifically to work around duplicate hidden elements at desktop width. Playwright's auto-waiting and accessibility-tree-based locators (`getByRole`, `getByLabel`) generally handle SPA timing and hydration better, and it adds capabilities this repo has never had: multi-browser (Chromium/Firefox/WebKit, vs. Selenium's Chrome-only), built-in network interception (`page.route`), built-in visual snapshot comparison, a trace viewer, and straightforward `@axe-core/playwright` accessibility scanning.

**This is a genuinely new addition, not a duplicate of an existing tool** — but only because it targets ground the Selenium suite has never covered (`CFR`) or a testing *dimension* it was never built for (visual/a11y/network-isolated UI checks). Do **not** use this skill to re-implement `CFR_Admin`'s existing `.feature` business-workflow scenarios (Login, Product, Organization, UserRoles, etc.) in Playwright — that would fragment tooling for a suite that already works, which is exactly the anti-pattern `unit-testing-standards` and `api-testing-standards` both warn against for their own layers ("don't introduce a second framework without reason"). If asked to test one of those existing business workflows, point back to `test-case-design`/the existing `.feature` files instead.

---

## 1. Current state — nothing exists yet, anywhere

- Neither `frontend/CFR` nor `frontend/CFR_Admin` has Playwright (or any test runner) installed — confirmed via `package.json` (no `@playwright/test` dependency, no `playwright.config.ts` in either project).
- `frontend/CFR` (the end-user portal + App Hub) has **zero automated coverage of any kind** — no Selenium page objects reference it, no `.feature` file drives it (`PROJECT_KNOWLEDGE_DOCUMENT.md` §20/§21). It is the single largest test gap on the entire platform and the natural first target for this skill.
- `frontend/CFR_Admin` has business-workflow coverage via Selenium/Reqnroll, but nothing for visual regression, accessibility, or responsive-layout correctness — all in scope for this skill as an **additive** layer.

Say this explicitly whenever this skill is invoked: you are very likely creating the first Playwright test, and quite possibly the first automated test of any kind for the screen in question if it's in `CFR`.

---

## 2. Project setup (per app — no shared workspace)

`frontend/CLAUDE.md` is explicit: `CFR` and `CFR_Admin` are fully independent projects, no npm workspace, no `packages/*`. Respect that boundary for Playwright too:

- Add `@playwright/test` as a devDependency **independently to each app's own `package.json`** if both need coverage — do not create a third top-level workspace to share it, and do not let one app's Playwright config silently depend on the other app being built/served.
- Config file: `playwright.config.ts` at each app's root, with `use.baseURL` read from that app's own Vite dev server (`npm run dev`) for local runs, and from the appropriate `.env.{mode}`-driven deployed URL for higher environments — mirror the same `VITE_APP_REST_API_BASE_URL`-style environment-file convention already used by each app (`appAcutisClient.ts`/`appPortalClient.ts` for `CFR`, `AxiosInstance.ts` for `CFR_Admin`) rather than inventing a new config mechanism.
- Test file location: `e2e/` at the app root (Playwright's convention), **not** inside `src/` — unlike the Vitest co-location rule in `unit-testing-standards` (`{name}.test.ts` beside `{name}.ts`), Playwright specs test the built/served app as a black box and don't belong inside a feature's source folder.
- npm scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"` (Playwright's interactive mode — genuinely useful here given how much the Selenium suite has struggled with this app's rendering quirks).
- State explicitly when you scaffold this for the first time in either app that you're adding new tooling, not extending something that already existed.

---

## 3. Locator strategy — this app has the same DOM traps the Selenium suite already found

- Prefer `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByText(...)` over CSS selectors — matches Playwright's own best practice and is far more resilient to this codebase's Tailwind-utility-heavy, frequently-restyled class names than a class-selector would be.
- **Expect duplicate/hidden elements at certain viewport widths.** The existing Selenium suite's `BasePageObject.WaitFor`/`FindFirstDisplayed`/`ClickFirstDisplayed` helpers exist specifically because this app's navigation renders duplicate hidden copies at desktop width — the same DOM pattern will trip up a naive Playwright locator too. Use `.first()` combined with an explicit `:visible` filter, or `page.locator(...).filter({ visible: true })`, rather than assuming `getByRole` returns exactly one match; a bare `page.getByRole('link', { name: ... }).click()` that resolves to 2+ elements will throw in strict mode, which is actually a *feature* here — it will immediately surface the same duplicate-node issue Selenium had to work around, rather than silently clicking a hidden copy.
- For icons: `frontend/CFR/src/shared/app/components/UiIcons.tsx` is a hand-rolled inline-SVG set with **no confirmed `aria-label` coverage** — do not rely on icon-only buttons having an accessible name until you've verified it; prefer locating by the surrounding button's visible text or a confirmed `aria-label`, and flag a missing one as an accessibility finding (§7) rather than working around it silently.

---

## 4. Auth bypass recipe — seed real storage keys instead of driving the login UI every test

Both apps use a **mock/preview session model**, not real SSO (`PROJECT_KNOWLEDGE_DOCUMENT.md` §7/§15) — this is actually convenient for fast, reliable Playwright tests, since the "session" is just cookie/storage state you can seed directly. **Verified exact keys, current as of this analysis — re-confirm against source if they've since changed:**

| App | Storage | Key | Shape |
|---|---|---|---|
| Both (`centralAuth.ts`, hand-duplicated per app) | Cookie | `cs_platform_preview_session` | Value is always the literal string `'1'` — presence alone toggles `isAuthenticated` in `AuthProvider`. `Path=/; SameSite=Lax`, `+Secure` outside development. |
| `CFR` | `sessionStorage` | `cfr_portal_token` / `cfr_portal_user` | `cfr_portal_token` is the raw JWT string; `cfr_portal_user` is a JSON-stringified user object (`appPortalClient.ts`) |
| `CFR_Admin` | `localStorage` | `cfr_acutis_auth` (`ACUTIS_AUTH_STORAGE_KEY` in `src/shared/auth/constants/storageKeys.ts`) | JSON-stringified full `AcutisLoginApiResponse` (not a bare token) — `AxiosInstance.ts` does `JSON.parse(localStorage.getItem(ACUTIS_AUTH_STORAGE_KEY))` and reads the token off it |

Recipe:
```ts
// CFR — bypass login for any test that isn't specifically testing the login flow itself
await context.addCookies([{ name: 'cs_platform_preview_session', value: '1', domain: 'localhost', path: '/' }]);
await page.addInitScript(([token, user]) => {
  sessionStorage.setItem('cfr_portal_token', token);
  sessionStorage.setItem('cfr_portal_user', JSON.stringify(user));
}, [fakeToken, fakeUser]);

// CFR_Admin — same cookie, plus its own localStorage shape
await context.addCookies([{ name: 'cs_platform_preview_session', value: '1', domain: 'localhost', path: '/' }]);
await page.addInitScript((loginResponse) => {
  localStorage.setItem('cfr_acutis_auth', JSON.stringify(loginResponse));
}, fakeAcutisLoginResponse);
```
Wrap this as a reusable Playwright fixture (e.g. `authenticatedPage`) per app rather than repeating it inline in every spec. **Do not** use this to skip testing the login flow entirely — write dedicated login-flow specs (§6) that go through the real UI at least once per app, since the login screen itself (demo-credential prefill, fake Google/Microsoft buttons, `returnUrl` handling) is real product surface with its own bugs to catch.

---

## 5. Network-mocking recipe — test the UI without a live backend

Both apps' response envelope is the same shape (`PROJECT_KNOWLEDGE_DOCUMENT.md` §10/§18): `{ statusCode, statusMessage, resultData, errors, traceId, timestamp }`. Playwright's `page.route()` intercepts at the network layer, so it works identically whether the app uses `CFR`'s hand-rolled `fetch` wrappers or `CFR_Admin`'s `axios` — you don't need two different mocking strategies:

```ts
await page.route('**/acutis/api/v1/Products/GetProducts', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ statusCode: 200, statusMessage: 'Success', resultData: [ /* fixture rows */ ] }),
  }),
);
```
This is a genuinely high-value capability this codebase has never had: given there is no CI/CD (`PROJECT_KNOWLEDGE_DOCUMENT.md` §24) and standing up the full .NET + SQL Server stack is heavyweight, network-mocked Playwright tests can verify UI behavior (loading/empty/error states, rendering of a given payload shape) without a live `CFR.Gateway`/database at all — something neither the Selenium suite (which requires a fully running stack) nor a future unit test (which never touches the browser) can do as directly.

**Match each app's parsing quirks when building a mock response**, or the test will pass against a shape the real client never actually needs to handle:
- `CFR`'s client tolerates both PascalCase (`StatusCode`) and camelCase (`statusCode`) and synthesizes a fake envelope for a real `204` — if you're testing the "no data" path, return an actual `204` with an empty body rather than a `200` with an empty array, to match what `BaseController.GetResponseByStatusCode` really sends (`PROJECT_KNOWLEDGE_DOCUMENT.md` §18).
- `CFR_Admin`'s `axios` response/request interceptor clears auth and redirects to `/login` on a real `401` — if you mock a `401` to test that behavior, verify the redirect actually happens rather than just asserting the mock was called.

---

## 6. Priority coverage plan — `CFR` first (it has nothing today)

1. **Login flow** (`CentralLoginPage`) — demo-credential prefill in mock mode, password sign-in (real `PortalLogin/LoginAuthentication` call — either let it hit a real dev backend or mock it per §5), fake Google/Microsoft buttons, `returnUrl` redirect after success, and the open-redirect guard (`getSafeReturnUrl`) — try an unsafe `returnUrl` and confirm it's rejected/normalized rather than followed.
2. **App Hub** (`ProductLaunchPage`, `/apps`) — Your/Available/Future sections render correctly from a mocked `GetAssignedProducts` payload; search/filter box narrows results; Launch button behavior (`window.open` vs `window.location.assign` depending on the app's config) — Playwright can assert a new-tab open via `context.waitForEvent('page')`; Request flow opens `RequestInterestModal` and is correctly disabled/hidden for already-approved or already-requested apps.
3. **Request Access** (public, unauthenticated) — full form validation (required fields, ZIP regex boundary — `^(?:\d{5}(?:-\d{4})?|\d{6})$`, "select at least one application" guard), successful submission shows the `CS-{year}-{id}` confirmation reference.
4. **Modals — test all three independently, not just one** (`AppDetailsModal`, `RequestInterestModal`, `AccountModals`): each implements its own focus-trap/Escape-to-close logic rather than sharing a hook (`PROJECT_KNOWLEDGE_DOCUMENT.md` §8) — a Playwright test (or fix) applied to one does not imply the others behave the same; write the identical focus/Escape/overflow-restore assertions against all three.
5. **Toast behavior** — `ToastProvider` shows one global toast, auto-dismisses after 2600ms, and a second `showToast()` call while one is visible **replaces** the message rather than stacking (`PROJECT_KNOWLEDGE_DOCUMENT.md` §9/§18) — assert this exact non-stacking behavior explicitly, since it's easy to "fix" into a stacking toast queue without anyone noticing the behavior changed.
6. **Empty/loading state inconsistency** — `RequestAccessPage` uses the shared `EmptyState` component, but `ProductLaunchPage` uses an ad-hoc `hub-empty-state` div for the same conceptual state (`PROJECT_KNOWLEDGE_DOCUMENT.md` §9, confirmed at `ProductLaunchPage.tsx:201,223` vs `RequestAccessPage.tsx:151`) — a visual-regression snapshot of both paths will catch future drift between them; note in the test that this is a known, pre-existing inconsistency, not a new bug, unless asked to fix it.

For `CFR_Admin`, once `CFR` has a baseline, add (as a UI/UX-quality layer, not a replacement for the existing `.feature` suite):

7. **Rights-based UI gating** — use the auth-bypass recipe (§4) to seed a token whose `moduleRights` grants `ReadOnly` on a given module, and assert the `ReadOnlyBanner` renders and mutating controls are disabled (`useFeatureAccessLevel.ts`) — this is currently untested at any level and is, per `PROJECT_KNOWLEDGE_DOCUMENT.md` §15, arguably the only authorization enforcement actually working on the whole platform.
8. **Visual regression on the shared design system** — `src/shared/designSystem/styles.css` is hand-duplicated between the two apps with no sync tooling (§7 of the knowledge doc); a Playwright `toHaveScreenshot()` baseline on a handful of shared component patterns (buttons, cards, form fields) in **both** apps makes future silent drift between the two copies visible, tying directly into `regression-testing-standards`' caution about hand-duplicated frontend code.
9. **Accessibility baseline** — run `@axe-core/playwright` against the Dashboard, Organizations list, and the Add/Edit forms; report findings rather than failing the build outright, since no accessibility audit has ever been done on either app — treat the first run as establishing a baseline, not as a pass/fail gate.

---

## 7. UI/UX-specific assertion categories (apply across the coverage plan above)

- **Visual**: `expect(page).toHaveScreenshot()` for layout-sensitive components; keep baselines per-browser (Chromium/Firefox/WebKit render subtly differently) and per-viewport (§ below).
- **Accessibility**: `@axe-core/playwright`'s `AxeBuilder(page).analyze()` — check for missing `aria-label`s on the hand-rolled `UiIcons.tsx` icon buttons specifically, since that's a concrete, named gap rather than a generic sweep.
- **Responsive**: test at minimum a mobile width (the App Hub cards, `CFR_Admin`'s `DataTable`/`CustomDataTable` components) and the desktop width where the Selenium suite's duplicate-hidden-nav issue is known to occur (§3) — confirm Playwright sees only the visible copy at that same width.
- **Loading/empty/error states**: use §5's network mocking to force each state deliberately (slow/never-resolving route for loading, empty `resultData` array for empty, `4xx`/`5xx` for error) rather than relying on real backend timing, which is flaky and, per §0, is exactly the kind of timing issue Playwright is meant to avoid.
- **Toast/modal behavior**: see §6 items 4–5 — these are precise, already-known behaviors to lock in, not open-ended exploration.

---

## 8. Environment safety — reuse this project's existing gating philosophy, don't invent a new one

Even though Playwright tests are UI-only, some flows call a real backend (login, form submission) unless mocked per §5. Where a test is configured to hit a real Development/Pilot/Staging/Live backend rather than a fully mocked one, follow the **same** environment-resolution and mutation-gating philosophy already established by `Automation.Framework.TestEnvironmentContext` and `CFR.Acutis.Tests.ApiTestEnvironment` (see `api-testing-standards` §1 and `regression-testing-standards` §6 item 6: **Staging shares its database/API origin with Live**) — fail-safe to the most locked-down environment when unset, and require an explicit opt-in flag before any test submits real data (e.g. the Request Access form, which creates a real `AccessRequest` row). Reuse the same environment-variable naming convention (`CFR_TEST_ENVIRONMENT`, an allow-mutations flag) rather than inventing Playwright-specific ones — consistency across all four test surfaces in this repo matters more than each one being independently idiomatic.

---

## 9. What NOT to do

- Don't re-implement `CFR_Admin`'s existing Gherkin business-workflow scenarios in Playwright (§0) — that's tooling fragmentation for coverage that already exists.
- Don't assume `getByRole` returns exactly one element on this app without checking — this codebase has a documented duplicate-hidden-element pattern (§3).
- Don't mock a response shape you haven't confirmed the real client can handle (§5) — read the actual `appAcutisClient.ts`/`appPortalClient.ts`/`AxiosInstance.ts` parsing logic first.
- Don't submit real data against Staging or Live without the same mutation-gating discipline the rest of this repo's test surfaces already enforce (§8).
- Don't treat a single modal's fix/test as covering the other two — they are independently implemented (§6 item 4).

---

## 10. Output discipline

- State plainly that `CFR` currently has zero coverage of any kind before presenting new `CFR` tests as "additional."
- Cite the exact component/page file and the specific documented behavior (toast timing, empty-state inconsistency, storage key names, etc.) you're asserting on — this skill's value is in testing this app's *actual, verified* quirks, not generic Playwright boilerplate.
- When a finding surfaces during test authoring (e.g., a missing `aria-label`, an inconsistent empty-state pattern), report it explicitly rather than silently working around it in the test.
- Prefer the coverage order in §6 for an open-ended "add some Playwright tests" request, since it starts with the platform's largest, best-documented UI gap rather than an arbitrary page.
