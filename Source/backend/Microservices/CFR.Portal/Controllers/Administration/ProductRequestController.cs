// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal.Controllers.Administration
{
    /// <summary>
    /// API controller for the public "Suggest a product" submission.
    /// Service Responsibility:
    /// - IProductRequestService validates and persists the request, then notifies admins.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.PortalAdministration)]
    public class ProductRequestController(IProductRequestService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Saves a new public product request.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert ProductRequest, ProductRequestFeature, and ProductRequestStatusHistory rows, then email admins.
        /// Request Flow: Client API POST -> ProductRequestController.SaveProductRequest() -> IProductRequestService.SaveProductRequestAsync() -> Database.
        /// Validation Details: Model binding maps ProductRequestInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRequestService.SaveProductRequestAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the proposed product and requester fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the product request.</response>
        /// <response code="400">Invalid request payload.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [AllowAnonymous]
        [ActionName(API_Administration.SaveProductRequest)]
        public async Task<IActionResult> SaveProductRequest([FromBody] ProductRequestInput input)
        {
            return ApiResultArgs(await service.SaveProductRequestAsync(input), APIHttpType.HttpPost);
        }

        // Logo upload is NOT hosted here - see ProductRequestController.UploadProductRequestLogo in
        // CFR.Acutis instead. A Portal-hosted upload would land in Portal's own wwwroot, not the
        // folder [core].[Product].[LogoName] is actually served from.

        #endregion POST Methods
    }
}
