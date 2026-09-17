// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;
using System.Text;

namespace CFR.SyncService.Service.Security
{
    /// <summary>
    /// Implements canonical-string building, fixed-time HMAC-SHA256 verification, and AES-256-GCM
    /// encrypt/decrypt of the at-rest ApiClient secret.
    /// </summary>
    public class HmacSigningService: IHmacSigningService
    {
        private const int NonceLength = 12;
        private const int TagLength = 16;

        private readonly byte[] _encryptionKey;

        public HmacSigningService(IConfiguration configuration)
        {
            ArgumentNullException.ThrowIfNull(configuration);
            string keyBase64 = configuration["HmacSettings:SecretEncryptionKeyBase64"]
                ?? throw new InvalidOperationException("HmacSettings:SecretEncryptionKeyBase64 is not configured.");
            _encryptionKey = Convert.FromBase64String(keyBase64);
        }

        /// <inheritdoc />
        public string BuildCanonicalString(string httpMethod, string path, string canonicalQueryString, string clientId, string timestamp, string nonce, string contentSha256Hex)
        {
            return string.Join('\n', httpMethod, path, canonicalQueryString, clientId, timestamp, nonce, contentSha256Hex);
        }

        /// <inheritdoc />
        public string ComputeBodySha256Hex(ReadOnlySpan<byte> body)
        {
            Span<byte> hash = stackalloc byte[32];
            SHA256.HashData(body, hash);
            return Convert.ToHexStringLower(hash);
        }

        /// <inheritdoc />
        public bool VerifySignature(string canonicalString, string providedSignatureBase64, byte[] clientSecret)
        {
            byte[] expected = HMACSHA256.HashData(clientSecret, Encoding.UTF8.GetBytes(canonicalString));

            byte[] provided;
            try
            {
                provided = Convert.FromBase64String(providedSignatureBase64);
            }
            catch (FormatException)
            {
                return false;
            }

            return CryptographicOperations.FixedTimeEquals(expected, provided);
        }

        /// <inheritdoc />
        public byte[] EncryptSecret(byte[] plaintextSecret)
        {
            byte[] nonce = RandomNumberGenerator.GetBytes(NonceLength);
            byte[] tag = new byte[TagLength];
            byte[] ciphertext = new byte[plaintextSecret.Length];

            using var aesGcm = new AesGcm(_encryptionKey, TagLength);
            aesGcm.Encrypt(nonce, plaintextSecret, ciphertext, tag);

            byte[] result = new byte[NonceLength + TagLength + ciphertext.Length];
            nonce.CopyTo(result, 0);
            tag.CopyTo(result, NonceLength);
            ciphertext.CopyTo(result, NonceLength + TagLength);
            return result;
        }

        /// <inheritdoc />
        public byte[] DecryptSecret(byte[] encrypted)
        {
            ReadOnlySpan<byte> span = encrypted;
            ReadOnlySpan<byte> nonce = span[..NonceLength];
            ReadOnlySpan<byte> tag = span.Slice(NonceLength, TagLength);
            ReadOnlySpan<byte> ciphertext = span[(NonceLength + TagLength)..];

            byte[] plaintext = new byte[ciphertext.Length];
            using var aesGcm = new AesGcm(_encryptionKey, TagLength);
            aesGcm.Decrypt(nonce, ciphertext, tag, plaintext);
            return plaintext;
        }
    }
}
