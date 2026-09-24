// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// Raw <c>sec.ApiClient</c> row used only by the JWT login pipeline. Never returned
    /// directly to a controller.
    /// </summary>
    public class ApiClientOutput
    {
        /// <summary>Internal identifier of the ApiClient row.</summary>
        public int ApiClientId { get; set; }

        /// <summary>The product's API client identifier (used to log in and get a JWT).</summary>
        public string ClientId { get; set; } = string.Empty;

        /// <summary>Plaintext — compared directly against the ClientSecret posted to the login endpoint.</summary>
        public string ClientSecret { get; set; } = string.Empty;

        /// <summary>ProductId this ApiClient is scoped to.</summary>
        public int ProductId { get; set; }

        /// <summary>Per-client requests-per-minute limit.</summary>
        public int RateLimitPerMinute { get; set; }

        /// <summary>Per-client cap on how many rows one bulk-create request may contain.</summary>
        public int MaxBulkUserCount { get; set; }

        /// <summary>Whether this ApiClient is currently allowed to log in.</summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Raw <c>sec.IdempotencyRecord</c> row.
    /// </summary>
    public class IdempotencyRecordOutput
    {
        /// <summary>HTTP status code of the stored response.</summary>
        public int ResponseStatusCode { get; set; }

        /// <summary>Serialized response body to replay for a repeated idempotency key.</summary>
        public string ResponseBody { get; set; } = string.Empty;

        /// <summary>SHA-256 hash of the raw request body originally stored with this record.</summary>
        public byte[] RequestHash { get; set; } = [];
    }
}
