// Copyright (c) OptionC. All rights reserved.

using CFR.DataSync.Middlewares;

[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddConfiguration(ConfigurationLoader.LoadConfiguration());

builder.Services.AddCommonServicesSetup();

builder.Services.AddAuthEndpointRateLimiting();

builder.Services.AddDIServicesSetup();

// JWT bearer auth — a product logs in once via AuthController.Login (ClientId/ClientSecret),
// then every other endpoint ([Authorize] on UsersController/OrganizationsController) requires
// that token only. Replaces the old per-request HMAC signature verification.
builder.Services.AddAuthenticationSetup(builder.Configuration);

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

app.UseCurrentApiClientClaims();

app.MapControllers();
app.MapScalarForSwashbuckle(SwaggerModuleDoc.SyncDocs, SwaggerModuleDoc.CFRSync);

app.MapGet("/health/live", () => Results.Ok(new { status = "live" })).ExcludeFromDescription();
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready" })).ExcludeFromDescription();

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", SwaggerModuleDoc.CFRSync), "text/html")).ExcludeFromDescription();

app.Run();