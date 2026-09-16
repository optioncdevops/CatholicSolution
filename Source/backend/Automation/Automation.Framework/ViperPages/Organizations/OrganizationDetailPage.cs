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

        /// <summary>Reads the page heading, which is the organization's name.</summary>
        /// <returns>The heading text, or an empty string when it never appeared.</returns>
        public string ReadOrganizationName()
        {
            return FindFirstDisplayed("//h1 | //h2[contains(@class, 'admin')]", 10)?.Text ?? string.Empty;
        }

        // --- Tab navigation ---

        public void ClickTab(string tabId)
        {
            ClickByScript($"//button[@role='tab'][@id='tab-{tabId}']");
            Thread.Sleep(500);
        }

        public void ClickUsersTab() => ClickTab("users");
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
                    || driver.FindElements(By.XPath(XPath_Organizations.MembersEmptyState)).Count > 0
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

        // --- Users ("Members") tab: view and unlink ---

        /// <summary>Whether at least one member row is present on the Users tab.</summary>
        public bool HasAnyMember()
        {
            return IsElementVisible(XPath_Organizations.MembersPanelRows, 5);
        }

        /// <summary>Clicks View on the first member row and waits for the member detail page.</summary>
        public void ViewFirstMember()
        {
            ClickByScript(XPath_Organizations.FirstMemberViewBtn);
        }

        /// <summary>Clicks Unlink on the first member row.</summary>
        public void UnlinkFirstMember()
        {
            ClickByScript(XPath_Organizations.FirstMemberUnlinkBtn);
        }

        /// <summary>Reads the name shown in the first member row, before acting on it.</summary>
        /// <returns>The member's display name, or an empty string when no row is present.</returns>
        public string ReadFirstMemberName()
        {
            var row = _webDriver.FindElements(By.XPath(XPath_Organizations.MembersPanelRows)).FirstOrDefault();
            return row?.Text.Split('\n').FirstOrDefault()?.Trim() ?? string.Empty;
        }

        // --- Products tab: activate / deactivate in place ---
        //
        // There is no "assign a brand-new product" action in the current frontend - only a
        // per-row Activate/Deactivate toggle on products the organization has ever had a mapping
        // for (see OrganizationProductsPanel.tsx). An organization with zero product rows has an
        // empty Products tab and nothing to click.

        /// <summary>Whether at least one product row is present on the Products tab.</summary>
        public bool HasAnyProduct()
        {
            return IsElementVisible(XPath_Organizations.ProductsPanelRows, 5);
        }

        /// <summary>Whether the first product row currently shows an Activate action (i.e. is inactive).</summary>
        public bool IsFirstProductActivatable()
        {
            return IsElementVisible(XPath_Organizations.FirstProductActivateBtn, 3);
        }

        /// <summary>Whether the first product row currently shows a Deactivate action (i.e. is active).</summary>
        public bool IsFirstProductDeactivatable()
        {
            return IsElementVisible(XPath_Organizations.FirstProductDeactivateBtn, 3);
        }

        /// <summary>Clicks Deactivate on the first product row - opens a confirm dialog, does not confirm it.</summary>
        public void ClickDeactivateFirstProduct()
        {
            ClickByScript(XPath_Organizations.FirstProductDeactivateBtn);
        }

        /// <summary>Clicks Activate on the first product row - no confirm dialog follows this one.</summary>
        public void ClickActivateFirstProduct()
        {
            ClickByScript(XPath_Organizations.FirstProductActivateBtn);
        }

        // --- Licenses tab (read-only) ---

        /// <summary>Whether at least one license row is present on the Licenses tab.</summary>
        public bool HasAnyLicense()
        {
            return IsElementVisible(XPath_Organizations.LicensesPanelRows, 5);
        }

        // --- Requests tab (read-only, plus a Review action that opens a separate modal) ---

        /// <summary>Whether at least one request row is present on the Requests tab.</summary>
        public bool HasAnyRequest()
        {
            return IsElementVisible(XPath_Organizations.RequestsPanelRows, 5);
        }

        // --- Generic confirm dialog (shared confirmAction() component) ---
        //
        // Used by Unlink (Users tab) and Deactivate (Products tab); the Change Status modal's own
        // second-stage confirm reuses the same component too (see OrganizationsListPage).

        /// <summary>Waits for a confirm dialog whose title contains the given text.</summary>
        /// <param name="titleContains">text expected in the dialog's title/heading</param>
        /// <returns><c>true</c> when the dialog appeared within the timeout.</returns>
        public bool WaitForConfirmDialog(string titleContains)
        {
            return IsElementVisible(XPath_Organizations.ConfirmDialog(titleContains), 5);
        }

        /// <summary>Clicks the confirm dialog's button with the given label (e.g. "Unlink", "Deactivate").</summary>
        /// <param name="label">the confirm button's exact visible label</param>
        public void ConfirmDialogAction(string label)
        {
            ClickByScript(XPath_Organizations.ConfirmDialogButton(label));
            Thread.Sleep(500);
        }

        /// <summary>Clicks Cancel on whatever confirm dialog is currently open.</summary>
        public void CancelConfirmDialog()
        {
            ClickByScript(XPath_Organizations.ConfirmDialogCancelBtn);
            Thread.Sleep(300);
        }

        // --- Edit form (opened from list page Edit button, or the Profile tab's own Edit button) ---

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

        /// <summary>
        /// Fills in the fields the Profile edit form actually allows changing - website, contact
        /// person (a Dropdown here, unlike the Add Organization page's plain input for the same
        /// name), address, city, and ZIP. Organization name and type render disabled in this
        /// form, so they are never touched here.
        /// </summary>
        /// <param name="website">the website value to set</param>
        /// <param name="address">the address value to set</param>
        /// <param name="city">the city value to set</param>
        /// <param name="zip">the ZIP value to set</param>
        public void FillEditableProfileFields(string website, string address, string city, string zip)
        {
            SetValueByScript(XPath_Organizations.ProfileWebsiteEdit, website);
            SetValueByScript(XPath_Organizations.ProfileAddressEdit, address);
            SetValueByScript(XPath_Organizations.ProfileCityEdit, city);
            SetValueByScript(XPath_Organizations.ProfileZipEdit, zip);
        }

        /// <summary>Picks the first member listed in the edit form's Contact Person dropdown, if any.</summary>
        /// <remarks>
        /// The dropdown is populated from the organization's own linked members, so it may be
        /// empty on an organization with none - this is a best-effort convenience, not asserted.
        /// </remarks>
        public void SelectFirstContactPersonOption()
        {
            ClickByScript(XPath_Organizations.ProfileContactPersonDropdown);
            Thread.Sleep(300);
            ClickFirstDisplayed("(//*[@role='option'])[1]", 2);
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

        /// <summary>Reads the toast banner shown after saving, activating/deactivating, or unlinking.</summary>
        /// <returns>The toast text, or an empty string when none appeared in time.</returns>
        public string ReadToast()
        {
            return FindFirstDisplayed(XPath_Organizations.ToastBanner, 10)?.Text ?? string.Empty;
        }

        // --- Back to Organizations ---

        public void ClickBackToOrganizations()
        {
            ClickByScript(XPath_Organizations.BackToOrganizationsBtn);
        }
    }
}
