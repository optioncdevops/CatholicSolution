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
        /// <param name="accessRequestProductId">
        /// Optional product line to scope the result to. When null, every line on the request is
        /// eligible (the caller still only reads the first row).
        /// </param>
        /// <returns>The matching request, or null when not found.</returns>
        Task<AccessRequestOutput?> GetAccessRequestByIdAsync(int accessRequestId, int? accessRequestProductId = null);

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
        /// Response Details: Returns the AccessRequestId and the resolved AccessRequestProductId when the update succeeded.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated access request identifier and the product line that was acted on.</returns>
        Task<AccessRequestStatusUpdateResult> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input);

        #endregion PUT Methods

        #region GET Methods (Org Setup)

        /// <summary>
        /// Fetches the contact/org fields needed to call SMS's SetupNewOrganizationByCFR at approval time.
        /// </summary>
        /// <remarks>
        /// Purpose: Supply firstName/lastName/organizationName/contactNo/emailAddress/state/cfrOrgID/cfrUserID/productName for the external call.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.GetOrgSetupContextAsync() -> SQL Database.
        /// Validation Details: AccessRequestId/AccessRequestProductId parameter mapping.
        /// Business Logic: ProductName comes from the specific product line just approved, so the caller can route to a product-specific SMS setup endpoint (e.g. Parish Hub).
        /// Repository Interaction: Runs a plain SELECT joining request.AccessRequest to auth.User, request.AccessRequestProduct, and core.Product (CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: Returns OrgSetupContextOutput, or null when not found.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="accessRequestProductId">The specific product line just approved.</param>
        /// <returns>The org-setup context, or null when the request/line doesn't exist.</returns>
        Task<OrgSetupContextOutput?> GetOrgSetupContextAsync(int accessRequestId, int accessRequestProductId);

        #endregion GET Methods (Org Setup)

        #region PUT Methods (Org Setup)

        /// <summary>
        /// Writes the OrgId returned by SMS's SetupNewOrganizationByCFR back into CFR's own
        /// license rows once provisioning succeeds. SMS's returned UserId is deliberately not used
        /// anywhere - only OrgId matters to this process.
        /// </summary>
        /// <remarks>
        /// Purpose: Record the product-side org identifier so App Hub / launch (gated on
        /// [lic].[OrganizationProduct]) can use it.
        /// Request Flow: IAccessRequestService -> IAccessRequestRepository.PersistOrgSetupResultAsync() -> SQL Database.
        /// Validation Details: AccessRequestId/AccessRequestProductId/OrgId parameter mapping.
        /// Business Logic: Creates [core].[Organization] from the org fields staged on
        /// [request].[AccessRequest] if one doesn't exist yet for this request, points
        /// [request].[AccessRequest].[OrgId] at it, then creates/reactivates
        /// [lic].[OrganizationProduct] with [ProductOrgId] set to the real SMS OrgId.
        /// Repository Interaction: Runs plain SELECT/UPDATE/INSERT statements (CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: None.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="accessRequestProductId">The specific product line just approved.</param>
        /// <param name="orgId">The OrgId returned by SMS.</param>
        Task PersistOrgSetupResultAsync(int accessRequestId, int accessRequestProductId, int orgId);

        #endregion PUT Methods (Org Setup)
    }
}
