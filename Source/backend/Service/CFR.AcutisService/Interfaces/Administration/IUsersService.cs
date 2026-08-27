// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Acutis Users operations.
    /// Acts as the business-logic layer between UsersController and IUsersRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, and update Acutis users.
    /// - Relies on IUsersRepository for stored procedure execution.
    /// </summary>
    public interface IUsersService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis users.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the users list.
        /// Request Flow: UsersController -> IUsersService.GetUsersListAsync() -> IUsersRepository.GetUsersListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUsersListAsync().
        /// Response Details: MSResultArgs containing List of UsersOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the users list.</returns>
        Task<MSResultArgs> GetUsersListAsync();

        /// <summary>
        /// Retrieves one Acutis user by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a user for the detail page.
        /// Request Flow: UsersController -> IUsersService.GetUserByIdAsync() -> IUsersRepository.GetUserByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUserByIdAsync().
        /// Response Details: MSResultArgs containing UsersOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>MSResultArgs containing the user.</returns>
        Task<MSResultArgs> GetUserByIdAsync(int userId);

        /// <summary>
        /// Retrieves organization and role lookups for the Users form.
        /// </summary>
        /// <remarks>
        /// Purpose: Load dropdown data for add/edit user.
        /// Request Flow: UsersController -> IUsersService.GetUserLookupsAsync() -> IUsersRepository.GetUserLookupsAsync().
        /// Validation Details: Service checks for empty lookup lists.
        /// Business Logic: Wraps UserLookupOutput in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUserLookupsAsync().
        /// Response Details: MSResultArgs containing organizations and roles.
        /// </remarks>
        /// <returns>MSResultArgs containing lookup lists.</returns>
        Task<MSResultArgs> GetUserLookupsAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a user.
        /// Request Flow: UsersController -> IUsersService.SaveUserAsync() -> IUsersRepository.SaveUserAsync().
        /// Validation Details: Input DTO is required; duplicate email is rejected.
        /// Business Logic: Passes the plain password to SQL, which encrypts it with dbo.EncryptUserPassword.
        /// Repository Interaction: Calls IUsersRepository.SaveUserAsync().
        /// Response Details: MSResultArgs containing the user identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveUserAsync(UsersInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis user status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a user.
        /// Request Flow: UsersController -> IUsersService.UpdateUserStatusAsync() -> IUsersRepository.UpdateUserStatusAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates the status update to the repository and wraps the result.
        /// Repository Interaction: Calls IUsersRepository.UpdateUserStatusAsync().
        /// Response Details: MSResultArgs containing the user identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        Task<MSResultArgs> UpdateUserStatusAsync(UserStatusInput input);

        #endregion PUT Methods
    }
}
