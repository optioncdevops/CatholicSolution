# Catholic Solutions Workspace — v1.6.4

**Release:** v1.6.4  
**Architecture:** independent-domain multi-app SaaS monorepo with centralized login

This repository contains one independently deployable React/Vite application per Catholic Solutions product. Product applications are deployment-independent, while authentication entry is centralized on one Catholic Solutions Login domain. Shared platform source is maintained once under `packages/shared`.



### v1.6.4 ArcAlerts space-optimized user preferences

- ArcAlerts User Preferences keeps the v1.6.3 profile-driven destination model while significantly reducing row height and visual bulk.
- Member identity, Voice, Email, and Text remain four scan-friendly columns; channel options use compact two-line destination rows with smaller toggles/type badges and tighter spacing.
- Multi-destination Enable all/Clear behavior, individual destination toggles, Primary/Unlisted metadata, availability filters, and Unified Directory sourcing are unchanged.
- Desktop table width is reduced so more of the grid fits without unnecessary horizontal travel, while bounded scrolling shows more members per viewport.

### v1.6.3 ArcAlerts profile-driven user preferences

- ArcAlerts User Preferences now reads telephone and email destinations from the shared Unified Directory profile projection instead of maintaining a separate preference-only contact list.
- Every available profile email address is shown independently (Home, Work, Organization), so a member can enable one address, multiple addresses, or all available addresses for Email alerts.
- Voice and Text use the same profile-driven model for available Home, Work, and Mobile telephone numbers; unavailable contact methods are shown as unavailable rather than rendering a misleading toggle.
- Primary and Unlisted directory metadata remain visible, and multi-destination cells provide an Enable all/Clear shortcut without preventing individual opt-out.
- Channel filters represent members who have that contact method available, while the footer reports the number of individually enabled destinations.


### v1.6.2 Explicit product tab policy

- Product navigation remains centralized in `packages/shared/src/app/config/appCatalog.ts`; cards, Details actions, and the shared App Switcher consume the same metadata-driven rule.
- Only **AI Lesson Plan Generator, FerrerWorks, Mass Card Requests, Vincent Volunteer, Berchmans, and Alive Date** open in a protected new browser tab (`noopener noreferrer`).
- **OptionC School, Matt Money, ArcAlerts, OptionC Parish, Catholic Content, Unified Directory, and Support Center** open in the current tab.
- Same-tab is now the catalog default; new-tab behavior must be explicitly declared per product so future apps do not accidentally open a new tab.


### v1.6.1 Launch policy and ArcAlerts compose refinement

- AI Lesson Plan Generator temporarily returns to the approved external XtraCoach destination at `https://demo.optionc.com/XtraCoach`. App Hub, Details, and the shared App Switcher open it in a new tab; the native `apps/ai-lesson-plan` workspace remains dormant for future review and is not the active catalog destination.
- App Hub and App Switcher use one catalog-driven launch policy: product destinations open in a protected new tab (`noopener noreferrer`) by default, while **Support Center** is the explicit same-tab exception.
- ArcAlerts New Alert uses channel-driven expandable **Email details**, **Voice details**, and **Text details** panels. A detail panel is present only while its channel is selected.
- Email details include Subject, Reply-To Email, formatting toolbar, message body, and attachment entry; Voice details include callback number, record-by-phone action, and Voice Recording ID; Text details include message length and SMS segment guidance.
- ArcAlerts Members and Groups each provide **Select all** and **Clear selection** controls. Select All populates the individual selections rather than locking them, so any specific member or group can still be unchecked afterward.


### v1.5.2 Directory export, Support defaults, and first-party Lesson Plan

- Unified Directory **Print** renders only the currently filtered member-detail dataset in a dedicated print document; it no longer prints the shell, toolbar, detail panel, or unrelated page content. CSV export remains member-detail only.
- Add/Edit member telephone and email rows use aligned compact field/Primary/Unlisted columns with consistent control heights.
- Support Center new tickets default **Support area** to **Member Services** unless a contextual deep link explicitly provides another supported area. Cancel is grouped directly beside Close ticket in the resolved-ticket action set.
- **AI Lesson Plan Generator** is now a first-party Catholic Solutions workspace under `apps/ai-lesson-plan`; the old XtraCoach external destination is removed. The new source uses shared auth/shell conventions and a populated Week / Day / List lesson-plan workspace.
- Development: `npm run dev:lesson-plan` on port `4010`. Targeted build: `npm run build:lesson-plan`. Hosted origin remains centralized in `packages/shared/src/auth/appAuthConfig.ts` and is intentionally left unconfigured until an approved production domain is supplied.

### v1.5.1 Navigation, table and communication-form refinement

- Matt Money now uses a compact Administrator/Member selector in the page header and a full-width horizontal module bar directly below the header. The module bar fills available desktop width while preserving the existing URL-addressable `?view=<role>&section=<module>` contract.
- Shared data tables use a consistent enterprise treatment: stronger neutral headers, subtle alternating row surfaces, restrained hover feedback, and existing selected-row states preserved. Matt Money and ArcAlerts list tables opt into the same shared treatment while Directory, Catholic Content and ArcAlerts Preferences inherit it through their established table classes.
- The shared profile menu renames **Security** to **Change password** with clearer password-specific supporting copy; the existing password modal and recovery routes are unchanged.
- Authenticated Request App confirmation now follows the approved **REQUEST RECEIVED / Thank you for your interest!** hierarchy, names the requested SaaS app, confirms successful receipt, states the 24-hour Member Services follow-up, and retains the signed-in member/contact context.
- ArcAlerts New Alert removes the redundant **Unified Directory / Choose individual members or one or more directory groups** copy and presents Members/Groups plus the selection count in one compact recipient toolbar.
- ArcAlerts Settings fixes required-marker and field-label alignment by giving labels a stable inline baseline, keeping paired controls aligned across the two-column form.

