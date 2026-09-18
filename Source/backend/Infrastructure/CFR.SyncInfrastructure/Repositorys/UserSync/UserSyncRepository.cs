// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncInfrastructure.Repositorys.UserSync
{
    /// <summary>
    /// Dapper implementation of IUserSyncRepository against [dbo].[Sync_UserProductUpsert].
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute the upsert stored procedure and map its single-row
    ///   result to UserProductUpsertResult.
    /// </summary>
    public class UserSyncRepository(IDapperHandler dapperHandler): IUserSyncRepository
    {
        #region POST Methods

        /// <inheritdoc />
        public Task<UserProductUpsertResult> CreateUserAsync(int productId, UserSyncInput input, int apiClientId, string traceId, string? sourceIp)
        {
            var parameters = BuildBaseParameters(1, productId, input.ProductOrgId, apiClientId, traceId, sourceIp);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, input.ExternalUserId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Email, input.Email, DbType.String);
            AddFieldParameters(parameters, input);
            parameters.Add(DBParameterName.UserSyncParams.PasswordEncrypted, input.PasswordEncrypted, DbType.Binary);
            return ExecuteUpsertAsync(parameters);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <inheritdoc />
        public Task<UserProductUpsertResult> UpdateUserFullAsync(int productId, string externalUserId, UserSyncInput input, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp)
        {
            var parameters = BuildBaseParameters(2, productId, input.ProductOrgId, apiClientId, traceId, sourceIp);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, externalUserId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Email, input.Email, DbType.String);
            AddFieldParameters(parameters, input);
            parameters.Add(DBParameterName.UserSyncParams.ExpectedRowVersion, expectedRowVersion, DbType.Binary);
            return ExecuteUpsertAsync(parameters);
        }

        #endregion PUT Methods

        #region PATCH Methods

        /// <inheritdoc />
        public Task<UserProductUpsertResult> UpdateUserPartialAsync(int productId, string externalUserId, UserSyncInput input, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp)
        {
            var parameters = BuildBaseParameters(3, productId, input.ProductOrgId, apiClientId, traceId, sourceIp);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, externalUserId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.Email, input.Email, DbType.String);
            AddFieldParameters(parameters, input);
            parameters.Add(DBParameterName.UserSyncParams.ExpectedRowVersion, expectedRowVersion, DbType.Binary);
            return ExecuteUpsertAsync(parameters);
        }

        #endregion PATCH Methods

        #region GET Methods

        /// <inheritdoc />
        public Task<UserProductUpsertResult> GetUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId)
        {
            var parameters = BuildBaseParameters(4, productId, productOrgId, apiClientId, traceId, sourceIp: null);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, externalUserId, DbType.String);
            return ExecuteUpsertAsync(parameters);
        }

        #endregion GET Methods

        #region STATUS Methods

        /// <inheritdoc />
        public Task<UserProductUpsertResult> DeactivateUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp)
        {
            var parameters = BuildBaseParameters(5, productId, productOrgId, apiClientId, traceId, sourceIp);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, externalUserId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.ExpectedRowVersion, expectedRowVersion, DbType.Binary);
            return ExecuteUpsertAsync(parameters);
        }

        /// <inheritdoc />
        public Task<UserProductUpsertResult> ReactivateUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp)
        {
            var parameters = BuildBaseParameters(6, productId, productOrgId, apiClientId, traceId, sourceIp);
            parameters.Add(DBParameterName.UserSyncParams.ExternalUserId, externalUserId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.ExpectedRowVersion, expectedRowVersion, DbType.Binary);
            return ExecuteUpsertAsync(parameters);
        }

        #endregion STATUS Methods

        private static DynamicParameters BuildBaseParameters(int actionId, int productId, int productOrgId, int apiClientId, string traceId, string? sourceIp)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.UserSyncParams.ActionId, actionId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ProductOrgId, productOrgId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.ApiClientId, apiClientId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.TraceId, traceId, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.SourceIp, sourceIp, DbType.String);
            return parameters;
        }

        private static void AddFieldParameters(DynamicParameters parameters, UserSyncInput input)
        {
            parameters.Add(DBParameterName.UserSyncParams.FirstName, input.FirstName, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.LastName, input.LastName, DbType.String);
            parameters.Add(DBParameterName.UserSyncParams.RoleId, input.RoleId, DbType.Int32);
            parameters.Add(DBParameterName.UserSyncParams.IsLoginDisabled, input.IsLoginDisabled, DbType.Boolean);
            parameters.Add(DBParameterName.UserSyncParams.IsActive, input.IsActive, DbType.Boolean);
        }

        private async Task<UserProductUpsertResult> ExecuteUpsertAsync(DynamicParameters parameters)
        {
            var result = await dapperHandler.QueryAsync<UserProductUpsertResult>(StoredProc.UserSync.UserProductUpsert, parameters, CommandType.StoredProcedure);
            return result.First();
        }
    }
}
