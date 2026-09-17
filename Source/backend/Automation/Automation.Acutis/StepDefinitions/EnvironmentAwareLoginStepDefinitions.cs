// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.EnvironmentSupport;
using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    /// <summary>
    /// Given steps that sign in using CFR_AUTOMATION_BASE_URL/USERNAME/PASSWORD (falling back to
    /// AcutisTestData.json's Login section on Development only), for any feature that needs a
    /// real authenticated session across Development/Pilot/Staging/Live rather than the
    /// JSON-only credentials LoginStepDefinitions itself uses. Shared by ChangePassword.feature
    /// and Organization.feature (and any future feature with the same need) - kept in its own
    /// class rather than duplicated in each, since two classes binding the identical step text
    /// would be an ambiguous-binding error at runtime.
    /// </summary>
    [Binding]
    public class EnvironmentAwareLoginStepDefinitions(IWebDriver driver)
    {
        private readonly ViperLoginPage _loginPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        [Given(@"Launch the application for the detected environment")]
        public void GivenLaunchTheApplicationForTheDetectedEnvironment()
        {
            _loginPage.OpenWebDriver(_env.ResolveBaseUrl(_testData.Login?.URL));
        }

        [Given(@"Enter the environment-configured username and password")]
        public void GivenEnterTheEnvironmentConfiguredUsernameAndPassword()
        {
            _loginPage.SendLoginCredential(
                _env.ResolveUsername(_testData.Login?.UserName),
                _env.ResolvePassword(_testData.Login?.Password));
        }
    }
}
