// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;

namespace CFR.Common
{
    /// <summary>
    /// AES + Base64Url encryption matching OptionC's own EncryptionHelper.EncryptValue exactly
    /// (same Aes.Create() defaults - CBC mode, PKCS7 padding - same UTF8 key/IV byte encoding, same
    /// Base64Url character substitution), so the ciphertext this produces decrypts correctly on the
    /// SMS side with the shared OrgSetupExchangeKey/OrgSetupExchangeIV.
    /// </summary>
    public static class OrgSetupEncryptionHelper
    {
        /// <summary>
        /// Encrypts plainText with the given key/IV (both UTF8 strings - 32 bytes for AES-256 key,
        /// 16 bytes for the IV) and returns Base64Url ciphertext (no padding, URL-safe characters).
        /// </summary>
        public static string EncryptValue(string plainText, string key, string iv)
        {
            using var aesAlg = Aes.Create();
            aesAlg.Key = Encoding.UTF8.GetBytes(key);
            aesAlg.IV = Encoding.UTF8.GetBytes(iv);

            var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }

            string base64 = Convert.ToBase64String(msEncrypt.ToArray());
            return ToBase64Url(base64);
        }

        private static string ToBase64Url(string base64)
        {
            return base64.Replace('+', '-').Replace('/', '_').Replace("=", "");
        }
    }
}
