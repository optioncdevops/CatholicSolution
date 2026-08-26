// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>Why a reset-token validation did not succeed.</summary>
public enum PasswordResetTokenFailureReason
{
    None = 0,
    NotFound = 1,
    Expired = 2,
    AlreadyUsed = 3,
}

/// <summary>
/// Typed result of <c>IPasswordResetTokenStore.ValidateAndConsumeTokenAsync</c>. The service must
/// collapse every non-<see cref="None"/> reason into the same generic client-facing message
/// (never distinguish "expired" from "invalid" from "already used" to the caller) — see
/// docs/acutis-auth-spec/security-model.md.
/// </summary>
public class PasswordResetTokenValidationResult
{
    public bool IsValid { get; set; }

    public long? UserId { get; set; }

    public PasswordResetTokenFailureReason FailureReason { get; set; } = PasswordResetTokenFailureReason.None;
}
