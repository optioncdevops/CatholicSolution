// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// Raw single-row result of <see cref="StoredProc.UserSync.UserProductUpsert"/>. Internal to the
    /// repository/service layer — never returned directly to a controller.
    /// </summary>
    public class UserProductUpsertResult
    {
        /// <summary>
        /// OK, or one of ORG_NOT_ONBOARDED | USER_ALREADY_EXISTS | USER_NOT_FOUND |
        /// CONCURRENCY_CONFLICT | EMAIL_REBIND_CONFLICT.
        /// </summary>
        public string ResultCode { get; set; } = string.Empty;

        /// <summary>CFR's internal identity identifier.</summary>
        public Guid? CFRUserId { get; set; }

        /// <summary>CFR's internal membership-row identifier.</summary>
        public long? CFRUserDetailId { get; set; }

        /// <summary>CFR's internal organization identifier.</summary>
        public int? CFROrgId { get; set; }

        /// <summary>The user's email address as stored on the CFR identity.</summary>
        public string? Email { get; set; }

        /// <summary>Created | Updated | Reactivated | Deactivated | NoChange.</summary>
        public string? Outcome { get; set; }

        /// <summary>Raw RowVersion bytes — base64-encoded by the service into UserSyncOutput.RowVersion.</summary>
        public byte[]? RowVersionBytes { get; set; }
    }
}
