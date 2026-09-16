using OpenQA.Selenium;
using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Organizations
{
    /// <summary>
    /// Page object for /admin/organizations/{orgId}/members/{authUserId} - a fully read-only
    /// page (no Edit/Unlink action of its own) showing one member's profile, their membership in
    /// this organization, and their effective application access.
    /// </summary>
    public class OrganizationMemberDetailPage : BasePageObject
    {
        public OrganizationMemberDetailPage(IWebDriver webDriver) : base(webDriver)
        {
        }

        /// <summary>Waits for the page's three read-only cards to be on screen.</summary>
        /// <returns><c>true</c> when the page settled within the timeout.</returns>
        public bool IsLoaded()
        {
            return IsElementVisible(XPath_Organizations.MemberDetailProfileHeading, 10)
                && IsElementVisible(XPath_Organizations.MemberDetailMembershipHeading, 5);
        }

        /// <summary>Whether the Effective Application Access card shows the app-access table's own heading.</summary>
        /// <returns><c>true</c> when the heading appeared within the timeout.</returns>
        public bool IsAppAccessCardDisplayed()
        {
            return IsElementVisible(XPath_Organizations.MemberDetailAppAccessHeading, 5);
        }

        /// <summary>Whether at least one row of effective app access is shown.</summary>
        public bool HasAnyAppAccessRow()
        {
            return IsElementVisible(XPath_Organizations.MemberDetailAppAccessRows, 3);
        }

        /// <summary>Whether the "No effective app access" empty state is shown instead.</summary>
        public bool IsAppAccessEmpty()
        {
            return IsElementVisible(XPath_Organizations.MemberDetailEmptyAppAccess, 3);
        }

        /// <summary>Clicks the "Back to {organization name}" button, returning to the organization detail page.</summary>
        public void ClickBackToOrganization()
        {
            ClickByScript(XPath_Organizations.MemberDetailBackBtn);
        }
    }
}
