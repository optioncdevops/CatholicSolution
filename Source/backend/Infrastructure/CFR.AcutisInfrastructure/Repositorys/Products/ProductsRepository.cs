// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Products
{
    /// <summary>
    /// Dapper implementation of IProductsRepository for the Products module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the [dbo].[Acutis_Products_CRUD] stored procedure.
    /// - Stamps InsertedBy / UpdatedBy from ICurrentUserService.UserId.
    /// </summary>
    public class ProductsRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IProductsRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches all active products using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all product records from the Core.Product database table.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductsListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 4.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductOutput records.
        /// </remarks>
        /// <returns>A list of product output records.</returns>
        public async Task<List<ProductOutput>> GetProductsListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 4, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one product by identifier along with its active features using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single product record and its associated features from the database.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductByIdAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Reads two result sets (Product details and features list) using ActionId 3.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductOutput with Features or null.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The matching product, or null when not found.</returns>
        public async Task<ProductOutput?> GetProductByIdAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            using var multi = await dapperHandler.QueryMultipleAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            var product = (await multi.ReadAsync<ProductOutput>()).FirstOrDefault();
            if (product != null)
            {
                var features = (await multi.ReadAsync<string>()).ToList();
                product.Features = features;
            }
            return product;
        }

        /// <summary>
        /// Checks whether a product with the specified name already exists.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate product name uniqueness.
        /// Request Flow: IProductsService -> ProductsRepository.CheckProductNameExistsAsync() -> Database.
        /// Validation Details: Binds ProductName and ProductId parameters.
        /// Business Logic: Executes duplicate check query.
        /// Repository Interaction: Executes SQL check or SP validation.
        /// Response Details: Returns true if duplicate exists; otherwise false.
        /// </remarks>
        /// <param name="productName">Product name to check.</param>
        /// <param name="productId">Product identifier (0 for new products).</param>
        /// <returns>True if duplicate exists; otherwise false.</returns>
        public async Task<bool> CheckProductNameExistsAsync(string productName, int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, productName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            return await dapperHandler.ExecuteScalarAsync<bool>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Fetches license records for a specific product using StoredProc.Products.ProductLicensesGetByProductId.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all active license rows for a product from lic.License and lic.OrganizationProduct.
        /// Request Flow: IProductsService -> ProductsRepository.GetLicenseDetailsAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductLicensesGetByProductId with ProductId.
        /// Repository Interaction: Executes StoredProc.Products.ProductLicensesGetByProductId.
        /// Response Details: Returns a list of ProductLicenseOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product license records.</returns>
        public async Task<List<ProductLicenseOutput>> GetLicenseDetailsAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductLicenseOutput>(StoredProc.Products.ProductLicensesGetByProductId, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts a new product record using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert a new product record with sequential ProductId and audit columns.
        /// Request Flow: IProductsService -> ProductsRepository.SaveProductAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductSaveInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 1 and ProductId = 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns generated ProductId or -99 on duplicate.
        /// </remarks>
        /// <param name="input">Input DTO containing new product details without ProductId.</param>
        /// <returns>Generated ProductId or negative status code.</returns>
        public async Task<int> SaveProductAsync(ProductSaveInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, 0, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, input.ProductName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.SubCategoryName, input.SubCategoryName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProdDescription, input.ProdDescription?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ExternalPageUrl, input.ExternalPageUrl?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.DefaultAccessDays, input.DefaultAccessDays, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LogoUrl, input.LogoUrl?.Trim(), DbType.String);
            string? saveFeatures = input.Features != null && input.Features.Count > 0
                ? string.Join("|", input.Features.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()))
                : null;
            parameters.Add(DBParameterName.ProductParams.Features, saveFeatures, DbType.String);
            parameters.Add(DBParameterName.ProductParams.IsActive, input.IsActive, DbType.Boolean);
            parameters.Add(DBParameterName.ProductParams.IsAvailable, input.IsAvailable, DbType.Boolean);
            parameters.Add(DBParameterName.ProductParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateProductAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 1 and ProductId > 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, -95 if not found, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Updated ProductId or negative status code.</returns>
        public async Task<int> UpdateProductAsync(ProductInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, input.ProductId, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, input.ProductName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.SubCategoryName, input.SubCategoryName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProdDescription, input.ProdDescription?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ExternalPageUrl, input.ExternalPageUrl?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.DefaultAccessDays, input.DefaultAccessDays, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LogoUrl, input.LogoUrl?.Trim(), DbType.String);
            string? updateFeatures = input.Features != null && input.Features.Count > 0
                ? string.Join("|", input.Features.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()))
                : null;
            parameters.Add(DBParameterName.ProductParams.Features, updateFeatures, DbType.String);
            parameters.Add(DBParameterName.ProductParams.IsActive, input.IsActive, DbType.Boolean);
            parameters.Add(DBParameterName.ProductParams.IsAvailable, input.IsAvailable, DbType.Boolean);
            parameters.Add(DBParameterName.ProductParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a product using StoredProc.Products.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a product while preserving history.
        /// Request Flow: IProductsService -> ProductsRepository.DeleteProductAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 2.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns 1 on success, or -95 if not found.
        /// </remarks>
        /// <param name="productId">Identifier of the product to delete.</param>
        /// <returns>1 on success or negative error code.</returns>
        public async Task<int> DeleteProductAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        #endregion DELETE Methods
    }
}
