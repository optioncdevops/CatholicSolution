---
name: test-case-design
description: Test-case design standards for the Catholic Solutions / CFR platform (.NET 10 backend + React CFR/CFR_Admin frontends). Use this skill whenever asked to design, write, or review test cases, test plans, QA checklists, Gherkin/.feature scenarios, or NUnit test skeletons for ANY module in this repo — even if the user only says "write test cases for X", "what should QA test here", "add a feature file", or "review test coverage". Encodes this project's actual architecture (Controller->Service->Repository->Stored-Procedure, MSResultArgs envelope, ActionId-discriminated SPs, rights-based authorization, the known authorization-bypass defect), its two real test frameworks (Reqnroll/Selenium BDD in Automation.Acutis, NUnit API tests in CFR.Acutis.Tests), and the confirmed high-risk/low-coverage areas from PROJECT_KNOWLEDGE_DOCUMENT.md. Produces test-case matrices, Gherkin scenarios, or NUnit skeletons that match existing repo conventions instead of generic boilerplate.
---

# Test Case Design Standards — Catholic Solutions (CFR)

This skill turns a feature/module/bug into a concrete, repo-consistent set of test cases. It assumes the reader has (or can look up) `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` — that document is the source of truth for architecture, API inventory, database schema, business rules, and known risk areas. **Read the relevant section of that document before designing test cases for a feature you don't already know well; do not re-derive architecture facts from scratch.**

Use this skill for: designing new test cases, writing `.feature` (Gherkin) scenarios, writing NUnit API test skeletons, building a QA test-case matrix/spreadsheet-style table, or reviewing existing test coverage against what the feature actually does.

---

## 0. Orient yourself before writing a single test case

