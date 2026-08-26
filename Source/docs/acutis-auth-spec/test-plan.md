# Test Plan — Acutis Authentication

Scope and date: Task 2, 2026-08-26. Specification only. No test project exists yet for `CFR.Acutis` or `frontend/SaaS_Apps/acutis` (both are unbuilt/scaffold-only, per [current-state.md](current-state.md)) — this plan describes what must be verified and how, for use once implementation begins; it does not itself run anything.

## Test levels

- **Backend, per-endpoint (manual/HTTP-tool now, automatable later):** exercised via `CFR.Acutis.http`-style requests or curl/Postman against a running `CFR.Acutis` instance, directly and through `CFR.Gateway`'s `/acutis` prefix.
- **Backend, unit-level (token generation, claim shaping):** isolated checks not requiring a live database — see Task 2 in [implementation-plan.md](implementation-plan.md).
- **Frontend, manual click-through:** each screen/flow in [frontend-design.md](frontend-design.md), in both mock and real-API modes.
- **End-to-end:** full chain (frontend → `CFR.Gateway` → `CFR.Acutis` → database), reserved for Task 13.

No test framework is prescribed here beyond what the repo already uses elsewhere (none currently, per [current-state.md](current-state.md)'s confirmation that the OptionC reference solution itself has no live/buildable test project) — introducing one is a decision for implementation time, not fixed by this spec.

## Scenarios by endpoint

### `POST /auth/login`
1. Valid credentials → `200`, envelope contains a decodable JWT with `email`/`sub`/`name` claims, non-empty `moduleRights`, shaped `menuItems`.
2. Invalid password → documented failure envelope (not `500`, not an unhandled exception), no token issued.
3. Unknown username → same failure envelope as #2 (no distinguishable behavior — consistent with not leaking account existence, mirroring the enumeration-safety principle applied explicitly to Forgot Password in [security-model.md](security-model.md)).
4. Missing `UserName` or `Password` → `400`.
5. Null/empty body → `400`.
6. Response never contains `ex.Message`/stack trace text on any failure path.

### `POST /auth/logout`
1. Valid token → `200`.
2. No token → `401`.
3. Expired token → `401` (proves expiry is enforced — see Session Expiry scenarios below for why this matters).

### `POST /auth/forgot-password`
1. Email matching a real account → generic `200` success response.
2. Email not matching any account → **identical** generic `200` success response (byte-for-byte message match with #1 — this is the enumeration-safety test, and it must be checked explicitly, not assumed).
3. Malformed email → `400`.
4. (Dev-store mode only, per Task 7) A token is actually issued and retrievable by the dev store for a matching account — confirms the interface-ready design works end-to-end in its non-production backing, even though production delivery is blocked.

### `POST /auth/reset-password`
1. Valid, unexpired, unused token + matching `NewPassword`/`ConfirmPassword` → success response (dev-store mode) or explicit "not supported" response (if the production write path is still blocked at test time — see [database-contract.md](database-contract.md)).
2. Expired token → generic failure (not distinguishing "expired" from "invalid" in the message, per [security-model.md](security-model.md)).
3. Already-used (single-use) token → same generic failure, and the store's `ValidateAndConsumeTokenAsync` must not allow a second successful use.
4. `NewPassword != ConfirmPassword` → `400`.
5. Malformed/missing token → `400` or the same generic failure as #2/#3 (not a different, more revealing message).

### `POST /auth/change-password`
1. Authenticated, correct `CurrentPassword`, matching `NewPassword`/`ConfirmPassword` → verify step succeeds; write step behaves per its blocker status at test time (either succeeds, once unblocked, or returns an explicit "not yet supported" response — never a false success).
2. Authenticated, incorrect `CurrentPassword` → generic rejection, verify step correctly fails closed.
3. Unauthenticated (no/invalid/expired token) → `401` before the action body runs.
4. `NewPassword != ConfirmPassword` → `400`.
5. `CurrentPassword`/`NewPassword` values never appear in logs produced during this test run (grep server logs after running scenarios 1–2 to confirm).

### `GET /auth/me`
1. Valid token → `200`, returns the token's own `userId`/`email`/`fullName`, matching what was embedded at login time.
2. No token → `401`.
3. Expired token → `401`.
4. Tampered token (signature invalid) → `401`.

### `GET /navigation/menus`
1. Valid token for a user with rights → `200`, tree shape matches [api-contract.md](api-contract.md)'s documented `NavGroup` shape, and matches what Login returned for the same user (consistency check between the two sources of the same underlying data).
2. Valid token for a user with zero rights → `200`, empty tree (not an error) — matches reference `MapModuleRightsToMenu`'s empty-list return for an empty rights collection.
3. No token → `401`.

## Session expiry / unauthorized behavior (cross-cutting, Task 12)

1. A request with an expired token to any `[Authorize]` endpoint returns `401` — proves `DisableAuthenticationPolicy` was not wired in (this is the single most important regression to guard, per NFR6; a passing test here after every future change to `CFR.Acutis`'s `Program.cs` is the concrete guard against silently reintroducing the bug).
2. On the frontend, an API call returning `401` results in: stored auth state cleared, redirect to `/auth/session-expired` — verified by manually forcing an expired token into `localStorage` and triggering any authenticated call.
3. Visiting a protected route with no stored auth at all redirects to `/auth/login`, not `/auth/session-expired` (the two must be distinguishable, per [frontend-design.md](frontend-design.md)).
4. Visiting a protected route with a **present-but-expired** stored token (not just absent) also redirects correctly, not treated as "authenticated" — this is the specific gap identified in [reference-comparison.md §8](reference-comparison.md#8-protected-routes) and must be tested explicitly, since a presence-only check would pass a naive test but fail this one.

## Frontend scenarios (mock and real-API modes, per [frontend-design.md](frontend-design.md))

1. Every screen (Login, Forgot Password, Reset Password, Change Password, Unauthorized, Session Expired) renders without error in isolation.
2. Full login → see menu → logout flow works in mock mode.
3. Same flow works in real-API mode against a running backend (once Task 11 is done).
4. Switching `VITE_ACUTIS_AUTH_MODE` between `mock`/`api` requires no component code changes — proves the interface seam from [frontend-design.md](frontend-design.md) actually decouples the two.
5. `hasPermission`/`hasModuleRole`-gated UI correctly hides/shows elements per mock and real permission data, **and** a manual check confirms that a client-side-bypassed permission (e.g., via browser devtools) still gets rejected by the backend when the corresponding API call is made — this is the concrete test for NFR9 ("frontend authorization must not replace backend authorization").

## Security-focused checks (run across the whole surface, not per-endpoint)

- No password or reset-token value appears in any server log, client console log, or network-tab-visible query string (passwords/tokens must be body-only, never query string — checked explicitly against the mistake flagged in [reference-comparison.md §4](reference-comparison.md#4-reset-password) regarding the SSO module).
- CORS behavior inherited from `CFR.Base` (wildcard-with-credentials by default, per [current-state.md](current-state.md)) is explicitly reviewed against whatever this feature's actual deployment origins are, not left unchecked.
- Every `[Authorize]`-marked endpoint in [api-contract.md](api-contract.md) is confirmed to actually carry that attribute in code (a simple but essential regression check — Task 1's reference-app audit found real instances of sibling actions inconsistently missing `[AllowAnonymous]`/`[Authorize]` attributes; this must not recur here).

## What this plan does not cover

- Load/performance testing — out of scope for an authentication-feature spec.
- Automated CI wiring — no test runner exists in either repo today (per [current-state.md](current-state.md)); introducing one is a separate decision, not assumed here.
- Database-level testing of the blocked write paths (Forgot/Reset Password, Change Password write) — cannot be tested against a real database until [database-contract.md](database-contract.md)'s blockers are resolved; the dev-store-backed scenarios above are the closest available substitute until then.
