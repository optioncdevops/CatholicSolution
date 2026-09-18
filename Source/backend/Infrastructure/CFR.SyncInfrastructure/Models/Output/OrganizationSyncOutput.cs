// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.SyncInfrastructure.Models.Output
{
    /// <summary>
    /// Success response for the organization onboarding API.
    /// </summary>
    public class OrganizationSyncOutput
    {
        /// <summary>CFR's internal organization identifier.</summary>
        [JsonPropertyName("cfrOrgId")]
        public int CfrOrgId { get; set; }

        /// <summary>The product's own organization identifier, echoed back.</summary>
        [JsonPropertyName("productOrgId")]
        public int ProductOrgId { get; set; }

        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>Created | Updated.</summary>
        [JsonPropertyName("outcome")]
        public string Outcome { get; set; } = string.Empty;

        [JsonPropertyName("traceId")]
        public string TraceId { get; set; } = string.Empty;
    }

    /// <summary>
    /// Raw single-row result of <see cref="StoredProc.UserSync.OrganizationUpsert"/>. Internal to
    /// the repository/service layer.
    /// </summary>
    public class OrganizationUpsertResult
    {
        public int? CFROrgId { get; set; }

        public int? ProductOrgId { get; set; }

        public string? OrgName { get; set; }

        public string? Outcome { get; set; }

        public string? DioceseId { get; set; }
    }
}
