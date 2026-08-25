# Parish Hub — standalone external SaaS source

This project is the v1.6.7 application source extracted from the Catholic Solutions monorepo and prepared as an independently deployable SaaS application.

- **Application ID:** `optionc-parish`
- **Expected production domain:** `https://optionc-parish.optioncapp.com`
- **Repository ownership:** independent from the Catholic Solutions CFR/control-plane repository
- **UI/functionality baseline:** v1.6.7
- **Universal App Switcher:** centrally hosted Web Component; this app does not own the launcher catalog

## Run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build:production
```

## App Switcher

`index.html` loads the centralized runtime once and `PlatformAppSwitcher.tsx` renders:

```html
<catholic-solutions-app-switcher current-app-id="optionc-parish"></catholic-solutions-app-switcher>
```

The default script URL uses the current CFR compatibility endpoint. For the final neutral platform/CDN deployment, change only `VITE_APP_SWITCHER_URL`; no application page code must change.

## Shared compatibility source

`src/shared` is a self-contained snapshot of the v1.6.7 shared UI/auth shell so this extracted project can stand alone instead of depending on `../../packages/shared`. New cross-product capabilities should use versioned platform contracts rather than adding new source coupling.
