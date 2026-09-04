// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Profile
{
    /// <summary>
    /// Repository interface for self-service profile and change-password database operations.
    /// Repository Responsibility:
    /// - Declares SELECT and UPDATE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IProfileRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the signed-in user's own profile.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch profile fields for the account menu's Profile dialog.
        /// Request Flow: IProfileService -> IProfileRepository.GetProfileAsync() -> SQL Database.
        /// Validation Details: UserId parameter mapping.
        /// Business Logic: Directly retrieves the row without manipulation.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud with ActionId 1.
        /// Response Details: Returns a ProfileOutput record, or null when not found.
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <returns>The matching profile, or null when not found.</returns>
        Task<ProfileOutput?> GetProfileAsync(long userId);

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates the signed-in user's own profile fields.
        /// </summary>
        /// <remarks>
        /// Purpose: Save the account owner's name and email.
        /// Request Flow: IProfileService -> IProfileRepository.UpdateProfileAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Profile.ProfileCrud with ActionId 2; SQL rejects a duplicate email owned by another user.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the user id, or -99 for a duplicate email).
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <param name="input">Input DTO containing the new profile fields.</param>
        /// <param name="profileImageUrl">The resolved profile image URL to save, or null.</param>
        /// <returns>Scalar result of the update stored procedure.</returns>
        Task<int> UpdateProfileAsync(long userId, UpdateProfileInput input, string? profileImageUrl);

        /// <summary>
        /// Changes the signed-in user's own password after verifying the current one.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the account owner set a new password.
        /// Request Flow: IProfileService -> IProfileRepository.ChangePasswordAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Profile.ProfileCrud with ActionId 3; SQL verifies the current password with dbo.DecryptUserPassword and encrypts the new one with dbo.EncryptUserPassword.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the user id, or -98 when the current password does not match).
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <param name="currentPassword">Current plain-text password.</param>
        /// <param name="newPassword">New plain-text password.</param>
        /// <returns>Scalar result of the change-password stored procedure.</returns>
        Task<int> ChangePasswordAsync(long userId, string currentPassword, string newPassword);

        #endregion PUT Methods
    }
}
