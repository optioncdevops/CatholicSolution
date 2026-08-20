# Catholic Solutions App Switcher — Developer Integration Guide

**Integration contract:** v1  
**Platform release:** v2.0.1  
**Hosting:** domain-neutral; deploy `packages/app-switcher/dist/app-switcher/v1` to the approved Catholic Solutions platform/CDN origin.

The App Switcher is a browser Custom Element. It is not tied to CFR, React, or any partner application's repository.

## 1. External-team integration — minimum steps

Catholic Solutions gives the external team one stable `current-app-id`.

### Step 1 — reference the hosted script once

Add this to the application's global HTML shell:

```html
<script
  src="https://<platform-or-cdn-domain>/app-switcher/v1/app-switcher.js"
  defer>
</script>
```

### Step 2 — place the element in the global header/layout

```html
<catholic-solutions-app-switcher
  current-app-id="YOUR_ASSIGNED_APP_ID">
</catholic-solutions-app-switcher>
```

Do not add it separately to Dashboard, Reports, Settings, or other pages. Put it once in the shared header/topbar/application shell.

That is the full runtime integration.

## 2. What the external team does NOT need

- Catholic Solutions source repository access;
- a CFR deployment;
- React/Tailwind packages from Catholic Solutions;
- a copied application list;
- a product workspace under `apps/*`;
- direct knowledge of other application URLs.

Catholic Solutions owns the central registry and publishes the current launcher catalog.

## 3. How central updates work

```text
packages/app-registry
       |
       v
platform App Switcher build
       |
       +-- app-switcher.js   stable v1 runtime
       +-- catalog.js        approved destinations
       |
       v
platform/CDN host
       |
       +--> CFR
       +--> other Catholic Solutions apps
       +--> external partner apps
```

Adding/removing/changing an application is a registry/platform publication change. Partner applications do not maintain a duplicate catalog.

Launcher membership preserves the v1.6.7 rule: the published switcher contains eligible **Your Apps + Available Apps** only. External SaaS products in Available Apps are included when `launcherEnabled: true` and an approved HTTPS `externalUrl` is present. Future Apps are excluded even when a URL is known.


## Migration from the previous CFR-hosted URL

The root production build temporarily copies the independently built v1 assets into CFR under `/integrations/app-switcher/*`. This is a compatibility bridge for existing integrations only.

New integrations must use the approved neutral platform/CDN host. The compatibility bridge can be retired after all existing consumers have migrated.

## 4. React + TypeScript / TSX

Recommended project layout:

```text
my-react-app/
  index.html
  src/
    components/
      CatholicSolutionsAppSwitcher.tsx
    layouts/
      MainLayout.tsx
    types/
      catholic-solutions-app-switcher.d.ts
```

### `index.html`

```html
<script
  src="https://<platform-or-cdn-domain>/app-switcher/v1/app-switcher.js"
  defer>
</script>
```

### `src/types/catholic-solutions-app-switcher.d.ts`

```ts
import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'catholic-solutions-app-switcher': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'current-app-id'?: string;
        'current-app-name'?: string;
        'catalog-url'?: string;
        'app-hub-url'?: string;
      };
    }
  }
}

export {};
```

The declaration belongs inside the external application's own `src/types` folder. It is compile-time typing only.

### Optional reusable TSX wrapper

```tsx
interface CatholicSolutionsAppSwitcherProps {
  appId: string;
  appName?: string;
}

export function CatholicSolutionsAppSwitcher({
  appId,
  appName,
}: CatholicSolutionsAppSwitcherProps) {
  return (
    <catholic-solutions-app-switcher
      current-app-id={appId}
      current-app-name={appName}
    />
  );
}
```

### Add it to `MainLayout.tsx` / `Header.tsx`

```tsx
<header className="app-header">
  <Brand />
  <div className="header-actions">
    <CatholicSolutionsAppSwitcher appId="YOUR_ASSIGNED_APP_ID" />
    <UserProfile />
  </div>
</header>
```

Do not use `// @ts-ignore` and do not edit React types in `node_modules`.

## 5. Angular / Vue / ASP.NET / Java / PHP / plain HTML

The same script + element works because the runtime is a browser Web Component. Framework-specific work is limited to allowing/placing a custom element in the application's global shell.

## 6. Advanced hosting overrides

Normal integrations should use the catalog next to the runtime. When infrastructure requires separate origins, the script accepts an optional catalog URL:

```html
<script
  src="https://cdn.example.com/app-switcher/v1/app-switcher.js"
  data-catalog-url="https://platform.example.com/app-switcher/v1/catalog.js"
  defer>
</script>
```

The element also accepts an optional App Hub override:

```html
<catholic-solutions-app-switcher
  current-app-id="YOUR_ASSIGNED_APP_ID"
  app-hub-url="https://cfr.example.com/apps">
</catholic-solutions-app-switcher>
```

These are infrastructure options; external teams normally should not need them.

## 7. Security / CSP

Production destinations are centrally approved HTTPS URLs. The consuming page cannot inject arbitrary app destinations into the launcher.

For a restrictive Content Security Policy, allow the approved App Switcher host in `script-src`. If `catalog.js` uses a separate origin, allow that origin as well.

New-tab destinations use `noopener noreferrer`.

## 8. Authentication boundary

The App Switcher performs navigation only. It does not pass cookies, credentials, access tokens, or SSO state.

Applications on other domains keep their own sessions. Cross-domain SSO is handled through the separate identity/federation contract documented in `docs/integrations/SSO_FEDERATION.md`.

## 9. Catholic Solutions platform-team workflow

To add a product:

1. Add/update the record in `packages/app-registry/src/appCatalog.ts`.
2. Use an approved HTTPS `externalUrl`.
3. Set `launcherEnabled` only when the destination is ready to publish.
4. Set `deploymentModel: 'external-saas'` for every independently deployed business product and set `ownership` to `first-party` or `partner`.
5. Preserve the approved App Hub state with `hubSection`; partner apps are normally `available`, while first-party products may be `your`, `available`, or `future`.
6. Set the correct UI `kind`, status, and `navigationTarget`; deployment location must not be inferred from `kind`.
7. Do not enable the launcher for `future` products; the v1 contract publishes only Your + Available apps.
8. Run `npm run typecheck`.
9. Run `npm run build:platform`.
10. Deploy `packages/app-switcher/dist/app-switcher/v1` to the platform/CDN origin.
11. Validate the launcher from CFR and at least one cross-domain test page.

A partner-team release is not required for a normal catalog update.

## 10. Quick troubleshooting

**JSX.IntrinsicElements error** — add the `.d.ts` file under the external React application's `src/types` folder.

**Launcher opens but apps do not load** — confirm `catalog.js` is reachable next to the hosted script or check `data-catalog-url`.

**CSP blocks loading** — allow the approved platform/CDN script origin.

**Current app is clickable** — verify `current-app-id` exactly matches the Catholic Solutions registry ID.

**Popup is clipped** — do not render inside iframe clipping; the component itself uses viewport-fixed positioning and recalculates on resize/scroll.
