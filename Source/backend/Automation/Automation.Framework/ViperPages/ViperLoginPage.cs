// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    public class ViperLoginPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        public void SendLoginCredential(string username, string password)
        {
            FindElementById(XPath_Login.txtEmailAddress, username);
            FindElementById(XPath_Login.txtPassword, password);
        }

        public void ClickOnLogin()
        {
            FindElementByXPath(XPath_Login.SignIn);
            Thread.Sleep(1000);
        }

        public void ClickOnLogout()
        {
            FindElementById(XPath_Menus.liLogout);
        }

        public void LoginProcess(JsonLogin jsonLogin)
        {
            ArgumentNullException.ThrowIfNull(jsonLogin);

            OpenWebDriver(jsonLogin.URL ?? string.Empty);
            FindElementById(XPath_Login.username, jsonLogin.UserName ?? string.Empty);
            FindElementById(XPath_Login.password, jsonLogin.Password ?? string.Empty);
            FindElementByXPath(XPath_Login.SignIn);
        }
    }
}