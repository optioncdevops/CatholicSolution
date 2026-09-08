// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
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

        /// <summary>
        /// Gets or sets an optional override email address to send the admin notification to.
        /// </summary>
        [JsonPropertyName("sendToEmail")]
        public string? SendToEmail { get; set; }

        /// <summary>
        /// Gets or sets the requester first name from the public Request Access form.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>
        /// Gets or sets the requester last name from the public Request Access form.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        /// <summary>
        /// Gets or sets the organization type from the public Request Access form.
        /// </summary>
        [JsonPropertyName("organizationType")]
        public string? OrganizationType { get; set; }

        /// <summary>
        /// Gets or sets the organization name. When present, the save is treated as a public portal request.
        /// </summary>
        [JsonPropertyName("organizationName")]
        public string? OrganizationName { get; set; }

        /// <summary>
        /// Gets or sets the organization street address.
        /// </summary>
        [JsonPropertyName("address")]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the organization city.
        /// </summary>
        [JsonPropertyName("city")]
        public string? City { get; set; }

        /// <summary>
        /// Gets or sets the organization state.
        /// </summary>
        [JsonPropertyName("state")]
        public string? State { get; set; }

        /// <summary>
        /// Gets or sets the organization ZIP / postal code.
        /// </summary>
        [JsonPropertyName("zip")]
        public string? Zip { get; set; }

        /// <summary>
        /// Gets or sets the requester phone number.
        /// </summary>
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        /// <summary>
        /// Gets or sets the applications requested from the public form.
        /// </summary>
        [JsonPropertyName("products")]
        public List<AccessRequestProductItem>? Products { get; set; }
    }

    /// <summary>
    /// One product selected on the public Request Access form.
    /// </summary>
    public class AccessRequestProductItem
    {
        /// <summary>
        /// Gets or sets the catalog or numeric product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product display name used to resolve core.Product.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;
    }
}

