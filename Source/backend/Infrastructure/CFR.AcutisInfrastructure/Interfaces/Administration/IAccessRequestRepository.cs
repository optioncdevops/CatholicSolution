// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Access Request database operations.
    /// Repository Responsibility:
    /// - Declares SELECT and status-update operations against SQL Server via Dapper stored procedures.
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

        #endregion GET Methods

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
