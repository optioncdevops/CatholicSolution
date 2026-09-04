// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal.Controllers.CFRLaunch
{
    /// <summary>
    /// API controller for product CFR launch and authorization-code exchange.
    /// Service Responsibility:
    /// - ICFRLaunchService lists assigned products, issues launch codes, and consumes them.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.PortalCFRLaunch)]
    public class CFRLaunchController(ICFRLaunchService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves hub products for the authenticated CFR member.
        /// </summary>
        /// <remarks>
        /// Purpose: Return hub products classified from UserProduct assignments, with launch BaseUrl from ProductEnvironment.
        /// Request Flow: Client API GET -> CFRLaunchController.GetAssignedProducts() -> ICFRLaunchService.GetAssignedProductsAsync() -> Database.
        /// Validation Details: Current user is resolved from the session JWT.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls ICFRLaunchService.GetAssignedProductsAsync().
        /// Response Details: Standard API result enclosing List of AssignedProductOutput.
        /// </remarks>
        /// <returns>Assigned product list.</returns>
        /// <response code="200">Successfully fetched assigned products.</response>
        /// <response code="401">Caller is not authenticated.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Portal.CFRLaunch.GetAssignedProducts)]
        public async Task<IActionResult> GetAssignedProducts()
        {
            return ApiResultArgs(await service.GetAssignedProductsAsync(), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a one-time authorization code and returns the product launch URL.
        /// </summary>
        /// <remarks>
        /// Purpose: Start a product launch for the authenticated member.
        /// Request Flow: Client API POST -> CFRLaunchController.LaunchProduct() -> ICFRLaunchService.LaunchProductAsync() -> Database.
        /// Validation Details: Model binding maps CFRLaunchInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls ICFRLaunchService.LaunchProductAsync().
        /// Response Details: Standard API result enclosing CFRLaunchOutput.
        /// </remarks>
        /// <param name="input">Launch request containing ProductId.</param>
        /// <returns>Launch URL containing the one-time authorization code.</returns>
        /// <response code="200">Successfully created the launch.</response>
        /// <response code="401">Caller is not authenticated or the product is not assigned.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Portal.CFRLaunch.LaunchProduct)]
        public async Task<IActionResult> LaunchProduct([FromBody] CFRLaunchInput input)
        {
            return ApiResultArgs(await service.LaunchProductAsync(input), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Exchanges a one-time authorization code for a signed CFR identity.
        /// </summary>
        /// <remarks>
        /// Purpose: Allow a product backend to consume a launch code.
        /// Request Flow: Product API POST -> CFRLaunchController.ExchangeToken() -> ICFRLaunchService.ExchangeTokenAsync() -> Database.
        /// Validation Details: Model binding maps CFRExchangeInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls ICFRLaunchService.ExchangeTokenAsync().
        /// Response Details: Standard API result enclosing CFRExchangeOutput.
        /// </remarks>
        /// <param name="input">Exchange request containing code and productId.</param>
        /// <returns>Signed CFR identity token.</returns>
        /// <response code="200">Successfully exchanged the authorization code.</response>
        /// <response code="401">The authorization code is invalid, expired, used, or bound to another product.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [HttpPost]
        [ActionName(API_Portal.CFRLaunch.ExchangeToken)]
        public async Task<IActionResult> ExchangeToken([FromBody] CFRExchangeInput input)
        {
            return ApiResultArgs(await service.ExchangeTokenAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
