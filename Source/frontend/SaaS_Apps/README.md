# External SaaS Applications

This directory contains the **actual v1.6.7 source projects** extracted as standalone SaaS application repository roots. In the delivery bundle it is a sibling of `cfr/` and `cfr-admin/`; none of these business projects is compiled into either platform application.

## Source projects included

| Project | User-facing product | Deployment |
|---|---|---|
| `optionc-school` | OptionC School | independent domain |
| `optionc-parish` | Parish Hub | independent domain |
| `matt-money` | Matt Money | independent domain |
| `arc-alerts` | ArcAlerts | independent domain |
| `catholic-content` | Catholic Content | independent domain |
| `unified-directory` | Unified Directory | independent domain |
| `support-center` | Support Center | independent domain |
| `ai-lesson-plan` | AI Lesson Plan Generator prototype | independent destination |

Each folder can be moved into its **own Git repository** and deployed independently. No app imports source from the Catholic Solutions repository.

Every runnable project includes a committed dependency lockfile and supports an independent release check from its own directory:

```bash
npm ci
npm run typecheck
npm run build:production
```

The App Switcher script and custom element are centralized (one hosted script, one element), but each project keeps its own local app-catalog file for the destinations it links to — there is no shared, synced application list. Adding a new switcher destination means adding an `externalUrl` entry to that project's own catalog.

`linked-partner-saas/` documents URL-linked SaaS products whose source never existed in the v1.6.7 repository.
