// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud.
    /// Holds one organization row returned to the service and controller.
    /// </summary>
    public class OrganizationOutput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the organization display name.
        /// </summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization status.
        /// </summary>
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

        /// <summary>
        /// Gets or sets the organization street address.
        /// </summary>
        [JsonPropertyName("address")]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the organization city.
        /// </summary>
        [JsonPropertyName("city")]
        public string? City { get; set; }

        /// <summary>
        /// Gets or sets the organization state.
        /// </summary>
        [JsonPropertyName("state")]
        public string? State { get; set; }

        /// <summary>
        /// Gets or sets the organization ZIP / postal code.
        /// </summary>
        [JsonPropertyName("zip")]
        public string? Zip { get; set; }

        /// <summary>
        /// Gets or sets when the organization was created.
        /// </summary>
        [JsonPropertyName("insertedDate")]
        public DateTime InsertedDate { get; set; }

        /// <summary>
        /// Gets or sets when the organization was last updated.
        /// </summary>
        [JsonPropertyName("updatedDate")]
        public DateTime? UpdatedDate { get; set; }

        /// <summary>
        /// Gets or sets the number of users linked to this organization via auth.OrganizationUser.
        /// </summary>
        [JsonPropertyName("userCount")]
        public int UserCount { get; set; }

        /// <summary>
        /// Gets or sets the number of products assigned to this organization via lic.OrganizationProduct.
        /// </summary>
        [JsonPropertyName("productCount")]
        public int ProductCount { get; set; }
    }
}
