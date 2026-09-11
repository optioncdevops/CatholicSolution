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
        /// <summary>
        /// Fallback token lifetime, used only when the PasswordReset email template has no
        /// LinkExpiryMinutes configured (or it's out of range) — an admin can otherwise set this
        /// straight from the Email Templates editor.
        /// </summary>
        private const int DefaultTokenLifetimeMinutes = 15;
        private const int MinimumTokenLifetimeMinutes = 5;
        private const int MaximumTokenLifetimeMinutes = 1440;
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

                // Loaded once, up front, so the SAME resolved value both persists as the token's
                // real expiry below AND is what the email text tells the recipient — an admin
                // changing this in the Email Templates editor must actually change how long the
                // link works, not just what the email claims.
                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(PasswordResetTemplateCode);
                int lifetimeMinutes = ResolveTokenLifetimeMinutes(template);

                string rawToken = GenerateToken();
                string tokenHash = HashToken(rawToken);
                DateTime expiresAtUtc = DateTime.UtcNow.AddMinutes(lifetimeMinutes);

                var user = await repository.RequestResetAsync(input.UserName.Trim(), tokenHash, expiresAtUtc);
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.AccountNotFound;
                    return result;
                }

                if (user.RateLimited)
                {
                    // A previously issued link for this account is still unused and unexpired — no
                    // new token was persisted and no new email should go out; that still-active link
                    // remains the one to use. Reported as Success (not an error) since nothing
                    // actually went wrong from the caller's perspective, but resultData.alreadyRequested
                    // lets the frontend show this as informational rather than "a new email was sent."
                    result.StatusCode = ErrorCodes.Success;
                    result.StatusMessage = ErrorMessages.ResetAlreadyRequestedRecently;
                    result.ResultData = new { alreadyRequested = true };
                    return result;
                }

                bool emailSent = await SendResetEmailAsync(user, rawToken, template, lifetimeMinutes);
                if (!emailSent)
                {
                    // The token is already persisted at this point, but the user has no way to use it
                    // if the email never arrived — reporting Success here (as this used to,
                    // unconditionally) silently strands the user with no reset link and no error.
                    AppLogger.LogError(logger, null, SerilogErrorMessages.AcutisLogMessages.ForgotPasswordFailed, input.UserName);
                    result.StatusCode = ErrorCodes.InternalServerError;
                    result.StatusMessage = ErrorMessages.ResetEmailSendFailed;
                    return result;
                }

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

                if (!PasswordPolicy.IsStrongEnough(input.NewPassword))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.PasswordTooWeak;
                    return result;
                }

                string tokenHash = HashToken(input.Token.Trim());
                int userId = await repository.ResetPasswordAsync(tokenHash, input.NewPassword);
                if (userId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = InvalidTokenMessage(userId);
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

        #region GET Methods

        /// <summary>
        /// Checks a reset token's validity and returns which account it belongs to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Reset Password page confirm/display the account being reset, and reject
        /// an already-used/expired link immediately, before the visitor submits a new password.
        /// Request Flow: AcutisPasswordController -> AcutisPasswordService.ValidateResetTokenAsync() -> IAcutisPasswordRepository.ValidateResetTokenAsync().
        /// Validation Details: Token is required.
        /// Business Logic: Hashes the supplied token and delegates the read-only lookup to the repository.
        /// Repository Interaction: Calls IAcutisPasswordRepository.ValidateResetTokenAsync().
        /// Response Details: MSResultArgs containing the account's email/first name, or BadRequest with a specific already-used/expired/invalid message.
        /// </remarks>
        /// <param name="token">Raw reset token from the reset link.</param>
        /// <returns>MSResultArgs containing the token check outcome.</returns>
        public async Task<MSResultArgs> ValidateResetTokenAsync(string token)
        {
            var result = new MSResultArgs();
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string tokenHash = HashToken(token.Trim());
                (int returnValue, var user) = await repository.ValidateResetTokenAsync(tokenHash);
                if (returnValue <= 0 || user == null)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = InvalidTokenMessage(returnValue);
                    return result;
                }

                result.ResultData = new { email = user.Email, firstName = user.FirstName };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.ValidateResetTokenFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region Private Helper Methods

        /// <summary>
        /// Maps a PasswordResetToken stored procedure failure code to a specific, user-facing
        /// message — shared by ResetPasswordAsync and ValidateResetTokenAsync so both surfaces
        /// report an already-used or expired link identically.
        /// </summary>
        private static string InvalidTokenMessage(int returnValue) => returnValue switch
        {
            -2 => ErrorMessages.ResetTokenAlreadyUsed,
            -3 => ErrorMessages.ResetTokenExpired,
            _ => ErrorMessages.InvalidResetToken,
        };

        /// <summary>
        /// Generates a cryptographically random 256-bit reset token, hex-encoded.
        /// </summary>
        private static string GenerateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        /// <summary>
        /// Hashes a raw reset token with SHA-256 so only the hash is ever persisted.
        /// </summary>
        private static string HashToken(string rawToken) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        /// <summary>
        /// Resolves how many minutes a freshly issued reset token should stay valid, from the
        /// PasswordReset email template's admin-configurable LinkExpiryMinutes — falling back to
        /// DefaultTokenLifetimeMinutes when the template row is missing, has no value set, or the
        /// value is somehow outside the same [5, 1440] range EmailTemplatesService enforces on save.
        /// </summary>
        private static int ResolveTokenLifetimeMinutes(EmailTemplateOutput? template)
        {
            int? configured = template?.LinkExpiryMinutes;
            if (configured.HasValue && configured.Value >= MinimumTokenLifetimeMinutes && configured.Value <= MaximumTokenLifetimeMinutes)
            {
                return configured.Value;
            }

            return DefaultTokenLifetimeMinutes;
        }

        /// <summary>
        /// Emails the raw reset link to the matched user, using the configured CFR Admin base URL and the
        /// admin-configurable "PasswordReset" email template (falls back to a built-in default when no
        /// active template row exists, so a missing/deleted template never blocks the reset flow).
        /// </summary>
        /// <param name="user">The matched account the token was issued for.</param>
        /// <param name="rawToken">The plain-text token to embed in the reset link.</param>
        /// <param name="template">The PasswordReset template row already loaded by the caller (avoids a second lookup).</param>
        /// <param name="lifetimeMinutes">The lifetime already resolved (and used for the real token expiry) by the caller — shown in the email as-is so the text always matches reality.</param>
        /// <returns>True when the email was actually sent; false when it was skipped (missing config) or SMTP delivery failed — the caller must not report success in either case.</returns>
        private async Task<bool> SendResetEmailAsync(ForgotPasswordUserResult user, string rawToken, EmailTemplateOutput? template, int lifetimeMinutes)
        {
            string baseUrl = (configuration["FrontendSetting:CfrAdminBaseUrl"] ?? string.Empty).TrimEnd('/');
            // Validate the configured base URL is actually a well-formed, absolute http(s) address
            // before building a link from it — a malformed or relative value here would otherwise
            // silently produce a dead or unsafe reset link that still gets emailed as if it worked.
            if (string.IsNullOrWhiteSpace(baseUrl)
                || !Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseUri)
                || (baseUri.Scheme != Uri.UriSchemeHttp && baseUri.Scheme != Uri.UriSchemeHttps))
            {
                logger.LogWarning("FrontendSetting:CfrAdminBaseUrl is missing or not a valid absolute http(s) URL; skipped sending the password reset email for user {UserId}.", user.UserId);
                return false;
            }

            // The token alone identifies the reset request (ResetPasswordAsync looks it up by its
            // hash) — the email address isn't needed to complete the reset, so it's kept out of the
            // link entirely. A query-string token/email pair is otherwise a real exposure surface:
            // it can end up in server access logs, browser history, and the Referer header if the
            // page ever loads a third-party resource or the user follows an outbound link before
            // using it.
            string resetLink = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}";
            var placeholders = new Dictionary<string, string>
            {
                ["FirstName"] = user.FirstName ?? string.Empty,
                ["ResetLink"] = resetLink,
                ["ExpiryMinutes"] = lifetimeMinutes.ToString(),
                ["AccentColor"] = SMTPMailService.GetAccentColor(),
            };

            string subject = template?.Subject ?? "Reset your Catholic Solutions password";
            // Fallback kept in sync with the PasswordReset seed in 006_Acutis_EmailTemplates.sql —
            // this only fires when the admin-configurable template row is missing entirely.
            string body = template?.Body
                ?? "<div style=\"font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;\"><p style=\"margin:0 0 4px;font-size:13px;color:#64748b;\">Hi [FirstName],</p><p style=\"margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;\">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style=\"text-align:center;margin:0 0 26px;\"><a href=\"[ResetLink]\" style=\"display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;\">Reset Password</a></div><div style=\"background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;\"><p style=\"margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;\">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style=\"margin:0 0 4px;font-size:12px;color:#94a3b8;\">If the button above doesn't work, copy and paste this link into your browser:</p><p style=\"margin:0;font-size:12px;word-break:break-all;\"><a href=\"[ResetLink]\" style=\"color:[AccentColor];\">[ResetLink]</a></p></div>";

            string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
            string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
            return await mailService.SendMailAsync(mergedSubject, mergedBody, user.Email ?? string.Empty);
        }

        #endregion Private Helper Methods
    }
}
