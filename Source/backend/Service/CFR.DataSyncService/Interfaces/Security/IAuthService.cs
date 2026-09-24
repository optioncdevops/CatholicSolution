// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.Security
{
    /// <summary>
    /// Business logic for the ClientId/ClientSecret login that issues the JWT every other
    /// CFR.DataSync endpoint requires.
    /// </summary>
    public interface IAuthService
    {
        #region POST Methods

        /// <summary>
        /// Validates a ClientId/ClientSecret pair and issues a JWT for the matching ApiClient.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product exchange its registered credential for a bearer token.
        /// Request Flow: AuthController -> IAuthService.LoginAsync() -> IApiClientRepository.GetByClientIdAsync().
        /// Validation Details: ClientId/ClientSecret required; ApiClient must exist, be active, and
        /// the secret must match exactly (constant-time comparison).
        /// Business Logic: Never reveals whether the ClientId or the ClientSecret was wrong — a
        /// single generic UNAUTHENTICATED failure either way.
        /// Repository Interaction: Calls repository.GetByClientIdAsync().
        /// Response Details: MSResultArgs containing AuthLoginOutput, or a 401 UNAUTHENTICATED error.
        /// </remarks>
        /// <param name="input">The ClientId/ClientSecret to validate.</param>
        /// <returns>MSResultArgs containing the issued token, or an error.</returns>
        Task<MSResultArgs> LoginAsync(AuthLoginInput input);

        #endregion POST Methods
    }
}
