// Copyright (c) OptionC. All rights reserved.

using CFR.DataSyncInfrastructure.Models.Output;

namespace CFR.DataSyncService.Interfaces.Security
{
    /// <summary>
    /// Issues the JWT a product uses to call every other CFR.DataSync endpoint after logging in.
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
