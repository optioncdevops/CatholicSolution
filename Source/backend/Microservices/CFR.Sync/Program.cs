// Copyright (c) OptionC. All rights reserved.

using CFR.Sync.Authentication;
using CFR.Sync.Middlewares;

using Microsoft.AspNetCore.Authentication;

[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddConfiguration(ConfigurationLoader.LoadConfiguration());

builder.Services.AddCommonServicesSetup();

builder.Services.AddAuthEndpointRateLimiting();

builder.Services.AddDIServicesSetup();

// No JWT/cookie auth here — every request is verified by HmacAuthenticationMiddleware instead.
// This scheme exists only so BaseController's Forbid()-based 403 responses (PRODUCT_SCOPE_VIOLATION)
// have a registered scheme to resolve against instead of throwing; see NoOpAuthenticationHandler's
// remarks.
builder.Services
    .AddAuthentication(NoOpAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, NoOpAuthenticationHandler>(NoOpAuthenticationHandler.SchemeName, null);

builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
});

builder.Services.AddSwaggerGenSetup(SwaggerModuleDoc.SyncDocs);

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCommonAppSetup(SwaggerModuleDoc.CFRSync, app.Services.GetRequiredService<IOptions<SwaggerGenOptions>>().Value);

app.UseCustomMiddlewareSetup();

app.UseHmacAuthentication();

app.MapControllers();
app.MapScalarForSwashbuckle(SwaggerModuleDoc.SyncDocs, SwaggerModuleDoc.CFRSync);

app.MapGet("/health/live", () => Results.Ok(new { status = "live" })).ExcludeFromDescription();
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready" })).ExcludeFromDescription();

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", SwaggerModuleDoc.CFRSync), "text/html")).ExcludeFromDescription();

app.Run();
