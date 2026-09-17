// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class UserRightsPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        /// <summary>Opens the User Rights page from the nav bar.</summary>
        public void NavigateToUserRights()
        {
            ClickAdminNavByRoute(XPath_UserRights.RightsRoute);
            WaitForRightsPage();
        }

        /// <summary>The browser's current URL, e.g. to confirm a deep link's ?roleId= landed.</summary>
        public string CurrentUrl => _webDriver.Url;

        /// <summary>Reads the "Editing rights for {role}" banner, confirming which role is loaded.</summary>
        public string ReadEditingRightsForText()
        {
            return FindFirstDisplayed(XPath_UserRights.EditingRightsFor, _pageLoadTimeoutSeconds)?.Text ?? string.Empty;
        }

        /// <summary>Waits for the rights page (matrix, empty roles, or error) to finish loading.</summary>
        /// <returns><c>true</c> when the page is on screen.</returns>
        public bool WaitForRightsPage()
        {
            return IsElementVisible(XPath_UserRights.PageTitle, _pageLoadTimeoutSeconds);
        }

        public bool HasNoRolesEmptyState()
        {
            return IsElementVisible(XPath_UserRights.EmptyRoles, 2);
        }

        public bool IsRightsMatrixVisible()
        {
            return IsElementVisible(XPath_UserRights.RightsTable, _pageLoadTimeoutSeconds)
                || IsElementVisible(XPath_UserRights.EditingRightsFor, _menuTimeoutSeconds);
        }

        /// <summary>
        /// Picks the role with the given name. A name that is not on this environment falls
        /// back to the first role offered instead of failing.
        /// </summary>
        /// <param name="roleName">the role to pick, or empty to keep the default</param>
        public void SelectRole(string roleName)
        {
            if (HasNoRolesEmptyState())
            {
                return;
            }

            SelectDropdownOption(XPath_UserRights.RoleDropdown, roleName);
            WaitForMatrixToSettle();
        }

        /// <summary>Opens the Role dropdown and selects every role so each matrix loads.</summary>
        /// <param name="preferredRole">role to leave selected at the end, when it is in the list</param>
        /// <returns>How many roles were visited.</returns>
        public int SelectEachRole(string? preferredRole = null)
        {
            var labels = ReadDropdownOptions(XPath_UserRights.RoleDropdown);
            foreach (string label in labels)
            {
                SelectRole(label);
            }

            if (!string.IsNullOrWhiteSpace(preferredRole) && labels.Contains(preferredRole))
            {
                SelectRole(preferredRole);
            }

            return labels.Count;
        }

        /// <summary>Filters the matrix down to the given module, or the first module when the name is missing.</summary>
        /// <param name="moduleName">the module label to pick</param>
        public void SelectModule(string moduleName)
        {
            SelectDropdownOption(XPath_UserRights.ModuleDropdown, moduleName);
            Thread.Sleep(800);
        }

        /// <summary>Opens the Module dropdown and selects every module, including All Modules.</summary>
        /// <returns>How many modules were visited.</returns>
        public int SelectEachModule()
        {
            var labels = ReadDropdownOptions(XPath_UserRights.ModuleDropdown);
            foreach (string label in labels)
            {
                SelectModule(label);
                WaitFor(
                    driver => driver.FindElements(By.XPath(XPath_UserRights.RightsTable)).Any(element => element.Displayed)
                        || driver.FindElements(By.XPath("//*[normalize-space()='No matches']")).Any(element => element.Displayed),
                    _menuTimeoutSeconds);
            }

            return labels.Count;
        }

        /// <summary>Changes Rows per page and returns it to the original value.</summary>
        public void ChangeRowsPerPage()
        {
            var select = FindFirstDisplayed(XPath_DataTable.RowsPerPageSelect, 3);
            if (select is null)
            {
                return;
            }

            string original = select.GetAttribute("value") ?? "10";
            var other = select.FindElements(By.TagName("option"))
                .FirstOrDefault(option => option.GetAttribute("value") != original);
            other?.Click();
            Thread.Sleep(400);
            foreach (var option in select.FindElements(By.TagName("option")))
            {
                if (option.GetAttribute("value") == original)
                {
                    option.Click();
                    break;
                }
            }
        }

        /// <summary>Clicks Access, Read Only (when the row has it), and Denied on the first permission group.</summary>
        public void ClickEachPermissionOnFirstRow()
        {
            ClickFirstDisplayed(XPath_UserRights.FirstAccessButton, 3);
            ClickFirstDisplayed(XPath_UserRights.FirstReadOnlyButton, 2);
            ClickFirstDisplayed(XPath_UserRights.FirstDeniedButton, 3);
            ClickFirstDisplayed(XPath_UserRights.FirstAccessButton, 3);
        }

        private void SelectDropdownOption(string controlId, string optionText)
        {
            OpenDropdown(controlId);

            if (!string.IsNullOrWhiteSpace(optionText)
                && ClickFirstDisplayed(XPath_UserDetails.ListBoxOption(controlId, optionText), 2))
            {
                return;
            }

            ClickFirstDisplayed(XPath_UserDetails.FirstListBoxOption(controlId), 2);
        }

        private void OpenDropdown(string controlId)
        {
            string trigger = "//*[@id='" + controlId + "']";
            ScrollIntoView(trigger);
            ClickByScript(trigger);
            IsElementVisible($"//div[@id='{controlId}-listbox']", _menuTimeoutSeconds);
        }

        private List<string> ReadDropdownOptions(string controlId)
        {
            OpenDropdown(controlId);
            var labels = new List<string>();
            foreach (var option in _webDriver.FindElements(By.XPath($"//div[@id='{controlId}-listbox']//button[@role='option']")))
            {
                string text = option.Text.Trim();
                if (text.Length > 0 && !labels.Contains(text))
                {
                    labels.Add(text);
                }
            }

            // Re-click the trigger so the next SelectDropdownOption starts from a closed menu.
            ClickByScript("//*[@id='" + controlId + "']");
            Thread.Sleep(300);
            return labels;
        }

        public void ClickClearFilters()
        {
            ClickByScript(XPath_UserRights.ClearFilters);
            WaitForMatrixToSettle();
        }

        /// <summary>Expands or collapses the first tree row that has children.</summary>
        public void ToggleFirstTreeRow()
        {
            ClickFirstDisplayed(XPath_UserRights.FirstExpand, _menuTimeoutSeconds);
            Thread.Sleep(500);
        }

        /// <summary>Queues a Read Only (or Access, if Read Only is not on that row) change without saving.</summary>
        public void ChangeFirstRowPermission()
        {
            if (!ClickFirstDisplayed(XPath_UserRights.FirstReadOnlyButton, 3))
            {
                ClickFirstDisplayed(XPath_UserRights.FirstAccessButton, _menuTimeoutSeconds);
            }
        }

        /// <summary>Saves queued permission changes.</summary>
        public SaveOutcome ClickSave()
        {
            ClickByScript(XPath_UserRights.Save);
            return WaitForToastOrMatrix();
        }

        /// <summary>
        /// Opens the Apply to all confirmation for the given level.
        /// Confirming is not done here: applying Denied (or Access) across every module
        /// would change production rights for the selected role.
        /// </summary>
        /// <param name="level">Access, Read Only, or Denied</param>
        public void ClickApplyToAll(string level)
        {
            string xpath = level.ToLowerInvariant() switch
            {
                "access" => XPath_UserRights.ApplyAllAccess,
                "read only" or "readonly" => XPath_UserRights.ApplyAllReadOnly,
                "denied" => XPath_UserRights.ApplyAllDenied,
                _ => XPath_UserRights.ApplyAllAccess,
            };

            ClickByScript(xpath);
            IsElementVisible(XPath_DataTable.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public bool IsApplyToAllConfirmOpen()
        {
            return IsElementVisible(XPath_DataTable.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public void CancelApplyToAll()
        {
            ClickByScript(XPath_DataTable.DeleteConfirmNo);
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_DataTable.DeleteConfirmPopup))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
        }

        public bool SearchRights(string searchValue)
        {
            if (!IsElementVisible(XPath_DataTable.GridSearch, _menuTimeoutSeconds))
            {
                return false;
            }

            SetValueByScript(XPath_DataTable.GridSearch, searchValue);
            return IsElementVisible(XPath_DataTable.GridRowContaining(searchValue), _menuTimeoutSeconds)
                || IsElementVisible(XPath_DataTable.EmptyGrid, 3);
        }

        public bool ToggleColumnsMenu()
        {
            if (!ClickFirstDisplayed(XPath_DataTable.ColumnsButton, _menuTimeoutSeconds))
            {
                return false;
            }

            bool opened = IsElementVisible(XPath_DataTable.ColumnsDialog, _menuTimeoutSeconds);
            if (IsElementVisible(XPath_DataTable.ColumnsCancel, 2))
            {
                ClickByScript(XPath_DataTable.ColumnsCancel);
            }
            else
            {
                ClickFirstDisplayed(XPath_DataTable.ColumnsButton, 2);
            }

            return opened;
        }

        private void WaitForMatrixToSettle()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_UserRights.RightsTable)).Any(element => element.Displayed)
                    || driver.FindElements(By.XPath(XPath_UserRights.EmptyRoles)).Any(element => element.Displayed),
                _pageLoadTimeoutSeconds);
            Thread.Sleep(800);
        }

        private SaveOutcome WaitForToastOrMatrix()
        {
            string? reported = WaitFor(
                driver =>
                {
                    foreach (var element in driver.FindElements(By.XPath(XPath_DataTable.ToastBanner)))
                    {
                        if (!element.Displayed)
                        {
                            continue;
                        }

                        string text = element.Text.Trim();
                        if (text.Length > 0)
                        {
                            return text;
                        }
                    }

                    return null;
                },
                _pageLoadTimeoutSeconds);

            WaitForMatrixToSettle();
            return reported is null
                ? new SaveOutcome(true, "the rights matrix reloaded")
                : new SaveOutcome(!reported.Contains("Failed", StringComparison.OrdinalIgnoreCase), reported);
        }
    }
}
