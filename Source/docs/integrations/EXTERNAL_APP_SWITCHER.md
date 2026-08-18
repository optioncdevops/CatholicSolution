# External App Switcher Integration

Catholic Solutions publishes the App Switcher as a centrally hosted, framework-neutral Web Component. Partner applications should reference the hosted component instead of copying the switcher UI or maintaining their own application list.

## What the Catholic Solutions team owns

- Register the partner application in `packages/shared/src/app/config/appCatalog.ts` with its approved HTTPS destination and launch target.
- Maintain the shared launcher behavior and visual contract.
- Deploy App Hub. Its build emits the current integration asset at:
  `https://cfr.optioncapp.com/integrations/app-switcher/app-switcher.js`
- Keep the partner `id` stable. That same ID is supplied to the partner team as `current-app-id`.

The emitted integration asset is generated from the same centralized `APP_CATALOG` used by Catholic Solutions. Partner teams do not maintain a duplicate catalog.

## What the external team adds

Add the hosted script once, then place the custom element in the application header where the launcher should appear:

```html
<script
  src="https://cfr.optioncapp.com/integrations/app-switcher/app-switcher.js"
  defer
></script>

<catholic-solutions-app-switcher
  current-app-id="ferrerworks"
></catholic-solutions-app-switcher>
```

Replace `ferrerworks` with the application ID assigned by Catholic Solutions.

No React, Tailwind, Bootstrap, or Catholic Solutions monorepo dependency is required. The component uses Shadow DOM so its launcher styles are isolated from the host application.

## Integration contract

The partner team provides Catholic Solutions with:

- Product name and requested stable application ID.
- Short display name and category.
- Production HTTPS destination.
- Whether launch should use the same tab or a new tab.
- Approved icon/logo treatment and short description.
- SSO/federation information only when identity integration is separately approved.

Catholic Solutions registers and publishes the product. After the App Hub deployment, every external application that references the stable hosted script receives the current launcher catalog/UI on its next normal script refresh. Hosted deployment metadata keeps this stable asset on a short revalidation window so launcher updates propagate without requiring partner releases. The partner application does not need to update its list when another Catholic Solutions product is added or removed.

## Behavior and security

- The current application is non-navigating and has no actionable hover treatment.
- Only centrally approved applications with a real destination are emitted.
- External destinations must be absolute HTTP(S) URLs.
- New-tab destinations use `noopener noreferrer`.
- `All apps in App Hub` always returns to the central App Hub.
- The launcher is navigation only. It does not imply shared authentication or SSO with partner products.
- A partner application with a strict Content Security Policy must allow the Catholic Solutions App Hub origin in `script-src`.

## Local/development use

While App Hub is running locally, the same component is available at:

`http://localhost:4001/integrations/app-switcher/app-switcher.js`

Use the production hosted URL for real external-team integration.

## Source ownership

Framework-neutral component source:

`packages/shared/src/platform/integrations/app-switcher/catholic-solutions-app-switcher.js`

Production launcher-manifest builder:

`packages/shared/src/platform/integrations/app-switcher/manifest.ts`

App Hub publishing integration:

`apps/app-hub/vite.config.ts`

Do not fork these files into individual Catholic Solutions applications. Internal applications continue to consume the shared `PlatformAppSwitcher` through `AppLayout`/`PlatformTopbar`.
