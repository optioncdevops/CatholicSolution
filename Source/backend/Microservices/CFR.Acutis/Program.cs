using CFR.Base;
using static CFR.Common.Constant;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapScalarForSwashbuckle(SwaggerModuleDoc.AcutisDocs, "OptionC.Acutis");

app.MapGet("/", () => Results.Text(DefaultData.WebStartPage.Replace("{0}", "OptionC.Acutis"), "text/html")).ExcludeFromDescription(); // Exclude this endpoint from Swagger


app.Run();