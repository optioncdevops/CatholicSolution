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
        /// Retrieves all registered products using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of all products from Core.Product table.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductsListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Reads product dataset using StoredProc.Products.ProductsCrud (ActionId 4).
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductOutput records.
        /// </remarks>
        /// <returns>A list of product output records.</returns>
        Task<List<ProductOutput>> GetProductsListAsync();

        /// <summary>
        /// Retrieves one product by identifier from Core.Product using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single product by its primary key along with features.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductByIdAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Reads matching product row and features list using ActionId 3.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductOutput or null if not found.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The matching product, or null when not found.</returns>
        Task<ProductOutput?> GetProductByIdAsync(int productId);

        /// <summary>
        /// Checks whether a product with the specified name already exists.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate product name uniqueness.
        /// Request Flow: IProductsService -> IProductsRepository.CheckProductNameExistsAsync() -> SQL Database.
        /// Validation Details: Checks name against non-deleted products.
        /// Business Logic: For update (productId > 0), excludes the current product.
        /// Repository Interaction: Executes SQL check or SP validation.
        /// Response Details: Returns true if duplicate exists; otherwise false.
        /// </remarks>
        /// <param name="productName">Product name to check.</param>
        /// <param name="productId">Product identifier (0 for new products).</param>
        /// <returns>True if duplicate exists; otherwise false.</returns>
        Task<bool> CheckProductNameExistsAsync(string productName, int productId);

        /// <summary>
        /// Retrieves license records for a specific product using StoredProc.Products.ProductLicensesGetByProductId.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve license records by ProductId from lic.License and lic.OrganizationProduct.
        /// Request Flow: IProductsService -> IProductsRepository.GetLicenseDetailsAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes stored procedure to fetch matching active organization product license records.
        /// Repository Interaction: Executes StoredProc.Products.ProductLicensesGetByProductId.
        /// Response Details: Returns a list of ProductLicenseOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product license records.</returns>
        Task<List<ProductLicenseOutput>> GetLicenseDetailsAsync(int productId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new product record using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new product with sequential ProductId and audit columns.
        /// Request Flow: IProductsService -> IProductsRepository.SaveProductAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from ProductSaveInput.
        /// Business Logic: ActionId 1 with ProductId = 0 inserts a new product.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns the newly generated ProductId, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing new product details without ProductId.</param>
        /// <returns>Generated ProductId or negative status code.</returns>
        Task<int> SaveProductAsync(ProductSaveInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> IProductsRepository.UpdateProductAsync() -> SQL Database.
        /// Validation Details: Parameter mapping from ProductInput.
        /// Business Logic: ActionId 1 with ProductId > 0 updates the product.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, -95 if not found, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Updated ProductId or negative error code.</returns>
        Task<int> UpdateProductAsync(ProductInput input);

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a product using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a product while preserving history.
        /// Request Flow: IProductsService -> IProductsRepository.DeleteProductAsync() -> SQL Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: ActionId 2 soft deletes the product.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns 1 on success, or -95 if not found.
        /// </remarks>
        /// <param name="productId">Identifier of the product to delete.</param>
        /// <returns>1 on success or negative error code.</returns>
        Task<int> DeleteProductAsync(int productId);

        #endregion DELETE Methods
    }
}
