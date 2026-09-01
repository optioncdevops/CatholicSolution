// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure
{
    /// <summary>
    /// Stored procedure name constants for the Acutis microservice.
    /// </summary>
    public class StoredProc
    {
        /// <summary>
        /// Stored procedure names for Acutis authentication.
        /// </summary>
        public class AcutisAuth
        {
            /// <summary>
            /// Authenticates an Acutis user and returns the user row plus module rights.
            /// </summary>
            public const string DoLogin = "[dbo].[Acutis_DoLogin]";

            /// <summary>
            /// Requests and completes password reset token operations for an Acutis user.
            /// </summary>
            public const string PasswordResetCrud = "[dbo].[Acutis_PasswordReset_CRUD]";
        }

        /// <summary>
        /// Stored procedure names for self-service account features.
        /// </summary>
        public class Profile
        {
            /// <summary>
            /// Get, update, and change-password operations for the signed-in user's own account.
            /// </summary>
            public const string ProfileCrud = "[dbo].[Acutis_Profile_CRUD]";
        }

        /// <summary>
        /// Stored procedure names for Administration features.
        /// </summary>
        public class Administration
        {
            /// <summary>
            /// Users list, get, save, status, and lookup operations.
            /// </summary>
            public const string UsersCrud = "[dbo].[Acutis_Users_CRUD]";

            /// <summary>
            /// User roles list, get, save, status, and delete operations.
            /// </summary>
            public const string UserRolesCrud = "[dbo].[Acutis_UserRoles_CRUD]";

            /// <summary>
            /// Email templates list, get by id, get by code, and save operations.
            /// </summary>
            public const string EmailTemplatesCrud = "[dbo].[Acutis_EmailTemplates_CRUD]";

            /// <summary>
            /// App Hub product list from core.Product.
            /// ActionId 4=hub list.
            /// </summary>
            public const string ProductsCrud = "[dbo].[Acutis_Products_CRUD]";
        }

        /// <summary>
        /// Stored procedure names for the request schema.
        /// </summary>
        public class Requests
        {
            /// <summary>
            /// Access request list, get, save, status, and product-matched email recipient operations against [request] tables.
            /// ActionId 1=save, 2=status update, 3=get by id, 4=list, 5=recipients by product.
            /// Header RequestStatus: 1=pending, 2=in_review, 3=completed, 4=cancelled.
            /// Line LineStatus: 1=pending, 2=approved, 3=rejected.
            /// </summary>
            public const string AccessRequestCrud = "[request].[AccessRequest_CRUD]";
        }

        /// <summary>
        /// Stored procedure names for Organization features.
        /// </summary>
        public class Organization
        {
            /// <summary>
            /// Organization list, get by id, and update operations.
            /// </summary>
            public const string OrganizationCrud = "[dbo].[Acutis_Organization_CRUD]";
        }

        /// <summary>
        /// Stored procedure names for Products features.
        /// </summary>
        public class Products
        {
            /// <summary>
            /// Products list, get by id, save (insert/update), and soft-delete operations.
            /// </summary>
            public const string ProductsCrud = "[dbo].[Acutis_Products_CRUD]";

            /// <summary>
            /// Retrieves product license records by ProductId from lic.License and lic.OrganizationProduct.
            /// </summary>
            public const string ProductLicensesGetByProductId = "[dbo].[Acutis_ProductLicenses_GetByProductId]";
        }
    }
}
