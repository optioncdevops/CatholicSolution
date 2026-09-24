// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.CommonService;
using CFR.CommonService.Interfaces;

using Microsoft.Extensions.DependencyInjection;

using UAParser;

namespace CFR.Base.Middlewares
{
    public class ClientInfoMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task Invoke(HttpContext context, IServiceProvider serviceProvider)
        {
            ArgumentNullException.ThrowIfNull(context);

            var user = context.User;

            // Skip processing if the user is not authenticated (no token)
            if (user.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            string userAgent = context.Request.Headers["User-Agent"].ToString();
            string correlationId = context.Request.Headers["X-Request-Id"].ToString();
            var parser = Parser.GetDefault();
            var clientInfo = parser.Parse(userAgent);

            // Resolve the scoped service within the request scope
            var currentUserService = serviceProvider.GetRequiredService<ICurrentUserService>();
            var allClaims = user.Claims.ToList();

            // Validate and extract user ID
            string? userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            long userId = 0;
            Guid? cfrUserId = null;
            bool isValidUserId = false;

            if (!string.IsNullOrEmpty(userIdClaim))
            {
                string decryptedUserIdClaim = CommonMethods.DecryptValue(userIdClaim);
                isValidUserId = long.TryParse(decryptedUserIdClaim, out userId);
                if (!isValidUserId && Guid.TryParse(decryptedUserIdClaim, out Guid parsedCfrUserId))
                {
                    // CFR.Portal sessions carry the member's auth.User.CFRUserId (a GUID) here
                    // instead of a long — Acutis/DataSync sessions still resolve via the branch above.
                    cfrUserId = parsedCfrUserId;
                    isValidUserId = true;
                }
            }
            else
            {
                string? ssoUserIdClaim = user.FindFirstValue(Constant.SessionField.UserId);
                if (!string.IsNullOrEmpty(ssoUserIdClaim))
                {
                    isValidUserId = long.TryParse(ssoUserIdClaim, out userId);
                    if (!isValidUserId && Guid.TryParse(ssoUserIdClaim, out Guid parsedCfrUserId))
                    {
                        cfrUserId = parsedCfrUserId;
                        isValidUserId = true;
                    }
                }
            }

            if (!isValidUserId)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized: Invalid User ID");
                return;
            }

            // Set user details in the current user service
            currentUserService.UserId = userId;
            currentUserService.CFRUserId = cfrUserId;
            currentUserService.ClientIPAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            currentUserService.DeviceType = clientInfo.Device.Family ?? "Unknown";
            currentUserService.BrowserName = clientInfo.UA.Family ?? "Unknown";
            currentUserService.UserName = user.FindFirstValue(Constant.SessionField.UserName) ?? string.Empty;

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.RoleId), out int roleIdValue))
            {
                currentUserService.RoleId = roleIdValue;
            }           

            currentUserService.FirstName = user.FindFirstValue(Constant.SessionField.FirstName) ?? string.Empty;
            currentUserService.LastName = user.FindFirstValue(Constant.SessionField.LastName) ?? string.Empty;
           
            await _next(context);
        }
    }

    public static class ClientInfoMiddlewareExtensions
    {
        public static IApplicationBuilder UseClientInfoMiddleware(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ClientInfoMiddleware>();
        }
    }
}