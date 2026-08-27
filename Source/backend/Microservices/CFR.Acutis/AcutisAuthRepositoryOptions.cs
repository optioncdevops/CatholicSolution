// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis;

/// <summary>
/// Binds to the <c>AcutisAuth</c> configuration section. Every property here is
/// non-secret STRUCTURE only — the actual connection string value lives under
/// <c>ConnectionStrings:{ConnectionStringKey}</c>, supplied via User Secrets (local development)
/// or an environment variable/secret store (any other environment), never committed to a tracked
/// appsettings file. See docs/acutis-auth-spec/operations-runbook.md for local setup.
/// </summary>
public class AcutisAuthRepositoryOptions
{
    public const string SectionName = "AcutisAuth";

    /// <summary>
    /// Default connection-string key name if none is configured — still just a key name, not a
    /// value. Matches <c>CFR.DBEngine.DapperHandler.Connection</c>'s hardcoded
    /// <c>configuration.GetConnectionString("ConnString")</c> call (itself matching the reference
    /// app's identical hardcoding), so this startup check and the connection
    /// <c>AcutisAuthenticationRepository</c> actually opens read the same key — see
    /// docs/acutis-auth-spec/database-contract.md.
    /// </summary>
    public const string DefaultConnectionStringKey = "ConnString";

    /// <summary>Which <c>ConnectionStrings</c> key to read. A key NAME, never a value.</summary>
    public string ConnectionStringKey { get; set; } = DefaultConnectionStringKey;
}
