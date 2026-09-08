// Copyright (c) OptionC. All rights reserved.

using Swashbuckle.AspNetCore.SwaggerUI;

using static CFR.Common.Constant;

namespace CFR.Gateway;

/// <summary>
/// Swagger UI at the gateway. Downstream specs stay <c>/api/v1/{controller}/{action}</c>;
/// Try-it-out is rewritten here to <c>/{service}/api/v1/{controller}/{action}</c> so YARP matches.
/// </summary>
internal static class GatewaySwaggerUi
{
    public static void Configure(SwaggerUIOptions options, IConfiguration configuration)
    {
        string routePrefix = configuration["Gateway:SwaggerRoutePrefix"] ?? "swagger";

        options.SwaggerEndpoint("/swagger/APIGateway/swagger.json", SwaggerModuleDoc.OptionCBGateway);

        foreach (GatewayModuleDocs module in GatewayDocs.EnabledModules(configuration))
        {
            foreach (string doc in GatewayDocs.SplitDocs(module.DocsCsv))
            {
                options.SwaggerEndpoint(GatewayDocs.SpecUrl(module.PathPrefix, doc), $"{module.LabelPrefix}.{GatewayDocs.ShortDisplayName(doc)}");
            }
        }

        options.UseRequestInterceptor(GatewayDocs.SwaggerRequestInterceptor(configuration));
        options.DocumentTitle = SwaggerModuleDoc.OptionCBGateway;
        options.DocExpansion(DocExpansion.None);
        options.DefaultModelExpandDepth(-1);
        options.DisplayRequestDuration();
        options.RoutePrefix = routePrefix;
        options.EnableDeepLinking();
    }
}
