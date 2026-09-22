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

        /// <summary>
        /// Parameters for the public "Suggest a product" save stored procedure call.
        /// </summary>
        public static class ProductRequestParams
        {
            public const string ActionId = nameof(ActionId);
            public const string ProductRequestId = nameof(ProductRequestId);
            public const string ProductName = nameof(ProductName);
            public const string ShortName = nameof(ShortName);
            public const string SubCategoryName = nameof(SubCategoryName);
            public const string ProdDescription = nameof(ProdDescription);
            public const string ExternalPageUrl = nameof(ExternalPageUrl);
            public const string NavigationTarget = nameof(NavigationTarget);
            public const string Features = nameof(Features);
            public const string LogoName = nameof(LogoName);
            public const string RequesterName = nameof(RequesterName);
            public const string RequesterEmail = nameof(RequesterEmail);
            public const string OrganizationName = nameof(OrganizationName);
            public const string InsertedBy = nameof(InsertedBy);
            public const string NotifyUserId = nameof(NotifyUserId);
            public const string ReturnValue = nameof(ReturnValue);
        }
    }
}
