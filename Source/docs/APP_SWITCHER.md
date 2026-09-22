# CFR App Switcher — Developer Guide

A standalone, embeddable widget that renders the Catholic Solutions "9-dot"
app launcher inside any external product (e.g. `optionc-sms`), without that
product taking a build-time dependency on this repo. The switcher only ever
appears for a browser that is also logged into CFR itself — never for a user
who signed into the host app directly — and lists only the apps assigned to
that member/org.

## How it works, end to end

```
{external app}/index.html
  <script src="https://{cfr-host}/integrations/app-switcher/app-switcher.js" defer></script>
        |
        v
CFR builds & serves app-switcher.js + session-check.html/js
(public/integrations/app-switcher/)
        |
        v
Widget opens session-check.html (CFR's own origin) in a hidden iframe
        |
        v
session-check.js reads CFR's own cached Portal JWT from localStorage
(cfr_app_switcher_session) and postMessages the result back
        |
   no session? -----------------------------> nothing renders at all
        |
     has token
        |
        v
Widget calls {cfr-gateway-origin}/portal/api/v1/CFRLaunch/GetAssignedProducts
  with that token as Authorization: Bearer ... (per-user, org-scoped)
        |
        v
Renders a 9-dot button + "Switch app" grid of that member's assigned apps
```

## How a CFR login actually gets a usable token into that flow

This is the part that isn't obvious from the widget code alone — it depends
on a fix made to CFR's own Auth0 login flow, not just the widget:

1. CFR's real (`authMode: 'sso'`) login goes through Auth0
   (`Auth0AppProvider.tsx`), configured with `cacheLocation: 'localstorage'`
   (not the SDK's default `'memory'`) specifically so a *separately loaded*
   page — the hidden session-check iframe — can see a cached session at all.
   Tradeoff accepted deliberately: the Auth0 token is then readable by any
   script on the CFR page, more exposed to XSS than memory-only caching.
2. **The raw Auth0 access token is never sent to CFR.Portal's own
   `[Authorize]` endpoints.** It's signed with Auth0's key, not CFR's — the
   JWT bearer scheme in `CommonServiceExtension.cs` only accepts tokens
   signed with CFR's own symmetric `JWTSetting:SecurityKey`. Auth0's token
   would just 401.
3. So `Auth0CallbackPage.tsx` calls a new backend endpoint,
   `POST PortalLogin/ExchangeAuth0Token`, with the Auth0 access token.
   `PortalAuthenticationService.ExchangeAuth0TokenAsync` verifies it against
   Auth0's own `/userinfo` endpoint (the standard OAuth2 way to validate an
   opaque/JWT token without implementing JWKS signature checking locally),
   resolves the CFR member by email (`Portal_GetUserByEmail`, no password —
   Auth0 already verified identity out of band), and returns a real,
   CFR-signed Portal JWT via the existing `PortalJwtTokenGenerator`.
4. `persistAuth0Session` stores that Portal JWT in **two** places:
   - `sessionStorage` (`cfr_portal_token`) — the app's own existing session,
     per-tab, used by CFR's own API calls as before.
   - **`localStorage`** (`cfr_app_switcher_session`) — a new, narrow-purpose,
     duplicate copy specifically so the session-check iframe (a different
     top-level browsing context than whichever tab logged in) can read it.
     `sessionStorage` is scoped per-tab and would be invisible there even on
     the same origin; `localStorage` is shared across same-origin tabs/iframes.
   Both are cleared together on sign-out (`clearAuth0SessionFlag`).

## Source locations

| Piece | Path |
|---|---|
| Widget source | `frontend/CFR/src/widget/appSwitcher.ts` |
| Session-check source | `frontend/CFR/src/widget/sessionCheck.ts` |
| Session-check shell page | `frontend/CFR/public/integrations/app-switcher/session-check.html` |
| Widget build config | `frontend/CFR/vite.widget.config.ts` |
| Session-check build config | `frontend/CFR/vite.widget-session-check.config.ts` |
| Build wiring | `frontend/CFR/package.json` (`build:widget`, chained into every `build:*` script) |
| Auth0 → Portal JWT exchange (frontend) | `frontend/CFR/src/modules/authentication/utils/auth0Session.ts`, `pages/Auth0CallbackPage.tsx` |
| Auth0 → Portal JWT exchange (backend) | `backend/Microservices/CFR.Portal/Controllers/Authentication/PortalLoginController.cs` → `ExchangeAuth0Token`; `Auth0Setting.cs`; `Auth0UserInfoClient.cs` |
| Personalized product list endpoint (already existed) | `backend/Microservices/CFR.Portal/Controllers/CFRLaunch/CFRLaunchController.cs` → `GetAssignedProducts` |
| Email-only member lookup SP | `backend/Infrastructure/CFR.PortalInfrastructure/Scripts/004_Portal_Auth0Exchange.sql` |
| Header integration example | `optionc-sms/src/designSystem/theme/layouts/header/PortalHeaderAppSwitcherSlot.tsx`, wired in `PortalHeaderMenuStrip.tsx` |

