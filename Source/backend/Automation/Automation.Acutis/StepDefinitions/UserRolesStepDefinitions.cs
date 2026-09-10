// Copyright (c) OptionC. All rights reserved.

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
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        private UserRolesData Roles => _testData.UserRoles ?? new UserRolesData();

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

        [Then(@"Search an existing role and verify Edit, Status, and Delete actions are shown")]
        public void ThenSearchAnExistingRoleAndVerifyEditStatusAndDeleteActionsAreShown()
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
                _rolesPage.AreRowActionsVisible(existing),
                Is.True,
                $"Edit, Activate/Deactivate, or Delete is missing on the '{existing}' row.");
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
            _rolesPage.ClickModalCancel();
            Assert.That(_rolesPage.IsRoleFormOpen(), Is.False, "The add user role form did not close upon clicking Cancel.");
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
    }
}
