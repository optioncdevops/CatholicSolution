// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO for one App Hub product row from AccessRequestManage ActionId 6.
    /// HubSection is your when the requester email matches [auth].[User] and that user
    /// has a [auth].[UserProduct] row for the product; otherwise available or future.
    /// </summary>
    public class HubProductOutput
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
        /// Gets or sets the relative path or URL of the product logo.
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets the active status flag.
        /// </summary>
        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        /// <summary>
        /// Gets or sets the availability flag.
        /// </summary>
        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; }

        /// <summary>
        /// Gets or sets the App Hub section: your, available, or future.
        /// </summary>
        [JsonPropertyName("hubSection")]
        public string HubSection { get; set; } = "future";

        /// <summary>
        /// Gets or sets the features as a comma-separated string.
        /// </summary>
        [JsonPropertyName("features")]
        public string? Features { get; set; }

        /// <summary>
        /// Gets or sets the contact person's email address if found.
        /// </summary>
        [JsonPropertyName("contactEmail")]
        public string? ContactEmail { get; set; }

        /// <summary>
        /// Gets or sets the contact user identifier.
        /// </summary>
        [JsonPropertyName("contactUserId")]
        public long? ContactUserId { get; set; }
    }
}

