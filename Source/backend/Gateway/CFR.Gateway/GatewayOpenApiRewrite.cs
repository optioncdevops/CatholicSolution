// Copyright (c) OptionC. All rights reserved.

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

using Yarp.ReverseProxy.Transforms;

namespace CFR.Gateway;

/// <summary>
/// Rewrites proxied OpenAPI JSON so Try-it-out uses <c>/{service}/api/v1/...</c> instead of <c>/api/v1/...</c>.
/// </summary>
internal static class GatewayOpenApiRewrite
{
    /// <summary>
    /// Sets <c>servers</c> on swagger.json loaded through a gateway service prefix.
    /// </summary>
    internal static async ValueTask ApplyAsync(ResponseTransformContext context, IReadOnlyList<string> servicePrefixes)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(servicePrefixes);

        if (context.ProxyResponse is null)
        {
            return;
        }

        string requestPath = context.HttpContext.Request.Path.Value ?? string.Empty;
        if (!requestPath.EndsWith("/swagger.json", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        string? prefix = MatchPrefix(requestPath, servicePrefixes);
        if (prefix is null)
        {
            return;
        }

        MediaTypeHeaderValue? contentType = context.ProxyResponse.Content.Headers.ContentType;
        if (contentType?.MediaType is string mediaType
            && mediaType.IndexOf("json", StringComparison.OrdinalIgnoreCase) < 0)
        {
            return;
        }

        string json = await context.ProxyResponse.Content.ReadAsStringAsync(context.CancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        string updated = WithGatewayServer(json, prefix);
        context.ProxyResponse.Content = new StringContent(updated, Encoding.UTF8, "application/json");
    }

    internal static string? MatchPrefix(string requestPath, IReadOnlyList<string> servicePrefixes)
    {
        foreach (string prefix in servicePrefixes)
        {
            if (requestPath.StartsWith(prefix + "/", StringComparison.OrdinalIgnoreCase))
            {
                return prefix;
            }
        }

        return null;
    }

    internal static string WithGatewayServer(string swaggerJson, string pathPrefix)
    {
        using var document = JsonDocument.Parse(swaggerJson);
        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }))
        {
            writer.WriteStartObject();
            bool wroteServers = false;
            foreach (JsonProperty property in document.RootElement.EnumerateObject())
            {
                if (property.NameEquals("servers"))
                {
                    WriteServers(writer, pathPrefix);
                    wroteServers = true;
                    continue;
                }

                property.WriteTo(writer);
            }

            if (!wroteServers)
            {
                WriteServers(writer, pathPrefix);
            }

            writer.WriteEndObject();
        }

        return Encoding.UTF8.GetString(stream.ToArray());
    }

    private static void WriteServers(Utf8JsonWriter writer, string pathPrefix)
    {
        writer.WritePropertyName("servers");
        writer.WriteStartArray();
        writer.WriteStartObject();
        writer.WriteString("url", pathPrefix);
        writer.WriteString("description", "CFR.Gateway");
        writer.WriteEndObject();
        writer.WriteEndArray();
    }
}
