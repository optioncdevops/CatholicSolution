# CFR Widget — Developer Guide

A standalone, embeddable widget that renders the Catholic Solutions "Switch
app" launcher inside any external product (e.g. `optionc-sms`), without that
product taking a build-time dependency on this repo. Externally, this is
referred to as the "CFR Widget"; internally in the code, identifiers still
use the term "app switcher" (class prefix `cfrsw-`, file `appSwitcher.ts`,
element id `cfr-app-switcher-slot`, etc.) — both names refer to the same
component.

## How it works, end to end

```
{external app}/index.html
  <script src="https://{cfr-host}/integrations/app-switcher/app-switcher.js" defer></script>
        |
        v
CFR builds & serves app-switcher.js (public/integrations/app-switcher/)
        |
        v
Widget calls {cfr-gateway-origin}/acutis/api/v1/Products/GetProducts
  (anonymous, CORS-open - see ProductsController.GetProducts)
        |
        v
Widget filters to isActive && productStatus === 1 && externalPageUrl set
        |
        v
Renders a "Switch app" grid of launchable apps
```

No CFR session, JWT, or auth is used or required. The CFR Widget lists all
active, launcher-eligible first-party apps globally — the same `Product`
records managed via CFR_Admin's Products module — with no per-user or
per-organization personalization. A per-user/CFR-login-gated version of this
was built and then intentionally rolled back (see "Rolled-back work" below)
to keep this feature scoped to just the widget itself.

## Source locations

| Piece | Path |
|---|---|
| Widget source | `frontend/CFR/src/widget/appSwitcher.ts` |
| Widget build config | `frontend/CFR/vite.widget.config.ts` |
| Build wiring | `frontend/CFR/package.json` (`build:widget`, chained into every `build:*` script) |
| Backend endpoint (already existed) | `backend/Microservices/CFR.Acutis/Controllers/Products/ProductsController.cs` → `GetProducts` |
| Header integration example | `optionc-sms/src/designSystem/theme/layouts/header/PortalHeaderAppSwitcherSlot.tsx`, wired in `PortalHeaderMenuStrip.tsx` |
| External partner-facing reference | "CFR Widget Integration" section, maintained separately in the external integration guide (not in this repo) |

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

