// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.IdentityModel.Tokens;

namespace CFR.Acutis
{
    /// <summary>
    /// Issues HMAC-SHA256 JWTs for authenticated Acutis users.
    /// </summary>
    public class AcutisJwtTokenGenerator(IOptions<JWTSetting> jwtSetting): IAcutisJwtTokenGenerator
    {
        /// <summary>
        /// Generates a signed JWT for the authenticated Acutis user.
        /// </summary>
        /// <param name="user">Authenticated user profile.</param>
        /// <returns>JWT string.</returns>
        public string GenerateToken(AcutisLoginUserResult user)
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
                new(JwtRegisteredClaimNames.Name, EncryptionHelper.EncryptValue(user.FullName ?? string.Empty)),
                new(Constant.SessionField.RoleId, user.RoleId.ToString())
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
    }
}
