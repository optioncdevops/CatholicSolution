# External SaaS Applications

This directory contains the **actual v1.6.7 source projects** that were previously under `apps/*`, now extracted as standalone SaaS application repository roots. They are deliberately outside `Catholic_Solutions/`.

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

The App Switcher remains centralized: every app loads one hosted script and renders one custom element. The application list is not hardcoded in these projects.

`linked-partner-saas/` documents URL-linked SaaS products whose source never existed in the v1.6.7 repository.
