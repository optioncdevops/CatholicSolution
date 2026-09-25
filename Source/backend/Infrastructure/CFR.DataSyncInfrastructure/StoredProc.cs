// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure
{
    /// <summary>
    /// Stored procedure name constants for the CFR.DataSync microservice.
    /// </summary>
    public class StoredProc
    {
        /// <summary>
        /// Stored procedure names for HMAC client / nonce / idempotency lookups.
        /// </summary>
        public class Security
        {
            /// <summary>
            /// ApiClient lookup, nonce replay-insert, and idempotency-record get/save operations.
            /// </summary>
            public const string SecurityManage = "[sec].[Security_Manage]";
        }

        /// <summary>
        /// Stored procedure names for the single-user sync surface.
        /// </summary>
        public class UserSync
        {
            /// <summary>
            /// Create, full-update, partial-update, get, deactivate, and reactivate operations
            /// for a synced user/organization/product membership.
            /// </summary>
            public const string UserProductUpsert = "[dbo].[Sync_UserProductUpsert]";

            /// <summary>
            /// Create/update/get operations for organization onboarding.
            /// </summary>
            public const string OrganizationUpsert = "[dbo].[Sync_OrganizationUpsert]";
        }

        /// <summary>
        /// Stored procedure names for the CFR-user product-lookup surface.
        /// </summary>
        public class ProductSync
        {
            /// <summary>
            /// Read-only lookup of the active products a CFR user (identified by email) has access to.
            /// </summary>
            public const string ProductsForUser = "[dbo].[Sync_ProductsForUser]";
        }

        /// <summary>
        /// Stored procedure names for the per-product role catalog surface.
        /// </summary>
        public class ProductRole
        {
            /// <summary>Upsert (ActionId 1) and list (ActionId 2) operations for [core].[ProductRole].</summary>
            public const string ProductRoleCrud = "[dbo].[Sync_ProductRole]";
        }

        /// <summary>
        /// Portal's own App Hub platform-launch code create/exchange procedure. Lives in the same
        /// physical database as CFR.Portal's own tables (both microservices share ConnString), the
        /// same way [dbo].[Sync_ProductsForUser] already reads Portal-owned tables directly.
        /// </summary>
        public class PlatformLaunch
        {
            /// <summary>Platform launch-code create (ActionId 1 only, from this microservice).</summary>
            public const string PlatformLaunchCrud = "[dbo].[Portal_PlatformLaunch]";
        }

        /// <summary>
        /// Portal's own product SSO launch procedure, same physical database access pattern as
        /// <see cref="PlatformLaunch"/>.
        /// </summary>
        public class CFRLaunch
        {
            /// <summary>Product launch-code create (ActionId 4 only, from this microservice).</summary>
            public const string CFRLaunchCrud = "[dbo].[Portal_CFRLaunch]";
        }
    }
}
