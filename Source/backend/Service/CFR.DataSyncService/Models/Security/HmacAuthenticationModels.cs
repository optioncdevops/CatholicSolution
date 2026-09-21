// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Models.Security
{
    /// <summary>
    /// Everything HmacAuthenticationMiddleware extracts from the raw HTTP request for
    /// IApiClientAuthenticator to validate. Never crosses a controller boundary.
    /// </summary>
    public class HmacAuthenticationRequest
    {
        public string? ClientId { get; set; }

        public string? Timestamp { get; set; }

        public string? Nonce { get; set; }

        public string? ContentSha256 { get; set; }

        public string? Authorization { get; set; }

        public string HttpMethod { get; set; } = string.Empty;

        public string Path { get; set; } = string.Empty;

        public string CanonicalQueryString { get; set; } = string.Empty;

        public byte[] RawBody { get; set; } = [];

        public string ClientIp { get; set; } = string.Empty;
    }

    /// <summary>
    /// Outcome of IApiClientAuthenticator.AuthenticateAsync. On failure, only <see cref="Success"/>
    /// is meaningful — per spec, every failure surfaces the same generic 401 to the caller so the
    /// response never reveals which of the nine checks failed.
    /// </summary>
    public class HmacAuthenticationResult
    {
        public bool Success { get; set; }

        public int ApiClientId { get; set; }

        public string ClientId { get; set; } = string.Empty;

        public int ProductId { get; set; }

        public int RateLimitPerMinute { get; set; }
    }
}
