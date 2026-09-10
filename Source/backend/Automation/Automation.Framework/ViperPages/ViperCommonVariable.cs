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

            // SweetAlert2 Confirmation Dialog
            public const string SwalConfirmButton = "//button[contains(@class, 'admin-swal-confirm') or contains(@class, 'swal2-confirm') or normalize-space()='Confirm status change']";
            public const string SwalCancelButton = "//button[contains(@class, 'admin-swal-cancel') or contains(@class, 'swal2-cancel') or normalize-space()='Cancel']";

            // Edit Product Workflow
            public const string BtnEditProduct = "//button[.//span[normalize-space()='Edit'] or normalize-space()='Edit']";
            public const string EditProductNameInput = "//input[@placeholder='Enter product name']";
            public const string EditProductShortNameInput = "//input[@placeholder='Enter short name']";
            public const string EditProductSubtitleInput = "//input[@placeholder='Enter product subtitle']";
            public const string EditProductUrlInput = "//input[@placeholder='Enter production URL']";
            public const string EditProductDescTextarea = "//textarea[@placeholder='What does this product do?']";
            public const string EditProductFeatureInput = "//input[contains(@placeholder, 'Add features')]";
            public const string BtnEditAddFeature = "//button[normalize-space()='Add']";
            public const string EditProductContactDropdown = "//div[@role='combobox' and (ancestor::div[label[contains(., 'Contact Person')]] or contains(., 'Select contact person'))]";
            public const string EditProductContactOption = "(//*[@role='option'])[1]";
            public static string EditProductRadioOption(string label) => $"//label[contains(., '{label}')]//input[@type='radio'] | //label[contains(., '{label}')]";
            public const string BtnEditCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Cancel' or .//span[normalize-space()='Cancel']] | //button[normalize-space()='Cancel']";
            public const string BtnEditSave = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Save' or .//span[normalize-space()='Save']]";
            public const string DiscardChangesPopup = "//div[contains(@class, 'admin-swal-popup') or contains(@class, 'swal2-popup')]";
            public const string DiscardChangesConfirm = "//button[contains(@class, 'admin-swal-confirm') or contains(@class, 'swal2-confirm') or normalize-space()='Discard changes']";
            public const string DiscardChangesCancel = "//button[contains(@class, 'admin-swal-cancel') or (contains(@class, 'swal2-cancel') and normalize-space()='Cancel')]";

            // Organizations Sub Tab Workflow
            public const string FirstOrgViewButton = "(//table//tbody//tr//button[contains(@aria-label, 'View')])[1] | (//table//tbody//tr//a[contains(@href, '/admin/organizations/')])[1]";
            public const string BtnBackToProducts = "//button[contains(., 'Back to Products')]";
            public const string OrgDetailsHeading = "//div[contains(@class, 'admin-reveal')]//h1 | //div[contains(@class, 'admin-reveal')]//h2";

            // Invoice Details Sub Tab Workflow
            public static string InvoiceStatusFilterChip(string status) => $"//button[contains(@class, 'admin-filter-chip') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{status.ToLowerInvariant()}')]";
            public const string BtnCreateInvoice = "//button[contains(., 'Create Invoice')]";
            public const string InvoiceTitleInput = "//input[@placeholder='Enter title']";
            public const string InvoiceOrgDropdown = "//button[contains(@id, 'dropdown') or contains(., 'Select organization') or contains(@class, 'admin-dropdown-trigger') or @role='combobox']";
            public const string FirstDropdownOption = "(//button[@role='option'])[1]";
            public const string BtnInvoiceCancel = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Cancel' or .//span[normalize-space()='Cancel']] | //button[normalize-space()='Cancel']";
            public const string BtnInvoiceSave = "//div[contains(@class, 'admin-sticky-footer')]//button[normalize-space()='Save' or .//span[normalize-space()='Save']] | //button[@type='submit' and contains(., 'Save')]";

            // Edit Product Card Icon (from Products list)
            public static string EditProductCardButton(string productName) => $"//article[contains(@class, 'admin-product-card') and .//span[contains(text(), '{productName}')]]//button[contains(@aria-label, 'Edit')]";
            public const string FirstEditProductCardButton = "(//article[contains(@class, 'admin-product-card')]//button[contains(@aria-label, 'Edit')])[1]";

            // Invoice Modal & Invoice History Workflow
            public const string FirstInvoiceViewButton = "(//div[@role='tabpanel']//table//tbody//tr//button[contains(@aria-label, 'View') or @title='View'])[1]";
            public const string InvoiceModal = "//*[@role='dialog']";
            public const string BtnInvoiceModalClose = "//*[@role='dialog']//button[@aria-label='Close'] | //*[@role='dialog']//button[contains(@class, 'rounded-full')]";
            public const string InvoiceHistoryOrgDropdown = "(//div[@role='tabpanel']//div[contains(@class, 'shrink-0')]//div[@role='combobox'])[1]";
            public const string InvoiceHistoryStatusDropdown = "(//div[@role='tabpanel']//div[contains(@class, 'shrink-0')]//div[@role='combobox'])[2]";
            public const string FirstInvoiceHistoryViewButton = "(//div[@role='tabpanel']//table//tbody//tr//button[contains(@aria-label, 'View') or @title='View'])[1]";
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
            public const string FontFamilyDropdown = "//div[@role='combobox'][@aria-haspopup='listbox']";
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
