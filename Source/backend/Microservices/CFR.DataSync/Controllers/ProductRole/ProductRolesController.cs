// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSync.Controllers.ProductRole
{
    /// <summary>
    /// API controller for the per-product role catalog surface — lets a product register/rename
    /// its own opaque role ids and display names, and read that catalog back (e.g. to populate a
    /// role dropdown, or validate a roleId before pushing a user via UsersController).
    /// Service Responsibility:
    /// - IProductRoleService validates and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.SyncUserSync)]
    [Authorize]
    public class ProductRolesController(IProductRoleService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Creates a new role row for the calling product, or renames it if the RoleId already exists.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product register/rename one of its own role ids and display names.
        /// Request Flow: Client API POST -> ProductRolesController.UpsertProductRole() -> IProductRoleService.UpsertRoleAsync() -> Database.
        /// Validation Details: RoleId must be positive; RoleName is required.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRoleService.UpsertRoleAsync().
        /// Response Details: Standard API result enclosing ProductRoleOutput.
        /// </remarks>
        /// <param name="input">Input DTO containing the role id and display name.</param>
        /// <returns>A consistent API response containing the upserted role.</returns>
        /// <response code="200">Successfully upserted the role.</response>
        /// <response code="400">RoleId/RoleName failed validation.</response>
        /// <response code="401">Caller is not authenticated.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_ProductRole.UpsertProductRole)]
        public async Task<IActionResult> UpsertProductRole([FromBody] ProductRoleInput input)
        {
            return ApiResultArgs(await service.UpsertRoleAsync(input, HttpContext.TraceIdentifier), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Lists the active roles registered for the calling product.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product read back its own role catalog.
        /// Request Flow: Client API GET -> ProductRolesController.GetProductRoles() -> IProductRoleService.GetRolesAsync() -> Database.
        /// Validation Details: None — ProductId always comes from the authenticated ApiClient.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProductRoleService.GetRolesAsync().
        /// Response Details: Standard API result enclosing a List of ProductRoleOutput.
        /// </remarks>
        /// <returns>A consistent API response containing the product's active roles.</returns>
        /// <response code="200">Successfully fetched the roles.</response>
        /// <response code="401">Caller is not authenticated.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_ProductRole.GetProductRoles)]
        public async Task<IActionResult> GetProductRoles()
        {
            return ApiResultArgs(await service.GetRolesAsync(HttpContext.TraceIdentifier), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
