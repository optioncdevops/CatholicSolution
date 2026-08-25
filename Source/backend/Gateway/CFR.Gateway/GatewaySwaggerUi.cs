// Copyright (c) OptionC. All rights reserved.

using Swashbuckle.AspNetCore.SwaggerUI;

using static MattMoney.Common.Constant;

namespace MattMoney.Gateway;

/// <summary>
/// Swagger UI at the gateway: local APIGateway spec plus OpenAPI JSON proxied through YARP.
/// <para>
/// Each downstream module can be toggled via <c>Gateway:{Module}Enabled</c> (default: true).
/// Set to <c>"false"</c> in appsettings to hide modules whose API host is not running locally.
/// </para>
/// <c>Gateway:AcutisPathPrefix</c> / <c>Gateway:SsoPathPrefix</c> must match the public segment
/// in <c>ReverseProxy:Routes</c> (with <c>PathRemovePrefix</c> stripping it before forwarding).
/// </summary>
internal static class GatewaySwaggerUi
{
    public static void Configure(SwaggerUIOptions options, IConfiguration configuration)
    {
        string routePrefix = configuration["Gateway:SwaggerRoutePrefix"] ?? "swagger";

        options.SwaggerEndpoint("/swagger/APIGateway/swagger.json", SwaggerModuleDoc.OptionCBGateway);

        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AcutisEnabled", configKey: "Gateway:AcutisPathPrefix", defaultPrefix: "/acutis", docs: SwaggerModuleDoc.OptionCAcutisDocs, labelPrefix: "Acutis");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AdminEnabled", configKey: "Gateway:AdminPathPrefix", defaultPrefix: "/admin", docs: SwaggerModuleDoc.AdminMattMoney, labelPrefix: "Admin");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:FeeEnabled", configKey: "Gateway:FeePathPrefix", defaultPrefix: "/fees", docs: SwaggerModuleDoc.FeeMattMoney, labelPrefix: "Fee");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:MemberEnabled", configKey: "Gateway:MemberPathPrefix", defaultPrefix: "/member", docs: SwaggerModuleDoc.FamilyOffice, labelPrefix: "Member");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:SsoEnabled", configKey: "Gateway:SsoPathPrefix", defaultPrefix: "/sso", docs: SwaggerModuleDoc.OptionCSSO, labelPrefix: "SSO");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:SmsEnabled", configKey: "Gateway:SmsPathPrefix", defaultPrefix: "/sms", docs: SwaggerModuleDoc.OptionCSMSDocs, labelPrefix: "SMS");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ReportEnabled", configKey: "Gateway:ReportPathPrefix", defaultPrefix: "/reports", docs: SwaggerModuleDoc.OptionCReportsDocs, labelPrefix: "Report");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:FamilyEnabled", configKey: "Gateway:FamilyPathPrefix", defaultPrefix: "/member", docs: SwaggerModuleDoc.OptionCFamilyDocs, labelPrefix: "Member");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AdmissionEnabled", configKey: "Gateway:AdmissionPathPrefix", defaultPrefix: "/admission", docs: SwaggerModuleDoc.OptionCAdmissionDocs, labelPrefix: "Admission");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ComponentEnabled", configKey: "Gateway:ComponentPathPrefix", defaultPrefix: "/component", docs: SwaggerModuleDoc.OptionCComponentDocs, labelPrefix: "Component");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ReferenceEnabled", configKey: "Gateway:ReferencePathPrefix", defaultPrefix: "/reference", docs: SwaggerModuleDoc.OptionCMyMessageDocs, labelPrefix: "Reference");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:DioceseEnabled", configKey: "Gateway:DiocesePathPrefix", defaultPrefix: "/diocese", docs: SwaggerModuleDoc.OptionCDioceseDocs, labelPrefix: "Diocese");

        options.DocumentTitle = SwaggerModuleDoc.OptionCBGateway;
        options.DocExpansion(DocExpansion.None);
        options.DefaultModelExpandDepth(-1);
        options.DisplayRequestDuration();
        options.RoutePrefix = routePrefix;
        options.EnableDeepLinking();
    }

    private static void RegisterIfEnabled(SwaggerUIOptions options, IConfiguration configuration, string enabledKey, string configKey, string defaultPrefix, string docs, string labelPrefix)
    {
        string? enabled = configuration[enabledKey];
        if (string.Equals(enabled, "false", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }
        RegisterModuleSwaggerDocs(options, configuration, configKey, defaultPrefix, docs, labelPrefix);
    }

    private static void RegisterModuleSwaggerDocs(SwaggerUIOptions options, IConfiguration configuration, string configKey, string defaultPrefix, string docs, string labelPrefix)
    {
        string pathPrefix = NormalizePrefix(configuration[configKey] ?? defaultPrefix);
        foreach (string doc in SplitSwaggerDocs(docs))
        {
            string label = $"{labelPrefix}.{ShortDisplayName(doc)}";
            string endpoint = $"{pathPrefix}/swagger/{doc}/swagger.json";
            options.SwaggerEndpoint(endpoint, label);
        }
    }

    private static string[] SplitSwaggerDocs(string docs)
    {
        return docs.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
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
