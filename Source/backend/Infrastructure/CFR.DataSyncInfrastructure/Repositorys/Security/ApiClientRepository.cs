// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Repositorys.Security
{
    /// <summary>
    /// Dapper implementation of IApiClientRepository against sec.ApiClient / sec.IdempotencyRecord.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute StoredProc.Security.SecurityManage.
    /// </summary>
    public class ApiClientRepository(IDapperHandler dapperHandler): IApiClientRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches an ApiClient row by ClientId using StoredProc.Security.SecurityManage.
        /// </summary>
        /// <remarks>
        /// Purpose: Load the client secret/product for login (JWT issuance) and idempotency lookups.
        /// Request Flow: IAuthService -> ApiClientRepository.GetByClientIdAsync() -> Database.
        /// Validation Details: ClientId parameter mapping.
        /// Business Logic: Maps the stored procedure row to ApiClientOutput.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 1.
        /// Response Details: Returns an ApiClientOutput record or null.
        /// </remarks>
        /// <param name="clientId">The product's API client identifier.</param>
        /// <returns>The matching ApiClient row, or null when not found.</returns>
        public async Task<ApiClientOutput?> GetByClientIdAsync(string clientId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.SecurityParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.ClientId, clientId, DbType.String);
            var result = await dapperHandler.QueryAsync<ApiClientOutput>(StoredProc.Security.SecurityManage, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        /// <summary>
        /// Fetches a stored idempotency record using StoredProc.Security.SecurityManage.
        /// </summary>
        /// <remarks>
        /// Purpose: Detect a repeated request under the same Idempotency-Key.
        /// Request Flow: IUserSyncService -> ApiClientRepository.GetIdempotencyRecordAsync() -> Database.
        /// Validation Details: ApiClientId and IdempotencyKey parameter mapping.
        /// Business Logic: Maps the stored procedure row to IdempotencyRecordOutput.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 3.
        /// Response Details: Returns an IdempotencyRecordOutput record or null.
        /// </remarks>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="idempotencyKey">Client-supplied Idempotency-Key header value.</param>
        /// <returns>The stored record, or null when this key has not been used before.</returns>
        public async Task<IdempotencyRecordOutput?> GetIdempotencyRecordAsync(int apiClientId, string idempotencyKey)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.SecurityParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.ApiClientId, apiClientId, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.IdempotencyKey, idempotencyKey, DbType.String);
            var result = await dapperHandler.QueryAsync<IdempotencyRecordOutput>(StoredProc.Security.SecurityManage, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new idempotency record using StoredProc.Security.SecurityManage.
        /// </summary>
        /// <remarks>
        /// Purpose: Remember the response returned for an Idempotency-Key so a retry replays it.
        /// Request Flow: IUserSyncService -> ApiClientRepository.SaveIdempotencyRecordAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Inserts one row with the given ExpiresDate.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 4.
        /// Response Details: No return value.
        /// </remarks>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="idempotencyKey">Client-supplied Idempotency-Key header value.</param>
        /// <param name="requestHash">SHA-256 hash of the raw request body.</param>
        /// <param name="responseStatusCode">HTTP status code of the stored response.</param>
        /// <param name="responseBody">Serialized response body to replay.</param>
        /// <param name="expiresDate">UTC expiry of the record.</param>
        /// <returns>A task representing the save operation.</returns>
        public async Task SaveIdempotencyRecordAsync(int apiClientId, string idempotencyKey, byte[] requestHash, int responseStatusCode, string responseBody, DateTime expiresDate)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.SecurityParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.ApiClientId, apiClientId, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.IdempotencyKey, idempotencyKey, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.RequestHash, requestHash, DbType.Binary);
            parameters.Add(DBParameterName.SecurityParams.ResponseStatusCode, responseStatusCode, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.ResponseBody, responseBody, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.ExpiresDate, expiresDate, DbType.DateTime);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Security.SecurityManage, parameters, CommandType.StoredProcedure);
        }

        /// <summary>
        /// Creates a new ApiClient row using StoredProc.Security.SecurityManage.
        /// </summary>
        /// <remarks>
        /// Purpose: Register a downstream product's login credential.
        /// Request Flow: (admin/seed tooling) -> ApiClientRepository.CreateApiClientAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the create action and reads back the output ApiClientId.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 5.
        /// Response Details: Returns the new ApiClientId.
        /// </remarks>
        /// <param name="clientId">The product's API client identifier.</param>
        /// <param name="clientSecret">Plaintext client secret.</param>
        /// <param name="productId">ProductId this ApiClient is scoped to.</param>
        /// <param name="displayName">Human-readable label for the ApiClient row.</param>
        /// <param name="rateLimitPerMinute">Per-client requests-per-minute limit.</param>
        /// <param name="insertedBy">Who/what created the row.</param>
        /// <returns>The new ApiClientId.</returns>
        public async Task<int> CreateApiClientAsync(string clientId, string clientSecret, int productId, string? displayName, int rateLimitPerMinute, string? insertedBy)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.SecurityParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.ClientId, clientId, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.ClientSecret, clientSecret, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.DisplayName, displayName, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.RateLimitPerMinute, rateLimitPerMinute, DbType.Int32);
            parameters.Add(DBParameterName.SecurityParams.InsertedBy, insertedBy, DbType.String);
            parameters.Add(DBParameterName.SecurityParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);

            _ = await dapperHandler.ExecuteAsync(StoredProc.Security.SecurityManage, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.SecurityParams.ReturnValue);
        }

        #endregion POST Methods
    }
}