## Embedding in a new external app

This is the entire integration contract — one line, no other config:

```html
<script src="https://{cfr-host-for-this-environment}/integrations/app-switcher/app-switcher.js" defer></script>
```

Place it directly in that app's `index.html`, right before `</body>` — the
same place any third-party widget script (Intercom, Zendesk, analytics)
would go. Do not wrap it in a React component or inject it manually; a plain
tag is the standard, and it keeps the same lifecycle whether the host is a
CSR, SSR, or non-React app.

**The URL is the only per-environment knob.** The widget bundle served at
that URL already has its own CFR.Gateway origin baked in at CFR's build time
(from that build mode's `VITE_APP_REST_API_BASE_URL` — the same var CFR's
own app reads). So "dev vs. pilot vs. staging vs. live" for the embedding app
is purely "which CFR host does the script tag point at," typically driven by
one env var in the host app, e.g. optionc-sms's:

```
VITE_CFR_APP_SWITCHER_SCRIPT_URL="https://{cfr-host}/integrations/app-switcher/app-switcher.js"
```

referenced in `index.html` via Vite's native HTML env replacement:

```html
<script src="%VITE_CFR_APP_SWITCHER_SCRIPT_URL%" defer></script>
```

There is **no equivalent env var needed for the API side** — the widget
never talks to CFR.Portal on the host app's behalf without also having
proven a real CFR login first (see the flow above), so there's nothing for
the embedding app to configure or trust.

### Two rendering modes — pick one per host

**1. Floating corner button (default, zero setup)**
If the host page does nothing else, the widget appends a floating button
(`position: fixed; top: 16px; right: 16px`) to `document.body`.

**2. Inline in an existing header (recommended for a polished integration)**
Add an empty element with a specific id anywhere in the host's own header
icon row:

```html
<div id="cfr-app-switcher-slot"></div>
```

On load, the widget waits briefly (via `MutationObserver`, since a host's own
JS — e.g. a React app rendering its header — can still be mounting after this
script's `defer` load finishes) for this id to appear. If found, it mounts its
icon inside that element instead of floating in the corner, and styles its
dots with `color: currentColor` so they automatically match the surrounding
icons' color (works with any header theme, light or dark, without
configuration). See `PortalHeaderAppSwitcherSlot.tsx` for a real example —
a plain `<li>` + `<div id="cfr-app-switcher-slot">` styled with that header's
existing icon-button classes, placed after the messages icon in
`PortalHeaderMenuStrip.tsx`.

The slot element itself needs no logic — just exist with the right id and
whatever sizing/positioning matches its siblings. The widget owns everything
rendered inside it.

## Building and running in dev

1. **Backend**: run `CFR.Gateway` + `CFR.Portal` (for the session
   exchange and personalized product list) + `CFR.Acutis` (for CFR's own
   login). The floating/inline button only actually appears once a real CFR
   login has happened in that browser — there is no "always show, anonymous"
   mode anymore.
2. **CFR**:
   ```bash
   cd frontend/CFR
   npm run dev
   ```
   This runs `build:widget` first (bakes `.env.development`'s gateway origin
   into `app-switcher.js`), then serves everything — including
   `/integrations/app-switcher/app-switcher.js` and `/session-check.html`/`.js`
   — at `http://localhost:4001`.
3. **Log into CFR** (in real SSO/Auth0 mode) in that same browser at least
   once — this is what populates `cfr_app_switcher_session` in `localStorage`.
   Without this step the widget mounts nothing, by design.
4. **The embedding app** (e.g. optionc-sms): just needs its script tag
   pointing at `http://localhost:4001/integrations/app-switcher/app-switcher.js`
   in dev, and both dev servers running side by side.

To rebuild the widget bundles alone (no full CFR app rebuild):
```bash
cd frontend/CFR
npm run build:widget
```

## Building for pilot / staging / live

