# Catholic Solutions SaaS Architecture v2.0.1

## 1. Architecture objective

Catholic Solutions is a multi-application SaaS ecosystem. CFR is the end-user entry experience, while the Super Admin console is the platform control plane. Business applications are independently deployable products connected through the registry, launcher, and identity contracts rather than source-code co-location.

## 2. Logical architecture

```text
                         Catholic Solutions SaaS Platform

  End users                                      Platform operators
      |                                                 |
      v                                                 v
+--------------------+                         +-----------------------+
| CFR / App Hub      |                         | Super Admin Console   |
| apps/cfr           |                         | apps/platform-admin   |
+---------+----------+                         +-----------+-----------+
          |                                                |
          +---------------------+--------------------------+
                                |
                      +---------v----------+
                      | App Registry       |
                      | app identity       |
                      | catalog state      |
                      | launch URL         |
                      | launcher policy    |
                      +---------+----------+
                                |
                    +-----------+-----------+
                    | Universal App Switcher|
                    | Web Component / CDN   |
                    +-----------+-----------+
                                |
        +-----------------------+-----------------------------+
        |                       |                             |
        v                       v                             v
 OptionC School             Parish Hub                  Partner SaaS
 own repo/domain            own repo/domain             any repo/domain
 own deployment             own deployment              any web stack
 own app session            own app session             own app session
```

## 3. Repository ownership

The Catholic Solutions repository owns only:

1. CFR end-user access, authentication entry, request-access flow, and App Hub.
2. Super Admin platform operations UI.
3. Framework-neutral central application registry and public launcher projection.
4. Universal App Switcher distribution source.
5. Internal shared React components used by CFR and Admin.
6. Living Specification and platform integration contracts.

No external or first-party business application is added under `apps/*` merely to appear in App Hub or the launcher.

## 4. Deployment model

Each application has an independent domain and deployment pipeline. The registry stores the approved launch destination. Production launch URLs must use HTTPS.

Recommended platform endpoints:

- CFR / App Hub: `https://cfr.optioncapp.com`
- Super Admin: `https://admin.optioncapp.com`
- App Switcher/CDN: a neutral platform or CDN origin
- Identity provider: a neutral login/identity origin when production federation is enabled

The exact neutral CDN/identity domains remain environment/deployment configuration and are not coupled to product repositories.

## 5. Multi-tenant SaaS boundary

The frontend prototype keeps tenant-aware concerns at the platform boundary. Production services should enforce tenancy server-side using immutable tenant/organization identifiers and authorization claims. UI filtering is never a security boundary.

Recommended service layers:

- Identity and Access Service - users, roles, tenants, OIDC/OAuth clients.
- Application Registry Service - app definitions, destinations, catalog state, launcher policy.
- Subscription/Entitlement Service - which tenant owns or may request which products.
- Audit Service - administrative mutations and security-sensitive platform actions.
- Notification/Workflow Service - request-access and onboarding workflows.

The current source models these boundaries without inventing a backend implementation.

## 6. Identity architecture

Unrelated application domains must not depend on shared browser cookies. Production SSO should use an approved standards-based identity provider and authorization-code/OIDC flow. Each product establishes its own local session after federation.

The App Switcher performs navigation only. It never carries access tokens, refresh tokens, passwords, cookies, or user identity payloads.

## 7. App Registry

`packages/app-registry` is the single product metadata source. Each catalog record owns section state, launcher eligibility, product presentation, and approved destination. CFR, Super Admin, and the App Switcher projection all derive from this source.

No consuming product maintains a duplicate Catholic Solutions destination map.

## 8. Universal App Switcher

`packages/app-switcher` is intentionally framework-neutral. It is implemented as a standards-based Custom Element with Shadow DOM isolation and can be consumed from React, Angular, Vue, ASP.NET, Blazor host pages, Java/Spring templates, PHP, CMS platforms, or plain HTML.

Public contract:

```html
<script src="https://<platform-cdn>/app-switcher/v1/app-switcher.js" defer></script>
<catholic-solutions-app-switcher current-app-id="assigned-app-id"></catholic-solutions-app-switcher>
```

The `/v1/` URL is a stable integration contract. Normal compatible releases do not require external teams to change markup.

## 9. Security principles

- HTTPS-only production launch destinations.
- CSP allow-listing for the App Switcher host.
- `noopener noreferrer` for new-tab navigation.
- No credential/session data in the public registry projection.
- Host applications cannot mutate the central approved app list.
- Super Admin authorization must be enforced by identity/API roles in production.
- Registry changes must be auditable.
- Secrets never belong in client-side Vite environment variables.

## 10. Release independence

A business app release does not require a CFR release. A CFR release does not require product releases. A catalog destination change should require only a registry/platform publication. App Switcher runtime changes are versioned independently from CFR and Admin.


## 11. External SaaS linking policy (v2.0.1)

External SaaS applications are first-class platform products, not exceptions. They remain outside the Catholic Solutions repository and are connected by one canonical registry record containing the stable app ID, App Hub section, approved HTTPS destination, launcher policy, and navigation target.

The public launcher intentionally preserves the v1.6.7 membership rule:

- `Your Apps` with an approved destination may appear in the switcher.
- `Available Apps` with an approved destination may appear in the switcher, including external SaaS partner products.
- `Future Apps` never appear in the switcher, even if a deployment URL is already known.

This prevents roadmap products from being exposed as active launcher destinations while allowing linked partner SaaS products to participate exactly like the v1.6.7 external-app experience. No external SaaS source code, React workspace, or shared runtime package is required.


## External SaaS is a deployment model, not an App Hub state

Every business application in the registry is independently deployable outside the Catholic Solutions repository. This includes first-party products such as OptionC School, Parish Hub, Matt Money and ArcAlerts as well as partner SaaS products.

`deploymentModel` describes the deployment boundary. `hubSection` describes the end-user catalog state. `launcherEnabled` controls launcher publication. These concerns MUST remain independent so a product may be externally hosted while still being Your, Available, or Future in CFR.

```text
Catholic Solutions repository
  apps/cfr
  apps/platform-admin
  packages/app-registry
  packages/app-switcher
        |
        +--> OptionC School       (independent domain/repo)
        +--> Parish Hub           (independent domain/repo)
        +--> Matt Money           (independent domain/repo)
        +--> ArcAlerts            (independent domain/repo)
        +--> Catholic Content     (independent domain/repo)
        +--> Unified Directory    (independent domain/repo)
        +--> Support Center       (independent domain/repo)
        +--> Partner SaaS         (independent vendor domains)
```
