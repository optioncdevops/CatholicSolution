// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.Authentication
{
    /// <summary>
    /// Service contract for Portal member authentication.
    /// Acts as the business-logic layer between PortalLoginController and IPortalAuthenticationRepository.
    /// Responsibility:
    /// - Declares methods to authenticate members and attach a session JWT.
    /// - Relies on IPortalAuthenticationRepository for stored procedure execution.
    /// </summary>
    public interface IPortalAuthenticationService
    {
        #region POST Methods

        /// <summary>
        /// Authenticates a CFR member.
        /// </summary>
        /// <remarks>
        /// Purpose: Verify credentials and issue a session JWT.
        /// Request Flow: PortalLoginController -> IPortalAuthenticationService.LoginAuthenticationAsync() -> IPortalAuthenticationRepository.AuthenticateAsync().
        /// Validation Details: Email and password are required.
        /// Business Logic: Attaches a JWT after a successful repository lookup.
        /// Repository Interaction: Calls IPortalAuthenticationRepository.AuthenticateAsync().
        /// Response Details: MSResultArgs containing PortalLoginQueryResult, or UnAuthorized.
        /// </remarks>
        /// <param name="request">Credential request.</param>
        /// <returns>MSResultArgs containing the login result.</returns>
        Task<MSResultArgs> LoginAuthenticationAsync(PortalAuthenticationInput request);

        /// <summary>
        /// Exchanges a verified Auth0 access token for a CFR Portal session JWT.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a CFR frontend already authenticated via Auth0 obtain a Portal
        /// JWT that CFR.Portal's own [Authorize] endpoints will actually accept - the
        /// raw Auth0 token is signed with Auth0's key, not CFR's, and is never accepted
        /// directly.
        /// Request Flow: PortalLoginController -> IPortalAuthenticationService.ExchangeAuth0TokenAsync() -> IAuth0UserInfoClient -> IPortalAuthenticationRepository.GetByEmailAsync().
        /// Validation Details: AccessToken is required; the resolved email must match an existing CFR member.
        /// Business Logic: Verifies the token via Auth0's /userinfo, then issues a CFR-signed session JWT for the matching member.
        /// Repository Interaction: Calls IPortalAuthenticationRepository.GetByEmailAsync().
        /// Response Details: MSResultArgs containing PortalLoginQueryResult, or UnAuthorized when the token is invalid or no matching member exists.
        /// </remarks>
        /// <param name="request">Exchange request containing the Auth0 access token.</param>
        /// <returns>MSResultArgs containing the login result.</returns>
        Task<MSResultArgs> ExchangeAuth0TokenAsync(Auth0ExchangeInput request);

        #endregion POST Methods
    }
}
