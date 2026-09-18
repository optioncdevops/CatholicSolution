// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output model representing a product from Core.Product.
    /// </summary>
    public class ProductOutput
    {
        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the full product name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the short product name.
        /// </summary>
        [JsonPropertyName("shortName")]
        public string? ShortName { get; set; }

        /// <summary>
        /// Gets or sets the sub category name.
        /// </summary>
        [JsonPropertyName("subCategoryName")]
        public string? SubCategoryName { get; set; }

        /// <summary>
        /// Gets or sets the product description.
        /// </summary>
        [JsonPropertyName("prodDescription")]
        public string? ProdDescription { get; set; }

        /// <summary>
        /// Gets or sets the external page URL.
        /// </summary>
        [JsonPropertyName("externalPageUrl")]
        public string? ExternalPageUrl { get; set; }


        /// <summary>
        /// Gets or sets the product logo file name.
        /// </summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>
        /// Gets or sets the active status flag.
        /// </summary>
        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        /// <summary>
        /// Gets or sets the product status: 1 = Active, 2 = Coming Soon, null = Inactive.
        /// </summary>
        [JsonPropertyName("productStatus")]
        public int? ProductStatus { get; set; }


        /// <summary>
        /// Gets or sets the navigation target: 'same-tab' or 'new-tab'.
        /// </summary>
        [JsonPropertyName("navigationTarget")]
        public string? NavigationTarget { get; set; }

        /// <summary>
        /// Gets or sets the contact [auth].[AcutisUser] identifier.
        /// </summary>
        [JsonPropertyName("contactUserId")]
        public long? ContactUserId { get; set; }

        /// <summary>
        /// Gets or sets the contact display name resolved from [auth].[AcutisUser].
        /// </summary>
        [JsonPropertyName("contactPerson")]
        public string? ContactPerson { get; set; }

        /// <summary>
        /// Gets or sets the number of organizations assigned to this product.
        /// </summary>
        [JsonPropertyName("customerCount")]
        public int CustomerCount { get; set; }

        /// <summary>
        /// Gets or sets the record creation date.
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// Gets or sets the user identifier who inserted the record.
        /// </summary>
        [JsonPropertyName("insertedBy")]
        public long? InsertedBy { get; set; }

        /// <summary>
        /// Gets or sets the record last updated date.
        /// </summary>
        [JsonPropertyName("updatedDate")]
        public DateTime? UpdatedDate { get; set; }

        /// <summary>
        /// Gets or sets the user identifier who last updated the record.
        /// </summary>
        [JsonPropertyName("updatedBy")]
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the display name of the user who last updated the record, resolved from [auth].[AcutisUser].
        /// </summary>
        [JsonPropertyName("updatedByName")]
        public string? UpdatedByName { get; set; }

        /// <summary>
        /// Gets or sets the deleted flag.
        /// </summary>
        [JsonPropertyName("isDeleted")]
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Gets or sets the list of feature names for this product.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string> Features { get; set; } = [];
    }

    /// <summary>
    /// Output model containing product logo image bytes and content type for streaming.
    /// </summary>
    public class ProductLogoFileOutput
    {
        /// <summary>
        /// Gets or sets the raw logo image bytes.
        /// </summary>
        public byte[] FileBytes { get; set; } = [];

        /// <summary>
        /// Gets or sets the MIME content type (e.g. image/jpeg, image/png).
        /// </summary>
        public string ContentType { get; set; } = "image/jpeg";

        /// <summary>
        /// Gets or sets the stored logo file name.
        /// </summary>
        public string FileName { get; set; } = string.Empty;
    }
}

