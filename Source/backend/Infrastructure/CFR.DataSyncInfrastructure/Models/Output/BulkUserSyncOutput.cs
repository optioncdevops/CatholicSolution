// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// Success response for the bulk-user sync API — always returned with StatusCode 200 (Success)
    /// once the batch itself was accepted; per-row outcomes (including per-row failures) live in
    /// <see cref="Results"/>, the same way a migration script would track its own row-by-row results.
    /// </summary>
    public class BulkUserSyncOutput
    {
        /// <summary>Total rows submitted in the batch.</summary>
        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }

        /// <summary>Rows created/updated successfully.</summary>
        [JsonPropertyName("successCount")]
        public int SuccessCount { get; set; }

        /// <summary>Rows that failed validation or the create call.</summary>
        [JsonPropertyName("failedCount")]
        public int FailedCount { get; set; }

        /// <summary>One entry per submitted row, in the same order as the request.</summary>
        [JsonPropertyName("results")]
        public List<UserSyncBulkResultItem> Results { get; set; } = [];

        /// <summary>W3C trace id for this request.</summary>
        [JsonPropertyName("traceId")]
        public string TraceId { get; set; } = string.Empty;
    }
}
