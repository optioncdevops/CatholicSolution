// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;

/// <summary>
/// Registration boundary for <see cref="AcutisAuthRepositoryMode.Database" /> (see
/// <c>CFR.Acutis.AcutisAuthRepositorySelection</c>). This is deliberately NOT a real,
/// database-backed implementation — no <c>IDapperHandler</c> usage, no connection string read
/// here, no <c>NewViper.DoLogin</c> call. It exists so <c>Database</c> mode has a concrete type to
/// bind to today (a real seam to swap in a Dapper-backed class later) without ever silently
/// resolving to <see cref="AcutisAuthenticationRepositoryDevFake"/> instead — every method here
/// throws immediately and explicitly, so a misconfiguration is loud, not a false success.
///
/// This class exists purely as a DI-registration placeholder; do not add real query logic to it —
/// implement the real repository as a new class once
/// docs/acutis-auth-spec/database-contract.md's blockers are resolved.
/// </summary>
public class AcutisAuthenticationRepositoryNotImplemented : IAcutisAuthenticationRepository
{
    private const string Message =
        "AcutisAuthRepositoryMode.Database is configured, but no real database-backed IAcutisAuthenticationRepository " +
        "implementation exists yet. See docs/acutis-auth-spec/database-contract.md for the confirmed/blocked contract. " +
        "This is not a fallback to the development fake — it is an explicit, loud failure.";

    public Task<AcutisCredentialCheckResult> AuthenticateAsync(string userName, string password, CancellationToken cancellationToken = default)
        => throw new NotImplementedException(Message);

    public Task<List<AcutisModuleRightRow>> GetModuleRightsAsync(long userId, CancellationToken cancellationToken = default)
        => throw new NotImplementedException(Message);

    public Task<ForgotPasswordLookupResult> FindAccountByEmailAsync(string email, CancellationToken cancellationToken = default)
        => throw new NotImplementedException(Message);

    public Task<AcutisPasswordChangeOutcome> SetPasswordAsync(long userId, string newPassword, CancellationToken cancellationToken = default)
        => throw new NotImplementedException(Message);
}
