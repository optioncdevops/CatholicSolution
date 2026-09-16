// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    public class ViperForgotPasswordPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        // A submission that actually sends mail (the "existing account" happy path) waits on a
        // real SMTP round trip, not just the API response, so this is more generous than the
        // typical UI-only page load timeout used elsewhere.
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _errorTimeoutSeconds = 5;

        /// <summary>Navigates directly to /forgot-password and waits for the form to render.</summary>
        /// <param name="baseUrl">the CFR Admin frontend's base URL, e.g. http://localhost:4011</param>
        public void OpenForgotPasswordPage(string baseUrl)
        {
            OpenWebDriver(baseUrl.TrimEnd('/') + XPath_ForgotPassword.Route);
            WaitForForm();
        }

        /// <summary>Waits for the request form to be on screen.</summary>
        /// <returns><c>true</c> when the form appeared within the timeout.</returns>
        public bool WaitForForm()
        {
            return IsElementVisible(XPath_ForgotPassword.Form, _pageLoadTimeoutSeconds);
        }

        public void EnterEmail(string email)
        {
            SetValueByScriptById(XPath_ForgotPassword.txtEmailAddress, email);
        }

        public void ClickSendResetLink()
        {
            ClickByScript("//*[@id='" + XPath_ForgotPassword.btnSendResetLink + "']");
        }

        /// <summary>
        /// Enters the email and submits, in one step - the common shape every scenario on this
        /// page needs.
        /// </summary>
        /// <param name="email">the email address to submit</param>
        public void SubmitForgotPasswordForm(string email)
        {
            EnterEmail(email);
            ClickSendResetLink();
        }

        /// <summary>
        /// Reads the field-level validation or server error banner under the email field, after
        /// giving it a moment to appear.
        /// </summary>
        /// <returns>The error text, or an empty string when no error is shown in time.</returns>
        public string ReadEmailError()
        {
            return FindFirstDisplayed(XPath_ForgotPassword.EmailError, _errorTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>Waits for the "Check Your Email" success panel to replace the form.</summary>
        /// <returns><c>true</c> when the panel appeared within the timeout.</returns>
        public bool WaitForCheckYourEmailPanel()
        {
            return IsElementVisible(XPath_ForgotPassword.CheckYourEmailPanel, _pageLoadTimeoutSeconds);
        }

        /// <summary>
        /// Reads the toast shown right after submit - the only visible difference between a
        /// fresh "reset link sent" success and the "already requested" case, since both show the
        /// same Check Your Email panel. The toast is transient, so this has to be called
        /// immediately after the panel appears.
        /// </summary>
        /// <returns>The toast text, or an empty string when none showed in time.</returns>
        public string ReadToast()
        {
            return FindFirstDisplayed(XPath_ForgotPassword.ToastBanner, _errorTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>From the success panel, goes back to a blank request form.</summary>
        public void ClickUseDifferentEmail()
        {
            ClickByScript(XPath_ForgotPassword.UseDifferentEmailButton);
            WaitForForm();
        }

        /// <summary>From the request form, returns to /login.</summary>
        public void ClickBackToSignIn()
        {
            ClickByScript(XPath_ForgotPassword.BackToSignInLink);
        }

        /// <summary>From the success panel, returns to /login.</summary>
        public void ClickReturnToSignIn()
        {
            ClickByScript(XPath_ForgotPassword.ReturnToSignInLink);
        }
    }
}
