// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Batch create payload for the bulk-user sync API — the same per-row shape as
    /// <see cref="UserSyncInput"/>, just many at once (e.g. a one-time migration) instead of one
    /// HTTP call per user.
    /// </summary>
    public class BulkUserSyncInput
    {
        /// <summary>The batch of users to create.</summary>
        [JsonPropertyName("users")]
        public List<UserSyncInput> Users { get; set; } = [];
    }
}
