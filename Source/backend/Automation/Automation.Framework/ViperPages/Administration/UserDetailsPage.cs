// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    /// <summary>What came of submitting the user form.</summary>
    /// <param name="Saved">whether the save went through</param>
    /// <param name="Detail">what the page said, for a save that did not</param>
    public sealed record SaveOutcome(bool Saved, string Detail);

    public class UserDetailsPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        // The list reloads from the server after every save and delete, so the waits here
        // have to cover a round trip and not just a re-render.
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        // How long the list is still given after the page has said something about the save.
        private const int _feedbackGraceSeconds = 3;

        public void CheckPageTitle()
        {
            //Assert.AreEqual("Customer Directory", ReadElementValuesByXPath("//*[text()='Customer Directory']"));
        }

        /// <summary>The browser's current URL, e.g. to confirm a deep link's ?roleId= landed.</summary>
        public string CurrentUrl => _webDriver.Url;

        /// <summary>Whether the grid currently shows at least one row.</summary>
        public bool HasAnyGridRow()
        {
            return IsElementVisible(XPath_UserDetails.UsersGrid, _menuTimeoutSeconds);
        }

        /// <summary>Clicks the shared "Clear filter" action, if a filter is currently active.</summary>
        public void ClearRoleFilterIfPresent()
        {
            ClickFirstDisplayed(XPath_UserDetails.ClearFiltersButton, 2);
        }

        /// <summary>
        /// Opens the users list from the nav bar.
        /// </summary>
        /// <remarks>
        /// Which menu the entry sits under comes from the signed in role's menu data, and a
        /// group with no sub menus renders as a plain link rather than a drop down, so the
        /// bar is searched for the entry instead of a single menu being assumed.
        /// </remarks>
        public void ClickOnUserDetails()
        {
            // Right after login the top nav's menu items are still hydrating from the login
            // response, so this needs the same generous menu timeout used elsewhere in this
            // class - a 2s check here was too short and would give up on the top level "Users"
            // link before it had rendered, then wrongly report no menu leads to it at all.
            if (ClickFirstDisplayed(XPath_UserDetails.UserDetailsTopMenu, _menuTimeoutSeconds))
            {
                return;
            }

            int groupCount = _webDriver.FindElements(By.XPath(XPath_UserDetails.NavDropDownTrigger)).Count;
            for (int index = 1; index <= groupCount; index++)
            {
                ClickByScript($"({XPath_UserDetails.NavDropDownTrigger})[{index}]");
                if (ClickFirstDisplayed(XPath_UserDetails.UserDetailsMenu, _menuTimeoutSeconds))
                {
                    return;
                }
            }

            throw new NoSuchElementException(
                $"No menu in the top nav bar leads to '{XPath_UserDetails.UsersRoute}'. "
                + "Either the signed in role has no rights to the users page, or the route has moved.");
        }

        /// <summary>Waits for the users list to finish loading.</summary>
        /// <returns><c>true</c> when the list is on screen.</returns>
        public bool WaitForUsersList()
        {
            return IsElementVisible(XPath_UserDetails.AddNewUser, _pageLoadTimeoutSeconds);
        }

        /// <summary>Waits for the add or edit form to finish loading.</summary>
        /// <returns><c>true</c> when the form is on screen.</returns>
        public bool WaitForUserForm()
        {
            return IsElementVisible(XPath_UserDetails.UsersForm, _pageLoadTimeoutSeconds);
        }

        public void ClickOnAddUser()
        {
            ClickByScript(XPath_UserDetails.AddNewUser);
            WaitForUserForm();
        }

        /// <summary>
        /// Fills in the add user form.
        /// </summary>
        /// <remarks>
        /// Date of birth and role are as required as the four text fields are, so both are
        /// filled here. Leaving either out fails validation on submit rather than saving.
        /// </remarks>
        /// <param name="firstName">the first name to enter</param>
        /// <param name="lastName">the last name to enter</param>
        /// <param name="email">the email address to enter</param>
        /// <param name="emailPwd">the password to enter</param>
        /// <param name="dateOfBirth">the date of birth to enter, as dd/MM/yyyy</param>
        /// <param name="userRole">the role to pick, or empty to keep the one the form defaults to</param>
        public void EnterUserDetails(string firstName, string lastName, string email, string emailPwd, string dateOfBirth, string userRole)
        {
            SetValueByScriptById(XPath_UserDetails.txtfirstname, firstName);
            SetValueByScriptById(XPath_UserDetails.txtlastname, lastName);
            SetValueByScriptById(XPath_UserDetails.txtemail, email);
            SetValueByScriptById(XPath_UserDetails.txtpassword, emailPwd);
            SetDateByScriptById(XPath_UserDetails.txtdateofbirth, dateOfBirth);
            SelectUserRole(userRole);
        }

        /// <summary>
        /// Picks the role with the given name.
        /// </summary>
        /// <remarks>
        /// The roles are rows in the database rather than a fixed list, so a name that is
        /// not on this environment falls back to the first role offered instead of failing.
        /// The form pre-selects that role anyway, so an empty name is left alone.
        /// </remarks>
        /// <param name="userRole">the role to pick, or empty to keep the default</param>
        public void SelectUserRole(string userRole)
        {
            if (string.IsNullOrWhiteSpace(userRole))
            {
                return;
            }

            ClickByScript("//*[@id='" + XPath_UserDetails.rolename + "']");

            if (!ClickFirstDisplayed(XPath_UserDetails.ListBoxOption(XPath_UserDetails.rolename, userRole), 2))
            {
                ClickByScript(XPath_UserDetails.FirstListBoxOption(XPath_UserDetails.rolename));
            }
        }

        /// <summary>Opens the listbox with the given control id and picks the option with that text.</summary>
        /// <param name="controlId">the id of the dropdown control</param>
        /// <param name="optionText">the text of the option to pick</param>
        public void SelectListBoxOption(string controlId, string optionText)
        {
            ClickByScript("//*[@id='" + controlId + "']");
            ClickByScript(XPath_UserDetails.ListBoxOption(controlId, optionText));
        }

        /// <summary>Opens the listbox with the given control id and picks its first option.</summary>
        /// <param name="controlId">the id of the dropdown control</param>
        public void SelectFirstListBoxOption(string controlId)
        {
            ClickByScript("//*[@id='" + controlId + "']");
            ClickByScript(XPath_UserDetails.FirstListBoxOption(controlId));
        }

        /// <summary>
        /// Submits the form and waits for the list it returns to.
        /// </summary>
        /// <remarks>
        /// What the page says about a refused save is picked up as it happens rather than
        /// looked for afterwards. The toast that carries it clears itself after a few
        /// seconds, so waiting the list out first and only then asking why leaves nothing
        /// on screen to read, and the run reports a bare timeout instead of the reason.
        /// </remarks>
        /// <returns>Whether the save went through, and what the page said when it did not.</returns>
        public SaveOutcome ClickOnSaveAndWaitForList()
        {
            ClickOnSave();

            string? reported = null;
            DateTime? graceEnd = null;

            var outcome = WaitFor(
                driver =>
                {
                    if (driver.FindElements(By.XPath(XPath_UserDetails.AddNewUser)).Any(element => element.Displayed))
                    {
                        return new SaveOutcome(true, "the users list came back");
                    }

                    reported ??= ReadFirstDisplayedText(driver, XPath_UserDetails.ToastBanner)
                        ?? ReadFirstDisplayedText(driver, XPath_UserDetails.FieldError);

                    if (reported is null)
                    {
                        return null;
                    }

                    // A save that went through is announced by the same banner as one that
                    // did not, a beat before the list it navigates to renders, so the list
                    // is still given a moment after the message is read.
                    graceEnd ??= DateTime.UtcNow.AddSeconds(_feedbackGraceSeconds);
                    return DateTime.UtcNow > graceEnd ? new SaveOutcome(false, reported) : null;
                },
                _pageLoadTimeoutSeconds);

            return outcome
                ?? new SaveOutcome(false, reported ?? $"the page reported nothing within {_pageLoadTimeoutSeconds}s");
        }

        /// <summary>Reads the text of the first showing match, as one line.</summary>
        /// <param name="driver">the driver to look with</param>
        /// <param name="xPath">the xpath to look for</param>
        /// <returns>The text, or <c>null</c> when nothing showing matched.</returns>
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

        public override void ClickOnSave()
        {
            ClickByScript(XPath_UserDetails.Save);
        }

        public override void ClickOnCancel()
        {
            ClickByScript(XPath_UserDetails.Cancel);
        }

        public void ClickOnUserEdit()
        {
            ClickByScript(XPath_UserDetails.RowEdit);
            WaitForUserForm();
        }

        public void ClickOnUserDelete()
        {
            ClickByScript(XPath_UserDetails.RowDelete);
            IsElementVisible(XPath_UserDetails.DeleteConfirmPopup, _menuTimeoutSeconds);
        }

        public override void ClickDeleteConfirmYes()
        {
            ClickByScript(XPath_UserDetails.DeleteConfirmYes);
            WaitForConfirmToClose();
        }

        public override void ClickDeleteConfirmNo()
        {
            ClickByScript(XPath_UserDetails.DeleteConfirmNo);
            WaitForConfirmToClose();
        }

        /// <summary>Filters the grid down to the rows holding the given text.</summary>
        /// <remarks>
        /// The wait is on a row carrying the search text rather than a fixed sleep, so the
        /// row action that follows cannot land on whatever row the grid was showing before.
        /// </remarks>
        /// <param name="searchValue">the text to search the grid for</param>
        /// <returns><c>true</c> when a matching row was left in the grid.</returns>
        public bool SearchUser(string searchValue)
        {
            SetValueByScript(XPath_UserDetails.GridSearch, searchValue);
            return IsElementVisible(XPath_UserDetails.GridRowContaining(searchValue), _menuTimeoutSeconds);
        }

        /// <summary>Whether the grid still holds a row carrying the given text.</summary>
        /// <param name="searchValue">the text to look for</param>
        /// <returns><c>true</c> when such a row is on screen.</returns>
        public bool IsUserInGrid(string searchValue)
        {
            return IsElementVisible(XPath_UserDetails.GridRowContaining(searchValue), _menuTimeoutSeconds);
        }

        /// <summary>
        /// Changes the name on the edit form.
        /// </summary>
        /// <remarks>
        /// The form fetches the user it is editing and then resets itself with what comes
        /// back, so it waits for the existing name to arrive first. Typing before that reset
        /// lands is silently undone by it.
        /// </remarks>
        /// <param name="editFirstName">the first name to change to</param>
        /// <param name="editLastName">the last name to change to</param>
        /// <returns><c>true</c> when the form had loaded and the new name was entered.</returns>
        public bool EditUserDetails(string editFirstName, string editLastName)
        {
            if (!WaitForFieldToFill(XPath_UserDetails.txtfirstname))
            {
                return false;
            }

            SetValueByScriptById(XPath_UserDetails.txtfirstname, editFirstName);
            SetValueByScriptById(XPath_UserDetails.txtlastname, editLastName);
            return true;
        }

        /// <summary>Waits for a field to be filled in with the record being edited.</summary>
        /// <param name="id">the id of the field to watch</param>
        /// <returns><c>true</c> when the field held a value in time.</returns>
        private bool WaitForFieldToFill(string id)
        {
            return WaitFor(
                driver => driver.FindElements(By.Id(id))
                    .Any(field => !string.IsNullOrEmpty(field.GetAttribute("value"))),
                _pageLoadTimeoutSeconds);
        }

        /// <summary>Waits for the confirmation popup to go away.</summary>
        private void WaitForConfirmToClose()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_UserDetails.DeleteConfirmPopup))
                    .All(popup => !popup.Displayed),
                _menuTimeoutSeconds);
        }
    }
}
