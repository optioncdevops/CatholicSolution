// Copyright (c) OptionC. All rights reserved.

using CFR.SyncService.Models.Security;

namespace CFR.SyncService.Interfaces.Security
{
    /// <summary>
    /// Orchestrates the HMAC request-signing validation steps from the CFR.Sync spec: header
    /// parsing, ApiClient lookup, clock skew, nonce replay, body-hash, signature, rate limit/body
    /// size, and populating the authenticated-client result. IP allow-listing is intentionally not
    /// enforced — ApiClient access is not restricted by caller IP.
    /// </summary>
    public interface IApiClientAuthenticator
    {
        /// <summary>
        /// Validates a signed request end to end.
        /// </summary>
        /// <remarks>
        /// Purpose: Decide whether a request is an authentic, non-replayed call from an active,
        /// rate-limit-compliant, IP-allowed ApiClient.
        /// Request Flow: HmacAuthenticationMiddleware -> ApiClientAuthenticator.AuthenticateAsync().
        /// Validation Details: Runs all nine checks in order and stops at the first failure.
        /// Business Logic: Never reveals which check failed — every failure yields Success = false.
        /// Repository Interaction: Calls IApiClientRepository for the ApiClient row and nonce insert.
        /// Response Details: An AuthenticatedClient result on success, or Success = false.
        /// </remarks>
        /// <param name="request">The parsed request context to validate.</param>
        /// <returns>The authentication result.</returns>
        Task<HmacAuthenticationResult> AuthenticateAsync(HmacAuthenticationRequest request);
    }
}
