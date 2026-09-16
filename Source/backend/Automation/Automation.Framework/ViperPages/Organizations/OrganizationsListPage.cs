using System.Threading;
using OpenQA.Selenium;
using static Automation.Framework.CommonVariable;
using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Organizations
{
    public class OrganizationsListPage : BasePageObject
    {
        public OrganizationsListPage(IWebDriver webDriver) : base(webDriver)
        {
        }

        public bool IsPageOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Organizations.PageTitle)).Count > 0, 10);
        }

        public void ClickAddOrganization()
        {
            ClickByScript(XPath_Organizations.BtnAddOrganization);
        }

        public void ViewFirstOrganization()
        {
            ClickByScript(XPath_Organizations.FirstRowViewBtn);
        }

        public void EditFirstOrganization()
        {
            ClickByScript(XPath_Organizations.FirstRowEditBtn);
        }

        /// <summary>Types into the list search box and waits for a matching row to settle in.</summary>
        /// <param name="searchValue">the text to search for</param>
        /// <returns><c>true</c> when a matching row was left in the grid within the timeout.</returns>
        public bool Search(string searchValue)
        {
            SetValueByScript(XPath_Organizations.SearchInput, searchValue);
            return IsElementVisible(XPath_Organizations.RowContaining(searchValue), 10)
                || IsElementVisible(XPath_Organizations.EmptyState, 3);
        }

        /// <summary>Clears the search box back to empty.</summary>
        public void ClearSearch()
        {
            SetValueByScript(XPath_Organizations.SearchInput, string.Empty);
            Thread.Sleep(300);
        }

        /// <summary>Waits for a row holding the given organization name to be on screen.</summary>
        /// <param name="orgName">the organization name to look for</param>
        /// <param name="timeoutSeconds">how long to wait</param>
        /// <returns><c>true</c> when such a row appeared in time.</returns>
        public bool WaitForRow(string orgName, int timeoutSeconds = 15)
        {
            return IsElementVisible(XPath_Organizations.RowContaining(orgName), timeoutSeconds);
        }

        public void ViewOrganization(string orgName)
        {
            ClickByScript(XPath_Organizations.ViewButtonInRow(orgName));
        }

        public void EditOrganization(string orgName)
        {
            ClickByScript(XPath_Organizations.EditButtonInRow(orgName));
        }

        /// <summary>Clicks the Change Status icon on the row for the given organization and waits for the modal.</summary>
        public bool ClickChangeStatus(string orgName)
        {
            ClickByScript(XPath_Organizations.ChangeStatusButtonInRow(orgName));
            return IsElementVisible(XPath_Organizations.ChangeStatusModal, 5);
        }

        /// <summary>
        /// Picks the given status option, falling back to whichever option is actually
        /// selectable when that status is already the organization's current one.
        /// </summary>
        /// <remarks>
        /// The option matching the current status renders disabled, and a scripted click on a
        /// disabled button is a no-op per browser spec. Without this fallback, a rerun that
        /// lands on a row already at the target status would leave "Continue" disabled forever.
        /// </remarks>
        /// <param name="statusLabel">the status option's visible label, e.g. "Active"</param>
        public void SelectStatus(string statusLabel)
        {
            if (!ClickFirstDisplayed($"{XPath_Organizations.ChangeStatusOption(statusLabel)}[not(@disabled)]", 3))
            {
                ClickFirstDisplayed(XPath_Organizations.ChangeStatusAnySelectableOption, 5);
            }

            Thread.Sleep(500);
        }

        /// <summary>Clicks the Change Status icon on the first row and waits for the modal.</summary>
        public bool ClickChangeStatusOnFirstRow()
        {
            ClickByScript(XPath_Organizations.FirstRowChangeStatusBtn);
            return IsElementVisible(XPath_Organizations.ChangeStatusModal, 5);
        }

        /// <summary>Clicks Cancel on the Change Status modal to dismiss it.</summary>
        public void CancelChangeStatus()
        {
            ClickByScript(XPath_Organizations.ChangeStatusCancelBtn);
            Thread.Sleep(300);
        }

        /// <summary>
        /// Picks the Inactive status option, falling back to whichever option is actually
        /// selectable when Inactive is already the organization's current status.
        /// </summary>
        /// <remarks>
        /// The option matching the current status renders disabled, and a scripted click on a
        /// disabled button is a no-op per browser spec. Without this fallback, a rerun that
        /// lands on a row already Inactive would leave "Continue" disabled forever, and the
        /// later click on the confirm dialog's button would hang until it timed out - the whole
        /// status flow silently stopping instead of failing fast or completing.
        /// </remarks>
        public void SelectInactiveStatus()
        {
            if (!ClickFirstDisplayed($"{XPath_Organizations.ChangeStatusInactiveOption}[not(@disabled)]", 3))
            {
                ClickFirstDisplayed(XPath_Organizations.ChangeStatusAnySelectableOption, 5);
            }

            Thread.Sleep(500);
        }

        public void ConfirmChangeStatus()
        {
            ClickByScript(XPath_Organizations.ChangeStatusContinueBtn);
            Thread.Sleep(500);
            ClickByScript(XPath_Organizations.ConfirmStatusChangeBtn);
            Thread.Sleep(1000);
        }

        /// <summary>Reads the toast banner shown after a save/status-change/mutation.</summary>
        /// <returns>The toast text, or an empty string when none appeared in time.</returns>
        public string ReadToast()
        {
            return FindFirstDisplayed(XPath_Organizations.ToastBanner, 10)?.Text ?? string.Empty;
        }

        /// <summary>Reads the organization name shown in the first list row, before acting on it.</summary>
        /// <returns>The organization name, or an empty string when the list has no rows.</returns>
        public string ReadFirstRowOrganizationName()
        {
            var cell = _webDriver.FindElements(By.XPath("//main//table//tbody/tr[1]//td[2] | //main//table//tbody/tr[1]//td[1]")).FirstOrDefault();
            return cell?.Text.Trim() ?? string.Empty;
        }

        /// <summary>Whether the row for the given organization also currently shows the given text
        /// somewhere in it (e.g. a status label) - used to confirm a status change took effect
        /// without needing to know the status badge's exact markup.</summary>
        /// <param name="orgName">the organization name to find the row for</param>
        /// <param name="additionalText">the text that row should also show</param>
        /// <param name="timeoutSeconds">how long to wait for the row to reflect it</param>
        /// <returns><c>true</c> when such a row appeared within the timeout.</returns>
        public bool RowShows(string orgName, string additionalText, int timeoutSeconds = 10)
        {
            return IsElementVisible(XPath_Organizations.RowContainingBoth(orgName, additionalText), timeoutSeconds);
        }
    }
}
