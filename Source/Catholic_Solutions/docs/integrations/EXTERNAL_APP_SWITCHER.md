# External Application — App Switcher Quick Start

1. Ask Catholic Solutions for your assigned application ID.
2. Reference the centrally hosted v1 script once in your global HTML shell.
3. Place the custom element once in your global header/layout.

```html
<script src="https://<platform-or-cdn-domain>/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="YOUR_ASSIGNED_APP_ID"></catholic-solutions-app-switcher>
```

No Catholic Solutions source code, React package, CSS package, or copied app list is required.

For React + TypeScript, copy `packages/app-switcher/react.d.ts` into your application at `src/types/catholic-solutions-app-switcher.d.ts`.

See `APP_SWITCHER.md` for full instructions, CSP, advanced hosting overrides, validation, and troubleshooting.
