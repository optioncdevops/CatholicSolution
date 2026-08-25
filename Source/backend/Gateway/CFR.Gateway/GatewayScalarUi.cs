// Copyright (c) OptionC. All rights reserved.

using Scalar.AspNetCore;

using static MattMoney.Common.Constant;

namespace MattMoney.Gateway;

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

        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AcutisEnabled", configKey: "Gateway:AcutisPathPrefix", defaultPrefix: "/acutis", docs: SwaggerModuleDoc.OptionCAcutisDocs, labelPrefix: "Acutis");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AdminEnabled", configKey: "Gateway:AdminPathPrefix", defaultPrefix: "/admin", docs: SwaggerModuleDoc.AdminMattMoney, labelPrefix: "Admin");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:FeeEnabled", configKey: "Gateway:FeePathPrefix", defaultPrefix: "/fees", docs: SwaggerModuleDoc.FeeMattMoney, labelPrefix: "Fee");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:MemberEnabled", configKey: "Gateway:MemberPathPrefix", defaultPrefix: "/member", docs: SwaggerModuleDoc.FamilyOffice, labelPrefix: "Member");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:SsoEnabled", configKey: "Gateway:SsoPathPrefix", defaultPrefix: "/sso", docs: SwaggerModuleDoc.OptionCSSO, labelPrefix: "SSO");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:SmsEnabled", configKey: "Gateway:SmsPathPrefix", defaultPrefix: "/sms", docs: SwaggerModuleDoc.OptionCSMSDocs, labelPrefix: "SMS");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ReportEnabled", configKey: "Gateway:ReportPathPrefix", defaultPrefix: "/reports", docs: SwaggerModuleDoc.OptionCReportsDocs, labelPrefix: "Report");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:FamilyEnabled", configKey: "Gateway:FamilyPathPrefix", defaultPrefix: "/family", docs: SwaggerModuleDoc.OptionCFamilyDocs, labelPrefix: "Family");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:AdmissionEnabled", configKey: "Gateway:AdmissionPathPrefix", defaultPrefix: "/admission", docs: SwaggerModuleDoc.OptionCAdmissionDocs, labelPrefix: "Admission");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ComponentEnabled", configKey: "Gateway:ComponentPathPrefix", defaultPrefix: "/component", docs: SwaggerModuleDoc.OptionCComponentDocs, labelPrefix: "Component");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:ReferenceEnabled", configKey: "Gateway:ReferencePathPrefix", defaultPrefix: "/reference", docs: SwaggerModuleDoc.OptionCMyMessageDocs, labelPrefix: "Reference");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:FeedEnabled", configKey: "Gateway:FeedPathPrefix", defaultPrefix: "/fee", docs: SwaggerModuleDoc.OptionCFeeDocs, labelPrefix: "FeeLegacy");
        RegisterIfEnabled(options, configuration, enabledKey: "Gateway:DioceseEnabled", configKey: "Gateway:DiocesePathPrefix", defaultPrefix: "/diocese", docs: SwaggerModuleDoc.OptionCDioceseDocs, labelPrefix: "Diocese");
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