### v1.5.0 Directory-driven communication and workspace refinement

- Authenticated **Request app** actions on App Hub no longer navigate to the public Request Access form. They show a signed-in confirmation dialog using the current member identity and explain that Member Services will contact the member within 24 hours.
- Matt Money adds role-aware portal navigation. Administrator and Member views keep their existing overview dashboards and expose URL-addressable finance modules through `?view=<role>&section=<module>`.
- ArcAlerts removes Push from active channel surfaces. New Alert recipients are sourced from a shared Unified Directory recipient projection and support multi-member selection, multi-group selection, and All Groups. User Preferences use a denser two-line identity column with typed Home/Work/Mobile/Organization contact destinations, and Settings follows the approved Reply-To / Caller ID / recording phone / timezone / failed-alert notice / ArcAlerts-name contract.
- Catholic Content returns to an attachment-aligned month/category link model without dropdowns or horizontal scrolling. Month and Search share the first row, Categories wrap naturally on the second row, and overview, discovery, resource list, preview, and rights notice live inside one primary library card.
- Unified Directory adds SaaS-app and group filters, Print and CSV export, renames **Last activity** to **Last accessed**, replaces the Groups **Connected apps** column with Description, removes SaaS assignment from group creation, and restricts user add/edit SaaS choices to Matt Money and ArcAlerts. New-user contact capture supports Home/Work/Mobile telephone records with Unlisted/Primary and Home/Work/Organization email records with Primary.
- Support Center is consolidated into one primary card. Resolved tickets are hidden by default, new-ticket layout uses a compact three-control row plus full-width message, **Start ticket** wording, and open conversations provide Cancel, Close ticket, and Send reply with the approved closure guidance.

### v1.4.5 Support Center in-place upgrade build repair

- Keeps the Resource Library retired while adding a zero-render compatibility shim for the legacy `SupportResourcePanel.tsx` path.
- The shim exists only so extracting a newer source bundle over an older working folder overwrites the stale pre-v1.4.1 component instead of leaving TypeScript to compile an obsolete import of `supportResources`.
- `SupportCenterPage` continues to use only the full-width ticket inbox, conversation pane, and new-ticket form.
- Fresh clones and clean extractions behave identically; no Resource Library UI or dataset is restored.

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
- AI Lesson Plan Generator is a first-party **Your Apps** workspace under `apps/ai-lesson-plan`; AI/Discover cards continue to expose the consistent in-card **Request app** action.
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

The shared switcher is catalog-synchronized with the published destinations in App Hub **Your Apps**. It exposes available first-party Catholic Solutions applications plus published partner products; unpublished `Friar Friend` remains App Hub-only until it has a destination. The launcher uses three columns whenever more than six destinations are available and falls back to two columns on very narrow screens.

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


## v1.5.2 review update

- Unified Directory Print now renders only the filtered member-detail table; CSV export remains member-only.
- Directory telephone/email capture uses aligned compact columns with centered Primary/Unlisted controls.
- Support Center defaults new tickets to Member Services and groups Cancel directly with Close ticket.
- AI Lesson Plan Generator is now a first-party workspace under `apps/ai-lesson-plan` instead of an external XtraCoach link. It includes populated Week, Day and List views with term/week/grade/course/teacher filters and shared Catholic Solutions authentication.

### v1.5.3 Matt Money navigation refinement
- Matt Money now uses a compact enterprise finance navigation bar directly below the shared product header, before page-specific heading/content.
- Finance modules are left-aligned content-width tabs with a restrained active underline instead of large equal-width dashboard-style tiles.
- Administrator/Member is a separate workspace-scope control on the right of the navigation bar and moves below the module row responsively.
- Existing `?view=...&section=...` URLs and dashboard functionality are preserved.

## Lesson Plan workspace v1.6.0

The first-party AI Lesson Plan Generator now implements the complete workflow modeled by the supplied XtraCoach/OptionC Lesson Plan reference while staying inside the Catholic Solutions shared shell. Week/Day/List planning also includes previous/next week controls, records-per-page, Print/CSV actions, and the reference bulk-planning inputs; Reports include class/course, concept, term, student search, and learning-stage filters. The workspace includes My Classes and Class Summary, Day/Week/Month Calendar, Unit Plans, Week/Day/List Lesson Plans, new/edit lesson forms with the 19-section planning structure, templates, shared plans, bulk generation, XtraCoach preparation/preview, Student Portal/My Learning, an adaptive XtraCoach player, integration flow, and learning-evidence Reports.

Run locally with `npm run dev:lesson-plan` and open `http://localhost:4010/lesson-plans`. Production/staging builds use the existing workspace build commands; the hosted Lesson Plan origin remains centralized in `packages/shared/src/auth/appAuthConfig.ts` and must be populated only when an approved domain is available.
