// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to submit a public "Suggest a product" request.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class ProductRequestInput
    {
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
        [JsonPropertyName("category")]
        public string? Category { get; set; }

        /// <summary>
        /// Gets or sets the proposed product description.
        /// </summary>
        [JsonPropertyName("description")]
        public string ProdDescription { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the proposed product's production / external URL.
        /// </summary>
        [JsonPropertyName("productionUrl")]
        public string? ExternalPageUrl { get; set; }

        /// <summary>
        /// Gets or sets the preferred navigation target: 'same-tab' or 'new-tab'.
        /// </summary>
        [JsonPropertyName("navigationTarget")]
        public string? NavigationTarget { get; set; }

        /// <summary>
        /// Gets or sets the proposed feature list.
        /// </summary>
        [JsonPropertyName("features")]
        public List<string>? Features { get; set; }

        /// <summary>
        /// Gets or sets the proposed product's logo file name, already saved via
        /// POST ProductRequest/UploadProductRequestLogo before this submit.
        /// </summary>
        [JsonPropertyName("logoName")]
        public string? LogoName { get; set; }

        /// <summary>
        /// Gets or sets the name of the person submitting the request.
        /// </summary>
        [JsonPropertyName("contactName")]
        public string RequesterName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email of the person submitting the request.
        /// </summary>
        [JsonPropertyName("contactEmail")]
        public string RequesterEmail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the requester's organization name, if any.
        /// </summary>
        [JsonPropertyName("organizationName")]
        public string? OrganizationName { get; set; }
    }
}
