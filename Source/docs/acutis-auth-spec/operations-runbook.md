# Operations Runbook — Acutis Authentication

Scope and date: Task 12, 2026-08-26; substantially rewritten the same session after
`DevelopmentFake` was removed entirely (real-time development only, per explicit instruction — no
fake account exists anywhere in this codebase). **No real connection string, password, or secret
value appears anywhere in this document** — only key names and commands.

## Build / test / run

```bash
dotnet build "backend/CatholicSolution.slnx"
dotnet test "backend/CatholicSolution.slnx"
dotnet run --project "backend/Microservices/CFR.Acutis/CFR.Acutis.csproj"
```

`dotnet build`/`dotnet test` never need a database connection. **`dotnet run` does** — see below.

Default local port: `5051` (http) — see `backend/Microservices/CFR.Acutis/Properties/launchSettings.json`. Swagger: `/swagger`. Scalar: `/scalar`.

## Authentication repository — real database required to run

`CFR.Acutis` has exactly one `IAcutisAuthenticationRepository` implementation:
`AcutisAuthenticationRepository` (real, Dapper-backed — see
`backend/Microservices/CFR.Acutis/AcutisAuthRepositorySelection.cs`). **There is no
development-fake/mock repository and no mode switch** — the app fails to start immediately if a
real connection string isn't configured. You must set one up before running locally (see below).

| Config key | Values | Default | Meaning |
|---|---|---|---|
| `AcutisAuth:ConnectionStringKey` | any string | `ConnString` | Which `ConnectionStrings` key `AcutisAuthRepositorySelection`'s startup check reads. Matches the shared `CFR.DBEngine.DapperHandler.Connection`'s hardcoded `GetConnectionString("ConnString")` call (itself matching the reference app exactly) — see [database-contract.md](database-contract.md). |

Only `Login` (`AuthenticateAsync`, calling `NewViper.DoLogin`) is backed by a confirmed database
object — live-verified this session (see [database-contract.md](database-contract.md#phase-2--real-repository-implemented-this-session)).
`GET /navigation/menus` and Forgot Password's account lookup throw an explicit
`NotImplementedException` (no confirmed standalone database object exists for either yet — an
accurate, documented limitation, not a bug). Password writes (Change/Reset Password) remain
unsupported.

## Setting up the connection string (required to run locally)

**Do not put the connection string in any tracked `appsettings*.json` file.** Use one of:

### Local development — .NET User Secrets

```bash
cd backend/Microservices/CFR.Acutis
dotnet user-secrets set "ConnectionStrings:ConnString" "<private-connection-string>"
```

This writes to a file **outside this repository** (`%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json` on Windows — the `<UserSecretsId>` itself, in `CFR.Acutis.csproj`, is not a secret, just an identifier for locating this file). User Secrets are only loaded when `ASPNETCORE_ENVIRONMENT=Development` (the default for `dotnet run` locally, per `Program.cs`).

To confirm what's set, without ever printing the value:

```bash
dotnet user-secrets list --project backend/Microservices/CFR.Acutis
# prints key names only if you don't read the value; avoid piping this to a shared log
```

**Important — this must be run in the same environment/session that will actually build/run/test the repository.** A secret set via `dotnet user-secrets set` in one terminal session is **not automatically visible** to a different session/environment running against the same repository (confirmed the hard way earlier this session — see [database-contract.md](database-contract.md) for the full attempt history). If you're coordinating between a human developer's terminal and an automated/agent session, confirm both are running on the same machine, as the same OS user account, against the same `CFR.Acutis.csproj` (its `UserSecretsId` is the addressing key — not the project path).

### Any other environment — environment variables

ASP.NET Core's configuration binder maps double-underscore-separated environment variables to nested config keys:

```bash
# Windows PowerShell example (illustrative key name, no real value shown)
$env:ConnectionStrings__ConnString = "<supplied by your secret store, never typed into a tracked file>"
```

Or via whatever secret-injection mechanism your deployment platform provides (Key Vault, parameter store, CI secret, etc.) — the requirement is only that the value reaches the `ConnectionStrings:ConnString` configuration key at runtime, never that it lives in source control.

## What `CFR.Acutis` does with real requests

- **`POST /auth/login`** — real. Calls `NewViper.DoLogin` and returns a genuine credential-check result.
- **`GET /navigation/menus`**, **`POST /auth/forgot-password`'s account lookup** — throw `NotImplementedException` internally (caught safely by the service layer — Forgot Password still returns its generic, enumeration-safe response; a real-account menu request would surface as a `500`). No confirmed standalone database object exists for either yet.
- **`POST /auth/change-password`/`reset-password`'s write step** — still returns the explicit "not yet supported" outcome, unchanged. No password-write database object is in scope.

See [database-contract.md](database-contract.md) for the full verification history (five prior blocked attempts before the connection succeeded) and exactly what was confirmed live against the real database.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Startup fails with `"ConnectionStrings:ConnString is not configured"` | You haven't set the connection string yet — see "Setting up the connection string" above. This is not optional; there is no fallback mode. |
| `/Auth/Login` returns `401`/`400` unexpectedly | Wrong credentials against the real database, or the connection string points at the wrong database — `AcutisAuthenticationRepository` never falls back to any hardcoded credential. |
| `NotImplementedException` from `/Navigation/Menus` or a real-account Forgot Password flow | Expected — no confirmed standalone database object exists for those operations yet, see [database-contract.md](database-contract.md). |
| User Secret set but not visible to this session | Confirm you're in the same machine/OS user/project as whatever is actually running `dotnet run` — see the cross-session-visibility note above. |
