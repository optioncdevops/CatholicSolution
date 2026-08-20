# Catholic Solutions SaaS Platform v2.0.3

Catholic Solutions is a SaaS control plane built from the v1.6.7 functional baseline. The repository now owns only the platform-facing experiences that must remain centralized: the CFR end-user portal/App Hub, the Super Admin console, the application registry, shared platform UI/auth code, and the universal App Switcher.

## Repository boundary

```text
apps/
  cfr/                 End-user CFR / App Hub frontend
  platform-admin/      Super Admin control-plane frontend
packages/
  app-registry/        Framework-neutral application catalog and launch metadata
  app-switcher/        Framework-neutral Web Component distributed to any web stack
  shared/              Internal React UI/auth/design-system code used only by CFR/Admin
```

Business applications such as OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Directory, Support, and partner SaaS applications are independent products. They may live in different repositories, clouds, domains, release cadences, and technology stacks.

## Local development

```bash
npm install
npm run dev:cfr
npm run dev:admin
```

Default local endpoints:

- CFR: `http://localhost:4001`
- Super Admin: `http://localhost:4011`

## Validation and builds

```bash
npm run typecheck
npm run lint
npm run build:production
```

`build:production` builds the platform App Switcher, CFR, and Super Admin independently.

## Universal App Switcher

Any approved web application can integrate without importing this repository:

```html
<script src="https://<platform-cdn>/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="YOUR_ASSIGNED_APP_ID"></catholic-solutions-app-switcher>
```

The consuming application does not maintain the Catholic Solutions application list. The centrally published registry projection controls approved destinations.

External SaaS products are first-class catalog records. To match the v1.6.7 product behavior, the launcher publishes only **Your Apps + Available Apps** with approved destinations; **Future Apps are never published in the switcher**. Available external SaaS products keep the existing App Hub behavior: **Request access** remains the primary card action, **Details** remains secondary, and the configured external site is reachable through the product logo and the centralized App Switcher.

## Architecture documentation

- `docs/PLATFORM_ARCHITECTURE.md` - current SaaS architecture and boundaries
- `docs/DEVELOPER_GUIDE.md` - developer onboarding, workflows, package policy, and deployment
- `docs/integrations/APP_SWITCHER.md` - universal switcher integration
- `docs/integrations/SSO_FEDERATION.md` - cross-domain identity boundary
- `docs/SPECIFICATION.md` - authoritative Living Specification


## v2.0.2 external SaaS catalog parity

All business products are modeled as **independently deployed external SaaS applications**, including OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center, AI products, and partner SaaS products. Their source code does not live under `apps/*`.

The registry deliberately separates:

- `deploymentModel: 'external-saas'` — where the product is deployed;
- `ownership: 'first-party' | 'partner'` — who owns the product;
- `hubSection: 'your' | 'available' | 'future'` — how CFR App Hub presents it;
- `launcherEnabled` — whether the approved destination is published to the universal switcher;
- `externalUrl` + `navigationTarget` — the production launch contract.

This preserves the v1.6.7 App Hub behavior while removing repository/domain coupling. OptionC School and Parish Hub remain in **Your Apps** and launcher-enabled; the six approved partner SaaS products remain in **Available Apps** and launcher-enabled; Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center and other roadmap products remain **Future Apps** until their catalog state is explicitly promoted. Promotion requires only a registry change, not moving source into this repository.


## v2.0.3 source-distribution correction

The Catholic Solutions repository intentionally contains only CFR, Super Admin, and platform packages. The **actual v1.6.7 source** for OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center, and AI Lesson Plan is supplied as sibling standalone projects in the release bundle under `../External_SaaS_Apps/`.

This preserves the architectural boundary without losing source code. Each external project can become its own repository/domain and uses the centralized Web Component App Switcher rather than a copied application list.
