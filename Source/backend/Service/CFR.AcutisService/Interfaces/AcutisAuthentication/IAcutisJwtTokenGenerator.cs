// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.AcutisAuthentication
{
    /// <summary>
    /// Issues JWT access tokens for authenticated Acutis users.
    /// </summary>
    public interface IAcutisJwtTokenGenerator
    {
        /// <summary>
        /// Generates a signed JWT for the authenticated Acutis user.
        /// </summary>
        /// <param name="user">Authenticated user profile.</param>
        /// <returns>JWT string.</returns>
        string GenerateToken(AcutisLoginUserResult user);
    }
}
