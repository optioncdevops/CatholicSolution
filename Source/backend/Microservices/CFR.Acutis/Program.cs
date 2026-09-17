[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]
var builder = WebApplication.CreateBuilder(args);

// Load configuration using the helper
builder.Configuration.AddConfiguration(ConfigurationLoader.LoadConfiguration());

builder.Services.AddCommonServicesSetup();

builder.Services.AddAuthEndpointRateLimiting();

builder.Services.AddDIServicesSetup();

// JWT Authentication
builder.Services.AddAuthenticationSetup(builder.Configuration);

// Go to Project Properties --> Build --> Output  --> XML Documentation File --> Check the checkbox
// Error and Warning  --> Suppress specific warning ass the ; 1591 and
// Output             --> Check the Documentation file
// Set the comments path for the Swagger JSON and UI.
// To register the swagger generator
// Add SwaggerGen with XML comments
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true); // Important!
});

builder.Services.AddSwaggerGenSetup(SwaggerModuleDoc.CFRAcutisDocs);

// Allow the Local system to access the api with jwt token
builder.Services.DisableAuthenticationPolicy(builder.Environment);

// Use the Serilog configuration from the extension method
// builder.Host.AddSerilogConfiguration(builder.Configuration.GetConnectionString("AuditLogDB"), AuditTableName.Dietary);

builder.Services.AddEndpointsApiExplorer();

if (string.IsNullOrEmpty(builder.Environment.WebRootPath))
{
    builder.Environment.WebRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
}

var app = builder.Build();

app.UseCommonAppSetup(SwaggerModuleDoc.CFRAcutis, app.Services.GetRequiredService<IOptions<SwaggerGenOptions>>().Value);

app.UseCustomMiddlewareSetup();

app.MapControllers();
// Scalar reads the same Swashbuckle-generated OpenAPI JSON as Swagger UI (/swagger/{doc}/swagger.json).
app.MapScalarForSwashbuckle(SwaggerModuleDoc.CFRAcutisDocs, SwaggerModuleDoc.CFRAcutis);

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", SwaggerModuleDoc.CFRAcutis), "text/html")).ExcludeFromDescription(); // Exclude this endpoint from Swagger

app.Run();