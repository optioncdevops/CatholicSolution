# Catholic Solutions Workspace — v1.4.4

**Release:** v1.4.4  
**Architecture:** independent-domain multi-app SaaS monorepo with centralized login

This repository contains one independently deployable React/Vite application per Catholic Solutions product. Product applications are deployment-independent, while authentication entry is centralized on one Catholic Solutions Login domain. Shared platform source is maintained once under `packages/shared`.

### v1.4.4 Login catalog and profile identity repair

- Central Login keeps the approved left/right width split but changes the 18-product showcase to compact vertical tiles: product icon above, readable dark product name below, and a restrained category label. Responsive density uses 4/5/6 columns so all products remain visible without turning each card into a wide empty row.
- Explicit product-name/category colors prevent the white-on-white regression caused by inherited brand-panel text color. Short-height desktop rules preserve product names and categories instead of hiding the information users need to identify a product.
- Shared profile avatars are resized and re-centered. A higher-specificity avatar rule overrides the generic summary-span styling that was changing the avatar from grid centering to block layout, so initials remain centered in both the topbar trigger and signed-in summary.

### v1.4.3 Content discovery, password recovery, and group creation

- Catholic Content now uses a search-first, two-row discovery toolbar. Saints-of-the-Day month and Category use compact selects, so the full category catalog is available without horizontal scrolling; local title search also narrows the visible resource list.
- Password recovery now has a complete `/forgot-password` -> `/reset-password` prototype flow with non-enumerating recovery copy, verification code entry, password-strength guidance, confirmation validation, success state, and a recovery link from the shared Security dialog.
- Unified Directory new-user provisioning intentionally exposes only **Matt Money** and **ArcAlerts** as assignable SaaS applications for this phase.
- Create Group now includes searchable active-user selection, selection counts, select-visible/clear-visible behavior, and creates the group with its chosen members in one workflow.

### v1.4.2 UI/UX refinement

- Central Login restores the established balanced left/right desktop split. Product visibility is improved inside the left catalog showcase with larger cards, stronger typography, and responsive 3/4-column density rather than widening the brand panel at the expense of the credential area.
- App Hub hero keeps the approved two-line message but uses less vertical space.
- Shared profile identity alignment is tightened, and Profile/Security dialogs render through a document-body portal so they are no longer clipped or positioned by the sticky topbar/backdrop-filter stacking context.
- Matt Money replaces the small header-level Administrator/Member toggle with a visible workspace selector that explains both dashboard perspectives while preserving `?view=admin|member`.
- ArcAlerts User Preferences uses a clearer sticky preference matrix, readable contact/channel details, explicit filter counts, and a bounded scrolling grid.

### v1.4.1 Content, Directory, and Support review

- Catholic Content discovery is reduced to two control lines: Saints of the Day + Categories share the first line, and library search uses the second. The obsolete top **Request content** action is removed, while real same-tab links route to **Contact Member Services** and **Support Center**.
- Unified Directory removes the four KPI cards and now uses **Active User**, **Inactive Users**, and **Groups** tabs. The prototype contains 132 scrollable directory identities, no role/status columns, SaaS-application access + group assignment during user creation, and group member management.
- Support Center removes the Resource Library panel. A full-width ticket workspace shows the ticket inbox beside either the complete selected-ticket conversation or the **Add New Support Ticket** form; **Close** returns the right pane to the new-ticket form.

### v1.4.0 Review batch

