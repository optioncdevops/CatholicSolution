// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CFR.Acutis;

/// <summary>
/// Selects and registers the <see cref="IAcutisAuthenticationRepository"/> implementation from
/// configuration (<c>AcutisAuth:RepositoryMode</c>, section <see cref="AcutisAuthRepositoryOptions.SectionName"/>).
/// Every check here is a config-presence check only — this class never opens a database
/// connection, never reads a connection string's contents beyond checking it is non-blank, and
/// never logs a secret value. Decomposed into small internal methods specifically so each
/// fail-fast rule is independently unit-testable without a real host or DI container.
/// </summary>
public static class AcutisAuthRepositorySelection
{
    /// <summary>
    /// Reads <see cref="AcutisAuthRepositoryOptions"/> from <paramref name="configuration"/> and
    /// registers exactly one <see cref="IAcutisAuthenticationRepository"/> implementation:
    /// <see cref="AcutisAuthenticationRepositoryDevFake"/> for <see cref="AcutisAuthRepositoryMode.DevelopmentFake"/>,
    /// or <see cref="AcutisAuthenticationRepositoryNotImplemented"/> (never the fake) for
    /// <see cref="AcutisAuthRepositoryMode.Database"/>. Throws <see cref="InvalidOperationException"/>
    /// — fails the whole startup, before <c>app.Build()</c>/<c>Run()</c> — for an unrecognized
    /// mode, or for <c>Database</c> mode with no configured connection-string key.
    /// </summary>
    /// <param name="logMode">
    /// Optional sink for a single, redacted status line (mode + connection-string KEY NAME only,
    /// never a value) — omitted by default; exists so tests can assert nothing secret is ever
    /// passed to it.
    /// </param>
    public static IServiceCollection AddAcutisAuthRepository(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopmentEnvironment,
        Action<string>? logMode = null)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        AcutisAuthRepositoryOptions options = configuration.GetSection(AcutisAuthRepositoryOptions.SectionName).Get<AcutisAuthRepositoryOptions>()
            ?? new AcutisAuthRepositoryOptions();

        AcutisAuthRepositoryMode mode = ResolveMode(options.RepositoryMode);

        if (mode == AcutisAuthRepositoryMode.DevelopmentFake)
        {
            EnsureDevelopmentFakeIsAllowed(isDevelopmentEnvironment, options);
            logMode?.Invoke("Acutis authentication repository mode: DevelopmentFake.");
            services.AddScoped<IAcutisAuthenticationRepository, AcutisAuthenticationRepositoryDevFake>();
            return services;
        }

        // mode == Database. Never falls back to the fake from here, under any condition.
        string connectionStringKey = ResolveConnectionStringKey(options);
        EnsureDatabaseConnectionStringIsConfigured(configuration, connectionStringKey);
        logMode?.Invoke($"Acutis authentication repository mode: Database (connection string key: {connectionStringKey}).");
        services.AddScoped<IAcutisAuthenticationRepository, AcutisAuthenticationRepositoryNotImplemented>();
        return services;
    }

    /// <summary>Empty/missing config value defaults safely to <see cref="AcutisAuthRepositoryMode.DevelopmentFake"/>; any non-empty value that isn't a recognized mode name fails fast.</summary>
    internal static AcutisAuthRepositoryMode ResolveMode(string? rawMode)
    {
        if (string.IsNullOrWhiteSpace(rawMode))
        {
            return AcutisAuthRepositoryMode.DevelopmentFake;
        }

        if (Enum.TryParse<AcutisAuthRepositoryMode>(rawMode, ignoreCase: true, out AcutisAuthRepositoryMode mode) && Enum.IsDefined(mode))
        {
            return mode;
        }

        throw new InvalidOperationException(
            $"Unknown AcutisAuth:RepositoryMode '{rawMode}'. Valid values: {string.Join(", ", Enum.GetNames<AcutisAuthRepositoryMode>())}.");
    }

    internal static void EnsureDevelopmentFakeIsAllowed(bool isDevelopmentEnvironment, AcutisAuthRepositoryOptions options)
    {
        if (isDevelopmentEnvironment || options.AllowDevelopmentFakeOutsideDevelopment)
        {
            return;
        }

        throw new InvalidOperationException(
            "AcutisAuth:RepositoryMode is DevelopmentFake outside a Development environment. Set " +
            "AcutisAuth:AllowDevelopmentFakeOutsideDevelopment=true to explicitly allow this (not recommended for " +
            "production), or configure AcutisAuth:RepositoryMode=Database with a real connection string. See " +
            "docs/acutis-auth-spec/operations-runbook.md.");
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
            $"AcutisAuth:RepositoryMode is Database but ConnectionStrings:{connectionStringKey} is not configured. " +
            $"Set it via .NET User Secrets (local development) or the environment variable " +
            $"ConnectionStrings__{connectionStringKey} (any other environment) — never in a tracked appsettings file. " +
            "See docs/acutis-auth-spec/operations-runbook.md.");
    }
}
