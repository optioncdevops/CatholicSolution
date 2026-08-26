# Acutis Authentication — Specification & Implementation (Tasks 1–15+)

**Scope:** Specification (Tasks 1–2) followed by staged implementation (Tasks 4–14, plus a real-database attempt in Task 15 and a following session task) of Acutis-only authentication for `CFR.Acutis`. No database schema, reference application file, or password-write functionality has been changed at any point.

**Date:** 2026-08-26 (all tasks, same session).

**Reference (read-only, never modified):** `D:\Besp Task\GitHub\OptionC_Conversion\Source\acutis` — the completed OptionC Acutis application (backend + frontend).

**Implementation target:** `D:\Besp Task\GitHub\Catholic_Solution\Source` — `backend\Microservices\CFR.Acutis` and its platform dependencies, plus `frontend\SaaS_Apps\acutis` (new, Task 9).

## Current status (after the post-Task 15 session task)

**Every database-independent piece of Acutis authentication is fully implemented and live-verified end-to-end against the `DevelopmentFake` repository:** login, current-user resolution, dynamic menus (Task 14), logout, forgot/reset password (enumeration-safe, safe-rejection), change password (verify step works, write step honestly reports "not supported"), hardened JWT issuance/validation, and the full frontend integration. Real database-backed login and password writes remain blocked — not by missing design or missing code, but because no database reachable from this session's execution environment has ever exposed the required schema, or (more recently) even a resolvable connection string. **Five independent verification attempts** (Tasks 8, 10, 13, 15, and the session task that followed Task 15) confirmed this from different angles; see [database-contract.md](database-contract.md) for the complete history.

| Layer | Status |
|---|---|
| Contract layer (DTOs, interfaces, typed results) | Done — Task 2 |
| `AuthController` (6 endpoints) + `NavigationController` (`/navigation/menus`) | Done — Task 4, menus added Task 14 |
| JWT issuance + hardened validation (issuer/audience/lifetime, live-verified) | Done — Tasks 5–6 |
| Response serialization fix (`MSResultArgs` DataSet-cycle bug) | Done — Task 7 |
| Logout, dynamic menus, change/forgot/reset password (against the fake, honest "not supported" write) | Done — Task 14 |
| Frontend (`frontend/SaaS_Apps/acutis`) — typed client, auth state, protected routes, menus (live-refreshed), 401/403 handlers, mock/real switch | Done — Tasks 9, 14 |
| Automated test suite (`backend/Tests/CFR.Acutis.Tests`) | Done — Task 11, extended Task 14; 71/71 passing |
| Config-driven repository-mode switch (`DevelopmentFake`/`Database`), fail-fast checks | Done — Task 12 |
| Real, database-backed repository | **Blocked** — see below (5 attempts, all stopped at Phase 1) |
| Real password change/reset (write step) | **Blocked** — same root cause; DB inspection for a write path never reached (Phase 1 gates it) |

## Documents

| Document | Contents |
|---|---|
| [reference-comparison.md](reference-comparison.md) | Task 1. How the completed reference app implements each requested feature — file-by-file, with stored procedures, JWT claim shape, and honest gaps. |
| [current-state.md](current-state.md) | Task 1. Exact starting state of `CFR.Acutis` and the `CFR.*` platform libraries. |
| [requirements.md](requirements.md) | Task 2. Functional/non-functional requirements. |
| [api-contract.md](api-contract.md) | Task 2 spec, updated through the post-Task 15 session task. The implemented endpoint table (all 7, including `/navigation/menus`), JWT validation quick-reference, the `MSResultArgs` serialization fix, and the repository-backing status (5 blocked attempts). |
| [database-contract.md](database-contract.md) | Task 2 spec, updated through the post-Task 15 session task. Every database object the design depends on (confirmed-in-reference-code vs. blocker), plus five logged live-verification attempts and their exact outcomes. |
| [security-model.md](security-model.md) | Task 2 spec, updated through the post-Task 15 session task. Auth mechanism, hardened JWT validation (issuer/audience/clock-skew, live-verified), 401-vs-403 semantics, password design, current password-write blocker status. |
| [frontend-design.md](frontend-design.md) | Task 2 spec, updated through Task 14. As-built frontend structure, screens, auth state, protected routes, live-refreshed dynamic menus, 401/403 handlers, and explicit deltas from the original spec. |
| [implementation-plan.md](implementation-plan.md) | Task 2 plan, annotated through the post-Task 15 session task with what's actually done vs. still blocked, and the exact next step. |
| [test-plan.md](test-plan.md) | Task 2. Verification scenarios — most now exercised live in later tasks' reports rather than only planned. |
| [operations-runbook.md](operations-runbook.md) | Task 12, updated through the post-Task 15 session task. Build/test/run commands, the `AcutisAuth:RepositoryMode` config switch, and local setup via .NET User Secrets — no real secret values anywhere in it. |

