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
        /// Gets or sets the organization type (e.g. Parish, Diocese, School, Nonprofit, Business, Other).
        /// </summary>
        [JsonPropertyName("orgType")]
        public string? OrgType { get; set; }

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

        /// <summary>
        /// Gets or sets the street address.
        /// </summary>
        [JsonPropertyName("address")]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the city.
        /// </summary>
        [JsonPropertyName("city")]
        public string? City { get; set; }

        /// <summary>
        /// Gets or sets the state or province.
        /// </summary>
        [JsonPropertyName("state")]
        public string? State { get; set; }

        /// <summary>
        /// Gets or sets the ZIP or postal code.
        /// </summary>
        [JsonPropertyName("zip")]
        public string? Zip { get; set; }
    }

    /// <summary>
    /// Input DTO used to create a new organization.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class CreateOrganizationInput
    {
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
        /// Gets or sets the organization type (e.g. Parish, Diocese, School, Nonprofit, Business, Other).
        /// </summary>
        [JsonPropertyName("orgType")]
        public string? OrgType { get; set; }

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

        /// <summary>
        /// Gets or sets the street address.
        /// </summary>
        [JsonPropertyName("address")]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the city.
        /// </summary>
        [JsonPropertyName("city")]
        public string? City { get; set; }

        /// <summary>
        /// Gets or sets the state or province.
        /// </summary>
        [JsonPropertyName("state")]
        public string? State { get; set; }

        /// <summary>
        /// Gets or sets the ZIP or postal code.
        /// </summary>
        [JsonPropertyName("zip")]
        public string? Zip { get; set; }
    }

    /// <summary>
    /// Input DTO used to assign a product to an organization.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class AssignOrganizationProductInput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [Required]
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the product identifier to assign.
        /// </summary>
        [Required]
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
    }

    /// <summary>
    /// Input DTO used to link a user to an organization.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class LinkOrganizationUserInput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [Required]
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the user identifier to link (auth.User.CFRUserId).
        /// </summary>
        [Required]
        [JsonPropertyName("authUserId")]
        public long AuthUserId { get; set; }
    }
}
