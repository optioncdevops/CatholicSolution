// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.DependencyInjection;
using System.Threading.RateLimiting;

namespace CFR.Base
{
    public static class RateLimiterExtensions
    {
        public static IServiceCollection AddPlatformRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(static options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    string ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: ipAddress,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 10,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        });
                });

                options.OnRejected = async (context, token) =>
                {
                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/json";

                    await context.HttpContext.Response.WriteAsync(/*lang=json,strict*/ "{\"message\":\"Too many requests. Please try again later.\"}",
                        token);
                };
            });

            return services;
        }
    }
}