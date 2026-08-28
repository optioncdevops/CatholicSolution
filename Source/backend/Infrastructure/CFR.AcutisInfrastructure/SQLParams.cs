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
            /// Login email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Plain-text password verified with dbo.DecryptUserPassword.
            /// </summary>
            public const string Password = nameof(Password);
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
    }
}
