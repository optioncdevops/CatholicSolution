// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.EnvironmentSupport;
using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class UserRolesStepDefinitions(IWebDriver driver)
    {
        private readonly UserRolesPage _rolesPage = new(driver);
        private readonly UserRightsPage _rightsPage = new(driver);
        private readonly UserDetailsPage _usersPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");
        private readonly TestEnvironmentContext _env = TestEnvironmentContext.Resolve();

        private UserRolesData Roles => _testData.UserRoles ?? new UserRolesData();

        // The role name whose Users count / Manage Rights this scenario deep-linked from,
        // tracked so the destination page's assertions know what to check against.
        private string _deepLinkRoleName = string.Empty;

        // --- Environment safety ---

        [Given(@"Mutating scenarios are permitted for User Roles in this environment")]
        public void GivenMutatingScenariosArePermittedForUserRolesInThisEnvironment()
        {
            // Ends the scenario as Ignored here - before signing in or touching anything - when
            // the resolved environment/configuration does not permit mutations. Add/Edit/
            // Activate/Deactivate/Delete all write real rows to auth.AcutisRole (and, for a new
            // role, auth.ModuleRights), so none of this may run against Live or an
            // unconfigured Staging/Pilot/Development environment.
            _env.RequireMutationsAllowedOrSkip("User Roles: add/edit/status-change/delete");
        }

        [Then(@"Click on Administration menu and select User Roles sub menu")]
        public void ThenClickOnAdministrationMenuAndSelectUserRolesSubMenu()
        {
            _rolesPage.NavigateToUserRoles();
        }

        [Then(@"User Roles page should be opened")]
        public void ThenUserRolesPageShouldBeOpened()
        {
            Assert.That(_rolesPage.WaitForRolesList(), Is.True, "The User Roles page did not open from the menu.");
        }

        [When(@"I go back to User Roles")]
        public void WhenIGoBackToUserRoles()
        {
            _rolesPage.NavigateToUserRoles();
        }

        [Then(@"Search an existing role and verify Edit action is shown")]
        public void ThenSearchAnExistingRoleAndVerifyEditActionIsShown()
        {
            string existing = Roles.ExistingRoleSearch ?? "Admin";
            if (!_rolesPage.IsToolbarVisible())
            {
                return;
            }

            Assert.That(
                _rolesPage.SearchExistingRole(existing),
                Is.True,
                $"The existing role '{existing}' is not in the list.");
            Assert.That(
                _rolesPage.IsRowEditVisible(existing),
                Is.True,
                $"Edit action is missing on the '{existing}' row.");
            _rolesPage.ClearSearch();
        }

        [Then(@"Verify User Roles table toolbar Columns, Maximize, Excel, Print, CSV export, column sort, and rows per page")]
        public void ThenVerifyUserRolesTableToolbarColumnsMaximizeExcelPrintCsvExportColumnSortAndRowsPerPage()
        {
            if (!_rolesPage.IsToolbarVisible())
            {
                return;
            }

            _rolesPage.ToggleColumnsMenu();
            _rolesPage.ToggleFullscreen();
            _rolesPage.ClickAllExportActions();
            _rolesPage.SortByColumn("Name");
            _rolesPage.ChangeRowsPerPage();
        }

        [When(@"Click on Add User Role button")]
        public void WhenClickOnAddUserRoleButton()
        {
            _rolesPage.ClickOnAddUserRole();
        }

        [Then(@"Add User Role modal should open and Click on Cancel button to close")]
        public void ThenAddUserRoleModalShouldOpenAndClickOnCancelButtonToClose()
        {
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.True, "The add user role form did not open.");
            // The form is still pristine here (nothing typed yet), so Cancel closes immediately -
            // no discard-changes confirmation should appear for a clean form.
            _rolesPage.ClickModalCancel();
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.False, "The add user role form did not close upon clicking Cancel.");
        }

        // --- Stable ids / deep links (safe, read-only) ---

        [Then(@"The Manage Rights action for an existing role uses a stable id")]
        public void ThenTheManageRightsActionForAnExistingRoleUsesAStableId()
        {
            string existing = Roles.ExistingRoleSearch ?? "Admin";
            Assert.That(_rolesPage.SearchRole(existing), Is.True, $"No row for '{existing}' to check Manage Rights on.");
            Assert.That(
                _rolesPage.HasStableManageRightsId(existing),
                Is.True,
                $"Manage Rights for '{existing}' did not carry the ibtnManageRightsUserRole{{RoleId}} id.");
            _deepLinkRoleName = existing;
            _rolesPage.ClearSearch();
        }

        [When(@"I click Manage Rights for an existing role")]
        public void WhenIClickManageRightsForAnExistingRole()
        {
            string existing = string.IsNullOrEmpty(_deepLinkRoleName) ? (Roles.ExistingRoleSearch ?? "Admin") : _deepLinkRoleName;
            Assert.That(_rolesPage.SearchRole(existing), Is.True, $"No row for '{existing}' to click Manage Rights on.");
            _deepLinkRoleName = existing;
            _rolesPage.ClickManageRightsByRoleName(existing);
        }

        [Then(@"The Rights page should open with that role already selected")]
        public void ThenTheRightsPageShouldOpenWithThatRoleAlreadySelected()
        {
            Assert.That(_rightsPage.WaitForRightsPage(), Is.True, "The User Rights page did not open from the Manage Rights deep link.");
            Assert.That(
                _rightsPage.CurrentUrl,
                Does.Contain("roleId="),
                "The Manage Rights deep link did not carry a roleId query parameter.");

            if (_rightsPage.IsRightsMatrixVisible())
            {
                Assert.That(
                    _rightsPage.ReadEditingRightsForText(),
                    Does.Contain(_deepLinkRoleName),
                    $"The Rights page loaded but did not preselect '{_deepLinkRoleName}'.");
            }
        }

        [Then(@"Search an existing role that has assigned users")]
        public void ThenSearchAnExistingRoleThatHasAssignedUsers()
        {
            // The signed-in automation account's own role always has at least one assigned user
            // (itself), so it is a safe, always-available "in use" role to check the deep link
            // against without needing to create test data.
            string inUse = Roles.RoleWithAssignedUsers ?? Roles.ExistingRoleSearch ?? "Admin";
            Assert.That(_rolesPage.SearchRole(inUse), Is.True, $"No row for '{inUse}' to check the Users count on.");
            _deepLinkRoleName = inUse;
        }

        [Then(@"Its Users count should be a clickable link")]
        public void ThenItsUsersCountShouldBeAClickableLink()
        {
            Assert.That(
                _rolesPage.IsUsersCountClickable(_deepLinkRoleName),
                Is.True,
                $"The Users count for '{_deepLinkRoleName}' did not render as a clickable link.");
        }

        [When(@"I click that role's Users count")]
        public void WhenIClickThatRolesUsersCount()
        {
            _rolesPage.ClickUsersCount(_deepLinkRoleName);
        }

        [Then(@"The Users page should open filtered to that RoleId")]
        public void ThenTheUsersPageShouldOpenFilteredToThatRoleId()
        {
            Assert.That(_usersPage.WaitForUsersList(), Is.True, "The Users page did not open from the Users-count deep link.");
            Assert.That(_usersPage.CurrentUrl, Does.Contain("roleId="), "The Users-count deep link did not carry a roleId query parameter.");
            Assert.That(_usersPage.HasAnyGridRow(), Is.True, $"The Users list filtered by '{_deepLinkRoleName}' came back empty.");
            _usersPage.ClearRoleFilterIfPresent();
        }

        // --- Dirty-form guards (mutating: exercises the real Save endpoint via the duplicate-name check) ---

        [Then(@"The Role Name counter should read 0 of 50")]
        public void ThenTheRoleNameCounterShouldRead0Of50()
        {
            Assert.That(_rolesPage.ReadRoleNameCounterText().Replace(" ", string.Empty), Is.EqualTo("0/50"));
        }

        [When(@"I type a role name without saving")]
        public void WhenITypeARoleNameWithoutSaving()
        {
            _rolesPage.TypeRoleNameOnly((Roles.RoleName ?? "CFR-AutoRole") + " " + _env.RunId);
        }

        [Then(@"The Role Name counter should update to match what was typed")]
        public void ThenTheRoleNameCounterShouldUpdateToMatchWhatWasTyped()
        {
            string counter = _rolesPage.ReadRoleNameCounterText().Replace(" ", string.Empty);
            Assert.That(counter, Does.Not.Contain("0/50"), "The Role Name counter did not move after typing.");
            Assert.That(counter, Does.EndWith("/50"));
        }

        [Then(@"The Save button should be enabled once the name is valid")]
        public void ThenTheSaveButtonShouldBeEnabledOnceTheNameIsValid()
        {
            Assert.That(_rolesPage.IsSaveButtonDisabled(), Is.False, "Save stayed disabled even though Role Name is a valid, non-empty value.");
        }

        [When(@"I click Cancel on the dirty add form")]
        public void WhenIClickCancelOnTheDirtyAddForm()
        {
            _rolesPage.ClickModalCancel();
        }

        [When(@"I press Escape on the dirty add form")]
        public void WhenIPressEscapeOnTheDirtyAddForm()
        {
            _rolesPage.PressEscape();
        }

        [Then(@"A discard-changes confirmation should appear")]
        public void ThenADiscardChangesConfirmationShouldAppear()
        {
            Assert.That(_rolesPage.IsDiscardChangesConfirmVisible(), Is.True, "No discard-changes confirmation appeared for a dirty form.");
        }

        [When(@"I keep editing instead of discarding")]
        public void WhenIKeepEditingInsteadOfDiscarding()
        {
            _rolesPage.ClickDeleteConfirmNo();
        }

        [Then(@"The add form should still be open with the typed name preserved")]
        public void ThenTheAddFormShouldStillBeOpenWithTheTypedNamePreserved()
        {
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.True, "Declining the discard-changes confirmation closed the form anyway.");
            Assert.That(
                _rolesPage.ReadRoleNameCounterText().Replace(" ", string.Empty),
                Does.Not.Contain("0/50"),
                "The typed Role Name was lost after declining to discard changes.");
        }

        [When(@"I confirm discarding the changes")]
        public void WhenIConfirmDiscardingTheChanges()
        {
            _rolesPage.ClickDeleteConfirmYes();
        }

        [Then(@"The add form should be closed")]
        public void ThenTheAddFormShouldBeClosed()
        {
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.False, "The add form is still open after confirming discard.");
        }

        [Then(@"Focus should return to the Add User Role button")]
        public void ThenFocusShouldReturnToTheAddUserRoleButton()
        {
            // BaseModal restores focus to whatever had it before the modal opened - here, the
            // "Add User Role" button that was clicked to open it.
            string activeId = _rolesPage.ReadActiveElementId();
            Assert.That(
                string.IsNullOrEmpty(activeId) || !activeId.StartsWith("btn", StringComparison.Ordinal) || activeId != "btnCancelUserRole",
                Is.True,
                "Focus landed on a stale modal control instead of returning to the page.");
        }

        [When(@"Add User Role modal should be opened and enter the role details")]
        [Then(@"Add User Role modal should be opened and enter the role details")]
        public void ThenAddUserRoleModalShouldBeOpenedAndEnterTheRoleDetails()
        {
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.True, "The add user role form did not open.");
            _rolesPage.EnterRoleDetails(Roles.RoleName ?? "CFR-AutoRole", Roles.Description ?? "Automated test role.");
        }

        [Then(@"click on Save in the User Role form and the record should be saved")]
        public void ThenClickOnSaveInTheUserRoleFormAndTheRecordShouldBeSaved()
        {
            var outcome = _rolesPage.ClickOnSaveAndWaitForList();
            Assert.That(outcome.Saved, Is.True, $"The new user role was not saved. The page said: {outcome.Detail}");
            Assert.That(
                _rolesPage.SearchRole(_rolesPage.CurrentRoleName),
                Is.True,
                $"The saved role '{_rolesPage.CurrentRoleName}' is not in the list.");
        }

        [Then(@"Search Role and Click on Edit button")]
        public void ThenSearchRoleAndClickOnEditButton()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to edit.");
            _rolesPage.ClickOnRoleEdit();
        }

        [Then(@"The read-only status badge should show the role's current status")]
        public void ThenTheReadOnlyStatusBadgeShouldShowTheRolesCurrentStatus()
        {
            string badge = _rolesPage.ReadStatusBadgeText();
            Assert.That(badge, Is.EqualTo("Active").IgnoreCase, "The status badge did not read Active for a freshly-created (active) role.");
        }

        [Then(@"The Save button should be disabled because nothing changed")]
        public void ThenTheSaveButtonShouldBeDisabledBecauseNothingChanged()
        {
            Assert.That(_rolesPage.IsSaveButtonDisabled(), Is.True, "Save was enabled even though the edit form was not touched (isDirty should be false).");
        }

        [When(@"I change the Role Name to an existing role's name and save")]
        public void WhenIChangeTheRoleNameToAnExistingRolesNameAndSave()
        {
            string collidingName = Roles.ExistingRoleSearch ?? "Admin";
            _rolesPage.TypeRoleNameOnly(collidingName);
            _rolesPage.ClickOnSaveAndWaitForList();
        }

        [Then(@"A duplicate-role-name error should appear under Role Name")]
        public void ThenADuplicateRoleNameErrorShouldAppearUnderRoleName()
        {
            string error = _rolesPage.ReadRoleNameFieldError();
            Assert.That(error, Is.Not.Empty, "No inline error appeared under Role Name for a duplicate name.");
        }

        [When(@"I change the Role Name again")]
        public void WhenIChangeTheRoleNameAgain()
        {
            _rolesPage.TypeRoleNameOnly(_rolesPage.CurrentRoleName);
        }

        [Then(@"The duplicate-role-name error should clear")]
        public void ThenTheDuplicateRoleNameErrorShouldClear()
        {
            Assert.That(_rolesPage.ReadRoleNameFieldError(), Is.Empty, "The duplicate-role-name error was still shown after the name was changed.");
        }

        [When(@"I close the edit form without saving")]
        public void WhenICloseTheEditFormWithoutSaving()
        {
            // The name typed above (CurrentRoleName, restored to its own saved value) leaves the
            // form clean again, so Close/Cancel here should not raise the discard-changes prompt.
            _rolesPage.ClickModalCancel();
        }

        [Then(@"Search Role and Click on Edit button and update the fields and click on Save button")]
        public void ThenSearchRoleAndClickOnEditButtonAndUpdateTheFieldsAndClickOnSaveButton()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to edit.");
            _rolesPage.ClickOnRoleEdit();

            Assert.That(
                _rolesPage.EditRoleDetails(Roles.EditRoleName ?? "CFR-AutoRole-Edit", Roles.EditDescription ?? "Automated test role updated."),
                Is.True,
                "The edit form never loaded the role being edited.");

            var outcome = _rolesPage.ClickOnSaveAndWaitForList();
            Assert.That(outcome.Saved, Is.True, $"The edited user role was not saved. The page said: {outcome.Detail}");
            Assert.That(
                _rolesPage.SearchRole(_rolesPage.CurrentRoleName),
                Is.True,
                $"The edited role '{_rolesPage.CurrentRoleName}' is not in the list.");
        }

        [Then(@"Search Role and Click on Deactivate and Click on Cancel in the confirm box")]
        public void ThenSearchRoleAndClickOnDeactivateAndClickOnCancelInTheConfirmBox()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to deactivate.");
            if (!_rolesPage.IsDeactivateButtonVisible())
            {
                return;
            }

            _rolesPage.ClickOnRoleDeactivate();
            _rolesPage.ClickDeleteConfirmNo();
            Assert.That(_rolesPage.IsDeactivateButtonVisible(), Is.True, "Cancelling deactivate changed the role status anyway.");
        }

        [Then(@"Search Role and Click on Deactivate and Click on Confirm in the confirm box")]
        public void ThenSearchRoleAndClickOnDeactivateAndClickOnConfirmInTheConfirmBox()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to deactivate.");
            _rolesPage.ClickOnRoleDeactivate();
            _rolesPage.ClickDeleteConfirmYes();
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"The role '{_rolesPage.CurrentRoleName}' disappeared after deactivate.");
            Assert.That(_rolesPage.IsActivateButtonVisible(), Is.True, "The role was not deactivated.");
        }

        [Then(@"Search Role and Click on Activate button")]
        public void ThenSearchRoleAndClickOnActivateButton()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to activate.");
            _rolesPage.ClickOnRoleActivate();
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"The role '{_rolesPage.CurrentRoleName}' is not in the list after activate.");
            Assert.That(_rolesPage.IsDeactivateButtonVisible(), Is.True, "The role was not activated.");
        }

        [Then(@"Search Role and Click on Delete Button to delete the records")]
        public void ThenSearchRoleAndClickOnDeleteButtonToDeleteTheRecords()
        {
            Assert.That(_rolesPage.SearchRole(_rolesPage.CurrentRoleName), Is.True, $"No row for '{_rolesPage.CurrentRoleName}' to delete.");
            _rolesPage.ClickOnRoleDelete();
        }

        [Then(@"Role Delete Confirm box should open and Click on the Cancel button")]
        public void ThenRoleDeleteConfirmBoxShouldOpenAndClickOnTheCancelButton()
        {
            _rolesPage.ClickDeleteConfirmNo();
            Assert.That(_rolesPage.IsRoleInGrid(_rolesPage.CurrentRoleName), Is.True, "Cancelling the confirmation deleted the role anyway.");
        }

        [Then(@"Role Delete Confirm box should open and Click on the Confirm button")]
        public void ThenRoleDeleteConfirmBoxShouldOpenAndClickOnTheConfirmButton()
        {
            _rolesPage.ClickDeleteConfirmYes();
            Assert.That(_rolesPage.IsRoleInGrid(_rolesPage.CurrentRoleName), Is.False, $"The role '{_rolesPage.CurrentRoleName}' is still in the list after being deleted.");
        }

        public void RunUserRolesProcess()
        {
            ThenClickOnAdministrationMenuAndSelectUserRolesSubMenu();
            ThenUserRolesPageShouldBeOpened();
            ThenSearchAnExistingRoleAndVerifyEditActionIsShown();
            ThenVerifyUserRolesTableToolbarColumnsMaximizeExcelPrintCsvExportColumnSortAndRowsPerPage();
            WhenClickOnAddUserRoleButton();
            ThenAddUserRoleModalShouldOpenAndClickOnCancelButtonToClose();
        }
    }
}