```bash
cd frontend/CFR
npm run build:pilot     # or build:staging / build:live
```

Each script builds both widget bundles first with the matching `--mode`, so
the correct gateway origin for that environment gets baked into
`app-switcher.js` automatically (`session-check.js` needs no per-environment
config — it only ever reads one fixed `localStorage` key). Deploy the
resulting `dist/` (which includes `integrations/app-switcher/*`) exactly as
CFR is normally deployed for that environment.

On the embedding app's side, update its own `VITE_CFR_APP_SWITCHER_SCRIPT_URL`
(or equivalent) for that environment to point at CFR's real host, then build
and deploy the embedding app as usual.

**Also required per environment, backend side**: `Auth0:Domain` in that
environment's `CFR.Portal/appsettings.{Environment}.json` — currently only
set for `Development`. Without it, `ExchangeAuth0TokenAsync` always fails
(`InvalidAuth0Token`) and no CFR login in that environment can ever populate
a session for the widget.

## Troubleshooting checklist

Work through these in order — each rules out one layer:

1. **Is this a deployed/test site, or your local `npm run dev`?** A remote
   test deployment only reflects code that has actually been rebuilt and
   redeployed since the change.
2. **Did you actually log into CFR in this browser?** The switcher renders
   nothing at all — not even the floating button — if there's no CFR session.
   This is expected, not a bug. Check DevTools → Application → Local Storage
   on the CFR origin for `cfr_app_switcher_session`.
3. **Did the Auth0 → Portal JWT exchange succeed?** DevTools → Network on
   CFR's own login flow: look for `PortalLogin/ExchangeAuth0Token` returning
   200 with a `resultData.user.token`. A 401 here means either Auth0's
   `/userinfo` rejected the token, or no CFR member matches that email
   (`Auth0UserNotFound`).
4. **Script tag present on the host app?** View source / curl the embedding
   app's served `index.html` and confirm the `<script src="...app-switcher.js"
   defer>` tag is there with a real URL (not a literal `%VITE_...%`
   placeholder).
5. **Scripts reachable?** Open `.../app-switcher.js` and
   `.../session-check.html` directly in a browser tab. Both should load, not
   404/connection-error. If CFR's dev server isn't running, this fails
   silently in the embedding app.
6. **Session-check round trip happening?** DevTools → Console on the
   embedding app, run:
   ```js
   document.querySelector('.cfrsw-wrap')
   ```
   `null` after a few seconds → either no CFR session was found (see step 2)
   or `__CFR_GATEWAY_ORIGIN__` is empty (check Console for
   `[app-switcher] Built without a VITE_APP_REST_API_BASE_URL...`, meaning
   CFR was built without its own env file loaded). An element → it mounted;
   check Network for `GetAssignedProducts` to see if the app list itself
   loaded or errored.
7. **Wrong visual mode?** If you expected inline-in-header placement but see
   the floating corner button instead, the host page's
   `#cfr-app-switcher-slot` element either never appeared (fix belongs in the
   host app, not the widget) or took longer than the widget's wait timeout.

## Known gaps / things to verify before relying on this in production

- **Auth0 domain only configured for Development.** Pilot/Staging/Live
  `CFR.Portal/appsettings.*.json` have no `Auth0` section — must be filled in
  with each environment's real tenant domain before the exchange (and
  therefore the whole personalized switcher) can work there.
- **Placeholder CFR hosts** in optionc-sms's `.env.pilot` / `.env.Staging` /
  `.env.production` (`*.optioncapp.com` domains) are guesses made while
  building this — confirm the real per-environment CFR hosts before
  deploying.
- **`postMessage` target origin is `'*'`** in `sessionCheck.ts` — the
  embedding host's origin isn't known in advance (any external product can
  embed this widget), so the session-check result (including the bearer
  token) is deliverable to whatever page opened the iframe, by design. A
  compromised or malicious host page embedding this widget could read that
  token. Accepted for now since the token only grants read access to the
  member's own assigned-product list; revisit if this needs a tighter trust
  boundary later (e.g. validating `document.referrer` where available).
- **CORS is currently wide open** on the whole CFR.Base app
  (`SetIsOriginAllowed(_ => true)`, any origin, with credentials) — broader
  than anything this feature specifically needs; worth revisiting if CORS
  should be tightened for other endpoints later.
- **The DB migration must be applied.** `004_Portal_Auth0Exchange.sql`
  (`Portal_GetUserByEmail`) needs to be run against each environment's
  database before the exchange endpoint will resolve any member.
