// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Organization.OrganizationCrud (ActionId 7).
    /// Holds one product not yet assigned to an organization, for the assign-product dropdown.
    /// </summary>
    public class ProductLookupOutput
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
    }
}
