// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to update an organization's name, status, and contact email.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UpdateOrganizationInput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [Required]
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the organization display name.
        /// </summary>
        [Required]
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization status.
        /// </summary>
        [Required]
        [JsonPropertyName("orgStatus")]
        public string OrgStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization contact email address.
        /// </summary>
        [JsonPropertyName("contactEmail")]
        public string? ContactEmail { get; set; }

        /// <summary>
        /// Gets or sets the organization website URL.
        /// </summary>
        [JsonPropertyName("website")]
        public string? Website { get; set; }

        /// <summary>
        /// Gets or sets the primary contact person's name.
        /// </summary>
        [JsonPropertyName("contactPerson")]
        public string? ContactPerson { get; set; }

        /// <summary>
        /// Gets or sets the primary contact phone number.
        /// </summary>
        [JsonPropertyName("contactPhone")]
        public string? ContactPhone { get; set; }
    }
}
