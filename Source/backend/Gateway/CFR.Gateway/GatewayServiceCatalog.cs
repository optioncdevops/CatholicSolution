// Copyright (c) OptionC. All rights reserved.

using Yarp.ReverseProxy.Configuration;

using static CFR.Common.Constant;

namespace CFR.Gateway;

/// <summary>
/// One downstream microservice registered on CFR.Gateway.
/// </summary>
internal sealed record GatewayServiceDefinition(
    string Name,
    string Label,
    string PathPrefix,
    string UpstreamOrigin,
    string DocsCsv,
    bool DangerousAcceptAnyServerCertificate);

/// <summary>
/// Binds <c>Gateway:Services</c> from appsettings. Add a new microservice by adding a JSON entry;
/// YARP routes, Swagger, and Scalar are generated from this list.
/// </summary>
internal static class GatewayServiceCatalog
{
    private sealed class GatewayServiceOptions
    {
        public bool? Enabled { get; set; }

        public string? Label { get; set; }

        public string? PathPrefix { get; set; }

        public string? UpstreamOrigin { get; set; }

        public string? Docs { get; set; }

        public bool? DangerousAcceptAnyServerCertificate { get; set; }
    }

    /// <summary>
    /// Loads enabled gateway services from <c>Gateway:Services</c>, or from the legacy Acutis/Portal keys.
    /// </summary>
    internal static IReadOnlyList<GatewayServiceDefinition> Load(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var services = new List<GatewayServiceDefinition>();
        foreach (IConfigurationSection child in configuration.GetSection("Gateway:Services").GetChildren())
        {
            GatewayServiceDefinition? service = BindService(child);
            if (service is not null)
            {
                services.Add(service);
            }
        }

        if (services.Count == 0)
        {
            services.AddRange(LoadLegacy(configuration));
        }

        return services;
    }

    /// <summary>
    /// Builds YARP routes and clusters so each service is reached only as <c>/{prefix}/{**catch-all}</c>
    /// (for example <c>/acutis/api/v1/Products/GetProducts</c>). The prefix is stripped before forwarding.
    /// </summary>
    internal static (IReadOnlyList<RouteConfig> Routes, IReadOnlyList<ClusterConfig> Clusters) BuildProxy(IConfiguration configuration)
    {
        IReadOnlyList<GatewayServiceDefinition> services = Load(configuration);
        if (services.Count == 0)
        {
            throw new InvalidOperationException("CFR.Gateway has no enabled downstream services. Add Gateway:Services entries with PathPrefix and UpstreamOrigin.");
        }

        var routes = new List<RouteConfig>(services.Count);
        var clusters = new List<ClusterConfig>(services.Count);

        foreach (GatewayServiceDefinition service in services)
        {
            string clusterId = $"{service.Name}-cluster";
            routes.Add(new RouteConfig
            {
                RouteId = $"{service.Name}-route",
                ClusterId = clusterId,
                Match = new RouteMatch { Path = $"{service.PathPrefix}/{{**catch-all}}" },
                Transforms = new List<IReadOnlyDictionary<string, string>>
                {
                    new Dictionary<string, string> { ["PathRemovePrefix"] = service.PathPrefix }
                }
            });

            clusters.Add(new ClusterConfig
            {
                ClusterId = clusterId,
                Destinations = new Dictionary<string, DestinationConfig>(StringComparer.OrdinalIgnoreCase)
                {
                    [$"{service.Name}Services"] = new DestinationConfig { Address = service.UpstreamOrigin }
                },
                HttpClient = new HttpClientConfig
                {
                    DangerousAcceptAnyServerCertificate = service.DangerousAcceptAnyServerCertificate
                }
            });
        }

        return (routes, clusters);
    }

    private static GatewayServiceDefinition? BindService(IConfigurationSection section)
    {
        GatewayServiceOptions options = section.Get<GatewayServiceOptions>() ?? new GatewayServiceOptions();
        if (options.Enabled == false)
        {
            return null;
        }

        string name = section.Key.Trim();
        if (name.Length == 0)
        {
            return null;
        }

        string origin = (options.UpstreamOrigin ?? string.Empty).Trim().TrimEnd('/');
        if (origin.Length == 0)
        {
            throw new InvalidOperationException($"Gateway service '{name}' is missing UpstreamOrigin.");
        }

        string pathPrefix = GatewayDocs.NormalizePrefix(string.IsNullOrWhiteSpace(options.PathPrefix) ? $"/{name}" : options.PathPrefix);
        string label = string.IsNullOrWhiteSpace(options.Label) ? ToLabel(name) : options.Label.Trim();

        return new GatewayServiceDefinition(
            name.ToLowerInvariant(),
            label,
            pathPrefix,
            origin,
            DefaultDocs(name, options.Docs),
            options.DangerousAcceptAnyServerCertificate ?? true);
    }

    private static IEnumerable<GatewayServiceDefinition> LoadLegacy(IConfiguration configuration)
    {
        if (IsEnabled(configuration, "Gateway:AcutisEnabled"))
        {
            yield return BindLegacy(configuration, "acutis", "Acutis", "Gateway:AcutisPathPrefix", "Gateway:AcutisUpstreamOrigin", SwaggerModuleDoc.CFRAcutisDocs);
        }

        if (IsEnabled(configuration, "Gateway:PortalEnabled"))
        {
            yield return BindLegacy(configuration, "portal", "Portal", "Gateway:PortalPathPrefix", "Gateway:PortalUpstreamOrigin", SwaggerModuleDoc.PortalDocs);
        }
    }

    private static GatewayServiceDefinition BindLegacy(IConfiguration configuration, string name, string label, string pathKey, string originKey, string docs)
    {
        string origin = (configuration[originKey] ?? string.Empty).Trim().TrimEnd('/');
        if (origin.Length == 0)
        {
            throw new InvalidOperationException($"Gateway service '{name}' is missing {originKey}.");
        }

        return new GatewayServiceDefinition(
            name,
            label,
            GatewayDocs.NormalizePrefix(configuration[pathKey] ?? $"/{name}"),
            origin,
            docs,
            true);
    }

    private static bool IsEnabled(IConfiguration configuration, string enabledKey)
    {
        return !string.Equals(configuration[enabledKey], "false", StringComparison.OrdinalIgnoreCase);
    }

    private static string DefaultDocs(string name, string? docs)
    {
        if (!string.IsNullOrWhiteSpace(docs))
        {
            return docs.Trim();
        }

        return name.ToLowerInvariant() switch
        {
            "acutis" => SwaggerModuleDoc.CFRAcutisDocs,
            "portal" => SwaggerModuleDoc.PortalDocs,
            _ => string.Empty
        };
    }

    private static string ToLabel(string name)
    {
        if (name.Length == 0)
        {
            return name;
        }

        return char.ToUpperInvariant(name[0]) + name[1..];
    }
}
