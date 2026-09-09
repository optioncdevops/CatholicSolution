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

        public bool VerifyResultsOrEmptyState()
        {
            return WaitFor(driver => 
            {
                var rows = driver.FindElements(By.XPath(XPath_AdminRequests.DataTableRows));
                if (rows.Count > 0) return true;
                
                var emptyState = driver.FindElements(By.XPath(XPath_AdminRequests.EmptyState));
                if (emptyState.Count > 0) return true;
                
                return false;
            }, 10);
        }

        public void SelectApplicationFilter()
        {
            FindElementByXPath(XPath_AdminRequests.DropdownAppFilter);
            Thread.Sleep(500);
        }

        public void SelectOrganizationFilter()
        {
            FindElementByXPath(XPath_AdminRequests.DropdownOrgFilter);
            Thread.Sleep(500);
        }
    }
}
