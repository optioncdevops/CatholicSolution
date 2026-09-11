[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddConfiguration(ConfigurationLoader.LoadConfiguration());

builder.Services.AddCommonServicesSetup();

builder.Services.AddDIServicesSetup();

builder.Services.AddAuthenticationSetup(builder.Configuration);

builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
});

builder.Services.AddSwaggerGenSetup(SwaggerModuleDoc.PortalDocs);

// Real JWT authentication/authorization by default; the anonymous bypass below only activates when
// explicitly opted into via Authentication:AllowAnonymousDevelopmentBypass on a Development host.
builder.Services.DisableAuthenticationPolicy(builder.Environment, builder.Configuration);

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCommonAppSetup(SwaggerModuleDoc.CFRPortal, app.Services.GetRequiredService<IOptions<SwaggerGenOptions>>().Value);

app.UseCustomMiddlewareSetup();

app.MapControllers();
app.MapScalarForSwashbuckle(SwaggerModuleDoc.PortalDocs, SwaggerModuleDoc.CFRPortal);

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", SwaggerModuleDoc.CFRPortal), "text/html")).ExcludeFromDescription();

app.Run();
