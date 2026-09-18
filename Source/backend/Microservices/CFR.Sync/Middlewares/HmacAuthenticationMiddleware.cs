// Copyright (c) OptionC. All rights reserved.

using System.Text;

using CFR.SyncService.Models.Security;

using Microsoft.Extensions.Primitives;

namespace CFR.Sync.Middlewares
{
    /// <summary>
    /// Verifies every request's HMAC signature before it reaches MVC. Modeled on
    /// ClientInfoMiddleware's registration style (CFR.Base), but a separate, self-contained
    /// pipeline — the caller here is a product's backend authenticating with a shared secret, not
    /// a logged-in user authenticating with a JWT. Unsigned health-check paths are exempt.
    /// </summary>
    public class HmacAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        private static readonly string[] UnsignedPaths = ["/health/live", "/health/ready"];

        private readonly long _maxBodySizeBytes = configuration.GetValue("HmacSettings:MaxBodySizeBytes", 1024 * 1024L);

        public async Task Invoke(HttpContext context, IApiClientAuthenticator authenticator, ICurrentApiClient currentApiClient)
        {
            ArgumentNullException.ThrowIfNull(context);

            if (UnsignedPaths.Contains(context.Request.Path.Value, StringComparer.OrdinalIgnoreCase))
            {
                await next(context);
                return;
            }

            if (context.Request.ContentLength > _maxBodySizeBytes)
            {
                await WriteErrorAsync(context, StatusCodes.Status413PayloadTooLarge, ErrorMessages.PayloadTooLarge, SyncErrorCodes.PayloadTooLarge);
                return;
            }

            context.Request.EnableBuffering();
            byte[] bodyBytes;
            using (var memoryStream = new MemoryStream())
            {
                await context.Request.Body.CopyToAsync(memoryStream);
                bodyBytes = memoryStream.ToArray();
                context.Request.Body.Position = 0;
            }

            if (bodyBytes.Length > _maxBodySizeBytes)
            {
                await WriteErrorAsync(context, StatusCodes.Status413PayloadTooLarge, ErrorMessages.PayloadTooLarge, SyncErrorCodes.PayloadTooLarge);
                return;
            }

            var request = new HmacAuthenticationRequest
            {
                ClientId = GetHeader(context, "X-Cfr-Client-Id"),
                Timestamp = GetHeader(context, "X-Cfr-Timestamp"),
                Nonce = GetHeader(context, "X-Cfr-Nonce"),
                ContentSha256 = GetHeader(context, "X-Cfr-Content-SHA256"),
                Authorization = GetHeader(context, "Authorization"),
                HttpMethod = context.Request.Method.ToUpperInvariant(),
                Path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty,
                CanonicalQueryString = BuildCanonicalQueryString(context.Request.Query),
                RawBody = bodyBytes,
                ClientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
            };

            var authResult = await authenticator.AuthenticateAsync(request);
            if (!authResult.Success)
            {
                await WriteErrorAsync(context, StatusCodes.Status401Unauthorized, ErrorMessages.Unauthenticated, SyncErrorCodes.Unauthenticated);
                return;
            }

            currentApiClient.IsAuthenticated = true;
            currentApiClient.ApiClientId = authResult.ApiClientId;
            currentApiClient.ClientId = authResult.ClientId;
            currentApiClient.ProductId = authResult.ProductId;
            currentApiClient.ClientIPAddress = request.ClientIp;

            // Reused by IUserSyncService as the idempotency request-hash — the signed body hash
            // already IS a SHA-256 of the exact raw request body, so there is no reason to hash it
            // again downstream.
            context.Items["ContentSha256Hex"] = request.ContentSha256;

            await next(context);
        }

        private static string? GetHeader(HttpContext context, string name)
        {
            return context.Request.Headers.TryGetValue(name, out StringValues value) ? value.ToString() : null;
        }

        private static string BuildCanonicalQueryString(IQueryCollection query)
        {
            if (query.Count == 0)
            {
                return string.Empty;
            }

            var pairs = query
                .OrderBy(kvp => kvp.Key, StringComparer.Ordinal)
                .Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value.ToString())}");

            return string.Join('&', pairs);
        }

        private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message, string code)
        {
            var result = new MSResultArgs
            {
                StatusCode = statusCode,
                StatusMessage = message,
            };
            result.Errors.Add(new ErrorDetail("code", code));

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = Constant.InputType.ApplicationJson;
            await context.Response.WriteAsync(JsonSerializer.Serialize(result), Encoding.UTF8);
        }
    }

    public static class HmacAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseHmacAuthentication(this IApplicationBuilder app)
        {
            return app.UseMiddleware<HmacAuthenticationMiddleware>();
        }
    }
}
