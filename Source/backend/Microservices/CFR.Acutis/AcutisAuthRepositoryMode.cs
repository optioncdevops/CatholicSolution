// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis;

/// <summary>
/// Selects which <c>IAcutisAuthenticationRepository</c> implementation is registered. Configured
/// via <c>AcutisAuth:RepositoryMode</c> (see <see cref="AcutisAuthRepositorySelection"/>). Default
/// is <see cref="DevelopmentFake"/> — real login stays blocked until a real database contract is
/// confirmed (see docs/acutis-auth-spec/database-contract.md).
/// </summary>
public enum AcutisAuthRepositoryMode
{
    /// <summary>
    /// <c>AcutisAuthenticationRepositoryDevFake</c> — no database call, one hardcoded credential
    /// pair. The default, and the only mode allowed outside Development unless explicitly
    /// overridden (see <see cref="AcutisAuthRepositoryOptions.AllowDevelopmentFakeOutsideDevelopment"/>).
    /// </summary>
    DevelopmentFake = 0,

    /// <summary>
    /// A real, database-backed repository. NOT YET IMPLEMENTED — selecting this mode registers a
    /// placeholder (<c>AcutisAuthenticationRepositoryNotImplemented</c>) that throws on every
    /// call, and requires a configured connection-string key or fails fast at startup. Never
    /// silently falls back to <see cref="DevelopmentFake"/>.
    /// </summary>
    Database = 1,
}
