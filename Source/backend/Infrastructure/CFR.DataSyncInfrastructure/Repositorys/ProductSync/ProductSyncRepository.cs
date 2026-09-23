// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Repositorys.ProductSync
{
    /// <summary>
    /// Dapper implementation of IProductSyncRepository against [dbo].[Sync_ProductsForUser].
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the lookup stored procedure and map its result set to
    ///   UserProductListItemOutput, reading the output ReturnValue to detect an unmatched email.
    /// </summary>
    public class ProductSyncRepository(IDapperHandler dapperHandler): IProductSyncRepository
    {
        #region GET Methods

        /// <inheritdoc />
        public async Task<(bool Found, IEnumerable<UserProductListItemOutput> Products)> GetUserProductsAsync(string email, string environmentName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductSyncParams.Email, email, DbType.String);
            parameters.Add(DBParameterName.ProductSyncParams.EnvironmentName, environmentName, DbType.String);
            parameters.Add(DBParameterName.ProductSyncParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);

            var products = await dapperHandler.QueryAsync<UserProductListItemOutput>(StoredProc.ProductSync.ProductsForUser, parameters, CommandType.StoredProcedure);
            int returnValue = parameters.Get<int>(DBParameterName.ProductSyncParams.ReturnValue);
            return (returnValue == 1, products);
        }

        #endregion GET Methods

        #region POST Methods

        /// <inheritdoc />
        public async Task<bool> CreatePlatformLaunchCodeAsync(string email, string codeHash, string insertedBy)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.PlatformLaunchParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.PlatformLaunchParams.Email, email, DbType.String);
            parameters.Add(DBParameterName.PlatformLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            parameters.Add(DBParameterName.PlatformLaunchParams.InsertedBy, insertedBy, DbType.String);
            parameters.Add(DBParameterName.PlatformLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            await dapperHandler.ExecuteAsync(StoredProc.PlatformLaunch.PlatformLaunchCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.PlatformLaunchParams.ReturnValue) == 1;
        }

        /// <inheritdoc />
        public async Task<(int ReturnValue, ProductLaunchCreateRow? Row)> CreateProductLaunchAsync(string email, int productId, string codeHash, string environmentName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.CFRLaunchParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.Email, email, DbType.String);
            parameters.Add(DBParameterName.CFRLaunchParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            parameters.Add(DBParameterName.CFRLaunchParams.InsertedBy, 0, DbType.Int64);
            parameters.Add(DBParameterName.CFRLaunchParams.EnvironmentName, environmentName, DbType.String);
            parameters.Add(DBParameterName.CFRLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            var result = await dapperHandler.QueryAsync<ProductLaunchCreateRow>(StoredProc.CFRLaunch.CFRLaunchCrud, parameters, CommandType.StoredProcedure);
            return (parameters.Get<int>(DBParameterName.CFRLaunchParams.ReturnValue), result.FirstOrDefault());
        }

        #endregion POST Methods
    }
}
