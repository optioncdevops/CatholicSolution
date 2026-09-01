// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 6).
    /// Holds one product assigned to an organization via lic.OrganizationProduct + core.Product.
    /// </summary>
    public class OrganizationProductOutput
    {
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
        /// Gets or sets the product's sub-category name.
        /// </summary>
        [JsonPropertyName("subCategoryName")]
        public string? SubCategoryName { get; set; }

        /// <summary>
        /// Gets or sets the product description.
        /// </summary>
        [JsonPropertyName("prodDescription")]
        public string? ProdDescription { get; set; }

        /// <summary>
        /// Gets or sets the product's external launch URL.
        /// </summary>
        [JsonPropertyName("externalPageUrl")]
        public string? ExternalPageUrl { get; set; }

        /// <summary>
        /// Gets or sets the assignment status for this organization link.
        /// </summary>
        [JsonPropertyName("assignStatus")]
        public string AssignStatus { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets when the product was assigned to this organization.
        /// </summary>
        [JsonPropertyName("assignedDate")]
        public DateTime AssignedDate { get; set; }
    }
}
