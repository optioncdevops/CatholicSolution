// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to update an existing product in Core.Product.
    /// Bound from the controller request body on PUT /api/v1/Products/UpdateProduct.
    /// </summary>
    public class ProductInput
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
        /// Gets or sets the short product name.
        /// </summary>
        [JsonPropertyName("shortName")]
        public string? ShortName { get; set; }

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
        /// Gets or sets the product logo file name.
        /// </summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>
        /// Gets or sets the contact [auth].[AcutisUser] identifier. Null leaves the stored value unchanged; 0 clears it.
        /// </summary>
        [JsonPropertyName("contactUserId")]
        public long? ContactUserId { get; set; }

        /// <summary>
        /// Gets or sets the product support user identifier.
        /// </summary>
        [JsonPropertyName("productSupportUser")]
        public long? ProductSupportUser { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the product is active.
        /// </summary>
        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Gets or sets the product status: 1 = Active, 2 = Coming Soon, 3 = Inactive.
        /// </summary>
        [JsonPropertyName("productStatus")]
        public int? ProductStatus { get; set; }


        /// <summary>
        /// Gets or sets the navigation target: 'same-tab' or 'new-tab'.
        /// </summary>
        [JsonPropertyName("navigationTarget")]
        public string? NavigationTarget { get; set; }

        /// <summary>
        /// Gets or sets the product feature list.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string>? Features { get; set; }

        /// <summary>
        /// Gets or sets whether public registration is allowed.
        /// </summary>
        [JsonPropertyName("allowPublicRegistration")]
        public bool AllowPublicRegistration { get; set; }
    }
}
