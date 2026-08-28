// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Acutis User Roles operations.
    /// Acts as the business-logic layer between UserRolesController and IUserRolesRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, update, and delete Acutis roles.
    /// - Relies on IUserRolesRepository for stored procedure execution.
    /// </summary>
    public interface IUserRolesService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis roles.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the role catalog.
        /// Request Flow: UserRolesController -> IUserRolesService.GetUserRolesListAsync() -> IUserRolesRepository.GetUserRolesListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IUserRolesRepository.GetUserRolesListAsync().
        /// Response Details: MSResultArgs containing List of UserRolesOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the roles list.</returns>
        Task<MSResultArgs> GetUserRolesListAsync();

        /// <summary>
        /// Retrieves one Acutis role by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a role for the edit form.
        /// Request Flow: UserRolesController -> IUserRolesService.GetUserRoleByIdAsync() -> IUserRolesRepository.GetUserRoleByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IUserRolesRepository.GetUserRoleByIdAsync().
        /// Response Details: MSResultArgs containing UserRolesOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>MSResultArgs containing the role.</returns>
        Task<MSResultArgs> GetUserRoleByIdAsync(int roleId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a role.
        /// Request Flow: UserRolesController -> IUserRolesService.SaveUserRoleAsync() -> IUserRolesRepository.SaveUserRoleAsync().
        /// Validation Details: Input DTO is required; duplicate role name is rejected.
        /// Business Logic: Passes UserRolesInput to the repository and wraps the scalar result.
        /// Repository Interaction: Calls IUserRolesRepository.SaveUserRoleAsync().
        /// Response Details: MSResultArgs containing the role identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing role fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveUserRoleAsync(UserRolesInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis role status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a role.
        /// Request Flow: UserRolesController -> IUserRolesService.UpdateUserRoleStatusAsync() -> IUserRolesRepository.UpdateUserRoleStatusAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates the status update to the repository and wraps the result.
        /// Repository Interaction: Calls IUserRolesRepository.UpdateUserRoleStatusAsync().
        /// Response Details: MSResultArgs containing the role identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        Task<MSResultArgs> UpdateUserRoleStatusAsync(UserRoleStatusInput input);

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a role that is not assigned to users.
        /// Request Flow: UserRolesController -> IUserRolesService.DeleteUserRoleAsync() -> IUserRolesRepository.DeleteUserRoleAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates delete to the repository and wraps the scalar result.
        /// Repository Interaction: Calls IUserRolesRepository.DeleteUserRoleAsync().
        /// Response Details: MSResultArgs containing the deletion outcome, or Conflict when in use.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>MSResultArgs containing the deletion outcome.</returns>
        Task<MSResultArgs> DeleteUserRoleAsync(int roleId);

        #endregion DELETE Methods
    }
}
