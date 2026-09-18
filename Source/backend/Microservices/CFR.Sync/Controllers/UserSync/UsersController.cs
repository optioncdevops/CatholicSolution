// Copyright (c) OptionC. All rights reserved.

namespace CFR.Sync.Controllers.UserSync
{
    /// <summary>
    /// API controller for the CFR.Sync single-user create/update/get/deactivate/reactivate surface.
    /// Service Responsibility:
    /// - IUserSyncService validates, applies business rules, and returns MSResultArgs.
    /// Routes follow the same api/v1/[controller]/[action] convention as every other microservice
    /// (BaseController) — externalUserId is bound from the query string rather than a route
    /// segment, matching how Acutis's UsersController.GetUserById(int userId) binds scalar ids.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.SyncUserSync)]
    public class UsersController(IUserSyncService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Creates a new synced user/organization/product membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a newly-created local user into CFR.
        /// Request Flow: Client API POST -> UsersController.CreateUser() -> IUserSyncService.CreateUserAsync() -> Database.
        /// Validation Details: Handled inside the service layer, including the productId-in-body hard rule.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.CreateUserAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput with status 201, or an error.
        /// </remarks>
        /// <param name="input">Input DTO containing the new user's fields.</param>
        /// <param name="idempotencyKey">Idempotency-Key header — required by the spec for this action.</param>
        /// <returns>A consistent API response containing the created user.</returns>
        /// <response code="201">Successfully created the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_UserSync.CreateUser)]
        public async Task<IActionResult> CreateUser([FromBody] UserSyncInput input, [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey)
        {
            string contentHash = (string?)HttpContext.Items["ContentSha256Hex"] ?? string.Empty;
            return ApiResultArgs(await service.CreateUserAsync(input, idempotencyKey, contentHash, HttpContext.TraceIdentifier, HttpContext.Connection.RemoteIpAddress?.ToString()), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Deactivates (soft-deletes) a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a local deactivation into CFR.
        /// Request Flow: Client API POST -> UsersController.DeactivateUser() -> IUserSyncService.DeactivateUserAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.DeactivateUserAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput, or an error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="ifMatch">If-Match header — RowVersion for optimistic concurrency, optional.</param>
        /// <returns>A consistent API response containing the deactivated user.</returns>
        /// <response code="200">Successfully deactivated the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_UserSync.DeactivateUser)]
        public async Task<IActionResult> DeactivateUser(string externalUserId, int productOrgId, [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            return ApiResultArgs(await service.DeactivateUserAsync(externalUserId, productOrgId, ifMatch, HttpContext.TraceIdentifier, HttpContext.Connection.RemoteIpAddress?.ToString()), APIHttpType.HttpPut);
        }

        /// <summary>
        /// Reactivates a previously deactivated synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a local reactivation into CFR.
        /// Request Flow: Client API POST -> UsersController.ReactivateUser() -> IUserSyncService.ReactivateUserAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.ReactivateUserAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput, or an error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="ifMatch">If-Match header — RowVersion for optimistic concurrency, optional.</param>
        /// <returns>A consistent API response containing the reactivated user.</returns>
        /// <response code="200">Successfully reactivated the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_UserSync.ReactivateUser)]
        public async Task<IActionResult> ReactivateUser(string externalUserId, int productOrgId, [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            return ApiResultArgs(await service.ReactivateUserAsync(externalUserId, productOrgId, ifMatch, HttpContext.TraceIdentifier, HttpContext.Connection.RemoteIpAddress?.ToString()), APIHttpType.HttpPut);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Fully replaces an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a full local user update into CFR.
        /// Request Flow: Client API PUT -> UsersController.UpdateUser() -> IUserSyncService.UpdateUserFullAsync() -> Database.
        /// Validation Details: Handled inside the service layer, including the productId-in-body hard rule.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.UpdateUserFullAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput, or an error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement fields.</param>
        /// <param name="ifMatch">If-Match header — RowVersion for optimistic concurrency, optional.</param>
        /// <returns>A consistent API response containing the updated user.</returns>
        /// <response code="200">Successfully updated the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_UserSync.UpdateUser)]
        public async Task<IActionResult> UpdateUser(string externalUserId, [FromBody] UserSyncInput input, [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            return ApiResultArgs(await service.UpdateUserFullAsync(externalUserId, input, ifMatch, HttpContext.TraceIdentifier, HttpContext.Connection.RemoteIpAddress?.ToString()), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region PATCH Methods

        /// <summary>
        /// Partially updates an existing synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product push a partial local user update into CFR.
        /// Request Flow: Client API PATCH -> UsersController.PatchUser() -> IUserSyncService.UpdateUserPartialAsync() -> Database.
        /// Validation Details: Handled inside the service layer, including the productId-in-body hard rule.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.UpdateUserPartialAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput, or an error.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="input">Input DTO containing the replacement fields.</param>
        /// <param name="ifMatch">If-Match header — RowVersion for optimistic concurrency, optional.</param>
        /// <returns>A consistent API response containing the updated user.</returns>
        /// <response code="200">Successfully updated the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPatch]
        [ActionName(API_UserSync.PatchUser)]
        public async Task<IActionResult> PatchUser(string externalUserId, [FromBody] UserSyncInput input, [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            return ApiResultArgs(await service.UpdateUserPartialAsync(externalUserId, input, ifMatch, HttpContext.TraceIdentifier, HttpContext.Connection.RemoteIpAddress?.ToString()), APIHttpType.HttpPut);
        }

        #endregion PATCH Methods

        #region GET Methods

        /// <summary>
        /// Reads back a synced membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product confirm the current CFR state for a local user.
        /// Request Flow: Client API GET -> UsersController.GetUser() -> IUserSyncService.GetUserAsync() -> Database.
        /// Validation Details: productOrgId is required to disambiguate a user across organizations.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserSyncService.GetUserAsync().
        /// Response Details: Standard API result enclosing UserSyncOutput, or NotFound.
        /// </remarks>
        /// <param name="externalUserId">The product's own user identifier.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <returns>A consistent API response containing the user.</returns>
        /// <response code="200">Successfully fetched the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_UserSync.GetUser)]
        public async Task<IActionResult> GetUser(string externalUserId, int productOrgId)
        {
            return ApiResultArgs(await service.GetUserAsync(externalUserId, productOrgId, HttpContext.TraceIdentifier), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
