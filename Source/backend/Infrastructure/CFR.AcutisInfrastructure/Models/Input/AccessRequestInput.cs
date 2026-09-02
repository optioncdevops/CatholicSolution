// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to create an access request from App Hub Request access.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class AccessRequestInput
    {
        /// <summary>
        /// Gets or sets the catalog product identifier or core.Product.ProductId.
        /// Used only to resolve core.Product; it is not stored as a string on the request tables.
        /// </summary>
        [JsonPropertyName("productId")]
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product display name used to resolve core.Product when ProductId is not numeric.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the requester email used to resolve [auth].[User].CFRUserId.
        /// Name and email are not stored on the request tables.
        /// </summary>
        [JsonPropertyName("requesterEmail")]
        public string RequesterEmail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets an optional comment stored on AccessRequestComment.
        /// </summary>
        [JsonPropertyName("comment")]
        public string? Comment { get; set; }
    }
}
