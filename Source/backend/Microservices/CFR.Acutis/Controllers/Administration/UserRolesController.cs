// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing Acutis roles.
    /// Handles listing, saving, updating status, and deleting roles.
    /// Service Responsibility:
    /// - IUserRolesService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class UserRolesController(IUserRolesService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all Acutis roles.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch registered Acutis role records.
        /// Request Flow: Client API GET -> UserRolesController.GetUserRoles() -> IUserRolesService.GetUserRolesListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserRolesService.GetUserRolesListAsync().
        /// Response Details: Standard API result enclosing List of UserRolesOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the roles dataset.</returns>
        /// <response code="200">Successfully fetched roles list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetUserRoles)]
        public async Task<IActionResult> GetUserRoles()
        {
            return ApiResultArgs(await service.GetUserRolesListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one Acutis role by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a role for the edit form.
        /// Request Flow: Client API GET -> UserRolesController.GetUserRoleById() -> IUserRolesService.GetUserRoleByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserRolesService.GetUserRoleByIdAsync().
        /// Response Details: Standard API result enclosing UserRolesOutput with status 200 or 500.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>A consistent API response containing the role.</returns>
        /// <response code="200">Successfully fetched the role.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetUserRoleById)]
        public async Task<IActionResult> GetUserRoleById(int roleId)
        {
            return ApiResultArgs(await service.GetUserRoleByIdAsync(roleId), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new or existing Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Add or update an Acutis role.
        /// Request Flow: Client API POST -> UserRolesController.SaveUserRole() -> IUserRolesService.SaveUserRoleAsync() -> Database.
        /// Validation Details: Model binding maps UserRolesInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserRolesService.SaveUserRoleAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing role fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the role.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveUserRole)]
        public async Task<IActionResult> SaveUserRole([FromBody] UserRolesInput input)
        {
            return ApiResultArgs(await service.SaveUserRoleAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis role status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a role.
        /// Request Flow: Client API PUT -> UserRolesController.UpdateUserRoleStatus() -> IUserRolesService.UpdateUserRoleStatusAsync() -> Database.
        /// Validation Details: Model binding maps UserRoleStatusInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserRolesService.UpdateUserRoleStatusAsync().
        /// Response Details: Standard API result representing the update outcome.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully updated the role status.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Administration.UpdateUserRoleStatus)]
        public async Task<IActionResult> UpdateUserRoleStatus([FromBody] UserRoleStatusInput input)
        {
            return ApiResultArgs(await service.UpdateUserRoleStatusAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Removes an Acutis role by its identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a role that is not assigned to users.
        /// Request Flow: Client API DELETE -> UserRolesController.DeleteUserRole() -> IUserRolesService.DeleteUserRoleAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUserRolesService.DeleteUserRoleAsync().
        /// Response Details: Standard API result representing the deletion outcome.
        /// </remarks>
        /// <param name="roleId">Identifier of the role to delete.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully deleted the role.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Administration.DeleteUserRole)]
        public async Task<IActionResult> DeleteUserRole(int roleId)
        {
            return ApiResultArgs(await service.DeleteUserRoleAsync(roleId), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods
    }
}
