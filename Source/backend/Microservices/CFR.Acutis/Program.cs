// Copyright (c) OptionC. All rights reserved.

using CFR.Acutis;
using CFR.Base;
using CFR.Base.Middlewares;
using CFR.Common;

using Microsoft.Extensions.Options;

using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args).UseSecureKestrel();

// Load configuration using the shared multi-environment loader (appsettings.json -> appsettings.{Environment}.json -> env vars).
builder.Configuration.AddConfiguration(ConfigurationLoader.LoadConfiguration());

// Local-development-only secret source: `dotnet user-secrets set "ConnectionStrings:AcutisDb" "..."`
// writes to a file OUTSIDE this repo (keyed by <UserSecretsId> in CFR.Acutis.csproj), never
// committed. Added last so it can override the tracked appsettings files. Not enabled outside
// Development — other environments must supply real values via environment variables/secret
// store instead. See docs/acutis-auth-spec/operations-runbook.md.
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

builder.Services.AddCommonServicesSetup();

builder.Services.AddDIServicesSetup();

// Mode-selected: DevelopmentFake (default) or Database (placeholder boundary — no real
// implementation exists yet). Never silently falls back between the two. See
// docs/acutis-auth-spec/database-contract.md.
builder.Services.AddAcutisAuthRepository(builder.Configuration, builder.Environment.IsDevelopment());

// JWT bearer authentication — normal validation only. DisableAuthenticationPolicy is intentionally NOT wired here.
builder.Services.AddAuthenticationSetup(builder.Configuration);

// Acutis-specific hardening on top of the shared setup above (issuer/audience validation, explicit
// lifetime/clock-skew) — layered here rather than in CFR.Base so CFR.Gateway/CFR.Portal are
// unaffected. See docs/acutis-auth-spec/security-model.md.
builder.Services.AddAcutisJwtValidationHardening(builder.Configuration);

// Register the Swagger generator documents for this service.
builder.Services.AddSwaggerGenSetup(Constant.SwaggerModuleDoc.AcutisDocs);

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCommonAppSetup(Constant.SwaggerModuleDoc.AcutisDocs, app.Services.GetRequiredService<IOptions<SwaggerGenOptions>>().Value);

// NOT app.UseCustomMiddlewareSetup() — that also wires CFR.Base's ClientInfoMiddleware, which
// expects the SSO-shaped claim set (ClaimTypes.NameIdentifier / Constant.SessionField.*) and
// rejects every request bearing the deliberately-thin Acutis JWT with its own 401, before the
// controller ever runs. Acutis does not use SSO (see docs/acutis-auth-spec/security-model.md),
// so only the exception handler is wired here; AuthController.ResolveCurrentUser reads Acutis's
// own claim shape directly. Confirmed via live verification during this task — see
// docs/acutis-auth-spec/security-model.md "Development limitations" for detail.
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.MapControllers();

// Scalar reads the same Swashbuckle-generated OpenAPI JSON as Swagger UI (/swagger/{doc}/swagger.json).
app.MapScalarForSwashbuckle(Constant.SwaggerModuleDoc.AcutisDocs, "CFR.Acutis");

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", "CFR.Acutis"), "text/html")).ExcludeFromDescription();

app.Run();
