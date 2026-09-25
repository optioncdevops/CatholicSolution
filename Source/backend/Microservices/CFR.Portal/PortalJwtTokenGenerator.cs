// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.IdentityModel.Tokens;

namespace CFR.Portal
{
    /// <summary>
    /// Issues HMAC-SHA256 JWTs for authenticated Portal members and product identity exchange.
    /// </summary>
    public class PortalJwtTokenGenerator(IOptions<JWTSetting> jwtSetting, IConfiguration configuration): IPortalJwtTokenGenerator
    {
        private const int IdentityLifetimeSeconds = 120;

        /// <summary>
        /// Generates a signed session JWT for the authenticated CFR member.
        /// </summary>
        /// <param name="user">Authenticated member profile.</param>
        /// <returns>JWT string.</returns>
        public string GenerateToken(PortalLoginUserResult user)
        {
            ArgumentNullException.ThrowIfNull(user);

            if (string.IsNullOrEmpty(jwtSetting.Value.SecurityKey))
            {
                throw new InvalidOperationException("JWT SecurityKey is not configured.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            byte[] tokenKey = Encoding.UTF8.GetBytes(jwtSetting.Value.SecurityKey);
            var claimsList = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Email, EncryptionHelper.EncryptValue(user.EMail ?? string.Empty)),
                new(JwtRegisteredClaimNames.Sub, EncryptionHelper.EncryptValue(user.UserId.ToString())),
                new(JwtRegisteredClaimNames.Name, EncryptionHelper.EncryptValue($"{user.FirstName} {user.LastName}".Trim())),
                new(Constant.SessionField.UserId, user.UserId.ToString()),
                new(Constant.SessionField.UserName, user.EMail ?? string.Empty),
                new(Constant.SessionField.FirstName, user.FirstName ?? string.Empty),
                new(Constant.SessionField.LastName, user.LastName ?? string.Empty),
                new(Constant.SessionField.RoleId, "0")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = jwtSetting.Value.Audience,
                Issuer = jwtSetting.Value.Issuer,
                Subject = new ClaimsIdentity(claimsList),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Generates a short-lived signed identity JWT after a successful code exchange.
        /// </summary>
        /// <param name="cfrUserId">CFR member identifier.</param>
        /// <param name="email">Member email.</param>
        /// <param name="productId">Product that exchanged the code.</param>
        /// <param name="launchId">Launch transaction identifier used as jti.</param>
        /// <returns>JWT string.</returns>
        public string GenerateIdentityToken(Guid cfrUserId, string email, int productId, int launchId)
        {
            if (string.IsNullOrEmpty(jwtSetting.Value.SecurityKey))
            {
                throw new InvalidOperationException("JWT SecurityKey is not configured.");
            }

            string? audience = configuration["JWTSetting:IdentityAudience"];
            if (string.IsNullOrWhiteSpace(audience))
            {
                audience = jwtSetting.Value.Audience ?? string.Empty;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            byte[] tokenKey = Encoding.UTF8.GetBytes(jwtSetting.Value.SecurityKey);
            var claimsList = new List<Claim>
            {
                new("cfrUserId", cfrUserId.ToString()),
                new(JwtRegisteredClaimNames.Email, email ?? string.Empty),
                new("productId", productId.ToString()),
                new(JwtRegisteredClaimNames.Sub, cfrUserId.ToString()),
                new(JwtRegisteredClaimNames.Jti, launchId.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = audience,
                Issuer = jwtSetting.Value.Issuer,
                Subject = new ClaimsIdentity(claimsList),
                Expires = DateTime.UtcNow.AddSeconds(IdentityLifetimeSeconds),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
