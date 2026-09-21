// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.Security
{
    /// <summary>
    /// Pure canonical-string / HMAC-SHA256 signing helper, plus AES-256-GCM encrypt/decrypt of the
    /// at-rest ApiClient secret (see 004_Sync_Security_Schema.sql for why the secret is encrypted,
    /// not hashed — HMAC verification needs the actual key bytes back).
    /// </summary>
    public interface IHmacSigningService
    {
        /// <summary>
        /// Builds the canonical, LF-joined string that both sides sign.
        /// </summary>
        /// <param name="httpMethod">Uppercase HTTP method.</param>
        /// <param name="path">Lowercase request path, no query string.</param>
        /// <param name="canonicalQueryString">Query params sorted by name, URL-encoded, k=v joined by &amp;.</param>
        /// <param name="clientId">X-Cfr-Client-Id header value.</param>
        /// <param name="timestamp">X-Cfr-Timestamp header value.</param>
        /// <param name="nonce">X-Cfr-Nonce header value.</param>
        /// <param name="contentSha256Hex">Lowercase hex SHA-256 of the raw request body.</param>
        /// <returns>The canonical string to sign.</returns>
        string BuildCanonicalString(string httpMethod, string path, string canonicalQueryString, string clientId, string timestamp, string nonce, string contentSha256Hex);

        /// <summary>
        /// Computes the lowercase hex SHA-256 of a request body (empty string's hash for bodyless requests).
        /// </summary>
        string ComputeBodySha256Hex(ReadOnlySpan<byte> body);

        /// <summary>
        /// Verifies a client-supplied signature against a canonical string using a fixed-time comparison.
        /// </summary>
        /// <param name="canonicalString">The canonical string this server independently computed.</param>
        /// <param name="providedSignatureBase64">The Authorization header's Signature value.</param>
        /// <param name="clientSecret">The plaintext client secret (decrypted from storage).</param>
        /// <returns>True when the signature matches.</returns>
        bool VerifySignature(string canonicalString, string providedSignatureBase64, byte[] clientSecret);

        /// <summary>
        /// Encrypts a plaintext client secret for storage in sec.ApiClient.
        /// </summary>
        /// <returns>Nonce(12) || Tag(16) || Ciphertext, concatenated.</returns>
        byte[] EncryptSecret(byte[] plaintextSecret);

        /// <summary>
        /// Decrypts a stored ApiClient secret back to its plaintext bytes.
        /// </summary>
        /// <param name="encrypted">Nonce(12) || Tag(16) || Ciphertext, as stored.</param>
        byte[] DecryptSecret(byte[] encrypted);
    }
}
