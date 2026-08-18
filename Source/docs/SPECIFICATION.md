# Catholic Solutions — Living Specification v1.6.7

> **Canonical release baseline:** v1.0.0. **Current release:** v1.6.7. The v1.x line remains the first formal architecture generation; pre-baseline prototype iteration numbers are intentionally not part of the release sequence.

## v1.0 Repository and Solution Architecture

- Use an npm-workspaces monorepo with `apps/*` for independently deployable applications and `packages/*` for reusable cross-application code.
- Each Catholic Solutions product is independently deployable to its own domain and owns its application entry point, routes, feature source, public assets, favicon, environment files, build configuration, SPA fallback, and `dist` output.
- Canonical application folders are `apps/app-hub`, `apps/optionc-school`, `apps/matt-money`, `apps/arc-alerts`, `apps/optionc-parish`, `apps/catholic-content`, `apps/unified-directory`, `apps/support-center`, and `apps/ai-lesson-plan`.
- Workspace package names use the `@catholic-solutions/*` scope.
- `packages/shared` is restricted to genuine cross-product concerns: common authentication guard/login shell, common shell, 9-dot switcher, account/profile UI, footer, catalog, environment/domain navigation, browser branding, user context, notifications/toasts, shared types, and design-system primitives.
- Product-specific business logic MUST remain under its owning `apps/<product>/src` boundary.
- Each app maintains only `.env.development` and `.env.production`. Domain/auth routing is centralized in `packages/shared/src/auth/appAuthConfig.ts`; `VITE_*` values are public client build metadata only and MUST NOT contain secrets.
- Cross-solution navigation resolves configured origins and performs full-domain navigation; React Router is responsible only for routes within the current solution.
- Each app maintains its own favicon and SPA refresh fallback configuration.
- `config/solutions.json` is the machine-readable solution/build manifest; runtime domains are centralized in `packages/shared/src/auth/appAuthConfig.ts`.

**Development model:** Spec-driven development  
**Current version:** 1.6.7  
**Last updated:** August 18, 2026  
**Status:** Active source of truth

This is the only maintained specification document for the React implementation. Every behavior, visual-standard, architecture, data, validation, or scope change must update this file in the same delivery as the code.

## 1. Source baseline and precedence

The application is derived from:

1. Catholic Solutions / OptionC Marketspace Requirements Summary v2.
2. The approved self-contained HTML/CSS/JavaScript prototype.
3. The latest approved HTML reference, `index 4.html`, supplied August 7, 2026.
4. User-approved screenshots and explicit implementation directions supplied after the prototypes.

Precedence is newest explicit user direction first. A newer direction may deliberately supersede a visual choice in the HTML while retaining its latest content or behavior. The key current example is Matt Money: latest HTML data is synchronized, but the earlier dark global Matt Money shell remains superseded by the approved shared-light-dashboard requirement.

## 2. Product purpose and flow

Catholic Solutions is a front-end App Hub prototype for Catholic schools, parishes, ministries, and families. It demonstrates login, application discovery, application launching, account/profile interactions, application switching, and nine first-party product workspaces within the shared Catholic Solutions platform using static prototype data.

Primary flow:

`Login → App Hub → Launch app / View details → Switch app ↔ app → Open App Hub → Sign out`

## 3. Technology and architecture

- React 19+
- TypeScript / TSX in strict mode
- Vite
- Tailwind CSS 4
- React Router
- npm workspaces / monorepo
- One independently deployable frontend application per solution/domain
- One shared platform package for the common SaaS shell and design system
- No additional UI framework unless explicitly approved

### Multi-application SaaS structure

```text
apps/arc-alerts/
apps/catholic-content/
apps/app-hub/              # Login, Request Access, App Hub
apps/unified-directory/
apps/matt-money/
apps/optionc-parish/
apps/optionc-school/      # OptionC School
apps/support-center/
packages/
  shared/                    # common shell, app switcher, profile, catalog, design system
```

- Every solution is a first-class workspace under `apps/*` and owns its own `src`, `public`, Vite/TypeScript configuration, environment files, favicon, deployment fallback, and `dist` output.
- `apps/app-hub` owns Login, Request Access, and the Catholic Solutions App Hub.
- Product-specific source must stay inside the owning `apps/*/src/solution` boundary.
- Cross-cutting UI and runtime behavior lives once under `packages/shared/src`: common topbar, nine-dot App Switcher, profile/account UI, footer, app catalog, current-user prototype context, environment/domain registry, browser branding, common dashboard components, and design-system CSS.
- A solution deployment does **not** include the React page source of the other solutions; common source is imported only from `packages/shared`.

### Domain model

Development ports are intentionally separate so cross-solution behavior can be tested locally:

- Platform / App Hub → `http://localhost:4001`
- OptionC School → `http://localhost:4002`
- Matt Money → `http://localhost:4003`
- ArcAlerts → `http://localhost:4004`
- Parish Hub → `http://localhost:4005`
- Catholic Content → `http://localhost:4006`
- Unified Directory → `http://localhost:4007`
- Support Center → `http://localhost:4009`

Port `4008` was allocated to Volunteer Manager and is intentionally left unassigned after that solution's removal, so the remaining solutions keep their established ports and existing developer bookmarks, proxies, and callback configuration stay valid.

Staging and production use separate configured origins for the same applications. Checked-in `.example` hostnames are placeholders only; approved DNS values must replace them before deployment.

### Cross-solution navigation

- The common 9-dot `PlatformAppSwitcher` is the single application-switching contract for all solution domains.
- Switching to another solution performs a full browser navigation to that solution's configured origin. React Router controls navigation only inside the currently loaded application.
- **Cross-solution and partner application links use same-tab navigation by default.** App Hub Launch/Open, App Switcher destinations, Details-modal Launch/Visit, footer Support, and `All apps` replace the current browser location rather than forcing a new tab. This keeps local development and hosted behavior predictable and avoids multiplying application tabs.
- Navigation controls remain real anchors where a destination is known, so users still retain normal browser context-menu, ctrl/cmd-click, middle-click, and open-in-new-window affordances when they explicitly want another tab.
- Sign-out remains a session event and same-origin tab propagation is preserved for tabs the user opens manually. See §10.5.
- **All apps (App Hub)** always resolves to the Platform origin `/apps`.
- Sign out resolves to the Platform origin `/login`.
- Same-origin navigation uses React Router where possible; cross-origin navigation uses standard browser navigation.
- Individual solutions must not duplicate or fork the common App Switcher/profile shell.

### Environment configuration

Every application contains only:

- `.env.development`
- `.env.production`

These files contain per-application public build metadata only: app ID, title, base path, domain-routing flag, and local development port. Authentication strategy and the complete local/hosted solution-origin matrix are centralized in `packages/shared/src/auth/appAuthConfig.ts`; product environment files must not duplicate those domains. `VITE_*` values remain public browser configuration only and must never contain passwords, private API keys, signing keys, database credentials, or confidential tokens. Machine-specific overrides belong in ignored `.env.local` / `.env.<mode>.local` files.

### Authentication boundary

- Central Login is owned by the Platform origin. Product applications do not own Login routes.
- All Catholic Solutions product origins and the active auth strategy are defined in `packages/shared/src/auth/appAuthConfig.ts`.
- Development uses the local mock/preview adapter. Hosted builds currently use the shared central-session adapter across approved `*.optioncapp.com` subdomains so Login and cross-product handoff remain functional until the backend IdP/session integration is connected.
- The hosted adapter is an interim integration mechanism, not a production security boundary. A security-sensitive production release ultimately requires a server-issued `HttpOnly`, `Secure` session or OIDC/OAuth Authorization Code + PKCE.

### Solution browser branding

- Every application owns its own `public/favicon.svg`.
- Every application owns its own `index.html` and browser title.
- `SolutionHead` maintains solution-specific title, favicon, and theme-color behavior inside the shared shell.

### SPA routing and deployment fallback

- Every application uses `BrowserRouter` and clean URLs.
- Every application includes its own IIS `web.config`, Apache `.htaccess`, Netlify `_redirects` / `netlify.toml`, and Vercel fallback configuration.
- Direct navigation or refresh on an internal route must rewrite to **that application's** `index.html`.
- `VITE_BASE_PATH` remains supported for deployments under a virtual directory, although the preferred domain architecture hosts each solution at its domain root.

### Route inventory by domain

**Platform domain**
- `/login`
- `/forgot-password`
- `/request-access`
- `/apps`

**OptionC School domain**
- `/`

**Matt Money domain**
- `/`

**ArcAlerts domain**
- `/` — Home / Dashboard
- `/about`
- `/new-alert`
- `/alerts`
- `/preferences` — Directory → User Preferences
- `/settings`
- `/best-practices`
- `/members` and `/groups` — legacy compatibility paths that redirect to `/preferences`

**Parish Hub domain**
- `/`

**Catholic Content domain**
- `/`

**Unified Directory domain**
- `/`

**Support Center domain**
- `/`

## 4. Catalog scope

### Launchable apps — 7

1. OptionC School
2. Matt Money
3. ArcAlerts
4. Parish Hub
5. Catholic Content
6. Unified Directory
7. Support Center

Launchable apps are Catholic Solutions solutions: each is an owned `apps/*` deployment behind the central login, present in `SOLUTION_REGISTRY`, and reachable from the App Switcher.

### External / directly openable partner apps — 7

Products hosted on their own domains, outside the Catholic Solutions SSO boundary.

| App | Purpose | Destination |
|---|---|---|
| FerrerWorks | Facility management | `https://ferrerworks.com` |
| Mass Card Requests | Mass card requests | `https://masscardrequests.com` |
| Vincent Volunteer | Volunteer coordination | `https://vincentvolunteer.com` |
| Berchmans | Altar server scheduling | `https://berchmans.app` |
| Alive Date | Alive-date lookup for records upkeep | `https://alivedate.com` |
| AI Lesson Plan Generator | First-party lesson-plan workspace | `apps/ai-lesson-plan` / centralized hosted origin |
| Friar Friend | AI quiz maker | Not published yet |

Rules:

- External apps appear as cards in the App Hub **Your Apps** section alongside the launchable solutions.
- Published external apps may also appear in the shared App Switcher as direct same-tab shortcuts. Their presence in the switcher does **not** imply Catholic Solutions SSO coverage or ownership; they remain outside `SOLUTION_REGISTRY` and the central-session boundary.
- External destinations use normal same-tab anchors by default; users may still explicitly open them in another tab through standard browser controls.
- Unpublished external apps remain excluded from the switcher until a real destination exists. They continue to render in App Hub as non-interactive **Coming soon** cards.
- Request Access is catalog-driven and includes every currently available product, including published partner/direct-open products; only `coming-soon` entries are excluded from selectable access requests.
- They carry no fabricated usage metrics or feature detail. Only what the owning product publishes is shown, so the Details modal omits empty At-a-glance and Key-features sections rather than inventing them.

### AI Tools — 2

1. AI Website Builder
2. AI Attendance Taker

### Discover More Apps — 2

1. Financial Needs Assessment
2. Catholic Camp Finder

Facility Manager, Altar Server Scheduler, and AI Study Guide & Quiz Maker were placeholder catalog entries for products that now exist at real domains. They are promoted into the External partner apps group as FerrerWorks, Berchmans, and Friar Friend rather than being duplicated across two sections of the same page.

The App Hub, App Details modal, and Switch App control must use the centralized typed catalog rather than duplicate application metadata.

## 5. Immutable brand rules

### 5.1 Login

The approved Catholic Solutions Login color identity is locked. Do not change the established navy/gold palette, brand gradient, or core brand identity unless explicitly requested.

### 5.2 App Hub / Landing

The approved Catholic Solutions App Hub navy/gold hero identity is locked. App cards use premium light surfaces with dark text; each product retains its unique catalog gradient as a restrained accent/icon treatment rather than a full-card background.

The Catholic Content launch-card gradient remains `#5B21B6 → #8B5CF6`, matching the approved landing reference even where catalog-detail source data contains a different purple pair.

### 5.3 Dashboard shell

All seven launchable dashboards use one consistent application-shell flavor:

- light sticky top bar;
- white / neutral application chrome;
- app identity at the left;
- one consistent Switch App control;
- App Hub navigation is available inside the Switch App menu rather than as a duplicate top-bar action;
- one consistent profile-avatar/menu placement;
- shared page-heading hierarchy;
- shared white operational surfaces with neutral borders and restrained shadows;
- shared action sizing, spacing rhythm, focus treatment, and responsive behavior.

Product identity is expressed through controlled accent colors, hero/feature surfaces, data visualization colors, icons, and content—not by replacing the shared shell.

## 6. Shared dashboard consistency standard

### Structure

Launchable dashboards use:

- `AppLayout` for the page shell;
- `AppTopbar` for app identity, Switch App, and profile access;
- `DashboardHeader` for a compact eyebrow, page title, status, and page actions; page-level descriptions are intentionally omitted to reduce vertical chrome;
- `PanelHeader` for panel title, description, and panel actions;
- `KpiCard` for standard KPI patterns where applicable;
- `.dashboard-content` for full-width responsive padding;
- `.surface-card` for standard operational surfaces.

### Typography and surfaces

- Inter: body and UI copy.
- Inter: operational headings, metric emphasis, forms, navigation, and general UI copy.
- Source Serif 4: Catholic Solutions brand/editorial emphasis where established.
- Default operational panels are white with subtle neutral borders and restrained shadows.
- Functional hover states must not translate, rotate, or scale layout elements.
- Product accents may change icon, badge, progress, chart, feature-surface, and primary-action colors.

### Actions

- Use a consistent height, radius, typography weight, and focus treatment for actions of the same hierarchy.
- Keep one obvious primary action per relevant section.
- Icon-only controls require an accessible name.
- Hover feedback uses color, border, shadow, or underline rather than layout movement.

### Responsive and accessibility behavior

- Base experience works from 320px upward.
- Grids progressively enhance at wider breakpoints.
- Tables use contained horizontal scrolling on narrow screens.
- Visible `:focus-visible` treatment remains available.
- Escape closes transient overlays/dropdowns where supported.
- Modals close using close control, backdrop, or Escape and restore focus.
- Reduced-motion preferences are respected.
- Interactive functionality must not depend on hover-only information.

## 7. Authentication and access specification

### 7.1 Login

The approved Catholic Solutions navy/gold palette remains immutable, but the Login experience is intentionally redesigned in the approved premium authentication iteration to reach a premium enterprise-authentication standard. Newer explicit UI direction supersedes the earlier requirement to reproduce the dense eight-tile prototype composition literally.

Entry-route contract:

- Opening the App Hub root route `/` is an explicit interactive platform entry and MUST land on the Sign In surface before `/apps`.
- The root route resolves to `/login?entry=platform`; this marker suppresses remembered-session auto-forward only for this explicit platform entry so restarting/opening the App Hub does not visually skip Sign In.
- A successful Sign In from that interactive entry continues to `/apps`.
- The ordinary `/login` route without `entry=platform` retains centralized SSO handoff semantics: when a valid same-origin development session already exists, it may immediately continue to the approved `returnUrl` without asking for credentials again.
- Product applications continue to use `/login?client_id=<solution>&returnUrl=<approved-url>` and MUST NOT be forced through the platform interactive-entry behavior.

Required composition:

- Desktop uses a balanced two-pane authentication shell: Catholic Solutions brand/value context at left, focused account access at right.
- Left brand panel uses the locked navy gradient, gold accents, restrained ambient depth, a concise brand message, the complete catalog-driven Connected Catholic ecosystem showcase, and restrained trust indicators.
- The Login ecosystem showcase renders all canonical `APP_CATALOG` entries with application name and category on premium light tiles; it is informational, not a pre-authentication launcher. Desktop width is intentionally biased toward the showcase so long names/categories remain legible.
- Desktop grid density adapts to available width (3 columns from 1024px, 4 from 1280px, 5 from 1536px, and 6 from 1800px) and tightens vertically at short heights before any critical content is clipped.
- Right authentication panel uses a centered premium sign-in card with a restrained gold/navy top accent, Catholic cross mark, clear headline, and supporting copy.
- Email and password controls use persistent labels, recognizable line icons, approximately 50px control height, visible focus treatment, autocomplete metadata, and password visibility control.
- Remember Me and secure-session status are visually secondary to credential entry.
- Sign In Securely is the dominant primary action.
- Google and Microsoft SSO actions share equal dimensions and hierarchy.
- Protected-access messaging is consolidated into one concise security surface.
- New-to-Catholic-Solutions access request is presented as a separate premium callout below the login card and links to `/request-access`.
- Prototype messaging remains visible but deliberately tertiary.
- On tablet/mobile, the marketing panel is removed and the form becomes a natural single-column scroll experience with the Catholic Solutions brand retained in the compact auth header.

UI/UX acceptance criteria:

1. Approved navy/gold colors and brand identity are unchanged.
2. Credential fields and primary actions meet or exceed 44px visual target height; no essential action depends on hover.
3. Keyboard focus remains clearly visible on inputs, buttons, links, password visibility, SSO, and request-access actions.
4. The page has no horizontal overflow at 320px and wider.
5. Desktop composition must not exhibit the excessive blank-space imbalance or dense miniature tile treatment from the superseded login reference.
6. The brand panel supports the task rather than competing with the sign-in form.
7. No Choose Workspace control is introduced unless explicitly requested.
8. At supported desktop sizes (1024px wide and approximately 620px high or taller), Login remains within `100dvh` without page scrolling; the full catalog showcase and credential panel remain visible and readable. Secondary description/trust copy may compress or hide before product tiles or credential controls clip.
9. `Forgot password?` is a real route to `/forgot-password`, preserves the login query string/return context, accepts an account email, and uses non-enumerating recovery confirmation copy. The prototype must not claim a backend reset email was actually delivered until an identity service is connected.

### 7.2 Request Access

Route: `/request-access`

Request Access is intentionally separate from the Login split-screen shell. It uses a dedicated, full-width organization-onboarding experience with the approved Catholic Solutions palette and a task-first, space-optimized composition. The superseded dark onboarding side panel, large instructional hero copy, and step-card strip must not be used.

Required structure:

- Compact branded top bar containing the Catholic Solutions brand only; redundant sign-in prompts are not shown in the top bar.
- Compact introductory header containing only the `Organization access` eyebrow, page title, and secure-request badge. The previous explanatory paragraph is removed.
- No Organization / Applications / Context process cards or tab-like step buttons above the form.
- One full-width form surface divided into Contact & organization, Applications, and Goals & context sections.
- Section headings use numbered markers and concise supporting copy; instructional content must remain secondary to the actual controls.
- Section 01 — Organization & contact: Full name, Work email, Organization name, Organization type, Role/title, optional Phone.
- Section 02 — Products of interest: selectable cards are generated from every catalog item whose status is not `coming-soon`, using app icon, name, category, and selected indicator. With the current catalog this exposes 17 requestable products and excludes only unpublished Friar Friend. Desktop uses a dense adaptive 6/5/4-column layout before collapsing to 2/1 columns.
- A `?product=<catalog-id>` query parameter preselects a valid available product when Request Access is opened from an App Hub card.
- Section 03 — Goals & next steps: goals/context textarea, compact what-happens-next guidance, required acknowledgement.
- Form footer is the only pre-submit navigation/action zone: prototype disclosure on the left and `Back to sign in` plus `Submit request` on the right. A duplicate Cancel action is not used.
- Submit produces a premium confirmation state on the same route with reference code, clear prototype non-submission disclosure, and Return to Sign In.

Acceptance criteria:

1. Request Access is a real React route, not a toast placeholder.
2. It uses a distinct full-width onboarding layout rather than reusing the Login split-screen shell, while preserving Catholic Solutions brand consistency.
3. No left/dark informational panel, large explanatory hero paragraph, or three-step process-card strip consumes valuable desktop space.
4. `Back to sign in` is not shown above the form; it is positioned with the form actions at the bottom.
5. Form grouping, product selection, and next-step guidance are obvious without instructional clutter.
6. Required fields are visibly identified and programmatically associated with controls.
7. Product cards are keyboard reachable through their checkbox controls and show selected state without relying on color alone.
8. Desktop uses available width efficiently while keeping readable line lengths; tablet/mobile progressively collapse to one column without horizontal page scrolling at 320px and wider.
9. Primary and secondary actions remain visually distinct and easy to reach on desktop and mobile.
10. Confirmation must not imply that a real backend request was sent from the prototype.
11. The product selector stays catalog-driven; adding an available catalog product must not require a second Request Access product list.

## 8. App Hub / Landing specification

### 8.1 Required content

- Locked Catholic Solutions navy/gold top-level identity.
- Time-aware greeting driven by current user first name.
- Compact two-line hero consisting only of the time-aware greeting and one supporting workspace sentence. The previous app-count / approvals / system-status panel is removed.
- Live search across every catalog group, including external partner apps.
- A **Your Apps** section containing the eight launchable first-party solutions plus directly openable/external products in catalog order; **AI Lesson Plan Generator** is first-party under `apps/ai-lesson-plan`, and Friar Friend remains visible as Coming soon.
- Two AI tools: AI Website Builder and AI Attendance Taker.
- Two Discover More apps.
- Responsive app-grid behavior appropriate to the current fourteen-card Your Apps section.

### 8.2 Card action consistency

Landing card actions are deliberately compact but must share one visual hierarchy:

- Launchable cards expose `Launch →` as the compact product-themed primary action and `ⓘ Details` as the neutral secondary action. External/direct-open cards use `Open →` with the same hierarchy.
- Launchable and external partner cards use the same premium white surface and two-column action row. Product identity is carried by the catalog-gradient top accent, gradient icon tile, subtle corner wash, status tone, and themed primary action.
- Primary destinations navigate in the **current tab by default**. Destination controls remain real anchors so the browser still supports explicit ctrl/cmd-click, middle-click, and context-menu open-in-new-tab behavior.
- An unpublished external card replaces the primary action with a non-interactive `Coming soon` control that keeps the shared action geometry so grid alignment is preserved.
- AI and Discover cards expose a themed **Request app →** primary action directly on the card plus the same neutral `ⓘ Details` action. Request app navigates to `/request-access?product=<catalog-id>` so the requested product is preselected.
- All landing card actions are single-line controls. Labels and icons/arrows must never wrap onto a second line.
- Launchable cards use an equal two-column action row so Launch and Details have matching width and vertical alignment.
- AI/Discover Request app and Details use the same compact action geometry as the corresponding Your Apps actions.
- All App Hub cards use readable dark text on light surfaces. Details and Learn More use the shared light secondary treatment; Launch/Open remains the stronger primary action.
- Button geometry is enforced by the shared `.hub-card-action` design-system primitive rather than relying only on per-card utility composition.
- Hidden live-stat rows from the newest HTML must not reserve empty card space.
- Card hover must not use translate/scale/rotate motion.
- Desktop density prioritizes readability over maximum columns: four cards per row from 1280px and five from 1536px; smaller breakpoints progressively collapse.

