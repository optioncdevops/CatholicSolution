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
    public class ForgotPasswordStepDefinitions(IWebDriver driver)
    {
        private readonly ViperForgotPasswordPage _forgotPasswordPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        private ForgotPasswordData Data => _testData.ForgotPassword ?? new ForgotPasswordData();

        private string TestEmail => _env.ResolveTestEmail(Data.ExistingUserEmail);

        [Given(@"Mutating scenarios are permitted for Forgot Password in this environment")]
        public void GivenMutatingScenariosArePermittedForForgotPasswordInThisEnvironment()
        {
            // Ends the scenario as Ignored here - before any real email is sent or database row
            // written - when the resolved environment/configuration does not permit mutations.
            _env.RequireMutationsAllowedOrSkip("Forgot Password: successful submission and already-requested message");
        }

        [Given(@"Any password reset tokens left over from a previous run are removed for the test account")]
        public void GivenAnyPasswordResetTokensLeftOverFromAPreviousRunAreRemovedForTheTestAccount()
        {
            // A still-active token left over from an interrupted previous run would make the
            // first submission below report "already requested" instead of a fresh send - see
            // Acutis_PasswordReset_CRUD ActionId 1's "already active" branch. Only possible - and
            // only attempted - where database seeding is available (Development); elsewhere this
            // is a deliberate no-op rather than a failed database connection attempt.
            if (_env.MailboxMode == "seed")
            {
                PasswordResetTokenTestSupport.DeleteTokensForUser(TestEmail);
            }
        }

        [Given(@"Launch the application at the Forgot Password page")]
        public void GivenLaunchTheApplicationAtTheForgotPasswordPage()
        {
            _forgotPasswordPage.OpenForgotPasswordPage(_env.ResolveBaseUrl(Data.URL));
        }

        [Then(@"Submit the Forgot Password form with an empty email and verify the validation message")]
        public void ThenSubmitTheForgotPasswordFormWithAnEmptyEmailAndVerifyTheValidationMessage()
        {
            _forgotPasswordPage.SubmitForgotPasswordForm(string.Empty);
            Assert.That(
                _forgotPasswordPage.ReadEmailError(),
                Does.Contain("Enter the email connected to your account"),
                "Submitting with no email did not show the required-field message.");
        }

        [Then(@"Submit the Forgot Password form with an invalid email format and verify the validation message")]
        public void ThenSubmitTheForgotPasswordFormWithAnInvalidEmailFormatAndVerifyTheValidationMessage()
        {
            _forgotPasswordPage.SubmitForgotPasswordForm(Data.InvalidEmailFormat ?? "not-an-email");
            Assert.That(
                _forgotPasswordPage.ReadEmailError(),
                Does.Contain("Enter a valid email address"),
                "Submitting a malformed email did not show the format validation message.");
        }

        [Then(@"Submit the Forgot Password form with an email that does not exist and verify the account not found message")]
        public void ThenSubmitTheForgotPasswordFormWithAnEmailThatDoesNotExistAndVerifyTheAccountNotFoundMessage()
        {
            _forgotPasswordPage.SubmitForgotPasswordForm(Data.NonExistentEmail ?? "no-such-user-automation@example.com");
            Assert.That(
                _forgotPasswordPage.ReadEmailError(),
                Does.Contain("No account found"),
                "Submitting an email with no matching account did not show the account-not-found message.");
        }

        [Then(@"Submit the Forgot Password form with the existing test account email and verify the Check Your Email panel is shown")]
        public void ThenSubmitTheForgotPasswordFormWithTheExistingTestAccountEmailAndVerifyTheCheckYourEmailPanelIsShown()
        {
            _forgotPasswordPage.SubmitForgotPasswordForm(TestEmail);
            Assert.That(
                _forgotPasswordPage.WaitForCheckYourEmailPanel(),
                Is.True,
                "The Check Your Email panel did not appear for a known, active account.");
        }

        [Then(@"Submit the Forgot Password form again with the same email and verify the already requested message")]
        public void ThenSubmitTheForgotPasswordFormAgainWithTheSameEmailAndVerifyTheAlreadyRequestedMessage()
        {
            _forgotPasswordPage.ClickUseDifferentEmail();
            _forgotPasswordPage.SubmitForgotPasswordForm(TestEmail);
            Assert.That(
                _forgotPasswordPage.WaitForCheckYourEmailPanel(),
                Is.True,
                "The Check Your Email panel did not appear on the second, already-requested submission.");

            string toast = _forgotPasswordPage.ReadToast();
            if (_env.MailboxMode == "seed")
            {
                // Only Development pre-clears leftover tokens (see the Given step above), so this
                // is the only environment where the second submission is guaranteed to land on the
                // exact "already on its way" wording rather than possibly a fresh send.
                Assert.That(toast, Does.Contain("already on its way"), "The second submission for the same account did not report the still-active link.");
            }
            else
            {
                Assert.That(
                    toast,
                    Does.Contain("already on its way").Or.Contain("sent to your email"),
                    "The second submission did not report a recognized outcome.");
            }
        }

        [Then(@"Click on Use a Different Email and the request form should be shown again")]
        public void ThenClickOnUseADifferentEmailAndTheRequestFormShouldBeShownAgain()
        {
            _forgotPasswordPage.ClickUseDifferentEmail();
            Assert.That(_forgotPasswordPage.WaitForForm(), Is.True, "The request form did not come back after Use a Different Email.");
        }

        [Then(@"Click on Back To Sign In and the Login page should open")]
        public void ThenClickOnBackToSignInAndTheLoginPageShouldOpen()
        {
            _forgotPasswordPage.ClickBackToSignIn();
        }

        [Then(@"Clean up any password reset tokens left for the test account")]
        public void ThenCleanUpAnyPasswordResetTokensLeftForTheTestAccount()
        {
            if (_env.MailboxMode == "seed")
            {
                PasswordResetTokenTestSupport.DeleteTokensForUser(TestEmail);
            }
        }

        public void RunForgotPasswordSafeChecks()
        {
            GivenLaunchTheApplicationAtTheForgotPasswordPage();
            ThenSubmitTheForgotPasswordFormWithAnEmptyEmailAndVerifyTheValidationMessage();
            ThenSubmitTheForgotPasswordFormWithAnInvalidEmailFormatAndVerifyTheValidationMessage();
            ThenSubmitTheForgotPasswordFormWithAnEmailThatDoesNotExistAndVerifyTheAccountNotFoundMessage();
        }

        public void RunForgotPasswordMutatingProcess()
        {
            GivenMutatingScenariosArePermittedForForgotPasswordInThisEnvironment();
            GivenAnyPasswordResetTokensLeftOverFromAPreviousRunAreRemovedForTheTestAccount();
            GivenLaunchTheApplicationAtTheForgotPasswordPage();
            ThenSubmitTheForgotPasswordFormWithTheExistingTestAccountEmailAndVerifyTheCheckYourEmailPanelIsShown();
            ThenSubmitTheForgotPasswordFormAgainWithTheSameEmailAndVerifyTheAlreadyRequestedMessage();
            ThenClickOnUseADifferentEmailAndTheRequestFormShouldBeShownAgain();
            ThenClickOnBackToSignInAndTheLoginPageShouldOpen();
            ThenCleanUpAnyPasswordResetTokensLeftForTheTestAccount();
        }
    }
}
