// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncService.Interfaces.UserSync
{
    /// <summary>
    /// Service contract for the single-user sync operations.
    /// Acts as the business-logic layer between UsersController and IUserSyncRepository.
    /// Responsibility:
    /// - Validates input, enforces the productId-in-body hard rule, handles idempotency and
    ///   If-Match concurrency, and translates stored-procedure ResultCodes into MSResultArgs.
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
        /// Validation Details: Required fields, email format, and the productId-in-body hard rule.
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

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Fully replaces an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update FirstName, LastName, RoleId, IsLoginDisabled, IsActive in full.
        /// Request Flow: UsersController -> IUserSyncService.UpdateUserFullAsync() -> IUserSyncRepository.UpdateUserFullAsync().
        /// Validation Details: Required fields, email format, and the productId-in-body hard rule.
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
        Task<MSResultArgs> UpdateUserFullAsync(string externalUserId, UserSyncInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

        #endregion PUT Methods

        #region PATCH Methods

        /// <summary>
        /// Partially updates an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Update only the fields present in the request body.
        /// Request Flow: UsersController -> IUserSyncService.UpdateUserPartialAsync() -> IUserSyncRepository.UpdateUserPartialAsync().
        /// Validation Details: The *Supplied flags mark which fields were present in the raw JSON body.
        /// Business Logic: Applies the If-Match RowVersion check and maps the ResultCode.
        /// Repository Interaction: Calls IUserSyncRepository.UpdateUserPartialAsync().
        /// Response Details: MSResultArgs containing the updated user, or the mapped error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the supplied fields.</param>
        /// <param name="firstNameSupplied">Whether firstName was present in the raw JSON body.</param>
        /// <param name="lastNameSupplied">Whether lastName was present in the raw JSON body.</param>
        /// <param name="roleIdSupplied">Whether roleId was present in the raw JSON body.</param>
        /// <param name="isLoginDisabledSupplied">Whether isLoginDisabled was present in the raw JSON body.</param>
        /// <param name="isActiveSupplied">Whether isActive was present in the raw JSON body.</param>
        /// <param name="ifMatchRowVersionBase64">If-Match header value, or null to skip the concurrency check.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <param name="sourceIp">Caller IP.</param>
        /// <returns>MSResultArgs containing the updated user, or an error.</returns>
        Task<MSResultArgs> UpdateUserPartialAsync(string externalUserId, UserSyncInput input, bool firstNameSupplied, bool lastNameSupplied, bool roleIdSupplied, bool isLoginDisabledSupplied, bool isActiveSupplied, string? ifMatchRowVersionBase64, string traceId, string? sourceIp);

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

        #endregion STATUS Methods
    }
}