**Acceptance criteria:** at supported widths, `Launch →` / `Open →` / `Request app →` and `ⓘ Details` remain vertically centered, single-line, visually balanced, and free of label/icon wrapping. Default activation replaces the current location; native browser alternate-tab gestures remain available.

### 8.3 Details modal

Every catalog item uses the shared modal. Required sections:

- branded header, icon, name, and category;
- summary description;
- key features;
- four At-a-glance stats;
- collapsed-by-default `Show more details` control;
- expanded long description;
- `What's included` checklist;
- `Works well with` integrations;
- `Recent activity` for launchable products where supplied, or `Getting started` for requestable products;
- status badge;
- `Launch →` for launchable apps, `Visit site →` for published external/direct-open apps, a disabled `Coming soon` action for unpublished ones, or `Request this app →` for non-launchable catalog apps.

The modal follows the same current-tab navigation policy as App Hub cards (§8.2). Requestable catalog items navigate to `/request-access?product=<catalog-id>` rather than using a toast-only placeholder.

Sections backed by empty data are omitted rather than rendered blank. External partner apps supply no At-a-glance stats and no expanded detail, so those sections do not appear for them.

The expanded control must change to `Show less details` when open.

## 9. Profile and account interactions

The newest HTML profile behavior is part of the React baseline.

Required behavior:

- App Hub and every launchable app top bar use the shared profile avatar/menu.
- Menu displays the current user name and email only; organization/role copy such as `Administrator, St. Mary's Catholic School` is not shown in the shared header/profile UI.
- The trigger uses avatar, name, and a neutral `Account` sublabel on wider screens; the dropdown summary uses `Signed in as`, name, and email.
- Menu actions: Profile, Security, Sign out.
- Edit Profile supports full name, email, and phone. Role / Organization fields are removed from the shared profile editor.
- Profile save updates shared user state, avatar initials, menu identity, and App Hub greeting.
- Change Password supports current/new/confirm fields, per-field show/hide, a four-step strength indicator, and mismatch feedback.
- Profile and password modals close with backdrop, close control, or Escape and restore focus.
- Sign out returns to `/login`.

## 10. Application shell, switcher, and footer

### 10.1 Application navigation

All launchable apps use the same premium light top bar:

- product icon, product name, and product category at left;
- flexible spacer;
- premium App Switcher control;
- shared account/profile control at right.

Do not restore duplicate breadcrumb or direct App Hub actions in the top bar. A single `All apps` App Hub action remains available from the App Switcher.

### 10.2 Premium App Switcher

The App Switcher is a compact recognition-first launcher synchronized with the published destinations in App Hub **Your Apps**. It is intentionally denser than the earlier seven-app layout so the launcher remains useful as the catalog grows without becoming a second landing page.

Required behavior and appearance:

- Use the established 3×3 nine-dot application launcher SVG icon rather than a decorative Unicode glyph.
- Trigger uses a 44px+ target, compact icon container, `Switch app` label on supported widths, and chevron state.
- Dropdown is a compact elevated launcher approximately **448px wide** on desktop, capped by the viewport with `calc(100vw - 24px)`-style behavior. It uses a restrained `JUMP TO` eyebrow and does not show an app count or explanatory paragraph.
- The switcher source is the centralized typed App Hub **Your Apps** collection, filtered to destinations that are immediately openable. The current catalog exposes **13 destinations**: eight launchable Catholic Solutions apps, including AI Lesson Plan Generator, plus five published partner products.
- `Friar Friend` remains excluded while its App Hub card is `Coming soon` and has no published URL. It becomes switcher-eligible automatically when a real destination is supplied.
- When the switcher contains **more than six destinations it renders three cards per row**. Six or fewer destinations render two per row. At very narrow mobile widths the three-column layout may reduce to two columns to preserve usable touch targets and readable names.
- Every destination uses the same compact recognition card: existing catalog gradient/icon plus the full application name only. Category subtitles, descriptions, status badges, and persistent external-link arrows are omitted. Support Center no longer receives a separate full-width treatment.
- The current Catholic Solutions application remains non-navigating and carries `aria-current`. Its visible state is communicated with a restrained warm active background; the previous check badge is removed. Screen-reader-only current-state text remains so the state is not dependent on visual color for assistive technology.
- Non-current destinations remain real anchor links and use **same-tab navigation by default** (§3). Browser ctrl/cmd-click, middle-click, context-menu, and open-in-new-window behavior remain available when intentionally requested by the user.
- The footer contains one full-width `All apps` action back to `/apps` using the same same-tab default. It uses the shared launcher icon and a restrained warm brand surface rather than promotional copy.
- Hover feedback uses border/background/shadow only. No tile translates, scales, rotates, or bounces.
- The menu may use bounded vertical overflow only when viewport height is too small to display the complete grid safely. At normal desktop/mobile portrait heights the 12-destination grid is expected to fit without scrolling.

**Acceptance criteria:** the current 13 published/openable `Your Apps` destinations render in the adaptive three-column launcher on supported desktop widths; no active check badge is visible; the current app uses only the approved active surface; destinations use current-tab navigation by default; `All apps` remains visually separate; and the launcher remains usable from 320px upward.

### 10.3 Premium account menu

- Account trigger uses avatar, current name, neutral Account sublabel on wider screens, and chevron.
- Dropdown summary includes avatar, `Signed in as`, name, and email; no organization/role chip is displayed.
- Profile and Security actions use consistent line icons and descriptive sublabels.
- Sign out is visually separated and returns to `/login`.
- Sign out is a single action with no confirmation step, matching established practice in Google Workspace, Microsoft 365, and Okta. Signing out is cheap to undo — signing back in — so a confirmation dialog would add friction without preventing loss.

### 10.4 Post-login footer

App Hub and every launchable dashboard must render the same premium shared footer.

Required footer content:

- compact Catholic Solutions brand;
- concise platform mission statement on wider screens;
- operational-status indicator for authenticated pages;
- Privacy, Terms, and Support utility actions;
- copyright and `Built in the USA · Mission-driven technology` legal row.

The footer uses the approved deep navy identity with restrained gold detail, responsive stacking, and no page-specific variants after login. Authentication pages use the same component in its secure-auth variant.

### 10.5 Sign-out propagation

Users may still open solutions in multiple tabs through normal browser controls, so sign-out remains a session event rather than a purely component-local action.

**Same-origin propagation is implemented.** `AuthProvider` publishes `signed-in` / `signed-out` on a `BroadcastChannel` keyed to the solution's session, and every mounted provider subscribes. Signing out in one tab immediately drops the others to unauthenticated, so their protected routes redirect to the central Login rather than continuing to render protected content from stale React state. A `storage` listener backs this up for browsers without `BroadcastChannel` and for tabs opened before the channel existed. Both paths are required: `storage` events cover only `localStorage`, while a "remember me" opt-out stores the session in `sessionStorage`, which a new tab inherits a private copy of.

**Cross-origin propagation is not implemented and must not be claimed.** Solutions are deployed on separate domains, and no client-side mechanism can clear another origin's storage. Signing out of one product therefore leaves an already-open tab on a *different* product domain holding its local session until that tab is reloaded, at which point the guard sends it to the central Login.

Closing that gap is identity-platform work, not application work. It requires OIDC front-channel logout — the Login origin renders a hidden iframe per registered solution to that solution's logout endpoint — or back-channel logout driven server-to-server. Both depend on the real identity provider described in §20 and on server-side session state that the current prototype does not have. Until then:

- Sign-out UI must not state or imply that it ends the session everywhere.
- The central `/logout` route remains the authoritative sign-out entry point, clearing the central session so any subsequent product redirect requires credentials again.

## 11. Matt Money — current accepted specification

### 11.1 Superseding visual decision

The dark full-page Matt Money theme shown in the standalone HTML is superseded by the approved consistency requirement. Matt Money must use the same light global shell and operational surfaces as the other dashboards while retaining emerald/teal finance accents.

### 11.2 Required synchronized data and content

Synchronize the latest HTML finance values:

- Available organization account: `$4,280,450`.
- Pending tuition fees: `$840K`.
- Collected this month: `$1.21M`.
- Transactions: `+$450,000`, `+$86,500`, `−$240,000`, `−$68,000`, `−$9,850`.
- Budgets: `72% of $1M`, `54% of $600K`, `88% of $400K`.

Preserve organization-account hero, KPI sparklines, Recent Transactions, Term 1 budgets, Quick Actions, Export report, View ledger, and mock toast interactions.

### 11.3 Administrator and Member dashboard modes

Matt Money exposes two first-class dashboard perspectives from the same application route:

- **Administrator** — organization balance, tuition collections, transaction ledger, budgets, approvals/quick actions, and finance reporting.
- **Member** — household amount due, next auto-pay, annual paid progress, upcoming charges, payment methods, recent payments, statement download, and payment action.

The view selector is an accessible segmented control and is URL-addressable using `?view=admin` or `?view=member`. Switching views updates the query string with replace semantics and does not duplicate routing or app-shell code. Administrator remains the default when no valid view parameter is supplied.

### 11.4 Acceptance criteria

1. Global top bar and operational surfaces match the other launchable dashboards.
2. Emerald/teal communicates finance identity without creating a separate dark shell.
3. Latest USD data is used consistently in App Hub catalog data, details, and finance dashboard.
4. Transaction table remains horizontally scrollable on narrow screens.
5. Login and App Hub brand colors remain unchanged.

## 12. Other dashboard-specific requirements

### OptionC School

Light school-operations dashboard with administrator summary, attendance snapshot, quick actions, weekly school calendar, and approvals workflow. Blue is the primary accent.

### ArcAlerts

ArcAlerts is a light, orange/red-accented emergency and operational communication module. The previous single analytics screen is now the **Home / Dashboard** view and is served from `/` on the dedicated ArcAlerts domain. The attachment-supplied legacy menu is promoted into a modern first-class module navigation system without reproducing the legacy visual style.

#### ArcAlerts information architecture

1. **Home** — KPI cards, delivery trend, channel performance, provider status, and recent alerts.
2. **About** — ArcAlerts purpose, supported communication scenarios, supplied Archangel Gabriel visual, phone-based Voice Alert instructions, organization ID/PIN reference, and printable-instructions action.
3. **New Alert** — title/type, recipient group, multi-channel selection, message, send timing, priority, preview, draft, and send prototype actions.
4. **Alert List** — searchable/filterable alert history with audience, channels, sent time, delivery result, status, an icon-based view-detail action, and export.
5. **Directory → User Preferences** — the only Directory navigation entry. It provides a contact-centric preference grid with family/contact identity, Voice, Email, and Text enable/disable controls, master preference pause/resume, search, channel filters, H/W/M legend, and local Save feedback.
6. **Settings** — organization identity, supplied voice credentials, sender name, timezone, retention, emergency-confirmation setting, and save action.
7. **Best Practices** — pre-send/post-send operational guidance covering emergency use, concise messaging, channel choice, subject quality, audience/timing verification, and delivery review.

The former standalone **Members** and **Groups** Directory options are removed from navigation. Legacy `/members` and `/groups` URLs redirect to `/preferences` so old bookmarks do not break.

**New Prospect Email is not part of the current ArcAlerts scope.**

#### ArcAlerts About source-content contract

The About view must preserve the information supplied in the August 7, 2026 ArcAlerts screenshot while improving presentation only:

- ArcAlerts is described as a flexible notification system for rapid communication with students' parents and staff.
- Supported examples include weather-related closings, schedule changes, event reminders, and other notifications.
- Phone Voice Alert number: `1-877-251-8899`.
- Supplied Organization ID: `19997`; supplied Organization PIN: `1910`.
- Phone flow preserves organization credential entry, recipient-group choices 1/2/3, recording/accept-or-rerecord behavior, and final confirmation-number guidance.

#### ArcAlerts UX acceptance criteria

1. Desktop uses a compact, aligned, sticky left secondary navigation grouped as Communication, Directory, and Administration; **About must appear directly after Home** in Communication so product context is immediately available without being buried under Administration.
2. Tablet/mobile converts the same navigation into a horizontally scrollable secondary menu with the same information architecture and active state.
3. Home remains the default route and preserves the existing dashboard metrics and analytics.
4. New Alert remains a usable prototype form with explicit labels and immediate feedback; it does not claim backend delivery.
5. Alert List supports local search and status filtering without introducing a new dependency; row actions use compact icon-only controls with accessible labels/tooltips instead of text links in the Action column.
6. Members and Groups are not visible navigation destinations. Legacy URLs redirect to User Preferences.
7. User Preferences sits under Directory and presents per-contact Voice/Email/Text toggles plus All contacts / Voice / Email / Text filters, search, master enabled/paused state, and prototype-only local persistence.
8. Settings retains clear inputs/toggles and prototype-only persistence.
9. About reuses the supplied content and Archangel artwork in a modern responsive composition rather than recreating the legacy page.
10. Best Practices is operational guidance, not a marketing page.
11. Shared AppTopbar, App Switcher, footer, responsive rules, focus states, and spacing conventions remain consistent with other launchable modules.

### Parish Hub

Light parish-operations dashboard with latest approved prototype values, including:

- 486 registered families;
- 12 open requests;
- 11 Masses this week;
- `$86,500` August offertory;
- 73 sacraments YTD;
- giving values `$52,300`, `$24,700`, `$9,500`;
- building-fund progress at 68% of a `$500K` goal.

Green remains the primary product accent family.

### Catholic Content

Catholic Content must preserve the latest supplied HTML prototype's functionality and feature scope exactly while improving presentation only. The previous experimental Library/Saints/Saved navigation, local Saved state, filter rail, grade/type filtering, and other added behaviors are superseded. Purple remains the product accent inside the shared light shell.

#### Catholic Content functional-parity + premium-density standard

The React module preserves these source interactions and concepts without adding replacement workflows:

- Introductory Catholic Content resource guidance, including the 1,200+ resource statement and Member Services content-request path.
- **Saints of the Day** month navigation for all twelve months; changing a month updates the visible month context and retains prototype feedback behavior.
- The original **Categories** collection: Fill-in-the-Blanks, Popes, Prayers, Seasons and Feasts, Spelling Activities, Word Scramblers, Workbooks, Writing Papers, and The Pontifical Mission Societies USA.
- Broad search entry using the source dimensions: Saint, Grade, Subject, Patronage, Century, and Content Type.
- The supplied August Saints of the Day resource rows, including Coloring Page and Student/Teacher Word Search editions.
- Resource-row selection updates the document preview title and subtitle.
- The document viewer retains page context, 90% zoom display, zoom out/in, rotate, Summarize, save-to-library, download, print, document-outline, and more-options entry points.
- The Catholic Content Rights and Permissions section remains visible below the viewer.
- All backend-dependent actions remain prototype feedback only; the page does not claim a real PDF, search service, storage service, AI summarization service, or print/download backend.

#### Catholic Content UI/UX acceptance criteria

1. Functional parity with the latest supplied HTML takes precedence over newly invented navigation or content-management features.
2. The month list, category list, search control, resource table, preview, viewer toolbar, Member Services path, and rights notice remain discoverable on the same page.
3. UI improvements are limited to hierarchy, spacing, readable typography, compact surfaces, premium borders/shadows, responsive behavior, keyboard accessibility, sticky table headings, and bounded viewer/list scrolling.
4. No Library/Saints/Saved top-level tabs or persistent local Saved-resource workflow may replace the supplied experience.
5. Desktop keeps the resource list and document preview side by side; smaller screens stack safely without horizontal page overflow.
6. Selected rows use both background emphasis and an explicit preview control so state is not communicated by color alone.
7. Search, category, month, viewer, download/print, and Member Services actions retain prototype semantics until backed by real service contracts.
8. The page must be space optimized: month and category choices use compact horizontal discovery bands, search is integrated into the same discovery surface, and the primary list/preview workspace uses bounded viewport-aware height.
9. The premium treatment is restrained and operational: neutral light chrome, purple Catholic Content accents, subtle depth, compact table rows, a slim dark document toolbar, and a clean document canvas.
10. The rights notice remains visible but uses a compact compliance strip rather than a large standalone content card.
11. UI refinement must not alter the supplied resource dataset, selection semantics, viewer actions, category/month behavior, or prototype feedback messages.

### Unified Directory

Unified Directory is the launchable **Identity & Access** foundation for Catholic Solutions. The current implemented scope remains **Users** and **Groups**; future roles, permissions, provisioning, and lifecycle capabilities stay outside current functionality until separately specified.

#### Unified Directory information architecture

- A prominent, persistent **Users / Groups tab bar** appears directly above the operational workspace; the active tab uses icon, count, surface, and underline treatment so tabs cannot visually disappear into the toolbar.
- Shared KPIs summarize active users, group count, pending invitations, and directory health.
- **Users** supports search across name/email/role/group/source, status filtering, selectable rows, role/group/status/activity visibility, and a focused selected-user panel.
- The selected-user panel exposes group memberships, identity source, last activity, and prototype entry points for Edit access, Resend invitation/Reset password, and Suspend/Restore access.
- **Groups** supports search across group name/type/owner/connected application, selectable rows, member count, owner, application connections, and a focused group-detail panel.
- The selected-group panel exposes Add members, Edit group, and Review access entry points.
- **Invite user** captures full name, work email, and initial role; newly invited users enter local prototype state as `Invited`.
- **Create group** captures group name, group type, and description; newly created groups enter local prototype state with zero members.
- Current identity/group actions remain prototype interactions until APIs and authorization rules are approved.

#### Unified Directory UX acceptance criteria

1. Users and Groups tabs are visually obvious at first glance and remain usable at narrow widths.
2. Search/filter controls are adjacent to the data they affect and never compete with the primary Invite/Create action.
3. Wide-screen data uses a list + selected-detail workspace to reduce repeated modal navigation.
4. Statuses use text labels in addition to color.
5. Tables retain contained horizontal scrolling on narrower screens and detail panels move below the list when needed.
6. Add/invite flows have explicit labels, focus states, and clear primary/secondary actions.
7. No future role/provisioning capability is represented as already implemented.

### Support Center

Support Center is the launchable **Member Services** workspace for help across the Catholic Solutions product suite. The supplied legacy screenshot is a functional reference for resource discovery, support-ticket creation, attachments, contact routing, and ticket history; the React implementation must not copy the legacy single-school visual treatment.

#### Support Center scope

- Support Center appears in **Your Apps**, the App Switcher, connected-workspace preview, search, and App Details through the centralized catalog.
- Domain route: `/` on the dedicated Support Center domain.
- The module supports all currently connected product modules from one shared workspace rather than creating separate support pages per application.
- **Help library:** searchable help articles with a product filter. OptionC School includes the attachment-derived reference topics such as Parent Portal staff access, Parent/Teacher Conferences, Family Profile, Ad Hoc Reports, relatives, and assignments; other products expose representative product-specific resources.
- **Start a support ticket:** displays current user/contact context, organization, product, contact destination, subject, message, and an attachment entry point. Product selection routes the prototype request conceptually to the correct support area.
- **Support tickets:** shows current request number, subject, product, support contact, status, updated time, and a Hide resolved tickets control.
- Ticket creation updates local prototype state and must not claim a real backend submission.
- Member Services remains available for account, organization, billing, or routing questions that do not belong clearly to one product.
- Support Center itself is included with the Catholic Solutions workspace and is excluded from Request Access product-interest selection.

#### Support Center UX acceptance criteria

1. Resource search, ticket creation, and ticket history are visible as one coordinated support workspace on desktop without reproducing the legacy three-column visual styling literally.
2. The page uses the shared light app shell, compact dashboard header, footer, profile menu, and App Switcher.
3. Help articles are product-aware and can be filtered without navigating away from Support Center.
4. Required ticket fields are explicitly labeled and the attachment control is clearly optional.
5. Ticket status never relies on color alone and resolved requests can be hidden or shown.
6. Tablet/mobile layouts stack naturally without reducing form targets below the shared accessibility standard.
7. No new npm dependency is introduced.

## 13. Engineering rules

- Prefer reusable components over duplicated markup.
- Keep TSX files preferably under 300 lines.
- Preserve TypeScript strictness.
- Keep app metadata centralized.
- Do not manipulate feature state with `querySelector`, `innerHTML`, or inline HTML event handlers.
- Use React state, context, refs, and typed handlers.
- Do not add dependencies without explicit approval.
- Preserve routes, responsive behavior, and accepted functionality during refinements.
- When synchronizing a newer HTML reference, port behavior/data into React architecture rather than copying DOM scripting patterns.

## 14. Ownership

- **Senior Full Stack Developer:** architecture, route behavior, state, integration boundaries, latest-source synchronization, and specification integrity.
- **Senior UI/UX Designer:** hierarchy, density, accessibility, visual consistency, and responsive quality.
- **Frontend Developer:** React/TSX/Tailwind implementation using shared components.
- **QA Engineer:** acceptance criteria, regression checks, responsive verification, and accessibility checks.

## 15. Spec-driven Definition of Done

A change is complete only when all applicable items are true:

1. Requirement is recorded in this living specification.
2. Acceptance criteria are explicit.
3. Code is updated against those criteria.
4. Relevant routes/components remain traceable from this document.
5. Structural/automated validation is completed where supported.
6. Known environment limitations are recorded here.
7. Change History is updated in the same delivery.

No separate change-log, decision-log, traceability, component-standard, or validation document should be maintained. This file remains the single maintained project specification.

## 16. Implementation traceability

Paths are repository-relative. Shared platform source lives once under `packages/shared/src` and is consumed by applications through the `@shared` alias; product source stays inside its owning `apps/<solution>/src/solution` boundary.

