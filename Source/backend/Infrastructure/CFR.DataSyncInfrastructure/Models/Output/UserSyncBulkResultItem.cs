// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// One row's outcome inside a <see cref="BulkUserSyncOutput"/> — the same status a single
    /// CreateUser call would have returned for that row, so a caller can tell exactly which rows
    /// in the batch succeeded and why any others failed, without the whole batch failing together.
    /// </summary>
    public class UserSyncBulkResultItem
    {
        /// <summary>The product's own user identifier, echoed back from the request row.</summary>
        [JsonPropertyName("externalUserId")]
        public string ExternalUserId { get; set; } = string.Empty;

        /// <summary>True when this row was created/updated successfully.</summary>
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        /// <summary>The same StatusCode a single CreateUser call would have returned for this row.</summary>
        [JsonPropertyName("statusCode")]
        public long StatusCode { get; set; }

        /// <summary>The same StatusMessage a single CreateUser call would have returned for this row.</summary>
        [JsonPropertyName("statusMessage")]
        public string StatusMessage { get; set; } = string.Empty;

        /// <summary>Populated only when <see cref="Success"/> is true.</summary>
        [JsonPropertyName("user")]
        public UserSyncOutput? User { get; set; }
    }
}
