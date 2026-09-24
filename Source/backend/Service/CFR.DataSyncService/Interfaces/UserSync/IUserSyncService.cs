// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.UserSync
{
    /// <summary>
    /// Service contract for the single-user sync operations.
    /// Acts as the business-logic layer between UsersController and IUserSyncRepository.
    /// Responsibility:
    /// - Validates input, handles idempotency and If-Match concurrency, and translates
    ///   stored-procedure ResultCodes into MSResultArgs. ProductId is never bound from the
    ///   request body; it is always resolved from the authenticated ApiClient.
    /// </summary>
    public interface IUserSyncService
    {
        #region POST Methods

        /// <summary>
        /// Creates a new synced user/organization/product membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new membership row, creating the CFR identity if needed.
        /// Request Flow: UsersController -> IUserSyncService.CreateUserAsync() -> IUserSyncRepository.CreateUserAsync().
        /// Validation Details: Required fields and email format.
        /// Business Logic: Idempotency-Key short-circuit (replay or 409 IDEMPOTENCY_KEY_REUSE),
        /// then delegates to the repository and maps its ResultCode to MSResultArgs.
        /// Repository Interaction: Calls IUserSyncRepository.CreateUserAsync().
        /// Response Details: MSResultArgs containing UserSyncOutput, or the mapped error.
        /// </remarks>
        /// <param name="input">Input DTO containing the new user's fields.</param>
        /// <param name="idempotencyKey">Idempotency-Key header value, or null when not supplied.</param>
        /// <param name="contentSha256Hex">The signed request body's hash, reused as the idempotency request hash.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the created user, or an error.</returns>
        Task<MSResultArgs> CreateUserAsync(UserSyncInput input, string? idempotencyKey, string contentSha256Hex, string traceId, string? sourceIp);

        /// <summary>
        /// Creates or updates many synced user/organization/product memberships in one call.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a full batch of users (e.g. a one-time migration) into CFR
        /// without one HTTP round trip per user.
        /// Request Flow: UsersController -> IUserSyncService.BulkCreateUsersAsync() -> CreateUserAsync() per row.
        /// Validation Details: Batch-level row-count limit (the caller's sec.ApiClient.MaxBulkUserCount)
        /// and in-batch externalUserId/productOrgId duplicate check, then each row goes through
        /// CreateUserAsync's own validation — one bad row does not fail the whole batch.
        /// Business Logic: Loops the batch and reuses CreateUserAsync per row (no per-row
        /// Idempotency-Key — that header is a single-request concept, not meaningful across a
        /// batch of distinct payloads), aggregating a per-row result list plus success/failure counts.
        /// Repository Interaction: Calls IUserSyncRepository.CreateUserAsync() once per row (via CreateUserAsync).
        /// Response Details: MSResultArgs containing BulkUserSyncOutput, or a batch-level validation error.
        /// </remarks>
        /// <param name="input">Input DTO containing the batch of users to create.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the per-row batch result.</returns>
        Task<MSResultArgs> BulkCreateUsersAsync(BulkUserSyncInput input, string traceId, string? sourceIp);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Fully replaces an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update FirstName, LastName, RoleId, IsLoginDisabled, IsActive in full.
        /// Request Flow: UsersController -> IUserSyncService.UpdateUserFullAsync() -> IUserSyncRepository.UpdateUserFullAsync().
        /// Validation Details: Required fields and email format.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.UpdateUserFullAsync().
        /// Response Details: MSResultArgs containing the updated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement fields.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the updated user, or an error.</returns>
        Task<MSResultArgs> UpdateUserFullAsync(string externalUserId, UserSyncUpdateInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        #endregion PUT Methods

        #region PATCH Methods

        /// <summary>
        /// Partially updates an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update FirstName, LastName, RoleId, IsLoginDisabled, IsActive in full — identical
        /// to UpdateUserFullAsync, kept as a distinct route only for the PATCH verb's semantics.
        /// Request Flow: UsersController -> IUserSyncService.UpdateUserPartialAsync() -> IUserSyncRepository.UpdateUserPartialAsync().
        /// Validation Details: Required fields.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.UpdateUserPartialAsync().
        /// Response Details: MSResultArgs containing the updated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement fields.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the updated user, or an error.</returns>
        Task<MSResultArgs> UpdateUserPartialAsync(string externalUserId, UserSyncUpdateInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        #endregion PATCH Methods

        #region GET Methods

        /// <summary>
        /// Reads back a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the current CFR identity/membership for an external user.
        /// Request Flow: UsersController -> IUserSyncService.GetUserAsync() -> IUserSyncRepository.GetUserAsync().
        /// Validation Details: externalUserId and productOrgId are required.
        /// Business Logic: Maps the ResultCode to MSResultArgs.
        /// Repository Interaction: Calls IUserSyncRepository.GetUserAsync().
        /// Response Details: MSResultArgs containing the user, or NotFound.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the user, or an error.</returns>
        Task<MSResultArgs> GetUserAsync(string externalUserId, int productOrgId, string traceId);

        #endregion GET Methods

        #region STATUS Methods

        /// <summary>
        /// Soft-deletes (deactivates) a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Mark a membership Deactivated without deleting the row.
        /// Request Flow: UsersController -> IUserSyncService.DeactivateUserAsync() -> IUserSyncRepository.DeactivateUserAsync().
        /// Validation Details: externalUserId and productOrgId are required.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.DeactivateUserAsync().
        /// Response Details: MSResultArgs containing the deactivated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the deactivated user, or an error.</returns>
        Task<MSResultArgs> DeactivateUserAsync(string externalUserId, int productOrgId, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        /// <summary>
        /// Reactivates a previously deactivated synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Clear the Deactivated status on an existing membership row.
        /// Request Flow: UsersController -> IUserSyncService.ReactivateUserAsync() -> IUserSyncRepository.ReactivateUserAsync().
        /// Validation Details: externalUserId and productOrgId are required.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.ReactivateUserAsync().
        /// Response Details: MSResultArgs containing the reactivated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the reactivated user, or an error.</returns>
        Task<MSResultArgs> ReactivateUserAsync(string externalUserId, int productOrgId, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        /// <summary>
        /// Sets the IsLoginDisabled flag only, leaving IsActive/IsDeleted untouched.
        /// </summary>
        /// <remarks>
        /// Purpose: Flip login-disabled without resending the whole user payload.
        /// Request Flow: UsersController -> IUserSyncService.SetLoginDisabledAsync() -> IUserSyncRepository.SetLoginDisabledAsync().
        /// Validation Details: externalUserId and productOrgId are required.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.SetLoginDisabledAsync().
        /// Response Details: MSResultArgs containing the updated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="isLoginDisabled">The target IsLoginDisabled value.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the updated user, or an error.</returns>
        Task<MSResultArgs> SetLoginDisabledAsync(string externalUserId, int productOrgId, bool isLoginDisabled, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        /// <summary>
        /// Sets the IsActive flag only, leaving IsLoginDisabled/IsDeleted untouched.
        /// </summary>
        /// <remarks>
        /// Purpose: Flip active/inactive without resending the whole user payload.
        /// Request Flow: UsersController -> IUserSyncService.SetActiveAsync() -> IUserSyncRepository.SetActiveAsync().
        /// Validation Details: externalUserId and productOrgId are required.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.SetActiveAsync().
        /// Response Details: MSResultArgs containing the updated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="isActive">The target IsActive value.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the updated user, or an error.</returns>
        Task<MSResultArgs> SetActiveAsync(string externalUserId, int productOrgId, bool isActive, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        #endregion STATUS Methods
    }
}
