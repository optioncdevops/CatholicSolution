// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.DbSupport;
using Automation.Framework.EnvironmentSupport;
using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class ResetPasswordStepDefinitions(IWebDriver driver)
    {
        private readonly ViperResetPasswordPage _resetPasswordPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        // A syntactically valid (64 hex char) token that was never actually issued, so
        // ValidateResetToken reports it as not found/invalid rather than expired or used.
        private const string _unknownToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";

        private string _seededToken = string.Empty;

        private ForgotPasswordData ForgotPasswordData => _testData.ForgotPassword ?? new ForgotPasswordData();

        private ResetPasswordData ResetData => _testData.ResetPassword ?? new ResetPasswordData();

        private string BaseUrl => _env.ResolveBaseUrl(ForgotPasswordData.URL);

        private string TestAccountEmail => _env.ResolveTestEmail(ForgotPasswordData.ExistingUserEmail);

        [Given(@"Database-seeded reset tokens are permitted for Reset Password in this environment")]
        public void GivenDatabaseSeededResetTokensArePermittedForResetPasswordInThisEnvironment()
        {
            // Ends the scenario as Ignored here - before any token is seeded or password changed
            // - when the resolved environment/configuration does not allow database seeding.
            // Mutations must also be explicitly permitted, since a successful reset in this
            // scenario really does change the test account's real password.
            _env.RequireDatabaseSeedingAllowedOrSkip("Reset Password: used/expired tokens and a successful reset");
            _env.RequireMutationsAllowedOrSkip("Reset Password: used/expired tokens and a successful reset");
        }

        [Given(@"Any existing password reset tokens for the test account are removed")]
        public void GivenAnyExistingPasswordResetTokensForTheTestAccountAreRemoved()
        {
            // A still-active token left over from an interrupted previous run would make the
            // seed calls below silently reuse it instead of minting the fresh one each scenario
            // step expects - see Acutis_PasswordReset_CRUD ActionId 1's "already active" branch.
            PasswordResetTokenTestSupport.DeleteTokensForUser(TestAccountEmail);
        }

        [When(@"Open the Reset Password page with no token in the URL")]
        public void WhenOpenTheResetPasswordPageWithNoTokenInTheURL()
        {
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, string.Empty);
        }

        [When(@"Open the Reset Password page with a syntactically invalid token")]
        public void WhenOpenTheResetPasswordPageWithASyntacticallyInvalidToken()
        {
            // Not 64 hex characters, so the frontend rejects it before it ever reaches the API -
            // see ResetPasswordPage.tsx's TOKEN_PATTERN.
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, "not-a-real-token");
        }

        [When(@"Open the Reset Password page with a syntactically valid but unknown token")]
        public void WhenOpenTheResetPasswordPageWithASyntacticallyValidButUnknownToken()
        {
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, _unknownToken);
        }

        [Then(@"The Link Required panel should be shown")]
        public void ThenTheLinkRequiredPanelShouldBeShown()
        {
            Assert.That(_resetPasswordPage.WaitForLinkIncompletePanel(), Is.True, "The 'This Link Is Incomplete' panel was not shown.");
        }

        [Then(@"The Link Can't Be Used panel should show the invalid link message")]
        public void ThenTheLinkCanTBeUsedPanelShouldShowTheInvalidLinkMessage()
        {
            Assert.That(_resetPasswordPage.WaitForLinkInvalidPanel(), Is.True, "The 'This Link Can't Be Used' panel was not shown.");
            Assert.That(
                _resetPasswordPage.ReadLinkInvalidMessage(),
                Does.Contain("invalid or has expired"),
                "An unknown token did not report as invalid.");
        }

        [When(@"A password reset token is seeded and immediately marked used for the test account")]
        public void WhenAPasswordResetTokenIsSeededAndImmediatelyMarkedUsedForTheTestAccount()
        {
            _seededToken = PasswordResetTokenTestSupport.SeedUsedToken(TestAccountEmail);
        }

        [When(@"Open the Reset Password page with that used token")]
        public void WhenOpenTheResetPasswordPageWithThatUsedToken()
        {
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, _seededToken);
        }

        [Then(@"The Link Can't Be Used panel should show the already used message")]
        public void ThenTheLinkCanTBeUsedPanelShouldShowTheAlreadyUsedMessage()
        {
            Assert.That(_resetPasswordPage.WaitForLinkInvalidPanel(), Is.True, "The 'This Link Can't Be Used' panel was not shown.");
            Assert.That(
                _resetPasswordPage.ReadLinkInvalidMessage(),
                Does.Contain("already been used"),
                "A used token did not report as already used.");
        }

        [When(@"A password reset token is seeded that has already expired for the test account")]
        public void WhenAPasswordResetTokenIsSeededThatHasAlreadyExpiredForTheTestAccount()
        {
            _seededToken = PasswordResetTokenTestSupport.SeedExpiredToken(TestAccountEmail);
        }

        [When(@"Open the Reset Password page with that expired token")]
        public void WhenOpenTheResetPasswordPageWithThatExpiredToken()
        {
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, _seededToken);
        }

        [Then(@"The Link Can't Be Used panel should show the expired message")]
        public void ThenTheLinkCanTBeUsedPanelShouldShowTheExpiredMessage()
        {
            Assert.That(_resetPasswordPage.WaitForLinkInvalidPanel(), Is.True, "The 'This Link Can't Be Used' panel was not shown.");
            Assert.That(
                _resetPasswordPage.ReadLinkInvalidMessage(),
                Does.Contain("has expired"),
                "An expired token did not report as expired.");
        }

        [When(@"A valid password reset token is seeded for the test account")]
        public void WhenAValidPasswordResetTokenIsSeededForTheTestAccount()
        {
            _seededToken = PasswordResetTokenTestSupport.SeedToken(TestAccountEmail, DateTime.UtcNow.AddMinutes(15));
        }

        [When(@"Open the Reset Password page with that valid token")]
        public void WhenOpenTheResetPasswordPageWithThatValidToken()
        {
            _resetPasswordPage.OpenResetPasswordPage(BaseUrl, _seededToken);
        }

        [Then(@"The account email for the reset should be shown")]
        public void ThenTheAccountEmailForTheResetShouldBeShown()
        {
            Assert.That(_resetPasswordPage.WaitForForm(), Is.True, "The reset form did not open for a genuinely valid token.");
            Assert.That(
                _resetPasswordPage.ReadAccountEmailDescription(),
                Does.Contain(TestAccountEmail),
                "The reset form did not show the account the token belongs to.");
        }

        [Then(@"Submit the Reset Password form with a weak password and verify the validation message")]
        public void ThenSubmitTheResetPasswordFormWithAWeakPasswordAndVerifyTheValidationMessage()
        {
            string weak = ResetData.WeakPassword ?? "abc123";
            _resetPasswordPage.SubmitResetPasswordForm(weak, weak);
            Assert.That(
                _resetPasswordPage.ReadNewPasswordError(),
                Does.Contain("8 characters"),
                "A weak password did not show the strength validation message.");
        }

        [Then(@"Submit the Reset Password form with mismatched passwords and verify the validation message")]
        public void ThenSubmitTheResetPasswordFormWithMismatchedPasswordsAndVerifyTheValidationMessage()
        {
            string newPassword = _env.ResolveNewPassword(ResetData.NewPassword);
            string mismatched = ResetData.MismatchedConfirmPassword ?? "Different@123";
            _resetPasswordPage.SubmitResetPasswordForm(newPassword, mismatched);
            Assert.That(
                _resetPasswordPage.ReadConfirmPasswordError(),
                Does.Contain("do not match"),
                "Mismatched passwords did not show the confirm-password validation message.");
        }

        [Then(@"Submit the Reset Password form with a strong matching new password and verify the Password Successfully Updated panel is shown")]
        public void ThenSubmitTheResetPasswordFormWithAStrongMatchingNewPasswordAndVerifyThePasswordSuccessfullyUpdatedPanelIsShown()
        {
            string newPassword = _env.ResolveNewPassword(ResetData.NewPassword);
            _resetPasswordPage.SubmitResetPasswordForm(newPassword, newPassword);
            Assert.That(
                _resetPasswordPage.WaitForPasswordUpdatedPanel(),
                Is.True,
                "The Password Successfully Updated panel did not appear for a valid token and a strong, matching password.");
        }

        [Then(@"Click on Continue to Sign In and the Login page should open")]
        public void ThenClickOnContinueToSignInAndTheLoginPageShouldOpen()
        {
            _resetPasswordPage.ClickContinueToSignIn();
        }

        [Then(@"Restore the test account password and remove any leftover reset tokens")]
        public void ThenRestoreTheTestAccountPasswordAndRemoveAnyLeftoverResetTokens()
        {
            // The successful reset above genuinely changed the account's real password, so the
            // next run (and anything else that signs in as this account) needs it put back.
            string originalPassword = _env.ResolvePassword(ForgotPasswordData.ExistingUserPassword);
            PasswordResetTokenTestSupport.RestorePassword(TestAccountEmail, originalPassword);
            PasswordResetTokenTestSupport.DeleteTokensForUser(TestAccountEmail);
        }

        public void RunResetPasswordSafeChecks()
        {
            WhenOpenTheResetPasswordPageWithNoTokenInTheURL();
            ThenTheLinkRequiredPanelShouldBeShown();
            WhenOpenTheResetPasswordPageWithASyntacticallyInvalidToken();
            ThenTheLinkRequiredPanelShouldBeShown();
            WhenOpenTheResetPasswordPageWithASyntacticallyValidButUnknownToken();
            ThenTheLinkCanTBeUsedPanelShouldShowTheInvalidLinkMessage();
        }

        public void RunResetPasswordMutatingProcess()
        {
            GivenDatabaseSeededResetTokensArePermittedForResetPasswordInThisEnvironment();
            GivenAnyExistingPasswordResetTokensForTheTestAccountAreRemoved();
            WhenAPasswordResetTokenIsSeededAndImmediatelyMarkedUsedForTheTestAccount();
            WhenOpenTheResetPasswordPageWithThatUsedToken();
            ThenTheLinkCanTBeUsedPanelShouldShowTheAlreadyUsedMessage();
            WhenAPasswordResetTokenIsSeededThatHasAlreadyExpiredForTheTestAccount();
            WhenOpenTheResetPasswordPageWithThatExpiredToken();
            ThenTheLinkCanTBeUsedPanelShouldShowTheExpiredMessage();
            WhenAValidPasswordResetTokenIsSeededForTheTestAccount();
            WhenOpenTheResetPasswordPageWithThatValidToken();
            ThenTheAccountEmailForTheResetShouldBeShown();
            ThenSubmitTheResetPasswordFormWithAWeakPasswordAndVerifyTheValidationMessage();
            ThenSubmitTheResetPasswordFormWithMismatchedPasswordsAndVerifyTheValidationMessage();
            ThenSubmitTheResetPasswordFormWithAStrongMatchingNewPasswordAndVerifyThePasswordSuccessfullyUpdatedPanelIsShown();
            ThenClickOnContinueToSignInAndTheLoginPageShouldOpen();
            ThenRestoreTheTestAccountPasswordAndRemoveAnyLeftoverResetTokens();
        }
    }
}
