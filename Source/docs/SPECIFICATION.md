# Catholic Solutions — Living Specification v1.3.3

> **Canonical release baseline:** v1.0.0. **Current release:** v1.3.3. The v1.x line remains the first formal architecture generation; pre-baseline prototype iteration numbers are intentionally not part of the release sequence.

## v1.0 Repository and Solution Architecture

- Use an npm-workspaces monorepo with `apps/*` for independently deployable applications and `packages/*` for reusable cross-application code.
- Each Catholic Solutions product is independently deployable to its own domain and owns its application entry point, routes, feature source, public assets, favicon, environment files, build configuration, SPA fallback, and `dist` output.
- Canonical application folders are `apps/app-hub`, `apps/optionc-school`, `apps/matt-money`, `apps/arc-alerts`, `apps/optionc-parish`, `apps/catholic-content`, `apps/unified-directory`, and `apps/support-center`.
- Workspace package names use the `@catholic-solutions/*` scope.
- `packages/shared` is restricted to genuine cross-product concerns: common authentication guard/login shell, common shell, 9-dot switcher, account/profile UI, footer, catalog, environment/domain navigation, browser branding, user context, notifications/toasts, shared types, and design-system primitives.
- Product-specific business logic MUST remain under its owning `apps/<product>/src` boundary.
- Each app maintains only `.env.development` and `.env.production`. Domain/auth routing is centralized in `packages/shared/src/auth/appAuthConfig.ts`; `VITE_*` values are public client build metadata only and MUST NOT contain secrets.
- Cross-solution navigation resolves configured origins and performs full-domain navigation; React Router is responsible only for routes within the current solution.
- Each app maintains its own favicon and SPA refresh fallback configuration.
- `config/solutions.json` is the machine-readable solution/build manifest; runtime domains are centralized in `packages/shared/src/auth/appAuthConfig.ts`.

**Development model:** Spec-driven development  
**Current version:** 1.3.3  
**Last updated:** August 12, 2026  
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

Catholic Solutions is a front-end App Hub prototype for Catholic schools, parishes, ministries, and families. It demonstrates login, application discovery, application launching, account/profile interactions, application switching, and eight launchable application modules using static prototype data.

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
- OptionC Parish → `http://localhost:4005`
- Catholic Content → `http://localhost:4006`
- Unified Directory → `http://localhost:4007`
- Support Center → `http://localhost:4009`

Port `4008` was allocated to Volunteer Manager and is intentionally left unassigned after that solution's removal, so the remaining solutions keep their established ports and existing developer bookmarks, proxies, and callback configuration stay valid.

Staging and production use separate configured origins for the same applications. Checked-in `.example` hostnames are placeholders only; approved DNS values must replace them before deployment.

### Cross-solution navigation

- The common 9-dot `PlatformAppSwitcher` is the single application-switching contract for all solution domains.
- Switching to another solution performs a full browser navigation to that solution's configured origin. React Router controls navigation only inside the currently loaded application.
- **Every cross-solution entry point opens a new tab.** Launching from an App Hub card, opening a partner product, choosing an app in the App Switcher, and the `All apps` App Hub action all open their destination in a new browser tab. The originating application is never replaced. This supersedes the earlier rule that distinguished launching from switching: one consistent behaviour across every app-to-app control is more predictable than two. The compact switcher primary cards may omit a persistent `↗` glyph to preserve the approved recognition-first card treatment; new-tab behavior remains explicit through link semantics and accessible labels.
- Because a solution can now be open in several tabs at once, sign-out must propagate between them. See §10.5.
- **All apps (App Hub)** always resolves to the Platform origin `/apps`.
- Sign out resolves to the Platform origin `/login`.
- Same-origin navigation uses React Router where possible; cross-origin navigation uses standard browser navigation.
- Individual solutions must not duplicate or fork the common App Switcher/profile shell.

### Environment configuration

Every application contains:

- `.env.development`
- `.env.staging`
- `.env.production`
- `.env.example`

Each file defines the current app ID, public app title, base path, local development port, central auth origin, and all solution origins. `VITE_*` values are public browser configuration only and must never contain passwords, private API keys, signing keys, database credentials, or confidential tokens. Machine-specific overrides belong in ignored `.env.local` / `.env.<mode>.local` files.

### Authentication boundary

