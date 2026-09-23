// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.PlatformLaunch
{
    /// <summary>
    /// Service contract for App Hub platform-launch code exchange.
    /// Responsibility:
    /// - Declares one-time-code exchange, producing a normal Portal session JWT on success.
    /// - Relies on IPlatformLaunchRepository for stored procedure execution and
    ///   IPortalJwtTokenGenerator for the same token shape normal password login issues.
    /// </summary>
    public interface IPlatformLaunchService
    {
        #region POST Methods

        /// <summary>
        /// Exchanges a one-time platform-launch code for a Portal session.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a browser that arrived with a code (minted server-to-server by a trusted
        /// caller such as CFR.DataSync) land on the App Hub already signed in.
        /// Request Flow: PlatformLaunchController -> IPlatformLaunchService.ExchangeTokenAsync -> IPlatformLaunchRepository.
        /// Validation Details: Code is required.
        /// Business Logic: Hashes the code, validates/consumes it, then issues a normal session JWT.
        /// Repository Interaction: Calls IPlatformLaunchRepository.ExchangeCodeAsync.
        /// Response Details: ResultArgs containing the same {user} shape as normal Portal login.
        /// </remarks>
        /// <param name="input">Request containing the one-time code.</param>
        /// <returns>MSResultArgs containing PortalLoginQueryResult on success.</returns>
        Task<MSResultArgs> ExchangeTokenAsync(PlatformLaunchExchangeInput input);

        #endregion POST Methods
    }
}
