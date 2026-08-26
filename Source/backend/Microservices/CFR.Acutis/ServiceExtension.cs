// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.AcutisService.Interfaces.PasswordReset;
using CFR.AcutisService.Service.AcutisAuthentication;
using CFR.AcutisService.Service.PasswordReset;

namespace CFR.Acutis;

public static class ServiceExtension
{
    /// <summary>
    /// Registers Acutis-vertical service dependencies (mirrors the per-microservice
    /// AddDIServicesSetup pattern used across the reference OptionC hosts).
    ///
    /// <see cref="IAcutisAuthenticationRepository"/> is NOT registered here — its implementation
    /// is mode-selected separately, in <c>Program.cs</c>, via
    /// <see cref="AcutisAuthRepositorySelection.AddAcutisAuthRepository"/> (needs
    /// <c>IConfiguration</c>/environment, which this method doesn't take). See
    /// docs/acutis-auth-spec/database-contract.md and
    /// docs/acutis-auth-spec/operations-runbook.md.
    ///
    /// <see cref="IPasswordResetTokenStore"/> and <see cref="IPasswordResetEmailSender"/> are
    /// still DEVELOPMENT-ONLY fakes — neither performs a real database call or sends a real
    /// email. <see cref="AcutisAuthenticationService"/> is the one real, non-fake implementation
    /// registered here — its orchestration logic does not depend on the repository being real to
    /// be correct.
    /// </summary>
    public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
    {
        services.AddScoped<IAcutisAuthenticationService, AcutisAuthenticationService>();

        // Real implementation — thin, identity-only Acutis JWT (sub/email/name). Not the SSO
        // fat-claims CFR.Base.IJwtTokenGenerator. See docs/acutis-auth-spec/security-model.md.
        services.AddScoped<IJwtTokenGenerator, AcutisJwtTokenGenerator>();

        // DEV FAKE — in-memory, non-durable. See docs/acutis-auth-spec/security-model.md.
        services.AddSingleton<IPasswordResetTokenStore, InMemoryPasswordResetTokenStore>();

        // DEV FAKE — logs only, sends no real email.
        services.AddScoped<IPasswordResetEmailSender, LoggingPasswordResetEmailSender>();

        return services;
    }
}
