// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing Acutis users.
    /// Handles listing, saving, and updating user status.
    /// Service Responsibility:
    /// - IUsersService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class UsersController(IUsersService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all Acutis users.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch registered Acutis user records.
        /// Request Flow: Client API GET -> UsersController.GetUsers() -> IUsersService.GetUsersListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.GetUsersListAsync().
        /// Response Details: Standard API result enclosing List of UsersOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the users dataset.</returns>
        /// <response code="200">Successfully fetched users list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetUsers)]
        public async Task<IActionResult> GetUsers()
        {
            return ApiResultArgs(await service.GetUsersListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one Acutis user by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a user for the edit page.
        /// Request Flow: Client API GET -> UsersController.GetUserById() -> IUsersService.GetUserByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.GetUserByIdAsync().
        /// Response Details: Standard API result enclosing UsersOutput with status 200 or 500.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>A consistent API response containing the user.</returns>
        /// <response code="200">Successfully fetched the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetUserById)]
        public async Task<IActionResult> GetUserById(int userId)
        {
            return ApiResultArgs(await service.GetUserByIdAsync(userId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves organization and role lookups for the Users form.
        /// </summary>
        /// <remarks>
        /// Purpose: Load dropdown data for add/edit user.
        /// Request Flow: Client API GET -> UsersController.GetUserLookups() -> IUsersService.GetUserLookupsAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.GetUserLookupsAsync().
        /// Response Details: Standard API result enclosing organization and role lists.
        /// </remarks>
        /// <returns>A consistent API response containing lookup lists.</returns>
        /// <response code="200">Successfully fetched lookups.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetUserLookups)]
        public async Task<IActionResult> GetUserLookups()
        {
            return ApiResultArgs(await service.GetUserLookupsAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves CFR users, one row per (member, organization) membership.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the CFR Admin "CFR User" page.
        /// Request Flow: Client API GET -> UsersController.GetCFRUsers() -> IUsersService.GetCFRUsersAsync() -> Database.
        /// Validation Details: Query parameter binding maps the optional organization identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.GetCFRUsersAsync().
        /// Response Details: Standard API result enclosing List of CFRUserOutput with status 200 or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier to scope the list to; omit or pass 0 for every organization.</param>
        /// <returns>A consistent API response containing the CFR users.</returns>
        /// <response code="200">Successfully fetched the CFR users.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetCFRUsers)]
        public async Task<IActionResult> GetCFRUsers(int? orgId, int? isAuth, string? productIds)
        {
            return ApiResultArgs(await service.GetCFRUsersAsync(orgId, isAuth, productIds), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new or existing Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Add or update an Acutis user.
        /// Request Flow: Client API POST -> UsersController.SaveUser() -> IUsersService.SaveUserAsync() -> Database.
        /// Validation Details: Model binding maps UsersInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.SaveUserAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveUser)]
        public async Task<IActionResult> SaveUser([FromBody] UsersInput input)
        {
            return ApiResultArgs(await service.SaveUserAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis user status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a user.
        /// Request Flow: Client API PUT -> UsersController.UpdateUserStatus() -> IUsersService.UpdateUserStatusAsync() -> Database.
        /// Validation Details: Model binding maps UserStatusInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.UpdateUserStatusAsync().
        /// Response Details: Standard API result representing the update outcome.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully updated the user status.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Administration.UpdateUserStatus)]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UserStatusInput input)
        {
            return ApiResultArgs(await service.UpdateUserStatusAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Removes an Acutis user by its identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Soft-delete a user.
        /// Request Flow: Client API DELETE -> UsersController.DeleteUser() -> IUsersService.DeleteUserAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IUsersService.DeleteUserAsync().
        /// Response Details: Standard API result representing the deletion outcome.
        /// </remarks>
        /// <param name="userId">Identifier of the user to delete.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully deleted the user.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Administration.DeleteUser)]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            return ApiResultArgs(await service.DeleteUserAsync(userId), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods
    }
}
