// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public static class APIActionName
    {
        public static class API_Login
        {
            public const string userAuthenticateAsync = nameof(userAuthenticateAsync);
            public const string modalityUserAuthenticateAsync = nameof(modalityUserAuthenticateAsync);
            public const string switchRoleAsync = nameof(switchRoleAsync);
            public const string userAuthenticateAPIAsync = nameof(userAuthenticateAPIAsync);
            public const string officeAuthenticationAsync = nameof(officeAuthenticationAsync);
            public const string getModulesAsync = nameof(getModulesAsync);
            public const string sendForgotPasswordMailAsync = nameof(sendForgotPasswordMailAsync);
            public const string resetPasswordAsync = nameof(resetPasswordAsync);
            public const string verifyOTPAsync = nameof(verifyOTPAsync);
            public const string getMenusAsync = nameof(getMenusAsync);
            public const string userAuthenticatebyTransferIdAsync = nameof(userAuthenticatebyTransferIdAsync);
            public const string mobileUserAuthenticateAsync = nameof(mobileUserAuthenticateAsync);
        }

        public static class ChangePassword
        {
            public const string ChangePasswordAsync = nameof(ChangePasswordAsync);
            public const string VerifyCurrentPasswordAsync = nameof(VerifyCurrentPasswordAsync);
        }

        public static class API_UserDetails
        {
            public const string getUserDetailsAsync = nameof(getUserDetailsAsync);
            public const string getAllUserDetailsAsync = nameof(getAllUserDetailsAsync);
            public const string getUserDetailByIdAsync = nameof(getUserDetailByIdAsync);
            public const string deleteUserDetailAsync = nameof(deleteUserDetailAsync);
            public const string saveUserdetailAsync = nameof(saveUserdetailAsync);
            public const string updateUserdetailAsync = nameof(updateUserdetailAsync);
            public const string getModulesAsync = nameof(getModulesAsync);
            public const string updateUserStatusAsync = nameof(updateUserStatusAsync);
            public const string getDepartmentSupportDataAsync = nameof(getDepartmentSupportDataAsync);
            public const string getLocationAsync = nameof(getLocationAsync);
            public const string getDivisionAsync = nameof(getDivisionAsync);
            public const string updatePasswordAsync = nameof(updatePasswordAsync);
            public const string updateStaffDelitePinAsync = nameof(updateStaffDelitePinAsync);
            public const string getStaffTypeAsync = nameof(getStaffTypeAsync);
            public const string getUserInitialDropdownAsync = nameof(getUserInitialDropdownAsync);
        }

        public static class API_Role
        {
            public const string saveRoleAsync = nameof(saveRoleAsync);
            public const string updateRoleAsync = nameof(updateRoleAsync);
            public const string getRoleAsync = nameof(getRoleAsync);
            public const string getRolesByIdAsync = nameof(getRolesByIdAsync);
            public const string deleteRoleAsync = nameof(deleteRoleAsync);
            public const string updateRoleStatus = nameof(updateRoleStatus);
            public const string getRoleDropdownAsync = nameof(getRoleDropdownAsync);
        }

        public static class API_Rights
        {
            public const string saveRightsAsync = nameof(saveRightsAsync);
            public const string updateRightsAsync = nameof(updateRightsAsync);
            public const string getRightsAsync = nameof(getRightsAsync);
            public const string getRightsbyIdAsync = nameof(getRightsbyIdAsync);
            public const string deleteRightsAsync = nameof(deleteRightsAsync);
            public const string getMainModulesAsync = nameof(getMainModulesAsync);
            public const string getRolesAsync = nameof(getRolesAsync);
            public const string getUsersAsync = nameof(getUsersAsync);
        }

        public static class API_Profile
        {
            public const string getProfileAsync = nameof(getProfileAsync);
            public const string updateProfileAsync = nameof(updateProfileAsync);
            public const string changePasswordAsync = nameof(changePasswordAsync);
            public const string updateUserProfileImageAsync = nameof(updateUserProfileImageAsync);
            public const string getProfileImageAsync = nameof(getProfileImageAsync);
            public const string updateUserSignatureImageAsync = nameof(updateUserSignatureImageAsync);
        }

        public static class API_Acutis
        {
            public static class AcutisAuthentication
            {
                public const string LoginAuthentication = nameof(LoginAuthentication);
                public const string GenerateLoginTransfer = nameof(GenerateLoginTransfer);
            }

            public static class Menu
            {
                /// <summary>OptionCMM-style filtered nav (hardcoded layout trees + StaffAccess).</summary>
                public const string GetNavigation = nameof(GetNavigation);
            }

            public static class Tickets
            {
                public const string AddNewTicket = nameof(AddNewTicket);
                public const string TicketsDetails = nameof(TicketsDetails);
                public const string Dashboard = nameof(Dashboard);
                public const string TicketStatistics = nameof(TicketStatistics);
                public const string GetDevPilotTicket = nameof(GetDevPilotTicket);
                public const string ViewTicket = nameof(ViewTicket);
                public const string GetOrgTicketStatistic = nameof(GetOrgTicketStatistic);
                public const string GetMemberTicketStatistic = nameof(GetMemberTicketStatistic);
                public const string SaveTickets = nameof(SaveTickets);
                public const string UpdateTickets = nameof(UpdateTickets);
                public const string GetSchoolStaffList = nameof(GetSchoolStaffList);
                public const string GetDioceseList = nameof(GetDioceseList);
                public const string DeleteTicket = nameof(DeleteTicket);
                public const string UploadTicketAttachment = nameof(UploadTicketAttachment);
                public const string UploadFiles = nameof(UploadFiles);
                public const string FetchCommend = nameof(FetchCommend);
                public const string DeleteCommend = nameof(DeleteCommend);
            }

            public static class Comment
            {
                public const string GetCommentDetails = nameof(GetCommentDetails);
            }

            public static class EForms
            {
                /// <summary>
                /// Returns templates + categories for the Online Forms Template page.
                /// </summary>
                public const string GetOnlineFormsTemplate = nameof(GetOnlineFormsTemplate);

                /// <summary>
                /// Convenience endpoint used by the current React page (templates only).
                /// </summary>
                public const string GetOnlineFormsTemplates = nameof(GetOnlineFormsTemplates);

                /// <summary>
                /// Copy form (<c>[DynamicForm].[df_DynamicForm_CopyData]</c>). <c>url</c> 0 = copy, non-zero = use template.
                /// </summary>
                public const string CopyForm = nameof(CopyForm);

                public const string GetAddOnlineFormsPage = nameof(GetAddOnlineFormsPage);

                public const string AutoSaveForms = nameof(AutoSaveForms);

                public const string SetControlRequired = nameof(SetControlRequired);

                public const string CopyDesignerControl = nameof(CopyDesignerControl);

                public const string DeleteDesignerControl = nameof(DeleteDesignerControl);

                public const string GetDesignerControlDetail = nameof(GetDesignerControlDetail);

                public const string SaveDesignerControl = nameof(SaveDesignerControl);

                /// <summary>MVC <c>SaveTemplateForm</c> — <c>df_validateCheckExists</c> + <c>df_DynamicForm_CRUD</c> (<c>SetActiveForm</c>).</summary>
                public const string SaveFormDraft = nameof(SaveFormDraft);

                /// <summary>MVC <c>PublishUnPublishForm</c> publish — validations + <c>df_CreateStaticTableDynamicQuery</c>.</summary>
                public const string PublishForm = nameof(PublishForm);

                /// <summary>Encrypted id + legacy preview URL for <c>PreviewPDFExport</c>.</summary>
                public const string GetFormPreviewLink = nameof(GetFormPreviewLink);

                public const string SaveDisplayOrder = nameof(SaveDisplayOrder);
                public const string DeleteSection = nameof(DeleteSection);
                public const string UpdateSectionName = nameof(UpdateSectionName);
                public const string AddSection = nameof(AddSection);
                public const string GetOnlineFormsList = nameof(GetOnlineFormsList);
                public const string GetAllArchiveForm = nameof(GetAllArchiveForm);
                public const string DeleteForm = nameof(DeleteForm);
                public const string ArchiveForm = nameof(ArchiveForm);
                public const string UnArchiveForm = nameof(UnArchiveForm);
                public const string GetFormResponses = nameof(GetFormResponses);
                public const string SaveDynamicFormResponse = nameof(SaveDynamicFormResponse);
                public const string DeleteFormResponse = nameof(DeleteFormResponse);

                /// <summary>Exports eForm responses to an Excel (.xlsx) file.</summary>
                public const string ExportFormResponses = nameof(ExportFormResponses);

                /// <summary>Sends a reminder message to respondents.</summary>
                public const string SaveNewMessage = nameof(SaveNewMessage);

                /// <summary>Redirects or provides data for the legacy PreviewPDFExport flow.</summary>
                public const string PreviewPDFExport = nameof(PreviewPDFExport);

                /// <summary>Returns consolidated form responses and SMS import metadata for the Records page.</summary>
                public const string DynamicFormRecords = nameof(DynamicFormRecords);

                public const string GetForms = nameof(GetForms);
                public const string GetFormById = nameof(GetFormById);
                public const string GetFormMetadata = nameof(GetFormMetadata);
                public const string GetFormsData = nameof(GetFormsData);
                public const string SearchForms = nameof(SearchForms);
                public const string GetDropdowns = nameof(GetDropdowns);
                public const string GetSiblings = nameof(GetSiblings);
                public const string GetDynamicFormRenderData = nameof(GetDynamicFormRenderData);
                public const string FormStatus = nameof(FormStatus);
                public const string ExportFormStatus = nameof(ExportFormStatus);
                public const string ActiveForms = nameof(ActiveForms);
                public const string SaveandSelectDynamicTableRecord = nameof(SaveandSelectDynamicTableRecord);
                public const string SaveDynamicForm = nameof(SaveDynamicForm);
                public const string DeleteDynamicFormSubSection = nameof(DeleteDynamicFormSubSection);
                public const string RenderDynamicForm = nameof(RenderDynamicForm);
                public const string AutoCompleteStudentName = nameof(AutoCompleteStudentName);
                public const string ExportDynamicRecord = nameof(ExportDynamicRecord);

                /// <summary>Renders the dynamic form datasets required for PDF generation.</summary>
                public const string RenderDynamicFormPDF = nameof(RenderDynamicFormPDF);

                public const string GetParentChild = nameof(GetParentChild);
                public const string GetStudentActiveForms = nameof(GetStudentActiveForms);
                public const string ParentActiveForms = nameof(ParentActiveForms);
                public const string AutoCompleteStudenName = nameof(AutoCompleteStudenName);
            }

            #region System alert / job listing (ParentAlerts)

            public static class SystemAlert
            {
                public const string GetAlertErrorsDetails = nameof(GetAlertErrorsDetails);
                public const string GetAlertErrorByOrgIdAndMessageId = nameof(GetAlertErrorByOrgIdAndMessageId);
                public const string GetEditAlertErrorDetails = nameof(GetEditAlertErrorDetails);
                public const string UpdateAlertErrorDetails = nameof(UpdateAlertErrorDetails);

                public const string GetAlertStatus = nameof(GetAlertStatus);

                /// <summary><c>[NewViper].[GetPASStatistic]</c> (legacy <c>PASStatistics</c>).</summary>
                public const string GetPasStatistics = nameof(GetPasStatistics);

                /// <summary><c>[Alerts].[admin_getUpcomingAlerts]</c> (legacy <c>AlertUpcomingList</c>).</summary>
                public const string GetAlertUpcomingList = nameof(GetAlertUpcomingList);

                /// <summary><c>[NewViper].[admin_getHoldProcessstatus]</c> (legacy <c>OnHoldAlerts</c>).</summary>
                public const string GetOnHoldAlerts = nameof(GetOnHoldAlerts);

                public const string UpcomingList = nameof(UpcomingList);

                /// <summary><c>[NewViper].[admin_getRecentlySent]</c> (legacy <c>AlertSentList</c>).</summary>
                public const string GetAlertSentList = nameof(GetAlertSentList);

                /// <summary><c>[NewViper].[Error_getErrorList]</c> with <c>@Type = '500'</c> (legacy <c>Error_500</c>).</summary>
                public const string GetSystemErrors500 = nameof(GetSystemErrors500);

                /// <summary><c>[NewViper].[Error_getErrorList]</c> with <c>@Type = '404'</c> (legacy <c>Error_404</c>).</summary>
                public const string GetSystemErrors404 = nameof(GetSystemErrors404);

                /// <summary><c>[NewViper].[Error_getErrorList]</c> with <c>@Type = 'vs'</c> (legacy <c>ViewState_Error</c>).</summary>
                public const string GetSystemErrorsViewState = nameof(GetSystemErrorsViewState);

                /// <summary><c>[NewViper].[Error_deleteError]</c> (legacy <c>DeleteErrorDetails</c>).</summary>
                public const string DeleteSystemErrorDetails = nameof(DeleteSystemErrorDetails);

                /// <summary><c>[NewViper].[Error_getErrorList]</c> with query <c>Type</c> / <c>IpAddress</c>.</summary>
                public const string GetSystemErrorList = nameof(GetSystemErrorList);

                /// <summary>Email channel alert status report (<c>@TypeId = 1</c>).</summary>
                public const string GetAlertStatusReportEmail = nameof(GetAlertStatusReportEmail);

                /// <summary>Voice channel alert status report (<c>@TypeId = 3</c>).</summary>
                public const string GetAlertStatusReportVoice = nameof(GetAlertStatusReportVoice);

                /// <summary>Text/SMS channel alert status report (<c>@TypeId = 5</c>).</summary>
                public const string GetAlertStatusReportText = nameof(GetAlertStatusReportText);

                /// <summary><c>[SIS].[GetAlertsforHealthCheck]</c> (legacy <c>AlertHealthCheck</c>).</summary>
                public const string GetAlertHealthCheck = nameof(GetAlertHealthCheck);

                /// <summary>Legacy <c>BouncedList</c> (health-check status or <c>message_getTransactionStatusesBList</c> path).</summary>
                public const string GetBouncedList = nameof(GetBouncedList);

                /// <summary><c>[dbo].[sp_SystemTraceLog]</c> with <c>@ActionId = 0</c> (legacy <c>TraceLog</c>).</summary>
                public const string GetSystemTraceLog = nameof(GetSystemTraceLog);

                /// <summary><c>[NewViper].[GetSMSActiveUser]</c> (legacy <c>SMSActiveUsers</c>).</summary>
                public const string GetSmsActiveUsers = nameof(GetSmsActiveUsers);

                /// <summary><c>[NewViper].[getLoginCountsBySchool_New]</c> (legacy <c>LoginCounts</c> / <c>Reports.LoginCounts</c>).</summary>
                public const string GetLoginCounts = nameof(GetLoginCounts);

                /// <summary><c>[NewViper].[LoginHistoryReports]</c> (legacy <c>LoginCountHistory</c>).</summary>
                public const string GetLoginCountHistory = nameof(GetLoginCountHistory);

                /// <summary>Consolidated EdFi report data (summary, filters, and records).</summary>
                public const string GetEdFiDataReport = nameof(GetEdFiDataReport);

                /// <summary>Returns all Org Integration records. Wraps <c>[NewViper].[GetOrgIntegration]</c>.</summary>
                public const string GetOrgIntegration = nameof(GetOrgIntegration);

                /// <summary>Returns or saves a single Org Integration record. Wraps <c>[NewViper].[SaveOrgIntegration]</c>.</summary>
                public const string GetOrgIntegrationById = nameof(GetOrgIntegrationById);

                /// <summary>Saves or updates an Org Integration record. Wraps <c>[NewViper].[SaveOrgIntegration]</c>.</summary>
                public const string SaveOrgIntegration = nameof(SaveOrgIntegration);

                /// <summary><c>[NewViper].[GetUserStatistics]</c> (legacy <c>UserStatistics</c>).</summary>
                public const string GetUserStatistics = nameof(GetUserStatistics);

                /// <summary><c>[NewViper].[GetDynamicReport]</c>.</summary>
                public const string GetDynamicReport = nameof(GetDynamicReport);
            }

            #endregion System alert / job listing (ParentAlerts)

            public static class Organization
            {
                public const string GetOrganizations = nameof(GetOrganizations);
                public const string GetFilteredSchools = nameof(GetFilteredSchools);
                public const string SchoolDetailList = "/school-detail-list";
                public const string SchoolDetailsNew = "/school-details-new";
                public const string AdminPortalLogin = "/school-admin-login";
                public const string OldOptionCLogin = "/old-optionc-login";
                public const string SchoolStaffDetailsAdd = "/school-staff-details-add";
                public const string SchoolStaffDetailsDelete = "/school-staffdetailsdelete";

                public const string FamilyLogin = "/school-family-login";
                public const string StudentLogin = "/school-student-login";
                public const string OrganizationList = "/organization-list";
                public const string OrganizationNavication = "/organization-navication";
                public const string GoToLink = "/go-to-link";
                public const string MattMoneySetup = "/matt-money-setup";
                public const string SchoolInfo = "/SchoolInfo";

                /// <summary>Deleted classes grid (<c>dbo.Classes_ListDeletedClasses</c>).</summary>
                public const string GetRestoreDeletedClassList = nameof(GetRestoreDeletedClassList);

                /// <summary>Restore deleted classes (<c>dbo.Class_RestoreDeletedClass</c>).</summary>
                public const string PostRestoreDeletedClasses = nameof(PostRestoreDeletedClasses);

                /// <summary>Delete attendance page data (<c>Viper.getClassAttendanceForDate</c>).</summary>
                public const string GetDeleteClassAttendance = nameof(GetDeleteClassAttendance);

                /// <summary>Delete attendance rows (<c>Viper.DeleteAttendanceForDate</c>).</summary>
                public const string PostDeleteClassAttendanceForStudents = nameof(PostDeleteClassAttendanceForStudents);

                /// <summary>Deleted assignments grid (<c>[Viper].[Classes_ListDeletedAssignments]</c>).</summary>
                public const string GetRestoreDeletedAssignmentList = nameof(GetRestoreDeletedAssignmentList);

                /// <summary>Restore deleted assignments (<c>Viper.Class_RestoreDeletedTask</c>).</summary>
                public const string PostRestoreDeletedAssignments = nameof(PostRestoreDeletedAssignments);

                /// <summary>Homeroom designation page (<c>Viper.getClassListForSchool</c>).</summary>
                public const string GetDesignateHomerooms = nameof(GetDesignateHomerooms);

                /// <summary>Update homeroom designations (<c>[Viper].[UpdateHomerooms]</c>).</summary>
                public const string PostUpdateDesignateHomerooms = nameof(PostUpdateDesignateHomerooms);

                /// <summary>Clear class roster grid (<c>Viper.getClassesWithFilter</c>).</summary>
                public const string GetClearClassRoster = nameof(GetClearClassRoster);

                /// <summary>Remove students from selected classes (<c>Viper.DeleteStudentsFromClassList</c>).</summary>
                public const string PostClearClassRoster = nameof(PostClearClassRoster);

                /// <summary>Course standard details (<c>[NewViper].[GetCourseStandardDetails]</c>).</summary>
                public const string GetCourseStandardDetails = nameof(GetCourseStandardDetails);

                /// <summary>Save standard grading flag (<c>[dbo].[SaveCoursestandardGrading]</c>).</summary>
                public const string PostSaveStandardGrade = nameof(PostSaveStandardGrade);

                /// <summary>Generate random passwords (<c>[NewViper].[GenerateRandomPassword]</c>).</summary>
                public const string PostPasswordGenerate = nameof(PostPasswordGenerate);

                /// <summary>School staff list (<c>[dbo].[Viper_getStaffList]</c>).</summary>
                public const string GetStaffList = nameof(GetStaffList);

                /// <summary>Staff details for add/edit page (<c>[Viper].[schools_getStaffDetailsPage]</c>).</summary>
                public const string GetSchoolStaffDetails = nameof(GetSchoolStaffDetails);

                public const string GetSchoolStudentDetails = nameof(GetSchoolStudentDetails);

                public const string GetSchoolRelativesDetails = nameof(GetSchoolRelativesDetails);

                public const string GetSchoolVolunteerDetails = nameof(GetSchoolVolunteerDetails);

                public const string GetSchoolDisabledDetails = nameof(GetSchoolDisabledDetails);

                public const string GetSchoolHealthCheckDetails = nameof(GetSchoolHealthCheckDetails);

                public const string DeleteSchoolDisabledUser = nameof(DeleteSchoolDisabledUser);

                /// <summary>Insert or update school staff (<c>[NewViper].[schools_insertStaff]</c> / <c>[NewViper].[schools_updateStaff]</c>).</summary>
                public const string PostSaveSchoolStaff = nameof(PostSaveSchoolStaff);

                /// <summary>Set organization principal (<c>Viper.UpdateAdministrators</c>).</summary>
                public const string PostUpdatePrincipal = nameof(PostUpdatePrincipal);

                /// <summary>MattMoney setup details (<c>[NewViper].[getOrganizationProfile]</c>).</summary>
                public const string GetMattMoneySetup = nameof(GetMattMoneySetup);

                /// <summary>Update MattMoney setup (<c>[NewViper].[UpdateOrganizationProfile_mm]</c>).</summary>
                public const string UpdateMattMoneySetup = nameof(UpdateMattMoneySetup);

                /// <summary>Create organization profile + MattMoney setup (<c>[NewViper].[UpdateOrganizationProfile_mm]</c> with insert action).</summary>
                public const string CreateMattMoneySetup = nameof(CreateMattMoneySetup);

                public const string GetOrganizationProfile = nameof(GetOrganizationProfile);

                /// <summary>School details (<c>NewViper.schools_getSchoolDetailsPage</c>).</summary>
                public const string GetSchoolInfo = nameof(GetSchoolInfo);

                /// <summary>Update school info (<c>[NewViper].[schools_updateSchool]</c>).</summary>
                public const string UpdateSchoolInfo = nameof(UpdateSchoolInfo);

                /// <summary>School settings page (<c>[NewViper].[GetAccumulatedSickDays]</c> with action id for GET).</summary>
                public const string GetSchoolSettings = nameof(GetSchoolSettings);

                /// <summary>Update school settings (<c>[NewViper].[GetAccumulatedSickDays]</c> with action id for update).</summary>
                public const string UpdateSchoolSettings = nameof(UpdateSchoolSettings);

                /// <summary>Account managers page (<c>NewViper.schools_getSchoolDetailsPage</c>).</summary>
                public const string GetSchoolAccountManagers = nameof(GetSchoolAccountManagers);

                /// <summary>Update school account managers (<c>Viper.schools_updateAccountManagers</c>).</summary>
                public const string UpdateSchoolAccountManager = nameof(UpdateSchoolAccountManager);

                /// <summary>Product information page (<c>NewViper.schools_getSchoolDetailsPage</c>).</summary>
                public const string GetSchoolProductInformation = nameof(GetSchoolProductInformation);

                /// <summary>Update school products (<c>[Viper].[schools_updateSchoolProducts]</c>).</summary>
                public const string UpdateSchoolProductInformation = nameof(UpdateSchoolProductInformation);

                /// <summary>Save SMS activation/deactivation dates (legacy: <c>OrganizationsController.SaveSMSDate</c>).</summary>
                public const string SaveSMSDate = nameof(SaveSMSDate);

                /// <summary>Activate/Deactivate Parent Alerts (legacy: <c>OrganizationsController.SaveActivateParentAlerts</c>).</summary>
                public const string SaveActivateParentAlerts = nameof(SaveActivateParentAlerts);

                public const string PostSoldParentAlerts = nameof(PostSoldParentAlerts);
                public const string PostSoldActiveSMS = nameof(PostSoldActiveSMS);

                /// <summary>Organization list (<c>[NewViper].[getOrganizationList]</c>).</summary>
                public const string GetOrganizationList = nameof(GetOrganizationList);

                /// <summary>Organization list V1 with pagination (<c>[NewViper].[getOrganizationListV1]</c>).</summary>
                public const string GetOrganizationListV1 = nameof(GetOrganizationListV1);

                /// <summary>Update organization profile (<c>[NewViper].[UpdateOrganizationProfile]</c>).</summary>
                public const string UpdateOrganizationProfile = nameof(UpdateOrganizationProfile);

                public const string GetSchoolComments = nameof(GetSchoolComments);
                public const string PostSaveSchoolComment = nameof(PostSaveSchoolComment);
                public const string PostDeleteSchoolComment = nameof(PostDeleteSchoolComment);
                public const string GetSchoolTickets = nameof(GetSchoolTickets);
                public const string GetSchoolTicketDetails = nameof(GetSchoolTicketDetails);
                public const string PostUpdateSchoolTicket = nameof(PostUpdateSchoolTicket);
                public const string GetSchoolHealth = nameof(GetSchoolHealth);
                public const string GetACRStaffList = nameof(GetACRStaffList);
                public const string PostUpdateACRStaff = nameof(PostUpdateACRStaff);
                public const string GetSchoolContractEnds = nameof(GetSchoolContractEnds);
                public const string PostUpdateSchoolContractEndDate = nameof(PostUpdateSchoolContractEndDate);
                public const string GetInvoiceHistory = nameof(GetInvoiceHistory);
                public const string PostUpdateInvoicePaidDate = nameof(PostUpdateInvoicePaidDate);

                //MattMoney
                public const string GetDashboardData = nameof(GetDashboardData);

                public const string GetFamilyTable = nameof(GetFamilyTable);
                public const string GetCategoryTable = nameof(GetCategoryTable);

                public const string GetEnrollmentByGradeLevel = nameof(GetEnrollmentByGradeLevel);
                public const string GetStudentsNotEnrolledInClasses = nameof(GetStudentsNotEnrolledInClasses);
                public const string GetInvoiceItems = nameof(GetInvoiceItems);
                public const string GetInvoiceItemById = nameof(GetInvoiceItemById);
                public const string PostSaveInvoiceItem = nameof(PostSaveInvoiceItem);
                public const string PostDeleteInvoiceItem = nameof(PostDeleteInvoiceItem);
                public const string GetGenerateInvoiceDetails = nameof(GetGenerateInvoiceDetails);
                public const string GetGenerateInvoicePdf = nameof(GetGenerateInvoicePdf);
                public const string PostSaveGenerateInvoice = nameof(PostSaveGenerateInvoice);
                public const string PostDeleteInvoice = nameof(PostDeleteInvoice);

                public const string PostSaveStaffMember = nameof(PostSaveStaffMember);
                public const string PostDeleteStaffMember = nameof(PostDeleteStaffMember);

                public const string ActivateBetaSMS = nameof(ActivateBetaSMS);
                public const string ActivateHallow = nameof(ActivateHallow);
                public const string GetActivateWelcome = nameof(GetActivateWelcome);
                public const string UpdateActivateWelcome = nameof(UpdateActivateWelcome);

                public const string UpdateActivatePopups = nameof(UpdateActivatePopups);
                public const string GetVincentVolunteerDetails = nameof(GetVincentVolunteerDetails);
                public const string UpdateVincentVolunteer = nameof(UpdateVincentVolunteer);
                public const string GetEdfiSettings = nameof(GetEdfiSettings);
                public const string GetEdfiSettingsById = nameof(GetEdfiSettingsById);
                public const string SaveEdfiSettings = nameof(SaveEdfiSettings);
                public const string GetOrganizationSupportData = nameof(GetOrganizationSupportData);
                public const string GetOrganizationManagementSupportData = nameof(GetOrganizationManagementSupportData);
                public const string GetStaffMembers = nameof(GetStaffMembers);
            }

            public static class AchReport
            {
                /// <summary>Legacy <c>ViperParentAccountSetup</c>.</summary>
                public const string GetViperParentAccountSetup = nameof(GetViperParentAccountSetup);

                /// <summary>Legacy <c>AutoWithdrawal</c>.</summary>
                public const string GetAutoWithdrawalList = nameof(GetAutoWithdrawalList);
            }

            public static class Grading
            {
                public const string AlphaScales = nameof(AlphaScales);
                public const string GetAlphaScales = nameof(GetAlphaScales);
                public const string SaveAlphaScale = nameof(SaveAlphaScale);
                public const string DeleteAlphaScale = nameof(DeleteAlphaScale);
                public const string GetAlphaScaleGroups = nameof(GetAlphaScaleGroups);
                public const string SaveAlphaScaleGroup = nameof(SaveAlphaScaleGroup);
                public const string InsertAlphaScaleGroup = nameof(InsertAlphaScaleGroup);
                public const string UpdateAlphaScaleGroup = nameof(UpdateAlphaScaleGroup);
                public const string DeleteAlphaScaleGroup = nameof(DeleteAlphaScaleGroup);
                public const string GetAlphaScaleGroupProperties = nameof(GetAlphaScaleGroupProperties);
                public const string GetAlphaScaleValueProperties = nameof(GetAlphaScaleValueProperties);
                public const string InsertAlphaScaleValue = nameof(InsertAlphaScaleValue);
                public const string UpdateAlphaScaleValue = nameof(UpdateAlphaScaleValue);
                public const string DeleteAlphaScaleValue = nameof(DeleteAlphaScaleValue);
                public const string GetCommentCodes = nameof(GetCommentCodes);
                public const string GetGradeScales = nameof(GetGradeScales);
                public const string GetSkillList = nameof(GetSkillList);
                public const string GetSkillScales = nameof(GetSkillScales);
                public const string GetSkillGrades = nameof(GetSkillGrades);
                public const string UpdateSkillGrade = nameof(UpdateSkillGrade);
                public const string Getgrading = nameof(Getgrading);
                public const string GetFinalTermGrades = nameof(GetFinalTermGrades);
                public const string GetWeightsSummary = nameof(GetWeightsSummary);
                public const string GetStudentTaskGrades = nameof(GetStudentTaskGrades);
                public const string GetAssignmentGrades = nameof(GetAssignmentGrades);
            }

            public static class Features
            {
                public const string GetTermsManager = nameof(GetTermsManager);
                public const string GetDateToDeleteClassAttendance = nameof(GetDateToDeleteClassAttendance);
                public const string GetStudentMealsEligibility = nameof(GetStudentMealsEligibility);
                public const string UpdateStudentLunchEligibility = nameof(UpdateStudentLunchEligibility);
                public const string GetSkillsList = nameof(GetSkillsList);
                public const string GetGpaReportByTerm = nameof(GetGpaReportByTerm);
                public const string UpdateLunchDiscount = nameof(UpdateLunchDiscount);
            }

            #region Support

            public static class Support
            {
                public const string GetMissingHelpLinks = nameof(GetMissingHelpLinks);
                public const string GetHelpUsage = nameof(GetHelpUsage);
                public const string GetHelpUsageHits = nameof(GetHelpUsageHits);
                public const string GetRenaissance = nameof(GetRenaissance);
                public const string GetMobileAppSubscription = nameof(GetMobileAppSubscription);

                /// <summary>Catholic content admin (legacy Viper Catholic Content area).</summary>
                public static class CatholicContent
                {
                    public const string GetCatholicContentGrid = nameof(GetCatholicContentGrid);

                    public const string DeleteCatholicContent = nameof(DeleteCatholicContent);

                    public const string GetCatholicContentDocumentLink = nameof(GetCatholicContentDocumentLink);

                    public const string GetCatholicContentFileName = nameof(GetCatholicContentFileName);

                    public const string SearchCatholicContentTags = nameof(SearchCatholicContentTags);

                    public const string SetCatholicContentActive = nameof(SetCatholicContentActive);

                    public const string GetCatholicContentEdit = nameof(GetCatholicContentEdit);

                    public const string SaveCatholicContent = nameof(SaveCatholicContent);

                    public const string SaveCatholicContentTag = nameof(SaveCatholicContentTag);
                }

                /// <summary>Home page editor (legacy Viper <c>StartUpSettingController</c>).</summary>
                public static class HomePageEditor
                {
                    public const string GetHomePageEditorGrid = nameof(GetHomePageEditorGrid);
                    public const string GetHomePageEditorForEdit = nameof(GetHomePageEditorForEdit);
                    public const string CheckHomePageEditorName = nameof(CheckHomePageEditorName);
                    public const string DeleteHomePageEditor = nameof(DeleteHomePageEditor);
                    public const string SaveHomePageEditor = nameof(SaveHomePageEditor);
                    public const string UploadHomePageEditorFiles = nameof(UploadHomePageEditorFiles);
                    public const string SaveHomePageEditorCsgMessage = nameof(SaveHomePageEditorCsgMessage);
                }

                /// <summary>Resource library (legacy Viper <c>DocumentationLibraryController</c>).</summary>
                public static class ResourceLibrary
                {
                    public const string GetResourceLibrary = nameof(GetResourceLibrary);

                    public const string GetResourceAddPage = nameof(GetResourceAddPage);

                    public const string GetResourceForEdit = nameof(GetResourceForEdit);

                    public const string SaveResource = nameof(SaveResource);

                    public const string DeleteResource = nameof(DeleteResource);

                    public const string SaveSeriesName = nameof(SaveSeriesName);

                    public const string CheckResource = nameof(CheckResource);

                    public const string GetSeriesSequence = nameof(GetSeriesSequence);

                    public const string SyncNextGenResourceFile = nameof(SyncNextGenResourceFile);
                }

                /// <summary>Sign-in page images and prayer (legacy Viper <c>SignInSettingsController</c>).</summary>
                public static class SignInSettings
                {
                    public const string GetSignInPageImages = nameof(GetSignInPageImages);

                    public const string GetSignInPagePrayer = nameof(GetSignInPagePrayer);

                    public const string GetSignInImageForEdit = nameof(GetSignInImageForEdit);

                    public const string CheckSignInImageDate = nameof(CheckSignInImageDate);

                    /// <summary>Multipart: metadata + optional <c>ImageFile</c> in one request (no separate upload).</summary>
                    public const string SaveSignInImage = nameof(SaveSignInImage);

                    public const string DeleteSignInImage = nameof(DeleteSignInImage);

                    public const string GetSignInPrayerForEdit = nameof(GetSignInPrayerForEdit);

                    public const string CheckSignInPrayerDate = nameof(CheckSignInPrayerDate);

                    public const string SaveSignInPrayer = nameof(SaveSignInPrayer);

                    public const string DeleteSignInPrayer = nameof(DeleteSignInPrayer);
                }

                public static class SaintOfTheDay
                {
                    public const string GetSaintOfTheDayList = nameof(GetSaintOfTheDayList);
                    public const string GetSaintOfTheDayById = nameof(GetSaintOfTheDayById);
                    public const string SaveSaintOfTheDay = nameof(SaveSaintOfTheDay);
                    public const string DeleteSaintOfTheDay = nameof(DeleteSaintOfTheDay);
                    public const string GetSaintImageAudit = nameof(GetSaintImageAudit);
                }

                /// <summary>FAQ category grid (<c>[NewViper].[Viper_GetFAQCategories]</c>).</summary>
                public const string GetFaqCategories = nameof(GetFaqCategories);

                /// <summary>Delete FAQ category (<c>[NewViper].[Viper_FAQ_Categories]</c>).</summary>
                public const string DeleteFaqCategory = nameof(DeleteFaqCategory);

                /// <summary>Fetch one FAQ category (<c>[NewViper].[Viper_FAQ_Categories]</c>).</summary>
                public const string GetFaqCategoryById = nameof(GetFaqCategoryById);

                /// <summary>FAQ detail grid (<c>[NewViper].[Viper_GetFAQ]</c>).</summary>
                public const string GetFaqDetails = nameof(GetFaqDetails);

                /// <summary>Add / edit / copy FAQ page model (<c>[NewViper].[getFAQ]</c> / <c>Viper.getFAQInfo</c>).</summary>
                public const string GetFaqDetailsPage = nameof(GetFaqDetailsPage);

                /// <summary>Insert or update FAQ (<c>Viper.InsertFAQ</c> / <c>Viper.UpdateFAQ</c>).</summary>
                public const string PostSaveFaqDetails = nameof(PostSaveFaqDetails);

                public const string PostSaveAndUpdateCategories = nameof(PostSaveAndUpdateCategories);

                /// <summary>FAQ info by id (<c>Viper.getFAQInfo</c>).</summary>
                public const string GetFaqInformationById = nameof(GetFaqInformationById);

                public const string FAQDelete = nameof(FAQDelete);
            }

            #endregion Support

            public static class Reports
            {
                public const string GetAchActivityReport = nameof(GetAchActivityReport);

                /// <summary>Generate summarized activity data (legacy CardActivityStatement).</summary>
                public const string GetCardActivityData = nameof(GetCardActivityData);

                /// <summary>Card activity report metadata (legacy CardActivityReport).</summary>
                public const string GetCardActivityReport = nameof(GetCardActivityReport);

                public const string GetCardDetailedReport = nameof(GetCardDetailedReport);

                /// <summary>Generate the detailed data rows (legacy CarddetailStatement).</summary>
                public const string GetCardDetailedData = nameof(GetCardDetailedData);

                public const string GetCardFundingReport = nameof(GetCardFundingReport);

                /// <summary>Generate the funding data rows (legacy CardbankfundingStatement).</summary>
                public const string GetCardFundingData = nameof(GetCardFundingData);

                /// <summary>ACH activity data (legacy ParentAccountSetup).</summary>
                public const string GetAchActivityData = nameof(GetAchActivityData);

                public const string GetAchDetailedData = nameof(GetAchDetailedData);
                public const string GetAchDetailedReport = nameof(GetAchDetailedReport);
                public const string GetParentAccountSetup = nameof(GetParentAccountSetup);
                public const string GetContentViewLogs = nameof(GetContentViewLogs);
                public const string PrepareMailingLabels = nameof(PrepareMailingLabels);
                public const string GetPromotionRegistrants = nameof(GetPromotionRegistrants);
                public const string GetProspectCounts = nameof(GetProspectCounts);
                public const string GetSchoolContractEndDates = nameof(GetSchoolContractEndDates);
                public const string GetSchoolTermDates = nameof(GetSchoolTermDates);
                public const string GetPasUsageLogs = nameof(GetPasUsageLogs);
                public const string UpdateSchoolContractEndDate = nameof(UpdateSchoolContractEndDate);
                public const string GetUserInformation = nameof(GetUserInformation);
                public const string GetEmailConversion = nameof(GetEmailConversion);
                public const string GetAutoWithdrawalList = nameof(GetAutoWithdrawalList);
                public const string GetServicesReports = nameof(GetServicesReports);
                public const string GetFormerUIAccessLogsList = nameof(GetFormerUIAccessLogsList);
                public const string GetFeatureUsage = nameof(GetFeatureUsage);
                public const string GetNewSchoolStatus = nameof(GetNewSchoolStatus);
                public const string GetSchoolSetupDates = nameof(GetSchoolSetupDates);
                public const string UpdateSchoolSetupDates = nameof(UpdateSchoolSetupDates);
                public const string GetTrainingRegistrants = nameof(GetTrainingRegistrants);
                public const string GetTrainingRegistrantsByTopic = nameof(GetTrainingRegistrantsByTopic);
                public const string GetHallowReport = nameof(GetHallowReport);
                public const string GetSurveyReport = nameof(GetSurveyReport);
                public const string GetSponsorVisitingSummary = nameof(GetSponsorVisitingSummary);
                public const string GetPrepareUserExport = nameof(GetPrepareUserExport);
                public const string GetPrepareDioceseExport = nameof(GetPrepareDioceseExport);
                public const string GetUserEmailAddresses = nameof(GetUserEmailAddresses);
                public const string GetPasUsageReports = nameof(GetPasUsageReports);
                public const string GetMMSetUpProcessReport = nameof(GetMMSetUpProcessReport);
                public const string GetOHeavenlyReport = nameof(GetOHeavenlyReport);
                public const string UpdateTrainingAttendance = nameof(UpdateTrainingAttendance);
                public const string GetBankFundingReport = nameof(GetBankFundingReport);
                public const string GetServiceFeeReport = nameof(GetServiceFeeReport);
                public const string GetPriorityReport = nameof(GetPriorityReport);
                public const string GetSchoolData = nameof(GetSchoolData);
                public const string GetDioceseUserData = nameof(GetDioceseUserData);
                public const string GetLoginHistory = nameof(GetLoginHistory);
                public const string GetLoginCounts = nameof(GetLoginCounts);
            }
        }

        public static class API_Administration
        {
            public const string GetHelpContent = nameof(GetHelpContent);
            public const string GetPhoneEMailAddressLookup = nameof(GetPhoneEMailAddressLookup);
            public const string GetImportPage = nameof(GetImportPage);
            public const string UpdateImportedData = nameof(UpdateImportedData);
            public const string UploadDataEditMode = nameof(UploadDataEditMode);
            public const string ImportFile = nameof(ImportFile);
            public const string GetHelpContentById = nameof(GetHelpContentById);
            public const string GetByContentNo = nameof(GetByContentNo);
            public const string DeleteHelpContent = nameof(DeleteHelpContent);
            public const string SaveHelpContent = nameof(SaveHelpContent);

            public const string GetSchoolWorkload = nameof(GetSchoolWorkload);
            public const string GenericSchoolDataImport = nameof(GenericSchoolDataImport);

            public const string DeleteMissingHelpLink = nameof(DeleteMissingHelpLink);

            // Customer Directory
            public const string GetCustomerDirectory = nameof(GetCustomerDirectory);

            public const string SaveCustomerDirectory = nameof(SaveCustomerDirectory);
            public const string DeleteCustomerDirectory = nameof(DeleteCustomerDirectory);
            public const string GetCustomerDirectoryById = nameof(GetCustomerDirectoryById);

            // Diocese
            public const string GetDiocese = nameof(GetDiocese);

            public const string GetDioceseDetails = nameof(GetDioceseDetails);
            public const string GetDioceseUsers = nameof(GetDioceseUsers);
            public const string GetDioceseAccountManagers = nameof(GetDioceseAccountManagers);
            public const string GetDioceseProductInformation = nameof(GetDioceseProductInformation);
            public const string GetDioceseSchoolListFilter = nameof(GetDioceseSchoolListFilter);
            public const string GetDioceseComments = nameof(GetDioceseComments);
            public const string DioceseTickets = nameof(DioceseTickets);
            public const string ViewTicketOnDiocese = nameof(ViewTicketOnDiocese);
            public const string UpdateTicket = nameof(UpdateTicket);
            public const string DioceseUsersDetails = nameof(DioceseUsersDetails);
            public const string GetDioParishList = nameof(GetDioParishList);
            public const string UpdateDiocese = nameof(UpdateDiocese);
            public const string UpdateStaff = nameof(UpdateStaff);
            public const string InsertStaff = nameof(InsertStaff);
            public const string UpdateDioceseAccountManagers = nameof(UpdateDioceseAccountManagers);
            public const string UpdateDioceseProducts = nameof(UpdateDioceseProducts);
            public const string AddDioceseComment = nameof(AddDioceseComment);
            public const string GetDioceseSchoolList = nameof(GetDioceseSchoolList);
            public const string ParishInfoEdit = nameof(ParishInfoEdit);
            public const string SaveParishDatails = nameof(SaveParishDatails);

            // Data Import
            public const string GetSchools = nameof(GetSchools);

            public const string ImportGenericData = nameof(ImportGenericData);
            public const string GetGenericImportPreview = nameof(GetGenericImportPreview);
            public const string CompleteGenericImport = nameof(CompleteGenericImport);
            public const string GetPhiladelphiaSchoolPage = nameof(GetPhiladelphiaSchoolPage);

            public const string ImportPhiladelphiaStaff = nameof(ImportPhiladelphiaStaff);
            public const string ImportPhiladelphiaStudent = nameof(ImportPhiladelphiaStudent);
            public const string ImportPhiladelphiaParent = nameof(ImportPhiladelphiaParent);
            public const string GetPhiladelphiaPreview = nameof(GetPhiladelphiaPreview);
            public const string CompletePhiladelphiaImport = nameof(CompletePhiladelphiaImport);
            public const string GetPhiladelphiaStaffImportDetails = nameof(GetPhiladelphiaStaffImportDetails);
            public const string GetPhiladelphiaStudentImportDetails = nameof(GetPhiladelphiaStudentImportDetails);
            public const string GetPhiladelphiaParentImportDetails = nameof(GetPhiladelphiaParentImportDetails);

            // Sponsor Ads
            public const string GetSponsorAdsPage = nameof(GetSponsorAdsPage);

            public const string GetSponsorAd = nameof(GetSponsorAd);
            public const string SaveSponsorAd = nameof(SaveSponsorAd);
            public const string DeleteSponsorAd = nameof(DeleteSponsorAd);

            // Staff Directory
            public const string GetStaffDirectory = nameof(GetStaffDirectory);

            public const string GetUserDetails = nameof(GetUserDetails);
            public const string SaveStaffDirectory = nameof(SaveStaffDirectory);
            public const string DeleteStaffDirectory = nameof(DeleteStaffDirectory);
            public const string GetStaffById = nameof(GetStaffById);
            public const string ResetStaffPassword = nameof(ResetStaffPassword);

            // System Messages
            public const string GetSystemMessages = nameof(GetSystemMessages);

            public const string GetRecurringMessages = nameof(GetRecurringMessages);
            public const string GetSystemMessageById = nameof(GetSystemMessageById);
            public const string SaveSystemMessage = nameof(SaveSystemMessage);
            public const string DeleteSystemMessage = nameof(DeleteSystemMessage);
            public const string UploadSystemMessageFile = nameof(UploadSystemMessageFile);
            public const string GetNewsLetters = nameof(GetNewsLetters);
            public const string GetNewsLetterById = nameof(GetNewsLetterById);
            public const string SaveNewsLetter = nameof(SaveNewsLetter);
            public const string DeleteNewsLetter = nameof(DeleteNewsLetter);

            // Training Schedule
            public const string GetTrainingSchedules = nameof(GetTrainingSchedules);

            public const string GetTrainingScheduleById = nameof(GetTrainingScheduleById);

            public const string ImportTrainingSchedule = nameof(ImportTrainingSchedule);
            public const string Download = nameof(Download);
            public const string UpdateImport = nameof(UpdateImport);
            public const string GetImportExcelData = nameof(GetImportExcelData);
            public const string ExportTrainingSchedule = nameof(ExportTrainingSchedule);
            public const string DownloadImportTemplate = nameof(DownloadImportTemplate);
            public const string HasPendingImport = nameof(HasPendingImport);
            public const string GetImportPreview = nameof(GetImportPreview);
            public const string UploadImportFile = nameof(UploadImportFile);
            public const string UpdateImportRow = nameof(UpdateImportRow);
            public const string FinalizeImport = nameof(FinalizeImport);
            public const string UpdateWizardStep = nameof(UpdateWizardStep);
            public const string DeleteTrainingSchedule = nameof(DeleteTrainingSchedule);
            public const string SaveTrainingSchedule = nameof(SaveTrainingSchedule);
            public const string UploadTrainingScheduleFiles = nameof(UploadTrainingScheduleFiles);

            // User Rights and Roles
            public const string GetAdminMenu = nameof(GetAdminMenu);

            public const string GetParentMenu = nameof(GetParentMenu);
            public const string UpdateAdminMenu = nameof(UpdateAdminMenu);
            public const string UpdateParentMenu = nameof(UpdateParentMenu);
            public const string GetUserRights = nameof(GetUserRights);
            public const string SaveUserRights = nameof(SaveUserRights);
            public const string GetUserRoles = nameof(GetUserRoles);
            public const string GetUserRoleById = nameof(GetUserRoleById);
            public const string SaveUserRole = nameof(SaveUserRole);
            public const string DeleteUserRole = nameof(DeleteUserRole);
            public const string GetUserRolesForEdit = nameof(GetUserRolesForEdit);
            public const string FetchUserRole = nameof(FetchUserRole);

            // Support Data
            public const string GetDioceseSupportData = nameof(GetDioceseSupportData);

            public const string GetPermissionSupportData = nameof(GetPermissionSupportData);
            public const string GetTrainingScheduleSupportData = nameof(GetTrainingScheduleSupportData);
            public const string GetOrganizationSupportData = nameof(GetOrganizationSupportData);
        }

        public static class API_Family
        {
            public static class Student
            {
                //Assignment Overview
                public const string GetAssignmentOverview = nameof(GetAssignmentOverview);

                //Assignment
                public const string GetAssignment = nameof(GetAssignment);

                public const string GetAssignmentHistory = nameof(GetAssignmentHistory);
                public const string GetTermGrades = nameof(GetTermGrades);

                //Report Card
                public const string GetReportCard = nameof(GetReportCard);

                public const string GetViewReportCardPage = nameof(GetViewReportCardPage);
                public const string SaveReportCard = nameof(SaveReportCard);

                //Classess
                public const string GetClassess = nameof(GetClassess);

                public const string CopyFiles = nameof(CopyFiles);

                //Nurse Visit
                public const string GetNurseVisit = nameof(GetNurseVisit);

                //Attendance History
                public const string GetAttendanceHistory = nameof(GetAttendanceHistory);

                //Conduct
                public const string GetConduct = nameof(GetConduct);

                public const string GetConductbyId = nameof(GetConductbyId);
                public const string InsertAssignmentFileSubmissionAsync = nameof(InsertAssignmentFileSubmissionAsync);
                public const string withdrawassignmentsubmission = nameof(withdrawassignmentsubmission);
                public const string downloadassignmentsubmissionfileAsync = nameof(downloadassignmentsubmissionfileAsync);
                public const string downloadassignment = nameof(downloadassignment);

                // Localization
                public const string ChangeLanguage = nameof(ChangeLanguage);
            }

            public static class Office
            {
                //Contact Information
                public const string GetContactInformation = nameof(GetContactInformation);

                public const string GetUserWizard = nameof(GetUserWizard);
                public const string FetchStudentTransactionInfoAsync = nameof(FetchStudentTransactionInfoAsync);
                public const string GetSMSStudentProfile = nameof(GetSMSStudentProfile);

                // Student Details Delegated
                public const string GetStudentEmergencyContacts = nameof(GetStudentEmergencyContacts);

                public const string GetStudentEmergencyContactForm = nameof(GetStudentEmergencyContactForm);
                public const string GetEditUserEmergencyContactForm = nameof(GetEditUserEmergencyContactForm);
                public const string SaveStudentEmergencyContact = nameof(SaveStudentEmergencyContact);
                public const string SaveStudentFamilyEmergencyContact = nameof(SaveStudentFamilyEmergencyContact);
                public const string DeleteStudentEmergencyContact = nameof(DeleteStudentEmergencyContact);
                public const string DeleteStudentFamilyEmergencyContact = nameof(DeleteStudentFamilyEmergencyContact);
                public const string GetStudentDemographics = nameof(GetStudentDemographics);
                public const string GetStudentEthnicOrigins = nameof(GetStudentEthnicOrigins);
                public const string UpdateStudentDemographics = nameof(UpdateStudentDemographics);
                public const string GetStudentSacraments = nameof(GetStudentSacraments);
                public const string UpdateStudentSacraments = nameof(UpdateStudentSacraments);
                public const string GetStudentMedicalInfo = nameof(GetStudentMedicalInfo);
                public const string GetMedicalProviderContact = nameof(GetMedicalProviderContact);
                public const string UpdateStudentMedicalProfile = nameof(UpdateStudentMedicalProfile);
                public const string GetStudentMedications = nameof(GetStudentMedications);
                public const string GetStudentMedicationForm = nameof(GetStudentMedicationForm);
                public const string SaveStudentMedication = nameof(SaveStudentMedication);
                public const string DeleteStudentMedication = nameof(DeleteStudentMedication);
                public const string GetParishInfo = nameof(GetParishInfo);

                public const string GetStudentUserProfile = nameof(GetStudentUserProfile);
                public const string UpdateStudentUserProfile = nameof(UpdateStudentUserProfile);
                public const string UpdateNextApproved = nameof(UpdateNextApproved);

                //Family Profile
                public const string GetFamilyProfile = nameof(GetFamilyProfile);

                public const string GetStateList = nameof(GetStateList);
                public const string SaveFamilyProfile = nameof(SaveFamilyProfile);
                public const string UpdateContactInformation = nameof(UpdateContactInformation);

                //Calender
                public const string GetCalender = nameof(GetCalender);

                //Change User Password
                public const string GetChangeUserPassword = nameof(GetChangeUserPassword);

                public const string UpdateChangeUserPassword = nameof(UpdateChangeUserPassword);

                //Change Student Password
                public const string GetChangeStudentPassword = nameof(GetChangeStudentPassword);

                public const string UpdateChangeStudentPassword = nameof(UpdateChangeStudentPassword);

                //Meal Order
                public const string GetMealOrder = nameof(GetMealOrder);

                public const string SaveMealOrder = nameof(SaveMealOrder);
                public const string UpdateMealOrder = nameof(UpdateMealOrder);
                public const string PrintMealOrder = nameof(PrintMealOrder);

                //Teacher Conferences
                public const string GetTeacherConferences = nameof(GetTeacherConferences);

                public const string UpdateTeacherConferences = nameof(UpdateTeacherConferences);
                public const string GetTeacherConferencesDetails = nameof(GetTeacherConferencesDetails);
                public const string UpdateTeacherConferencesDetails = nameof(UpdateTeacherConferencesDetails);

                //Registration Form
                public const string GetReenrollment = nameof(GetReenrollment);

                public const string GetReenrollmentCheckout = nameof(GetReenrollmentCheckout);
                public const string GetNewStudent = nameof(GetNewStudent);
                public const string GetReRegisterForm = nameof(GetReRegisterForm);
                public const string UpdateReRegisterForm = nameof(UpdateReRegisterForm);
                public const string SaveNewStudent = nameof(SaveNewStudent);
                public const string UpdateProspect = nameof(UpdateProspect);

                // Enrollment Intention
                public const string GetEnrollmentIntention = nameof(GetEnrollmentIntention);

                public const string UpdateIntension = nameof(UpdateIntension);
                public const string GetIntentionAndRegistration = nameof(GetIntentionAndRegistration);

                // Enrollment Checkout & Payment (payment gateway wired later)
                public const string GetReEnrollmentCheckoutPage = nameof(GetReEnrollmentCheckoutPage);

                public const string CompleteReEnrollment = nameof(CompleteReEnrollment);
                public const string UpdateExistingaccountPayment = nameof(UpdateExistingaccountPayment);
                public const string FetchReEntrollmentAccountDetails = nameof(FetchReEntrollmentAccountDetails);
                public const string UpdateMMPayment = nameof(UpdateMMPayment);
                public const string UpdateTandC = nameof(UpdateTandC);

                // Fee
                public const string GetAccount = nameof(GetAccount);

                public const string GetAccountInfoAsync = nameof(GetAccountInfoAsync);
                public const string ListAccountInfo = nameof(ListAccountInfo);
                public const string FetchAccountDetails = nameof(FetchAccountDetails);
                public const string SaveAccountInfoAsync = nameof(SaveAccountInfoAsync);

                /// <summary>POST Vincent Volunteer setup purchase (legacy PurchaseVVSetup).</summary>
                public const string PurchaseVVSetup = nameof(PurchaseVVSetup);

                public const string DeleteAccountInfoAsync = nameof(DeleteAccountInfoAsync);
                public const string GetTransactionListAsync = nameof(GetTransactionListAsync);

                /// <summary>GET parent Student Transaction List (legacy StudentTransactionDetials).</summary>
                public const string GetStudentTransactionListAsync = nameof(GetStudentTransactionListAsync);

                public const string GetBillingSummaryAsync = nameof(GetBillingSummaryAsync);
                public const string BillingSummary = nameof(BillingSummary);
                public const string CheckPrimaryAccountInformation = nameof(CheckPrimaryAccountInformation);
                public const string SavePrimaryAccountInformation = nameof(SavePrimaryAccountInformation);

                // Make Payment / ACH
                public const string MakePayment = nameof(MakePayment);

                public const string SaveACHPayment = nameof(SaveACHPayment);
                public const string SaveAutoWithdrawal = nameof(SaveAutoWithdrawal);
                public const string CheckRiskDuplicate = nameof(CheckRiskDuplicate);
                public const string GetCCOptioncAccount = nameof(GetCCOptioncAccount);
                public const string GetACHSettingsAsync = nameof(GetACHSettingsAsync);
            }

            public static class ChangePassword
            {
                public const string GetProfile = nameof(GetProfile);
                public const string UpdateChangePassword = nameof(UpdateChangePassword);
            }

            public static class Communication
            {
                public const string GetAnnouncements = nameof(GetAnnouncements);
                public const string FetchPrivateMessages = nameof(FetchPrivateMessages);
                public const string GetMessage = nameof(GetMessage);
                public const string InsertMessage = nameof(InsertMessage);
                public const string ArchiveMessage = nameof(ArchiveMessage);
                public const string GetUserToList = nameof(GetUserToList);
                public const string ManageAlerts = nameof(ManageAlerts);
                public const string UpdateAlerts = nameof(UpdateAlerts);
                public const string GetFileLibrary = nameof(GetFileLibrary);
                public const string DownloadfileLibrary = nameof(DownloadfileLibrary);
                public const string Download = nameof(Download);
            }

            public static class Faith
            {
                public const string GetMassCardRequest = nameof(GetMassCardRequest);
                public const string SaveMassCardRequest = nameof(SaveMassCardRequest);
            }

            public static class SupportDoc
            {
                public const string GetResourceLibrary = nameof(GetResourceLibrary);
            }

            /// <summary>Parent portal home aggregate (<c>GET /api/v1/Family/dashboard</c>).</summary>
            public const string Dashboard = nameof(Dashboard);

            public const string Saint = nameof(Saint);

            /// <summary>Parent portal shell chrome (<c>GET /api/v1/Family/shell</c>).</summary>
            public const string Shell = "shell";
        }

        public static class API_MyMessage
        {
            public static class PrivateMessage
            {
                public const string LoadMessage = nameof(LoadMessage);
                public const string GetUsersForMyMessage = nameof(GetUsersForMyMessage);
                public const string SaveNewMessage = nameof(SaveNewMessage);
                public const string DeleteInbox = nameof(DeleteInbox);
                public const string DeleteArchive = nameof(DeleteArchive);
                public const string DeleteSent = nameof(DeleteSent);
                public const string UndoDeletedMessage = nameof(UndoDeletedMessage);
                public const string LoadViewMessages = nameof(LoadViewMessages);
            }
        }

        public static class API_Support
        {
            public static class OnlineTrainingVideo
            {
                public const string GetOnlineTrainingVideos = nameof(GetOnlineTrainingVideos);
            }

            public static class DocumentationLibrary
            {
                public const string GetResourceLibrary = nameof(GetResourceLibrary);
                public const string GetDocumentationLibrary = nameof(GetDocumentationLibrary);
                public const string GetFilteredDocuments = nameof(GetFilteredDocuments);
            }
        }

        public static class API_Conduct
        {
            public static class Conduct
            {
                public const string GetSettings = nameof(GetSettings);
                public const string UpdateSettings = nameof(UpdateSettings);
                public const string GetConductItem = nameof(GetConductItem);
                public const string UpdateConductItem = nameof(UpdateConductItem);
                public const string GetLocation = nameof(GetLocation);
                public const string UpdateLocation = nameof(UpdateLocation);
                public const string GetAction = nameof(GetAction);
                public const string UpdateAction = nameof(UpdateAction);
                public const string GetHistory = nameof(GetHistory);
                public const string GetStudentConduct = nameof(GetStudentConduct);
                public const string SaveStudentConduct = nameof(SaveStudentConduct);
                public const string DeleteStudentConduct = nameof(DeleteStudentConduct);
                public const string GetFamilyEmailOptions = nameof(GetFamilyEmailOptions);
                public const string GetStudents = nameof(GetStudents);
                public const string GetStudentOptions = nameof(GetStudentOptions);
            }
        }

        public static class API_Ledger
        {
            public static class Ledger
            {
                public const string GetLedgerPage = nameof(GetLedgerPage);
                public const string FetchLedger = nameof(FetchLedger);
                public const string FetchLedgerUsers = nameof(FetchLedgerUsers);
                public const string FetchLedgerFamilyUsers = nameof(FetchLedgerFamilyUsers);
                public const string GetTransactionInfo = nameof(GetTransactionInfo);
                public const string DeleteTransaction = nameof(DeleteTransaction);
            }
        }

        public static class API_Charges
        {
            public static class Charges
            {
                public const string GetChargePage = nameof(GetChargePage);
                public const string SaveSingleCharge = nameof(SaveSingleCharge);
                public const string SaveRecurringCharge = nameof(SaveRecurringCharge);
                public const string GetRecurringChargesList = nameof(GetRecurringChargesList);
                public const string GetRecurringDeleteInfo = nameof(GetRecurringDeleteInfo);
                public const string DeleteRecurringCharge = nameof(DeleteRecurringCharge);
                public const string FetchGroupMembers = nameof(FetchGroupMembers);
            }

            public static class Events
            {
                public const string GetEventList = nameof(GetEventList);
                public const string GetEventById = nameof(GetEventById);
                public const string SaveEvent = nameof(SaveEvent);
                public const string DeleteEvent = nameof(DeleteEvent);
            }
        }

        public static class API_Payment
        {
            public static class Payment
            {
                public const string GetPaymentPage = nameof(GetPaymentPage);
                public const string FetchUserBalance = nameof(FetchUserBalance);
                public const string FetchUserBalanceByItem = nameof(FetchUserBalanceByItem);
                public const string SavePayment = nameof(SavePayment);
                public const string GetVoidRefundSummary = nameof(GetVoidRefundSummary);
                public const string SaveVoidRefundPayment = nameof(SaveVoidRefundPayment);
            }
        }

        public static class API_PaymentGateway
        {
            public static class Account
            {
                public const string CreateCCAccount = nameof(CreateCCAccount);
                public const string CreateAchAccount = nameof(CreateAchAccount);
            }

            public static class Payment
            {
                public const string ProcessServiceSaleTransaction = nameof(ProcessServiceSaleTransaction);
                public const string ServiceVoidRefundTransaction = nameof(ServiceVoidRefundTransaction);
                public const string GetServiceTransactionSummary = nameof(GetServiceTransactionSummary);
            }
        }

        public static class API_FeeDashboard
        {
            public static class FeeDashboard
            {
                public const string GetDashboardPage = nameof(GetDashboardPage);
                public const string GetDashboardData = nameof(GetDashboardData);
                public const string GetCategoryTable = nameof(GetCategoryTable);
                public const string UpdateMmAdminStatus = nameof(UpdateMmAdminStatus);
                public const string ExportMailMerge = nameof(ExportMailMerge);
            }
        }

        public static class API_FeeReports
        {
            public static class FeeReports
            {
                public const string GetTransactionStatements = nameof(GetTransactionStatements);
                public const string GetTransactionStatementReport = nameof(GetTransactionStatementReport);
                public const string GetSettings = nameof(GetSettings);
                public const string GetAccountBalanceFilters = nameof(GetAccountBalanceFilters);
                public const string GetAccountBalanceStatementsPdfFilters = nameof(GetAccountBalanceStatementsPdfFilters);
                public const string GetAccountBalanceStatementsPdf = nameof(GetAccountBalanceStatementsPdf);
                public const string GetFamilyTransactionReport = nameof(GetFamilyTransactionReport);
                public const string GetArrearsBillingFinancial = nameof(GetArrearsBillingFinancial);
                public const string GetArrearsBilling = nameof(GetArrearsBilling);
                public const string GetArrearsLauncher = nameof(GetArrearsLauncher);
                public const string GetAchActivityReport = nameof(GetAchActivityReport);
                public const string GetAchActivityStatement = nameof(GetAchActivityStatement);
                public const string GetCardActivityStatement = nameof(GetCardActivityStatement);
                public const string GetViperOrgList = nameof(GetViperOrgList);
                public const string GetCreditCardSetupFeeStatement = nameof(GetCreditCardSetupFeeStatement);
                public const string GetAchServiceFeeStatement = nameof(GetAchServiceFeeStatement);
                public const string GetBillingItemUsage = nameof(GetBillingItemUsage);
                public const string GetVoidRefundTransactionSummary = nameof(GetVoidRefundTransactionSummary);
                public const string GetPaymentTransactionsByCategoryLauncher = nameof(GetPaymentTransactionsByCategoryLauncher);
                public const string GetPaymentTransactionsByCategory = nameof(GetPaymentTransactionsByCategory);
                public const string GetParentAccountSetup = nameof(GetParentAccountSetup);
                public const string GetFailedTransactions = nameof(GetFailedTransactions);
                public const string GetAchDetailStatement = nameof(GetAchDetailStatement);
                public const string GetCardDetailStatement = nameof(GetCardDetailStatement);
                public const string GetAchBankFundingStatement = nameof(GetAchBankFundingStatement);
                public const string GetCardBankFundingStatement = nameof(GetCardBankFundingStatement);
                public const string GetTransactionSummary = nameof(GetTransactionSummary);
                public const string GetEftCcFundedTransactionSummary = nameof(GetEftCcFundedTransactionSummary);
                public const string GetBillingPaymentDetails = nameof(GetBillingPaymentDetails);
                public const string GetAgingOfReceivablesLauncher = nameof(GetAgingOfReceivablesLauncher);
                public const string GetAgingOfReceivablesReport = nameof(GetAgingOfReceivablesReport);
                public const string GetBillingBalanceDetails = nameof(GetBillingBalanceDetails);
                public const string GetDelinquentAmount = nameof(GetDelinquentAmount);
                public const string GetDelinquentAccountNotices = nameof(GetDelinquentAccountNotices);
                public const string GetCurrentBalanceNotices = nameof(GetCurrentBalanceNotices);
            }
        }

        public static class API_BillingCategories
        {
            public static class BillingCategories
            {
                public const string GetBillingCategoriesPage = nameof(GetBillingCategoriesPage);
                public const string UpdatePrefundBillingCategories = nameof(UpdatePrefundBillingCategories);
                public const string SaveBillingCategory = nameof(SaveBillingCategory);
                public const string DeleteBillingCategory = nameof(DeleteBillingCategory);
            }
        }

        public static class API_BillingItems
        {
            public static class BillingItems
            {
                public const string GetBillingCategoriesPage = nameof(GetBillingCategoriesPage);
                public const string GetBillingItemsPage = nameof(GetBillingItemsPage);
                public const string GetBillingItem = nameof(GetBillingItem);
                public const string GetBillingCategoryOptions = nameof(GetBillingCategoryOptions);
                public const string UpdatePrefundBillingCategories = nameof(UpdatePrefundBillingCategories);
                public const string SaveBillingCategory = nameof(SaveBillingCategory);
                public const string DeleteBillingCategory = nameof(DeleteBillingCategory);
                public const string SaveBillingItem = nameof(SaveBillingItem);
                public const string DeleteBillingItem = nameof(DeleteBillingItem);
            }
        }

        public static class API_BillingGroups
        {
            public static class BillingGroups
            {
                public const string GetBillingGroupsPage = nameof(GetBillingGroupsPage);
                public const string GetBillingGroupMembersPage = nameof(GetBillingGroupMembersPage);
                public const string GetBillingGroupForm = nameof(GetBillingGroupForm);
                public const string FetchGroupMembers = nameof(FetchGroupMembers);
                public const string FetchBillingGroupMembers = nameof(FetchBillingGroupMembers);
                public const string SaveBillingGroup = nameof(SaveBillingGroup);
                public const string DeleteBillingGroup = nameof(DeleteBillingGroup);
            }
        }

        public static class API_BillingSettings
        {
            public static class BillingSettings
            {
                public const string GetBillingSettingsPage = nameof(GetBillingSettingsPage);
                public const string SaveBillingSettings = nameof(SaveBillingSettings);
            }
        }

        public static class API_ContactInformation
        {
            public static class ContactInformation
            {
                public const string GetContactInformation = nameof(GetContactInformation);
                public const string SaveContactInformation = nameof(SaveContactInformation);
            }
        }

        public static class API_Directories
        {
            public static class UserInfo
            {
                public const string GetStudentsDetails = nameof(GetStudentsDetails);
                public const string GetStaffDetails = nameof(GetStaffDetails);
                public const string GetProspectsDetails = nameof(GetProspectsDetails);
                public const string GetRelativesDetails = nameof(GetRelativesDetails);
                public const string GetStudentsAlumni = nameof(GetStudentsAlumni);
                public const string GetDisabledUser = nameof(GetDisabledUser);
                public const string GetFamilyDetails = nameof(GetFamilyDetails);
                public const string GetProfileDeleteInfo = nameof(GetProfileDeleteInfo);
                public const string DeleteProfileUser = nameof(DeleteProfileUser);
                public const string ProfileDisableUser = nameof(ProfileDisableUser);
                public const string GetCustomFieldLabels = nameof(GetCustomFieldLabels);
                public const string SaveCustomFieldLabels = nameof(SaveCustomFieldLabels);
                public const string GetStudentPhotoUpload = nameof(GetStudentPhotoUpload);
                public const string Uploads = nameof(Uploads);
                public const string RegisterNewUser = nameof(RegisterNewUser);
            }
        }

        public static class API_TermManager
        {
            public static class TermManager
            {
                public const string GetTermManager = nameof(GetTermManager);
                public const string AddNewYear = nameof(AddNewYear);
                public const string CheckYearName = nameof(CheckYearName);
                public const string CheckYearStartDate = nameof(CheckYearStartDate);
                public const string CheckTermStartDate = nameof(CheckTermStartDate);
                public const string SaveNewYear = nameof(SaveNewYear);
                public const string UpdateTermDisplay = nameof(UpdateTermDisplay);
                public const string EditYear = nameof(EditYear);
                public const string EditYearbyID = nameof(EditYearbyID);
                public const string DeleteYear = nameof(DeleteYear);
                public const string DeleteYearByID = nameof(DeleteYearByID);
                public const string AddNewTerm = nameof(AddNewTerm);
                public const string SaveNewTerm = nameof(SaveNewTerm);
                public const string EditTerm = nameof(EditTerm);
                public const string EditTermbyID = nameof(EditTermbyID);
                public const string DeleteTerm = nameof(DeleteTerm);
                public const string DeleteTermByID = nameof(DeleteTermByID);
                public const string AddNewCalculatedTerm = nameof(AddNewCalculatedTerm);
                public const string AddNewCalculatedTerm2 = nameof(AddNewCalculatedTerm2);
                public const string SaveNewCalculatedTerm = nameof(SaveNewCalculatedTerm);
                public const string EditCalculatedTerm = nameof(EditCalculatedTerm);
                public const string EditCalculatedTermbyID = nameof(EditCalculatedTermbyID);
                public const string DeleteCalculatedTerm = nameof(DeleteCalculatedTerm);
                public const string DeleteCalculatedTermByID = nameof(DeleteCalculatedTermByID);
            }
        }

        public static class API_UserRights
        {
            public static class UserRights
            {
                public const string GetUserRights = nameof(GetUserRights);
                public const string GetStaffRightsById = nameof(GetStaffRightsById);
                public const string SaveUserRights = nameof(SaveUserRights);
            }
        }

        public static class API_Announcements
        {
            public const string ViewAnnouncements = nameof(ViewAnnouncements);
            public const string ViewAnnouncementsHistory = nameof(ViewAnnouncementsHistory);
            public const string PreviewAnnouncementSummary = nameof(PreviewAnnouncementSummary);
            public const string AddAnnouncements = nameof(AddAnnouncements);
            public const string SaveAnnouncements = nameof(SaveAnnouncements);
            public const string DeleteAnnouncements = nameof(DeleteAnnouncements);
            public const string DateListGo = nameof(DateListGo);
            public const string BulletinDateGo = nameof(BulletinDateGo);
        }

        public static class API_Conferences
        {
            public const string GetConferenceList = nameof(GetConferenceList);
            public const string GetConferenceListDetails = nameof(GetConferenceListDetails);
            public const string DeleteConference = nameof(DeleteConference);
            public const string GetNewConferencePage = nameof(GetNewConferencePage);
            public const string SaveConference = nameof(SaveConference);
            public const string GetMasterList = nameof(GetMasterList);
            public const string GetMasterDetails = nameof(GetMasterDetails);
            public const string UpdateMasterConference = nameof(UpdateMasterConference);
            public const string DeleteMasterConference = nameof(DeleteMasterConference);
        }

        public static class API_FileLibrary
        {
            public static class FileLibrary
            {
                public const string GetAllFileUploads = nameof(GetAllFileUploads);
                public const string GetFreeDiskSpace = nameof(GetFreeDiskSpace);
                public const string PrepareAddFileLibrary = nameof(PrepareAddFileLibrary);
                public const string GetFileUploadById = nameof(GetFileUploadById);
                public const string GetAllFileAccessLog = nameof(GetAllFileAccessLog);
                public const string GetIndividualFileAccessLog = nameof(GetIndividualFileAccessLog);
                public const string PreviewFile = nameof(PreviewFile);
                public const string DownloadFile = nameof(DownloadFile);
                public const string SaveFileUpload = nameof(SaveFileUpload);
                public const string EditFileUpload = nameof(EditFileUpload);
                public const string DeleteFileUpload = nameof(DeleteFileUpload);
                public const string GetFileCategories = nameof(GetFileCategories);
                public const string GetFileCategoryById = nameof(GetFileCategoryById);
                public const string SaveFileCategory = nameof(SaveFileCategory);
                public const string EditFileCategory = nameof(EditFileCategory);
                public const string DeleteFileCategory = nameof(DeleteFileCategory);
                public const string UploadFiles = nameof(UploadFiles);
                public const string DeletePhysicalFiles = nameof(DeletePhysicalFiles);
            }
        }

        public static class API_Admission
        {
            public const string GetWelcomePage = nameof(GetWelcomePage);
            public const string GetRegistrationPage = nameof(GetRegistrationPage);
            public const string AuthenticateUser = nameof(AuthenticateUser);
            public const string RegisterUser = nameof(RegisterUser);
            public const string GetFamilyDetailsPage = nameof(GetFamilyDetailsPage);
            public const string CheckDuplicateUserName = nameof(CheckDuplicateUserName);
            public const string UpdateFamilyDetails = nameof(UpdateFamilyDetails);
            public const string UpdateParent = nameof(UpdateParent);
            public const string GetParentListPageNew = nameof(GetParentListPageNew);
            public const string GetStudentListPageNew = nameof(GetStudentListPageNew);
            public const string GetSubmitToSchoolPageNew = nameof(GetSubmitToSchoolPageNew);
            public const string GetCheckoutPageNew = nameof(GetCheckoutPageNew);
            public const string CompleteSubmitToSchoolV2 = "CompleteSubmitToSchoolNew";
            public const string GetParentList = nameof(GetParentList);
            public const string GetProspectDetails = nameof(GetProspectDetails);
            public const string GetStudentList = nameof(GetStudentList);
            public const string GetSubmitToSchool = nameof(GetSubmitToSchool);
            public const string GetCheckout = nameof(GetCheckout);
            public const string CompleteSubmitToSchool = nameof(CompleteSubmitToSchool);
            public const string InsertCompleteSubmitToSchoolusingMM = nameof(InsertCompleteSubmitToSchoolusingMM);
            public const string DeleteCompleteSubmitToSchoolusingMM = nameof(DeleteCompleteSubmitToSchoolusingMM);
            public const string CompleteSubmitToSchoolusingMM = nameof(CompleteSubmitToSchoolusingMM);
            public const string InsertParent = nameof(InsertParent);
            public const string SaveStudent = nameof(SaveStudent);
            public const string FetchAccountDetails = nameof(FetchAccountDetails);
            public const string UpdateTandC = nameof(UpdateTandC);
            public const string UpdateAdmissionMMPayment = nameof(UpdateAdmissionMMPayment);
            public const string UpdateExistingaccountPayment = nameof(UpdateExistingaccountPayment);
        }

        public static class API_SMS
        {
            public static class Portal
            {
                public const string GetHeaderNotifications = nameof(GetHeaderNotifications);
                public const string GetPrivateMessageCount = nameof(GetPrivateMessageCount);
                public const string GetUserPrivateMessages = nameof(GetUserPrivateMessages);
                public const string GetPrivateMessageDetail = nameof(GetPrivateMessageDetail);
                public const string GetAnnouncements = nameof(GetAnnouncements);
                public const string GetSponsorAds = nameof(GetSponsorAds);
                public const string SaveSponsorHit = nameof(SaveSponsorHit);
            }

            public static class Grading
            {
                public const string AlphaScales = nameof(AlphaScales);
                public const string GetAlphaScales = nameof(GetAlphaScales);
                public const string SaveAlphaScale = nameof(SaveAlphaScale);
                public const string DeleteAlphaScale = nameof(DeleteAlphaScale);
                public const string GetAlphaScaleGroups = nameof(GetAlphaScaleGroups);
                public const string SaveAlphaScaleGroup = nameof(SaveAlphaScaleGroup);
                public const string InsertAlphaScaleGroup = nameof(InsertAlphaScaleGroup);
                public const string UpdateAlphaScaleGroup = nameof(UpdateAlphaScaleGroup);
                public const string DeleteAlphaScaleGroup = nameof(DeleteAlphaScaleGroup);
                public const string GetAlphaScaleGroupProperties = nameof(GetAlphaScaleGroupProperties);
                public const string GetAlphaScaleValueProperties = nameof(GetAlphaScaleValueProperties);
                public const string InsertAlphaScaleValue = nameof(InsertAlphaScaleValue);
                public const string UpdateAlphaScaleValue = nameof(UpdateAlphaScaleValue);
                public const string DeleteAlphaScaleValue = nameof(DeleteAlphaScaleValue);
                public const string GetCommentCodes = nameof(GetCommentCodes);
                public const string GetGradeScales = nameof(GetGradeScales);
                public const string GetSkillList = nameof(GetSkillList);
                public const string GetSkillScales = nameof(GetSkillScales);
                public const string GetSkillGrades = nameof(GetSkillGrades);
                public const string UpdateSkillGrade = nameof(UpdateSkillGrade);
                public const string Getgrading = nameof(Getgrading);
                public const string GetFinalTermGrades = nameof(GetFinalTermGrades);
                public const string GetWeightsSummary = nameof(GetWeightsSummary);
                public const string GetStudentTaskGrades = nameof(GetStudentTaskGrades);
                public const string GetAssignmentGrades = nameof(GetAssignmentGrades);
                public const string GetLearnerBehaviors = nameof(GetLearnerBehaviors);
                public const string GetLearnerBehaviorScales = nameof(GetLearnerBehaviorScales);
                public const string GetLearnerBehaviorGrading = nameof(GetLearnerBehaviorGrading);
                public const string UpdateLearnerBehaviorGrades = nameof(UpdateLearnerBehaviorGrades);
            }

            /// <summary>
            /// Action names for the Report Card Manager surface area (listing, launcher,
            /// terms, students, attendance, feature matrix and trigger-log endpoints).
            /// </summary>
            public static class ReportCardManager
            {
                public const string GetReportCardManager = nameof(GetReportCardManager);
                public const string GetReportCardLauncher = nameof(GetReportCardLauncher);
                public const string GetTermsFromYear = nameof(GetTermsFromYear);
                public const string GetTermInfo = nameof(GetTermInfo);
                public const string GetFilteredStudents = nameof(GetFilteredStudents);
                public const string GetFeatureMatrix = nameof(GetFeatureMatrix);
                public const string ReportCardsTriggerLogs = nameof(ReportCardsTriggerLogs);
                public const string GetIndividualClassAttendance = nameof(GetIndividualClassAttendance);
                public const string GetCustomizeReportCard = nameof(GetCustomizeReportCard);
                public const string ReportcardsGetFilters = nameof(ReportcardsGetFilters);
                public const string ReportcardsGetTerms = nameof(ReportcardsGetTerms);
                public const string CheckReportCardData = nameof(CheckReportCardData);
            }

            /// <summary>
            /// Action names for school-level Report Card Settings (header, GPA, scales, etc.).
            /// </summary>
            public static class ReportCardSettings
            {
                public const string GetReportCardSettings = nameof(GetReportCardSettings);
                public const string UpdateReportCardSettings = nameof(UpdateReportCardSettings);
            }

            /// <summary>
            /// Action names for Online Report Card Generation Requests (queueing, listing,
            /// updating publish window and deleting requests).
            /// </summary>
            public static class OnlineReportCardGenerationRequests
            {
                public const string GenerateOnlineReportCardRequests = nameof(GenerateOnlineReportCardRequests);
                public const string GetReportCardGenerationRequests = nameof(GetReportCardGenerationRequests);
                public const string UpdateOnlineReportCardRequest = nameof(UpdateOnlineReportCardRequest);
                public const string DeleteOnlineReportCardRequest = nameof(DeleteOnlineReportCardRequest);
            }

            /// <summary>
            /// Action names for Online Report Card Generation Tasks (per-student task tracking).
            /// </summary>
            public static class OnlineReportCardGenerationTasks
            {
                public const string GetReportCardGenerationTasks = nameof(GetReportCardGenerationTasks);
            }

            /// <summary>
            /// Action names for Principal Comments (read and update per-student comments).
            /// </summary>
            public static class PrincipalComments
            {
                public const string GetPrincipalComments = nameof(GetPrincipalComments);
                public const string UpdatePrincipalComments = nameof(UpdatePrincipalComments);
            }

            public static class ArcAlerts
            {
                public const string GetAboutPage = nameof(GetAboutPage);
                public const string GetJobListPage = nameof(GetJobListPage);
                public const string GetMessage = nameof(GetMessage);
                public const string GetSettings = nameof(GetSettings);
                public const string UpdateSettings = nameof(UpdateSettings);
                public const string GetFamilyPreferences = nameof(GetFamilyPreferences);
                public const string SaveAlert = nameof(SaveAlert);
                public const string DeleteAlert = nameof(DeleteAlert);
                public const string UploadAttachment = nameof(UploadAttachment);
                public const string DownloadAttachment = nameof(DownloadAttachment);
                public const string GetVoiceRecording = nameof(GetVoiceRecording);
                public const string GetMessageStatus = nameof(GetMessageStatus);
            }

            public static class SchoolMeal
            {
                public const string GetDashboard = nameof(GetDashboard);
                public const string GetSettings = nameof(GetSettings);
                public const string UpdateSettings = nameof(UpdateSettings);
                public const string GetMealItems = nameof(GetMealItems);
                public const string GetMealItem = nameof(GetMealItem);
                public const string SaveMealItem = nameof(SaveMealItem);
                public const string DeleteMealItem = nameof(DeleteMealItem);
                public const string GetMenu = nameof(GetMenu);
                public const string SaveMenu = nameof(SaveMenu);
                public const string GetOrders = nameof(GetOrders);
                public const string SaveOrder = nameof(SaveOrder);
                public const string GetMealCount = nameof(GetMealCount);
                public const string GetHomeroomClassId = nameof(GetHomeroomClassId);
                public const string GetMealCountUsers = nameof(GetMealCountUsers);
                public const string SaveMealCountUsers = nameof(SaveMealCountUsers);
                public const string DeleteMealCountUser = nameof(DeleteMealCountUser);
                public const string SaveMealCount = nameof(SaveMealCount);
                public const string GetStudentEligibility = nameof(GetStudentEligibility);
                public const string SaveStudentEligibility = nameof(SaveStudentEligibility);
                public const string GetBatchProcessHistory = nameof(GetBatchProcessHistory);
                public const string ProcessBatchBilling = nameof(ProcessBatchBilling);
                public const string GetBatchBilling = nameof(GetBatchBilling);
                public const string GetPrintableOrderForm = nameof(GetPrintableOrderForm);
                public const string GetLookups = nameof(GetLookups);
                public const string GetDiscountHome = nameof(GetDiscountHome);
                public const string GetDiscountStudents = nameof(GetDiscountStudents);
                public const string GetDiscountStudentDetail = nameof(GetDiscountStudentDetail);
                public const string UpdateDiscountDetails = nameof(UpdateDiscountDetails);
                public const string FillNewDiscountHistory = nameof(FillNewDiscountHistory);
                public const string GetDiscountAccounting = nameof(GetDiscountAccounting);
                public const string GetDiscountMealOrders = nameof(GetDiscountMealOrders);
                public const string GetNslpSummaryReport = nameof(GetNslpSummaryReport);
                public const string GetHomeroomMealOrderSummaryReport = nameof(GetHomeroomMealOrderSummaryReport);
                public const string GetDayByDaySummaryReport = nameof(GetDayByDaySummaryReport);
                public const string GetDayByDayOrdersReport = nameof(GetDayByDayOrdersReport);
            }

            public static class GPAManager
            {
                public const string GetGPADashboard = nameof(GetGPADashboard);
                public const string GetGPAByTerm = nameof(GetGPAByTerm);
                public const string GetGPADetails = nameof(GetGPADetails);
            }

            /// <summary>Action names for SMS admin dashboard (legacy DashboardController).</summary>
            public static class Dashboard
            {
                public const string GetDashboardData = nameof(GetDashboardData);
                public const string GetDailyReading = nameof(GetDailyReading);
                public const string GetSaintOfTheDay = nameof(GetSaintOfTheDay);
                public const string GetMessageDetails = nameof(GetMessageDetails);
                public const string AddOrUpdateNotification = nameof(AddOrUpdateNotification);
                public const string UpdateNotification = nameof(UpdateNotification);
                public const string UpsertReactivationByUser = nameof(UpsertReactivationByUser);
            }

            /// <summary>Action names for Account Balance Statement (legacy MyBillingAccount).</summary>
            public static class AccountBalanceStatement
            {
                public const string GetPage = nameof(GetPage);
                public const string FilterTransactions = nameof(FilterTransactions);
                public const string ExportExcel = nameof(ExportExcel);
                public const string UpdateNextApproved = nameof(UpdateNextApproved);
                public const string CheckPrimaryExist = nameof(CheckPrimaryExist);
                public const string UpdateMMWizardAction = nameof(UpdateMMWizardAction);
            }

            /// <summary>Action names for SMS Directory Upload Utility (legacy FamilyModuleUpload).</summary>
            public static class DirectoryUploadUtility
            {
                public const string GetIndexStatus = nameof(GetIndexStatus);
                public const string ExportNewUsers = nameof(ExportNewUsers);
                public const string ImportExcel = nameof(ImportExcel);
                public const string GetImportPage = nameof(GetImportPage);
                public const string GetImportedData = nameof(GetImportedData);
                public const string GetImportedDataByID = nameof(GetImportedDataByID);
                public const string UpdateImportedData = nameof(UpdateImportedData);
                public const string UpdateImport = nameof(UpdateImport);
                public const string InitiatingUpdateError = nameof(InitiatingUpdateError);
                public const string UpdateStepCompletedOnUploadUtility = nameof(UpdateStepCompletedOnUploadUtility);
                public const string UpdateDataImportConfirmationStatus = nameof(UpdateDataImportConfirmationStatus);
                public const string ValidateSingleUsername = nameof(ValidateSingleUsername);
                public const string ValidateFamilynameValidation = nameof(ValidateFamilynameValidation);
            }

            /// <summary>Action names for SMS Implementation Guide (legacy Walkthroughs/ImplementationGuide).</summary>
            public static class ImplementationGuide
            {
                public const string GetSteps = nameof(GetSteps);
                public const string SentTrainingTicket = nameof(SentTrainingTicket);
                public const string GetGenerateClasses = nameof(GetGenerateClasses);
                public const string AddGenerateClasses = nameof(AddGenerateClasses);
                public const string FilterByGrade = nameof(FilterByGrade);
            }

            /// <summary>Action names for SMS End Of Year Guide (legacy Walkthroughs/EndOfYearGuide).</summary>
            public static class EndOfYearGuide
            {
                public const string GetProgress = nameof(GetProgress);
                public const string GetCopyYear = nameof(GetCopyYear);
                public const string AddCopyYear = nameof(AddCopyYear);
                public const string GetTermSummary = nameof(GetTermSummary);
                public const string GetRetainUsers = nameof(GetRetainUsers);
                public const string UpdateRetainUsers = nameof(UpdateRetainUsers);
                public const string GetProspects = nameof(GetProspects);
                public const string UpdateProspects = nameof(UpdateProspects);
                public const string CopyAccumulatedSickDays = nameof(CopyAccumulatedSickDays);
                public const string CopyStaffWithProfessional = nameof(CopyStaffWithProfessional);
            }

            public static class LessonPlan
            {
                public const string GetInitialData = nameof(GetInitialData);
                public const string GetWeekView = nameof(GetWeekView);
                public const string GetDayView = nameof(GetDayView);
                public const string GetListView = nameof(GetListView);
                public const string GetLessonPlansByIds = nameof(GetLessonPlansByIds);
                public const string DeleteLessonPlan = nameof(DeleteLessonPlan);
                public const string GetAddData = nameof(GetAddData);
                public const string CreateFromTemplate = nameof(CreateFromTemplate);
                public const string CopyLessonPlan = nameof(CopyLessonPlan);
                public const string SaveLessonPlan = nameof(SaveLessonPlan);
                public const string GetCoursesByGrade = nameof(GetCoursesByGrade);
                public const string GetUnitPlans = nameof(GetUnitPlans);
                public const string GetSkills = nameof(GetSkills);
                public const string GetStandards = nameof(GetStandards);
                public const string GetClassPermission = nameof(GetClassPermission);
                public const string SubmitForReview = nameof(SubmitForReview);
                public const string GetReviewComments = nameof(GetReviewComments);
                public const string UpdateCommentsRead = nameof(UpdateCommentsRead);
                public const string SaveReviewComments = nameof(SaveReviewComments);
                public const string UploadAttachment = nameof(UploadAttachment);
                public const string DeleteAttachment = nameof(DeleteAttachment);
                public const string GetTemplates = nameof(GetTemplates);
                public const string GetTemplateEdit = nameof(GetTemplateEdit);
                public const string SaveTemplate = nameof(SaveTemplate);
                public const string DeleteTemplate = nameof(DeleteTemplate);
                public const string TemplateNameExists = nameof(TemplateNameExists);
                public const string GetTemplatePreview = nameof(GetTemplatePreview);
                public const string GetSharedListView = nameof(GetSharedListView);
            }

            public static class UnitPlanTemplates
            {
                public const string GetTemplates = nameof(GetTemplates);
                public const string GetTemplateEdit = nameof(GetTemplateEdit);
                public const string SaveTemplate = nameof(SaveTemplate);
                public const string DeleteTemplate = nameof(DeleteTemplate);
                public const string TemplateNameExists = nameof(TemplateNameExists);
                public const string GetTemplatePreview = nameof(GetTemplatePreview);
            }

            public static class UnitPlan
            {
                public const string GetInitialData = nameof(GetInitialData);
                public const string GetListView = nameof(GetListView);
                public const string GetSharedListView = nameof(GetSharedListView);
                public const string GetAddData = nameof(GetAddData);
                public const string GetCoursesByGrade = nameof(GetCoursesByGrade);
                public const string CreateFromTemplate = nameof(CreateFromTemplate);
                public const string CopyUnitPlan = nameof(CopyUnitPlan);
                public const string SaveUnitPlan = nameof(SaveUnitPlan);
                public const string SubmitForReview = nameof(SubmitForReview);
                public const string DeleteUnitPlan = nameof(DeleteUnitPlan);
                public const string GetReviewComments = nameof(GetReviewComments);
                public const string MarkReviewCommentsRead = nameof(MarkReviewCommentsRead);
                public const string SaveReviewComments = nameof(SaveReviewComments);
            }

            /// <summary>Action names for SMS Directories / Groups (legacy AddGroup).</summary>
            public static class Directories
            {
                public static class Groups
                {
                    public const string GetGroupList = nameof(GetGroupList);
                    public const string HideUnhideGroup = nameof(HideUnhideGroup);
                    public const string GetAddGroupPage = nameof(GetAddGroupPage);
                    public const string FetchGroupMembers = nameof(FetchGroupMembers);
                    public const string SaveBillingGroup = nameof(SaveBillingGroup);
                    public const string GetBillingGroupMembersPage = nameof(GetBillingGroupMembersPage);
                    public const string FetchBillingGroupMembers = nameof(FetchBillingGroupMembers);
                }

                public static class Parish
                {
                    public const string GetParishList = nameof(GetParishList);
                    public const string GetParishStudentList = nameof(GetParishStudentList);
                    public const string GetManageParishList = nameof(GetManageParishList);
                    public const string SaveParish = nameof(SaveParish);
                    public const string DeleteParish = nameof(DeleteParish);
                    public const string UpdateParishExclusions = nameof(UpdateParishExclusions);
                    public const string GetParishInfo = nameof(GetParishInfo);
                }

                public static class PublicSchool
                {
                    public const string GetPublicSchoolManager = nameof(GetPublicSchoolManager);
                    public const string GetSchoolDistrictDropdowns = nameof(GetSchoolDistrictDropdowns);
                    public const string SaveNewDistrict = nameof(SaveNewDistrict);
                    public const string SaveNewSchool = nameof(SaveNewSchool);
                    public const string GetDistrictStudentList = nameof(GetDistrictStudentList);
                    public const string GetPublicSchoolStudentList = nameof(GetPublicSchoolStudentList);
                    public const string GetManagePublicSchoolList = nameof(GetManagePublicSchoolList);
                    public const string UpdateDistrictInclusions = nameof(UpdateDistrictInclusions);
                }

                public static class MedicalProvider
                {
                    public const string GetMedicalProviderList = nameof(GetMedicalProviderList);
                    public const string GetMedicalProviderPage = nameof(GetMedicalProviderPage);
                    public const string SaveMedicalProvider = nameof(SaveMedicalProvider);
                    public const string DeleteMedicalProvider = nameof(DeleteMedicalProvider);
                }

                public static class DailyNurseActivities
                {
                    public const string GetMedicationDashboard = nameof(GetMedicationDashboard);
                    public const string GetMedicationNotifications = nameof(GetMedicationNotifications);
                    public const string UpdateMedicationNotification = nameof(UpdateMedicationNotification);
                    public const string GetDailyMedicationLog = nameof(GetDailyMedicationLog);
                    public const string UpdateDailyMedicationLog = nameof(UpdateDailyMedicationLog);
                    public const string GetGradeLevelRequirements = nameof(GetGradeLevelRequirements);
                    public const string UpdateGradeLevelRequirements = nameof(UpdateGradeLevelRequirements);
                }

                public static class UserInformation
                {
                    public const string GetStudentDetails = nameof(GetStudentDetails);
                    public const string GetStaffDetails = nameof(GetStaffDetails);
                    public const string GetProspectsDetails = nameof(GetProspectsDetails);
                    public const string GetRelativesDetails = nameof(GetRelativesDetails);
                    public const string GetStudentsAlumni = nameof(GetStudentsAlumni);
                    public const string GetDisabledUsers = nameof(GetDisabledUsers);
                    public const string GetVolunteerDetails = nameof(GetVolunteerDetails);
                    public const string GetFamilyDetails = nameof(GetFamilyDetails);
                    public const string GetProfileDeleteInfo = nameof(GetProfileDeleteInfo);
                    public const string DeleteProfileUser = nameof(DeleteProfileUser);
                    public const string ProfileDisableUser = nameof(ProfileDisableUser);
                    public const string GetProfileDisableInfo = nameof(GetProfileDisableInfo);
                    public const string GetStudentSchedule = nameof(GetStudentSchedule);
                    public const string GetStaffSchedule = nameof(GetStaffSchedule);
                    public const string GenerateLoginTransfer = nameof(GenerateLoginTransfer);
                }

                public static class StaffDetails
                {
                    public const string GetStaffSchoolRelated = nameof(GetStaffSchoolRelated);
                    public const string UpdateStaffSchoolRelated = nameof(UpdateStaffSchoolRelated);
                }

                public static class FamilyDetails
                {
                    public const string GetFamilyInfo = nameof(GetFamilyInfo);
                    public const string UpdateFamilyInfo = nameof(UpdateFamilyInfo);
                    public const string GetFamilyAlerts = nameof(GetFamilyAlerts);
                    public const string UpdateFamilyAlerts = nameof(UpdateFamilyAlerts);
                    public const string GetFamilyPermissions = nameof(GetFamilyPermissions);
                    public const string GetFamilyRelativeUsers = nameof(GetFamilyRelativeUsers);
                    public const string UpdateFamilyRelative = nameof(UpdateFamilyRelative);
                }

                public static class StudentDetails
                {
                    public const string GetAcademicSupport = nameof(GetAcademicSupport);
                    public const string UpdateAcademicSupport = nameof(UpdateAcademicSupport);
                    public const string GetStudentAdmissions = nameof(GetStudentAdmissions);
                    public const string SaveStudentAdmission = nameof(SaveStudentAdmission);
                    public const string AddStudentAdmissionComment = nameof(AddStudentAdmissionComment);
                    public const string GetStudentAdmissionComments = nameof(GetStudentAdmissionComments);
                    public const string DeleteStudentAdmissionComment = nameof(DeleteStudentAdmissionComment);
                    public const string UpdateStudentAdmissionMilestone = nameof(UpdateStudentAdmissionMilestone);
                    public const string UpdateStudentAdmissionMilestoneDate = nameof(UpdateStudentAdmissionMilestoneDate);
                    public const string UpdateProspectAdmissionMilestone = nameof(UpdateProspectAdmissionMilestone);
                    public const string UpdateProspectAdmissionMilestoneDate = nameof(UpdateProspectAdmissionMilestoneDate);
                    public const string GetStudentEmergencyContacts = nameof(GetStudentEmergencyContacts);
                    public const string GetStudentEmergencyContactForm = nameof(GetStudentEmergencyContactForm);
                    public const string GetEditUserEmergencyContactForm = nameof(GetEditUserEmergencyContactForm);
                    public const string SaveStudentEmergencyContact = nameof(SaveStudentEmergencyContact);
                    public const string SaveStudentFamilyEmergencyContact = nameof(SaveStudentFamilyEmergencyContact);
                    public const string DeleteStudentEmergencyContact = nameof(DeleteStudentEmergencyContact);
                    public const string DeleteStudentFamilyEmergencyContact = nameof(DeleteStudentFamilyEmergencyContact);
                    public const string GetStudentDemographics = nameof(GetStudentDemographics);
                    public const string GetStudentEthnicOrigins = nameof(GetStudentEthnicOrigins);
                    public const string UpdateStudentDemographics = nameof(UpdateStudentDemographics);
                    public const string GetStudentGovernmentPrograms = nameof(GetStudentGovernmentPrograms);
                    public const string UpdateStudentGovernmentPrograms = nameof(UpdateStudentGovernmentPrograms);
                    public const string GetStudentSacraments = nameof(GetStudentSacraments);
                    public const string UpdateStudentSacraments = nameof(UpdateStudentSacraments);
                    public const string GetStudentSecurityProfile = nameof(GetStudentSecurityProfile);
                    public const string UpdateStudentSecurityProfile = nameof(UpdateStudentSecurityProfile);
                    public const string GetStudentHomeSituation = nameof(GetStudentHomeSituation);
                    public const string UpdateStudentHomeSituation = nameof(UpdateStudentHomeSituation);
                    public const string GetStudentImmunizations = nameof(GetStudentImmunizations);
                    public const string DeleteStudentImmunization = nameof(DeleteStudentImmunization);
                    public const string GetStudentImmunizationForm = nameof(GetStudentImmunizationForm);
                    public const string SaveStudentImmunization = nameof(SaveStudentImmunization);
                    public const string GetStudentImmunizationBulkForm = nameof(GetStudentImmunizationBulkForm);
                    public const string SaveStudentImmunizationBulk = nameof(SaveStudentImmunizationBulk);
                    public const string GetStudentMedicalInfo = nameof(GetStudentMedicalInfo);
                    public const string GetMedicalProviderContact = nameof(GetMedicalProviderContact);
                    public const string UpdateStudentMedicalProfile = nameof(UpdateStudentMedicalProfile);
                    public const string GetStudentMedications = nameof(GetStudentMedications);
                    public const string GetStudentMedicationForm = nameof(GetStudentMedicationForm);
                    public const string SaveStudentMedication = nameof(SaveStudentMedication);
                    public const string DeleteStudentMedication = nameof(DeleteStudentMedication);
                    public const string GetStudentMedicationAdministrationLog = nameof(GetStudentMedicationAdministrationLog);
                    public const string GetStudentMedicationAdministrationLogForm = nameof(GetStudentMedicationAdministrationLogForm);
                    public const string GetStudentMedicationAdministrationLogTimes = nameof(GetStudentMedicationAdministrationLogTimes);
                    public const string SaveStudentMedicationAdministrationLog = nameof(SaveStudentMedicationAdministrationLog);
                    public const string GetStudentNurseProfiles = nameof(GetStudentNurseProfiles);
                    public const string GetStudentNurseProfileForm = nameof(GetStudentNurseProfileForm);
                    public const string SaveStudentNurseProfile = nameof(SaveStudentNurseProfile);
                    public const string DeleteStudentNurseProfile = nameof(DeleteStudentNurseProfile);
                    public const string GetStudentNurseProfileBmIPercentile = nameof(GetStudentNurseProfileBmIPercentile);
                    public const string GetStudentNurseVisits = nameof(GetStudentNurseVisits);
                    public const string GetStudentNurseVisitForm = nameof(GetStudentNurseVisitForm);
                    public const string SaveStudentNurseVisit = nameof(SaveStudentNurseVisit);
                    public const string DeleteStudentNurseVisit = nameof(DeleteStudentNurseVisit);
                }
            }

            public static class CalendarAdministration
            {
                public const string AddCalendar = nameof(AddCalendar);
                public const string SaveGoogleCalendar = nameof(SaveGoogleCalendar);
                public const string EditCalendarDetails = nameof(EditCalendarDetails);
                public const string ViewCalendar = nameof(ViewCalendar);
                public const string ViewGoogleCalendar = nameof(ViewGoogleCalendar);
                public const string LoadUserGroupDropDown = nameof(LoadUserGroupDropDown);
                public const string DeleteCalendarDetails = nameof(DeleteCalendarDetails);
                public const string JSONCheckValidGmailAccount = nameof(JSONCheckValidGmailAccount);
            }

            public static class DaysOff
            {
                public const string GetDaysOff = nameof(GetDaysOff);
                public const string UpdateDaysOff = nameof(UpdateDaysOff);
                public const string SchoolDaysList = nameof(SchoolDaysList);
            }

            public static class EmergencyDrills
            {
                public const string GetEmergencyDrillList = nameof(GetEmergencyDrillList);
                public const string GetEmergencyDrillDetails = nameof(GetEmergencyDrillDetails);
                public const string SaveEmergencyDrill = nameof(SaveEmergencyDrill);
                public const string DeleteEmergencyDrill = nameof(DeleteEmergencyDrill);
            }

            public static class OptionCCalendar
            {
                public const string GetCalendarList = nameof(GetCalendarList);
                public const string GetCalendar = nameof(GetCalendar);
                public const string SaveCalendar = nameof(SaveCalendar);
                public const string DeleteCalendar = nameof(DeleteCalendar);
                public const string ListEventsForDisplay = nameof(ListEventsForDisplay);
                public const string GetCategoriesList = nameof(GetCategoriesList);
                public const string GetCategory = nameof(GetCategory);
                public const string SaveCategory = nameof(SaveCategory);
                public const string DeleteCategory = nameof(DeleteCategory);
                public const string CheckCategoryName = nameof(CheckCategoryName);
                public const string GetCategoryDropdownList = nameof(GetCategoryDropdownList);
                public const string GetEventsPageData = nameof(GetEventsPageData);
                public const string GetEventList = nameof(GetEventList);
                public const string GetEvent = nameof(GetEvent);
                public const string GetEventById = nameof(GetEventById);
                public const string SaveEvent = nameof(SaveEvent);
                public const string DeleteEvent = nameof(DeleteEvent);
                public const string DeleteRepeatEvent = nameof(DeleteRepeatEvent);
                public const string SearchEvents = nameof(SearchEvents);
                public const string GetUserSettings = nameof(GetUserSettings);
                public const string UpdateUserSettings = nameof(UpdateUserSettings);
                public const string GetGroupsList = nameof(GetGroupsList);
                public const string GetGroup = nameof(GetGroup);
                public const string SaveGroup = nameof(SaveGroup);
                public const string DeleteGroup = nameof(DeleteGroup);
                public const string CheckGroupName = nameof(CheckGroupName);
                public const string ListCalendarsByGroup = nameof(ListCalendarsByGroup);
                public const string SaveCalendarGroupAccess = nameof(SaveCalendarGroupAccess);
                public const string DeleteCalendarGroup = nameof(DeleteCalendarGroup);
                public const string SaveGroupMembers = nameof(SaveGroupMembers);
                public const string FilterUsersByGrade = nameof(FilterUsersByGrade);
                public const string DeleteEventUploadFile = nameof(DeleteEventUploadFile);
                public const string UploadEventAttachment = nameof(UploadEventAttachment);
            }

            public static class TermManager
            {
                public const string GetTermManagerData = nameof(GetTermManagerData);
                public const string GetPreviousSchoolYears = nameof(GetPreviousSchoolYears);
                public const string GetTermYearDetails = nameof(GetTermYearDetails);
                public const string CheckYearName = nameof(CheckYearName);
                public const string CheckYearStartDate = nameof(CheckYearStartDate);
                public const string CheckTermStartDate = nameof(CheckTermStartDate);
                public const string SaveNewYear = nameof(SaveNewYear);
                public const string SaveEditNewYear = nameof(SaveEditNewYear);
                public const string UpdateTermDisplay = nameof(UpdateTermDisplay);
                public const string GetYearEditData = nameof(GetYearEditData);
                public const string EditYear = nameof(EditYear);
                public const string GetYearDeleteData = nameof(GetYearDeleteData);
                public const string DeleteYear = nameof(DeleteYear);
                public const string GetAddNewTermData = nameof(GetAddNewTermData);
                public const string SaveNewTerm = nameof(SaveNewTerm);
                public const string GetTermEditData = nameof(GetTermEditData);
                public const string EditTerm = nameof(EditTerm);
                public const string GetTermDeleteData = nameof(GetTermDeleteData);
                public const string DeleteTerm = nameof(DeleteTerm);
                public const string GetCalculatedTermPreviousYears = nameof(GetCalculatedTermPreviousYears);
                public const string GetAddNewCalculatedTermData = nameof(GetAddNewCalculatedTermData);
                public const string SaveNewCalculatedTerm = nameof(SaveNewCalculatedTerm);
                public const string GetEditCalculatedTermData = nameof(GetEditCalculatedTermData);
                public const string EditCalculatedTerm = nameof(EditCalculatedTerm);
                public const string GetCalculatedTermDeleteData = nameof(GetCalculatedTermDeleteData);
                public const string DeleteCalculatedTerm = nameof(DeleteCalculatedTerm);
            }

            public static class TermManagerActions
            {
                public const string TermManager = nameof(TermManager);
                public const string CheckYearStartDate = nameof(CheckYearStartDate);
                public const string SaveNewYear = nameof(SaveNewYear);
                public const string CheckYearName = nameof(CheckYearName);
                public const string AddNewYear = nameof(AddNewYear);
                public const string EditYear = nameof(EditYear);
                public const string SaveEditNewYear = nameof(SaveEditNewYear);
                public const string EditYearByID = nameof(EditYearByID);
                public const string DeleteYear = nameof(DeleteYear);
                public const string DeleteYearByID = nameof(DeleteYearByID);
            }

            public static class MyClasses
            {
                public const string GetMyClassesPageData = nameof(GetMyClassesPageData);
                public const string GetMyClasses = nameof(GetMyClasses);
                public const string GetClassViewData = nameof(GetClassViewData);
                public const string DeleteClass = nameof(DeleteClass);
                public const string GetClassAttendancePageData = nameof(GetClassAttendancePageData);
                public const string GetClassPermissions = nameof(GetClassPermissions);
                public const string TakeClassAttendance = nameof(TakeClassAttendance);
                public const string ResetFirstAttendanceDate = nameof(ResetFirstAttendanceDate);
                public const string GetSchoolwideAbsenteesPageData = nameof(GetSchoolwideAbsenteesPageData);
                public const string SaveSchoolwideAttendance = nameof(SaveSchoolwideAttendance);
                public const string GetClassRosterPageData = nameof(GetClassRosterPageData);
                public const string UpdateClassRosterDates = nameof(UpdateClassRosterDates);
                public const string ClearClassRosterWithdrawal = nameof(ClearClassRosterWithdrawal);
                public const string DeleteStudentFromClassRoster = nameof(DeleteStudentFromClassRoster);
                public const string AddStudentToClassRoster = nameof(AddStudentToClassRoster);
                public const string GetClassAssignmentsPageData = nameof(GetClassAssignmentsPageData);
                public const string GetAssignmentListPageData = nameof(GetAssignmentListPageData);
                public const string GetAssignmentForEdit = nameof(GetAssignmentForEdit);
                public const string SaveAssignment = nameof(SaveAssignment);
                public const string UpdateAssignment = nameof(UpdateAssignment);
                public const string DeleteAssignment = nameof(DeleteAssignment);
                public const string ToggleAssignmentOnlineSubmission = nameof(ToggleAssignmentOnlineSubmission);
                public const string UpdateAssignmentPostable = nameof(UpdateAssignmentPostable);
                public const string UpdateAssignmentIncludeInCalculated = nameof(UpdateAssignmentIncludeInCalculated);
                public const string CheckAssignmentCategory = nameof(CheckAssignmentCategory);
                public const string CopyAssignment = nameof(CopyAssignment);
                public const string UploadAssignmentFiles = nameof(UploadAssignmentFiles);
                public const string GetAssignmentClassSettingsPageData = nameof(GetAssignmentClassSettingsPageData);
                public const string SaveAssignmentClassSettings = nameof(SaveAssignmentClassSettings);
                public const string UpdateAssignmentClassWeights = nameof(UpdateAssignmentClassWeights);
                public const string SaveEditedAssignmentCategory = nameof(SaveEditedAssignmentCategory);
                public const string GetUploadManagerPageData = nameof(GetUploadManagerPageData);
                public const string GetUploadManagerTaskList = nameof(GetUploadManagerTaskList);
                public const string GetUploadManagerFileInfo = nameof(GetUploadManagerFileInfo);
                public const string SaveUploadManagerFile = nameof(SaveUploadManagerFile);
                public const string UpdateUploadManagerFile = nameof(UpdateUploadManagerFile);
                public const string DeleteUploadManagerFile = nameof(DeleteUploadManagerFile);
                public const string GetGradebookPageData = nameof(GetGradebookPageData);
                public const string ToggleGradebookIncludeInCalculated = nameof(ToggleGradebookIncludeInCalculated);
                public const string GetAssignmentGradesPageData = nameof(GetAssignmentGradesPageData);
                public const string SaveAssignmentGrades = nameof(SaveAssignmentGrades);
                public const string ToggleAssignmentOnlineSubmissions = nameof(ToggleAssignmentOnlineSubmissions);
                public const string GetSingleStudentTermGradesPageData = nameof(GetSingleStudentTermGradesPageData);
                public const string UpdateSingleStudentTermGrade = nameof(UpdateSingleStudentTermGrade);
                public const string UpdateSingleStudentHrComment = nameof(UpdateSingleStudentHrComment);
                public const string UpdateSingleStudentPrincipalComment = nameof(UpdateSingleStudentPrincipalComment);
                public const string GetFinalTermGradesPageData = nameof(GetFinalTermGradesPageData);
                public const string SaveFinalTermGrades = nameof(SaveFinalTermGrades);
                public const string GetStudentTaskGradesPageData = nameof(GetStudentTaskGradesPageData);
                public const string GetStudentGradesForClassPageData = nameof(GetStudentGradesForClassPageData);
                public const string SaveStudentTaskGrades = nameof(SaveStudentTaskGrades);
            }

            public static class ClassAdministration
            {
                public const string GetClassCatalog = nameof(GetClassCatalog);
                public const string GetAddNewClassData = nameof(GetAddNewClassData);
                public const string GetEditClassData = nameof(GetEditClassData);
                public const string SaveClass = nameof(SaveClass);
                public const string UpdateClass = nameof(UpdateClass);
                public const string SaveClassSettings = nameof(SaveClassSettings);
                public const string DeleteClass = nameof(DeleteClass);
                public const string GetClassesSection = nameof(GetClassesSection);
                public const string SaveSection = nameof(SaveSection);
                public const string GetCoursesSection = nameof(GetCoursesSection);
                public const string SaveCourseSection = nameof(SaveCourseSection);
                public const string GetCatalogTerms = nameof(GetCatalogTerms);
                public const string GetClassWeightsSummary = nameof(GetClassWeightsSummary);
                public const string GetAssociateSectionsData = nameof(GetAssociateSectionsData);
                public const string SaveAssociateSections = nameof(SaveAssociateSections);
                public const string GetCourseList = nameof(GetCourseList);
                public const string GetGradelevels = nameof(GetGradelevels);
                public const string GetCourseProperties = nameof(GetCourseProperties);
                public const string CheckDuplicateName = nameof(CheckDuplicateName);
                public const string SaveCourse = nameof(SaveCourse);
                public const string UpdateCourse = nameof(UpdateCourse);
                public const string GetClassCapacities = nameof(GetClassCapacities);
                public const string UpdateClassCapacities = nameof(UpdateClassCapacities);
                public const string GetSameYearCopyData = nameof(GetSameYearCopyData);
                public const string CopyClassesWithinYear = nameof(CopyClassesWithinYear);
                public const string GetNewYearCopyData = nameof(GetNewYearCopyData);
                public const string CopyClassesToNewYear = nameof(CopyClassesToNewYear);
                public const string GetSchedulerTerms = nameof(GetSchedulerTerms);
                public const string GetMasterSchedulerData = nameof(GetMasterSchedulerData);
                public const string RegisterMasterScheduler = nameof(RegisterMasterScheduler);
                public const string GetDuplicateRegistrations = nameof(GetDuplicateRegistrations);
                public const string DuplicateRegistrationsForRemoval = nameof(DuplicateRegistrationsForRemoval);
                public const string ConfirmDuplicateRegistrationsForRemoval = nameof(ConfirmDuplicateRegistrationsForRemoval);
                public const string RemoveDuplicatedStudents = nameof(RemoveDuplicatedStudents);
                public const string UndoDuplicatedStudents = nameof(UndoDuplicatedStudents);
                public const string GetStudentWithdrawalList = nameof(GetStudentWithdrawalList);
                public const string ClearStudentWithdrawalDate = nameof(ClearStudentWithdrawalDate);
            }

            public static class Attendance
            {
                public const string IndividualStudentAttendance = nameof(IndividualStudentAttendance);
                public const string FilterAttendance = nameof(FilterAttendance);
                public const string UpdatePresentStudents = nameof(UpdatePresentStudents);
                public const string GetddlStudentList = nameof(GetddlStudentList);
                public const string StudentAttendancebyFamily = nameof(StudentAttendancebyFamily);
                public const string FilterAttendanceByFamily = nameof(FilterAttendanceByFamily);
                public const string TakeStudentAbsentAttendance = nameof(TakeStudentAbsentAttendance);
            }

            public static class AdmissionsSettings
            {
                public const string BasicSettings = nameof(BasicSettings);
                public const string UpdateSettings = nameof(UpdateSettings);
                public const string ApplicationStatus = nameof(ApplicationStatus);
                public const string SortStatus = nameof(SortStatus);
                public const string AddStatus = nameof(AddStatus);
                public const string UpdateStatus = nameof(UpdateStatus);
                public const string DeleteStatus = nameof(DeleteStatus);
                public const string ApplicationField = nameof(ApplicationField);
                public const string SaveApplicationField = nameof(SaveApplicationField);
                public const string ProspectMileston = nameof(ProspectMileston);
                public const string SortProspectMilestone = nameof(SortProspectMilestone);
                public const string AddProspectMilestone = nameof(AddProspectMilestone);
                public const string UpdateProspectMilestoneStates = nameof(UpdateProspectMilestoneStates);
                public const string DeleteProspectMilestone = nameof(DeleteProspectMilestone);
                public const string RestoreProspectMilestone = nameof(RestoreProspectMilestone);
                public const string EnrollmentMileston = nameof(EnrollmentMileston);
                public const string SortReEnrollmentMilestone = nameof(SortReEnrollmentMilestone);
                public const string AddReEnrollmentMilestone = nameof(AddReEnrollmentMilestone);
                public const string UpdateReEnrollmentMilestone = nameof(UpdateReEnrollmentMilestone);
                public const string DeleteReEnrollmentMilestone = nameof(DeleteReEnrollmentMilestone);
                public const string RestoreReEnrollmentMilestone = nameof(RestoreReEnrollmentMilestone);
                public const string Enrollmentlimits = nameof(Enrollmentlimits);
                public const string SaveEnrollmentlimits = nameof(SaveEnrollmentlimits);
            }

            public static class AdmissionsProspect
            {
                public const string Prospectlist = nameof(Prospectlist);
                public const string ProspectDisable = nameof(ProspectDisable);
                public const string ReEnrollmentStatus = nameof(ReEnrollmentStatus);
                public const string ResetRegistrationStatus = nameof(ResetRegistrationStatus);
            }

            public static class UserAdministration
            {
                public const string GetSMSMenu = nameof(GetSMSMenu);
                public const string GetLoginUserData = nameof(GetLoginUserData);
                public const string ChangePassword = nameof(ChangePassword);
                public const string UpdateUserPassword = nameof(UpdateUserPassword);
            }
        }

        /// <summary>OptionC.Reports host — Report Manager active report endpoints.</summary>
        public static class API_Reports
        {
            /// <summary>Action names for Active Reports (directories, mailing labels, homeroom, NCEA, schedules).</summary>
            public static class ActiveReports
            {
                public const string PrepareMailingLabels = nameof(PrepareMailingLabels);
                public const string BasicHomeroomReport = nameof(BasicHomeroomReport);
                public const string BasicHomeroomReportPdf = nameof(BasicHomeroomReportPdf);
                public const string NCEALauncher = nameof(NCEALauncher);
                public const string StudentDirectoryPDF = nameof(StudentDirectoryPDF);
                public const string FamilyDirectoryPDF = nameof(FamilyDirectoryPDF);
                public const string FamilyInformationPDF = nameof(FamilyInformationPDF);
                public const string StaffDirectoryPDF = nameof(StaffDirectoryPDF);
                public const string StudentSchedulesPDFNew = nameof(StudentSchedulesPDFNew);
                public const string AccountBillingStatementsPDF = nameof(AccountBillingStatementsPDF);
                public const string CurrentBalanceNoticesPDF = nameof(CurrentBalanceNoticesPDF);
                public const string DelinquentAccountBalanceNotices = nameof(DelinquentAccountBalanceNotices);
                public const string DelinquentAccountBalancePDF = nameof(DelinquentAccountBalancePDF);
                public const string DelinquentLunchAccount = nameof(DelinquentLunchAccount);
                public const string DelinquentLunchAccountPDF = nameof(DelinquentLunchAccountPDF);
                public const string FamilyDataVerification = nameof(FamilyDataVerification);
                public const string ReRegFormLauncher = nameof(ReRegFormLauncher);
                public const string ReRegistrationForm = nameof(ReRegistrationForm);
                public const string FeatureOptionValue = nameof(FeatureOptionValue);
                public const string DailyAttendanceYearSummary = nameof(DailyAttendanceYearSummary);
                public const string DailyAttendanceYearSummaryFilteredStudents = nameof(DailyAttendanceYearSummaryFilteredStudents);
                public const string DailyAttendanceYearSummaryReports = nameof(DailyAttendanceYearSummaryReports);
                public const string DailyAttendanceHistoryReport = nameof(DailyAttendanceHistoryReport);
                public const string DailyAttendanceHistoryFilteredStudents = nameof(DailyAttendanceHistoryFilteredStudents);
                public const string GetDailyAttendanceHistoryReport = nameof(GetDailyAttendanceHistoryReport);
                public const string GradeReportLauncher = nameof(GradeReportLauncher);
                public const string GradeReportLauncherFilteredStudents = nameof(GradeReportLauncherFilteredStudents);
                public const string ProfessionalDevelopmentHistory = nameof(ProfessionalDevelopmentHistory);
                public const string HighschoolPlacementCard = nameof(HighschoolPlacementCard);
                public const string HighschoolPlacementCardStudents = nameof(HighschoolPlacementCardStudents);
                public const string PhillyRollSlip = nameof(PhillyRollSlip);
                public const string PennsylvaniaAverageDailyMembership = nameof(PennsylvaniaAverageDailyMembership);
                public const string PittsburghFinalGradeLevels = nameof(PittsburghFinalGradeLevels);
                public const string PittsburghFinalGradeLevelsRecords = nameof(PittsburghFinalGradeLevelsRecords);
                public const string PhiladelphiaEmergencyDrillReport = nameof(PhiladelphiaEmergencyDrillReport);
            }

            public static class ReportsManager
            {
                public const string GetRefreshData = nameof(GetRefreshData);
                public const string PrepareLauncher = nameof(PrepareLauncher);
                public const string PhiladelphiaEmergencyDrill = nameof(PhiladelphiaEmergencyDrill);
                public const string GetReportListPage = nameof(GetReportListPage);
                public const string GetReportLauncherTerms = nameof(GetReportLauncherTerms);
                public const string GetReportLauncherStudents = nameof(GetReportLauncherStudents);
                public const string GetAdHocPage = nameof(GetAdHocPage);
                public const string GetAdHocStudentResultsPage = nameof(GetAdHocStudentResultsPage);
                public const string GetAdHocParentResultsPage = nameof(GetAdHocParentResultsPage);
                public const string GetAdHocStaffResultsPage = nameof(GetAdHocStaffResultsPage);
                public const string SaveAdHocReport = nameof(SaveAdHocReport);
                public const string DeleteAdHocReport = nameof(DeleteAdHocReport);
                public const string GetAccountBillingStatementsPDF = nameof(GetAccountBillingStatementsPDF);
                public const string GetAccountBalanceStatement = nameof(GetAccountBalanceStatement);
                public const string GetLunchTransaction = nameof(GetLunchTransaction);
                public const string GetLunchTransactionDetails = nameof(GetLunchTransactionDetails);
                public const string GetArrearsReport = nameof(GetArrearsReport);
                public const string GetArrearsReportDetails = nameof(GetArrearsReportDetails);
                public const string GetOverAllBillingBalance = nameof(GetOverAllBillingBalance);
                public const string GetBillingBalanceDetails = nameof(GetBillingBalanceDetails);
                public const string GetBillingPaymentStatements = nameof(GetBillingPaymentStatements);
                public const string GetBillingPaymentDetail = nameof(GetBillingPaymentDetail);
                public const string GetBillingItemUsage = nameof(GetBillingItemUsage);
                public const string GetBillingItemUsageDetails = nameof(GetBillingItemUsageDetails);
                public const string GetCurrentBalanceNoticesPDF = nameof(GetCurrentBalanceNoticesPDF);
                public const string GetBillingPaymentStatement = nameof(GetBillingPaymentStatement);
                public const string GetBillingPaymentDetails = nameof(GetBillingPaymentDetails);
                public const string GetAgingOfReceivablesLauncher = nameof(GetAgingOfReceivablesLauncher);
                public const string GetDelinquentAmount = nameof(GetDelinquentAmount);
                public const string GetAgingOfReceivablesReport = nameof(GetAgingOfReceivablesReport);
                public const string GetFailedTransactionReport = nameof(GetFailedTransactionReport);
            }

            public static class ClassReports
            {
                public const string GetClassReports = nameof(GetClassReports);
                public const string GetClassAverages = nameof(GetClassAverages);
                public const string RecordClassReportHit = nameof(RecordClassReportHit);
                public const string GetStudentRoster = nameof(GetStudentRoster);
                public const string GetMissingAssignmentsTeacher = nameof(GetMissingAssignmentsTeacher);
                public const string GetTermGradeUpdateLog = nameof(GetTermGradeUpdateLog);
                public const string GetClassDisciplineHistory = nameof(GetClassDisciplineHistory);
                public const string GetStudentAccessLog = nameof(GetStudentAccessLog);
                public const string GetClassReportCards = nameof(GetClassReportCards);
                public const string GetStudentProfiles = nameof(GetStudentProfiles);
                public const string GetStaffSchedule = nameof(GetStaffSchedule);
            }

            public static class StandardReports
            {
                public const string GetBusInformation = nameof(GetBusInformation);
                public const string GetClassCatalog = nameof(GetClassCatalog);
                public const string GetClassDirectories = nameof(GetClassDirectories);
                public const string GetHomeroomListByClass = nameof(GetHomeroomListByClass);
                public const string GetClassRegistrationCounts = nameof(GetClassRegistrationCounts);
                public const string GetEnrollmentByHomeroom = nameof(GetEnrollmentByHomeroom);
                public const string GetStudentsNotInHomeroom = nameof(GetStudentsNotInHomeroom);
                public const string GetClassComments = nameof(GetClassComments);
                public const string GetAvailableClassSeats = nameof(GetAvailableClassSeats);
                public const string GetUngradedAssignments = nameof(GetUngradedAssignments);
                public const string GetFutureAssignments = nameof(GetFutureAssignments);
                public const string GetLastTermGradeUpdateForClasses = nameof(GetLastTermGradeUpdateForClasses);
                public const string GetTermGradeUpdateLogForClass = nameof(GetTermGradeUpdateLogForClass);
                public const string GetGradesTermAverage = nameof(GetGradesTermAverage);
                public const string GetAlumni = nameof(GetAlumni);
                public const string GetStudentSchedulesWithFilter = nameof(GetStudentSchedulesWithFilter);
                public const string GetStudentAverages = nameof(GetStudentAverages);
                public const string GetStudentMissingAssignments = nameof(GetStudentMissingAssignments);
                public const string GetStudentsFailingClasses = nameof(GetStudentsFailingClasses);
                public const string GetAssignmentCountsByTeacher = nameof(GetAssignmentCountsByTeacher);
                public const string GetReportCardMajorSubjectsByGrade = nameof(GetReportCardMajorSubjectsByGrade);
                public const string GetCalendarFileAccessLog = nameof(GetCalendarFileAccessLog);
                public const string GetCalendarFileAccessLogDetailed = nameof(GetCalendarFileAccessLogDetailed);
                public const string GetAttendanceByClass = nameof(GetAttendanceByClass);
                public const string GetSchoolwideClassAttendance = nameof(GetSchoolwideClassAttendance);
                public const string GetClassAbsenceRecords = nameof(GetClassAbsenceRecords);
                public const string GetStudentAbsenceDetails = nameof(GetStudentAbsenceDetails);
                public const string GetFirstDayAttendanceByStudent = nameof(GetFirstDayAttendanceByStudent);
                public const string GetTermTardyTime = nameof(GetTermTardyTime);
                public const string GetClassesMissingAttendance = nameof(GetClassesMissingAttendance);
                public const string GetMissingAttendanceForClass = nameof(GetMissingAttendanceForClass);
                public const string GetIndividualClassMonthlyAttendance = nameof(GetIndividualClassMonthlyAttendance);
                public const string GetDailyAttendanceForYear = nameof(GetDailyAttendanceForYear);
                public const string GetDailyAttendance = nameof(GetDailyAttendance);
                public const string GetDailyAttendanceHomeroomOnly = nameof(GetDailyAttendanceHomeroomOnly);
                public const string ReportsGetSchoolwideAttendanceStatus = nameof(ReportsGetSchoolwideAttendanceStatus);
                public const string GetYearlyAttendanceDetailsByStudent = nameof(GetYearlyAttendanceDetailsByStudent);
                public const string GetBehaviorAccessLogs = nameof(GetBehaviorAccessLogs);
                public const string GetInfractionCountsByDateRange = nameof(GetInfractionCountsByDateRange);
                public const string GetInfractionsByDateRange = nameof(GetInfractionsByDateRange);
                public const string GetUserconducthistory = nameof(GetUserconducthistory);
                public const string GetTotalTimeMissed = nameof(GetTotalTimeMissed);
                public const string GetEnrolledStudents = nameof(GetEnrolledStudents);
                public const string GetNewRegistrants = nameof(GetNewRegistrants);
                public const string GetNotYetEnrolledStudents = nameof(GetNotYetEnrolledStudents);
                public const string GetProspectsList = nameof(GetProspectsList);
                public const string GetReregisteredFamilies = nameof(GetReregisteredFamilies);
                public const string GetCurrentStudentsIntention = nameof(GetCurrentStudentsIntention);
                public const string GetStudentCountPerFamilyAdmissions = nameof(GetStudentCountPerFamilyAdmissions);
                public const string GetAttendanceTotalsByGradeLevel = nameof(GetAttendanceTotalsByGradeLevel);
                public const string GetStudentAttendanceStatistic = nameof(GetStudentAttendanceStatistic);
                public const string GetStudentAttendanceStatisticMonth = nameof(GetStudentAttendanceStatisticMonth);
                public const string EnrollmentReports = nameof(EnrollmentReports);
                public const string GetStudentAcademicSupport = nameof(GetStudentAcademicSupport);
                public const string GetOnlineReportCardRead = nameof(GetOnlineReportCardRead);
                public const string GetStaffUsers = nameof(GetStaffUsers);
                public const string GetStaffTBHistory = nameof(GetStaffTBHistory);
                public const string GetStaffSchedules = nameof(GetStaffSchedules);
                public const string GetStaffAttendanceTotals = nameof(GetStaffAttendanceTotals);
                public const string GetStaffAttendanceDetails = nameof(GetStaffAttendanceDetails);
                public const string GetStaffAttendanceTotalsByMonth = nameof(GetStaffAttendanceTotalsByMonth);
                public const string GetStaffAttendanceMonthDetails = nameof(GetStaffAttendanceMonthDetails);
                public const string GetProgressReportWithAssignments = nameof(GetProgressReportWithAssignments);
                public const string GetAssignmentGradesForStudent = nameof(GetAssignmentGradesForStudent);
                public const string GetStudentTranscript = nameof(GetStudentTranscript);
                public const string GetSimpleProgressReport = nameof(GetSimpleProgressReport);
                public const string GetSimpleProgressReportGrades = nameof(GetSimpleProgressReportGrades);
                public const string GetGPAByTerm = nameof(GetGPAByTerm);
                public const string GetGPADashboard = nameof(GetGPADashboard);
                public const string GetGPADetails = nameof(GetGPADetails);
            }

            public static class StudentReports
            {
                public const string GetBirthdayList = nameof(GetBirthdayList);
                public const string GetDisabledUsers = nameof(GetDisabledUsers);
                public const string GetStudentContactList = nameof(GetStudentContactList);
                public const string GetEmergencyContacts = nameof(GetEmergencyContacts);
                public const string GetEmergencyContactsUsers = nameof(GetEmergencyContactsUsers);
                public const string GetGradeLevelGenderEthnicity = nameof(GetGradeLevelGenderEthnicity);
                public const string GetGenderEthnicityGradeLevel = nameof(GetGenderEthnicityGradeLevel);
                public const string GetGenderReligionCounts = nameof(GetGenderReligionCounts);
                public const string GetGenderParishReligionCounts = nameof(GetGenderParishReligionCounts);
                public const string GetGenderSchoolDistrictReligionCounts = nameof(GetGenderSchoolDistrictReligionCounts);
                public const string GetHomeroomClassListWithoutContactInfo = nameof(GetHomeroomClassListWithoutContactInfo);
                public const string GetNonpublicSchoolEnrollment = nameof(GetNonpublicSchoolEnrollment);
                public const string GetNonPublicSchoolEnrollmentGradeLevels = nameof(GetNonPublicSchoolEnrollmentGradeLevels);
                public const string GetPublicSchoolList = nameof(GetPublicSchoolList);
                public const string GetIncorrectBirthdates = nameof(GetIncorrectBirthdates);
                public const string GetContactsByHomeroom = nameof(GetContactsByHomeroom);
                public const string GetDirectoryByClass = nameof(GetDirectoryByClass);
                public const string GetDirectoryByGradeLevel = nameof(GetDirectoryByGradeLevel);
                public const string GetStudentDirectoryII = nameof(GetStudentDirectoryII);
                public const string GetEthnicity = nameof(GetEthnicity);
                public const string GetStudentIDNumbers = nameof(GetStudentIDNumbers);
                public const string GetStudentParishInfo = nameof(GetStudentParishInfo);
                public const string GetTopZipCodes = nameof(GetTopZipCodes);
                public const string GetStudentHomeSituation = nameof(GetStudentHomeSituation);
                public const string GetNewStudents = nameof(GetNewStudents);
                public const string GetMailLabels = nameof(GetMailLabels);
                public const string DoLabelsExport = nameof(DoLabelsExport);
                public const string GetReRegistrationForm = nameof(GetReRegistrationForm);
                public const string GetStudentDirectoryPDF = nameof(GetStudentDirectoryPDF);
            }

            public static class MedicalReports
            {
                public const string FetchAllergieDetails = nameof(FetchAllergieDetails);
                public const string FetchBMIDetails = nameof(FetchBMIDetails);
                public const string FoodAllergies = nameof(FoodAllergies);
                public const string FoodSensitivities = nameof(FoodSensitivities);
                public const string FoodIntolerances = nameof(FoodIntolerances);
                public const string ImmunizationHistory = nameof(ImmunizationHistory);
                public const string NurseVisits = nameof(NurseVisits);
                public const string NurseVisitsByYear = nameof(NurseVisitsByYear);
                public const string NurseProfile = nameof(NurseProfile);
                public const string JsonMedicationExpiration = nameof(JsonMedicationExpiration);
                public const string FetchImmunizationDetails = nameof(FetchImmunizationDetails);
                public const string FetchMissingImmunizationDetails = nameof(FetchMissingImmunizationDetails);
                public const string FetchNurseProfileDetails = nameof(FetchNurseProfileDetails);
                public const string FetchYearlyNurseVisitLogDetails = nameof(FetchYearlyNurseVisitLogDetails);
                public const string MedicationLog = nameof(MedicationLog);
                public const string GetProfileSummary = nameof(GetProfileSummary);
                public const string ReportAutoLogin = nameof(ReportAutoLogin);
            }

            public static class Religion
            {
                public const string AltarServers = nameof(AltarServers);
                public const string Baptism = nameof(Baptism);
                public const string Communion = nameof(Communion);
                public const string Confirmation = nameof(Confirmation);
                public const string DiscrepantParishes = nameof(DiscrepantParishes);
                public const string DiscrepantReligions = nameof(DiscrepantReligions);
                public const string StudentReligion = nameof(StudentReligion);
                public const string SacramentReconciliation = nameof(SacramentReconciliation);
                public const string MissingSacraments = nameof(MissingSacraments);
            }

            public static class OrgReport
            {
                public const string EmergencyDrillSummary = nameof(EmergencyDrillSummary);
                public const string EmergencyDrillDetails = nameof(EmergencyDrillDetails);
                public const string EnrolledStudents = nameof(EnrolledStudents);
                public const string NewRegistrants = nameof(NewRegistrants);
                public const string NotYetEnrolledStudents = nameof(NotYetEnrolledStudents);
                public const string LoginCounts = nameof(LoginCounts);
                public const string IndividualUserLoginCounts = nameof(IndividualUserLoginCounts);
                public const string DaysOffCalendar = nameof(DaysOffCalendar);
                public const string IntroLetter80 = nameof(IntroLetter80);
                public const string IntroLetter4143 = nameof(IntroLetter4143);
                public const string IntroLetterES = nameof(IntroLetterES);
                public const string IntroLetterMS = nameof(IntroLetterMS);
            }

            public static class SecurityReports
            {
                public const string BlockedPickupList = nameof(BlockedPickupList);
                public const string UserDirectory = nameof(UserDirectory);
                public const string MergeLaunch = nameof(MergeLaunch);
                public const string VirtusCertifications = nameof(VirtusCertifications);
                public const string GetLoginList = nameof(GetLoginList);
            }

            public static class SchoolMealsReports
            {
                public const string MonthlyLunchOrderSummary = nameof(MonthlyLunchOrderSummary);
                public const string MonthlyLunchOrderDetails = nameof(MonthlyLunchOrderDetails);
                public const string WeeklyLunchOrderStatus = nameof(WeeklyLunchOrderStatus);
                public const string MonthlyLunchOrderStatus = nameof(MonthlyLunchOrderStatus);
                public const string GetOrderMonths = nameof(GetOrderMonths);
                public const string MonthlyLunchOrderItemCounts = nameof(MonthlyLunchOrderItemCounts);
                public const string FreeReducedEligibleStudents = nameof(FreeReducedEligibleStudents);
                public const string FutureClassLunchOrders = nameof(FutureClassLunchOrders);
                public const string AdvanceWeeklyEntreeOrderStatus = nameof(AdvanceWeeklyEntreeOrderStatus);
                public const string LunchItemCountsForDateRange = nameof(LunchItemCountsForDateRange);
                public const string ClassLunchOrderTotalsByStudent = nameof(ClassLunchOrderTotalsByStudent);
                public const string DetailedLunchCountAlphabeticalList = nameof(DetailedLunchCountAlphabeticalList);
                public const string DetailedSchoolLunchOrders = nameof(DetailedSchoolLunchOrders);
            }

            public static class CustomReports
            {
            }

            public static class Family
            {
                public const string FamiliesMissingParents = nameof(FamiliesMissingParents);
                public const string EmailExport = nameof(EmailExport);
                public const string ParentInformation = nameof(ParentInformation);
                public const string FamilyCountByStudentsReligion = nameof(FamilyCountByStudentsReligion);
                public const string FamilyListing = nameof(FamilyListing);
                public const string FamilyDataVerification = nameof(FamilyDataVerification);
                public const string FamilyDirectoryPDF = nameof(FamilyDirectoryPDF);
                public const string FamilyInformationPDF = nameof(FamilyInformationPDF);
                public const string FamilyReport = nameof(FamilyReport);
                public const string FetchSectionData = nameof(FetchSectionData);
            }

            public static class Vouchers
            {
                public const string VoucherGetCurrentSchoolYearId = nameof(VoucherGetCurrentSchoolYearId);
                public const string LunchParticipationRecord = nameof(LunchParticipationRecord);
                public const string NationalSchoolLunchProgram = nameof(NationalSchoolLunchProgram);
                public const string StudentParishList = nameof(StudentParishList);
                public const string NonPublicSchoolEnrollmentStudents = nameof(NonPublicSchoolEnrollmentStudents);
                public const string VoucherTotalsByDateRange = nameof(VoucherTotalsByDateRange);
                public const string VoucherTotalsByMonth = nameof(VoucherTotalsByMonth);
                public const string SchoolYearMonths = nameof(SchoolYearMonths);
                public const string FloridaScholarships = nameof(FloridaScholarships);
            }
        }

        /// <summary>OptionC.SSO host — modern React routes and legacy compatibility paths (URLs unchanged).</summary>
        public static class API_SSO
        {
            public static class User
            {
                public const string GetUserDetails = nameof(GetUserDetails);
                public const string UserDetail = nameof(UserDetail);
                public const string ForgotPassword = nameof(ForgotPassword);
                public const string ValidateUser = nameof(ValidateUser);
                public const string Logout = nameof(Logout);
                public const string GetAccessPortals = nameof(GetAccessPortals);
                public const string SMSSSOAutoLogin = nameof(SMSSSOAutoLogin);
                public const string GetDomainByAccessToken = nameof(GetDomainByAccessToken);
                public const string NavigatePortalSession = nameof(NavigatePortalSession);
                public const string ListOrgNavigation = nameof(ListOrgNavigation);
                public const string NavigateToPortal = nameof(NavigateToPortal);
                public const string GetDefaultPreference = nameof(GetDefaultPreference);
                public const string SaveDefaultPreference = nameof(SaveDefaultPreference);
                public const string UserAuthentication = nameof(UserAuthentication);
                public const string EmailUsernameSetup = nameof(EmailUsernameSetup);
                public const string PreferredEmail = nameof(PreferredEmail);
                public const string PreferredEmailVerify = nameof(PreferredEmailVerify);
                public const string ValidateLink = nameof(ValidateLink);
                public const string SaveEmail = nameof(SaveEmail);
                public const string EmailChangePassword = nameof(EmailChangePassword);
                public const string SchoolSearch = nameof(SchoolSearch);
                public const string GetSignInImageAndPrayer = nameof(GetSignInImageAndPrayer);
            }

            public static class LaunchPad
            {
                public const string GetProducts = nameof(GetProducts);
                public const string GetProductDetailsByUserDetails = nameof(GetProductDetailsByUserDetails);
                public const string Products = nameof(Products);
                public const string InsertUserActivity = nameof(InsertUserActivity);
                public const string UserActivity = nameof(UserActivity);
                public const string CreateLaunchSession = nameof(CreateLaunchSession);
                public const string LaunchSessionVersioned = nameof(LaunchSessionVersioned);
                public const string GetProductDetail = nameof(GetProductDetail);
                public const string GetProductDetails = nameof(GetProductDetails);
                public const string ProductDetail = nameof(ProductDetail);
                public const string GetJoinPrefill = nameof(GetJoinPrefill);
                public const string GetUserProductForJoin = nameof(GetUserProductForJoin);
                public const string JoinPrefill = nameof(JoinPrefill);
            }
        }

        /// <summary>OptionC.Component host — shared component endpoints.</summary>
        public static class API_Component
        {
            /// <summary>Action names for Data Update Tools bulk profile and admin utilities.</summary>
            public static class DataUpdate
            {
                public const string GetIndex = nameof(GetIndex);
                public const string GetAssociateStudentParish = nameof(GetAssociateStudentParish);
                public const string SaveAssociateParish = nameof(SaveAssociateParish);
                public const string GetSacramentEntry = nameof(GetSacramentEntry);
                public const string FetchingData = nameof(FetchingData);
                public const string SaveSacramentEntry = nameof(SaveSacramentEntry);
                public const string GetAssociateStudentsPublicSchools = nameof(GetAssociateStudentsPublicSchools);
                public const string SaveStudentWithPublicSchools = nameof(SaveStudentWithPublicSchools);
                public const string GetAssociateUserReligionEthnicity = nameof(GetAssociateUserReligionEthnicity);
                public const string SaveAssociateUserReligionEthnicity = nameof(SaveAssociateUserReligionEthnicity);
                public const string GetUpdateRegistrationStatus = nameof(GetUpdateRegistrationStatus);
                public const string SaveRegistrationStatus = nameof(SaveRegistrationStatus);
                public const string ResetRegistrationStatus = nameof(ResetRegistrationStatus);
                public const string GetStudentTransportationSubsidies = nameof(GetStudentTransportationSubsidies);
                public const string FilterStudentTransportation = nameof(FilterStudentTransportation);
                public const string UpdateStudentTransportationSubsidies = nameof(UpdateStudentTransportationSubsidies);
                public const string GetStudentVouchers = nameof(GetStudentVouchers);
                public const string SaveStudentVouchers = nameof(SaveStudentVouchers);
                public const string GetEndOfYearWizard = nameof(GetEndOfYearWizard);
                public const string FetchDisabledUsers = nameof(FetchDisabledUsers);
                public const string UpdateDisabledUsers = nameof(UpdateDisabledUsers);
                public const string GetStudentPhotoUploadTemplate = nameof(GetStudentPhotoUploadTemplate);
                public const string GetStudentProfileSummary = nameof(GetStudentProfileSummary);
                public const string GetAdminUtility = nameof(GetAdminUtility);
                public const string UpdateUserEmail = nameof(UpdateUserEmail);
                public const string SaveUserEmail = nameof(SaveUserEmail);
                public const string GetStudentUserNameUpdate = nameof(GetStudentUserNameUpdate);
                public const string UpdateStudentUserEmail = nameof(UpdateStudentUserEmail);
                public const string UploadStudentPhoto = nameof(UploadStudentPhoto);
                public const string GetAssociateGradeLevels = nameof(GetAssociateGradeLevels);
                public const string CategorywiseAssociateGradeLevels = nameof(CategorywiseAssociateGradeLevels);
                public const string SaveAssociateGradeLevels = nameof(SaveAssociateGradeLevels);
                public const string GetAssociateSections = nameof(GetAssociateSections);
                public const string CategorywiseAssociateSections = nameof(CategorywiseAssociateSections);
                public const string SaveAssociateSections = nameof(SaveAssociateSections);
                public const string GetAssociateTeachers = nameof(GetAssociateTeachers);
                public const string SaveAssociateTeachers = nameof(SaveAssociateTeachers);
            }

            /// <summary>Action names for Staff Evaluations.</summary>
            public static class StaffEvaluations
            {
                public const string GetStaffEvaluationList = nameof(GetStaffEvaluationList);
                public const string GetStaffEvaluation = nameof(GetStaffEvaluation);
                public const string UpdateStaffEvaluation = nameof(UpdateStaffEvaluation);
                public const string GetStaffEvaluationReportPage = nameof(GetStaffEvaluationReportPage);
                public const string GetStaffListPage = nameof(GetStaffListPage);
            }

            /// <summary>Action names for Staff Attendance.</summary>
            public static class StaffAttendance
            {
                public const string GetAttendanceStatusList = nameof(GetAttendanceStatusList);
                public const string GetAttendanceStatusDetails = nameof(GetAttendanceStatusDetails);
                public const string SaveAttendanceStatus = nameof(SaveAttendanceStatus);
                public const string DeleteAttendanceStatus = nameof(DeleteAttendanceStatus);
                public const string GetStaffAttendanceForDate = nameof(GetStaffAttendanceForDate);
                public const string TakeStaffAttendance = nameof(TakeStaffAttendance);
                public const string GetAccumulatedSickDays = nameof(GetAccumulatedSickDays);
                public const string UpdateAccumulatedSickDays = nameof(UpdateAccumulatedSickDays);
            }

            /// <summary>Action names for Professional Development.</summary>
            public static class ProfessionalDevelopment
            {
                public const string GetDashboard = nameof(GetDashboard);
                public const string RegisterForEvent = nameof(RegisterForEvent);
                public const string UnregisterFromEvent = nameof(UnregisterFromEvent);
                public const string GetTrainingEventDetails = nameof(GetTrainingEventDetails);
                public const string GetMyHistory = nameof(GetMyHistory);
                public const string GetSchoolHistory = nameof(GetSchoolHistory);
                public const string GetVerifyEvents = nameof(GetVerifyEvents);
                public const string GetSchoolTrainingEvents = nameof(GetSchoolTrainingEvents);
                public const string GetNewHistoricalEvent = nameof(GetNewHistoricalEvent);
                public const string SaveHistoricalEvent = nameof(SaveHistoricalEvent);
                public const string SaveTrainingEvent = nameof(SaveTrainingEvent);
                public const string GetSettings = nameof(GetSettings);
                public const string SaveSettings = nameof(SaveSettings);
                public const string GetLoginUserPermissions = nameof(GetLoginUserPermissions);
                public const string VerifyEvent = nameof(VerifyEvent);
            }

            /// <summary>Action names for School Settings.</summary>
            public static class SchoolSettings
            {
                public const string GetContactInformation = nameof(GetContactInformation);
                public const string SaveContactInformation = nameof(SaveContactInformation);
                public const string GetSessionTimeouts = nameof(GetSessionTimeouts);
                public const string SaveSessionTimeouts = nameof(SaveSessionTimeouts);
                public const string GetSmsOptions = nameof(GetSmsOptions);
                public const string SaveSmsOptions = nameof(SaveSmsOptions);
                public const string ValidateMinMaxStudentGradeLevel = nameof(ValidateMinMaxStudentGradeLevel);
                public const string GetEdfiKeys = nameof(GetEdfiKeys);
                public const string GetFamilyLoginSettings = nameof(GetFamilyLoginSettings);
                public const string SaveFamilyLoginSettings = nameof(SaveFamilyLoginSettings);
                public const string GetNceaProfile = nameof(GetNceaProfile);
                public const string SaveNceaProfile = nameof(SaveNceaProfile);
                public const string GetProgramsAndBenefits = nameof(GetProgramsAndBenefits);
                public const string SaveProgramsAndBenefits = nameof(SaveProgramsAndBenefits);
                public const string GetSchoolBudget = nameof(GetSchoolBudget);
                public const string SaveSchoolBudget = nameof(SaveSchoolBudget);
            }

            /// <summary>Action names for Permissions.</summary>
            public static class AdminPermissions
            {
                public const string GetAdminPermissions = nameof(GetAdminPermissions);
                public const string SaveAdminPermissions = nameof(SaveAdminPermissions);
            }

            /// <summary>Action names for Class Permissions.</summary>
            public static class ClassPermissions
            {
                public const string GetClassPermissions = nameof(GetClassPermissions);
                public const string SaveClassPermissions = nameof(SaveClassPermissions);
            }

            /// <summary>Action names for Profile Permissions.</summary>
            public static class ProfilePermissions
            {
                public const string GetProfilePermissions = nameof(GetProfilePermissions);
                public const string SaveProfilePermissions = nameof(SaveProfilePermissions);
            }

            /// <summary>Action names for Report Permissions.</summary>
            public static class ReportPermissions
            {
                public const string GetReportPermissions = nameof(GetReportPermissions);
                public const string GetReportCategory = nameof(GetReportCategory);
                public const string SaveReportPermissions = nameof(SaveReportPermissions);
            }

            /// <summary>Action names for User Permissions.</summary>
            public static class UserPermissions
            {
                public const string GetUserPermissions = nameof(GetUserPermissions);
                public const string GetUserCategory = nameof(GetUserCategory);
                public const string SaveUserPermissions = nameof(SaveUserPermissions);
            }

            /// <summary>Action names for Ed-Fi.</summary>
            public static class EdFi
            {
                public const string GetSchoolYearsForDataTransfer = nameof(GetSchoolYearsForDataTransfer);
                public const string GetStudentsBySearch = nameof(GetStudentsBySearch);
                public const string GetStudentsForDataTransfer = nameof(GetStudentsForDataTransfer);
                public const string SendStudentData = nameof(SendStudentData);
            }

            /// <summary>Action names for Building Facility Manager.</summary>
            public static class BuildingFacilityManager
            {
                public const string GetBuildingRoomList = nameof(GetBuildingRoomList);
                public const string GetBuildingProperties = nameof(GetBuildingProperties);
                public const string GetBuildingList = nameof(GetBuildingList);
                public const string GetRoomProperties = nameof(GetRoomProperties);
                public const string SaveBuilding = nameof(SaveBuilding);
                public const string SaveRoom = nameof(SaveRoom);
                public const string DeleteBuildingRoom = nameof(DeleteBuildingRoom);
            }

            /// <summary>Action names for Staff Settings (User Resources).</summary>
            public static class StaffSettings
            {
                public const string GetAttendanceOptions = nameof(GetAttendanceOptions);
                public const string SaveAttendanceOptions = nameof(SaveAttendanceOptions);
                public const string GetLunchOptions = nameof(GetLunchOptions);
                public const string SaveLunchOptions = nameof(SaveLunchOptions);
                public const string GetGeneralSettings = nameof(GetGeneralSettings);
                public const string SaveGeneralSettings = nameof(SaveGeneralSettings);
                public const string GetAssignmentSettings = nameof(GetAssignmentSettings);
                public const string SaveAssignmentSettings = nameof(SaveAssignmentSettings);
            }

            /// <summary>Action names for Personal Options (User Resources).</summary>
            public static class PersonalOptions
            {
                public const string GetMySchedule = nameof(GetMySchedule);
                public const string GetMyFiles = nameof(GetMyFiles);
                public const string GetFileDownload = nameof(GetFileDownload);
            }

            /// <summary>Action names for ACR (User Resources).</summary>
            public static class ACR
            {
                public const string GetAboutPage = nameof(GetAboutPage);
                public const string GetDailyLogPage = nameof(GetDailyLogPage);
                public const string UpdateTimeSpent = nameof(UpdateTimeSpent);
                public const string GetActivityLogPage = nameof(GetActivityLogPage);
                public const string UpdateActivities = nameof(UpdateActivities);
                public const string GetAdministrationPage = nameof(GetAdministrationPage);
                public const string SaveSettings = nameof(SaveSettings);
                public const string SaveBenefitOption = nameof(SaveBenefitOption);
                public const string DeleteBenefit = nameof(DeleteBenefit);
                public const string GetStaffSalaryPage = nameof(GetStaffSalaryPage);
                public const string UpdateStaffSettings = nameof(UpdateStaffSettings);
                public const string GetDailyLogReport = nameof(GetDailyLogReport);
                public const string GetReportsPage = nameof(GetReportsPage);
                public const string GetSchoolFinalReport = nameof(GetSchoolFinalReport);
                public const string GetStaffHourlyRateReport = nameof(GetStaffHourlyRateReport);
                public const string GetStaffSummaryReport = nameof(GetStaffSummaryReport);
                public const string GetIndividualSummaryReport = nameof(GetIndividualSummaryReport);
                public const string GetQuarterlySummaryReport = nameof(GetQuarterlySummaryReport);
            }

            public static class TerraNova
            {
                public const string GetTerraNovaDetails = nameof(GetTerraNovaDetails);
                public const string UploadData = nameof(UploadData);
                public const string InitializeDataImport = nameof(InitializeDataImport);
                public const string CompleteDataImport = nameof(CompleteDataImport);
            }

            public static class StudentTranscripts
            {
                public const string GetTranscriptListPage = nameof(GetTranscriptListPage);
                public const string GetTranscriptDetailsPage = nameof(GetTranscriptDetailsPage);
                public const string SearchTranscriptStudents = nameof(SearchTranscriptStudents);
                public const string SaveTranscriptGeneral = nameof(SaveTranscriptGeneral);
                public const string SaveTranscriptTest = nameof(SaveTranscriptTest);
                public const string DeleteTranscriptTest = nameof(DeleteTranscriptTest);
                public const string GetTranscriptBulkUpdatePage = nameof(GetTranscriptBulkUpdatePage);
                public const string SaveTranscriptBulkGraduation = nameof(SaveTranscriptBulkGraduation);
                public const string SaveTranscriptBulkDiploma = nameof(SaveTranscriptBulkDiploma);
            }

            /// <summary>
            /// School-side Diocese Data Request List API action names (legacy diocesedata-index).
            /// </summary>
            public static class DioceseDataRequest
            {
                /// <summary>GET list page payload.</summary>
                public const string GetDataRequestList = nameof(GetDataRequestList);

                /// <summary>POST non-file submission.</summary>
                public const string AddSubmission = nameof(AddSubmission);

                /// <summary>POST withdraw disposition for a New submission.</summary>
                public const string WithdrawSubmission = nameof(WithdrawSubmission);

                /// <summary>POST file submission upload.</summary>
                public const string UploadFile = nameof(UploadFile);

                /// <summary>GET previously uploaded submission file.</summary>
                public const string DownloadFile = nameof(DownloadFile);
            }

            /// <summary>
            /// Vincent Volunteer Management API action names (legacy /volunteer-dashboard).
            /// </summary>
            public static class VolunteerManagement
            {
                /// <summary>GET admin dashboard (events, albums, settings).</summary>
                public const string GetDashboard = nameof(GetDashboard);

                /// <summary>GET volunteer hours needed/completed strip.</summary>
                public const string GetVolunteerHours = nameof(GetVolunteerHours);

                /// <summary>GET photo album details by id for edit.</summary>
                public const string GetAlbumById = nameof(GetAlbumById);

                /// <summary>POST create or update photo album.</summary>
                public const string SaveAlbum = nameof(SaveAlbum);

                /// <summary>POST delete photo album.</summary>
                public const string DeleteAlbum = nameof(DeleteAlbum);

                /// <summary>GET active events list.</summary>
                public const string GetEvents = nameof(GetEvents);

                /// <summary>GET archived events list.</summary>
                public const string GetArchivedEvents = nameof(GetArchivedEvents);

                /// <summary>GET event by id for add/edit (leaders + event).</summary>
                public const string GetEventById = nameof(GetEventById);

                /// <summary>POST create or update event.</summary>
                public const string SaveEvent = nameof(SaveEvent);

                /// <summary>POST publish / unpublish event status.</summary>
                public const string ChangeEventStatus = nameof(ChangeEventStatus);

                /// <summary>POST archive / unarchive event.</summary>
                public const string ChangeArchiveStatus = nameof(ChangeArchiveStatus);

                /// <summary>POST delete event.</summary>
                public const string DeleteEvent = nameof(DeleteEvent);

                /// <summary>POST copy event.</summary>
                public const string CopyEvent = nameof(CopyEvent);

                /// <summary>GET event preview details.</summary>
                public const string ViewEvent = nameof(ViewEvent);

                /// <summary>GET tasks list.</summary>
                public const string GetTasks = nameof(GetTasks);

                /// <summary>GET add/edit task page (event options + optional task).</summary>
                public const string GetTaskById = nameof(GetTaskById);

                /// <summary>POST create or update task.</summary>
                public const string SaveTask = nameof(SaveTask);

                /// <summary>POST delete task.</summary>
                public const string DeleteTask = nameof(DeleteTask);

                /// <summary>GET events for Task Requests dropdown.</summary>
                public const string GetEventsForTaskRequest = nameof(GetEventsForTaskRequest);

                /// <summary>GET admin task requests for an event.</summary>
                public const string GetAdminTaskRequests = nameof(GetAdminTaskRequests);

                /// <summary>POST approve/unapprove task requests + leaders.</summary>
                public const string ApproveRemoveTaskRequests = nameof(ApproveRemoveTaskRequests);

                /// <summary>GET admin Hours list (ManageHoursDetails ActionId = 1).</summary>
                public const string GetHoursList = nameof(GetHoursList);

                /// <summary>GET hours details for one user (ManageHoursDetails ActionId = 2).</summary>
                public const string GetHoursByUserId = nameof(GetHoursByUserId);

                /// <summary>POST save hours for a user.</summary>
                public const string SaveHoursDetails = nameof(SaveHoursDetails);

                /// <summary>GET tasks for an event (dashboard event-name popup).</summary>
                public const string ListTasksForEvent = nameof(ListTasksForEvent);

                /// <summary>POST save volunteer task request statuses for an event.</summary>
                public const string SaveRequestStatus = nameof(SaveRequestStatus);

                /// <summary>POST update Get Started wizard progress (legacy Update-VV-Admin-Staus).</summary>
                public const string UpdateVVWizardStatus = nameof(UpdateVVWizardStatus);

                /// <summary>GET subscription renewal status (legacy GetVVSubscription).</summary>
                public const string GetVVSubscription = nameof(GetVVSubscription);

                /// <summary>POST remind-me-later for renewal popup (legacy RemainderVVSubscription).</summary>
                public const string RemainderVVSubscription = nameof(RemainderVVSubscription);
            }

            public static class SecureMessage
            {
                public const string GetContactInformation = nameof(GetContactInformation);
                public const string SendMessage = nameof(SendMessage);
            }
        }

        public static class API_Reference
        {
            public static class CatholicContent
            {
                public const string GetCatholicContent = nameof(GetCatholicContent);
                public const string GetFilePath = nameof(GetFilePath);
                public const string AutoSearch = nameof(AutoSearch);
            }

            public static class SecureMessage
            {
                public const string GetContactInformation = nameof(GetContactInformation);
                public const string SendMessage = nameof(SendMessage);
                public const string Modules = nameof(Modules);
                public const string GetTicketConversation = nameof(GetTicketConversation);
                public const string SubmitReply = nameof(SubmitReply);
            }
        }
    }

    public static class API_Diocese
    {
        public static class Scholarship
        {
            public const string GetStudentListPage = nameof(GetStudentListPage);
            public const string GetDonorListPage = nameof(GetDonorListPage);
            public const string GetFileListPage = nameof(GetFileListPage);
            public const string GetStudentDetailsPage = nameof(GetStudentDetailsPage);
            public const string GetDonorDetailsPage = nameof(GetDonorDetailsPage);
            public const string GetManualUpdatePage = nameof(GetManualUpdatePage);
            public const string SearchStudents = nameof(SearchStudents);
            public const string SaveDonorDetails = nameof(SaveDonorDetails);
            public const string InsertStudent = nameof(InsertStudent);
            public const string RemoveStudent = nameof(RemoveStudent);
            public const string UploadFileTemplate = nameof(UploadFileTemplate);
            public const string DownloadFileTemplate = nameof(DownloadFileTemplate);
            public const string RemoveFileTemplate = nameof(RemoveFileTemplate);
            public const string UploadStudentFile = nameof(UploadStudentFile);
            public const string DownloadStudentFile = nameof(DownloadStudentFile);
            public const string RemoveStudentFile = nameof(RemoveStudentFile);
            public const string RemoveStudentRequirement = nameof(RemoveStudentRequirement);
            public const string UploadScholarshipData = nameof(UploadScholarshipData);
            public const string DownloadEnrollmentVerificationExport = nameof(DownloadEnrollmentVerificationExport);
            public const string DownloadDonorPdf = nameof(DownloadDonorPdf);
            public const string DownloadDonorZip = nameof(DownloadDonorZip);
        }

        public static class SchoolGroup
        {
            public const string GetSchoolGroupListPage = nameof(GetSchoolGroupListPage);
            public const string GetSchoolGroupDetailsPage = nameof(GetSchoolGroupDetailsPage);
            public const string InsertSchoolGroup = nameof(InsertSchoolGroup);
            public const string UpdateSchoolGroup = nameof(UpdateSchoolGroup);
            public const string DeleteSchoolGroup = nameof(DeleteSchoolGroup);
        }

        public static class Auth
        {
            public const string GetLogonPage = nameof(GetLogonPage);
            public const string Login = nameof(Login);
            public const string AutoLogin = nameof(AutoLogin);
            public const string Logout = nameof(Logout);
        }

        public static class Menu
        {
            public const string GetNavigation = nameof(GetNavigation);
        }

        public static class Organization
        {
            public static class CatholicSchool
            {
                public const string GetList = nameof(GetList);
                public const string GetDetails = nameof(GetDetails);
                public const string GetEnrollmentChartData = nameof(GetEnrollmentChartData);
            }

            public static class ReligiousEdSchool
            {
                public const string GetList = nameof(GetList);
                public const string GetDetails = nameof(GetDetails);
                public const string GetEnrollmentChartData = nameof(GetEnrollmentChartData);
            }
        }

        public static class Profile
        {
            public const string GetProfile = nameof(GetProfile);
            public const string UpdateProfile = nameof(UpdateProfile);
            public const string ChangePassword = nameof(ChangePassword);
        }

        public static class Parish
        {
            public const string GetParishList = nameof(GetParishList);
            public const string GetParishDetails = nameof(GetParishDetails);
            public const string SaveParish = nameof(SaveParish);
            public const string DeleteParish = nameof(DeleteParish);
        }

        public static class UsDioceseDirectory
        {
            public const string GetDirectory = nameof(GetDirectory);
        }

        public static class People
        {
            public static class DioceseStaffDirectory
            {
                public const string GetDirectory = nameof(GetDirectory);
            }

            public static class CatholicSchoolDirectory
            {
                public const string GetSchools = nameof(GetSchools);
                public const string GetContacts = nameof(GetContacts);
            }

            public static class ReligiousEdDirectory
            {
                public const string GetSchools = nameof(GetSchools);
                public const string GetContacts = nameof(GetContacts);
            }

            public static class StudentSearch
            {
                public const string Search = nameof(Search);
            }

            public static class ParishClergy
            {
                public const string GetList = nameof(GetList);
                public const string GetDetails = nameof(GetDetails);
                public const string SaveClergy = nameof(SaveClergy);
                public const string DeleteClergy = nameof(DeleteClergy);
            }
        }

        public static class Dashboard
        {
            public const string GetDetails = nameof(GetDetails);
            public const string Saint = nameof(Saint);
        }

        public static class Reports
        {
            public const string GetReportListPage = nameof(GetReportListPage);
            public const string GetNysRegentsReportPage = nameof(GetNysRegentsReportPage);
            public const string GetGenericReportPage = nameof(GetGenericReportPage);
            public const string ExportNysRegentsExamData = nameof(ExportNysRegentsExamData);
            public const string ExportHealthyHighFiveData = nameof(ExportHealthyHighFiveData);
            public const string ExportNysStudentLiteData = nameof(ExportNysStudentLiteData);
            public const string ExportNysStudentEntryExitData = nameof(ExportNysStudentEntryExitData);
            public const string ExportTerraNovaUserData = nameof(ExportTerraNovaUserData);
            public const string GetProfessionalStaffReportData = nameof(GetProfessionalStaffReportData);
            public const string GetSafeguardingVirtusReportData = nameof(GetSafeguardingVirtusReportData);
            public const string GetSchoolClassesAndTeachersData = nameof(GetSchoolClassesAndTeachersData);
            public const string ExportSchoolArchiveData = nameof(ExportSchoolArchiveData);
            public const string GetSchoolAttendanceReportData = nameof(GetSchoolAttendanceReportData);
            public const string GetReligiousEdEnrollmentByGradeGenderData = nameof(GetReligiousEdEnrollmentByGradeGenderData);
            public const string GetEnrollmentByGradeGenderData = nameof(GetEnrollmentByGradeGenderData);
            public const string GetSchoolDaysReportPage = nameof(GetSchoolDaysReportPage);
            public const string UpdateSchoolDaysApprovalStatus = nameof(UpdateSchoolDaysApprovalStatus);
            public const string ExportProspectContactData = nameof(ExportProspectContactData);
            public const string ExportStudentContactData = nameof(ExportStudentContactData);
            public const string GetTop5ZipCodesReportData = nameof(GetTop5ZipCodesReportData);
            public const string GetSchoolProspectCountsReportData = nameof(GetSchoolProspectCountsReportData);
            public const string GetSchoolFilterAjaxPage = nameof(GetSchoolFilterAjaxPage);
            public const string GetBusInformationReportData = nameof(GetBusInformationReportData);
            public const string GetCStarGradesReportData = nameof(GetCStarGradesReportData);
            public const string ExportNceaData = nameof(ExportNceaData);
            public const string ExportFeatureUsageData = nameof(ExportFeatureUsageData);
            public const string GetFreeOrReducedMealsReportData = nameof(GetFreeOrReducedMealsReportData);
            public const string GetMissingAttendanceReportData = nameof(GetMissingAttendanceReportData);
            public const string ExportStudentProfileData = nameof(ExportStudentProfileData);
            public const string GetStaffListPage = nameof(GetStaffListPage);
            public const string GetStaffProfessionalDevelopmentReportData = nameof(GetStaffProfessionalDevelopmentReportData);
            public const string GetEnrollmentNextYearReportData = nameof(GetEnrollmentNextYearReportData);
            public const string GetEnrollmentNextYearGradeSummaryReportData = nameof(GetEnrollmentNextYearGradeSummaryReportData);
            public const string GetSchoolEnrollmentByGradeData = nameof(GetSchoolEnrollmentByGradeData);
            public const string GetSchoolEnrollmentTrendData = nameof(GetSchoolEnrollmentTrendData);
            public const string GetSchoolEnrollmentByParishAndGradeData = nameof(GetSchoolEnrollmentByParishAndGradeData);
            public const string ExportNonReportCardCourseData = nameof(ExportNonReportCardCourseData);
            public const string GetNonReportCardCourseReportData = nameof(GetNonReportCardCourseReportData);
            public const string GetStudentRetentionSummaryData = nameof(GetStudentRetentionSummaryData);
            public const string GetAdHocPage = nameof(GetAdHocPage);
            public const string GetAdHocStudentResultsPage = nameof(GetAdHocStudentResultsPage);
            public const string GetAdHocStaffResultsPage = nameof(GetAdHocStaffResultsPage);
            public const string GetAdHocParentResultsPage = nameof(GetAdHocParentResultsPage);
            public const string GetAdHocSchoolResultsPage = nameof(GetAdHocSchoolResultsPage);
            public const string SaveAdHocReport = nameof(SaveAdHocReport);
            public const string DeleteAdHocReport = nameof(DeleteAdHocReport);
        }

        public static class Administration
        {
            public static class DioceseProfile
            {
                public const string GetProfile = nameof(GetProfile);
                public const string SaveProfile = nameof(SaveProfile);
            }

            public static class CertificationPeriods
            {
                public const string GetCertificationPeriodsList = nameof(GetCertificationPeriodsList);
                public const string GetCertificationList = nameof(GetCertificationList);
                public const string UpdateCertificationPeriodsList = nameof(UpdateCertificationPeriodsList);
            }

            public static class Training
            {
                public const string GetEventList = nameof(GetEventList);
                public const string GetEventDetails = nameof(GetEventDetails);
                public const string GetSubCategories = nameof(GetSubCategories);
                public const string SaveEvent = nameof(SaveEvent);
                public const string DeleteEvent = nameof(DeleteEvent);
                public const string GetEventRegistrations = nameof(GetEventRegistrations);
                public const string GetStaffLookup = nameof(GetStaffLookup);
                public const string RegisterUsers = nameof(RegisterUsers);
                public const string UpdateEventRegistration = nameof(UpdateEventRegistration);
                public const string UpdateEventRegistrationSchool = nameof(UpdateEventRegistrationSchool);
                public const string GetEventAttendance = nameof(GetEventAttendance);
                public const string UpdateEventAttendance = nameof(UpdateEventAttendance);
            }

            public static class FileLibrary
            {
                public const string GetFileList = nameof(GetFileList);
                public const string GetFileDetails = nameof(GetFileDetails);
                public const string GetFileAccessLog = nameof(GetFileAccessLog);
                public const string SaveFile = nameof(SaveFile);
                public const string DeleteFile = nameof(DeleteFile);
                public const string PreviewFile = nameof(PreviewFile);
            }

            public static class Personnel
            {
                public const string GetPersonnelList = nameof(GetPersonnelList);
                public const string GetPersonnelDetails = nameof(GetPersonnelDetails);
                public const string SavePersonnel = nameof(SavePersonnel);
                public const string DeletePersonnel = nameof(DeletePersonnel);
            }

            public static class UserRights
            {
                public const string GetModuleRights = nameof(GetModuleRights);
                public const string SaveUserRights = nameof(SaveUserRights);
                public const string GetUserPermissions = nameof(GetUserPermissions);
                public const string UpdateUserPermissions = nameof(UpdateUserPermissions);
            }
        }

        public static class Support
        {
            public static class SecureMessage
            {
                public const string SendMessage = nameof(SendMessage);
            }
        }

        public static class Communication
        {
            public static class Notifications
            {
                public const string GetList = nameof(GetList);
                public const string GetForm = nameof(GetForm);
                public const string SaveNotification = nameof(SaveNotification);
                public const string CancelNotification = nameof(CancelNotification);
            }

            public static class DataRequest
            {
                public const string GetCategoryList = nameof(GetCategoryList);
                public const string GetCategoryListByID = nameof(GetCategoryListByID);
                public const string InsertCategory = nameof(InsertCategory);
                public const string CancelDataRequest = nameof(CancelDataRequest);
                public const string DeleteCategory = nameof(DeleteCategory);
                public const string GetRequestList = nameof(GetRequestList);
                public const string SaveDataRequest = nameof(SaveDataRequest);
                public const string GetSubmissionList = nameof(GetSubmissionList);
                public const string GetSchoolList = nameof(GetSchoolList);
                public const string GetArchivedRequestList = nameof(GetArchivedRequestList);
                public const string GetNewDataRequestPage = nameof(GetNewDataRequestPage);
                public const string CompleteDataRequest = nameof(CompleteDataRequest);
                public const string SaveSubmissionDisposition = nameof(SaveSubmissionDisposition);
                public const string DownloadSubmissionFile = nameof(DownloadSubmissionFile);
            }
        }
    }
}