| Requirement area | Primary implementation |
|---|---|
| Authentication shell | `packages/shared/src/auth/AuthShell.tsx` |
| Central Login | `packages/shared/src/auth/CentralLoginPage.tsx` (routed by `apps/app-hub/src/modules/authentication/LoginPage.tsx`) |
| Password recovery | `packages/shared/src/auth/ForgotPasswordPage.tsx`, `apps/app-hub/src/App.tsx` |
| Central Logout | `packages/shared/src/auth/CentralLogoutPage.tsx` |
| Authentication state | `packages/shared/src/auth/AuthProvider.tsx` |
| Protected-route guard | `packages/shared/src/auth/ProtectedRoute.tsx` |
| Return-URL allowlist and dev callback | `packages/shared/src/auth/centralAuth.ts` |
| Request Access | `apps/app-hub/src/modules/authentication/RequestAccessPage.tsx` |
| App Hub | `apps/app-hub/src/modules/appHub/AppHubPage.tsx`, `AppCard.tsx` |
| Catalog / expanded details data | `packages/shared/src/app/config/appCatalog.ts`, `packages/shared/src/app/types/app.ts` |
| App Details modal | `packages/shared/src/app/components/AppDetailsModal.tsx` |
| Shared current user | `packages/shared/src/app/context/UserContext.tsx` |
| Profile menu | `packages/shared/src/app/components/ProfileMenu.tsx` |
| Profile/password modals | `packages/shared/src/app/components/AccountModals.tsx` |
| Shared app shell | `packages/shared/src/app/layouts/AppLayout.tsx`, `packages/shared/src/platform/shell/PlatformTopbar.tsx` |
| Premium App Switcher | `packages/shared/src/platform/shell/PlatformAppSwitcher.tsx` |
| Solution/domain registry | `packages/shared/src/platform/config/solutionRegistry.ts` |
| Client environment contract | `packages/shared/src/platform/config/environment.ts` |
| Cross-solution navigation | `packages/shared/src/platform/navigation/solutionNavigation.ts`, `PlatformLink.tsx` |
| Browser branding | `packages/shared/src/platform/branding/SolutionHead.tsx` |
| Shared footer | `packages/shared/src/app/components/Footer.tsx` |
| UI line icons | `packages/shared/src/app/components/UiIcons.tsx` |
| Dashboard heading | `packages/shared/src/app/components/DashboardHeader.tsx` |
| Panel heading | `packages/shared/src/app/components/PanelHeader.tsx` |
| Shared KPIs | `packages/shared/src/app/components/KpiCard.tsx` |
| Matt Money | `apps/matt-money/src/solution/MattMoneyPage.tsx`, `MattMoneyAdminDashboard.tsx`, `MattMoneyMemberDashboard.tsx` |
| OptionC School | `apps/optionc-school/src/solution/OptionCSchoolPage.tsx` |
| ArcAlerts | `apps/arc-alerts/src/solution/ArcAlertsPage.tsx`, `apps/arc-alerts/src/solution/components/*`, `apps/arc-alerts/src/solution/assets/*` |
| Parish Hub | `apps/optionc-parish/src/solution/OptionCParishPage.tsx` |
| Catholic Content | `apps/catholic-content/src/solution/CatholicContentPage.tsx`, `apps/catholic-content/src/solution/components/*` |
| Unified Directory | `apps/unified-directory/src/solution/UnifiedDirectoryPage.tsx`, `apps/unified-directory/src/solution/components/*` |
| Support Center | `apps/support-center/src/solution/SupportCenterPage.tsx`, `apps/support-center/src/solution/components/*` |
| Design system | `packages/shared/src/designSystem/styles.css` |
| Solution manifest | `config/solutions.json` |
| Standalone export tooling | `scripts/export-solution.mjs` |

## 17. Current validation record — v1.0

**Date:** August 11, 2026

Completed structural validation for this release:

- Support Center is present as the eighth launchable catalog module and resolves at `/apps/support-center`.
- Support Center uses product-aware resources, a ticket form, local attachment filename state, and local ticket history without claiming backend persistence.
- Request Access excludes Support Center from product-interest selection because Support Center is treated as an included workspace utility.
- App Hub remains capped at six cards per row on large desktop; eight launchable apps therefore wrap to a second row without changing shared card dimensions.
- ArcAlerts uses nine first-class internal views: Home, About, New Alert, Alert List, Members, Groups, Settings, User Preferences, and Best Practices.
- New Prospect Email and `/apps/arc-alerts/prospect-email` are removed from current scope.
- `/apps/arc-alerts` remains the default Home/Dashboard route and wildcard routing supports direct navigation to each current ArcAlerts subview.
- Desktop ArcAlerts navigation is a compact sticky left rail aligned with the module content; the redundant ArcAlerts product-name/communication-center header inside the rail is removed because the global application topbar is the single product-identity surface. About remains immediately after Home, and tablet/mobile preserves the same order in the horizontal equivalent.
- The existing ArcAlerts KPI, trend, channel-performance, provider-status, and recent-alert content remains on Home.
- Members and Groups are read-only directory views with local search/filter only and no mutation actions.
- The About view preserves the supplied ArcAlerts description, phone number, voice-alert instructions, organization ID/PIN values, and supplied Archangel visual while replacing the legacy layout with responsive premium surfaces.
- New Alert, Alert List, Settings, and User Preferences use local React state and toast feedback only; no backend/API delivery is claimed. Alert List row actions use an accessible eye icon with title/ARIA labeling instead of the former text View action.
- ArcAlerts navigation and forms use the existing internal icon/design system and introduce no new npm dependency.
- Unified Directory now uses a highly visible Users/Groups tab system with counts, icons, and an active underline/surface state.
- Unified Directory Users supports text search, status filter, row selection, user details, memberships, identity source, last activity, invitation/reset/access action entry points, and an expanded Invite User form.
- Unified Directory Groups supports text search, row selection, group details, owner/member/application context, Add Members/Edit/Review Access entry points, and an expanded Create Group form.
- Catholic Content preserves latest-HTML functional parity: twelve-month Saints of the Day navigation, the original nine categories, broad search entry, the supplied August resource table, row-driven preview selection, the complete viewer-toolbar action set, Member Services content requests, and Rights & Permissions.
- The previous experimental Library/Saints/Saved tabs, local Saved state, filter rail, and added grade/type filtering remain removed because the current requirement is UI/UX refinement only, not feature redesign.
- Catholic Content now uses compact month/category discovery bands, an integrated search row, a denser resource table, a viewport-aware side-by-side list/preview workspace, a slimmer viewer toolbar, a cleaner document canvas, and a compact compliance strip while preserving all source behaviors.
- No new npm dependency was introduced.
- React/TypeScript source-parser validation completed across 63 executable TS/TSX source files with 0 syntax diagnostics; `vite-env.d.ts` supplies standard Vite asset typing.
- Internal alias/relative import resolution completed with 0 unresolved project imports.
- All TS/TSX sources remain under the preferred 300-line guideline; largest source is the centralized catalog at 273 lines.
- Design-system CSS brace validation remains balanced after the ArcAlerts duplicate-identity cleanup and rail-density refinement.
- The 12 reported Catholic Content semantic TypeScript errors were reproduced against the stale pre-baseline compatibility component shape and corrected: `types` is no longer imported from `contentData`, readonly month/category tuples are accepted by filter option props, and compatibility preview/results no longer reference removed `ContentResource` fields (`type`, `grade`, `category`, `saint`).
- A targeted strict TypeScript check of `contentData.ts`, `ContentFilters.tsx`, `ContentPreview.tsx`, and `ContentResults.tsx` completes with 0 diagnostics using temporary local declarations only for external React/icon dependencies.
- Request Access removes the top Back to Sign In link, explanatory hero paragraph, three-step process-card strip, redundant top-bar sign-in prompt, and duplicate Cancel action. The compact hero now contains only the eyebrow, title, and secure-request badge, while Back to sign in sits beside Submit request in the form footer.
- Request Access source-level syntax validation completes with 0 diagnostics, and design-system CSS braces remain balanced after the density refinement.
- A dependency-backed project build cannot be completed inside this sandbox because installed React/Vite dependencies are unavailable; this release therefore reports source-level validation when dependencies are unavailable and does not claim a full Vite production bundle in this environment.

### Accessibility basis

The implementation targets current WCAG 2.2 interaction guidance: pointer targets are designed above the 24×24 CSS pixel AA minimum and primary form/menu actions intentionally use approximately 44–50px control heights; visible keyboard focus remains part of the design-system contract.

### Build environment and reproducibility

Vite requires a supported Node runtime. The package declares `node: ^20.19.0 || >=22.12.0` and npm 10+ so unsupported local runtimes are identified before production verification. Vite is constrained to a single minor line — now `~8.2.1`, previously `~7.1.2` — to reduce unexpected build drift. See §22 for the current toolchain versions.

The sandbox npm mirror currently returns HTTP 404 for required public packages, including React itself, so a dependency-backed Vite bundle cannot be executed here. In a normal npm-enabled environment run:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

### Manual visual QA matrix

Verify at 320px, 375px, 768px, 1024px, 1440px, and wide desktop:

- Login balance, spacing, form readability, focus states, and brand-color preservation.
- Request Access compact hero, absence of step cards/hero description/top back link, two-column organization fields, product selection, context guidance, footer-level Back to sign in + Submit request actions, confirmation state, and responsive density.
- App Hub footer and profile menu.
- Every launchable dashboard footer placement after content.
- App Switcher trigger, active/current app surface, all 12 published `Your Apps` destinations, three-column desktop density, All apps action, Escape/outside-click closing, and narrow-screen dropdown behavior.
- Profile/Security/Sign out menu behavior.
- Existing App Hub card action consistency, details modal, dashboard responsiveness, and horizontal table scrolling.


### App Switcher launcher standard

- The Switch App trigger uses the shared true 3×3 nine-dot application-launcher icon.
- Launcher width is approximately 448px on desktop and never exceeds the available viewport width.
- The launcher heading is a compact uppercase `JUMP TO` eyebrow rather than a large title/count pair.
- The launcher mirrors the published/openable destinations from App Hub **Your Apps** rather than maintaining a separate product list.
- More than six destinations use a three-column recognition grid; six or fewer use two columns. Very narrow screens may reduce three columns to two to protect touch targets.
- All destination cards use centered catalog icon + full app name. Support Center uses the same card geometry as the other entries.
- App Hub is a separated full-width footer action labelled `All apps`.
- The current workspace is non-navigating and uses a restrained active background with `aria-current`; no extra visible check badge is shown.
- First-party and published external destinations open in new tabs with the appropriate `rel` protections. Unpublished external products are excluded until a URL exists.
- Outside-click close, Escape close, route-change close, and accessible focus states remain mandatory.
- Bounded overflow is permitted only when viewport height is too small for the complete launcher.
- No category subtitle or description is rendered on launcher cards.
- No translate/scale hover motion is permitted.

### v1.0 architecture validation

- Nine independently deployable application workspaces exist under `apps/`.
- Eight product workspaces each own their solution-specific source under `src/solution`; Platform owns only auth/App Hub modules.
- Shared SaaS shell/design-system source exists once under `packages/shared`.
- Every application has development, staging, production, and example environment files.
- Every application has an independent favicon and SPA deep-link fallback files.
- Cross-domain solution registry maps each product to its domain root rather than an `/apps/<product>` route in one SPA.
- ArcAlerts internal paths are domain-relative (`/about`, `/alerts`, etc.).
- Source syntax/import validation for this delivery is recorded in this release baseline.


## 18. Release baseline

### 2026-08-11 — v1.0.0 First formal release baseline

- Established the canonical industry-standard npm-workspaces monorepo structure with independently deployable applications under `apps/*` and reusable cross-solution code under `packages/*`.
- Normalized workspace package scope to `@catholic-solutions/*`.
- Preserved nine independently deployable web applications: App Hub, OptionC School, Matt Money, ArcAlerts, Parish Hub, Catholic Content, Unified Directory, Volunteer Manager, and Support Center.
- Preserved one domain per solution with separate development, staging, and production client configuration.
- Preserved per-application favicon, Vite/TypeScript configuration, and SPA refresh/deep-link fallback files.
- Standardized shared product chrome through `packages/shared` while keeping product business logic inside the owning `apps/<product>/src` boundary.
- Added root `.nvmrc`, `.npmrc`, `.editorconfig`, and `config/solutions.json` for reproducible developer setup and machine-readable solution ownership.
- Historical prototype iteration numbers before this baseline are intentionally not part of the formal release version sequence.

---

## Independent SaaS deployment amendment — v1.0.0

### Architectural rule

Each `apps/<solution>` project is an independent SaaS deployment boundary mapped to its own domain. Releasing one solution MUST NOT require building or deploying any sibling application.

The repository remains a monorepo because common UI/platform behavior benefits from one maintained source under `packages/shared`. This is a source-code reuse boundary, not a deployment coupling boundary.

### Supported release models

1. **Targeted workspace release (preferred CI/CD model).** The CI worker checks out the repository, installs/builds only the selected npm workspace, and publishes only that application's `dist/` output.
2. **Standalone source export.** `npm run export:solution -- <solution>` creates `.artifacts/standalone/<solution>`, copying the selected app and the exact shared platform source it needs. The exported folder supports its own `npm install` and build commands without sibling applications or the root workspace.

### Acceptance criteria

- Every solution owns its own `package.json`, Vite config, TypeScript config, environment files, favicon, SPA rewrite configuration, and `dist/` output.
- Each application can be built independently with `npm run build --workspace <package>`.
- `export:solution` supports all nine domains including the App Hub.
- A standalone export MUST NOT contain path references to `../../packages/shared`.
- Standalone exports MUST NOT contain sibling solution source.
- Common Switch App, profile, footer, catalog, environment/domain navigation, and design-system code remain maintained once under `packages/shared` in the canonical repository.
- Generated standalone copies of shared code are release artifacts only and MUST be regenerated after common-platform changes rather than edited manually.
- Development, staging, and production remain separate Vite modes with per-solution public origin configuration.

### Ownership

- **Senior Full Stack / Platform Developer:** monorepo boundaries, export tooling, domain routing, environment model, CI/build behavior.
- **Frontend Developers:** product-owned implementation under their assigned `apps/<solution>` project.
- **UI/UX / Design System Owner:** shared shell and design-system consistency under `packages/shared`.
- **DevOps:** domain-specific pipeline that invokes only the selected solution build and deploys only its `dist/` artifact.
- **QA:** validate the target solution and shared-shell regression surface without requiring an all-products release.


## 19. v1.1.0 — Direct solution authentication and 4001-series development ports

### Architecture decision

Every solution must be runnable directly without starting the App Hub. Direct access to an unauthenticated solution is handled by that solution itself: it redirects to the local `/login` route, preserves a safe same-application `returnUrl`, and returns the user to the original route after authentication. The App Hub is an optional product-discovery entry point, not a runtime authentication dependency for sibling SaaS applications.

### Development port convention

Port `4000` is reserved for a future/local identity service. The independently runnable web applications use a predictable 4001-series sequence:

- App Hub: `4001`
- OptionC School: `4002`
- Matt Money: `4003`
- ArcAlerts: `4004`
- Parish Hub: `4005`
- Catholic Content: `4006`
- Unified Directory: `4007`
- Volunteer Manager: `4008`
- Support Center: `4009`

Every application's `.env.development`, `.env.example`, Vite fallback port, and `config/solutions.json` must remain synchronized with this allocation. `strictPort: true` remains required so a solution never silently starts on an unexpected port.

### Authentication contract

- All nine applications expose `/login`.
- All protected product routes use the common `ProtectedRoute` from `packages/shared/src/auth`.
- `packages/shared/src/auth` owns the reusable authentication provider, protected-route guard, common authentication shell, and solution-aware login page.
- Development uses `VITE_AUTH_MODE=mock` for frontend-only testing. The mock session is solution-local and may use local/session storage only as a prototype mechanism.
- Staging and production use `VITE_AUTH_MODE=sso` and redirect to `VITE_AUTH_ORIGIN`. Checked-in `.example` identity origins are placeholders only.
- Port `4000` does not need to run during mock-mode development; it is reserved so a future local identity provider can be introduced without changing application ports.
- `VITE_*` configuration remains public client configuration and MUST NOT contain passwords, client secrets, refresh tokens, private API keys, or other secrets.
- Cross-domain production authentication must ultimately be backed by a centralized identity provider; browser local storage is not a production cross-domain SSO mechanism.

### Direct ArcAlerts acceptance flow

Running only:

```bash
npm run dev --workspace @catholic-solutions/arc-alerts
```

starts ArcAlerts at `http://localhost:4004`. If unauthenticated, `/` redirects to `/login`; a nested request such as `/members` redirects to `/login?returnUrl=%2Fmembers`. Successful mock development login returns to the requested ArcAlerts route. App Hub port `4001` is not required for this flow.

### Sign-out behavior

Sign out is application-local. It clears the current solution's development session and navigates to that same solution's `/login` route. It must not redirect to the App Hub merely to sign out.

### Deployment independence

The authentication refinement does not change the deployment boundary: one selected solution can still be type-checked, built, exported, and deployed independently. Generated standalone exports include the shared auth source required by the selected application and no sibling product business source.

### Ownership

- **Senior Solution Architect / Platform Developer:** authentication contract, return URL safety, solution boundaries, centralized-identity integration path.
- **Frontend Developer:** product-owned routes and correct application of the shared guard.
- **DevOps:** real staging/production identity origins, callback allowlists, per-domain deployment configuration, and secrets outside Vite client env files.
- **QA:** direct-domain login, nested-route return, refresh, sign-out, app-switch navigation, and standalone build validation per solution.

### v1.1.0 validation record

- All 9 canonical applications expose `/login` and are wrapped by the shared `AuthProvider`.
- Development ports are synchronized at `4001` through `4009`; no previous `5173`–`5181` references remain in canonical or generated standalone source.
- `config/solutions.json`, each `.env.development`, each `.env.example`, and each Vite strict-port fallback use the same 4001-series allocation.
- Canonical source validation parsed 106 TS/TSX implementation files with 0 syntax diagnostics and 0 unresolved internal relative/`@`/`@shared` imports.
- Generated standalone exports validation parsed 338 TS/TSX implementation files with 0 syntax diagnostics and 0 unresolved internal imports.
- All 9 standalone solution exports are regenerated from the current shared authentication/platform source and contain no `../../packages/shared` dependency paths.
- Shared design-system CSS has balanced braces after the solution-aware authentication additions.
- The largest canonical TS/TSX source remains 273 lines, within the preferred 300-line guideline.
- A dependency-backed Vite build is not claimed for this delivery because `npm install` timed out in the execution environment. Developers should run `npm install` at the repository root and then the selected workspace typecheck/build on a normal npm-enabled machine.

## 20. v1.2.0 — Centralized Login domain and cross-domain return flow

### Superseding authentication decision

This release **supersedes the v1.1.0 per-solution `/login` model**. Product domains no longer render their own login page. The Catholic Solutions Login is centralized on the Platform/App Hub origin configured by `VITE_LOGIN_ORIGIN`.

Each product remains an independently buildable and independently deployable SaaS application. Centralized authentication is a runtime platform dependency only; it does not require sibling product source or sibling product deployment.

### Development origin contract

- `4000` — reserved for the future/local identity provider (`VITE_AUTH_ORIGIN`).
- `4001` — Catholic Solutions Central Login + App Hub (`VITE_LOGIN_ORIGIN` / `VITE_PLATFORM_ORIGIN`).
- `4002` — OptionC School.
- `4003` — Matt Money.
- `4004` — ArcAlerts.
- `4005` — Parish Hub.
- `4006` — Catholic Content.
- `4007` — Unified Directory.
- `4008` — Volunteer Manager.
- `4009` — Support Center.

`VITE_LOGIN_ORIGIN` and `VITE_AUTH_ORIGIN` are intentionally separate. The Login origin owns the user-facing authentication entry screen. The Auth origin represents the underlying identity/SSO service and may be introduced or replaced independently.

### Protected-route contract

For every non-platform solution:

1. A protected route checks the shared authentication state.
2. If unauthenticated, the browser performs a full-domain redirect to `${VITE_LOGIN_ORIGIN}/login`.
3. The request includes a validated `client_id` and the complete absolute current URL as `returnUrl`.
4. The Central Login validates `returnUrl` against configured Catholic Solutions solution origins before using it. Arbitrary external return domains are rejected and fall back to `/apps`.
5. After authentication, the browser returns to the exact approved solution URL, including nested route, query string, and hash.

Example development flow:

```text
http://localhost:4004/members
        ↓
http://localhost:4001/login?client_id=arc-alerts&returnUrl=...
        ↓
Sign in
        ↓
http://localhost:4004/members
```

The product application MUST NOT expose a product-owned `/login` page. Manually requesting a product `/login` URL is treated as an unauthenticated product route and therefore resolves through the central-login guard.

### Development authentication simulation

`VITE_AUTH_MODE=mock` remains frontend-development-only. Because local storage is origin-scoped, the Central Login adds a short-lived development callback marker to the approved return URL. The target product consumes and removes that marker immediately, creates its local mock session, and restores the clean requested URL. This callback marker is not a production authentication token and MUST NOT be used in staging/production.

If a Central Login mock session already exists, a direct request to another product can bounce through port `4001` and return without asking for credentials again, simulating the intended SSO user experience.

### Staging / production SSO contract

- `VITE_AUTH_MODE=sso`.
- Product domains redirect unauthenticated users to `VITE_LOGIN_ORIGIN`.
- The Central Login forwards authentication to the configured `VITE_AUTH_ORIGIN` identity provider.
- Real authorization-code/token validation, secure cookies, PKCE/state/nonce handling, logout propagation, callback allowlists, and server-side/session security are integration responsibilities of the production identity platform.
- Browser local storage and the development callback marker MUST NOT be treated as production cross-domain authentication.
- No secrets may be stored in `VITE_*` variables.

### Sign-out contract

For product applications, Sign out clears the product-local development state and redirects to `${VITE_LOGIN_ORIGIN}/logout` with the current product URL as an approved `returnUrl`. The Central Login clears its own session and then displays the centralized Login page. Product sign-out must not render a product-owned login page.

### Local developer workflow

To test an unauthenticated ArcAlerts direct entry, run only the authentication entry application and the target solution:

```bash
# Terminal 1
npm run dev:hub

# Terminal 2
npm run dev:alerts
```

Then open `http://localhost:4004`. The browser redirects to the Central Login on `http://localhost:4001/login` and returns to ArcAlerts after sign-in. Other sibling product applications do not need to run.

If ArcAlerts already has a valid local development session, `npm run dev:alerts` is sufficient for normal product development until that session is cleared.

### Standalone deployment rule

