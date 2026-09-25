// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing product access requests.
    /// Handles listing, saving, and updating request status.
    /// Service Responsibility:
    /// - IAccessRequestService retrieves data, applies validation, and returns ResultArgs.
    /// </summary   
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.PortalAdministration)]
    public class AccessRequestController(IAccessRequestService service): BaseController
    {
        #region GET Methods



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

        /// <summary>
        /// Retrieves every non-deleted diocese for the Request Access page's Diocese dropdown.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Diocese dropdown on the public Request Access page.
        /// Request Flow: Client API GET -> AccessRequestController.GetDioceses() -> IAccessRequestService.GetDiocesesListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAccessRequestService.GetDiocesesListAsync().
        /// Response Details: Standard API result enclosing List of DioceseOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the diocese dataset.</returns>
        /// <response code="200">Successfully fetched dioceses.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [AllowAnonymous]
        [ActionName(API_Administration.GetDioceses)]
        public async Task<IActionResult> GetDioceses()
        {
            return ApiResultArgs(await service.GetDiocesesListAsync(), APIHttpType.HttpGet);
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


    }
}

