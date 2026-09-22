// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to approve or reject a pending product request.
    /// Bound from the controller request body on PUT ApproveProductRequest / RejectProductRequest.
    /// </summary>
    public class ProductRequestDecisionInput
    {
        /// <summary>
        /// Gets or sets the product request identifier being decided.
        /// </summary>
        [JsonPropertyName("productRequestId")]
        public int ProductRequestId { get; set; }

        /// <summary>
        /// Gets or sets the reviewer's optional decision remarks.
        /// </summary>
        [JsonPropertyName("decisionRemarks")]
        public string? DecisionRemarks { get; set; }
    }
}
