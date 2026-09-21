---
name: api-testing-standards
description: API-level test authoring standards for the Catholic Solutions / CFR platform — real HTTP calls against a running CFR.Gateway/CFR.Acutis/CFR.Portal instance (NUnit + plain HttpClient, no mocks, no browser). Use this skill whenever asked to write, add, or review API tests — e.g. "add an API test for this endpoint", "write a negative test for this controller action", "test the Gateway routing", "verify this endpoint returns 401/403/409", "extend CFR.Acutis.Tests". Distinct from unit-testing-standards (mocked, in-process, no network) and from test-case-design (broad QA matrix/Gherkin/BDD design across all layers) — this skill is specifically for the plain-HttpClient integration layer that already exists as backend/Tests/CFR.Acutis.Tests, and for the equivalent CFR.Portal.Tests project that does not yet exist. Encodes the project's real response envelope (MSResultArgs), the ActionId/stored-procedure architecture, the environment-safety gating pattern (ApiTestEnvironment), and the confirmed authorization-bypass defect that API tests are uniquely positioned to detect.
---

# API Testing Standards — Catholic Solutions (CFR)

This skill is for **API-level tests**: real HTTP requests over `HttpClient` against a running `CFR.Gateway`/`CFR.Acutis`/`CFR.Portal` instance, asserting on actual HTTP status codes and response bodies. No mocks, no browser, no in-process test host.

- Different from **`unit-testing-standards`**: that skill mocks every collaborator and never touches a network or a real database; this skill deliberately does the opposite — it proves the real, deployed stack behaves correctly end-to-end through the Gateway.
- Different from **`test-case-design`**: that skill is the broad QA-matrix/Gherkin/BDD design exercise across every layer (UI, API, DB); this skill is the concrete authoring standard for one specific, already-established test surface in this repo — `backend/Tests/CFR.Acutis.Tests` — and its not-yet-created sibling for `CFR.Portal`.

Read `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` first if you don't already know the target endpoint's architecture (§10 has the full API inventory) — this skill assumes that context.

---

## 0. Current state — one real project, one feature, most of the surface uncovered

