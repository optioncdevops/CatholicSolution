// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to create a new product in Core.Product.
    /// Bound from the controller request body on POST /api/v1/Products/SaveProduct.
    /// ProductId is omitted because it is generated sequentially on the server.
    /// </summary>
    public class ProductSaveInput
    {
        /// <summary>
        /// Gets or sets the product name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the sub-category / subtitle name.
        /// </summary>
        [JsonPropertyName("subCategoryName")]
        public string? SubCategoryName { get; set; }

        /// <summary>
        /// Gets or sets the product description.
        /// </summary>
        [JsonPropertyName("prodDescription")]
        public string? ProdDescription { get; set; }

        /// <summary>
        /// Gets or sets the external website or application URL.
        /// </summary>
        [JsonPropertyName("externalPageUrl")]
        public string? ExternalPageUrl { get; set; }

        /// <summary>
        /// Gets or sets the default access days for licenses.
        /// </summary>
        [JsonPropertyName("defaultAccessDays")]
        public int DefaultAccessDays { get; set; } = 365;

        /// <summary>
        /// Gets or sets the relative path or URL of the product logo image.
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the product is active.
        /// </summary>
        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether the product is available.
        /// </summary>
        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; } = true;

        /// <summary>
        /// Gets or sets the product feature list.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string>? Features { get; set; }
    }

    /// <summary>
    /// Input DTO used to update an existing product in Core.Product.
    /// Bound from the controller request body on PUT /api/v1/Products/UpdateProduct.
    /// </summary>
    public class ProductInput : ProductSaveInput
    {
        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
    }
}
