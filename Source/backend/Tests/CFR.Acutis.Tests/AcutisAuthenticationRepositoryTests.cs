// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;
using CFR.DBEngine;

using Microsoft.Extensions.Logging.Abstractions;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Covers only the parts of <see cref="AcutisAuthenticationRepository"/> that don't require a
/// real database connection: the honest "not confirmed"/"not supported" blockers for
/// <c>GetModuleRightsAsync</c>, <c>FindAccountByEmailAsync</c>, and <c>SetPasswordAsync</c>.
/// <c>AuthenticateAsync</c> (the one method backed by a confirmed live database object,
/// <c>NewViper.DoLogin</c> — see docs/acutis-auth-spec/database-contract.md) is deliberately NOT
/// unit-tested here: Dapper's <c>GridReader</c> cannot be faked without either a real database
/// connection or a mocking framework (this repo uses neither — see AGENTS/CLAUDE conventions),
/// so its correctness was instead confirmed via this session's live, read-only verification
/// against the real database, documented in database-contract.md.
/// </summary>
public class AcutisAuthenticationRepositoryTests
{
    private static AcutisAuthenticationRepository CreateRepository() =>
        // IDapperHandler is never touched by any method exercised in this file — null is safe.
        new(null!, NullLogger<AcutisAuthenticationRepository>.Instance);

    [Fact]
    public async Task GetModuleRightsAsync_ThrowsNotImplemented_NoConfirmedStandaloneObject()
    {
        await Assert.ThrowsAsync<NotImplementedException>(() => CreateRepository().GetModuleRightsAsync(1));
    }

    [Fact]
    public async Task FindAccountByEmailAsync_ThrowsNotImplemented_NoConfirmedObject()
    {
        await Assert.ThrowsAsync<NotImplementedException>(() => CreateRepository().FindAccountByEmailAsync("someone@example.test"));
    }

    [Fact]
    public async Task SetPasswordAsync_ReturnsNotSupported_NeverThrowsNeverFalseSuccess()
    {
        AcutisPasswordChangeOutcome outcome = await CreateRepository().SetPasswordAsync(1, "NewPassword1");

        Assert.False(outcome.Completed);
        Assert.False(outcome.VerifiedCurrentPassword);
        Assert.Equal(PasswordOperationFailureReason.NotSupported, outcome.FailureReason);
    }
}
