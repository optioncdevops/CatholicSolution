// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Products.ProductsCrud
    /// (EnumVariables.ProductAction.GetAssignmentSummary). Holds one product's real
    /// organization-assignment counts from lic.OrganizationProduct — the admin dashboard's
    /// App Access Overview, not inferred from the static product catalog.
    /// </summary>
    public class ProductAssignmentSummaryOutput
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
        /// Gets or sets the count of organizations with an active assignment for this product.
        /// </summary>
        [JsonPropertyName("activeOrgCount")]
        public int ActiveOrgCount { get; set; }

        /// <summary>
        /// Gets or sets the count of organizations whose assignment for this product is
        /// inactive, revoked, or soft-deleted.
        /// </summary>
        [JsonPropertyName("inactiveOrgCount")]
        public int InactiveOrgCount { get; set; }

        /// <summary>
        /// Gets or sets the total count of distinct organizations ever assigned this product,
        /// regardless of current status.
        /// </summary>
        [JsonPropertyName("totalOrgCount")]
        public int TotalOrgCount { get; set; }
    }
}
