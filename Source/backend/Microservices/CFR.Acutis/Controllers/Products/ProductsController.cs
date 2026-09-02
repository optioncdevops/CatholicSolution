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
    public class ProductsController(IProductsService service): BaseController
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
        [ActionName(API_Product.GetProducts)]
        public async Task<IActionResult> GetProducts()
        {
            return ApiResultArgs(await service.GetProductsListAsync(), APIHttpType.HttpGet);
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
        /// Streams a stored product logo image.
        /// </summary>
        /// <remarks>
        /// Purpose: Return the uploaded product logo bytes for display in the admin UI.
        /// Request Flow: Client GET -> ProductsController.GetProductLogo() -> IProductsService.GetProductLogoAsync() -> File storage.
        /// Validation Details: Query parameter fileName must be a jpg/jpeg/png file name.
        /// Business Logic: None at the controller level; delegates to the service layer and returns a file result.
        /// Service Interaction: Calls IProductsService.GetProductLogoAsync(fileName).
        /// Response Details: Image bytes with image/jpeg or image/png, or 404 when the file is missing.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>The logo image file, or not found.</returns>
        /// <response code="200">Successfully streamed the product logo.</response>
        /// <response code="400">Invalid file name.</response>
        /// <response code="404">Logo file was not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [AllowAnonymous]
        [ActionName(nameof(GetProductLogo))]
        [Produces("image/jpeg", "image/png")]
        public async Task<IActionResult> GetProductLogo(string fileName)
        {
            var result = await service.GetProductLogoAsync(fileName);
            if (result.ResultData is not byte[] bytes || bytes.Length == 0)
            {
                return NotFound();
            }

            string extension = Path.GetExtension(fileName).ToLowerInvariant();
            string contentType = extension == ".png" ? "image/png" : "image/jpeg";
            return File(bytes, contentType);
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
        [ActionName(nameof(GetProductCustomers))]
        public async Task<IActionResult> GetProductCustomers(int productId)
        {
            return ApiResultArgs(await service.GetProductCustomersAsync(productId), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Uploads a product logo image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Accepts an image file, saves it securely, and returns the accessible relative file path.
        /// Request Flow: Client API POST -> ProductsController.UploadProductLogo() -> IProductsService.UploadProductLogoAsync() -> Storage.
        /// Validation Details: Bound from multipart form data; validates extension (.jpg, .jpeg, .png) and size (up to 2 MB).
        /// Business Logic: None at controller level; delegates to service layer.
        /// Service Interaction: Calls IProductsService.UploadProductLogoAsync(file).
        /// Response Details: Standard API result enclosing relative file URL path.
        /// </remarks>
        /// <param name="form">Multipart form containing the logo image file.</param>
        /// <returns>A consistent API response containing the relative URL path of the saved logo.</returns>
        /// <response code="200">Successfully uploaded the product logo.</response>
        /// <response code="400">Invalid image file or size exceeds 2 MB.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Product.UploadProductLogo)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductLogo([FromForm] ProductLogoUploadForm form)
        {
            return ApiResultArgs(await service.UploadProductLogoAsync(form.File), APIHttpType.HttpPost);
        }

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
    }
}
