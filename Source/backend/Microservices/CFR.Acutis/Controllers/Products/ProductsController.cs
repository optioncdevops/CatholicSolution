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

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new product record.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert a new product into Core.Product.
        /// Request Flow: Client API POST -> ProductsController.SaveProduct() -> IProductsService.SaveProductAsync() -> Database.
        /// Validation Details: Model binding maps ProductInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.SaveProductAsync().
        /// Response Details: Standard API result indicating execution status and newly created ProductId.
        /// </remarks>
        /// <param name="input">Input DTO containing new product details without ProductId.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the product.</response>
        /// <response code="400">Invalid request payload.</response>
        /// <response code="409">A product with this name already exists.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Product.SaveProduct)]
        public async Task<IActionResult> SaveProduct([FromBody] ProductSaveInput input)
        {
            return ApiResultArgs(await service.SaveProductAsync(input), APIHttpType.HttpPost);
        }

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
        /// <param name="file">The uploaded image file.</param>
        /// <returns>A consistent API response containing the relative URL path of the saved logo.</returns>
        /// <response code="200">Successfully uploaded the product logo.</response>
        /// <response code="400">Invalid image file or size exceeds 2 MB.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Product.UploadProductLogo)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductLogo(IFormFile file)
        {
            return ApiResultArgs(await service.UploadProductLogoAsync(file), APIHttpType.HttpPost);
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

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a product by its identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a product record.
        /// Request Flow: Client API DELETE -> ProductsController.DeleteProduct() -> IProductsService.DeleteProductAsync() -> Database.
        /// Validation Details: Query parameter binding maps productId.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductsService.DeleteProductAsync().
        /// Response Details: Standard API result representing the deletion outcome.
        /// </remarks>
        /// <param name="productId">Identifier of the product to delete.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully deleted the product.</response>
        /// <response code="400">Invalid product identifier.</response>
        /// <response code="404">Product not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Product.DeleteProduct)]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            return ApiResultArgs(await service.DeleteProductAsync(productId), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods
    }
}
