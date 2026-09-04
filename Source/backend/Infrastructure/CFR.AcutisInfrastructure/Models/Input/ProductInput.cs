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
        /// Gets or sets the product logo file name.
        /// </summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>
        /// Gets or sets the relative path or URL of the product logo image.
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets the contact [auth].[AcutisUser] identifier. Null leaves the stored value unchanged; 0 clears it.
        /// </summary>
        [JsonPropertyName("contactUserId")]
        public long? ContactUserId { get; set; }

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
        /// Gets or sets the product license type: 'free' or 'licensed'.
        /// </summary>
        [JsonPropertyName("licenseType")]
        public string? LicenseType { get; set; }

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
        /// Gets or sets the uploaded logo image file from multipart/form-data.
        /// </summary>
        [JsonIgnore]
        public IFormFile? File { get; set; }
    }
}
