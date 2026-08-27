// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;

/// <summary>
/// Data-access contract for Acutis authentication. Deliberately independent of the
/// <c>MSResultArgs</c> API envelope. The only registered implementation is
/// <see cref="Repositorys.AcutisAuthentication.AcutisAuthenticationRepository"/> — real,
/// Dapper-backed, calling <c>NewViper.DoLogin</c> for <c>AuthenticateAsync</c>. See
/// docs/acutis-auth-spec/database-contract.md for exactly which of these operations are backed by
/// a confirmed database object vs. an explicit, honest blocker (no development-fake/mock
/// repository exists in this codebase).
/// </summary>
public interface IAcutisAuthenticationRepository
{
    /// <summary>
    /// Credential check. Reference-confirmed target: <c>NewViper.DoLogin</c> (target-database
    /// existence unconfirmed — see docs/acutis-auth-spec/database-contract.md).
    /// </summary>
    Task<AcutisCredentialCheckResult> AuthenticateAsync(string userName, string password, CancellationToken cancellationToken = default);

    /// <summary>
    /// Standalone module-rights fetch for a known user (used to refresh
    /// <c>GET /navigation/menus</c> without re-running full login logic). Reference-confirmed as
    /// part of <c>NewViper.DoLogin</c>'s second result grid — whether a standalone lighter query
    /// exists is unconfirmed.
    /// </summary>
    Task<List<AcutisModuleRightRow>> GetModuleRightsAsync(long userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Resolves an email address to an Acutis account for Forgot Password. No confirmed backing
    /// database object exists for this — see docs/acutis-auth-spec/database-contract.md
    /// (blocker). The caller must never let the result influence the client-facing response
    /// (enumeration-safety).
    /// </summary>
    Task<ForgotPasswordLookupResult> FindAccountByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Writes a new password for the given user (Change Password write step, Reset Password
    /// completion step). Confirmed blocker — no backing database object was found anywhere in the
    /// reference Acutis vertical (see docs/acutis-auth-spec/database-contract.md). Every
    /// implementation of this method must return <see cref="PasswordOperationFailureReason.NotSupported"/>
    /// until that blocker is resolved — never a false success.
    /// </summary>
    Task<AcutisPasswordChangeOutcome> SetPasswordAsync(long userId, string newPassword, CancellationToken cancellationToken = default);
}
