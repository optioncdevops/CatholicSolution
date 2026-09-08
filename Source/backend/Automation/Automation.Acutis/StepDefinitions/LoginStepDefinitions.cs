// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class LoginStepDefinitions(IWebDriver driver)
    {
        private readonly ViperLoginPage _loginPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        [Given(@"Launch the application with URL")]
        public void GivenLaunchTheApplicationWithURL()
        {
            if (_testData.Login != null)
            {
                _loginPage.OpenWebDriver(_testData.Login.URL ?? string.Empty);
            }
        }

        [Given(@"Enter the UserName and the Password")]
        public void GivenEnterTheUserNameAndThePassword()
        {
            if (_testData.Login != null)
            {
                _loginPage.SendLoginCredential(_testData.Login.UserName ?? string.Empty, _testData.Login.Password ?? string.Empty);
            }
        }

        [When(@"I click the login button")]
        public void WhenIClickTheLoginButton()
        {
            _loginPage.ClickOnLogin();
        }

        [Then(@"The Dashboard should be opened")]
        public void ThenTheDashboardShouldBeOpened()
        {
        }

        [Then(@"User should be able to logout from the application")]
        public void ThenUserShouldBeAbleToLogoutFromTheApplication()
        {
            _loginPage.ClickOnLogout();
        }

        [Then(@"User should be able to logout")]
        public void ThenUsershouldbeabletologout()
        {
            _loginPage.ClickOnLogout();
        }

        [Given(@"Launch the application with valid user credentials '([^']*)' and '([^']*)' and the '([^']*)'")]
        public void GivenLaunchTheApplicationWithValidUserCredentialsAndAndThe(string p0, string p1, string password)
        {
            _loginPage.OpenWebDriver(p0);
            _loginPage.SendLoginCredential(p1, password);
            _loginPage.ClickOnLogin();
        }

        [Then(@"Launch the application with valid user credentials")]
        public void ThenLaunchTheApplicationWithValidUserCredentials()
        {
            if (_testData.Login != null)
            {
                _loginPage.OpenWebDriver(_testData.Login.URL ?? string.Empty);
                _loginPage.SendLoginCredential(_testData.Login.UserName ?? string.Empty, _testData.Login.Password ?? string.Empty);
            }

            _loginPage.ClickOnLogin();
        }
    }
}