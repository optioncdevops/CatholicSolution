// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.ViperPages
{
    public static class ViperCommonVariable
    {
        public static class XPath_Menus
        {
            public const string liSchool = nameof(liSchool);
            public const string liDioceses = nameof(liDioceses);

            public const string liAdministration = nameof(liAdministration);
            public const string liSchoolWorkload = nameof(liSchoolWorkload);
            public const string liPhoneEmail = nameof(liPhoneEmail);
            public const string liStaffDirectory = nameof(liStaffDirectory);
            public const string liCustomerDirectory = nameof(liCustomerDirectory);
            public const string liTrainingSchedule = nameof(liTrainingSchedule);
            public const string liUserDetails = nameof(liUserDetails);
            public const string liSystemMessage = nameof(liSystemMessage);
            public const string liUserRole = nameof(liUserRole);
            public const string liUserRight = nameof(liUserRight);
            public const string liSMSMenuRights = nameof(liSMSMenuRights);
            public const string liFamilyMenuRights = nameof(liFamilyMenuRights);

            public const string liTickets = nameof(liTickets);
            public const string liAddTickets = nameof(liAddTickets);
            public const string liTMyTickets = nameof(liTMyTickets);
            public const string liActiveTickets = nameof(liActiveTickets);
            public const string liTicketStatistic = nameof(liTicketStatistic);
            public const string liRecentTickets = nameof(liRecentTickets);
            public const string liClosedTickets = nameof(liClosedTickets);
            public const string liCustomerTickets = nameof(liCustomerTickets);
            public const string liEnhancementTickets = nameof(liEnhancementTickets);
            public const string liPostiveTickets = nameof(liPostiveTickets);
            public const string liFeedbackTickets = nameof(liFeedbackTickets);

            public const string liSupport = nameof(liSupport);
            public const string liCommunitySupport = nameof(liCommunitySupport);
            public const string liDocumentationLibrary = nameof(liDocumentationLibrary);
            public const string liFAQs = nameof(liFAQs);
            public const string liFAQCategories = nameof(liFAQCategories);
            public const string liMissingHelp = nameof(liMissingHelp);
            public const string liHelpUsage = nameof(liHelpUsage);
            public const string liCatholicContent = nameof(liCatholicContent);

            public const string liSystemAlert = nameof(liSystemAlert);
            public const string liParentAlertJob = nameof(liParentAlertJob);
            public const string liErrorList = nameof(liErrorList);
            public const string liParentAlertHealthCheck = nameof(liParentAlertHealthCheck);
            public const string liParentAlertBouncedList = nameof(liParentAlertBouncedList);
            public const string liSystemTraceLog = nameof(liSystemTraceLog);
            public const string liSMSActiveUsers = nameof(liSMSActiveUsers);
            public const string liLoginCount = nameof(liLoginCount);
            public const string liUserStatistics = nameof(liUserStatistics);
            public const string liEdFiData = nameof(liEdFiData);
            public const string liOrgIntegration = nameof(liOrgIntegration);
            public const string liDynamicReprot = nameof(liDynamicReprot);

            public const string liReports = nameof(liReports);
            public const string liParentAccountSetup = nameof(liParentAccountSetup);
            public const string liContentViewReports = nameof(liContentViewReports);
            public const string liMailingLabelsReports = nameof(liMailingLabelsReports);
            public const string liPromotionReports = nameof(liPromotionReports);
            public const string liProspectReports = nameof(liProspectReports);
            public const string liSchoolContractReports = nameof(liSchoolContractReports);
            public const string liSchoolTermReports = nameof(liSchoolTermReports);
            public const string liSchoolUsageReports = nameof(liSchoolUsageReports);
            public const string liSchoolPASusageReports = nameof(liSchoolPASusageReports);
            public const string liSchoolImplementReports = nameof(liSchoolImplementReports);
            public const string liTrainingReports = nameof(liTrainingReports);
            public const string liUserContactReports = nameof(liUserContactReports);

            public const string liComments = nameof(liComments);
            public const string liAllComments = nameof(liAllComments);
            public const string liSalesComments = nameof(liSalesComments);
            public const string liMemberServiceComments = nameof(liMemberServiceComments);
            public const string liDevelopmentComments = nameof(liDevelopmentComments);
            public const string liMarketingComments = nameof(liMarketingComments);
            public const string liFinanceComments = nameof(liFinanceComments);
            public const string liExternalComments = nameof(liExternalComments);

            public const string liSaintoftheDay = nameof(liSaintoftheDay);
            public const string liDataImport = nameof(liDataImport);
            public const string menuProfile = nameof(menuProfile);
            public const string menuItemProfile = nameof(menuItemProfile);
            public const string menuItemChangePassword = nameof(menuItemChangePassword);
            public const string menuItemSignOut = nameof(menuItemSignOut);
        }

        public static class XPath_SchoolDetails
        {
            public const string checkCustomers = nameof(checkCustomers);
            public const string checknonCustomers = nameof(checknonCustomers);
            public const string chkformercustomer = nameof(chkformercustomer);
            public const string chkavailable = nameof(chkavailable);
            public const string chkdisablecustomer = nameof(chkdisablecustomer);
            public const string GotoOrgID = "//*[@class='nav-link gotolink']";

            // SCHOOL PROFILE TABS
            public const string SchoolProfile = "School Profile";

            public const string SchoolInfo = "School Info";
            public const string SchoolSettings = "School Settings";
            public const string MattMoney = "Matt Money";
            public const string ContactsUser = "Contacts / User";
            public const string AccountManagers = "Account Managers";
            public const string ProductInformation = "Product Information";
            public const string Comments = "Comments";
            public const string Tickets = "Tickets";
            public const string ActivateSMS = "Activate SMS";
            public const string SellPAS = "Sell PAS";
            public const string ActivatePAS = "Activate PAS";
            public const string ActivateBetaSMS = "Activate Beta SMS";
            public const string ActivateWelcomeMessage = "Activate Welcome Message";
        }

        public static class XPath_TicketDetails
        {
            public const string SchoolId1 = nameof(SchoolId1);
            public const string ddlschool1 = nameof(ddlschool1);
            public const string DioceseId = nameof(DioceseId);
            public const string ddldiocese = nameof(ddldiocese);
            public const string title = nameof(title);
            public const string description = nameof(description);
            public const string Status = nameof(Status);
            public const string category = nameof(category);
            public const string assignedto = nameof(assignedto);
            public const string priority = nameof(priority);
            public const string comments = nameof(comments);
            public const string ticketfile = nameof(ticketfile);
        }

        public static class XPath_UserDetails
        {
            // The Acutis UI names its inputs after the react-hook-form fields,
            // so the input ids are the camel cased field names.
            public const string txtfirstname = "firstName";

            public const string txtlastname = "lastName";
            public const string rolename = "roleId";
            public const string txtemail = "eMail";
            public const string txtpassword = "password";
            public const string txtdateofbirth = "dateOfBirth";

            // The route the users list lives on. The menu entry that leads there is matched
            // on this rather than on its title, because the title is menu data held in the
            // database and is renamed there, while the route is fixed in the router.
            public const string UsersRoute = "/admin/users";

            // The drop down entry, and the same route as a top level link, since which of
            // the two it is depends on the signed in role's menu data.
            public const string UserDetailsMenu = "//a[@role='menuitem'][@href='" + UsersRoute + "']";

            public const string UserDetailsTopMenu = "//nav[@id='menuAdminNavigation']//a[@href='" + UsersRoute + "']";

            // The nav bar groups that open a drop down, walked in turn to find the one the
            // users entry sits under.
            public const string NavDropDownTrigger = "//nav[@id='menuAdminNavigation']//button[@aria-haspopup='menu']";

            public const string AddNewUser = "//button[.//span[normalize-space()='Add User']]";
            public const string GridSearch = "//input[@placeholder='Search']";

            // Every row action is labelled with the user it acts on ("Edit Jane Doe"), so the
            // label is matched on its prefix. The grid is filtered down to the one row first.
            public const string RowEdit = "(//button[starts-with(@aria-label, 'Edit ')])[1]";

            public const string RowDelete = "(//button[starts-with(@aria-label, 'Delete ')])[1]";

            public const string Save = "//form//button[@type='submit']";
            public const string Cancel = "//form//button[normalize-space()='Cancel']";

            // Deleting confirms through a SweetAlert2 popup rather than an in page dialog,
            // so the buttons are matched on the classes it puts on them. Its own labels are
            // written per call site ("Delete user", "Cancel") and are not relied on here.
            public const string DeleteConfirmPopup = "//div[contains(@class, 'swal2-popup')]";

            public const string DeleteConfirmYes = "//button[contains(@class, 'swal2-confirm')]";
            public const string DeleteConfirmNo = "//button[contains(@class, 'swal2-cancel')]";

            // The toast the app answers a save with. It is matched on the progress bar it
            // carries rather than on its role, because the route loader announces itself
            // with the same role, and because a refused save is reported through the same
            // banner as a successful one.
            public const string ToastBanner = "//div[div[contains(@class, 'admin-toast-progress')]]";

            // A validation message under a field, for a save the form refuses on its own.
            public const string FieldError = "//form//p[@role='alert']";

            // The list and the add/edit form are separate routes, so these say which of the
            // two is on screen after a save or a cancel.
            public const string UsersGrid = "//main//table//tbody/tr";

            public const string UsersForm = "//form//*[@id='" + txtfirstname + "']";

            /// <summary>A grid row holding the given text, used to wait out a search.</summary>
            /// <param name="text">the cell text to look for</param>
            /// <returns>An xpath matching the row.</returns>
            public static string GridRowContaining(string text)
            {
                return $"//main//table//tbody/tr[.//*[normalize-space()='{text}']]";
            }

            /// <summary>Option inside the popup listbox of a dropdown with the given control id.</summary>
            /// <param name="controlId">the id of the dropdown control</param>
            /// <param name="optionText">the text of the option to pick</param>
            /// <returns>An xpath matching that option.</returns>
            public static string ListBoxOption(string controlId, string optionText)
            {
                return $"//div[@id='{controlId}-listbox']//button[@role='option'][normalize-space()='{optionText}']";
            }

            /// <summary>
            /// First option inside the popup listbox of a dropdown with the given control id.
            /// </summary>
            /// <remarks>
            /// The option ids carry the option's own value, not its position, so the first
            /// option is taken by position rather than by an id ending in zero.
            /// </remarks>
            /// <param name="controlId">the id of the dropdown control</param>
            /// <returns>An xpath matching the first option.</returns>
            public static string FirstListBoxOption(string controlId)
            {
                return $"(//div[@id='{controlId}-listbox']//button[@role='option'])[1]";
            }
        }

        public static class XPath_SchoolListWorkLoad
        {
            public const string ddlDio = nameof(ddlDio);
        }

        public static class XPath_Customer
        {
            public const string mdRequestbtn = nameof(mdRequestbtn);
            public const string emailAddress = nameof(emailAddress);
            public const string CustomerSave = "//*[@class='btn btn-success text-center']";
            public const string CustomerCancel = "//*[@class='btn btn-secondary']";
            public const string CustomerDelete = "//*[@class='fa fa-trash']";
        }

        public static class XPath_Login
        {
            public const string txtEmailAddress = nameof(txtEmailAddress);
            public const string txtPassword = nameof(txtPassword);
            public const string btnSignIn = nameof(btnSignIn);
            public const string username = nameof(username);
            public const string password = nameof(password);

            // The Acutis UI renders the sign in button without an id, so match the form submit button.
            public const string SignIn = "//form//button[@type='submit']";
        }

        public static class XPath_SystemMessage
        {
            public const string StartDate = nameof(StartDate);
            public const string EndDate = nameof(EndDate);
            public const string MessageTitle = nameof(MessageTitle);
        }

        /// <summary>
        /// Locators for walking the Acutis top nav bar.
        /// </summary>
        /// <remarks>
        /// The legacy Viper element ids (liAdministration, liUserDetails and the rest) are
        /// gone from the rewritten UI. They survive only as the sessionKey field on the menu
        /// data the login response returns, and are never written to the DOM, so everything
        /// here matches on the visible label instead.
        /// </remarks>
        public static class XPath_MenuAccess
        {
            // The nav strip carries a stable id. The whole bar is scoped on, because the
            // profile menu renders links of its own outside it that are not part of the walk.
            public const string TopNav = "//nav[@id='menuAdminNavigation']";

            // A group with sub menus renders as a drop down trigger button, a group without
            // renders as a link that navigates. Both carry the same nav item class.
            public const string TopNavItem = TopNav + "//*[self::a or self::button][contains(@class, 'admin-nav-item')]";

            // The drop down panel is portalled onto the body rather than nested in the nav,
            // so this deliberately is not scoped to the bar. It is unmounted when the menu
            // closes, so at most one panel is ever in the DOM.
            public const string DropDownPanel = "//div[@role='menu'][contains(@class, 'admin-nav-dropdown__panel')]";

            public const string DropDownEntry = DropDownPanel + "//a[@role='menuitem']";

            // The card every routed page renders inside.
            public const string PageCard = "//main//*[contains(@class, 'admin-page-card')]";

            // A page is treated as loaded when any of these renders. The pages are a mix of
            // data tables, forms and dashboards, so no single locator covers them all.
            public const string GridRow = PageCard + "//table//tbody/tr/td";

            public const string FormField = PageCard + "//form//input | " + PageCard + "//form//select | " + PageCard + "//form//textarea";

            public const string PageHeading = PageCard + "//h1 | " + PageCard + "//h2 | " + PageCard + "//h3";

            // CustomDataTable's empty state. Checked as a settled page in its own right,
            // because the empty state replaces the rows rather than sitting beside them.
            public const string EmptyGrid = "//*[normalize-space(text())='No data available']";

            // The shell renders this in place of the page when the signed in role holds no
            // grant for the route, so a menu that is shown but not reachable is caught.
            public const string AccessDenied = PageCard + "//*[@role='status'][.//h3[normalize-space()='Access denied']]";

            // The Suspense fallback while a lazily loaded route chunk arrives, and the grid's
            // skeleton rows. Skeletons are real rows with no data in them, so they have to be
            // waited out before GridRow means anything.
            public const string Loading = PageCard + "//*[@role='status'][@aria-live='polite'] | " + PageCard + "//table//tbody/tr[contains(@class, 'animate-pulse')]";

            // Everything a settled page can show, in one locator. Waited on separately, each
            // shape that a page is not costs the whole timeout before the next is tried - a
            // form page sat out the grid timeout before its own fields were ever looked for.
            public const string SettledPage = GridRow + " | " + FormField + " | " + PageHeading + " | " + EmptyGrid + " | " + AccessDenied;

            /// <summary>
            /// A top level menu in the nav bar.
            /// </summary>
            /// <param name="label">the visible text of the menu</param>
            /// <returns>An xpath matching that menu inside the top nav bar.</returns>
            public static string TopMenu(string label)
            {
                return $"{TopNav}//*[self::button or self::a][.//span[normalize-space()='{label}']]";
            }

            /// <summary>
            /// An entry inside the open drop down. Scoping to the panel keeps a label that
            /// also appears in the bar itself, or in the profile menu, out of the match.
            /// </summary>
            /// <param name="label">the visible text of the entry</param>
            /// <returns>An xpath matching that entry.</returns>
            public static string MenuEntry(string label)
            {
                return $"{DropDownPanel}//a[@role='menuitem'][.//span[normalize-space()='{label}']]";
            }
        }
        public static class XPath_AdminRequests
        {
            public const string TabAllStatuses = "//button[@role='tab' and contains(., 'All statuses')]";
            public const string TabPending = "//button[@role='tab' and contains(., 'Pending')]";
            public const string TabApproved = "//button[@role='tab' and contains(., 'Approved')]";
            public const string TabRejected = "//button[@role='tab' and contains(., 'Rejected')]";
            public const string TabInfoRequested = "//button[@role='tab' and contains(., 'Info requested')]";

            public const string DropdownAppFilter = "//div[span[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'application')]]//div[@role='combobox']";
            public const string DropdownOrgFilter = "//div[span[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'organization')]]//div[@role='combobox']";

            public const string DataTableRows = "//table//tbody//tr[not(contains(@class, 'animate-pulse'))]";
            public const string EmptyState = "//*[contains(text(), 'No requests found')]";
            
            public const string BtnReviewFirstRow = "(//table//tbody//tr//button[contains(text(), 'Review')])[1]";
        }

        public static class XPath_Products
        {
            // Navigation
            public const string MenuProducts = "//nav[@id='menuAdminNavigation']//a[contains(@href, '/admin/products') or contains(@href, '/admin/cfrproducts') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'product') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cfrproduct') or contains(., 'Applications')]";
            public const string ProductsUrlPath = "/admin/products";
            public const string CfrProductsUrlPath = "/admin/cfrproducts";

            // Products Listing
            public const string SearchInput = "//input[@placeholder='Search by name, subtitle, domain']";
            public const string ProductCard = "//article[contains(@class, 'admin-product-card')]";
            public static string FilterChip(string status) => $"//button[contains(@class, 'admin-filter-chip') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{status.ToLowerInvariant()}')]";
            public static string ProductTitle(string productName) => $"//article[contains(@class, 'admin-product-card')]//span[contains(text(), '{productName}')]";
            public static string ViewProductButton(string productName) => $"//article[contains(@class, 'admin-product-card') and .//span[contains(text(), '{productName}')]]//button[contains(@aria-label, 'View')]";
            public const string FirstViewProductButton = "(//article[contains(@class, 'admin-product-card')]//button[contains(@aria-label, 'View')])[1]";

            // Product Details Sub Tabs
            public const string TabProductDetails = "tab-details";
            public const string TabOrganizations = "tab-customers";
            public const string TabInvoiceDetails = "tab-invoice-details";
            public const string TabInvoiceHistory = "tab-invoice-history";
            public static string SubTabById(string tabId) => $"//button[@id='{tabId}' or @id='tab-{tabId}']";
            public static string SubTabByLabel(string label) => $"//div[@role='tablist']//button[contains(., '{label}')]";

            // Change Status Workflow
            public const string BtnChangeStatus = "//button[contains(., 'Change Status')]";
            public const string StatusModal = "//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]";
            public const string BtnStatusModalCancel = "//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//button[normalize-space()='Cancel' or contains(., 'Cancel')]";
            public const string BtnStatusModalContinue = "//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//button[normalize-space()='Continue' or contains(., 'Continue')]";
            public static string StatusModalOption(string status) => $"//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//fieldset//button[not(@disabled) and (contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-', 'abcdefghijklmnopqrstuvwxyz '), '{status.ToLowerInvariant().Replace('-', ' ')}') or contains(., '{status}'))]";
            public const string FirstAvailableStatusOption = "//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//fieldset//button[not(@disabled)][1]";

            // SweetAlert2 Confirmation Dialog — do not require swal2-shown; live
            // builds only add backdrop-show. Never match the Change Status modal.
            public const string SwalContainer = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]";
            public const string SwalPopup = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//div[contains(@class, 'swal2-popup') or contains(@class, 'admin-swal-popup')]";
            public const string SwalConfirmButton = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//button[contains(@class, 'swal2-confirm') or contains(@class, 'admin-swal-confirm')]";
            public const string SwalCancelButton = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//button[contains(@class, 'swal2-cancel') or contains(@class, 'admin-swal-cancel')]";

            // Edit Product Workflow
            public const string BtnEditProduct = "//button[.//span[normalize-space()='Edit'] or normalize-space()='Edit']";
            public const string EditProductNameInput = "//input[@placeholder='Enter product name']";
            public const string EditProductShortNameInput = "//input[@placeholder='Enter short name']";
            public const string EditProductSubtitleInput = "//input[@placeholder='Enter product subtitle']";
            public const string EditProductUrlInput = "//input[@placeholder='Enter production URL']";
            public const string EditProductDescTextarea = "//textarea[@placeholder='What does this product do?']";
            public const string EditProductFeatureInput = "//input[contains(@placeholder, 'Add features')]";
            public const string BtnEditAddFeature = "//button[normalize-space()='Add']";
            public const string EditProductContactDropdown = "//div[@role='combobox' and (ancestor::div[.//label[contains(., 'Contact Person')]] or contains(., 'Select contact person'))]";
            public const string EditProductContactOption = "(//*[@role='option'])[1]";
            public static string EditProductRadioOption(string label) => $"//div[@role='radiogroup']//label[contains(., '{label}')] | //label[contains(., '{label}')]//input[@type='radio'] | //label[contains(., '{label}')]";
            public const string BtnEditCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Cancel' or .//span[normalize-space()='Cancel']] | //button[normalize-space()='Cancel']";
            public const string BtnEditSave = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Save' or .//span[normalize-space()='Save']]";
            public const string DiscardChangesPopup = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//div[contains(@class, 'admin-swal-popup') or contains(@class, 'swal2-popup')]";
            public const string DiscardChangesConfirm = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//button[contains(@class, 'swal2-confirm') or contains(@class, 'admin-swal-confirm')]";
            public const string DiscardInvoiceConfirm = "//div[contains(@class, 'swal2-container')]//button[contains(., 'Discard invoice') or contains(., 'Discard license') or contains(., 'Discard changes')]";
            public const string DiscardChangesCancel = "//div[contains(@class, 'swal2-container') and not(contains(@class, 'swal2-backdrop-hide'))]//button[(contains(@class, 'admin-swal-cancel') or contains(@class, 'swal2-cancel')) and (normalize-space()='Cancel' or contains(., 'Cancel'))]";

            // Organizations Sub Tab Workflow
            public const string OrgFilterChipAll = "//div[@role='tabpanel']//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Statuses') or contains(., 'All'))]";
            public const string OrgFilterChipActive = "//div[@role='tabpanel']//button[contains(@class, 'admin-filter-chip') and contains(., 'Active') and not(contains(., 'Inactive'))]";
            public const string OrgFilterChipExpiringSoon = "//div[@role='tabpanel']//button[contains(@class, 'admin-filter-chip') and contains(., 'Expiring Soon')]";
            public const string OrgFilterChipExpired = "//div[@role='tabpanel']//button[contains(@class, 'admin-filter-chip') and contains(., 'Expired') and not(contains(., 'Expiring'))]";
            public const string OrgFilterChipUsers = "//div[@role='tabpanel']//button[contains(@class, 'admin-filter-chip') and (contains(., '0 Users') or contains(., 'Users'))]";
            public const string FirstOrgViewButton = "(//table//tbody//tr//button[contains(@aria-label, 'View')])[1] | (//table//tbody//tr//a[contains(@href, '/admin/organizations/')])[1]";
            public const string BtnBackToProducts = "//button[contains(., 'Back to Products')]";
            public const string OrgDetailsHeading = "//div[contains(@class, 'admin-reveal')]//h1 | //div[contains(@class, 'admin-reveal')]//h2";

            // Invoice Details Sub Tab Workflow
            public static string InvoiceStatusFilterChip(string status) => $"//button[contains(@class, 'admin-filter-chip') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{status.ToLowerInvariant()}')]";
            public const string BtnCreateInvoice = "//button[contains(., 'Create Invoice') or contains(., 'Create License')]";
            public const string InvoiceTitleInput = "//label[contains(., 'Product Title')]/following::input[1] | //label[contains(., 'Product Title')]/..//input | //input[@id=//label[contains(., 'Product Title')]/@for] | //input[ancestor::div[.//label[contains(., 'Product Title')]]] | //input[@id='invoiceProductTitle' or @placeholder='Enter title' or @placeholder='Product Title']";
            public const string InvoiceProductTitleInput = "//label[contains(., 'Product Title')]/following::input[1] | //label[contains(., 'Product Title')]/..//input | //input[@id=//label[contains(., 'Product Title')]/@for] | //input[ancestor::div[.//label[contains(., 'Product Title')]]] | //input[@id='invoiceProductTitle' or @placeholder='Product Title' or @aria-label='Product Title'] | //input[@readonly and (@disabled or @aria-disabled='true') and not(@type='hidden')]";
            public const string InvoiceRemarksInput = "//div[@role='textbox' and (ancestor::div[.//h2[contains(., 'Remarks')] or .//label[contains(., 'Remarks')]] or @data-placeholder='Enter remarks...' or @data-placeholder='Start typing here...')] | //textarea[contains(@placeholder, 'remarks') or ancestor::div[.//h2[contains(., 'Remarks')]]]";
            public const string InvoiceOrgDropdown = "//div[@role='combobox' and (ancestor::div[.//label[contains(., 'Organization')]] or contains(., 'Select organization'))] | //button[contains(@id, 'dropdown') or contains(., 'Select organization') or contains(@class, 'admin-dropdown-trigger') or @role='combobox']";
            public const string FirstDropdownOption = "(//button[@role='option'])[1]";
            public const string InvoiceStartDateInput = "//input[@placeholder='Select start date']";
            public const string InvoiceExpiryDateInput = "//input[@placeholder='Select expiry date']";
            public const string InvoiceOverlapToast = "//*[contains(text(), 'already been created for this duration') or contains(text(), 'A license has already been created')]";
            public const string BtnInvoiceCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Cancel' or .//span[normalize-space()='Cancel']] | //button[normalize-space()='Cancel']";
            public const string BtnInvoiceSave = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Save' or .//span[normalize-space()='Save']] | //button[@type='submit' and contains(., 'Save')]";

            // Edit Product Card Icon (from Products list)
            public static string EditProductCardButton(string productName) => $"//article[contains(@class, 'admin-product-card') and .//span[contains(text(), '{productName}')]]//button[contains(@aria-label, 'Edit')]";
            public const string FirstEditProductCardButton = "(//article[contains(@class, 'admin-product-card')]//button[contains(@aria-label, 'Edit')])[1]";

            // Products Listing Filter Chips & Sort Dropdown
            public const string AllStatusChip = "//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Statuses') or contains(., 'All Products') or contains(., 'All'))]";
            public const string ActiveStatusChip = "//button[contains(@class, 'admin-filter-chip') and contains(., 'Active') and not(contains(., 'Inactive'))]";
            public const string InactiveStatusChip = "//button[contains(@class, 'admin-filter-chip') and contains(., 'Inactive')]";
            public const string ComingSoonStatusChip = "//button[contains(@class, 'admin-filter-chip') and (contains(., 'Coming Soon') or contains(., 'Coming-soon'))]";
            public const string ProductSortDropdown = "//div[contains(@class, 'w-40')]//div[@role='combobox'] | //div[.//span[contains(text(), 'Sort by')]]//div[@role='combobox']";
            public static string SortOption(string optionText) => $"//div[@role='listbox']//button[@role='option' and contains(., '{optionText}')]";

            // Invoice Modal & Invoice History Workflow
            public const string FirstInvoiceViewButton = "(//div[@role='tabpanel']//table//tbody//tr//button[contains(@aria-label, 'View') or @title='View'])[1]";
            public const string InvoiceModal = "//*[@role='dialog' and not(contains(@class, 'swal2'))]";
            public const string BtnInvoiceModalClose = "//*[@role='dialog']//button[@aria-label='Close'] | //*[@role='dialog']//button[contains(@class, 'rounded-full')]";
            public const string InvoiceHistoryOrgDropdown = "(//div[@role='tabpanel']//div[contains(@class, 'shrink-0')]//div[@role='combobox'])[1]";
            public const string InvoiceHistoryStatusDropdown = "(//div[@role='tabpanel']//div[contains(@class, 'shrink-0')]//div[@role='combobox'])[2]";
            public const string FirstInvoiceHistoryViewButton = "//div[@role='tabpanel']//table//tbody//tr[1]//button[contains(translate(@aria-label, 'VIEW', 'view'), 'view') or @title='View'] | (//div[@role='tabpanel']//table//tbody//tr[1]//button)[1]";
        }

        /// <summary>
        /// Shared CustomDataTable toolbar, search, and SweetAlert2 locators used by the
        /// Administration list pages (User Roles, User Rights).
        /// </summary>
        public static class XPath_DataTable
        {
            public const string GridSearch = "//input[@placeholder='Search']";
            public const string EmptyGrid = "//*[normalize-space(text())='No data available' or normalize-space(text())='No roles found.' or normalize-space(text())='No matches.']";
            public const string GridRows = "//main//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string ColumnsButton = "//button[.//span[normalize-space()='Columns']]";
            public const string ColumnsDialog = "//*[@role='dialog'][@aria-label='Columns']";
            public const string ColumnsCancel = "//*[@role='dialog'][@aria-label='Columns']//button[normalize-space()='Cancel']";
            public const string FullscreenToggle = "//button[@title='Fullscreen' or @title='Exit fullscreen']";
            public const string ExportExcel = "//button[contains(@title, 'Export to Excel')]";
            public const string ExportPrint = "//button[@title='Print' or contains(@title, 'Print')]";
            public const string ExportCsv = "//button[contains(@title, 'Download CSV')]";
            public const string RowsPerPage = "//*[contains(normalize-space(), 'Rows per page')]";
            public const string RowsPerPageSelect = "//span[contains(normalize-space(), 'Rows per page')]/following::select[1] | //*[contains(normalize-space(), 'Rows per page')]/following::select[1]";
            public const string PaginationNext = "//button[@title='Next page' or normalize-space()='Next']";
            public const string PaginationPrev = "//button[@title='Previous page' or normalize-space()='Prev']";
            public const string ListBox = "//div[@role='listbox']";
            public const string ListBoxOption = "//div[@role='listbox']//button[@role='option']";
            public const string ToastBanner = "//div[div[contains(@class, 'admin-toast-progress')]]";
            public const string DeleteConfirmPopup = "//div[contains(@class, 'swal2-popup')]";
            public const string DeleteConfirmYes = "//button[contains(@class, 'swal2-confirm') or contains(@class, 'admin-swal-confirm')]";
            public const string DeleteConfirmNo = "//button[contains(@class, 'swal2-cancel') or contains(@class, 'admin-swal-cancel')]";

            public static string GridRowContaining(string text)
            {
                return $"//main//table//tbody/tr[.//*[normalize-space()='{text}']]";
            }

            public static string ColumnHeader(string header)
            {
                return $"//main//table//thead//th[contains(normalize-space(), '{header}')]";
            }
        }

        public static class XPath_UserRoles
        {
            public const string RolesRoute = "/admin/administration-user-roles";
            public const string PageTitle = "//h1[contains(@class, 'admin-panel-header__title')][contains(., 'User Roles')]";
            public const string AddUserRole = "//button[.//span[normalize-space()='Add User Role']]";
            public const string RoleFormModal = "//*[@role='dialog'][.//h3[contains(., 'User Role')]]";
            public const string txtRoleName = "roleName";
            public const string txtDescription = "description";
            public const string ModalSave = "//*[@role='dialog']//button[.//span[normalize-space()='Save']]";
            public const string ModalCancel = "//*[@role='dialog']//button[.//span[normalize-space()='Cancel']]";
            public const string FieldError = "//*[@role='dialog']//p[@role='alert'] | //*[@role='dialog']//p[contains(@class, 'text-[var(--error)]')]";
            public const string RowEdit = "(//button[starts-with(@aria-label, 'Edit ')])[1]";
            public const string RowDelete = "(//button[starts-with(@aria-label, 'Delete ')])[1]";
            public const string RowDeactivate = "(//button[starts-with(@aria-label, 'Deactivate ')])[1]";
            public const string RowActivate = "(//button[starts-with(@aria-label, 'Activate ')])[1]";
            public const string RowStatusToggle = "(//button[starts-with(@aria-label, 'Deactivate ') or starts-with(@aria-label, 'Activate ')])[1]";

            public static string EditInRow(string roleName) =>
                $"//main//table//tbody/tr[.//*[normalize-space()='{roleName}']]//button[starts-with(@aria-label, 'Edit ')]";

            public static string DeleteInRow(string roleName) =>
                $"//main//table//tbody/tr[.//*[normalize-space()='{roleName}']]//button[starts-with(@aria-label, 'Delete ')]";

            public static string DeactivateInRow(string roleName) =>
                $"//main//table//tbody/tr[.//*[normalize-space()='{roleName}']]//button[starts-with(@aria-label, 'Deactivate ')]";

            public static string ActivateInRow(string roleName) =>
                $"//main//table//tbody/tr[.//*[normalize-space()='{roleName}']]//button[starts-with(@aria-label, 'Activate ')]";

            public static string StatusToggleInRow(string roleName) =>
                $"//main//table//tbody/tr[.//*[normalize-space()='{roleName}']]//button[starts-with(@aria-label, 'Deactivate ') or starts-with(@aria-label, 'Activate ')]";
        }

        public static class XPath_UserRights
        {
            public const string RightsRoute = "/admin/administration-rights";
            public const string PageTitle = "//h1[contains(@class, 'admin-panel-header__title')][contains(., 'User Rights')]";
            public const string RoleDropdown = "ddlUserRightsRole";
            public const string ModuleDropdown = "ddlUserRightsModule";
            public const string ClearFilters = "//button[@id='btnClearUserRightsFilters']";
            public const string ApplyAllAccess = "//button[@id='btnApplyAllAccess']";
            public const string ApplyAllReadOnly = "//button[@id='btnApplyAllReadOnly']";
            public const string ApplyAllDenied = "//button[@id='btnApplyAllDenied']";
            public const string Save = "//button[@id='btnSaveUserRights']";
            public const string Cancel = "//button[@id='btnCancelUserRights']";
            public const string RightsTable = "//*[@id='tblUserRights']";
            public const string FirstAccessButton = "(//div[@role='group' and starts-with(@aria-label, 'Access for ')]//button[.//span[normalize-space()='Access'] or normalize-space()='Access'])[1]";
            public const string FirstReadOnlyButton = "(//div[@role='group' and starts-with(@aria-label, 'Access for ')]//button[.//span[normalize-space()='Read Only'] or normalize-space()='Read Only'])[1]";
            public const string FirstDeniedButton = "(//div[@role='group' and starts-with(@aria-label, 'Access for ')]//button[.//span[normalize-space()='Denied'] or normalize-space()='Denied'])[1]";
            public const string FirstExpand = "(//button[starts-with(@aria-label, 'Collapse ') or starts-with(@aria-label, 'Expand ')])[1]";
            public const string EmptyRoles = "//*[normalize-space()='No roles yet']";
            public const string EditingRightsFor = "//*[contains(normalize-space(), 'Editing rights for')]";
        }

        public static class XPath_EmailTemplates
        {
            public const string TemplatesRoute = "/admin/administration-email-templates";
            public const string PageTitle = "//h1[contains(@class, 'admin-panel-header__title')][contains(., 'Email Templates')]";
            public const string EmailSettingsLink = "//a[contains(@href, '/admin/administration-email-settings')]";
            public const string EmailSettingsButton = "//button[.//span[normalize-space()='Email Settings']]";
            public const string SearchTemplates = "//input[contains(@placeholder, 'Search templates')]";
            public const string TemplateItem = "//button[contains(@class, 'admin-email-template-item')]";
            public const string ActiveTemplateTitle = "//h2[contains(@class, 'panel-title')]";
            public const string SubjectInput = "//input[@placeholder='Enter the email subject line']";
            public const string BodyEditor = "//*[@id='email-template-body-editor']";
            public const string BtnReset = "//button[.//span[normalize-space()='Reset']]";
            public const string BtnPreview = "//button[.//span[normalize-space()='Preview']]";
            public const string BtnSendTest = "//button[.//span[contains(normalize-space(), 'Send Test')]]";
            public const string BtnSave = "//button[.//span[normalize-space()='Save' or normalize-space()='Saving…']]";
            public const string PreviewModal = "//*[@role='dialog'][.//h3[contains(., 'Preview')]]";
            public const string PreviewClose = "//*[@role='dialog']//button[@aria-label='Close']";
            public const string InsertVariableTag = "//button[contains(@class, 'admin-email-template-tag')]";
            public const string NoTemplatesMatch = "//*[contains(normalize-space(), 'No templates match')]";

            public static string TemplateItemByLabel(string label)
            {
                return $"//button[contains(@class, 'admin-email-template-item')][.//span[contains(@class, 'admin-email-template-item__title')][normalize-space()='{label}']]";
            }
        }

        public static class XPath_Organizations
        {
            public const string OrganizationsMenu = "//a[@href='/admin/organizations']";
            public const string PageTitle = "//h1[contains(@class, 'admin-panel-header__title')][contains(., 'Organizations')]";
            public const string BtnAddOrganization = "//button[contains(normalize-space(), 'Add Organization')]";
            public const string BtnSave = "//div[contains(@class, 'admin-sticky-footer')]//button[@type='submit' or .//span[normalize-space()='Save']]";
            public const string BtnCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[.//span[normalize-space()='Cancel']]";
            public const string OrgName = "//input[@name='orgName']";
            public const string OrgTypeDropdown = "//*[contains(normalize-space(), 'Organization type')]/following::div[@role='combobox'][1]";
            public const string Website = "//input[@name='website']";
            public const string StatusDropdown = "//*[contains(normalize-space(), 'Status')]/following::div[@role='combobox'][1]";
            public const string ContactPerson = "//input[@name='contactPerson']";
            public const string ContactPhone = "//input[@name='contactPhone']";
            public const string ContactEmail = "//input[@name='contactEmail']";
            public const string Address = "//input[@name='address']";
            public const string City = "//input[@name='city']";
            public const string State = "//input[@name='state']";
            public const string Zip = "//input[@name='zip']";
            public const string SearchInput = "//input[@placeholder='Search' or contains(@placeholder, 'Search organizations')]";
            public const string FirstRowViewBtn = "//tbody/tr[1]//button[@aria-label[contains(., 'View')]]";
            public const string FirstRowEditBtn = "//tbody/tr[1]//button[@aria-label[contains(., 'Edit')]]";
            public const string FirstRowChangeStatusBtn = "//tbody/tr[1]//button[@aria-label[contains(., 'Change status')]]";
            public const string TableRows = "//main//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string EmptyState = "//*[contains(normalize-space(), 'No organizations found')]";

            /// <summary>A list row holding the given organization name, used to act on a specific
            /// record rather than "whatever the first row happens to be" - important once more
            /// than one test-created organization can be present at a time.</summary>
            public static string RowContaining(string orgName) => $"//main//table//tbody/tr[.//*[normalize-space()='{orgName}']]";
            public static string ViewButtonInRow(string orgName) => $"{RowContaining(orgName)}//button[starts-with(@aria-label, 'View')]";
            public static string EditButtonInRow(string orgName) => $"{RowContaining(orgName)}//button[starts-with(@aria-label, 'Edit')]";
            public static string ChangeStatusButtonInRow(string orgName) => $"{RowContaining(orgName)}//button[starts-with(@aria-label, 'Change status')]";

            /// <summary>That row, further narrowed to only match while it also contains the given
            /// text - used to assert a status badge or other cell value without knowing that
            /// cell's exact markup, e.g. confirming a row now shows "Inactive" after a status
            /// change.</summary>
            public static string RowContainingBoth(string orgName, string additionalText) => $"//main//table//tbody/tr[.//*[normalize-space()='{orgName}']][.//*[contains(normalize-space(), '{additionalText}')]]";

            // Change Status modal
            public const string ChangeStatusModal = "//*[@role='dialog'][.//*[contains(normalize-space(), 'Change Status')]]";
            public const string ChangeStatusInactiveOption = "//*[@role='dialog']//button[contains(normalize-space(), 'Inactive')]";
            public static string ChangeStatusOption(string statusLabel) => $"//*[@role='dialog']//fieldset//button[contains(normalize-space(), '{statusLabel}')]";
            // The status option matching the organization's current status renders disabled -
            // clicking it is a no-op, so this is the fallback used when the target status already
            // is the organization's current status (e.g. a previous run left it there).
            public const string ChangeStatusAnySelectableOption = "//*[@role='dialog']//fieldset//button[not(@disabled)]";
            public const string ChangeStatusCancelBtn = "//*[@role='dialog']//button[normalize-space()='Cancel']";
            public const string ChangeStatusContinueBtn = "//*[@role='dialog']//button[normalize-space()='Continue']";
            public const string ConfirmStatusChangeBtn = "//*[@role='dialog']//button[normalize-space()='Confirm status change']";

            // Generic confirm dialog (shared confirmAction() component) - used by Unlink and
            // Deactivate on this page, and reused wherever else the app renders the same pattern.
            // Matched by role='dialog', NOT the swal2 classes some older pages use, so this only
            // ever targets confirmAction()'s own dialog, never a SweetAlert2 popup.
            public static string ConfirmDialog(string titleContains) => $"//*[@role='dialog'][.//*[contains(normalize-space(), '{titleContains}')]]";
            public static string ConfirmDialogButton(string label) => $"//*[@role='dialog']//button[normalize-space()='{label}']";
            public const string ConfirmDialogCancelBtn = "//*[@role='dialog']//button[normalize-space()='Cancel']";

            // Back to Organizations button on detail page
            public const string BackToOrganizationsBtn = "//button[contains(normalize-space(), 'Back to Organizations')]";

            // Edit form on detail page (Profile tab in edit mode). orgName/orgType render
            // disabled in this form (see OrganizationProfilePanel.tsx) - website/contactPerson/
            // address/city/state/zip are the fields actually editable here. contactPerson is a
            // custom Dropdown in this form specifically (unlike the plain input the Add
            // Organization page uses for the same field name).
            public const string OrgNameEdit = "//input[@name='orgName']";
            public const string ProfileWebsiteEdit = "//input[@name='website']";
            public const string ProfileAddressEdit = "//input[@name='address']";
            public const string ProfileCityEdit = "//input[@name='city']";
            public const string ProfileZipEdit = "//input[@name='zip']";
            public const string ProfileContactPersonDropdown = "//*[contains(normalize-space(), 'Contact person')]/following::div[@role='combobox'][1]";
            public const string EditSaveBtn = "//div[contains(@class, 'admin-sticky-footer')]//button[@type='submit' or .//span[normalize-space()='Save']]";
            public const string EditCancelBtn = "//div[contains(@class, 'admin-sticky-footer')]//button[.//span[normalize-space()='Cancel']]";
            public const string ProfileEditBtn = "//div[contains(@class, 'admin-panel-card__header')]//button[normalize-space()='Edit']";

            // Add Organization page
            public const string AddCancelBtn = "//button[normalize-space()='Cancel']";
            public const string OrgNameError = "//*[@id='orgName-error']";
            public const string WebsiteError = "//*[@id='website-error']";
            public const string ContactPhoneError = "//*[@id='contactPhone-error']";
            public const string ContactEmailError = "//*[@id='contactEmail-error']";
            public const string ZipError = "//*[@id='zip-error']";

            // Toast banner shared by every mutating action on this feature (save, status change,
            // activate/deactivate, unlink) - same structural locator used elsewhere in this app.
            public const string ToastBanner = "//div[div[contains(@class, 'admin-toast-progress')]]";

            // Users tab ("Members") - view/unlink members linked to the organization. There is no
            // Add/Edit action here by design (members are not CFR Admin staff users - see
            // OrganizationUsersPanel.tsx).
            public const string MembersPanelRows = "//div[@id='panel-users']//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string MembersEmptyState = "//div[@id='panel-users']//*[contains(normalize-space(), 'No users linked')]";
            public const string FirstMemberViewBtn = "(//div[@id='panel-users']//table//tbody//tr//button[starts-with(@aria-label, 'View')])[1]";
            public const string FirstMemberUnlinkBtn = "(//div[@id='panel-users']//table//tbody//tr//button[starts-with(@aria-label, 'Unlink')])[1]";
            public static string MemberViewButtonForName(string memberName) => $"//div[@id='panel-users']//table//tbody/tr[.//*[normalize-space()='{memberName}']]//button[starts-with(@aria-label, 'View')]";
            public static string MemberUnlinkButtonForName(string memberName) => $"//div[@id='panel-users']//table//tbody/tr[.//*[normalize-space()='{memberName}']]//button[starts-with(@aria-label, 'Unlink')]";

            // Member Detail page (/admin/organizations/{orgId}/members/{authUserId}) - fully
            // read-only, no actions of its own.
            public const string MemberDetailBackBtn = "//button[starts-with(normalize-space(), 'Back to ')]";
            public const string MemberDetailProfileHeading = "//*[normalize-space()='Profile']";
            public const string MemberDetailMembershipHeading = "//*[normalize-space()='Organization Membership']";
            public const string MemberDetailAppAccessHeading = "//*[normalize-space()='Effective Application Access']";
            public const string MemberDetailAppAccessRows = "//table[.//th[contains(normalize-space(), 'App')]]//tbody/tr";
            public const string MemberDetailEmptyAppAccess = "//*[contains(normalize-space(), 'No effective app access')]";

            // Products tab - every product ever mapped to the organization, active or not, each
            // with a per-row Activate/Deactivate toggle. There is no "assign a brand-new product"
            // action in the current frontend (GetAssignableProducts exists on the backend but is
            // not wired to any button here) - an organization with zero product rows has an empty
            // Products tab and nothing clickable on it.
            public const string ProductsPanelRows = "//div[@id='panel-products']//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string ProductsEmptyState = "//div[@id='panel-products']//*[contains(normalize-space(), 'No apps assigned')]";
            public const string FirstProductActivateBtn = "(//div[@id='panel-products']//table//tbody//tr//button[starts-with(@aria-label, 'Activate')])[1]";
            public const string FirstProductDeactivateBtn = "(//div[@id='panel-products']//table//tbody//tr//button[starts-with(@aria-label, 'Deactivate')])[1]";
            public static string ProductActivateButtonForName(string productName) => $"//div[@id='panel-products']//table//tbody/tr[.//*[normalize-space()='{productName}']]//button[starts-with(@aria-label, 'Activate')]";
            public static string ProductDeactivateButtonForName(string productName) => $"//div[@id='panel-products']//table//tbody/tr[.//*[normalize-space()='{productName}']]//button[starts-with(@aria-label, 'Deactivate')]";

            // Licenses tab - fully read-only besides the status filter chips.
            public const string LicensesPanelRows = "//div[@id='panel-licenses']//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string LicensesEmptyState = "//div[@id='panel-licenses']//*[contains(normalize-space(), 'No licenses')]";
            public const string LicensesFilterGroup = "//div[@id='panel-licenses']//*[@role='group'][@aria-label='Filter licenses by status']";

            // Requests tab - read-only list of access requests scoped to this organization.
            public const string RequestsPanelRows = "//div[@id='panel-requests']//table//tbody/tr[not(contains(@class, 'animate-pulse'))]";
            public const string RequestsEmptyState = "//div[@id='panel-requests']//*[contains(normalize-space(), 'No requests')]";
            public const string FirstRequestReviewBtn = "(//div[@id='panel-requests']//table//tbody//tr//button[normalize-space()='Review'])[1]";
            public const string ViewAllRequestsLink = "//div[@id='panel-requests']//a[contains(normalize-space(), 'View All Requests')]";
        }

        public static class XPath_ForgotPassword
        {
            public const string Route = "/forgot-password";

            public const string txtEmailAddress = nameof(txtEmailAddress);
            public const string btnSendResetLink = nameof(btnSendResetLink);

            // Shared by client-side validation and the server error banner - both surface
            // through the same element (see ForgotPasswordPage.tsx's fieldError).
            public const string EmailError = "//*[@id='" + txtEmailAddress + "-error']";

            public const string Form = "//form[@id='formForgotPassword']";

            // The "Check Your Email" panel replaces the form entirely once a submission
            // succeeds. It carries no id of its own, so it is matched on its heading.
            public const string CheckYourEmailPanel = "//h2[normalize-space()='Check Your Email']";

            public const string UseDifferentEmailButton = "//button[normalize-space()='Use a Different Email']";
            public const string BackToSignInLink = "//a[contains(normalize-space(), 'Back To Sign In')]";
            public const string ReturnToSignInLink = "//a[contains(normalize-space(), 'Return to Sign In')]";

            // The already-requested case renders the same "Check Your Email" panel as a fresh
            // send - only the transient toast tells the two apart (info vs. success tone, and
            // wording), so it has to be read right after submit while it is still on screen.
            public const string ToastBanner = "//div[div[contains(@class, 'admin-toast-progress')]]";
        }

        public static class XPath_ResetPassword
        {
            public const string Route = "/reset-password";

            public const string txtNewPassword = nameof(txtNewPassword);
            public const string txtConfirmPassword = nameof(txtConfirmPassword);
            public const string btnResetPassword = nameof(btnResetPassword);

            // PasswordField gives every field an "{id}-error" element when it carries an error -
            // see PasswordField.tsx.
            public const string NewPasswordError = "//*[@id='" + txtNewPassword + "-error']";
            public const string ConfirmPasswordError = "//*[@id='" + txtConfirmPassword + "-error']";

            public const string Form = "//form[@id='formResetPassword']";

            // Each of these panels replaces the form entirely and carries no id of its own, so
            // each is matched on its heading. XPath string literals below use double quotes
            // because the heading text itself contains an apostrophe.
            public const string LinkIncompletePanel = "//h2[normalize-space()='This Link Is Incomplete']";
            public const string LinkInvalidPanel = "//h2[normalize-space()=\"This Link Can't Be Used\"]";
            public const string LinkInvalidMessage = LinkInvalidPanel + "/following-sibling::p[1]";
            public const string PasswordUpdatedPanel = "//h2[normalize-space()='Password Successfully Updated']";

            public const string AccountEmailDescription = "//p[contains(., 'Choose a new password for')]";
            public const string ContinueToSignInLink = "//a[contains(normalize-space(), 'Continue to Sign In')]";
            public const string RequestNewLinkLink = "//a[contains(normalize-space(), 'Request a New Link')]";
        }

        /// <summary>
        /// Locators for the Change Password modal (ChangePasswordModal.tsx), reached from the
        /// account menu (menuProfile -> menuItemChangePassword) or the Profile page's own
        /// "Change Password" button - both render the same modal.
        /// </summary>
        public static class XPath_ChangePassword
        {
            public const string Modal = "//*[@id='dlgChangePassword']";
            public const string Form = "//form[@id='formChangePassword']";

            // InputField resolves its rendered element id from the react-hook-form `name` prop
            // whenever both `id` and `name` are given - `id={fieldId}` is set after `{...props}`
            // is spread, so it silently overrides whatever `id` the caller passed (see
            // InputField.tsx's `fieldId = name ?? props.id ?? ...`). ChangePasswordModal.tsx
            // passes both id="txtCurrentPassword" (etc.) AND name="currentPassword" on every
            // field, so the id actually rendered to the DOM is the RHF field name, not the
            // "txt..." id literal in the JSX - confirmed against a live run, not just the source.
            public const string txtCurrentPassword = "currentPassword";
            public const string txtNewPassword = "newPassword";
            public const string txtConfirmPassword = "confirmPassword";
            public const string btnUpdatePassword = nameof(btnUpdatePassword);
            public const string btnCancelChangePassword = nameof(btnCancelChangePassword);

            // InputField's error element is a visually hidden (sr-only) span with id
            // "{fieldId}-error" - present in the DOM whether or not it is on screen, so it is
            // read by textContent rather than through this framework's Displayed-based helpers.
            public const string CurrentPasswordError = "//*[@id='" + txtCurrentPassword + "-error']";
            public const string NewPasswordError = "//*[@id='" + txtNewPassword + "-error']";
            public const string ConfirmPasswordError = "//*[@id='" + txtConfirmPassword + "-error']";

            // The general/server error has no id of its own - a direct child <p> of the form,
            // distinct from InputField's own per-field <span> error elements.
            public const string ServerError = Form + "/p[contains(@class, 'text-[var(--error)]')]";
        }

        public static class XPath_EmailSettings
        {
            public const string SettingsRoute = "/admin/administration-email-settings";
            public const string PageTitle = "//h1[contains(@class, 'admin-panel-header__title')][contains(., 'Email Settings')]";
            public const string SmtpSection = "//*[normalize-space()='SMTP Server']";
            public const string BrandingSection = "//*[normalize-space()='Branding']";
            public const string SmtpServer = "//label[.//span[normalize-space()='SMTP server']]/following::input[1]";
            public const string SmtpPort = "//label[.//span[normalize-space()='SMTP port']]/following::input[1]";
            public const string DisplayName = "//label[.//span[normalize-space()='Display name']]/following::input[1]";
            public const string Username = "//label[.//span[normalize-space()='Username']]/following::input[1]";
            public const string Password = "//label[.//span[normalize-space()='Password']]/following::input[1]";
            public const string CcAddress = "//label[.//span[normalize-space()='CC address']]/following::input[1]";
            public const string ContactUs = "//label[.//span[normalize-space()='Contact us address']]/following::input[1]";
            public const string ApiBaseUrl = "//label[.//span[normalize-space()='API base URL']]/following::input[1]";
            public const string BaseFontSize = "//label[.//span[normalize-space()='Base font size (px)']]/following::input[1]";
            public const string SendMailSwitch = "//label[contains(normalize-space(), 'Send mail enabled')]";
            public const string SslSwitch = "//label[contains(normalize-space(), 'SSL/TLS enabled')]";
            public const string FontFamilyDropdown = "//*[contains(normalize-space(), 'Font family')]/following::div[@role='combobox'][1]";
            public const string FontFamilyLabel = "//*[contains(normalize-space(), 'Font family')]";
            public const string FontFamilyListBox = "//div[@role='listbox']";
            public const string AccentColor = "//label[.//span[normalize-space()='Accent color']]/following::input[1]";
            public const string ColorPickerButton = "//button[@aria-label='Open color picker']";
            public const string EmailLogo = "//*[normalize-space()='Email logo']";
            public const string BtnSave = "//div[contains(@class, 'admin-sticky-footer')]//button[@type='submit' or .//span[normalize-space()='Save']]";
            public const string BtnCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[.//span[normalize-space()='Cancel']]";
        }
    }
}
