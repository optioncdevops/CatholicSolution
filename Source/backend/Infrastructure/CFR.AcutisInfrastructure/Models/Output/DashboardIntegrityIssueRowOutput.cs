// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Dashboard.DashboardCrud (ActionId 2) —
    /// one row of the actual records behind a single entitlement-integrity count from
    /// DashboardIntegrityOutput, so the Dashboard's Priority Alerts panel can show and link to the
    /// exact affected organization/product/member instead of just a number.
    /// </summary>
    public class DashboardIntegrityIssueRowOutput
    {
        /// <summary>Gets or sets the affected organization's identifier, or null when this issue isn't organization-scoped.</summary>
        [JsonPropertyName("orgId")]
        public int? OrgId { get; set; }

        /// <summary>Gets or sets the affected organization's name.</summary>
        [JsonPropertyName("orgName")]
        public string? OrgName { get; set; }

        /// <summary>Gets or sets the affected product's identifier.</summary>
        [JsonPropertyName("productId")]
        public int? ProductId { get; set; }

        /// <summary>Gets or sets the affected product's name.</summary>
        [JsonPropertyName("productName")]
        public string? ProductName { get; set; }

        /// <summary>Gets or sets the affected member's user identifier, when this issue is member-scoped.</summary>
        [JsonPropertyName("memberUserId")]
        public long? MemberUserId { get; set; }

        /// <summary>Gets or sets the affected member's display name, when this issue is member-scoped.</summary>
        [JsonPropertyName("memberName")]
        public string? MemberName { get; set; }

        /// <summary>Gets or sets a short, row-specific explanation (e.g. "License expired 12 day(s) ago").</summary>
        [JsonPropertyName("detail")]
        public string? Detail { get; set; }
    }
}