**The URL is the only per-environment knob.** The CFR Widget bundle served
at that URL already has its own CFR.Gateway origin baked in at CFR's build
time (from that build mode's `VITE_APP_REST_API_BASE_URL` — the same var
CFR's own app reads). So "dev vs. pilot vs. staging vs. live" for the
embedding app is purely "which CFR host does the script tag point at,"
typically driven by one env var in the host app, e.g. optionc-sms's:

```
VITE_CFR_APP_SWITCHER_SCRIPT_URL="https://{cfr-host}/integrations/app-switcher/app-switcher.js"
```

referenced in `index.html` via Vite's native HTML env replacement:

```html
<script src="%VITE_CFR_APP_SWITCHER_SCRIPT_URL%" defer></script>
```

### Two rendering modes — pick one per host

**1. Floating corner button (default, zero setup)**
If the host page does nothing else, the CFR Widget appends a floating button
(`position: fixed; top: 16px; right: 16px`) to `document.body`.

**2. Inline in an existing header (recommended for a polished integration)**
Add an empty element with a specific id anywhere in the host's own header
icon row:

```html
<div id="cfr-app-switcher-slot"></div>
```

On load, the CFR Widget waits briefly (via `MutationObserver`, since a
host's own JS — e.g. a React app rendering its header — can still be
mounting after this script's `defer` load finishes) for this id to appear.
If found, it mounts its icon inside that element instead of floating in the
corner, and styles its dots with `color: currentColor` so they automatically
match the surrounding icons' color (works with any header theme, light or
dark, without configuration). See `PortalHeaderAppSwitcherSlot.tsx` for a
real example — a plain `<li>` + `<div id="cfr-app-switcher-slot">` styled
with that header's existing icon-button classes, placed after the messages
icon in `PortalHeaderMenuStrip.tsx`.

The slot element itself needs no logic — just exist with the right id and
whatever sizing/positioning matches its siblings. The widget owns everything
rendered inside it.

## Building and running in dev

1. **Backend**: no setup needed — `Products/GetProducts` is already
   `[AllowAnonymous]`, and CFR.Base's default CORS policy already allows any
   origin with credentials. Just have `CFR.Gateway` + `CFR.Acutis` running so
   the dropdown's app list populates (the button itself renders regardless).
2. **CFR**:
   ```bash
   cd frontend/CFR
   npm run dev
   ```
   This runs `build:widget` first (bakes `.env.development`'s gateway origin
   into the bundle), then serves everything — including
   `/integrations/app-switcher/app-switcher.js` — at `http://localhost:4001`.
3. **The embedding app** (e.g. optionc-sms): just needs its script tag
   pointing at `http://localhost:4001/integrations/app-switcher/app-switcher.js`
   in dev, and both dev servers running side by side.

To rebuild the CFR Widget alone (no full CFR app rebuild):
```bash
cd frontend/CFR
npm run build:widget
```

## Building for pilot / staging / live

```bash
cd frontend/CFR
npm run build:pilot     # or build:staging / build:live
```

Each script builds the CFR Widget first with the matching `--mode`, so the
correct gateway origin for that environment gets baked in automatically.
Deploy the resulting `dist/` (which includes
`integrations/app-switcher/app-switcher.js`) exactly as CFR is normally
deployed for that environment — nothing widget-specific to do beyond that.

On the embedding app's side, update its own `VITE_CFR_APP_SWITCHER_SCRIPT_URL`
(or equivalent) for that environment to point at CFR's real host, then build
and deploy the embedding app as usual.

## Troubleshooting checklist

Work through these in order — each rules out one layer:

1. **Is this a deployed/test site, or your local `npm run dev`?** A remote
   test deployment only reflects code that has actually been rebuilt and
   redeployed since the change — a code change alone doesn't retroactively
   appear on a site someone else built earlier.
2. **Script tag present?** View source / curl the embedding app's served
   `index.html` and confirm the `<script src="...app-switcher.js" defer>`
   tag is there with a real URL (not a literal `%VITE_...%` placeholder —
   that means the env var wasn't set for that build).
3. **Script reachable?** Open the script URL directly in a browser tab.
   Should return raw JS, not a 404 or connection error. If CFR's dev server
   isn't running, this fails silently in the embedding app — no console
   error, the button just never appears.
4. **Script executed?** DevTools → Console/Network. A request to
   `Products/GetProducts` (success or failure) proves the widget ran. A
   fetch to a product logo image (`.../Acutis/Attachment/Products/...`)
   proves it got real product data back.
5. **DOM present?** DevTools → Console, run:
   ```js
   document.querySelector('.cfrsw-wrap')
   ```
   `null` → the widget bailed out early (check Console for
   `[app-switcher] Built without a VITE_APP_REST_API_BASE_URL...`, meaning
   CFR was built without its own env file loaded). An element → it mounted;
   any remaining "it's not visible" issue is CSS stacking/visibility, not a
   loading problem.
6. **Wrong visual mode?** If you expected inline-in-header placement but see
   the floating corner button instead, the host page's
   `#cfr-app-switcher-slot` element either never appeared in time (fix
   belongs in the host app, not the widget) or the widget's 4-second wait for
   it timed out.

## Known gaps / things to verify before relying on this in production

- **Placeholder hosts**: any `.env.pilot` / `.env.Staging` / `.env.production`
  values referencing `optioncapp.com` domains for the widget script URL are
  guesses made while building this — confirm the real per-environment CFR
  hosts before deploying.
- **CORS is currently wide open** on the whole CFR.Base app
  (`SetIsOriginAllowed(_ => true)`, any origin, with credentials) — this
  widget only needed an anonymous, read-only, CORS-open endpoint, which
  already existed. That blanket policy is not scoped to just this widget;
  worth revisiting if CORS should be tightened for other endpoints later.
- **No CFR auth/session is used.** The CFR Widget can't show
  per-organization "your apps" — it lists all active, launcher-eligible
  first-party products globally, the same for every visitor regardless of
  who (if anyone) is logged into what.

## Rolled-back work (for context, not currently in the codebase)

A personalized, CFR-login-gated version of this widget was built and then
deliberately reverted, to keep this feature scoped to the standalone widget
alone. It included: a hidden-iframe session check reading a CFR-issued
token, a new backend `PortalLogin/ExchangeAuth0Token` endpoint trading an
Auth0 access token for a CFR-signed Portal JWT (via Auth0's `/userinfo` and
a new `Portal_GetUserByEmail` lookup), and `Auth0Provider`'s
`cacheLocation` switched to `'localstorage'` to support it. All of that has
been removed from the codebase. One residual, harmless artifact: if
`004_Portal_Auth0Exchange.sql` was applied to a database during that work,
the `[dbo].[Portal_GetUserByEmail]` stored procedure may still exist there
even though nothing in the code calls it anymore — drop it manually if you
want the database back in sync with the code, or leave it (it's inert).
