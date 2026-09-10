// Copyright (c) OptionC. All rights reserved.

using CFR.Base;
using CFR.Gateway;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Scalar.AspNetCore;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

// Load configuration using the helper
builder.Configuration.AddCustomConfiguration(); // Uses the extension

// Avoid StaticFiles warning when wwwroot is missing under IIS.
string webRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(webRootPath);

if (builder.Environment.IsDevelopment())
{
    builder.Logging.AddFilter("Yarp.ReverseProxy", LogLevel.Debug);
}

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var (proxyRoutes, proxyClusters) = GatewayServiceCatalog.BuildProxy(builder.Configuration);
string[] servicePrefixes = GatewayServiceCatalog.Load(builder.Configuration).Select(service => service.PathPrefix).ToArray();
var reverseProxyBuilder = builder.Services.AddReverseProxy()
    .LoadFromMemory(proxyRoutes, proxyClusters)
    .AddTransforms(context =>
    {
        context.AddResponseTransform(transformContext => GatewayOpenApiRewrite.ApplyAsync(transformContext, servicePrefixes));
    });

// RATE LIMITING - Protects API from abuse (too many requests)
builder.Services.AddRateLimiterSetup();

// Dev HTTPS to localhost (Acutis/SSO): trust ASP.NET dev cert even if JSON HttpClient options do not bind as expected.
if (builder.Environment.IsDevelopment())
{
    reverseProxyBuilder.ConfigureHttpClient(static (_, handler) =>
    {
        if (handler is SocketsHttpHandler sockets)
        {
            sockets.SslOptions.RemoteCertificateValidationCallback = DevReverseProxySslPolicy.ValidateLocalDevelopmentCertificate;
        }
    });
}

// Register common services (likely custom services for your application)
builder.Services.AddCommonServicesSetup();

// Register the Swagger generator with a custom title "APIGateway"
builder.Services.AddSwaggerGenSetup("APIGateway");

// Add support for API explorer to expose API metadata
builder.Services.AddEndpointsApiExplorer();

// Add CORS policy
builder.Services.AddAuthenticationSetup(builder.Configuration);
// Allow the Local system to access the api with jwt token
builder.Services.DisableAuthenticationPolicy(builder.Environment);

// RESPONSE CACHING - Caches responses from microservices to improve performance
builder.Services.AddResponseCaching();

// Kestrel Server Options - Limits request body size to prevent DoS attacks
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseRouting();
app.UseCommonAppGatewaySetup();

app.MapGet("/", () => Results.Content(GatewayStartPage.Html(app.Configuration), "text/html"))
    .ExcludeFromDescription();

app.UseSwaggerUI(options => GatewaySwaggerUi.Configure(options, app.Configuration));
app.MapScalarApiReference("/scalar", options => GatewayScalarUi.Configure(options, app.Configuration));

app.MapReverseProxy();

app.Run();