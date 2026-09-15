// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class UserRightsStepDefinitions(IWebDriver driver)
    {
        private readonly UserRightsPage _rightsPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        private UserRightsData Rights => _testData.UserRights ?? new UserRightsData();

        [Then(@"Click on Administration menu and select Rights sub menu")]
        public void ThenClickOnAdministrationMenuAndSelectRightsSubMenu()
        {
            _rightsPage.NavigateToUserRights();
        }

        [Then(@"User Rights page should be opened")]
        public void ThenUserRightsPageShouldBeOpened()
        {
            Assert.That(_rightsPage.WaitForRightsPage(), Is.True, "The User Rights page did not open from the menu.");
        }

        [Then(@"Select each role from the Role dropdown")]
        public void ThenSelectEachRoleFromTheRoleDropdown()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            int count = _rightsPage.SelectEachRole(Rights.RoleName);
            Assert.That(count, Is.GreaterThan(0), "The Role dropdown had no options.");
            Assert.That(_rightsPage.IsRightsMatrixVisible(), Is.True, "The rights matrix did not load after selecting roles.");
        }

        [Then(@"Select each module from the Module dropdown")]
        public void ThenSelectEachModuleFromTheModuleDropdown()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            int count = _rightsPage.SelectEachModule();
            Assert.That(count, Is.GreaterThan(0), "The Module dropdown had no options.");
        }

        [Then(@"Change User Rights rows per page")]
        public void ThenChangeUserRightsRowsPerPage()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ChangeRowsPerPage();
        }

        [Then(@"Click Access, Read Only, and Denied on the first permission row")]
        public void ThenClickAccessReadOnlyAndDeniedOnTheFirstPermissionRow()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ClickEachPermissionOnFirstRow();
        }

        [Then(@"Click on Clear Filters and verify the rights matrix is shown")]
        public void ThenClickOnClearFiltersAndVerifyTheRightsMatrixIsShown()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ClickClearFilters();
            Assert.That(_rightsPage.IsRightsMatrixVisible(), Is.True, "The rights matrix was not shown after clearing filters.");
        }

        [Then(@"Toggle the first tree row expand or collapse")]
        public void ThenToggleTheFirstTreeRowExpandOrCollapse()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ToggleFirstTreeRow();
        }

        [Then(@"Search the rights matrix and open the Columns menu")]
        public void ThenSearchTheRightsMatrixAndOpenTheColumnsMenu()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.SearchRights("Dashboard");
            _rightsPage.ToggleColumnsMenu();
        }

        [When(@"Change the first row permission")]
        public void WhenChangeTheFirstRowPermission()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ChangeFirstRowPermission();
        }

        [When(@"Click on Save to persist the rights changes")]
        [Then(@"Click on Save to persist the rights changes")]
        public void ThenClickOnSaveToPersistTheRightsChanges()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            var outcome = _rightsPage.ClickSave();
            Assert.That(outcome.Saved, Is.True, $"The user rights were not saved. The page said: {outcome.Detail}");
        }

        [When(@"Click on Apply to all Access")]
        public void WhenClickOnApplyToAllAccess()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ClickApplyToAll("Access");
        }

        [When(@"Click on Apply to all Read Only")]
        public void WhenClickOnApplyToAllReadOnly()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ClickApplyToAll("Read Only");
        }

        [When(@"Click on Apply to all Denied")]
        public void WhenClickOnApplyToAllDenied()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            _rightsPage.ClickApplyToAll("Denied");
        }

        [Then(@"Apply to all confirm box should open and Click on Cancel")]
        public void ThenApplyToAllConfirmBoxShouldOpenAndClickOnCancel()
        {
            if (_rightsPage.HasNoRolesEmptyState())
            {
                return;
            }

            Assert.That(_rightsPage.IsApplyToAllConfirmOpen(), Is.True, "Apply to all did not open a confirmation.");
            _rightsPage.CancelApplyToAll();
        }

        public void RunUserRightsProcess()
        {
            ThenClickOnAdministrationMenuAndSelectRightsSubMenu();
            ThenUserRightsPageShouldBeOpened();
            ThenSelectEachRoleFromTheRoleDropdown();
            ThenSelectEachModuleFromTheModuleDropdown();
            ThenChangeUserRightsRowsPerPage();
            ThenClickAccessReadOnlyAndDeniedOnTheFirstPermissionRow();
            ThenClickOnClearFiltersAndVerifyTheRightsMatrixIsShown();
            ThenToggleTheFirstTreeRowExpandOrCollapse();
            ThenSearchTheRightsMatrixAndOpenTheColumnsMenu();
            WhenChangeTheFirstRowPermission();
            ThenClickOnSaveToPersistTheRightsChanges();
            WhenClickOnApplyToAllAccess();
            ThenApplyToAllConfirmBoxShouldOpenAndClickOnCancel();
            WhenClickOnApplyToAllReadOnly();
            ThenApplyToAllConfirmBoxShouldOpenAndClickOnCancel();
            WhenClickOnApplyToAllDenied();
            ThenApplyToAllConfirmBoxShouldOpenAndClickOnCancel();
        }
    }
}
