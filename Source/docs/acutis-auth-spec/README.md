# Acutis Authentication — Specification & Implementation (Tasks 1–15+)

**Scope:** Specification (Tasks 1–2) followed by staged implementation (Tasks 4–14, plus a real-database attempt in Task 15 and a following session task) of Acutis-only authentication for `CFR.Acutis`. No database schema, reference application file, or password-write functionality has been changed at any point.

**Date:** 2026-08-26 (all tasks, same session).

**Reference (read-only, never modified):** `D:\Besp Task\GitHub\OptionC_Conversion\Source\acutis` — the completed OptionC Acutis application (backend + frontend).

**Implementation target:** `D:\Besp Task\GitHub\Catholic_Solution\Source` — `backend\Microservices\CFR.Acutis` and its platform dependencies, plus `frontend\SaaS_Apps\acutis` (new, Task 9).

## Current status (real-time development — updated later this same session)

**`DevelopmentFake` has been removed entirely.** Per explicit instruction ("no fake account... real
time development"), `AcutisAuthenticationRepositoryDevFake`, the `AcutisAuthenticationRepositoryNotImplemented`
placeholder, and the `RepositoryMode` config switch were all deleted. `CFR.Acutis` now has exactly
one `IAcutisAuthenticationRepository` implementation — `AcutisAuthenticationRepository`, real and
Dapper-backed — and fails to start unless a real database connection string is configured. A sixth
verification attempt succeeded this session (after five prior blocked attempts — Tasks 8, 10, 13,
15, and the session task after it), confirming `NewViper.DoLogin` live; `Login` is now real,
live-verified end-to-end through the full HTTP pipeline. `GET /navigation/menus`, Forgot Password's
account lookup, and password writes remain honest, explicit blockers (no confirmed database object
for the first two; no password-write object in scope for the third) — see
[database-contract.md](database-contract.md) for the complete verification and implementation
history.

| Layer | Status |
|---|---|
| Contract layer (DTOs, interfaces, typed results) | Done — Task 2 |
| `AuthController` (6 endpoints) + `NavigationController` (`/navigation/menus`) | Done — Task 4, menus added Task 14 |
| JWT issuance + hardened validation (issuer/audience/lifetime, live-verified) | Done — Tasks 5–6 |
| Response serialization fix (`MSResultArgs` DataSet-cycle bug) | Done — Task 7 |
| Logout, dynamic menus, change/forgot/reset password (honest "not supported"/blocker responses) | Done — Task 14, real-DB-verified later this session |
| Frontend (`frontend/SaaS_Apps/acutis`) — typed client, auth state, protected routes, menus (live-refreshed), 401/403 handlers, common Modal + centralized validation | Done — Tasks 9, 14, extended later this session |
| Automated test suite (`backend/Tests/CFR.Acutis.Tests`) | Done — Task 11, extended through this session |
| Real, database-backed repository (`AuthenticateAsync`/Login only) | **Done this session** — live-verified against the real database; `DevelopmentFake` removed |
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
| [operations-runbook.md](operations-runbook.md) | Task 12, rewritten later this session after `DevelopmentFake` was removed. Build/test/run commands and local setup via .NET User Secrets for the now-required real database connection — no real secret values anywhere in it. |

## Headline findings

1. The reference app's Acutis auth is deliberately separate from SSO: a thin, identity-only JWT (sub/email/name) with role/permission/menu data carried in the response body, not the token. This is the pattern implemented here — reused, not reinvented.
2. The reference app does not fully implement everything requested (Forgot Password's reference frontend page is a non-functional stub; no self-service Reset/Change Password exists in the reference Acutis vertical). These were designed and built new (Tasks 2–7, 14), not ported.
3. `CFR.Base.CommonServiceExtension.DisableAuthenticationPolicy` has the same always-bypass bug found in the reference app — permanently excluded from `CFR.Acutis`'s wiring (Task 1 onward). JWT validation was instead genuinely hardened in `CFR.Acutis` alone (issuer/audience validation, explicit lifetime/clock-skew, live-verified — Task 6), without touching the shared `CFR.Base` extension (which `CFR.Gateway` also uses).
4. **Two real, previously-unknown bugs were found and fixed via live verification, not just code review:** ASP.NET Core's default JWT claim-type remapping (`MapInboundClaims`) silently broke `/Me` for a genuinely valid token (Task 6); `CFR.Base.ClientInfoMiddleware` (SSO-shaped) rejected every Acutis-authenticated request outright until `CFR.Acutis` stopped depending on it (Task 6). A third, unrelated bug — `MSResultArgs`'s `DataSource` property crashing JSON serialization via a `DataSet` object cycle — was found and fixed at the shared `CFR.DBEngine` level (Task 7), safely, since no other host currently serializes that type.
5. **Live database access was achieved this session, after five prior blocked attempts** (Task 8: no configured target; Task 10: real dev database identified but network-unreachable; Task 13: same target, port refused; Task 15 + the session task after it: connection string didn't resolve in this session's environment). A sixth attempt succeeded: `NewViper.DoLogin` was confirmed live — connection, parameters, both result-set shapes, empty-result/password-verification behavior, and timeout behavior. **`AcutisAuthenticationRepository` (real, Dapper-backed) is now the only registered `IAcutisAuthenticationRepository` implementation — `AcutisAuthenticationRepositoryDevFake` was removed entirely** later the same session, per explicit instruction ("no fake account... real time development"). `CFR.Acutis` now requires a real database connection to start at all.
6. **Every database-independent feature (Task 14 onward) is now live-verified against the real database, not a fake:** login (`AuthenticateAsync`), the full frontend integration, and the still-honest blockers for dynamic menus/Forgot-Password-lookup/password writes (no confirmed database object for any of the three) — all exercised end-to-end with passing build/test/typecheck/lint/build results.
7. Forgot Password, Reset Password, and Change Password's write step remain explicit, honestly-reported blockers — no backing database object was ever found for them, in either the reference app or this session's live verification against the real database. An interface-ready design (`IPasswordResetTokenStore`, `IPasswordResetEmailSender`) lets their contracts be built and tested without pretending the production question is settled.

## Remaining gap and exact next step

**Login works against the real database. Dynamic menus and Forgot Password's account lookup do not — not because of missing DB access anymore, but because no confirmed standalone database object exists for either.** `GetModuleRightsAsync` in particular has no non-invented path: the only confirmed object (`NewViper.DoLogin`) requires re-authenticating with a password, which that method doesn't have. The next step is either a direct schema search/DBA review for a standalone rights-by-userId object, or a deliberate design decision (e.g., a short-lived in-memory cache of the rights rowset `AuthenticateAsync` already fetches at login) — flagged as an open question in [implementation-plan.md](implementation-plan.md), not decided yet. Password writes (Change/Reset Password) remain a separate, still-unresolved blocker.

## Status

**No database schema, reference application file, or password-write capability has been implemented.** Every claim of "done" above has been live-verified (build/test/manual HTTP or UI-adjacent checks), not merely asserted — see each task's own report for the exact evidence. Stopping here, database-backed work blocked as described above.
