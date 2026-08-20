# Catholic Solutions Universal App Switcher

Framework-neutral browser integration for the Catholic Solutions application ecosystem.

## Architecture

The App Switcher is **platform infrastructure**, not CFR application code. Build it independently and deploy the generated `dist/app-switcher/v1` directory to an approved Catholic Solutions platform/CDN origin.

```text
packages/app-registry  -> approved application metadata
          |
          v
packages/app-switcher  -> app-switcher.js + catalog.js
          |
          v
platform/CDN domain
          |
          +--> CFR
          +--> OptionC School
          +--> Parish Hub
          +--> partner/vendor applications
```

Connected applications can live on any repository, domain, or web stack.

## Build

```bash
npm run build:platform
```

Output:

```text
packages/app-switcher/dist/app-switcher/v1/app-switcher.js
packages/app-switcher/dist/app-switcher/v1/catalog.js
```

`APP_SWITCHER_APP_HUB_URL` in `.env.production` controls the App Hub destination embedded in the published catalog. The switcher runtime itself does not assume the CFR domain and loads `catalog.js` relative to its own script URL.

## Consumer integration

```html
<script src="https://<platform-or-cdn-domain>/app-switcher/v1/app-switcher.js" defer></script>

<catholic-solutions-app-switcher
  current-app-id="YOUR_ASSIGNED_APP_ID">
</catholic-solutions-app-switcher>
```

That is the complete runtime dependency. No React package, Tailwind package, registry copy, or Catholic Solutions repository access is required.

### Optional advanced overrides

If infrastructure serves the catalog or App Hub from another approved endpoint:

```html
<script
  src="https://<cdn-domain>/app-switcher/v1/app-switcher.js"
  data-catalog-url="https://<platform-domain>/app-switcher/v1/catalog.js"
  defer>
</script>

<catholic-solutions-app-switcher
  current-app-id="YOUR_ASSIGNED_APP_ID"
  app-hub-url="https://<cfr-domain>/apps">
</catholic-solutions-app-switcher>
```

Normal integrations should not need these overrides.

## React + TypeScript

Runtime integration remains the same script + element. Copy `react.d.ts` into the consuming application's `src/types/` directory only when JSX typing is required.

## Security

- Published product destinations come only from `packages/app-registry`.
- Production catalog projection accepts HTTPS destinations only.
- New-tab links use `noopener noreferrer`.
- The component uses Shadow DOM and safe text DOM assignment.
- The launcher performs navigation only; authentication/federation is a separate contract.


## Catalog membership

The runtime does not decide product eligibility. `packages/app-registry` publishes the v1.6.7-compatible set: launcher-enabled Your Apps + Available Apps with approved HTTPS destinations. Linked external SaaS products therefore work in the same launcher without framework or repository coupling, while Future Apps stay hidden.
