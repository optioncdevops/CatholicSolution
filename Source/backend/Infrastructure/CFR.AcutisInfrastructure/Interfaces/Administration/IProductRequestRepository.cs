// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for admin review of public "Suggest a product" requests.
    /// Repository Responsibility:
    /// - Declares list, get, approve, and reject operations against StoredProc.Requests.ProductRequestCrud.
    /// </summary>
    public interface IProductRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves product requests for the admin review list.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch pending/approved/rejected product requests for CFR Admin.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.GetProductRequestsListAsync() -> SQL Database.
        /// Validation Details: RequestStatus parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 2.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns a list of ProductRequestOutput records.
        /// </remarks>
        /// <param name="requestStatus">Optional status filter: 1 = pending, 2 = approved, 3 = rejected.</param>
        /// <returns>A list of product request output records.</returns>
        Task<List<ProductRequestOutput>> GetProductRequestsListAsync(int? requestStatus);

        /// <summary>
        /// Retrieves one product request by identifier, including its proposed features.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review detail view.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.GetProductRequestByIdAsync() -> SQL Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Reads two result sets (header and features) using ActionId 3.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns ProductRequestOutput with Features, or null when not found.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <returns>The matching request, or null when not found.</returns>
        Task<ProductRequestOutput?> GetProductRequestByIdAsync(int productRequestId);

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Approves a pending product request, copying it into [core].[Product] / [core].[ProductFeature].
        /// </summary>
        /// <remarks>
        /// Purpose: Promote a proposed product into the live catalog.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.ApproveProductRequestAsync() -> SQL Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 4 and stamps UpdatedBy as the reviewer.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns the new [core].[Product].[ProductId], -95 when not found or already decided, or -99 on duplicate product name.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <param name="decisionRemarks">Optional reviewer remarks.</param>
        /// <returns>New ProductId or negative error code.</returns>
        Task<int> ApproveProductRequestAsync(int productRequestId, string? decisionRemarks);

        /// <summary>
        /// Rejects a pending product request. No catalog changes are made.
        /// </summary>
        /// <remarks>
        /// Purpose: Record a rejection decision on a proposed product.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.RejectProductRequestAsync() -> SQL Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 5 and stamps UpdatedBy as the reviewer.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns the ProductRequestId, or -95 when not found or already decided.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <param name="decisionRemarks">Optional reviewer remarks.</param>
        /// <returns>ProductRequestId or negative error code.</returns>
        Task<int> RejectProductRequestAsync(int productRequestId, string? decisionRemarks);

        #endregion PUT Methods
    }
}
