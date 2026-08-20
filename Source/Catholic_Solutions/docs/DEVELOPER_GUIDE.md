# Catholic Solutions Developer Guide v2.0.1

## 1. Start here

This repository contains two React applications and three platform packages:

- `apps/cfr` - end-user login, request access, and App Hub.
- `apps/platform-admin` - Super Admin control plane.
- `packages/app-registry` - framework-neutral product catalog.
- `packages/app-switcher` - universal browser Web Component.
- `packages/shared` - internal React/auth/design-system code shared only by CFR/Admin.

Do not add independent business products under `apps/*`.

## 2. Install and run

```bash
npm install
npm run dev:cfr
npm run dev:admin
```

Use separate terminals for CFR and Admin.

## 3. Add or update an application

Make the product change in `packages/app-registry/src/appCatalog.ts` only.

For an independently deployed application provide:

- stable `id`;
- user-facing name/short name/category;
- App Hub section (`your`, `available`, or `future`);
- launcher eligibility;
- approved HTTPS destination;
- navigation target;
- truthful catalog/status metadata.

Do not create a React workspace or add the product to a solution registry simply to expose it in the launcher.

## 4. App Switcher integration for any platform

External teams need only:

```html
<script src="https://<platform-cdn>/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="YOUR_ASSIGNED_APP_ID"></catholic-solutions-app-switcher>
```

React + TypeScript applications may copy `packages/app-switcher/react.d.ts` to their own `src/types/catholic-solutions-app-switcher.d.ts`. That declaration is compile-time typing only; no Catholic Solutions React package is required.

## 5. Super Admin development

The Super Admin app is `apps/platform-admin`. It reads the same registry as CFR and is the platform-operator surface. The prototype currently exposes registry visibility and architectural/security state. Production mutation operations should call authenticated platform APIs and must never trust client-only role checks.

## 6. Authentication

Development uses the existing mock/preview adapter. CFR and Admin can run independently. Production cross-domain SSO must use an identity-provider/federation contract; do not share cookies across unrelated product domains.

## 7. Package policy - August 20, 2026

The source uses the current compatible React/Vite/Tailwind/ESLint toolchain from the v1.6.7 baseline. Core versions include React 19.2.8, React Router DOM 7.18.2, Vite 8.2.1, `@vitejs/plugin-react` 6.0.5, Tailwind CSS 4.3.3, ESLint 10.8.1, and typescript-eslint 8.67.0.

TypeScript 7.0.2 is the current npm stable release, but current typescript-eslint v8 releases explicitly warn when TypeScript 7 is detected. For a production-quality toolchain this repository intentionally retains TypeScript 6.0.3 until the lint/parser toolchain declares TypeScript 7 support. This is a compatibility hold, not an accidental outdated dependency.

Package upgrade rule:

1. Prefer latest stable mutually compatible versions.
2. Do not adopt a breaking compiler/runtime major solely to satisfy a version number.
3. Update `package.json` and `package-lock.json` together.
4. Run typecheck, lint, and both production builds.
5. Record architecture-affecting upgrades in the Living Specification.

## 8. Validation

Before merging:

```bash
npm run typecheck
npm run lint
npm run build:production
```

For App Switcher changes also validate a plain HTML integration and at least one React/TSX consumer.

## 9. Deployment ownership

- CFR team deploys `apps/cfr`.
- Platform operations deploys `apps/platform-admin`.
- Platform/CDN pipeline publishes `packages/app-switcher`.
- Each external/first-party product team deploys its own application.
- Platform registry owners approve catalog and destination changes.

## 10. Non-negotiable rules

- No hardcoded product-specific switcher list in consuming apps.
- No credentials or tokens in the launcher catalog.
- No cross-domain shared-cookie SSO design.
- No business-product source copied into this repository just for navigation.
- No direct Super Admin mutation without server-side authorization/audit in production.
- Preserve the Living Specification with every approved architecture or behavior change.


