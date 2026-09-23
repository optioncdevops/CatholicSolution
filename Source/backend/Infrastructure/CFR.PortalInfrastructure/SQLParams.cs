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

            /// <summary>
            /// Email used to resolve CFRUserId for ActionId 4 (machine-client launch-code create).
            /// CFR.Portal's own ICFRLaunchRepository never sets this - only a trusted machine
            /// client (CFR.DataSync, calling the same physical database directly) uses ActionId 4.
            /// </summary>
            public const string Email = nameof(Email);
        }

        /// <summary>
        /// Parameters for Portal platform-launch stored procedures.
        /// </summary>
        public static class PlatformLaunchParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>Email address used to resolve the target CFR member (ActionId 1 only).</summary>
            public const string Email = nameof(Email);

            /// <summary>SHA-256 hex hash of the one-time platform-launch code.</summary>
            public const string CodeHash = nameof(CodeHash);

            /// <summary>Audit identifier for who/what created the launch row (e.g. an API client id).</summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>Stored procedure output / return value.</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        public static class AccessRequestParams
        {
            public const string ActionId = nameof(ActionId);
            public const string AccessRequestId = nameof(AccessRequestId);
            public const string ProductId = nameof(ProductId);
            public const string ProductName = nameof(ProductName);
            public const string RequesterEmail = nameof(RequesterEmail);
            public const string Comment = nameof(Comment);
            public const string FirstName = nameof(FirstName);
            public const string LastName = nameof(LastName);
            public const string OrganizationType = nameof(OrganizationType);
            public const string OrganizationName = nameof(OrganizationName);
            public const string Address = nameof(Address);
            public const string City = nameof(City);
            public const string State = nameof(State);
            public const string Zip = nameof(Zip);
            public const string Phone = nameof(Phone);
            public const string ProductsJson = nameof(ProductsJson);
            public const string DioceseId = nameof(DioceseId);
            public const string Status = nameof(Status);
            public const string Note = nameof(Note);
            public const string InsertedBy = nameof(InsertedBy);
            public const string UpdatedBy = nameof(UpdatedBy);
            public const string ReturnValue = nameof(ReturnValue);
        }

        public static class EmailTemplateParams
        {
            public const string ActionId = nameof(ActionId);
            public const string TemplateId = nameof(TemplateId);
            public const string TemplateCode = nameof(TemplateCode);
            public const string Subject = nameof(Subject);
            public const string Body = nameof(Body);
            public const string Status = nameof(Status);
            public const string AccentColor = nameof(AccentColor);
            public const string LogoUrl = nameof(LogoUrl);
            public const string FontFamily = nameof(FontFamily);
            public const string BaseFontSize = nameof(BaseFontSize);
            public const string UpdatedBy = nameof(UpdatedBy);
            public const string ReturnValue = nameof(ReturnValue);
        }
    }
}
