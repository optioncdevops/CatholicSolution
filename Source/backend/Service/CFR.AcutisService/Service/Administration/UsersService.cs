// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Acutis Users business logic for list, get, save, and status updates.
    /// Repository Responsibility:
    /// - Invokes IUsersRepository for stored procedure execution.
    /// </summary>
    public class UsersService(IUsersRepository repository, ICurrentUserService currentUserService, ILogger<UsersService> logger): IUsersService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis users.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the users list.
        /// Request Flow: UsersController -> UsersService.GetUsersListAsync() -> IUsersRepository.GetUsersListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUsersListAsync().
        /// Response Details: MSResultArgs containing List of UsersOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the users list.</returns>
        public async Task<MSResultArgs> GetUsersListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetUsersListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUsersFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one Acutis user by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a user for the edit page.
        /// Request Flow: UsersController -> UsersService.GetUserByIdAsync() -> IUsersRepository.GetUserByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUserByIdAsync().
        /// Response Details: MSResultArgs containing UsersOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>MSResultArgs containing the user.</returns>
        public async Task<MSResultArgs> GetUserByIdAsync(int userId)
        {
            var result = new MSResultArgs();
            try
            {
                if (userId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetUserByIdAsync(userId);
                if (data == null)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUserByIdFailed, userId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves organization and role lookups for the Users form.
        /// </summary>
        /// <remarks>
        /// Purpose: Load dropdown data for add/edit user.
        /// Request Flow: UsersController -> UsersService.GetUserLookupsAsync() -> IUsersRepository.GetUserLookupsAsync().
        /// Validation Details: Service checks for empty lookup lists.
        /// Business Logic: Wraps UserLookupOutput in MSResultArgs.
        /// Repository Interaction: Calls IUsersRepository.GetUserLookupsAsync().
        /// Response Details: MSResultArgs containing organizations and roles.
        /// </remarks>
        /// <returns>MSResultArgs containing lookup lists.</returns>
        public async Task<MSResultArgs> GetUserLookupsAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetUserLookupsAsync();
                if (data == null || (data.Organizations.Count == 0 && data.Roles.Count == 0))
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUserLookupsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a user.
        /// Request Flow: UsersController -> UsersService.SaveUserAsync() -> IUsersRepository.SaveUserAsync().
        /// Validation Details: Input DTO is required; duplicate email is rejected.
        /// Business Logic: Passes the plain password to SQL, which encrypts it with dbo.EncryptUserPassword.
        /// Repository Interaction: Calls IUsersRepository.SaveUserAsync().
        /// Response Details: MSResultArgs containing the user identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveUserAsync(UsersInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.EMail))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (input.UserId == 0 && string.IsNullOrWhiteSpace(input.Password))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (!string.IsNullOrWhiteSpace(input.Password) && !PasswordPolicy.IsStrongEnough(input.Password))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.PasswordTooWeak;
                    return result;
                }

                if (input.UserId > 0 && currentUserService.UserId > 0 && input.UserId == currentUserService.UserId
                    && (input.IsActive == 0 || input.IsLocked == 1))
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.CannotModifySelfStatus;
                    return result;
                }

                int savedId = await repository.SaveUserAsync(input, string.IsNullOrWhiteSpace(input.Password) ? null : input.Password);
                if (savedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistUser;
                    return result;
                }

                result.ResultData = savedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveUserFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis user status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a user.
        /// Request Flow: UsersController -> UsersService.UpdateUserStatusAsync() -> IUsersRepository.UpdateUserStatusAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates the status update to the repository and wraps the result.
        /// Repository Interaction: Calls IUsersRepository.UpdateUserStatusAsync().
        /// Response Details: MSResultArgs containing the user identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        public async Task<MSResultArgs> UpdateUserStatusAsync(UserStatusInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.UserId <= 0 || (input.IsActive != 0 && input.IsActive != 1))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (input.IsActive == 0 && currentUserService.UserId > 0 && input.UserId == currentUserService.UserId)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.CannotModifySelfStatus;
                    return result;
                }

                result.ResultData = await repository.UpdateUserStatusAsync(input);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateUserStatusFailed, input?.UserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes an Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a user.
        /// Request Flow: UsersController -> UsersService.DeleteUserAsync() -> IUsersRepository.DeleteUserAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates delete to the repository and wraps the scalar result.
        /// Repository Interaction: Calls IUsersRepository.DeleteUserAsync().
        /// Response Details: MSResultArgs containing the deletion outcome.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>MSResultArgs containing the deletion outcome.</returns>
        public async Task<MSResultArgs> DeleteUserAsync(int userId)
        {
            var result = new MSResultArgs();
            try
            {
                if (userId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (currentUserService.UserId > 0 && userId == currentUserService.UserId)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.CannotDeleteSelf;
                    return result;
                }

                result.ResultData = await repository.DeleteUserAsync(userId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.DeleteUserFailed, userId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion DELETE Methods
    }
}
