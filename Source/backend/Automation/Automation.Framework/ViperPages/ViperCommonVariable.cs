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
            public const string accesslevel = "accessLevel";
            public const string txtemail = "eMail";
            public const string txtpassword = "password";
            public const string Documentation = "staffDirectoryModel_Documentation";

            // Navigation and grid controls carry no id, so they are matched by role / label.
            public const string AdministrationMenu = "//button[.//span[normalize-space()='Administration']]";

            // The side bar copy of the link is the hidden mobile drawer, the drop down copy sits in a list item.
            public const string UserDetailsMenu = "//li/a[@href='/user-details']";

            public const string AddNewUser = "//button[.//span[normalize-space()='Add New User']]";
            public const string GridSearch = "//input[@placeholder='Search']";
            public const string RowEdit = "(//button[@aria-label='Edit'])[1]";
            public const string RowDelete = "(//button[@aria-label='Delete'])[1]";
            public const string Save = "//form//button[@type='submit']";
            public const string Cancel = "//form//button[normalize-space()='Cancel']";
            public const string DeleteConfirmYes = "//div[@role='dialog']//button[normalize-space()='Delete']";
            public const string DeleteConfirmNo = "//div[@role='dialog']//button[normalize-space()='Cancel']";

            /// <summary>Option inside the popup listbox of a dropdown with the given control id.</summary>
            public static string ListBoxOption(string controlId, string optionText)
            {
                return $"//div[@id='{controlId}-listbox']//button[@role='option'][normalize-space()='{optionText}']";
            }

            /// <summary>First option inside the popup listbox of a dropdown with the given control id.</summary>
            public static string FirstListBoxOption(string controlId)
            {
                return $"//button[@id='{controlId}-listbox-option-0']";
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
            // The only stable attribute on the chrome. The mobile sidebar renders every
            // label a second time, so the top level lookup is scoped to the bar itself.
            public const string TopNav = "//*[@data-acutis-chrome='top-nav']";

            // Set on the element the page content scrolls inside.
            public const string PageScroll = "//*[@data-acutis-page-scroll]";

            // A group that does not fit in the bar is moved into a trailing More menu
            // rather than dropped, so a missing group is not necessarily an absent one.
            public const string MoreMenu = "More";

            // A page is treated as loaded when any of these renders. The pages are a mix of
            // data tables, forms and dashboards, so no single locator covers them all.
            public const string GridRow = "//table//tbody/tr/td";

            public const string FormField = "//form//input | //form//select | //form//textarea";

            public const string PageHeading = "//*[@data-acutis-page-scroll]//h1 | //*[@data-acutis-page-scroll]//h2";

            // Skeleton rows while a grid loads. They are real rows with no data in them, so
            // they have to be waited out before GridRow means anything.
            public const string LoadingRow = "//table//tbody/tr[contains(@class, 'animate-pulse')]";

            // CustomDataTable's empty state. Checked before GridRow, because the empty
            // state is itself a table row and would otherwise read as data.
            public const string EmptyGrid = "//span[normalize-space(text())='No data available'] | //td[normalize-space(text())='No data available']";

            // A nav path with no matching route falls through to this screen.
            public const string PageNotFound = "//*[normalize-space(text())='Page not found']";

            // Everything a settled page can show, in one locator. Waited on separately each
            // shape that a page is not costs the whole timeout before the next is tried - a
            // form page sat out the grid timeout before its own fields were ever looked for.
            public const string SettledPage = GridRow + " | " + FormField + " | " + PageHeading + " | " + EmptyGrid + " | " + PageNotFound;

            // A closed drop down stays in the DOM, laid over its trigger at zero opacity,
            // which Selenium still reports as displayed. Only the open one drops the
            // pointer-events-none guard, so this is what tells the two apart.
            private const string _notInAClosedMenu = "[not(ancestor::div[contains(@class, 'pointer-events-none')])]";

            /// <summary>
            /// A top level menu in the nav bar. A group with sub menus renders as a button
            /// that opens a drop down; one without renders as a link that navigates.
            /// </summary>
            /// <param name="label">the visible text of the menu</param>
            /// <returns>An xpath matching that menu inside the top nav bar.</returns>
            public static string TopMenu(string label)
            {
                return $"{TopNav}//*[self::button or self::a][.//span[normalize-space()='{label}']]";
            }

            /// <summary>
            /// An entry inside an open drop down. The drop down is portalled onto the body
            /// rather than nested in the nav, so this deliberately is not scoped to the bar.
            /// Entries sitting in a closed drop down are excluded, so a label that appears
            /// under more than one group cannot be clicked in the group that is not open.
            /// </summary>
            /// <param name="label">the visible text of the entry</param>
            /// <returns>An xpath matching that entry.</returns>
            public static string MenuEntry(string label)
            {
                return $"//*[self::a or self::button][.//span[normalize-space()='{label}']]{_notInAClosedMenu}";
            }
        }
        public static class XPath_AdminRequests
        {
            public const string TabAllStatuses = "//button[.//span[normalize-space()='All statuses']]";
            public const string TabPending = "//button[.//span[normalize-space()='Pending']]";
            public const string TabApproved = "//button[.//span[normalize-space()='Approved']]";
            public const string TabRejected = "//button[.//span[normalize-space()='Rejected']]";
            public const string TabInfoRequested = "//button[.//span[normalize-space()='Info requested']]";

            public const string DropdownAppFilter = "//button[contains(@class, 'dropdown-trigger') and .//span[contains(text(), 'All Applications') or ancestor::div/label[contains(text(), 'application')]]]";
            public const string DropdownOrgFilter = "//button[contains(@class, 'dropdown-trigger') and .//span[contains(text(), 'All Organizations') or ancestor::div/label[contains(text(), 'organization')]]]";

            public const string DataTableRows = "//table//tbody//tr";
            public const string EmptyState = "//*[contains(text(), 'No requests found')]";
            
            public const string BtnReviewFirstRow = "(//table//tbody//tr//button[contains(text(), 'Review')])[1]";
        }
    }
}