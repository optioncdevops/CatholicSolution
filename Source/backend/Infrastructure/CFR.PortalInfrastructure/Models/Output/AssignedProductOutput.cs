// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO for one product assigned to the authenticated CFR member.
    /// Mapped from stored procedure StoredProc.CFRLaunch.CFRLaunchCrud ActionId 1.
    /// </summary>
    public class AssignedProductOutput
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
        /// Gets or sets the launch base URL from [core].[ProductEnvironment] for the login environment.
        /// </summary>
        [JsonPropertyName("baseUrl")]
        public string? BaseUrl { get; set; }

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
        /// Gets or sets whether the current member may request this product (RoleId 4 or 9).
        /// </summary>
        [JsonPropertyName("canRequest")]
        public bool CanRequest { get; set; }
    }
}
