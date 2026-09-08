// Copyright (c) OptionC. All rights reserved.

using Scalar.AspNetCore;

using static CFR.Common.Constant;

namespace CFR.Gateway;

/// <summary>
/// Scalar API reference at the gateway. Servers include existing <c>/api/v1</c>
/// and service-prefixed <c>/{service}/api/v1</c> bases.
/// </summary>
internal static class GatewayScalarUi
{
    public static void Configure(ScalarOptions options, IConfiguration configuration)
    {
        options.WithTitle(SwaggerModuleDoc.OptionCBGateway);
        options.WithDynamicBaseServerUrl(true);
        options.AddServer("/", "Existing /api/v1");

        options.AddDocument(
            SwaggerModuleDoc.OptionCBGateway,
            title: SwaggerModuleDoc.OptionCBGateway,
            routePattern: "/swagger/APIGateway/swagger.json",
            isDefault: true);

        foreach (GatewayModuleDocs module in GatewayDocs.EnabledModules(configuration))
        {
            options.AddServer(module.PathPrefix, $"{module.LabelPrefix} /{module.LabelPrefix.ToLowerInvariant()}");
            foreach (string doc in GatewayDocs.SplitDocs(module.DocsCsv))
            {
                options.AddDocument(
                    doc,
                    title: $"{module.LabelPrefix}.{GatewayDocs.ShortDisplayName(doc)}",
                    routePattern: GatewayDocs.SpecUrl(module.PathPrefix, doc));
            }
        }
    }
}