## 11. Add an external SaaS application

External SaaS onboarding is a registry-only change. Do not add the partner source under `apps/*`.

Add one record to `packages/app-registry/src/appCatalog.ts` using this pattern:

```ts
{
  id: 'partner-app',
  name: 'Partner App',
  shortName: 'Partner',
  category: 'Partner Services',
  hubSection: 'available',
  launcherEnabled: true,
  externalUrl: 'https://partner.example.com',
  navigationTarget: 'new-tab',
  description: 'Approved partner SaaS application.',
  icon: '↗',
  gradient: 'linear-gradient(135deg,#334155,#64748B)',
  keywords: ['partner'],
  features: [],
  stats: [],
  kind: 'external',
  status: 'available',
  statusLabel: 'Open site',
}
```

Behavior is intentionally compatible with v1.6.7:

1. The app appears in **Available Apps**.
2. **Request access** remains the primary card action.
3. **Details** remains the secondary action.
4. The configured SaaS site can be opened from the product logo.
5. The app is automatically included in the centrally published App Switcher because it is `available`, `launcherEnabled`, and has an approved destination.
6. The external team only needs the hosted script + `<catholic-solutions-app-switcher>` element in its own global header.
7. A normal catalog/link change does not require an external-team release.

Do not set `launcherEnabled: true` for a `future` product. Future Apps are deliberately excluded from the launcher.


## External SaaS registration model (v2.0.2)

OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center, AI products, and partner products are all treated as independently deployed SaaS applications. A product does **not** need an `apps/*` workspace to participate in CFR App Hub or the App Switcher.

### Registry fields

```ts
{
  id: 'matt-money',
  name: 'Matt Money',
  hubSection: 'future',             // preserve current catalog state
  deploymentModel: 'external-saas',
  ownership: 'first-party',
  launcherEnabled: false,           // publish only when approved
  externalUrl: 'https://matt-money.optioncapp.com',
  navigationTarget: 'same-tab',
  // ...display metadata
}
```

To make an independently deployed product available later, update only its registry state, for example:

```ts
hubSection: 'available',
launcherEnabled: true,
externalUrl: 'https://approved-product-domain.example',
```

No product source folder is added to Catholic Solutions. CFR App Hub, Super Admin, and the published App Switcher all derive from the same registry.

### Current v1.6.7-compatible state

| Product | Ownership | App Hub | Switcher | Destination |
| --- | --- | --- | --- | --- |
| OptionC School | First-party | Your Apps | Linked | `optionc-sms.optioncapp.com` |
| Parish Hub | First-party | Your Apps | Linked | `optionc-parish.optioncapp.com` |
| Matt Money | First-party | Future Apps | Hidden | `matt-money.optioncapp.com` |
| ArcAlerts | First-party | Future Apps | Hidden | `arc-alerts.optioncapp.com` |
| Catholic Content | First-party | Future Apps | Hidden | `catholic-content.optioncapp.com` |
| Unified Directory | First-party | Future Apps | Hidden | `directory.optioncapp.com` |
| Support Center | First-party | Future Apps | Hidden | `support-center.optioncapp.com` |
| FerrerWorks / Mass Card Requests / Vincent Volunteer / Berchmans / Alive Date / Friar Friend | Partner | Available Apps | Linked | Approved external domains |

The distinction between **Future** and **External SaaS** is intentional: deployment location and catalog availability are separate concerns.


## External SaaS source repositories (v2.0.3)

The release archive has two top-level boundaries:

```text
Catholic_Solutions/
External_SaaS_Apps/
```

`External_SaaS_Apps` contains the actual extracted v1.6.7 sources. Treat each child folder as an independent repository root. Run `npm install` and `npm run dev` inside that folder. Do not move those projects back under `Catholic_Solutions/apps`.

Every extracted React app already includes the centralized App Switcher integration. To move from the CFR compatibility endpoint to the final platform/CDN host, change `VITE_APP_SWITCHER_URL` only.
