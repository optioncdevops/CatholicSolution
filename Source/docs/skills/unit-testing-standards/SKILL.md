---
name: unit-testing-standards
description: Unit test authoring standards for the Catholic Solutions / CFR platform (.NET 10 Service/Repository layers + React CFR/CFR_Admin validator/helper logic). Use this skill whenever asked to write, add, or review UNIT tests (as opposed to end-to-end/BDD or API-integration tests) — e.g. "unit test this service", "test this validator", "add test coverage for X with mocks", "write an NUnit test with Moq", "test this helper function". Establishes framework choice, project layout, naming, mocking conventions, and which layers are actually unit-testable in this codebase (Service logic and pure helper/validator functions, NOT controllers, NOT stored procedures, NOT anything needing a live DB/SMTP/browser) given that NO true unit-test project exists in this repo today.
---

# Unit Testing Standards — Catholic Solutions (CFR)

This skill is for **true unit tests**: fast, isolated, no I/O, single-class/single-function tests that mock every collaborator. It is a different job from the `test-case-design` skill (which covers BDD/E2E/API-level test-case design across the whole stack) — use both together, but don't confuse them. If asked generically to "add tests," clarify or default to unit tests for the specific class/function named, and point at `test-case-design` for broader QA-matrix/E2E work.

Read `Source/docs/PROJECT_KNOWLEDGE_DOCUMENT.md` first if you don't already know the feature's architecture — this skill assumes that context and does not re-derive it.

---

## 0. Critical current-state note — there is no unit-test project in this repo today

Per `PROJECT_KNOWLEDGE_DOCUMENT.md` §20:

- `backend/Tests/CFR.Acutis.Tests` is **not** a unit-test project — it's a small NUnit suite that makes real `HttpClient` calls against a running `CFR.Gateway`/`CFR.Acutis` instance (API-level negative tests for `UserRoles` only). It has no mocks and no isolated class-under-test.
- `backend/Automation/Automation.Acutis` + `Automation.Framework` is Selenium/Reqnroll **browser** automation (BDD), not unit tests.
- **Neither frontend project (`frontend/CFR`, `frontend/CFR_Admin`) has any test runner configured** — no Vitest/Jest in either `package.json`, no test files anywhere in either `src/` tree.

**Consequence for you**: when this skill is invoked, you are very likely creating the *first* unit test(s) for the class/module in question, and possibly the first unit-test project for that layer entirely. Say so explicitly in your output (don't imply you're "adding to an existing suite" when none exists), and follow the scaffolding steps in §2/§5 before writing the actual test.

---

## 1. Framework choice — match what's already in the repo, don't introduce a second stack

| Layer | Framework to use | Why |
|---|---|---|
| Backend (.NET) | **NUnit** (`[TestFixture]`/`[Test]`/`[TestCase]`) + **Moq** for mocking | NUnit is already the runner used by both `CFR.Acutis.Tests` and `Automation.Acutis` (`Microsoft.NET.Test.Sdk`, `NUnit`, `NUnit3TestAdapter` in both `.csproj`s) — introducing xUnit alongside it would fragment the toolchain for no benefit. Moq is not currently referenced anywhere in the repo (no mocking library was found), so it must be added as a new package reference to the new unit-test project — confirm with the team if they'd rather standardize on NSubstitute instead, but default to Moq (the most common .NET choice) absent a stated preference. |
| Frontend (React/TS) | **Vitest** + **React Testing Library** (`@testing-library/react`) for anything that needs to render; plain Vitest for pure functions | Vitest is the natural fit because both `CFR` and `CFR_Admin` already build on **Vite** (`vite.config.ts` in both) — it reuses the existing Vite config/transform pipeline instead of requiring a second bundler config the way Jest would. Neither app has this configured yet; adding it (dev dependency + `vitest.config.ts` or a `test` block in `vite.config.ts` + a `"test": "vitest run"` script in `package.json`) is a one-time prerequisite step, not optional. |

Do not use Selenium/Reqnroll or `HttpClient`-against-a-live-host for anything this skill produces — if a test needs a browser or a live network call, it belongs in `test-case-design`'s BDD/API scope, not here.

---

## 2. Which layers are actually unit-testable in this architecture — and which aren't

