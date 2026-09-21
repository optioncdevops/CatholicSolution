// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;

namespace CFR.Sync.Middlewares
{
    /// <summary>
    /// Runs after JWT bearer authentication. When the request carries a valid token, copies its
    /// ApiClientId/ClientId/ProductId claims onto the scoped ICurrentApiClient — the same role
    /// HmacAuthenticationMiddleware used to play — and computes the raw body's SHA-256 hash for
    /// IUserSyncService's Idempotency-Key replay check (previously the client-supplied, HMAC-signed
    /// X-Cfr-Content-SHA256 header; now computed server-side since there is no signed header anymore).
    /// [Authorize] on the protected controllers is what actually rejects an unauthenticated request —
    /// this middleware only populates state for requests that already passed that check.
    /// </summary>
    public class CurrentApiClientClaimsMiddleware(RequestDelegate next)
    {
        public async Task Invoke(HttpContext context, ICurrentApiClient currentApiClient)
        {
            ArgumentNullException.ThrowIfNull(context);

            if (context.User.Identity?.IsAuthenticated == true)
            {
                string? apiClientIdClaim = context.User.FindFirst(SyncClaimTypes.ApiClientId)?.Value;
                string? clientIdClaim = context.User.FindFirst(SyncClaimTypes.ClientId)?.Value;
                string? productIdClaim = context.User.FindFirst(SyncClaimTypes.ProductId)?.Value;

                if (int.TryParse(apiClientIdClaim, out int apiClientId) && int.TryParse(productIdClaim, out int productId) && clientIdClaim != null)
                {
                    currentApiClient.IsAuthenticated = true;
                    currentApiClient.ApiClientId = apiClientId;
                    currentApiClient.ClientId = clientIdClaim;
                    currentApiClient.ProductId = productId;
                    currentApiClient.ClientIPAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                }

                context.Items["ContentSha256Hex"] = await ComputeBodySha256HexAsync(context.Request);
            }

            await next(context);
        }

        private static async Task<string> ComputeBodySha256HexAsync(HttpRequest request)
        {
            if (!request.Body.CanSeek)
            {
                request.EnableBuffering();
            }

            using var memoryStream = new MemoryStream();
            await request.Body.CopyToAsync(memoryStream);
            request.Body.Position = 0;

            byte[] hash = SHA256.HashData(memoryStream.ToArray());
            return Convert.ToHexStringLower(hash);
        }
    }

    public static class CurrentApiClientClaimsMiddlewareExtensions
    {
        public static IApplicationBuilder UseCurrentApiClientClaims(this IApplicationBuilder app)
        {
            return app.UseMiddleware<CurrentApiClientClaimsMiddleware>();
        }
    }
}
