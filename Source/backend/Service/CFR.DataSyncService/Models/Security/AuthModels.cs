// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.DataSyncService.Models.Security
{
    /// <summary>
    /// Request body for POST /api/v1/Auth/Login — a product authenticates once with its
    /// ClientId/ClientSecret and gets a JWT back; every other endpoint requires that JWT only.
    /// </summary>
    public class AuthLoginInput
    {
        [JsonPropertyName("clientId")]
        public string ClientId { get; set; } = string.Empty;

        [JsonPropertyName("clientSecret")]
        public string ClientSecret { get; set; } = string.Empty;
    }

    /// <summary>
    /// Successful login response — the bearer token and how long it is valid for.
    /// </summary>
    public class AuthLoginOutput
    {
        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("tokenType")]
        public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("expiresAt")]
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// Custom JWT claim type names shared by the token generator (writes them) and the
    /// claims-population middleware (reads them back into ICurrentApiClient).
    /// </summary>
    public static class SyncClaimTypes
    {
        public const string ApiClientId = "api_client_id";
        public const string ClientId = "client_id";
        public const string ProductId = "product_id";
    }
}
