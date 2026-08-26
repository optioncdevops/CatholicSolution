// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.Acutis.Tests.TestDoubles;

/// <summary>
/// In-memory, fully-configurable test double for <see cref="IAcutisAuthenticationRepository"/>.
/// Never touches a database or the network — every method's behavior is set per-test via public
/// delegates/fields, defaulting to a benign "not found" response so a test that doesn't configure
/// a given method still gets deterministic, safe behavior.
/// </summary>
public class FakeAcutisAuthenticationRepository : IAcutisAuthenticationRepository
{
    public Func<string, string, AcutisCredentialCheckResult>? AuthenticateHandler { get; set; }

    public Func<long, List<AcutisModuleRightRow>>? GetModuleRightsHandler { get; set; }

    public Func<string, ForgotPasswordLookupResult>? FindAccountByEmailHandler { get; set; }

    public Func<long, string, AcutisPasswordChangeOutcome>? SetPasswordHandler { get; set; }

    public int AuthenticateCallCount { get; private set; }

    /// <summary>When set, AuthenticateAsync throws this instead of returning — simulates a database/connection failure.</summary>
    public Exception? ThrowOnAuthenticate { get; set; }

    public Task<AcutisCredentialCheckResult> AuthenticateAsync(string userName, string password, CancellationToken cancellationToken = default)
    {
        AuthenticateCallCount++;
        if (ThrowOnAuthenticate is not null)
        {
            throw ThrowOnAuthenticate;
        }

        var result = AuthenticateHandler?.Invoke(userName, password)
            ?? new AcutisCredentialCheckResult { Succeeded = false, FailureReason = AcutisAuthFailureReason.InvalidCredentials };
        return Task.FromResult(result);
    }

    public Task<List<AcutisModuleRightRow>> GetModuleRightsAsync(long userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(GetModuleRightsHandler?.Invoke(userId) ?? []);
    }

    public Task<ForgotPasswordLookupResult> FindAccountByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(FindAccountByEmailHandler?.Invoke(email) ?? new ForgotPasswordLookupResult { AccountFound = false });
    }

    public Task<AcutisPasswordChangeOutcome> SetPasswordAsync(long userId, string newPassword, CancellationToken cancellationToken = default)
    {
        var result = SetPasswordHandler?.Invoke(userId, newPassword)
            ?? new AcutisPasswordChangeOutcome { Completed = false, FailureReason = PasswordOperationFailureReason.NotSupported };
        return Task.FromResult(result);
    }
}
