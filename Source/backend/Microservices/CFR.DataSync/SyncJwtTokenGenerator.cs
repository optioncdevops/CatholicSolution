// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.IdentityModel.Tokens;

namespace CFR.DataSync
{
    /// <summary>
    /// Issues HMAC-SHA256 JWTs for authenticated ApiClients, mirroring AcutisJwtTokenGenerator's
    /// shape but with ApiClientId/ClientId/ProductId claims instead of a human user's identity.
    /// Lives here (not CFR.DataSyncService) because JWTSetting is defined in CFR.Base, which only the
    /// microservice host project references — same split as CFR.Acutis/AcutisJwtTokenGenerator.
    /// </summary>
    public class SyncJwtTokenGenerator(IOptions<JWTSetting> jwtSetting): IJwtTokenGenerator
    {
        private const int ExpiryMinutes = 60;

        /// <inheritdoc />
        public (string Token, DateTime ExpiresAt) GenerateToken(ApiClientOutput apiClient)
        {
            ArgumentNullException.ThrowIfNull(apiClient);

            if (string.IsNullOrEmpty(jwtSetting.Value.SecurityKey))
            {
                throw new InvalidOperationException("JWT SecurityKey is not configured.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            byte[] tokenKey = Encoding.UTF8.GetBytes(jwtSetting.Value.SecurityKey);
            DateTime expiresAt = DateTime.UtcNow.AddMinutes(ExpiryMinutes);

            var claimsList = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, apiClient.ApiClientId.ToString()),
                new(SyncClaimTypes.ApiClientId, apiClient.ApiClientId.ToString()),
                new(SyncClaimTypes.ClientId, apiClient.ClientId),
                new(SyncClaimTypes.ProductId, apiClient.ProductId.ToString()),
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = jwtSetting.Value.Audience,
                Issuer = jwtSetting.Value.Issuer,
                Subject = new ClaimsIdentity(claimsList),
                Expires = expiresAt,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256),
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return (tokenHandler.WriteToken(token), expiresAt);
        }
    }
}