`backend/Tests/CFR.Acutis.Tests` (`CFR.Acutis.Tests.csproj`: `net10.0`, NUnit 4.4.0, NUnit3TestAdapter, Microsoft.NET.Test.Sdk 17.14.1 — **no HTTP client library beyond the framework's own `HttpClient`**, no RestSharp/Flurl/Postman) is a real, working API-test project with **two files**:

- `ApiTestEnvironment.cs` — the environment-resolution/safety-gating helper (see §2 — reuse this exactly, do not reinvent it).
- `UserRolesApiNegativeTests.cs` — **9 tests**, all against `api/v1/UserRoles/{SaveUserRole,UpdateUserRoleStatus,DeleteUserRole}`: three `403 AsNonAdmin`, one `401 WithNoToken`, two `409` (role in use), three `404` (unknown RoleId).

**This is the entire API-test surface of the whole platform.** Every other controller across both `CFR.Acutis` (12 controllers) and `CFR.Portal` (3 controllers) — roughly 60+ additional endpoints per `PROJECT_KNOWLEDGE_DOCUMENT.md` §10 — has **zero** API-level test coverage today. There is also no `CFR.Portal.Tests` project at all. When this skill is invoked for anything outside `UserRoles`, say explicitly that you are creating the first API test for that controller, not extending existing coverage.

---

## 1. Reuse `ApiTestEnvironment` exactly — do not invent a second safety mechanism

`ApiTestEnvironment.cs` is the load-bearing safety net for this entire test layer. Its exact contract (verified from source, cite these names precisely rather than approximating them):

| Member | Purpose |
|---|---|
| `CFR_TEST_ENVIRONMENT` | Resolves to `Development`/`Pilot`/`Staging`/`Live`. **Fail-safe: unset or unrecognized → `Live`** (the most locked-down option), never guessed toward something more permissive. |
| `CFR_API_BASE_URL` | The base URL the test's `HttpClient` targets — read via `ApiTestEnvironment.RequireVariableOrSkip(ApiBaseUrlVariable)`. If unset, the test **skips (`Assert.Ignore`), not fails**. |
| `CFR_TEST_ADMIN_TOKEN` / `CFR_TEST_NON_ADMIN_TOKEN` | Pre-issued JWTs for a role-with-Access and a role-without-Access, for 403-vs-200 comparisons. |
| `CFR_TEST_ROLE_ID` / `CFR_TEST_ASSIGNED_ROLE_ID` / `CFR_TEST_UNKNOWN_ROLE_ID` | Seeded ids the test needs — extend this pattern with feature-specific id variables (`CFR_TEST_ORG_ID`, `CFR_TEST_PRODUCT_ID`, etc.) rather than hardcoding an id that may not exist in the target environment. |
| `CFR_AUTOMATION_ALLOW_MUTATIONS` / `CFR_AUTOMATION_MUTATION_CONFIRMATION` | The **same** opt-in variables the Selenium suite (`Automation.Framework.TestEnvironmentContext`) uses — deliberately shared, not a second independent "allowed" switch, specifically so a bug in one gate can't accidentally leave the other one open. |
| `ApiTestEnvironment.Resolve().RequireMutationsAllowedOrSkip(description)` | Call this as the **first line** of any test that saves/updates/deletes/creates real data. Ends the test as `Ignored`, never `Failed`, when not permitted. |
| Mutation policy | **Live: never allowed, no override, ever.** **Staging: requires both the allow-flag AND `CFR_AUTOMATION_MUTATION_CONFIRMATION=STAGING`** (a literal string match) — note `PROJECT_KNOWLEDGE_DOCUMENT.md` §16 documents Staging as sharing its database/API origin with Live, so this extra confirmation step is protecting real production-adjacent data, not a formality. **Pilot/Development: allow-flag only.** |

**Rules when writing a new API test file:**
- Copy `ApiTestEnvironment.cs`'s pattern for any new test project (e.g. a future `CFR.PortalService.Tests`... actually `CFR.Portal.Tests` — see §6) rather than referencing it across project boundaries or reinventing a third gating scheme. The existing file's own doc comment explains why it's reimplemented rather than shared: this project intentionally does not pull in Selenium/Reqnroll just to reuse `TestEnvironmentContext`.
- Every test that is not a pure read (`GET`) must call `RequireMutationsAllowedOrSkip` before doing anything else.
- Every required environment variable is read via `RequireVariableOrSkip`/`RequireIntVariableOrSkip` — never `Environment.GetEnvironmentVariable(...)` with a silent fallback to a hardcoded value, which would make a "skipped, unverified" scenario look like a "passing" one.

---

## 2. What every API test must assert — the real response contract, not just HTTP status

Per `PROJECT_KNOWLEDGE_DOCUMENT.md` §10/§18, every endpoint funnels through `BaseController.ApiResultArgs`, producing this envelope:

```json
{ "statusCode": 0, "statusMessage": "string", "resultData": {}, "errors": [], "traceId": "guid", "timestamp": "iso-date" }
```

- **Deserialize into a typed body class** the way `UserRolesApiNegativeTests.ApiResultArgsBody` does (`[JsonPropertyName("statusCode")]` etc., `JsonSerializerDefaults.Web`) — don't parse with raw string matching.
- **A 403 (`Forbid()`) carries no body at all.** `ReadBodyOrNull` in the existing file already handles this (empty/unparsable content → `null`, not a test failure) — reuse that exact pattern; do not assume every non-2xx response has a JSON body.
- **A `204`/`NoRecordFound` response has an empty body** (`PROJECT_KNOWLEDGE_DOCUMENT.md` §18 — `BaseController.GetResponseByStatusCode` maps `ErrorCodes.NoRecordFound` to `NoContent()`, discarding `statusMessage`). If you're testing a "no data" scenario, assert the HTTP status is 204 **and** that there is no body to parse — don't write an assertion that expects a `statusMessage` there, it will never come.
- **Assert on the real `HttpStatusCode` enum value**, not a raw int (`Is.EqualTo(HttpStatusCode.Forbidden)`, matching the existing file) — clearer failure messages when it doesn't match.
- Where the body **is** present, assert `statusCode`/`statusMessage` against the actual `ErrorCodes`/`ErrorMessages` constants used by the Service you're calling (open the Service source first — see the `unit-testing-standards` skill's rule about not inventing sentinel values).

---

## 3. The single highest-value test category — confirming (or refuting) the authorization-bypass defect

`PROJECT_KNOWLEDGE_DOCUMENT.md` §15/§19 documents a critical, code-level finding: `DisableAuthenticationPolicyEvaluator` unconditionally returns success for both authentication and authorization in every environment, meaning `[Authorize]` should currently block nothing.