- The current implementation remains a frontend prototype and uses the existing local user context per application.
- A real separate-domain deployment requires centralized SSO / identity-provider integration. React Context or `localStorage` must not be treated as cross-domain authentication.
- `VITE_AUTH_ORIGIN` identifies the centralized authentication entry point and currently resolves to the Platform application.

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
- `/members`
- `/groups`
- `/settings`
- `/preferences`
- `/best-practices`

**OptionC Parish domain**
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
4. OptionC Parish
5. Catholic Content
6. Unified Directory
7. Support Center

Launchable apps are Catholic Solutions solutions: each is an owned `apps/*` deployment behind the central login, present in `SOLUTION_REGISTRY`, and reachable from the App Switcher.

### External partner apps — 6

Products hosted on their own domains, outside the Catholic Solutions SSO boundary.

| App | Purpose | Destination |
|---|---|---|
| FerrerWorks | Facility management | `https://ferrerworks.com` |
| Mass Card Requests | Mass card requests | `https://masscardrequests.com` |
| VincentVolunteer | Volunteer coordination | `https://vincentvolunteer.com` |
| Berchmans | Altar server scheduling | `https://berchmans.app` |
| AliveDate | Alive-date lookup for records upkeep | `https://alivedate.com` |
| FriarFriend | AI quiz maker | Not published yet |

Rules:

- External apps appear as cards in the App Hub **Your Apps** section alongside the launchable solutions.
- They open in a new tab with `rel="noopener noreferrer"`, so a partner site can never reach an authenticated Catholic Solutions session through `window.opener`.
- They are **not** in `SOLUTION_REGISTRY`, the App Switcher, the connected-workspace preview, or Request Access product selection, because they are not covered by the central login or by a Catholic Solutions deployment boundary.
- They carry no fabricated usage metrics or feature detail. Only what the owning product publishes is shown, so the Details modal omits empty At-a-glance and Key-features sections rather than inventing them.
- An external app with no published URL renders as a non-interactive **Coming soon** card, communicated by label and cursor rather than color alone.

### AI Tools — 3

1. AI Website Builder
2. AI Lesson Plan Generator
3. AI Attendance Taker

### Discover More Apps — 2

1. Financial Needs Assessment
2. Catholic Camp Finder

Facility Manager, Altar Server Scheduler, and AI Study Guide & Quiz Maker were placeholder catalog entries for products that now exist at real domains. They are promoted into the External partner apps group as FerrerWorks, Berchmans, and FriarFriend rather than being duplicated across two sections of the same page.

The App Hub, App Details modal, and Switch App control must use the centralized typed catalog rather than duplicate application metadata.

## 5. Immutable brand rules

### 5.1 Login

The approved Catholic Solutions Login color identity is locked. Do not change the established navy/gold palette, brand gradient, or core brand identity unless explicitly requested.

### 5.2 App Hub / Landing

The approved Catholic Solutions App Hub color identity is locked. Do not change the established navy/gold hero identity or existing per-app launch-card gradients unless explicitly requested.

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
- Left brand panel uses the locked navy gradient, gold accents, restrained ambient depth, a large brand message, a connected-workspace preview, three concise proof metrics, and trust indicators.
- Connected-workspace preview shows the eight launchable applications with application name/category without recreating the older crowded 4×2 tile matrix.
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
- Section 02 — Products of interest: selectable product cards for the six access-requestable product applications using app icon, app name, category, and selected indicator. Support Center is an included workspace utility and is not an access-request selection, and external partner apps are excluded because they are not Catholic Solutions deployments. Desktop may use three product columns when space allows.
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

## 8. App Hub / Landing specification

### 8.1 Required content

- Locked Catholic Solutions navy/gold top-level identity.
- Time-aware greeting driven by current user first name.
- Compact hero summary with app count, approvals, and system status. Product-specific promotional/banner CTAs are not shown in the hero.
- Live search across every catalog group, including external partner apps.
- A **Your Apps** section containing the seven launchable solutions followed by the six external partner apps.
- Three AI tools.
- Two Discover More apps.
- Responsive app-grid behavior appropriate to the thirteen-card Your Apps section.

### 8.2 Card action consistency

Landing card actions are deliberately compact but must share one visual hierarchy:

