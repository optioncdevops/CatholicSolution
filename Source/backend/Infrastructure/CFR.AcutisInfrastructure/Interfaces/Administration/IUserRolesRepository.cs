// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Acutis User Roles database operations.
    /// Repository Responsibility:
    /// - Declares SELECT, INSERT, UPDATE, and DELETE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IUserRolesRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis roles.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the role catalog.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.GetUserRolesListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 4.
        /// Response Details: Returns a list of UserRolesOutput records.
        /// </remarks>
        /// <returns>A list of role output records.</returns>
        Task<List<UserRolesOutput>> GetUserRolesListAsync();

        /// <summary>
        /// Retrieves one Acutis role by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a role for the edit form.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.GetUserRoleByIdAsync() -> SQL Database.
        /// Validation Details: RoleId parameter mapping.
        /// Business Logic: Directly retrieves the matching row.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 3.
        /// Response Details: Returns a UserRolesOutput record or null.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>The matching role, or null when not found.</returns>
        Task<UserRolesOutput?> GetUserRoleByIdAsync(int roleId);

        /// <summary>
        /// Retrieves the signed-in user's own AccessRight for the User Roles admin page.
        /// </summary>
        /// <remarks>
        /// Purpose: Server-side authorization check ahead of a mutation.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.GetCurrentUserAccessRightAsync() -> SQL Database.
        /// Validation Details: Keyed by ICurrentUserService.RoleId and this feature's fixed RoutingUrl.
        /// Business Logic: Directly retrieves the resolved AccessRight.
        /// Repository Interaction: Executes StoredProc.Administration.GetFeatureAccessRight.
        /// Response Details: Returns 0 (Denied), 1 (Access), or 2 (Read Only).
        /// </remarks>
        /// <returns>The caller's AccessRight for the User Roles admin page.</returns>
        Task<int> GetCurrentUserAccessRightAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts or updates an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Add or update a role row.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.SaveUserRoleAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds UserRolesInput and executes the save stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 1.
        /// Response Details: Returns the new or existing RoleId, or -99 when the name already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing role fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        Task<int> SaveUserRoleAsync(UserRolesInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis role status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a role.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.UpdateUserRoleStatusAsync() -> SQL Database.
        /// Validation Details: RoleId and Status parameter mapping.
        /// Business Logic: Executes the status update stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 2.
        /// Response Details: Returns the RoleId when the update succeeded.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated role identifier.</returns>
        Task<int> UpdateUserRoleStatusAsync(UserRoleStatusInput input);

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a role that is not assigned to users.
        /// Request Flow: IUserRolesService -> IUserRolesRepository.DeleteUserRoleAsync() -> SQL Database.
        /// Validation Details: RoleId parameter mapping.
        /// Business Logic: Executes the delete stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 5.
        /// Response Details: Returns the RoleId, or -98 when the role is assigned to users.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>Scalar result of the delete stored procedure.</returns>
        Task<int> DeleteUserRoleAsync(int roleId);

        #endregion DELETE Methods
    }
}
