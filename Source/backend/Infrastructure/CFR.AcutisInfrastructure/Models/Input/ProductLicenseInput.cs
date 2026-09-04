// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input model for creating or updating a product license.
    /// </summary>
    public class ProductLicenseInput
    {
        /// <summary>
        /// Gets or sets the primary key license identifier (0 for new licenses).
        /// </summary>
        [JsonPropertyName("licenseId")]
        public long LicenseId { get; set; }

        /// <summary>
        /// Gets or sets the organization product link identifier (0 if creating by orgId + productId).
        /// </summary>
        [JsonPropertyName("organizationProductId")]
        public long OrganizationProductId { get; set; }

        /// <summary>
        /// Gets or sets the target organization identifier.
        /// </summary>
        [JsonPropertyName("orgId")]
        public long OrgId { get; set; }

        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the license type (e.g. licensed, trial, subscription).
        /// </summary>
        [JsonPropertyName("licenseType")]
        public string? LicenseType { get; set; }

        /// <summary>
        /// Gets or sets the activation or start date.
        /// </summary>
        [JsonPropertyName("activationDate")]
        public DateTime? ActivationDate { get; set; }

        /// <summary>
        /// Gets or sets the expiry date.
        /// </summary>
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// Gets or sets the license status (e.g. active, suspended, expired, cancelled).
        /// </summary>
        [JsonPropertyName("licenseStatus")]
        public string? LicenseStatus { get; set; }

        /// <summary>
        /// Gets or sets the organization-product assignment status (e.g. active, inactive, suspended).
        /// </summary>
        [JsonPropertyName("assignStatus")]
        public string? AssignStatus { get; set; }

        /// <summary>
        /// Gets or sets optional remarks or notes for the license.
        /// </summary>
        [JsonPropertyName("remarks")]
        public string? Remarks { get; set; }
    }
}
