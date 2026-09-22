// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for admin review of public "Suggest a product" requests.
    /// Handles listing, retrieving by id, approving, and rejecting.
    /// Service Responsibility:
    /// - IProductRequestService retrieves data, applies validation, and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class ProductRequestController(IProductRequestService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of product requests.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch product request inbox records for CFR Admin.
        /// Request Flow: Client API GET -> ProductRequestController.GetProductRequests() -> IProductRequestService.GetProductRequestsListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.GetProductRequestsListAsync().
        /// Response Details: Standard API result enclosing List of ProductRequestOutput with status 200 or 500.
        /// </remarks>
        /// <param name="requestStatus">Optional status filter: 1 = pending, 2 = approved, 3 = rejected.</param>
        /// <returns>A consistent API response containing the product request dataset.</returns>
        /// <response code="200">Successfully fetched product requests list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetProductRequests)]
        public async Task<IActionResult> GetProductRequests(int? requestStatus)
        {
            return ApiResultArgs(await service.GetProductRequestsListAsync(requestStatus), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one product request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review detail view.
        /// Request Flow: Client API GET -> ProductRequestController.GetProductRequestById() -> IProductRequestService.GetProductRequestByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps productRequestId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.GetProductRequestByIdAsync().
        /// Response Details: Standard API result enclosing ProductRequestOutput with status 200, 204, 400, or 500.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <returns>A consistent API response containing the product request.</returns>
        /// <response code="200">Successfully fetched the product request.</response>
        /// <response code="204">Product request not found.</response>
        /// <response code="400">Invalid product request identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetProductRequestById)]
        public async Task<IActionResult> GetProductRequestById(int productRequestId)
        {
            return ApiResultArgs(await service.GetProductRequestByIdAsync(productRequestId), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Approves a product request, promoting it into the live product catalog.
        /// </summary>
        /// <remarks>
        /// Purpose: Copy the proposed product into [core].[Product] / [core].[ProductFeature].
        /// Request Flow: Client API PUT -> ProductRequestController.ApproveProductRequest() -> IProductRequestService.ApproveProductRequestAsync() -> Database.
        /// Validation Details: Model binding maps ProductRequestDecisionInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.ApproveProductRequestAsync().
        /// Response Details: Standard API result representing the approval outcome.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully approved the product request.</response>
        /// <response code="409">The request was already decided, or a product with this name already exists.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Administration.ApproveProductRequest)]
        public async Task<IActionResult> ApproveProductRequest([FromBody] ProductRequestDecisionInput input)
        {
            return ApiResultArgs(await service.ApproveProductRequestAsync(input), APIHttpType.HttpPut);
        }

        /// <summary>
        /// Rejects a product request. No catalog changes are made.
        /// </summary>
        /// <remarks>
        /// Purpose: Record a rejection decision on a proposed product.
        /// Request Flow: Client API PUT -> ProductRequestController.RejectProductRequest() -> IProductRequestService.RejectProductRequestAsync() -> Database.
        /// Validation Details: Model binding maps ProductRequestDecisionInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.RejectProductRequestAsync().
        /// Response Details: Standard API result representing the rejection outcome.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully rejected the product request.</response>
        /// <response code="409">The request was already decided.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Administration.RejectProductRequest)]
        public async Task<IActionResult> RejectProductRequest([FromBody] ProductRequestDecisionInput input)
        {
            return ApiResultArgs(await service.RejectProductRequestAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region POST Methods

        /// <summary>
        /// Uploads a proposed product's logo image ahead of a public submission.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a visitor attach a logo to their suggestion before Submit is clicked, from the public CFR site.
        /// Request Flow: Client API POST (anonymous) -> ProductRequestController.UploadProductRequestLogo() -> IProductRequestService.UploadProductRequestLogoAsync() -> Storage.
        /// Validation Details: Bound from multipart form data; validates image extension (.jpg, .jpeg, .png) and size (up to 2 MB).
        /// Business Logic: None at controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.UploadProductRequestLogoAsync(input.File).
        /// Response Details: Standard API result enclosing the saved logo file name.
        /// </remarks>
        /// <param name="input">Multipart form containing the logo image file.</param>
        /// <returns>A consistent API response containing the saved logo file name.</returns>
        /// <response code="200">Successfully uploaded the logo.</response>
        /// <response code="400">Invalid or missing image file, or file exceeds 2 MB.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [AllowAnonymous]
        [ActionName(API_Administration.UploadProductRequestLogo)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductRequestLogo([FromForm] ProductRequestLogoUploadInput input)
        {
            return ApiResultArgs(await service.UploadProductRequestLogoAsync(input.File), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