## Headline findings

1. The reference app's Acutis auth is deliberately separate from SSO: a thin, identity-only JWT (sub/email/name) with role/permission/menu data carried in the response body, not the token. This is the pattern implemented here — reused, not reinvented.
2. The reference app does not fully implement everything requested (Forgot Password's reference frontend page is a non-functional stub; no self-service Reset/Change Password exists in the reference Acutis vertical). These were designed and built new (Tasks 2–7, 14), not ported.
3. `CFR.Base.CommonServiceExtension.DisableAuthenticationPolicy` has the same always-bypass bug found in the reference app — permanently excluded from `CFR.Acutis`'s wiring (Task 1 onward). JWT validation was instead genuinely hardened in `CFR.Acutis` alone (issuer/audience validation, explicit lifetime/clock-skew, live-verified — Task 6), without touching the shared `CFR.Base` extension (which `CFR.Gateway` also uses).
4. **Two real, previously-unknown bugs were found and fixed via live verification, not just code review:** ASP.NET Core's default JWT claim-type remapping (`MapInboundClaims`) silently broke `/Me` for a genuinely valid token (Task 6); `CFR.Base.ClientInfoMiddleware` (SSO-shaped) rejected every Acutis-authenticated request outright until `CFR.Acutis` stopped depending on it (Task 6). A third, unrelated bug — `MSResultArgs`'s `DataSource` property crashing JSON serialization via a `DataSet` object cycle — was found and fixed at the shared `CFR.DBEngine` level (Task 7), safely, since no other host currently serializes that type.
5. **No live database access has been available at any point in this effort, across five independent, differently-scoped attempts:** Task 8 (no configured target at all), Task 10 (identified the reference app's real dev database, but it's on a private LAN unreachable from this execution environment), Task 13 (same target, now network-routable but its SQL Server port actively refuses connections), and Task 15 plus the following session task (a different blocker: `ConnectionStrings:AcutisDb` simply does not resolve — no User Secret, no environment variable — in this session's environment, confirmed twice in a row). Every database object in [database-contract.md](database-contract.md) remains confirmed-in-reference-code only, never verified against a live schema. The DEV FAKE repository (`AcutisAuthenticationRepositoryDevFake`) is, and remains, the only registered implementation of `IAcutisAuthenticationRepository`.
6. **Every database-independent feature was completed and live-verified regardless of the DB blocker (Task 14 onward):** dynamic menus, logout, forgot/reset password (enumeration-safe), change password (verify step live, write step honestly unsupported), and the matching frontend integration — all exercised end-to-end against `DevelopmentFake` with passing build/test/typecheck/lint/build results each time.
6. Forgot Password, Reset Password, and Change Password's write step are explicit, honestly-reported blockers — no backing database object was ever found for them, in either the reference app or two live-verification attempts against real infrastructure. An interface-ready design (`IPasswordResetTokenStore`, `IPasswordResetEmailSender`) lets their contracts be built and tested against a dev-only backing without pretending the production question is settled.

## Remaining blocker and exact next step

**Not a design or code gap — an environmental one, and it has changed shape across attempts.** Tasks 8/10/13 found the reference application's real development database (`Database=optionccom`) unreachable at the network level (no designated target → private-LAN address with no route → host routable but its SQL Server port actively refuses connections). Task 15 and the following session task found something different: `ConnectionStrings:AcutisDb` does not resolve at all in this session's execution environment — no User Secret configured, no environment variable set — so no connection attempt was even possible. The next step is for someone to confirm the connection string is set in the *exact* environment/session that runs this repository's `dotnet build`/`dotnet test`/`dotnet run` (see [operations-runbook.md](operations-runbook.md)'s cross-session-visibility caveat), and separately confirm that environment has genuine network access to the target database. Once both are true, the already-scoped remaining work (verify the stored procedure's real contract, implement `AcutisAuthenticationRepository` against it, then inspect for password-write support) can proceed exactly as planned in [implementation-plan.md](implementation-plan.md).

## Status

**No database schema, reference application file, or password-write capability has been implemented.** Every claim of "done" above has been live-verified (build/test/manual HTTP or UI-adjacent checks), not merely asserted — see each task's own report for the exact evidence. Stopping here, database-backed work blocked as described above.
