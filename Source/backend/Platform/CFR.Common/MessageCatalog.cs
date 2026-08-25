// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public enum APIHttpType
    {
        HttpGet = 1,
        HttpPost = 2,
        HttpDelete = 3,
        HttpPut = 4
    }

    public static class ErrorCodes
    {
        public const int Success = 200;
        public const int Created = 201;
        public const int Updated = 202;
        public const int Failed = 203;
        public const int NoRecordFound = 204;
        public const int Deleted = 205;
        public const int Exist = 206;
        public const int InValidToken = 207;

        public const int CustomMessage = 102;
        public const int EquipmentNameExist = 103;
        public const int RejectReasonEmpty = 105;

        public const int BadRequest = 400;
        public const int UnAuthorized = 401;
        public const int Forbidden = 403;
        public const int Authorized = 104;
        public const int RequestTimeOut = 408;
        public const int ServiceTimeout = 440;
        public const int InvalidCredentials = 422;
        public const int PreconditionFailed = 412;
        public const int MemberScheduleAlready = 100;
        public const int MemberSchedule = 101;
        public const int KHIDAlreadyExist = -98;
        public const int CaseNumberAlreadyExist = -97;
        public const int AlreadyExist = -99;
        public const int NoRowsAffected = 0;
        public const int NotExist = -1;
        public const int UserInactive = -91;
        public const int InternalServerError = 500;
        public const int UnsupportedMediaType = 415;
        public const int Conflict = 409;
        public const int NotFound = 404;
        public const int ConflictDesc = 410;
        public const int ConflictCodeDesc = 411;
        public const int AlreadyApproved = 300;
        public const int AlreadyRejected = 301;
        public const int AlreadyClosed = 302;
        public const int CodeExistsButDeactivated = 413;
        public const int CodeAndDescriptionExistButDeactivated = 414;
        public const int MealLimitExceeded = 3001;
        public const int InvalidMealType = 3002;
        public const int MealTypeAlreadyOrdered = 3003;
        public const int InsufficientWallet = 3004;
        public const int InsufficientBalance = 3005;
        public const int StaffTypeNotFound = 3006;
        public const int TransferIDNotFound = 3007;
        public const int scanMealTypeAlreadyOrdered = 208;
        public const int ItemQtyNotAvailable = 460;
        public const int RequestQtyNotAvailable = 461;
        public const int AlreadyCreated = 462;
        public const int AlreadyCancelled = 463;
        public const int RecordChanged = 464;
        public const int AlreadyPosted = 465;
        public const int ItemConsumedNotAvailable = 466;
        public const int ConsumedNotAvailable = 467;
        public const int ConcurrencyConflict = -1;
        public const int AlreadyValidated = -2;
        public const int StatusChanged = 466;
        public const int POCancelled = 476;
        public const int PSRstarted = 111;
        public const int InvalidTimeRange = 209;
    }

    public static class ErrorMessages
    {
        public const string EndOfYearGuideCopySickDaysSuccess = "Accumulated sick days copied successfully.";
        public const string EndOfYearGuideCopySickDaysFailed = "Failed to copy accumulated sick days.";
        public const string EndOfYearGuideCopyStaffSuccess = "Professional staff details copied successfully.";
        public const string EndOfYearGuideCopyStaffFailed = "Failed to copy professional staff details.";

        public const string PostSaveDynamicFormFailed = "Failed to perform post-save operations for dynamic form {FormId}.";

        public const string GetParentChildFailed = "GetParentChildAsync failed";
        public const string GetStudentActiveFormsFailed = "GetStudentActiveFormsAsync failed for student {StudentId}";
        public const string GetParentActiveFormsFailed = "GetParentActiveFormsAsync failed";

        public const string LessonPlanSelectRecipient = "Lesson Plan and recipient are required.";
        public const string LessonPlanFileRequired = "A file, Lesson Plan, and component are required.";
        public const string LessonPlanUploadSuccess = "Uploaded successfully.";
        public const string UnitPlanSelectRecipient = "Please select at least one staff recipient.";
        public const string UnitPlanSharedSuccessfully = "Shared Successfully.";
        public const string ParishNameRequired = "Parish Name is required.";
        public const string ParishDuplicate = "DUPLICATE: This parish name and city is already in your list.";
        public const string SchoolGroupExistAlready = "School group exist already.";
        public const string ContactInfoUpdateSuccess = "Contact Information Updated Successfully";
        public const string UserRightsSaveSuccess = "Saved Successfully";
        public const string UserRightsSaveFailed = "Unable to save";
        public const string UserRightsNoRecordFound = "No record found";
        public const string UserRightsStaffRequired = "Staff is Required";
        public const string AdministratorTrainingGuide = "Administrator Training Guide";
        public const string TeacherTrainingGuide = "Teacher Training Guide";
        public const string AdministratorDiscription = "The newest version of the Administrator Training Guide that was used when your school was initially trained on OptionC";
        public const string TrainingDiscription = "The newest version of the Teacher Training Guide that was used when your school was initially trained on OptionC";
        public const string ContactInfoUpdateFailed = "Failed to Update Contact Information";
        public const string LoadOnlineTrainingVideosFailed = "Failed to retrieve Online Training Videos.";
        public const string ReRegistrationSaveSuccess = "Re-registration saved successfully.";
        public const string ReRegistrationSaveFailed = "Failed to save re-registration.";
        public const string NewStudentAddSuccess = "New student added successfully.";
        public const string NewStudentAddFailed = "Failed to add new student.";
        public const string ProspectProfileSaveSuccess = "Prospect profile saved successfully.";
        public const string ProspectProfileSaveFailed = "Failed to save prospect profile.";
        public const string EnrollmentIntentionSaveSuccess = "Enrollment intention saved successfully.";
        public const string EnrollmentIntentionSaveFailed = "Failed to save enrollment intention.";
        public const string EnrollmentCompleteSuccess = "Enrollment completed successfully.";
        public const string EnrollmentCompleteFailed = "Failed to complete enrollment.";
        public const string MattMoneyWizardUpdateSuccess = "MattMoney wizard action updated successfully.";
        public const string MattMoneyWizardUpdateFailed = "Failed to update MattMoney wizard action.";
        public const string AchPaymentNotEnabled = "ACH payment is not enabled for this organization.";
        public const string InvalidAccountDetails = "Invalid account details!";
        public const string AccountCreationTechnicalFailure = "Account creation failed due to technical failure. Please re-enter the account information.";
        public const string TransactionNotFound = "Transaction not found..";
        public const string AlreadyVoidedOrRefunded = "Already Voided/Refunded processed for this transaction.";
        public const string VoidRefundNotEnabled = "Void and Refund both are not enabled for this transaction..";
        public const string ValidInputNotGiven = "Valid input not given.";
        public const string VoidDoneSuccessfully = "Void is done successfully.";
        public const string VoidNotDoneSuccessfully = "Void is not done successfully.";
        public const string RefundDoneSuccessfully = "Refund is done successfully.";
        public const string RefundNotDoneSuccessfully = "Refund is not done successfully.";
        public const string PaymentFailed = "Payment failed";
        public const string TandCUpdateSuccess = "Terms and conditions updated successfully.";
        public const string TandCUpdateFailed = "Failed to update terms and conditions.";
        public const string AccountInfoLoadSuccess = "Account information loaded successfully.";
        public const string AccountInfoLoadFailed = "Failed to load account information.";
        public const string BillingSummaryLoadSuccess = "Billing summary loaded successfully.";
        public const string BillingSummaryLoadFailed = "Failed to load billing summary.";
        public const string BillingAccessDenied = "Billing access denied.";
        public const string EnrollmentDetailsUpdateSuccess = "Enrollment details updated successfully.";
        public const string EnrollmentDetailsUpdateFailed = "Failed to update enrollment details.";
        public const string CalenderExist = "Calendar name already exists.";

        // Conduct
        public const string ConductSettingsSaveSuccess = "Your settings have been saved.";
        public const string ConductBehaviorSaveSuccess = "Your behavior has been saved.";
        public const string ConductLocationSaveSuccess = "Your location has been saved.";
        public const string ConductActionSaveSuccess = "Your action has been saved.";
        public const string StudentConductAddSuccess = "Your student conduct has been added.";
        public const string StudentConductSaveSuccess = "Your student conduct has been saved.";
        public const string StudentConductDeleteSuccess = "Your student conduct has been deleted.";
        public const string NoLunchAccount = "No accounts fall below the dynamic level set by the Administrator.";
        public const string NoFamilyVerification = "No family data verification records found.";

        public const string InvalidOrganizationId = "Invalid Organization ID.";
        public const string InvalidOrgOrUserId = "Invalid Organization ID or User ID.";
        public const string InvalidUserIdShort = "Invalid User ID.";
        public const string InvalidUserIdOnly = InvalidUserIdShort;
        public const string InvalidOrgUserOrTargetUserId = "Invalid Organization ID, User ID, or Target User ID.";
        public const string SettingsDataRequired = "Settings data is required.";

        public const string Success = "Success";
        public const string DataRetrievedSuccessfully = "Data retrieved successfully";
        public const string RemoveSuccess = "Removed Successfully.";
        public const string Restored_Success = "Restored Successfully.";
        public const string AttendanceDeleted = "Deleted Successfully.";
        public const string NoClassesSelected = "No class are selected.";
        public const string NoAssignmentSelected = "No assignments are selected.";
        public const string NoAttendanceSelected = "No attendance are selected.";
        public const string Failed = "Failed";
        public const string Exist = "Record already exists.";
        public const string ApplicationStatusExist = "Application Status exists already.";
        public const string ProspectMilestoneExist = "Prospect Milestones exists already.";
        public const string ReEnrollmentMilestoneExist = "Re-registration Milestones exists already.";
        public const string QuestionExist = "This Question already exists.";
        public const string TitleExist = "This Title already exists.";
        public const string Error = "An error occurred.";
        public const string MenuIdExist = "Menu Id already exists";
        public const string MealsExist = "Meals already exists";
        public const string LoadSchoolMealDashboardFailed = "Failed to load School Meals dashboard.";
        public const string LoadSchoolMealLookupsFailed = "Failed to load School Meals lookups.";
        public const string LoadSchoolMealSettingsFailed = "Failed to load School Meals settings.";
        public const string UpdateSchoolMealSettingsFailed = "Failed to update School Meals settings.";
        public const string LoadSchoolMealItemsFailed = "Failed to load meal items.";
        public const string LoadSchoolMealItemDetailsFailed = "Failed to load meal item details.";
        public const string SaveSchoolMealItemFailed = "Failed to save meal item.";
        public const string DeleteSchoolMealItemFailed = "Failed to delete meal item.";
        public const string LoadSchoolMealMenuFailed = "Failed to load meal menu.";
        public const string SaveSchoolMealMenuFailed = "Failed to save meal menu.";
        public const string LoadSchoolMealOrdersFailed = "Failed to load meal orders.";
        public const string SaveSchoolMealOrderFailed = "Failed to save meal order.";
        public const string LoadPrintableMealOrderFormFailed = "Failed to load printable meal order form.";
        public const string LoadSchoolMealCountFailed = "Failed to load meal count.";
        public const string LoadSchoolMealHomeroomClassFailed = "Failed to load homeroom class.";
        public const string LoadSchoolMealCountUsersFailed = "Failed to load meal count users.";
        public const string SaveSchoolMealCountUsersFailed = "Failed to save meal count users.";
        public const string DeleteSchoolMealCountUserFailed = "Failed to delete meal count user.";
        public const string SaveSchoolMealCountFailed = "Failed to save meal count.";
        public const string LoadStudentMealEligibilityFailed = "Failed to load student meal eligibility.";
        public const string SaveStudentMealEligibilityFailed = "Failed to save student meal eligibility.";
        public const string LoadSchoolMealBatchProcessHistoryFailed = "Failed to load batch process history.";
        public const string ProcessSchoolMealBatchBillingFailed = "Failed to process batch billing.";
        public const string LoadSchoolMealBatchBillingFailed = "Failed to load batch billing.";
        public const string LoadSchoolMealsDiscountStudentsFailed = "Failed to load School Meals Discount students.";
        public const string LoadSchoolMealsDiscountStudentDetailFailed = "Failed to load School Meals Discount student detail.";
        public const string UpdateSchoolMealsDiscountDetailsFailed = "Failed to update School Meals Discount details.";
        public const string LoadSchoolMealsDiscountAccountingFailed = "Failed to load School Meals Discount accounting.";
        public const string LoadSchoolMealsDiscountMealOrdersFailed = "Failed to load School Meals Discount meal orders.";
        public const string LoadSchoolMealsDiscountReportFailed = "Failed to load School Meals Discount report.";
        public const string MealItemNameRequired = "Meal item name is required.";
        public const string ReducedPriceMustNotExceedItemCost = "Reduced price must be less than or equal to item cost.";
        public const string InvalidMealItem = "Invalid meal item.";
        public const string DelinquentAmountCannotBeNegative = "Delinquent amount cannot be negative.";
        public const string SchoolMealUserRequired = "User is required.";
        public const string SchoolMealStudentRequired = "Student is required.";
        public const string InvalidSchoolMealClass = "Invalid class.";
        public const string SchoolMealClassAndUsersRequired = "Class and users are required.";
        public const string SchoolMealClassAndUserRequired = "Class and user are required.";
        public const string SchoolMealClassAndStudentListRequired = "Class and student list are required.";
        public const string StudentRequiredForMealEligibility = "At least one student is required.";
        public const string SchoolMealBatchProcessDateRequired = "Batch process date is required.";
        public const string EmailExist = "Email already exists";
        public const string UsernameExist = "Username already exists";
        public const string ListSuccess = "Success";
        public const string TemplateFileNotFound = "Template file not found";
        public const string UnknownError = "Unknown Error";
        public const string Undefined = "Undefined Message";
        public const string ListFailed = "Unable to get the record.";
        public const string EmployeeIdExist = "Employee Id already exists.";
        public const string EquipmentNameExist = "Active equipment with this name already exists. Do you want to proceed?";
        public const string TimePeriod = "A work order already exists within the selected time period. Do you want to proceed?";
        public const string WorkorderTimePeriod = "A work order already exists within the selected time period.";
        public const string WorkorderExist = "Pending work orders exist. Complete them before recalculating.";
        public const string AssessmentConfigExist = " A record with the same Duration and \r\nEffective From Date overlaps with an existing entry.";

        //Acutis ErrorMessages
        public const string CatholicContentLoadFailed = "Failed to load Catholic Content.";
        public const string CatholicContentFileNotFound = "File not found.";
        public const string ContactOptionCLoadFailed = "Failed to load Contact OptionC details.";
        public const string ContactDataMissing = "Contact data is missing.";
        public const string InvalidContactData = "Invalid contact data.";
        public const string SendMessageFailed = "Failed to send message.";
        public const string LoadResourceLibraryFailed = "Failed to retrieve Resource Library.";
        public const string LoadDocumentationLibraryFailed = "Failed to retrieve Documentation Library.";
        public const string LoadHelpModulesFailed = "Failed to retrieve help modules.";
        public const string LoadTicketConversationFailed = "Failed to retrieve ticket conversation.";
        public const string SubmitTicketReplyFailed = "Failed to submit reply.";

        public const string InvaildLogin = "Invaild Username and Password";
        public const string LoginUserNameOrTransferIdRequired = "UserName or LoginTransferId is required.";

        public const string FaqCategoryDeleteHasItems = "This category cannot be deleted while it still has FAQ items.";

        // Viper — TicketManager
        public const string ViperUserIdRequired = "ViperUserId is required.";
        public const string TicketStatusRequired = "Status is required.";
        public const string TicketDetailsNotFound = "Ticket details not found.";
        public const string FetchTicketDetailsFailed = "Failed to fetch ticket details.";
        public const string SchoolIdRequired = "SchoolId is required.";
        public const string DioceseIdRequired = "DioceseId is required.";
        public const string TicketIdRequired = "Ticket id is required.";
        public const string DocumentBasePathNotConfigured = "Document base path is not configured.";
        public const string NoFilesUploaded = "No files were uploaded.";
        public const string TicketAndCommentIdRequired = "Ticket id and comment id are required.";
        public const string CommentIdRequired = "Comment id is required.";

        // OptionC.SSO / LaunchPad
        public const string SsoEmailPasswordRequired = "Email and password are required.";
        public const string SsoForgotPasswordEmailRequired = "Email is required.";
        public const string SsoForgotPasswordInvalidEmail = "Enter a valid email address.";
        public const string SsoForgotPasswordEmailNotFound = "This email is not an active email in our system. Please try using another email address or contact your school administrator for assistance.";
        public const string SsoForgotPasswordEmailSent = "An email has been sent from noreply@optionc.com. Please check your spam/junk folder if it does not appear in your inbox.";
        public const string SsoForgotPasswordMultipleAccounts = "Your email username is associated with more than one OptionC schools. Please select the school(s) you want to reset the password.";
        public const string SsoForgotPasswordSendFailed = "Unable to send the link to your email address. Please check your email address.";
        public const string SsoForgotPasswordGenericError = "Oops, Something Went Wrong!";
        public const string SsoForgotPasswordInvalidUsername = "Sign In incorrect. Invalid Username";
        public const string SsoForgotPasswordLegacyEmailIncorrect = "EmailId is incorrect. Please contact your school.";
        public const string SsoEmailUsernameSetupSchoolRequired = "School name or school code is required.";
        public const string SsoEmailUsernameSetupUsernameRequired = "Username is required.";
        public const string SsoEmailUsernameSetupPasswordRequired = "Password is required.";
        public const string SsoEmailUsernameSetupAuthorizedRequired = "Please confirm that you are an authorized user.";
        public const string SsoEmailUsernameSetupInvalidOrganization = "Enter a valid school name or school code.";
        public const string SsoEmailUsernameSetupCredentialsInvalid = "Sign In incorrect. Please contact your school.";
        public const string SsoEmailUsernameSetupNoSignInAccess = "You do not have sign in access to OptionC.";
        public const string SsoEmailUsernameSetupAlreadyRegistered = "You have already set up your username as an email address. Please sign in using your email address.";
        public const string SsoEmailUsernameSetupVerified = "Legacy credentials verified. Continue with preferred email setup when available.";
        public const string SsoEmailUsernameSetupCredentialsNotFound = "This username, password combination is not found. Please correct or contact your school administrator.";
        public const string SsoPreferredEmailRequired = "Please enter your email username.";
        public const string SsoPreferredEmailAlreadyUsed = "This email address has already been used. Please try another.";
        public const string SsoPreferredEmailLinkExpired = "OptionC Sign In Set Up link expired.";
        public const string SsoPreferredEmailInvalidUser = "Unable to update your password, please contact your admin team.";
        public const string SsoEmailChangePasswordRequired = "Password is required.";
        public const string SsoEmailChangePasswordAlreadyUsed = "Your new password has already been used. Please use a different password.";
        public const string SsoEmailChangePasswordComplete = "Your email username conversion and password reset is complete. Please use your new email username and new password to sign in.";
        public const string SsoLogoutSuccess = "Signed out successfully.";
        public const string SsoSessionNotFound = "No active SSO session.";
        public const string SsoSessionInvalid = "SSO session is invalid or expired.";
        public const string SsoMissingUserId = "Missing userId.";
        public const string SsoMissingPreferenceId = "Missing preferenceId.";
        public const string SsoMissingSsoUserId = "Missing ssoUserId.";
        public const string SsoMissingOrganizationId = "Missing organizationId.";
        public const string SsoMissingRole = "Missing role.";
        public const string SsoMissingProductId = "Missing productId.";
        public const string SsoMissingEmail = "Missing CLogin email.";
        public const string SsoInvalidSite = "Invalid site parameter.";
        public const string SsoMissingOrgId = "Missing organization id.";
        public const string SsoLaunchTransferTokenFailed = "Unable to create launch transfer token.";
        public const string SsoPortalUrlNotConfigured = "Portal URL not configured for this preference and product.";
        public const string LaunchPadProductsContextRequired = "UserId, OrganizationId, PreferenceId, and Role are required.";
        public const string LaunchPadProductNotFound = "Product not found";
        public const string LaunchPadInvalidProductId = "Invalid productId";
        public const string LaunchPadInvalidUserId = "Invalid userId";
        public const string LaunchPadInvalidUserOrProductId = "Invalid userId or productId";
        public const string LaunchPadActivityRequestInvalid = "Invalid request. UserId and ProductId are required and must be greater than 0.";
        public const string LaunchPadJoinOrSignupInvalid = "JoinOrSignup must be 1 (Join) or 2 (Ideas).";
        public const string LaunchPadIdeasTextRequired = "Ideas text is required.";
        public const string LaunchPadIdeasTextMaxLengthFormat = "Ideas text must be {0} characters or fewer.";
        public const string LaunchPadUserOrProductNotFound = "User or product not found";
        public const string LaunchPadNoRedirectConfigured = "No redirect URL configured for this preference.";

        public const string CompanyExist = "Company Name already exists";
        public const string LaunchPadInsertedSuccessfully = "Inserted successfully.";
        public const string LaunchPadActivityExists = "Already exists.";
        public const string LaunchPadActivityForbidden = "User does not have permission.";
        public const string LaunchPadUserNotFoundRaw = "User not found.";
        public const string LaunchPadAccessDenied = "Access denied.";
        public const string LaunchPadOperationFailed = "Operation failed.";
        public const string BiopsyExist = "The Biopsy number already exists";
        public const string GstExist = "GSTIN already exists";
        public const string SenttoDeptExist = "Already Send To Department";
        public const string CancelExist = "Already Canceled";
        public const string ConfirmExist = "The records have been updated already.";
        public const string ConflictExist = "The record has been modified by another user.";
        public const string GenerateExist = "The worklist has been generated already.";

        public const string UserNameNotExists = "Username is invalid";
        public const string PasswordIncorrect = "Password is invalid";
        public const string UserNameandPasswordIncorrect = "Invalid username or password. Please try again";
        public const string InActiveUser = "Your account has been deactivated";
        public const string ExistUser = "User already exists";
        public const string SchoolEmailRequired = "SchoolEmail is required.";
        public const string OrganizationSignupSavedSuccess = "Organization signup saved successfully.";
        public const string OrganizationSignupSaveFailed = "Failed to save organization signup.";
        public const string MattMoneyNavigationLoadFailed = "Failed to load MattMoney navigation.";
        public const string MattMoneyRoleNotPermitted = "You do not have permission to Sign In to MattMoney.";
        public const string InCompleteUser = "Your account has not been completed";
        public const string InValidRoleSwitch = "Invalid Role switch has given!";
        public const string InValidCredentials = "Invalid Credentials";
        public const string NoAccess = "Access Denied for this user";

        public const string PODraftSaveSuccess = "Purchase order draft created successfully.";
        public const string POItemExists = "This item already in Purchase order.";
        public const string POtoPRQSuccess = "Purchase order returned to Purchase Requisition Successfully.";
        public const string POtoMRNSuccess = "Purchase order returned to MRN Successfully.";
        public const string POtoImplantSuccess = "Purchase order returned to Implant Successfully.";
        public const string AlreadyReturnedPOtoPRQ = "Purchase order has already been returned to Purchase Requisition. Please review the changes.";
        public const string AlreadyReturnedPOtoMRN = "Purchase order has already been returned to MRN. Please review the changes.";
        public const string AlreadyReturnedPOtoImplant = "Purchase order has already been returned to Implant. Please review the changes.";
        public const string POStatusChange = "The purchase order has already been updated. Please review the changes.";
        public const string ReturnItemStatus = "This item has already been returned.";
        public const string SaveSuccess = "Saved Successfully.";
        public const string SubmittedSuccess = "Submitted Successfully.";
        public const string UpdateSuccess = "Updated Successfully.";
        public const string StartSuccess = "Started successfully.";
        public const string StopSuccess = "Stopped successfully.";
        public const string FetchImportPageFailed = "Unable to fetch import page.";
        public const string UpdateFailed = "Unable to Updated record.";
        public const string CancelSuccess = "Cancelled successfully.";
        public const string SentforReviewSuccess = "Send for Department Review Successfully.";
        public const string ReviewSuccess = "Reviewed Successfully.";
        public const string ReviewSubmitSuccess = "Submitted for review successfully.";
        public const string UnCancelSuccess = "Uncancelled successfully.";
        public const string DuplicateSuccess = "Duplicated Successfully.";
        public const string ClonedSuccess = "Purchase order cloned successfully.";
        public const string AlreadyCloned = "Purchase order has already been cloned. Please review the changes.";
        public const string GenerateSuccess = "Generated successfully.";
        public const string AlertReviewed = "Alert reviewed successfully.";
        public const string ItemQtyNotAvailable = "Insufficient item quantity available in stock to process the return.";
        public const string ItemStockQtyNotAvailable = "Insufficient item quantity available in stock to process the transfer.";
        public const string RequestQtyNotAvailable = "The return quantity is greater than the available stock in the GRN batch.";
        public const string DNQtyNotAvailable = "The total delivery quantity exceeds the purchase order quantity.";
        public const string MRNQtyNotAvailable = "The total MRN quantity exceeds the available MRN quantity. Please review the changes.";
        public const string ConsumedNotAvailable = "Total stock has already been consumed.";
        public const string ItemConsumedNotAvailable = "Total stock is not available as expected for consumption.";
        public const string GRNCreated = "A GRN has already been created for this DN.";
        public const string MRNNotAuthorized = "This capital MRN is not fully authorized.";
        public const string AlreadyFreezed = "All negotiations are already frozen.";
        public const string NegotiationFreezed = "The negotiation has already been frozen. Please review the changes.";
        public const string RequisitionStatusChanged = "The requisition status has changed. Please review the changes.";
        public const string DraftSuccess = "Draft Created Successfully.";
        public const string SendDeptSuccess = "Send to department successfully.";

        public const string BlockSuccess = "Blocked successfully.";
        public const string UnblockSuccess = "Unblocked successfully.";

        public const string QRRegistrationAvailable = "QR registration is available.";
        public const string QRRegistrationNotAvailable = "QR registration is not available.";

        public const string ItemsImportSuccess = "Items imported successfully.";

        public const string PSRSuccess = "Physical stock reconciliation has started.";

        public const string ActiveSuccess = "Activated Successfully.";
        public const string ActiveFailed = "Activation failed.";
        public const string DeactivateSuccess = "Deactivated Successfully.";
        public const string DeactivateFailed = "Deactivation failed.";
        public const string AlertReviewFailed = "Alert review Failed.";
        public const string OrderReviewSuccess = "Order review successfully.";
        public const string UnBlacklisted = "Vendor unblacklisted successfully.";
        public const string Blacklisted = "Added to favorites.";

        public const string FavoriteAdded = "Added to favorites successfully.";

        public const string AuthorizeSuccess = "Authorized successfully.";
        public const string StatusSuccess = "Status updated success.";
        public const string SaveFailed = "Unable to save record.";
        public const string NotFound = "Record not found.";

        public const string DeleteSuccess = "Deleted Successfully.";
        public const string DeleteFailed = "Unable to delete record.";
        public const string AlreadyDeleted = "Record is already deleted.";

        public const string NoRecordFound = "No record found.";
        public const string InvalidReport = "Invalid report type.";
        public const string OrgAndUserRequired = "Organization and user are required.";
        public const string OrgUserAndFileRequired = "Organization, user, and file are required.";
        public const string FileNotFound = "File not found.";
        public const string BuildingNameRequired = "Building name is required.";
        public const string RoomNameRequired = "Room name is required.";
        public const string RoomNumberRequired = "Room number is required.";
        public const string BuildingRequired = "Building is required.";
        public const string SlotNotConfigured = "The selected doctor’s availability is not configured for the selected date and shift.";
        public const string AppointmentBooked = "Appointment has been booked successfully.";
        public const string AppointmentRescheduleBooked = "Appointment rescheduled successfully.";
        public const string AppointmentExist = "This patient have already appointment with another doctor.";
        public const string PatientNotFoundForBooking = "No patient found with this MRD number.";
        public const string IdIsNotFound = "Given id is not found.";
        public const string RecordReferred = "Record referred.";
        public const string RescheduleSameSlot = "Cannot reschedule to the same slot";
        public const string RescheduleSlotNotAvailable = "Selected time slot is not available";
        public const string RescheduleFailed = "Transaction failed while rescheduling appointment";
        public const string BookingNotFound = "Booking not found";
        public const string NewSlotNotFound = "New appointment slot not found";
        public const string OldSlotNotFound = "Old appointment slot not found";
        public const string RescheduleSameSlotFailed = "Cannot reschedule to the same time slot";
        public const string ReschedulePastTimeSlot = "Cannot reschedule to a past time slot";
        public const string PaymentSuccess = "Payment confirmed successfully.";
        public const string NoFileUpload = "No file uploaded or file is empty.";
        public const string Unsupportedfile = "Unsupported file format. Please upload a CSV or Excel file.";
        public const string InsertionFailed = "Bulk copy staging insertion failed.";

        public const string OTPSuccess = "OTP sent successfully.";
        public const string OTPFailed = "Failed to send OTP. Please try again";

        public const string InValidKey = "Invalid key";
        public const string InValidToken = "Invalid token";

        public const string InValidFileFormt = "Invalid file format. Only Excel files are allowed.";
        public const string InValidWorksheet = "The Excel file does not contain required worksheets.";
        public const string InValidHeader = "The Excel file has incorrect item headers.";
        public const string InValidData = "The Excel file does not contain any item data.";
        public const string InValidDataRow = "Invalid data in row.";
        public const string NoFileUploaded = "No file uploaded.";
        public const string NoItems = "No items to import.";
        public const string InValidExcelFormat = "Excel format is not correct";
        public const string SaintIdRequired = "SaintId is required.";

        public const string PasswordSaveSuccess = "Password Changed Successfully";
        public const string PasswordSaveFailed = "Unabel to save the password";
        public const string ChangePasswordMinLength = "Minimum number of characters is 8";
        public const string ChangePasswordRequirements = "Password does not meet requirements.";
        public const string ChangePasswordSessionInvalid = "Unable to resolve the current user session.";
        public const string ChangePasswordMismatch = "Passwords do not match.";

        public const string TemplateNotFound = "Template not found in provided path.";

        public const string ParmeterRequied = "Parameter is required";
        public const string ExpectationFailed = "Unexpected error occurred while processing the data,Please check your inputs";

        public const string BadRequest = "The request was invalid or cannot be served. The exact error should be explained in the error payload as above.";
        public const string Unauthorised = "The request requires an user authentication.";
        public const string Forbidden = "The server understood the request, but is refusing it or the access is not allowed.";
        public const string NoResourceBehindUrl = "There is no resource behind the URL.";
        public const string NotUser = "There is no User behind the User Name and Password.";
        public const string ServiceUnavailable = "Service unavailable.";
        public const string TransferSuccess = "Transferred Successfully.";
        public const string TransferMRItemsExist = "The requested items have already been moved to stock transfer. Please verify the items you have transferred.";
        public const string PurchaseRequestMRItemsExist = "The requested items have already been moved to purchase request. Please verify the items you have selected.";
        public const string StageChanged = "The requisition was already";
        public const string StockStageChanged = "The Stock Transfer was already";

        public const string ItemsAlreadyProcessed = "The selected items have already been processed.";

        public const string SubmitReviewSuccess = "Submitted for review successfully.";
        public const string SendforCorrectionSuccess = "Sent for correction successfully.";

        public const string NoBarcode = "Barcode not found, Please use current barcode";
        public const string StudentNotYetRegister = "Student not yet register for current term";
        public const string NotYetRegisterForMealsCount = "You are either not registered or it is an invalid barcode. please contact your homeroom teacher.";
        public const string GoToMealsCountPage = "Meals count is not taken for today, Do you wish to take meals count now?";

        public const string MemberScheduleAlready = "Some members are already scheduled.Are you sure you want to schedule?";
        public const string MemberSchedule = "Are you sure you want to schedule this member?";

        public const string InternalServerError = "Sorry, something went wrong on our end. We're working to fix the issue. Please try again later.";
        public const string InvalidFile = "Invalid file has been given.";
        public const string FileNotSaved = "Unable to save the file.";
        public const string MovedStock = "Moved successfully.";
        public const string MovedPurchase = "Moved successfully.";
        public const string Approved = "Approved successfully.";
        public const string AlreadyApproved = "Already Approved.";
        public const string AlreadyAuthorized = "Purchase Order has already been authorized.Please review  the changes.";
        public const string AlreadyPosted = "Purchase Order has already been Posted.Please review  the changes.";
        public const string AlreadyRecordRejected = "Purchase Order has already been rejected.Please review  the changes.";
        public const string Rejected = "Rejected successfully.";
        public const string RejectedFalid = "Rejected faild.";
        public const string AlreadyRejected = "Already Rejected.";
        public const string RecordChanges = "Purchase Order has been changed. Please review the changes.";
        public const string StatusChanged = "The purchase order status has been updated. Please review the changes.";
        public const string AlreadyCancelled = "This record has already been cancelled.Please review  the changes.";
        public const string POCancelled = "The Purchase Order has already been cancelled. Please review the changes.";
        public const string PurchaseDraftExists = "A purchase draft has already been created for one or more items. Please review the changes.";
        public const string PoMrnItemExists = "A Purchase Order has already been created for this item with the selected vendor. Please increase the quantity in the existing PO.";
        public const string ReqQtyNotAvailable = "There is no pending PO quantity for this request. Please review the changes.";
        public const string DNExists = "A Delivery Note has already been created for this Purchase Order. Please review the details.";

        public const string EmailFailed = "Failed to send email.";
        public const string PaymentLinkFailed = "Failed to send payment link.";
        public const string EmailSent = "Email sent successfully.";
        public const string SentToVendorStatus = "Status has been successfully updated to Sent to Vendor.";
        public const string PaymentLinkSent = "Payment link sent successfully.";
        public const string InvalidOTP = "Invalid OTP.";
        public const string OldPasswordIncorrect = "Old Password is incorrect";
        public const string SamePassword = "New Password is the same as the Old Password";
        public const string InvalidImage = "Invalid image file.";
        public const string OTPExpired = "OTP Expired.";
        public const string InvalidEmail = "Invalid email address.";
        public const string EmailNotFound = "Email not found.";
        public const string PatientEmailNotFound = "No email found for this patient.";
        public const string BedChanges = "Ward/bed details have changed in the database. Save operation cannot proceed.";
        public const string Posted = "Posted successfully";
        public const string WardExist = "Ward record already exist.";
        public const string WardcodeExist = "Ward code already exist.";
        public const string WardnameExist = "Ward name already exist.";
        public const string WardCodeAndNameExist = "Ward code and name already exist.";
        public const string WardRoomNoExist = "Room No cannot be the same";
        public const string WardHasBeds = "Ward has Beds in Ward rooms";
        public const string WardHasActiveBeds = "Ward has active Beds in Ward rooms";
        public const string SocialServiceRecordExists = "Category code and Category Name already exist. ";
        public const string SocialServiceCategoryCodeExists = "Category code already exists.";
        public const string SocialServiceCategoryDescriptionExists = "Category Name already exists";

        public const string AssessmentConfigurationExist = "Already Assessment duration Configuration Exist";

        public const string SentToTechnicalDepartment = "Sent to Technical Department Successfully.";
        public const string SentToDepartmentUser = "Sent to Department User Successfully.";
        public const string AssignedToPurchaseOfficer = "Assigned to Purchase Officer Successfully.";

        public const string InvalidEnumInput = "Invalid enum input.";

        public const string InvalidCredentialsForForgotPassword = "Invalid Username or Email.";
        public const string MattMoneyForgotPasswordUserNotFound =
            "The email username specified could not be found, or a valid email address is not associated.";
        public const string MattMoneyForgotPasswordSuccess =
            "Your new password has been sent to your email. Please sign in using the provided password.";
        public const string MorethanOneUser = "More than one user found for this user name.";
        public const string AdmissionNotFound = "Admission details not found!.";

        public const string AnalyteCodeAlreadyExists = "Analyte code already exists.";
        public const string NoOrderDetailsFound = "No Order Details found for that user";
        public const string PatientReviewSuccess = "Patient Reviewed successfully.";
        public const string ConferenceTimeReSelect = "Sorry, but someone else already registered for the time slot you selected. Please select a differenct time from the list.\", \"Student Profile.";
        // Documentation Library
        public const string FailedRetrieve = "Failed to retrieve Resource Library";
        // Constants for item service validation messages
        public const string ItemCodeExist = "Item already exists";

        public const string ItemDescExist = "Item description already exists";
        public const string CodeExistsButDeactivated = "Item code already exists, but the item has been deactivated.";
        public const string CodeAndDescriptionExistButDeactivated = "Item code and description already exist, but the item has been deactivated.";

        public const string ItemCodeDescExist = "Item code and description already exists";
        public const string OrderPlacedSuccessfully = "Order placed successfully.";
        public const string OrderClosedSuccessfully = "Order closed successfully.";
        public const string OrderRejected = "Order rejected successfully.";
        public const string OrderItemRejected = "Item rejected successfully.";
        public const string OrderApprovedSuccessfully = "Order approved successfully.";
        public const string OrderCancelled = "Order cancelled successfully.";
        public const string OrderNotFound = "Order does not exist.";
        public const string OrderItemNotFound = "Order item does not exist.";
        public const string AbstPanelCodeAlreadyExists = "Abst Panel code already exists.";
        public const string DietAllergyUpdate = "Diet allergy saved successfully.";
        public const string OrderDeliveredSuccessfully = "Order Delivered Successfully";
        public const string CounsellingStatusUpdate = "Counselling status updated successfully";
        public const string DeptMailNotFound = "Department person e-mail not found.Plese contact your Dietary Department.";
        public const string SpecimenNotFound = "Specimen not found or not collected.";
        public const string AlreadyAccepted = "Already Accepted Mail Request.";
        public const string RecordNotInDraft = "The record is not in draft status.";

        public const string KitchenOrderJobSuccess = "New kitchen orders processed successfully.";
        public const string KitchenOrderJobFailed = "Failed to process kitchen orders.";

        public const string MenuResetSuccess = "Menu reset successfully.";

        public const string ApproveSuccess = "Request Authorized successfully.";
        public const string ApproveExist = "Already approved this request.";
        public const string SaintDateExist = "Already exists in this post date.";
        public const string RejectSuccess = "Request rejected successfully.";
        public const string ClosedSuccess = "Request closed successfully.";
        public const string RejectExist = "Already rejected this request.";
        public const string AlreadyClosed = "This request Already closed.";
        public const string Authorized = "Authorized successfully.";
        public const string UnAuthorized = "Unauthorized successfully.";
        public const string Accepted = "Accepted successfully.";
        public const string AcceptedExist = "Request has already been accepted.";
        public const string Declined = "Declined successfully.";
        public const string DeclinedExist = "Request has already been declined.";
        public const string AlreadyTransferred = "This transfer request has already been completed or partially transferred.";
        public const string TransferLowStockError = "Transfer could not be completed due to low stock. Please verify the quantity and try again.";

        public const string PatientDependent = "The order has been successfully sent to the Kitchen for preparation.";

        public const string OrganismAlreadyExist = "Organism already exists!.";
        public const string BarcodeNumNotFound = "No Sample found for the receipt at lab with given barcode number!.";
        public const string AlreadyRecivedSampleAtLab = "This sample is already receipt at lab!.";
        public const string AlreadyRecivedSampleAtSite = "This sample is already receipt at site!.";
        public const string NotRecivedAtLab = "This sample is not receipt at lab!.";

        public const string SampleCollectSuccess = "Sample collected successfully.";
        public const string SampleCollectFailed = "Sample collection failed.";
        public const string SampleRejectSuccess = "Sample rejected successfully.";
        public const string SampleRejectFailed = "Sample rejection failed.";
        public const string TestCancelSuccess = "Test status changed successfully.";
        public const string CancelFailed = "The cancellation is failed.";
        public const string TestCancelFailed = "Test status change failed.";
        public const string ResultValidated = "Result validated successfully.";
        public const string ResultValidationFailed = "Result validation failed.";
        public const string ConfirmedSuccess = "Result confirmed successfully.";
        public const string ConfirmedFailed = "Result confirmation failed.";
        public const string AmendSucccess = "Amend saved successfully.";
        public const string AmendFailed = "Amend save failed.";
        public const string NOReturnItems = "No return items to process.";
        public const string AlreadyReturnItems = "Item already returned.";
        public const string AlacarteMeg = "Your diet has been changed successfully.The new diet will be available from the next meal, part of regular diet.Request extra food as 'à la carte', OR click 'Cancel'";
        public const string KichenOrderMeg = "Cannot proceed. Kitchen order already exists for this admission.So, Pleas place you order in the A La Carte.";
        public const string PatientsAlreadyAssigned = "Counsellor Already Assigned.";
        public const string DietCounsellorsassignedsuccessfully = "Diet Counsellors assigned successfully.";
        public const string Dietitiansassignedsuccessfully = "Dietitians assigned successfully.";
        public const string DietitiansAlreadyAssigned = "Dietitians Already Assigned.";
        public const string CounsellorsAlreadyAssigned = "Counsellors Already Assigned.";
        public const string PasswordResetFailed = "Password reset failed. Please try again.";
        public const string PinResetFailed = "Pin reset failed. Please try again.";
        public const string PasswordResetSuccess = "Password reset successfully.";
        public const string MattMoneyForgotPasswordMailSubject = "This is your new password for MattMoney LogIn";
        public const string PinResetSuccess = "Pin reset successfully.";

        public const string UserNotFound = "User Not Found";
        public const string AuthorizedSuccess = "Authorized Successfully.";
        public const string AuthorizedFailed = "Authorization Failed.";
        public const string CompletedProcess = "Authorization process has already been completed.";
        public const string AwareClassificationExistAlready = "Aware Classification Exists Already.";

        public const string RangeExist = "Already exists with same range.";
        public const string MRNInsufficient = "The MRN does not have sufficient quantity to map to the PO item.";
        public const string MRNMappedSuccessfully = "MRNs are mapped successfully.";
        public const string MRNMapFailed = "MRN Map failed.";

        public const string MealLimitExceeded = "You have already ordered two meals today.";
        public const string MealLimitExceededMessage = "Your meal limit is reached for today.";
        public const string InvalidMealType = "Invalid Meal Group: MealType not found.";
        public const string MealTypeAlreadyOrdered = "You’ve already placed an order for this meal type today. You cannot order it again.";
        public const string InsufficientWallet = "Insufficient wallet balance for the new order.";
        public const string InsufficientBalance = "You have insufficient balance to place this order. Please cancel existing orders or top up to continue.";
        public const string StaffTypeNotFound = "Staff Type Id not found for user";

        public const string NegotiationPriceRequired = "Invalid Negotiation Price. Please enter a valid price.";
        public const string workOrderPurchaseRequisitionAlreadyExists = "This Requisition was already";
        public const string OrderFailed = "Patient is already Pre-Discharged/Locked, cannot place an order.";
        public const string ActiveIconExists = "This item was already activated";
        public const string DeactiveIconExists = "This item was already deactivated";

        public const string NegotiationMappedSuccessfully = "Negotiation mapped successfully.";
        public const string NegotiationMappingFailed = "Unable to map the negotiation.";
        public const string ConsultationConfiguration = "This item cannot be deactivated ";

        public const string CodeExist = "Code already exists.";
        public const string CallAlreadyInitiated = "Calling already initiated.";
        public const string PatientNotFound = "Patient Not Found.";
        public const string TokenAlreadyCancelled = "Token Already Cancelled.";
        public const string TokenAlreadyServed = "Token Already Served.";

        public const string SlotUnavailableUpdateSuccess = "Available slots have been successfully marked as unavailable.";
        public const string SlotAvailableUpdateSuccess = "Unavailable slots have been successfully marked as available.";
        public const string SlotAvailabilityBooked = "Some of the slots are already booked and cannot be made unavailable.";
        public const string NoSlotsAvailable = "No slots are available.";
        public const string InvalidTimeRange = "Start time must be before end time.";
        public const string PatientExists = "A patient already exists with the same Mobile Number and Date of Birth.";
        public const string Available = "Slots are already available.";
        public const string AllAvailable = "No unavailable slots found to make available.";
        public const string UnAvailable = "Slots are already unavailable.";
        public const string AllUnAvailable = "No available slots found to make unavailable.";
        public const string EConsultCancelation = "eConsultation cancelled successfully.";
        public const string AttachmentAddedSuccess = "Attachments added successfully.";
        public const string AttachmentRemovedSuccess = "Attachments removed successfully.";
        public const string PaymentLinkSentSuccess = "Payment link sent to Email and SMS.";
        public const string PaymentLinkSendFailed = "Payment link failed to send!!.";
        public const string EConsultationRefundApprovedSuccess = "eConsultation refund approved successfully.";
        public const string EConsultationRefundCancelledSuccess = "eConsultation refund cancelled successfully.";
        public const string RefundInitiated = "Refund process started and waiting for approval.";
        public const string PaymentNotCaptured = "Amount not captured from client.";
        public const string RefundProcessInitiatedSuccess = "Refund process initiated successfully.";

        public const string AppointmentCancelledSuccess = "Appointment cancelled successfully.";
        public const string AppointmentCancelFailed = "Failed to cancel appointment.";
        public const string NoChangesDetected = "No Changes Found.";

        public const string VisitCancelledSuccessfully = "Visit cancelled successfully.";
        public const string VisitStatusChangedSuccessfully = "Visit status changed successfully.";
        public const string VisitRescheduledSuccessfully = "Visit rescheduled successfully.";
        public const string PatientTypeChangedSuccessfully = "Patient Type changed successfully.";
        public const string VisitCreatedSuccessfully = "Patient visit created successfully.";
        public const string NoValidRecipientIdsFound = "No valid recipient IDs found.";

        // Employee Provider specific messages
        public const string EmployeeProviderCreatedSuccess = "Employee provider created successfully.";

        public const string EmployeeProviderLoadSuccess = "Employee provider data loaded successfully.";
        public const string EmployeeProviderFetchError = "An unexpected error occurred while fetching employee provider data. Please try again later.";
        public const string EmployeeProviderSaveError = "An unexpected error occurred while saving employee provider. Please try again later.";
        public const string EmployeeProviderUpdateError = "An unexpected error occurred while updating employee provider. Please try again later.";
        public const string EmployeeProviderDeleteError = "An unexpected error occurred while deleting employee provider. Please try again later.";
        public const string EmployeeProviderFetchSupportDataError = "An unexpected error occurred while fetching support data. Please try again later.";
        public const string EmployeeProviderFetchDetailsError = "An unexpected error occurred while fetching employee provider details. Please try again later.";
        public const string EmployeeProviderFetchUserDetailsError = "An unexpected error occurred while fetching user details. Please try again later.";
        public const string EmployeeProviderFetchServiceTypesError = "An unexpected error occurred while fetching service types. Please try again later.";
        public const string EmployeeProviderUpdateStatusError = "Failed to update employee provider status.";

        // Token
        public const string InvalidDeviceConfigurationId = "Invalid device configuration ID.";

        public const string TokenDeviceNotFound = "Token device not found.";
        public const string TokenStatusQNotFound = "Token status 'Queued' not found.";
        public const string DeviceTypeNotFound = "Device type not found or not associated with this device configuration.";

        // Diocese Specific
        public const string InvalidTicketID = "Invalid Ticket ID.";
        public const string InvalidTicketIDForUpdate = "Invalid Ticket ID for update.";
        public const string InvalidUserID = "Invalid User ID. Please ensure you are logged in.";
        public const string InvalidParishID = "Invalid Parish ID. Please provide a valid ID.";
        public const string InvalidParishDataOrID = "Invalid Parish data or ID.";
        public const string InvalidDioceseIDForUpdate = "Invalid Diocese ID. A valid Diocese ID is required for updates.";
        public const string InvalidDioceseID = "Invalid Diocese ID. A valid Diocese ID is required.";
        public const string Invalidstaffid = "Invalid Staff ID. A valid ID is required for updates.";
        public const string InvalidStaffIDForUpdate = "Invalid Staff ID. A valid ID is required for updates.";
        public const string InvalidDioceseIDForComment = "Invalid Diocese ID. Diocese ID must be greater than 0.";
        public const string InvalidUserIDForComment = "Invalid User ID. Please ensure you are logged in or provide a valid ViperUserID.";

        public const string XmlReportWrapStart = "<Report>";
        public const string XmlReportWrapEnd = "</Report>";
        public const string LegacyXmlColumn = "XML_F52E2B61-18A1-11d1-B105-00805F49916B";

        public const string SessionExpired = "Session expired.";
        public const string InvalidAccount = "Your current account is not valid. Please create a new one with valid information submitted and try again.";
        public const string ApplicationFeePaid = "The Application Fee for this student is already paid for this year.";
        public const string AccountExists = "Account already exists.";
        public const string UnableToSaveSchoolAccount = "Unable to save school payment account.";
        public const string TimeoutError = "Unable to process your payment request due to transaction timeout. Please try again.";
        public const string LedgerInitFailed = "Failed to initialize payment ledger.";
        public const string LedgerUpdateFailed = "Payment processed but ledger update failed.";
        public const string ApplicationFeeAlreadyPaid = "The Application Fee for {0} is already paid for this year.";
        public const string ApplicationFeeProcessing = "The Application Fee for {0} is already in processing status.";
        public const string MattMoneySetupFailed = "MattMoney account setup of the school has failed. Please contact your school administrator.";
        public const string InvalidFuzeAccountId = "Invalid Fuze Account ID";
        public const string TechnicalFailure = "Account creation failed due to technical failure. Please re-enter the account information.";
        public const string ValidationFailed = "Credit Card validation failed. Please check your information and try again.";
        public const string UnableToSaveProcessingFee = "Unable to save processing fee payment details.";
        public const string CardHolderRequired = "Card holder name is required.";
        public const string AmexDigitLength = "Amex card number must be 15 digits.";
        public const string CardDigitLength = "Card number must be 16 digits.";
        public const string CardNumberMismatch = "Card numbers do not match.";
        public const string InvalidExpirationDate = "Invalid expiration date.";
        public const string FormNameExist = "A form with this name already exists.";
        public const string SectionRequired = "Add at least one section before continuing.";
        public const string FieldRequired = "Add at least one field to a section before continuing.";
        public const string VerifySectionsFailed = "Unable to verify sections for this form.";
        public const string VerifyFieldsFailed = "Unable to verify fields for this form.";
        public const string AutoSaveFailed = "Auto-save failed; fix form metadata and try again.";
        public const string SaveDraftFailed = "Save as draft failed.";
        public const string PublishFailed = "Publish failed.";
        public const string TermsAndConditionsUpdated = "Terms and conditions updated successfully.";
        public const string TermsAndConditionsUpdateFailed = "Failed to update terms and conditions.";
        public const string MattMoneyServerUnavailable = "MattMoney server is temporarily unavailable, Please try after sometime.";
        public const string PaymentAccountNotFound = "Payment account not found.";
        public const string UnableToSaveTransaction = "Unable to save the transaction";
        public const string MattMoneyTokenGenerationFailed = "Failed to generate token with MattMoney";
        public const string OptioncTokenGenerationFailed = "Failed to generate OptionC token with MattMoney";
        public const string ApiReturnedError = "API returned {0}";
        public const string HeaderInfoMissing = "Header information missing.";
        public const string KindlyFillAmount = "Kindly Fill the Amount";
        public const string RefundPaymentInitiated = "Refund Payment initiated successfully.";
        public const string VoidSuccess = "Void is done successfully.";
        public const string RefundSuccess = "Refund is done successfully.";
        public const string? Failure = "Failed to save Dynamic table Records ";
        public const string? AttendanceExist = "The record cannot be added because an item with that name already exists and is marked as unavailable.";
        public const string? AttendanceNameExist = "The record cannot be added because an item with that name already exists.";
        public const string? AttendanceNameCodeExist = "Name & Code already exists.";
        public const string? AttendanceUnableToSave = "Unable to save.";
        public const string? ConflictAttendence = "The record cannot be updated because an item with that name already exists.";
        public const string? ConflictAttendanceCode = "The record cannot be updated because an item with that code already exists.";
        public const string? ConflictAttendanceNameCode = "The record cannot be updated because an item with that name and code already exists.";

        // Arc Alerts
        public const string ArcAlertsInvalidFile = "Invalid file.";
        public const string ArcAlertsInvalidPhoneNumber = "Invalid phone number.";
        public const string ArcAlertsPartnerError = "Partner service returned an error.";
        public const string ArcAlertsVoiceIdFailed = "Failed to obtain voice recording ID from partner.";
        public const string ArcAlertsFileNotFound = "File not found.";
        public const string ArcAlertsExceptionFormat = "Exception: {0} | StackTrace: {1}";

        //Directories
        public const string GroupName = "Group name is required.";
        public const string SavedList = "Saved list is required.";
        public const string DistrictNameRequired = "District Name is required.";
        public const string DistrictNameDuplicate = "DUPLICATE: This district name is already in your list.";
        public const string SchoolDistrictRequired = "School District is required.";
        public const string SchoolNameRequired = "School Name is required.";
        public const string CityRequired = "City is required.";
        public const string SchoolNameDuplicate = "DUPLICATE: This school name is already in your list.";
        public const string CommentRequired = "Comment is required.";
        public const string MilestoneCompletedDateRequired = "Milestone completed date is required.";
        public const string LoadBirthdayListFailed = "Failed to load birthday list data for OrgID {OrgID}";
        public const string LoadDisabledUsersFailed = "Failed to load disabled users for OrgID {OrgID}";
        public const string LoadAccountBillingStatementFailed = "Failed to load AccountBillingStatement by {OrgID}";
        public const string LoadLunchTransactionFailed = "Failed to load LunchTransaction by {OrgID}";
        public const string LoadLunchTransactionDetailsFailed = "Failed to load LunchTransactionDetails by {OrgID}";
        public const string LoadBillingPaymentStatementFailed = "Failed to load BillingPaymentStatement by {OrgID}";
        public const string LoadBillingPaymentDetailsFailed = "Failed to load BillingPaymentDetails by {OrgID}";
        public const string LoadStudentContactListFailed = "Failed to load student contact list for OrgID {OrgID}";
        public const string LoadEmergencyContactsFailed = "Failed to load emergency contacts for OrgID {OrgID}";
        public const string LoadGradeLevelGenderEthnicityStatsFailed = "Failed to load grade level gender ethnicity stats for OrgID {OrgID}";
        public const string LoadGenderEthnicityGradeLevelCountFailed = "Failed to load gender ethnicity grade level count for OrgID {OrgID}";
        public const string LoadGenderReligionCountsFailed = "Failed to load gender religion counts for OrgID {OrgID}";
        public const string LoadGenderParishReligionCountsFailed = "Failed to load gender parish religion counts for OrgID {OrgID}";
        public const string LoadGenderSchoolDistrictReligionCountsFailed = "Failed to load gender school district religion counts for OrgID {OrgID}";
        public const string LoadHomeroomClassListFailed = "Failed to load homeroom class list for OrgID {OrgID}";
        public const string LoadNonpublicSchoolEnrollmentSummaryFailed = "Failed to load nonpublic school enrollment summary for OrgID {OrgID}";
        public const string LoadNonpublicSchoolEnrollmentDetailsFailed = "Failed to load nonpublic school enrollment details for OrgID {OrgID}";
        public const string LoadPublicSchoolListFailed = "Failed to load public school list for OrgID {OrgID}";
        public const string LoadBirthdateDiscrepanciesFailed = "Failed to load birthdate discrepancies for OrgID {OrgID}";
        public const string LoadContactsByHomeroomFailed = "Failed to load contacts by homeroom for OrgID {OrgID}";
        public const string LoadDirectoryByClassFailed = "Failed to load directory by class for OrgID {OrgID}";
        public const string LoadDirectoryByGradeLevelFailed = "Failed to load directory by grade level for OrgID {OrgID}";
        public const string LoadStudentDirectoryIIFailed = "Failed to load student directory II for OrgID {OrgID}";
        public const string LoadEthnicityListFailed = "Failed to load ethnicity list for OrgID {OrgID}";
        public const string LoadStudentIDsFailed = "Failed to load student IDs for OrgID {OrgID}";
        public const string LoadStudentParishInfoFailed = "Failed to load student parish info for OrgID {OrgID}";
        public const string LoadTopZipCodesFailed = "Failed to load top Zip codes for OrgID {OrgID}";
        public const string LoadHomeSituationStatisticsFailed = "Failed to load home situation statistics for OrgID {OrgID}";
        public const string LoadNewStudentsStatisticsFailed = "Failed to load new students statistics for OrgID {OrgID}";
        public const string LoadMailLabelsOptionsFailed = "Failed to load mail labels options for OrgID {OrgID}";
        public const string ExportLabelsFailed = "Failed to export labels for OrgID {OrgID}";
        public const string LoadVoucherGetCurrentSchoolYearIdFailed = "Failed to load current school year and month for OrgID {OrgID}";
        public const string LoadLunchParticipationRecordFailed = "Failed to load lunch participation record data for OrgID {OrgID}";
        public const string LoadNationalSchoolLunchProgramFailed = "Failed to load national school lunch program data for OrgID {OrgID}";
        public const string LoadStudentParishListFailed = "Failed to load student parish list for OrgID {OrgID}";
        public const string LoadNonPublicSchoolEnrollmentStudentsFailed = "Failed to load non-public school enrollment student data for OrgID {OrgID}";
        public const string LoadVoucherTotalsByDateRangeFailed = "Failed to load voucher totals by date range for OrgID {OrgID}";

        // MyClasses Module Status Messages
        public const string FailedToSaveAssignment = "Failed to save assignment.";
        public const string FileNoFilesUploaded = "No files uploaded.";
        public const string AllowedFileSizeWithin2MB = "Allowed file size within 2 MB.";
        public const string FileNameShouldBeWithin100Characters = "File Name should be within 100 characters.";
        public const string SettingsSaved = "Settings saved.";
        public const string LoadVoucherTotalsByMonthFailed = "Failed to load voucher totals by month for OrgID {OrgID}";
        public const string LoadSchoolYearMonthsFailed = "Failed to load school year months for OrgID {OrgID}";
        public const string LoadFloridaScholarshipsFailed = "Failed to load Florida scholarships for OrgID {OrgID}";
        public const string LoadReRegistrationFormFailed = "Failed to load re-registration form for OrgID {OrgID}";
    }

    /// <summary>
    /// Diocese portal API status messages grouped by feature area.
    /// </summary>
    public static class DioceseStatusMessages
    {
        public static class CatholicSchool
        {
            public const string InvalidRequest = ErrorMessages.BadRequest;
            public const string NotFound = ErrorMessages.NoRecordFound;
            public const string LoadFailed = ErrorMessages.InternalServerError;
        }

        public static class Profile
        {
            public const string InvalidRequest = ErrorMessages.BadRequest;
            public const string NotFound = ErrorMessages.NoRecordFound;
            public const string LoadFailed = ErrorMessages.InternalServerError;
            public const string UpdateFailed = ErrorMessages.InternalServerError;
            public const string PasswordRequired = "New Password is required.";
            public const string PasswordsDoNotMatch = "Passwords do not match.";
            public const string PasswordMinLength =
                "Please enter a new password of at least 6 characters.";
            public const string PasswordMaxLength = "Password must be 30 characters or fewer.";
            public const string PasswordChangedSuccess = "Password changed successfully.";
        }

        public const string CatholicContentLoadFailed = "Failed to load Catholic Content.";
        public const string CatholicContentFileNotFound = "Catholic Content file not found.";
    }

    public static class SerilogErrorMessages
    {
        public static class OptionCCalendar
        {
            public const string RetrieveCalendarListFailed = "Failed to retrieve calendar list for userId: {UserId}, orgId: {OrgId}";
            public const string RetrieveCalendarFailed = "Failed to retrieve calendar for calId: {CalId}";
            public const string SaveCalendarFailed = "Failed to save calendar for orgId: {OrgId}";
            public const string UpdateCalendarFailed = "Failed to update calendar for calId: {CalId}";
            public const string DeleteCalendarFailed = "Failed to delete calendar for calId: {CalId}, orgId: {OrgId}";
            public const string RetrieveCategoryListFailed = "Failed to retrieve category list for userId: {UserId}, orgId: {OrgId}";
            public const string RetrieveCategoryFailed = "Failed to retrieve category for catId: {CatId}";
            public const string SaveCategoryFailed = "Failed to save category for ownerId: {OwnerId}";
            public const string UpdateCategoryFailed = "Failed to update category for catId: {CatId}";
            public const string DeleteCategoryFailed = "Failed to delete category for catId: {CatId}";
            public const string CheckCategoryNameFailed = "Failed to check category name for categoryId: {CategoryId}";
            public const string RetrieveCategoryDropdownListFailed = "Failed to retrieve category dropdown list for userId: {UserId}";
            public const string RetrieveEventsPageDataFailed = "Failed to retrieve events page data for orgId: {OrgId}";
            public const string RetrieveEventListFailed = "Failed to retrieve event list for calId: {CalId}, userId: {UserId}";
            public const string RetrieveEventFailed = "Failed to retrieve event for eventId: {EventId}";
            public const string ListEventsForDisplayFailed = "Failed to list events for display for calId: {CalId}";
            public const string SaveEventFailed = "Failed to save event for orgId: {OrgId}, eventId: {EventId}";
            public const string AddEventCopyFailed = "Failed to add event copy for eventId: {EventId}, orgId: {OrgId}";
            public const string DeleteEventFailed = "Failed to delete event for eventId: {EventId}, orgId: {OrgId}";
            public const string DeleteRepeatingEventFailed = "Failed to delete repeating event for repeatId: {RepeatId}, orgId: {OrgId}";
            public const string SearchEventsFailed = "Failed to search events for userId: {UserId}";
            public const string DeleteEventUploadFileFailed = "Failed to delete event upload file for eventId: {EventId}";
            public const string RetrieveUserSettingsFailed = "Failed to retrieve user settings for userId: {UserId}";
            public const string UpdateUserSettingsFailed = "Failed to update user settings for userId: {UserId}";
            public const string RetrieveGroupsListFailed = "Failed to retrieve groups list for userId: {UserId}, orgId: {OrgId}";
            public const string RetrieveGroupFailed = "Failed to retrieve group for groupId: {GroupId}";
            public const string RetrieveUserDetailsForGroupFilterFailed = "Failed to retrieve user details for group filter for orgId: {OrgId}";
            public const string SaveGroupFailed = "Failed to save group for userId: {UserId}";
            public const string DeleteGroupFailed = "Failed to delete group for groupId: {GroupId}";
            public const string CheckGroupNameFailed = "Failed to check group name for groupId: {GroupId}";
            public const string ListCalendarsByGroupFailed = "Failed to list calendars by group for groupId: {GroupId}";
            public const string SaveCalendarGroupAccessFailed = "Failed to save calendar group access for groupId: {GroupId}";
            public const string DeleteCalendarGroupAccessFailed = "Failed to delete calendar group access for groupId: {GroupId}, calendarId: {CalendarId}";
            public const string SaveGroupMembersFailed = "Failed to save group members for groupId: {GroupId}";
            public const string UploadCalendarEventAttachmentFailed = "Failed to upload calendar event attachment.";
            public const string DeleteCalendarAttachmentFromDiskFailed = "Failed to delete calendar attachment from disk: {FilePath}";
        }
        public static class GradingLogMessages
        {
            public const string GetgradingFailed = "Failed to get grading details for orgId: {OrgId}, userId: {UserId}, classId: {ClassId}";
            public const string GetFinalTermGradesFailed = "Failed to get final term grades for orgId: {OrgId}, userId: {UserId}, classId: {ClassId}";
            public const string GetWeightsSummaryFailed = "Failed to get weights summary for orgId: {OrgId}, userId: {UserId}, classId: {ClassId}";
            public const string GetStudentTaskGradesFailed = "Failed to get student task grades for orgId: {OrgId}, userId: {UserId}, classId: {ClassId}, studentId: {StudentId}";
            public const string GetAssignmentGradesFailed = "Failed to get assignment grades for orgId: {OrgId}, userId: {UserId}, classId: {ClassId}, assignmentId: {AssignmentId}";

            // Scales
            public const string GetAlphaScaleGroupsFailed = "An error occurred while getting Alpha Scale Groups for orgId: {OrgId}";
            public const string InsertAlphaScaleGroupFailed = "An error occurred while inserting Alpha Scale Group for orgId: {OrgId}";
            public const string UpdateAlphaScaleGroupFailed = "An error occurred while updating Alpha Scale Group for orgId: {OrgId}";
            public const string DeleteAlphaScaleGroupFailed = "An error occurred while deleting Alpha Scale Group for orgId: {OrgId}, id: {Id}";
            public const string GetAlphaScaleGroupPropertiesFailed = "An error occurred while getting Alpha Scale Group Properties for orgId: {OrgId}, groupId: {GroupId}";
            public const string GetAlphaScaleValuePropertiesFailed = "An error occurred while getting Alpha Scale Value Properties for orgId: {OrgId}, valueId: {ValueId}";
            public const string InsertAlphaScaleValueFailed = "An error occurred while inserting Alpha Scale Value for orgId: {OrgId}";
            public const string UpdateAlphaScaleValueFailed = "An error occurred while updating Alpha Scale Value for orgId: {OrgId}";
            public const string DeleteAlphaScaleValueFailed = "An error occurred while deleting Alpha Scale Value for orgId: {OrgId}, id: {Id}";
            public const string GetCommentCodesListFailed = "An error occurred while getting Comment Codes List for orgId: {OrgId}, gradeLevelId: {GradeLevelId}";
            public const string GetGradeScalesFailed = "An error occurred while getting Grade Scales for orgId: {OrgId}";

            // Skills
            public const string GetAllSkillListFailed = "An error occurred while getting All Skill List for orgId: {OrgId}, courseId: {CourseId}";
            public const string GetSkillScalesFailed = "An error occurred while getting Skill Scales for orgId: {OrgId}";
            public const string GetSkillsforCourseGradesFailed = "An error occurred while getting Skills for Course Grades for orgId: {OrgId}, classId: {ClassId}";
            public const string UpdateSkillGradeFailed = "An error occurred while updating Skill Grade for orgId: {OrgId}";

            // Learner Behaviors
            public const string GetLearnerBehaviorsFailed = "An error occurred while getting Learner Behaviors for orgId: {OrgId}, gradeLevelId: {GradeLevelId}";
            public const string GetLearnerBehaviorScalesFailed = "An error occurred while getting Learner Behavior Scales for orgId: {OrgId}";
            public const string GetLearnerBehaviorGradingFailed = "An error occurred while getting Learner Behavior Grading for orgId: {OrgId}, classId: {ClassId}";
            public const string UpdateLearnerBehaviorGradesFailed = "An error occurred while updating Learner Behavior Grades for orgId: {OrgId}";
        }

        public static class MyMessageLogMessages
        {
            public const string GetUsersFailed = "Failed to get users for MyMessage";
            public const string GetMessagesFailed = "Failed to get messages for MyMessage";
            public const string ParseMessageXmlFailed = "Failed to parse message XML for MessageType attribute.";
            public const string LoadViewMessagesFailed = "Failed to load view messages for MyMessage";
            public const string SaveMessageFailed = "Failed to save message";
            public const string DeleteInboxFailed = "Failed to delete inbox";
            public const string DeleteArchiveFailed = "Failed to delete archive";
            public const string DeleteSentMessageFailed = "Failed to delete sent message";
            public const string FetchPrivateMessagesFailed = "Failed to fetch private messages";
        }

        public static class PaymentLogMessages
        {
            public const string detailsAsync = "Failed to fetch account details";
            public const string FetchSubscriptionAccountInfoAsync = "Failed to execute FetchSubscriptionAccountInfoAsync";
            public const string FetchAccountInfoReEnrollmentAsync = "Failed to execute FetchAccountInfoReEnrollmentAsync";
            public const string FetchAccountInfoSubscriptionsFeeAsync = "Failed to execute FetchAccountInfoSubscriptionsFeeAsync";
            public const string FetchAccountInfoByAccountTypeAsync = "Failed to execute FetchAccountInfoByAccountTypeAsync";
            public const string CheckPrimaryAccountInformationAsync = "Failed to execute CheckPrimaryAccountInformationAsync";
            public const string MMCheckPrimaryAccountInformationAsync = "Failed to execute MMCheckPrimaryAccountInformationAsync";
            public const string FetchAPIAccountInfoAsync = "Failed to execute FetchAPIAccountInfoAsync";
            public const string ConditionsAsync = "Failed to update Terms and Conditions";
            public const string infoAsync = "Failed to save account info";
            public const string MMFetchCopyAccountInfoAsync = "Failed to execute MMFetchCopyAccountInfoAsync";
            public const string MMFetchAccountInfoAsync = "Failed to execute MMFetchAccountInfoAsync";
            public const string MMFetchAccountInfoAutoPaymentAsync = "Failed to execute MMFetchAccountInfoAutoPaymentAsync";
            public const string SaveSubscriptionAccountInfoAsync = "Failed to execute SaveSubscriptionAccountInfoAsync";
            public const string SaveVVSubscriptionAccountInfoAsync = "Failed to execute SaveVVSubscriptionAccountInfoAsync";
            public const string SavePrimaryAccountInformationAsync = "Failed to execute SavePrimaryAccountInformationAsync";
            public const string MMSavePrimaryAccountInformationAsync = "Failed to execute MMSavePrimaryAccountInformationAsync";
            public const string DeleteAccountInfoAsync = "Failed to execute DeleteAccountInfoAsync";
            public const string SubscriptionDeleteAccountInfoAsync = "Failed to execute SubscriptionDeleteAccountInfoAsync";
            public const string MMDeleteAccountInfoAsync = "Failed to execute MMDeleteAccountInfoAsync";
            public const string UpdateAccountStatusAsync = "Failed to execute UpdateAccountStatusAsync";
            public const string CheckIfFamilyPrimaryAsync = "Failed to execute CheckIfFamilyPrimaryAsync";
            public const string CheckExistingAsync = "Failed to execute CheckExistingAsync";
            public const string CheckReEnrollmentDuplicateAsync = "Failed to execute CheckReEnrollmentDuplicateAsync";
            public const string CheckReSubscriptionDuplicateAsync = "Failed to execute CheckReSubscriptionDuplicateAsync";
            public const string FetchTransactionInfoAsync = "Failed to execute FetchTransactionInfoAsync";
            public const string FetchStudentTransactionInfoAsync = "Failed to execute FetchStudentTransactionInfoAsync";
            public const string FetchReportTransactionAsync = "Failed to execute FetchReportTransactionAsync";
            public const string FetchACHSettingsAsync = "Failed to execute FetchACHSettingsAsync";
            public const string CheckOrgRegisteredAsync = "Failed to execute CheckOrgRegisteredAsync";
            public const string MMAccessTokenAsync = "Failed to execute MMAccessTokenAsync";
            public const string CheckOrgExistsAsync = "Failed to execute CheckOrgExistsAsync";
            public const string FetchOrgAPIUrlAsync = "Failed to execute FetchOrgAPIUrlAsync";
            public const string FetchSubscriptionFeePageAsync = "Failed to execute FetchSubscriptionFeePageAsync";
            public const string CheckPaymentDuplicateAsync = "Failed to execute CheckPaymentDuplicateAsync";
            public const string CheckApplicationFeeExistsAsync = "Failed to execute CheckApplicationFeeExistsAsync";
            public const string CheckCCsetupFeeExistAsync = "Failed to execute CheckCCsetupFeeExistAsync";
            public const string CheckDollarOneExistsAsync = "Failed to execute CheckDollarOneExistsAsync";
            public const string CheckOnlineRegistrationFeeExistsAsync = "Failed to execute CheckOnlineRegistrationFeeExistsAsync";
            public const string SavePaymentDetailsAsync = "Failed to execute SavePaymentDetailsAsync";
            public const string SaveAccountInfoAsync = "Failed to execute SaveAccountInfoAsync";
            public const string SaveUserProfileAsync = "Failed to execute SaveUserProfileAsync";
            public const string SaveAutoWithdrawalAsync = "Failed to execute SaveAutoWithdrawalAsync";
            public const string MMSavePaymentDetailsAsync = "Failed to execute MMSavePaymentDetailsAsync";
            public const string SaveEcheckAutoPaymentAsync = "Failed to execute SaveEcheckAutoPaymentAsync";
            public const string TransactionRefundCancelAsync = "Failed to execute TransactionRefundCancelAsync";
            public const string PaymentSchedulerAsync = "Failed to execute PaymentSchedulerAsync";
            public const string SavePaymentSchedulerAsync = "Failed to execute SavePaymentSchedulerAsync";
            public const string UpdatePaymentStatusAsync = "Failed to execute UpdatePaymentStatusAsync";
            public const string SaveInvalidTokenDetailsAsync = "Failed to execute SaveInvalidTokenDetailsAsync";
            public const string SaveParentNotificationAsync = "Failed to execute SaveParentNotificationAsync";
            public const string CompleteSubmitToSchoolusingMMAsync = "Failed to execute CompleteSubmitToSchoolusingMMAsync";
            public const string SendWelcomeMailAsync = "Failed to execute SendWelcomeMailAsync";
            public const string FuzeHealthCheckFailed = "MM Fuze health check failed";
            public const string APISaveAccountDetailsFailed = "MM APISaveAccountDetails failed for AccountId {AccountId}";
            public const string APISavePaymentDetailsFailed = "MM APISavePaymentDetails failed";
            public const string APISaveOptionCAccountDetailsFailed = "MM APISaveOptionCAccountDetails failed for AccountId {AccountId}";
            public const string APIOptioncProcessingFeeFailed = "MM APIOptioncProcessingFee failed";
            public const string PaymentCancelFailed = "MM PaymentCancel failed";
            public const string OptionCProcessingFeePaymentCancelFailed = "MM OptionCProcessingFeePaymentCancel failed";
            public const string PaymentRefundFailed = "MM PaymentRefund failed";
            public const string ServiceChargeDetailsFailed = "MM ServiceChargeDetails failed";
            public const string UpdateTransactionStatusFailed = "MM UpdateTransactionStatus failed";
            public const string ServiceOperationFailed = "ACHPaymentService.{Operation} failed";
            public const string SaveServiceAccountFailed = "SaveServiceAccountAsync failed";
            public const string ProcessServiceSaleTransactionFailed = "ProcessServiceSaleTransactionAsync failed";
            public const string SaveServiceVoidRefundFailed = "SaveServiceVoidRefundAsync failed";
            public const string FetchServiceTransactionSummaryFailed = "FetchServiceTransactionSummaryAsync failed";
        }

        public static class DirectoryUploadLogMessages
        {
            public const string GetIndexStatus = "Failed to get directory upload index status for org {OrgId}";
            public const string ExportNewUsers = "Failed to export new users template for org {OrgId}";
            public const string ImportExcel = "Failed to import directory upload Excel for org {OrgId}";
            public const string GetImportedDataById = "Failed to get imported data by id {Id}";
            public const string UpdateImportedData = "Failed to update imported data for org {OrgId}";
            public const string UpdateImport = "Failed to batch update directory import for org {OrgId}";
            public const string InitiatingUpdateError = "Failed to initiate update error refresh for org {OrgId}";
            public const string UpdateStepCompletedOnUploadUtility = "Failed to update upload utility step for org {OrgId}";
            public const string UpdateDataImportConfirmationStatus = "Failed to update data import confirmation for org {OrgId}";
            public const string ValidateSingleUsername = "Failed to validate username for org {OrgId}";
            public const string ValidateFamilynameValidation = "Failed to validate family name for org {OrgId}";
            public const string GetXmlPage = "Failed to get directory upload page data";
        }

        public static class ImplementationGuideLogMessages
        {
            public const string GetSteps = "Failed to get implementation guide steps for org {OrgId}";
            public const string SentTrainingTicket = "Failed to send implementation guide training ticket for org {OrgId}";
            public const string GetGenerateClasses = "Failed to get generate classes list for org {OrgId}";
            public const string AddGenerateClasses = "Failed to insert generated classes for org {OrgId}";
            public const string FilterByGrade = "Failed to filter classes by grade for org {OrgId}";
        }

        public static class EndOfYearGuideLogMessages
        {
            public const string GetProgress = "Failed to get end of year guide progress for org {OrgId}";
            public const string GetCopyYear = "Failed to get copy year data for org {OrgId}";
            public const string AddCopyYear = "Failed to add copy year for org {OrgId}";
            public const string GetTermSummary = "Failed to get term summary for org {OrgId}";
            public const string GetRetainUsers = "Failed to get retain users for org {OrgId}";
            public const string UpdateRetainUsers = "Failed to update retain users for org {OrgId}";
            public const string GetProspects = "Failed to get prospects for org {OrgId}";
            public const string UpdateProspects = "Failed to update prospects for org {OrgId}";
            public const string CopyAccumulatedSickDays = "Failed to copy accumulated sick days for org {OrgId}";
            public const string CopyStaffWithProfessional = "Failed to copy professional staff for org {OrgId}";
        }

        public static class SMSGroupsLogMessages
        {
            public const string GetGroupList = "Failed to load group list for org {OrgId}, tab {GroupTab}";
            public const string HideUnhideGroup = "Failed to hide/unhide group {GroupId} for org {OrgId}";
            public const string GetAddGroupPage = "Failed to load add group page for org {OrgId}, group {GroupId}";
            public const string FetchGroupMembers = "Failed to fetch group members for org {OrgId}";
            public const string SaveBillingGroup = "Failed to save billing group for org {OrgId}, group {GroupId}";
            public const string GetBillingGroupMembersPage = "Failed to load billing group members page for org {OrgId}, group {GroupId}";
            public const string FetchBillingGroupMembers = "Failed to fetch billing group members for org {OrgId}";
        }

        public static class SMSParishLogMessages
        {
            public const string GetParishList = "Failed to load parish list for org {OrgId}";
            public const string SaveParish = "Failed to save parish for org {OrgId}, parish {ParishId}";
            public const string DeleteParish = "Failed to delete parish for org {OrgId}, parish {ParishId}";
            public const string GetParishStudentList = "Failed to load parish student list for org {OrgId}, parish {ParishId}";
            public const string GetManageParishList = "Failed to load manage parish list for org {OrgId}";
            public const string UpdateParishExclusions = "Failed to update parish exclusions for org {OrgId}";
            public const string GetParishInfo = "Failed to load parish info for org {OrgId}, parish {ParishId}";
        }

        public static class SMSPublicSchoolLogMessages
        {
            public const string GetPublicSchoolManager = "Failed to load public school manager for org {OrgId}";
            public const string GetSchoolDistrictDropdowns = "Failed to load school district dropdowns for org {OrgId}";
            public const string SaveNewDistrict = "Failed to save district for org {OrgId}, district {DistrictId}";
            public const string SaveNewSchool = "Failed to save school for org {OrgId}, school {SchoolId}";
            public const string GetDistrictStudentList = "Failed to load district student list for org {OrgId}, district {DistrictId}";
            public const string GetPublicSchoolStudentList = "Failed to load public school student list for org {OrgId}, school {SchoolId}";
            public const string GetManagePublicSchoolList = "Failed to load manage public school list for org {OrgId}";
            public const string UpdateDistrictInclusions = "Failed to update district inclusions for org {OrgId}";
        }

        public static class SMSMedicalProviderLogMessages
        {
            public const string GetMedicalProviderList = "Failed to load medical provider list for org {OrgId}";
            public const string GetMedicalProviderPage = "Failed to load medical provider page for org {OrgId}, provider {MedicalProviderId}";
            public const string SaveMedicalProvider = "Failed to save medical provider for org {OrgId}, provider {MedicalProviderId}";
            public const string DeleteMedicalProvider = "Failed to delete medical provider {MedicalProviderId}";
        }

        public static class SMSDailyNurseActivitiesLogMessages
        {
            public const string GetMedicationDashboard = "Failed to load medication dashboard for org {OrgId}, user {UserId}";
            public const string GetMedicationNotifications = "Failed to load medication notifications for org {OrgId}, user {UserId}";
            public const string UpdateMedicationNotification = "Failed to update medication notifications for org {OrgId}";
            public const string GetDailyMedicationLog = "Failed to load daily medication log for org {OrgId}, user {UserId}, date {Date}";
            public const string UpdateDailyMedicationLog = "Failed to update daily medication log for org {OrgId}, date {Date}";
            public const string GetGradeLevelRequirements = "Failed to load grade level immunization requirements for org {OrgId}, user {UserId}";
            public const string UpdateGradeLevelRequirements = "Failed to update grade level immunization requirements for org {OrgId}";
        }

        public static class SMSUserInformationLogMessages
        {
            public const string GetStudentDetails = "Failed to load student details for org {OrgId}, user {UserId}";
            public const string GetStaffDetails = "Failed to load staff details for org {OrgId}, user {UserId}";
            public const string GetProspectsDetails = "Failed to load prospect details for org {OrgId}, user {UserId}";
            public const string GetRelativesDetails = "Failed to load relative details for org {OrgId}, user {UserId}";
            public const string GetStudentsAlumni = "Failed to load alumni details for org {OrgId}, user {UserId}";
            public const string GetDisabledUsers = "Failed to load disabled users for org {OrgId}, user {UserId}";
            public const string GetVolunteerDetails = "Failed to load volunteer details for org {OrgId}, user {UserId}";
            public const string GetFamilyDetails = "Failed to load family details for org {OrgId}";
            public const string GetProfileDeleteInfo = "Failed to load profile delete info for org {OrgId}, target {TargetId}";
            public const string DeleteProfileUser = "Failed to delete profile user {TargetId}";
            public const string ProfileDisableUser = "Failed to disable profile user {TargetId}";
            public const string GetProfileDisableInfo = "Failed to load profile disable info for org {OrgId}, target {TargetId}";
            public const string GetStudentSchedule = "Failed to load student schedule for org {OrgId}, target {TargetId}";
            public const string GetStaffSchedule = "Failed to load staff schedule for org {OrgId}, target {TargetId}";
            public const string GenerateLoginTransfer = "Failed to generate login transfer for target user {TargetUserId}";
        }

        public static class SMSStaffDetailsLogMessages
        {
            public const string GetStaffSchoolRelated = "Failed to load staff school related for org {OrgId}, target {TargetId}";
            public const string UpdateStaffSchoolRelated = "Failed to update staff school related for target {TargetId}";
        }

        public static class SMSFamilyDetailsLogMessages
        {
            public const string GetFamilyInfo = "Failed to load family info for org {OrgId}, family {FamilyId}";
            public const string UpdateFamilyInfo = "Failed to update family info for family {FamilyId}";
            public const string GetFamilyAlerts = "Failed to load family alerts for org {OrgId}, family {FamilyId}";
            public const string UpdateFamilyAlerts = "Failed to update family alerts for family {FamilyId}";
            public const string GetFamilyPermissions = "Failed to load family permissions for org {OrgId}, family {FamilyId}";
            public const string GetFamilyRelativeUsers = "Failed to load family relative users for target family {TargetFamilyId}";
            public const string UpdateFamilyRelative = "Failed to update family relative permissions for target family {TargetFamilyId}";
        }

        public static class SMSStudentDetailsLogMessages
        {
            public const string GetAcademicSupport = "Failed to load academic support for org {OrgId}, target {TargetId}";
            public const string UpdateAcademicSupport = "Failed to update academic support for org {OrgId}, target {TargetId}";
            public const string GetStudentAdmissions = "Failed to load student admissions for org {OrgId}, target {TargetId}";
            public const string SaveStudentAdmission = "Failed to save student admission for org {OrgId}, target {TargetId}";
            public const string AddStudentAdmissionComment = "Failed to add student admission comment for org {OrgId}, target {TargetId}";
            public const string GetStudentAdmissionComments = "Failed to load student admission comments for org {OrgId}, target {TargetId}";
            public const string DeleteStudentAdmissionComment = "Failed to delete student admission comment for org {OrgId}, target {TargetId}";
            public const string UpdateStudentAdmissionMilestone = "Failed to update student admission milestone for org {OrgId}, target {TargetId}";
            public const string UpdateStudentAdmissionMilestoneDate = "Failed to update student admission milestone date for org {OrgId}, target {TargetId}";
            public const string UpdateProspectAdmissionMilestone = "Failed to update prospect admission milestone for org {OrgId}, prospect {ProspectId}";
            public const string UpdateProspectAdmissionMilestoneDate = "Failed to update prospect admission milestone date for org {OrgId}, prospect {ProspectId}";
            public const string GetStudentEmergencyContacts = "Failed to load student emergency contacts for org {OrgId}, target {TargetId}";
            public const string GetStudentEmergencyContactForm = "Failed to load student emergency contact form for org {OrgId}, target {TargetId}";
            public const string GetEditUserEmergencyContactForm = "Failed to load relational emergency contact form for org {OrgId}, target {TargetId}";
            public const string SaveStudentEmergencyContact = "Failed to save student emergency contact for org {OrgId}, target {TargetId}";
            public const string SaveStudentFamilyEmergencyContact = "Failed to save student family emergency contact for org {OrgId}, target {TargetId}";
            public const string DeleteStudentEmergencyContact = "Failed to delete student emergency contact for org {OrgId}, target {TargetId}";
            public const string DeleteStudentFamilyEmergencyContact = "Failed to delete student family emergency contact for org {OrgId}, target {TargetId}";
            public const string GetStudentDemographics = "Failed to load student demographics for org {OrgId}, target {TargetId}";
            public const string GetStudentEthnicOrigins = "Failed to load ethnic origins";
            public const string UpdateStudentDemographics = "Failed to update student demographics for org {OrgId}, target {TargetId}";
            public const string GetStudentGovernmentPrograms = "Failed to load government programs for org {OrgId}, target {TargetId}";
            public const string UpdateStudentGovernmentPrograms = "Failed to update government programs for org {OrgId}, target {TargetId}";
            public const string GetStudentSacraments = "Failed to load student sacraments for org {OrgId}, target {TargetId}";
            public const string UpdateStudentSacraments = "Failed to update student sacraments for org {OrgId}, target {TargetId}";
            public const string GetStudentSecurityProfile = "Failed to load student security profile for org {OrgId}, target {TargetId}";
            public const string UpdateStudentSecurityProfile = "Failed to update student security profile for org {OrgId}, target {TargetId}";
            public const string GetStudentHomeSituation = "Failed to load student home situation for org {OrgId}, target {TargetId}";
            public const string UpdateStudentHomeSituation = "Failed to update student home situation for org {OrgId}, target {TargetId}";
            public const string GetStudentImmunizations = "Failed to load student immunizations for org {OrgId}, target {TargetId}";
            public const string DeleteStudentImmunization = "Failed to delete student immunization for org {OrgId}, target {TargetId}";
            public const string GetStudentImmunizationForm = "Failed to load student immunization form for org {OrgId}, target {TargetId}";
            public const string SaveStudentImmunization = "Failed to save student immunization for org {OrgId}, target {TargetId}";
            public const string GetStudentImmunizationBulkForm = "Failed to load student immunization bulk form for org {OrgId}, target {TargetId}";
            public const string SaveStudentImmunizationBulk = "Failed to save student immunization bulk for org {OrgId}, target {TargetId}";
            public const string GetStudentMedicalInfo = "Failed to load student medical info for org {OrgId}, target {TargetId}";
            public const string GetMedicalProviderContact = "Failed to load medical provider contact for org {OrgId}, provider {MedicalProviderId}";
            public const string UpdateStudentMedicalProfile = "Failed to update student medical profile for org {OrgId}, target {TargetId}";
            public const string GetStudentMedications = "Failed to load student medications for org {OrgId}, target {TargetId}";
            public const string GetStudentMedicationForm = "Failed to load student medication form for org {OrgId}, target {TargetId}";
            public const string SaveStudentMedication = "Failed to save student medication for org {OrgId}, target {TargetId}";
            public const string DeleteStudentMedication = "Failed to delete student medication for org {OrgId}, target {TargetId}";
            public const string GetStudentMedicationAdministrationLog = "Failed to load student medication administration log for org {OrgId}, target {TargetId}";
            public const string GetStudentMedicationAdministrationLogForm = "Failed to load student medication administration log form for org {OrgId}, target {TargetId}";
            public const string GetStudentMedicationAdministrationLogTimes = "Failed to load medication time of day for target {TargetId}, medication {MedicationId}";
            public const string SaveStudentMedicationAdministrationLog = "Failed to save student medication administration log for org {OrgId}, target {TargetId}";
            public const string GetStudentNurseProfiles = "Failed to load student nurse profiles for org {OrgId}, target {TargetId}";
            public const string GetStudentNurseProfileForm = "Failed to load student nurse profile form for org {OrgId}, target {TargetId}";
            public const string SaveStudentNurseProfile = "Failed to save student nurse profile for org {OrgId}, target {TargetId}";
            public const string DeleteStudentNurseProfile = "Failed to delete student nurse profile for org {OrgId}, target {TargetId}";
            public const string GetStudentNurseProfileBmIPercentile = "Failed to calculate student BMI percentile for org {OrgId}, target {TargetId}";
            public const string GetStudentNurseVisits = "Failed to load student nurse visits for org {OrgId}, target {TargetId}";
            public const string GetStudentNurseVisitForm = "Failed to load student nurse visit form for org {OrgId}, target {TargetId}";
            public const string SaveStudentNurseVisit = "Failed to save student nurse visit for org {OrgId}, target {TargetId}";
            public const string DeleteStudentNurseVisit = "Failed to delete student nurse visit for org {OrgId}, target {TargetId}";
        }

        public static class LaunchPadLogMessages
        {
            public const string GetProductsAsync = "Error occurred while retrieving LaunchPad products.";
            public const string GetProductDetailAsync = "Error occurred while retrieving LaunchPad product details.";
            public const string InsertUserActivityAsync = "Error occurred while inserting user activity.";
            public const string GetJoinPrefillAsync = "Error occurred while retrieving join prefill details.";
        }

        public static class ViperLogMessages
        {
            public const string GetClassCatalogFailed = "GetClassCatalog failed for Org {OrgId}";
            public const string GetClassDirectoriesFailed = "GetClassDirectories failed for Org {OrgId}";
            public const string GetBusInformationFailed = "GetBusInformation failed for Org {OrgId}";
            public const string GetHomeroomListByClassFailed = "GetHomeroomListByClass failed for Org {OrgId}";
            public const string GetClassRegistrationCountsFailed = "GetClassRegistrationCounts failed for Org {OrgId}";
            public const string GetEnrollmentByHomeroomFailed = "GetEnrollmentByHomeroom failed for Org {OrgId}";
            public const string GetStudentsNotInHomeroomFailed = "GetStudentsNotInHomeroom failed for Org {OrgId}";
            public const string GetClassCommentsFailed = "GetClassComments failed for Org {OrgId}";
            public const string GetAvailableClassSeatsFailed = "GetAvailableClassSeats failed for Org {OrgId}";
            public const string GetUngradedAssignmentsFailed = "GetUngradedAssignments failed for Org {OrgId}";
            public const string GetFutureAssignmentsFailed = "GetFutureAssignments failed for Org {OrgId}";
            public const string GetLastTermGradeUpdateForClassesFailed = "GetLastTermGradeUpdateForClasses failed for Org {OrgId}";
            public const string GetTermGradeUpdateLogForClassFailed = "GetTermGradeUpdateLogForClass failed for Org {OrgId}";
            public const string GetGradesTermAverageFailed = "GetGradesTermAverage failed for Org {OrgId}";
            public const string GetAlumniFailed = "GetAlumni failed for Org {OrgId}";
            public const string GetStaffUsersFailed = "GetStaffUsers failed for Org {OrgId}";
            public const string GetStaffTBHistoryFailed = "GetStaffTBHistory failed for Org {OrgId}";
            public const string GetStaffSchedulesFailed = "GetStaffSchedules failed for Org {OrgId}";
            public const string GetStaffAttendanceTotalsFailed = "GetStaffAttendanceTotals failed for Org {OrgId}";
            public const string GetStaffAttendanceDetailsFailed = "GetStaffAttendanceDetails failed for Org {OrgId}";
            public const string GetStaffAttendanceTotalsByMonthFailed = "GetStaffAttendanceTotalsByMonth failed for Org {OrgId}";
            public const string GetStaffAttendanceMonthDetailsFailed = "GetStaffAttendanceMonthDetails failed for Org {OrgId}";
            public const string GetProgressReportWithAssignmentsFailed = "GetProgressReportWithAssignments failed for Org {OrgId}";
            public const string GetAssignmentGradesForStudentFailed = "GetAssignmentGradesForStudent failed for User {UserId}";
            public const string GetStudentTranscriptFailed = "GetStudentTranscript failed for Org {OrgId}";
            public const string GetSimpleProgressReportFailed = "GetSimpleProgressReport failed for Org {OrgId}";
            public const string GetSimpleProgressReportGradesFailed = "GetSimpleProgressReportGrades failed for Student {StudentId}";
            public const string GetGPAByTermFailed = "GetGPAByTerm failed for Org {OrgId}";
            public const string GetGPADashboardFailed = "GetGPADashboard failed for Org {OrgId}";
            public const string GetGPADetailsFailed = "GetGPADetails failed for Org {OrgId}";
            public const string GetStudentSchedulesWithFilterFailed = "GetStudentSchedulesWithFilter failed for Org {OrgId}";
            public const string GetStudentAveragesFailed = "GetStudentAverages failed for Org {OrgId}";
            public const string GetStudentMissingAssignmentsFailed = "GetStudentMissingAssignments failed for Org {OrgId}";
            public const string GetStudentsFailingClassesFailed = "GetStudentsFailingClasses failed for Org {OrgId}";
            public const string GetAssignmentCountsByTeacherFailed = "GetAssignmentCountsByTeacher failed for Org {OrgId}";
            public const string GetReportCardMajorSubjectsByGradeFailed = "GetReportCardMajorSubjectsByGrade failed for Org {OrgId}";
            // Organization Management
            public const string GetMattMoneySetupFailed = "GetMattMoneySetup failed for Org {OrgId}";
            public const string GetOrganizationProfileFailed = "GetOrganizationProfile failed for Org {OrgId}";
            public const string UpdateMattMoneySetupFailed = "UpdateMattMoneySetup failed for Org {OrgId}";
            public const string GetOrganizationListFailed = "GetOrganizationList failed";
            public const string GetMattMoneyNavigationFailed = "GetMattMoneyNavigation failed for User {UserId}";
            public const string GetOrganizationListV1Failed = "GetOrganizationListV1 failed for Category {Category}";
            public const string FetchTermsManagerFailed = "FetchTermsManager failed for Org {OrgId}";
            public const string FetchStudentMealsEligibilityFailed = "FetchStudentMealsEligibility failed for Org {OrgId}";
            public const string UpdateStudentMealsEligibilityFailed = "UpdateStudentMealsEligibility failed for Org {OrgId}";
            public const string UpdateLunchDiscountFailed = "UpdateLunchDiscount failed for Org {OrgId}";
            public const string UpdateOrganizationProfileFailed = "UpdateOrganizationProfile failed for Org {OrgId}";
            public const string GetSchoolInfoFailed = "GetSchoolInfo failed for Org {OrgId}";
            public const string UpdateSchoolInfoFailed = "UpdateSchoolInfo failed for Org {OrgId}";
            public const string SoldParentAlertsFailed = "SoldParentAlerts failed for Org {OrgId}";
            public const string SoldActiveSMSFailed = "SoldActiveSMS failed for Org {OrgId}";
            public const string GetSchoolCommentsFailed = "GetSchoolComments failed for Org {OrgId}";
            public const string FailedtoSaveEdfiSettings = "Failed to save Edfi settings for OrgID {OrgID}";
            public const string FailedtoGetEdfiSettings = "Failed to get Edfi settings for OrgID {OrgID}";
            public const string UpdateVincentVolunteerFailed = "Failed to update Vincent Volunteer for OrgID {OrgID}";
            public const string GetVincentVolunteerDetailsFailed = "Failed to get Vincent Volunteer details for OrgID {OrgID}";
            public const string UpdateActivatePopupsFailed = "Failed to update Activate Popups for OrgID {OrgID}";
            public const string UpdateActivateWelcomeFailed = "Failed to update Activate Welcome for OrgID {OrgID}";
            public const string GetActivateWelcomeFailed = "Failed to get Activate Welcome for OrgID {OrgID}";
            public const string ActivateHallowFailed = "Failed to activate Hallow for OrgID {OrgID}";
            public const string ActivateBetaSMSFailed = "Failed to activate Beta SMS for OrgID {OrgID}";
            public const string SaveSchoolCommentFailed = "SaveSchoolComment failed for Org {OrgId}";
            public const string GetSchoolTicketsFailed = "GetSchoolTickets failed for Org {OrgId}";
            public const string UpdateSchoolTicketFailed = "UpdateSchoolTicket failed for ID {ID}";
            public const string GetSchoolHealthFailed = "GetSchoolHealth failed for Org {OrgId}";
            public const string GetACRStaffListFailed = "GetACRStaffList failed for Org {OrgId}";
            public const string UpdateACRStaffFailed = "UpdateACRStaff failed for User {UserId}";
            public const string GetSchoolContractEndsFailed = "GetSchoolContractEnds failed";
            public const string UpdateContractEndFailed = "UpdateContractEnd failed for Org {OrgId}";
            public const string GetInvoiceHistoryFailed = "GetInvoiceHistory failed for Org {OrgId}";
            public const string UpdateInvoicePaidFailed = "UpdateInvoicePaid failed for Org {OrgId}";
            public const string GetEnrollmentByGradeLevelFailed = "GetEnrollmentByGradeLevel failed";
            public const string GetStudentsNotEnrolledInClassesFailed = "GetStudentsNotEnrolledInClasses failed";
            public const string GetInvoiceItemsFailed = "GetInvoiceItems failed";
            public const string GetInvoiceItemByIdFailed = "GetInvoiceItemById failed for ID {Id}";
            public const string SaveInvoiceItemFailed = "SaveInvoiceItem failed";
            public const string DeleteInvoiceItemFailed = "DeleteInvoiceItem failed for ID {Id}";
            public const string GetGenerateInvoiceDetailsFailed = "GetGenerateInvoiceDetails failed for Org {OrgId}";
            public const string SaveGenerateInvoiceFailed = "SaveGenerateInvoice failed";
            public const string DeleteInvoiceFailed = "DeleteInvoice failed for ID {Id}";
            public const string DeleteStaffMemberFailed = "DeleteStaffMember failed for ID {Id}";
            public const string FailedtoGetEnrollmentByGradeLevel = "\"Failed to get enrollment by grade level for OrgID: {OrgID}\"";
            public const string FailedtoGetStudentsNotEnrolledInClasses = "\"Failed to get students not enrolled in classes for OrgID: {OrgID}\"";
            public const string SaveStaffMemberFailed = "SaveStaffMember failed for ID {Id}";
            public const string GetOrganizationSupportDataFailed = "GetOrganizationSupportData failed for Org {OrgId}";
            public const string GetStaffMembersFailed = "GetStaffMembers failed for Org {OrgId}";
            public const string DeleteSchoolCommentFailed = "DeleteSchoolComment failed for Org {OrgId}";
            public const string GetAttendanceByClassFailed = "Failed to fetch attendance by class for OrgID: {OrgID}, ClassID: {ClassID}";
            public const string GetSchoolwideClassAttendanceFailed = "Failed to fetch schoolwide class attendance for OrgID: {OrgID}";
            public const string GetClassAbsenceRecordsFailed = "Failed to get class absence records for OrgID: {OrgID}";
            public const string GetStudentAbsenceDetailsFailed = "Failed to get student absence details for OrgID: {OrgID}";
            public const string GetFirstDayAttendanceByStudentFailed = "Failed to get first day attendance by student for OrgID: {OrgID}";
            public const string GetTermTardyTimeFailed = "Failed to get term tardy time for OrgID: {OrgID}";
            public const string GetClassesMissingAttendanceFailed = "Failed to get classes missing attendance for OrgID: {OrgID}";
            public const string GetMissingAttendanceForClassFailed = "Failed to get missing attendance for class for OrgID: {OrgID}";
            public const string GetIndividualClassMonthlyAttendanceFailed = "Failed to get individual class monthly attendance for OrgID: {OrgID}";
            public const string GetDailyAttendanceForYearFailed = "Failed to get daily attendance for year for OrgID: {OrgID}";
            public const string GetDailyAttendanceFailed = "Failed to get daily attendance for OrgID: {OrgID}";
            public const string GetSchoolwideAttendanceStatusFailed = "Failed to get schoolwide attendance status for OrgID: {OrgID}";
            public const string GetAttendanceTotalsByGradeLevelFailed = "Failed to load GetAttendanceTotalsByGradeLevel for OrgID: {OrgID}";
            public const string GetStudentAttendanceStatisticFailed = "Failed to load GetStudentAttendanceStatistic for OrgID: {OrgID}";
            public const string GetStudentAttendanceStatisticMonthFailed = "Failed to load GetStudentAttendanceStatisticMonth for OrgID: {OrgID}";
            public const string GetYearlyAttendanceDetailsByStudentFailed = "Failed to get yearly attendance details by student for OrgID: {OrgID}";
            public const string GetBehaviorAccessLogsFailed = "Failed to get behavior access logs for OrgID: {OrgID}";
            public const string GetInfractionCountsByDateRangeFailed = "Failed to get infraction counts by date range for OrgID: {OrgID}";
            public const string GetInfractionsByDateRangeFailed = "Failed to get infractions by date range for OrgID: {OrgID}";
            public const string GetUserconducthistoryFailed = "Failed to get user conduct history for OrgID: {OrgID}";
            public const string GetTotalTimeMissedFailed = "Failed to get total time missed for OrgID: {OrgID}";

            // Administration - Training Schedule
            public const string FetchTrainingSchedulesFailed = "Error while fetching training schedules";
            public const string FetchImportExcelDataFailed = "Error while fetching import excel data";
            public const string DownloadImportTemplateFailed = "Error while downloading import template";
            public const string CheckPendingImportFailed = "Error checking pending import";
            public const string FetchPreviewDataFailed = "Error fetching preview data";
            public const string FetchTrainingScheduleByIdFailed = "Error while fetching training schedule by id";
            public const string SaveTrainingScheduleFailed = "Error while saving training schedule";
            public const string DeleteTrainingScheduleFailed = "Error while deleting training schedule";
            public const string ImportTrainingScheduleFailed = "Error during training schedule import";
            public const string UpdateImportedTrainingSchedulesFailed = "Error while updating imported training schedules";
            public const string FinalizeImportFailed = "Error finalizing import";
            public const string BulkCopyFailed = "Error during BulkCopy for sheet: {SheetName}";

            // Administration - System Messages
            public const string FetchSystemMessagesFailed = "Error while fetching system messages";
            public const string FetchRecurringMessagesFailed = "Error while fetching recurring messages";
            public const string FetchSystemMessageByIdFailed = "Error while fetching system message by id";
            public const string SaveSystemMessageFailed = "Error while saving system message";
            public const string DeleteSystemMessageFailed = "Error while deleting system message";

            // Administration - Support Data
            public const string FetchDioceseSupportDataFailed = "Error while fetching diocese support data";
            public const string FetchPermissionSupportDataFailed = "Error while fetching permission support data";
            public const string FetchTrainingScheduleSupportDataFailed = "Error while fetching training schedule support data";
            public const string FetchOrganizationSupportDataFailed = "Error while fetching organization support data";

            // Administration - Staff Directory
            public const string FetchStaffDirectoryFailed = "Error while fetching staff directory list";
            public const string FetchStaffByIdFailed = "Error while fetching staff by id";
            public const string SaveStaffDirectoryFailed = "Error while saving staff directory";
            public const string DeleteStaffFailed = "Error while deleting staff";
            public const string ResetPasswordFailed = "Error while resetting password";

            // Administration - Sponsor Ads
            public const string FetchSponsorAdsFailed = "Error while fetching Sponsor Ads Page";
            public const string FetchSponsorAdByIdFailed = "Error while fetching Sponsor Ad details";
            public const string SaveSponsorAdFailed = "Error while saving Sponsor Ad";
            public const string DeleteSponsorAdFailed = "Error while deleting Sponsor Ad";
            public const string SaveSponsorAdImageFailed = "Image saving failed";

            // Administration - Phone/Email Lookup
            public const string FetchPhoneEmailLookupFailed = "Error while fetching phone/email address lookup";

            // Administration - Data Update
            public const string FetchSchoolWorkloadFailed = "Error while fetching school workload";

            // Administration - Data Import
            public const string FetchImportPageFailed = "Error while fetching Import Page";
            public const string FetchPhiladelphiaSchoolDetailsFailed = "Error while fetching Philadelphia School Details";
            public const string CompleteGenericImportFailed = "Error while completing generic import";
            public const string PerformExcelImportFailed = "Error while performing excel import";

            // Administration - Customer Directory
            public const string FetchCustomerDirectoriesFailed = "Error while fetching customer directories";
            public const string AddCustomerDirectoryFailed = "Error while adding customer directory list";
            public const string DeleteCustomerDirectoryFailed = "Error while deleting customer directory";

            // Administration - User Roles & Rights
            public const string FetchUserRolesFailed = "Error while fetching user roles";
            public const string FetchUserRoleByIdFailed = "Error while fetching user role by id";
            public const string SaveUserRoleFailed = "Error while saving user role";
            public const string DeleteUserRoleFailed = "Error while deleting user role";
            public const string FetchAdminMenuFailed = "Error while fetching admin menu settings";
            public const string FetchParentMenuFailed = "Error while fetching parent menu settings";
            public const string UpdateAdminMenuFailed = "Error while updating menu settings";
            public const string UpdateParentMenuFailed = "Error while updating parent menu settings";
            public const string FetchUserRightsFailed = "Error while fetching user rights";
            public const string SaveUserRightsFailed = "Error while saving user rights";
            public const string UserRoleAlreadyExists = "User role already exists";

            // Supports — Home page editor
            public const string GetHomePageEditorPageFailed = "GetHomePageEditorPageAsync failed";
            public const string GetHomePageEditorForEditFailed = "GetHomePageEditorForEditAsync failed for StartupSettingId {Id}";
            public const string CheckHomePageEditorNameFailed = "CheckHomePageEditorNameAsync failed";
            public const string DeleteHomePageEditorFailed = "DeleteHomePageEditorAsync failed for StartupSettingId {Id}";
            public const string SaveHomePageEditorFailed = "SaveHomePageEditorAsync failed";
            public const string UploadHomePageEditorFilesFailed = "UploadHomePageEditorFilesAsync failed";
            public const string SaveHomePageEditorCsgMessageFailed = "SaveHomePageEditorCsgMessageAsync failed for StartupSettingId {Id}";
            public const string SaveHomePageEditorBodyImageFailed = "SaveHomePageEditor body image file failed";
            public const string SaveHomePageEditorMobileImageFailed = "SaveHomePageEditor mobile image file failed";

            // Supports — Catholic content
            public const string GetCatholicContentGridFailed = "GetCatholicContentGridAsync failed";
            public const string DeleteCatholicContentFailed = "DeleteCatholicContentAsync failed";
            public const string GetCatholicContentDocumentLinkFailed = "GetCatholicContentDocumentLinkAsync failed";
            public const string GetCatholicContentFileNameFailed = "GetCatholicContentFileNameAsync failed";
            public const string SearchCatholicContentTagsFailed = "SearchCatholicContentTagsAsync failed";
            public const string SetCatholicContentActiveFailed = "SetCatholicContentActiveAsync failed";
            public const string GetCatholicContentEditFailed = "GetCatholicContentEditAsync failed";
            public const string SaveCatholicContentFailed = "SaveCatholicContentAsync failed";
            public const string SaveCatholicContentTagFailed = "SaveCatholicContentTagAsync failed";

            // Supports — Resource library (documentation files)
            public const string GetResourceLibraryFailed = "GetResourceLibraryAsync failed";
            public const string GetResourceLibraryAddPageFailed = "GetResourceAddPageAsync failed";
            public const string GetResourceLibraryForEditFailed = "GetResourceForEditAsync failed for DocumentId {DocumentId}";
            public const string SaveResourceLibraryFailed = "SaveDocumentationAsync failed for DocumentId {DocumentId}";
            public const string DeleteResourceLibraryFailed = "DeleteDocumentationAsync failed for DocumentId {DocumentId}";
            public const string SaveResourceLibrarySeriesNameFailed = "SaveSeriesNameAsync failed";
            public const string ResourceTitleFailed = "CheckResourceAsync failed for Title {Title}";
            public const string GetResourceLibrarySeriesSequenceFailed = "GetSeriesSequenceAsync failed for SeriesId {SeriesId}";
            public const string SyncNextGenResourceLibraryFileFailed = "SyncNextGenDocumentationFileAsync failed for file {FileName}";

            // Supports — Sign-in page settings (images / prayer)
            public const string GetSignInPageImagesFailed = "GetSignInPageImagesAsync failed";
            public const string GetSignInPagePrayerFailed = "GetSignInPagePrayerAsync failed";
            public const string GetSignInImageForEditFailed = "GetSignInImageForEditAsync failed for ImageId {ImageId}";
            public const string CheckSignInImageDateFailed = "CheckSignInImageDateAsync failed";
            public const string SaveSignInImageFailed = "SaveSignInImageAsync failed for ImageId {ImageId}";
            public const string DeleteSignInImageFailed = "DeleteSignInImageAsync failed for ImageId {ImageId}";
            public const string GetSignInPrayerForEditFailed = "GetSignInPrayerForEditAsync failed for PrayerId {PrayerId}";
            public const string CheckSignInPrayerDateFailed = "CheckSignInPrayerDateAsync failed";
            public const string SaveSignInPrayerFailed = "SaveSignInPrayerAsync failed for PrayerId {PrayerId}";
            public const string DeleteSignInPrayerFailed = "DeleteSignInPrayerAsync failed for PrayerId {PrayerId}";

            // Supports — Help / usage
            public const string GetMissingHelpLinksFailed = "GetMissingHelpLinksAsync failed";
            public const string GetHelpUsageFailed = "GetHelpUsageAsync failed";
            public const string GetHelpUsageHitsFailed = "GetHelpUsageHitsAsync failed";
            public const string GetRenaissanceExportFailed = "GetRenaissanceAsync failed";
            public const string GetMobileAppSubscriptionFailed = "GetMobileAppSubscriptionAsync failed";

            // System alert
            public const string HighGroundRefreshFailed = "HighGround refresh failed for MessageID {MessageId}";
            public const string GetAlertStatusReportFailed = "GetAlertStatusReport failed for TypeId {TypeId}";
            public const string GetAlertErrorsDetailsFailed = "GetAlertErrorsDetails (admin_getFailures) failed";
            public const string GetAlertErrorByOrgAndMessageFailed = "GetAlertErrorByOrgIdAndMessageId failed";
            public const string GetEditAlertErrorDetailsFailed = "GetEditAlertErrorDetails (JobListing_Crud read) failed";
            public const string UpdateAlertErrorDetailsFailed = "UpdateAlertErrorDetails (JobListing_Crud update) failed";
            public const string GetAlertStatusFailed = "GetAlertStatus failed for MessageID {MessageId}";
            public const string GetPasStatisticsFailed = "GetPasStatistics (GetPASStatistic) failed";
            public const string GetAlertUpcomingListFailed = "GetAlertUpcomingList (admin_getUpcomingAlerts) failed";
            public const string GetOnHoldAlertsFailed = "GetOnHoldAlerts (admin_getHoldProcessstatus) failed";
            public const string GetAlertSentListFailed = "GetAlertSentList (admin_getRecentlySent) failed";
            public const string GetErrorListFailed = "GetErrorList (Error_getErrorList) failed for Type {Type}";
            public const string DeleteErrorFailed = "DeleteError (Error_deleteError) failed for ErrorId {ErrorId}";
            public const string GetAlertHealthCheckFailed = "GetAlertHealthCheck (GetAlertsforHealthCheck) failed";
            public const string GetBouncedListFailed = "GetBouncedList failed for MessageId {MessageId}";
            public const string GetSystemTraceLogFailed = "GetSystemTraceLog (sp_SystemTraceLog) failed";
            public const string GetSmsActiveUsersFailed = "GetSmsActiveUsers (GetSMSActiveUser) failed";
            public const string GetUserStatisticsFailed = "GetUserStatistics failed";
            public const string GetLoginCountsFailed = "GetLoginCounts (getLoginCountsBySchool_New) failed";
            public const string GetLoginCountHistoryFailed = "GetLoginCountHistory (LoginHistoryReports) failed";
            public const string GetEdFiDataFailed = "GetEdFiData failed";
            public const string GetDynamicReportFailed = "GetDynamicReport (GetDynamicReport) failed";

            // Tickets
            public const string GetNewTicketPageFailed = "GetNewTicketPageAsync failed";
            public const string GetTicketListPageFailed = "GetTicketListPageAsync failed";
            public const string GetDashboardTicketCountsFailed = "GetDashboardTicketCountsAsync failed";
            public const string GetTicketDashboardFailed = "GetTicketDashboardAsync failed";
            public const string GetTicketStatisticsFailed = "GetTicketStatisticsAsync failed";
            public const string GetDevPilotTicketStatisticsFailed = "GetDevPilotTicketStatisticsAsync failed";
            public const string GetDevPilotTicketPageFailed = "GetDevPilotTicketPageAsync failed";
            public const string GetOrgTicketExportFailed = "GetOrgTicketExportAsync failed";
            public const string GetMemberTicketExportFailed = "GetMemberTicketExportAsync failed";
            public const string GetTicketDetailsPageFailed = "GetDetailsPageAsync failed for TicketId {TicketId}";
            public const string CopyTicketMessageAttachmentsFailed = "Failed to copy old message attachments for TicketId {TicketId}";
            public const string CopyTicketAttachmentFileFailed = "Failed to copy attachment file {FileName} to {Destination}";
            public const string SaveTicketFailed = "SaveTicketAsync failed for ViperUserId {ViperUserId}";
            public const string UpdateTicketFailed = "UpdateTicketAsync failed for TicketId {TicketId}, ViperUserId {ViperUserId}";
            public const string GetSchoolStaffListForTicketFailed = "GetSchoolStaffListAsync failed for SchoolId {SchoolId}";
            public const string GetDioceseStaffListForTicketFailed = "GetDioceseStaffListAsync failed for DioceseId {DioceseId}";
            public const string DeleteTicketFailed = "DeleteTicketAsync failed for TicketId {TicketId}";
            public const string UploadTicketAttachmentFailed = "UploadTicketAttachmentAsync failed for ViperUserId {ViperUserId}";
            public const string UploadTicketCommentFilesFailed = "UploadCommentFilesAsync failed";
            public const string FetchTicketCommentFailed = "FetchCommentAsync failed for TicketId {TicketId}, CommentId {CommentId}";
            public const string DeleteTicketCommentFailed = "DeleteCommentAsync failed for TicketId {TicketId}, CommentId {CommentId}";
            public const string MoveTicketCommentAttachmentFailed = "Failed to move comment attachment {FileName} to {Destination}";
            public const string MoveTicketAttachmentFailed = "Failed to move ticket attachment {FileName} to {Destination}";

            // Organization tools
            public const string GenerateRandomPasswordFailed = "GenerateRandomPassword failed for Org {OrgId}";
            public const string GetStaffListFailed = "GetStaffList failed";
            public const string GetSchoolStaffDetailsFailed = "GetSchoolStaffDetails failed for Staff {StaffId}";
            public const string SaveSchoolStaffFailed = "SaveSchoolStaff failed for StaffId {StaffId}";
            public const string UpdatePrincipalFailed = "UpdatePrincipal failed for Org {OrgId}";
            public const string GetSchoolStudentDetailsFailed = "GetSchoolStudentDetails failed";
            public const string GetSchoolRelativesDetailsFailed = "GetSchoolRelativesDetails failed";
            public const string GetSchoolVolunteerDetailsFailed = "GetSchoolVolunteerDetails failed";
            public const string GetSchoolDisabledDetailsFailed = "GetSchoolDisabledDetails failed";
            public const string GetSchoolHealthCheckDetailsFailed = "GetSchoolHealthCheckDetails failed";
            public const string DeleteSchoolDisabledUserFailed = "DeleteSchoolDisabledUser failed";

            // Organization — schools
            public const string FetchSchoolDetailsFailed = "Error while fetching school details";
            public const string FetchFilteredSchoolsFailed = "Error while fetching filtered schools";

            // Supports — Saint of the Day
            public const string FetchSaintOfTheDayListFailed = "Error while fetching saint of the day list";
            public const string FetchSaintDetailFailed = "Error while fetching saint detail for SaintId {SaintId}";
            public const string SaveSaintOfTheDayFailed = "Error while saving Saint of the Day";
            public const string DeleteSaintOfTheDayFailed = "Error while deleting Saint of the Day for SaintId {SaintId}";
            public const string SaveSaintImageFailed = "Saint image saving failed";

            public const string FetchSaintImageAuditFailed = "Error while fetching Saint image audit";
            public const string SaintImageBasePathNotConfigured = "Saint image base path is not configured; skipping physical persistence for saint {SaintId}";

            // Organization — class management
            public const string ListDeletedClassesFailed = "ListDeletedClasses failed for Org {OrgId}";
            public const string RestoreDeletedClassFailed = "RestoreDeletedClass failed for Org {OrgId}";
            public const string GetDeleteClassAttendanceFailed = "GetDeleteClassAttendance failed for Org {OrgId}";
            public const string UpdateDeleteClassAttendanceFailed = "UpdateDeleteClassAttendance failed for Org {OrgId}";
            public const string ListDeletedAssignmentsFailed = "ListDeletedAssignments failed for Org {OrgId}";
            public const string RestoreDeletedAssignmentFailed = "RestoreDeletedAssignment tasks failed for Org {OrgId}";
            public const string GetClassListForSchoolFailed = "GetClassListForSchool failed for Org {OrgId}";
            public const string UpdateHomeroomsFailed = "UpdateHomerooms failed for Org {OrgId}";
            public const string GetClearClassRosterFailed = "GetClearClassRoster failed for Org {OrgId}";
            public const string DeleteStudentsFromClassListFailed = "DeleteStudentsFromClassList failed for Org {OrgId}";
            public const string GetCourseStandardDetailsFailed = "GetCourseStandardDetails failed for Org {OrgId}";
            public const string FetchSkillsListFailed = "FetchSkillsList failed for Org {OrgId}";
            public const string SaveStandardGradingFailed = "SaveStandardGrading failed for Course {CourseId}";

            // Comment
            public const string FetchCommentDetailsFailed = "Error while fetching comment details";

            // Supports — FAQ
            public const string GetFaqCategoriesFailed = "GetFaqCategories failed";
            public const string DeleteFaqCategoryFailed = "DeleteFaqCategory failed";
            public const string GetFaqCategoryByIdFailed = "GetFaqCategoryById failed";
            public const string SaveAndUpdateCategoriesFailed = "SaveAndUpdateCategories failed";
            public const string GetFaqDetailsFailed = "GetFaqDetails failed";
            public const string GetFaqDetailsPageFailed = "GetFaqDetailsPage failed";
            public const string SaveFaqDetailsFailed = "SaveFaqDetails failed";
            public const string GetFaqInformationByIdFailed = "GetFaqInformationById failed";

            // Acutis authentication
            public const string ViperLoginAuthenticationFailed = "Viper login authentication failed";
            public const string StartupImagesHandlingFailed = "Error handling startup images";

            // Reports (structured Viper messages)
            public const string FetchAchActivityDataReportFailed = "Error while fetching ACH activity data report";
            public const string FetchAchDetailedDataReportFailed = "Error while fetching ACH detailed data report";
            public const string PrepareUserExportDataFailed = "Error while fetching prepare user export data";
            public const string PrepareDioceseExportDataFailed = "Error while fetching prepare diocese export data";
            public const string FetchUserEmailAddressesDataFailed = "Error while fetching user email addresses data";
            public const string FetchPasUsageReportFailed = "Error while fetching PAS usage report";
            public const string FetchMmSetupProcessReportFailed = "Error while fetching MM setup process report";
            public const string FetchOHeavenlyReportFailed = "Error while fetching OHeavenly report";
            public const string UpdateTrainingAttendanceFailed = "Error while updating training attendance";
            public const string FetchBankFundingReportFailed = "Error while fetching bank funding report";
            public const string FetchServiceFeeReportFailed = "Error while fetching service fee report";
            public const string UpdateSchoolSetupDatesFailed = "Error while updating school setup dates";
            public const string FetchGpaReportByTermFailed = "FetchGpaReportByTerm failed for Org {OrgId}";
            public const string FetchPrepareLauncherFailed = "Error occurred while executing [Reports].[PrepareLauncher] for OrgID: {OrgID}, UserID: {UserID}, ReportID: {ReportID}";
            public const string FetchPhiladelphiaEmergencyDrillFailed = "Error occurred while executing [Reports].[PhiladelphiaEmergencyDrill] for UserID: {UserID}, YearID: {SchoolYearID}";
            public const string FetchReportListPageFailed = "Error occurred while executing [School].[reports_getReportListPage] for UserID: {UserID}, CategoryID: {CategoryID}";
            public const string FetchReportLauncherPageFailed = "Error occurred while loading report launcher dropdown data for UserID: {UserID}, SchoolYearID: {SchoolYearID}";
            public const string FetchAdHocPageFailed = "Error occurred while executing [School].[reports_getAdHocPage] for UserID: {UserID}, ReportID: {ReportID}, Type: {Type}";
            public const string FetchAdHocStudentResultsPageFailed = "Error occurred while executing [School].[reports_getAdHocStudentResultsPage] for UserID: {UserID}";
            public const string FetchAdHocParentResultsPageFailed = "Error occurred while executing [School].[reports_getAdHocParentResultsPage] for UserID: {UserID}";
            public const string FetchAdHocStaffResultsPageFailed = "Error occurred while executing [School].[reports_getAdHocStaffResultsPage] for UserID: {UserID}";
            public const string FetchAdHocRefreshDataFailed = "Failed to fetch adhoc refresh data for UserID {UserID} and ReportType {ReportType}";
            public const string SaveAdHocReportFailed = "Error occurred while executing [School].[reports_insertUpdateAdHocReport] for UserID: {UserID}, AdHocReportID: {AdHocReportID}";
            public const string DeleteAdHocReportFailed = "Error occurred while executing [School].[reports_deleteAdHocReport] for UserID: {UserID}, AdHocReportID: {AdHocReportID}";
            //Data Import
            public const string PhiladelphiaImportFailed = "Error during Philadelphia  import for school {SchoolId}";
            public const string SheetProcessingFailed = "Failed to process sheet {SheetName} for target table {TargetTable} for school {SchoolId}";
            public const string GenericImportFailed = "Error during generic data import for school {SchoolId}";
            public const string UpdateImportedDataFailed = "Error while updating imported data for school {SchoolId}";
            public const string GetImportedDataRecordByIdFailed = "Error while fetching imported data record by ID: {Id}";
            public const string GenericImportSheetProcessingFailed = "Failed to process sheet for target table {TargetTable} for school {SchoolId}";
            public const string PartnerStatusHttpPostFailed = "Partner status HTTP POST failed for bounced list MessageID={MessageId}";
            public const string DeserializeStatusDetailXmlFailed = "Failed to deserialize transaction status XML for bounced list";

            // Grading (Alpha Scales)
            public const string GetAlphaScalesGroupsFailed = "GetAlphaScalesGroups failed for Org {OrgId}";
            public const string SaveAlphaScaleGroupFailed = "SaveAlphaScaleGroup failed for Org {OrgId}";
            public const string DeleteAlphaScaleGroupFailed = "DeleteAlphaScaleGroup failed for ID {Id}";
            public const string GetAlphaScaleGroupPropertiesFailed = "GetAlphaScaleGroupProperties failed for Org {OrgId}, ID {Id}";
            public const string SaveAlphaScaleValueFailed = "SaveAlphaScaleValue failed for Org {OrgId}, Group {GroupId}";
            public const string DeleteAlphaScaleValueFailed = "DeleteAlphaScaleValue failed for ID {Id}";
        }
        public static class ActiveReportsLogMessages
        {
            public const string GetPrepareMailingLabelsFailed = "An error occurred while getting prepare mailing labels";
            public const string GetBasicHomeroomReportFailed = "An error occurred while getting basic homeroom report launcher";
            public const string GetBasicHomeroomReportPdfFailed = "An error occurred while getting basic homeroom report pdf data";
            public const string GetNceaLauncherFailed = "An error occurred while getting NCEA launcher";
            public const string GetStudentDirectoryPdfFailed = "An error occurred while getting student directory report";
            public const string GetFamilyDirectoryPdfFailed = "An error occurred while getting family directory report";
            public const string GetFamilyInformationPdfFailed = "An error occurred while getting family information report";
            public const string GetStaffDirectoryPdfFailed = "An error occurred while getting staff directory report";
            public const string GetStudentSchedulesPdfNewFailed = "An error occurred while getting student schedules report";
            public const string GetAccountBillingStatementsPdfFailed = "An error occurred while getting account billing statements launcher";
            public const string GetCurrentBalanceNoticesPdfFailed = "An error occurred while getting current balance notices report";
            public const string GetDelinquentAccountBalanceNoticesLauncherFailed = "An error occurred while getting delinquent account balance notices launcher";
            public const string GetDelinquentAccountBalanceNoticesPdfFailed = "An error occurred while getting delinquent account balance notices report";
            public const string GetDelinquentLunchAccountPdfFailed = "An error occurred while getting delinquent lunch account report";
            public const string GetFamilyDataVerificationPdfFailed = "An error occurred while getting family data verification report";
            public const string GetReRegFormLauncherFailed = "An error occurred while getting re-registration form launcher";
            public const string GetReRegistrationFormFailed = "An error occurred while getting re-registration form report";
            public const string SetReRegFormFeatureOptionsFailed = "An error occurred while saving re-registration form options";
            public const string GetDailyAttendanceYearSummaryLauncherFailed = "An error occurred while getting daily attendance year summary launcher";
            public const string GetDailyAttendanceYearSummaryFilteredStudentsFailed = "An error occurred while filtering students for daily attendance year summary";
            public const string GetDailyAttendanceYearSummaryReportsFailed = "An error occurred while validating daily attendance year summary report data";
            public const string GetDailyAttendanceHistoryLauncherFailed = "An error occurred while getting daily attendance history report launcher";
            public const string GetDailyAttendanceHistoryReportsFailed = "An error occurred while validating daily attendance history report data";
            public const string GetGradeReportLauncherFailed = "An error occurred while getting grade report launcher";
            public const string GetGradeReportLauncherFilteredStudentsFailed = "An error occurred while filtering students for grade report launcher";
            public const string GetProfessionalDevelopmentHistoryLauncherFailed = "An error occurred while getting professional development history launcher";
            public const string GetHighschoolPlacementCardLauncherFailed = "An error occurred while getting high school placement card launcher";
            public const string GetHighschoolPlacementCardStudentsFailed = "An error occurred while loading students for high school placement card";
            public const string GetPhillyRollSlipLauncherFailed = "An error occurred while getting Philadelphia roll slip launcher";
            public const string GetPennsylvaniaAverageDailyMembershipLauncherFailed = "An error occurred while getting Pennsylvania average daily membership launcher";
            public const string GetPittsburghFinalGradeLevelsLauncherFailed = "An error occurred while getting Pittsburgh final grade labels launcher";
            public const string GetPittsburghFinalGradeLevelsRecordsFailed = "An error occurred while validating Pittsburgh final grade labels report data";
            public const string GetPhiladelphiaEmergencyDrillReportFailed = "An error occurred while loading Philadelphia emergency drill report";
        }

        public static class SMSReportCardLogMessages
        {
            public const string EncryptValueFailed = "An error occurred in @Method while encrypting value";
            public const string GetReportCardManagerFailed = "An error occurred in @Method while getting report card manager";
            public const string GetTermsFromYearFailed = "An error occurred in @Method while getting terms from year";
            public const string GetTermInfoFailed = "An error occurred in @Method while getting term info";
            public const string GetFilteredStudentsFailed = "An error occurred in @Method while filtering students";
            public const string GenerateReportCardFailed = "An error occurred in @Method while generating report card request";
            public const string GetGenerationRequestsFailed = "An error occurred in @Method while getting generation requests";
            public const string GetReportCardSettingsFailed = "An error occurred in @Method while getting report card settings";
            public const string UpdateReportCardSettingsFailed = "An error occurred in @Method while updating report card settings";
            public const string UploadReportCardLogoFailed = "An error occurred in @Method while uploading report card logo";
            public const string GetFeatureMatrixFailed = "An error occurred in @Method while getting feature matrix";
            public const string GetGenerationTasksFailed = "An error occurred in @Method while getting generation tasks";
            public const string UpdateOnlineReportCardRequestFailed = "An error occurred in @Method while updating online report card request";
            public const string DeleteOnlineReportCardRequestFailed = "An error occurred in @Method while deleting online report card request";
            public const string GetReportCardLauncherFailed = "An error occurred in @Method while getting report card launcher";
            public const string InsertReportCardLogsFailed = "An error occurred in @Method while inserting report card logs";
            public const string GetIndividualClassAttendanceFailed = "An error occurred in @Method while getting individual class attendance";
            public const string GetCustomizeReportCardFailed = "An error occurred in @Method while getting customize report card";
            public const string ReportcardsGetFiltersFailed = "An error occurred in @Method while getting launcher filters";
            public const string ReportcardsGetTermsFailed = "An error occurred in @Method while getting launcher terms";
            public const string GetPrincipalCommentsFailed = "An error occurred in @Method while getting principal comments";
            public const string UpdatePrincipalCommentsFailed = "An error occurred in @Method while updating principal comments";
            public const string CheckReportCardDataFailed = "An error occurred in @Method while checking report card data";
        }

        public static class ComponentDataUpdateLogMessages
        {
            public const string GetIndexFailed = "An error occurred in @Method while loading Data Update Tools index";
            public const string GetAssociateStudentParishFailed = "An error occurred in @Method while loading parish association list";
            public const string SaveAssociateParishFailed = "An error occurred in @Method while saving parish association";
            public const string GetSacramentEntryFailed = "An error occurred in @Method while loading sacrament entry";
            public const string SaveSacramentEntryFailed = "An error occurred in @Method while saving sacrament entry";
            public const string GetAssociateStudentsPublicSchoolsFailed = "An error occurred in @Method while loading public school associations";
            public const string SaveStudentWithPublicSchoolsFailed = "An error occurred in @Method while saving public school associations";
            public const string GetAssociateUserReligionEthnicityFailed = "An error occurred in @Method while loading religion and ethnicity data";
            public const string SaveAssociateUserReligionEthnicityFailed = "An error occurred in @Method while saving religion and ethnicity";
            public const string GetUpdateRegistrationStatusFailed = "An error occurred in @Method while loading registration status";
            public const string SaveRegistrationStatusFailed = "An error occurred in @Method while saving registration status";
            public const string ResetRegistrationStatusFailed = "An error occurred in @Method while resetting registration status";
            public const string GetStudentTransportationSubsidiesFailed = "An error occurred in @Method while loading transportation subsidies";
            public const string UpdateStudentTransportationSubsidiesFailed = "An error occurred in @Method while updating transportation subsidies";
            public const string GetStudentVouchersFailed = "An error occurred in @Method while loading student vouchers";
            public const string SaveStudentVouchersFailed = "An error occurred in @Method while saving student vouchers";
            public const string GetEndOfYearWizardFailed = "An error occurred in @Method while loading disable users wizard";
            public const string UpdateDisabledUsersFailed = "An error occurred in @Method while updating disabled users";
            public const string GetStudentPhotoUploadTemplateFailed = "An error occurred in @Method while loading photo upload template";
            public const string GetStudentProfileSummaryFailed = "An error occurred in @Method while loading student profile summary";
            public const string GetAdminUtilityFailed = "An error occurred in @Method while loading admin email utility";
            public const string UpdateUserEmailFailed = "An error occurred in @Method while updating user email";
            public const string SaveUserEmailFailed = "An error occurred in @Method while saving user email";
            public const string GetStudentUserNameUpdateFailed = "An error occurred in @Method while loading student username update data";
            public const string UpdateStudentUserEmailFailed = "An error occurred in @Method while updating student username/email";
            public const string UploadStudentPhotoFailed = "An error occurred in @Method while uploading student photo";
            public const string GetAssociateGradeLevelsFailed = "An error occurred in @Method while loading associate grade levels";
            public const string SaveAssociateGradeLevelsFailed = "An error occurred in @Method while saving associate grade levels";
            public const string GetAssociateSectionsFailed = "An error occurred in @Method while loading associate sections";
            public const string SaveAssociateSectionsFailed = "An error occurred in @Method while saving associate sections";
            public const string GetAssociateTeachersFailed = "An error occurred in @Method while loading associate teachers";
            public const string SaveAssociateTeachersFailed = "An error occurred in @Method while saving associate teachers";
        }

        public static class ComponentStaffEvaluationsLogMessages
        {
            public const string GetStaffEvaluationListFailed = "An error occurred in @Method while loading staff evaluation list";
            public const string GetStaffEvaluationFailed = "An error occurred in @Method while loading staff evaluation details";
            public const string UpdateStaffEvaluationFailed = "An error occurred in @Method while saving staff evaluation";
            public const string GetStaffEvaluationReportPageFailed = "An error occurred in @Method while loading staff evaluation report page";
            public const string GetStaffListPageFailed = "An error occurred in @Method while loading staff list page";
        }

        public static class ComponentEdFiLogMessages
        {
            public const string GetSchoolYearsForDataTransferFailed = "An error occurred in @Method while loading Ed-Fi school years";
            public const string GetStudentsBySearchFailed = "An error occurred in @Method while searching Ed-Fi students";
            public const string GetStudentsForDataTransferFailed = "An error occurred in @Method while loading Ed-Fi students for data transfer";
            public const string SendStudentDataFailed = "An error occurred in @Method while sending Ed-Fi student data";
        }

        public static class ComponentStaffAttendanceLogMessages
        {
            public const string GetAttendanceStatusListFailed = "An error occurred in @Method while loading staff attendance status list";
            public const string GetAttendanceStatusDetailsFailed = "An error occurred in @Method while loading staff attendance status details";
            public const string SaveAttendanceStatusFailed = "An error occurred in @Method while saving staff attendance status";
            public const string DeleteAttendanceStatusFailed = "An error occurred in @Method while deleting staff attendance status";
            public const string GetStaffAttendanceForDateFailed = "An error occurred in @Method while loading staff attendance for date";
            public const string TakeStaffAttendanceFailed = "An error occurred in @Method while saving staff attendance";
            public const string GetAccumulatedSickDaysFailed = "An error occurred in @Method while loading accumulated sick days";
            public const string UpdateAccumulatedSickDaysFailed = "An error occurred in @Method while updating accumulated sick days";
        }

        public static class ComponentProfessionalDevelopmentLogMessages
        {
            public const string GetDashboardFailed = "An error occurred in @Method while loading professional development dashboard";
            public const string RegisterForEventFailed = "An error occurred in @Method while registering for a professional development event";
            public const string UnregisterFromEventFailed = "An error occurred in @Method while unregistering from a professional development event";
            public const string GetTrainingEventDetailsFailed = "An error occurred in @Method while loading professional development event details";
            public const string GetMyHistoryFailed = "An error occurred in @Method while loading professional development history";
            public const string GetSchoolHistoryFailed = "An error occurred in @Method while loading school professional development history";
            public const string GetVerifyEventsFailed = "An error occurred in @Method while loading verify events page";
            public const string GetSchoolTrainingEventsFailed = "An error occurred in @Method while loading school training events";
            public const string GetNewHistoricalEventFailed = "An error occurred in @Method while loading new historical event page";
            public const string SaveHistoricalEventFailed = "An error occurred in @Method while saving historical event";
            public const string SaveTrainingEventFailed = "An error occurred in @Method while saving training event";
            public const string GetSettingsFailed = "An error occurred in @Method while loading professional development settings";
            public const string SaveSettingsFailed = "An error occurred in @Method while saving professional development settings";
            public const string GetLoginUserPermissionsFailed = "An error occurred in @Method while loading login user permissions";
            public const string VerifyEventFailed = "An error occurred in @Method while verifying historical event";
        }

        public static class ComponentSchoolSettingsLogMessages
        {
            public const string GetContactInformationFailed = "An error occurred in @Method while loading school contact information";
            public const string SaveContactInformationFailed = "An error occurred in @Method while saving school contact information";
            public const string GetSessionTimeoutsFailed = "An error occurred in @Method while loading session timeouts";
            public const string SaveSessionTimeoutsFailed = "An error occurred in @Method while saving session timeouts";
            public const string GetSmsOptionsFailed = "An error occurred in @Method while loading SMS options";
            public const string SaveSmsOptionsFailed = "An error occurred in @Method while saving SMS options";
            public const string ValidateMinMaxStudentGradeLevelFailed = "An error occurred in @Method while validating student grade levels";
            public const string GetEdfiKeysFailed = "An error occurred in @Method while loading Ed-Fi keys";
            public const string GetFamilyLoginSettingsFailed = "An error occurred in @Method while loading family login settings";
            public const string SaveFamilyLoginSettingsFailed = "An error occurred in @Method while saving family login settings";
            public const string GetNceaProfileFailed = "An error occurred in @Method while loading NCEA profile";
            public const string SaveNceaProfileFailed = "An error occurred in @Method while saving NCEA profile";
            public const string GetProgramsAndBenefitsFailed = "An error occurred in @Method while loading programs and benefits";
            public const string SaveProgramsAndBenefitsFailed = "An error occurred in @Method while saving programs and benefits";
            public const string GetSchoolBudgetFailed = "An error occurred in @Method while loading school budget";
            public const string SaveSchoolBudgetFailed = "An error occurred in @Method while saving school budget";
        }

        public static class ComponentTerraNovaLogMessages
        {
            public const string GetTerraNovaDetailsFailed = "An error occurred in @Method while loading Terra Nova import details";
            public const string UploadTerraNovaDataFailed = "An error occurred in @Method while uploading Terra Nova score data";
            public const string InitializeTerraNovaDataImportFailed = "An error occurred in @Method while initializing Terra Nova data import";
            public const string CompleteTerraNovaDataImportFailed = "An error occurred in @Method while completing Terra Nova data import";
        }

        public static class ComponentStudentTranscriptsLogMessages
        {
            public const string GetListFailed = "An error occurred in @Method while loading student transcript list";
            public const string GetDetailsFailed = "An error occurred in @Method while loading student transcript details";
            public const string SearchStudentsFailed = "An error occurred in @Method while searching transcript students";
            public const string SaveGeneralFailed = "An error occurred in @Method while saving transcript general info";
            public const string SaveTestFailed = "An error occurred in @Method while saving transcript test score";
            public const string DeleteTestFailed = "An error occurred in @Method while deleting transcript test score";
            public const string GetBulkUpdateFailed = "An error occurred in @Method while loading transcript bulk update page";
            public const string SaveBulkUpdateFailed = "An error occurred in @Method while saving transcript bulk update";
            public const string SaveBulkFailed = "An error occurred in @Method while saving transcript bulk update";
        }

        /// <summary>
        /// Serilog message templates for school-side Diocese Data Request List operations.
        /// </summary>
        public static class ComponentDioceseDataRequestLogMessages
        {
            /// <summary>Logged when loading the data request list fails.</summary>
            public const string GetListFailed = "An error occurred in @Method while loading diocese data request list";

            /// <summary>Logged when inserting a non-file submission fails.</summary>
            public const string AddSubmissionFailed = "An error occurred in @Method while submitting diocese data request";

            /// <summary>Logged when withdrawing a submission fails.</summary>
            public const string WithdrawSubmissionFailed = "An error occurred in @Method while withdrawing diocese data request submission";

            /// <summary>Logged when uploading a submission file fails.</summary>
            public const string UploadFileFailed = "An error occurred in @Method while uploading diocese data request file";

            /// <summary>Logged when downloading a submission file fails.</summary>
            public const string DownloadFileFailed = "An error occurred in @Method while downloading diocese data request file";
        }

        /// <summary>
        /// Serilog message templates for Vincent Volunteer Management operations.
        /// </summary>
        public static class ComponentVolunteerManagementLogMessages
        {
            /// <summary>Logged when loading the volunteer dashboard fails.</summary>
            public const string GetDashboardFailed = "An error occurred in @Method while loading volunteer management dashboard";

            /// <summary>Logged when loading volunteer hours fails.</summary>
            public const string GetHoursFailed = "An error occurred in @Method while loading volunteer hours";

            /// <summary>Logged when loading a photo album by id fails.</summary>
            public const string GetAlbumByIdFailed = "An error occurred in @Method while loading volunteer photo album";

            /// <summary>Logged when saving a photo album fails.</summary>
            public const string SaveAlbumFailed = "An error occurred in @Method while saving volunteer photo album";

            /// <summary>Logged when deleting a photo album fails.</summary>
            public const string DeleteAlbumFailed = "An error occurred in @Method while deleting volunteer photo album";

            /// <summary>Logged when loading the events list fails.</summary>
            public const string GetEventsFailed = "An error occurred in @Method while loading volunteer events";

            /// <summary>Logged when loading archived events fails.</summary>
            public const string GetArchivedEventsFailed = "An error occurred in @Method while loading archived volunteer events";

            /// <summary>Logged when loading event by id fails.</summary>
            public const string GetEventByIdFailed = "An error occurred in @Method while loading volunteer event details";

            /// <summary>Logged when saving an event fails.</summary>
            public const string SaveEventFailed = "An error occurred in @Method while saving volunteer event";

            /// <summary>Logged when changing event status fails.</summary>
            public const string ChangeEventStatusFailed = "An error occurred in @Method while changing volunteer event status";

            /// <summary>Logged when archiving/unarchiving an event fails.</summary>
            public const string ChangeArchiveStatusFailed = "An error occurred in @Method while changing volunteer event archive status";

            /// <summary>Logged when deleting an event fails.</summary>
            public const string DeleteEventFailed = "An error occurred in @Method while deleting volunteer event";

            /// <summary>Logged when copying an event fails.</summary>
            public const string CopyEventFailed = "An error occurred in @Method while copying volunteer event";

            /// <summary>Logged when loading event preview fails.</summary>
            public const string ViewEventFailed = "An error occurred in @Method while loading volunteer event preview";

            /// <summary>Logged when loading the tasks list fails.</summary>
            public const string GetTasksFailed = "An error occurred in @Method while loading volunteer tasks";

            /// <summary>Logged when loading task form / by id fails.</summary>
            public const string GetTaskByIdFailed = "An error occurred in @Method while loading volunteer task details";

            /// <summary>Logged when saving a task fails.</summary>
            public const string SaveTaskFailed = "An error occurred in @Method while saving volunteer task";

            /// <summary>Logged when deleting a task fails.</summary>
            public const string DeleteTaskFailed = "An error occurred in @Method while deleting volunteer task";

            /// <summary>Logged when loading events for task requests fails.</summary>
            public const string GetEventsForTaskRequestFailed = "An error occurred in @Method while loading events for task requests";

            /// <summary>Logged when loading admin task requests fails.</summary>
            public const string GetAdminTaskRequestsFailed = "An error occurred in @Method while loading admin task requests";

            /// <summary>Logged when approving/removing task requests fails.</summary>
            public const string ApproveRemoveTaskRequestsFailed = "An error occurred in @Method while saving task request approvals";

            /// <summary>Logged when loading the admin Hours list fails.</summary>
            public const string GetHoursListFailed = "An error occurred in @Method while loading volunteer hours list";

            /// <summary>Logged when loading hours by user fails.</summary>
            public const string GetHoursByUserIdFailed = "An error occurred in @Method while loading volunteer hours by user";

            /// <summary>Logged when saving hours fails.</summary>
            public const string SaveHoursDetailsFailed = "An error occurred in @Method while saving volunteer hours";

            /// <summary>Logged when listing tasks for an event (dashboard popup) fails.</summary>
            public const string ListTasksForEventFailed = "An error occurred in @Method while listing tasks for volunteer event";

            /// <summary>Logged when saving volunteer task request status fails.</summary>
            public const string SaveRequestStatusFailed = "An error occurred in @Method while saving volunteer task request status";

            /// <summary>Logged when updating Get Started wizard status fails.</summary>
            public const string UpdateVVWizardStatusFailed = "An error occurred in @Method while updating Vincent Volunteer wizard status";

            /// <summary>Logged when loading VV subscription renewal status fails.</summary>
            public const string GetVVSubscriptionFailed = "An error occurred in @Method while loading Vincent Volunteer subscription status";

            /// <summary>Logged when saving VV subscription remind-me fails.</summary>
            public const string RemainderVVSubscriptionFailed = "An error occurred in @Method while updating Vincent Volunteer subscription reminder";
        }

        public static class ComponentAdminPermissionsLogMessages
        {
            public const string GetAdminPermissionsFailed = "An error occurred in @Method while loading administrator permissions";
            public const string SaveAdminPermissionsFailed = "An error occurred in @Method while saving administrator permissions";
        }

        public static class ComponentClassPermissionsLogMessages
        {
            public const string GetClassPermissionsFailed = "An error occurred in @Method while loading class permissions";
            public const string SaveClassPermissionsFailed = "An error occurred in @Method while saving class permissions";
        }

        public static class ComponentProfilePermissionsLogMessages
        {
            public const string GetProfilePermissionsFailed = "An error occurred in @Method while loading profile permissions";
            public const string SaveProfilePermissionsFailed = "An error occurred in @Method while saving profile permissions";
        }

        public static class ComponentReportPermissionsLogMessages
        {
            public const string GetReportPermissionsFailed = "An error occurred in @Method while loading report permissions";
            public const string GetReportCategoryFailed = "An error occurred in @Method while loading report category list";
            public const string SaveReportPermissionsFailed = "An error occurred in @Method while saving report permissions";
        }

        public static class ComponentUserPermissionsLogMessages
        {
            public const string GetUserPermissionsFailed = "An error occurred in @Method while loading user permissions";
            public const string GetUserCategoryFailed = "An error occurred in @Method while loading user permission category";
            public const string SaveUserPermissionsFailed = "An error occurred in @Method while saving user permissions";
        }

        public static class ComponentBuildingFacilityManagerLogMessages
        {
            public const string GetBuildingRoomListFailed = "An error occurred in @Method while loading building and room list";
            public const string GetBuildingPropertiesFailed = "An error occurred in @Method while loading building properties";
            public const string GetBuildingListFailed = "An error occurred in @Method while loading building list";
            public const string GetRoomPropertiesFailed = "An error occurred in @Method while loading room properties";
            public const string SaveBuildingFailed = "An error occurred in @Method while saving building";
            public const string SaveRoomFailed = "An error occurred in @Method while saving room";
            public const string DeleteBuildingRoomFailed = "An error occurred in @Method while deleting building or room";
        }

        public static class ComponentStaffSettingsLogMessages
        {
            public const string GetAttendanceOptionsFailed = "An error occurred in @Method while loading attendance settings";
            public const string SaveAttendanceOptionsFailed = "An error occurred in @Method while saving attendance settings";
            public const string GetLunchOptionsFailed = "An error occurred in @Method while loading school meals settings";
            public const string SaveLunchOptionsFailed = "An error occurred in @Method while saving school meals settings";
            public const string GetGeneralSettingsFailed = "An error occurred in @Method while loading general settings";
            public const string SaveGeneralSettingsFailed = "An error occurred in @Method while saving general settings";
            public const string GetAssignmentSettingsFailed = "An error occurred in @Method while loading assignment settings";
            public const string SaveAssignmentSettingsFailed = "An error occurred in @Method while saving assignment settings";
        }

        public static class ComponentPersonalOptionsLogMessages
        {
            public const string GetMyScheduleFailed = "An error occurred in @Method while loading staff schedule";
            public const string GetMyFilesFailed = "An error occurred in @Method while loading my files";
            public const string GetFileDownloadFailed = "An error occurred in @Method while preparing file download";
        }

        public static class SsoLogMessages
        {
            public const string ForgotPasswordFailed = "SSO forgot password failed for {Email}";
            public const string AuthenticateLaunchFailed = "Failed to authenticate launch for email {Email}";
            public const string GetUserDetailsWithRoleFailed = "Error getting user details with role";
            public const string GetAccessPortalsFailed = "Error getting access portals";
            public const string SsoAutoLoginFailed = "SSO auto-login failed for user {Token}";
            public const string AccessInsertLoginTransferFailed = "Error executing AccessInsertLoginTransfer";
            public const string GetDomainByAccessTokenFailed = "Error getting domain by access token";
            public const string GetPrayerAndImagesFailed = "Error getting sign in images and prayer";
            public const string UserLookupFailed = "SSO user lookup failed for {Email}";
            public const string LaunchSessionFailed = "Launch session failed for user {UserId}";
            public const string SessionCacheReadFailed = "SSO session cache read failed";
            public const string LogoutCacheClearFailed = "SSO logout cache clear failed";
            public const string DioceseEnrichmentSkippedSession = "Diocese enrichment skipped for session SSO user {SsoUserId}";
            public const string DioceseEnrichmentSkippedLaunch = "Diocese enrichment skipped for launch user {UserId}";
            public const string LaunchPadProductGridFailed = "LaunchPad product grid failed for user {UserId}";
            public const string LaunchPadProductDetailFailed = "LaunchPad product detail failed for product {ProductId}";
            public const string LaunchPadInsertUserActivityFailed = "InsertUserActivity failed for user {UserId} product {ProductId}";
            public const string LaunchPadJoinPrefillFailed = "Join prefill failed for product {ProductId}";
            public const string ForgotPasswordSpNonSuccess = "Forgot password SP returned non-success for {Email} UserId={UserId}: Code={Code} Message={Message}";
            public const string ForgotPasswordSpNoEmailDetails = "Forgot password SP returned no emailDetails for {Email} UserId={UserId}: Code={Code} Message={Message} RowCount={Count}";
            public const string EmailUsernameSchoolSearchFailed = "SSO school search failed for prefix {Prefix}";
            public const string EmailUsernameSetupFailed = "SSO email username setup failed for {Username}";
            public const string PreferredEmailFailed = "SSO preferred email failed for user {UserId}";
            public const string PreferredEmailSpNonSuccess = "Preferred email SP returned non-success for {Email} UserId={UserId}: Code={Code} Message={Message}";
            public const string PreferredEmailVerifyFailed = "SSO preferred email verify failed for user {UserId}";
            public const string PreferredEmailVerifySpNonSuccess = "Preferred email verify SP returned non-success for {Email} UserId={UserId}: Code={Code} Message={Message}";
            public const string EmailChangePasswordFailed = "SSO email change password failed for user {UserId}";
            public const string EmailChangePasswordSpNonSuccess = "Email change password SP returned non-success for {Email} UserId={UserId}: Code={Code} Message={Message}";
            public const string SignInVisualSpNoRow = "SSO sign-in visual: SP returned no row; using configured fallback";
            public const string SignInVisualSpRowLoaded = "SSO sign-in visual: SP row ImageName length={ImageNameLen}, ImageTitle present={HasTitle}, Prayer present={HasPrayer}";
            public const string SignInVisualSpFailed = "SSO sign-in visual SP {Sp} failed; using configured fallback";
            public const string SignInVisualBackgroundResolved = "SSO sign-in visual: resolved background host={Host}, path length={PathLen}";
            public const string SignInVisualBackgroundUrlLength = "SSO sign-in visual: resolved background URL length={Len}";
            public const string SignInVisualNoBackground = "SSO sign-in visual: no background URL resolved (doc base or image path missing)";
            public const string SignInVisualImageResolveFailed = "SSO sign-in visual could not resolve image {ImageId} from ManageSignInImages; using SIS path";
            public const string SignInVisualRequestCanceled = "SSO sign-in visual request canceled; using configured fallback";
        }

        public static class DioceseLogMessages
        {
            public const string FailedToLoadLogonPage = "Failed to load diocese logon page.";
            public const string AutoSignInFailed = "Unable to complete automatic sign-in.";
            public const string UnableToSignIn = "Unable to sign in with the provided credentials.";
            public const string LoginFailed = "Diocese login failed for user {UserName}.";
            public const string AutoLoginFailed = "Diocese auto-login failed.";
            public const string UpdatePasswordFailed = "Failed to change password for site login {SiteLoginId}.";
            public const string GetListFailed = "Failed to load Catholic school list for diocese {DioceseId} and site login {SiteLoginId}.";
            public const string GetDetailsFailed = "Failed to load Catholic school details for diocese {DioceseId}, site login {SiteLoginId}, school {SchoolId}.";
            public const string GetEnrollmentChartFailed = "Failed to load Catholic school enrollment chart for diocese {DioceseId}, school {SchoolId}.";
            public const string GetReligiousEdListFailed = "Failed to load Religious Ed school list for diocese {DioceseId} and site login {SiteLoginId}.";
            public const string GetReligiousEdDetailsFailed = "Failed to load Religious Ed school details for diocese {DioceseId}, site login {SiteLoginId}, school {SchoolId}.";
            public const string GetReligiousEdEnrollmentChartFailed = "Failed to load Religious Ed school enrollment chart for diocese {DioceseId}, school {SchoolId}.";
            public const string ExecuteListSpFailed = "Failed to execute {StoredProcedure} for DioceseId {DioceseId}, SiteLoginId {SiteLoginId}, OrganizationTypeId {OrganizationTypeId}.";
            public const string ExecuteDetailsSpFailed = "Failed to execute {StoredProcedure} for DioceseId {DioceseId}, SiteLoginId {SiteLoginId}, SchoolId {SchoolId}, OrganizationTypeId {OrganizationTypeId}.";
            public const string ExecuteEnrollmentChartSpFailed = "Failed to execute {StoredProcedure} for DioceseId {DioceseId}, SchoolId {SchoolId}.";
            public const string GetProfileFailed = "Failed to load user profile for site login {SiteLoginId}.";
            public const string UpdateProfileFailed = "Failed to update user profile for site login {SiteLoginId}.";
            public const string ExecuteGetUserProfileSpFailed = "Failed to execute {StoredProcedure} for SiteLoginId {SiteLoginId}.";
            public const string ExecuteUpdateUserProfileSpFailed = "Failed to execute {StoredProcedure} for SiteLoginId {SiteLoginId}.";
            public const string ExecuteUpdateUserPasswordSpFailed = "Failed to execute {StoredProcedure} for SiteLoginId {SiteLoginId}.";
            public const string FailedToLoadNavigationMenu = "Failed to load navigation menu for user {UserId} in diocese {DioceseId}.";
            public const string FailedToLoadParishList = "Failed to load diocesan parish list for diocese {DioceseId}.";
            public const string FailedToLoadParishDetails = "Failed to load parish details for diocese {DioceseId}, parish {ParishId}.";
            public const string FailedToSaveParish = "Failed to save parish for diocese {DioceseId}.";
            public const string FailedToDeleteParish = "Failed to delete parish {ParishId} for diocese {DioceseId}.";
            public const string FailedToLoadSchoolGroupList = "Failed to load school group list for diocese {DioceseId}.";
            public const string FailedToLoadSchoolGroupDetails = "Failed to load school group details for diocese {DioceseId}, school group {SchoolGroupId}.";
            public const string FailedToSaveSchoolGroup = "Failed to save school group for diocese {DioceseId}.";
            public const string FailedToDeleteSchoolGroup = "Failed to delete school group {SchoolGroupId} for diocese {DioceseId}.";
            public const string FailedToLoadUsDioceseDirectory = "Failed to load U.S. diocese directory.";
            public const string FailedToLoadDioceseStaffDirectory = "Failed to load diocesan staff directory for diocese {DioceseId}.";
            public const string FailedToLoadCatholicSchoolDirectorySchools = "Failed to load schools for Catholic School Directory for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadCatholicSchoolDirectoryContacts = "Failed to load contacts for Catholic School Directory for diocese {DioceseId}, site login {SiteLoginId}, school {SchoolId}, type {Type}.";
            public const string FailedToLoadReligiousEdDirectorySchools = "Failed to load schools for Religious Ed Directory for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadReligiousEdDirectoryContacts = "Failed to load contacts for Religious Ed Directory for diocese {DioceseId}, site login {SiteLoginId}, school {SchoolId}, type {Type}.";
            public const string FailedToLoadStudentSearch = "Failed to load student search results for diocese {DioceseId}, site login {SiteLoginId}, search {SearchString}.";
            public const string FailedToLoadParishClergyList = "Failed to load parish clergy list for diocese {DioceseId}.";
            public const string FailedToLoadParishClergyDetails = "Failed to load parish clergy details for diocese {DioceseId}, clergy {ClergyId}.";
            public const string FailedToSaveParishClergy = "Failed to save parish clergy for diocese {DioceseId}, clergy {ClergyId}.";
            public const string FailedToDeleteParishClergy = "Failed to delete parish clergy {ClergyId} for diocese {DioceseId}.";
            public const string FailedToLoadDashboardData = "Failed to load diocese dashboard data for diocese {DioceseId} and site login {SiteLoginId}.";
            public const string ExecuteGetDashboardSpFailed = "Failed to execute {StoredProcedure} for DioceseId {DioceseId}, SiteLoginId {SiteLoginId}.";
            public const string FailedToLoadReportList = "Failed to load report list for diocese {DioceseId}, user {UserId}, category {CategoryId}.";
            public const string FailedToLoadNysRegentsReportPage = "Failed to load NYS Regents report page for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadGenericReportPage = "Failed to load generic report page for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToExportNysRegentsExamData = "Failed to export NYS Regents exam data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportHealthyHighFiveData = "Failed to export Healthy High Five data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportNysStudentLiteData = "Failed to export NYS student lite data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportNysStudentEntryExitData = "Failed to export NYS student entry/exit data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportTerraNovaUserData = "Failed to export Terra Nova user data for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadProfessionalStaffReportData = "Failed to load professional staff report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadSafeguardingVirtusReportData = "Failed to load safeguarding/Virtus report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadSchoolClassesAndTeachersData = "Failed to load school classes and teachers report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportSchoolArchiveData = "Failed to export school archive data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadSchoolAttendanceReportData = "Failed to load school attendance report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadReligiousEdEnrollmentData = "Failed to load religious ed enrollment report data for diocese {DioceseId}, target date {TargetDate}.";
            public const string FailedToLoadEnrollmentByGradeGenderData = "Failed to load enrollment by grade and gender report data for diocese {DioceseId}, target date {TargetDate}.";
            public const string FailedToLoadSchoolDaysReportPage = "Failed to load school days report page for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToUpdateSchoolDaysApprovalStatus = "Failed to update school days approval status for school {SchoolId}, site login {SiteLoginId}.";
            public const string FailedToLoadTrainingEventList = "Failed to load training event list for diocese {DioceseId}, months back {MonthsBack}.";
            public const string FailedToLoadTrainingEventDetails = "Failed to load training event details for diocese {DioceseId}, event {EventId}.";
            public const string FailedToLoadTrainingEventSubCategories = "Failed to load training event sub-categories for diocese {DioceseId}, category {CategoryId}.";
            public const string FailedToSaveTrainingEvent = "Failed to save training event for diocese {DioceseId}.";
            public const string FailedToDeleteTrainingEvent = "Failed to delete training event {EventId} for diocese {DioceseId}.";
            public const string FailedToLoadTrainingEventRegistrations = "Failed to load training event registrations for diocese {DioceseId}, event {EventId}.";
            public const string FailedToLoadTrainingStaffLookup = "Failed to load training staff lookup for diocese {DioceseId}.";
            public const string FailedToRegisterTrainingEventUsers = "Failed to register users for training event {EventId} in diocese {DioceseId}.";
            public const string FailedToUpdateTrainingEventRegistration = "Failed to update training event registration for event {EventId} in diocese {DioceseId}.";
            public const string FailedToUpdateTrainingEventRegistrationSchool = "Failed to update training event school registration for event {EventId} in diocese {DioceseId}.";
            public const string FailedToLoadTrainingEventAttendance = "Failed to load training event attendance for diocese {DioceseId}, session {EventSessionId}.";
            public const string FailedToUpdateTrainingEventAttendance = "Failed to update training event attendance for session {EventSessionId} in diocese {DioceseId}.";
            public const string FailedToLoadDioceseProfile = "Failed to load diocese profile for diocese {DioceseId}.";
            public const string FailedToSaveDioceseProfile = "Failed to save diocese profile for diocese {DioceseId}.";
            public const string FailedToSendSecureMessage = "Failed to send secure support message.";
            public const string FailedToLoadNotifications = "Failed to load notifications for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToSaveNotification = "Failed to save notification for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToCancelNotification = "Failed to cancel notification {NotificationId} for diocese {DioceseId}.";
            public const string FailedToLoadFileLibraryList = "Failed to retrieve diocese file library list. DioceseId: {DioceseId}";
            public const string FailedToLoadFileLibraryDetails = "Failed to retrieve file library details. DioceseId: {DioceseId}, FileUploadId: {FileUploadId}";
            public const string FailedToLoadFileAccessLog = "Failed to retrieve file access log. DioceseId: {DioceseId}, FileUploadId: {FileUploadId}";
            public const string FailedToSaveFileLibraryUpload = "Failed to save file library upload metadata. DioceseId: {DioceseId}";
            public const string FailedToDeleteFileLibraryUpload = "Failed to delete file upload record. DioceseId: {DioceseId}, FileUploadId: {FileUploadId}";
            public const string FailedToExportProspectContactData = "Failed to export prospect contact data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportStudentContactData = "Failed to export student contact data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadTop5ZipCodesReportData = "Failed to load top 5 zip codes report data for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadSchoolProspectCountsReportData = "Failed to load school prospect counts report data for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadSchoolFilterAjaxPage = "Failed to load school filter options for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadBusInformationReportData = "Failed to load bus information report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadCStarGradesReportData = "Failed to load C* grade report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToExportNceaData = "Failed to export NCEA data for diocese {DioceseId}, school year {SchoolYear}.";
            public const string FailedToExportFeatureUsageData = "Failed to export feature usage data for diocese {DioceseId}, month count {MonthCount}.";
            public const string FailedToLoadFreeOrReducedMealsReportData = "Failed to load free or reduced meals report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadMissingAttendanceReportData = "Failed to load missing attendance report data for diocese {DioceseId}, school {SchoolId}.";
            public const string FailedToLoadSchoolEnrollmentByGradeData = "Failed to load school enrollment by grade report data for diocese {DioceseId}, school {SchoolId}, target date {TargetDate}.";
            public const string FailedToLoadSchoolEnrollmentTrendData = "Failed to load school enrollment trend report data for diocese {DioceseId}, school {SchoolId}, target date {TargetDate}.";
            public const string FailedToLoadSchoolEnrollmentByParishAndGradeData = "Failed to load school enrollment by parish and grade report data for diocese {DioceseId}, school {SchoolId}, target date {TargetDate}.";
            public const string FailedToExportNonReportCardCourseData = "Failed to export non report card course enrollment data for diocese {DioceseId}, school {SchoolId}, year {Year}.";
            public const string FailedToLoadNonReportCardCourseReportData = "Failed to load non report card course enrollment report data for diocese {DioceseId}, school {SchoolId}, year {Year}.";
            public const string FailedToLoadStudentRetentionSummaryData = "Failed to load student retention summary report data for diocese {DioceseId}, school {SchoolId}, target year start {TargetYearStart}.";
            public const string FailedToLoadAdHocPage = "Failed to load ad hoc report page for diocese {DioceseId}, site login {SiteLoginId}, report {ReportId}.";
            public const string FailedToLoadAdHocStudentResults = "Failed to load ad hoc student results for diocese {DioceseId}, site login {SiteLoginId}, org/group {OrgOrGroupId}.";
            public const string FailedToLoadAdHocStaffResults = "Failed to load ad hoc staff results for diocese {DioceseId}, site login {SiteLoginId}, org/group {OrgOrGroupId}.";
            public const string FailedToSaveAdHocReport = "Failed to save ad hoc report for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToDeleteAdHocReport = "Failed to delete ad hoc report {AdHocReportId} for site login {SiteLoginId}.";
            public const string FailedToLoadScholarshipStudentListPage = "Failed to load scholarship student list for diocese {DioceseId}, site login {SiteLoginId}, school year {SchoolYear}, school {SchoolId}.";
            public const string FailedToLoadScholarshipDonorListPage = "Failed to load scholarship donor list for diocese {DioceseId}, site login {SiteLoginId}, school year {SchoolYear}.";
            public const string FailedToUpdateScholarshipFileTemplate = "Failed to update scholarship file template for diocese {DioceseId}, site login {SiteLoginId}, document {DocumentId}.";
            public const string FailedToLoadScholarshipFileListPage = "Failed to load scholarship file list for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadCertificationPeriodsList = "Failed to load certification details list for Diocese ID: {DioceseId}, Org: {OrgId}";
            public const string FailedToUpdateCertificationPeriods = "Failed to update certification periods for Diocese ID: {DioceseId}, User: {UserId}";
            public const string FailedToLoadCertificationPeriodsOptions = "Failed to load user certification periods list for Diocese ID: {DioceseId}";
            public const string FailedToUploadScholarshipData = "Failed to upload scholarship data for diocese {DioceseId}, site login {SiteLoginId}.";
            public const string FailedToLoadPersonnelList = "Failed to load personnel list for diocese {DioceseId}.";
            public const string FailedToLoadPersonnelDetails = "Failed to load personnel details for diocese {DioceseId}, user {UserId}.";
            public const string FailedToSavePersonnel = "Failed to save personnel for diocese {DioceseId}.";
            public const string FailedToDeletePersonnel = "Failed to delete personnel user {UserId} for diocese {DioceseId}.";
            public const string FailedToLoadUserRights = "Failed to load user module rights for user {UserId} in diocese {DioceseId}.";
            public const string FailedToSaveUserRights = "Failed to save user rights for user {UserId} in diocese {DioceseId}.";
            public const string FailedToLoadUserPermissions = "Failed to load user permissions details for site login {SiteLoginId} in diocese {DioceseId}.";
            public const string FailedToUpdateUserPermissions = "Failed to update user permissions for site login {SiteLoginId} in diocese {DioceseId}.";
            public const string FailedToLoadDataRequests = "Failed to load data requests for diocese {DioceseId}.";
            public const string FailedToSaveDataRequestCategory = "Failed to save data request category for diocese {DioceseId}.";
            public const string FailedToDeleteDataRequest = "Failed to delete data request {RequestId} for diocese {DioceseId}.";
            public const string FailedToDeleteDataRequestCategory = "Failed to delete data request category {CategoryId} for diocese {DioceseId}.";
        }

        public static class FamilyLogMessages
        {
            public const string GetAnnouncementsFailed = "Failed to get announcements.";
            public const string FetchPrivateMessagesFailed = "Failed to fetch private messages.";
            public const string GetMessageFailed = "Failed to get message.";
            public const string InsertMessageFailed = "Failed to insert message.";
            public const string ArchiveMessageFailed = "Failed to archive message.";
            public const string GetUserToListFailed = "Failed to get user to list.";
            public const string GetManageAlertsFailed = "Failed to get manage alerts.";
            public const string UpdateAlertsFailed = "Failed to update alerts.";
            public const string GetAccountFailed = "Failed to get account details.";
            public const string GetMakePaymentFailed = "Failed to get make payment page context.";
            public const string SaveAutoWithdrawalFailed = "Failed to save auto withdrawal.";
            public const string CheckRiskDuplicateFailed = "Failed to check risk duplicate.";
            public const string GetCcOptioncAccountFailed = "Failed to get CC OptionC account.";
            public const string SaveAchPaymentFailed = "Failed to save ACH payment.";
            public const string GetProfileFailed = "Failed to get user profile.";
            public const string UpdateChangePasswordFailed = "Failed to update change password.";
            public const string UpdateTandCFailed = "Failed to update Terms and Conditions.";
            public const string UpdateMMPaymentFailed = "Failed to update MattMoney payment status.";
            public const string GetTransactionListFailed = "Failed to retrieve transaction list.";
            public const string GetBillingSummaryFailed = "Failed to retrieve billing summary.";
            public const string GetBillingAchSettingsFailed = "Failed to retrieve billing ACH settings.";
            public const string FuzeHealthCheckFailed = "Error checking Fuze health";
            public const string MattMoneyTokenGenerationFailed = "Error calling MattMoney token generation";
            public const string OptioncTokenGenerationFailed = "Error calling MattMoney OptionC token generation";
            public const string GetAssignmentOverviewFailed = "An error occurred in @Method while getting assignment overview";
            public const string GetAssignmentFailed = "An error occurred in @Method while getting assignment";
            public const string GetClassesFailed = "An error occurred in @Method while getting classes";
            public const string GetReportCardFailed = "An error occurred in @Method while getting report card";
            public const string GetAttendanceHistoryFailed = "An error occurred in @Method while getting attendance history";
            public const string GetContactInformationFailed = "An error occurred in @Method while getting contact information";
            public const string GetCalenderFailed = "An error occurred in @Method while getting calender";
            public const string GetSMSStudentProfile = "An error occurred in @Method while getting SMSStudentProfile";
            public const string GetStudentPasswordFailed = "An error occurred in @Method while getting password";
            public const string UpdateStudentPasswordFailed = "An error occurred in @Method while updating the password";
            public const string GetFamilyProfileFailed = "An error occurred in @Method while getting family profile";
            public const string GetTeacherConferencesFailed = "An error occurred in @Method while getting teacher conference";
            public const string UpdateTeacherConferencesFailed = "An error occurred in @Method while updating teacher conference";
            public const string GetTeacherConferencesDetailsFailed = "An error occurred in @Method while getting teacher conferences details";
            public const string GetMassCardRequestFailed = "An error occurred in @Method while getting mass card request";
            public const string InsertMassCardRequestFailed = "An error occurred in @Method while inserting mass card request";
            public const string UpdateContactInformationFailed = "An error occurred in @Method while updating contact information";
        }

        // Serilog error message constants
        public static class AdmissionLogMessages
        {
            public const string ProcessingFeeDBSaveFailed = "Processing fee DB save failed for user { UserId }; canceling TransRefID { TransRefId }";
            public const string ApplicationFeeAlreadyPaid = "The Application Fee for this student is already paid for this year.";
            public const string GetParentListPageNewAsync = "Error in GetParentListPageNewAsync for UserID: {UserID}";
            public const string GetProspectDetailsPageNewAsync = "Error in GetProspectDetailsPageNewAsync for UserID: {UserID}";
            public const string GetStudentListPageNewAsync = "Error in GetStudentListPageNewAsync for UserID: {UserID}";
            public const string GetSubmitToSchoolPageNewAsync = "Error in GetSubmitToSchoolPageNewAsync for UserID: {UserID}";
            public const string GetCheckoutPageNewAsync = "Error in GetCheckoutPageNewAsync for UserID: {UserID}";
            public const string CompleteSubmitToSchoolNewAsync = "Error in CompleteSubmitToSchoolNewAsync for UserID: {UserID}";
            public const string InsertCompleteSubmitToSchoolusingMMAsync = "Error in InsertCompleteSubmitToSchoolusingMMAsync for UserID: {UserID}";
            public const string DeleteCompleteSubmitToSchoolusingMMAsync = "Error in DeleteCompleteSubmitToSchoolusingMMAsync for UserID: {UserID}";
            public const string InsertParentAsync = "Error in InsertParentAsync for UserID: {UserID}";
            public const string UpdateParentAsync = "Error in UpdateParentAsync for UserID: {UserID}";
            public const string SaveStudentAsync = "Error in SaveStudentAsync for UserID: {UserID}";
            public const string UpdateCompleteSubmitToSchoolusingMMAsync = "Error in UpdateCompleteSubmitToSchoolusingMMAsync for UserID: {UserID}";
            public const string GetWelcomePageAsync = "Failed to get welcome page details for Org ID {OrgId}, User ID {UserId}";
            public const string GetRegistrationPageAsync = "Failed to get registration page details for Org ID {OrgId}";
            public const string GetFamilyDetailsPageAsync = "Failed to get family details page details for User ID {UserId}";
            public const string UpdateFamilyDetailsAsync = "Error updating family details new for User ID {UserId}";
        }

        public static class SMSUserManagementLogMessages
        {
            public const string GetSMSMenuFailed = "An error occurred while getting SMS menu for orgId: {OrgId}, userId: {UserId}";
            public const string GetLoginUserDataFailed = "An error occurred while getting login user data for userId: {UserId}";
            public const string CheckPasswordFailed = "An error occurred while checking password for userId: {UserId}";
            public const string UpdateUserPasswordFailed = "An error occurred while updating user password for userId: {UserId}";
        }
        public static class FeeLogMessages
        {
            public const string GetTransactionStatementsFailed = "FeeReportsService.GetTransactionStatementsAsync failed for OrgId {OrgId}";
            public const string GetTransactionStatementReportFailed = "FeeReportsService.GetTransactionStatementReportAsync failed for OrgId {OrgId}";
            public const string GetAccountBalanceStatementsPdfFiltersFailed = "FeeReportsService.GetAccountBalanceStatementsPdfFiltersAsync failed for OrgId {OrgId}";
            public const string GetAccountBalanceStatementsPdfFailed = "FeeReportsService.GetAccountBalanceStatementsPdfAsync failed for OrgId {OrgId}";
            public const string GetFamilyTransactionReportFailed = "FeeReportsService.GetFamilyTransactionReportAsync failed for OrgId {OrgId}";
            public const string GetArrearsBillingFinancialFailed = "FeeReportsService.GetArrearsBillingFinancialAsync failed for OrgId {OrgId}";
            public const string GetArrearsBillingFailed = "FeeReportsService.GetArrearsBillingAsync failed for OrgId {OrgId}";
            public const string GetSettingsFailed = "FeeReportsService.GetSettingsAsync failed for OrgId {OrgId}";
            public const string GetArrearsLauncherFailed = "FeeReportsService.GetArrearsLauncherAsync failed for OrgId {OrgId}";
            public const string GetAchActivityReportFailed = "FeeReportsService.GetAchActivityReportAsync failed for OrgId {OrgId}";
            public const string GetAchActivityStatementFailed = "FeeReportsService.GetAchActivityStatementAsync failed for OrgId {OrgId}";
            public const string GetCardActivityStatementFailed = "FeeReportsService.GetCardActivityStatementAsync failed for OrgId {OrgId}";
            public const string GetViperOrgListFailed = "FeeReportsService.GetViperOrgListAsync failed";
            public const string GetCreditCardSetupFeeStatementFailed = "FeeReportsService.GetCreditCardSetupFeeStatementAsync failed for OrgId {OrgId}";
            public const string GetAchServiceFeeStatementFailed = "FeeReportsService.GetAchServiceFeeStatementAsync failed for OrgId {OrgId}";
            public const string GetBillingItemUsageFailed = "FeeReportsService.GetBillingItemUsageAsync failed for OrgId {OrgId}";
            public const string GetVoidRefundTransactionSummaryFailed = "FeeReportsService.GetVoidRefundTransactionSummaryAsync failed for OrgId {OrgId}";
            public const string GetPaymentTransactionsByCategoryLauncherFailed = "FeeReportsService.GetPaymentTransactionsByCategoryLauncherAsync failed for OrgId {OrgId}";
            public const string GetPaymentTransactionsByCategoryFailed = "FeeReportsService.GetPaymentTransactionsByCategoryAsync failed for OrgId {OrgId}";
            public const string GetParentAccountSetupFailed = "FeeReportsService.GetParentAccountSetupAsync failed for OrgId {OrgId}";
            public const string GetFailedTransactionsFailed = "FeeReportsService.GetFailedTransactionsAsync failed for OrgId {OrgId}";
            public const string GetAchDetailStatementFailed = "FeeReportsService.GetAchDetailStatementAsync failed for OrgId {OrgId}";
            public const string GetCardDetailStatementFailed = "FeeReportsService.GetCardDetailStatementAsync failed for OrgId {OrgId}";
            public const string GetAchBankFundingStatementFailed = "FeeReportsService.GetAchBankFundingStatementAsync failed for OrgId {OrgId}";
            public const string GetCardBankFundingStatementFailed = "FeeReportsService.GetCardBankFundingStatementAsync failed for OrgId {OrgId}";
            public const string GetTransactionSummaryFailed = "FeeReportsService.GetTransactionSummaryAsync failed for OrgId {OrgId}";
            public const string GetEftCcFundedTransactionSummaryFailed = "FeeReportsService.GetEftCcFundedTransactionSummaryAsync failed for OrgId {OrgId}";
            public const string GetBillingPaymentDetailsFailed = "FeeReportsService.GetBillingPaymentDetailsAsync failed for OrgId {OrgId}";
            public const string GetAgingOfReceivablesLauncherFailed = "FeeReportsService.GetAgingOfReceivablesLauncherAsync failed for OrgId {OrgId}";
            public const string GetAgingOfReceivablesReportFailed = "FeeReportsService.GetAgingOfReceivablesReportAsync failed for OrgId {OrgId}";
            public const string GetBillingBalanceDetailsFailed = "FeeReportsService.GetBillingBalanceDetailsAsync failed for OrgId {OrgId}";
            public const string GetDelinquentAmountFailed = "FeeReportsService.GetDelinquentAmountAsync failed for OrgId {OrgId}";
            public const string GetDelinquentAccountNoticesFailed = "FeeReportsService.GetDelinquentAccountNoticesAsync failed for OrgId {OrgId}";
            public const string GetCurrentBalanceNoticesFailed = "FeeReportsService.GetCurrentBalanceNoticesAsync failed for OrgId {OrgId}";
            public const string GetLedgerPageFailed = "LedgerService.GetLedgerPageAsync failed for OrgId {OrgId}";
            public const string FetchLedgerFailed = "LedgerService.FetchLedgerAsync failed for OrgId {OrgId}";
            public const string FetchLedgerUsersFailed = "LedgerService.FetchLedgerUsersAsync failed for OrgId {OrgId}";
            public const string FetchLedgerFamilyUsersFailed = "LedgerService.FetchLedgerFamilyUsersAsync failed for OrgId {OrgId}";
            public const string GetTransactionInfoFailed = "LedgerService.GetTransactionInfoAsync failed for transaction {TransactionId}";
            public const string DeleteTransactionFailed = "LedgerService.DeleteTransactionAsync failed for transaction {TransactionId}";
            public const string GetChargePageFailed = "ChargesService.GetChargePageAsync failed for OrgId {OrgId}";
            public const string SaveSingleChargeFailed = "ChargesService.SaveSingleChargeAsync failed for OrgId {OrgId}";
            public const string SaveRecurringChargeFailed = "ChargesService.SaveRecurringChargeAsync failed for OrgId {OrgId}";
            public const string GetRecurringChargesListFailed = "ChargesService.GetRecurringChargesListAsync failed for OrgId {OrgId}";
            public const string GetRecurringDeleteInfoFailed = "ChargesService.GetRecurringDeleteInfoAsync failed for recurring {RecurringId}";
            public const string DeleteRecurringChargeFailed = "ChargesService.DeleteRecurringChargeAsync failed for recurring {RecurringId}";
            public const string FetchGroupMembersFailed = "ChargesService.FetchGroupMembersAsync failed for OrgId {OrgId}";
            public const string GetPaymentPageFailed = "PaymentService.GetPaymentPageAsync failed for OrgId {OrgId}";
            public const string FetchPaymentUserBalanceFailed = "PaymentService.FetchUserBalanceAsync failed for OrgId {OrgId}";
            public const string FetchPaymentUserBalanceByItemFailed = "PaymentService.FetchUserBalanceByItemAsync failed for OrgId {OrgId}";
            public const string SavePaymentFailed = "PaymentService.SavePaymentAsync failed for OrgId {OrgId}";
            public const string GetVoidRefundSummaryFailed = "PaymentService.GetVoidRefundSummaryAsync failed for OrgId {OrgId}";
            public const string SaveVoidRefundPaymentFailed = "PaymentService.SaveVoidRefundPaymentAsync failed for OrgId {OrgId}";
            public const string GetFeeDashboardPageFailed = "FeeDashboardService.GetDashboardPageAsync failed for OrgId {OrgId}";
            public const string GetFeeDashboardDataFailed = "FeeDashboardService.GetDashboardDataAsync failed for OrgId {OrgId}";
            public const string GetFeeDashboardCategoryTableFailed = "FeeDashboardService.GetCategoryTableAsync failed for OrgId {OrgId}";
            public const string UpdateMmAdminStatusFailed = "FeeDashboardService.UpdateMmAdminStatusAsync failed for OrgId {OrgId}";
            public const string ExportMailMergeFailed = "FeeDashboardService.ExportMailMergeAsync failed for OrgId {OrgId}";
            public const string GetBillingCategoriesPageFailed = "BillingItemsService.GetBillingCategoriesPageAsync failed for OrgId {OrgId}";
            public const string GetBillingItemsPageFailed = "BillingItemsService.GetBillingItemsPageAsync failed for OrgId {OrgId}";
            public const string GetBillingItemFailed = "BillingItemsService.GetBillingItemAsync failed for billing item {BillingItemId}";
            public const string GetBillingCategoryOptionsFailed = "BillingItemsService.GetBillingCategoryOptionsAsync failed for OrgId {OrgId}";
            public const string UpdatePrefundBillingCategoriesFailed = "BillingItemsService.UpdatePrefundBillingCategoriesAsync failed for OrgId {OrgId}";
            public const string SaveBillingCategoryFailed = "BillingItemsService.SaveBillingCategoryAsync failed for OrgId {OrgId}";
            public const string DeleteBillingCategoryFailed = "BillingItemsService.DeleteBillingCategoryAsync failed for category {CategoryId}";
            public const string SaveBillingItemFailed = "BillingItemsService.SaveBillingItemAsync failed for OrgId {OrgId}";
            public const string DeleteBillingItemFailed = "BillingItemsService.DeleteBillingItemAsync failed for billing item {BillingItemId}";
            public const string GetBillingGroupsPageFailed = "BillingGroupsService.GetBillingGroupsPageAsync failed for OrgId {OrgId}";
            public const string GetBillingGroupMembersPageFailed = "BillingGroupsService.GetBillingGroupMembersPageAsync failed for OrgId {OrgId}, group {GroupId}";
            public const string GetBillingGroupFormFailed = "BillingGroupsService.GetBillingGroupFormAsync failed for OrgId {OrgId}, group {GroupId}";
            public const string FetchBillingGroupMembersFilterFailed = "BillingGroupsService.FetchGroupMembersAsync failed for OrgId {OrgId}";
            public const string FetchBillingGroupMembersFailed = "BillingGroupsService.FetchBillingGroupMembersAsync failed for OrgId {OrgId}";
            public const string SaveBillingGroupFailed = "BillingGroupsService.SaveBillingGroupAsync failed for OrgId {OrgId}, group {GroupId}";
            public const string DeleteBillingGroupFailed = "BillingGroupsService.DeleteBillingGroupAsync failed for group {GroupId}";
            public const string GetBillingSettingsPageFailed = "BillingSettingsService.GetBillingSettingsPageAsync failed for OrgId {OrgId}";
            public const string SaveBillingSettingsFailed = "BillingSettingsService.SaveBillingSettingsAsync failed for OrgId {OrgId}";
            public const string GetContactInformationFailed = "ContactInformationService.GetContactInformationAsync failed for OrgId {OrgId}";
            public const string SaveContactInformationFailed = "ContactInformationService.SaveContactInformationAsync failed for OrgId {OrgId}";
            public const string QueryContactInformationRepositoryFailed = "ContactInformationRepository.QueryContactInformationAsync failed for OrgId {OrgId}";
            public const string ExecuteSaveContactInformationRepositoryFailed = "ContactInformationRepository.ExecuteSaveContactInformationAsync failed for OrgId {OrgId}";
            public const string GetUserRightsFailed = "UserRightsService.GetUserRightsAsync failed for OrgId {OrgId}";
            public const string GetStaffRightsByIdFailed = "UserRightsService.GetStaffRightsByIdAsync failed for OrgId {OrgId}, StaffId {StaffId}";
            public const string SaveUserRightsFailed = "UserRightsService.SaveUserRightsAsync failed for OrgId {OrgId}, UserId {UserId}";
            public const string QueryStaffListRepositoryFailed = "UserRightsRepository.QueryStaffListAsync failed for OrgId {OrgId}";
            public const string QueryStaffRightsRepositoryFailed = "UserRightsRepository.QueryStaffRightsByIdAsync failed for OrgId {OrgId}, StaffId {StaffId}";
            public const string ExecuteSaveStaffRightsRepositoryFailed = "UserRightsRepository.ExecuteSaveStaffRightsAsync failed for UserId {UserId}";
            public const string GetLunchTransactionFailed = "ReportService.GetLunchTransaction failed for OrgId {OrgId}";
            public const string GetLunchTransactionDetailsFailed = "ReportService.GetLunchTransactionDetails failed for OrgId {OrgId}";
        }

        public static class SMSArcAlertsLogMessages
        {
            public const string GetDefaultPageFailed = "Failed to get ArcAlerts default page";
            public const string GetJobListPageFailed = "Failed to get ArcAlerts job list page {Page}";
            public const string GetMessageFailed = "Failed to get ArcAlerts message {MessageId}";
            public const string GetSettingsFailed = "Failed to get ArcAlerts settings";
            public const string UpdateSettingsFailed = "Failed to update ArcAlerts settings";
            public const string GetFamilyPreferencesFailed = "Failed to get ArcAlerts family preferences";
            public const string SaveAlertFailed = "Failed to save ArcAlerts message";
            public const string DeleteAlertFailed = "Failed to delete ArcAlerts message {MessageId}";
            public const string UploadAttachmentFailed = "Failed to upload ArcAlerts attachment for message {MessageId}";
            public const string HighGroundRecordSoundFailed = "HighGround RecordSound returned status {Status} for phone {MobileNumber}";
            public const string HighGroundXmlParseFailed = "Failed to parse HighGround XML response: {Response}";
            public const string GetVoiceRecordingIdFailed = "Failed to get voice recording ID for phone {MobileNumber}";
            public const string HighGroundStatusCheckFailed = "HighGround status check POST to {Url} failed with status {Status} for message {MessageId}";
            public const string GetMessageDeliveryStatusFailed = "Failed to get message delivery status for message {MessageId} type {TypeId}";
            public const string DownloadAttachmentFailed = "Failed to download ArcAlerts attachment {FileName}";
        }

        public static class SMSAdmissionsLogMessages
        {
            public const string GetBasicSettingsFailed = "An error occurred while getting basic admissions settings for orgId: {OrgId}, userId: {UserId}";
            public const string GetApplicationStatusFailed = "An error occurred while getting application statuses for orgId: {OrgId}, userId: {UserId}";
            public const string GetApplicationFieldFailed = "An error occurred while getting application fields for orgId: {OrgId}, userId: {UserId}";
            public const string GetProspectMilestoneFailed = "An error occurred while getting prospect milestones for orgId: {OrgId}, userId: {UserId}";
            public const string GetEnrollmentMilestoneFailed = "An error occurred while getting enrollment milestones for orgId: {OrgId}, userId: {UserId}";
            public const string GetEnrollmentLimitsFailed = "An error occurred while getting enrollment limits for orgId: {OrgId}, userId: {UserId}";
            public const string UpdateSettingsFailed = "An error occurred while updating admissions settings for userId: {UserId}";
            public const string SaveApplicationFieldFailed = "An error occurred while saving admissions application fields for userId: {UserId}";
            public const string SortStatusFailed = "An error occurred while sorting application status for userId: {UserId}, id: {Id}";
            public const string AddStatusFailed = "An error occurred while adding application status for userId: {UserId}";
            public const string UpdateStatusFailed = "An error occurred while updating application status for userId: {UserId}, id: {Id}";
            public const string DeleteStatusFailed = "An error occurred while deleting application status for userId: {UserId}, id: {Id}";
            public const string SortProspectMilestoneFailed = "An error occurred while sorting prospect milestone for userId: {UserId}, id: {Id}";
            public const string AddProspectMilestoneFailed = "An error occurred while adding prospect milestone for userId: {UserId}";
            public const string UpdateProspectMilestoneFailed = "An error occurred while updating prospect milestone for userId: {UserId}, id: {Id}";
            public const string DeleteProspectMilestoneFailed = "An error occurred while deleting prospect milestone for userId: {UserId}, id: {Id}";
            public const string RestoreProspectMilestoneFailed = "An error occurred while restoring prospect milestone for userId: {UserId}, id: {Id}";
            public const string SortReEnrollmentMilestoneFailed = "An error occurred while sorting re-enrollment milestone for userId: {UserId}, id: {Id}";
            public const string AddReEnrollmentMilestoneFailed = "An error occurred while adding re-enrollment milestone for userId: {UserId}";
            public const string UpdateReEnrollmentMilestoneFailed = "An error occurred while updating re-enrollment milestone for userId: {UserId}, id: {Id}";
            public const string DeleteReEnrollmentMilestoneFailed = "An error occurred while deleting re-enrollment milestone for userId: {UserId}, id: {Id}";
            public const string RestoreReEnrollmentMilestoneFailed = "An error occurred while restoring re-enrollment milestone for userId: {UserId}, id: {Id}";
            public const string SaveEnrollmentLimitsFailed = "An error occurred while saving admissions enrollment limits for userId: {UserId}";
            public const string GetProspectListFailed = "An error occurred while getting prospect list for orgId: {OrgId}, userId: {UserId}";
            public const string GetReEnrollmentStatusFailed = "An error occurred while getting re-enrollment status for orgId: {OrgId}, userId: {UserId}";
            public const string DisableProspectFailed = "An error occurred while disabling prospect {TargetUserId} for orgId: {OrgId}";
            public const string ResetRegistrationStatusFailed = "An error occurred while resetting registration status for orgId: {OrgId}, userId: {UserId}";
        }

        public static class SMSUnitPlanLogMessages
        {
            public const string GetInitialDataFailed = "Failed to load unit plan initial data for user {UserId}.";
            public const string GetListViewFailed = "Failed to load unit plan list for user {UserId}.";
            public const string GetSharedListViewFailed = "Failed to load shared unit plan list for user {UserId}.";
            public const string GetAddDataFailed = "Failed to load unit plan add data for unit plan {UnitPlanId}.";
            public const string CreateFromTemplateFailed = "Failed to create unit plan from template {TemplateId}.";
            public const string CopyUnitPlanFailed = "Failed to copy unit plan {UnitPlanId}.";
            public const string SaveUnitPlanFailed = "Failed to save unit plan for user {UserId}.";
            public const string DeleteUnitPlanFailed = "Failed to delete unit plan {UnitPlanId}.";
            public const string SubmitForReviewFailed = "Failed to submit unit plan {UnitPlanId} for review.";
            public const string GetCoursesByGradeFailed = "Failed to load unit plan courses for grade {GradeLevelId}.";
            public const string GetReviewCommentsFailed = "Failed to load unit plan review comments {ReviewIds}.";
            public const string MarkReviewCommentsReadFailed = "Failed to mark unit plan review comments read for review {ReviewId}.";
            public const string SaveReviewCommentsFailed = "Failed to save unit plan review comments {ReviewId}.";
            public const string GetUnitPlanTemplatesFailed = "Failed to load unit plan templates for user {UserId}.";
            public const string GetUnitPlanTemplateFailed = "Failed to load unit plan template {TemplateId}.";
            public const string CheckUnitPlanTemplateNameFailed = "Failed to check unit plan template name {TemplateName}.";
            public const string PreviewUnitPlanTemplateFailed = "Failed to preview unit plan template {TemplateId}.";
            public const string SaveUnitPlanTemplateFailed = "Failed to save unit plan template for user {UserId}.";
            public const string DeleteUnitPlanTemplateFailed = "Failed to delete unit plan template {TemplateId}.";
        }

        public static class SMSLessonPlanLogMessages
        {
            public const string GetInitialDataFailed = "An error occurred while getting Lesson Plan initial data for orgId: {OrgId}, userId: {UserId}";
            public const string GetWeekViewFailed = "An error occurred while getting Lesson Plan week view for orgId: {OrgId}, userId: {UserId}";
            public const string GetDayViewFailed = "An error occurred while getting Lesson Plan day view for orgId: {OrgId}, userId: {UserId}";
            public const string GetListViewFailed = "An error occurred while getting Lesson Plan list view for orgId: {OrgId}, userId: {UserId}";
            public const string GetLessonPlansByIdsFailed = "An error occurred while getting Lesson Plans by ids: {LessonPlanIds}";
            public const string DeleteLessonPlanFailed = "An error occurred while deleting Lesson Plan {LessonPlanId} for orgId: {OrgId}";
            public const string GetReviewCommentsFailed = "An error occurred while getting Lesson Plan review comments for reviewId: {ReviewId}";
            public const string UpdateCommentsReadFailed = "An error occurred while updating Lesson Plan comments read status for lessonPlanId: {LessonPlanId}";
            public const string GetAddDataFailed = "An error occurred while getting Lesson Plan add data for lessonTemplateId: {LessonTemplateId}, lessonPlanId: {LessonPlanId}";
            public const string CreateFromTemplateFailed = "An error occurred while creating Lesson Plan from template {LessonTemplateId} for userId: {UserId}";
            public const string CopyLessonPlanFailed = "An error occurred while copying Lesson Plan {LessonPlanId} for userId: {UserId}";
            public const string SaveLessonPlanFailed = "An error occurred while saving Lesson Plan for orgId: {OrgId}, userId: {UserId}";
            public const string GetCoursesByGradeFailed = "An error occurred while getting Lesson Plan courses for gradeLevelId: {GradeLevelId}, orgId: {OrgId}";
            public const string GetUnitPlansFailed = "An error occurred while getting Lesson Plan unit plans for gradeId: {GradeId}, classId: {ClassId}";
            public const string GetSkillsFailed = "An error occurred while getting Lesson Plan skills for courseName: {CourseName}, gradeId: {GradeId}";
            public const string GetStandardsFailed = "An error occurred while getting Lesson Plan standards for gradeId: {GradeId}, skillIds: {SkillIds}";
            public const string GetClassPermissionFailed = "An error occurred while getting Lesson Plan class permission for classId: {ClassId}, userId: {UserId}";
            public const string SubmitForReviewFailed = "An error occurred while submitting Lesson Plan {LessonPlanId} for review";
            public const string SaveReviewCommentsFailed = "An error occurred while saving Lesson Plan review comments for reviewId: {ReviewId}";
            public const string UploadAttachmentFailed = "An error occurred while uploading Lesson Plan attachment for lessonPlanId: {LessonPlanId}, componentId: {ComponentId}";
            public const string DeleteAttachmentFailed = "An error occurred while deleting Lesson Plan attachment {FileName} for lessonPlanId: {LessonPlanId}, componentId: {ComponentId}";
            public const string GetTemplatesFailed = "An error occurred while getting Lesson Plan templates for userId: {UserId}";
            public const string GetTemplateEditFailed = "An error occurred while getting Lesson Plan template edit data for templateId: {TemplateId}";
            public const string SaveTemplateFailed = "An error occurred while saving Lesson Plan template for userId: {UserId}";
            public const string DeleteTemplateFailed = "An error occurred while deleting Lesson Plan template {TemplateId}";
            public const string TemplateNameExistsFailed = "An error occurred while validating Lesson Plan template name {TemplateName} for userId: {UserId}";
            public const string GetTemplatePreviewFailed = "An error occurred while getting Lesson Plan template preview for templateId: {TemplateId}";
        }

        public static class SMSClassDetailLogMessages
        {
            public const string GetMyClassesFailed = "An error occurred while getting my classes for orgId: {OrgId}, userId: {UserId}";
            public const string GetMyClassesPageDataFailed = "An error occurred while getting my classes page data for orgId: {OrgId}, userId: {UserId}";
            public const string GetClassAttendancePageDataFailed = "An error occurred while getting class attendance page data for orgId: {OrgId}, classId: {ClassId}";
            public const string GetClassPermissionsFailed = "An error occurred while getting class permissions for classId: {ClassId}, userId: {UserId}";
            public const string TakeClassAttendanceFailed = "An error occurred while saving class attendance for orgId: {OrgId}, classId: {ClassId}";
            public const string ResetFirstAttendanceDateFailed = "An error occurred while resetting first attendance date for classId: {ClassId}";
            public const string GetClassRosterPageDataFailed = "An error occurred while getting class roster page data for classId: {ClassId}, userId: {UserId}";
            public const string UpdateClassRosterDatesFailed = "An error occurred while updating class roster dates for classId: {ClassId}";
            public const string ClearClassRosterWithdrawalFailed = "An error occurred while clearing class roster withdrawal for classId: {ClassId}, userId: {UserId}";
            public const string DeleteStudentFromClassRosterFailed = "An error occurred while deleting student {StudentId} from class roster for classId: {ClassId}";
            public const string AddStudentToClassRosterFailed = "An error occurred while adding student {StudentId} to class roster for classId: {ClassId}";
            public const string GetClassCatalogFailed = "An error occurred while getting class catalog for orgId: {OrgId}, userId: {UserId}";
            public const string GetCatalogTermsFailed = "An error occurred while getting class catalog terms for orgId: {OrgId}, userId: {UserId}";
            public const string GetAddNewClassDataFailed = "An error occurred while getting add new class data for orgId: {OrgId}";
            public const string GetClassDataFailed = "An error occurred while getting class data for classId: {ClassId}, userId: {UserId}";
            public const string GetCoursePropertiesFailed = "An error occurred while getting course properties for orgId: {OrgId}, courseId: {CourseId}";
            public const string GetEditClassDataFailed = "An error occurred while getting edit class data for classId: {ClassId}, userId: {UserId}";
            public const string GetClassWeightsSummaryFailed = "An error occurred while getting class weights summary for classId: {ClassId}";
            public const string GetClassesSectionFailed = "An error occurred while getting classes section for orgId: {OrgId}, gradeLevel: {GradeLevel}";
            public const string GetCoursesSectionFailed = "An error occurred while getting courses section for orgId: {OrgId}, gradeLevel: {GradeLevel}";
            public const string SaveClassFailed = "An error occurred while saving class for orgId: {OrgId}, userId: {UserId}";
            public const string UpdateClassFailed = "An error occurred while updating class {ClassId} for orgId: {OrgId}, userId: {UserId}";
            public const string DeleteClassFailed = "An error occurred while deleting class {ClassId} for orgId: {OrgId}, userId: {UserId}";
            public const string SaveSectionFailed = "An error occurred while saving class sections for teacherId: {TeacherId}";
            public const string SaveCourseSectionFailed = "An error occurred while saving course sections for teacherId: {TeacherId}";
            public const string SaveClassSettingsFailed = "An error occurred while saving class settings for classId: {ClassId}, userId: {UserId}";
            public const string GetSchoolwideAbsenteesPageDataFailed = "An error occurred while getting schoolwide absentees page data for orgId: {OrgId}";
            public const string SaveSchoolwideAttendanceFailed = "An error occurred while saving schoolwide attendance for orgId: {OrgId}";
            public const string GetClassAssignmentsPageDataFailed = "An error occurred while getting class assignments page data for classId: {ClassId}";
            public const string GetAssignmentListPageDataFailed = "An error occurred while getting assignment list page data for classId: {ClassId}";
            public const string GetAssignmentForEditFailed = "An error occurred while getting assignment for edit taskId: {TaskId}";
            public const string SaveAssignmentFailed = "An error occurred while saving assignment for classId: {ClassId}";
            public const string UpdateAssignmentFailed = "An error occurred while updating assignment taskId: {TaskId}";
            public const string DeleteAssignmentFailed = "An error occurred while deleting assignment taskId: {TaskId}";
            public const string ToggleAllowOnlineSubmissionFailed = "An error occurred while toggling online submission for taskId: {TaskId}";
            public const string UpdateAssignmentPostableFailed = "An error occurred while updating assignment postable for taskId: {TaskId}";
            public const string UpdateAssignmentIncludeInCalculatedFailed = "An error occurred while updating assignment include in calculated for taskId: {TaskId}";
            public const string CheckAssignmentCategoryFailed = "An error occurred while checking assignment category for classId: {ClassId}";
            public const string CopyAssignmentFailed = "An error occurred while copying assignment taskId: {TaskId}";
            public const string UploadAssignmentFilesFailed = "An error occurred while uploading assignment files";
            public const string GetAssignmentClassSettingsPageDataFailed = "An error occurred while getting assignment class settings for classId: {ClassId}";
            public const string UpdateAssignmentClassWeightsFailed = "An error occurred while updating assignment class weights for classId: {ClassId}";
            public const string SaveEditedAssignmentCategoryFailed = "An error occurred while renaming assignment category for classId: {ClassId}";
            public const string GetUploadManagerPageDataFailed = "An error occurred while getting upload manager page data for classId: {ClassId}";
            public const string GetUploadManagerTaskListFailed = "An error occurred while getting upload manager task list for classId: {ClassId}";
            public const string GetUploadManagerFileInfoFailed = "An error occurred while getting upload manager file info for fileId: {FileId}";
            public const string SaveUploadManagerFileFailed = "An error occurred while saving upload manager file for classId: {ClassId}";
            public const string UpdateUploadManagerFileFailed = "An error occurred while updating upload manager file for fileId: {FileId}";
            public const string DeleteUploadManagerFileFailed = "An error occurred while deleting upload manager file for fileId: {FileId}";
            public const string GetGradebookPageDataFailed = "An error occurred while getting gradebook page data for classId: {ClassId}";
            public const string ToggleIncludeInCalculatedFailed = "An error occurred while toggling include in calculated for taskId: {TaskId}";
            public const string GetAssignmentGradesPageDataFailed = "An error occurred while getting assignment grades page data for classId: {ClassId}, assignmentId: {AssignmentId}";
            public const string SaveAssignmentGradesFailed = "An error occurred while saving assignment grades for taskId: {TaskId}";
            public const string ToggleOnlineSubmissionsFailed = "An error occurred while toggling online submissions for taskId: {TaskId}";
            public const string GetSingleStudentTermGradesPageDataFailed = "An error occurred while getting single student term grades page data for studentId: {StudentId}";
            public const string UpdateSingleStudentTermGradeFailed = "An error occurred while updating single student term grade for studentId: {StudentId}";
            public const string UpdateSingleStudentHrCommentFailed = "An error occurred while updating single student HR comment for studentId: {StudentId}";
            public const string UpdateSingleStudentPrincipalCommentFailed = "An error occurred while updating single student principal comment for studentId: {StudentId}";
            public const string GetFinalTermGradesPageDataFailed = "An error occurred while getting final term grades page data for classId: {ClassId}, termId: {TermId}";
            public const string SaveFinalTermGradesFailed = "An error occurred while saving final term grades for classId: {ClassId}, termId: {TermId}";
            public const string GetStudentTaskGradesPageDataFailed = "An error occurred while getting student task grades page data for classId: {ClassId}, studentId: {StudentId}";
            public const string GetStudentGradesForClassPageDataFailed = "An error occurred while getting student grades for class preview page data for classId: {ClassId}, studentId: {StudentId}";
            public const string SaveStudentTaskGradesFailed = "An error occurred while saving student task grades for staffId: {StaffId}";
        }

        public const string GetFailed = "An error occurred in @Method while getting all records";
        public const string GetByIdFailed = "An error occurred while getting the data by Id : {Id} ";
        public const string SaveFailed = "An error occurred while saving the data.";
        public const string DeleteFailed = "An error occurred while deleting the record with Id ";
        public const string DeleteFailedById = "An error occurred while deleting the record with Id : {id}";
        public const string AuthFailed = "An error occurred while authenticating the user : {UserName}.";
        public const string UpdateFailed = "An error occurred while update the record with Id : {Id} ";
        public const string FetchFailed = "An error occurred while fetching the record with Id : {Id} ";
        public const string AuthUpdateFailed = "An error occurred while update the record with Id : {Id}";
        public const string ReportGenerateFailed = "An error occurred while generating the report.";
        public const string BackgroundJobFailed = "An error occurred while running the background job.";
        public const string BackgroundJobFailedDate = "An error occurred while process the order draft with order date: {Date}.";
        public const string RecurringReorderFailed = "Failed to create purchase order draft for RecurringReorder {RecurringReorderId}.";
        public const string RecurringReorderSuccess = "{recurringReorders.Count} purchase order drafts have been successfully created.";
        public const string RecurringKitchenOrderFailedKitchenItemDetails = "Failed to generate kitchen order while getting kitchen order item details for the DietAdviceId : {DietAdviceId}.";
        public const string RecurringKitchenOrderFailedExistingOrders = "Failed to generate kitchen order while getting existing orders for the AdmissionId : {AdmissionId}.";
        public const string RecurringKitchenOrderFailedAvailableMeals = "Failed to generate kitchen order while getting available meals for the MenuSetupId : {MenuSetupId} , AdmissionId : {AdmissionId}, DietAdviceId : {DietAdviceId}.";
        public const string RecurringKitchenOrderFailedNewOrders = "Failed to generate kitchen order while getting new orders";
        public const string RecurringKitchenOrderSuccess = "Recurring kitchen orders have been successfully created. Success : {successCount} , Failed : {failedCount} , Total : {totalCount}.";
        public const string PurchaseOrderFaild = "Something went wrong while creating the purchase order.";
        public const string AutoCloseMRQ = "Auto-closed MRQ ID {mrnID} Requested_at : {date}";
        public const string AutoClosePRQ = "Auto-closed PRQ ID: {prq.Id} Requested_at : {date}";
        public const string AutoCloseMRNs = "Auto-closed MRNs-{Count} successfully.";
        public const string AutoCloseMRNsAndPRQs = "Auto-closed MRNs-{Count} and PRQs-{Count} successfully.";
        public const string AutoCloseMRNsAndPRQsFailed = "An error occurred while auto-closing MRNs and PRQs.";
        public const string PONotFound = "Purchase Order with ID {PurchaseOrderId} not found.";
        public const string VendorEmailMissing = "Vendor email is missing for Purchase Order ID {PurchaseOrderId}.";
        public const string SendEmailSuccess = "Purchase Order email sent successfully for ID {PurchaseOrderId} to {VendorEmail}.";
        public const string SendEmailFailed = "An error occurred while sending Purchase Order email for ID {PurchaseOrderId}.";
        public const string GetPreview = "An error occurred while Select Purchase Order email for ID {PurchaseOrderId}.";
        public const string DefaultExpiryDaysNotFound = "Default expiry days not found";
        public const string CapitalReqNo = "Capital Request with ID {CapitalReqId} not found.";
        public const string CapitalReqMailMissing = "No email address found for Capital Request with ID {CapitalReqId}.";
        public const string CapitalReqMailSuccess = "Capital Request email sent successfully for ID {CapitalReqId} to {Useremail}.";
        public const string CapitalReqMailFailed = "An error occurred while sending Capital Req email for ID {CapitalReqId}.";

        public const string POCancelMailMissing = "No email address found for PO Request with ID {PurchaseOrderId}.";
        public const string POCancelMailSuccess = "PO Request email sent successfully for ID {PurchaseOrderId} to {Useremail}.";
        public const string POCancelMailFailed = "An error occurred while sending PO Req email for ID {PurchaseOrderId}.";

        public const string NonStockNotFound = "Non Stock Item with ID {NonStockId} not found.";
        public const string NonStockEmailMissing = "Non Stock email is missing for Non Stock ID {NonStockId}.";
        public const string NonStockEmailSuccess = "Non Stock email sent successfully for ID {NonStockId} to {VendorEmail}.";
        public const string NonStockEmailFailed = "An error occurred while sending Non Stock email for ID {NonStockId}.";
        public const string DefaultExpiryDays = "Default expiry days is : {days}";
        public const string NoMRNsToClose = "No MRNs to close";
        public const string MailSendingNotAllowedMessage = "Please contact the admin to enable mail sending settings.";
        public const string NoWorkOrderExpiryClose = "No work order expiry to close";
        public const string WorkOrderExpiry = "Work order expiry -{Count} saved successfully.";
        public const string WorkOrderExpiryFailed = "An error occurred while work order expiry failed.";

        public const string SetupOptionsNotFound = "No Result Found.";
        public const string NoOrderAlert = "No Alerts is Enabled.";
        public const string StockableAlert = "Stockable alert is disabled.";
        public const string NoofdaysforStockableAlert = "No of days for stockable alert is not set.";
        public const string CapitalNonStockableAlert = "An error occurred while inserting the Capital NonStockable Alerts.";
        public const string StockableOnDemandAlert = "An error occurred while inserting the Stockable OnDemand Alerts.";
        public const string FailedToCreatePaymentLink = "Failed to create payment link for appointment {AppointmentId}: {Error}";
        public const string FailedToCreatePaymentLinkForReschedule = "Error creating payment link for reschedule";
        public const string FailedToProcessRefund = "Failed to process refund for appointment {AppointmentId}: {Error}";
        public const string FailedToProcessRefundForReschedule = "Error processing refund for appointment {AppointmentId}";
        public const string RefundInitiated = "Refund initiated for appointment {AppointmentId}. RefundId: {RefundId}, Amount: {Amount}";
        public const string RefundInitiatedForReschedule = "Appointment Rescheduled - Fee Difference Refund";
        public const string NoPaymentId = "No payment ID found for appointment {AppointmentId}, skipping refund";
        public const string MailFormatNotFound = "Mail format not found for code: {MailCode}";
        public const string FailedToFetchPatientName = "Failed to fetch patient name for cancellation message";
        public const string PaymentLinkCreated = "Payment link created for appointment {AppointmentId}. Link: {PaymentLink}";
        public const string FailedToNotifyReschedule = "Error sending reschedule notification";
        public const string RescheduleEmailSent = "Reschedule email sent to {Email} for patient {PatientCode}";
        public const string FailedToNotifyRescheduleEmail = "Failed to send reschedule email to {Email}";
        public const string RescheduleWhatsAppSent = "Reschedule WhatsApp sent to {Phone} for patient {PatientCode}";
        public const string FailedToNotifyRescheduleWhatsApp = "Failed to send reschedule WhatsApp to {Phone}";
        public const string BbhPaymentLinkResponse = "Payment Link Response {BbhPaymentLinkResponse}";
        public const string FailedToReschedule = "Transaction failed while rescheduling appointment";
        public const string RescheduleSuccess = "The appointment has been rescheduled successfully with complete payment for id {BookingId}.";
        public const string PaymentStatusUpdated = "Payment status updated successfully for appointmentId: {AppointmentId}";
        public const string PaymentStatusUpdateFailed = "Payment status update failed";
        public const string FailedToGetMailFormat = "Error in getting mail format {@mailCode}";

        // Mail process handling
        public const string MailSentSuccessfullyMessage = "The email was sent successfully.";

        public const string MailFailedMessage = "Failed to send the email. Please try again later";
        public const string ItemReturnMailFailedMessage = "Failed to send the email. Please try again later {id},{id}";
        public const string MailAttachmentErrorMessage = "There was an error with the email attachment. Please ensure the file is valid and try again";
        public const string EmailMissing = "Email is missing for {email}.";

        public const string CompletedProcess = "Authorization process has already been completed.";
        public const string AuthProcessSuccess = "Authorization process Success.";

        public const string RejectedFalid = "An error occurred while reject the record with Id : {id}";

        public const string CancelFailed = "An error occurred while processing the cancellation.";

        public const string DeviceConfigNotFound = "Error fetching device config with types by code: {DeviceCode}";
        public const string FailedToGenerateToken = "Error generating token with device type. DeviceConfigId: {DeviceConfigId}, DeviceTypeId: {DeviceTypeId}";
        public const string ErrorGetCardActivityReport = "Error getting card activity report";
        public const string ErrorGetAchActivityReport = "Error getting ACH activity report";
        public const string ErrorGetPriorityReport = "Error getting Priority report";
        public const string ErrorGetSurveyReport = "Error getting Survey report";
        public const string ErrorGetHallowReport = "Error getting Hallow report";
        public const string ErrorGetSponsorVisitingSummary = "Error getting Sponsor visiting summary report";
        public const string ErrorGetTrainingRegistrants = "Error getting Training registrants report";
        public const string ErrorGetNewSchoolStatus = "Error getting New school status report";
        public const string ErrorGetFeatureUsage = "Error getting Feature usage report";
        public const string ErrorGetFormerUIAccessLogsList = "Error getting Former UI access logs list report";
        public const string ErrorGetServicesReports = "Error getting Services reports";
        public const string ErrorGetAutoWithdrawalList = "Error getting Auto withdrawal list report";
        public const string ErrorGetEmailConversion = "Error getting Email conversion report";
        public const string ErrorGetUserInformation = "Error getting User information report";
        public const string ErrorGetPasUsageLogs = "Error getting PAS usage logs report";
        public const string ErrorGetSchoolTermDates = "Error getting School term dates report";
        public const string ErrorGetSchoolContractEndDates = "Error getting School contract end dates report";
        public const string ErrorGetSchoolSetupDates = "Error getting School setup dates report";
        public const string ErrorGetProspectCounts = "Error getting Prospect counts report";
        public const string ErrorGetPromotionRegistrants = "Error getting Promotion registrants report";
        public const string ErrorPrepareMailingLabels = "Error preparing mailing labels report";
        public const string ErrorGetContentViewLogs = "Error getting Content view logs report";
        public const string ErrorGetParentAccountSetup = "Error getting Parent account setup report";
        public const string ErrorGetTrainingRegistrantsByTopic = "Error getting Training registrants by topic report";

        public static class ConductLogMessages
        {
            public const string UpdateSettingsAsync = "Failed to update conduct settings";
            public const string UpdateConductItemAsync = "Failed to update conduct item {Id}";
            public const string UpdateLocationAsync = "Failed to update conduct location {Id}";
            public const string UpdateActionAsync = "Failed to update conduct action {Id}";
            public const string GetStudentConductPageAsync = "Failed to get student conduct page";
            public const string SaveStudentConductAsync = "Failed to save student conduct";
            public const string DeleteStudentConductAsync = "Failed to delete student conduct {Id}";
            public const string GetStudentsBySearchAsync = "Failed to search students for conduct";
        }

        public static class ConferenceLogMessages
        {
            public const string GetConferenceListFailed = "Failed to get conference list for user {UserId}";
            public const string GetConferenceListDetailsFailed = "Failed to get conference list details for conference {ConferenceId}";
            public const string GetNewConferencePageFailed = "Failed to get new conference page for user {UserId}";
            public const string SaveConferenceFailed = "Failed to save conference for user {UserId}";
            public const string GetMasterListFailed = "Failed to get conference master list for user {UserId}";
            public const string GetMasterDetailsFailed = "Failed to get master conference details for settings id {ConferenceSettingsId}";
            public const string UpdateMasterConferenceFailed = "Failed to update master conference for settings id {ConferenceSettingsId}";
            public const string DeleteConferenceFailed = "Failed to delete conference {ConferenceId}";
            public const string DeleteMasterConferenceFailed = "Failed to delete master conference {ConferenceSettingsId}";
        }

        public static class ClassReportMessages
        {
            public const string GetClassReportsFailed = "Failed to get class reports";
            public const string GetStudentRosterFailed = "Failed to get student roster for class {ClassID}";
            public const string GetMissingAssignmentsTeacherFailed = "Failed to get missing assignments for teacher org {OrgID} class {ClassId}";
            public const string GetTermGradeUpdateLogFailed = "Failed to get term grade update log for class {ClassID}";
            public const string GetClassDisciplineHistoryFailed = "Failed to get class discipline history for class {ClassID}";
            public const string GetStudentAccessLogFailed = "Failed to get student access log for class {ClassID}";
            public const string GetClassReportCardsFailed = "Failed to get class report cards for class {ClassID}";
            public const string GetStudentProfilesFailed = "Failed to get student profiles for class {ClassID}";
            public const string GetClassAveragesFailed = "Failed to get class averages for class {ClassID}";
            public const string RecordClassReportHitFailed = "Failed to record class report hit user {UserID} report {ReportID}";
            public const string GetStaffScheduleFailed = "Failed to get staff schedule";
        }

        public static class SMSAccountBalanceStatementLogMessages
        {
            public const string GetPageFailed = "AccountBalanceStatementService.GetPageAsync failed for OrgId {OrgId}";
            public const string FilterTransactionsFailed = "AccountBalanceStatementService.FilterTransactionsAsync failed for OrgId {OrgId}";
            public const string ExportExcelFailed = "AccountBalanceStatementService.ExportExcelAsync failed for OrgId {OrgId}";
            public const string UpdateNextApprovedFailed = "AccountBalanceStatementService.UpdateNextApprovedAsync failed for OrgId {OrgId}";
            public const string CheckPrimaryExistFailed = "AccountBalanceStatementService.CheckPrimaryExistAsync failed for OrgId {OrgId}";
            public const string UpdateMMWizardActionFailed = "AccountBalanceStatementService.UpdateMMWizardActionAsync failed for OrgId {OrgId}";
            public const string GetMakePaymentFailed = "StaffPaymentService.GetMakePaymentAsync failed for OrgId {OrgId}";
            public const string GetStaffMakePaymentPageFailed = "StaffPaymentRepository.GetStaffMakePaymentPageAsync failed for UserID {UserId}";
        }

        /// <summary>Serilog templates for SMS portal header notifications and sponsor ads.</summary>
        public static class SMSPortalLogMessages
        {
            public const string GetHeaderNotificationsFailed = "Failed to load header notifications for user";
            public const string GetAnnouncementsFailed = "Failed to load announcements for OrgId {OrgId} UserId {UserId}";
            public const string GetPrivateMessageCountFailed = "Failed to load private message count for user";
            public const string GetUserPrivateMessagesFailed = "Failed to load user private messages for user";
            public const string GetPrivateMessageDetailFailed = "Failed to load private message detail for MessageId {MessageId} UserId {UserId}";
            public const string GetSponsorAdsFailed = "Failed to load sponsor ads for OrgId {OrgId}";
            public const string SaveSponsorHitFailed = "Failed to save sponsor hit for SponsorAdId {SponsorAdId}";
        }
    }

    public static class InfoMessages
    {
        public const string ActivationSuccess = "Activated Successfully.";
        public const string AreadyActivaded = "This system is already activated with a productkey.";
        public const string InvalidKey = "Product Key is not valid.";
    }

    public static class DefaultPage
    {
        public const string WebStart = @"<html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f0f0f0;
                }
                .container {
                    text-align: center;
                    background-color: #fff;
                    padding: 50px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1>Welcome to {0} Service!</h1> <br/>
<a   href='/swagger'>Swagger UI</a>
            </div>

        </body>
    </html>";

        public const string Home = "Home";

    }
}

