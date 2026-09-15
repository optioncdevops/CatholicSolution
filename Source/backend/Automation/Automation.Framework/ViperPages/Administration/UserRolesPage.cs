// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class UserRolesPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        private const int _feedbackGraceSeconds = 3;

        public string CurrentRoleName { get; private set; } = string.Empty;

        public string CurrentEditRoleName { get; private set; } = string.Empty;

        /// <summary>Opens the User Roles list from the nav bar.</summary>
        public void NavigateToUserRoles()
        {
            ClickAdminNavByRoute(XPath_UserRoles.RolesRoute);
            WaitForRolesList();
        }

        /// <summary>Waits for the User Roles list (or its empty state) to finish loading.</summary>
        /// <returns><c>true</c> when the page is on screen.</returns>
        public bool WaitForRolesList()
        {
            return IsElementVisible(XPath_UserRoles.PageTitle, _pageLoadTimeoutSeconds)
                && (IsElementVisible(XPath_UserRoles.AddUserRole, _pageLoadTimeoutSeconds)
                    || IsElementVisible(XPath_DataTable.EmptyGrid, _menuTimeoutSeconds));
        }

        /// <summary>Whether the list toolbar (search, columns, export) is on screen.</summary>
        public bool IsToolbarVisible()
        {
            return IsElementVisible(XPath_DataTable.GridSearch, _menuTimeoutSeconds)
                || IsElementVisible(XPath_DataTable.EmptyGrid, 2);
        }

        /// <summary>Searches an existing role that should already be in the catalog.</summary>
        /// <param name="searchValue">the role name to look for</param>
        /// <returns><c>true</c> when a matching row was left in the grid.</returns>
        public bool SearchExistingRole(string searchValue)
        {
            if (!IsElementVisible(XPath_DataTable.GridSearch, _menuTimeoutSeconds))
            {
                return false;
            }

            return SearchRole(searchValue);
        }

        /// <summary>Clears the grid search so every role is shown again.</summary>
        public void ClearSearch()
        {
            if (!IsElementVisible(XPath_DataTable.GridSearch, 2))
            {
                return;
            }

            SetValueByScript(XPath_DataTable.GridSearch, string.Empty);
            Thread.Sleep(500);
        }

        /// <summary>Opens the Columns menu and closes it again.</summary>
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

        /// <summary>Turns fullscreen on and back off.</summary>
        public void ToggleFullscreen()
        {
            if (ClickFirstDisplayed(XPath_DataTable.FullscreenToggle, _menuTimeoutSeconds))
            {
                Thread.Sleep(500);
                ClickFirstDisplayed(XPath_DataTable.FullscreenToggle, _menuTimeoutSeconds);
            }
        }

        /// <summary>Whether Edit is shown on the given role row.</summary>
        /// <param name="roleName">the role name whose action buttons to look for</param>
        /// <returns><c>true</c> when the edit action is on screen.</returns>
        public bool IsRowEditVisible(string roleName)
        {
            return IsElementVisible(XPath_UserRoles.EditInRow(roleName), _menuTimeoutSeconds);
        }

        /// <summary>Clicks Excel, Print, and CSV export. Print is dismissed with Escape so the native dialog does not stall the run.</summary>
        public void ClickAllExportActions()
        {
            ClickFirstDisplayed(XPath_DataTable.ExportExcel, _menuTimeoutSeconds);
            ClickFirstDisplayed(XPath_DataTable.ExportCsv, _menuTimeoutSeconds);
            if (ClickFirstDisplayed(XPath_DataTable.ExportPrint, 2))
            {
                Thread.Sleep(500);
                _webDriver.FindElement(By.TagName("body")).SendKeys(Keys.Escape);
            }
        }

        /// <summary>Changes Rows per page and returns it to 10.</summary>
        public void ChangeRowsPerPage()
        {
            var select = FindFirstDisplayed(XPath_DataTable.RowsPerPageSelect, 3);
            if (select is null)
            {
                return;
            }

            var options = select.FindElements(By.TagName("option"));
            string original = select.GetAttribute("value") ?? "10";
            var other = options.FirstOrDefault(option => option.GetAttribute("value") != original);
            if (other is not null)
            {
                other.Click();
                Thread.Sleep(500);
                foreach (var option in select.FindElements(By.TagName("option")))
                {
                    if (option.GetAttribute("value") == original)
                    {
                        option.Click();
                        break;
                    }
                }
            }
        }

        /// <summary>Clicks a sortable column header so the grid reorders.</summary>
        /// <param name="header">the visible header text, for example Name</param>
        public void SortByColumn(string header)
        {
            ClickFirstDisplayed(XPath_DataTable.ColumnHeader(header), _menuTimeoutSeconds);
            Thread.Sleep(500);
        }

        public void ClickOnAddUserRole()
        {
            ClickByScript(XPath_UserRoles.AddUserRole);
            IsElementVisible(XPath_UserRoles.RoleFormModal, _pageLoadTimeoutSeconds);
        }

        public bool IsRoleFormOpen()
        {
            return IsElementVisible(XPath_UserRoles.RoleFormModal, _menuTimeoutSeconds);
        }

        /// <summary>Fills the add-role form. A timestamp is appended so reruns do not collide.</summary>
        /// <param name="roleName">the role name prefix from test data</param>
        /// <param name="description">the description to enter</param>
        public void EnterRoleDetails(string roleName, string description)
        {
            CurrentRoleName = string.IsNullOrWhiteSpace(roleName)
                ? $"CFR-AutoRole-{DateTime.Now:HHmmss}"
                : $"{roleName}-{DateTime.Now:HHmmss}";

            SetValueByScriptById(XPath_UserRoles.txtRoleName, CurrentRoleName);
            SetValueByScriptById(XPath_UserRoles.txtDescription, description);
        }

        /// <summary>Cancels the add or edit modal without saving.</summary>
        public void ClickModalCancel()
        {
            ClickByScript(XPath_UserRoles.ModalCancel);
            WaitForModalToClose();
        }

        /// <summary>Submits the role form and waits for the list it returns to.</summary>
        /// <returns>Whether the save went through, and what the page said when it did not.</returns>
        public SaveOutcome ClickOnSaveAndWaitForList()
        {
            ClickByScript(XPath_UserRoles.ModalSave);

            string? reported = null;
            DateTime? graceEnd = null;

            var outcome = WaitFor(
                driver =>
                {
                    bool modalGone = driver.FindElements(By.XPath(XPath_UserRoles.RoleFormModal))
                        .All(element => !element.Displayed);
                    bool addVisible = driver.FindElements(By.XPath(XPath_UserRoles.AddUserRole))
                        .Any(element => element.Displayed);

                    if (modalGone && addVisible)
                    {
                        return new SaveOutcome(true, "the user roles list came back");
                    }

                    reported ??= ReadFirstDisplayedText(driver, XPath_DataTable.ToastBanner)
                        ?? ReadFirstDisplayedText(driver, XPath_UserRoles.FieldError);

                    if (reported is null)
                    {
                        return null;
                    }

                    graceEnd ??= DateTime.UtcNow.AddSeconds(_feedbackGraceSeconds);
                    return DateTime.UtcNow > graceEnd ? new SaveOutcome(false, reported) : null;
                },
                _pageLoadTimeoutSeconds);

            return outcome
                ?? new SaveOutcome(false, reported ?? $"the page reported nothing within {_pageLoadTimeoutSeconds}s");
        }

        public void ClickOnRoleEdit()
        {
            ClickByScript(RowScoped(XPath_UserRoles.EditInRow(CurrentRoleName), XPath_UserRoles.RowEdit));
            IsElementVisible(XPath_UserRoles.RoleFormModal, _pageLoadTimeoutSeconds);
        }

        public void ClickOnRoleDelete()
        {
            ClickByScript(RowScoped(XPath_UserRoles.DeleteInRow(CurrentRoleName), XPath_UserRoles.RowDelete));
            IsElementVisible(XPath_DataTable.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public void ClickOnRoleDeactivate()
        {
            ClickByScript(RowScoped(XPath_UserRoles.DeactivateInRow(CurrentRoleName), XPath_UserRoles.RowDeactivate));
            IsElementVisible(XPath_DataTable.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public void ClickOnRoleActivate()
        {
            ClickByScript(RowScoped(XPath_UserRoles.ActivateInRow(CurrentRoleName), XPath_UserRoles.RowActivate));
            Thread.Sleep(1000);
        }

        public bool IsDeactivateButtonVisible()
        {
            return IsElementVisible(XPath_UserRoles.DeactivateInRow(CurrentRoleName), 2)
                || IsElementVisible(XPath_UserRoles.RowDeactivate, 2);
        }

        public bool IsActivateButtonVisible()
        {
            return IsElementVisible(XPath_UserRoles.ActivateInRow(CurrentRoleName), 2)
                || IsElementVisible(XPath_UserRoles.RowActivate, 2);
        }

        private string RowScoped(string namedXPath, string fallbackXPath)
        {
            return string.IsNullOrWhiteSpace(CurrentRoleName) || !IsElementVisible(namedXPath, 2)
                ? fallbackXPath
                : namedXPath;
        }

        /// <summary>
        /// Changes the name and description on the edit form.
        /// </summary>
        /// <remarks>
        /// The form resets itself with the role it is editing, so it waits for the existing
        /// name to arrive first. Typing before that reset lands is silently undone by it.
        /// </remarks>
        /// <param name="editRoleName">the role name prefix to change to</param>
        /// <param name="editDescription">the description to change to</param>
        /// <returns><c>true</c> when the form had loaded and the new values were entered.</returns>
        public bool EditRoleDetails(string editRoleName, string editDescription)
        {
            if (!WaitForFieldToFill(XPath_UserRoles.txtRoleName))
            {
                return false;
            }

            CurrentEditRoleName = string.IsNullOrWhiteSpace(editRoleName)
                ? $"{CurrentRoleName}-Edit"
                : $"{editRoleName}-{DateTime.Now:HHmmss}";

            SetValueByScriptById(XPath_UserRoles.txtRoleName, CurrentEditRoleName);
            SetValueByScriptById(XPath_UserRoles.txtDescription, editDescription);
            CurrentRoleName = CurrentEditRoleName;
            return true;
        }

        public override void ClickDeleteConfirmYes()
        {
            ClickByScript(XPath_DataTable.DeleteConfirmYes);
            WaitForConfirmToClose();
        }

        public override void ClickDeleteConfirmNo()
        {
            ClickByScript(XPath_DataTable.DeleteConfirmNo);
            WaitForConfirmToClose();
        }

        /// <summary>Filters the grid down to the rows holding the given text.</summary>
        /// <param name="searchValue">the text to search the grid for</param>
        /// <returns><c>true</c> when a matching row was left in the grid.</returns>
        public bool SearchRole(string searchValue)
        {
            SetValueByScript(XPath_DataTable.GridSearch, searchValue);
            return IsElementVisible(XPath_DataTable.GridRowContaining(searchValue), _menuTimeoutSeconds);
        }

        /// <summary>Whether the grid still holds a row carrying the given text.</summary>
        /// <param name="searchValue">the text to look for</param>
        /// <returns><c>true</c> when such a row is on screen.</returns>
        public bool IsRoleInGrid(string searchValue)
        {
            return IsElementVisible(XPath_DataTable.GridRowContaining(searchValue), _menuTimeoutSeconds);
        }

        private bool WaitForFieldToFill(string id)
        {
            return WaitFor(
                driver => driver.FindElements(By.Id(id))
                    .Any(field => !string.IsNullOrEmpty(field.GetAttribute("value"))),
                _pageLoadTimeoutSeconds);
        }

        private void WaitForConfirmToClose()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_DataTable.DeleteConfirmPopup))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
        }

        private void WaitForModalToClose()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_UserRoles.RoleFormModal))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
        }

        private static string? ReadFirstDisplayedText(IWebDriver driver, string xPath)
        {
            foreach (var element in driver.FindElements(By.XPath(xPath)))
            {
                if (!element.Displayed)
                {
                    continue;
                }

                string text = string.Join(
                    " | ",
                    element.Text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

                if (text.Length > 0)
                {
                    return text;
                }
            }

            return null;
        }
    }
}