This repo's layering (`PROJECT_KNOWLEDGE_DOCUMENT.md` §5/§9) is `Controller -> Service -> Repository -> Stored Procedure`. Map your test target correctly:

| Layer | Unit-testable? | How |
|---|---|---|
| **Controller** (`{Feature}Controller`) | **Skip — not worth unit testing.** Every action is a mandated one-line `return ApiResultArgs(await service.XAsync(...), APIHttpType.X);` (backend coding standard). There is no branching logic to exercise; a unit test here would just re-assert the mock returns what you told it to return. If asked to "test the controller," redirect to testing the **Service** method it calls, or to an API-level test (`test-case-design` skill) if the goal is to verify routing/HTTP status end-to-end. |
| **Service** (`I{Feature}Service`/`{Feature}Service`) | **Primary unit-test target.** This is the only layer with business logic, try/catch, and `MSResultArgs` shaping — exactly what a unit test should isolate. Mock `I{Feature}Repository`, `ILogger<{Feature}Service>` (or however `AppLogger` is wired), and `ICurrentUserService` where used. See §3. |
| **Repository** (`I{Feature}Repository`/`{Feature}Repository`) | **Testable only for parameter-shaping correctness**, not for what the stored procedure actually does. Mock `IDapperHandler` and assert the `DynamicParameters` built (correct `ActionId` value, correct audit-column values, correct types) — see §4. Do **not** attempt to assert on query results; a repository unit test with a mocked `IDapperHandler` can only prove "we called Dapper with the parameters we intended," never "the SP returns the right rows." |
| **Stored procedures** | **Out of scope for unit tests entirely.** There is no DB-integration-test layer in this repo beyond `Automation.Framework/DbSupport` (which only seeds/reads password-reset tokens for the Selenium suite, gated to `Development`). If SP logic needs verification, that's a `test-case-design`-scope integration/API test against a real dev database, not a unit test. |
| **Pure helper/utility/validator functions** (both frontends' `validator/*.ts`, `utils/*Helpers.ts`, backend static helpers like `ResultArgsHandler`, `EnumCommand`, `EncryptionHelper`) | **Ideal unit-test target — highest ROI, zero setup.** No mocking needed for most of these; they're plain functions/static methods. See §5.6 and §7. |
| **React components** | Testable with React Testing Library + mocked HTTP layer, but lower priority than validators/helpers here — see §6 before attempting one, since the two apps mock HTTP differently. |

---

## 3. Backend Service-layer unit tests

### 3.1 Project layout
Create one test project per Service project, mirroring the source structure (matches this repo's existing pattern of one project per bounded concern):
```
backend/Tests/CFR.AcutisService.Tests/CFR.AcutisService.Tests.csproj
backend/Tests/CFR.PortalService.Tests/CFR.PortalService.Tests.csproj
```
Reference `Microsoft.NET.Test.Sdk`, `NUnit`, `NUnit3TestAdapter`, `Moq`, and a `ProjectReference` to the Service project under test (and whatever Infrastructure/Common projects its interfaces live in). Add the new project(s) to `backend/CatholicSolution.slnx` under the existing `Tests` folder alongside `CFR.Acutis.Tests`.

### 3.2 Naming
- Test class: `{Feature}ServiceTests` (e.g. `AccessRequestServiceTests`, `CFRLaunchServiceTests`).
- Test method: `{MethodUnderTest}_{Scenario}_{ExpectedResult}` — e.g. `LaunchProductAsync_WhenProductNotAssignedToUser_ReturnsFailedWithProductNotAssignedMessage`.
- Structure every test body as **Arrange / Act / Assert** with those comments — match the explicit-region style this codebase already uses in production code (`#region` blocks) by keeping each phase visually separated.

### 3.3 What to mock and what to assert
For a Service class built the standard way (constructor takes `I{Feature}Repository repository, ILogger<{Feature}Service> logger` or equivalent, per `backend-api-standards` skill):

- **Mock** `I{Feature}Repository` (Moq `Mock<I{Feature}Repository>`) — never a real `IDapperHandler`/DB connection.
- **Mock** `ILogger<T>` (or whatever `AppLogger` wraps) — verify it's called with the expected `SerilogErrorMessages.*` template on the exception path, but don't assert on exact log-message text unless that's the point of the test.
- **Mock** `ICurrentUserService` when the method reads `UserId`/role for audit stamping or entitlement checks.
- **Assert on the returned `MSResultArgs`/`MSResultArgs<T>`**: `StatusCode` (compare against the exact `ErrorCodes.*` constant, not a magic number), `StatusMessage`, and `ResultData` shape/values. This is the single most important assertion category — it's exactly the contract the Controller/frontend depend on.

### 3.4 Cases every Service method's unit-test suite should include
1. **Happy path** — repository mock returns a valid success result; assert `ErrorCodes.Success`/`Created`/`Updated` as appropriate and that `ResultData` is passed through/mapped correctly.
2. **Repository returns "no data"** — assert the Service maps this to `ErrorCodes.NoRecordFound` (or the feature-specific equivalent) rather than silently returning `Success` with an empty payload.
3. **Repository throws** — assert the Service catches it, logs via the expected `SerilogErrorMessages` template (verify the logger mock was invoked), and returns `ErrorCodes.InternalServerError`/`ErrorMessages.InternalServerError` — **never** let an exception escape the Service layer in a test (if it does, that's a real bug, since Controllers have no try/catch of their own).
4. **Every documented sentinel-return-code branch** — for services with numeric SP-sentinel mapping (confirmed examples: `AccessRequestService.SaveAccessRequestAsync` mapping `-99/-98/-97/-96/-93`; `CFRLaunchService.LaunchProductAsync`/`ExchangeTokenAsync` mapping `-2..-6`), write one test per documented code, mocking the repository to return that exact sentinel value and asserting the specific `ErrorCodes`/message produced. **Read the actual current mapping in the Service source file before writing these** — do not guess the codes or their meaning from this skill file; they were captured in the knowledge doc as of one analysis pass and could have shifted.
5. **Audit-stamping delegation** — where the Service (or the Repository it calls) is responsible for stamping `InsertedBy`/`UpdatedBy` from `ICurrentUserService.UserId`, assert that value flows from the mocked `ICurrentUserService`, and is **not** taken from whatever was in the input DTO (this is a named rule in the `backend-api-standards` skill and a stated risk in the knowledge doc's audit-integrity section — a client-supplied value must never win).
6. **Boundary/validation logic that lives in the Service** (not the DB) — e.g. required-field checks the Service performs before calling the repository at all; assert the repository mock is **never called** (`repositoryMock.Verify(..., Times.Never())`) when the Service should short-circuit on invalid input.

### 3.5 Example skeleton
```csharp
[TestFixture]
public class AccessRequestServiceTests
{
    private Mock<IAccessRequestRepository> _repositoryMock;
    private Mock<IEmailTemplatesRepository> _emailTemplatesRepositoryMock;
    private Mock<ISMTPMailService> _mailServiceMock;
    private Mock<ILogger<AccessRequestService>> _loggerMock;
    private AccessRequestService _sut;

    [SetUp]
    public void SetUp()
    {
        _repositoryMock = new Mock<IAccessRequestRepository>();
        _emailTemplatesRepositoryMock = new Mock<IEmailTemplatesRepository>();
        _mailServiceMock = new Mock<ISMTPMailService>();
        _loggerMock = new Mock<ILogger<AccessRequestService>>();
        _sut = new AccessRequestService(_repositoryMock.Object, _emailTemplatesRepositoryMock.Object,
            _mailServiceMock.Object, _loggerMock.Object);
    }

    [Test]
    public async Task SaveAccessRequestAsync_WhenRepositoryReturnsDuplicateSentinel_ReturnsConflict()
    {
        // Arrange
        _repositoryMock.Setup(r => r.SaveAccessRequestAsync(It.IsAny<AccessRequestInput>()))
            .ReturnsAsync(-99); // confirm this is still the documented "duplicate" sentinel before relying on it

        // Act
        var result = await _sut.SaveAccessRequestAsync(new AccessRequestInput { /* valid minimal payload */ });

        // Assert
        Assert.That(result.StatusCode, Is.EqualTo(ErrorCodes.Conflict));
    }

    [Test]
    public async Task SaveAccessRequestAsync_OnSuccess_DoesNotFailWhenNotificationEmailThrows()
    {
        // Arrange — the Service is documented to catch/log email failures separately
        // without failing the parent save (PROJECT_KNOWLEDGE_DOCUMENT.md §3.5 / §13)
        _repositoryMock.Setup(r => r.SaveAccessRequestAsync(It.IsAny<AccessRequestInput>())).ReturnsAsync(1);
        _mailServiceMock.Setup(m => m.SendMailAsync(It.IsAny<SMTPMailConfig>())).ThrowsAsync(new Exception("SMTP down"));

        // Act
        var result = await _sut.SaveAccessRequestAsync(new AccessRequestInput { /* valid minimal payload */ });

        // Assert
        Assert.That(result.StatusCode, Is.EqualTo(ErrorCodes.Created));
    }
}
```
Treat the constructor signature, method names, and exact sentinel values above as **illustrative** — open the real `AccessRequestService.cs` (or whichever Service you're testing) and match its actual constructor/dependencies/method signatures exactly before writing real code. Do not invent a signature to make the example compile.

---

## 4. Backend Repository-layer unit tests (parameter-shaping only)

Only write these when there's a real risk of parameter-shaping bugs worth catching in isolation (e.g. a complex repository building many `DynamicParameters`, or one that stamps audit columns). Mock `IDapperHandler`:

```csharp
[Test]
public async Task SaveUserAsync_StampsInsertedByFromCurrentUser_NotFromInputDto()
{
    // Arrange
    DynamicParameters capturedParams = null;
    _dapperHandlerMock
        .Setup(d => d.ExecuteAsync(StoredProc.Administration.Acutis_Users, It.IsAny<DynamicParameters>()))
        .Callback<string, DynamicParameters>((_, p) => capturedParams = p)
        .ReturnsAsync(1);
    _currentUserServiceMock.Setup(c => c.UserId).Returns(42L);

    var input = new UsersInput { InsertedBy = 999 /* attacker-supplied, must be ignored */ };

    // Act
    await _sut.SaveUserAsync(input);

    // Assert
    Assert.That(capturedParams.Get<long>(SQLParams.AdministrationParams.InsertedBy), Is.EqualTo(42L));
}
```
This is the single highest-value repository-level unit test in the whole codebase given the audit-integrity rule in the `backend-api-standards` skill — prioritize it for any repository method that writes data, even before broader coverage elsewhere.

---

## 5. Frontend unit tests — setup prerequisite

Before writing any frontend unit test, confirm (or add) the harness — do not write a test file against a project with no runner configured and call it done:

1. Add `vitest` (+ `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` if testing components) as devDependencies in the target project's `package.json` (`frontend/CFR` or `frontend/CFR_Admin` — remember: **fully independent projects**, add to each separately if both need it, per `frontend/CLAUDE.md`'s no-shared-workspace rule).
2. Add a `"test": "vitest run"` script (and optionally `"test:watch": "vitest"`).
3. Vitest can typically reuse the existing `vite.config.ts` (add a `test: {...}` block with `environment: 'jsdom'` if any component tests are added) rather than requiring a separate config file — keep it in the same file the project already maintains.
4. State explicitly in your output that you added this scaffolding and why (first-time setup), so it isn't mistaken for a pre-existing convention.

---

## 6. Frontend unit tests — HTTP-layer mocking differs per app, don't mix them up

| App | HTTP mechanism | How to mock in a unit test |
|---|---|---|
| `CFR` | Hand-rolled `fetch` wrappers (`src/app/config/appAcutisClient.ts`, `appPortalClient.ts`) | Mock global `fetch` (`vi.stubGlobal('fetch', vi.fn())` or `vi.spyOn(global, 'fetch')`), returning a `Response`-shaped object matching the app's `{statusCode, statusMessage, resultData}` envelope tolerance logic |
| `CFR_Admin` | `axios` via a shared `AxiosInstance` (`src/app/config/AxiosInstance.ts`) with request/response interceptors | Mock the module (`vi.mock('@app/config/AxiosInstance')`) rather than global `fetch` — the interceptor logic (bearer-token attach, 401 redirect) is itself a candidate for a **separate, focused unit test** that mocks `localStorage` and asserts the interceptor's redirect/clear behavior on a 401 response |

Never let a frontend unit test make a real network call — if a test can't run offline, it doesn't belong in this skill's scope (route it to `test-case-design`'s BDD/API scope instead, where hitting a real/dev backend is expected).

---

## 7. Frontend — highest-value pure-function targets (start here)

These require no rendering, no HTTP mocking, and directly cover logic the knowledge doc flags as currently untested:

- **Validators** (`src/modules/*/validator/*.ts` in both apps) — e.g. `validatePublicAccessRequest`/`validateSaveAccessRequest` (`CFR/src/modules/requests/validator/AccessRequestValidator.ts`), `validateLaunchProduct` (`CFR/src/modules/productlaunch/validator/ProductLaunchValidator.ts`), and every `react-hook-form` `rules`/`defaultValues` module in `CFR_Admin` (`OrganizationValidator.ts`, `UsersValidator.ts`, etc.). These are pure functions/objects — trivially testable, currently at 0% coverage.
- **Data-shaping helpers** — `productsHelpers.ts`'s `normalizeHubSection` (`CFR/src/modules/products/utils/productsHelpers.ts`, explicitly documented in-code as reconciling two different backend response contracts — exactly the kind of logic that silently breaks and should be pinned down with tests), `accessRequestHelpers.ts`'s `toSaveAccessRequestPayload`/`toPublicAccessRequestPayload`.
- **Access-right derivation logic** (`CFR_Admin/src/shared/auth/hooks/useFeatureAccessLevel.ts`'s mapping of the raw `AccessRight` int — 0=Denied/1=Access/2=ReadOnly — to a `FeatureAccessLevel`) and `menuHelpers.ts`'s `isAdminRouteAllowed`/`collectMenuRoutes` — this is the **only actual authorization enforcement currently working anywhere in the platform** (per the knowledge doc's §15 finding that backend `[Authorize]` is neutralized), which makes it disproportionately important to pin down with unit tests despite being "just frontend" logic.
- **`centralAuth.ts`'s pure helpers** — `getSafeReturnUrl`/`getRequestedClientId` (open-redirect guards) and `canRedirectToExternalIdentityProvider` — security-relevant pure logic, easy to unit test by constructing origin strings and asserting accept/reject.

For each, follow the same Arrange/Act/Assert structure and naming (`functionName_scenario_expectedResult`) as the backend convention in §3.2, using `describe`/`it` (Vitest) instead of `[TestFixture]`/`[Test]`.

```ts
// src/modules/requests/validator/AccessRequestValidator.test.ts
import { describe, it, expect } from 'vitest';
import { validatePublicAccessRequest } from './AccessRequestValidator';

describe('validatePublicAccessRequest', () => {
  it('returns a zip error for a 4-digit zip code', () => {
    const errors = validatePublicAccessRequest({ /* ...valid fields..., */ zip: '1234' });
    expect(errors).toContain(/* the actual message the function returns — read the source first */);
  });

  it('requires at least one selected application', () => {
    const errors = validatePublicAccessRequest({ /* ...valid fields..., */ products: [] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
```
Co-locate the test file next to the module it tests (`{name}.test.ts` beside `{name}.ts`), matching the feature-folder convention in the `frontend-standards` skill rather than a separate top-level `__tests__` tree.

---

## 8. What NOT to unit test here

- Don't re-implement the BDD suite's job (full-screen click-through workflows) — that's Selenium/Reqnroll's job, already covered for `CFR_Admin`.
- Don't spin up a real SQL Server connection, a real SMTP server, or a real browser inside a "unit" test — any of these makes it an integration test, which belongs in `test-case-design` scope with the existing gating patterns (`ApiTestEnvironment`, `TestEnvironmentContext`).
- Don't assert on stored-procedure behavior via a repository unit test — a mocked `IDapperHandler` can only prove what parameters were sent, never what the SP does with them.
- Don't test the Controller layer's one-line pass-through bodies — there's no logic there to catch a regression in.

---

## 9. Output discipline

- Before writing a test against a real class, **open and read that class's actual current source** (constructor signature, dependency types, method names, exact sentinel codes/messages) — every example in this skill is illustrative, not a literal signature to copy.
- If the target class/function has no existing unit-test project for its layer, say so and scaffold it (§3.1/§5) rather than silently assuming one exists.
- Cite the file path of both the class under test and the new test file in your response.
- Prefer covering the items in §3.4(4), §4, and §7 first when given an open-ended "add some unit tests" request — they map directly to confirmed gaps/risks in `PROJECT_KNOWLEDGE_DOCUMENT.md` rather than arbitrary coverage-percentage padding.
