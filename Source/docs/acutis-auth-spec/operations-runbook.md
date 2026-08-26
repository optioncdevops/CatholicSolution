# Operations Runbook — Acutis Authentication

Scope and date: Task 12, 2026-08-26. Local setup and configuration instructions for `CFR.Acutis`. **No real connection string, password, or secret value appears anywhere in this document** — only key names and commands.

## Build / test / run

```bash
dotnet build "backend/CatholicSolution.slnx"
dotnet test "backend/CatholicSolution.slnx"
dotnet run --project "backend/Microservices/CFR.Acutis/CFR.Acutis.csproj"
```

Default local port: `5051` (http) — see `backend/Microservices/CFR.Acutis/Properties/launchSettings.json`. Swagger: `/swagger`. Scalar: `/scalar`.

## Authentication repository mode

`CFR.Acutis` selects its `IAcutisAuthenticationRepository` implementation via configuration — see `backend/Microservices/CFR.Acutis/AcutisAuthRepositorySelection.cs`. **You do not need to configure anything to run locally** — the default is the DEV FAKE, which needs no database.

| Config key | Values | Default | Meaning |
|---|---|---|---|
| `AcutisAuth:RepositoryMode` | `DevelopmentFake` \| `Database` | `DevelopmentFake` (used when the key is absent entirely) | Which repository implementation is registered |
| `AcutisAuth:ConnectionStringKey` | any string | `AcutisDb` | Which `ConnectionStrings` key to read when `RepositoryMode=Database` |
| `AcutisAuth:AllowDevelopmentFakeOutsideDevelopment` | `true` \| `false` | `false` | Must be explicitly `true` to allow `DevelopmentFake` mode outside a Development environment — a deliberate, off-by-default production safeguard |

`Database` mode is **not yet backed by a real implementation** — see [database-contract.md](database-contract.md) and [implementation-plan.md](implementation-plan.md) for why, and stop here if you're trying to make real login work: that requires a resolved database-contract blocker first, not just flipping this setting.

## Running against the DEV FAKE (default — no setup required)

```bash
dotnet run --project "backend/Microservices/CFR.Acutis/CFR.Acutis.csproj"
```

The only working credential pair is defined in `AcutisAuthenticationRepositoryDevFake.cs` (a clearly-fake, non-production email/password — read that file directly if you need the exact values; not repeated here since this document is about configuration, not credentials).

## If you ever do have a real, approved development database available

**Do not put the connection string in any tracked `appsettings*.json` file.** Use one of:

### Local development — .NET User Secrets

```bash
cd backend/Microservices/CFR.Acutis
dotnet user-secrets set "ConnectionStrings:AcutisDb" "<your real connection string>"
dotnet user-secrets set "AcutisAuth:RepositoryMode" "Database"
```

This writes to a file **outside this repository** (`%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json` on Windows — the `<UserSecretsId>` itself, in `CFR.Acutis.csproj`, is not a secret, just an identifier for locating this file). User Secrets are only loaded when `ASPNETCORE_ENVIRONMENT=Development` (the default for `dotnet run` locally, per `Program.cs`).

To confirm what's set, without ever printing the value:

```bash
dotnet user-secrets list --project backend/Microservices/CFR.Acutis
# prints key names only if you don't read the value; avoid piping this to a shared log
```

**Important — this must be run in the same environment/session that will actually build/run/test the repository.** A session verification attempt (Task 13, 2026-08-26) confirmed that a secret set via `dotnet user-secrets set` in one terminal session is **not automatically visible** to a different session/environment running against the same repository — `dotnet user-secrets list` and a direct check of `%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\` from the second session both showed nothing configured, even after the first session reported success. If you're coordinating between a human developer's terminal and an automated/agent session, confirm both are running on the same machine, as the same OS user account, against the same `CFR.Acutis.csproj` (its `UserSecretsId` is the addressing key — not the project path).

### Any other environment — environment variables

ASP.NET Core's configuration binder maps double-underscore-separated environment variables to nested config keys:

```bash
# Windows PowerShell example (illustrative key name, no real value shown)
$env:ConnectionStrings__AcutisDb = "<supplied by your secret store, never typed into a tracked file>"
$env:AcutisAuth__RepositoryMode = "Database"
```

Or via whatever secret-injection mechanism your deployment platform provides (Key Vault, parameter store, CI secret, etc.) — the requirement is only that the value reaches the `ConnectionStrings:AcutisDb` configuration key at runtime, never that it lives in source control.

### What happens if you set `RepositoryMode=Database` today

The app will start (assuming the connection-string key is present — if it's missing, startup fails immediately with a clear `InvalidOperationException` naming the missing key, not a vague error) and register `AcutisAuthenticationRepositoryNotImplemented`, which throws `NotImplementedException` on every call. This is intentional — it is a registration boundary for a real repository that has not been built yet (see [database-contract.md](database-contract.md)), not a working integration.

**This is still true as of the 2026-08-26 session task (following Task 15).** Five separate attempts to verify the real `NewViper.DoLogin` contract against the reference application's actual development database have all stopped before any implementation. Tasks 8/10/13 found the database itself unreachable (no designated target, then network-unreachable, then port refused); Task 15 and this session's task both found a different, but now-repeated, blocker — `ConnectionStrings:AcutisDb` simply does not resolve in this session's environment (`dotnet user-secrets list` reports nothing configured, the User Secrets directory for `CFR.Acutis`'s `UserSecretsId` is empty, and `ConnectionStrings__AcutisDb` is unset) — see [database-contract.md](database-contract.md#session-task-2026-08-26-post-task-15--result-still-blocked-at-item-1-connection-string-does-not-resolve-here). Two consecutive occurrences of the exact same "not visible here" result strongly suggests the terminal/session where the connection string is being configured is not the same machine, OS user account, or shell that this session's tooling executes in — worth confirming directly before a sixth attempt. If you're reading this because you now have real access to that database (or an equivalent one) **and** have confirmed the connection string is actually set in the same environment/session that runs `dotnet build`/`dotnet test`/`dotnet run` for this repository (see the cross-session-visibility caveat above), the remaining work is: confirm the stored procedure's parameters/result-set shape directly, implement `AcutisAuthenticationRepository` against `IDapperHandler`, and set `AcutisAuth:RepositoryMode=Database` — the configuration/DI scaffolding described above is already in place for that switch.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Startup fails with `"AcutisAuth:RepositoryMode is Database but ConnectionStrings:X is not configured"` | You set `RepositoryMode=Database` without setting the matching `ConnectionStrings` key (via User Secrets or an environment variable) |
| Startup fails with `"AcutisAuth:RepositoryMode is DevelopmentFake outside a Development environment"` | `ASPNETCORE_ENVIRONMENT` isn't `Development` and `AcutisAuth:AllowDevelopmentFakeOutsideDevelopment` isn't set to `true` — this is deliberate; either run in Development, or (rarely appropriate) set the escape hatch explicitly |
| Startup fails with `"Unknown AcutisAuth:RepositoryMode '...'"` | Typo in the configured mode — valid values are exactly `DevelopmentFake` and `Database` (case-insensitive) |
| `/Auth/Login` returns `401`/`400` unexpectedly | Confirm you're using the DEV FAKE's one known credential pair (see `AcutisAuthenticationRepositoryDevFake.cs`) — real accounts cannot log in yet |
| `NotImplementedException` from any auth endpoint | You're in `Database` mode — expected, see above |
