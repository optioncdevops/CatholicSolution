// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class EmailSettingsPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        public string OriginalDisplayName { get; private set; } = string.Empty;

        /// <summary>Opens Email Settings from the nav bar.</summary>
        public void NavigateToEmailSettings()
        {
            ClickAdminNavByRoute(XPath_EmailSettings.SettingsRoute);
            WaitForSettingsPage();
        }

        public bool WaitForSettingsPage()
        {
            return IsElementVisible(XPath_EmailSettings.PageTitle, _pageLoadTimeoutSeconds)
                && IsElementVisible(XPath_EmailSettings.SmtpSection, _pageLoadTimeoutSeconds);
        }

        /// <summary>Whether the SMTP and branding sections are both on screen.</summary>
        public bool AreSectionsVisible()
        {
            return IsElementVisible(XPath_EmailSettings.SmtpServer, _menuTimeoutSeconds)
                && IsElementVisible(XPath_EmailSettings.Username, _menuTimeoutSeconds)
                && IsElementVisible(XPath_EmailSettings.BrandingSection, _menuTimeoutSeconds)
                && IsElementVisible(XPath_EmailSettings.EmailLogo, _menuTimeoutSeconds);
        }

        /// <summary>Toggles Send mail enabled, then toggles it back so the saved value is unchanged until Save.</summary>
        public void ToggleSendMailEnabled()
        {
            ClickFirstDisplayed(XPath_EmailSettings.SendMailSwitch, _menuTimeoutSeconds);
            Thread.Sleep(400);
            ClickFirstDisplayed(XPath_EmailSettings.SendMailSwitch, _menuTimeoutSeconds);
        }

        /// <summary>Toggles SSL/TLS, then toggles it back.</summary>
        public void ToggleSsl()
        {
            ClickFirstDisplayed(XPath_EmailSettings.SslSwitch, _menuTimeoutSeconds);
            Thread.Sleep(400);
            ClickFirstDisplayed(XPath_EmailSettings.SslSwitch, _menuTimeoutSeconds);
        }

        /// <summary>
        /// Opens the Font family list, checks that options are shown, then closes it
        /// without picking a value so Save later does not persist a font change.
        /// </summary>
        /// <remarks>
        /// The control sits at the bottom of the form under the sticky Save/Cancel bar, so it
        /// is scrolled into view first. The list itself is portalled onto the body as a
        /// listbox, not nested under the trigger.
        /// </remarks>
        public bool OpenAndCloseFontFamily()
        {
            ScrollIntoView(XPath_EmailSettings.BrandingSection);
            ScrollIntoView(XPath_EmailSettings.FontFamilyDropdown);

            var trigger = _webDriver.FindElements(By.XPath(XPath_EmailSettings.FontFamilyDropdown)).FirstOrDefault();
            if (trigger is null)
            {
                return false;
            }

            ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                "arguments[0].scrollIntoView({block:'center', inline:'nearest'}); arguments[0].click();",
                trigger);

            bool opened = WaitForFontList();
            if (!opened)
            {
                try
                {
                    trigger.Click();
                }
                catch (ElementClickInterceptedException)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", trigger);
                }

                opened = WaitForFontList();
            }

            if (opened)
            {
                Thread.Sleep(400);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", trigger);
                WaitFor(
                    driver => driver.FindElements(By.XPath(XPath_EmailSettings.FontFamilyListBox))
                        .All(element => !element.Displayed),
                    3);
            }

            return opened;
        }

        private bool WaitForFontList()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath(XPath_EmailSettings.FontFamilyListBox))
                    .Any(element => element.Displayed)
                    || driver.FindElements(By.XPath(XPath_DataTable.ListBoxOption)).Any(element => element.Displayed),
                _menuTimeoutSeconds);
        }

        /// <summary>Reads the current display name so a later save can be restored.</summary>
        public void CaptureDisplayName()
        {
            var field = FindFirstDisplayed(XPath_EmailSettings.DisplayName, _menuTimeoutSeconds);
            OriginalDisplayName = field?.GetAttribute("value") ?? string.Empty;
        }

        /// <summary>Appends a suffix to Display name so Save has a real change.</summary>
        /// <param name="suffix">text appended to the current display name</param>
        public void UpdateDisplayName(string suffix)
        {
            CaptureDisplayName();
            string next = string.IsNullOrWhiteSpace(OriginalDisplayName)
                ? "Catholic Solutions" + suffix
                : OriginalDisplayName + suffix + DateTime.Now.ToString("HHmmss");
            SetValueByScript(XPath_EmailSettings.DisplayName, next);
        }

        /// <summary>Puts the captured display name back so the environment is left as it was found.</summary>
        public void RestoreDisplayName()
        {
            if (OriginalDisplayName.Length == 0)
            {
                return;
            }

            SetValueByScript(XPath_EmailSettings.DisplayName, OriginalDisplayName);
        }

        public SaveOutcome ClickSave()
        {
            ClickByScript(XPath_EmailSettings.BtnSave);
            return WaitForToast();
        }

        /// <summary>Cancel navigates back to Email Templates.</summary>
        public void ClickCancel()
        {
            ClickByScript(XPath_EmailSettings.BtnCancel);
        }

        public bool IsOnEmailTemplates()
        {
            return _webDriver.Url.Contains(XPath_EmailTemplates.TemplatesRoute, StringComparison.OrdinalIgnoreCase)
                || IsElementVisible(XPath_EmailTemplates.PageTitle, _pageLoadTimeoutSeconds);
        }

        private SaveOutcome WaitForToast()
        {
            string? reported = WaitFor(
                driver =>
                {
                    foreach (var element in driver.FindElements(By.XPath(XPath_DataTable.ToastBanner)))
                    {
                        if (element.Displayed && element.Text.Trim().Length > 0)
                        {
                            return element.Text.Trim();
                        }
                    }

                    return null;
                },
                _pageLoadTimeoutSeconds);

            if (reported is null)
            {
                return new SaveOutcome(false, $"no toast within {_pageLoadTimeoutSeconds}s");
            }

            bool failed = reported.Contains("Failed", StringComparison.OrdinalIgnoreCase)
                || reported.Contains("required", StringComparison.OrdinalIgnoreCase);
            return new SaveOutcome(!failed, reported);
        }
    }
}
