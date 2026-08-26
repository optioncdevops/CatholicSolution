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

    /// <summary>Default connection-string key name if none is configured — still just a key name, not a value.</summary>
    public const string DefaultConnectionStringKey = "AcutisDb";

    /// <summary><see cref="AcutisAuthRepositoryMode"/> as a string (bound/parsed explicitly — see <see cref="AcutisAuthRepositorySelection"/> — so an unrecognized value fails with a clear, specific error rather than a generic binder exception).</summary>
    public string? RepositoryMode { get; set; }

    /// <summary>Which <c>ConnectionStrings</c> key to read when <see cref="RepositoryMode"/> is <c>Database</c>. A key NAME, never a value.</summary>
    public string ConnectionStringKey { get; set; } = DefaultConnectionStringKey;

    /// <summary>
    /// Explicit, clearly-named escape hatch: must be <c>true</c> for <see cref="AcutisAuthRepositoryMode.DevelopmentFake"/>
    /// to be allowed outside a Development environment. Defaults to <c>false</c> — production
    /// cannot silently start in fake mode.
    /// </summary>
    public bool AllowDevelopmentFakeOutsideDevelopment { get; set; }
}
