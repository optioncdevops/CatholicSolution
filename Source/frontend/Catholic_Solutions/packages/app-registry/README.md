# Catholic Solutions App Registry

Framework-neutral source of truth for Catholic Solutions application metadata.

- Owns stable app IDs, App Hub section, launcher publication, approved destinations, and navigation behavior.
- Does not depend on React, CFR, the App Switcher UI, or a consuming application repository.
- CFR App Hub and the universal App Switcher consume this registry.
- Connected applications remain independently deployed and do not need source code in this repository.


## External SaaS deployment rule

All business-product records use `deploymentModel: 'external-saas'`, whether the product is Catholic Solutions-owned (OptionC School, Parish Hub, Matt Money, ArcAlerts, etc.) or partner-owned (FerrerWorks, Mass Card Requests, and other partner SaaS). `ownership` identifies first-party vs partner ownership; it does not control navigation.

`hubSection` remains the v1.6.7 App Hub state (`your`, `available`, `future`). `launcherEnabled` controls switcher publication independently. A linked product requires an approved HTTPS `externalUrl`; `navigationTarget` controls same-tab/new-tab behavior. The App Switcher publishes launcher-eligible Your Apps + Available Apps only, while Future Apps remain excluded until promoted.
