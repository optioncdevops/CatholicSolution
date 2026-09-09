// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to approve, reject, or request more information on an access request.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class AccessRequestStatusInput
    {
        /// <summary>
        /// Gets or sets the access request identifier.
        /// </summary>
        [JsonPropertyName("accessRequestId")]
        public int AccessRequestId { get; set; }

        /// <summary>
        /// Gets or sets the new UI status: approved, rejected, or info-requested (header in_review).
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets an optional reviewer note stored on AccessRequestComment / status history.
        /// </summary>
        [JsonPropertyName("note")]
        public string? Note { get; set; }
    }
}

