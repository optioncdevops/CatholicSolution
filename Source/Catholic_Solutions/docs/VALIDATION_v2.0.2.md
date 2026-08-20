# Catholic Solutions v2.0.2 Validation

Date: August 20, 2026

## Registry and architecture

- 18 business-product catalog records.
- 18/18 classified as `deploymentModel: 'external-saas'`.
- 12 Catholic Solutions-owned first-party SaaS records.
- 6 partner-owned SaaS records.
- `apps/*` contains only `cfr` and `platform-admin`.
- OptionC School, Parish Hub, Matt Money, ArcAlerts, Catholic Content, Unified Directory and Support Center all remain cataloged with independent-domain destinations where configured.

## v1.6.7 behavior parity

- Your Apps: OptionC School, Parish Hub.
- Available Apps: FerrerWorks, Mass Card Requests, Vincent Volunteer, Berchmans, Alive Date, Friar Friend.
- Future Apps: Matt Money, ArcAlerts, Catholic Content, Unified Directory, Support Center, AI Website Builder, AI Lesson Plan Generator, AI Attendance Taker, Financial Needs Assessment, Catholic Camp Finder.
- Universal App Switcher publication: 8 apps (Your + Available with launcher approval and valid destination).
- Future Apps are not launcher-published merely because a URL exists.

## Static validation completed

- App Registry and App Switcher manifest TypeScript compile under strict targeted validation.
- `packages/app-switcher/src/app-switcher.js` passes Node syntax validation.
- Repository JSON files parse successfully.
- Package/workspace/config metadata is synchronized to v2.0.2.

## Local / CI gate

Run after dependency installation:

```bash
npm ci
npm run typecheck
npm run lint
npm run build:production
```

A full dependency-backed build was not run in the packaging environment because the npm offline cache did not contain `zod-validation-error@4.0.2`.
