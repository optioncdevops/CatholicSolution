// Copyright (c) OptionC. All rights reserved.

// using Serilog;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using CFR.Base.Middlewares;

using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CFR.Base
{
    public static class CommonAppSetupExtension
    {
        public static IApplicationBuilder UseCommonAppSetup(this IApplicationBuilder app, string swaggerTitle, SwaggerGenOptions swaggerGenOptions)
        {
            ArgumentNullException.ThrowIfNull(app);

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

            // set the RateLimit to acccess the enpoint per minute
            //app.UseRateLimiter();

            _ = app.UseAuthentication();

            IConfiguration config = app.ApplicationServices.GetRequiredService<IConfiguration>();

            // Enable authorization (even though authentication is disabled in development)
            _ = app.UseAuthorization();

            return app;
        }

        public static IApplicationBuilder UseCommonAppGatewaySetup(this IApplicationBuilder app)
        {
            ArgumentNullException.ThrowIfNull(app);

            // Rate Limiter Middleware - Limits number of requests
            _ = app.UseRateLimiter();

            // Response Caching Middleware - Caches responses to improve performance
            _ = app.UseResponseCaching();

            app.UseForwardedHeaders(); // Handles forwarded headers from the gateway

            _ = app.UseSwagger();

            _ = app.UseCors();
            // Serve static files for Swagger UI (CSS, JS)
            _ = app.UseStaticFiles();

            // Redirect HTTP requests to HTTPS
            _ = app.UseHttpsRedirection();

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