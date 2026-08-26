// Copyright (c) OptionC. All rights reserved.

using CFR.Acutis;
using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Tests <see cref="AcutisAuthRepositorySelection"/> — pure config-driven DI selection. No
/// database, no network, no real secrets: connection-string "values" used below are obviously
/// fake test fixtures, only ever checked for presence/absence or (for the logging test) confirmed
/// to never appear in captured log output.
/// </summary>
public class AcutisAuthRepositorySelectionTests
{
    private static IConfiguration BuildConfiguration(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();

    // --- Fake mode selection ---

    [Fact]
    public void AddAcutisAuthRepository_NoConfigAtAll_DefaultsToDevelopmentFake()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration([]);

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true);

        using var provider = services.BuildServiceProvider();
        Assert.IsType<AcutisAuthenticationRepositoryDevFake>(provider.GetRequiredService<IAcutisAuthenticationRepository>());
    }

    [Fact]
    public void AddAcutisAuthRepository_ExplicitDevelopmentFake_RegistersTheFake()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:RepositoryMode"] = "DevelopmentFake" });

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true);

        using var provider = services.BuildServiceProvider();
        Assert.IsType<AcutisAuthenticationRepositoryDevFake>(provider.GetRequiredService<IAcutisAuthenticationRepository>());
    }

    [Fact]
    public void AddAcutisAuthRepository_FakeModeOutsideDevelopment_WithoutEscapeHatch_FailsFast()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:RepositoryMode"] = "DevelopmentFake" });

        var ex = Assert.Throws<InvalidOperationException>(
            () => services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: false));

        Assert.Contains("DevelopmentFake", ex.Message);
        Assert.Contains("AllowDevelopmentFakeOutsideDevelopment", ex.Message);
    }

    [Fact]
    public void AddAcutisAuthRepository_FakeModeOutsideDevelopment_WithEscapeHatch_IsAllowed()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new()
        {
            ["AcutisAuth:RepositoryMode"] = "DevelopmentFake",
            ["AcutisAuth:AllowDevelopmentFakeOutsideDevelopment"] = "true",
        });

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: false);

        using var provider = services.BuildServiceProvider();
        Assert.IsType<AcutisAuthenticationRepositoryDevFake>(provider.GetRequiredService<IAcutisAuthenticationRepository>());
    }

    // --- Database mode: missing connection string fails fast ---

    [Fact]
    public void AddAcutisAuthRepository_DatabaseMode_NoConnectionString_FailsFast()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:RepositoryMode"] = "Database" });

        var ex = Assert.Throws<InvalidOperationException>(
            () => services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true));

        Assert.Contains("ConnectionStrings:AcutisDb", ex.Message);
    }

    [Fact]
    public void AddAcutisAuthRepository_DatabaseMode_CustomConnectionStringKey_ButNotConfigured_FailsFastWithThatKeyName()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new()
        {
            ["AcutisAuth:RepositoryMode"] = "Database",
            ["AcutisAuth:ConnectionStringKey"] = "SomeOtherKey",
        });

        var ex = Assert.Throws<InvalidOperationException>(
            () => services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true));

        Assert.Contains("ConnectionStrings:SomeOtherKey", ex.Message);
    }

    // --- Unknown mode fails fast ---

    [Fact]
    public void AddAcutisAuthRepository_UnknownMode_FailsFast()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:RepositoryMode"] = "SomethingNotARealMode" });

        var ex = Assert.Throws<InvalidOperationException>(
            () => services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true));

        Assert.Contains("Unknown", ex.Message);
        Assert.Contains("SomethingNotARealMode", ex.Message);
    }

    // --- Database mode never silently selects the fake ---

    [Fact]
    public void AddAcutisAuthRepository_DatabaseMode_ConnectionStringConfigured_RegistersPlaceholder_NeverTheFake()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new()
        {
            ["AcutisAuth:RepositoryMode"] = "Database",
            ["ConnectionStrings:AcutisDb"] = "Server=test-fixture-only;Database=test;Trusted_Connection=True;",
        });

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true);

        using var provider = services.BuildServiceProvider();
        var repository = provider.GetRequiredService<IAcutisAuthenticationRepository>();

        Assert.IsType<AcutisAuthenticationRepositoryNotImplemented>(repository);
        Assert.IsNotType<AcutisAuthenticationRepositoryDevFake>(repository);
    }

    [Fact]
    public async Task DatabaseMode_PlaceholderRepository_ThrowsRatherThanBehavingLikeTheFake()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new()
        {
            ["AcutisAuth:RepositoryMode"] = "Database",
            ["ConnectionStrings:AcutisDb"] = "Server=test-fixture-only;Database=test;Trusted_Connection=True;",
        });
        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true);
        using var provider = services.BuildServiceProvider();
        var repository = provider.GetRequiredService<IAcutisAuthenticationRepository>();

        // The DEV FAKE would return a benign "invalid credentials" result for this call; the
        // Database-mode placeholder must instead fail loudly, proving it never silently behaves
        // like the fake.
        await Assert.ThrowsAsync<NotImplementedException>(() => repository.AuthenticateAsync("anyone", "anything"));
    }

    // --- No secret values are logged ---

    [Fact]
    public void AddAcutisAuthRepository_DatabaseMode_LoggedStatusLineNeverContainsTheConnectionStringValue()
    {
        const string fakeSecretValue = "Server=test-fixture-only;Password=NotARealSecret123!;";
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new()
        {
            ["AcutisAuth:RepositoryMode"] = "Database",
            ["ConnectionStrings:AcutisDb"] = fakeSecretValue,
        });
        List<string> logged = [];

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true, logMode: logged.Add);

        Assert.NotEmpty(logged);
        Assert.All(logged, line =>
        {
            Assert.DoesNotContain("NotARealSecret123", line);
            Assert.DoesNotContain(fakeSecretValue, line);
        });
        // The key NAME is expected/fine to appear — only the value must never appear.
        Assert.Contains(logged, line => line.Contains("AcutisDb"));
    }

    [Fact]
    public void AddAcutisAuthRepository_FakeMode_LoggedStatusLineContainsNoConnectionStringContentAtAll()
    {
        var services = new ServiceCollection();
        var configuration = BuildConfiguration(new() { ["AcutisAuth:RepositoryMode"] = "DevelopmentFake" });
        List<string> logged = [];

        services.AddAcutisAuthRepository(configuration, isDevelopmentEnvironment: true, logMode: logged.Add);

        Assert.NotEmpty(logged);
        Assert.All(logged, line => Assert.DoesNotContain("ConnectionStrings", line));
    }
}