**The existing repo already contains the exact test that would empirically confirm or refute this**: `DeleteUserRole_WithNoToken_Returns401` in `UserRolesApiNegativeTests.cs`. Its own doc comment states it as "a sanity check that the 403 tests above are exercising role-based authorization specifically, not merely re-discovering missing authentication" — i.e., the test's author expected `[Authorize]` to work. **If the §15 finding is accurate, this specific test should currently be failing** (a request with no token should NOT come back `401 Unauthorized` if the policy evaluator always succeeds).

When this skill is invoked for anything security/authorization-related:
1. **Recommend actually running `DeleteUserRole_WithNoToken_Returns401` against a real environment first** — its pass/fail result is the single most direct, already-written way to settle whether §15's finding still holds, before writing new tests that assume one answer or the other.
2. **Write the equivalent no-token/401 test for every other `[Authorize]`-marked controller** (`OrganizationController`, `ProfileController`, per §10 — currently only `UserRoles` has this check) using the exact same pattern (`CreateClient(bearerToken: null)`, assert `HttpStatusCode.Unauthorized`).
3. **Label every such test's current expected outcome explicitly** in a comment, the same way you would for a unit test per the `unit-testing-standards` skill's Critical Note — do not silently soften or delete a failing authorization test to make a suite "green"; a red result here is the whole point.
4. Note that a `403`-style test (e.g. `SaveUserRole_AsNonAdmin_Returns403`) can pass independently of the `[Authorize]`-framework question if the Service/Controller performs its own **manual** role check (reading `RoleId` from a supplied, valid, non-admin token) rather than relying on ASP.NET Core's authorization pipeline — the existing 403 tests in this repo appear to be exactly this kind of manual check, not proof that `[Authorize]` itself is enforced. Don't conflate "a wrong-role *authenticated* request is rejected" with "an *unauthenticated* request is rejected" — they test different mechanisms, and only the second is what §15 says is broken.

---

## 4. Coverage plan — work module by module through the real endpoint inventory

