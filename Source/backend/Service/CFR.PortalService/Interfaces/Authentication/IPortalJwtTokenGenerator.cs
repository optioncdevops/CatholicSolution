// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.Authentication
{
    /// <summary>
    /// Issues JWT access tokens for authenticated Portal members.
    /// </summary>
    public interface IPortalJwtTokenGenerator
    {
        /// <summary>
        /// Generates a signed session JWT for the authenticated CFR member.
        /// </summary>
        /// <param name="user">Authenticated member profile.</param>
        /// <returns>JWT string.</returns>
        string GenerateToken(PortalLoginUserResult user);

        /// <summary>
        /// Generates a short-lived signed identity JWT after a successful code exchange.
        /// </summary>
        /// <param name="cfrUserId">CFR member identifier.</param>
        /// <param name="email">Member email.</param>
        /// <param name="productId">Product that exchanged the code.</param>
        /// <param name="launchId">Launch transaction identifier used as jti.</param>
        /// <returns>JWT string.</returns>
        string GenerateIdentityToken(int cfrUserId, string email, int productId, int launchId);
    }
}
