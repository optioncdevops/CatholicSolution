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
            public const string PasswordResetCrud = "[dbo].[Acutis_PasswordReset]";
        }

        /// <summary>
        /// Stored procedure names for self-service account features.
        /// </summary>
        public class Profile
        {
            /// <summary>
            /// Get, update, and change-password operations for the signed-in user's own account.
            /// </summary>
            public const string ProfileCrud = "[dbo].[Acutis_Profile]";
        }

        /// <summary>
        /// Stored procedure names for Administration features.
        /// </summary>
        public class Administration
        {
            /// <summary>
            /// Users list, get, save, status, and lookup operations.
            /// </summary>
            public const string UsersCrud = "[dbo].[Acutis_Users]";

            /// <summary>
            /// User roles list, get, save, status, and delete operations.
            /// </summary>
            public const string UserRolesCrud = "[dbo].[Acutis_UserRoles]";

            /// <summary>
            /// Looks up the signed-in user's own AccessRight (auth.ModuleRights) for a given
            /// admin page, by that page's auth.ModuleFeatures.RoutingUrl - used to enforce
            /// server-side, role-based authorization on mutations, independent of the
            /// authentication-only [Authorize] attribute.
            /// </summary>
            public const string GetFeatureAccessRight = "[dbo].[Acutis_GetFeatureAccessRight]";

            /// <summary>
            /// Email templates list, get by id, get by code, and save operations.
            /// </summary>
            public const string EmailTemplatesCrud = "[dbo].[Acutis_EmailTemplates]";

            /// <summary>
            /// CFR user list across (or scoped to) organizations for the CFR Admin "CFR User"
            /// page, with Status derived from [auth].[User].[AuthOId] (active/pending). Reads a
            /// completely different table family than UsersCrud ([auth].[User]/[auth].[UserProduct]
            /// vs [auth].[AcutisUser]), so it is its own stored procedure even though it is
            /// exposed through this same Users controller/service/repository.
            /// </summary>
            public const string CFRUsersList = "[dbo].[Acutis_CFRUsers]";

            /// <summary>
            /// Reads the role/module catalog and per-role feature grants for the User Rights
            /// screen. Lives in the [auth] schema, not [dbo] — legacy procedure, not part of the
            /// @ActionId CRUD convention used elsewhere.
            /// </summary>
            public const string GetRightByRoleId = "[auth].[GetRightByRoleId]";

            /// <summary>
            /// Bulk-updates auth.ModuleRights.AccessRight for a role from parallel delimited
            /// FeatureIds/AccessRights lists. Lives in the [auth] schema, not [dbo].
            /// </summary>
            public const string SaveUserRights = "[auth].[SaveUserRights]";
        }

        /// <summary>
        /// Stored procedure names for the request schema.
        /// </summary>
        public class Requests
        {
            /// <summary>
            /// Access request list, get, save, status, product-matched email recipient, and App Hub product operations against [request] tables.
            /// ActionId 1=save, 2=status update, 3=get by id, 4=list, 5=recipients by product, 6=hub products by requester email.
            /// Header RequestStatus: 1=pending, 2=in_review, 3=completed, 4=cancelled.
            /// Line LineStatus: 1=pending, 2=approved, 3=rejected.
            /// </summary>
            public const string AccessRequestCrud = "[request].[AccessRequestManage]";
        }

        /// <summary>
        /// Stored procedure names for Organization features.
        /// </summary>
        public class Organization
        {
            /// <summary>
            /// Organization list, get by id, and update operations.
            /// </summary>
            public const string OrganizationCrud = "[dbo].[Acutis_Organization]";
        }

        /// <summary>
        /// Stored procedure names for Products features.
        /// </summary>
        public class Products
        {
            /// <summary>
            /// Products and License unified CRUD operations.
            /// </summary>
            public const string ProductsCrud = "[dbo].[Acutis_Products]";

            /// <summary>
            /// Api Integration tab lookup: [core].[ProductEnvironment] Site / Site Url / Description.
            /// </summary>
            public const string ApiIntegrationLookup = "[dbo].[Acutis_ProductApiIntegration]";
        }

        /// <summary>
        /// Stored procedure names for the Dashboard feature.
        /// </summary>
        public class Dashboard
        {
            /// <summary>
            /// Authoritative dashboard summary: platform KPIs, entitlement integrity metrics, and
            /// trend events for a date range. ActionId 1=get summary.
            /// </summary>
            public const string DashboardCrud = "[dbo].[Acutis_Dashboard]";
        }
    }
}