`npm run export:solution -- <solution>` still produces a self-contained product source package containing the common redirect/auth guard code it needs. The exported product intentionally does not copy the Central Login application; its environment must point `VITE_LOGIN_ORIGIN` at an available Central Login deployment. This preserves independent product deployment while maintaining one login experience.

### Acceptance criteria

- Only `apps/app-hub` owns the user-facing `/login` route.
- All eight product applications contain no `SolutionLoginPage` route/import.
- All eight product applications use the shared `ProtectedRoute` for unauthenticated central-login redirection.
- `VITE_LOGIN_ORIGIN` exists in development, staging, production, and example env files for all nine applications.
- Central Login accepts only relative platform routes or absolute URLs whose origin is present in the configured solution-origin allowlist.
- Direct nested product URLs return to the same nested URL after development authentication.
- Sign out from a product routes through the Central Login `/logout` endpoint.
- App Hub and each product remain separately buildable/deployable.
- Port assignments remain `4001` through `4009`, with `4000` reserved for identity.

### Ownership

- **Senior Solution Architect / Platform Developer:** central-login contract, return-URL allowlist, SSO integration boundaries, shared auth package.
- **Frontend Developers:** apply `ProtectedRoute` to product-owned routes; do not add product-local login implementations.
- **DevOps / Identity Engineer:** approved Login/Auth domains, OIDC/OAuth configuration, secure callback allowlists, cookies/tokens, logout propagation, environment configuration.
- **QA:** direct-domain redirect, nested return URL, already-authenticated central session, logout, invalid return URL rejection, refresh, and independent product deployment validation.


### v1.2.0 validation record

- Canonical source contains 108 TS/TSX implementation files with 0 TypeScript parser syntax diagnostics and 0 unresolved internal relative/`@`/`@shared` imports in structural validation.
- Only `apps/app-hub` owns a `/login` route; all eight product applications have 0 product-local login routes and 0 `SolutionLoginPage` imports.
- All 36 committed application environment files (9 applications × 4 environment/example files) define both `VITE_LOGIN_ORIGIN` and `VITE_AUTH_ORIGIN`.
- Development `VITE_LOGIN_ORIGIN` is consistently `http://localhost:4001`; product ports remain `4002`-`4009`, with `4000` reserved for identity.
- All 9 standalone exports were regenerated from the v1.2.0 shared authentication source. Structural validation parsed 356 standalone TS/TSX implementation files with 0 syntax diagnostics and 0 unresolved internal imports.
- Shared CSS braces are balanced and the largest canonical TS/TSX source is 274 lines, within the preferred 300-line guideline.
- A dependency-backed Vite build is not claimed for this delivery because `npm install` timed out in this execution environment. Run `npm install` locally, then execute the selected workspace typecheck/build before deployment.

## 21. v1.3.0 — Approved domains, external partner apps, and login-path hardening

### Scope

1. Confirm central login as the only login surface and remove the superseded product-login source.
2. Replace placeholder staging/production hostnames with the approved DNS allocation.
3. Retire the Volunteer Manager solution and introduce external partner apps on the App Hub.
4. Make the unauthenticated-access redirect safe to expose on real domains.
5. Resolve the Login composition inside the viewport on large screens.

### Central login is the only login surface

`packages/shared/src/auth/SolutionLoginPage.tsx` is deleted. It was the v1.1.0 product-local login page, superseded by the v1.2.0 central-login decision and unreferenced since. Only `apps/app-hub` owns a `/login` route, and it is a re-export of the shared `CentralLoginPage`. Every product route resolves through the shared `ProtectedRoute`, which performs a full-domain redirect to `${VITE_LOGIN_ORIGIN}/login` carrying `client_id` and the absolute current URL as `returnUrl`. Direct entry to any product URL while unauthenticated therefore lands on the central Login and returns to the originally requested URL, including nested route, query string, and hash.

### Approved domain allocation

Staging and production share the same approved origins:

| Environment variable | Origin |
|---|---|
| `VITE_AUTH_ORIGIN` | `https://cfr.optioncapp.com/` |
| `VITE_LOGIN_ORIGIN` | `https://cfr.optioncapp.com/` |
| `VITE_PLATFORM_ORIGIN` | `https://cfr.optioncapp.com/` |
| `VITE_OPTIONC_SCHOOL_ORIGIN` | `https://optionc-sms.optioncapp.com` |
| `VITE_MATT_MONEY_ORIGIN` | `https://matt-money.optioncapp.com` |
| `VITE_ARC_ALERTS_ORIGIN` | `https://arc-alerts.optioncapp.com` |
| `VITE_OPTIONC_PARISH_ORIGIN` | `https://optionc-parish.optioncapp.com` |
| `VITE_CATHOLIC_CONTENT_ORIGIN` | `https://catholic-content.optioncapp.com` |
| `VITE_UNIFIED_DIRECTORY_ORIGIN` | `https://directory.optioncapp.com` |
| `VITE_SUPPORT_CENTER_ORIGIN` | `https://support-center.optioncapp.com` |

Development origins remain the 4001-series localhost allocation. `.env.example` keeps placeholder hostnames because it is a template. These origins are also the central-login return-URL allowlist, so adding a future solution domain requires updating every application's environment files, not only the new one.

`VITE_AUTH_ORIGIN` currently resolves to the same host as `VITE_LOGIN_ORIGIN` because no separate identity provider is deployed yet. The variables stay distinct so an identity service can be introduced without touching the Login application.

### Volunteer Manager retirement

The `apps/volunteer-manager` workspace, its catalog entry, registry entry, solution manifest entry, environment key, and root npm scripts are removed. Volunteer coordination is served by the external Vincent Volunteer product. Port `4008` is left unassigned rather than reallocated so the remaining solutions keep their established ports.

### Unauthenticated-redirect hardening

Two defects on the path that real domains now expose were corrected.

**Return-URL authority smuggling.** `getSafeReturnUrl` accepted a relative destination using a `startsWith('/') && !startsWith('//')` prefix test. Browsers fold a backslash into a slash for special schemes, so `/\evil.com` passed that test and then navigated to `https://evil.com` — an open redirect off the Login page, defeating the §20 requirement that arbitrary external return domains be rejected. Both branches are now decided by the WHATWG URL parser: relative input is resolved against a reserved-TLD base and accepted only if the resolved origin is still that base, and absolute input is accepted only if its origin appears in the configured allowlist. This also rejects `//host`, encoded variants, and opaque-origin schemes such as `javascript:`.

**Authentication mode failed open.** `environment.authMode` resolved to `mock` for any value that was not exactly `sso`, so a missing or misspelled `VITE_AUTH_MODE` in a production environment file would ship localStorage-based development sessions. It now resolves fail-closed: only a development build can select `mock`, and every other build resolves to `sso`. A configuration mistake degrades into "cannot sign in" rather than "everyone is signed in".

### Login large-screen composition

At `min-width:1024px` and `min-height:720px` the Login resolves inside `100dvh`. The pre-existing `overflow:hidden` guard prevented page scroll but would clip content that did not fit, so it is no longer relied on as the fit strategy: brand-panel vertical rhythm is expressed in viewport-height units, and the connected-workspace preview moves to three columns at `min-width:1280px` so seven applications occupy three rows instead of four. Narrower or shorter viewports fall back to the base rules and scroll naturally. Approved navy/gold brand identity is unchanged.

### Tooling corrections

- The root `lint` script used a shell glob (`apps/*/src`) that never expanded on Windows, so linting could not run there. It now uses patterns ESLint resolves itself.
- The ESLint ignore list was `['dist']`, which does not match per-application `apps/<solution>/dist`. It now ignores `**/dist/**`, `**/node_modules/**`, and `.artifacts/**`.

### Acceptance criteria

1. No product application contains a `/login` route or any `SolutionLoginPage` reference.
2. Direct entry to any product URL while unauthenticated redirects to the central Login and returns to the exact requested URL after sign-in.
3. `getSafeReturnUrl` rejects `//host`, `/\host`, `/\/host`, absolute non-allowlisted origins, and non-HTTP schemes, while preserving same-origin paths with query and hash.
4. A non-development build cannot resolve to `mock` authentication.
5. Staging and production environment files for all nine applications carry the approved origins, and no `catholicsolutions.example` placeholder remains in any build output.
6. The App Hub Your Apps section shows seven launchable solutions followed by six external partner apps.
7. External cards open in a new tab with `rel="noopener noreferrer"`; the unpublished card is non-interactive and labelled Coming soon.
8. External apps do not appear in the App Switcher, connected-workspace preview, or Request Access product selection.
9. Login does not scroll or clip at 1024×720 and above.
10. `npm run typecheck`, `npm run lint`, and `npm run build` succeed for every workspace.

### v1.3.0 validation record

**Date:** August 11, 2026. Executed in a dependency-installed environment, so this release reports real tooling results rather than source-level parsing only.

- `npm run typecheck` — passes for all 8 application workspaces, 0 diagnostics.
- `npm run lint` — 0 errors. 3 pre-existing `react-refresh/only-export-components` warnings remain on `ToastProvider`, `UserContext`, and `AuthProvider`, which colocate a provider with its hook.
- `npm run build` — **all 8 applications produce a production bundle.** This is the first dependency-backed Vite build recorded for this project; v1.0.0 through v1.2.0 could only claim source-level validation because their environments could not install dependencies.
- `npm run export:solution -- arc-alerts` — regenerates a self-contained standalone export with no `packages/shared` path references and no sibling product source.
- Built App Hub bundle contains the approved `cfr.optioncapp.com` and sibling `optioncapp.com` origins, all five published partner URLs, and no `catholicsolutions.example` placeholder or `volunteer-manager` reference in any application bundle.
- Return-URL allowlist verified against 10 cases covering same-origin paths, allowlisted absolute URLs, protocol-relative input, backslash authority smuggling, non-allowlisted origins, suffix-confusion hosts, and `javascript:`. All pass; the superseded implementation demonstrably admitted the backslash vectors.

### v1.3.1 — Compact recognition-first App Switcher

**Date:** August 12, 2026.

- The latest approved launcher reference supersedes the v1.3.0 single-line row / adaptive three-column switcher treatment.
- `PlatformAppSwitcher` now uses an approximately 380px two-column recognition grid for the six primary product destinations, preserving the established catalog gradients/icons and full application names.
- Switcher ordering is explicitly School → Parish → ArcAlerts → Matt Money → Catholic Content → Unified Directory. Any future first-class launchable app not in that preferred order is appended rather than silently omitted.
- Support Center is separated below the primary grid as a full-width workspace utility card with `Help, tickets & resources`, and the App Hub exit is a full-width `All apps` footer action.
- Current-app state remains non-navigating and uses both an explicit check and the approved restrained gold/cream surface.
- Cross-solution destinations remain real links, open in new tabs, and now use `rel="noopener noreferrer"`; primary recognition cards intentionally omit persistent external-link arrows to reduce visual noise.
- The launcher retains Escape, outside-click, route-change close behavior, accessible focus-visible rings, and no translate/scale hover motion.
- The canonical switcher styles were consolidated so the obsolete wide-menu/three-column/compact-row CSS variants no longer override the launcher.
- README release metadata and staging-build guidance were synchronized, and obsolete Volunteer Manager README entries were removed while preserving port 4008 as intentionally unassigned.
- The checked-in ArcAlerts standalone release artifact was regenerated from canonical source because the shared platform switcher changed.

### v1.3.1 validation record

- Canonical `apps/**` + `packages/shared/src/**` parsing covers **97 TS/TSX source files with 0 syntax diagnostics** using the available TypeScript parser; the changed `PlatformAppSwitcher.tsx` is included in that pass.
- Shared design-system CSS passes structural brace validation with balanced blocks after the launcher rewrite.
- The catalog still contains exactly **7 launchable** shared-session applications. Legacy switcher selectors (`menu--wide`, `grid--three`, compact header/footer variants) are absent from canonical styles, and the current launcher grid has no internal `overflow-y:auto` behavior.
- `npm run export:solution -- arc-alerts` succeeds and the generated standalone source contains the v1.3.1 launcher implementation/styles.
- A dependency-backed workspace typecheck/staging bundle could not be completed in this execution environment: dependency installation produced an incomplete `node_modules` tree and TypeScript reported missing React/Node/ESTree type-definition packages before application semantic checking. This is an environment limitation and is not recorded as a source regression.
- In a normal dependency-installed environment, build every application against checked-in staging configuration with `npm run build:staging --workspaces --if-present`, or target one application with `npm run build:staging --workspace <workspace-name>`.

### v1.3.2 — App Hub interactive sign-in entry

**Date:** August 12, 2026.

- The App Hub root route `/` no longer defaults into the protected `/apps` route. It now resolves to `/login?entry=platform`, making Sign In the visible first experience whenever the App Hub is opened from its root URL.
- `CentralLoginPage` recognizes only the `platform` client plus `entry=platform` as an interactive-entry request. A remembered same-origin mock session is intentionally not auto-forwarded for this case until the user completes Sign In.
- Existing centralized SSO simulation is preserved for normal `/login` requests and product handoffs: an already authenticated central session may still return immediately to an approved product `returnUrl`.
- The change does not weaken `ProtectedRoute`, return-URL allowlisting, auth-mode fail-closed behavior, product route ownership, or the rule that product applications have no local Login page.

### v1.3.2 validation record

- Static route inspection confirms `/` resolves to `/login?entry=platform` and `/apps` remains behind `ProtectedRoute`.
- Static authentication-flow inspection confirms the interactive-entry suppression is scoped to `clientId === 'platform'` and `entry=platform`; product `client_id` handoffs retain existing auto-return behavior.
- The modified TSX files pass source-structure checks for balanced delimiters/import references in this delivery environment.
- Dependency-backed `typecheck`/Vite build is not claimed in this execution environment because workspace dependencies are not installed. Run `npm ci` followed by `npm run build:staging --workspace @catholic-solutions/app-hub` in the normal build environment.

### Known limitations carried forward

- There is still no automated test suite. The verification above is tooling and manual, and the return-URL cases were exercised through a standalone script rather than a committed regression test. A `getSafeReturnUrl` allowlist suite, a `ProtectedRoute` redirect test, and catalog invariants are the highest-value first tests.
- `packages/shared` is consumed through the `@shared` path alias rather than as a declared workspace dependency, so it has no independent type contract and applications deep-import its internal module paths. It type-checks correctly inside each application build; editors opening `packages/shared` in isolation will report unresolved `@shared` imports and missing `import.meta.env` typings.
- `packages/shared/src/app/components/AppTopbar.tsx`, `AppSwitcher.tsx`, and `EmptyState.tsx` are unreferenced. The live shell is `platform/shell/PlatformTopbar.tsx` and `PlatformAppSwitcher.tsx`. Removing the unused pair is pending approval because §10.2 forbids maintaining a forked switcher.
- Production cross-domain SSO remains unimplemented. The development callback marker and browser storage are not production authentication, and real token, cookie, PKCE, and logout-propagation handling is still an identity-platform integration.

## 22. Dependency currency policy and toolchain refresh

### Policy

Every dependency is held at the newest version that the rest of the toolchain can actually support. "Latest published" is not the target when adopting it would break a peer contract; the target is the newest *adoptable* version, and any gap between the two is recorded here with the blocking constraint so it can be revisited when the blocker clears.

Application libraries use caret ranges. The build and type toolchain uses tilde ranges pinned to one minor line, so a transitive minor bump cannot change a release build between CI runs.

### Current toolchain

| Package | Version | Note |
|---|---|---|
| react / react-dom | `^19.2.8` | |
| react-router-dom | `^7.18.2` | |
| tailwindcss / @tailwindcss/vite | `^4.3.3` | |
| vite | `~8.2.1` | Supersedes the §17 `~7.1.2` constraint |
| @vitejs/plugin-react | `^6.0.5` | Requires Vite 8; moves with Vite |
| typescript | `~6.0.3` | **Held below latest — see below** |
| eslint | `^10.8.1` | |
| @eslint/js | `^10.0.1` | |
| typescript-eslint | `^8.67.0` | |
| eslint-plugin-react-hooks | `^7.1.1` | |
| eslint-plugin-react-refresh | `^0.5.4` | |
| globals | `^17.10.0` | |
| @types/node | `^26.2.0` | |
| @types/react | `^19.2.18` | |
| @types/react-dom | `^19.2.4` | |

### Held-back dependency: TypeScript

TypeScript `7.0.2` is published but **cannot** be adopted. `typescript-eslint@8.67.0` — itself the latest release, with no v9 available — declares `typescript: >=4.8.4 <6.1.0`. Adopting TypeScript 7 would break the lint stage of the Definition of Done.

TypeScript `6.0.3` is therefore the newest adoptable version and is what the project uses. Revisit when typescript-eslint publishes a release whose peer range admits TypeScript 7.

### Migrations required by this refresh

**`baseUrl` removed from every `tsconfig.app.json`.** TypeScript 6 deprecates `baseUrl` and errors on it (TS5101), and it stops functioning entirely in TypeScript 7. Rather than silencing the error with `ignoreDeprecations`, the path mappings were migrated to be resolved relative to the tsconfig file, which is the forward-compatible form: `"@/*": ["./src/*"]` and `"@shared/*": ["../../packages/shared/src/*"]`. This also removes the migration from the future TypeScript 7 adoption path.

**Three `setState`-in-effect call sites corrected.** `eslint-plugin-react-hooks@7` adds `react-hooks/set-state-in-effect`, which flagged three components that reset state from an effect body when a prop changed. Each was migrated to React's documented "adjust state during render" pattern, comparing against a stored previous value:

- `AppDetailsModal` — collapsing the expanded section when a different app is opened.
- `PlatformAppSwitcher` — closing the launcher when in-app navigation changes the route.
- `AccountModals` — seeding profile fields and clearing password fields when a modal opens or the user changes.

These were real defects, not lint noise: resetting state from an effect queues a second render pass, so each component painted the previous value for one frame before correcting. The `AccountModals` case is the most visible — reopening the profile modal after a save briefly showed the pre-save values. The `user` object from `UserProvider` is stable state, so the identity comparison used by that fix cannot loop.

### Verification

Run in a dependency-installed environment on Node 24.11.0 / npm 11.17.0:

- `npm install` — resolves with no peer-dependency conflicts.
- `npm audit` — **0 vulnerabilities**.
- `npm run typecheck` — passes for all 8 application workspaces under TypeScript 6.0.3, 0 diagnostics.
- `npm run lint` — 0 errors under ESLint 10. The 3 `react-refresh/only-export-components` warnings on `ToastProvider`, `UserContext`, and `AuthProvider` remain and are accepted: each colocates a provider with its consuming hook.
- `npm run build` — all 8 applications produce a production bundle under Vite 8. Build times improved materially against Vite 7 (for example ArcAlerts 2.54s to 820ms).
- `npm run dev` — Vite 8 dev server starts in ~605ms, honours `strictPort`, serves the SPA fallback for nested routes, and resolves the `@shared` alias.
- `npm run export:solution -- arc-alerts` — standalone export regenerates correctly.
- Built bundles still carry the approved origins and partner URLs, with no placeholder or retired-solution references.
- The return-URL allowlist suite still passes all 10 cases after the upgrade.

### Follow-up

The absence of an automated test suite (§21) is more costly after a nine-package major upgrade than before it. The verification above proves the toolchain works and the code compiles, but nothing asserts runtime behaviour. The three `setState`-in-effect corrections changed render timing in shared components used by every application, and no test covers them.


## 23. v1.3.3 — Central auth configuration, two-mode env files, staging login, and global logout

**Date:** August 12, 2026.

### Superseding environment/domain decision

- Every application owns only `.env.development` and `.env.production`. `.env.staging` and `.env.example` are removed.
- Solution URLs are no longer repeated across every application environment file. `packages/shared/src/auth/appAuthConfig.ts` is the single common domain/auth-routing source consumed by Login, return-URL allowlisting, App Hub navigation, and the shared switcher.
- Hosted origins are locked to `https://cfr.optioncapp.com`, `https://optionc-sms.optioncapp.com`, `https://matt-money.optioncapp.com`, `https://arc-alerts.optioncapp.com`, `https://optionc-parish.optioncapp.com`, `https://catholic-content.optioncapp.com`, `https://directory.optioncapp.com`, and `https://support-center.optioncapp.com`.
- Staging is a deployment target, not a third Vite environment file. `npm run build:staging` compiles with Vite `production` mode and `.env.production`, while injecting `VITE_DEPLOYMENT_TARGET=staging`.

### Staging authentication repair

The previous staging configuration set both Auth and Login origin to the same `/login` application while `sso` mode redirected Sign In to `${AUTH_ORIGIN}/login`. This recreated the page instead of authenticating, producing the observed no-op.

Staging now uses a centralized preview-session adapter. The Login domain creates a short-lived/session browser cookie shared across the approved `*.optioncapp.com` product subdomains, and product guards re-check that session on focus/visibility. This restores central Login → returnUrl → product behavior for the frontend-only staging prototype without reintroducing product-local login pages.

This v1.3.3 rule is superseded by §29 (v1.3.9): hosted production-mode builds temporarily use the same centralized shared-session adapter so the deployed domain set remains testable while the real IdP is pending. The adapter is still not a production security boundary; a security-sensitive production release requires a server-issued `HttpOnly`, `Secure` session or OIDC/OAuth Authorization Code + PKCE integration.

### Logout contract

- Sign out from every solution performs a full-page `window.location.replace` to the central `/logout` route and carries the current solution/client and safe return URL.
- Central Logout clears the current preview session, then replaces history with Central Login. Back navigation must not resurrect a signed-in protected page.
- Same-origin tabs receive immediate BroadcastChannel logout; cross-origin product tabs revalidate the common preview session when focused or made visible.
- In the future production identity integration, the same central route is the frontend entry for server/IdP logout and must clear the server session before redirecting back to Login.

### Ownership

- **Senior Solution Architect / Senior Full Stack Developer:** auth contract and central domain registry.
- **Frontend Developer:** guards, login handoff, switcher/App Hub navigation, and logout UX.
- **DevOps:** staging build target and eventual production IdP/session integration.
- **QA:** central Login, return URLs, cross-domain launch, refresh, new-tab switcher, sign-out, back-button behavior, and session revalidation across product tabs.

### v1.3.3 validation record

