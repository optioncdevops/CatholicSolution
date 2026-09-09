// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Administration
{
    public class AdminRequestsListPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        public void NavigateToAdminRequests()
        {
            FindElementByXPath(XPath_MenuAccess.TopMenu("Requests"));
            // Depending on how dynamic navigation works, we might need a small wait.
            Thread.Sleep(1000);
        }

        public void SelectStatusTab(string statusName)
        {
            string xpath = statusName.ToLower() switch
            {
                "all statuses" => XPath_AdminRequests.TabAllStatuses,
                "pending" => XPath_AdminRequests.TabPending,
                "approved" => XPath_AdminRequests.TabApproved,
                "rejected" => XPath_AdminRequests.TabRejected,
                "info requested" => XPath_AdminRequests.TabInfoRequested,
                _ => throw new ArgumentException($"Unknown status tab: {statusName}")
            };
            FindElementByXPath(xpath);
            Thread.Sleep(500); // Wait for the table to filter
        }

        public bool VerifyRequestsAreDisplayed()
        {
            try
            {
                var rows = _webDriver.FindElements(By.XPath(XPath_AdminRequests.DataTableRows));
                return rows.Count > 0;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public bool VerifyEmptyStateIsDisplayed()
        {
            try
            {
                var element = _webDriver.FindElement(By.XPath(XPath_AdminRequests.EmptyState));
                return element.Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }
    }
}
