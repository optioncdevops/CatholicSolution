// Copyright (c) OptionC. All rights reserved.

// using Serilog;
using CFR.Base.Middlewares;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CFR.Base
{
    public static class CommonAppSetupExtension
    {
        /// <summary>
        /// Adds the baseline security response headers (clickjacking/MIME-sniffing/referrer-leak
        /// protection) to every response from this service. Registered first in the pipeline so
        /// the headers are queued before any downstream middleware starts writing the response.
        /// </summary>
        private static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                context.Response.OnStarting(() =>
                {
                    context.Response.Headers.Append("X-Frame-Options", "DENY");
                    context.Response.Headers.Append("Content-Security-Policy", "frame-ancestors 'none'");
                    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
                    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
                    return Task.CompletedTask;
                });
                await next();
                    });

            return app;
        }

        public static IApplicationBuilder UseCommonAppSetup(this IApplicationBuilder app, string swaggerTitle, SwaggerGenOptions swaggerGenOptions)
        {
            ArgumentNullException.ThrowIfNull(app);

            _ = app.UseSecurityHeaders();

            // Get the available Swagger documents from the SwaggerGen service

            _ = app.UseSwagger();
            // Serve static files for Swagger UI (CSS, JS)
            _ = app.UseStaticFiles();
            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                // Swagger JSON endpoints for different parts of your API
                // Get the available Swagger documents from the SwaggerGen service
                // var swaggerGenOptions = app.Services.GetRequiredService<IOptions<SwaggerGenOptions>>().Value;
                // Dynamically add Swagger endpoints based on available Swagger documents
                foreach (var apiDescription in swaggerGenOptions.SwaggerGeneratorOptions.SwaggerDocs)
                {
                    c.SwaggerEndpoint($"/swagger/{apiDescription.Key}/swagger.json", apiDescription.Key);
                }
                // Custom styling and JavaScript
                c.InjectStylesheet("/swagger/swagger-custom.css?t=timestamp");
                c.InjectJavascript("/swagger/swagger-custom-script.js", "text/javascript");

                // Title and other UI configurations
                c.DocumentTitle = swaggerTitle;
                c.DocExpansion(DocExpansion.None); // This will not expand all the API's.
                                                   // Hide the Schemas section at the bottom
                c.DefaultModelExpandDepth(-1);
                c.DisplayRequestDuration();  // Display the request duration in Swagger UI

                // Set the base path for Swagger UI
                c.RoutePrefix = "swagger";

                // Additional configurations
                c.EnableDeepLinking(); // Enable deep linking for operations
            });

            // Enable CORS to allow requests from any origin
            _ = app.UseCors();

            // Redirect HTTP requests to HTTPS (non-Development only; local SSO uses http://localhost:5001)
            var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            if (!env.IsDevelopment())
            {
                _ = app.UseHttpsRedirection();
            }

            // Only takes effect on endpoints that opt in via [EnableRateLimiting("policy-name")] —
            // no GlobalLimiter is configured here, so this can't accidentally throttle the rest of
            // the API.
            _ = app.UseRateLimiter();

            _ = app.UseAuthentication();

            IConfiguration config = app.ApplicationServices.GetRequiredService<IConfiguration>();
            LogFileStorageDiagnostics(config);

            // Enable authorization (even though authentication is disabled in development)
            _ = app.UseAuthorization();

            return app;
        }

        /// <summary>
        /// Logs, once at startup, whether the file-storage base path every file-backed feature
        /// (email logo, email templates, product images, etc. — see FileHandlerService.GetGatewayRoot)
        /// resolves to a real, existing directory on this host. A misconfigured or missing value
        /// here previously surfaced only indirectly, days later, as a feature like the email logo
        /// silently failing to appear — this makes that visible immediately in the startup log
        /// instead of being diagnosed backwards from the symptom.
        /// </summary>
        private static void LogFileStorageDiagnostics(IConfiguration config)
        {
            string? basePath = config["ApplicationFilePath:Doc_BasePath"] ?? config["AppStrings:GatewayRoot"];
            if (string.IsNullOrWhiteSpace(basePath))
            {
                Console.WriteLine("[FileStorage] WARNING: Neither ApplicationFilePath:Doc_BasePath nor AppStrings:GatewayRoot is configured - every file-backed feature (email logo, email templates, product images, etc.) will fail.");
                return;
            }

            bool exists = Directory.Exists(basePath);
            Console.WriteLine(exists
                ? $"[FileStorage] Doc_BasePath resolved to '{basePath}' and it exists."
                : $"[FileStorage] WARNING: Doc_BasePath resolved to '{basePath}', but that directory does not exist on this host - uploads will still create it automatically, but nothing uploaded on a different host/environment will be found here (e.g. a missing email logo).");
        }

        public static IApplicationBuilder UseCommonAppGatewaySetup(this IApplicationBuilder app)
        {
            ArgumentNullException.ThrowIfNull(app);

            _ = app.UseSecurityHeaders();

            // Rate Limiter Middleware - Limits number of requests
            _ = app.UseRateLimiter();

            // Response Caching Middleware - Caches responses to improve performance
            _ = app.UseResponseCaching();

            _ = app.UseSwagger();

            _ = app.UseCors();
            // Serve static files for Swagger UI (CSS, JS)
            _ = app.UseStaticFiles();

            var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            if (!env.IsDevelopment())
            {
                _ = app.UseHttpsRedirection();
            }

            _ = app.UseAuthentication();
            _ = app.UseAuthorization();
            return app;
        }

        public static IApplicationBuilder UseCustomMiddlewareSetup(this IApplicationBuilder app)
        {
            _ = app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

            _ = app.UseClientInfoMiddleware();

            return app;
        }
    }
}