- Canonical source contains 98 TS/TSX implementation files and parses with 0 TypeScript syntax diagnostics using the available compiler parser.
- Internal relative, `@/`, and `@shared/` import resolution checks report 0 unresolved canonical imports.
- The canonical workspace contains exactly 16 application environment files: 8 `.env.development` plus 8 `.env.production`; no `.env.staging` or `.env.example` files remain.
- Runtime origin configuration is centralized in `packages/shared/src/auth/appAuthConfig.ts`; canonical application environment files contain no `VITE_*_ORIGIN`, `VITE_AUTH_ORIGIN`, `VITE_LOGIN_ORIGIN`, or `VITE_AUTH_MODE` duplication.
- The ArcAlerts standalone release artifact was regenerated from the current shared auth/domain source and carries only the two approved environment files plus the staging-build helper.
- A dependency-backed workspace typecheck/build is not claimed for this delivery. `npm ci` could not complete inside the execution environment, leaving required React/Node/ESTree type packages unavailable; the subsequent App Hub typecheck stopped at missing type-definition packages before application semantic checking.
- In a normal dependency-installed environment, use `npm run build:staging` for the hosted staging build and `npm run build:production` for the hosted production-mode build. Both consume the centralized auth/domain policy from `appAuthConfig.ts`; §29 supersedes the former fail-closed frontend-only production behavior.


## 24. v1.3.4 — Explicit per-workspace production build contract

**Date:** August 12, 2026.

### Requirement

Production builds must be runnable both for the complete workspace and for any individual application using standard npm workspace targeting. `npm run build:production --workspace <workspace-name>` is therefore a supported release command and every application workspace must expose that script.

### Implementation

- Every application workspace defines `build:production` as `tsc -b && vite build --mode production`.
- Root `npm run build:production` delegates to the application-level `build:production` scripts with `--workspaces --if-present`.
- The generic application `build` command remains available and continues to produce a production-mode bundle for backward compatibility.
- `build:staging` remains unchanged and continues to use `.env.production` plus the staging deployment-target injection. No `.env.staging` is introduced.
- Standalone exports retain both explicit `build:staging` and `build:production` commands.

### Supported commands

```bash
# All applications, production
npm run build:production

# App Hub only, production
npm run build:production --workspace @catholic-solutions/app-hub

# All applications, hosted staging
npm run build:staging

# App Hub only, hosted staging
npm run build:staging --workspace @catholic-solutions/app-hub
```

### Ownership

- **Senior Full Stack Developer:** workspace script consistency and release-command contract.
- **DevOps:** CI/CD use of the explicit staging and production commands.
- **QA:** verify all eight targeted workspace commands resolve the requested script before release.

### v1.3.4 validation record

- All eight canonical application `package.json` files expose both `build:staging` and `build:production`.
- Root `build:production` dispatches to the explicit per-workspace production scripts.
- Root package, lockfile, solution catalog, README, and living specification release metadata are synchronized to v1.3.4.
- npm workspace script discovery confirms the App Hub exposes `build:production`; dependency-backed TypeScript/Vite compilation requires dependencies installed with `npm ci` in the normal build environment.

## 25. v1.3.5 — Catalog-synchronized dense App Switcher

**Date:** August 12, 2026.

### Requirement

The shared switcher must make better use of its available space and expose the published destinations already available in App Hub **Your Apps**. When more than six switcher destinations exist, desktop uses three cards per row. The current-app check badge is removed because the active background is sufficient visually.

### Implementation

- Added centralized `yourApps` and `availableSwitcherApps` catalog derivatives so App Hub and the switcher cannot drift into separately maintained app lists.
- `availableSwitcherApps` includes all seven launchable solutions and published external partners, while automatically excluding unpublished partner entries such as the current `Friar Friend` card.
- `PlatformAppSwitcher` renders one uniform adaptive grid instead of a six-card grid plus a special Support Center row.
- The current-app check glyph was removed. `aria-current` and screen-reader current-state text remain, with a restrained warm background as the visible state.
- The grid switches to three columns whenever its data set exceeds six entries and falls back to two columns on very narrow screens.
- Published external products open directly from the switcher in a new tab with `noopener noreferrer`; this does not add them to `SOLUTION_REGISTRY` or imply SSO coverage.
- The App Hub `Your Apps` section now consumes the same centralized `yourApps` collection rather than rebuilding the list locally.

### Ownership

- **Senior UI/UX Engineer:** launcher density, hierarchy, active-state simplification, and responsive card geometry.
- **Senior Frontend Developer:** catalog derivation, new-tab behavior, accessibility, and shared-shell implementation.
- **QA:** verify all 12 published destinations, three-column desktop layout, active state, external-link safety, responsive fallback, Escape/outside-click behavior, and `All apps`.

### v1.3.5 validation record

- Catalog derivation reports 13 App Hub `Your Apps` entries, 12 immediately available switcher destinations, and one unpublished external entry excluded from the switcher.
- The switcher has no `CheckIcon` import or current-mark element.
- Desktop grid class selection is data-driven from the destination count rather than hard-coded to a particular product list.
- External partner switcher destinations use their published absolute URLs and `rel="noopener noreferrer"`.
- Root package, lockfile, solution manifest, README, and living specification release metadata are synchronized to v1.3.5.


## 26. v1.3.6 — Product naming, viewport-fit Login, and premium light Your Apps cards

**Date:** August 12, 2026.

### Product display-name contract

User-facing product labels are **Vincent Volunteer**, **Alive Date**, and **Friar Friend** everywhere in UI copy, catalog metadata, integration labels, documentation, and supporting prototype data. Stable technical identifiers and published destinations do not change: `vincent-volunteer`, `alive-date`, `friar-friend`, `vincentvolunteer.com`, and `alivedate.com` remain unchanged.

### Login composition

- Desktop Login is a fixed `100dvh` composition and must not introduce page scrolling in the supported desktop viewport range.
- The Connected Workspace preview is promoted visually with stronger glass contrast, tighter but readable application rows, and a consistent three-column grid.
- With the current seven launchable applications, the final Support Center item spans the full preview row instead of appearing as an isolated one-third tile.
- At shorter desktop heights, nonessential proof/trust copy is progressively reduced before the Connected Workspace preview or credential controls are allowed to clip.
- Tablet/mobile retains natural document scrolling; the no-scroll rule is a desktop composition requirement, not a mobile overflow hack.

### App Hub / Your Apps treatment

- `Your Apps` no longer uses full-card product gradients. Launchable and external products use the same premium white surface language as the other App Hub groups.
- Product identity remains strong through the existing catalog gradient on the top accent and icon tile, plus a restrained low-opacity corner wash.
- Card headings/body copy are dark for maximum readability. Category text becomes a compact eyebrow and status chips use semantic soft tones.
- Launch/Open remains the primary action; Details is a light secondary control. New-tab behavior and partner-link safety are unchanged.
- Desktop App Hub density uses four cards per row from 1280px and five from 1536px rather than forcing six narrow cards into a row.
- Section panels are opaque white with restrained neutral borders/shadows to improve hierarchy against the light workspace background.

### Ownership

- **Senior UI/UX Engineer:** Login viewport composition, card hierarchy, density, and per-product visual identity.
- **Senior Frontend Developer:** catalog naming, card rendering, responsive behavior, and accessibility-preserving interaction.
- **QA:** verify product display names, unchanged URLs/IDs, 1024×640 and 1366×768 Login fit, mobile scrolling, Your Apps card readability, new-tab launch behavior, and responsive App Hub grids.

## 27. v1.3.7 — Premium full-ecosystem Login showcase

**Date:** August 12, 2026.

### Requirement

The Central Login brand panel must communicate the breadth of Catholic Solutions immediately, using the approved navy/gold identity and the clarity of the user-provided reference without copying its flat prototype treatment. The showcase must represent the complete shared catalog, remain readable, and preserve the desktop no-scroll Login contract.

### Implementation

- Replaced the dark nested **Connected Workspace** preview with a lighter, recognition-first **Connected Catholic ecosystem** showcase directly on the navy brand field.
- The showcase is driven from the canonical `APP_CATALOG`; it renders every catalog entry, including the seven owned applications, partner products, AI tools, discovery products, and the unpublished Friar Friend entry with a compact **Soon** indicator.
- Product names, icons, and gradients come directly from catalog metadata. No duplicate Login-only app list is maintained.
- Tiles use premium light surfaces with a subtle product-gradient accent and icon, dark high-contrast labels, restrained shadow depth, and no decorative movement that could imply they are launch controls.
- Login showcase tiles are intentionally informational and non-interactive. Authentication remains the first action; authenticated launching continues through App Hub and the shared App Switcher.
- The brand headline is simplified to **Welcome back to your Catholic community platform.** The supporting line explains the single-sign-in relationship without implying that external partner products share the Catholic Solutions authentication boundary.
- Desktop density is adaptive: three columns from 1024px, four from 1280px, and five from 1536px. Shorter desktop viewports reduce tile height and supporting copy before anything is clipped.
- The existing desktop `100dvh` no-page-scroll requirement remains. Mobile/tablet behavior remains naturally scrollable because the brand showcase is hidden in the current compact Login layout.

### UI/UX standard

- The Login hero should feel premium, confident, and mission-focused rather than resembling a basic dashboard widget.
- Product identity comes from each catalog gradient; the surrounding structure stays visually calm and consistent.
- Tile labels may wrap to two lines rather than being truncated when a product has a long approved display name.
- Nonessential proof metrics are removed from the Login brand panel so the full catalog and credential form have clear hierarchy.
- No translate, scale, bounce, or other motion-based hover treatment is introduced.

### Ownership

- **Senior UI/UX Engineer:** visual hierarchy, premium tile treatment, density, viewport composition, and brand-panel balance.
- **Senior Frontend Developer:** catalog-driven rendering, responsive implementation, semantic list structure, and preservation of authentication behavior.
- **QA:** verify all catalog labels are represented, `Vincent Volunteer` / `Alive Date` / `Friar Friend` spelling, desktop fit at 1024×720 and 1366×768, no Login-page scrolling at supported desktop sizes, and unchanged authentication/return behavior.

## 28. v1.3.8 — Product-themed App Hub primary actions

**Date:** August 12, 2026.

### Requirement

The App Hub `Your Apps` cards must preserve the premium light-card system while giving each application a stronger, instantly recognizable product identity. The primary **Launch/Open** control uses the same canonical product theme already defined in `APP_CATALOG`; secondary actions remain neutral.

### Implementation

- `AppCard` passes the catalog `gradient` through a local CSS custom property to its primary Launch/Open action; no second button-color catalog is maintained.
- Each product therefore receives a unique theme-aligned action automatically, including future published catalog additions.
- A shared navy contrast scrim is applied over the product gradient so white action text remains visually strong even when a theme contains a bright endpoint.
- Hover uses only brightness/saturation and shadow refinement. No translate, scale, bounce, or layout-shifting motion is introduced.
- Keyboard focus receives an explicit Catholic Solutions gold focus ring.
- `Details` remains a white/neutral outlined button, preserving clear primary/secondary hierarchy and preventing excessive color density.
- Coming-soon entries remain muted/non-launchable and do not receive a fabricated themed primary action.

### Ownership

- **Senior UI/UX Engineer:** product-color balance, action hierarchy, contrast, and hover/focus treatment.
- **Senior Frontend Developer:** catalog-driven CSS variable binding and behavior preservation.
- **QA:** verify every launchable/external `Your Apps` card uses its own product theme, Details remains neutral, Coming Soon remains non-launchable, and new-tab behavior is unchanged.

## 29. v1.3.9 — Centralized hosted authentication strategy and all-domain build contract

**Date:** August 12, 2026.

### Requirement

Hosted Sign In must not dead-end with the message that production SSO is unavailable when the backend identity provider has not yet been connected. Application-specific environment files must not duplicate auth or domain settings. The entire Catholic Solutions domain/auth policy must be controlled centrally so all product builds behave consistently.

### Implementation

- `packages/shared/src/auth/appAuthConfig.ts` is the single source for both the approved local/hosted origin matrix and the configured authentication strategy.
- Hosted origins are `https://cfr.optioncapp.com`, `https://optionc-sms.optioncapp.com`, `https://matt-money.optioncapp.com`, `https://arc-alerts.optioncapp.com`, `https://optionc-parish.optioncapp.com`, `https://catholic-content.optioncapp.com`, `https://directory.optioncapp.com`, and `https://support-center.optioncapp.com`.
- Development is configured as `mock`; hosted production-mode builds are currently configured as `preview`, using the shared `Secure; SameSite=Lax; Domain=.optioncapp.com` central-session cookie.
- `environment.ts` consumes `authConfig.authMode`; it no longer decides that every production build must be `sso`. This makes a future IdP cutover a single shared configuration change rather than a change in every application.
- Login no longer reports the obsolete production fail-closed warning during the current hosted flow. If a future `sso` configuration is selected and its identity service is unavailable, the user receives a generic administrator-facing availability message.
- Product `.env.development` / `.env.production` files remain metadata-only and contain no auth/domain URL matrix.
- `npm run build:production` is the canonical all-domain build and builds all eight Catholic Solutions application workspaces from the same centralized auth/domain policy. Targeted `--workspace` production builds remain supported.

### Security boundary

The shared hosted session restores the required frontend integration flow but is not equivalent to production-grade identity. It is JavaScript-managed and therefore cannot provide the protections of an `HttpOnly` server session. Before a security-sensitive public production launch, replace the production `authMode`/`authOrigin` in `appAuthConfig.ts` with the real server/IdP integration and use a server-issued `HttpOnly; Secure` session or OIDC/OAuth Authorization Code + PKCE.

### Ownership

- **Senior Solution Architect / Senior Full Stack Developer:** centralized auth/domain contract and future IdP cutover.
- **Frontend Developer:** Login handoff, guards, session revalidation, and logout behavior.
- **DevOps:** build/deployment of all eight hosted domains from the common production configuration.
- **QA:** Login on the platform domain, safe return to every product domain, refresh/session continuity, cross-app switcher launch, logout, back-button behavior, and rejection of unknown return origins.



## 30. v1.4.0 — Review batch: authentication clarity, navigation, Hub requests, finance views, and ArcAlerts preferences

**Date:** August 12, 2026.

This release is the governing specification for the August 12 review batch and supersedes any earlier release-note text that described forced new-tab application launches, a seven-app Login preview, six-item Request Access selection, profile organization-role text, or ArcAlerts Members/Groups as active navigation.

### Product requirements

1. **Login catalog clarity:** the complete catalog remains visible on desktop without enabling page scroll at supported desktop heights. The left brand column receives more width and its catalog grid adapts up to six columns on very wide screens; shorter-height rules tighten secondary copy before product labels or credential controls clip.
2. **Request Access:** load every catalog product whose status is not `coming-soon`. `?product=<id>` preselects a valid requested product.
3. **Shared profile:** remove organization/role text from the header account experience and profile editor; keep name/email identity plus Profile, Security, and Sign out.
4. **Password recovery:** `Forgot password?` routes to `/forgot-password`, retains login query context, accepts email, and returns a non-enumerating recovery confirmation. Backend delivery remains an identity-service integration point.
5. **Navigation:** all App Hub, App Switcher, Details-modal, Support, and All-apps destinations use current-tab navigation by default while keeping native browser alternate-tab affordances.
6. **App Hub hero:** remove the right-side apps/approvals/system-status summary and reduce the hero to greeting + one supporting line.
7. **AI Lesson Plan Generator:** superseded by §33.3; it is now a first-party launchable workspace under `apps/ai-lesson-plan` and no longer uses the XtraCoach external destination.
8. **AI Tools / Discover More:** each requestable card includes a consistent in-card **Request app →** primary action and Details secondary action.
9. **Matt Money:** provide URL-addressable Administrator and Member dashboard perspectives using one shared shell and a clear segmented selector.
10. **ArcAlerts:** Directory exposes only User Preferences; Members/Groups are removed from active navigation and legacy URLs redirect. Preferences provide searchable/filterable per-contact Voice, Email, and Text enable/disable controls with a master state and local save feedback.

### Engineering ownership

- **Senior UI/UX Engineer:** Login density, roleless account surface, two-line Hub hero, Request action hierarchy, Matt Money view selector, and ArcAlerts grid usability.
- **Senior Frontend / Full Stack Developer:** catalog derivation, same-tab navigation contract, password-recovery route, query-preselected Request Access, Matt Money view state, legacy ArcAlerts route redirects, and shared-component integration.
- **QA:** verify 1024×620 / 1366×768 Login fit, all currently available Request Access products, no organization-role text in shared profile UI, recovery route context, current-tab launches, two-line hero, first-party Lesson Plan destination, Request app preselection, both Matt Money views, ArcAlerts legacy redirects, preference filters/toggles, responsive tables, keyboard focus, and no regression in auth/permissions.

### Release validation contract

Before release, validate TypeScript/TSX syntax, internal import resolution, CSS structural balance, catalog counts/placement, route inventory, no forced `_blank`/`window.open` navigation in canonical application/shared source, and regenerate standalone ArcAlerts output from canonical source. A dependency-backed Vite build is required in the normal developer/CI environment after `npm ci`; environment-specific native-module lock failures are not source regressions.

### v1.4.0 validation record

- Canonical `apps` + `packages` source contains 101 non-declaration TS/TSX implementation files and reports **0 TypeScript syntax diagnostics** with the available compiler parser.
- Internal relative, `@/`, and `@shared/` import resolution checks cover 109 TS/TSX files and report **0 unresolved canonical imports**.
- Shared design-system CSS brace validation is balanced.
- Canonical application/shared source contains no forced `target="_blank"` or `window.open(...)` application-launch behavior.
- Hard-coded `St. Mary's` dashboard/profile text is absent from canonical application/shared source.
- Catalog derivation validates 18 total products: 7 launchable, 7 external/direct-open, 14 Your Apps cards, 13 immediately switcher-openable destinations, 2 AI Tools, 2 Discover More items, and 17 Request Access selections.
- AI Lesson Plan Generator is in Your Apps as a first-party workspace; the former XtraCoach external destination is superseded by §33.3.
- ArcAlerts active navigation contains no Members/Groups entries; the compatibility paths are handled only as redirects to `/preferences`.
- Root package, lockfile root package, solution manifest, README, and living specification are synchronized to v1.4.0.
- ArcAlerts standalone output is regenerated from canonical source after the shared-shell and ArcAlerts changes.
- A dependency-backed Vite build is not claimed inside this execution environment because dependencies are not installed here. Release/CI must run `npm ci` followed by `npm run build:production` (or the targeted workspace build) in a normal dependency-installed environment.


## 31. v1.4.1 — Catholic Content, Unified Directory, and Support Center review

**Date:** August 12, 2026.

This release governs the second review batch and supersedes earlier UI requirements that showed Catholic Content discovery across three control rows, Unified Directory KPI cards/role/status columns, or a Support Center help-resource column.

### 31.1 Catholic Content

- The top **Request content** header action is removed.
- The discovery surface is space-optimized into two primary lines: **Saints of the Day** and **Categories** share the first line; the searchable Saint / Grade / Subject / Patronage / Century / Content Type control occupies the second line.
- Month and category choices remain horizontally scrollable within their own bounded regions so desktop density improves without truncating approved labels.
- The overview strip exposes two real same-tab platform links: **Contact Member Services** opens Support Center with `product=catholic-content` and `contact=Member Services`; **Support Center** opens the standard Support Center entry.
- The resource list, selected-row behavior, preview viewer, download/print affordances, and rights notice remain intact.

### 31.2 Unified Directory

- Remove all four KPI/stat cards from the Directory page. The directory workspace itself is the primary content surface.
- Navigation tabs are **Active User**, **Inactive Users**, and **Groups**. Active/inactive lifecycle is represented by tab membership rather than a visible Status column.
- User records do not maintain or display a role field. User grid columns are **User**, **SaaS applications**, **Groups**, and **Last activity**.
- The prototype dataset contains **132 users** so large-directory behavior can be reviewed. User and group grids use bounded vertical scrolling with sticky headers; the detail pane has independent scrolling on desktop.
- The user detail pane exposes contact data, directory source, SaaS application access, group memberships, password reset entry, and active/inactive lifecycle action.
- **Add user** must capture name, email, optional phone, at least one SaaS application, and zero or more initial groups. Application options derive from the shared published-app catalog rather than a Directory-only hard-coded catalog.
- **Create group** captures group name, description, and connected applications. A selected group exposes **Add / manage users**, opening a searchable 100+ user membership picker. Saving group membership updates both the group member IDs and each affected user's group list.
- Group grid columns are **Group**, **Members**, **Owner**, and **Connected apps**; no role/status columns are introduced.

### 31.3 Support Center

- Remove the Resource Library/help-article panel and its local resource dataset from the active Support Center implementation.
- The main Support Center workspace spans the available content width and uses a ticket inbox on the left with a contextual right pane.
- Selecting a support ticket loads the complete conversation history for that ticket in the right pane, including member/support authorship, timestamps, message content, and attachments when present.
- The conversation pane includes an in-context reply action. Local prototype replies append to the selected ticket and update its timestamp.
- Clicking **Close** in the conversation pane returns the right pane to **Add New Support Ticket**. The ticket list also exposes a direct **New ticket** action.
- New tickets retain product routing, support-area routing, subject, message, and attachment capture. A newly submitted ticket becomes the selected conversation.
- URL query state supports `?ticket=<id>` for an opened conversation and `?view=new&product=<id>&contact=<support-area>` for context-aware ticket creation. This is the contract used by Catholic Content's Member Services link.

### Ownership

- **Senior UI/UX Engineer:** two-line Catholic Content discovery hierarchy, large-directory density/detail ergonomics, and Support Center inbox/conversation composition.
- **Senior Frontend / Full Stack Developer:** shared-platform links, catalog-driven SaaS assignment, active/inactive lifecycle state, synchronized group membership, query-addressable support views, and conversation state.
- **QA:** verify two-line Catholic Content controls and both support links; 132 Directory users; Active User/Inactive Users/Groups tabs; absence of Directory role/status columns and KPI cards; user app/group capture; group member editing; ticket conversation history/reply/Close behavior; responsive overflow; keyboard focus; and unchanged authentication/application navigation.

### Release validation contract

Before release, validate TypeScript/TSX syntax, internal import resolution, CSS brace balance, the 132-user seed contract, absence of the deleted Support Resource panel in canonical source, absence of Directory role/status columns, and regenerate standalone ArcAlerts output because shared design-system CSS changed. A dependency-backed Vite production build remains required in the normal developer/CI environment after `npm ci`.

### v1.4.1 validation record