- Launchable cards expose `Launch ↗` as the compact primary action and `ⓘ Details` as the compact secondary action.
- External partner cards use the same colored surface and the same two-column action row, exposing `Open ↗` as the primary action and `ⓘ Details` as the secondary action.
- **Both primary actions open the destination in a new browser tab**, so the App Hub is never replaced by the application it just launched and remains available as a launcher. The `↗` glyph rather than `→` communicates this; a card whose action leaves the current tab must not use `↗`.
- Both are real anchors, not buttons, so the destination is exposed to assistive technology and the browser's own ctrl-click, middle-click, and open-in-new-window affordances continue to work.
- Every new-tab target carries `rel="noopener"` so the opened page cannot reach back through `window.opener`. Third-party partner destinations additionally carry `noreferrer`; first-party solution origins do not require it.
- An unpublished external card replaces the primary action with a non-interactive `Coming soon` control that keeps the shared action geometry so grid alignment is preserved.
- AI and Discover cards expose `Learn More` using the **same secondary-action height, radius, typography, border weight, line-height, and focus behavior as Details**.
- All landing card actions are single-line controls. Labels and icons/arrows must never wrap onto a second line.
- Launchable cards use an equal two-column action row so Launch and Details have matching width and vertical alignment.
- AI/Discover Learn More uses the same 36px action height and pill radius while remaining right-aligned on white cards.
- Surface treatment may adapt for contrast: Details is translucent on colored launch cards; Learn More is outlined on white catalog cards.
- Button geometry is enforced by the shared `.hub-card-action` design-system primitive rather than relying only on per-card utility composition.
- Hidden live-stat rows from the newest HTML must not reserve empty card space.
- Card hover must not use translate/scale/rotate motion.

**Acceptance criteria:** at supported widths, `Launch ↗`, `ⓘ Details`, and `Learn More` remain vertically centered, single-line, visually balanced, and free of label/icon wrapping. Launching from a card leaves the App Hub open in the originating tab.

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
- `Launch ↗` for launchable apps, `Visit site ↗` for published external partner apps, a disabled `Coming soon` action for unpublished ones, or Request this app for non-launchable catalog apps.

The modal's launch and visit actions open in a new tab and follow the same anchor and `rel` rules as the App Hub cards (§8.2). Only the non-navigating Request this app case remains a button.

Sections backed by empty data are omitted rather than rendered blank. External partner apps supply no At-a-glance stats and no expanded detail, so those sections do not appear for them.

The expanded control must change to `Show less details` when open.

## 9. Profile and account interactions

The newest HTML profile behavior is part of the React baseline.

Required behavior:

- App Hub and every launchable app top bar use the shared profile avatar/menu.
- Menu displays current name and email.
- Menu actions: Profile, Password, Sign out.
- Edit Profile supports full name, email, phone, and read-only Role / Organization.
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

The App Switcher is a compact recognition-first launcher inspired by the latest approved launcher reference. It supersedes the earlier single-line row / adaptive three-column treatment.

Required behavior and appearance:

- Use the established 3×3 nine-dot application launcher SVG icon rather than a decorative Unicode glyph.
- Trigger uses a 44px+ target, compact icon container, `Switch app` label on supported widths, and chevron state.
- Dropdown is a compact elevated launcher approximately **380px wide** on desktop, capped by the viewport with `calc(100vw - 24px)`-style behavior. It uses a restrained `JUMP TO` eyebrow and does not show an app count or explanatory paragraph.
- The six primary destinations render as a **two-column visual card grid** in this order: OptionC School, OptionC Parish, ArcAlerts, Matt Money, Catholic Content, Unified Directory.
- Primary cards are recognition-first: existing catalog gradient/icon plus the full application name only. Category subtitles, descriptions, badges, and persistent external-link arrows are deliberately omitted from these cards.
- Support Center is the seventh launchable destination and is presented below the primary grid as a **full-width workspace utility card** with the concise supporting line `Help, tickets & resources`. This deliberately solves the odd seventh-card layout while giving support an appropriate secondary hierarchy.
- The current application remains non-navigating, carries `aria-current`, an explicit check indicator, and a restrained Catholic Solutions gold/cream selected treatment. Current state is never communicated by color alone.
- Non-current destinations remain real anchor links and open in a **new tab** (§3) with `rel="noopener noreferrer"`, preserving browser ctrl-click, middle-click, and open-in-new-window behavior.
- External partner/discovery applications remain excluded. The switcher is the movement contract between solutions that share the central session; external products remain discoverable from App Hub only.
- The footer contains one full-width `All apps` action back to `/apps`, also opening in a new tab. It uses the shared launcher icon and a restrained warm brand surface rather than promotional copy.
- The menu closes on navigation, outside click, and Escape.
- Hover/focus treatment may strengthen border, surface, shadow, and focus ring only. Do not use translate, bounce, zoom, or scale hover motion.
- At narrow widths the launcher keeps the two-column recognition layout while shrinking spacing/icon dimensions enough to remain usable without internal scrolling at the current seven-app catalog size. Full names may wrap naturally rather than being truncated.

