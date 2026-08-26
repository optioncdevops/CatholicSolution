// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.DBEngine;

namespace CFR.AcutisService.Interfaces.AcutisAuthentication;

/// <summary>
/// Business-logic orchestration for Acutis authentication — the boundary a future
/// <c>AuthController</c>/<c>NavigationController</c> will call. Returns the platform's existing
/// <c>MSResultArgs</c>/<c>MSResultArgs&lt;T&gt;</c> envelope directly (preserving
/// <c>BaseController.ApiResultArgs</c> conventions), so no translation layer is needed once a
/// controller is added. Every method here is orchestration only — no direct database access; that
/// lives behind <see cref="Interfaces.PasswordReset.IPasswordResetTokenStore"/>,
/// <see cref="Interfaces.PasswordReset.IPasswordResetEmailSender"/>, and
/// <c>IAcutisAuthenticationRepository</c>.
/// </summary>
public interface IAcutisAuthenticationService
{
    /// <summary>
    /// Maps to <c>POST /acutis/api/v1/auth/login</c>. See
    /// docs/acutis-auth-spec/api-contract.md §1. Real credential verification remains blocked
    /// until the registered <c>IAcutisAuthenticationRepository</c> is a real, database-backed
    /// implementation — this task registers only the development fake.
    /// </summary>
    Task<MSResultArgs<AcutisLoginResult>> LoginAsync(AcutisLoginRequest request, CancellationToken cancellationToken = default);

    /// <summary>Maps to <c>POST /acutis/api/v1/auth/logout</c>. Stateless — no server-side token invalidation (see api-contract.md §2).</summary>
    Task<MSResultArgs> LogoutAsync(long userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Maps to <c>GET /acutis/api/v1/auth/me</c>. No database dependency — echoes the identity
    /// already resolved from the caller's validated JWT claims.
    /// </summary>
    Task<MSResultArgs<AcutisCurrentUserDto>> GetCurrentUserAsync(long userId, string? email, string? fullName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Maps to <c>POST /acutis/api/v1/auth/change-password</c>. <paramref name="userName"/> is the
    /// caller's own username/email resolved from their JWT claims (never client-supplied) — the
    /// verify step reuses <c>IAcutisAuthenticationRepository.AuthenticateAsync</c> with it and the
    /// submitted current password (security-model.md option 1). The write step is a confirmed
    /// blocker and will report <see cref="PasswordOperationFailureReason.NotSupported"/> via the
    /// dev fake, never a false success.
    /// </summary>
    Task<MSResultArgs> ChangePasswordAsync(long userId, string userName, AcutisChangePasswordRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Maps to <c>POST /acutis/api/v1/auth/forgot-password</c>. Always returns the same generic
    /// response regardless of whether the email matches an account (enumeration-safety).
    /// </summary>
    Task<MSResultArgs> ForgotPasswordAsync(AcutisForgotPasswordRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Maps to <c>POST /acutis/api/v1/auth/reset-password</c>. The token-validate step is fully
    /// testable against the dev-only token store; the password write step is a confirmed blocker.
    /// </summary>
    Task<MSResultArgs> ResetPasswordAsync(AcutisResetPasswordRequest request, CancellationToken cancellationToken = default);

    /// <summary>Maps to <c>GET /acutis/api/v1/navigation/menus</c>. Reuses the same rights data source as Login.</summary>
    Task<MSResultArgs<List<AcutisMenuGroup>>> GetMenusAsync(long userId, CancellationToken cancellationToken = default);
}
