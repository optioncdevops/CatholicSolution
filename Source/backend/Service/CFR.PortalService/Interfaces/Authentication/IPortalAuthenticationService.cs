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

        #endregion POST Methods
    }
}
