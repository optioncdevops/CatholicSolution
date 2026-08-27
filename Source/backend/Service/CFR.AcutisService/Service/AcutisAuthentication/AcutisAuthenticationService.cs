// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure;
using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.AcutisService.Interfaces.PasswordReset;
using CFR.Common;
using CFR.DBEngine;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CFR.AcutisService.Service.AcutisAuthentication;

/// <summary>
/// Real orchestration logic for Acutis authentication — validation, error-message shaping, and
/// coordination between the repository and password-reset seams. This class itself performs no
/// database or network I/O; all of that is delegated to the injected interfaces, so this class is
/// fully unit-testable with fakes/mocks for <see cref="IAcutisAuthenticationRepository"/>,
/// <see cref="IPasswordResetTokenStore"/>, and <see cref="IPasswordResetEmailSender"/>.
///
/// Real login/password functionality remains blocked until <c>IAcutisAuthenticationRepository</c>
/// is backed by a real, database-connected implementation (see
/// docs/acutis-auth-spec/database-contract.md) — this class never claims success for an operation
/// the repository reports as unsupported.
/// </summary>
public class AcutisAuthenticationService(
    IAcutisAuthenticationRepository repository,
    IPasswordResetTokenStore resetTokenStore,
    IPasswordResetEmailSender resetEmailSender,
    IConfiguration configuration,
    ILogger<AcutisAuthenticationService> logger) : IAcutisAuthenticationService
{
    private static readonly TimeSpan ResetTokenValidity = TimeSpan.FromHours(1);

    private const string GenericForgotPasswordMessage = "If an account exists for that email, a reset link has been sent.";
    private const string GenericInvalidTokenMessage = "This reset link is invalid or has expired.";
    private const string GenericIncorrectCurrentPasswordMessage = "Current password is incorrect.";
    private const string NotSupportedMessage = "This operation is not yet supported — no confirmed database connection exists for Acutis authentication yet. See docs/acutis-auth-spec/database-contract.md.";

    public async Task<MSResultArgs<AcutisLoginResult>> LoginAsync(AcutisLoginRequest request, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs<AcutisLoginResult>();

        try
        {
            if (request is null || string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "Username and password are required.";
                return result;
            }

            // UserName (email) is trimmed before use — Password is never trimmed or otherwise
            // transformed; see docs/acutis-auth-spec/validation-standard.md "General rules".
            AcutisCredentialCheckResult check = await repository.AuthenticateAsync(request.UserName.Trim(), request.Password, cancellationToken).ConfigureAwait(false);

            if (!check.Succeeded || check.User is null)
            {
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = check.FailureReason == AcutisAuthFailureReason.NotSupported
                    ? NotSupportedMessage
                    : "Invalid username or password.";
                return result;
            }

            result.StatusCode = ErrorCodes.Success;
            result.StatusMessage = ErrorMessages.Success;
            result.ResultData = new AcutisLoginResult
            {
                User = check.User,
                ModuleRights = AcutisMenuMapper.ToModuleRightDtos(check.ModuleRights),
                MenuItems = AcutisMenuMapper.MapModuleRightsToMenu(check.ModuleRights),
            };
            return result;
        }
        catch (Exception ex)
        {
            AppLogger.LogError(logger, ex, "Acutis login failed unexpectedly.");
            result.StatusCode = ErrorCodes.InternalServerError;
            result.StatusMessage = ErrorMessages.InternalServerError;
            return result;
        }
    }

    public Task<MSResultArgs> LogoutAsync(long userId, CancellationToken cancellationToken = default)
    {
        // Stateless JWT design (matches reference — see docs/acutis-auth-spec/reference-comparison.md §2):
        // no server-side session/token store exists to invalidate. This is an intentional no-op,
        // not an omission, kept as a seam for future server-side revocation.
        AppLogger.LogInformation(logger, null, "Acutis logout for UserId={UserId}.", userId);

        return Task.FromResult(new MSResultArgs
        {
            StatusCode = ErrorCodes.Success,
            StatusMessage = ErrorMessages.Success,
        });
    }

    public Task<MSResultArgs<AcutisCurrentUserDto>> GetCurrentUserAsync(long userId, string? email, string? fullName, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs<AcutisCurrentUserDto>();

        if (userId <= 0)
        {
            result.StatusCode = ErrorCodes.BadRequest;
            result.StatusMessage = "No authenticated user context was found.";
            return Task.FromResult(result);
        }

        result.StatusCode = ErrorCodes.Success;
        result.StatusMessage = ErrorMessages.Success;
        result.ResultData = new AcutisCurrentUserDto
        {
            UserId = userId,
            Email = email,
            FullName = fullName,
        };
        return Task.FromResult(result);
    }

    public async Task<MSResultArgs> ChangePasswordAsync(long userId, string userName, AcutisChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs();

        try
        {
            if (request is null
                || string.IsNullOrWhiteSpace(request.CurrentPassword)
                || string.IsNullOrWhiteSpace(request.NewPassword)
                || string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "Current password, new password, and confirmation are all required.";
                return result;
            }

            if (!string.Equals(request.NewPassword, request.ConfirmPassword, StringComparison.Ordinal))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "New password and confirmation do not match.";
                return result;
            }

            if (string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "New password must be different from the current password.";
                return result;
            }

            if (!AcutisAuthValidation.IsPasswordPolicyCompliant(request.NewPassword))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = AcutisAuthValidation.PasswordPolicyDescription;
                return result;
            }

            // Verify step: reuse the login credential-check path (security-model.md option 1) —
            // no dedicated verify-only database object is confirmed to exist.
            AcutisCredentialCheckResult verify = await repository.AuthenticateAsync(userName, request.CurrentPassword, cancellationToken).ConfigureAwait(false);

            if (!verify.Succeeded)
            {
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = verify.FailureReason == AcutisAuthFailureReason.NotSupported
                    ? NotSupportedMessage
                    : GenericIncorrectCurrentPasswordMessage;
                return result;
            }

            AcutisPasswordChangeOutcome outcome = await repository.SetPasswordAsync(userId, request.NewPassword, cancellationToken).ConfigureAwait(false);

            if (!outcome.Completed)
            {
                // Confirmed blocker — fail closed, never claim success.
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = NotSupportedMessage;
                return result;
            }

            result.StatusCode = ErrorCodes.Success;
            result.StatusMessage = "Password changed successfully.";
            return result;
        }
        catch (Exception ex)
        {
            AppLogger.LogError(logger, ex, "Acutis change-password failed unexpectedly for UserId={UserId}.", userId);
            result.StatusCode = ErrorCodes.InternalServerError;
            result.StatusMessage = ErrorMessages.InternalServerError;
            return result;
        }
    }

    public async Task<MSResultArgs> ForgotPasswordAsync(AcutisForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs
        {
            StatusCode = ErrorCodes.Success,
            StatusMessage = GenericForgotPasswordMessage,
        };

        try
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Email))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "A valid email address is required.";
                return result;
            }

            // Trimmed before lookup so trailing/leading whitespace doesn't silently cause a
            // "not found" lookup for an otherwise-valid, already-registered address.
            string trimmedEmail = request.Email.Trim();
            ForgotPasswordLookupResult lookup = await repository.FindAccountByEmailAsync(trimmedEmail, cancellationToken).ConfigureAwait(false);

            // Enumeration-safety: the branch taken below never changes what is returned to the
            // caller — only the generic message above is ever sent back, per
            // docs/acutis-auth-spec/security-model.md.
            if (lookup.AccountFound && lookup.UserId is long userId)
            {
                string token = await resetTokenStore.IssueResetTokenAsync(userId, ResetTokenValidity, cancellationToken).ConfigureAwait(false);
                string baseUrl = configuration["Acutis:FrontendBaseUrl"] ?? string.Empty;
                string resetLink = string.IsNullOrEmpty(baseUrl)
                    ? $"/auth/reset-password?token={token}"
                    : $"{baseUrl.TrimEnd('/')}/auth/reset-password?token={token}";

                await resetEmailSender.SendPasswordResetEmailAsync(lookup.Email ?? trimmedEmail, resetLink, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                AppLogger.LogInformation(logger, null, "Forgot-password requested for an email with no matching Acutis account (response withheld from caller).");
            }

            return result;
        }
        catch (Exception ex)
        {
            AppLogger.LogError(logger, ex, "Acutis forgot-password failed unexpectedly.");

            // Still return the generic message — a server error must not leak account-existence
            // information any more than a normal "not found" would.
            result.StatusCode = ErrorCodes.Success;
            result.StatusMessage = GenericForgotPasswordMessage;
            return result;
        }
    }

    public async Task<MSResultArgs> ResetPasswordAsync(AcutisResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs();

        try
        {
            if (request is null
                || string.IsNullOrWhiteSpace(request.Token)
                || string.IsNullOrWhiteSpace(request.NewPassword)
                || string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "A reset token, new password, and confirmation are all required.";
                return result;
            }

            if (!string.Equals(request.NewPassword, request.ConfirmPassword, StringComparison.Ordinal))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "New password and confirmation do not match.";
                return result;
            }

            if (!AcutisAuthValidation.IsPasswordPolicyCompliant(request.NewPassword))
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = AcutisAuthValidation.PasswordPolicyDescription;
                return result;
            }

            if (!AcutisAuthValidation.IsPlausibleResetToken(request.Token))
            {
                // Reported identically to a token the store itself rejects — never a distinguishable
                // error, so a malformed token reveals nothing about the real token shape.
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = GenericInvalidTokenMessage;
                return result;
            }

            PasswordResetTokenValidationResult tokenResult = await resetTokenStore.ValidateAndConsumeTokenAsync(request.Token, cancellationToken).ConfigureAwait(false);

            if (!tokenResult.IsValid || tokenResult.UserId is not long userId)
            {
                // Never distinguish NotFound/Expired/AlreadyUsed to the caller.
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = GenericInvalidTokenMessage;
                return result;
            }

            AcutisPasswordChangeOutcome outcome = await repository.SetPasswordAsync(userId, request.NewPassword, cancellationToken).ConfigureAwait(false);

            if (!outcome.Completed)
            {
                result.StatusCode = ErrorCodes.Failed;
                result.StatusMessage = NotSupportedMessage;
                return result;
            }

            result.StatusCode = ErrorCodes.Success;
            result.StatusMessage = "Password reset successfully.";
            return result;
        }
        catch (Exception ex)
        {
            AppLogger.LogError(logger, ex, "Acutis reset-password failed unexpectedly.");
            result.StatusCode = ErrorCodes.InternalServerError;
            result.StatusMessage = ErrorMessages.InternalServerError;
            return result;
        }
    }

    public async Task<MSResultArgs<List<AcutisMenuGroup>>> GetMenusAsync(long userId, CancellationToken cancellationToken = default)
    {
        var result = new MSResultArgs<List<AcutisMenuGroup>>();

        try
        {
            if (userId <= 0)
            {
                result.StatusCode = ErrorCodes.BadRequest;
                result.StatusMessage = "No authenticated user context was found.";
                return result;
            }

            List<AcutisModuleRightRow> rights = await repository.GetModuleRightsAsync(userId, cancellationToken).ConfigureAwait(false);

            result.StatusCode = ErrorCodes.Success;
            result.StatusMessage = ErrorMessages.Success;
            result.ResultData = AcutisMenuMapper.MapModuleRightsToMenu(rights);
            return result;
        }
        catch (Exception ex)
        {
            AppLogger.LogError(logger, ex, "Acutis menu lookup failed unexpectedly for UserId={UserId}.", userId);
            result.StatusCode = ErrorCodes.InternalServerError;
            result.StatusMessage = ErrorMessages.InternalServerError;
            return result;
        }
    }
}
