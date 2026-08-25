// Copyright (c) OptionC. All rights reserved.

using Serilog.Context;

namespace CFR.Base.Extension
{
    public class LoggingContextMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            ArgumentNullException.ThrowIfNull(context);

            // Example: Set UserId from context or claims
            string? userId = context.User?.Identity?.IsAuthenticated == true
                ? context.User.Identity.Name // Get username as UserId
                : "Anonymous";

            // Example: Set ActionName from request path
            var actionName = context.Request.Path;

            using (LogContext.PushProperty("UserId", userId))
            using (LogContext.PushProperty("ActionName", actionName))
            {
                await _next(context); // Call the next middleware
            }
        }
    }
}