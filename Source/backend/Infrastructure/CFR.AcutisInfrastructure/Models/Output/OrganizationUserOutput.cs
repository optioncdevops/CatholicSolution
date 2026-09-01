// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 5).
    /// Holds one user linked to an organization via auth.OrganizationUser + auth.AuthUser.
    /// </summary>
    public class OrganizationUserOutput
    {
        /// <summary>
        /// Gets or sets the linked user's identifier (auth.AuthUser.AuthUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }

        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the user's first name.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>
        /// Gets or sets the user's last name.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

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
