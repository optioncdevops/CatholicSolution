// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Acutis User Roles business logic for list, get, save, status, and delete.
    /// Repository Responsibility:
    /// - Invokes IUserRolesRepository for stored procedure execution.
    /// </summary>
    public class UserRolesService(IUserRolesRepository repository, ILogger<UserRolesService> logger): IUserRolesService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all Acutis roles.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the role catalog.
        /// Request Flow: UserRolesController -> UserRolesService.GetUserRolesListAsync() -> IUserRolesRepository.GetUserRolesListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IUserRolesRepository.GetUserRolesListAsync().
        /// Response Details: MSResultArgs containing List of UserRolesOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the roles list.</returns>
        public async Task<MSResultArgs> GetUserRolesListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetUserRolesListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUserRolesFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one Acutis role by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a role for the edit form.
        /// Request Flow: UserRolesController -> UserRolesService.GetUserRoleByIdAsync() -> IUserRolesRepository.GetUserRoleByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IUserRolesRepository.GetUserRoleByIdAsync().
        /// Response Details: MSResultArgs containing UserRolesOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>MSResultArgs containing the role.</returns>
        public async Task<MSResultArgs> GetUserRoleByIdAsync(int roleId)
        {
            var result = new MSResultArgs();
            try
            {
                if (roleId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetUserRoleByIdAsync(roleId);
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
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUserRoleByIdFailed, roleId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        /// <summary>
        /// Confirms the signed-in user's own role has write (Access) rights to the User Roles
        /// admin page before a mutation proceeds.
        /// </summary>
        /// <remarks>
        /// [Authorize] on the controller only confirms the request is authenticated - any signed-in
        /// user, regardless of role, would otherwise be able to add/edit/deactivate/delete roles.
        /// This re-checks auth.ModuleRights fresh on every mutating request (not from the JWT,
        /// which only carries RoleId - see Acutis_GetFeatureAccessRight) rather than trusting the
        /// client's own cached copy from login, since a stale or tampered client value must not be
        /// able to bypass this.
        /// </remarks>
        /// <param name="result">The in-progress result to populate with Forbidden when access is denied.</param>
        /// <returns>Whether the caller may proceed with the mutation.</returns>
        private async Task<bool> EnsureCurrentUserCanMutateRolesAsync(MSResultArgs result)
        {
            const int AccessRightAccess = 1;
            int accessRight = await repository.GetCurrentUserAccessRightAsync();
            if (accessRight == AccessRightAccess)
            {
                return true;
            }

            result.StatusCode = ErrorCodes.Forbidden;
            result.StatusMessage = ErrorMessages.InsufficientRoleRights;
            return false;
        }

        #region POST Methods

        /// <summary>
        /// Adds or updates an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a role.
        /// Request Flow: UserRolesController -> UserRolesService.SaveUserRoleAsync() -> IUserRolesRepository.SaveUserRoleAsync().
        /// Validation Details: Input DTO is required; duplicate role name is rejected.
        /// Business Logic: Passes UserRolesInput to the repository and wraps the scalar result.
        /// Repository Interaction: Calls IUserRolesRepository.SaveUserRoleAsync().
        /// Response Details: MSResultArgs containing the role identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing role fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveUserRoleAsync(UserRolesInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.RoleName))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (!await EnsureCurrentUserCanMutateRolesAsync(result))
                {
                    return result;
                }

                int savedId = await repository.SaveUserRoleAsync(input);
                if (savedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistRole;
                    return result;
                }

                if (savedId == -96)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.RoleNotFound;
                    return result;
                }

                result.ResultData = savedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveUserRoleFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an Acutis role status.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate a role.
        /// Request Flow: UserRolesController -> UserRolesService.UpdateUserRoleStatusAsync() -> IUserRolesRepository.UpdateUserRoleStatusAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates the status update to the repository and wraps the result.
        /// Repository Interaction: Calls IUserRolesRepository.UpdateUserRoleStatusAsync().
        /// Response Details: MSResultArgs containing the role identifier, or Conflict when deactivating an in-use role.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        public async Task<MSResultArgs> UpdateUserRoleStatusAsync(UserRoleStatusInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.RoleId <= 0 || string.IsNullOrWhiteSpace(input.Status))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (!await EnsureCurrentUserCanMutateRolesAsync(result))
                {
                    return result;
                }

                int updatedId = await repository.UpdateUserRoleStatusAsync(input);
                if (updatedId == -98)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.RoleInUse;
                    return result;
                }

                if (updatedId == -96)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.RoleNotFound;
                    return result;
                }

                result.ResultData = updatedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateUserRoleStatusFailed, input?.RoleId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes an Acutis role.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a role that is not assigned to users.
        /// Request Flow: UserRolesController -> UserRolesService.DeleteUserRoleAsync() -> IUserRolesRepository.DeleteUserRoleAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates delete to the repository and wraps the scalar result.
        /// Repository Interaction: Calls IUserRolesRepository.DeleteUserRoleAsync().
        /// Response Details: MSResultArgs containing the deletion outcome, or Conflict when in use.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>MSResultArgs containing the deletion outcome.</returns>
        public async Task<MSResultArgs> DeleteUserRoleAsync(int roleId)
        {
            var result = new MSResultArgs();
            try
            {
                if (roleId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (!await EnsureCurrentUserCanMutateRolesAsync(result))
                {
                    return result;
                }

                int deletedId = await repository.DeleteUserRoleAsync(roleId);
                if (deletedId == -98)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.RoleInUse;
                    return result;
                }

                if (deletedId == -96)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.RoleNotFound;
                    return result;
                }

                result.ResultData = deletedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.DeleteUserRoleFailed, roleId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion DELETE Methods
    }
}
