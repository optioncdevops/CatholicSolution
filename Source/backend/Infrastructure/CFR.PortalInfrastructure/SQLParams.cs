// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure
{
    /// <summary>
    /// SQL parameter name constants used with Dapper DynamicParameters.
    /// </summary>
    public static class DBParameterName
    {
        /// <summary>
        /// Parameters for Portal authentication stored procedures.
        /// </summary>
        public static class PortalAuthParams
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
        /// Parameters for Portal CFR launch stored procedures.
        /// </summary>
        public static class CFRLaunchParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Authenticated CFR member identifier.
            /// </summary>
            public const string CFRUserId = nameof(CFRUserId);

            /// <summary>
            /// Product identifier from [core].[Product].
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// SHA-256 hex hash of the one-time authorization code.
            /// </summary>
            public const string CodeHash = nameof(CodeHash);

            /// <summary>
            /// UTC expiry for the authorization code.
            /// </summary>
            public const string ExpiresAt = nameof(ExpiresAt);

            /// <summary>
            /// Audit user who created the launch row.
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);

            /// <summary>
            /// [core].[ProductEnvironment].EnvironmentName matching appsettings Environment (Development, Pilot, Staging, Live).
            /// </summary>
            public const string EnvironmentName = nameof(EnvironmentName);
        }
    }
}
