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
        public const int NotFound = 404;
        public const int Conflict = 409;
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
        public const string ExistRole = "A role with this name already exists.";
        public const string RoleInUse = "This role is assigned to one or more users.";
        public const string Failed = "The request could not be completed.";
        public const string BadRequest = "Invalid request.";
        public const string UnAuthorized = "Unauthorized.";
        public const string ResetInstructionsSent = "Password reset instructions have been sent to your email address.";
        public const string ResetEmailSendFailed = "We couldn't send the password reset email. Please try again in a few minutes.";
        public const string ResetAlreadyRequestedRecently = "A password reset link is already on its way to this email address and is still valid. Check your inbox (and spam folder) for that link before requesting a new one.";
        public const string AccountNotFound = "No account found with this email address.";
        public const string InvalidResetToken = "This reset link is invalid or has expired.";
        public const string ResetTokenAlreadyUsed = "This reset link has already been used. Please request a new one.";
        public const string ResetTokenExpired = "This reset link has expired. Please request a new one.";
        public const string PasswordMismatch = "The new passwords do not match or do not meet the minimum length.";
        public const string PasswordTooWeak = "Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.";
        public const string ExistEmailTemplateCode = "A template with this code already exists.";
        public const string LinkExpiryMinutesOutOfRange = "Link expiry must be between 5 and 1440 minutes (24 hours).";
        public const string InvalidCurrentPassword = "Your current password is incorrect.";
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
        public const string ExistAccessRequest = "A pending access request for this product already exists.";
        public const string AccessRequestProductNotFound = "The requested product is not available.";
        public const string AccessRequestMemberNotFound = "No member account was found for this email.";
        public const string AccessRequestOrgNotFound = "No organization is linked to this member.";
        public const string AccessRequestAlreadyDecided = "This product request has already been decided.";
        public const string ExistProduct = "A product with this name already exists.";
        public const string ExistLicense = "A license for this customer already exists.";
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
    }

    public static class SerilogErrorMessages
    {
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
            public const string FetchEmailLogoFailed = "Error while fetching email logo";
            public const string FetchProfileFailed = "Error while fetching profile for user {UserId}";
            public const string UpdateProfileFailed = "Error while updating profile for user {UserId}";
            public const string ChangePasswordFailed = "Error while changing password for user {UserId}";
            public const string FetchOrganizationsFailed = "Error while fetching organizations";
            public const string FetchOrganizationByIdFailed = "Error while fetching organization {OrganizationId}";
            public const string FetchOrganizationUsersFailed = "Error while fetching organization users for organization {OrgId}";
            public const string FetchOrganizationUserDetailFailed = "Error while fetching organization user detail for organization {OrgId}, user {AuthUserId}";
            public const string FetchProductsFailed = "Error while fetching products";
            public const string FetchOrganizationProductsFailed = "Error while fetching organization products for organization {OrgId}";
            public const string FetchAssignableProductsFailed = "Error while fetching assignable products for organization {OrgId}";
            public const string FetchOrganizationLicensesFailed = "Error while fetching licenses for organization {OrgId}";
            public const string FetchAllLicensesFailed = "Error while fetching licenses across all organizations";
            public const string FetchProductAssignmentSummaryFailed = "Error while fetching product assignment summary";
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
            public const string UpdateProductFailed = "Error while updating product {ProductId}";
            public const string UploadProductLogoFailed = "Error while uploading product logo";
            public const string FetchProductLogoFailed = "Error while fetching product logo";
            public const string DeleteProductLogoFailed = "Error deleting previous product logo file {RelativeUrl}";
            public const string FetchUserRightsFailed = "Error while fetching user rights";
            public const string SaveUserRightsFailed = "Error while saving user rights";
            public const string FetchDashboardSummaryFailed = "Error while fetching dashboard summary";
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
            public const string SaveAccessRequestFailed = "Error while saving access request";
            public const string UpdateAccessRequestStatusFailed = "Error while updating access request status for request {AccessRequestId}";
            public const string SendAccessRequestEmailFailed = "Error while sending {TemplateCode} email for access request {AccessRequestId}";
        }
    }
}
