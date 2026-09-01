// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Administration.ProductsCrud.
    /// Holds one hub product row returned to the service and controller.
    /// </summary>
    public class ProductOutput
    {
        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product display name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product category / subtitle.
        /// </summary>
        [JsonPropertyName("category")]
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product description.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the launch URL (prod environment, else ExternalPageUrl).
        /// </summary>
        [JsonPropertyName("externalUrl")]
        public string ExternalUrl { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets pipe-delimited feature names from the stored procedure. Not returned to the client.
        /// </summary>
        [JsonIgnore]
        public string FeatureNames { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the feature list shown on App Hub cards.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string> Features { get; set; } = [];

        /// <summary>
        /// Gets or sets the App Hub section: your, available, or future.
        /// </summary>
        [JsonPropertyName("hubSection")]
        public string HubSection { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the active flag. 1 = active, 0 = inactive.
        /// </summary>
        [JsonPropertyName("isActive")]
        public int IsActive { get; set; }

        /// <summary>
        /// Gets or sets the available-for-request flag. 1 = available, 0 = not available.
        /// </summary>
        [JsonPropertyName("isAvailable")]
        public int IsAvailable { get; set; }
    }
}
