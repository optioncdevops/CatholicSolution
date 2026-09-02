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
        /// Fetches all active products using StoredProc.Products.ProductsCrud (ActionId 1).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all product records from the Core.Product database table.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductsListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 1.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductOutput records.
        /// </remarks>
        /// <returns>A list of product output records.</returns>
        public async Task<List<ProductOutput>> GetProductsListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 1, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one product by identifier along with its active features using StoredProc.Products.ProductsCrud (ActionId 2).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single product record and its associated features from the database.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductByIdAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Reads two result sets (Product details and features list) using ActionId 2.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductOutput with Features or null.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>The matching product, or null when not found.</returns>
        public async Task<ProductOutput?> GetProductByIdAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 2, DbType.Int32);
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
        /// Checks whether a product with the specified name already exists (ActionId 4).
        /// </summary>
        /// <remarks>
        /// Purpose: Validate product name uniqueness.
        /// Request Flow: IProductsService -> ProductsRepository.CheckProductNameExistsAsync() -> Database.
        /// Validation Details: Binds ProductName and ProductId parameters.
        /// Business Logic: Executes duplicate check query with ActionId 4.
        /// Repository Interaction: Executes SQL check or SP validation.
        /// Response Details: Returns true if duplicate exists; otherwise false.
        /// </remarks>
        /// <param name="productName">Product name to check.</param>
        /// <param name="productId">Product identifier (0 for new products).</param>
        /// <returns>True if duplicate exists; otherwise false.</returns>
        public async Task<bool> CheckProductNameExistsAsync(string productName, int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductName, productName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            return await dapperHandler.ExecuteScalarAsync<bool>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Fetches license records for a specific product using StoredProc.Products.ProductsCrud (ActionId 5).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all active license rows for a product from lic.License and lic.OrganizationProduct.
        /// Request Flow: IProductsService -> ProductsRepository.GetLicenseDetailsAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 5.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns a list of ProductLicenseOutput records.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product license records.</returns>
        public async Task<List<ProductLicenseOutput>> GetLicenseDetailsAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductLicenseOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one license by identifier using StoredProc.Products.ProductsCrud (ActionId 6).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single license record by LicenseId.
        /// Request Flow: IProductsService -> ProductsRepository.GetLicenseByIdAsync() -> Database.
        /// Validation Details: LicenseId parameter mapping.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 6.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns ProductLicenseOutput or null.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>The matching license, or null when not found.</returns>
        public async Task<ProductLicenseOutput?> GetLicenseByIdAsync(long licenseId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.LicenseId, licenseId, DbType.Int64);
            return await dapperHandler.QueryFirstOrDefaultAsync<ProductLicenseOutput>(StoredProc.Products.ProductsCrud, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Fetches product customers from [core].[Organization] using StoredProc.Products.ProductsCrud (ActionId 9).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve only organizations assigned to this product, with user counts from [auth].[OrganizationUser]/[auth].[AuthUser].
        /// Request Flow: IProductsService -> ProductsRepository.GetProductCustomersAsync() -> Database.
        /// Validation Details: ProductId selects [lic].[OrganizationProduct] rows for this product.
        /// Business Logic: Reads product assignments via ProductsCrud (ActionId 5) and organization/user details via OrganizationCrud (ActionId 1).
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud and StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns a list of ProductCustomerOutput records for this product only.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>A list of product customer records.</returns>
        public async Task<List<ProductCustomerOutput>> GetProductCustomersAsync(int productId)
        {
            var organizationParameters = new DynamicParameters();
            organizationParameters.Add(DBParameterName.OrganizationParams.ActionId, 1, DbType.Int32);
            var organizations = await dapperHandler.QueryAsync<OrganizationOutput>(StoredProc.Organization.OrganizationCrud, organizationParameters, CommandType.StoredProcedure);

            var licenseParameters = new DynamicParameters();
            licenseParameters.Add(DBParameterName.ProductParams.ActionId, 5, DbType.Int32);
            licenseParameters.Add(DBParameterName.ProductParams.ProductId, productId, DbType.Int32);
            var licenses = await dapperHandler.QueryAsync<ProductLicenseOutput>(StoredProc.Products.ProductsCrud, licenseParameters, CommandType.StoredProcedure);

            return licenses
                .GroupBy(item => item.OrgId)
                .Select(group =>
                {
                    var license = group.OrderByDescending(item => item.CreatedDate).First();
                    var organization = organizations.FirstOrDefault(item => item.OrgId == license.OrgId);
                    return new ProductCustomerOutput
                    {
                        OrgId = license.OrgId,
                        OrgName = organization?.OrgName ?? license.OrgName,
                        OrgStatus = organization?.OrgStatus ?? string.Empty,
                        ContactEmail = organization?.ContactEmail,
                        Website = organization?.Website,
                        ContactPerson = organization?.ContactPerson,
                        ContactPhone = organization?.ContactPhone,
                        InsertedDate = organization?.InsertedDate ?? license.CreatedDate,
                        UpdatedDate = organization?.UpdatedDate,
                        UserCount = organization?.UserCount ?? 0,
                        OrgCode = $"ORG-{license.OrgId}",
                        StartDate = license.ActivationDate,
                        ExpiryDate = license.ExpiryDate,
                        LicenseType = license.LicenseType,
                        LicenseStatus = license.LicenseStatus ?? organization?.OrgStatus
                    };
                })
                .OrderBy(item => item.OrgName)
                .ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new license using StoredProc.Products.ProductsCrud (ActionId 7).
        /// </summary>
        /// <remarks>
        /// Purpose: Create organization product link if missing and insert license record.
        /// Request Flow: IProductsService -> ProductsRepository.CreateLicenseAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 7.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns created LicenseId or negative status code.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>Created LicenseId or negative error code.</returns>
        public async Task<long> CreateLicenseAsync(ProductLicenseInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 7, DbType.Int32);
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
            return parameters.Get<int>(DBParameterName.ProductParams.ReturnValue);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product using StoredProc.Products.ProductsCrud (ActionId 3).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateProductAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 3 and ProductId > 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated ProductId, -95 if not found, or -99 on duplicate name.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>Updated ProductId or negative status code.</returns>
        public async Task<int> UpdateProductAsync(ProductInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 3, DbType.Int32);
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

        /// <summary>
        /// Updates an existing license using StoredProc.Products.ProductsCrud (ActionId 8).
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable license fields and stamp UpdatedDate/UpdatedBy.
        /// Request Flow: IProductsService -> ProductsRepository.UpdateLicenseAsync() -> Database.
        /// Validation Details: Parameter mapping from ProductLicenseInput.
        /// Business Logic: Executes StoredProc.Products.ProductsCrud with ActionId 8 and LicenseId > 0.
        /// Repository Interaction: Executes StoredProc.Products.ProductsCrud.
        /// Response Details: Returns updated LicenseId, -95 if not found.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>Updated LicenseId or negative status code.</returns>
        public async Task<long> UpdateLicenseAsync(ProductLicenseInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 8, DbType.Int32);
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
