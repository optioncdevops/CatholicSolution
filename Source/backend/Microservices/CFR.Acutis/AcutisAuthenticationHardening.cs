// Copyright (c) OptionC. All rights reserved.

using CFR.Base;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CFR.Acutis;

/// <summary>
/// Acutis-specific JWT bearer validation hardening, layered ON TOP of
/// <c>CFR.Base.CommonServiceExtension.AddAuthenticationSetup</c> (called first, unchanged) rather
/// than modifying that shared method. <c>AddAuthenticationSetup</c> is also called by
/// <c>CFR.Gateway</c> (and would be by <c>CFR.Portal</c> once wired) — tightening issuer/audience
/// validation there was out of scope for this task and unverified for those services, so this
/// class exists specifically so Acutis gets stricter validation without changing behavior for any
/// other host. See docs/acutis-auth-spec/security-model.md for the full rationale and the exact
/// values documented.
/// </summary>
public static class AcutisAuthenticationHardening
{
    /// <summary>
    /// Must be called AFTER <c>AddAuthenticationSetup</c> in <c>Program.cs</c> — it uses
    /// <see cref="Microsoft.Extensions.Options.OptionsServiceCollectionExtensions.PostConfigure{TOptions}(IServiceCollection,string?,Action{TOptions})"/>
    /// to override the JWT bearer scheme's <c>TokenValidationParameters</c> after the shared setup
    /// has run, scoped to this one <c>IServiceCollection</c> — no other host is affected.
    ///
    /// Fails safe at application startup (not lazily, at first request) if
    /// <c>JWTSetting:Issuer</c> or <c>JWTSetting:Audience</c> is missing — mirroring
    /// <c>AddAuthenticationSetup</c>'s existing eager failure for a missing <c>SecurityKey</c>.
    /// </summary>
    public static IServiceCollection AddAcutisJwtValidationHardening(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        JWTSetting settings = configuration.GetSection("JWTSetting").Get<JWTSetting>()
            ?? throw new InvalidOperationException("JWTSetting configuration section is missing or invalid for Acutis authentication.");

        if (string.IsNullOrWhiteSpace(settings.Issuer))
        {
            throw new InvalidOperationException("JWTSetting:Issuer is required for Acutis authentication and was not configured.");
        }

        if (string.IsNullOrWhiteSpace(settings.Audience))
        {
            throw new InvalidOperationException("JWTSetting:Audience is required for Acutis authentication and was not configured.");
        }

        // SecurityKey absence already fails startup inside AddAuthenticationSetup — re-checked
        // here only so this method's own failure message is unambiguous if call order is ever
        // changed.
        if (string.IsNullOrWhiteSpace(settings.SecurityKey))
        {
            throw new InvalidOperationException("JWTSetting:SecurityKey is required for Acutis authentication and was not configured.");
        }

        string issuer = settings.Issuer;
        string audience = settings.Audience;

        services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            // Without this, the underlying JwtSecurityTokenHandler silently remaps short claim
            // names (sub/email/name) to long legacy XML-namespace claim types on the way in, so
            // AuthController.ResolveCurrentUser's JwtRegisteredClaimNames.Sub/Email/Name lookups
            // would never match a real, validly-signed token's claims. Confirmed by live
            // verification during this task (a valid token produced HTTP 400 from /Me before this
            // fix, because no claim could be found under its issued name).
            options.MapInboundClaims = false;

            options.TokenValidationParameters.ValidateIssuerSigningKey = true; // already true from AddAuthenticationSetup; explicit here for clarity
            options.TokenValidationParameters.ValidateIssuer = true;
            options.TokenValidationParameters.ValidIssuer = issuer;
            options.TokenValidationParameters.ValidateAudience = true;
            options.TokenValidationParameters.ValidAudience = audience;
            options.TokenValidationParameters.ValidateLifetime = true; // default is already true; explicit per docs/acutis-auth-spec/security-model.md

            // Zero clock skew, matching AddAuthenticationSetup's existing value — reaffirmed here
            // explicitly rather than left implicit. Acceptable because the same process both
            // issues (AcutisJwtTokenGenerator) and validates these tokens; there is no
            // multi-server clock-drift scenario in this deployment shape to allow for.
            options.TokenValidationParameters.ClockSkew = TimeSpan.Zero;
        });

        return services;
    }
}
