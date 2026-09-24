// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Interfaces.Security
{
    /// <summary>
    /// Repository interface for HMAC ApiClient lookups, nonce replay-insertion, and idempotency
    /// record get/save.
    /// Repository Responsibility:
    /// - Declares SELECT/INSERT operations against sec.ApiClient / sec.RequestNonce /
    ///   sec.IdempotencyRecord via Dapper stored procedures.
    /// </summary>
    public interface IApiClientRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches an ApiClient row by ClientId.
        /// </summary>
        /// <remarks>
        /// Purpose: Load the client secret/product for login (JWT issuance) and idempotency lookups.
        /// Request Flow: IAuthService -> ApiClientRepository.GetByClientIdAsync() -> SQL Database.
        /// Validation Details: ClientId parameter mapping.
        /// Business Logic: Directly retrieves the matching row.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 1.
        /// Response Details: Returns an ApiClientOutput record or null.
        /// </remarks>
        /// <param name="clientId">The product's API client identifier.</param>
        /// <returns>The matching ApiClient row, or null when not found.</returns>
        Task<ApiClientOutput?> GetByClientIdAsync(string clientId);

        /// <summary>
        /// Fetches a stored idempotency record.
        /// </summary>
        /// <remarks>
        /// Purpose: Detect a repeated request under the same Idempotency-Key.
        /// Request Flow: IUserSyncService -> ApiClientRepository.GetIdempotencyRecordAsync() -> SQL Database.
        /// Validation Details: ApiClientId and IdempotencyKey parameter mapping.
        /// Business Logic: Directly retrieves the matching row.
        /// Repository Interaction: Executes StoredProc.Security.SecurityManage with ActionId 3.
        /// Response Details: Returns an IdempotencyRecordOutput record or null.
        /// </remarks>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="idempotencyKey">Client-supplied Idempotency-Key header value.</param>
        /// <returns>The stored record, or null when this key has not been used before.</returns>
        Task<IdempotencyRecordOutput?> GetIdempotencyRecordAsync(int apiClientId, string idempotencyKey);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new idempotency record.
        /// </summary>
        /// <remarks>
        /// Purpose: Remember the response returned for an Idempotency-Key so a retry replays it.
        /// Request Flow: IUserSyncService -> ApiClientRepository.SaveIdempotencyRecordAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Inserts one row with a 24h ExpiresDate.
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
        Task SaveIdempotencyRecordAsync(int apiClientId, string idempotencyKey, byte[] requestHash, int responseStatusCode, string responseBody, DateTime expiresDate);

        /// <summary>
        /// Creates a new ApiClient row.
        /// </summary>
        /// <remarks>
        /// Purpose: Register a downstream product's login credential.
        /// Request Flow: (admin/seed tooling) -> ApiClientRepository.CreateApiClientAsync() -> SQL Database.
        /// Validation Details: Caller is responsible for uniqueness of clientId (sec.ApiClient.ClientId is unique).
        /// Business Logic: Executes the create action of the security stored procedure.
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
        Task<int> CreateApiClientAsync(string clientId, string clientSecret, int productId, string? displayName, int rateLimitPerMinute, string? insertedBy);

        #endregion POST Methods
    }
}
