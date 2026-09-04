// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output model for a product customer row sourced from [core].[Organization].
    /// </summary>
    public class ProductCustomerOutput
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
        /// Gets or sets the organization status from [core].[Organization].
        /// </summary>
        [JsonPropertyName("orgStatus")]
        public string OrgStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization contact email.
        /// </summary>
        [JsonPropertyName("contactEmail")]
        public string? ContactEmail { get; set; }

        /// <summary>
        /// Gets or sets the organization website URL.
        /// </summary>
        [JsonPropertyName("website")]
        public string? Website { get; set; }

        /// <summary>
        /// Gets or sets the primary contact person name.
        /// </summary>
        [JsonPropertyName("contactPerson")]
        public string? ContactPerson { get; set; }

        /// <summary>
        /// Gets or sets the primary contact phone number.
        /// </summary>
        [JsonPropertyName("contactPhone")]
        public string? ContactPhone { get; set; }

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
        /// Gets or sets the number of users linked to the organization.
        /// </summary>
        [JsonPropertyName("userCount")]
        public int UserCount { get; set; }

        /// <summary>
        /// Gets or sets the display customer code derived from OrgId.
        /// </summary>
        [JsonPropertyName("orgCode")]
        public string OrgCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product assignment or license start date.
        /// </summary>
        [JsonPropertyName("startDate")]
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Gets or sets the current license expiry date for this product.
        /// </summary>
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// Gets or sets the latest license type for this product assignment.
        /// </summary>
        [JsonPropertyName("licenseType")]
        public string? LicenseType { get; set; }

        /// <summary>
        /// Gets or sets the latest license or assignment status.
        /// </summary>
        [JsonPropertyName("licenseStatus")]
        public string? LicenseStatus { get; set; }
    }
}
