// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure
{
    /// <summary>
    /// SQL parameter name constants used with Dapper DynamicParameters.
    /// </summary>
    public static class DBParameterName
    {
        /// <summary>
        /// Parameters for Acutis authentication stored procedures.
        /// </summary>
        public static class AcutisAuthParams
        {
            /// <summary>
            /// CRUD action identifier (password reset stored procedure only).
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Login email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Plain-text password verified with dbo.DecryptUserPassword.
            /// </summary>
            public const string Password = nameof(Password);

            /// <summary>
            /// SHA-256 hash of a password reset token; the raw token is never persisted.
            /// </summary>
            public const string TokenHash = nameof(TokenHash);

            /// <summary>
            /// UTC expiry timestamp for a password reset token.
            /// </summary>
            public const string ExpiresAtUtc = nameof(ExpiresAtUtc);

            /// <summary>
            /// Plain-text new password; SQL encrypts it with dbo.EncryptUserPassword.
            /// </summary>
            public const string NewPassword = nameof(NewPassword);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Administration user stored procedures.
        /// </summary>
        public static class AdministrationParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// User identifier.
            /// </summary>
            public const string UserId = nameof(UserId);

            /// <summary>
            /// User first name.
            /// </summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>
            /// User last name.
            /// </summary>
            public const string LastName = nameof(LastName);

            /// <summary>
            /// User email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Plain-text password encrypted in SQL with dbo.EncryptUserPassword.
            /// </summary>
            public const string Password = nameof(Password);

            /// <summary>
            /// Organization identifier.
            /// </summary>
            public const string OrganizationId = nameof(OrganizationId);

            /// <summary>
            /// Role identifier.
            /// </summary>
            public const string RoleId = nameof(RoleId);

            /// <summary>
            /// Active flag: 1 = active, 0 = inactive.
            /// </summary>
            public const string IsActive = nameof(IsActive);

            /// <summary>
            /// Locked flag: 1 = locked, 0 = unlocked.
            /// </summary>
            public const string IsLocked = nameof(IsLocked);

            /// <summary>
            /// Date of birth.
            /// </summary>
            public const string DateOfBirth = nameof(DateOfBirth);

            /// <summary>
            /// User status value.
            /// </summary>
            public const string Status = nameof(Status);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);

            /// <summary>
            /// Role display name.
            /// </summary>
            public const string RoleName = nameof(RoleName);

            /// <summary>
            /// Role description.
            /// </summary>
            public const string Description = nameof(Description);

            /// <summary>
            /// Logged-in user who created the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);
        }

        /// <summary>
        /// Parameters for Email Templates stored procedures.
        /// </summary>
        public static class EmailTemplateParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Email template identifier.
            /// </summary>
            public const string TemplateId = nameof(TemplateId);

            /// <summary>
            /// Stable code used to look up a template at send time (e.g. "PasswordReset").
            /// </summary>
            public const string TemplateCode = nameof(TemplateCode);

            /// <summary>
            /// Email subject line, may contain [placeholder] merge tags.
            /// </summary>
            public const string Subject = nameof(Subject);

            /// <summary>
            /// Email body, may contain [placeholder] merge tags.
            /// </summary>
            public const string Body = nameof(Body);

            /// <summary>
            /// Template status value ("active" / "inactive").
            /// </summary>
            public const string Status = nameof(Status);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for self-service profile / change-password stored procedures.
        /// </summary>
        public static class ProfileParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Signed-in user identifier, from ICurrentUserService.UserId.
            /// </summary>
            public const string UserId = nameof(UserId);

            /// <summary>
            /// User first name.
            /// </summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>
            /// User last name.
            /// </summary>
            public const string LastName = nameof(LastName);

            /// <summary>
            /// User email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Current plain-text password, verified with dbo.DecryptUserPassword.
            /// </summary>
            public const string CurrentPassword = nameof(CurrentPassword);

            /// <summary>
            /// New plain-text password; SQL encrypts it with dbo.EncryptUserPassword.
            /// </summary>
            public const string NewPassword = nameof(NewPassword);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Organization stored procedures.
        /// </summary>
        public static class OrganizationParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Organization identifier.
            /// </summary>
            public const string OrgId = nameof(OrgId);

            /// <summary>
            /// Organization display name.
            /// </summary>
            public const string OrgName = nameof(OrgName);

            /// <summary>
            /// Organization status value.
            /// </summary>
            public const string OrgStatus = nameof(OrgStatus);

            /// <summary>
            /// Organization contact email address.
            /// </summary>
            public const string ContactEmail = nameof(ContactEmail);

            /// <summary>
            /// Organization website URL.
            /// </summary>
            public const string Website = nameof(Website);

            /// <summary>
            /// Primary contact person's name.
            /// </summary>
            public const string ContactPerson = nameof(ContactPerson);

            /// <summary>
            /// Primary contact phone number.
            /// </summary>
            public const string ContactPhone = nameof(ContactPhone);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Product identifier, used when assigning/removing a product for an organization.
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Access Request stored procedures.
        /// </summary>
        public static class AccessRequestParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = "@ActionId";

            /// <summary>
            /// Access request identifier.
            /// </summary>
            public const string AccessRequestId = "@AccessRequestId";

            /// <summary>
            /// core.Product.ProductId when the client sends a numeric identifier.
            /// </summary>
            public const string ProductId = "@ProductId";

            /// <summary>
            /// Product display name used to resolve core.Product when ProductId is not numeric.
            /// </summary>
            public const string ProductName = "@ProductName";

            /// <summary>
            /// Requester email used to resolve auth.AuthUser.
            /// </summary>
            public const string RequesterEmail = "@RequesterEmail";

            /// <summary>
            /// Optional comment on submit.
            /// </summary>
            public const string Comment = "@Comment";

            /// <summary>
            /// Request status value.
            /// </summary>
            public const string Status = "@Status";

            /// <summary>
            /// Optional reviewer note.
            /// </summary>
            public const string Note = "@Note";

            /// <summary>
            /// Logged-in user who created the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = "@InsertedBy";

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = "@UpdatedBy";

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = "@ReturnValue";
        }

        /// <summary>
        /// Parameters for Product stored procedures.
        /// </summary>
        public static class ProductParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = "@ActionId";

            /// <summary>
            /// Member email used to decide Your Apps vs Available Apps.
            /// </summary>
            public const string RequesterEmail = "@RequesterEmail";
        }
    }
}
