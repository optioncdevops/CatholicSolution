// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncInfrastructure.Models.Output
{
    /// <summary>
    /// Raw <c>sec.ApiClient</c> row used only by the HMAC authentication pipeline. Never returned
    /// directly to a controller.
    /// </summary>
    public class ApiClientOutput
    {
        public int ApiClientId { get; set; }

        public string ClientId { get; set; } = string.Empty;

        /// <summary>AES-256-GCM ciphertext: Nonce(12) || Tag(16) || Ciphertext, decrypted by IHmacSigningService.</summary>
        public byte[] ClientSecretEncrypted { get; set; } = [];

        public int ProductId { get; set; }

        public int RateLimitPerMinute { get; set; }

        public bool IsActive { get; set; }

        public byte[]? PreviousSecretEncrypted { get; set; }

        public DateTime? PreviousSecretExpiresDate { get; set; }
    }

    /// <summary>
    /// Raw <c>sec.IdempotencyRecord</c> row.
    /// </summary>
    public class IdempotencyRecordOutput
    {
        public int ResponseStatusCode { get; set; }

        public string ResponseBody { get; set; } = string.Empty;

        public byte[] RequestHash { get; set; } = [];
    }
}
