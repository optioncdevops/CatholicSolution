// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class AdminAccessRequestsStepDefinitions(IWebDriver driver)
    {
        private readonly AdminRequestsListPage _adminRequestsPage = new(driver);
        private readonly ViperLoginPage _loginPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        [Then(@"I navigate to the Admin Access Requests page")]
        public void ThenINavigateToTheAdminAccessRequestsPage()
        {
            _adminRequestsPage.NavigateToAdminRequests();
        }

        [Then(@"I should see the access requests table or an empty state")]
        public void ThenIShouldSeeTheAccessRequestsTableOrAnEmptyState()
        {
            Assert.That(_adminRequestsPage.VerifyResultsOrEmptyState(), Is.True, "Neither the requests table nor the empty state was displayed.");
        }

        [When(@"I select the ""([^""]*)"" status tab")]
        public void WhenISelectTheStatusTab(string statusName)
        {
            _adminRequestsPage.SelectStatusTab(statusName);
        }

        [Then(@"the requests table should show filtered results or be empty")]
        public void ThenTheRequestsTableShouldShowFilteredResultsOrBeEmpty()
        {
            Assert.That(_adminRequestsPage.VerifyResultsOrEmptyState(), Is.True, "Neither the filtered requests table nor the empty state was displayed.");
        }

        [When(@"I click on the Application filter dropdown")]
        public void WhenIClickOnTheApplicationFilterDropdown()
        {
            _adminRequestsPage.SelectApplicationFilter();
        }

        [When(@"I click on the Organization filter dropdown")]
        public void WhenIClickOnTheOrganizationFilterDropdown()
        {
            _adminRequestsPage.SelectOrganizationFilter();
        }

        public void RunAdminAccessRequestsProcess()
        {
            ThenINavigateToTheAdminAccessRequestsPage();
            ThenIShouldSeeTheAccessRequestsTableOrAnEmptyState();
            WhenISelectTheStatusTab("pending");
            ThenTheRequestsTableShouldShowFilteredResultsOrBeEmpty();
            WhenIClickOnTheApplicationFilterDropdown();
            WhenIClickOnTheOrganizationFilterDropdown();
        }
    }
}