Use `PROJECT_KNOWLEDGE_DOCUMENT.md` §10 as the checklist; do not invent an endpoint or its exact route/parameters — confirm against the actual controller file before writing a test. Suggested order (highest business/security value first, matching this project's own confirmed risk areas):

1. **Authorization no-token/401 sweep** (§3 above) across every `[Authorize]`-marked controller.
2. **`CFRLaunch` one-time-code lifecycle** (`CFR.Portal`) — `LaunchProductAsync` then `ExchangeTokenAsync`: happy path, expired code, already-used code (exchange twice), code for a since-disabled product. Zero existing coverage (§21). Sentinel-code-to-HTTP mapping to assert (verified against source, reuse exactly): `LaunchProductAsync` → `-1`/`0`→401, `-2`→404, `-3`→400 (`ProductDisabled`), `-4`→400 (`ExternalPageUrlMissing`), `-5`→401 (`ProductNotAssignedToUser`); `ExchangeTokenAsync` reuses the **same numbers for different meanings** → `-2`→401 (`ExpiredAuthorizationCode`), `-3`→401 (`AuthorizationCodeUsed`), `-4`→401 (`AuthorizationCodeProductMismatch`), `-5`→401 (`ProductNotAssignedToUser`), `-6`→400 (`ProductDisabled`). Re-verify these against the current `CFRLaunchService.cs` before hardcoding them into an assertion — this project's own convention is to keep such mappings feature-specific and non-obvious.
3. **`AccessRequest` full lifecycle** (both `CFR.Portal`'s `SaveAccessRequest` and `CFR.Acutis`'s `GetAccessRequests`/`GetAccessRequestById`/`UpdateAccessRequestStatus`) — §21 flags the approve/reject/info-request action as having no coverage at any level, in any test project. This is the top priority for new API-test authorship in the whole platform.
4. **File-upload endpoints** (`EmailSettings/UploadEmailLogo`, `Products/UpdateProductLogo`, `Profile/UpdateProfile`) — multipart requests; test the documented 2MB/jpg-png constraints at the boundary (at limit, over limit, wrong content-type) using `MultipartFormDataContent`/`ByteArrayContent` rather than a mocked `IFormFile` (that belongs in a unit test, not here).
5. **`Organization`/`Products` CRUD conflict paths** — duplicate role/license/user-email 409s, unknown-id 404/204 semantics (confirm which one each specific endpoint actually returns — §18 notes this is inconsistent across the codebase, don't assume).
6. **`Dashboard`** — §21 flags this as having no dedicated coverage; an API test can at least assert the envelope/shape and that an inverted date range (`startDate` > `endDate`) doesn't 500.

For every new controller you cover, create one test class named `{Feature}ApiNegativeTests` (matching `UserRolesApiNegativeTests`) or `{Feature}ApiTests` if it includes positive/happy-path cases too, in the appropriate project (§6).

---

## 5. Gateway-specific tests — routing, CORS, rate limiting

These exercise `CFR.Gateway` itself rather than a specific business endpoint (§8/§9 of the knowledge doc):

- **Path-prefix routing**: call the same logical endpoint through both `{gateway}/acutis/api/v1/...` and (if reachable directly for test purposes) the microservice's own port, and assert equivalent behavior — confirms `PathRemovePrefix` transforms are working.
- **CORS**: assert the current wide-open policy empirically (`Access-Control-Allow-Origin` reflecting an arbitrary `Origin` header, `Access-Control-Allow-Credentials: true`) — per §15/§19 this is a **documented current-state fact to confirm**, not a target to assert should be tightened, unless the task is explicitly to verify a CORS fix.
- **Rate limiting**: §7 of the knowledge doc notes the Gateway's named limiter policies (`"per-user"`, `"fixed"`) do not appear attached to any route. A test that fires >100 requests/minute at a Gateway-routed endpoint and asserts whether a `429` ever appears is a good way to empirically confirm or refute this — treat an *absence* of throttling as the currently-expected (if undesirable) result, and say so explicitly rather than treating the test as broken if it never gets a 429.
- Do **not** write Gateway tests that require standing up multiple environments simultaneously beyond what `CFR_API_BASE_URL` already points at — keep the test project's environment model exactly as simple as `ApiTestEnvironment` already defines it.

---

## 6. Project layout for new coverage

- **CFR.Acutis endpoints** (Administration, Dashboard, Organization, Products, Profile, AcutisAuthentication): add new test classes directly into the existing `backend/Tests/CFR.Acutis.Tests` project — it already targets this microservice's surface through the Gateway.
- **CFR.Portal endpoints** (Authentication, CFRLaunch, Administration/AccessRequest on the Portal side): **create a new `backend/Tests/CFR.Portal.Tests` project**, mirroring `CFR.Acutis.Tests.csproj` exactly (same `net10.0`/NUnit/NUnit3TestAdapter/Microsoft.NET.Test.Sdk versions, same `IsTestProject=true`, same doc-comment style explaining its scope) and its own copy of the `ApiTestEnvironment` pattern (or a shared internal project if the team decides the duplication is worth removing — but do not silently reference `CFR.Acutis.Tests`'s internal `ApiTestEnvironment` class across project boundaries without an explicit `ProjectReference`, since it is currently `internal`/project-scoped by convention). Add the new project to `backend/CatholicSolution.slnx` under the existing `Tests` folder.
- Naming: test class `{Feature}ApiNegativeTests`/`{Feature}ApiTests`; test method `{Action}_{Scenario}_Returns{ExpectedStatus}` (exact style already established: `DeleteUserRole_AsNonAdmin_Returns403`).

---

## 7. What NOT to do in this layer

- Don't mock anything — if you find yourself wanting to mock `IDapperHandler` or a repository, you're writing a unit test; switch to the `unit-testing-standards` skill instead.
- Don't drive a browser — if the scenario needs to click through a UI (multi-step forms, modals, toolbar interactions), that's `test-case-design`'s Selenium/Reqnroll (`Automation.Acutis`) scope.
- Don't hardcode a base URL, token, or id — every one of these must come from an `ApiTestEnvironment`-style environment variable, exactly like the existing file, so the same test file is safe to point at Development, Pilot, or (read-only) Live without editing source.
- Don't attempt a mutating test against Live under any configuration — `ApiTestEnvironment` already makes this structurally impossible if you use it correctly; don't work around it.
- Don't assume an endpoint's exact route, parameter names, sentinel codes, or status-code mapping from this skill file or from `PROJECT_KNOWLEDGE_DOCUMENT.md` alone when writing the literal assertion — both are a snapshot as of one analysis pass. Open the actual controller/Service source immediately before writing the test.

---

## 8. Output discipline

- State plainly whether the target endpoint currently has zero API-test coverage (true for everything except `UserRoles`) before presenting new tests as "additional" coverage.
- Cite the controller/Service file and exact route for every test you propose or write.
- For any authorization-related test, apply §3's labeling rule — a currently-failing 401 assertion is a finding, not a defect in the test.
- Prefer the coverage order in §4 when given an open-ended "add some API tests" request, since it maps directly to confirmed zero-coverage, high-risk areas in `PROJECT_KNOWLEDGE_DOCUMENT.md` rather than arbitrary endpoint selection.
