---
name: regression-testing-standards
description: Regression-testing standards for the Catholic Solutions / CFR platform — given a code change or a bug fix, decide what existing coverage to re-run, what manual checks fill the gaps, and what new regression test to add so the bug can never silently reappear. Use this skill whenever asked "what should I re-test after this change", "run a regression pass", "regression suite for X", "smoke test before release/deploy", "add a regression test for this fix", or "impact analysis for this change". Distinct from test-case-design (designs brand-new test cases for a feature), unit-testing-standards (authors isolated mocked tests), and api-testing-standards (authors real-HTTP tests) — this skill is the change-impact/selection/tracking discipline that sits on top of all three, encoding this project's real coupling points (shared ActionId stored procedures, cross-cutting CFR.Base/CFR.Common/CFR.DBEngine, hand-duplicated frontend code, no CI/CD) and its known, still-open defects that must be manually re-checked until real tests exist for them.
---

# Regression Testing Standards — Catholic Solutions (CFR)

This skill answers **"given this change, what do we re-run, what do we manually check, and what new regression test do we add"** — it is not about designing tests from scratch for an untouched feature (that's `test-case-design`), and it is not about how to author a mocked unit test or a real-HTTP API test (that's `unit-testing-standards` / `api-testing-standards`, respectively — this skill tells you *when* those skills' outputs need to be invoked as part of a regression response, not how to write them).

Read `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` first if you don't already know the architecture of the area being changed.

---

## 0. Current state — what actually exists to regress against

There is **no CI/CD pipeline anywhere in this repository** (`PROJECT_KNOWLEDGE_DOCUMENT.md` §24 — no `.github/workflows`, no `azure-pipelines.yml`, confirmed by direct search) and **no Gherkin/Reqnroll tags exist in any `.feature` file today** (verified: `grep -rn "^@" Features/*.feature` in `backend/Automation/Automation.Acutis` returns nothing) — so there is no tag-based selective execution (`@smoke`, `@regression`, etc.) to filter on; selection is by file/class name only, and running anything is a manual, deliberate act, not a merge/deploy gate. Every regression pass in this project is therefore something a person chooses to run and interpret — say so explicitly when advising on scope, rather than assuming a pipeline will catch what's missed.

The three real test surfaces available to regress with, in increasing cost/realism:

| Surface | Location | What it actually covers today |
|---|---|---|
| API (NUnit + `HttpClient`) | `backend/Tests/CFR.Acutis.Tests` | 9 tests, all `UserRoles` mutation endpoints only (see `api-testing-standards` §0) |
| BDD/UI (Reqnroll + Selenium, Chrome) | `backend/Automation/Automation.Acutis` | 14 `.feature` files — Login, MenuAccess, Product, Organization, UserDetails, UserRoles, UserRights, EmailTemplates, EmailSettings, AdminAccessRequests (listing/filtering only), ChangePassword/ForgotPassword/ResetPassword (mutation-gated), and `TestAllProcess.feature` — a composite scenario chaining most of the above into one run. **`CFR_Admin` only** — no page objects or feature files reference the `CFR` end-user portal at all. |
| Unit (NUnit + Moq) | *(does not exist yet)* | Nothing — see `unit-testing-standards` §0 |

`TestAllProcess.feature` is the closest thing this repo has to an existing "full regression pack," and it re-exercises the same steps as the individual feature files in one long run rather than adding new coverage — treat it as the Tier-3 smoke-of-everything-covered run (§2), not as proof the *whole platform* is regression-safe, since it never touches `CFR.Portal`, the `CFR` end-user app, the Gateway, or anything below the UI layer.

---

## 1. What "regression testing" means here, concretely

Two distinct activities, both in scope for this skill:

1. **Change-triggered regression** — a change is about to be made (or was just made); decide what to re-run before it ships, based on blast radius (§3/§4).
2. **Bug-fix regression** — a bug was just fixed; a **new** regression test must be added that would have caught it, in whichever of the three surfaces above matches the bug's layer, so the same defect can never silently reappear. This is the classic definition of "regression test" and the one most often skipped under time pressure — do not let a bug fix ship without this step, even if it's a single new test method.

---

## 2. Regression tiers for this project

Use these tiers to scope a response instead of either "run everything" (too slow, and much of "everything" is BDD/Selenium, which is slow and Chrome-only) or "run nothing but the one thing I touched" (misses this project's real coupling points, §4).

| Tier | What it is | When to run it |
|---|---|---|
| **Tier 0 — Smoke** | `Login.feature` + `MenuAccess.feature` (CFR_Admin only) | After any change that touches authentication, routing/menu rights, or shared layout — cheapest possible "did I break the ability to sign in and see the app at all" check |
| **Tier 1 — Feature regression** | The specific `.feature` file(s) and/or `CFR.Acutis.Tests` class(es) for the module actually changed | After any change scoped to one module (e.g. a `UserRolesService` fix → run `UserRoles.feature` + `UserRolesApiNegativeTests`) |
| **Tier 2 — Cross-module impact regression** | Tier 1 **plus** every module listed as coupled to the changed one in §4's blast-radius map | After any change to a shared stored procedure, a cross-cutting `Platform/*` project, or anything touching audit/entitlement/rights data that other modules read |
| **Tier 3 — Full pack** | `TestAllProcess.feature` + a full `dotnet test` run of `CFR.Acutis.Tests` + the manual known-defect watchlist (§6) | Before a release/deploy to Pilot/Staging/Live, or after any change to `Platform/CFR.Base`, `CFR.Common`, `CFR.DBEngine`, or `CFR.Gateway` (platform-wide blast radius — see §3) |

None of these tiers currently include anything for the `CFR` end-user portal or for genuine unit-level regression, because no automation exists there — Tier 2/3 responses for a change that touches those areas must say so explicitly and fall back to a **manual regression checklist** (walk the affected screens by hand) rather than silently omitting them.

---

## 3. Change-impact → regression-scope mapping

Identify which row(s) match the change, then apply that row's tier from §2. Rows are ordered from narrowest to widest blast radius.

| Change location | Blast radius | Required regression scope |
|---|---|---|
| A single Controller action's one-line body | Essentially none — no logic lives here (`api-testing-standards` §2) | Tier 1 only, and only if the route/verb/DTO shape itself changed |
| A `{Feature}Service` method's business logic (validation, sentinel-code mapping, error handling) | The one feature, plus anything that calls it | Tier 1 for that feature. Check callers: e.g. `AccessRequestService` is called from both `CFR.Portal` (`SaveAccessRequestAsync`) and `CFR.Acutis` (`GetAccessRequestsListAsync`/`UpdateAccessRequestStatusAsync`) — a shared-DTO or shared-repository change here needs Tier 1 on **both** sides |
| A `{Feature}Repository` method / its `DynamicParameters` shaping | The feature, plus every other repository method calling the **same stored procedure** with a different `ActionId` | **Tier 2, mandatory.** This project reuses one SP across many `ActionId`-discriminated operations (`PROJECT_KNOWLEDGE_DOCUMENT.md` §11 — e.g. `[dbo].[Acutis_Organization]` has 13 distinct `ActionId` branches, `[dbo].[Acutis_Users]` has 6). A parameter-shape or column change made for one `ActionId` can silently break a sibling branch that shares the same SP and connection-handling code path — regression-test every `ActionId` on the same SP, not just the one you changed |
| An actual stored-procedure `.sql` script under `Infrastructure/*/Scripts/` | Every repository method targeting that SP, across every `ActionId`, across every environment the script is applied to | **Tier 2 minimum, Tier 3 if the SP is shared across many features** (e.g. `[request].[AccessRequestManage]` is used by both `CFR.Acutis` and `CFR.Portal`'s `AccessRequestRepository`). Also re-check any `FK`/`CHECK` constraint interactions documented in the same script (e.g. `016_Acutis_Organization_Rebuild.sql`'s FK comments) — a schema change can surface as a new, previously-impossible negative-path result (409/500) in an unrelated feature |
| `Platform/CFR.Base`, `Platform/CFR.Common`, `Platform/CFR.DBEngine` (any file) | **Both microservices AND the Gateway** — these are compiled into every host (`PROJECT_KNOWLEDGE_DOCUMENT.md` §5/§9) | **Tier 3, always.** This is the single widest blast radius in the codebase. Explicitly re-run the Authorization Sweep category (`api-testing-standards` §3) after any change here, especially anything touching `CommonServiceExtension.cs`/`DisablePolicy.cs` — this is exactly the code that produced the confirmed authorization-bypass finding (§15/§19), so a "fix" here is the highest-value place a regression test has ever existed in this platform, and the highest-risk place to introduce a new one silently |
| `CFR.Gateway` config/routing (`GatewayServiceCatalog.cs`, `appsettings*.json` `Gateway:Services`) | Every endpoint on both downstream microservices, reachable only through the Gateway | Tier 3's Gateway Tests category (`api-testing-standards` §5 — routing, CORS, rate limiting) |
| `frontend/CFR/src/shared/*` or `frontend/CFR_Admin/src/shared/*` (auth, registry, design system) | **Only the app you edited** — `frontend/CLAUDE.md` and `PROJECT_KNOWLEDGE_DOCUMENT.md` §8 are explicit that this code is hand-duplicated, not shared/synced, between the two frontends | Regression-test the **one app changed** at Tier 1/2 as usual, but also explicitly confirm the **other app was NOT accidentally assumed to be fixed too** — a very common false-confidence mistake in this codebase specifically, since the files look identical enough to assume a shared fix. If the same bug exists in both apps' copies, that is two separate regression items, not one |
| A `validator/*.ts` or `utils/*Helpers.ts` pure function | The screens/forms that call it | Tier 1 (manual walk-through for `CFR`, since no automation exists there; `.feature`-file-driven for the matching `CFR_Admin` screen if one exists) |
| `EnumCommand.cs` / `MessageCatalog.cs` (`ErrorCodes`/`ErrorMessages`/`SerilogErrorMessages`) | Every Service that references the changed constant | Tier 2 — grep every usage of the changed constant name before declaring the change safe; a renumbered `ErrorCodes` value silently changes the HTTP status every caller maps to (`BaseController.GetResponseByStatusCode`) |

---

## 4. Cross-module coupling map (for Tier 2 decisions)

This project's real data/entitlement relationships, reconstructed from `PROJECT_KNOWLEDGE_DOCUMENT.md` §11/§12/§13 — use this to decide what else to regress-test when a change touches one node:

```text
Users <-> UserRoles <-> UserRights
  (a Role's rights determine what a User can do; a User's Role is fetched at login and cached
   for the session — a UserRoles or UserRights change should also regression-test Login/menu access)

Organization <-> Products/Licenses <-> Dashboard integrity checks
  (assigning/removing a product from an Organization changes what the Dashboard's integrity
   alerts and KPI counts report — a change to OrganizationController/Service should also
   regression-test DashboardController.GetDashboardSummary/GetIntegrityIssueDetail)

AccessRequest <-> Organization, Products, EmailTemplates, SMTPMailService
  (approving/rejecting a request is meant to relate to an Organization's product entitlement,
   and always fires an admin-notification email through a template — a change to
   AccessRequestService should also regression-test the admin-notification email path AND,
   if/when the approve-to-grant linkage is implemented or clarified per S28, the resulting
   OrganizationProduct state)

CFRLaunch <-> Organization/Products entitlement, [auth].[CFRLaunch] one-time codes
  (LaunchProductAsync and ExchangeTokenAsync reuse the SAME numeric sentinel codes for
   DIFFERENT meanings per api-testing-standards S4 item 2 — a change to one method's mapping
   is very easy to accidentally mirror into the other; regression-test BOTH methods together,
   never one in isolation)

CFR.Base auth/CORS/middleware <-> every [Authorize]-marked controller
  (UserRolesController, OrganizationController, ProfileController) <-> every controller relying
  on convention only (no attribute either way)
  (a change here has two entirely different regression concerns: (1) did it change behavior for
   the three ALREADY-gated controllers, and (2) did it accidentally start enforcing something
   for the many controllers that currently rely on no attribute at all, which could be a breaking
   change for existing callers even though it would also be a security improvement)
```

---

## 5. The "one bug fix, one new regression test" rule

Every time a defect is fixed, before considering the fix complete:

1. **Identify the layer the bug lived in** (Service logic → `unit-testing-standards`; wrong HTTP status/response shape → `api-testing-standards`; UI workflow/validation → `test-case-design`'s BDD scope or a new `validator` unit test per `unit-testing-standards` §7) and add exactly one new test in that surface that fails on the old code and passes on the fix. If you can't articulate what would have caught the bug, you don't yet understand the fix well enough to call it done.
2. **Log it**, mirroring this project's own established convention (`Source/docs/testCases/UserRoles-defect-log.xlsx`, produced via `test-case-design`) — record the defect, the root cause, the regression test added (by name/id), and which tier (§2) it now belongs to.
3. **If the bug was in a shared stored procedure or a `Platform/*` file**, apply §3/§4's wider blast-radius rule — the regression test you add for the specific bug is necessary but not sufficient; also re-run the wider tier before closing the defect.
4. **If the bug cannot be covered by an automated test today** (e.g., it's in the `CFR` end-user portal, which has zero harness — `unit-testing-standards` §0/§5), say so explicitly and record it as a **manual regression checklist item** (§6) rather than silently letting the fix ship with no regression protection at all.

---

## 6. Standing manual regression watchlist — re-check every Tier-3 pass

These are confirmed, still-open findings from `PROJECT_KNOWLEDGE_DOCUMENT.md` that have **no permanent automated regression coverage today**. Until real tests exist for each (via the appropriate authoring skill), include them explicitly, by name, in every full/pre-release regression pass rather than assuming "the suite is green" means these are fine:

1. **Authorization bypass** (§15/§19) — re-run `DeleteUserRole_WithNoToken_Returns401` and note its actual result; do not treat a change elsewhere as unrelated just because it didn't touch `CFR.Base` directly, since a build/dependency change can still alter this behavior.
2. **Rights cached at login, not re-checked mid-session** (§13) — after any `UserRoles`/`UserRights` change, manually confirm a live session still reflects old rights until re-login, and reflects new rights after.
3. **`CFRLaunch` sentinel-code reuse across `LaunchProductAsync`/`ExchangeTokenAsync`** (§4 above) — manually confirm the two mappings haven't drifted into each other after any change to either method.
4. **Orphaned `saveAccessRequest()` call in `CFR_Admin`'s `requestsService.ts`** (§10/§19 of the API report) — confirm it is still genuinely unreachable/unused after any Requests-module frontend change; if a future change makes it reachable, it will 404 against `CFR.Acutis`'s `AccessRequestController` (which has no `SaveAccessRequest` action) unless that gap is closed at the same time.
5. **`LicenseDetails.tsx`'s residual dependency on mock `AdminDataContext`** (§8 of the knowledge doc) — after any `cfrproducts`/licensing change, manually confirm this specific screen wasn't silently relying on stale mock data instead of the real API result.
6. **Staging shares its database/API origin with Live** (§16) — not a code defect, but a standing regression-execution risk: never run a mutating Tier-2/3 pass against Staging without the explicit `CFR_AUTOMATION_MUTATION_CONFIRMATION=STAGING` gate that `TestEnvironmentContext`/`ApiTestEnvironment` already enforce — and prefer Development/Pilot for routine regression, reserving a gated Staging pass for pre-release only.

---

## 7. Running what exists today (no CI/CD — this is manual)

```bash
# Tier 1/2/3 BDD (CFR_Admin) — from backend/Automation/Automation.Acutis
dotnet test --filter "FullyQualifiedName~LoginFeature"          # Tier 0 smoke (class name, no tags exist)
dotnet test --filter "FullyQualifiedName~UserRolesFeature"      # Tier 1 example
dotnet test                                                       # Tier 3 — runs every .feature including TestAllProcess

# Tier 1/2/3 API (CFR.Acutis.Tests) — from backend/Tests/CFR.Acutis.Tests
dotnet test --filter "FullyQualifiedName~UserRolesApiNegativeTests"
```

Required environment variables before any of the above produce real (non-`Ignored`) results: `CFR_TEST_ENVIRONMENT`, `CFR_AUTOMATION_BASE_URL`/`CFR_API_BASE_URL`, the `_USERNAME`/`_PASSWORD`/token variables, and — for anything in Tier 2/3 that mutates data — `CFR_AUTOMATION_ALLOW_MUTATIONS` (and `CFR_AUTOMATION_MUTATION_CONFIRMATION=STAGING` if the target is Staging). See `api-testing-standards` §1 and `test-case-design`'s coverage of `TestEnvironmentContext`/`ApiTestEnvironment` for the full variable list — do not fabricate a value for one that's missing; let the run self-skip and report that as "not exercised," not "passed."

For everything with **no automation** (the entire `CFR` portal app, `CFR.Portal`'s API surface pre-`CFR.Portal.Tests`, Dashboard content, Access-Request approve/reject outcomes, any unit-level regression) — produce a short manual checklist (screens to click through, or `curl`/Postman calls to make) rather than claiming a Tier covers something it structurally cannot yet cover.

---

## 8. Regression report/traceability template

When asked for a regression *report* (as opposed to just running things), default to this shape — consistent with the Excel-deliverable pattern already established for `test-case-design`/`unit-testing-standards`/`api-testing-standards` outputs in this project:

| Change / Trigger | Module(s) Impacted (§3/§4) | Tier | Suite(s) / Test(s) Run | Manual Checklist Items (§6, if any) | Result | Defect Log Ref |
|---|---|---|---|---|---|---|
| e.g. "Fixed duplicate-license overlap bug in `ProductsRepository`" | Products, Organization (licenses feed Dashboard's assignment summary) | Tier 2 | `Product.feature`; new `CreateLicenseAsync` boundary unit test (via `unit-testing-standards`) | #5 (LicenseDetails.tsx mock dependency) | Pass / Fail / Not Exercised | link to defect-log row |

---

## 9. Output discipline

- Always state which tier (§2) you're recommending and why, citing the specific row of §3/§4 that justifies it — don't default to "run everything" or "just re-test what changed" without checking the mapping.
- Always cross-check §6's watchlist for a Tier-3 or `Platform/*`-touching change; never silently drop it because the change "seems unrelated."
- When a bug fix is involved, apply §5 before calling the work done — a fix without a regression test, or without an explicit note that no test surface can currently cover it, is incomplete for the purposes of this skill.
- Never claim a manual/unautomated area (`CFR` portal, Dashboard, unit-level logic) was "regression tested" by an automated run that structurally cannot reach it — say plainly that it needs a manual pass instead.
