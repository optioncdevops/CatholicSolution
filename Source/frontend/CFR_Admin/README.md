# CFRAdmin

CFRAdmin is the standalone platform administration console. It owns its dependency graph, environment, build output, and deployment pipeline and does not require CFR to run.

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build:live
```

The application compiles only files inside this directory. `src/shared` and `src/registry` are governed release snapshots synchronized by the repository-level `sync:app-snapshots` workflow.
