// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Repositorys.ProductRole
{
    /// <summary>
    /// Dapper implementation of IProductRoleRepository against [dbo].[Sync_ProductRole].
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the upsert/list stored procedure.
    /// </summary>
    public class ProductRoleRepository(IDapperHandler dapperHandler): IProductRoleRepository
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<ProductRoleOutput> UpsertRoleAsync(int productId, int roleId, string roleName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRoleParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.ProductRoleParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.ProductRoleParams.RoleId, roleId, DbType.Int32);
            parameters.Add(DBParameterName.ProductRoleParams.RoleName, roleName, DbType.String);

            await dapperHandler.ExecuteAsync(StoredProc.ProductRole.ProductRoleCrud, parameters, CommandType.StoredProcedure);
            return new ProductRoleOutput { RoleId = roleId, RoleName = roleName };
        }

        #endregion POST Methods

        #region GET Methods

        /// <inheritdoc />
        public async Task<List<ProductRoleOutput>> GetRolesAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRoleParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.ProductRoleParams.ProductId, productId, DbType.Int32);

            var result = await dapperHandler.QueryAsync<ProductRoleOutput>(StoredProc.ProductRole.ProductRoleCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods
    }
}
