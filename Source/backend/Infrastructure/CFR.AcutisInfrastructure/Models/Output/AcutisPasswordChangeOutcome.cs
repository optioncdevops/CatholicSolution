// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>Why a password verify/write operation did not succeed.</summary>
public enum PasswordOperationFailureReason
{
    None = 0,

    /// <summary>The supplied current password did not match (Change Password verify step).</summary>
    IncorrectCurrentPassword = 1,

    /// <summary>
    /// No confirmed database write path exists for this operation yet — see
    /// docs/acutis-auth-spec/database-contract.md. This is an explicit, honest blocker outcome,
    /// never silently reported as success.
    /// </summary>
    NotSupported = 2,
}

/// <summary>
/// Typed result of a password verify-then-write operation (Change Password, Reset Password).
/// Separates "did the current-password check pass" from "was the new password actually written",
/// so a caller can distinguish a wrong-password rejection from an honest not-yet-implemented
/// blocker on the write step.
/// </summary>
public class AcutisPasswordChangeOutcome
{
    public bool VerifiedCurrentPassword { get; set; }

    public bool Completed { get; set; }

    public PasswordOperationFailureReason FailureReason { get; set; } = PasswordOperationFailureReason.None;
}
