// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    public class ViperChangePasswordPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _modalTimeoutSeconds = 10;

        // Generous enough to cover the current-password check's round trip to the server, not
        // just the purely client-side weak-password/mismatch checks.
        private const int _errorTimeoutSeconds = 15;

        /// <summary>Opens the Change Password modal from the account menu in the top nav.</summary>
        public void OpenChangePasswordModal()
        {
            FindElementById(XPath_Menus.menuProfile);
            FindElementById(XPath_Menus.menuItemChangePassword);
            WaitForModal();
        }

        /// <summary>Waits for the modal to be on screen.</summary>
        /// <returns><c>true</c> when the modal appeared within the timeout.</returns>
        public bool WaitForModal()
        {
            return IsElementVisible(XPath_ChangePassword.Modal, _modalTimeoutSeconds);
        }

        /// <summary>Waits for the modal to have closed - the shape of a successful change.</summary>
        /// <returns><c>true</c> when the modal was gone within the timeout.</returns>
        public bool WaitForModalToClose()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath(XPath_ChangePassword.Modal)).Count == 0,
                _modalTimeoutSeconds);
        }

        public void EnterCurrentPassword(string password)
        {
            SetValueByScriptById(XPath_ChangePassword.txtCurrentPassword, password);
        }

        public void EnterNewPassword(string password)
        {
            SetValueByScriptById(XPath_ChangePassword.txtNewPassword, password);
        }

        public void EnterConfirmPassword(string password)
        {
            SetValueByScriptById(XPath_ChangePassword.txtConfirmPassword, password);
        }

        public void ClickUpdatePassword()
        {
            ClickByScript("//*[@id='" + XPath_ChangePassword.btnUpdatePassword + "']");
        }

        public void ClickCancelChangePassword()
        {
            ClickByScript("//*[@id='" + XPath_ChangePassword.btnCancelChangePassword + "']");
        }

        /// <summary>
        /// Fills in all three fields and submits, in one step - the common shape every scenario
        /// on this modal needs.
        /// </summary>
        /// <param name="currentPassword">the current password to enter</param>
        /// <param name="newPassword">the new password to enter</param>
        /// <param name="confirmPassword">the confirm-password value to enter</param>
        public void SubmitChangePasswordForm(string currentPassword, string newPassword, string confirmPassword)
        {
            EnterCurrentPassword(currentPassword);
            EnterNewPassword(newPassword);
            EnterConfirmPassword(confirmPassword);
            ClickUpdatePassword();
        }

        /// <summary>Reads the current-password field's validation/server error.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadCurrentPasswordError()
        {
            return WaitForHiddenText(XPath_ChangePassword.CurrentPasswordError, _errorTimeoutSeconds);
        }

        /// <summary>Reads the new-password field's validation error.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadNewPasswordError()
        {
            return WaitForHiddenText(XPath_ChangePassword.NewPasswordError, _errorTimeoutSeconds);
        }

        /// <summary>Reads the confirm-password field's validation error.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadConfirmPasswordError()
        {
            return WaitForHiddenText(XPath_ChangePassword.ConfirmPasswordError, _errorTimeoutSeconds);
        }

        /// <summary>Reads the general/server error banner shown at the bottom of the form.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadServerError()
        {
            return FindFirstDisplayed(XPath_ChangePassword.ServerError, _errorTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>
        /// Polls a visually-hidden (sr-only) error span for non-empty text, reading its
        /// textContent directly rather than relying on this framework's Displayed-based helpers -
        /// InputField's error element is clipped off-screen but always present in the DOM.
        /// </summary>
        /// <param name="xPath">the xpath of the error span to read</param>
        /// <param name="timeoutSeconds">how long to keep polling before giving up</param>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        private string WaitForHiddenText(string xPath, int timeoutSeconds)
        {
            return WaitFor(
                driver =>
                {
                    var element = driver.FindElements(By.XPath(xPath)).FirstOrDefault();
                    string? text = element?.GetAttribute("textContent")?.Trim();
                    return string.IsNullOrEmpty(text) ? null : text;
                },
                timeoutSeconds) ?? string.Empty;
        }
    }
}