- Canonical `apps` + `packages` source contains **103** non-declaration TS/TSX implementation files and reports **0 TypeScript syntax diagnostics** with the available TypeScript parser.
- Internal relative, `@/`, and `@shared/` import resolution checks cover **111** TS/TSX files and report **0 unresolved canonical imports**.
- Shared design-system CSS is structurally balanced (**1,375 opening / 1,375 closing braces**).
- Unified Directory seeds **132 users** (**116 active / 16 inactive**) and **12 groups**; `DirectoryUser` contains no role or status field, the four KPI cards are absent, and the user table contains no Role/Status columns.
- Support Center canonical source contains no `SupportResourcePanel`, `supportResources`, or Help Library implementation; the ticket seed contains **9 conversation entries** across three tickets.
- Catholic Content canonical page contains no **Request content** header action and exposes real **Contact Member Services** and **Support Center** links through the centralized solution registry.
- Root package, lockfile root package, solution manifest, README, and living specification are synchronized to **v1.4.1**.
- ArcAlerts standalone output was regenerated after the shared design-system CSS change.
- A dependency-backed Vite build is not claimed inside this execution environment because repository dependencies are not installed. Release/CI must run `npm ci` followed by `npm run build:production` (or targeted workspace builds) in the normal dependency-installed environment.

## 32. v1.4.2 — Login, App Hub, profile, Matt Money, and ArcAlerts UI/UX refinement

**Date:** August 12, 2026.

This release refines five high-visibility surfaces without changing their approved business flows or route contracts. It supersedes the v1.4.0 Login width expansion and the compact Matt Money header toggle while preserving the v1.4.0 functional requirements.

### 32.1 Central Login product visibility

- Restore the previously approved balanced desktop split between the Catholic Solutions brand/catalog panel and credential panel. The product showcase must not obtain clarity by shrinking the Sign In surface.
- Improve product readability inside the existing left-side allocation using larger product tiles, stronger name/category typography, and responsive density.
- At supported desktop widths the catalog uses three columns by default and may use four on very wide screens; short-height layouts reduce secondary category text before reducing product-name legibility.
- The existing desktop `100dvh` no-page-scroll requirement remains. Mobile/tablet behavior remains unchanged.

### 32.2 App Hub hero density

- Keep the approved two-line hero content: greeting plus one supporting sentence.
- Reduce vertical padding/minimum height and decorative cross scale so the app catalog begins sooner without weakening the brand hierarchy.

### 32.3 Shared profile/account experience

- Profile trigger and menu identity must align avatar, user name, account label, email, and summary content on a consistent vertical rhythm with no clipped initials or offset identity text.
- Profile and Security dialogs must render at the document body level rather than inside the sticky/backdrop-filter topbar stacking context. This prevents fixed dialogs from being clipped, offset, or constrained by the header.
- Dialogs remain keyboard dismissible with Escape, restore prior focus, prevent background body scrolling, and fit within the current viewport with an internally scrollable body when necessary.

### 32.4 Matt Money workspace navigation

- Administrator and Member remain URL-addressable through `?view=admin|member`.
- Replace the small header-level segmented toggle with a dedicated, visible workspace selector above the dashboard.
- Each option includes an icon, role name, concise purpose, and explicit Current/Switch state. Dashboard-specific actions such as Export report or Download statement remain in the dashboard header and are not mixed with role navigation.
- The selector collapses cleanly on tablet/mobile without introducing duplicate routes or shells.

### 32.5 ArcAlerts User Preferences readability

- Preserve Directory → User Preferences as the only active Directory entry and retain Voice, Email, and Text preference channels.
- The preference grid must prioritize readable contact names, family, relation/location, phone numbers, and email addresses. Supporting data must not be truncated solely to preserve excessive whitespace.
- Use a bounded scroll region with sticky channel headings and sticky contact identity on desktop so large datasets remain understandable while scrolling.
- Channel filters expose their current enabled-contact counts and clearly indicate the active filter.
- Per-contact channel controls remain direct enable/disable switches, disabled when the master preference state is paused. Changes remain local until Save Preferences.

### Ownership

- **Senior UI/UX Engineer:** Login balance/catalog legibility, hero density, profile alignment, Matt Money view discoverability, and preference-matrix readability.
- **Senior Frontend Developer:** portal-backed account dialogs, responsive catalog/grid contracts, URL-preserving Matt Money selector, sticky preference implementation, and behavior preservation.
- **QA:** validate 1024×720 / 1366×768 / 1920×1080 Login balance and no-scroll fit, complete catalog visibility, profile modal positioning from every app topbar, both Matt Money URL views, ArcAlerts filter counts/toggles/sticky grid, keyboard focus, and responsive behavior.

### Release validation contract

Before release, validate TypeScript/TSX syntax, internal import resolution, CSS structural balance, the balanced Login split override, absence of the retired Matt Money header-level `matt-dashboard-switch` implementation in active TSX, portal use for account dialogs, ArcAlerts preference channel/filter contracts, and regenerate standalone ArcAlerts output because shared design-system CSS changed. A dependency-backed Vite production build remains required in the normal developer/CI environment after `npm ci`.


### v1.4.2 validation record

- Canonical `apps` + `packages` source contains **103** non-declaration TS/TSX implementation files and reports **0 TypeScript syntax diagnostics** with the available TypeScript parser.
- Internal relative, `@/`, and `@shared/` import resolution checks cover **111** TS/TSX files and report **0 unresolved canonical imports**.
- Shared design-system CSS is structurally balanced (**1,464 opening / 1,464 closing braces**).
- The final Login CSS contains the restored balanced desktop split contracts (`1.02fr / min 30rem .98fr` from 1024px and `1.08fr / min 34rem .92fr` from 1280px) and no longer keeps the v1.4.0 widened credential-shrinking override.
- Active Matt Money source/design-system CSS contains no legacy `matt-dashboard-switch`; the new workspace selector remains URL-driven by `?view=admin|member`.
- Shared account dialogs use `createPortal(..., document.body)`, preventing topbar stacking-context clipping while retaining Escape/body-scroll/focus restoration behavior.
- ArcAlerts User Preferences retains Voice/Email/Text channel contracts, filter counts, bounded table scrolling, sticky identity/header hooks, and local Save Preferences behavior.
- Root package, lockfile root package, solution manifest, README, and living specification are synchronized to **v1.4.2**.
- ArcAlerts standalone output was regenerated after the shared design-system update.
- A dependency-backed Vite production build is not claimed inside this execution environment because repository dependencies are not installed. Release/CI must run `npm ci` followed by `npm run build:production` (or targeted workspace builds) in the normal dependency-installed environment.


## 33. v1.4.3 — Catholic Content discovery, password reset, and Directory provisioning

### Catholic Content

- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- Keep the existing Catholic Content product identity, data model, resource list, preview workflow, Member Services link, and Support Center link.
- Replace horizontally scrolling category chips with a compact, accessible Category select. All categories must be reachable without horizontal scrolling.
- Use a search-first discovery hierarchy: line one is the primary library search; line two contains Saints-of-the-Day month, Category, and compact active-filter/result context.
- Search filters the local preview resource list by title/display title/subtitle as the user types; the Search action reports the current match count and selects the first matching result when the previous preview is outside the result set.
- Keep the workspace space-optimized so resource list and preview remain the dominant visual surfaces.

### Password recovery and reset

- **Owner:** Senior Full Stack Developer + Senior Frontend Developer; QA validates routing, privacy copy, keyboard flow, and validation states.
- `/forgot-password` remains the public recovery entry from Login and uses non-enumerating copy: the UI must not reveal whether an account exists.
- Add `/reset-password` as the second recovery step. It accepts an optional `email` query value, captures a short-lived verification code, new password, and confirmation, and provides password-strength guidance.
- Recovery success must route back to central Sign In.
- The shared Security/Change Password dialog must expose a working central account-recovery link for users who do not know their current password.
- Until a real identity provider/backend is connected, the frontend must label reset-code delivery/validation and password mutation as an integration boundary; it must not claim server-side completion that did not occur.

### Unified Directory provisioning

- **Owner:** Senior Full Stack Developer + Senior UI/UX Engineer.
- For **Add User**, the currently assignable SaaS applications are intentionally limited to **Matt Money** and **ArcAlerts**. Other applications stay out of the new-user entitlement selector until explicitly enabled in a later specification update. Existing seeded directory records may still demonstrate broader historical/product access.
- Existing group assignment during Add User remains available.
- **Create Group** must allow administrators to define group name/description, associate applications, and optionally select active users before creation.
- The Create Group member picker must support search across name, email, application, and current group; selected users must remain selected when search results change.
- Provide visible selected-member counts and Select visible / Clear visible controls. Empty groups remain valid and can be populated later.
- Creating a group with selected members must update both the group member list and each selected user's group membership in local prototype state.

### v1.4.3 validation contract

- QA verifies Catholic Content has no horizontal category scroller in the active discovery UI and all categories are accessible through the Category selector.
- QA verifies `/forgot-password` -> `/reset-password` -> `/login?entry=platform` routing and password mismatch/strength/code validation.
- QA verifies Add User shows exactly Matt Money and ArcAlerts in the SaaS application selector.
- QA verifies Create Group can select users, preserve selection while filtering, create with members, and reflect membership in the resulting group/user details.
- Root package, lockfile root package, solution manifest, README, and living specification are synchronized to **v1.4.3**.

### v1.4.3 implementation validation record

- 112 canonical TS/TSX files were parsed with the TypeScript parser: 0 syntax errors.
- All changed TS/TSX files transpiled in isolated-module mode with 0 diagnostics.
- 112 canonical TS/TSX files were checked for internal relative, `@/`, and `@shared/` imports: 0 unresolved internal imports.
- Shared design-system CSS braces are balanced.
- The active Catholic Content page contains no horizontal category-chip scroller.
- Add User resolves its SaaS selector from exactly `Matt Money` and `ArcAlerts`.
- Create Group includes searchable active-user selection and submits stable `memberIds` independent of the current search filter.
- `/forgot-password` and `/reset-password` are public App Hub routes and preserve return/client context when present.
- All eight standalone solution exports were regenerated after shared-source changes.

## 34. v1.4.4 — Login product visibility and profile-avatar repair

**Date:** August 12, 2026.

This release is a focused visual repair. It does not change authentication behavior, product catalog membership, the approved desktop Login split, account routes, or shared profile actions.

### 34.1 Central Login product showcase

- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- Preserve the approved Login left/right desktop width allocation from v1.4.2; clarity must be achieved inside the brand panel rather than by shrinking the credential panel.
- The complete 18-product catalog remains visible on the Login brand panel.
- Replace wide horizontal product rows with compact vertical product tiles: icon first, product name second, category third. Product name is the dominant text and must use an explicit dark color on the light tile surface.
- Responsive desktop density is 4 columns from 1024px, 5 columns from 1180px, and 6 columns from 1536px. Tiles must remain readable and must not rely on horizontal scrolling.
- Short-height desktop layouts may reduce tile height/icon size, but must preserve readable product names and retain the category label whenever the desktop Login remains in the two-panel composition.
- Coming-soon state remains a small non-interactive badge and must not obscure the product name.

### 34.2 Shared profile identity alignment

- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- The topbar avatar is compact and vertically centered with the account text and chevron.
- The signed-in summary avatar is proportionate to the name/email block and must not dominate the card.
- Avatar initials must remain centered regardless of generic descendant `span` rules. The summary-avatar selector must explicitly restore grid centering, zero margins, white initials, and stable line-height.
- Existing Profile, Security, Sign out, portal-backed dialogs, keyboard behavior, and account data are unchanged.

### v1.4.4 validation contract

- QA validates Login at 1024×720, 1366×768, 1536×864, and 1920×1080: all 18 product names are readable, light tiles contain dark names, no horizontal product scroller appears, and the Sign In width remains unchanged.
- QA validates the topbar profile trigger and open profile menu in every product shell: initials are centered, avatar circles are not oversized, and identity text aligns vertically.
- Shared design-system CSS must remain structurally balanced and standalone exports must be regenerated because the shared CSS changed.



## 35. v1.4.5 — Support Center stale-source upgrade compatibility

### Upgrade/build contract

- The Support Center Resource Library remains retired. `SupportCenterPage` MUST NOT render or import `SupportResourcePanel`, and `supportData.ts` MUST NOT reintroduce a `supportResources` dataset.
- Source bundles may be extracted over an existing developer checkout. Because archive extraction does not delete files removed in later releases, the canonical source MUST include a compile-safe compatibility file at `apps/support-center/src/solution/components/SupportResourcePanel.tsx` until the migration window is closed.
- The compatibility component MUST render `null`, MUST NOT import legacy resource data, and MUST be marked deprecated. It exists solely to overwrite stale pre-v1.4.1 copies during in-place upgrades.
- Fresh/clean installations and in-place upgrades MUST produce the same Support Center behavior: ticket inbox + conversation detail + new-ticket form only.

### v1.4.5 validation contract

- `SupportResourcePanel.tsx` contains no `supportResources` import.
- `SupportCenterPage.tsx` contains no `SupportResourcePanel` reference.
- The Support Center solution contains no exported `supportResources` dataset.
- The compatibility component is compile-safe under strict TypeScript and has no UI output.

## 36. v1.5.0 — Directory-driven communication and workspace refinement

This release supersedes earlier review-batch UI contracts where they conflict with the requirements below.

### 36.1 Authenticated App Hub request actions
- App Hub **Request app** actions MUST remain on the authenticated landing page rather than navigating signed-in users to `/request-access`.
- The confirmation dialog MUST use the current user identity already available in shared user context, provide a single clear Close action, and state that Member Services will contact the member within 24 hours.
- `/request-access` remains the unauthenticated/new-organization access workflow from Login.

### 36.2 Matt Money portal navigation
- Matt Money MUST expose professional role-aware module navigation in addition to Administrator/Member selection.
- Administrator modules: Overview, Billing, Payments, Reconciliation, Reports. Member modules: Overview, Payments, Payment methods, Statements.
- View/module state MUST remain URL-addressable through query parameters so developers can link and test individual portal states without duplicating shells.

### 36.3 ArcAlerts
- Push is not an active ArcAlerts delivery channel in this prototype; user-facing channel surfaces use Text, Email, and Voicemail only.
- New Alert MUST source recipients from the shared Unified Directory recipient projection. Users choose either Members or Groups before selecting recipients. Members support multiple selection; Groups support multiple selection plus an explicit All Groups option.
- User Preferences MUST keep the first identity column to two visible text lines: member name, then family/relationship. Channel cells MUST display typed directory destinations (Home, Work, Mobile, Organization) with clear On/Off controls.
- ArcAlerts Settings MUST provide Reply-To Email, Phone Caller ID, Phone To Call For Recording Voice Message, Timezone, failed-alert email guidance, and ArcAlerts Name in a compact two-column settings card.

### 36.4 Catholic Content
- Catholic Content discovery MUST use one primary library card for overview/help, filters, result list, preview, and rights notice.
- Month and Search share the first discovery row. Search keeps its label/help above the input/button controls.
- Months and Categories MUST use visible wrapped buttons/links, not select dropdowns and not horizontally scrolling chip tracks. Categories occupy the second discovery row and wrap to available width.

### 36.5 Unified Directory
- Active and Inactive user workspaces MUST support Search plus SaaS application and Group filters.
- User lists MUST provide Print and CSV export controls using the current filtered result set.
- The user-grid timestamp column is **Last accessed**.
- The Groups grid MUST show Group, Members, Owner, and Description; Connected apps is removed from group display.
- Create Group MUST NOT ask for SaaS applications. It still supports searchable member assignment during creation and later membership management.
- Add User contact capture includes Home/Work/Mobile telephone entries, Work extension, per-number Unlisted, one Primary telephone, Home/Work/Organization email addresses, and one Primary email.
- New-user and edit-access SaaS assignments are intentionally limited to **Matt Money** and **ArcAlerts** until additional products are approved.

### 36.6 Support Center
- The Support Center MUST use one primary workspace card; previous three promotional summary cards and the **Not sure which support area to choose?** card are removed.
- **Hide resolved tickets** is enabled by default. Resolved tickets remain viewable when the filter is cleared.
- New Ticket uses a three-control first row (Product, Support area, Subject), a full-width larger Message field, attachment control, and **Start ticket** primary action.
- Open-ticket reply UI MUST include the approved closure guidance and Cancel, Close ticket, Send reply actions in the same footer region. Cancel opens New Ticket. Close ticket marks the ticket resolved and opens New Ticket.

### 36.7 Ownership and validation
- **Senior UI/UX Engineer:** information hierarchy, density, responsive behavior, state clarity, and visual consistency.
- **Senior Frontend Developer:** catalog/request modal state, query-addressable Matt Money navigation, recipient selection state, directory contact/access data contracts, export/print behavior, and support-ticket state transitions.
- **QA:** verify same-tab request behavior, modal focus/close, all Matt Money module URLs, ArcAlerts recipient/channel rules, wrapped Catholic Content filters at desktop/mobile widths, Directory filters/exports/add/edit/group creation, resolved-ticket filtering, reply/cancel/close transitions, and production TypeScript builds.

## 37. v1.5.1 — Navigation, table and communication-form refinement

**Date:** August 13, 2026. This release refines existing v1.5.0 behaviors without changing authentication, domain routing, SaaS IDs, recipient data ownership, or existing module URLs.

### 37.1 Matt Money navigation
- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- Matt Money role selection MUST be compact and live in the page-header action region rather than consuming a large standalone workspace card.
- The role-aware module menu MUST be a full-width horizontal navigation bar immediately below the page header on desktop. Administrator modules remain Overview, Billing, Payments, Reconciliation, Reports; Member modules remain Overview, Payments, Payment methods, Statements.
- At desktop widths the available modules SHOULD distribute across the full navigation width. At smaller widths the bar MAY scroll horizontally rather than wrapping into ambiguous rows.
- Existing query-addressable view/module URLs remain authoritative.

### 37.2 Shared enterprise table treatment
- **Owner:** Senior UI/UX Engineer + Frontend Developer.
- Shared application tables use a professional neutral header surface, clear column labels, subtle alternating body-row surfaces, and a restrained hover state.
- Zebra/hover styling MUST NOT override explicit selected-row states, status semantics, or product-specific positive/negative text colors.
- Directory, Catholic Content, ArcAlerts directory/preferences, and opt-in Matt Money/ArcAlerts list tables MUST follow the same visual language.

### 37.3 Profile password terminology
- The common profile popover action previously labeled **Security** is renamed **Change password** with password-specific supporting text.
- The action continues to open the existing password/account modal and preserves Forgot/Reset Password linking.

### 37.4 Authenticated Request App confirmation
- The confirmation state uses the status label **Request received** and title **Thank you for your interest!**.
- Copy MUST identify the requested SaaS application by name, confirm successful receipt, and state that Member Services will review the request and contact the member within 24 hours to discuss access, subscription options, and next steps.
- The What happens next section states that the team will use the registered email address for follow-up. Current signed-in member and contact-email context may remain visible.
- Close remains the only primary completion action.

### 37.5 ArcAlerts recipient density
- The Recipients fieldset remains backed by Unified Directory data, but redundant explanatory heading/copy inside the fieldset is removed.
- Members/Groups selection and current selected-count are presented in one compact toolbar before the search/list or group choices.
- Existing multi-member, multi-group and All Groups behavior is unchanged.

### 37.6 ArcAlerts Settings alignment
- Settings field labels and required markers MUST share the same inline baseline. Required markers MUST NOT render as a separate grid row.
- Paired two-column fields maintain equal label/control rhythm; the failed-alert informational field aligns with the ArcAlerts Name row without introducing an artificial input.
- Existing settings fields and Save Settings behavior remain unchanged.

### v1.5.1 validation contract
- QA verifies Matt Money Administrator/Member role switching and every module URL at desktop and mobile widths.
- QA verifies enterprise table zebra/hover behavior without selected-state regressions in Directory and Catholic Content.
- QA verifies the common profile popover displays **Change password** and still opens the password flow.
- QA verifies Request App confirmation substitutes the selected application name and preserves modal Escape/outside/Close behavior.
- QA verifies ArcAlerts recipient selection count, member/group switching, multiple selection, and settings label alignment.
- Shared CSS remains structurally balanced; all standalone exports are regenerated after shared-source changes.



## 33. v1.5.2 — Directory export, Support defaults, first-party Lesson Plan

### 33.1 Unified Directory
- **Owner:** Senior Frontend Developer + QA.
- Telephone and email capture grids must align labels, fields and Primary/Unlisted controls without uneven row gaps.
- **Print** must print only the currently filtered member-detail dataset, never the application shell, detail panel, toolbar, or unrelated page content.
- CSV export remains member-detail only and follows the same current filters.

### 33.2 Support Center
- **Owner:** Senior Frontend Developer.
- New tickets default **Support area** to **Member Services** unless a contextual deep link provides another supported area.
- In open conversations, **Cancel** and **Close ticket** are an adjacent action pair; **Send reply** remains the primary continuation action.

### 33.3 AI Lesson Plan Generator
- **Owner:** Senior Full Stack Developer + Senior UI/UX Engineer.
- The former external XtraCoach URL is removed from the catalog. AI Lesson Plan Generator becomes a first-party Catholic Solutions workspace at `apps/ai-lesson-plan`.
- It uses the shared `AppLayout`, central authentication, switcher, profile, design system and workspace build contract.
- Development port: `4010`; hosted origin is centralized in `packages/shared/src/auth/appAuthConfig.ts` and remains intentionally blank until an approved production domain is supplied.
- Default View presents populated Week, Day and List modes modeled on the supplied lesson-plan reference, with Term, Week starting, Grade, Course, Teacher and Search filters.
- No new third-party dependency is introduced.

### 33.4 QA
- Verify Directory print preview contains member rows only.
- Verify Directory email/phone grid controls align at desktop and mobile overflow remains usable.
- Verify Support area defaults to Member Services and contextual deep links still override it.
- Verify Cancel sits next to Close ticket and both return to New Ticket as specified.
- Verify `npm run dev:lesson-plan`, targeted production build, and populated lesson-plan filters/views. After an approved hosted origin is configured, also verify App Hub launch, App Switcher destination, and authentication return flow.

## 34. v1.5.3 — Matt Money enterprise navigation refinement

