// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to launch an assigned product.
    /// Bound from the controller request body. ProductId is the only client-supplied value.
    /// </summary>
    public class CFRLaunchInput
    {
        /// <summary>
        /// Gets or sets the product identifier to launch.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
    }
}
