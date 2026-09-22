// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Interfaces.UserSync
{
    /// <summary>
    /// Repository interface for the single-user sync database operations.
    /// Repository Responsibility:
    /// - Declares create/update/get/deactivate/reactivate operations against
    ///   [dbo].[Sync_UserProductUpsert] via Dapper.
    /// </summary>
    public interface IUserSyncRepository
    {
        #region POST Methods

        /// <summary>
        /// Creates a new synced user/organization/product membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new membership row, creating the CFR identity if needed.
        /// Request Flow: IUserSyncService -> UserSyncRepository.CreateUserAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the create action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 1.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id, carried into the audit row.</param>
        /// <param name="sourceIp">Caller IP, carried into the audit row.</param>
        /// <returns>The upsert result.</returns>
        Task<UserProductUpsertResult> CreateUserAsync(int productId, UserSyncInput input, int apiClientId, string traceId, string? sourceIp);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Fully replaces an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update FirstName, LastName, RoleId, IsLoginDisabled, IsActive in full.
        /// Request Flow: IUserSyncService -> UserSyncRepository.UpdateUserFullAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the full-update action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 2.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement user fields.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id, carried into the audit row.</param>
        /// <param name="expectedRowVersion">Client-supplied If-Match RowVersion, or null to skip the check.</param>
        /// <param name="sourceIp">Caller IP, carried into the audit row.</param>
        /// <returns>The upsert result.</returns>
        Task<UserProductUpsertResult> UpdateUserFullAsync(int productId, string externalUserId, UserSyncInput input, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp);

        #endregion PUT Methods

        #region PATCH Methods

        /// <summary>
        /// Partially updates an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update FirstName, LastName, RoleId, IsLoginDisabled, IsActive in full — identical
        /// to UpdateUserFullAsync, kept as a distinct ActionId only for the PATCH route's semantics.
        /// Request Flow: IUserSyncService -> UserSyncRepository.UpdateUserPartialAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the partial-update action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 3.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement user fields.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id, carried into the audit row.</param>
        /// <param name="expectedRowVersion">Client-supplied If-Match RowVersion, or null to skip the check.</param>
        /// <param name="sourceIp">Caller IP, carried into the audit row.</param>
        /// <returns>The upsert result.</returns>
        Task<UserProductUpsertResult> UpdateUserPartialAsync(int productId, string externalUserId, UserSyncInput input, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp);

        #endregion PATCH Methods

        #region GET Methods

        /// <summary>
        /// Reads back a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the current CFR identity/membership for an external user.
        /// Request Flow: IUserSyncService -> UserSyncRepository.GetUserAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the read-only get action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 4.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>The read result.</returns>
        Task<UserProductUpsertResult> GetUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId);

        #endregion GET Methods

        #region STATUS Methods

        /// <summary>
        /// Soft-deletes (deactivates) a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Mark a membership Deactivated without deleting the row.
        /// Request Flow: IUserSyncService -> UserSyncRepository.DeactivateUserAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the deactivate action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 5.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id, carried into the audit row.</param>
        /// <param name="expectedRowVersion">Client-supplied If-Match RowVersion, or null to skip the check.</param>
        /// <param name="sourceIp">Caller IP, carried into the audit row.</param>
        /// <returns>The upsert result.</returns>
        Task<UserProductUpsertResult> DeactivateUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp);

        /// <summary>
        /// Reactivates a previously deactivated synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Clear the Deactivated status on an existing membership row.
        /// Request Flow: IUserSyncService -> UserSyncRepository.ReactivateUserAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the reactivate action of the upsert stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.UserProductUpsert with ActionId 6.
        /// Response Details: Returns a UserProductUpsertResult with ResultCode OK or an error code.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <param name="traceId">W3C trace id, carried into the audit row.</param>
        /// <param name="expectedRowVersion">Client-supplied If-Match RowVersion, or null to skip the check.</param>
        /// <param name="sourceIp">Caller IP, carried into the audit row.</param>
        /// <returns>The upsert result.</returns>
        Task<UserProductUpsertResult> ReactivateUserAsync(int productId, string externalUserId, int productOrgId, int apiClientId, string traceId, byte[]? expectedRowVersion, string? sourceIp);

        #endregion STATUS Methods
    }
}