### 34.1 Navigation hierarchy
- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- This requirement supersedes the v1.5.1 Matt Money placement rule that kept the Administrator/Member selector inside the page-header actions.
- Matt Money MUST use a dedicated product-level finance navigation surface immediately below the shared Catholic Solutions product header and before page-specific heading/content.
- Module navigation is left-aligned and content-width rather than stretching every menu item into an oversized equal-width tile. Administrator modules remain **Overview, Billing, Payments, Reconciliation, Reports**; Member modules remain **Overview, Payments, Payment methods, Statements**.
- Active navigation uses a restrained emerald text/background cue plus a clear bottom indicator. Non-active modules remain neutral; navigation must not resemble dashboard KPI cards.
- Administrator/Member is treated as a **workspace scope**, visually separated from the module menu on the right of the navigation surface. On narrower screens the workspace scope moves below the module row rather than compressing or wrapping module labels.
- Page-specific heading follows the navigation surface. Overview titles are **Finance overview** for Administrator and **Account overview** for Member. Export/Download remains a page action, not part of the module menu.
- Existing query-addressable URLs remain authoritative: `?view=admin|member&section=<module>`.

### 34.2 Interaction and responsive behavior
- Module tabs remain semantic buttons with `aria-current="page"` for the active module; the workspace switch remains an accessible pressed-state control.
- Desktop module navigation stays one line and uses horizontal scrolling only when the viewport cannot accommodate the content. It MUST NOT wrap into multiple ambiguous rows.
- Hover/focus states may change surface, border, text, or underline emphasis but MUST NOT translate or shift controls.
- On mobile, Administrator/Member becomes a full-width segmented scope control below the module row and the page action becomes full width when needed.

### 34.3 QA
- Verify Administrator and Member module sets and all existing query URLs.
- Verify navigation appears before the page heading, no module is rendered as a large equal-width dashboard tile, and the active state is unambiguous at 1366px, 1024px, tablet, and mobile widths.
- Verify keyboard focus, `aria-current`, pressed-state semantics, module horizontal overflow, and no regression in finance dashboard content or export actions.

## 35. v1.6.0 — Complete Lesson Plan workspace reference coverage

**Date:** August 13, 2026. This release supersedes the narrow v1.5.2 Lesson Plan view-only contract where the requirements below are more complete.

### 35.1 Source-of-truth reference
- **Owner:** Senior UI/UX Engineer + Senior Full Stack Developer.
- The uploaded `XtraCoach SaaS LessonPlan(1).html` is the functional reference for Lesson Plan information architecture and workflow coverage. The Catholic Solutions implementation MUST preserve the repository's shared shell/design system rather than copying the legacy styling literally.
- The first-party Lesson Plan workspace MUST cover the reference screens and flows: My Classes, Class Summary, Calendar, Unit Plans, Lesson Plans, Lesson Plan Form, XtraCoach Preparation, XtraCoach Preview, Student Portal/My Learning, XtraCoach Player, Agent Integration Flow, and Reports.
- Reference actions that were previously placeholders (Templates and Shared with me) are implemented as usable first-party workspace views rather than dead controls.

### 35.2 Workspace navigation and routes
- The app uses route-level, deep-linkable pages under the shared authenticated `AppLayout`.
- Primary product navigation: **My Classes, Calendar, Unit Plans, Lesson Plans, Reports**. Student Portal and Integration are secondary utilities, not peer KPI-style cards.
- Lesson Plan subnavigation: **View, Add, Templates, Shared with me, Go to Unit Plans**.
- Default app entry resolves to `/lesson-plans`. Existing central authentication, App Switcher, profile, logout, staging/production build behavior, and app ID remain unchanged.

### 35.3 Classes, calendar, and unit planning
- My Classes includes Term, Teacher, Grade, and Search controls plus the reference class columns: Class, Section, Course, Teacher, Enrollment, Skills, Homeroom, Report Cards, and Progress Report.
- Selecting a class opens a Class Summary with General, Assignments & Grading, and XtraCoach context tabs plus Edit/Delete/Class Report actions.
- Calendar supports Day, Week, and Month modes with lesson-to-editor navigation.
- Unit Plans show unit metadata, sequenced lessons/status, instructional timeline, and navigation to existing/new lesson plans.

### 35.4 Lesson Plan workflow
- Lesson Plans support Week, Day, and List modes, populated records, Term/Week/Grade/Course/Teacher filters, Search, previous/next-week navigation, records-per-page control, Print/CSV actions, direct lesson opening, new-plan generation, and a compact bulk-generation workflow.
- Bulk generation covers the reference planning inputs: scope (Single Day / Unit (Week) / Academic Year), Grade, Course, Term, Class Duration, Instructional Days, Start Date, and Total Lessons.
- The lesson editor captures teacher, grade, course, title, unit, dates, duration, and standard type, then exposes the complete **19-section** reference lesson structure for review/editing.
- Teachers can Save, Share, Cancel, and Prepare with XtraCoach. No generated content is treated as published until explicit teacher approval.
- Templates provides reusable lesson structures; Shared with me provides shared plans and a non-destructive Create a copy action.

### 35.5 XtraCoach learning workflow
- XtraCoach Preparation displays approved lesson context, editable Level 1–3 question banks, Save, Preview, and explicit Approve & make available behavior.
- Preview communicates Orientation → Level 1 → Level 2 → Level 3 → Mastery, including re-teach/retry behavior without grades, rankings, or badges.
- Student Portal/My Learning lists teacher-available lessons and launches the XtraCoach Player.
- XtraCoach Player demonstrates orientation, adaptive learning checks, help/re-teach states, mastery, and a student-only improvement summary.

### 35.6 Integration and reports
- Agent Integration Flow documents the six reference service responsibilities: Generate, Store, Review & approve, Serve learning checks, Write evidence home, and Student-only improvement report. It distinguishes lesson-service data from school-system identity/evidence data.
- Reports expose Class/Course, Concept, Term, Student Search, Level 1–3/Mastery filtering, stage distribution, concepts mastered, effort, and Last accessed. Reports remain learning-evidence views rather than grade/leaderboard surfaces.

### 35.7 UI/UX contract
- The reference's compact planning hierarchy is retained: clear horizontal navigation, compact secondary tabs, one primary work panel, dense filter rows, professional zebra tables, sticky headers where appropriate, and space-efficient actions.
- The implementation uses the current Catholic Solutions typography, spacing, card radii, focus states, shared topbar/profile/switcher, and restrained interactions. No transform-based hover movement is introduced.
- Desktop tables may scroll horizontally when the reference data requires width; controls must remain readable and keyboard accessible. Mobile layouts stack filters/actions without changing workflow meaning.

### 35.8 QA
- Verify every route can be opened directly and after refresh under the protected route.
- Verify My Classes → Class Summary, Calendar → Lesson, Unit → Lesson, Lesson List → Editor, Editor → XtraCoach Preparation → Preview, Student Portal → Player, and Reports filters.
- Verify Week/Day/List data, 19 lesson sections, templates, shared-plan copy action, bulk generation panel, XtraCoach levels/re-teach/mastery, integration flow, and report filtering.
- Verify App Hub/App Switcher destination opens `/lesson-plans`, no external XtraCoach URL is reintroduced, all source TS/TSX files stay developer-friendly, and no new package dependency is added.

## 36. v1.6.1 — Product launch policy and ArcAlerts channel composition

**Date:** August 13, 2026. This section supersedes earlier same-tab App Hub/App Switcher rules and supersedes §35 only for the active AI Lesson Plan product destination. The v1.6.0 native Lesson Plan source is retained as a dormant prototype, not deleted or exposed as the current launch target.

### 36.1 Product launch behavior
- **Owner:** Senior Frontend Developer + Senior UI/UX Engineer.
- App launch behavior is metadata-driven from the centralized app catalog; individual cards/switchers MUST NOT maintain independent per-app URL rules.
- App Hub primary Launch/Open actions, whole-card activation, Details-modal destinations, and shared App Switcher destinations open in a new browser tab with `rel="noopener noreferrer"` by default.
- **Support Center is the explicit same-tab exception** because it is the in-context member-support destination. `All apps` remains App Hub navigation rather than a product launch and therefore stays in the current tab.
- AI Lesson Plan Generator uses `https://demo.optionc.com/XtraCoach` as the approved active destination and MUST open in a new tab from every active product-entry surface. Its catalog kind is external for this phase.

### 36.2 ArcAlerts New Alert channel composition
- **Owner:** Senior Full Stack Developer + Senior UI/UX Engineer.
- Supported channels remain Email, Voice, and Text; Push MUST NOT reappear.
- Delivery-channel selection controls which detail accordions are rendered. Unselected channel panels are hidden; selected panels are expandable/collapsible.
- Email details include Subject, Reply-To Email, message formatting controls, message body, and attachment entry.
- Voice details include Phone To Call, Record voicemail via phone call, and Voice Recording ID.
- Text details include Text Message, character count, and 140-character SMS-segment guidance.
- The channel panels remain dependency-free and use existing application components/styles; no third-party rich-text editor is introduced for this prototype.

### 36.3 Recipient selection
- Members and Groups each expose a Select All control plus Clear selection.
- Select All materializes the full set as individual selections. It MUST NOT disable child checkboxes; after Select All, the user can uncheck any specific member or group while the remaining selections stay checked.
- Search continues to filter the visible Member list without silently changing the current selection set.
- Selection counts reflect the active Members/Groups mode.

### 36.4 QA
- Verify OptionC School, Matt Money, ArcAlerts, Parish Hub, Catholic Content, Unified Directory, external partner products, and AI Lesson Plan open new tabs from App Hub and the shared switcher.
- Verify Support Center stays in the current tab from those same surfaces.
- Verify AI Lesson Plan resolves exactly to `https://demo.optionc.com/XtraCoach` and no active catalog route points to the dormant native Lesson Plan workspace.
- Verify Email/Voice/Text channel toggles show/hide their accordions, accordion expansion is keyboard operable, and no Push control exists.
- Verify Select All Members and Select All Groups permit subsequent individual unchecking and Clear selection resets the active selection set.

## 37. v1.6.2 — Explicit product tab policy

**Date:** August 13, 2026. This section supersedes §36.1 and §36.4 only where they describe which product destinations open in a new tab. ArcAlerts composition requirements in §36 remain unchanged.

### 37.1 Navigation contract
- **Owner:** Senior Frontend Developer + Senior UI/UX Engineer.
- Launch behavior MUST remain centralized in the canonical app catalog. App Hub cards, whole-card activation, Details-modal actions, and the shared App Switcher MUST NOT maintain separate product-specific tab rules.
- Same-tab navigation is the default for any catalog product that does not explicitly opt into `navigationTarget: "new-tab"`.
- Exactly these currently approved destinations open in a protected new tab with `rel="noopener noreferrer"`: **AI Lesson Plan Generator, FerrerWorks, Mass Card Requests, Vincent Volunteer, Berchmans, Alive Date**.
- **OptionC School, Matt Money, ArcAlerts, Parish Hub, Catholic Content, Unified Directory, and Support Center** open in the current tab.
- `All apps` remains same-tab App Hub navigation and is not considered a product destination.
- AI Lesson Plan Generator continues to resolve to `https://demo.optionc.com/XtraCoach`.

### 37.2 QA
- Verify App Hub primary actions, whole-card activation, Details actions, and App Switcher all apply the same tab rule.
- Verify the six approved new-tab products open with `target="_blank"` and `noopener noreferrer`.
- Verify OptionC School, Matt Money, ArcAlerts, Parish Hub, Catholic Content, Unified Directory, and Support Center remain in the current tab.
- Verify no component contains a duplicate product-name allowlist; the catalog metadata is the single source of truth.

## 38. v1.6.3 - ArcAlerts profile-driven user preferences

**Date:** August 13, 2026. This section supersedes earlier ArcAlerts User Preferences requirements only where they assumed one fixed phone/email destination per member.

### 38.1 Contact-data source
- **Owner:** Senior Full Stack Developer + Senior UI/UX Engineer.
- ArcAlerts User Preferences MUST consume contact destinations from the shared Unified Directory profile projection. It MUST NOT maintain a separate hard-coded contact list for preference management.
- The shared projection exposes Home/Work/Mobile telephone entries and Home/Work/Organization email entries, including Primary and Unlisted metadata where present. Unified Directory's projected seed users consume the same shared profile contacts so the two products do not drift.

### 38.2 Preference behavior
- Email preferences are destination-specific. When two or more email addresses are present on a profile, the administrator can enable any one address, multiple addresses, or all available addresses independently.
- Voice and Text follow the same destination-specific behavior across all telephone numbers available on the profile. The system MUST NOT render an enabled/disabled toggle for a destination that is absent from the profile.
- A multi-destination channel cell may provide **Enable all** and **Clear** shortcuts, but individual destinations remain independently toggleable after either action.
- Primary contact metadata is informational and supplies the initial preference where available; it does not prevent another saved contact method from being enabled. Unlisted telephone metadata remains visible to the administrator.
- Pausing preferences disables editing without hiding the saved profile contact data or changing the underlying selections.

### 38.3 Filtering and UX
- User Preferences keeps the two-line member identity treatment. Contact details live in the Voice/Email/Text columns rather than expanding the identity column.
- The All/Voice/Email/Text filters represent availability of that channel on the profile, not whether the preference is currently enabled.
- Search covers member name, group, telephone type/number/extension, and email type/address.
- The footer reports both visible members and the total enabled contact destinations.

### 38.4 QA
- Verify a member with multiple emails can enable either email individually, enable both/all, clear all, then re-enable one without affecting Voice/Text.
- Verify telephone destinations behave independently for Voice and Text.
- Verify members with only one email or one phone render only that destination and members with a missing channel do not receive a fake toggle.
- Verify Primary and Unlisted indicators match the shared directory profile projection and Unified Directory displays the same seeded contact values.
- Verify search, availability filters, preference pause/resume, Save preferences, responsive horizontal table behavior, and existing ArcAlerts navigation remain unchanged.

## 39. v1.6.4 - ArcAlerts space-optimized user preferences

**Date:** August 13, 2026. This section refines §38 only for presentation density; all profile-driven data and preference behavior from §38 remain authoritative.

### 39.1 Density and hierarchy
- **Owner:** Senior UI/UX Engineer + Senior Frontend Developer.
- The User Preferences grid MUST prioritize scan density without hiding contact data: Member, Voice, Email, and Text remain visible as the primary columns.
- Member rows use compact identity treatment and channel destinations use compact two-line rows (destination value plus type/Primary/Unlisted metadata). Large nested cards or excess vertical whitespace are not permitted.
- Multi-destination channel cells keep the per-member contact count and Enable all/Clear shortcut but use reduced spacing so three telephone destinations remain readable without making one member consume excessive viewport height.
- Voice, Email, and Text controls preserve independent toggling and accessible pressed state; visual compaction MUST NOT reduce the click target below a practical touch/mouse target.

### 39.2 Responsive behavior
- Desktop table minimum width is reduced compared with v1.6.3 so the four-column preference grid requires less horizontal travel.
- The member column remains sticky and compact; bounded vertical scrolling should expose more member rows per viewport.
- Narrow screens may continue to use horizontal scrolling rather than collapsing destination semantics or hiding saved profile data.

### 39.3 QA
- Verify a member with three telephone numbers and two email addresses is materially shorter than the v1.6.3 row while every destination remains legible and independently toggleable.
- Verify Enable all/Clear, Primary/Unlisted labels, search, availability filters, pause/resume, Save preferences, and shared Unified Directory contact values are unchanged.
- Verify keyboard focus/pressed state remain usable and no destination value is removed solely to save space.


## 40. Central Login desktop composition balance (amends §32.1 and §34.1)

**Date:** August 18, 2026. Presentation-only refinement of the desktop Central Login. Authentication behavior, credential handling, Remember Me, Forgot Password, SSO actions, Request Access, `returnUrl` handling, central-session behavior, routes, and catalog data are unchanged. Where this section conflicts with the older Login density text in §32.1/§34.1, this section governs; all other Login requirements in those sections remain in force.

### 40.1 Requirements

- **Owner:** Senior UI/UX Engineer.
- The approved balanced two-panel desktop split (`1.02fr / minmax(30rem,.98fr)` from 1024px, `1.08fr / minmax(34rem,.92fr)` from 1280px) and the Sign In panel's width and card dimensions are unchanged. Brand-panel balance MUST be achieved through text measure, density, and grid geometry — never by widening the brand panel or shrinking the credential panel.
- The brand headline MUST use the available horizontal width before reducing type size. Its measure is `26ch` on desktop so the welcome headline resolves in about two lines instead of a tall narrow block.
- At supported desktop viewports (≥1024px wide, ≥720px tall) the ecosystem panel MUST resolve inside `100dvh` **without an internal vertical scrollbar**. The panel retains `overflow:auto` only as a graceful fallback for unsupported shorter viewports; it must not be the fit strategy.
- Core Platform and Also in the Ecosystem remain visually grouped inside one panel. Core products use two readable columns from 1024px and three from 1536px, where the brand column is wide enough to keep product names and category text legible.
- Vertical density is height-tiered: compact tiles below 820px viewport height, standard tiles between 821px and 939px, and relaxed tiles/spacing from 940px so tall desktops read as composed rather than as empty space above a compressed grid.
- The Login footer legal line (`© 2026 Catholic Solutions…` and `Built in the USA · Mission-driven technology`) MUST be readable: at least `0.65rem` with `rgba(255,255,255,.76)` on the navy footer, with vertical padding and horizontal inset from the viewport edge. The footer remains compact and MUST NOT compete with the Sign In card. Non-auth `.app-footer` presentation is unchanged.

### 40.2 Implementation traceability

- `packages/shared/src/designSystem/styles.css` — `v1.7.1 Login left panel` block (hero measure/type, tile and chip density, short-height tier) and the appended `v1.7.3 Login desktop composition balance` block (1536px core column tier, ≥940px height tier, `.app-footer--auth` legal legibility).
- No TSX changes: `AuthShell.tsx`, `CentralLoginPage.tsx`, and `Footer.tsx` markup, labels, focus order, and handlers are untouched.

### 40.3 Acceptance criteria

1. Desktop Login remains a balanced two-panel composition with unchanged Sign In width.
2. The welcome headline wraps to roughly two lines and does not create an oversized empty hero block.
3. All 18 catalog products remain visible and readable on the brand panel; product names never lose legibility to category text.
4. No internal vertical scrollbar appears in the ecosystem panel at 1024×720, 1366×768, 1440×900, or 1920×1080.
5. Copyright and mission footer text are clearly readable with spacing from the viewport edge.
6. No horizontal page overflow; tablet/mobile Login remains naturally scrollable under the existing base rules.
7. Keyboard focus, labels, accessibility behavior, and all authentication interactions are unchanged, and no dependency is added.

### 40.4 Validation record

- `@catholic-solutions/app-hub` (Login-owning workspace): `tsc -b` reports 0 diagnostics; `eslint` over App Hub, shared auth, and shared Footer sources reports 0 errors (1 pre-existing `react-refresh/only-export-components` warning in `AuthProvider.tsx`); `npm run build:hub` (Vite production) succeeds.
- Shared design-system CSS remains structurally balanced (3,053 opening / 3,053 closing braces).
- Resolved-cascade inspection at 1024×720, 1366×768, 1440×900, and 1920×1080 confirms the intended headline measure, core-column tier, tile/chip density tier, and footer legal size at each viewport.
- Rendered-browser verification was not performed in this environment; QA must confirm the no-internal-scroll and footer-legibility criteria visually at the four listed viewports before release.

## 41. App Hub section hierarchy, request-access actions, and workspace footer

**Date:** August 18, 2026. Approved App Hub presentation direction. Authentication, routes, catalog membership/ordering, Details behavior, Your Apps launch behavior, and the existing Request Access implementation are unchanged. Where this section conflicts with earlier App Hub section/footer presentation text, this section governs.

### 41.1 App Hub section hierarchy

- **Owner:** Senior UI/UX Engineer.
- The three App Hub collections MUST read as three levels of emphasis while sharing one card system. Individual product branding (icon, gradient, accent, name, category, description) is unchanged.
- **Your Apps** is the strongest surface: elevated panel, largest section heading, gold section mark, solid navy count badge, thicker card accent, and the themed launch action retained as the primary action.
- **Available Apps** is a distinct discovery surface: parchment/gold-tinted panel, gold count badge, dashed card border that resolves on hover, and an `Access on request` status badge instead of the catalog launch status.
- **Future Apps** is the quietest surface: muted panel, smaller/desaturated heading, flatter and shorter cards with a reduced icon, and no primary action (Details only).
- Each panel carries one short supporting line under its heading explaining what the section is for. Counts are stated in section-appropriate language (`active`, `on request`, `on the roadmap`).

### 41.2 Available Apps action

- The Available Apps primary action is **Request access**, not `Open`. It MUST invoke the existing App Hub Request Access flow (`RequestInterestModal`) with the selected app preselected. No duplicate request component and no new dependency.
- In request mode the card body is not a launch surface: card-level activation and the external-site action button are suppressed. The product logo remains the single outward link, as described in §41.7.
- `Details` remains the secondary action on every card and its behavior is unchanged, including its existing hand-off into the same Request Access modal.
- The request action is visually lighter than a Your Apps launch action (navy outline, not a themed gradient fill), preserving the section hierarchy.

### 41.3 Authenticated workspace footer

- The authenticated (`app`) footer is a single compact SaaS row: copyright, one mission line, and a system-status indicator, aligned in one responsive row that may wrap on narrow screens.
- The authenticated footer MUST NOT contain the Catholic Solutions brand/logo block, Privacy, Terms, a Support entry, or a second legal row. This supersedes the earlier same-tab navigation requirement for a footer Support link in authenticated shells; the Support Center remains reachable from the App Switcher and product navigation.
- The unauthenticated Login/Request Access footer (`variant="auth"`) is unchanged and retains its brand block, secure badge, Privacy/Terms/Support links, and legal row per §40.1.

### 41.4 Implementation traceability

- `apps/app-hub/src/modules/appHub/AppHubPage.tsx` — section variants, supporting lines, section-specific counts, and `actionMode` wiring.
- `apps/app-hub/src/modules/appHub/AppCard.tsx` — `actionMode: 'launch' | 'request'` prop, request-mode primary action, suppressed launch affordances, `Access on request` badge.
- `apps/app-hub/src/modules/appHub/RequestInterestModal.tsx` — reused unchanged.
- `packages/shared/src/app/components/Footer.tsx` — compact workspace footer branch; auth branch untouched.
- `packages/shared/src/designSystem/styles.css` — `v1.7.4 App Hub section hierarchy, request-access action, workspace footer` block.

### 41.5 Acceptance criteria

