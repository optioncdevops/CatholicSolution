// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncService.Interfaces.Security
{
    /// <summary>
    /// Defines the interface for the current authenticated ApiClient, populated by
    /// HmacAuthenticationMiddleware once signature verification succeeds. Mirrors
    /// ICurrentUserService's role for JWT-based microservices, but scoped to a machine
    /// client (a product's backend) instead of a logged-in human.
    /// </summary>
    public interface ICurrentApiClient
    {
        bool IsAuthenticated { get; set; }

        int ApiClientId { get; set; }

        string ClientId { get; set; }

        int ProductId { get; set; }

        List<string> AllowedScopes { get; set; }

        string ClientIPAddress { get; set; }
    }
}
