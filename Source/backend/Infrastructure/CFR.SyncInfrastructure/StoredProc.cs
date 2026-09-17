// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncInfrastructure
{
    /// <summary>
    /// Stored procedure name constants for the CFR.Sync microservice.
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
        }
    }
}
