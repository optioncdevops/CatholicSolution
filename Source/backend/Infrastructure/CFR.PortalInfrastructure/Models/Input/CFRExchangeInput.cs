// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used by a product backend to exchange a one-time authorization code.
    /// </summary>
    public class CFRExchangeInput
    {
        /// <summary>
        /// Gets or sets the raw one-time authorization code.
        /// </summary>
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product identifier that is exchanging the code.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
    }
}
