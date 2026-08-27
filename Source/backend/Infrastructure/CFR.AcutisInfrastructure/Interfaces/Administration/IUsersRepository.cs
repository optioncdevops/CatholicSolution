// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Acutis Users database operations.
    /// Repository Responsibility:
    /// - Declares SELECT, INSERT, and UPDATE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IUsersRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis users.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the users list.
        /// Request Flow: IUsersService -> IUsersRepository.GetUsersListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 4.
        /// Response Details: Returns a list of UsersOutput records.
        /// </remarks>
        /// <returns>A list of user output records.</returns>
        Task<List<UsersOutput>> GetUsersListAsync();

        /// <summary>
        /// Retrieves one Acutis user by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a user for the detail page.
        /// Request Flow: IUsersService -> IUsersRepository.GetUserByIdAsync() -> SQL Database.
        /// Validation Details: UserId parameter mapping.
        /// Business Logic: Directly retrieves the matching row.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 3.
        /// Response Details: Returns a UsersOutput record or null.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>The matching user, or null when not found.</returns>
        Task<UsersOutput?> GetUserByIdAsync(int userId);

        /// <summary>
        /// Retrieves organization and role lookups for the Users form.
        /// </summary>
        /// <remarks>
        /// Purpose: Load dropdown data for add/edit user.
        /// Request Flow: IUsersService -> IUsersRepository.GetUserLookupsAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Maps two result sets into UserLookupOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 5.
        /// Response Details: Returns organizations and roles.
        /// </remarks>
        /// <returns>Lookup lists for organizations and roles.</returns>
        Task<UserLookupOutput> GetUserLookupsAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts or updates an Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Add or update a user row.
        /// Request Flow: IUsersService -> IUsersRepository.SaveUserAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds UsersInput plus the plain password and executes the save stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 1.
        /// Response Details: Returns the new or existing UserId, or -99 when the email already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <param name="password">Plain password, or null to keep the existing password on update.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        Task<int> SaveUserAsync(UsersInput input, string? password);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis user status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a user.
        /// Request Flow: IUsersService -> IUsersRepository.UpdateUserStatusAsync() -> SQL Database.
        /// Validation Details: UserId and Status parameter mapping.
        /// Business Logic: Executes the status update stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 2.
        /// Response Details: Returns the UserId when the update succeeded.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated user identifier.</returns>
        Task<int> UpdateUserStatusAsync(UserStatusInput input);

        #endregion PUT Methods
    }
}
