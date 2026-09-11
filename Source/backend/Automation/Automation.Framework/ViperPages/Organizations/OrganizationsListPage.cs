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
    }
}
