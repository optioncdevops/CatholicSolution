// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Access Request database operations.
    /// Repository Responsibility:
    /// - Declares SELECT, INSERT, and status-update operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IAccessRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all access requests.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the access request inbox list.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.GetAccessRequestsListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 4.
        /// Response Details: Returns a list of AccessRequestOutput records.
        /// </remarks>
        /// <returns>A list of access request output records.</returns>
        Task<List<AccessRequestOutput>> GetAccessRequestsListAsync();

        /// <summary>
        /// Retrieves one access request by identifier, including timeline and comments.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review modal.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.GetAccessRequestByIdAsync() -> SQL Database.
        /// Validation Details: AccessRequestId parameter mapping.
        /// Business Logic: Maps header, timeline, and comment result sets.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 3.
        /// Response Details: Returns an AccessRequestOutput record or null.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <returns>The matching request, or null when not found.</returns>
        Task<AccessRequestOutput?> GetAccessRequestByIdAsync(int accessRequestId);

        /// <summary>
        /// Retrieves email addresses for users matched to a product.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve AccessRequested recipients from the requested product name/id.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.GetProductNotificationRecipientsAsync() -> SQL Database.
        /// Validation Details: ProductId and ProductName parameter mapping.
        /// Business Logic: Matches [auth].[UserProduct] to [auth].[User] on CFRUserId; falls back to Platform Admin when nobody is assigned.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 5.
        /// Response Details: Returns a list of AccessRequestRecipientOutput records.
        /// </remarks>
        /// <param name="productId">Numeric product identifier when known.</param>
        /// <param name="productName">Product display name used to resolve core.Product when ProductId is not numeric.</param>
        /// <returns>A list of recipient email records.</returns>
        Task<List<AccessRequestRecipientOutput>> GetProductNotificationRecipientsAsync(string productId, string productName);

        /// <summary>
        /// Retrieves App Hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Classify core.Product rows as your / available / future from [auth].[UserProduct].
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.GetHubProductsAsync() -> SQL Database.
        /// Validation Details: RequesterEmail parameter mapping.
        /// Business Logic: Matches [auth].[User] by email, joins [auth].[UserProduct] on CFRUserId, then [core].[Product].
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 6.
        /// Response Details: Returns a list of HubProductOutput records.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to resolve [auth].[User].CFRUserId.</param>
        /// <returns>A list of hub product output records.</returns>
        Task<List<HubProductOutput>> GetHubProductsAsync(string? requesterEmail);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts an access request plus product, status history, and optional comment rows.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist a Request access submission.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.SaveAccessRequestAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds AccessRequestInput and executes the save stored procedure.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 1.
        /// Response Details: Returns the new AccessRequestId, or -99 when a duplicate pending request exists.
        /// </remarks>
        /// <param name="input">Input DTO containing request fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        Task<int> SaveAccessRequestAsync(AccessRequestInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates access request status and writes status history / comment rows.
        /// </summary>
        /// <remarks>
        /// Purpose: Approve, reject, or request more information.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.UpdateAccessRequestStatusAsync() -> SQL Database.
        /// Validation Details: AccessRequestId and Status parameter mapping.
        /// Business Logic: Executes the status update stored procedure.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 2.
        /// Response Details: Returns the AccessRequestId when the update succeeded.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated access request identifier.</returns>
        Task<int> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input);

        #endregion PUT Methods
    }
}
