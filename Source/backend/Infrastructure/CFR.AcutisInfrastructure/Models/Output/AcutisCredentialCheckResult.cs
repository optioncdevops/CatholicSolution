// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Why a credential check did not succeed. Internal repository/service contract — never sent to
/// the client directly (the service maps this to a generic client-facing message, per
/// docs/acutis-auth-spec/security-model.md's "never distinguish reasons" rule for auth failures).
/// </summary>
public enum AcutisAuthFailureReason
{
    None = 0,

    /// <summary>Username/password did not match, or the account does not exist.</summary>
    InvalidCredentials = 1,

    /// <summary>
    /// The backing operation is not yet implementable — no confirmed database object exists for
    /// it (see docs/acutis-auth-spec/database-contract.md). Distinct from InvalidCredentials so
    /// callers can tell "wrong password" apart from "this isn't wired to a real database yet".
    /// </summary>
    NotSupported = 2,
}

/// <summary>
/// Typed result of <see cref="Interfaces.AcutisAuthentication.IAcutisAuthenticationRepository.AuthenticateAsync"/> —
/// the repository's own contract, independent of the <c>MSResultArgs</c> envelope the controller
/// layer will eventually use. Keeps the data-access boundary unit-testable without needing the
/// API response shape.
/// </summary>
public class AcutisCredentialCheckResult
{
    public bool Succeeded { get; set; }

    public AcutisAuthFailureReason FailureReason { get; set; } = AcutisAuthFailureReason.None;

    public AcutisLoginUser? User { get; set; }

    public List<AcutisModuleRightRow> ModuleRights { get; set; } = [];
}
