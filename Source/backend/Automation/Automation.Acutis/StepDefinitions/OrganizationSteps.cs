using Automation.Framework.EnvironmentSupport;
using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Organizations;

using NUnit.Framework;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class OrganizationSteps : Steps
    {
        private readonly OrganizationsListPage _organizationsListPage;
        private readonly OrganizationAddPage _organizationAddPage;
        private readonly OrganizationDetailPage _organizationDetailPage;
        private readonly OrganizationMemberDetailPage _organizationMemberDetailPage;
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        // The name of the organization this scenario created, tracked so later steps can find
        // and act on that exact record rather than "whatever the first row happens to be" - this
        // matters once more than one test-created organization can be present in the list.
        private string _currentOrgName = string.Empty;

        // Whether the product row this scenario toggled was active (Deactivate shown) or
        // inactive (Activate shown) *before* it acted on it, so the row can be put back exactly
        // as it was found.
        private bool _productWasActiveBeforeToggle;
        private bool _productRowExisted;

        public OrganizationSteps(
            OrganizationsListPage organizationsListPage,
            OrganizationAddPage organizationAddPage,
            OrganizationDetailPage organizationDetailPage,
            OrganizationMemberDetailPage organizationMemberDetailPage)
        {
            _organizationsListPage = organizationsListPage;
            _organizationAddPage = organizationAddPage;
            _organizationDetailPage = organizationDetailPage;
            _organizationMemberDetailPage = organizationMemberDetailPage;
        }

        private OrganizationData OrgData => _testData.Organization ?? new OrganizationData();

        // --- Environment safety ---

        [Given(@"Mutating scenarios are permitted for Organization in this environment")]
        public void GivenMutatingScenariosArePermittedForOrganizationInThisEnvironment()
        {
            // Ends the scenario as Ignored here - before signing in or touching anything - when
            // the resolved environment/configuration does not permit mutations. Creating an
            // organization, changing its status, and toggling a product's activation all write
            // real data, even though every one of them is either a reversible toggle or a
            // uniquely-named, harmless synthetic record (there is no "delete organization" action
            // in this app at all - see Acutis_Organization_CRUD - so cleanup can only ever
            // soft-transition status, never truly remove what was created).
            _env.RequireMutationsAllowedOrSkip("Organization: create/edit/status-change and product activation toggle");
        }

        // --- Navigation ---

        // Follows "When The Dashboard should be open" but is itself written as "Then" in every
        // scenario here (a deliberate "and now verify/act" beat after the dashboard check), so
        // both attributes are needed.
        [When(@"I click on Organizations menu")]
        [Then(@"I click on Organizations menu")]
        public void WhenIClickOnOrganizationsMenu()
        {
            _organizationsListPage.ClickByScript(Automation.Framework.ViperPages.ViperCommonVariable.XPath_Organizations.OrganizationsMenu);
        }

        [Then(@"Organizations list page should be opened")]
        public void ThenOrganizationsListPageShouldBeOpened()
        {
            Assert.That(_organizationsListPage.IsPageOpened(), Is.True, "Organizations list page did not open.");
        }

        // --- Search (safe, read-only) ---

        [When(@"I search the organizations list for the first row's own name")]
        public void WhenISearchTheOrganizationsListForTheFirstRowSOwnName()
        {
            string name = _organizationsListPage.ReadFirstRowOrganizationName();
            Assert.That(name, Is.Not.Empty, "The organizations list has no rows to search for - nothing to verify search against.");
            _currentOrgName = name;
            _organizationsListPage.Search(name);
        }

        [Then(@"The search should leave that row in the list")]
        public void ThenTheSearchShouldLeaveThatRowInTheList()
        {
            Assert.That(_organizationsListPage.WaitForRow(_currentOrgName), Is.True, $"Searching for '{_currentOrgName}' did not leave its own row in the list.");
        }

        [Then(@"I clear the organizations search")]
        public void ThenIClearTheOrganizationsSearch()
        {
            _organizationsListPage.ClearSearch();
        }

        // --- Add organization ---

        [When(@"I click Add Organization")]
        public void WhenIClickAddOrganization()
        {
            _organizationsListPage.ClickAddOrganization();
        }

        [Then(@"Fill in only the organization name")]
        public void ThenFillInOnlyTheOrganizationName()
        {
            _organizationAddPage.FillOrganizationName("Test Org " + _env.RunId);
        }

        [Then(@"Fill in the new organization details")]
        public void ThenFillInTheNewOrganizationDetails()
        {
            _currentOrgName = "Test Org " + _env.RunId;
            _organizationAddPage.FillOrganizationDetails(
                orgName: _currentOrgName,
                orgType: OrgData.OrgType ?? "Parish",
                website: OrgData.Website ?? "www.testorg.com",
                status: OrgData.Status ?? "Active",
                contactPerson: OrgData.ContactPerson ?? "John Doe",
                contactPhone: OrgData.ContactPhone ?? "1234567890",
                contactEmail: OrgData.ContactEmail ?? "test@testorg.com",
                address: OrgData.Address ?? "123 Test St",
                city: OrgData.City ?? "Testville",
                state: OrgData.State ?? "CA",
                zip: OrgData.Zip ?? "90210"
            );
        }

        // Used after both a "Then Fill in..." step (scenario 003) and a "When I fill in
        // invalid..." step (scenario 002) - "And" inherits whichever of those precedes it, so
        // this needs both attributes to match in either context.
        [When(@"I click Save organization")]
        [Then(@"I click Save organization")]
        public void ThenIClickSaveOrganization()
        {
            _organizationAddPage.ClickSave();
        }

        [When(@"I cancel adding the organization")]
        public void WhenICancelAddOrganization()
        {
            _organizationAddPage.ClickCancel();
        }

        [When(@"I attempt to save the organization form with an empty name")]
        public void WhenIAttemptToSaveTheOrganizationFormWithAnEmptyName()
        {
            _organizationAddPage.ClickSave();
        }

        [Then(@"The organization name field should show a required-field error")]
        public void ThenTheOrganizationNameFieldShouldShowARequiredFieldError()
        {
            Assert.That(
                _organizationAddPage.ReadOrgNameError(),
                Does.Contain("required"),
                "Submitting the Add Organization form with an empty name did not show a required-field error.");
        }

        [When(@"I fill in invalid website, phone, email, and ZIP values")]
        public void WhenIFillInInvalidWebsitePhoneEmailAndZIPValues()
        {
            _organizationAddPage.FillInvalidFormatValues("Test Org Format Check " + _env.RunId);
        }

        [Then(@"The organization form should show format validation errors")]
        public void ThenTheOrganizationFormShouldShowFormatValidationErrors()
        {
            Assert.That(_organizationAddPage.ReadWebsiteError(), Is.Not.Empty, "An invalid website value did not show a format error.");
            Assert.That(_organizationAddPage.ReadContactPhoneError(), Is.Not.Empty, "An invalid phone value did not show a format error.");
            Assert.That(_organizationAddPage.ReadContactEmailError(), Is.Not.Empty, "An invalid email value did not show a format error.");
            Assert.That(_organizationAddPage.ReadZipError(), Is.Not.Empty, "An invalid ZIP value did not show a format error.");
        }

        [Then(@"the new organization should be in the list")]
        public void ThenTheNewOrganizationShouldBeInTheList()
        {
            Assert.That(_organizationsListPage.WaitForRow(_currentOrgName), Is.True, $"The newly created organization '{_currentOrgName}' is not in the list.");
        }

        [When(@"I view the new organization")]
        public void WhenIViewTheNewOrganization()
        {
            _organizationsListPage.ViewOrganization(_currentOrgName);
        }

        // --- View / detail tabs ---

        [When(@"I view the first organization in the list")]
        public void WhenIViewTheFirstOrganizationInTheList()
        {
            _organizationsListPage.ViewFirstOrganization();
        }

        [Then(@"Organization details tab should be visible")]
        public void ThenOrganizationDetailsTabShouldBeVisible()
        {
            Assert.That(_organizationDetailPage.IsDetailsTabDisplayed(), Is.True, "Details tab is not visible.");
        }

        [When(@"I click on Members tab")]
        public void WhenIClickOnMembersTab()
        {
            _organizationDetailPage.ClickMembersTab();
        }

        [Then(@"Organization members list should be visible")]
        public void ThenOrganizationMembersListShouldBeVisible()
        {
            Assert.That(_organizationDetailPage.IsMembersListDisplayed(), Is.True, "Members list is not visible.");
        }

        [Then(@"I view the first member's detail page if one exists")]
        public void ThenIViewTheFirstMemberSDetailPageIfOneExists()
        {
            // Best-effort, read-only check: there is no way to create a member via the UI (no
            // "link a user" action exists on Acutis_Organization_CRUD - membership is only ever
            // created by the Access Request approval flow, a different feature), so this only
            // exercises the View -> member detail page path when the organization already
            // happens to have at least one linked member, and is a no-op otherwise.
            if (!_organizationDetailPage.HasAnyMember())
            {
                return;
            }

            _organizationDetailPage.ViewFirstMember();
            Assert.That(_organizationMemberDetailPage.IsLoaded(), Is.True, "The member detail page did not load from the Users tab's View action.");
            Assert.That(_organizationMemberDetailPage.IsAppAccessCardDisplayed(), Is.True, "The Effective Application Access card is not visible on the member detail page.");
            _organizationMemberDetailPage.ClickBackToOrganization();
            _organizationDetailPage.ClickMembersTab();
        }

        // --- Edit form (opened from list page Edit button or the Profile tab's own Edit button) ---

        [When(@"I click Edit on the Profile tab")]
        public void WhenIClickEditOnProfileTab()
        {
            _organizationDetailPage.ClickProfileEdit();
        }

        [Then(@"The organization edit form should be displayed")]
        public void ThenTheEditFormShouldBeDisplayed()
        {
            Assert.That(_organizationDetailPage.IsEditFormDisplayed(), Is.True, "Organization edit form did not open.");
        }

        [When(@"I click Cancel on the organization edit form")]
        public void WhenIClickCancelOnEditForm()
        {
            _organizationDetailPage.ClickEditCancel();
        }

        [Then(@"I update the editable profile fields and save")]
        public void ThenIUpdateTheEditableProfileFieldsAndSave()
        {
            string suffix = " Updated " + _env.RunId;
            _organizationDetailPage.FillEditableProfileFields(
                website: "www.testorg-updated.com",
                address: "456 Updated Ave" + suffix,
                city: "Updatedville",
                zip: "90211");
            _organizationDetailPage.ClickEditSave();
        }

        [Then(@"The organization profile should show the updated details")]
        public void ThenTheOrganizationProfileShouldShowTheUpdatedDetails()
        {
            Assert.That(_organizationDetailPage.IsEditFormDisplayed(), Is.False, "The edit form was still showing after Save - the profile did not return to view mode.");
            string toast = _organizationDetailPage.ReadToast();
            Assert.That(toast, Does.Not.Contain("Failed"), $"Saving the organization profile reported a failure: '{toast}'.");
        }

        // --- Tab steps ---

        [When(@"I click on Products tab")]
        public void WhenIClickOnProductsTab()
        {
            _organizationDetailPage.ClickProductsTab();
        }

        [Then(@"Organization products panel should be visible")]
        public void ThenProductsPanelShouldBeVisible()
        {
            Assert.That(_organizationDetailPage.IsProductsPanelDisplayed(), Is.True, "Products panel is not visible.");
        }

        [When(@"I click on Licenses tab")]
        public void WhenIClickOnLicensesTab()
        {
            _organizationDetailPage.ClickLicensesTab();
        }

        [Then(@"Organization licenses panel should be visible")]
        public void ThenLicensesPanelShouldBeVisible()
        {
            Assert.That(_organizationDetailPage.IsLicensesPanelDisplayed(), Is.True, "Licenses panel is not visible.");
        }

        [When(@"I click on Requests tab")]
        public void WhenIClickOnRequestsTab()
        {
            _organizationDetailPage.ClickRequestsTab();
        }

        [Then(@"Organization requests panel should be visible")]
        public void ThenRequestsPanelShouldBeVisible()
        {
            Assert.That(_organizationDetailPage.IsRequestsPanelDisplayed(), Is.True, "Requests panel is not visible.");
        }

        // --- Product activation toggle (Products tab) ---
        //
        // There is no "assign a brand-new product" action in the current frontend, so this only
        // exercises the Activate/Deactivate toggle when the organization already has at least one
        // product row - a freshly created organization has none, and there is no way via the UI
        // to give it one. See OrganizationProductsPanel.tsx / Acutis_Organization_CRUD ActionId 7
        // (GetAssignableProducts) - implemented on the backend, never wired to any button.

        [When(@"I toggle the first product's activation state if one exists")]
        public void WhenIToggleTheFirstProductSActivationStateIfOneExists()
        {
            _productRowExisted = _organizationDetailPage.HasAnyProduct();
            if (!_productRowExisted)
            {
                return;
            }

            _productWasActiveBeforeToggle = _organizationDetailPage.IsFirstProductDeactivatable();

            if (_productWasActiveBeforeToggle)
            {
                _organizationDetailPage.ClickDeactivateFirstProduct();
                Assert.That(_organizationDetailPage.WaitForConfirmDialog("Deactivate this app"), Is.True, "The Deactivate confirm dialog did not open.");
                _organizationDetailPage.ConfirmDialogAction("Deactivate");
            }
            else
            {
                // Activate has no confirm dialog of its own - see OrganizationProductsPanel.tsx.
                _organizationDetailPage.ClickActivateFirstProduct();
            }
        }

        [Then(@"The product's activation state should be confirmed and reverted back to its original state")]
        public void ThenTheProductSActivationStateShouldBeConfirmedAndRevertedBackToItsOriginalState()
        {
            if (!_productRowExisted)
            {
                Assert.Ignore("Skipped - this organization has no product rows to activate or deactivate (there is no 'assign a new product' action in the current UI, so this can only be exercised on an organization that already has at least one).");
                return;
            }

            string firstToast = _organizationDetailPage.ReadToast();
            Assert.That(firstToast, Does.Not.Contain("Failed"), $"Toggling the product's activation reported a failure: '{firstToast}'.");

            // Revert back to exactly how the row was found.
            if (_productWasActiveBeforeToggle)
            {
                Assert.That(_organizationDetailPage.IsFirstProductActivatable(), Is.True, "The product did not show as inactive after being deactivated.");
                _organizationDetailPage.ClickActivateFirstProduct();
            }
            else
            {
                Assert.That(_organizationDetailPage.IsFirstProductDeactivatable(), Is.True, "The product did not show as active after being activated.");
                _organizationDetailPage.ClickDeactivateFirstProduct();
                Assert.That(_organizationDetailPage.WaitForConfirmDialog("Deactivate this app"), Is.True, "The Deactivate confirm dialog did not open while reverting.");
                _organizationDetailPage.ConfirmDialogAction("Deactivate");
            }

            string revertToast = _organizationDetailPage.ReadToast();
            Assert.That(revertToast, Does.Not.Contain("Failed"), $"Reverting the product's activation reported a failure: '{revertToast}'.");
        }

        // --- Change Status (list page) ---

        [When(@"I select Inactive status")]
        public void WhenISelectInactiveStatus()
        {
            _organizationsListPage.SelectInactiveStatus();
        }

        [When(@"I confirm the status change")]
        public void WhenIConfirmChangeStatus()
        {
            _organizationsListPage.ConfirmChangeStatus();
        }

        [When(@"I click Change Status on the first organization")]
        public void WhenIClickChangeStatusOnFirstOrganization()
        {
            _organizationsListPage.ClickChangeStatusOnFirstRow();
        }

        [When(@"I click Change Status on the new organization")]
        public void WhenIClickChangeStatusOnTheNewOrganization()
        {
            _organizationsListPage.ClickChangeStatus(_currentOrgName);
        }

        [Then(@"Change Status modal should open")]
        public void ThenChangeStatusModalShouldOpen()
        {
            Assert.That(_organizationsListPage.IsElementVisible(
                Automation.Framework.ViperPages.ViperCommonVariable.XPath_Organizations.ChangeStatusModal, 5),
                Is.True, "Change Status modal did not open.");
        }

        [When(@"I cancel the Change Status dialog")]
        public void WhenICancelChangeStatus()
        {
            _organizationsListPage.CancelChangeStatus();
        }

        [Then(@"the new organization should show Inactive status")]
        public void ThenTheNewOrganizationShouldShowInactiveStatus()
        {
            Assert.That(_organizationsListPage.RowShows(_currentOrgName, "Inactive"), Is.True, $"'{_currentOrgName}' did not show as Inactive in the list after the status change.");
        }

        // --- Edit steps (list page action icon) ---

        [When(@"I click Edit on the first organization")]
        public void WhenIClickEditOnFirstOrganization()
        {
            _organizationsListPage.EditFirstOrganization();
        }

        // --- Back to Organizations ---

        [When(@"I click Back to Organizations")]
        public void WhenIClickBackToOrganizations()
        {
            _organizationDetailPage.ClickBackToOrganizations();
        }

        // --- Full-process helpers (used by TestAllProcess.feature) ---

        public void RunOrganizationSafeChecks()
        {
            WhenIClickOnOrganizationsMenu();
            ThenOrganizationsListPageShouldBeOpened();

            WhenISearchTheOrganizationsListForTheFirstRowSOwnName();
            ThenTheSearchShouldLeaveThatRowInTheList();
            ThenIClearTheOrganizationsSearch();

            WhenIViewTheFirstOrganizationInTheList();
            ThenOrganizationDetailsTabShouldBeVisible();

            WhenIClickOnMembersTab();
            ThenOrganizationMembersListShouldBeVisible();
            ThenIViewTheFirstMemberSDetailPageIfOneExists();

            WhenIClickOnProductsTab();
            ThenProductsPanelShouldBeVisible();

            WhenIClickOnLicensesTab();
            ThenLicensesPanelShouldBeVisible();

            WhenIClickOnRequestsTab();
            ThenRequestsPanelShouldBeVisible();

            WhenIClickBackToOrganizations();
            ThenOrganizationsListPageShouldBeOpened();
        }

        public void RunOrganizationAddValidationChecks()
        {
            WhenIClickOnOrganizationsMenu();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickAddOrganization();
            ThenFillInOnlyTheOrganizationName();
            WhenICancelAddOrganization();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickAddOrganization();
            WhenIAttemptToSaveTheOrganizationFormWithAnEmptyName();
            ThenTheOrganizationNameFieldShouldShowARequiredFieldError();
            WhenIFillInInvalidWebsitePhoneEmailAndZIPValues();
            ThenIClickSaveOrganization();
            ThenTheOrganizationFormShouldShowFormatValidationErrors();
            WhenICancelAddOrganization();
            ThenOrganizationsListPageShouldBeOpened();
        }

        public void RunOrganizationMutatingLifecycleProcess()
        {
            GivenMutatingScenariosArePermittedForOrganizationInThisEnvironment();

            WhenIClickOnOrganizationsMenu();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickAddOrganization();
            ThenFillInTheNewOrganizationDetails();
            ThenIClickSaveOrganization();
            ThenOrganizationsListPageShouldBeOpened();
            ThenTheNewOrganizationShouldBeInTheList();

            WhenIViewTheNewOrganization();
            ThenOrganizationDetailsTabShouldBeVisible();
            WhenIClickEditOnProfileTab();
            ThenTheEditFormShouldBeDisplayed();
            ThenIUpdateTheEditableProfileFieldsAndSave();
            ThenTheOrganizationProfileShouldShowTheUpdatedDetails();
            WhenIClickBackToOrganizations();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickChangeStatusOnTheNewOrganization();
            ThenChangeStatusModalShouldOpen();
            WhenICancelChangeStatus();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickChangeStatusOnTheNewOrganization();
            ThenChangeStatusModalShouldOpen();
            WhenISelectInactiveStatus();
            WhenIConfirmChangeStatus();
            ThenOrganizationsListPageShouldBeOpened();
            ThenTheNewOrganizationShouldShowInactiveStatus();
        }

        public void RunOrganizationProductToggleProcess()
        {
            GivenMutatingScenariosArePermittedForOrganizationInThisEnvironment();

            WhenIClickOnOrganizationsMenu();
            ThenOrganizationsListPageShouldBeOpened();
            WhenIViewTheFirstOrganizationInTheList();
            WhenIClickOnProductsTab();
            ThenProductsPanelShouldBeVisible();
            WhenIToggleTheFirstProductSActivationStateIfOneExists();
            ThenTheProductSActivationStateShouldBeConfirmedAndRevertedBackToItsOriginalState();
        }
    }
}
