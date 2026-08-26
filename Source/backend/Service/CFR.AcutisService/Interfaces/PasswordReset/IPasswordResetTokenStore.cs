// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.AcutisService.Interfaces.PasswordReset;

/// <summary>
/// Interface-ready design for reset-token issuance/validation (see
/// docs/acutis-auth-spec/security-model.md). Exists because Forgot/Reset Password's real
/// database-backed storage is a confirmed blocker (docs/acutis-auth-spec/database-contract.md) —
/// this seam lets the request/response contract and enumeration-safe behavior be built and tested
/// today against a non-durable development backing, and swapped for a real store later without
/// changing callers.
/// </summary>
public interface IPasswordResetTokenStore
{
    /// <summary>Issues a new single-use token for <paramref name="userId"/>, valid for <paramref name="validity"/>.</summary>
    Task<string> IssueResetTokenAsync(long userId, TimeSpan validity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates <paramref name="token"/> and, if valid, consumes it (single use — a second call
    /// with the same token must fail with <see cref="PasswordResetTokenFailureReason.AlreadyUsed"/>).
    /// </summary>
    Task<PasswordResetTokenValidationResult> ValidateAndConsumeTokenAsync(string token, CancellationToken cancellationToken = default);
}
