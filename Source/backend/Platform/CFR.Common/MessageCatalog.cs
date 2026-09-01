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
        public const string ExistRole = "A role with this name already exists.";
        public const string RoleInUse = "This role is assigned to one or more users.";
        public const string Failed = "The request could not be completed.";
        public const string BadRequest = "Invalid request.";
        public const string UnAuthorized = "Unauthorized.";
        public const string ResetInstructionsSent = "Password reset instructions have been sent to your email address.";
        public const string AccountNotFound = "No account found with this email address.";
        public const string InvalidResetToken = "This reset link is invalid or has expired.";
        public const string PasswordMismatch = "The new passwords do not match or do not meet the minimum length.";
        public const string ExistEmailTemplateCode = "A template with this code already exists.";
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
        public const string ExistAccessRequest = "A pending access request for this product already exists.";
        public const string AccessRequestProductNotFound = "The requested product is not available.";
        public const string AccessRequestMemberNotFound = "No member account was found for this email.";
        public const string AccessRequestOrgNotFound = "No organization is linked to this member.";
        public const string AccessRequestAlreadyDecided = "This product request has already been decided.";
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
            public const string FetchEmailTemplatesFailed = "Error while fetching email templates";
            public const string FetchEmailTemplateByIdFailed = "Error while fetching email template {TemplateId}";
            public const string SaveEmailTemplateFailed = "Error while saving email template";
            public const string SendTestEmailFailed = "Error while sending test email";
            public const string FetchProfileFailed = "Error while fetching profile for user {UserId}";
            public const string UpdateProfileFailed = "Error while updating profile for user {UserId}";
            public const string ChangePasswordFailed = "Error while changing password for user {UserId}";
            public const string FetchOrganizationsFailed = "Error while fetching organizations";
            public const string FetchOrganizationByIdFailed = "Error while fetching organization {OrganizationId}";
            public const string FetchAccessRequestsFailed = "Error while fetching access requests";
            public const string FetchOrganizationUsersFailed = "Error while fetching organization users for organization {OrgId}";
            public const string FetchAccessRequestByIdFailed = "Error while fetching access request {RequestId}";
            public const string FetchProductsFailed = "Error while fetching products";
            public const string FetchOrganizationProductsFailed = "Error while fetching organization products for organization {OrgId}";
            public const string SaveAccessRequestFailed = "Error while saving access request";
            public const string FetchAssignableProductsFailed = "Error while fetching assignable products for organization {OrgId}";
            public const string UpdateAccessRequestStatusFailed = "Error while updating access request status for request {AccessRequestId}";
            public const string CreateOrganizationFailed = "Error while creating organization";
            public const string SendAccessRequestEmailFailed = "Error while sending {TemplateCode} email for access request {AccessRequestId}";
            public const string AssignOrganizationProductFailed = "Error while assigning product to organization {OrgId}";
            public const string RemoveOrganizationProductFailed = "Error while removing product from organization {OrgId}";
            public const string UpdateOrganizationFailed = "Error while updating organization {OrgId}";
        }
    }
}
