// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Requests.AccessRequestCrud.
    /// Holds one access request row returned to the service and controller.
    /// </summary>
    public class AccessRequestOutput
    {
        /// <summary>
        /// Gets or sets the access request identifier.
        /// </summary>
        [JsonPropertyName("accessRequestId")]
        public int AccessRequestId { get; set; }

        /// <summary>
        /// Gets or sets the product line identifier ([request].[AccessRequestProduct].[AccessRequestProductId])
        /// this row represents - a request can have more than one product line, so this is what the
        /// Admin UI sends back on the next approve/reject call to target this exact line.
        /// </summary>
        [JsonPropertyName("accessRequestProductId")]
        public int AccessRequestProductId { get; set; }

        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("organizationId")]
        public int OrganizationId { get; set; }

        /// <summary>
        /// Gets or sets the organization name.
        /// </summary>
        [JsonPropertyName("organizationName")]
        public string OrganizationName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization type from the public request.
        /// </summary>
        [JsonPropertyName("organizationType")]
        public string? OrganizationType { get; set; }

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
        /// Gets or sets the requester full name.
        /// </summary>
        [JsonPropertyName("requesterName")]
        public string RequesterName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the requester email address.
        /// </summary>
        [JsonPropertyName("requesterEmail")]
        public string RequesterEmail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the catalog product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product display name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the request status.
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the submitted timestamp.
        /// </summary>
        [JsonPropertyName("submittedAt")]
        public string? SubmittedAt { get; set; }

        /// <summary>
        /// Gets or sets the status timeline loaded on get-by-id.
        /// </summary>
        [JsonPropertyName("timeline")]
        public List<AccessRequestTimelineOutput> Timeline { get; set; } = [];

        /// <summary>
        /// Gets or sets comments loaded on get-by-id.
        /// </summary>
        [JsonPropertyName("comments")]
        public List<AccessRequestCommentOutput> Comments { get; set; } = [];
    }

    /// <summary>
    /// Output DTO for one AccessRequestStatusHistory row.
    /// </summary>
    public class AccessRequestTimelineOutput
    {
        /// <summary>
        /// Gets or sets the status value.
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the event timestamp.
        /// </summary>
        [JsonPropertyName("at")]
        public string? At { get; set; }

        /// <summary>
        /// Gets or sets an optional note.
        /// </summary>
        [JsonPropertyName("note")]
        public string? Note { get; set; }

        /// <summary>
        /// Gets or sets the actor display name.
        /// </summary>
        [JsonPropertyName("actor")]
        public string Actor { get; set; } = string.Empty;
    }

    /// <summary>
    /// Output DTO for one AccessRequestComment row.
    /// </summary>
    public class AccessRequestCommentOutput
    {
        /// <summary>
        /// Gets or sets the comment identifier.
        /// </summary>
        [JsonPropertyName("commentId")]
        public int CommentId { get; set; }

        /// <summary>
        /// Gets or sets the comment text.
        /// </summary>
        [JsonPropertyName("comment")]
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the actor display name.
        /// </summary>
        [JsonPropertyName("actor")]
        public string Actor { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the comment timestamp.
        /// </summary>
        [JsonPropertyName("at")]
        public string? At { get; set; }
    }

    /// <summary>
    /// Output DTO for one product-matched AccessRequested email recipient.
    /// </summary>
    public class AccessRequestRecipientOutput
    {
        /// <summary>
        /// Gets or sets the recipient email address.
        /// </summary>
        [JsonPropertyName("eMail")]
        public string EMail { get; set; } = string.Empty;
    }
}

