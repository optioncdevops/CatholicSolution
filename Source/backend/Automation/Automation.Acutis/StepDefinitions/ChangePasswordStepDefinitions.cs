// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.EnvironmentSupport;
using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class ChangePasswordStepDefinitions(IWebDriver driver)
    {
        private readonly ViperLoginPage _loginPage = new(driver);
        private readonly ViperChangePasswordPage _changePasswordPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        private ChangePasswordData Data => _testData.ChangePassword ?? new ChangePasswordData();

        // The signed in account's real current password - and the value the mutating scenario
        // restores to at the end - comes from the environment (CFR_AUTOMATION_PASSWORD, falling
        // back to Login.Password on Development only), not a separate field of its own.
        private string OriginalPassword => _env.ResolvePassword(_testData.Login?.Password);

        [Given(@"Mutating scenarios are permitted for Change Password in this environment")]
        public void GivenMutatingScenariosArePermittedForChangePasswordInThisEnvironment()
        {
            // Ends the scenario as Ignored here - before signing in or touching the modal at all
            // - when the resolved environment/configuration does not permit mutations. A
            // successful change in this scenario really does change the signed in account's real
            // password, even though it is reverted at the end.
            _env.RequireMutationsAllowedOrSkip("Change Password: successful change reverted back to the original");
        }

        // "Given Launch the application for the detected environment" and "Given Enter the
        // environment-configured username and password" are bound in
        // EnvironmentAwareLoginStepDefinitions - shared with Organization.feature - rather than
        // duplicated here, since Reqnroll would treat two classes binding the same step text as
        // an ambiguous binding at runtime.

        [Then(@"Open the Change Password modal from the account menu")]
        public void ThenOpenTheChangePasswordModalFromTheAccountMenu()
        {
            _changePasswordPage.OpenChangePasswordModal();
            Assert.That(_changePasswordPage.WaitForModal(), Is.True, "The Change Password modal did not open from the account menu.");
        }

        [Then(@"Submit the Change Password form with an incorrect current password and verify the validation message")]
        public void ThenSubmitTheChangePasswordFormWithAnIncorrectCurrentPasswordAndVerifyTheValidationMessage()
        {
            string wrongCurrent = Data.WrongCurrentPassword ?? "NotTheRealPassword1!";
            string newPassword = _env.ResolveNewPassword(Data.NewPassword);
            _changePasswordPage.SubmitChangePasswordForm(wrongCurrent, newPassword, newPassword);
            Assert.That(
                _changePasswordPage.ReadServerError(),
                Does.Contain("current password is incorrect"),
                "An incorrect current password did not show the expected error.");
        }

        [Then(@"Submit the Change Password form with a weak new password and verify the validation message")]
        public void ThenSubmitTheChangePasswordFormWithAWeakNewPasswordAndVerifyTheValidationMessage()
        {
            string weak = Data.WeakPassword ?? "abc123";
            _changePasswordPage.SubmitChangePasswordForm(OriginalPassword, weak, weak);
            Assert.That(
                _changePasswordPage.ReadNewPasswordError(),
                Does.Contain("8 characters"),
                "A weak new password did not show the strength validation message.");
        }

        [Then(@"Submit the Change Password form with mismatched new and confirm passwords and verify the validation message")]
        public void ThenSubmitTheChangePasswordFormWithMismatchedNewAndConfirmPasswordsAndVerifyTheValidationMessage()
        {
            string newPassword = _env.ResolveNewPassword(Data.NewPassword);
            string mismatched = Data.MismatchedConfirmPassword ?? "Different@123";
            _changePasswordPage.SubmitChangePasswordForm(OriginalPassword, newPassword, mismatched);
            Assert.That(
                _changePasswordPage.ReadConfirmPasswordError(),
                Does.Contain("do not match"),
                "Mismatched passwords did not show the confirm-password validation message.");
        }

        [Then(@"Submit the Change Password form with the correct current password and a strong new password and verify it succeeds")]
        public void ThenSubmitTheChangePasswordFormWithTheCorrectCurrentPasswordAndAStrongNewPasswordAndVerifyItSucceeds()
        {
            string newPassword = _env.ResolveNewPassword(Data.NewPassword);
            _changePasswordPage.SubmitChangePasswordForm(OriginalPassword, newPassword, newPassword);
            Assert.That(
                _changePasswordPage.WaitForModalToClose(),
                Is.True,
                "The Change Password modal did not close after a valid current password and a strong new password.");
        }

        [Then(@"Change the password back to the original and verify it succeeds")]
        public void ThenChangeThePasswordBackToTheOriginalAndVerifyItSucceeds()
        {
            string changedPassword = _env.ResolveNewPassword(Data.NewPassword);
            _changePasswordPage.SubmitChangePasswordForm(changedPassword, OriginalPassword, OriginalPassword);
            Assert.That(
                _changePasswordPage.WaitForModalToClose(),
                Is.True,
                "The Change Password modal did not close while reverting to the original password - " +
                "the signed in account's real password may now differ from what test configuration expects.");
        }

        public void RunChangePasswordSafeChecks()
        {
            _loginPage.OpenWebDriver(_env.ResolveBaseUrl(_testData.Login?.URL));
            _loginPage.SendLoginCredential(_env.ResolveUsername(_testData.Login?.UserName), OriginalPassword);
            _loginPage.ClickOnLogin();
            ThenOpenTheChangePasswordModalFromTheAccountMenu();
            ThenSubmitTheChangePasswordFormWithAnIncorrectCurrentPasswordAndVerifyTheValidationMessage();
            ThenSubmitTheChangePasswordFormWithAWeakNewPasswordAndVerifyTheValidationMessage();
            ThenSubmitTheChangePasswordFormWithMismatchedNewAndConfirmPasswordsAndVerifyTheValidationMessage();
            _loginPage.ClickOnLogout();
        }

        public void RunChangePasswordMutatingProcess()
        {
            GivenMutatingScenariosArePermittedForChangePasswordInThisEnvironment();
            _loginPage.OpenWebDriver(_env.ResolveBaseUrl(_testData.Login?.URL));
            _loginPage.SendLoginCredential(_env.ResolveUsername(_testData.Login?.UserName), OriginalPassword);
            _loginPage.ClickOnLogin();
            ThenOpenTheChangePasswordModalFromTheAccountMenu();
            ThenSubmitTheChangePasswordFormWithTheCorrectCurrentPasswordAndAStrongNewPasswordAndVerifyItSucceeds();
            ThenOpenTheChangePasswordModalFromTheAccountMenu();
            ThenChangeThePasswordBackToTheOriginalAndVerifyItSucceeds();
            _loginPage.ClickOnLogout();
        }
    }
}