- Login keeps the complete catalog readable in a wider, viewport-fitted desktop ecosystem panel without requiring page scrolling at supported heights.
- Request Access is generated from every currently available catalog product and supports `?product=<id>` preselection from App Hub cards.
- Shared profile UI no longer displays an organization/administrator role line; Profile, Security, and Sign out remain centralized.
- `Forgot password?` is a real `/forgot-password` route with context-preserving, non-enumerating recovery UX.
- App launches, partner links, switcher destinations, Details-modal destinations, and `All apps` now use same-tab navigation by default; users can still use browser-native alternate-tab gestures.
- App Hub hero is reduced to greeting + one supporting line; the apps/approvals/system-status widget is removed.
- AI Lesson Plan Generator moved to **Your Apps** and opens `https://demo.optionc.com/XtraCoach`. AI/Discover cards now expose a consistent in-card **Request app** action.
- Matt Money now has Administrator and Member dashboard views (`?view=admin|member`).
- ArcAlerts Directory now exposes only User Preferences; legacy Members/Groups routes redirect to Preferences, whose grid supports search and Voice/Email/Text channel filters/toggles.

### v1.3.9 Central hosted sign-in repair

- The complete authentication strategy and all Catholic Solutions hosted origins are centralized in `packages/shared/src/auth/appAuthConfig.ts`.
- Development uses local mock authentication. Hosted production-mode builds currently use the common central-session adapter across the approved `*.optioncapp.com` domains, so Sign In on `cfr.optioncapp.com` can hand off to every Catholic Solutions product without the previous production SSO dead-end.
- No application `.env` file contains auth or solution-domain URLs; changing the hosted domain matrix or switching to a real IdP is a shared-auth configuration change rather than an eight-application env change.
- The shared hosted session is an interim frontend integration adapter, not a substitute for a server-issued `HttpOnly` session or OIDC/OAuth Authorization Code + PKCE for a security-sensitive production launch.

### v1.3.8 App Hub themed actions

The primary **Launch/Open** action in `Your Apps` now inherits each product's canonical catalog gradient, with a shared dark contrast scrim, restrained shadow, and accessible focus treatment. `Details` remains neutral so every card keeps a clear primary/secondary hierarchy without turning the section into a wall of saturated controls.

### v1.3.7 Login experience

The Central Login brand panel now uses the canonical shared app catalog to present the complete Catholic Solutions ecosystem in a compact premium light-card showcase. The desktop composition remains viewport-fitted without page scrolling; authentication and launch behavior are unchanged.

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
http://localhost:4004/preferences
        ↓
Central Login on localhost:4001
        ↓
http://localhost:4004/preferences
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
- Hosted staging and production-mode builds resolve their authentication strategy from `packages/shared/src/auth/appAuthConfig.ts`. The current hosted strategy is the shared central-session adapter across the approved `*.optioncapp.com` domains, keeping Login, App Hub, switcher, product handoff, and logout functional while the backend IdP integration is pending.
- `build:staging` still uses `.env.production` plus the build-time `VITE_DEPLOYMENT_TARGET=staging` marker for deployment labeling; it does not require a third environment file.
- A future real production IdP rollout is centralized: change the production auth strategy/origin in `appAuthConfig.ts` and keep every product application on the same contract.

The current hosted session cookie is JavaScript-managed and therefore is not a replacement for a server-issued `HttpOnly`, `Secure` session or an OIDC/OAuth Authorization Code + PKCE integration.

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

The shared switcher is catalog-synchronized with the published destinations in App Hub **Your Apps**. It currently exposes the seven Catholic Solutions applications, the five published partner products, and AI Lesson Plan Generator/XtraCoach; unpublished `Friar Friend` remains App Hub-only until it has a destination. The launcher uses three columns whenever more than six destinations are available and falls back to two columns on very narrow screens.

User-facing partner names are standardized as **Vincent Volunteer**, **Alive Date**, and **Friar Friend**; stable product IDs and public URLs remain unchanged. The desktop Login is tuned as a `100dvh` composition with a wider catalog showcase so the complete product ecosystem and credential area remain readable without page scrolling at supported desktop sizes. App Hub **Your Apps** cards use premium white surfaces with dark text and retain each product's unique gradient through its accent/icon treatment.

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

# Production build: .env.production + centralized hosted auth configuration
npm run build:production

# Target App Hub only in production mode
npm run build:production --workspace @catholic-solutions/app-hub
```

The single maintained product/architecture source of truth is [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).
