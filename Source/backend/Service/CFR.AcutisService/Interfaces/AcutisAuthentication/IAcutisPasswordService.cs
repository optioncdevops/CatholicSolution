// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.AcutisAuthentication
{
    /// <summary>
    /// Service contract for Acutis forgot/reset password operations.
    /// Acts as the business-logic layer between AcutisPasswordController and IAcutisPasswordRepository.
    /// Responsibility:
    /// - Declares methods to request a password reset email and to complete a reset with a token.
    /// - Relies on IAcutisPasswordRepository for stored procedure execution and ISMTPMailService to deliver the reset email.
    /// </summary>
    public interface IAcutisPasswordService
    {
        #region POST Methods

        /// <summary>
        /// Requests a password reset email for the given account.
        /// </summary>
        /// <remarks>
        /// Purpose: Issue a time-limited reset token and email it to the account owner.
        /// Request Flow: AcutisPasswordController -> IAcutisPasswordService.ForgotPasswordAsync() -> IAcutisPasswordRepository.RequestResetAsync().
        /// Validation Details: UserName (email) is required.
        /// Business Logic: Generates a random token, hashes it, persists the hash, and emails the raw token as a reset link.
        /// Repository Interaction: Calls IAcutisPasswordRepository.RequestResetAsync().
        /// Response Details: MSResultArgs confirming the email was sent, NotFound when no active account matches the email, or BadRequest / InternalServerError.
        /// </remarks>
        /// <param name="input">Input DTO containing the account email address.</param>
        /// <returns>MSResultArgs containing the confirmation result.</returns>
        Task<MSResultArgs> ForgotPasswordAsync(ForgotPasswordInput input);

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Completes a password reset using a previously issued token.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate the reset token and set the new password.
        /// Request Flow: AcutisPasswordController -> IAcutisPasswordService.ResetPasswordAsync() -> IAcutisPasswordRepository.ResetPasswordAsync().
        /// Validation Details: Token and new password are required; new password must match confirmation and meet the minimum strength rule.
        /// Business Logic: Hashes the supplied token and delegates validation and the password update to the repository.
        /// Repository Interaction: Calls IAcutisPasswordRepository.ResetPasswordAsync().
        /// Response Details: MSResultArgs indicating success, or BadRequest when the token is invalid, expired, or the passwords do not meet the rules.
        /// </remarks>
        /// <param name="input">Input DTO containing the token and new password.</param>
        /// <returns>MSResultArgs containing the reset outcome.</returns>
        Task<MSResultArgs> ResetPasswordAsync(ResetPasswordInput input);

        #endregion PUT Methods

        #region GET Methods

        /// <summary>
        /// Checks a reset token's validity and returns which account it belongs to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Reset Password page confirm and display the account being reset before
        /// the visitor submits a new password, and reject an already-used/expired link immediately.
        /// Request Flow: AcutisPasswordController -> IAcutisPasswordService.ValidateResetTokenAsync() -> IAcutisPasswordRepository.ValidateResetTokenAsync().
        /// Validation Details: Token is required.
        /// Business Logic: Hashes the supplied token and delegates the read-only lookup to the repository.
        /// Repository Interaction: Calls IAcutisPasswordRepository.ValidateResetTokenAsync().
        /// Response Details: MSResultArgs containing the account's email/first name, or BadRequest with a specific already-used/expired/invalid message.
        /// </remarks>
        /// <param name="token">Raw reset token from the reset link.</param>
        /// <returns>MSResultArgs containing the token check outcome.</returns>
        Task<MSResultArgs> ValidateResetTokenAsync(string token);

        #endregion GET Methods
    }
}
