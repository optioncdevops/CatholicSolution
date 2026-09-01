// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 10).
    /// Holds one license issued against an organization's assigned product, via
    /// lic.License + lic.OrganizationProduct + core.Product.
    /// </summary>
    public class OrganizationLicenseOutput
    {
        /// <summary>
        /// Gets or sets the license identifier.
        /// </summary>
        [JsonPropertyName("licenseId")]
        public long LicenseId { get; set; }

        /// <summary>
        /// Gets or sets the organization-product assignment identifier the license belongs to.
        /// </summary>
        [JsonPropertyName("organizationProductId")]
        public long OrganizationProductId { get; set; }

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
        /// Gets or sets the license type.
        /// </summary>
        [JsonPropertyName("licenseType")]
        public string? LicenseType { get; set; }

        /// <summary>
        /// Gets or sets the license activation date.
        /// </summary>
        [JsonPropertyName("activationDate")]
        public DateTime ActivationDate { get; set; }

        /// <summary>
        /// Gets or sets the license expiry date, or null for a perpetual license.
        /// </summary>
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// Gets or sets the stored license status.
        /// </summary>
        [JsonPropertyName("licenseStatus")]
        public string LicenseStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets optional remarks on the license.
        /// </summary>
        [JsonPropertyName("remarks")]
        public string? Remarks { get; set; }

        /// <summary>
        /// Gets or sets when the license was created.
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }
    }
}
