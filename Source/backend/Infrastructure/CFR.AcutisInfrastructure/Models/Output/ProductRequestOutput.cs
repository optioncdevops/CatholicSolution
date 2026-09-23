// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output model mapped from stored procedure StoredProc.Requests.ProductRequestCrud.
    /// Holds one public "Suggest a product" request row for the admin review list/detail.
    /// </summary>
    public class ProductRequestOutput
    {
        /// <summary>
        /// Gets or sets the product request identifier.
        /// </summary>
        [JsonPropertyName("productRequestId")]
        public int ProductRequestId { get; set; }

        /// <summary>
        /// Gets or sets the proposed product name.
        /// </summary>
        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the proposed product short name.
        /// </summary>
        [JsonPropertyName("shortName")]
        public string? ShortName { get; set; }

        /// <summary>
        /// Gets or sets the proposed product category / subtitle.
        /// </summary>
        [JsonPropertyName("subCategoryName")]
        public string? SubCategoryName { get; set; }

        /// <summary>
        /// Gets or sets the proposed product description.
        /// </summary>
        [JsonPropertyName("prodDescription")]
        public string? ProdDescription { get; set; }

        /// <summary>
        /// Gets or sets the proposed product's production / external URL.
        /// </summary>
        [JsonPropertyName("externalPageUrl")]
        public string? ExternalPageUrl { get; set; }

        /// <summary>
        /// Gets or sets the proposed navigation target: 'same-tab' or 'new-tab'.
        /// </summary>
        [JsonPropertyName("navigationTarget")]
        public string? NavigationTarget { get; set; }

        /// <summary>
        /// Gets or sets the proposed product's logo file name (in Acutis/Attachment/Products - the
        /// same folder [core].[Product].[LogoName] serves from).
        /// </summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>
        /// Gets or sets the name of the person who submitted the request.
        /// </summary>
        [JsonPropertyName("requesterName")]
        public string RequesterName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email of the person who submitted the request.
        /// </summary>
        [JsonPropertyName("requesterEmail")]
        public string RequesterEmail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization name supplied by the requester, if any.
        /// </summary>
        [JsonPropertyName("organizationName")]
        public string? OrganizationName { get; set; }

        /// <summary>
        /// Gets or sets the request status: 1 = pending, 2 = approved, 3 = rejected.
        /// </summary>
        [JsonPropertyName("requestStatus")]
        public int RequestStatus { get; set; }

        /// <summary>
        /// Gets or sets the reviewer's user identifier.
        /// </summary>
        [JsonPropertyName("reviewedBy")]
        public long? ReviewedBy { get; set; }

        /// <summary>
        /// Gets or sets the date the request was reviewed.
        /// </summary>
        [JsonPropertyName("reviewedDate")]
        public DateTime? ReviewedDate { get; set; }

        /// <summary>
        /// Gets or sets the reviewer's decision remarks.
        /// </summary>
        [JsonPropertyName("decisionRemarks")]
        public string? DecisionRemarks { get; set; }

        /// <summary>
        /// Gets or sets the [core].[Product].[ProductId] created on approval, or null when not yet approved.
        /// </summary>
        [JsonPropertyName("approvedProductId")]
        public int? ApprovedProductId { get; set; }

        /// <summary>
        /// Gets or sets the date the request was submitted.
        /// </summary>
        [JsonPropertyName("insertedDate")]
        public DateTime InsertedDate { get; set; }

        /// <summary>
        /// Gets or sets the proposed feature list, populated only on get-by-id.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string> Features { get; set; } = [];
    }
}
