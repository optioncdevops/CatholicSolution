// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// Response payload for a successful product launch: the target product's launch URL,
    /// already carrying the one-time authorization code that product's own ExchangeToken
    /// consumer will validate.
    /// </summary>
    public class ProductLaunchOutput
    {
        /// <summary>Gets or sets the product identifier.</summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>Gets or sets the launch URL, including the one-time authorization code.</summary>
        [JsonPropertyName("launchUrl")]
        public string LaunchUrl { get; set; } = string.Empty;

        /// <summary>Gets or sets the UTC expiry for the authorization code.</summary>
        [JsonPropertyName("expiresAt")]
        public DateTime ExpiresAt { get; set; }
    }
}
