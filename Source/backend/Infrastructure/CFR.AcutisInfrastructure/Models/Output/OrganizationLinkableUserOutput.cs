// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 11).
    /// Holds one user not yet linked to an organization, for the link-user dropdown.
    /// </summary>
    public class OrganizationLinkableUserOutput
    {
        /// <summary>
        /// Gets or sets the user identifier (auth.User.CFRUserId).
        /// </summary>
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }

        /// <summary>
        /// Gets or sets the user's email address. auth.User has no name columns, so email is the
        /// only identifying field available for a lookup.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }
}
