// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Products
{
    /// <summary>
    /// API controller for viewing and managing Products.
    /// Handles listing, retrieving by id, saving, updating, and soft-deleting products.
    /// Service Responsibility:
    /// - IProductsService retrieves and modifies data, applies validation, and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisProduct)]
    public class ProductsController(IProductsService service, CFR.AcutisService.Interfaces.Administration.IUsersService usersService): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all registered products.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch registered products from Core.Product.
        /// Request Flow: Client API GET -> ProductsController.GetProducts() -> IProductsService.GetProductsListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductsListAsync().
        /// Response Details: Standard API result enclosing List of ProductOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the products dataset.</returns>
        /// <response code="200">Successfully fetched products list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [AllowAnonymous]
        [ActionName(API_Product.GetProducts)]
        public async Task<IActionResult> GetProducts()
        {
            return ApiResultArgs(await service.GetProductsListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the list of all registered users for Product Support dropdown.
        /// </summary>
        /// <returns>A consistent API response containing the users dataset.</returns>
        [HttpGet]
        [AllowAnonymous]
        [ActionName("GetProductSupportUsers")]
        public async Task<IActionResult> GetProductSupportUsers()
        {
            return ApiResultArgs(await usersService.GetUsersListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one product by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single product for view or edit.
        /// Request Flow: Client API GET -> ProductsController.GetProductById() -> IProductsService.GetProductByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps productId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductByIdAsync().
        /// Response Details: Standard API result enclosing ProductOutput with status 200, 204, 400, or 500.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A consistent API response containing the product.</returns>
        /// <response code="200">Successfully fetched the product.</response>
        /// <response code="204">Product not found.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Product.GetProductById)]
        public async Task<IActionResult> GetProductById(int productId)
        {
            return ApiResultArgs(await service.GetProductByIdAsync(productId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves license details associated with a specific product from lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch product license records for the License Details tab.
        /// Request Flow: Client API GET -> ProductsController.GetLicenseDetails() -> IProductsService.GetLicenseDetailsAsync() -> Database.
        /// Validation Details: Query parameter binding maps productId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetLicenseDetailsAsync().
        /// Response Details: Standard API result enclosing List of ProductLicenseOutput with status 200, 400, or 500.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A consistent API response containing the product license records.</returns>
        /// <response code="200">Successfully fetched product license details.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Product.GetLicenseDetails)]
        public async Task<IActionResult> GetLicenseDetails(int productId)
        {
            return ApiResultArgs(await service.GetLicenseDetailsAsync(productId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves a single license by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single license record for view or edit.
        /// Request Flow: Client API GET -> ProductsController.GetLicenseById() -> IProductsService.GetLicenseByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps licenseId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetLicenseByIdAsync().
        /// Response Details: Standard API result enclosing ProductLicenseOutput with status 200, 204, 400, or 500.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>A consistent API response containing the license.</returns>
        /// <response code="200">Successfully fetched the license.</response>
        /// <response code="204">License not found.</response>
        /// <response code="400">Invalid license identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Product.GetLicenseById)]
        public async Task<IActionResult> GetLicenseById(long licenseId)
        {
            return ApiResultArgs(await service.GetLicenseByIdAsync(licenseId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Streams a stored product logo image by product identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Return the uploaded product logo bytes for display in the admin UI.
        /// Request Flow: Client GET -> ProductsController.GetProductLogo() -> IProductsService.GetProductLogoAsync(productId) -> File storage.
        /// Validation Details: Query parameter productId must be a positive integer.
        /// Business Logic: None at the controller level; delegates to the service layer and returns a file result.
        /// Service Interaction: Calls IProductsService.GetProductLogoAsync(productId).
        /// Response Details: Image bytes with image/jpeg or image/png, or 404 when the file is missing.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The logo image file, or not found.</returns>
        /// <response code="200">Successfully streamed the product logo.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="404">Logo file was not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [AllowAnonymous]
        [ActionName(API_Product.GetProductLogo)]
        [Produces("image/jpeg", "image/png")]
        public async Task<IActionResult> GetProductLogo(int productId)
        {
            if (productId <= 0)
            {
                return BadRequest();
            }

            var result = await service.GetProductLogoAsync(productId);
            if (result.StatusCode == ErrorCodes.BadRequest)
            {
                return BadRequest();
            }

            if (result.ResultData is not ProductLogoFileOutput logo || logo.FileBytes.Length == 0)
            {
                return NotFound();
            }

            return File(logo.FileBytes, logo.ContentType);
        }

        /// <summary>
        /// Retrieves product customers from [core].[Organization] for a specific product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch organizations assigned to the product for the Customers tab.
        /// Request Flow: Client API GET -> ProductsController.GetProductCustomers() -> IProductsService.GetProductCustomersAsync() -> Database.
        /// Validation Details: Query parameter binding maps productId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductCustomersAsync().
        /// Response Details: Standard API result enclosing List of ProductCustomerOutput with status 200, 400, or 500.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A consistent API response containing the product customer records.</returns>
        /// <response code="200">Successfully fetched product customers.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Product.GetProductCustomers)]
        public async Task<IActionResult> GetProductCustomers(int productId)
        {
            return ApiResultArgs(await service.GetProductCustomersAsync(productId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves per-product organization assignment counts.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's App Access Overview with real assignment data.
        /// Request Flow: Client API GET -> ProductsController.GetProductAssignmentSummary() -> IProductsService.GetProductAssignmentSummaryAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductAssignmentSummaryAsync().
        /// Response Details: Standard API result enclosing List of ProductAssignmentSummaryOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing per-product organization assignment summaries.</returns>
        /// <response code="200">Successfully fetched the assignment summary.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(nameof(GetProductAssignmentSummary))]
        public async Task<IActionResult> GetProductAssignmentSummary()
        {
            return ApiResultArgs(await service.GetProductAssignmentSummaryAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves [core].[ProductEnvironment] rows for a product, scoped to the currently configured environment.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the Site / Site Url / Site Description rows for the Api Integration tab.
        /// Request Flow: Client API GET -> ProductsController.GetProductApiIntegrations() -> IProductsService.GetProductApiIntegrationsAsync() -> Database.
        /// Validation Details: Query parameter binding maps productId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.GetProductApiIntegrationsAsync().
        /// Response Details: Standard API result enclosing List of ProductApiIntegrationOutput with status 200, 400, or 500.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A consistent API response containing the product API integration records.</returns>
        /// <response code="200">Successfully fetched product API integrations.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Product.GetProductApiIntegrations)]
        public async Task<IActionResult> GetProductApiIntegrations(int productId)
        {
            return ApiResultArgs(await service.GetProductApiIntegrationsAsync(productId), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods


        /// <summary>
        /// Creates a new product license.
        /// </summary>
        /// <remarks>
        /// Purpose: Create a new license record.
        /// Request Flow: Client API POST -> ProductsController.CreateLicense() -> IProductsService.CreateLicenseAsync() -> Database.
        /// Validation Details: Model binding maps ProductLicenseInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.CreateLicenseAsync().
        /// Response Details: Standard API result enclosing the created LicenseId.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully created the license.</response>
        /// <response code="400">Invalid request payload.</response>
        /// <response code="409">An active or upcoming license already exists for this customer.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Product.CreateLicense)]
        public async Task<IActionResult> CreateLicense([FromBody] ProductLicenseInput input)
        {
            return ApiResultArgs(await service.CreateLicenseAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields of a product in Core.Product.
        /// Request Flow: Client API PUT -> ProductsController.UpdateProduct() -> IProductsService.UpdateProductAsync() -> Database.
        /// Validation Details: Model binding maps ProductInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.UpdateProductAsync().
        /// Response Details: Standard API result representing the update outcome.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully updated the product.</response>
        /// <response code="400">Invalid request payload.</response>
        /// <response code="404">Product not found.</response>
        /// <response code="409">A product with this name already exists.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Product.UpdateProduct)]
        public async Task<IActionResult> UpdateProduct([FromBody] ProductInput input)
        {
            return ApiResultArgs(await service.UpdateProductAsync(input), APIHttpType.HttpPut);
        }

        /// <summary>
        /// Updates a product logo image (JPG or PNG, max 2MB) and stores it in the database for the specified product.
        /// </summary>
        /// <remarks>
        /// Purpose: Accepts an image file and product ID, saves the image to storage, and persists the filename to Core.Product.LogoName.
        /// Request Flow: Client API PUT -> ProductsController.UpdateProductLogo() -> IProductsService.UpdateProductLogoAsync() -> Database (+ storage).
        /// Validation Details: Bound from multipart form data; validates productId positive, image extension (.jpg, .jpeg, .png) and size (up to 2 MB).
        /// Business Logic: None at controller level; delegates to service layer.
        /// Service Interaction: Calls IProductsService.UpdateProductLogoAsync(input).
        /// Response Details: Standard API result enclosing file name of the saved logo.
        /// </remarks>
        /// <param name="input">Multipart form containing the product ID and logo image file.</param>
        /// <returns>A consistent API response containing the saved logo file name.</returns>
        /// <response code="200">Successfully updated the product logo in storage and database.</response>
        /// <response code="400">Invalid product identifier or image file exceeds 2 MB.</response>
        /// <response code="404">Product not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Product.UpdateProductLogo)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProductLogo([FromForm] ProductLogoUploadInput input)
        {
            return ApiResultArgs(await service.UpdateProductLogoAsync(input), APIHttpType.HttpPut);
        }

        /// <summary>
        /// Updates an existing license.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields of a license in lic.License.
        /// Request Flow: Client API PUT -> ProductsController.UpdateLicense() -> IProductsService.UpdateLicenseAsync() -> Database.
        /// Validation Details: Model binding maps ProductLicenseInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.UpdateLicenseAsync().
        /// Response Details: Standard API result representing the update outcome.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully updated the license.</response>
        /// <response code="400">Invalid request payload.</response>
        /// <response code="404">License not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Product.UpdateLicense)]
        public async Task<IActionResult> UpdateLicense([FromBody] ProductLicenseInput input)
        {
            return ApiResultArgs(await service.UpdateLicenseAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a license.
        /// </summary>
        /// <remarks>
        /// Purpose: Mark a license as deleted without removing its row.
        /// Request Flow: Client API DELETE -> ProductsController.DeleteLicense() -> IProductsService.DeleteLicenseAsync() -> Database.
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.DeleteLicenseAsync().
        /// Response Details: Standard API result representing the delete outcome.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully deleted the license.</response>
        /// <response code="400">Invalid license identifier.</response>
        /// <response code="404">License not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Product.DeleteLicense)]
        public async Task<IActionResult> DeleteLicense(long licenseId)
        {
            return ApiResultArgs(await service.DeleteLicenseAsync(licenseId), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods
    }
}