1. Your Apps, Available Apps, and Future Apps are visually distinguishable by surface, heading, badge, card emphasis, and action hierarchy without three separate card designs.
2. Every Available Apps card shows `Request access` as its primary action and no `Open` action.
3. `Request access` opens the existing Request Access modal with that app preselected; `Details` still opens the Details modal.
4. Your Apps launch behavior, targets, and new-tab policy are unchanged.
5. The authenticated footer is one row with no brand block, Privacy, Terms, or Support entries, and wraps cleanly on narrow viewports.
6. The Login/Request Access footer is unchanged.
7. The hero summary reports Your Apps, Available Apps, and Future Apps totals derived from the same collections that render the sections — no separately maintained figures.
8. An Available Apps card opens its configured external/demo site only when the product logo is activated, and that logo carries an `Open <App Name> site` accessible label and title. No separate external-link icon action exists.

### 41.6 Validation record

- `npm run typecheck` across all workspaces → 0 errors (shared `Footer` consumers included).
- `eslint` over `apps/app-hub/src` and `packages/shared/src/app/components/Footer.tsx` → 0 problems.
- `npm run build:hub` (Vite production) → success.
- Shared design-system CSS structurally balanced (3,095 opening / 3,095 closing braces).
- Rendered-browser verification was not performed in this environment; QA must confirm the three section treatments, the request-access path, and footer alignment visually before release.

### 41.7 Hero summary and Available Apps demo access

**Date:** August 18, 2026. Approved refinement of §41.1/§41.2; all other §41 requirements stand.

- The App Hub hero summary MUST report the three collections that are actually rendered below it — **Your Apps**, **Available Apps**, **Future Apps** — replacing the earlier `Your apps / More to explore / In catalog` figures. Totals are derived from the same section definitions that render the grids; duplicate or hard-coded counts are not permitted. The summary keeps its existing compact hero-integrated presentation.
- Available Apps are demo/discovery products. `Request access` remains the visually dominant primary action into the existing Request Access flow with the app preselected, and `Details` remains secondary.
- Each Available Apps card exposes its already-configured external/demo URL through the **product logo only**. The logo anchor reuses the existing link/navigation behavior (same-tab or new-tab per catalog policy) and carries an `Open <App Name> site` accessible label and title. It is the only element on the card that navigates outward; the card body is not clickable and no separate external-link action button is permitted.
- The action row stays a two-action row — `Request access` primary, `Details` secondary — so the request path remains the obvious primary action.
- Traceability: `AppHubPage.tsx` (section-derived hero summary), `AppCard.tsx` (request-mode logo link and labels), `styles.css` `v1.7.5` block (discovery logo-link affordance).
- Validation: `tsc -b` (App Hub) 0 diagnostics; `eslint apps/app-hub/src` 0 problems; `npm run build:hub` succeeds; shared CSS balanced (3,097 / 3,097 braces). Rendered-browser verification not performed in this environment.

## 42. Shared App Switcher destinations and current-app semantics

**Date:** August 18, 2026. Approved refinement of the shared launcher. Catalog data, product URLs, routes, authentication, App Hub behavior, and dependencies are unchanged. Where this section conflicts with the §25 (v1.3.5) launcher density text — specifically the collection it draws from, the visible `Current` badge, and the rule that the grid never scrolls internally — this section governs.

### 42.1 Destinations

- **Owner:** Senior Frontend Developer.
- The switcher MUST offer **every catalog product that resolves to a real navigable destination**: a registered first-party solution URL, or a configured partner URL. Products with neither remain absent.
- Destinations are derived at render time from `APP_CATALOG` plus the existing solution registry. No second app list, no duplicated URLs, and no catalog edits. Products whose origin is unconfigured in the current environment resolve to an empty URL and are filtered out.
- `All apps in App Hub` remains the separate footer action and is not part of the grid.

### 42.2 Current app

- The current app tile MUST NOT display a `Current` badge, checkmark, tooltip, or any additional status text. Current state is conveyed by `aria-current="page"` plus the existing active background/border treatment.
- The current app renders as a non-navigating element, so it is inert: no href, no click handler, and it is skipped in the tab order rather than being a focusable dead link.
- The current tile MUST NOT change appearance on hover; it keeps its active background, border, and no elevation.

### 42.3 Other apps and layout

- Every other destination remains a normal same-tab link under the existing navigation contract (`navigationTarget: 'new-tab'` still honored where the catalog sets it), with hover and `focus-visible` feedback retained and product icons/gradients unchanged.
- The launcher stays compact: existing responsive two/three-column grid, existing menu width. The grid is bounded to `min(52dvh, 23rem)` and scrolls internally **only** when the viewport genuinely requires it; the dropdown is not enlarged to fit all destinations.

### 42.4 Implementation traceability and validation

- `packages/shared/src/platform/shell/PlatformAppSwitcher.tsx` — catalog-derived destinations, registry-aware target resolution, removed `Current` badge and its screen-reader duplicate.
- `packages/shared/src/designSystem/styles.css` — `v1.7.6` block (bounded grid scrolling, inert current-tile hover). The now-unused `.app-switcher__current-badge` rule is retained as dead style only.
- `availableSwitcherApps` remains exported and unchanged because Support Center and Unified Directory consume it; the switcher no longer depends on it.
- Validation: `npm run typecheck` across all workspaces → 0 errors; `eslint` over the switcher and App Hub sources → 0 problems; `npm run build:hub` and `npm run build --workspace @catholic-solutions/support-center` → success; shared CSS balanced (3,100 / 3,100 braces). Rendered-browser verification was not performed in this environment; QA must confirm destination coverage, current-app inertness, and bounded scrolling visually.

## 43. App Hub card density and responsive catalog grid

**Date:** August 18, 2026. Approved space optimization of the App Hub grids and cards. Catalog data, routes, authentication, the Details flow, the Request Access flow, and dependencies are unchanged. This section supersedes the earlier App Hub grid column tiers and card metric text in §41 where they conflict; the §41 section-hierarchy and Available Apps action requirements remain in force.

### 43.1 Responsive grid

- **Owner:** Senior UI/UX Engineer.
- The App Hub catalog grid resolves **1 → 2 → 3 → 4 → 5 → 6 columns** at 0 / 560 / 768 / 1100 / 1400 / 1700 px. Six columns is the maximum.
- Column tiers are chosen so a card stays roughly 250px wide at every desktop tier; the grid MUST NOT add a column that makes cards excessively narrow.

### 43.2 Card composition

- Card rhythm is fixed: **logo + product name on one horizontal row**, then a secondary meta row (category and status), then the description, then the action row.
- The product name truncates with an ellipsis and carries a `title`; category and status are visually secondary (uppercase micro-label and compact chip) and both truncate rather than wrap.
- Descriptions clamp consistently to two lines on every card in every section.
- Padding, gaps, action height, and card minimum height are reduced (min-height 8.75rem, 8.25rem in Future Apps) while the product accent bar, gradient icon, and wash preserve per-product identity.

### 43.3 Status labels

- Status text is catalog-driven (`statusLabel`) and MUST remain truthful. No section hard-codes a duplicate status vocabulary.
- Render-time overrides are section-driven and rule-based, never per-product: `Access on request` for Available Apps in request mode, `Deployment pending` when a launchable product has no resolvable URL in the current environment, and the Future Apps rule below.
- **Future Apps is the upcoming/roadmap section**, so its cards MUST NOT present live-workspace status text such as `Active` or `All clear`. Each Future Apps card shows `Coming soon` when the catalog marks the product `coming-soon`, and `Upcoming` otherwise, using the muted coming-soon chip treatment. One rule derived from catalog status — no duplicated per-app status list.

### 43.5 Product display naming

- `OptionC Parish` is renamed to **Parish Hub** in all user-facing surfaces: catalog name and long description, cross-product integration lists, solution registry name and browser title, product environment titles, ArcAlerts group source labels, README, and this specification.
- All technical identifiers are unchanged: app id `optionc-parish`, workspace `@catholic-solutions/optionc-parish`, folder `apps/optionc-parish`, component `OptionCParishPage`, origin keys `optioncParish`, hosted domain `optionc-parish.optioncapp.com`, and development port `4005`.

### 43.4 Traceability and validation

- `apps/app-hub/src/modules/appHub/AppCard.tsx` — name promoted into the logo row, new secondary meta row, description-only content block.
- `packages/shared/src/designSystem/styles.css` — `v1.7.7` block (card density, meta row, action-row compaction, six-tier grid, section-emphasis retune).
- Validation: `tsc -b` (App Hub) 0 diagnostics; `eslint apps/app-hub/src` 0 problems; `npm run build:hub` succeeds; shared CSS balanced (3,127 / 3,127 braces); resolved-cascade inspection confirms 3/4/5/6 columns at 1024/1366/1440/1700+ px. Rendered-browser verification was not performed in this environment.

## 44. v1.6.5 — External-ready application launcher contract

**Date:** August 18, 2026. Approved extension of §42. The launcher remains catalog-driven and architecture-neutral: approved applications hosted outside Catholic Solutions may participate without becoming monorepo workspaces or being placed inside the Catholic Solutions authentication boundary. Where this section clarifies external-destination handling, it governs over older partner-only wording.

### 44.1 Destination ownership and configuration

- **Owner:** Senior Frontend Developer.
- `APP_CATALOG` remains the single product metadata source. A standalone SaaS/application that is not implemented under `apps/*` is represented as `kind: 'external'` with an absolute HTTP(S) `externalUrl` and, only when needed, an explicit `navigationTarget`.
- An external product MUST NOT be added to `SOLUTION_REGISTRY`, given a fake internal route, or wrapped in a Catholic Solutions workspace merely to make it appear in Switch App. `SOLUTION_REGISTRY` remains reserved for genuine first-party independently deployed Catholic Solutions applications.
- The shared switcher continues to inspect the complete catalog and includes every entry for which the canonical destination resolver returns a real destination. No switcher-specific app array or URL list is permitted.
- Adding another approved external application therefore requires catalog/configuration only; the shared launcher component itself must not be edited for each new product. App Hub section/entitlement placement remains governed by the existing App Hub rules and is not inferred from launcher presence.

### 44.2 Canonical destination resolver and security

- `resolveAppDestination(app)` in `packages/shared/src/platform/navigation/solutionNavigation.ts` is the canonical UI launch resolver. An explicit catalog `externalUrl` is authoritative for a direct-open product, even if a dormant/internal prototype with the same stable app id remains registered; otherwise genuine first-party products resolve through the existing solution/environment registry.
- Catalog-only destinations are launchable only when `externalUrl` is a valid absolute `http:` or `https:` URL. Empty, malformed, and non-web schemes are rejected and therefore omitted from the switcher rather than rendered as unsafe links. Production external destinations SHOULD use HTTPS.
- `navigationTarget` remains the single tab-policy source. `new-tab` produces `_blank` plus `rel="noopener noreferrer"`; unspecified products retain the existing same-tab default.
- Credentials, access tokens, tenant secrets, or user data MUST NOT be embedded in catalog URLs. A later federated/SSO integration must use a dedicated identity/broker flow while keeping this destination contract as the launcher boundary; direct external-link support does not imply SSO coverage.
- App Hub cards and the shared Details modal consume the same destination resolver so launch availability, tab behavior, and URL safety cannot drift from the switcher.

### 44.3 Launcher UX

- Existing two/three-column density, current-app inert state, focus/hover behavior, bounded scrolling, product identity, and `All apps in App Hub` footer remain unchanged.
- The subtitle reads **Open Catholic Solutions and approved connected apps** so the UI accurately represents a mixed launcher containing first-party and outside applications.
- External applications remain visually equal launcher destinations; no badge is required merely because hosting is external. Their presence does not imply Catholic Solutions ownership or authentication coverage.

### 44.4 Implementation traceability

- `packages/shared/src/platform/navigation/solutionNavigation.ts` — canonical `AppDestination` contract, HTTP(S) validation, first-party/external resolution, protected new-tab metadata.
- `packages/shared/src/platform/shell/PlatformAppSwitcher.tsx` — all destinations derived from `APP_CATALOG` through the canonical resolver; connected-app subtitle.
- `apps/app-hub/src/modules/appHub/AppCard.tsx` — App Hub launch/logo links consume the same destination contract.
- `packages/shared/src/app/components/AppDetailsModal.tsx` — Details launch action consumes the same destination contract.
- `packages/shared/src/app/types/app.ts` and `packages/shared/src/app/config/appCatalog.ts` — developer-facing external-app contract/documentation.
- `README.md` — concise external-app onboarding guidance.

### 44.5 Acceptance and validation

1. Existing registered Catholic Solutions applications continue to resolve through `SOLUTION_REGISTRY` and existing environment/domain rules.
2. Existing approved external catalog products continue to launch without any required `apps/*` workspace or solution-registry entry; an explicit direct-open catalog URL takes precedence over any dormant registered prototype.
3. A future external catalog entry with a valid HTTP(S) `externalUrl` becomes switcher-eligible without modifying `PlatformAppSwitcher.tsx`.
4. Invalid or non-HTTP(S) external URLs do not produce launcher links.
5. `navigationTarget: 'new-tab'` retains `_blank` + `noopener noreferrer`; same-tab remains the default.
6. Current app remains inert and `All apps in App Hub` remains separate.
7. App Hub and Details actions use the same resolved destination policy as Switch App.
8. Release metadata is synchronized to **v1.6.5** across root package metadata, solution manifest, README, and this Living Specification.

**Validation record:** targeted static inspection confirms all three launch surfaces import `resolveAppDestination`; the catalog contains 18 products, 7 direct external destinations, and 0 malformed/non-HTTP(S) external URLs; the modified TS/TSX files report 0 parser syntax diagnostics; this change adds no solution-registry entries; release metadata is synchronized to v1.6.5. Dependency-backed TypeScript/lint/build validation could not be completed because the uploaded archive does not contain installed dependencies.

## 45. v1.6.6 — Central external App Switcher plugin and single registration contract

**Date:** August 18, 2026. This section extends §44 without changing the existing multi-app deployment architecture, authentication boundary, App Hub section semantics, or product routes. The goal is to make the existing shared launcher consumable by independently owned external applications without copying Catholic Solutions UI/catalog source into those applications.

### 45.1 Central ownership and internal propagation

- **Owner:** Platform / Frontend Engineering.
- `packages/shared` remains the canonical source for the authenticated Catholic Solutions shell and Switch App behavior. Any Catholic Solutions workspace using `AppLayout` -> `PlatformTopbar` continues to receive the shared launcher; product pages MUST NOT carry local switcher copies.
- Catalog/destination registration remains centralized in `packages/shared/src/app/config/appCatalog.ts`. A product with no real destination MUST NOT be published in either launcher.
- Internal workspaces inherit shared-source changes when their normal deployment build consumes the updated `packages/shared` source. No application-specific switcher implementation is permitted.
- Current-app state is determined solely by stable application ID and MUST remain non-navigating even when that product's active destination is external.

### 45.2 External application plugin

- App Hub MUST publish a framework-neutral Web Component at `/integrations/app-switcher/app-switcher.js` as part of its normal Vite build and development server.
- The external integration asset MUST be generated from the same `APP_CATALOG` and approved production domain configuration used by Catholic Solutions. External teams MUST NOT maintain a second application catalog or destination map.
- The partner integration surface is:

  `<catholic-solutions-app-switcher current-app-id="<assigned-app-id>"></catholic-solutions-app-switcher>`

  plus the centrally hosted App Hub script.
- The component MUST have no React/Tailwind/Bootstrap dependency in the partner application and MUST isolate its presentation with Shadow DOM so host-site CSS cannot silently change launcher layout.
- The partner application supplies only its Catholic Solutions-assigned stable application ID at runtime. Product name, category, icon treatment, destinations, count, and App Hub footer URL are centrally supplied by the published launcher asset.
- Partner applications may be implemented in any web technology capable of loading a browser script and custom element. They MUST NOT be added to the React monorepo merely to participate in the launcher.

### 45.3 External-team onboarding contract

Before registration, the external team provides Catholic Solutions with product name, requested/stable ID, short display name, category, approved HTTPS production destination, same-tab/new-tab preference, approved icon/logo treatment, and short description. SSO/federation details are separate identity work and are not implied by launcher registration.

Catholic Solutions owns catalog registration and App Hub deployment. The external team adds the hosted script once and sets `current-app-id`. Subsequent catalog changes are delivered through the centrally hosted asset rather than requiring the partner to copy or edit a launcher list. A strict partner Content Security Policy must permit the Catholic Solutions App Hub origin in `script-src`.

### 45.4 Security and interaction requirements

1. Only centrally approved entries with resolved HTTP(S) destinations are emitted.
2. New-tab destinations use `noopener noreferrer`; same-tab remains the default unless explicitly configured otherwise.
3. The current application is inert, uses only the approved active background treatment, and does not show CURRENT/check badges or actionable hover feedback.
4. Other applications retain keyboard focus, hover, and navigation behavior.
5. `All apps in App Hub` remains a separate footer action to the central App Hub.
6. The launcher performs navigation only; it does not share credentials, tokens, cookies, or authentication state with an external SaaS product.
7. External launcher source MUST use safe DOM text assignment for catalog labels and MUST NOT inject untrusted product strings as HTML.

### 45.5 Implementation traceability

- `packages/shared/src/platform/shell/PlatformAppSwitcher.tsx` — shared internal launcher and ID-only inert-current rule.
- `packages/shared/src/platform/integrations/app-switcher/manifest.ts` — production external-launcher manifest derived from centralized catalog/domain configuration.
- `packages/shared/src/platform/integrations/app-switcher/catholic-solutions-app-switcher.js` — framework-neutral Shadow DOM Web Component source.
- `apps/app-hub/vite.config.ts` — development/build publisher for the stable `/integrations/app-switcher/app-switcher.js` asset with the generated manifest embedded.
- `apps/app-hub/vercel.json`, `apps/app-hub/netlify.toml`, `apps/app-hub/public/web.config`, and `apps/app-hub/public/.htaccess` — short revalidation/CORS delivery policy for the stable external integration asset across supported hosts.
- `docs/integrations/EXTERNAL_APP_SWITCHER.md` — partner onboarding, integration snippet, ownership and CSP guidance.
- `docs/integrations/external-app-switcher-example.html` — minimal host-application example.

### 45.6 Acceptance criteria

1. Existing internal solution pages continue to receive the switcher through the shared layout/topbar without product-local copies.
2. App Hub development/build configuration publishes one stable external switcher asset with a short revalidation policy so central updates do not require partner releases.
3. The published asset contains the same set of approved real destinations as the centralized production launcher contract.
4. An external HTML page can integrate the launcher with one script tag and one custom element, without React or Catholic Solutions CSS dependencies.
5. Setting an external product's registered ID as `current-app-id` makes its tile inert while all other approved destinations remain navigable.
6. Partner integration requires no duplicate catalog list and no `apps/*` workspace for the external SaaS product.
7. Unsafe/non-HTTP(S) external destinations remain excluded and protected new-tab behavior is preserved.
8. Root release metadata, solution manifest, README, and Living Specification are synchronized to **v1.6.6**.

### 45.7 Validation record

- Static source validation confirms the internal switcher remains centralized through `AppLayout` -> `PlatformTopbar` -> `PlatformAppSwitcher`.
- External Web Component source is framework-neutral, Shadow DOM scoped, uses text assignment for catalog labels, and applies `noopener noreferrer` to new-tab links.
- App Hub Vite configuration emits the integration asset from the shared plugin source with a build-time manifest derived from centralized `APP_CATALOG` and production origins.
- The current-app check is ID-based for both internal and external launcher use.
- Full dependency-backed Vite build/typecheck/lint remains environment-dependent when `node_modules` is not present in the supplied source archive; targeted syntax and generated-asset checks are required before delivery.

## 46. v1.6.7 — App Hub build-project boundary fix for external launcher publishing

**Date:** August 18, 2026. This section is a build/configuration correction to §45 only. The centralized launcher architecture, partner integration contract, catalog ownership, routes, authentication behavior, and UI are unchanged.

### 46.1 Requirement

- **Owner:** Frontend / Build Engineering.
- App Hub production builds MUST type-check the build-time external-switcher manifest dependency graph without `TS6307` project-file errors or `TS2307` shared-alias errors.
- Because `apps/app-hub/vite.config.ts` imports the shared manifest builder during the Node/Vite build, `apps/app-hub/tsconfig.node.json` MUST explicitly include that builder and its direct shared TypeScript dependencies instead of relying on the browser application tsconfig.
- The Node project MUST resolve the existing `@shared/*` alias used by the catalog and MUST target a modern ECMAScript level compatible with `Set`, `Array.find`, `Array.flatMap`, and `String.startsWith`.
- The fix MUST NOT duplicate `APP_CATALOG`, move external applications into `apps/*`, or create a second switcher manifest source.

### 46.2 Implementation traceability

- `apps/app-hub/tsconfig.node.json` — adds `target: ES2022`, a Node-project `rootDir` covering App Hub plus the shared build-time files, the existing `@shared/*` path mapping, and explicit inclusion of `manifest.ts`, `appCatalog.ts`, `appAuthConfig.ts`, and `app.ts`.
- No runtime component, catalog entry, route, authentication file, or external-team integration markup changes are required.

### 46.3 Acceptance criteria

1. `npm run build:production --workspace @catholic-solutions/app-hub` no longer reports the five `TS6307` / `TS2307` diagnostics from the external switcher manifest import chain.
2. The App Hub Vite config continues to generate `/integrations/app-switcher/app-switcher.js` from the centralized shared manifest/catalog.
3. Internal applications continue using `AppLayout -> PlatformTopbar -> PlatformAppSwitcher`; no product-local switcher copies are introduced.
4. External applications continue using the hosted Web Component and assigned `current-app-id`; no partner-side catalog is introduced.
5. Root package metadata, lockfile root metadata, solution manifest, README, and Living Specification are synchronized to **v1.6.7**.

### 46.4 Validation record

- Reproduced the reported TypeScript project-boundary cause: `vite.config.ts` imports `packages/shared/src/platform/integrations/app-switcher/manifest.ts`, while the previous Node tsconfig included only `vite.config.ts`.
- Targeted TypeScript validation of the corrected Node project with dependency type shims reports 0 diagnostics, confirming the `TS6307`, alias-resolution, and modern-library issues are resolved by the project configuration.
- A full dependency-backed Vite build could not be executed in this environment because package installation was unavailable; the supplied repository already declares the required Vite/Node/TypeScript dependencies and the user should run the normal workspace production build after extraction.

