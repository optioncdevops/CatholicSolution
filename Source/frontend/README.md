# Catholic Solutions SaaS Source Bundle

This repository intentionally has **two independent project boundaries**, none of them a shared workspace:

```text
cfr/            # end-user portal + App Hub
cfr-admin/      # Super Admin console
```

Each of `cfr/` and `cfr-admin/` is a fully independent project root — own `package.json`, own lockfile, own build/deploy config. Neither imports from or is compiled by the other.

Start with `cfr/README.md` and `cfr-admin/README.md`.
