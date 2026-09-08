// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class UserDetailsPage(IWebDriver webDriver): BasePageObject(webDriver)
    {
        public void CheckPageTitle()
        {
            //Assert.AreEqual("Customer Directory", ReadElementValuesByXPath("//*[text()='Customer Directory']"));
        }

        public void ClickOnUserDetails()
        {
            ClickByScript(XPath_UserDetails.AdministrationMenu);
            ClickByScript(XPath_UserDetails.UserDetailsMenu);
        }

        public void ClickOnAddUser()
        {
            ClickByScript(XPath_UserDetails.AddNewUser);
            Thread.Sleep(1000);
        }

        public void EnterUserDetails(string firstName, string lastName, string email, string emailPwd)
        {
            SetValueByScriptById(XPath_UserDetails.txtfirstname, firstName);
            SetValueByScriptById(XPath_UserDetails.txtlastname, lastName);
            SetValueByScriptById(XPath_UserDetails.txtemail, email);
            SetValueByScriptById(XPath_UserDetails.txtpassword, emailPwd);

            // Access Level and User Role are required and are custom listboxes, not select tags.
            SelectFirstListBoxOption(XPath_UserDetails.accesslevel);
            SelectListBoxOption(XPath_UserDetails.rolename, "Admin");
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
        }

        public void ClickOnUserDelete()
        {
            ClickByScript(XPath_UserDetails.RowDelete);
        }

        public override void ClickDeleteConfirmYes()
        {
            ClickByScript(XPath_UserDetails.DeleteConfirmYes);
        }

        public override void ClickDeleteConfirmNo()
        {
            ClickByScript(XPath_UserDetails.DeleteConfirmNo);
        }

        public void SearchUser(string searchValue)
        {
            SetValueByScript(XPath_UserDetails.GridSearch, searchValue);
            Thread.Sleep(2000);
        }

        public void EditUserDetails(string editFirstName, string editLastName)
        {
            SetValueByScriptById(XPath_UserDetails.txtfirstname, editFirstName);
            SetValueByScriptById(XPath_UserDetails.txtlastname, editLastName);
        }

        public void UserDetailsProcess(string firstName, string lastName, string email, string emailPwd, string editFirstName, string editLastName)
        {
            ClickOnUserDetails();
            ClickOnAddUser();
            ClickOnCancel();
            ClickOnAddUser();
            EnterUserDetails(firstName, lastName, email, emailPwd);
            ClickOnSave();
            SearchUser(email);
            ClickOnUserEdit();
            EditUserDetails(editFirstName, editLastName);
            ClickOnSave();
            ClickOnUserDelete();
            ClickDeleteConfirmNo();
            ClickOnUserDelete();
            ClickDeleteConfirmYes();
        }
    }
}
