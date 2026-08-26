// Copyright (c) OptionC. All rights reserved.

using Scalar.AspNetCore;

using static CFR.Common.Constant;

namespace CFR.Gateway;

/// <summary>
/// Scalar API reference at the gateway: local APIGateway spec plus OpenAPI JSON proxied through YARP.
/// <para>
/// Each downstream module can be toggled via <c>Gateway:{Module}Enabled</c> (default: true).
/// Set to <c>"false"</c> in appsettings to hide modules whose API host is not running locally.
/// </para>
/// </summary>
internal static class GatewayScalarUi
{
    public static void Configure(ScalarOptions options, IConfiguration configuration)
    {
        options.WithTitle(SwaggerModuleDoc.OptionCBGateway);

        options.AddDocument(
            SwaggerModuleDoc.OptionCBGateway,
            title: SwaggerModuleDoc.OptionCBGateway,
            routePattern: "/swagger/APIGateway/swagger.json",
            isDefault: true);

        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AcutisEnabled", configKey: "Gateway:AcutisPathPrefix", defaultPrefix: "/acutis", docs: SwaggerModuleDoc.AcutisDocs, labelPrefix: "Acutis");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:PortalEnabled", configKey: "Gateway:PortalPathPrefix", defaultPrefix: "/portal", docs: SwaggerModuleDoc.PortalDocs, labelPrefix: "Portal");
    }

    private static void RegisterIfEnabled(ScalarOptions options, IConfiguration configuration, string enabledKey, string configKey, string defaultPrefix, string docs, string labelPrefix)
    {
        string? enabled = configuration[enabledKey];
        if (string.Equals(enabled, "false", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }
        RegisterModuleScalarDocs(options, configuration, configKey, defaultPrefix, docs, labelPrefix);
    }

    private static void RegisterModuleScalarDocs(ScalarOptions options, IConfiguration configuration, string configKey, string defaultPrefix, string docs, string labelPrefix)
    {
        string pathPrefix = NormalizePrefix(configuration[configKey] ?? defaultPrefix);
        foreach (string doc in docs.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            options.AddDocument(
                doc,
                title: $"{labelPrefix}.{ShortDisplayName(doc)}",
                routePattern: $"{pathPrefix}/swagger/{doc}/swagger.json");
        }
    }

    private static string NormalizePrefix(string value)
    {
        value = value.Trim();
        if (value.Length == 0)
        {
            return string.Empty;
        }

        if (!value.StartsWith('/'))
        {
            value = "/" + value;
        }

        return value.TrimEnd('/');
    }

    private static string ShortDisplayName(string doc)
    {
        int i = doc.LastIndexOf('.');
        return i >= 0 ? doc[(i + 1)..] : doc;
    }
}