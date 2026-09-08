// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class UserDetailStepDefinitions(IWebDriver driver)
    {
        private readonly UserDetailsPage _userPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        [When(@"The Dashboard should be open")]
        public void WhenTheDashboardShouldBeOpen()
        {
        }

        [Then(@"Click on Administration menu and selct UserDetail Sub menu")]
        public void ThenClickOnAdministrationMenuAndSelctUserDetailSubMenu()
        {
            _userPage.ClickOnUserDetails();
        }

        [Then(@"UserDetail page should be opened and click on Addnewuser button")]
        public void ThenUserDetailPageShouldBeOpenedAndClickOnAddnewuserButton()
        {
            _userPage.ClickOnAddUser();
        }

        [Then(@"New user page should be opened and enter the basic info")]
        public void ThenNewUserPageShouldBeOpenedAndEnterTheBasicInfoOf()
        {
            _userPage.EnterUserDetails(_testData.UserDetails?.FirstName ?? string.Empty, _testData.UserDetails?.LastName ?? string.Empty, _testData.UserDetails?.EMail ?? string.Empty, _testData.UserDetails?.Password ?? string.Empty);
        }

        [Then(@"click on save button and the record should be saved")]
        public void ThenClickOnSaveButtonAndTheRecordShouldBeSaved()
        {
            _userPage.ClickOnSave();
        }

        [Then(@"Search Email and Click on Edit button and update the fields and click on save button")]
        public void ThenSearchAndClickOnEditButtonAndUpdateTheFieldsAndClickOnSaveButton()
        {
            _userPage.SearchUser(_testData.UserDetails?.EMail ?? string.Empty);
            _userPage.ClickOnUserEdit();
            _userPage.EditUserDetails(_testData.UserDetails?.FirstName ?? string.Empty, _testData.UserDetails?.LastName ?? string.Empty);
            _userPage.ClickOnSave();
        }

        [Then(@"Search Email and Click on Delete Button to delete the records")]
        public void ThenSearchAndClickOnDeleteButtonToDeleteTheRecords()
        {
            // The grid has to be filtered first so the row action hits the new user.
            _userPage.SearchUser(_testData.UserDetails?.EMail ?? string.Empty);
            _userPage.ClickOnUserDelete();
        }

        [Then(@"Delete Alert Confirm box should open and Click on the No button")]
        public void ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheNoButton()
        {
            _userPage.ClickDeleteConfirmNo();
        }

        [Then(@"Delete Alert Confirm Box should open and Click on the Yes button")]
        public void ThenDeleteAlertConfirmBoxShouldOpenAndClickOnTheYesButton()
        {
            _userPage.ClickDeleteConfirmYes();
        }
    }
}