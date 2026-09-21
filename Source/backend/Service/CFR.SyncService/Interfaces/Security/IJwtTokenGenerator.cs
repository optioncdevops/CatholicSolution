// Copyright (c) OptionC. All rights reserved.

using CFR.SyncInfrastructure.Models.Output;

namespace CFR.SyncService.Interfaces.Security
{
    /// <summary>
    /// Issues the JWT a product uses to call every other CFR.Sync endpoint after logging in.
    /// </summary>
    public interface IJwtTokenGenerator
    {
        /// <summary>
        /// Generates a signed JWT carrying the authenticated ApiClient's identity.
        /// </summary>
        /// <param name="apiClient">The authenticated ApiClient row (ApiClientId/ClientId/ProductId).</param>
        /// <returns>The signed JWT and its expiry.</returns>
        (string Token, DateTime ExpiresAt) GenerateToken(ApiClientOutput apiClient);
    }
}
