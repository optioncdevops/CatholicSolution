// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Profile
{
    /// <summary>
    /// Service contract for self-service profile and change-password operations.
    /// Acts as the business-logic layer between ProfileController and IProfileRepository.
    /// Responsibility:
    /// - Declares methods to fetch, update, and change the password of the signed-in user's own account.
    /// - Relies on ICurrentUserService for the signed-in user id and IProfileRepository for stored procedure execution.
    /// </summary>
    public interface IProfileService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the signed-in user's own profile.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch profile fields for the account menu's Profile dialog.
        /// Request Flow: ProfileController -> IProfileService.GetProfileAsync() -> IProfileRepository.GetProfileAsync().
        /// Validation Details: Rejects the request when no signed-in user id is available.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IProfileRepository.GetProfileAsync().
        /// Response Details: MSResultArgs containing ProfileOutput, or UnAuthorized / NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the profile.</returns>
        Task<MSResultArgs> GetProfileAsync();

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates the signed-in user's own profile fields.
        /// </summary>
        /// <remarks>
        /// Purpose: Save the account owner's name and email.
        /// Request Flow: ProfileController -> IProfileService.UpdateProfileAsync() -> IProfileRepository.UpdateProfileAsync().
        /// Validation Details: Input DTO is required; rejects the request when no signed-in user id is available.
        /// Business Logic: Delegates the save to the repository and wraps the result.
        /// Repository Interaction: Calls IProfileRepository.UpdateProfileAsync().
        /// Response Details: MSResultArgs indicating success, UnAuthorized, or Conflict when the email is already in use.
        /// </remarks>
        /// <param name="input">Input DTO containing the new profile fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> UpdateProfileAsync(UpdateProfileInput input);

        /// <summary>
        /// Changes the signed-in user's own password after verifying the current one.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the account owner set a new password.
        /// Request Flow: ProfileController -> IProfileService.ChangePasswordAsync() -> IProfileRepository.ChangePasswordAsync().
        /// Validation Details: All three fields are required; new password must match confirmation and meet the minimum length rule; rejects the request when no signed-in user id is available.
        /// Business Logic: Delegates verification and the password update to the repository.
        /// Repository Interaction: Calls IProfileRepository.ChangePasswordAsync().
        /// Response Details: MSResultArgs indicating success, UnAuthorized, or BadRequest when the current password does not match or the new passwords are invalid.
        /// </remarks>
        /// <param name="input">Input DTO containing the current and new password.</param>
        /// <returns>MSResultArgs containing the change outcome.</returns>
        Task<MSResultArgs> ChangePasswordAsync(ChangePasswordInput input);

        #endregion PUT Methods

        #region POST Methods

        /// <summary>
        /// Validates and saves an uploaded profile image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Store the signed-in user's profile image safely and return a relative accessible URL.
        /// Request Flow: ProfileController -> IProfileService.UploadProfileImageAsync() -> Storage.
        /// Validation Details: Rejects the request when no signed-in user id is available; file is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Generates a collision-proof filename and saves it to storage location.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the relative URL path (/uploads/profile/{fileName}).
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing the relative accessible URL path.</returns>
        Task<MSResultArgs> UploadProfileImageAsync(IFormFile file);

        #endregion POST Methods
    }
}
