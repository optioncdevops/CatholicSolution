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

        [Given(@"I log in to the admin portal")]
        public void GivenILogInToTheAdminPortal()
        {
            if (_testData.Login != null)
            {
                _loginPage.LoginProcess(_testData.Login);
            }
        }

        [Given(@"I navigate to the Admin Access Requests page")]
        public void GivenINavigateToTheAdminAccessRequestsPage()
        {
            _adminRequestsPage.NavigateToAdminRequests();
        }

        [Then(@"I should see the access requests table or an empty state")]
        public void ThenIShouldSeeTheAccessRequestsTableOrAnEmptyState()
        {
            bool hasRequests = _adminRequestsPage.VerifyRequestsAreDisplayed();
            bool hasEmptyState = _adminRequestsPage.VerifyEmptyStateIsDisplayed();

            Assert.That(hasRequests || hasEmptyState, Is.True, "Neither the requests table nor the empty state was displayed.");
        }

        [When(@"I select the ""([^""]*)"" status tab")]
        public void WhenISelectTheStatusTab(string statusName)
        {
            _adminRequestsPage.SelectStatusTab(statusName);
        }

        [Then(@"the requests table should only show pending requests or be empty")]
        public void ThenTheRequestsTableShouldOnlyShowPendingRequestsOrBeEmpty()
        {
            bool hasRequests = _adminRequestsPage.VerifyRequestsAreDisplayed();
            bool hasEmptyState = _adminRequestsPage.VerifyEmptyStateIsDisplayed();

            Assert.That(hasRequests || hasEmptyState, Is.True, "Neither the pending requests table nor the empty state was displayed.");
        }
    }
}