For the feature/module named in the request, first answer these from `PROJECT_KNOWLEDGE_DOCUMENT.md` (or the code directly if the doc doesn't cover it):

1. **Which layer(s) does this touch?** Frontend page/component → API controller/action → Service → Repository → Stored Procedure → Table(s). (§6, §9, §10, §11 of the knowledge doc.)
2. **Which app owns the UI?** `CFR` (end-user portal/App Hub) or `CFR_Admin` (Super Admin console) — they have different auth models, different validation approaches (manual vs. `react-hook-form`), and only `CFR_Admin` has automated BDD coverage today.
3. **Is there already automated coverage?** Check `backend/Automation/Automation.Acutis/Features/*.feature` (BDD, CFR_Admin UI only) and `backend/Tests/CFR.Acutis.Tests/*.cs` (NUnit API, UserRoles only as of the last analysis). If nothing exists, say so explicitly in your output rather than assuming parity with a similar-looking module.
4. **What does the response envelope look like for this endpoint?** Every API response is `MSResultArgs`/`MSResultArgs<T>`: `{statusCode, statusMessage, resultData, errors, traceId, timestamp}`. Business-status codes (`ErrorCodes`: 200 Success, 201 Created, 202 Updated, 203 Failed, 204 NoRecordFound, 205 Deleted, 400 BadRequest, 401 UnAuthorized, 404 NotFound, 409 Conflict, 500 InternalServerError) are mapped to real HTTP status by `BaseController.GetResponseByStatusCode` — note `204 NoRecordFound` returns an **empty body**, discarding `statusMessage`. Test cases must assert on the *business* `statusCode` field inside the body, not just the HTTP status, and must explicitly check the empty-body behavior on "no data" cases.
5. **Does this feature use the ActionId-discriminator pattern?** If the repository calls one shared stored procedure with an `@ActionId` parameter (the norm — see §11), the ActionId numbering is **per-procedure, not universal**. Confirm the actual numbering for this specific SP in `StoredProc.cs`/the repository file before writing "ActionId=N" into any test case; never assume the `Acutis_Users` 1-6 scheme applies elsewhere.
6. **Is authorization relevant here?** If yes, you MUST include the authorization test cases in §3 below, including the one that currently is expected to **fail against production intent** (see the Critical Note).

---

## 1. Critical, standing note — read before writing any authorization test case

`PROJECT_KNOWLEDGE_DOCUMENT.md` §15/§19 documents a **confirmed, code-level finding**: `DisableAuthenticationPolicyEvaluator` (`backend/Platform/CFR.Base/DisablePolicy.cs`) unconditionally short-circuits both authentication and authorization in every environment, so `[Authorize]` currently blocks nothing anywhere in this codebase.

When you design authorization/negative-auth test cases:
- **Always write the test case as if `[Authorize]` is supposed to work** (i.e., assert 401/403 for missing/wrong-role tokens) — this is the correct target behavior and the test's job is to catch regressions **once the defect is fixed**, and to make the current gap visible in a test report today.
- **Explicitly label such test cases** with a note like *"Known to currently FAIL / PASS-when-it-shouldn't due to the DisableAuthenticationPolicy defect — see PROJECT_KNOWLEDGE_DOCUMENT.md §15"* so a test run's red/green status is correctly interpreted by whoever executes it, instead of being dismissed as a flaky test or silently marked `[Ignore]`.
- Do not quietly skip authorization test design just because you know it will fail today — an accurately-failing test is exactly the evidence needed to prioritize the fix.

---

## 2. The two real test surfaces in this repo — match your output to the right one

| Surface | Where | Framework | Scope | When to target it |
|---|---|---|---|---|
| BDD / UI automation | `backend/Automation/Automation.Acutis/Features/*.feature` + `StepDefinitions/*.cs`, page objects in `backend/Automation/Automation.Framework/ViperPages/**` | Reqnroll.NUnit + Selenium (Chrome only) | End-to-end through the **CFR_Admin** UI only | User-facing workflows, multi-step screens, anything a real admin would click through |
| API-level negative tests | `backend/Tests/CFR.Acutis.Tests/*.cs` | Plain NUnit + `HttpClient` | Direct HTTP calls to `CFR.Gateway`/`CFR.Acutis`, no browser | Auth/role/conflict/not-found edge cases the UI can't easily trigger (disabled buttons, needing two simultaneously-authenticated roles, direct 401/403/404/409 assertions) |
| **CFR (end-user portal) UI** | **none exists** | — | — | If asked to add coverage here, say explicitly that no automation harness currently targets the CFR app (all `ViperPages`/`.feature` files target CFR_Admin only) and propose the new page-object/feature-file layout before writing scenarios, rather than silently inventing conventions |
| **Frontend unit/component tests** | **none exist in either app** | — | — | If asked for frontend unit tests, say explicitly that no test runner (Vitest/Jest) is configured in `frontend/CFR` or `frontend/CFR_Admin`'s `package.json`, and that adding one is a prerequisite, not just missing test files |

**Always state which surface a test case targets** (BDD/UI, API, or "no harness exists yet") — do not present a Gherkin scenario as if it will run today against the CFR portal, since no step definitions/page objects exist for it.

---

## 3. Test-case dimensions to cover for every CRUD/workflow feature

Design against this checklist; not every dimension applies to every feature, but consciously rule each one in or out rather than skipping silently.

### 3.1 Functional / positive
- Each CRUD operation succeeds with valid, complete input and returns the expected `statusCode` (e.g. `Created`=201 on save, `Updated`=202 on update, `Deleted`=205 on delete) and `resultData` shape.
- List/get endpoints return the correct rows for the given filter/id, including pagination/sort/filter UI behavior where the frontend module implements it (e.g. `UserRolesListPage`'s Columns/Excel/Print/CSV toolbar, per `UserRoles.feature`).
- Multi-step workflows complete end-to-end (e.g. create org → assign product → verify it appears in `GetOrganizationProducts`).

### 3.2 Negative / validation
- Required-field omissions at both the UI validator layer (`validator/*.ts` or `react-hook-form` rules) **and** the Service-layer validation — test both, since this repo's frontend and backend validation are maintained independently and have been found to drift (§17 of the knowledge doc: ZIP-regex inconsistency between CFR and CFR_Admin).
- Invalid formats: email regex, phone (10-digit) regex, ZIP regex — confirm the *actual* regex in the specific module's validator file before asserting a boundary (CFR's public request form accepts 5/5+4/6-digit ZIP; CFR_Admin's organization form is 5-digit only — do not assume they match).
- Duplicate-uniqueness conflicts return `409 Conflict` with a clear message: duplicate role name (`UserRoles/SaveUserRole`), duplicate user email (`Users/SaveUser`), duplicate/overlapping license duration (`Products/CreateLicense`/`UpdateLicense`).
- Delete-while-referenced is blocked with `409 Conflict`: deleting a `UserRole` that still has assigned users (`UserRoles/DeleteUserRole`).
- Unknown/non-existent id returns `404 NotFound` (or the business-code equivalent) — check whether the endpoint under test returns an empty-body `204` (treated as "list is just empty") vs. an actual `404`/error `statusMessage` for "you asked for a specific id that doesn't exist" — these are semantically different and this repo does not apply the distinction consistently across every controller, so verify per-endpoint.
- SP sentinel-code paths where documented (e.g. `AccessRequestService.SaveAccessRequestAsync` maps repository return codes `-99`=duplicate/Conflict, `-98`=member not found, `-97`=product not found, `-96`=org not found, `-93`=bad request; `CFRLaunchService.LaunchProductAsync` maps `-2`=NotFound/ProductNotFound, `-3`=ProductDisabled, `-5`=ProductNotAssignedToUser). Write one test case per sentinel code you can find documented for the feature — these are often untested today.

### 3.3 Boundary
- Field length limits (e.g. org name ≤100 chars, address ≤500 chars, request note ≤500 chars) — test at limit, limit+1, and empty.
- File upload limits: logos/photos capped at 2MB, jpg/jpeg/png only (`EmailSettings/UploadEmailLogo`, `Products/UpdateProductLogo`, `Profile/UpdateProfile`) — test at/just-under/just-over the size cap and with a disallowed file type/extension-spoofed file.
- Date-range boundaries for Dashboard (`GetDashboardSummary(startDate, endDate)`) — same-day range, inverted range (start > end), open-ended.

### 3.4 Authorization / role
- See the Critical Note in §1 — always include, always labeled with current expected (defective) behavior.
- For CFR_Admin: the "rights cached at login" business rule (§13 of the knowledge doc) — test that changing a user's rights while they are signed in does **not** take effect until their next login (this is documented as intentional current behavior, not a bug to "fix" unless the request says otherwise) — and separately test that a re-login does pick up the new rights.
- For `[Authorize]`-marked controllers (`UserRolesController`, `OrganizationController`, `ProfileController`) vs. non-`[Authorize]` ones (most Administration controllers, Dashboard, Products) — note the inconsistency explicitly if asked to review coverage; don't assume convention implies enforcement (it currently doesn't, for any of them — see §1).

### 3.5 Integration / cross-cutting
- Email-triggered flows (access-request admin notification, `SendTestEmail`, password-reset email): test that a downstream email failure does **not** fail the parent business operation (`AccessRequestService.NotifyAdminsOfNewRequestAsync` explicitly catches/logs email failures separately) — write a test case that simulates SMTP failure and asserts the primary save still succeeds.
- One-time launch codes (`[auth].[CFRLaunch]`): test expired-code exchange, already-used-code exchange (`IsUsed=1`), and exchange for a product/org whose entitlement was revoked after the code was issued but before exchange.
- Dashboard integrity checks (`GetIntegrityIssueDetail`): seed the specific bad-data condition (e.g. an approved access request with no corresponding `OrganizationProduct` grant) and assert the KPI/alert count and drill-down rows match, since this logic has **no existing automated coverage** per the knowledge doc.

### 3.6 Data integrity / audit
- `InsertedBy`/`UpdatedBy` must be stamped from the authenticated user's id server-side, never trusted from client payload — test that a client-supplied `InsertedBy`/`UpdatedBy` value in the request body is ignored/overwritten (per the backend coding standard in `backend-api-standards-SKILL.md`).
- Soft-delete (`IsDeleted` bit): confirm a "deleted" record disappears from list/get endpoints but the row still exists (don't assert a hard delete unless the specific stored procedure is confirmed to hard-delete).
- Concurrency: **flagged as "Cannot Be Determined"** in the knowledge doc — no optimistic-concurrency/row-version columns were confirmed in the schema evidence gathered. If asked to test concurrent edits, say explicitly that whether the system detects a lost update is unverified, and design the test as an *investigation* (two concurrent updates, then check which one "won" and whether any error was raised) rather than asserting a specific documented behavior.

### 3.7 Non-happy-path status-code/envelope shape
- For every endpoint under test, assert the **shape** of the envelope on both success and failure, not just the outer HTTP status: `{statusCode, statusMessage, resultData, errors, traceId, timestamp}`. In particular, assert that a `204`/`NoRecordFound` response body is empty (per §18 of the knowledge doc) so a frontend consumer relying on `statusMessage` for a "no data" message is caught if that ever silently changes.
- Assert the current `GlobalExceptionHandlerMiddleware` behavior (raw `ex.Message` leaked on an unhandled 500) only if the test's purpose is explicitly a security/information-disclosure check — call this out as a known issue (§18/§19) rather than treating a message leak as a normal negative-test assertion to "pass."

---

## 4. Gherkin (`.feature`) scenario template — match existing style

Existing `.feature` files (`backend/Automation/Automation.Acutis/Features/*.feature`) follow this shape. Mirror it exactly — do not invent a different Gherkin dialect/tagging scheme:

```gherkin
Feature: {Module} management
  As an Admin
  I want to {capability}
  So that {business reason}

  Background:
    Given I am logged in as an admin with valid credentials
    And the Dashboard should be open

  @smoke
  Scenario: View the {Module} list
    When I navigate to the {Module} page
    Then the {Module} list should be displayed
    And the toolbar (Columns/Excel/Print/CSV) should be available

  Scenario: Create a new {Feature} with valid data
    When I open the Add {Feature} form
    And I fill in valid {Feature} details
    And I click Save
    Then a success toast should be shown
    And the new {Feature} should appear in the list

  Scenario Outline: Reject {Feature} creation with invalid <field>
    When I open the Add {Feature} form
    And I set <field> to "<value>"
    And I click Save
    Then a validation error for <field> should be shown
    And the {Feature} should not be created

    Examples:
      | field       | value |
      | Name        |       |
      | Email       | not-an-email |
      | ZipCode     | ABCDE |

  @mutating
  Scenario: Prevent deleting a {Feature} that is still in use
    Given a {Feature} with an active assignment exists
    When I attempt to delete that {Feature}
    Then a conflict message should be shown
    And the {Feature} should remain in the list
```

Rules when producing a real `.feature` file for this repo:
- Reuse the existing `Background` login pattern from `Login.feature`/`EnvironmentAwareLoginStepDefinitions.cs` rather than inventing a new login step — check whether the target feature needs the environment-aware (mutation-gated) login variant.
- Tag any scenario that writes/deletes real data as `@mutating` and note in your output that, per `TestEnvironmentContext`, it will self-skip (`Assert.Ignore`, not fail) unless `CFR_AUTOMATION_ALLOW_MUTATIONS` (and, for Staging, an explicit confirmation string) is set — this is intentional safety, not a defect to fix.
- If the target feature has no existing page object under `Automation.Framework/ViperPages/**`, say so and propose the new page-object file/class name (matching the `{Module}/{Feature}Page.cs` convention) instead of writing steps that reference a non-existent page object.
- Do not write a scenario against the **CFR** (end-user) app — no page objects/step definitions exist for it (see §2).

---

## 5. NUnit API test skeleton — match `CFR.Acutis.Tests` style

```csharp
[TestFixture]
public class {Feature}ApiNegativeTests
{
    private HttpClient _client;

    [OneTimeSetUp]
    public void Setup()
    {
        ApiTestEnvironment.SkipIfNotConfigured(); // fails safe: unset/unknown env => treated as Live
        _client = ApiTestEnvironment.CreateClient();
    }

    [Test]
    public async Task {Action}_WithoutToken_Returns401()
    {
        var response = await _client.PostAsync("api/v1/{Controller}/{Action}", JsonContent(payload));
        Assert.That((int)response.StatusCode, Is.EqualTo(401));
        // NOTE: as of PROJECT_KNOWLEDGE_DOCUMENT.md §15, this assertion is expected to FAIL
        // today because DisableAuthenticationPolicyEvaluator neutralizes [Authorize].
        // Do not delete or soften this test to make it pass — the failure is the signal.
    }

    [Test]
    public async Task {Action}_WithNonAdminRole_Returns403() { /* ... */ }

    [Test]
    public async Task {Action}_OnRecordInUse_Returns409() { /* ... */ }

    [Test]
    public async Task {Action}_OnUnknownId_Returns404OrNoRecordFound() { /* assert envelope shape, see §3.7 */ }
}
```

Follow `ApiTestEnvironment`'s existing environment-gating pattern (`CFR_TEST_ENVIRONMENT`, mutation-allow flags) rather than hardcoding a base URL or token — every new test file should be safe to run against Live by default (skips mutating/destructive cases) and only performs writes when explicitly opted in, exactly like the existing `UserRolesApiNegativeTests.cs`.

---

## 6. Test-case matrix template (for a QA deliverable, not automated code)

When the ask is "design test cases" rather than "write code," produce a table like this per feature — this format is deliverable as-is (chat, doc, or spreadsheet):

| ID | Title | Type | Preconditions | Steps | Expected Result | Priority | Automated? |
|---|---|---|---|---|---|---|---|
| TC-{Feature}-001 | Create {Feature} with valid data | Positive | Logged in as Admin with `access` right on {Module} | 1. Open Add {Feature}. 2. Fill valid data. 3. Save. | 201 Created; row appears in list; toast shown | High | BDD candidate |
| TC-{Feature}-002 | Reject duplicate {unique field} | Negative | An existing {Feature} with the same {field} | Attempt to save a second one with the same value | 409 Conflict; clear message; no duplicate row created | High | API candidate |
| TC-{Feature}-003 | {Action} without a valid token | Auth | No/expired token | Call `{Method} {Endpoint}` directly | Should be 401 (currently PASSES INCORRECTLY due to §15 defect — flag as known gap) | Critical | API (`CFR.Acutis.Tests` style) |
| TC-{Feature}-004 | Rights change takes effect only after re-login | Auth/session | User A signed in; admin revokes User A's right on {Module} | User A attempts the action without re-authenticating, then logs out/in and retries | First attempt: still allowed (documented current behavior). Second attempt (after re-login): denied. | Medium | BDD candidate (two sessions) |

Number IDs `TC-{Feature}-NNN`. Always include at least one row explicitly tagged with its current pass/fail expectation when the behavior is a **known, documented gap** (§1) rather than presenting it as a plain pass/fail.

---

## 7. Standing high-risk seed list — always consider these when scoping "what should we test"

Pulled from `PROJECT_KNOWLEDGE_DOCUMENT.md` §13/§19/§21. Include or explicitly rule out each one relevant to the feature in scope:

1. Authorization bypass (§1/§15) — applies platform-wide.
2. Organization status must respect the DB CHECK constraint (`active`/`inactive`/`suspended`) — test an out-of-range value is rejected, ideally with a friendly message rather than a raw SQL/500 error (cross-check against the `GlobalExceptionHandlerMiddleware` message-leak issue, §18).
3. Rights/menu access is cached at login, not re-checked per request (§13).
4. CFRLaunch one-time codes: replay and expiry (§13, §3.5 above) — **no existing automated coverage**.
5. Access-Request approve/reject/info-request actions are **not covered by any existing `.feature` scenario** (`AdminAccessRequests.feature` only tests listing/filtering) — prioritize these if asked about the Requests module.
6. Whether approving a request actually grants the corresponding `OrganizationProduct` entitlement is itself an open question (§28, Requires Business Clarification) — a test case here should first establish/confirm the expected linkage with the business owner before asserting a specific outcome.
7. Dashboard KPI/integrity-issue accuracy — **no dedicated coverage exists**; any dashboard test should seed known-bad data and verify the count/drill-down, not just that the page loads.
8. The entire **CFR** end-user portal app (login, App Hub, launch, request-interest modal) has **zero automated coverage** of any kind — treat any request to "test the app hub" as greenfield test design, not a coverage review.
9. `CFR_Admin`'s `LicenseDetails.tsx` still reads from legacy mock data (`AdminDataContext`) for one lookup — a test exercising this specific screen should verify it against **real** seeded data and flag a mismatch as a bug, not assume the mock data is authoritative.
10. Frontend form-validation drift between `CFR` and `CFR_Admin` (e.g. ZIP regex) — when testing a field that exists in both apps, test each app's actual rule independently; do not assume parity.
11. Staging shares its database/API origin with Live (per `CFR_Admin/.env.staging`'s own comment) — any test plan that includes a "Staging" pass must flag that mutating tests there affect real production data, and should default to the same mutation-gating discipline the `Automation.Framework` already enforces (`CFR_TEST_ENVIRONMENT=Staging` requires an explicit confirmation string before any write).

---

## 8. Output discipline

- Cite the specific controller/service/repository/SP/table/`.feature` file you're basing a test case on, the same way `PROJECT_KNOWLEDGE_DOCUMENT.md` does — a test case with no traceable source is a guess, not a design.
- If the requested feature/module isn't in `PROJECT_KNOWLEDGE_DOCUMENT.md` and you haven't inspected the code yourself, say so and look it up (Grep/Read the actual controller and its `.feature`/test files) rather than inventing plausible-sounding endpoints or ActionIds.
- Never present a "known gap" test case (§1, §7) as if it will currently pass — always label its current expected outcome.
- When the user asks for "test cases for X" without specifying format, default to the matrix in §6 (fastest to review/triage); only produce Gherkin or NUnit code when asked for automation, or when the matrix reveals a scenario worth codifying immediately.
