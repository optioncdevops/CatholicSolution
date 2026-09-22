// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for admin review of public "Suggest a product" requests.
    /// Acts as the business-logic layer between ProductRequestController and IProductRequestRepository.
    /// Responsibility:
    /// - Declares methods to list, fetch, approve, and reject product requests.
    /// - Relies on IProductRequestRepository for stored procedure execution.
    /// </summary>
    public interface IProductRequestService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves product requests for the admin review list.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch pending/approved/rejected product requests.
        /// Request Flow: ProductRequestController -> IProductRequestService.GetProductRequestsListAsync() -> IProductRequestRepository.GetProductRequestsListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductRequestRepository.GetProductRequestsListAsync().
        /// Response Details: MSResultArgs containing List of ProductRequestOutput.
        /// </remarks>
        /// <param name="requestStatus">Optional status filter: 1 = pending, 2 = approved, 3 = rejected.</param>
        /// <returns>MSResultArgs containing the product request list.</returns>
        Task<MSResultArgs> GetProductRequestsListAsync(int? requestStatus);

        /// <summary>
        /// Retrieves one product request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review detail view.
        /// Request Flow: ProductRequestController -> IProductRequestService.GetProductRequestByIdAsync() -> IProductRequestRepository.GetProductRequestByIdAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing ProductRequestOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <returns>MSResultArgs containing the product request.</returns>
        Task<MSResultArgs> GetProductRequestByIdAsync(int productRequestId);

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Approves a product request, promoting it into the live product catalog.
        /// </summary>
        /// <remarks>
        /// Purpose: Copy the proposed product into [core].[Product] / [core].[ProductFeature], then email the requester.
        /// Request Flow: ProductRequestController -> IProductRequestService.ApproveProductRequestAsync() -> IProductRequestRepository.ApproveProductRequestAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Delegates the approval to the repository, maps duplicate-name/already-decided results to Conflict, then emails the requester. Mail failure does not fail the approval.
        /// Repository Interaction: Calls IProductRequestRepository.ApproveProductRequestAsync() and IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing the new ProductId.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>MSResultArgs containing the approval outcome.</returns>
        Task<MSResultArgs> ApproveProductRequestAsync(ProductRequestDecisionInput input);

        /// <summary>
        /// Rejects a product request. No catalog changes are made.
        /// </summary>
        /// <remarks>
        /// Purpose: Record a rejection decision, then email the requester.
        /// Request Flow: ProductRequestController -> IProductRequestService.RejectProductRequestAsync() -> IProductRequestRepository.RejectProductRequestAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Delegates the rejection to the repository, maps an already-decided result to Conflict, then emails the requester. Mail failure does not fail the rejection.
        /// Repository Interaction: Calls IProductRequestRepository.RejectProductRequestAsync() and IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing the rejection outcome.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>MSResultArgs containing the rejection outcome.</returns>
        Task<MSResultArgs> RejectProductRequestAsync(ProductRequestDecisionInput input);

        #endregion PUT Methods

        #region POST Methods

        /// <summary>
        /// Uploads a proposed product's logo image ahead of a public submission.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a visitor attach a logo to their suggestion before Submit is clicked - hosted here (not CFR.Portal) so the saved file lands in the exact folder [core].[Product].[LogoName] is served from.
        /// Request Flow: ProductRequestController -> IProductRequestService.UploadProductRequestLogoAsync() -> local disk (IWebHostEnvironment.WebRootPath).
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Saves via the same portable WebRootPath-based pattern ProductsService.UpdateProductLogoAsync uses.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the saved logo file name, or BadRequest.
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing the saved logo file name.</returns>
        Task<MSResultArgs> UploadProductRequestLogoAsync(IFormFile? file);

        #endregion POST Methods
    }
}
