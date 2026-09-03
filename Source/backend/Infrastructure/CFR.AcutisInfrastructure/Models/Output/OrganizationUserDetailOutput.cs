// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 14).
    /// Holds one member's organization-membership detail plus their effective app access within
    /// that organization, for the Organization Users tab's user-detail view.
    /// </summary>
    public class OrganizationUserDetailOutput
    {
        /// <summary>
        /// Gets or sets the linked user's identifier (auth.User.CFRUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }

        /// <summary>
        /// Gets or sets the user's email address. auth.User has no name columns, so email is the
        /// only identifying field guaranteed to exist for a linked user.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets a best-effort display name (from the member's most recent auth.UserProduct
        /// row, falling back to Email when the member has none).
        /// </summary>
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization identifier this membership belongs to.
        /// </summary>
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the organization's display name.
        /// </summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the membership status for this organization link.
        /// </summary>
        [JsonPropertyName("memberStatus")]
        public string MemberStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets when the user was linked to this organization.
        /// </summary>
        [JsonPropertyName("linkedDate")]
        public DateTime LinkedDate { get; set; }

        /// <summary>
        /// Gets or sets the products this member can effectively access within this organization
        /// (the organization has the product active AND the member has an individual auth.UserProduct
        /// assignment for it). Populated by the repository from the stored procedure's second result set.
        /// </summary>
        [JsonPropertyName("apps")]
        public List<ProductLookupOutput> Apps { get; set; } = [];
    }
}
