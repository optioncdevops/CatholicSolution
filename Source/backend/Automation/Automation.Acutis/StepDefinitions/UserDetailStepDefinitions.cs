// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class UserDetailStepDefinitions(IWebDriver driver)
    {
        private readonly UserDetailsPage _userPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        private UserDetails User => _testData.UserDetails ?? new UserDetails();

        private string Email => User.EMail ?? string.Empty;

        [When(@"The Dashboard should be open")]
        public void WhenTheDashboardShouldBeOpen()
        {
        }

        [Then(@"Click on Administration menu and selct UserDetail Sub menu")]
        public void ThenClickOnAdministrationMenuAndSelctUserDetailSubMenu()
        {
            _userPage.ClickOnUserDetails();
            Assert.That(_userPage.WaitForUsersList(), Is.True, "The users list did not open from the menu.");
        }

        [Then(@"UserDetail page should be opened and click on Addnewuser button")]
        public void ThenUserDetailPageShouldBeOpenedAndClickOnAddnewuserButton()
        {
            _userPage.ClickOnAddUser();
            Assert.That(_userPage.WaitForUserForm(), Is.True, "The add user form did not open.");
        }

        [Then(@"New user page should be opened and enter the basic info")]
        public void ThenNewUserPageShouldBeOpenedAndEnterTheBasicInfoOf()
        {
            _userPage.EnterUserDetails(
                User.FirstName ?? string.Empty,
                User.LastName ?? string.Empty,
                Email,
                User.Password ?? string.Empty,
                User.DateOfBirth ?? string.Empty,
                User.UserRole ?? string.Empty);
        }

        [Then(@"click on save button and the record should be saved")]
        public void ThenClickOnSaveButtonAndTheRecordShouldBeSaved()
        {
            // The form returns to the list only once the save succeeds, so still being on
            // the form is how a rejected save - a duplicate email, a missed required field -
            // shows up. Without this the scenario carried on and failed further along.
            var outcome = _userPage.ClickOnSaveAndWaitForList();
            Assert.That(outcome.Saved, Is.True, $"The new user was not saved. The page said: {outcome.Detail}");

            Assert.That(_userPage.SearchUser(Email), Is.True, $"The saved user '{Email}' is not in the list.");
        }

        [Then(@"Search Email and Click on Edit button and update the fields and click on save button")]
        public void ThenSearchAndClickOnEditButtonAndUpdateTheFieldsAndClickOnSaveButton()
        {
            Assert.That(_userPage.SearchUser(Email), Is.True, $"No row for '{Email}' to edit.");
            _userPage.ClickOnUserEdit();

            Assert.That(
                _userPage.EditUserDetails(User.EditFirstName ?? string.Empty, User.EditLastName ?? string.Empty),
                Is.True,
                "The edit form never loaded the user being edited.");

            var outcome = _userPage.ClickOnSaveAndWaitForList();
            Assert.That(outcome.Saved, Is.True, $"The edited user was not saved. The page said: {outcome.Detail}");
        }

        [Then(@"Search Email and Click on Delete Button to delete the records")]
        public void ThenSearchAndClickOnDeleteButtonToDeleteTheRecords()
        {
            // The grid has to be filtered first so the row action hits the new user.
            Assert.That(_userPage.SearchUser(Email), Is.True, $"No row for '{Email}' to delete.");
            _userPage.ClickOnUserDelete();
        }

        [Then(@"Delete Alert Confirm box should open and Click on the No button")]
        public void ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheNoButton()
        {
            _userPage.ClickDeleteConfirmNo();
            Assert.That(_userPage.IsUserInGrid(Email), Is.True, "Cancelling the confirmation deleted the user anyway.");
        }

        [Then(@"Delete Alert Confirm Box should open and Click on the Yes button")]
        public void ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheYesButton()
        {
            _userPage.ClickDeleteConfirmYes();
            Assert.That(_userPage.IsUserInGrid(Email), Is.False, $"The user '{Email}' is still in the list after being deleted.");
        }

        public void RunUserDetailProcess()
        {
            WhenTheDashboardShouldBeOpen();
            ThenClickOnAdministrationMenuAndSelctUserDetailSubMenu();
            ThenUserDetailPageShouldBeOpenedAndClickOnAddnewuserButton();
            ThenNewUserPageShouldBeOpenedAndEnterTheBasicInfoOf();
            ThenClickOnSaveButtonAndTheRecordShouldBeSaved();
            ThenSearchAndClickOnEditButtonAndUpdateTheFieldsAndClickOnSaveButton();
            ThenSearchAndClickOnDeleteButtonToDeleteTheRecords();
            ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheNoButton();
            ThenSearchAndClickOnDeleteButtonToDeleteTheRecords();
            ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheYesButton();
        }
    }
}
