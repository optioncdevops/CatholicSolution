// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// One product a CFR user (looked up by email) has active access to. Field names deliberately
    /// match Acutis's existing GetProducts row shape (ProductId/ShortName/ProductName/
    /// SubCategoryName/ExternalPageUrl/LogoName/NavigationTarget) so the App Switcher widget's
    /// existing parsing logic needs no changes beyond which endpoint it calls.
    /// </summary>
    public class UserProductListItemOutput
    {
        /// <summary>Gets or sets the product identifier.</summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>Gets or sets the full product name.</summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>Gets or sets the short display name, preferred over ProductName when present.</summary>
        [JsonPropertyName("shortName")]
        public string? ShortName { get; set; }

        /// <summary>Gets or sets the sub category name.</summary>
        [JsonPropertyName("subCategoryName")]
        public string? SubCategoryName { get; set; }

        /// <summary>Gets or sets the product's external launch URL.</summary>
        [JsonPropertyName("externalPageUrl")]
        public string? ExternalPageUrl { get; set; }

        /// <summary>Gets or sets the relative path or file name of the product logo.</summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>Gets or sets the launch behavior: same-tab or new-tab.</summary>
        [JsonPropertyName("navigationTarget")]
        public string? NavigationTarget { get; set; }
    }
}
