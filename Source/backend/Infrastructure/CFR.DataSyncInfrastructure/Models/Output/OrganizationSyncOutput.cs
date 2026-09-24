// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
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

        /// <summary>Organization name.</summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>Created | Updated.</summary>
        [JsonPropertyName("outcome")]
        public string Outcome { get; set; } = string.Empty;

        /// <summary>W3C trace id for this request.</summary>
        [JsonPropertyName("traceId")]
        public string TraceId { get; set; } = string.Empty;
    }

    /// <summary>
    /// Raw single-row result of <see cref="StoredProc.UserSync.OrganizationUpsert"/>. Internal to
    /// the repository/service layer.
    /// </summary>
    public class OrganizationUpsertResult
    {
        /// <summary>CFR's internal organization identifier.</summary>
        public int? CFROrgId { get; set; }

        /// <summary>The product's own organization identifier, echoed back.</summary>
        public int? ProductOrgId { get; set; }

        /// <summary>Organization name.</summary>
        public string? OrgName { get; set; }

        /// <summary>Created | Updated | NoChange.</summary>
        public string? Outcome { get; set; }

        /// <summary>The product's own diocese identifier, returned only by the get (ActionId 2) action.</summary>
        public string? DioceseId { get; set; }
    }
}
