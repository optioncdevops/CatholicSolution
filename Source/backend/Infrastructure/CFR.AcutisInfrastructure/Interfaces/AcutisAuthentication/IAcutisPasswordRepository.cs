// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication
{
    /// <summary>
    /// Repository interface for Acutis forgot/reset password database operations.
    /// Repository Responsibility:
    /// - Declares stored procedure calls against SQL Server for password reset tokens.
    /// </summary>
    public interface IAcutisPasswordRepository
    {
        #region POST Methods

        /// <summary>
        /// Stores a password reset token for the user matching the given email.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist a hashed, time-limited reset token for a forgot-password request.
        /// Request Flow: IAcutisPasswordService -> AcutisPasswordRepository.RequestResetAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.AcutisAuth.PasswordResetCrud with ActionId 1; invalidates prior tokens for the user.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.PasswordResetCrud.
        /// Response Details: Returns the matched user's identity, or null when no active account matches the email.
        /// </remarks>
        /// <param name="email">Account email address.</param>
        /// <param name="tokenHash">SHA-256 hash of the raw reset token.</param>
        /// <param name="expiresAtUtc">UTC expiry for the token.</param>
        /// <returns>The matched user's identity, or null when not found.</returns>
        Task<ForgotPasswordUserResult?> RequestResetAsync(string email, string tokenHash, DateTime expiresAtUtc);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Validates a reset token and updates the user's password.
        /// </summary>
        /// <remarks>
        /// Purpose: Complete a password reset.
        /// Request Flow: IAcutisPasswordService -> AcutisPasswordRepository.ResetPasswordAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.AcutisAuth.PasswordResetCrud with ActionId 2; SQL encrypts the new password with dbo.EncryptUserPassword.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.PasswordResetCrud.
        /// Response Details: Returns the updated user identifier, or -99 when the token is invalid or expired.
        /// </remarks>
        /// <param name="tokenHash">SHA-256 hash of the raw reset token supplied by the user.</param>
        /// <param name="newPassword">Plain-text new password; SQL encrypts it with dbo.EncryptUserPassword.</param>
        /// <returns>Scalar result of the reset stored procedure.</returns>
        Task<int> ResetPasswordAsync(string tokenHash, string newPassword);

        #endregion PUT Methods

        #region GET Methods

        /// <summary>
        /// Read-only check of a reset token's validity and the account it belongs to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Reset Password page show which account is being reset, and reject an
        /// already-used/expired link immediately, without consuming the token.
        /// Request Flow: IAcutisPasswordService -> AcutisPasswordRepository.ValidateResetTokenAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.AcutisAuth.PasswordResetCrud with ActionId 3.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.PasswordResetCrud.
        /// Response Details: Returns the matched user's identity and 1 when valid, or no row and -2/-3/-99 when already used, expired, or not found.
        /// </remarks>
        /// <param name="tokenHash">SHA-256 hash of the raw reset token supplied by the user.</param>
        /// <returns>Return value and the matched user's identity, when valid.</returns>
        Task<(int ReturnValue, ForgotPasswordUserResult? User)> ValidateResetTokenAsync(string tokenHash);

        #endregion GET Methods
    }
}
