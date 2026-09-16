// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Administration.CFRUsersList (ActionId 1).
    /// Holds one (member, organization) membership row for the CFR Admin "CFR User" page.
    /// </summary>
    public class CFRUserOutput
    {
        /// <summary>
        /// Gets or sets the linked user's identifier (auth.UserProduct.CFRUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }

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
        /// Gets or sets the organization identifier this membership belongs to.
        /// </summary>
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the organization's display name (auth.UserProduct.OrgName).
        /// </summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the activation status ("active" or "pending"), derived from whether
        /// auth.User.AuthOId is populated for this member.
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets when the user was linked to this organization.
        /// </summary>
        [JsonPropertyName("linkedDate")]
        public DateTime LinkedDate { get; set; }

        /// <summary>
        /// Gets or sets the count of distinct products this member can effectively access within
        /// this organization (the organization has the product active).
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

    /// <summary>
    /// Wrapper for the CFR Users response containing both the filtered users and total counts.
    /// </summary>
    public class CFRUsersResponseOutput
    {
        [JsonPropertyName("users")]
        public List<CFRUserOutput> Users { get; set; } = [];

        [JsonPropertyName("activeCount")]
        public int ActiveCount { get; set; }

        [JsonPropertyName("pendingCount")]
        public int PendingCount { get; set; }
    }
}
