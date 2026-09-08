// Copyright (c) OptionC. All rights reserved.

using System.Text.Json;

using static CFR.Common.Constant;

namespace CFR.Gateway;

internal readonly record struct GatewayModuleDocs(string PathPrefix, string LabelPrefix, string DocsCsv);

/// <summary>
/// Shared gateway-docs helpers used by Swagger UI and Scalar.
/// </summary>
internal static class GatewayDocs
{
    internal static IEnumerable<GatewayModuleDocs> EnabledModules(IConfiguration configuration)
    {
        if (IsEnabled(configuration, "Gateway:AcutisEnabled"))
        {
            yield return new GatewayModuleDocs(NormalizePrefix(configuration["Gateway:AcutisPathPrefix"] ?? "/acutis"), "Acutis", SwaggerModuleDoc.CFRAcutisDocs);
        }

        if (IsEnabled(configuration, "Gateway:PortalEnabled"))
        {
            yield return new GatewayModuleDocs(NormalizePrefix(configuration["Gateway:PortalPathPrefix"] ?? "/portal"), "Portal", SwaggerModuleDoc.PortalDocs);
        }
    }

    internal static bool IsEnabled(IConfiguration configuration, string enabledKey)
    {
        return !string.Equals(configuration[enabledKey], "false", StringComparison.OrdinalIgnoreCase);
    }

    internal static string[] SplitDocs(string docs)  
    {
        return docs.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries); 
    }

    internal static string NormalizePrefix(string value)
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

    internal static string ShortDisplayName(string doc)
    {
        int i = doc.LastIndexOf('.');
        return i >= 0 ? doc[(i + 1)..] : doc;
    }

    internal static string SpecUrl(string pathPrefix, string doc)
    {
        return $"{pathPrefix}/swagger/{doc}/swagger.json";
    }

    internal static string PrefixesJson(IConfiguration configuration)
    {
        return JsonSerializer.Serialize(EnabledModules(configuration).Select(module => module.PathPrefix).ToArray());
    }

    /// <summary>
    /// Swagger UI interceptor: send <c>/api/v1/...</c> Try-it-out calls through the active service prefix.
    /// Must be one line and use only single-quoted JS strings. Swashbuckle embeds this in
    /// <c>JSON.parse('%(Interceptors)')</c>; newlines or <c>"</c> blank the page.
    /// </summary>
    internal static string SwaggerRequestInterceptor(IConfiguration configuration)
    {
        string prefixes = PrefixesJson(configuration).Replace('"', '\'');
        return CompactJsForSwagger($$"""
            (request) => {
              const prefixes = {{prefixes}};
              let specUrl = '';
              try { specUrl = (window.ui && window.ui.getConfigs && window.ui.getConfigs().url) || ''; } catch (e) {}
              const prefix = prefixes.find((p) => specUrl.indexOf(p + '/') !== -1);
              if (!prefix || !request || !request.url) return request;
              try {
                const url = new URL(request.url, window.location.origin);
                if (url.pathname.indexOf('/api/') === -1) return request;
                if (url.pathname.indexOf(prefix + '/') === 0) return request;
                url.pathname = prefix + url.pathname;
                request.url = url.pathname + url.search + url.hash;
              } catch (e) {}
              return request;
            }
            """);
    }

    /// <summary>
    /// Flatten interceptor JS so Swashbuckle can embed it inside a single-quoted JSON.parse string.
    /// Double quotes must not survive — they break that JSON.parse wrapper.
    /// </summary>
    private static string CompactJsForSwagger(string javascript)
    {
        return string.Join(" ", javascript.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).Replace('"', '\'');
    }
}
