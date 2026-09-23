// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Access Request operations.
    /// Acts as the business-logic layer between AccessRequestController and IAccessRequestRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, and update access request status.
    /// - Relies on IAccessRequestRepository for stored procedure execution.
    /// </summary>
    public interface IAccessRequestService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all access requests.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the access request inbox list.
        /// Request Flow: AccessRequestController -> IAccessRequestService.GetAccessRequestsListAsync() -> IAccessRequestRepository.GetAccessRequestsListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetAccessRequestsListAsync().
        /// Response Details: MSResultArgs containing List of AccessRequestOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the access request list.</returns>
        Task<MSResultArgs> GetAccessRequestsListAsync();

        /// <summary>
        /// Retrieves one access request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review modal.
        /// Request Flow: AccessRequestController -> IAccessRequestService.GetAccessRequestByIdAsync() -> IAccessRequestRepository.GetAccessRequestByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetAccessRequestByIdAsync().
        /// Response Details: MSResultArgs containing AccessRequestOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="accessRequestProductId">Optional product line to scope the result to, when the request has more than one.</param>
        /// <returns>MSResultArgs containing the access request.</returns>
        Task<MSResultArgs> GetAccessRequestByIdAsync(int accessRequestId, int? accessRequestProductId = null);

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates an access request status.
        /// </summary>
        /// <remarks>
        /// Purpose: Approve, reject, or request more information, then email the requester from AccessApproved or AccessInfo.
        /// Request Flow: AccessRequestController -> IAccessRequestService.UpdateAccessRequestStatusAsync() -> IAccessRequestRepository.UpdateAccessRequestStatusAsync().
        /// Validation Details: Identifier must be a positive integer; status must be an allowed resolve value.
        /// Business Logic: Delegates the status update to the repository, then emails the requester. Mail failure does not fail the update.
        /// Repository Interaction: Calls IAccessRequestRepository.UpdateAccessRequestStatusAsync() and IEmailTemplatesRepository.GetEmailTemplateByCodeAsync().
        /// Response Details: MSResultArgs containing the access request identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        Task<MSResultArgs> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input);

        #endregion PUT Methods
    }
}

