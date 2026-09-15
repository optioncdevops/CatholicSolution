// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Products
{
    /// <summary>
    /// Dapper implementation of IProductsRepository for the Products module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the [dbo].[Acutis_Products] stored procedure.
    /// - Stamps InsertedBy / UpdatedBy from ICurrentUserService.UserId.
    /// </summary>
    public class ProductsRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IProductsRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches all active products using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetList).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all product records from the Core.Product database table.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductsListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.GetList, then sets CustomerCount from EnumVariables.ProductAction.GetLicenses grouped by OrgId (same as GetProductCustomersAsync).
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductOutput records with customer counts matching the Customers tab.
        /// </remarks>
        /// <returns>A list of product output records.</returns>
        public async Task<List<ProductOutput>> GetProductsListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.ONE, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            var products = result.ToList();
            var licenses = await GetLicenseDetailsAsync(0);
            var customerCounts = licenses
                .GroupBy(item => item.ProductId)
                .ToDictionary(group => group.Key, group => group.GroupBy(item => item.OrgId).Count());
            foreach (var product in products)
            {
                product.CustomerCount = customerCounts.GetValueOrDefault(product.ProductId);
            }
            return products;
        }

        /// <summary>
        /// Fetches one product by identifier along with its active features using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetById).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single product record and its associated features from the database.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductByIdAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Reads two result sets (Product details and features list) using EnumVariables.ProductAction.GetById, then sets CustomerCount from EnumVariables.ProductAction.GetLicenses grouped by OrgId (same as GetProductCustomersAsync).
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductOutput with Features or null.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The matching product, or null when not found.</returns>
        public async Task<ProductOutput?> GetProductByIdAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.TWO, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            using var multi = await dapperHandler.QueryMultipleAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            var product = (await multi.ReadAsync<ProductOutput>()).FirstOrDefault();
            if (product != null)
            {
                var features = (await multi.ReadAsync<string>()).ToList();
                product.Features = features;
                var licenses = await GetLicenseDetailsAsync(productId);
                product.CustomerCount = licenses.GroupBy(item => item.OrgId).Count();
            }
            return product;
        }

        /// <summary>
        /// Checks whether a product with the specified name already exists (EnumVariables.ProductAction.CheckNameExists).
        /// </summary>
        /// <remarks>
        /// Purpose: Validate product name uniqueness.
        /// Request Flow: IProductsService -> ProductsRepository.CheckProductNameExistsAsync() -> Database.
        /// Validation Details: Binds ProductName and ProductId parameters.
        /// Business Logic: Executes duplicate check query with EnumVariables.ProductAction.CheckNameExists.
        /// Repository Interaction: Executes SQL check or SP validation.
        /// Response Details: Returns true if duplicate exists; otherwise false.
        /// </remarks>
        /// <param name="productName">Product name to check.</param>
        /// <param name="productId">Product identifier (0 for new products).</param>
        /// <returns>True if duplicate exists; otherwise false.</returns>
        public async Task<bool> CheckProductNameExistsAsync(string productName, int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.FOUR, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, productName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            return await dapperHandler.ExecuteScalarAsync<bool>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Fetches license records for a specific product using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetLicenses).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all active license rows for a product from lic.License and lic.OrganizationProduct.
        /// Request Flow: IProductsService -> ProductsRepository.GetLicenseDetailsAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.GetLicenses.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductLicenseOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product license records.</returns>
        public async Task<List<ProductLicenseOutput>> GetLicenseDetailsAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.FIVE, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductLicenseOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one license by identifier using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetLicenseById).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single license record by LicenseId.
        /// Request Flow: IProductsService -> ProductsRepository.GetLicenseByIdAsync() -> Database.
        /// Validation Details: LicenseId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.GetLicenseById.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductLicenseOutput or null.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>The matching license, or null when not found.</returns>
        public async Task<ProductLicenseOutput?> GetLicenseByIdAsync(long licenseId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.SIX, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LicenseId, licenseId, DbType.Int64);
            return await dapperHandler.QueryFirstOrDefaultAsync<ProductLicenseOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Fetches product customers from [core].[Organization] using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetCustomers).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve organizations assigned to this product, with the latest license fields and user counts.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductCustomersAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.GetCustomers.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductCustomerOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product customer records.</returns>
        public async Task<List<ProductCustomerOutput>> GetProductCustomersAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.NINE, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductCustomerOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches per-product organization assignment counts using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.GetAssignmentSummary).
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's App Access Overview with real assignment data.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductAssignmentSummaryAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps the joined core.Product + lic.OrganizationProduct rows to ProductAssignmentSummaryOutput.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.GetAssignmentSummary.
        /// Response Details: Returns a list of per-product organization assignment summaries.
        /// </remarks>
        /// <returns>A list of per-product organization assignment summaries.</returns>
        public async Task<List<ProductAssignmentSummaryOutput>> GetProductAssignmentSummaryAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.TEN, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductAssignmentSummaryOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new license using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.CreateLicense).
        /// </summary>
        /// <remarks>
        /// Purpose: Create organization product link if missing and insert license record.
        /// Request Flow: IProductsService -> ProductsRepository.CreateLicenseAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.CreateLicense.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns created LicenseId, -95 when the assignment cannot be created, or -99 when an active or upcoming license already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>Created LicenseId or negative error code.</returns>
        public async Task<long> CreateLicenseAsync(ProductLicenseInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.SEVEN, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.OrganizationProductId, input.OrganizationProductId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.OrgId, input.OrgId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ProductId, input.ProductId, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LicenseType, input.LicenseType?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ActivationDate, input.ActivationDate, DbType.DateTime2);
            parameters.Add(DBParameterName.ProductParams.ExpiryDate, input.ExpiryDate, DbType.DateTime2);
            parameters.Add(DBParameterName.ProductParams.LicenseStatus, input.LicenseStatus?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.AssignStatus, input.AssignStatus?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.Remarks, input.Remarks?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int?>(DBParameterName.ProductParams.ReturnValue) ?? 0;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.Update).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateProductAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.Update and ProductId > 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, -95 if not found, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Updated ProductId or negative status code.</returns>
        public async Task<int> UpdateProductAsync(ProductInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.THREE, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, input.ProductId, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, input.ProductName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ShortName, input.ShortName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.SubCategoryName, input.SubCategoryName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProdDescription, input.ProdDescription?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ExternalPageUrl, input.ExternalPageUrl?.Trim(), DbType.String);
            string? logo = input.LogoName?.Trim();
            parameters.Add(DBParameterName.ProductParams.LogoName, logo, DbType.String);
            parameters.Add(DBParameterName.ProductParams.ContactUserId, input.ContactUserId is null ? DBNull.Value : input.ContactUserId.Value, DbType.Int64);
            string? updateFeatures = input.Features != null && input.Features.Count > 0
                ? string.Join("|", input.Features.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()))
                : null;
            parameters.Add(DBParameterName.ProductParams.Features, updateFeatures, DbType.String);
            parameters.Add(DBParameterName.ProductParams.IsActive, input.IsActive, DbType.Boolean);
            object productStatusParam = !input.IsActive || !input.ProductStatus.HasValue
                ? (!input.IsActive ? DBNull.Value : (object)1)
                : (object)input.ProductStatus.Value;
            parameters.Add(DBParameterName.ProductParams.ProductStatus, productStatusParam, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LicenseType, string.IsNullOrWhiteSpace(input.LicenseType) ? DBNull.Value : input.LicenseType.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.NavigationTarget, string.IsNullOrWhiteSpace(input.NavigationTarget) ? DBNull.Value : input.NavigationTarget.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        /// <summary>
        /// Updates a product's logo name in Core.Product using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.Update).
        /// </summary>
        /// <remarks>
        /// Purpose: Update logo file name and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateProductLogoAsync() -> Database.
        /// Validation Details: Parameter mapping from productId and logoName.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 3 and sets LogoName.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, or -95 if not found.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <param name="logoName">Saved logo file name.</param>
        /// <returns>Updated ProductId or negative status code.</returns>
        public async Task<int> UpdateProductLogoAsync(int productId, string logoName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.THREE, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LogoName, logoName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        /// <summary>
        /// Updates an existing license using StoredProc.Products.ProductsCrud (EnumVariables.ProductAction.UpdateLicense).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable license fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateLicenseAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with EnumVariables.ProductAction.UpdateLicense and LicenseId > 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated LicenseId, -95 if not found.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>Updated LicenseId or negative status code.</returns>
        public async Task<long> UpdateLicenseAsync(ProductLicenseInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, (int)EnumCommand.DefaultValues.EIGHT, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LicenseId, input.LicenseId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.LicenseType, input.LicenseType?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ActivationDate, input.ActivationDate, DbType.DateTime2);
            parameters.Add(DBParameterName.ProductParams.ExpiryDate, input.ExpiryDate, DbType.DateTime2);
            parameters.Add(DBParameterName.ProductParams.LicenseStatus, input.LicenseStatus?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.AssignStatus, input.AssignStatus?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.Remarks, input.Remarks?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
