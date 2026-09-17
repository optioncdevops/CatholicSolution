// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.SyncInfrastructure.Models.Output
{
    /// <summary>
    /// Success response for the single-user sync API.
    /// </summary>
    public class UserSyncOutput
    {
        /// <summary>CFR's internal identity identifier.</summary>
        [JsonPropertyName("cfrUserId")]
        public long CfrUserId { get; set; }

        /// <summary>CFR's internal membership-row identifier.</summary>
        [JsonPropertyName("cfrUserDetailId")]
        public long CfrUserDetailId { get; set; }

        /// <summary>CFR's internal organization identifier.</summary>
        [JsonPropertyName("cfrOrgId")]
        public int CfrOrgId { get; set; }

        /// <summary>The user's email address as stored on the CFR identity.</summary>
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>Created | Updated | Reactivated | Deactivated | NoChange.</summary>
        [JsonPropertyName("outcome")]
        public string Outcome { get; set; } = string.Empty;

        /// <summary>Base64 RowVersion — pass back as If-Match on the next PUT/PATCH.</summary>
        [JsonPropertyName("rowVersion")]
        public string? RowVersion { get; set; }

        /// <summary>W3C trace id for this request.</summary>
        [JsonPropertyName("traceId")]
        public string TraceId { get; set; } = string.Empty;
    }
}
