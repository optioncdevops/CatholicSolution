// Copyright (c) OptionC. All rights reserved.

using CFR.Acutis;
using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;
using CFR.DBEngine;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Tests <see cref="AcutisAuthRepositorySelection"/> — pure config-driven DI registration. No
/// database, no network, no real secrets: connection-string "values" used below are obviously
/// fake test fixtures, only ever checked for presence/absence or (for the logging test) confirmed
/// to never appear in captured log output. No development-fake/mock repository exists in this
/// codebase — <see cref="AcutisAuthenticationRepository"/> (real, Dapper-backed) is the only
/// registered implementation, real-time development only.
/// </summary>
public class AcutisAuthRepositorySelectionTests
{
    private static IConfiguration BuildConfiguration(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();

    private static ServiceCollection BuildServicesWithConfiguredConnectionString(string key = "ConnString")
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { [$"ConnectionStrings:{key}"] = "Server=test-fixture-only;Database=test;Trusted_Connection=True;" });
        // AcutisAuthenticationRepository -> IDapperHandler -> DapperHandler needs IConfiguration
        // resolvable from the container itself (not just passed as a parameter).
        services.AddSingleton(configuration);
        services.AddLogging();
        services.AddAcutisAuthRepository(configuration);
        return services;
    }

    // --- Missing connection string fails fast ---

    [Fact]
    public void AddAcutisAuthRepository_NoConnectionString_FailsFast()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration([]);

        var ex = Assert.Throws<InvalidOperationException>(() => services.AddAcutisAuthRepository(configuration));

        Assert.Contains("ConnectionStrings:ConnString", ex.Message);
    }

    [Fact]
    public void ConnectionStringKey_DefaultsToConnString_MatchingCFRDBEngineDapperHandlersHardcodedKey()
    {
        // CFR.DBEngine.DapperHandler.Connection hardcodes configuration.GetConnectionString("ConnString")
        // (matching the reference app exactly) — this default must match that key, or the startup
        // check could pass while the connection AcutisAuthenticationRepository actually opens still
        // fails. See docs/acutis-auth-spec/database-contract.md.
        Assert.Equal("ConnString", AcutisAuthRepositoryOptions.DefaultConnectionStringKey);
    }

    [Fact]
    public void AddAcutisAuthRepository_CustomConnectionStringKey_ButNotConfigured_FailsFastWithThatKeyName()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:ConnectionStringKey"] = "SomeOtherKey" });

        var ex = Assert.Throws<InvalidOperationException>(() => services.AddAcutisAuthRepository(configuration));

        Assert.Contains("ConnectionStrings:SomeOtherKey", ex.Message);
    }

    // --- Connection string configured: registers the real repository ---

    [Fact]
    public void AddAcutisAuthRepository_ConnectionStringConfigured_RegistersRealRepositoryAndDapperHandler()
    {
        using var provider = BuildServicesWithConfiguredConnectionString().BuildServiceProvider();
        var repository = provider.GetRequiredService<IAcutisAuthenticationRepository>();

        // AcutisAuthenticationRepository — real, Dapper-backed (AuthenticateAsync confirmed live
        // against the database — see database-contract.md). The only implementation that exists.
        Assert.IsType<AcutisAuthenticationRepository>(repository);
        Assert.NotNull(provider.GetService<IDapperHandler>());
    }

    [Fact]
    public async Task RealRepository_UnconfirmedOperations_ThrowRatherThanGuessAQuery()
    {
        using var provider = BuildServicesWithConfiguredConnectionString().BuildServiceProvider();
        var repository = provider.GetRequiredService<IAcutisAuthenticationRepository>();

        // GetModuleRightsAsync/FindAccountByEmailAsync have no confirmed standalone database
        // object (see database-contract.md) — they must throw immediately, with no network call,
        // rather than guessing a query. (AuthenticateAsync is intentionally NOT exercised here —
        // it is confirmed and would attempt a real network call against this fixture's fake host.)
        await Assert.ThrowsAsync<NotImplementedException>(() => repository.GetModuleRightsAsync(1));
        await Assert.ThrowsAsync<NotImplementedException>(() => repository.FindAccountByEmailAsync("someone@example.test"));
    }

    [Fact]
    public async Task RealRepository_SetPasswordAsync_NeverReportsFalseSuccess_NoNetworkCall()
    {
        using var provider = BuildServicesWithConfiguredConnectionString().BuildServiceProvider();
        var repository = provider.GetRequiredService<IAcutisAuthenticationRepository>();

        var outcome = await repository.SetPasswordAsync(1, "NewPassword1");

        Assert.False(outcome.Completed);
        Assert.Equal(PasswordOperationFailureReason.NotSupported, outcome.FailureReason);
    }

    // --- No secret values are logged ---

    [Fact]
    public void AddAcutisAuthRepository_LoggedStatusLineNeverContainsTheConnectionStringValue()
    {
        const string fakeSecretValue = "Server=test-fixture-only;Password=NotARealSecret123!;";
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["ConnectionStrings:ConnString"] = fakeSecretValue });
        List<string> logged = [];

        services.AddAcutisAuthRepository(configuration, logMode: logged.Add);

        Assert.NotEmpty(logged);
        Assert.All(logged, line =>
        {
            Assert.DoesNotContain("NotARealSecret123", line);
            Assert.DoesNotContain(fakeSecretValue, line);
        });
        // The key NAME is expected/fine to appear — only the value must never appear.
        Assert.Contains(logged, line => line.Contains("ConnString"));
    }
}
