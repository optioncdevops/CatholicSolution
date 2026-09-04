// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace CFR.AcutisService.Service.AcutisAuthentication
{
    /// <summary>
    /// Implements Acutis forgot/reset password business logic: token issuance, email delivery, and password reset.
    /// Repository Responsibility:
    /// - Invokes IAcutisPasswordRepository to persist reset tokens and update the password.
    /// - Invokes IEmailTemplatesRepository to load the admin-configurable "PasswordReset" email content.
    /// </summary>
    public class AcutisPasswordService(
        IAcutisPasswordRepository repository,
        IEmailTemplatesRepository emailTemplatesRepository,
        ISMTPMailService mailService,
        IConfiguration configuration,
        ILogger<AcutisPasswordService> logger): IAcutisPasswordService
    {
        private const int TokenLifetimeMinutes = 30;
        private const int MinimumPasswordLength = 8;
        private const string PasswordResetTemplateCode = "PasswordReset";

        #region POST Methods

        /// <summary>
        /// Requests a password reset email for the given account.
        /// </summary>
        /// <remarks>
        /// Purpose: Issue a time-limited reset token and email it to the account owner.
        /// Request Flow: AcutisPasswordController -> AcutisPasswordService.ForgotPasswordAsync() -> IAcutisPasswordRepository.RequestResetAsync().
        /// Validation Details: Rejects a missing or empty UserName.
        /// Business Logic: Generates a random token, hashes it, persists the hash, and emails the raw token as a reset link. Returns NotFound when no active, unlocked account matches the email (this internal admin endpoint deliberately reveals account existence).
        /// Repository Interaction: Calls IAcutisPasswordRepository.RequestResetAsync().
        /// Response Details: MSResultArgs confirming the email was sent, NotFound, or BadRequest / InternalServerError.
        /// </remarks>
        /// <param name="input">Input DTO containing the account email address.</param>
        /// <returns>MSResultArgs containing the confirmation result.</returns>
        public async Task<MSResultArgs> ForgotPasswordAsync(ForgotPasswordInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.UserName))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string rawToken = GenerateToken();
                string tokenHash = HashToken(rawToken);
                DateTime expiresAtUtc = DateTime.UtcNow.AddMinutes(TokenLifetimeMinutes);

                var user = await repository.RequestResetAsync(input.UserName.Trim(), tokenHash, expiresAtUtc);
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.AccountNotFound;
                    return result;
                }

                await SendResetEmailAsync(user, rawToken);

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.ResetInstructionsSent;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.ForgotPasswordFailed, input?.UserName);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Completes a password reset using a previously issued token.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate the reset token and set the new password.
        /// Request Flow: AcutisPasswordController -> AcutisPasswordService.ResetPasswordAsync() -> IAcutisPasswordRepository.ResetPasswordAsync().
        /// Validation Details: Token and new password are required; new password must match confirmation and meet the minimum length rule.
        /// Business Logic: Hashes the supplied token and delegates validation and the password update to the repository.
        /// Repository Interaction: Calls IAcutisPasswordRepository.ResetPasswordAsync().
        /// Response Details: MSResultArgs indicating success, or BadRequest when the token is invalid, expired, or the passwords do not meet the rules.
        /// </remarks>
        /// <param name="input">Input DTO containing the token and new password.</param>
        /// <returns>MSResultArgs containing the reset outcome.</returns>
        public async Task<MSResultArgs> ResetPasswordAsync(ResetPasswordInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.Token) || string.IsNullOrWhiteSpace(input.NewPassword))
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

                string tokenHash = HashToken(input.Token.Trim());
                int userId = await repository.ResetPasswordAsync(tokenHash, input.NewPassword);
                if (userId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.InvalidResetToken;
                    return result;
                }

                result.ResultData = userId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.ResetPasswordFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region Private Helper Methods

        /// <summary>
        /// Generates a cryptographically random 256-bit reset token, hex-encoded.
        /// </summary>
        private static string GenerateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        /// <summary>
        /// Hashes a raw reset token with SHA-256 so only the hash is ever persisted.
        /// </summary>
        private static string HashToken(string rawToken) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        /// <summary>
        /// Emails the raw reset link to the matched user, using the configured CFR Admin base URL and the
        /// admin-configurable "PasswordReset" email template (falls back to a built-in default when no
        /// active template row exists, so a missing/deleted template never blocks the reset flow).
        /// </summary>
        private async Task SendResetEmailAsync(ForgotPasswordUserResult user, string rawToken)
        {
            string baseUrl = (configuration["FrontendSetting:CfrAdminBaseUrl"] ?? string.Empty).TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                logger.LogWarning("FrontendSetting:CfrAdminBaseUrl is not configured; skipped sending the password reset email for user {UserId}.", user.UserId);
                return;
            }

            string resetLink = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}&email={Uri.EscapeDataString(user.Email ?? string.Empty)}";
            var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(PasswordResetTemplateCode);
            var placeholders = new Dictionary<string, string>
            {
                ["FirstName"] = user.FirstName ?? string.Empty,
                ["ResetLink"] = resetLink,
                ["ExpiryMinutes"] = TokenLifetimeMinutes.ToString(),
                ["AccentColor"] = string.IsNullOrWhiteSpace(template?.AccentColor) ? "#1d4ed8" : template.AccentColor,
            };

            string subject = template?.Subject ?? "Reset your Catholic Solutions password";
            // Fallback kept in sync with the PasswordReset seed in 006_Acutis_EmailTemplates.sql —
            // this only fires when the admin-configurable template row is missing entirely.
            string body = template?.Body
                ?? "<div style=\"font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;\"><p style=\"margin:0 0 4px;font-size:13px;color:#64748b;\">Hi [FirstName],</p><p style=\"margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;\">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style=\"text-align:center;margin:0 0 26px;\"><a href=\"[ResetLink]\" style=\"display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;\">Reset Password</a></div><div style=\"background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;\"><p style=\"margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;\">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style=\"margin:0 0 4px;font-size:12px;color:#94a3b8;\">If the button above doesn't work, copy and paste this link into your browser:</p><p style=\"margin:0;font-size:12px;word-break:break-all;\"><a href=\"[ResetLink]\" style=\"color:[AccentColor];\">[ResetLink]</a></p></div>";

            string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
            string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
            _ = await mailService.SendMailAsync(mergedSubject, mergedBody, user.Email ?? string.Empty, templateLogoUrl: template?.LogoUrl, fontFamily: template?.FontFamily, baseFontSize: template?.BaseFontSize);
        }

        #endregion Private Helper Methods
    }
}
