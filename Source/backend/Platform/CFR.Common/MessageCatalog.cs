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
        public const int BadRequest = 400;
        public const int UnAuthorized = 401;
        public const int Forbidden = 403;
        public const int NotFound = 404;
        public const int Conflict = 409;
        public const int UnprocessableEntity = 422;
        public const int PreconditionFailed = 412;
        public const int InternalServerError = 500;
    }

    public static class ErrorMessages
    {
        public const string Success = "Success";
        public const string Error = "An error occurred.";
        public const string SaveFailed = "Save failed.";
        public const string UnknownError = "Unknown error.";
        public const string Undefined = "Undefined.";
        public const string NoRecordFound = "No record found.";
        public const string DeleteSuccess = "Deleted successfully.";
        public const string DeleteFailed = "Delete failed.";
        public const string InternalServerError = "An internal server error occurred.";
        public const string InvalidLogin = "Invalid email or password.";
        public const string ExistUser = "A user with this email already exists.";
        public const string CannotModifySelfStatus = "You cannot deactivate or lock your own account. Ask another administrator to do this.";
        public const string CannotDeleteSelf = "You cannot delete your own account. Ask another administrator to do this.";
        public const string CannotDeactivateLastAdmin = "You cannot deactivate the last active administrator. Assign another user as administrator first.";
        public const string CannotDeleteLastAdmin = "You cannot delete the last active administrator. Assign another user as administrator first.";
        public const string InvalidEmailFormat = "Enter a valid email address.";
        public const string NameTooLong = "First and last name cannot exceed 50 characters.";
        public const string InvalidContactNumber = "Enter a valid 10-digit US contact number.";
        public const string FutureDateOfBirth = "Date of birth cannot be in the future.";
        public const string DateOfBirthOutOfRange = "Date of birth must reflect an age between 18 and 120 years.";
        public const string ExistRole = "A role with this name already exists.";
        public const string RoleInUse = "This role is assigned to one or more users.";
        public const string RoleNotFound = "This role no longer exists.";
        public const string InsufficientRoleRights = "You do not have permission to manage user roles.";
        public const string Failed = "The request could not be completed.";
        public const string BadRequest = "Invalid request.";
        public const string UnAuthorized = "Unauthorized.";
        public const string ResetInstructionsSent = "If an account exists for this email address, password reset instructions have been sent to it.";
        public const string ResetEmailSendFailed = "We couldn't send the password reset email. Please try again in a few minutes.";
        public const string ResetAlreadyRequestedRecently = "A password reset link is already on its way to this email address and is still valid. Check your inbox (and spam folder) for that link before requesting a new one.";
        public const string InvalidResetToken = "This reset link is invalid or has expired.";
        public const string ResetTokenAlreadyUsed = "This reset link has already been used. Please request a new one.";
        public const string ResetTokenExpired = "This reset link has expired. Please request a new one.";
        public const string PasswordMismatch = "The new passwords do not match or do not meet the minimum length.";
        public const string PasswordTooWeak = "Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.";
        public const string PasswordTooLong = "Password cannot exceed 50 characters.";
        public const string ExistEmailTemplateCode = "A template with this code already exists.";
        public const string InvalidTemplateBodyContent = "The template body contains a script, event-handler attribute, or javascript/data link, which is not allowed.";
        public const string LinkExpiryMinutesOutOfRange = "Link expiry must be between 5 and 1440 minutes (24 hours).";
        public const string InvalidCurrentPassword = "Your current password is incorrect.";
        public const string NewPasswordSameAsCurrent = "Your new password must be different from your current password.";
        public const string ProfileUpdated = "Profile updated successfully.";
        public const string PasswordChanged = "Password changed successfully.";
        public const string OrganizationUpdated = "Organization updated successfully.";
        public const string OrganizationCreated = "Organization created successfully.";
        public const string OrganizationNotFound = "Organization not found.";
        public const string ProductAlreadyAssigned = "This product is already assigned to the organization.";
        public const string ProductAssigned = "Product assigned successfully.";
        public const string ProductNotAssigned = "This product is not assigned to the organization.";
        public const string ProductRemoved = "Product removed successfully.";
        public const string UserNotLinked = "This user is not linked to the organization.";
        public const string UserUnlinked = "User removed successfully.";
        public const string ExistAccessRequest = "A pending access request for this product already exists for this organization.";
        public const string AccessRequestProductNotFound = "The requested product is not available.";
        public const string AccessRequestMemberNotFound = "No member account was found for this email.";
        public const string AccessRequestOrgNotFound = "No organization is linked to this member.";
        public const string AccessRequestEmailOrganizationExists = "This email and organization already exist in Catholic Solutions. Please sign in to request access.";
        public const string AccessRequestEmailAlreadyCfrUser = "You already have a Catholic Solutions account with this email address. Please sign in to request access, or use a different email address.";
        public const string AccessRequestAlreadyDecided ="This product request has already been decided.";
        public const string AccessRequestProductContactMissing = "This product has no contact user set up, so the request could not be sent to the vendor. Set a contact person on the product and try again.";
        public const string AccessRequestVendorEmailFailed = "The email to the product contact could not be sent, so the request was not sent to the vendor. Please try again.";
        public const string ProductRequestNotFound = "This product suggestion no longer exists.";
        public const string ProductRequestAlreadyDecided = "This product suggestion has already been approved or rejected.";
        public const string ExistProduct = "A product with this name already exists.";
        public const string ExistLicense = "A license has already been created for this duration.";
        public const string ProductNotFound = "Product not found.";
        public const string ProductDisabled = "This product is not available.";
        public const string ProductNotAssignedToUser = "This product is not assigned to the current user.";
        public const string ExternalPageUrlMissing = "This product does not have a launch URL configured.";
        public const string InvalidAuthorizationCode = "The authorization code is invalid.";
        public const string ExpiredAuthorizationCode = "The authorization code has expired.";
        public const string AuthorizationCodeUsed = "The authorization code has already been used.";
        public const string AuthorizationCodeProductMismatch = "The authorization code does not belong to this product.";
        public const string LicenseNotFound = "License not found.";
        public const string InvalidLicenseOrgProduct = "Invalid Organization or Product for license creation.";
        public const string ProductLogoFileRequired = "File is empty or not provided.";
        public const string ProductLogoFileTooLarge = "File size cannot exceed 2 MB.";
        public const string ProductLogoInvalidType = "Only JPG and PNG images are allowed.";
        public const string EmailLogoFileRequired = "File is empty or not provided.";
        public const string EmailLogoFileTooLarge = "File size cannot exceed 2 MB.";
        public const string EmailLogoInvalidType = "Only JPG and PNG images are allowed.";
        public const string DashboardInvalidDateRange = "Start date must be on or before the end date.";
        public const string DashboardDateRangeTooLarge = "The selected date range is too large. Choose a range of 366 days or fewer.";

        // CFR.DataSync — HMAC auth + user sync
        public const string Unauthenticated = "Authentication failed.";
        public const string ScopeDenied = "The API client is not authorized for this operation.";
        public const string ValidationFailed = "The request failed validation.";
        public const string InvalidEmail = "The email address is not a valid format.";
        public const string OrgNotOnboarded = "The organization is not onboarded for this product.";
        public const string OrgInactive = "The organization is not active for this product.";
        public const string SyncUserAlreadyExists = "A user with this externalUserId already exists for this organization.";
        public const string SyncUserNotFound = "No user was found for the given externalUserId and productOrgId.";
        public const string SyncRoleNotFound = "The specified roleId was not found.";
        public const string ConcurrencyConflict = "The record was modified by another request. Refresh and try again.";
        public const string IdempotencyKeyReuse = "The Idempotency-Key was already used with a different request body.";
        public const string DuplicateInFile = "Duplicate externalUserId/productOrgId within the same file.";
        public const string RateLimitExceeded = "Too many requests. Try again later.";
        public const string PayloadTooLarge = "The request body exceeds the maximum allowed size.";
        public const string EmailRebindConflict = "This email now belongs to a different CFR identity that already has an active membership for this organization.";
        public const string SyncUserNotFoundByEmail = "No CFR identity was found for the given email address.";
    }

    /// <summary>
    /// Stable, machine-readable error codes for the CFR.DataSync product-facing API. Carried as an
    /// <c>ErrorDetail</c> with <c>Field == "code"</c> inside <c>MSResultArgs.Errors</c> so downstream
    /// products can branch on a fixed string rather than the numeric StatusCode alone.
    /// </summary>
    public static class SyncErrorCodes
    {
        public const string Unauthenticated = "UNAUTHENTICATED";
        public const string ScopeDenied = "SCOPE_DENIED";
        public const string ValidationFailed = "VALIDATION_FAILED";
        public const string InvalidEmail = "INVALID_EMAIL";
        public const string OrgNotOnboarded = "ORG_NOT_ONBOARDED";
        public const string OrgInactive = "ORG_INACTIVE";
        public const string UserAlreadyExists = "USER_ALREADY_EXISTS";
        public const string UserNotFound = "USER_NOT_FOUND";
        public const string RoleNotFound = "ROLE_NOT_FOUND";
        public const string ConcurrencyConflict = "CONCURRENCY_CONFLICT";
        public const string IdempotencyKeyReuse = "IDEMPOTENCY_KEY_REUSE";
        public const string DuplicateInFile = "DUPLICATE_IN_FILE";
        public const string RateLimitExceeded = "RATE_LIMIT_EXCEEDED";
        public const string PayloadTooLarge = "PAYLOAD_TOO_LARGE";
        public const string InternalError = "INTERNAL_ERROR";
        public const string EmailRebindConflict = "EMAIL_REBIND_CONFLICT";
    }

    public static class SerilogErrorMessages
    {
        public static class MailLogMessages
        {
            public const string SendMailAttemptFailed = "SMTP send attempt {Attempt} to {ToAddress} via {SmtpServer} failed";
            public const string SendMailDisabled = "Email to {ToAddress} not sent: SMTPMailConfig.SendMailFlag is not \"1\"";        }

        public static class AcutisLogMessages
        {
            public const string GetSteps = "Failed to get";
            public const string LoginAuthenticationFailed = "Error while authenticating Acutis login for {UserName}";
            public const string FetchUsersFailed = "Error while fetching Acutis users";
            public const string FetchUserByIdFailed = "Error while fetching Acutis user {UserId}";
            public const string SaveUserFailed = "Error while saving Acutis user";
            public const string UpdateUserStatusFailed = "Error while updating Acutis user status for {UserId}";
            public const string DeleteUserFailed = "Error while deleting Acutis user {UserId}";
            public const string FetchUserLookupsFailed = "Error while fetching Acutis user lookups";
            public const string FetchCFRUsersFailed = "Error while fetching CFR users for organization {OrgId}";
            public const string FetchUserRolesFailed = "Error while fetching Acutis user roles";
            public const string FetchUserRoleByIdFailed = "Error while fetching Acutis user role {RoleId}";
            public const string SaveUserRoleFailed = "Error while saving Acutis user role";
            public const string UpdateUserRoleStatusFailed = "Error while updating Acutis user role status for {RoleId}";
            public const string DeleteUserRoleFailed = "Error while deleting Acutis user role {RoleId}";
            public const string ForgotPasswordFailed = "Error while processing forgot-password request for {UserName}";
            public const string ResetPasswordFailed = "Error while resetting Acutis user password";
            public const string ValidateResetTokenFailed = "Error while validating Acutis password reset token";
            public const string FetchEmailTemplatesFailed = "Error while fetching email templates";
            public const string FetchEmailTemplateByIdFailed = "Error while fetching email template {TemplateId}";
            public const string SaveEmailTemplateFailed = "Error while saving email template";
            public const string SendTestEmailFailed = "Error while sending test email";
            public const string FetchEmailSettingsFailed = "Error while fetching email settings";
            public const string SaveEmailSettingsFailed = "Error while saving email settings";
            public const string UploadEmailLogoFailed = "Error while uploading email logo";
            public const string RemoveEmailLogoFailed = "Error while removing email logo";
            public const string TestSmtpConnectionFailed = "Error while testing SMTP connection";
            public const string FetchEmailLogoFailed = "Error while fetching email logo";
            public const string FetchProfileFailed = "Error while fetching profile for user {UserId}";
            public const string UpdateProfileFailed = "Error while updating profile for user {UserId}";
            public const string ChangePasswordFailed = "Error while changing password for user {UserId}";
            public const string FetchOrganizationsFailed = "Error while fetching organizations";
            public const string FetchDiocesesFailed = "Error while fetching dioceses";
            public const string FetchOrganizationByIdFailed = "Error while fetching organization {OrganizationId}";
            public const string FetchOrganizationUsersFailed = "Error while fetching organization users for organization {OrgId}";
            public const string FetchOrganizationUserDetailFailed = "Error while fetching organization user detail for organization {OrgId}, user {AuthUserId}";
            public const string FetchProductsFailed = "Error while fetching products";
            public const string FetchOrganizationProductsFailed = "Error while fetching organization products for organization {OrgId}";
            public const string FetchAssignableProductsFailed = "Error while fetching assignable products for organization {OrgId}";
            public const string FetchOrganizationLicensesFailed = "Error while fetching licenses for organization {OrgId}";
            public const string FetchAllLicensesFailed = "Error while fetching licenses across all organizations";
            public const string FetchProductAssignmentSummaryFailed = "Error while fetching product assignment summary";
            public const string FetchProductApiIntegrationsFailed = "Error while fetching API integrations for product {ProductId}";
            public const string UpdateAccessRequestStatusFailed = "Error while updating access request status for request {AccessRequestId}";
            public const string CreateOrganizationFailed = "Error while creating organization";
            public const string AssignOrganizationProductFailed = "Error while assigning product to organization {OrgId}";
            public const string RemoveOrganizationProductFailed = "Error while removing product from organization {OrgId}";
            public const string UnlinkOrganizationUserFailed = "Error while unlinking user from organization {OrgId}";
            public const string UpdateOrganizationFailed = "Error while updating organization {OrgId}";
            public const string FetchProductByIdFailed = "Error while fetching product {ProductId}";
            public const string FetchProductLicensesFailed = "Error while fetching product licenses for {ProductId}";
            public const string FetchLicenseByIdFailed = "Error while fetching license {LicenseId}";
            public const string CreateLicenseFailed = "Error while creating license";
            public const string UpdateLicenseFailed = "Error while updating license {LicenseId}";
            public const string DeleteLicenseFailed = "Error while deleting license {LicenseId}";
            public const string UpdateProductFailed = "Error while updating product {ProductId}";
            public const string UploadProductLogoFailed = "Error while uploading product logo";
            public const string FetchProductLogoFailed = "Error while fetching product logo";
            public const string DeleteProductLogoFailed = "Error deleting previous product logo file {RelativeUrl}";
            public const string FetchUserRightsFailed = "Error while fetching user rights";
            public const string SaveUserRightsFailed = "Error while saving user rights";
            public const string FetchDashboardSummaryFailed = "Error while fetching dashboard summary";
            public const string FetchProductRequestsFailed = "Error while fetching product requests";
            public const string FetchProductRequestByIdFailed = "Error while fetching product request {ProductRequestId}";
            public const string ApproveProductRequestFailed = "Error while approving product request {ProductRequestId}";
            public const string RejectProductRequestFailed = "Error while rejecting product request {ProductRequestId}";
            public const string SendProductRequestEmailFailed = "Error while sending {TemplateCode} email for product request {ProductRequestId}";
            public const string ProductRequestEmailNotSent = "{TemplateCode} email for product request {ProductRequestId} was not sent - see the preceding SMTP log entry";
        }

        public static class SyncLogMessages
        {
            public const string AuthenticationFailed = "Login failed for ClientId {ClientId}";
            public const string CreateUserFailed = "Error while creating synced user for productOrgId {ProductOrgId}";
            public const string BulkCreateUsersFailed = "Error while bulk-creating synced users ({UserCount} rows)";
            public const string UpdateUserFailed = "Error while updating synced user {ExternalUserId}";
            public const string PatchUserFailed = "Error while patching synced user {ExternalUserId}";
            public const string DeactivateUserFailed = "Error while deactivating synced user {ExternalUserId}";
            public const string ReactivateUserFailed = "Error while reactivating synced user {ExternalUserId}";
            public const string SetLoginDisabledFailed = "Error while setting IsLoginDisabled for synced user {ExternalUserId}";
            public const string SetActiveFailed = "Error while setting IsActive for synced user {ExternalUserId}";
            public const string GetUserFailed = "Error while fetching synced user {ExternalUserId}";
            public const string UpsertOrganizationFailed = "Error while upserting synced organization for productOrgId {ProductOrgId}";
            public const string GetOrganizationFailed = "Error while fetching synced organization for productOrgId {ProductOrgId}";
            public const string GetUserProductsFailed = "Error while fetching products for CFR email {Email}";
            public const string UpsertProductRoleFailed = "Error while upserting product role for ProductId {ProductId}";
            public const string GetProductRolesFailed = "Error while fetching product roles for ProductId {ProductId}";
            public const string LaunchProductFailed = "Error while launching product {ProductId} for CFR email {Email}";
        }

        public static class PortalLogMessages
        {
            public const string LoginAuthenticationFailed = "Error while authenticating Portal login for {UserName}";
            public const string FetchAssignedProductsFailed = "Error while fetching assigned products for user {UserId}";
            public const string LaunchProductFailed = "Error while launching product {ProductId} for user {UserId}";
            public const string ExchangeTokenFailed = "Error while exchanging SSO authorization code for product {ProductId}";
            public const string FetchAccessRequestsFailed = "Error while fetching access requests";
            public const string FetchAccessRequestByIdFailed = "Error while fetching access request {RequestId}";
            public const string FetchHubProductsFailed = "Error while fetching App Hub products for {RequesterEmail}";
            public const string FetchDiocesesFailed = "Error while fetching diocese list";
            public const string SaveAccessRequestFailed = "Error while saving access request";
            public const string ExternalOrganizationRequestFailed = "Error while sending external organization request for access request {AccessRequestId}";
            public const string ExternalOrganizationRequestRejected = "SMS rejected external organization request for access request {AccessRequestId}: {ResponseBody}";
            public const string OrgSetupResultPersistFailed = "Error while persisting SMS org setup result (OrgId {OrgId}) for access request {AccessRequestId}";
            public const string ExternalOrganizationRequestMissingFields = "Org setup request for access request {AccessRequestId} is missing required fields: {MissingFields}";
            public const string UpdateAccessRequestStatusFailed = "Error while updating access request status for request {AccessRequestId}";
            public const string SendAccessRequestEmailFailed = "Error while sending {TemplateCode} email for access request {AccessRequestId}";
            public const string SaveProductRequestFailed = "Error while saving product request";
            public const string SendProductRequestEmailFailed = "Error while sending {TemplateCode} email for product request {ProductRequestId}";
            public const string PlatformLaunchExchangeFailed = "Error while exchanging platform-launch code";
        }
    }
}
