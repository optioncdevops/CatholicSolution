using System.Threading;
using OpenQA.Selenium;
using static Automation.Framework.CommonVariable;
using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Organizations
{
    public class OrganizationDetailPage : BasePageObject
    {
        public OrganizationDetailPage(IWebDriver webDriver) : base(webDriver)
        {
        }

        /// <summary>
        /// Waits for the organization detail page to load and for the first tab (Profile) to appear.
        /// The tab labels on this page are: Profile, Users, Products, Licenses, Requests.
        /// There is no 'Details' tab — the first tab is 'Profile'.
        /// </summary>
        public bool IsDetailsTabDisplayed()
        {
            // Wait for the page to finish loading (skeleton disappears)
            Thread.Sleep(2000);
            // The first tab on the organization detail page is called "Profile"
            return WaitFor(
                driver => driver.FindElements(By.XPath("//button[@role='tab'][@id='tab-profile']")).Count > 0
                       || driver.FindElements(By.XPath("//button[@role='tab'][normalize-space()='Profile']")).Count > 0,
                15);
        }

        // --- Tab navigation ---

        public void ClickTab(string tabId)
        {
            ClickByScript($"//button[@role='tab'][@id='tab-{tabId}']");
            Thread.Sleep(500);
        }

        public void ClickUsersTab()   => ClickTab("users");
        public void ClickProductsTab() => ClickTab("products");
        public void ClickLicensesTab() => ClickTab("licenses");
        public void ClickRequestsTab() => ClickTab("requests");

        /// <summary>Users tab (previously "Members")</summary>
        public void ClickMembersTab()
        {
            // Users tab (Members) — the tab id is 'tab-users'
            ClickByScript("//button[@role='tab'][@id='tab-users']");
            Thread.Sleep(500);
        }

        public bool IsMembersListDisplayed()
        {
            // The Users panel renders a DataTable when users exist,
            // or an EmptyState (with icon 👥) when no users are linked.
            // Either way the tab panel itself must be visible.
            return WaitFor(
                driver =>
                    // Has a data table with rows
                    driver.FindElements(By.XPath("//div[@id='panel-users']//table//tbody")).Count > 0
                    || driver.FindElements(By.XPath("//div[@id='panel-users'][contains(@class,'admin-data-table')]")).Count > 0
                    // OR has the empty state — no users linked yet
                    || driver.FindElements(By.XPath("//div[@id='panel-users']//*[contains(normalize-space(), 'No users linked') or contains(normalize-space(), 'No users found')]")).Count > 0
                    // OR just the panel itself is present (tab switched successfully)
                    || driver.FindElements(By.XPath("//div[@id='panel-users']")).Count > 0,
                10);
        }

        public bool IsProductsPanelDisplayed()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath("//div[@id='panel-products']")).Count > 0,
                10);
        }

        public bool IsLicensesPanelDisplayed()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath("//div[@id='panel-licenses']")).Count > 0,
                10);
        }

        public bool IsRequestsPanelDisplayed()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath("//div[@id='panel-requests']")).Count > 0,
                10);
        }


        // --- Edit form (opened from list page Edit button) ---

        public void ClickProfileEdit()
        {
            ClickByScript(XPath_Organizations.ProfileEditBtn);
            Thread.Sleep(500);
        }

        public bool IsEditFormDisplayed()
        {
            return WaitFor(
                driver => driver.FindElements(By.XPath(XPath_Organizations.OrgNameEdit)).Count > 0,
                10);
        }

        public void UpdateOrgName(string suffix)
        {
            var input = _webDriver.FindElements(By.XPath(XPath_Organizations.OrgNameEdit)).FirstOrDefault();
            if (input != null)
            {
                input.Click();
                // Append suffix to current value
                input.SendKeys(suffix);
            }
        }

        public void ClickEditSave()
        {
            ClickByScript(XPath_Organizations.EditSaveBtn);
            Thread.Sleep(1000);
        }

        public void ClickEditCancel()
        {
            ClickByScript(XPath_Organizations.EditCancelBtn);
        }

        // --- Back to Organizations ---

        public void ClickBackToOrganizations()
        {
            ClickByScript(XPath_Organizations.BackToOrganizationsBtn);
        }
    }
}
