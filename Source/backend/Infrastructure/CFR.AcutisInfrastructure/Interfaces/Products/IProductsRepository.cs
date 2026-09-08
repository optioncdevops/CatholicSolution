// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Products
{
    /// <summary>
    /// Repository interface for Product database operations.
    /// Repository Responsibility:
    /// - Declares retrieval and modification operations against Core.Product.
    /// </summary>
    public interface IProductsRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all registered products using StoredProc.Products.ProductsCrud (ActionId 1).
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of all products from Core.Product table.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductsListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Reads product dataset using StoredProc.Products.ProductsCrud (ActionId 1) and CustomerCount from ActionId 5 grouped by OrgId.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductOutput records with Customers-tab customer counts.
        /// </remarks>
        /// <returns>A list of product output records.</returns>
        Task<List<ProductOutput>> GetProductsListAsync();

        /// <summary>
        /// Retrieves one product by identifier from Core.Product using StoredProc.Products.ProductsCrud (ActionId 2).
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single product by its primary key along with features.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductByIdAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Reads matching product row and features list using ActionId 2, then CustomerCount from ActionId 5 grouped by OrgId.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductOutput or null if not found.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The matching product, or null when not found.</returns>
        Task<ProductOutput?> GetProductByIdAsync(int productId);

        /// <summary>
        /// Checks whether a product with the specified name already exists (ActionId 4).
        /// </summary>
        /// <remarks>
        /// Purpose: Validate product name uniqueness.
        /// Request Flow: IProductsService -> IProductsRepository.CheckProductNameExistsAsync() -> SQL Database.
        /// Validation Details: Checks name against non-deleted products.
        /// Business Logic: For update (productId > 0), excludes the current product using ActionId 4.
        /// Repository Interaction: Executes SQL check or SP validation.
        /// Response Details: Returns true if duplicate exists; otherwise false.
        /// </remarks>
        /// <param name="productName">Product name to check.</param>
        /// <param name="productId">Product identifier (0 for new products).</param>
        /// <returns>True if duplicate exists; otherwise false.</returns>
        Task<bool> CheckProductNameExistsAsync(string productName, int productId);

        /// <summary>
        /// Retrieves license records for a specific product using StoredProc.Products.ProductsCrud (ActionId 5).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve license records by ProductId from lic.License and lic.OrganizationProduct.
        /// Request Flow: IProductsService -> IProductsRepository.GetLicenseDetailsAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes stored procedure ActionId 5 to fetch matching active organization product license records.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductLicenseOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product license records.</returns>
        Task<List<ProductLicenseOutput>> GetLicenseDetailsAsync(int productId);

        /// <summary>
        /// Retrieves a single license by identifier using StoredProc.Products.ProductsCrud (ActionId 6).
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch one license record by its LicenseId.
        /// Request Flow: IProductsService -> IProductsRepository.GetLicenseByIdAsync() -> SQL Database.
        /// Validation Details: LicenseId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 6.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductLicenseOutput or null.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>Matching license or null if not found.</returns>
        Task<ProductLicenseOutput?> GetLicenseByIdAsync(long licenseId);

        /// <summary>
        /// Retrieves product customers from [core].[Organization] using StoredProc.Products.ProductsCrud (ActionId 9).
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch organizations assigned to a product for the Customers tab.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductCustomersAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 9.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductCustomerOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product customer records.</returns>
        Task<List<ProductCustomerOutput>> GetProductCustomersAsync(int productId);

        /// <summary>
        /// Retrieves per-product organization assignment counts using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetAssignmentSummary).
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's App Access Overview with real assignment data.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductAssignmentSummaryAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductAssignmentSummaryOutput records.
        /// </remarks>
        /// <returns>A list of per-product organization assignment summaries.</returns>
        Task<List<ProductAssignmentSummaryOutput>> GetProductAssignmentSummaryAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new license using StoredProc.Products.ProductsCrud (ActionId 7).
        /// </summary>
        /// <remarks>
        /// Purpose: Create organization product association and insert license row.
        /// Request Flow: IProductsService -> IProductsRepository.CreateLicenseAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 7.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns created LicenseId, -95 when the assignment cannot be created, or -99 when an active or upcoming license already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>Created LicenseId or negative error code.</returns>
        Task<long> CreateLicenseAsync(ProductLicenseInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product using StoredProc.Products.ProductsCrud (ActionId 3).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> IProductsRepository.UpdateProductAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from ProductInput.
        /// Business Logic: ActionId 3 with ProductId > 0 updates the product.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, -95 if not found, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Updated ProductId or negative error code.</returns>
        Task<int> UpdateProductAsync(ProductInput input);

        /// <summary>
        /// Updates a product's logo name in Core.Product using StoredProc.Products.ProductsCrud (ActionId 3).
        /// </summary>
        /// <remarks>
        /// Purpose: Update logo file name and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> IProductsRepository.UpdateProductLogoAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from productId and logoName.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 3 and sets LogoName.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, or -95 if not found.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <param name="logoName">Saved logo file name.</param>
        /// <returns>Updated ProductId or negative error code.</returns>
        Task<int> UpdateProductLogoAsync(int productId, string logoName);

        /// <summary>
        /// Updates an existing license using StoredProc.Products.ProductsCrud (ActionId 8).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable license fields and assignment status.
        /// Request Flow: IProductsService -> IProductsRepository.UpdateLicenseAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 8.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated LicenseId or -95 if not found.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>Updated LicenseId or negative error code.</returns>
        Task<long> UpdateLicenseAsync(ProductLicenseInput input);

        #endregion PUT Methods
    }
}
