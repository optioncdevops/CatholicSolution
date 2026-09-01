// Copyright (c) OptionC. All rights reserved.
namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output model representing a product license from lic.License and lic.OrganizationProduct.
    /// </summary>
    public class ProductLicenseOutput
    {
        /// <summary>
        /// Gets or sets the primary key license identifier.
        /// </summary>
        [JsonPropertyName("licenseId")]
        public long LicenseId { get; set; }

        /// <summary>
        /// Gets or sets the organization product link identifier.
        /// </summary>
        [JsonPropertyName("organizationProductId")]
        public long OrganizationProductId { get; set; }

        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the organization / customer name.
        /// </summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the product name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the license type (e.g. perpetual, trial, subscription).
        /// </summary>
        [JsonPropertyName("licenseType")]
        public string? LicenseType { get; set; }

        /// <summary>
        /// Gets or sets the license activation / start date.
        /// </summary>
        [JsonPropertyName("activationDate")]
        public DateTime ActivationDate { get; set; }

        /// <summary>
        /// Gets or sets the license expiry date.
        /// </summary>
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// Gets or sets the maximum allowed users / seats.
        /// </summary>
        [JsonPropertyName("maxUsers")]
        public int? MaxUsers { get; set; }

        /// <summary>
        /// Gets or sets the license status (e.g. active, expired, cancelled).
        /// </summary>
        [JsonPropertyName("licenseStatus")]
        public string LicenseStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization product assignment status (e.g. active, suspended).
        /// </summary>
        [JsonPropertyName("assignStatus")]
        public string? AssignStatus { get; set; }

        /// <summary>
        /// Gets or sets the user identifier who issued the license.
        /// </summary>
        [JsonPropertyName("issuedBy")]
        public long? IssuedBy { get; set; }

        /// <summary>
        /// Gets or sets remarks or custom message for the license.
        /// </summary>
        [JsonPropertyName("remarks")]
        public string? Remarks { get; set; }

        /// <summary>
        /// Gets or sets the record creation date.
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }
    }
}
