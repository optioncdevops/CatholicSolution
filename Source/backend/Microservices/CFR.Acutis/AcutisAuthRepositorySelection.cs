// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;
using CFR.DBEngine;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CFR.Acutis;

/// <summary>
/// Registers the real, Dapper-backed <see cref="IAcutisAuthenticationRepository"/> implementation
/// (<see cref="AcutisAuthenticationRepository"/>) and its <see cref="IDapperHandler"/> dependency.
/// Real-time development only — no development-fake/mock repository exists in this codebase.
/// Every check here is a config-presence check only — this class never opens a database
/// connection itself, never reads a connection string's contents beyond checking it is non-blank,
/// and never logs a secret value. Decomposed into small internal methods specifically so the
/// fail-fast rule is independently unit-testable without a real host or DI container.
/// </summary>
public static class AcutisAuthRepositorySelection
{
    /// <summary>
    /// Reads <see cref="AcutisAuthRepositoryOptions"/> from <paramref name="configuration"/>,
    /// fails startup immediately (<see cref="InvalidOperationException"/>, before
    /// <c>app.Build()</c>/<c>Run()</c>) if <c>ConnectionStrings:{ConnectionStringKey}</c> is not
    /// configured, then registers <see cref="IDapperHandler"/> and
    /// <see cref="AcutisAuthenticationRepository"/>.
    /// </summary>
    /// <param name="logMode">
    /// Optional sink for a single, redacted status line (connection-string KEY NAME only, never a
    /// value) — omitted by default; exists so tests can assert nothing secret is ever passed to it.
    /// </param>
    public static IServiceCollection AddAcutisAuthRepository(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<string>? logMode = null)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        AcutisAuthRepositoryOptions options = configuration.GetSection(AcutisAuthRepositoryOptions.SectionName).Get<AcutisAuthRepositoryOptions>()
            ?? new AcutisAuthRepositoryOptions();

        string connectionStringKey = ResolveConnectionStringKey(options);
        EnsureDatabaseConnectionStringIsConfigured(configuration, connectionStringKey);
        logMode?.Invoke($"Acutis authentication repository: real database (connection string key: {connectionStringKey}).");

        services.AddScoped<IDapperHandler, DapperHandler>();
        services.AddScoped<IAcutisAuthenticationRepository, AcutisAuthenticationRepository>();
        return services;
    }

    internal static string ResolveConnectionStringKey(AcutisAuthRepositoryOptions options) =>
        string.IsNullOrWhiteSpace(options.ConnectionStringKey) ? AcutisAuthRepositoryOptions.DefaultConnectionStringKey : options.ConnectionStringKey;

    internal static void EnsureDatabaseConnectionStringIsConfigured(IConfiguration configuration, string connectionStringKey)
    {
        string? connectionString = configuration.GetConnectionString(connectionStringKey);
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        throw new InvalidOperationException(
            $"ConnectionStrings:{connectionStringKey} is not configured. " +
            $"Set it via .NET User Secrets (local development) or the environment variable " +
            $"ConnectionStrings__{connectionStringKey} (any other environment) — never in a tracked appsettings file. " +
            "See docs/acutis-auth-spec/operations-runbook.md.");
    }
}
