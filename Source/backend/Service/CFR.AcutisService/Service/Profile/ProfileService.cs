// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Profile
{
    /// <summary>
    /// Implements self-service profile and change-password business logic for the signed-in user.
    /// Repository Responsibility:
    /// - Invokes IProfileRepository for stored procedure execution.
    /// </summary>
    /// <remarks>
    /// [Authorize] alone does not reject an unauthenticated request in this codebase today (see
    /// DisableAuthenticationPolicyEvaluator) — ICurrentUserService.UserId is only populated from a
    /// valid JWT by ClientInfoMiddleware, so every method here treats UserId &lt;= 0 as unauthenticated
    /// and rejects it explicitly, rather than trusting the controller's [Authorize] attribute alone.
    /// </remarks>
    public class ProfileService(
        IProfileRepository repository,
        ICurrentUserService currentUserService,
        ILogger<ProfileService> logger): IProfileService
    {
        private const int MinimumPasswordLength = 8;

        #region GET Methods

        /// <summary>
        /// Retrieves the signed-in user's own profile.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch profile fields for the account menu's Profile dialog.
        /// Request Flow: ProfileController -> ProfileService.GetProfileAsync() -> IProfileRepository.GetProfileAsync().
        /// Validation Details: Rejects the request when no signed-in user id is available.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IProfileRepository.GetProfileAsync().
        /// Response Details: MSResultArgs containing ProfileOutput, or UnAuthorized / NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the profile.</returns>
        public async Task<MSResultArgs> GetProfileAsync()
        {
            var result = new MSResultArgs();
            try
            {
                if (currentUserService.UserId <= 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                var data = await repository.GetProfileAsync(currentUserService.UserId);
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
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProfileFailed, currentUserService.UserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates the signed-in user's own profile fields.
        /// </summary>
        /// <remarks>
        /// Purpose: Save the account owner's name and email.
        /// Request Flow: ProfileController -> ProfileService.UpdateProfileAsync() -> IProfileRepository.UpdateProfileAsync().
        /// Validation Details: Input DTO is required; rejects the request when no signed-in user id is available.
        /// Business Logic: Delegates the save to the repository and wraps the result.
        /// Repository Interaction: Calls IProfileRepository.UpdateProfileAsync().
        /// Response Details: MSResultArgs indicating success, UnAuthorized, or Conflict when the email is already in use.
        /// </remarks>
        /// <param name="input">Input DTO containing the new profile fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> UpdateProfileAsync(UpdateProfileInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (currentUserService.UserId <= 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                if (input == null || string.IsNullOrWhiteSpace(input.FirstName) || string.IsNullOrWhiteSpace(input.LastName) || string.IsNullOrWhiteSpace(input.Email))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int updatedId = await repository.UpdateProfileAsync(currentUserService.UserId, input);
                if (updatedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistUser;
                    return result;
                }

                result.StatusMessage = ErrorMessages.ProfileUpdated;
                result.ResultData = updatedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateProfileFailed, currentUserService.UserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Changes the signed-in user's own password after verifying the current one.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the account owner set a new password.
        /// Request Flow: ProfileController -> ProfileService.ChangePasswordAsync() -> IProfileRepository.ChangePasswordAsync().
        /// Validation Details: All three fields are required; new password must match confirmation and meet the minimum length rule; rejects the request when no signed-in user id is available.
        /// Business Logic: Delegates verification and the password update to the repository.
        /// Repository Interaction: Calls IProfileRepository.ChangePasswordAsync().
        /// Response Details: MSResultArgs indicating success, UnAuthorized, or BadRequest when the current password does not match or the new passwords are invalid.
        /// </remarks>
        /// <param name="input">Input DTO containing the current and new password.</param>
        /// <returns>MSResultArgs containing the change outcome.</returns>
        public async Task<MSResultArgs> ChangePasswordAsync(ChangePasswordInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (currentUserService.UserId <= 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                if (input == null || string.IsNullOrWhiteSpace(input.CurrentPassword) || string.IsNullOrWhiteSpace(input.NewPassword))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (input.NewPassword.Length < MinimumPasswordLength || !string.Equals(input.NewPassword, input.ConfirmPassword, StringComparison.Ordinal))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.PasswordMismatch;
                    return result;
                }

                int updatedId = await repository.ChangePasswordAsync(currentUserService.UserId, input.CurrentPassword, input.NewPassword);
                if (updatedId == -98)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.InvalidCurrentPassword;
                    return result;
                }

                result.StatusMessage = ErrorMessages.PasswordChanged;
                result.ResultData = updatedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.ChangePasswordFailed, currentUserService.UserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods
    }
}
