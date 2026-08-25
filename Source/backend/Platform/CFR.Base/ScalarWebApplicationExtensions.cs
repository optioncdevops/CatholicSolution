// Copyright (c) OptionC. All rights reserved.

using Scalar.AspNetCore;

namespace CFR.Base;

public static class ScalarWebApplicationExtensions
{
    /// <summary>
    /// Serves Scalar at <c>/scalar</c> using the same OpenAPI documents as Swashbuckle
    /// (<c>/swagger/{documentName}/swagger.json</c>).
    /// </summary>
    /// <param name="app">The web application.</param>
    /// <param name="swaggerModuleDocsCsv">Comma-separated Swashbuckle document names (same string as <see cref="ServiceExtension.AddSwaggerGenSetup"/>).</param>
    /// <param name="apiReferenceTitle">Title shown in the Scalar UI.</param>
    public static WebApplication MapScalarForSwashbuckle(
        this WebApplication app,
        string swaggerModuleDocsCsv,
        string apiReferenceTitle)
    {
        ArgumentNullException.ThrowIfNull(swaggerModuleDocsCsv);

        string[] documentNames = swaggerModuleDocsCsv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        app.MapScalarApiReference("/scalar", options =>
        {
            options
                .WithTitle(apiReferenceTitle)
                .WithOpenApiRoutePattern("/swagger/{documentName}/swagger.json")
                .AddDocuments(documentNames);
        });

        return app;
    }
}
