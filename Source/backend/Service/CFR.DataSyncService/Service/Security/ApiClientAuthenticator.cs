// Copyright (c) OptionC. All rights reserved.

using System.Collections.Concurrent;
using System.Globalization;

using CFR.DataSyncService.Models.Security;

namespace CFR.DataSyncService.Service.Security
{
    /// <summary>
    /// Implements the eight HMAC request-signing validation steps against sec.ApiClient /
    /// sec.RequestNonce, using IHmacSigningService for canonical-string/signature/decrypt work.
    /// IP allow-listing (the spec's original step 3) has been removed per request — ApiClient
    /// access is no longer restricted by caller IP.
    /// </summary>
    public class ApiClientAuthenticator(IApiClientRepository repository, IHmacSigningService signingService, IConfiguration configuration, ILogger<ApiClientAuthenticator> logger): IApiClientAuthenticator
    {
        // ClientId -> (window start, request count). Shared across requests via the static field —
        // deliberately simple in-process fixed-window limiting for Phase 1 (see plan deviation #7:
        // per-client identity is only known after signature verification, so this cannot run as an
        // ASP.NET Core RateLimiter middleware policy ahead of that point).
        private static readonly ConcurrentDictionary<string, (DateTime WindowStart, int Count)> RateLimitState = new();

        private static readonly HmacAuthenticationResult Failure = new() { Success = false };

        private readonly int _clockSkewMinutes = configuration.GetValue("HmacSettings:ClockSkewMinutes", 5);

        /// <inheritdoc />
        public async Task<HmacAuthenticationResult> AuthenticateAsync(HmacAuthenticationRequest request)
        {
            try
            {
                // Step 1: parse/require headers.
                if (string.IsNullOrWhiteSpace(request.ClientId) || string.IsNullOrWhiteSpace(request.Timestamp)
                    || string.IsNullOrWhiteSpace(request.Nonce) || string.IsNullOrWhiteSpace(request.ContentSha256)
                    || string.IsNullOrWhiteSpace(request.Authorization))
                {
                    return Failure;
                }

                string? providedSignature = ExtractSignature(request.Authorization);
                if (providedSignature == null)
                {
                    return Failure;
                }

                // Step 2: load ApiClient.
                var apiClient = await repository.GetByClientIdAsync(request.ClientId);
                if (apiClient == null || !apiClient.IsActive)
                {
                    return Failure;
                }

                // Step 3: clock skew.
                if (!DateTimeOffset.TryParse(request.Timestamp, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var requestTime))
                {
                    return Failure;
                }

                if (Math.Abs((DateTimeOffset.UtcNow - requestTime).TotalMinutes) > _clockSkewMinutes)
                {
                    return Failure;
                }

                // Step 4: nonce replay.
                bool nonceIsNew = await repository.TryInsertNonceAsync(request.ClientId, request.Nonce);
                if (!nonceIsNew)
                {
                    return Failure;
                }

                // Step 5: body hash.
                string computedBodyHash = signingService.ComputeBodySha256Hex(request.RawBody);
                if (!string.Equals(computedBodyHash, request.ContentSha256, StringComparison.OrdinalIgnoreCase))
                {
                    return Failure;
                }

                // Step 6: signature, current secret then previous (rotation window).
                string canonicalString = signingService.BuildCanonicalString(
                    request.HttpMethod, request.Path, request.CanonicalQueryString,
                    request.ClientId, request.Timestamp, request.Nonce, request.ContentSha256);

                bool signatureValid = signingService.VerifySignature(canonicalString, providedSignature, signingService.DecryptSecret(apiClient.ClientSecretEncrypted));

                if (!signatureValid && apiClient.PreviousSecretEncrypted != null && apiClient.PreviousSecretExpiresDate > DateTime.UtcNow)
                {
                    signatureValid = signingService.VerifySignature(canonicalString, providedSignature, signingService.DecryptSecret(apiClient.PreviousSecretEncrypted));
                }

                if (!signatureValid)
                {
                    return Failure;
                }

                // Step 7: per-client rate limit.
                if (!CheckRateLimit(apiClient.ClientId, apiClient.RateLimitPerMinute))
                {
                    return Failure;
                }

                // Step 8: populate result.
                return new HmacAuthenticationResult
                {
                    Success = true,
                    ApiClientId = apiClient.ApiClientId,
                    ClientId = apiClient.ClientId,
                    ProductId = apiClient.ProductId,
                    RateLimitPerMinute = apiClient.RateLimitPerMinute,
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.AuthenticationFailed, request.ClientId ?? string.Empty);
                return Failure;
            }
        }

        private static string? ExtractSignature(string authorizationHeader)
        {
            const string prefix = "CFR-HMAC-SHA256 Signature=";
            int index = authorizationHeader.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
            return index < 0 ? null : authorizationHeader[(index + prefix.Length)..].Trim();
        }

        private static bool CheckRateLimit(string clientId, int rateLimitPerMinute)
        {
            var now = DateTime.UtcNow;
            var entry = RateLimitState.AddOrUpdate(
                clientId,
                _ => (now, 1),
                (_, existing) => now - existing.WindowStart > TimeSpan.FromMinutes(1)
                    ? (now, 1)
                    : (existing.WindowStart, existing.Count + 1));

            return entry.Count <= rateLimitPerMinute;
        }
    }
}
