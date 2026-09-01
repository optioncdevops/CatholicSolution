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
        /// Parameters for Products stored procedures and queries.
        /// </summary>
        public static class ProductParams
        {
            /// <summary>
            /// CRUD action identifier for stored procedure operations.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Product identifier.
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// Full product name.
            /// </summary>
            public const string ProductName = nameof(ProductName);

            /// <summary>
            /// Sub-category or subtitle name.
            /// </summary>
            public const string SubCategoryName = nameof(SubCategoryName);

            /// <summary>
            /// Product description.
            /// </summary>
            public const string ProdDescription = nameof(ProdDescription);

            /// <summary>
            /// External application or website URL.
            /// </summary>
            public const string ExternalPageUrl = nameof(ExternalPageUrl);

            /// <summary>
            /// Default access duration in days.
            /// </summary>
            public const string DefaultAccessDays = nameof(DefaultAccessDays);

            /// <summary>
            /// Relative path or URL to the product logo image.
            /// </summary>
            public const string LogoUrl = nameof(LogoUrl);

            /// <summary>
            /// Pipe-delimited list of product features.
            /// </summary>
            public const string Features = nameof(Features);

            /// <summary>
            /// Active status flag: 1 = active, 0 = inactive.
            /// </summary>
            public const string IsActive = nameof(IsActive);

            /// <summary>
            /// Availability flag: 1 = available, 0 = coming soon.
            /// </summary>
            public const string IsAvailable = nameof(IsAvailable);

            /// <summary>
            /// Logged-in user identifier for audit columns (ICurrentUserService.UserId).
            /// </summary>
            public const string UserId = nameof(UserId);

            /// <summary>
            /// Logged-in user who inserted the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Output return value from the stored procedure.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }
    }
}

