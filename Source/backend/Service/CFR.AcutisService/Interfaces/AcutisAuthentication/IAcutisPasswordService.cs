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
    }
}
