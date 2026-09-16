// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    public class ViperResetPasswordPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _errorTimeoutSeconds = 5;

        /// <summary>
        /// Navigates to /reset-password, with or without a token query string.
        /// </summary>
        /// <param name="baseUrl">the CFR Admin frontend's base URL, e.g. http://localhost:4011</param>
        /// <param name="token">the raw token to put in the query string, or empty for none</param>
        public void OpenResetPasswordPage(string baseUrl, string token)
        {
            string url = baseUrl.TrimEnd('/') + XPath_ResetPassword.Route;
            if (!string.IsNullOrEmpty(token))
            {
                url += "?token=" + token;
            }

            OpenWebDriver(url);
        }

        /// <summary>Waits for the "This Link Is Incomplete" panel shown when no token is present.</summary>
        /// <returns><c>true</c> when the panel appeared within the timeout.</returns>
        public bool WaitForLinkIncompletePanel()
        {
            return IsElementVisible(XPath_ResetPassword.LinkIncompletePanel, _pageLoadTimeoutSeconds);
        }

        /// <summary>
        /// Waits for the "This Link Can't Be Used" panel shown for an invalid, expired, or
        /// already-used token (the page validates the token once, on mount, before showing it).
        /// </summary>
        /// <returns><c>true</c> when the panel appeared within the timeout.</returns>
        public bool WaitForLinkInvalidPanel()
        {
            return IsElementVisible(XPath_ResetPassword.LinkInvalidPanel, _pageLoadTimeoutSeconds);
        }

        /// <summary>Reads the specific reason text shown inside the "Link Can't Be Used" panel.</summary>
        /// <returns>The message text, or an empty string when the panel never appeared.</returns>
        public string ReadLinkInvalidMessage()
        {
            return FindFirstDisplayed(XPath_ResetPassword.LinkInvalidMessage, _pageLoadTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>Waits for the actual reset form to be on screen (a genuinely valid token).</summary>
        /// <returns><c>true</c> when the form appeared within the timeout.</returns>
        public bool WaitForForm()
        {
            return IsElementVisible(XPath_ResetPassword.Form, _pageLoadTimeoutSeconds);
        }

        /// <summary>Reads the "Choose a new password for {email}" line above the form.</summary>
        /// <returns>The description text, or an empty string when it never appeared.</returns>
        public string ReadAccountEmailDescription()
        {
            return FindFirstDisplayed(XPath_ResetPassword.AccountEmailDescription, _pageLoadTimeoutSeconds)?.Text ?? string.Empty;
        }

        public void EnterNewPassword(string password)
        {
            SetValueByScriptById(XPath_ResetPassword.txtNewPassword, password);
        }

        public void EnterConfirmPassword(string password)
        {
            SetValueByScriptById(XPath_ResetPassword.txtConfirmPassword, password);
        }

        public void ClickResetPassword()
        {
            ClickByScript("//*[@id='" + XPath_ResetPassword.btnResetPassword + "']");
        }

        /// <summary>
        /// Fills in both password fields and submits, in one step - the common shape every
        /// scenario on this page needs.
        /// </summary>
        /// <param name="newPassword">the new password to enter</param>
        /// <param name="confirmPassword">the confirm-password value to enter</param>
        public void SubmitResetPasswordForm(string newPassword, string confirmPassword)
        {
            EnterNewPassword(newPassword);
            EnterConfirmPassword(confirmPassword);
            ClickResetPassword();
        }

        /// <summary>Reads the validation/server error shown under the new password field.</summary>
        /// <returns>The error text, or an empty string when no error is shown in time.</returns>
        public string ReadNewPasswordError()
        {
            return FindFirstDisplayed(XPath_ResetPassword.NewPasswordError, _errorTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>Reads the validation/server error shown under the confirm password field.</summary>
        /// <returns>The error text, or an empty string when no error is shown in time.</returns>
        public string ReadConfirmPasswordError()
        {
            return FindFirstDisplayed(XPath_ResetPassword.ConfirmPasswordError, _errorTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>Waits for the "Password Successfully Updated" panel shown after a successful reset.</summary>
        /// <returns><c>true</c> when the panel appeared within the timeout.</returns>
        public bool WaitForPasswordUpdatedPanel()
        {
            return IsElementVisible(XPath_ResetPassword.PasswordUpdatedPanel, _pageLoadTimeoutSeconds);
        }

        /// <summary>From the success panel, continues on to /login.</summary>
        public void ClickContinueToSignIn()
        {
            ClickByScript(XPath_ResetPassword.ContinueToSignInLink);
        }

        /// <summary>From an incomplete/invalid link panel, goes to /forgot-password to request a new one.</summary>
        public void ClickRequestNewLink()
        {
            ClickByScript(XPath_ResetPassword.RequestNewLinkLink);
        }
    }
}
