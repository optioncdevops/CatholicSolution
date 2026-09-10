// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class EmailTemplatesPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        /// <summary>Opens Email Templates from the nav bar.</summary>
        public void NavigateToEmailTemplates()
        {
            ClickAdminNavByRoute(XPath_EmailTemplates.TemplatesRoute);
            WaitForTemplatesPage();
        }

        public bool WaitForTemplatesPage()
        {
            return IsElementVisible(XPath_EmailTemplates.PageTitle, _pageLoadTimeoutSeconds)
                && IsElementVisible(XPath_EmailTemplates.SearchTemplates, _pageLoadTimeoutSeconds);
        }

        public bool IsTemplateEditorVisible()
        {
            return IsElementVisible(XPath_EmailTemplates.SubjectInput, _pageLoadTimeoutSeconds)
                || IsElementVisible(XPath_EmailTemplates.BtnPreview, _menuTimeoutSeconds);
        }

        /// <summary>Filters the template list by the given text.</summary>
        /// <param name="searchValue">the text to search for</param>
        /// <returns><c>true</c> when a matching template, or the empty-search state, is shown.</returns>
        public bool SearchTemplates(string searchValue)
        {
            SetValueByScript(XPath_EmailTemplates.SearchTemplates, searchValue);
            Thread.Sleep(500);
            return IsElementVisible(XPath_EmailTemplates.TemplateItem, 3)
                || IsElementVisible(XPath_EmailTemplates.NoTemplatesMatch, 3);
        }

        public void ClearSearch()
        {
            SetValueByScript(XPath_EmailTemplates.SearchTemplates, string.Empty);
            Thread.Sleep(500);
        }

        public string OriginalSubject { get; private set; } = string.Empty;

        /// <summary>Selects the template with the given visible label, or the first template when it is missing.</summary>
        /// <param name="templateName">the visible title, for example Welcome Email</param>
        public void SelectTemplate(string templateName)
        {
            if (!string.IsNullOrWhiteSpace(templateName)
                && ClickFirstDisplayed(XPath_EmailTemplates.TemplateItemByLabel(templateName), 3))
            {
                WaitForEditor();
                CaptureSubject();
                return;
            }

            ClickFirstDisplayed(XPath_EmailTemplates.TemplateItem, _menuTimeoutSeconds);
            WaitForEditor();
            CaptureSubject();
        }

        public void CaptureSubject()
        {
            var field = FindFirstDisplayed(XPath_EmailTemplates.SubjectInput, _menuTimeoutSeconds);
            OriginalSubject = field?.GetAttribute("value") ?? string.Empty;
        }

        /// <summary>Puts the captured subject back so the environment is left as it was found.</summary>
        public void RestoreSubject()
        {
            if (OriginalSubject.Length == 0)
            {
                return;
            }

            SetValueByScript(XPath_EmailTemplates.SubjectInput, OriginalSubject);
        }

        /// <summary>Clicks every template in the list so each editor loads.</summary>
        public int SelectEachTemplate()
        {
            int count = _webDriver.FindElements(By.XPath(XPath_EmailTemplates.TemplateItem)).Count;
            for (int index = 1; index <= count; index++)
            {
                ClickByScript($"({XPath_EmailTemplates.TemplateItem})[{index}]");
                WaitForEditor();
            }

            return count;
        }

        /// <summary>Appends a suffix to the subject so Reset and Save have something to act on.</summary>
        /// <param name="suffix">text appended to the current subject</param>
        /// <returns>The subject after the change.</returns>
        public string EditSubject(string suffix)
        {
            var field = FindFirstDisplayed(XPath_EmailTemplates.SubjectInput, _menuTimeoutSeconds);
            string current = field?.GetAttribute("value") ?? string.Empty;
            string next = current + suffix;
            SetValueByScript(XPath_EmailTemplates.SubjectInput, next);
            return next;
        }

        public void ClickInsertFirstVariable()
        {
            ClickFirstDisplayed(XPath_EmailTemplates.InsertVariableTag, _menuTimeoutSeconds);
        }

        public void ClickPreview()
        {
            ClickByScript(XPath_EmailTemplates.BtnPreview);
            IsElementVisible(XPath_EmailTemplates.PreviewModal, _menuTimeoutSeconds);
        }

        public bool IsPreviewOpen()
        {
            return IsElementVisible(XPath_EmailTemplates.PreviewModal, _menuTimeoutSeconds);
        }

        public void ClosePreview()
        {
            ClickByScript(XPath_EmailTemplates.PreviewClose);
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_EmailTemplates.PreviewModal))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
        }

        public bool ClickReset()
        {
            if (!ClickFirstDisplayed(XPath_EmailTemplates.BtnReset, _menuTimeoutSeconds))
            {
                return false;
            }

            return IsElementVisible(XPath_DataTable.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public void ConfirmResetYes()
        {
            ClickByScript(XPath_DataTable.DeleteConfirmYes);
            WaitForConfirmToClose();
        }

        public void ConfirmResetNo()
        {
            ClickByScript(XPath_DataTable.DeleteConfirmNo);
            WaitForConfirmToClose();
        }

        public SaveOutcome ClickSave()
        {
            ClickByScript(XPath_EmailTemplates.BtnSave);
            return WaitForToast();
        }

        public SaveOutcome ClickSendTest()
        {
            ClickByScript(XPath_EmailTemplates.BtnSendTest);
            return WaitForToast();
        }

        /// <summary>Opens Email Settings from the header shortcut on this page.</summary>
        public void ClickEmailSettings()
        {
            if (!ClickFirstDisplayed(XPath_EmailTemplates.EmailSettingsLink, 2))
            {
                ClickByScript(XPath_EmailTemplates.EmailSettingsButton);
            }
        }

        public bool IsOnEmailSettings()
        {
            return _webDriver.Url.Contains(XPath_EmailSettings.SettingsRoute, StringComparison.OrdinalIgnoreCase)
                || IsElementVisible(XPath_EmailSettings.PageTitle, _pageLoadTimeoutSeconds);
        }

        private void WaitForEditor()
        {
            IsElementVisible(XPath_EmailTemplates.SubjectInput, _pageLoadTimeoutSeconds);
            Thread.Sleep(500);
        }

        private void WaitForConfirmToClose()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_DataTable.DeleteConfirmPopup))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
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
