// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using CFR.AcutisInfrastructure.Models.Output;
using CFR.Base;
using CFR.CommonService;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CFR.Acutis;

/// <summary>
/// Acutis-specific JWT contract. Deliberately separate from <c>CFR.Base.IJwtTokenGenerator</c>
/// (which issues the SSO-shaped, fat-claims <c>UserContextData</c> token used by an unrelated
/// flow) — Acutis authentication does not use SSO and must not reuse that token shape. Mirrors the
/// reference app's project-local <c>OptionC.Acutis.IJwtTokenGenerator</c> exactly (thin,
/// identity-only claims). See docs/acutis-auth-spec/security-model.md.
/// </summary>
public interface IJwtTokenGenerator
{
    /// <summary>
    /// Issues a signed JWT for an already-authenticated Acutis user. Only
    /// <see cref="AcutisLoginUser.UserId"/>, <see cref="AcutisLoginUser.Email"/>, and
    /// <see cref="AcutisLoginUser.FullName"/> are read — no password, role, permission, menu, or
    /// other database value is ever placed on the token.
    /// </summary>
    string GenerateToken(AcutisLoginUser user);
}

/// <summary>
/// See <see cref="IJwtTokenGenerator"/>. Reads signing configuration from <c>JWTSetting</c>
/// (bound via <c>CFR.Base.CommonServiceExtension.AddAuthenticationSetup</c>, already wired in
/// <c>CFR.Acutis/Program.cs</c>). Throws <see cref="InvalidOperationException"/> if the security
/// key is missing — a deliberate fail-safe: this service must never silently issue an unsigned or
/// weakly-signed token. In practice <c>AddAuthenticationSetup</c> already throws at application
/// startup under the same condition, so this is defense-in-depth, not the only guard.
/// </summary>
public class AcutisJwtTokenGenerator(IOptions<JWTSetting> jwtSetting) : IJwtTokenGenerator
{
    public string GenerateToken(AcutisLoginUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        JWTSetting settings = jwtSetting.Value;

        if (string.IsNullOrWhiteSpace(settings.SecurityKey))
        {
            throw new InvalidOperationException("JWTSetting:SecurityKey is not configured. Acutis authentication cannot issue a token without it.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        byte[] tokenKey = Encoding.UTF8.GetBytes(settings.SecurityKey);

        // Approved thin claims only: sub / email / name — each individually encrypted, matching
        // the reference app's convention. No password, role, permission, or menu data.
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, CommonMethods.EncryptValue(user.UserId.ToString())),
            new(JwtRegisteredClaimNames.Email, CommonMethods.EncryptValue(user.Email ?? string.Empty)),
            new(JwtRegisteredClaimNames.Name, CommonMethods.EncryptValue(user.FullName ?? string.Empty)),
        };

        DateTime issuedAt = DateTime.UtcNow;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Audience = settings.Audience,
            Issuer = settings.Issuer,
            Subject = new ClaimsIdentity(claims),
            IssuedAt = issuedAt,
            NotBefore = issuedAt,
            Expires = issuedAt.AddDays(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
