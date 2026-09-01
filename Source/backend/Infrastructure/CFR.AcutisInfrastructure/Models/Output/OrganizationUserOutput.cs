// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 5).
    /// Holds one user linked to an organization via auth.OrganizationUser + auth.User.
    /// </summary>
    public class OrganizationUserOutput
    {
        /// <summary>
        /// Gets or sets the linked user's identifier (auth.User.CFRUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }

        /// <summary>
        /// Gets or sets the user's email address. auth.User has no name columns, so email is the
        /// only identifying field available for a linked user.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }

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
    }
}
