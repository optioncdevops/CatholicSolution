// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class EmailSettingsStepDefinitions(IWebDriver driver)
    {
        private readonly EmailSettingsPage _settingsPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        private EmailSettingsData Settings => _testData.EmailSettings ?? new EmailSettingsData();

        [Then(@"Click on Administration menu and select Email Settings sub menu")]
        public void ThenClickOnAdministrationMenuAndSelectEmailSettingsSubMenu()
        {
            _settingsPage.NavigateToEmailSettings();
        }

        [Then(@"Email Settings page should be opened")]
        public void ThenEmailSettingsPageShouldBeOpened()
        {
            Assert.That(_settingsPage.WaitForSettingsPage(), Is.True, "The Email Settings page did not open from the menu.");
        }

        [Then(@"SMTP Server and Branding sections should be visible")]
        public void ThenSmtpServerAndBrandingSectionsShouldBeVisible()
        {
            Assert.That(_settingsPage.AreSectionsVisible(), Is.True, "The SMTP Server or Branding section was missing.");
        }

        [Then(@"Toggle Send mail enabled and SSL switches and restore them")]
        public void ThenToggleSendMailEnabledAndSslSwitchesAndRestoreThem()
        {
            _settingsPage.ToggleSendMailEnabled();
            _settingsPage.ToggleSsl();
        }

        [Then(@"Open the Font family dropdown and close it")]
        public void ThenOpenTheFontFamilyDropdownAndCloseIt()
        {
            Assert.That(_settingsPage.OpenAndCloseFontFamily(), Is.True, "The Font family dropdown did not open.");
        }

        [When(@"Update the Display name and click on Save")]
        public void WhenUpdateTheDisplayNameAndClickOnSave()
        {
            _settingsPage.UpdateDisplayName(Settings.DisplayNameSuffix ?? " AutoTest");
            var outcome = _settingsPage.ClickSave();
            Assert.That(outcome.Saved, Is.True, $"Email settings were not saved. The page said: {outcome.Detail}");
        }

        [Then(@"Email settings should be saved")]
        public void ThenEmailSettingsShouldBeSaved()
        {
            Assert.That(_settingsPage.WaitForSettingsPage(), Is.True, "Email Settings left the page after save.");
        }

        [Then(@"Restore the original Display name and click on Save")]
        public void ThenRestoreTheOriginalDisplayNameAndClickOnSave()
        {
            _settingsPage.RestoreDisplayName();
            var outcome = _settingsPage.ClickSave();
            Assert.That(outcome.Saved, Is.True, $"The original display name was not restored. The page said: {outcome.Detail}");
        }

        [When(@"Click on Cancel on Email Settings")]
        public void WhenClickOnCancelOnEmailSettings()
        {
            _settingsPage.ClickCancel();
        }

        [Then(@"Email Templates page should be opened from Email Settings cancel")]
        public void ThenEmailTemplatesPageShouldBeOpenedFromEmailSettingsCancel()
        {
            Assert.That(_settingsPage.IsOnEmailTemplates(), Is.True, "Cancel on Email Settings did not return to Email Templates.");
        }
    }
}