### 10.3 Premium account menu

- Account trigger uses avatar, current name/role on wider screens, and chevron.
- Dropdown summary includes avatar, name, email, and organization role.
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

Because every app-to-app control opens a new tab (§3), one solution can be open in several tabs at once. Sign-out must therefore be a session event, not a per-tab one.

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

### 11.3 Acceptance criteria

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
5. **Members** — read-only ArcAlerts contact directory with search, Parent/Staff filtering, group membership, available channels, and contact status. No create/edit/delete actions are exposed.
6. **Groups** — read-only recipient-group directory with search, group-type filtering, member count, source application, available channels, and last-used context. No create/edit/delete actions are exposed.
7. **Settings** — organization identity, supplied voice credentials, sender name, timezone, retention, emergency-confirmation setting, and save action.
8. **User Preferences** — personal delivery confirmations, failure warnings, scheduled reminders, activity digest, compose defaults, and time display.
9. **Best Practices** — pre-send/post-send operational guidance covering emergency use, concise messaging, channel choice, subject quality, audience/timing verification, and delivery review.

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
6. Members and Groups are strictly read-only views. Search/filter controls are allowed, but no create, edit, delete, invite, or membership-management actions are shown.
7. Settings and User Preferences use clear toggles/inputs and retain prototype-only persistence.
8. About reuses the supplied content and Archangel artwork in a modern responsive composition rather than recreating the legacy page.
9. Best Practices is operational guidance, not a marketing page.
10. Shared AppTopbar, App Switcher, footer, responsive rules, focus states, and spacing conventions remain consistent with other launchable modules.

### OptionC Parish

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
| Matt Money | `apps/matt-money/src/solution/MattMoneyPage.tsx` |
| OptionC School | `apps/optionc-school/src/solution/OptionCSchoolPage.tsx` |
| ArcAlerts | `apps/arc-alerts/src/solution/ArcAlertsPage.tsx`, `apps/arc-alerts/src/solution/components/*`, `apps/arc-alerts/src/solution/assets/*` |
| OptionC Parish | `apps/optionc-parish/src/solution/OptionCParishPage.tsx` |
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
- App Switcher trigger, selected/current app, seven-app launcher, All apps action, Escape/outside-click closing, and narrow-screen dropdown behavior.
- Profile/Security/Sign out menu behavior.
- Existing App Hub card action consistency, details modal, dashboard responsiveness, and horizontal table scrolling.


### App Switcher launcher standard

- The Switch App trigger uses the shared true 3×3 nine-dot application-launcher icon.
- Launcher width is approximately 380px on desktop and never exceeds the available viewport width.
- The launcher heading is a compact uppercase `JUMP TO` eyebrow rather than a large title/count pair.
- Six primary launchable apps use a fixed two-column recognition grid with centered icon + full app name.
- Support Center is separated as a full-width utility row below the six primary cards.
- App Hub is a separated full-width footer action labelled `All apps`.
- Current-workspace emphasis, new-tab route behavior, outside-click close, Escape close, and accessible focus states remain mandatory.
- The launcher must not introduce an internal scrollbar for the current seven-app catalog.
- No category subtitle or description is rendered on primary launcher cards.
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
- Preserved nine independently deployable web applications: App Hub, OptionC School, Matt Money, ArcAlerts, OptionC Parish, Catholic Content, Unified Directory, Volunteer Manager, and Support Center.
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
- OptionC Parish: `4005`
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
- `4005` — OptionC Parish.
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

The `apps/volunteer-manager` workspace, its catalog entry, registry entry, solution manifest entry, environment key, and root npm scripts are removed. Volunteer coordination is served by the external VincentVolunteer product. Port `4008` is left unassigned rather than reallocated so the remaining solutions keep their established ports.

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
5. Staging and production environment files for all eight applications carry the approved origins, and no `catholicsolutions.example` placeholder remains in any build output.
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

This preview adapter is **not production authentication**. Production builds remain fail-closed and require a real server-issued `HttpOnly`, `Secure` session or OIDC/OAuth authorization-code + PKCE integration. The frontend must never treat the staging preview cookie as a production security boundary.

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
- In a normal dependency-installed environment, use `npm run build:staging` for the hosted staging build and `npm run build:production` for the fail-closed production build.
