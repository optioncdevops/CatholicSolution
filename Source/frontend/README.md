# Catholic Solutions SaaS Source Bundle

This repository intentionally has **three independent project boundaries**, none of them a shared workspace:

```text
cfr/            # end-user portal + App Hub
cfr-admin/      # Super Admin console
SaaS_Apps/      # standalone business-app source projects
```

Each of `cfr/`, `cfr-admin/`, and every project under `SaaS_Apps/` is a fully independent project root — own `package.json`, own lockfile, own build/deploy config. None of them import from or are compiled by the others.

Start with `cfr/README.md`, `cfr-admin/README.md`, and `SaaS_Apps/README.md`.
