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

        /// <summary>
        /// Retrieves a single license by its identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a specific license for view or edit.
        /// Request Flow: ProductsController -> IProductsService.GetLicenseByIdAsync() -> IProductsRepository.GetLicenseByIdAsync().
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: Wraps the typed license output in MSResultArgs or returns NoRecordFound.
        /// Repository Interaction: Calls IProductsRepository.GetLicenseByIdAsync().
        /// Response Details: MSResultArgs containing ProductLicenseOutput or NoRecordFound.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>MSResultArgs containing the license record.</returns>
        Task<MSResultArgs> GetLicenseByIdAsync(long licenseId);

        /// <summary>
        /// Retrieves a product logo image from local storage by product identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream a product's stored logo so the admin UI can display it using the productId.
        /// Request Flow: ProductsController -> IProductsService.GetProductLogoAsync() -> IProductsRepository.GetProductByIdAsync() -> File storage.
        /// Validation Details: productId must be greater than zero.
        /// Business Logic: Reads product record to find LogoName, validates the file name/extension, and loads bytes via IFileHandlerService from AppSettings:ProductLogoPath.
        /// Repository Interaction: Calls IProductsRepository.GetProductByIdAsync(productId).
        /// Response Details: MSResultArgs containing ProductLogoFileOutput with file bytes and MIME content type.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing ProductLogoFileOutput with image bytes and content type.</returns>
        Task<MSResultArgs> GetProductLogoAsync(int productId);

        /// <summary>
        /// Retrieves a product logo image from local storage.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream a previously uploaded product logo so the admin UI can display it in an img tag.
        /// Request Flow: ProductsController -> IProductsService.GetProductLogoAsync() -> File storage.
        /// Validation Details: fileName must be a jpg/jpeg/png name with no path segments.
        /// Business Logic: Reads bytes from AppStrings:GatewayRoot or ApplicationFilePath:Doc_BasePath.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the image byte array.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>MSResultArgs containing the image bytes.</returns>
        Task<MSResultArgs> GetProductLogoAsync(string fileName);

        /// <summary>
        /// Retrieves product customers from [core].[Organization] for a specific product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch organization rows assigned to the product for the Customers tab.
        /// Request Flow: ProductsController -> IProductsService.GetProductCustomersAsync() -> IProductsRepository.GetProductCustomersAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed customer list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductCustomersAsync().
        /// Response Details: MSResultArgs containing List of ProductCustomerOutput.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product customer records list.</returns>
        Task<MSResultArgs> GetProductCustomersAsync(int productId);

        /// <summary>
        /// Retrieves per-product organization assignment counts.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's App Access Overview with real assignment data.
        /// Request Flow: ProductsController -> IProductsService.GetProductAssignmentSummaryAsync() -> IProductsRepository.GetProductAssignmentSummaryAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductAssignmentSummaryAsync().
        /// Response Details: MSResultArgs containing List of ProductAssignmentSummaryOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the per-product organization assignment summaries.</returns>
        Task<MSResultArgs> GetProductAssignmentSummaryAsync();

        #endregion GET Methods

        #region POST Methods


        /// <summary>
        /// Creates a new product license.
        /// </summary>
        /// <remarks>
        /// Purpose: Create organization product assignment and create license record.
        /// Request Flow: ProductsController -> IProductsService.CreateLicenseAsync() -> IProductsRepository.CreateLicenseAsync().
        /// Validation Details: OrgId and ProductId must be greater than zero (or OrganizationProductId > 0).
        /// Business Logic: Inserts a new license unless an active or upcoming license already exists for the customer.
        /// Repository Interaction: Calls IProductsRepository.CreateLicenseAsync().
        /// Response Details: MSResultArgs containing the created LicenseId, or Conflict when a license already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>MSResultArgs containing the created LicenseId.</returns>
        Task<MSResultArgs> CreateLicenseAsync(ProductLicenseInput input);

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

        /// <summary>
        /// Validates, saves, and updates the product logo image in storage and database for the related product.
        /// </summary>
        /// <remarks>
        /// Purpose: Save product logo to disk and immediately update Core.Product.LogoName for the specified ProductId.
        /// Request Flow: ProductsController -> IProductsService.UpdateProductLogoAsync() -> IProductsRepository.UpdateProductLogoAsync().
        /// Validation Details: ProductId must be greater than zero, File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Validates product existence, generates safe unique filename, saves image, updates record, and cleans up old file.
        /// Repository Interaction: Calls IProductsRepository.GetProductByIdAsync and UpdateProductLogoAsync.
        /// Response Details: MSResultArgs containing the saved logo file name.
        /// </remarks>
        /// <param name="input">Input DTO containing the target product ID and logo image file.</param>
        /// <returns>MSResultArgs containing the saved logo file name.</returns>
        Task<MSResultArgs> UpdateProductLogoAsync(ProductLogoUploadInput input);

        /// <summary>
        /// Updates an existing license in lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields of a license and assignment status.
        /// Request Flow: ProductsController -> IProductsService.UpdateLicenseAsync() -> IProductsRepository.UpdateLicenseAsync().
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: Returns NotFound when license does not exist, otherwise updates license.
        /// Repository Interaction: Calls IProductsRepository.UpdateLicenseAsync().
        /// Response Details: MSResultArgs representing update status.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>MSResultArgs representing update status.</returns>
        Task<MSResultArgs> UpdateLicenseAsync(ProductLicenseInput input);

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a license in lic.License.
        /// </summary>
        /// <remarks>
        /// Purpose: Mark a license as deleted without removing its row.
        /// Request Flow: ProductsController -> IProductsService.DeleteLicenseAsync() -> IProductsRepository.DeleteLicenseAsync().
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: Returns NotFound when license does not exist, otherwise marks it deleted.
        /// Repository Interaction: Calls IProductsRepository.DeleteLicenseAsync().
        /// Response Details: MSResultArgs representing delete status.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>MSResultArgs representing delete status.</returns>
        Task<MSResultArgs> DeleteLicenseAsync(long licenseId);

        #endregion DELETE Methods
    }
}
