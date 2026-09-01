// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for App Hub product listing.
    /// Handles loading products from core.Product for Your / Available / Future sections.
    /// Service Responsibility:
    /// - IProductsService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisProduct)]
    public class ProductsController(IProductsService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves hub products for the signed-in member.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch App Hub cards from core.Product.
        /// Request Flow: Client API GET -> ProductsController.GetProducts() -> IProductsService.GetProductsListAsync() -> Database.
        /// Validation Details: Query parameter binding maps requesterEmail.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductsListAsync().
        /// Response Details: Standard API result enclosing List of ProductOutput with status 200 or 500.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to decide Your Apps vs Available Apps.</param>
        /// <returns>A consistent API response containing the product dataset.</returns>
        /// <response code="200">Successfully fetched products list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetProducts)]
        public async Task<IActionResult> GetProducts(string? requesterEmail)
        {
            return ApiResultArgs(await service.GetProductsListAsync(requesterEmail), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
