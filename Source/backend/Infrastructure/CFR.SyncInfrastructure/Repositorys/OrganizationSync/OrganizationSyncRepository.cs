// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncInfrastructure.Repositorys.OrganizationSync
{
    /// <summary>
    /// Dapper implementation of IOrganizationSyncRepository against [dbo].[Sync_OrganizationUpsert].
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the organization stored procedure and map its single-row
    ///   result to OrganizationUpsertResult.
    /// </summary>
    public class OrganizationSyncRepository(IDapperHandler dapperHandler): IOrganizationSyncRepository
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<OrganizationUpsertResult> UpsertOrganizationAsync(int productId, OrganizationSyncInput input, int apiClientId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.UserSyncParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductOrgId, input.ProductOrgId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ApiClientId, apiClientId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.OrgName, input.OrgName, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.OrgState, input.OrgState, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.OrgCountry, input.OrgCountry, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.ContactEmail, input.ContactEmail, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Website, input.Website, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.ContactPerson, input.ContactPerson, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.ContactPhone, input.ContactPhone, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Address, input.Address, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.City, input.City, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.State, input.State, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Zip, input.Zip, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.DioceseId, input.DioceseId, DbType.String);

            var result = await dapperHandler.QueryAsync<OrganizationUpsertResult>(StoredProc.UserSync.OrganizationUpsert, parameters, CommandType.StoredProcedure);
            return result.First();
        }

        #endregion POST Methods

        #region GET Methods

        /// <inheritdoc />
        public async Task<OrganizationUpsertResult?> GetOrganizationAsync(int productId, int productOrgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.UserSyncParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductOrgId, productOrgId, DbType.Int32);

            var result = await dapperHandler.QueryAsync<OrganizationUpsertResult>(StoredProc.UserSync.OrganizationUpsert, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods
    }
}
