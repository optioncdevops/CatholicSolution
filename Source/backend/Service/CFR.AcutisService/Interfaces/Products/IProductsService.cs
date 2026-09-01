// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Products
{
    /// <summary>
    /// Service contract for Product operations.
    /// Acts as the business-logic layer between ProductsController and IProductsRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, update, and soft-delete products in Core.Product.
    /// - Relies on IProductsRepository for database execution.
    /// </summary>
    public interface IProductsService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all registered products from Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of all products from Core.Product for the Products module.
        /// Request Flow: ProductsController -> IProductsService.GetProductsListAsync() -> IProductsRepository.GetProductsListAsync().
        /// Validation Details: Service checks for null or empty result sets.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductsListAsync().
        /// Response Details: MSResultArgs containing List of ProductOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the products list.</returns>
        Task<MSResultArgs> GetProductsListAsync();

        /// <summary>
        /// Retrieves one product by identifier from Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single product for view or edit.
        /// Request Flow: ProductsController -> IProductsService.GetProductByIdAsync() -> IProductsRepository.GetProductByIdAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductByIdAsync().
        /// Response Details: MSResultArgs containing ProductOutput or NoRecordFound.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product.</returns>
        Task<MSResultArgs> GetProductByIdAsync(int productId);

        /// <summary>
        /// Retrieves license details for a specific product from lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch license records by ProductId for the License Details page.
        /// Request Flow: ProductsController -> IProductsService.GetLicenseDetailsAsync() -> IProductsRepository.GetLicenseDetailsAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed license list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetLicenseDetailsAsync().
        /// Response Details: MSResultArgs containing List of ProductLicenseOutput.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product license records list.</returns>
        Task<MSResultArgs> GetLicenseDetailsAsync(int productId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new product in Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new product to Core.Product.
        /// Request Flow: ProductsController -> IProductsService.SaveProductAsync() -> IProductsRepository.SaveProductAsync().
        /// Validation Details: Validates required ProductName and checks for duplicates.
        /// Business Logic: Returns Conflict when duplicate name exists, otherwise returns generated ProductId.
        /// Repository Interaction: Calls IProductsRepository.CheckProductNameExistsAsync and SaveProductAsync.
        /// Response Details: MSResultArgs containing the created ProductId.
        /// </remarks>
        /// <param name="input">Input DTO containing new product details without ProductId.</param>
        /// <returns>MSResultArgs containing the generated ProductId.</returns>
        Task<MSResultArgs> SaveProductAsync(ProductSaveInput input);

        /// <summary>
        /// Validates and saves an uploaded product logo image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Store product logo safely and return relative accessible URL.
        /// Request Flow: ProductsController -> IProductsService.UploadProductLogoAsync() -> Storage.
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Generates unique filename and saves to storage location.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing relative URL path (/uploads/products/{fileName}).
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing relative accessible URL path.</returns>
        Task<MSResultArgs> UploadProductLogoAsync(IFormFile file);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product in Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields of a product.
        /// Request Flow: ProductsController -> IProductsService.UpdateProductAsync() -> IProductsRepository.UpdateProductAsync().
        /// Validation Details: ProductId must be greater than zero, required ProductName, checks for duplicates excluding current product.
        /// Business Logic: Returns NotFound when product does not exist, Conflict on duplicate name, otherwise updates product.
        /// Repository Interaction: Calls IProductsRepository.CheckProductNameExistsAsync and UpdateProductAsync.
        /// Response Details: MSResultArgs representing update status.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>MSResultArgs representing update status.</returns>
        Task<MSResultArgs> UpdateProductAsync(ProductInput input);

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a product by setting IsDeleted = 1.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a product record.
        /// Request Flow: ProductsController -> IProductsService.DeleteProductAsync() -> IProductsRepository.DeleteProductAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Validates product existence before deletion.
        /// Repository Interaction: Calls IProductsRepository.DeleteProductAsync.
        /// Response Details: MSResultArgs representing deletion status.
        /// </remarks>
        /// <param name="productId">Identifier of the product to delete.</param>
        /// <returns>MSResultArgs representing deletion status.</returns>
        Task<MSResultArgs> DeleteProductAsync(int productId);

        #endregion DELETE Methods
    }
}
