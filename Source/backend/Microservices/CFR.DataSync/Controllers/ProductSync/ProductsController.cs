// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSync.Controllers.ProductSync
{
    /// <summary>
    /// API controller for the CFR-user product-lookup surface — lets an authenticated product
    /// backend fetch which active CFR products a given user (by email) can launch, e.g. to power
    /// an in-product app switcher without a live CFR browser session.
    /// Service Responsibility:
    /// - IProductSyncService validates the email and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.SyncUserSync)]
    [Authorize]
    public class ProductsController(IProductSyncService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Fetches the active products a CFR user (identified by email) has access to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product's backend build an app-switcher list for a CFR-linked user.
        /// Request Flow: Client API GET -> ProductsController.GetUserProducts() -> IProductSyncService.GetUserProductsAsync() -> Database.
        /// Validation Details: Email is required and must be a valid address format.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductSyncService.GetUserProductsAsync().
        /// Response Details: Standard API result enclosing List of UserProductListItemOutput, or NotFound.
        /// </remarks>
        /// <param name="email">Email address of the CFR user.</param>
        /// <returns>A consistent API response containing the product list.</returns>
        /// <response code="200">Successfully fetched the user's products.</response>
        /// <response code="401">Caller is not authenticated.</response>
        /// <response code="404">No CFR identity was found for the given email.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_ProductSync.GetUserProducts)]
        public async Task<IActionResult> GetUserProducts(string email)
        {
            return ApiResultArgs(await service.GetUserProductsAsync(email, HttpContext.TraceIdentifier), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Launches a CFR-linked user into another product, already signed in.
        /// </summary>
        /// <remarks>
        /// Purpose: Give the App Switcher widget's tile clicks the same real, authenticated
        /// launch CFR's own App Hub "Launch" button uses, instead of a bare link.
        /// Request Flow: Client API POST -> ProductsController.LaunchProduct() -> IProductSyncService.LaunchProductAsync() -> Database.
        /// Validation Details: Model binding maps ProductLaunchInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductSyncService.LaunchProductAsync().
        /// Response Details: Standard API result enclosing ProductLaunchOutput.
        /// </remarks>
        /// <param name="input">Launch request containing Email and ProductId.</param>
        /// <returns>A consistent API response containing the launch URL.</returns>
        /// <response code="200">Successfully created the launch.</response>
        /// <response code="400">The product is disabled, not assigned to this user, or has no launch URL for this environment.</response>
        /// <response code="401">Caller is not authenticated.</response>
        /// <response code="404">No CFR identity was found for the given email, or the product does not exist.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_ProductSync.LaunchProduct)]
        public async Task<IActionResult> LaunchProduct([FromBody] ProductLaunchInput input)
        {
            return ApiResultArgs(await service.LaunchProductAsync(input, HttpContext.TraceIdentifier), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
