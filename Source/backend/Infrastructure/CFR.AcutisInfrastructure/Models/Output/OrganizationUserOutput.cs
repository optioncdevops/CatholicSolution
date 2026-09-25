// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 5).
    /// Holds one user linked to an organization, sourced from auth.UserProduct (grouped by
    /// CFRUserId) + auth.User + a best-effort auth.AcutisRole lookup.
    /// </summary>
    public class OrganizationUserOutput
    {
        /// <summary>
        /// Gets or sets the linked user's identifier (auth.UserProduct.CFRUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public Guid AuthUserId { get; set; }

        /// <summary>
        /// Gets or sets the user's email address, from auth.User by CFRUserId.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the member's display name, from auth.UserProduct.FirstName/LastName.
        /// </summary>
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a best-effort role name (auth.AcutisRole lookup by
        /// auth.UserProduct.RoleId), or null when the RoleId has no match in that table.
        /// </summary>
        [JsonPropertyName("roleName")]
        public string? RoleName { get; set; }

        /// <summary>
        /// Gets or sets the membership status, derived from IsLoginDisabled/IsLocked.
        /// </summary>
        [JsonPropertyName("memberStatus")]
        public string MemberStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets when the user was linked to this organization.
        /// </summary>
        [JsonPropertyName("linkedDate")]
        public DateTime LinkedDate { get; set; }

        /// <summary>
        /// Gets or sets the count of distinct products this member can effectively access within
        /// this organization (the organization has the product active AND the member has an
        /// individual auth.UserProduct assignment for it).
        /// </summary>
        [JsonPropertyName("appCount")]
        public int AppCount { get; set; }

        /// <summary>
        /// Gets or sets a comma-separated list of the product names this member can effectively
        /// access within this organization (same gating as AppCount), or null when none.
        /// </summary>
        [JsonPropertyName("appNames")]
        public string? AppNames { get; set; }
    }
}
