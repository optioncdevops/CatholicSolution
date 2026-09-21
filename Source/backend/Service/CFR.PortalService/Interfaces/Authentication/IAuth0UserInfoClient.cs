// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.Authentication
{
    /// <summary>
    /// Verifies an Auth0 access token and resolves the identity behind it.
    /// Implemented in the Microservices layer (Auth0UserInfoClient), where the
    /// Auth0 tenant configuration and HttpClient naturally live - mirrors how
    /// IPortalJwtTokenGenerator is declared here and implemented there.
    /// </summary>
    public interface IAuth0UserInfoClient
    {
        /// <summary>
        /// Calls Auth0's /userinfo endpoint with the given access token.
        /// </summary>
        /// <param name="accessToken">The Auth0 access token to verify.</param>
        /// <returns>The resolved identity, or null if the token is invalid/expired or Auth0 is unreachable.</returns>
        Task<Auth0UserInfo?> GetUserInfoAsync(string accessToken);
    }
}
