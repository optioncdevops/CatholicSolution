// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing product access requests.
    /// Handles listing, saving, and updating request status.
    /// Service Responsibility:
    /// - IAccessRequestService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class AccessRequestController(IAccessRequestService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all access requests.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch access request inbox records for CFR Admin.
        /// Request Flow: Client API GET -> AccessRequestController.GetAccessRequests() -> IAccessRequestService.GetAccessRequestsListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.GetAccessRequestsListAsync().
        /// Response Details: Standard API result enclosing List of AccessRequestOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the access request dataset.</returns>
        /// <response code="200">Successfully fetched access requests list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetAccessRequests)]
        public async Task<IActionResult> GetAccessRequests()
        {
            return ApiResultArgs(await service.GetAccessRequestsListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one access request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review modal.
        /// Request Flow: Client API GET -> AccessRequestController.GetAccessRequestById() -> IAccessRequestService.GetAccessRequestByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.GetAccessRequestByIdAsync().
        /// Response Details: Standard API result enclosing AccessRequestOutput with status 200 or 500.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <returns>A consistent API response containing the access request.</returns>
        /// <response code="200">Successfully fetched the access request.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetAccessRequestById)]
        public async Task<IActionResult> GetAccessRequestById(int accessRequestId)
        {
            return ApiResultArgs(await service.GetAccessRequestByIdAsync(accessRequestId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves App Hub products for the signed-in member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Match [auth].[User] by email, join [auth].[UserProduct] for Your Apps, and return remaining [core].[Product] rows as Available or Future.
        /// Request Flow: Client API GET -> AccessRequestController.GetHubProducts() -> IAccessRequestService.GetHubProductsAsync() -> Database.
        /// Validation Details: Query parameter binding maps requesterEmail.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.GetHubProductsAsync().
        /// Response Details: Standard API result enclosing List of HubProductOutput with status 200 or 500.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to resolve [auth].[User].CFRUserId.</param>
        /// <returns>A consistent API response containing the hub product dataset.</returns>
        /// <response code="200">Successfully fetched hub products.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetHubProducts)]
        public async Task<IActionResult> GetHubProducts(string? requesterEmail)
        {
            return ApiResultArgs(await service.GetHubProductsAsync(requesterEmail), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new access request from App Hub Request access.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert AccessRequest, AccessRequestProduct, AccessRequestStatusHistory, and optional AccessRequestComment, then email admins.
        /// Request Flow: Client API POST -> AccessRequestController.SaveAccessRequest() -> IAccessRequestService.SaveAccessRequestAsync() -> Database.
        /// Validation Details: Model binding maps AccessRequestInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.SaveAccessRequestAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing request fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the access request.</response>
        /// <response code="409">A pending request for this product already exists.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [AllowAnonymous]
        [ActionName(API_Administration.SaveAccessRequest)]
        public async Task<IActionResult> SaveAccessRequest([FromBody] AccessRequestInput input)
        {
            return ApiResultArgs(await service.SaveAccessRequestAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an access request status.
        /// </summary>
        /// <remarks>
        /// Purpose: Approve, reject, or request more information.
        /// Request Flow: Client API PUT -> AccessRequestController.UpdateAccessRequestStatus() -> IAccessRequestService.UpdateAccessRequestStatusAsync() -> Database.
        /// Validation Details: Model binding maps AccessRequestStatusInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.UpdateAccessRequestStatusAsync().
        /// Response Details: Standard API result representing the update outcome.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully updated the access request status.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Administration.UpdateAccessRequestStatus)]
        public async Task<IActionResult> UpdateAccessRequestStatus([FromBody] AccessRequestStatusInput input)
        {
            return ApiResultArgs(await service.UpdateAccessRequestStatusAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods
    }
}
