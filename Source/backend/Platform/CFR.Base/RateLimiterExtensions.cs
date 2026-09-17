// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.DependencyInjection;
using System.Threading.RateLimiting;

namespace CFR.Base
{
    public static class RateLimiterExtensions
    {
        /// <summary>
        /// Registers the "auth-sensitive" named rate-limit policy — applied via
        /// <c>[EnableRateLimiting("auth-sensitive")]</c> on login/forgot-password/reset-password
        /// actions specifically, rather than a blanket global limiter, so normal admin usage of
        /// the rest of the API is never affected. Partitioned by client IP; 10 requests per 5
        /// minutes is generous enough for a real user who mistypes a password a few times, tight
        /// enough to make scripted enumeration/brute-force impractical.
        /// </summary>
        public static IServiceCollection AddAuthEndpointRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.AddPolicy("auth-sensitive", context => RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(5),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0,
                    }));

                options.OnRejected = async (context, token) =>
                {
                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/json";
                    await context.HttpContext.Response.WriteAsync(
                        /*lang=json,strict*/ "{\"statusCode\":429,\"statusMessage\":\"Too many attempts. Please wait a few minutes and try again.\"}",
                        token);
                };
            });

            return services;
        }

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