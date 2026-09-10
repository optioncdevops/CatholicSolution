using System;
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

        public OrganizationSteps(OrganizationsListPage organizationsListPage, OrganizationAddPage organizationAddPage, OrganizationDetailPage organizationDetailPage)
        {
            _organizationsListPage = organizationsListPage;
            _organizationAddPage = organizationAddPage;
            _organizationDetailPage = organizationDetailPage;
        }

        [When(@"I click on Organizations menu")]
        public void WhenIClickOnOrganizationsMenu()
        {
            _organizationsListPage.ClickByScript(Automation.Framework.ViperPages.ViperCommonVariable.XPath_Organizations.OrganizationsMenu);
        }

        [Then(@"Organizations list page should be opened")]
        public void ThenOrganizationsListPageShouldBeOpened()
        {
            Assert.That(_organizationsListPage.IsPageOpened(), Is.True, "Organizations list page did not open.");
        }

        [When(@"I click Add Organization")]
        public void WhenIClickAddOrganization()
        {
            _organizationsListPage.ClickAddOrganization();
        }

        [Then(@"Fill in only the organization name")]
        public void ThenFillInOnlyTheOrganizationName()
        {
            _organizationAddPage.FillOrganizationName("Test Org " + DateTime.Now.Ticks);
        }

        [Then(@"Fill in the new organization details")]
        public void ThenFillInTheNewOrganizationDetails()
        {
            var testData = (Automation.Framework.JsonTestData.AcutisJsonDataObjects)Automation.Framework.JsonTestData.JsonDataReader.GetJsonData("Acutis");
            var orgData = testData.Organization;
            
            _organizationAddPage.FillOrganizationDetails(
                orgName: "Test Org " + DateTime.Now.Ticks,
                orgType: orgData?.OrgType ?? "Parish",
                website: orgData?.Website ?? "www.testorg.com",
                status: orgData?.Status ?? "Active",
                contactPerson: orgData?.ContactPerson ?? "John Doe",
                contactPhone: orgData?.ContactPhone ?? "1234567890",
                contactEmail: orgData?.ContactEmail ?? "test@testorg.com",
                address: orgData?.Address ?? "123 Test St",
                city: orgData?.City ?? "Testville",
                state: orgData?.State ?? "CA",
                zip: orgData?.Zip ?? "90210"
            );
        }

        [Then(@"I click Save organization")]
        public void ThenIClickSaveOrganization()
        {
            _organizationAddPage.ClickSave();
        }

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

        public void RunOrganizationProcess()
        {
            // Navigate to and verify list
            WhenIClickOnOrganizationsMenu();
            ThenOrganizationsListPageShouldBeOpened();

            // 1. first add there cancel check (name only - see ThenFillInOnlyTheOrganizationName)
            WhenIClickAddOrganization();
            ThenFillInOnlyTheOrganizationName();
            WhenICancelAddOrganization();
            ThenOrganizationsListPageShouldBeOpened();

            // 2. then add then save
            WhenIClickAddOrganization();
            ThenFillInTheNewOrganizationDetails();
            ThenIClickSaveOrganization();
            ThenOrganizationsListPageShouldBeOpened();

            // 3. view and then first tab edit
            WhenIViewTheFirstOrganizationInTheList();
            ThenOrganizationDetailsTabShouldBeVisible();
            WhenIClickEditOnProfileTab();
            ThenTheEditFormShouldBeDisplayed();
            WhenIClickCancelOnEditForm();

            // 4. next tabs in the product tab add app and then other tabs
            WhenIClickOnMembersTab();
            ThenOrganizationMembersListShouldBeVisible();

            WhenIClickOnProductsTab();
            ThenProductsPanelShouldBeVisible();
            WhenIClickAssignApp();
            ThenAssignAppModalShouldOpen();
            WhenICancelAssignApp();

            WhenIClickOnLicensesTab();
            ThenLicensesPanelShouldBeVisible();

            WhenIClickOnRequestsTab();
            ThenRequestsPanelShouldBeVisible();

            WhenIClickBackToOrganizations();
            ThenOrganizationsListPageShouldBeOpened();

            // 5. then in the action icon edit
            WhenIClickEditOnFirstOrganization();
            ThenTheEditFormShouldBeDisplayed();
            WhenIClickCancelOnEditForm();
            WhenIClickBackToOrganizations();
            ThenOrganizationsListPageShouldBeOpened();

            // 6. then status (Cancel first, then actual change to inactive at the last)
            WhenIClickChangeStatusOnFirstOrganization();
            ThenChangeStatusModalShouldOpen();
            WhenICancelChangeStatus();
            ThenOrganizationsListPageShouldBeOpened();

            WhenIClickChangeStatusOnFirstOrganization();
            ThenChangeStatusModalShouldOpen();
            WhenISelectInactiveStatus();
            WhenIConfirmChangeStatus();
            ThenOrganizationsListPageShouldBeOpened();
        }

        [When(@"I cancel adding the organization")]
        public void WhenICancelAddOrganization()
        {
            _organizationAddPage.ClickCancel();
        }

        [When(@"I click Edit on the Profile tab")]
        public void WhenIClickEditOnProfileTab()
        {
            _organizationDetailPage.ClickProfileEdit();
        }

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

        // --- Change Status steps ---

        [When(@"I click Change Status on the first organization")]
        public void WhenIClickChangeStatusOnFirstOrganization()
        {
            _organizationsListPage.ClickChangeStatusOnFirstRow();
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

        // --- Edit steps ---

        [When(@"I click Edit on the first organization")]
        public void WhenIClickEditOnFirstOrganization()
        {
            _organizationsListPage.EditFirstOrganization();
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

        // --- Assign App modal steps ---

        [When(@"I click Assign App button")]
        public void WhenIClickAssignApp()
        {
            _organizationDetailPage.ClickAssignApp();
        }

        [Then(@"Assign App modal should open")]
        public void ThenAssignAppModalShouldOpen()
        {
            Assert.That(_organizationDetailPage.IsElementVisible(
                Automation.Framework.ViperPages.ViperCommonVariable.XPath_Organizations.AssignAppModal, 5),
                Is.True, "Assign App modal did not open.");
        }

        [When(@"I cancel the Assign App modal")]
        public void WhenICancelAssignApp()
        {
            _organizationDetailPage.CancelAssignApp();
        }

        // --- Back to Organizations ---

        [When(@"I click Back to Organizations")]
        public void WhenIClickBackToOrganizations()
        {
            _organizationDetailPage.ClickBackToOrganizations();
        }
    }
}
