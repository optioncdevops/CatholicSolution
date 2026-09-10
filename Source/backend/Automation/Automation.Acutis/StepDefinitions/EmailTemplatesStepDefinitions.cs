// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Administration;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class EmailTemplatesStepDefinitions(IWebDriver driver)
    {
        private readonly EmailTemplatesPage _templatesPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        private EmailTemplatesData Templates => _testData.EmailTemplates ?? new EmailTemplatesData();

        [Then(@"Click on Administration menu and select Email Template sub menu")]
        public void ThenClickOnAdministrationMenuAndSelectEmailTemplateSubMenu()
        {
            _templatesPage.NavigateToEmailTemplates();
        }

        [Then(@"Email Templates page should be opened")]
        public void ThenEmailTemplatesPageShouldBeOpened()
        {
            Assert.That(_templatesPage.WaitForTemplatesPage(), Is.True, "The Email Templates page did not open from the menu.");
            Assert.That(_templatesPage.IsTemplateEditorVisible(), Is.True, "The email template editor did not load.");
        }

        [Then(@"Search templates and then clear the search")]
        public void ThenSearchTemplatesAndThenClearTheSearch()
        {
            string search = Templates.SearchText ?? "Welcome";
            Assert.That(_templatesPage.SearchTemplates(search), Is.True, $"Searching templates for '{search}' showed nothing.");
            _templatesPage.ClearSearch();
        }

        [Then(@"Select each email template from the list")]
        public void ThenSelectEachEmailTemplateFromTheList()
        {
            int count = _templatesPage.SelectEachTemplate();
            Assert.That(count, Is.GreaterThan(0), "No email templates were listed.");
        }

        [Then(@"Select the target email template")]
        public void ThenSelectTheTargetEmailTemplate()
        {
            _templatesPage.SelectTemplate(Templates.TemplateName ?? "Welcome Email");
            Assert.That(_templatesPage.IsTemplateEditorVisible(), Is.True, "The selected template editor did not load.");
        }

        [Then(@"Edit the subject and Click on Preview and close the preview")]
        public void ThenEditTheSubjectAndClickOnPreviewAndCloseThePreview()
        {
            _templatesPage.EditSubject(Templates.SubjectSuffix ?? " - AutoTest");
            _templatesPage.ClickPreview();
            Assert.That(_templatesPage.IsPreviewOpen(), Is.True, "The template preview did not open.");
            _templatesPage.ClosePreview();
            Assert.That(_templatesPage.IsPreviewOpen(), Is.False, "The template preview did not close.");
        }

        [When(@"Click on Reset template")]
        public void WhenClickOnResetTemplate()
        {
            Assert.That(_templatesPage.ClickReset(), Is.True, "The Reset template confirmation did not open.");
        }

        [Then(@"Reset confirm box should open and Click on Cancel")]
        public void ThenResetConfirmBoxShouldOpenAndClickOnCancel()
        {
            _templatesPage.ConfirmResetNo();
        }

        [Then(@"Reset confirm box should open and Click on Confirm")]
        public void ThenResetConfirmBoxShouldOpenAndClickOnConfirm()
        {
            _templatesPage.ConfirmResetYes();
        }

        [Then(@"Insert a merge tag variable into the template")]
        public void ThenInsertAMergeTagVariableIntoTheTemplate()
        {
            _templatesPage.ClickInsertFirstVariable();
        }

        [Then(@"Edit the subject and click on Save template")]
        public void ThenEditTheSubjectAndClickOnSaveTemplate()
        {
            _templatesPage.EditSubject(Templates.SubjectSuffix ?? " - AutoTest");
            var outcome = _templatesPage.ClickSave();
            Assert.That(outcome.Saved, Is.True, $"The email template was not saved. The page said: {outcome.Detail}");
        }

        [Then(@"Restore the original subject and click on Save template")]
        public void ThenRestoreTheOriginalSubjectAndClickOnSaveTemplate()
        {
            _templatesPage.RestoreSubject();
            var outcome = _templatesPage.ClickSave();
            Assert.That(outcome.Saved, Is.True, $"The original email template subject was not restored. The page said: {outcome.Detail}");
        }

        [Then(@"Click on Send Test email")]
        public void ThenClickOnSendTestEmail()
        {
            var outcome = _templatesPage.ClickSendTest();
            Assert.That(outcome.Saved, Is.True, $"Send Test did not complete. The page said: {outcome.Detail}");
        }

        [Then(@"Click on Email Settings from Email Templates page")]
        public void ThenClickOnEmailSettingsFromEmailTemplatesPage()
        {
            _templatesPage.ClickEmailSettings();
        }

        [Then(@"Email Settings page should be opened from the shortcut")]
        public void ThenEmailSettingsPageShouldBeOpenedFromTheShortcut()
        {
            Assert.That(_templatesPage.IsOnEmailSettings(), Is.True, "Email Settings did not open from the Email Templates shortcut.");
        }

        public void RunEmailTemplatesProcess()
        {
            ThenClickOnAdministrationMenuAndSelectEmailTemplateSubMenu();
            ThenEmailTemplatesPageShouldBeOpened();
            ThenSearchTemplatesAndThenClearTheSearch();
            ThenSelectEachEmailTemplateFromTheList();
            ThenSelectTheTargetEmailTemplate();
            ThenEditTheSubjectAndClickOnPreviewAndCloseThePreview();
            WhenClickOnResetTemplate();
            ThenResetConfirmBoxShouldOpenAndClickOnCancel();
            ThenInsertAMergeTagVariableIntoTheTemplate();
            ThenEditTheSubjectAndClickOnSaveTemplate();
            ThenRestoreTheOriginalSubjectAndClickOnSaveTemplate();
            ThenClickOnSendTestEmail();
            ThenClickOnEmailSettingsFromEmailTemplatesPage();
            ThenEmailSettingsPageShouldBeOpenedFromTheShortcut();
        }
    }
}
