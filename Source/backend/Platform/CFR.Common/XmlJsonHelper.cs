// Copyright (c) OptionC. All rights reserved.

using System.Collections;
using System.Text.Json;
using System.Xml;
using System.Xml.Serialization;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CFR.Common;

/// <summary>
/// Converts XML payloads (e.g. from SQL FOR XML / <see cref="System.Data.SqlTypes.SqlXml"/> / legacy procedures) to JSON for APIs.
/// Recognizes plain XML and SQL Server's bracketed <c>[XML_…, &lt;root&gt;…&lt;/root&gt;]</c> string form.
/// </summary>
public static class XmlJsonHelper
{
    /// <summary>
    /// Strips common wrappers so the result can be passed to <see cref="XmlDocument.LoadXml(string)"/>.
    /// </summary>
    /// <param name="raw">Plain XML, SQL <c>[XML_{guid}, …]</c> form, or the same with outer JSON-style quotes.</param>
    /// <param name="xmlDocument">Trimmed XML document text (starts with <c>&lt;</c>).</param>
    /// <returns><c>true</c> when <paramref name="xmlDocument"/> is non-empty well-formed candidate text.</returns>
    public static bool TryNormalizeToXmlDocument(string? raw, out string? xmlDocument)
    {
        xmlDocument = null;
        if (string.IsNullOrEmpty(raw))
        {
            return false;
        }

        // 1. Check for SQL Server xml type wrapper FIRST without trimming.
        // SQL Server wraps fragments like: [XML_F52E2B61-18A1-11d1-B105-00805F49916B, <Root>...]
        // Note: There is exactly one space after the comma and a closing bracket at the end.
        if (raw.StartsWith("[XML_", StringComparison.OrdinalIgnoreCase))
        {
            int commaIndex = raw.IndexOf(',');
            if (commaIndex >= 0)
            {
                int contentStart = commaIndex + 1;
                // Skip the metadata space if present, but preserve all other data
                if (raw.Length > contentStart && raw[contentStart] == ' ')
                {
                    contentStart++;
                }

                xmlDocument = (raw[^1] == ']') ? raw[contentStart..^1] : raw[contentStart..];
                return true;
            }
        }

        string s = raw.Trim();

        // Outer quotes (e.g. value pasted from JSON)
        if (s.Length >= 2 && ((s[0] == '"' && s[^1] == '"') || (s[0] == '\'' && s[^1] == '\'')))
        {
            s = s[1..^1].Trim();
        }

        if (s.Length == 0)
        {
            return false;
        }

        // Plain XML document / fragment
        if (s[0] == '<')
        {
            xmlDocument = s;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Serializes an XML document to a JSON string. Accepts wrapped SQL / quoted forms via <see cref="TryNormalizeToXmlDocument"/>.
    /// </summary>
    public static string ToJsonString(string xml, bool omitRootObject = true, Newtonsoft.Json.Formatting formatting = Newtonsoft.Json.Formatting.None)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(xml);

        if (!TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            throw new ArgumentException("Value is not recognized as a loadable XML document.", nameof(xml));
        }

        var doc = new XmlDocument();
        doc.LoadXml(normalized);

        return JsonConvert.SerializeXmlNode(doc, formatting, omitRootObject);
    }

    /// <summary>
    /// Parses XML into a <see cref="JToken"/> tree (no dynamic).
    /// </summary>
    public static JToken? ToJToken(string? xml, bool omitRootObject = true)
    {
        if (string.IsNullOrWhiteSpace(xml) || !TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            return null;
        }

        string json = ToJsonString(normalized, omitRootObject, Newtonsoft.Json.Formatting.None);
        return JToken.Parse(json);
    }

    /// <summary>
    /// Converts XML to a Newtonsoft dynamic graph.
    /// </summary>
    /// <remarks>
    /// Do not return this from ASP.NET Core actions that use <see cref="System.Text.Json"/> for responses:
    /// <see cref="JObject"/>/<see cref="JArray"/> serialize incorrectly (nested empty arrays). Use <see cref="ToJsonElement"/> for APIs instead.
    /// </remarks>
    public static dynamic? ToDynamic(string? xml, bool omitRootObject = true)
    {
        if (string.IsNullOrWhiteSpace(xml) || !TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            return null;
        }

        string json = ToJsonString(normalized, omitRootObject, Newtonsoft.Json.Formatting.None);
        return JsonConvert.DeserializeObject<dynamic>(json);
    }

    /// <summary>
    /// Converts XML to a <see cref="JsonElement"/> via Newtonsoft XML→JSON then System.Text.Json.JsonDocument.Parse.
    /// Use this for <c>MSResultArgs</c> / API payloads when the host serializes with <see cref="System.Text.Json"/> so the client receives correct objects and arrays.
    /// </summary>
    public static JsonElement? ToJsonElement(string? xml, bool omitRootObject = true)
    {
        if (string.IsNullOrWhiteSpace(xml) || !TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            return null;
        }

        string json = ToJsonString(normalized, omitRootObject, Newtonsoft.Json.Formatting.None);
        using var parsed = JsonDocument.Parse(json);
        return parsed.RootElement.Clone();
    }

    /// <summary>
    /// Converts XML to a strongly typed object.
    /// </summary>
    public static T? ToObject<T>(string? xml, bool omitRootObject = true)
    {
        if (string.IsNullOrWhiteSpace(xml) || !TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            return default;
        }

        string json = ToJsonString(normalized, omitRootObject, Newtonsoft.Json.Formatting.None);
        return JsonConvert.DeserializeObject<T>(json);
    }

    /// <summary>
    /// Deserializes SQL FOR XML / legacy procedure output (plain strings, dynamic rows, or a single row)
    /// into <typeparamref name="T"/> using <see cref="XmlSerializer"/> first, then <see cref="ToObject{T}"/> as fallback.
    /// </summary>
    public static T? TryDeserializeXmlQueryResult<T>(object? queryResult, bool omitRootObject = false)
        where T : class
    {
        if (!TryGetXmlString(queryResult, out string? xml) || string.IsNullOrEmpty(xml))
        {
            return null;
        }

        if (!TryNormalizeToXmlDocument(xml, out string? normalized) || string.IsNullOrEmpty(normalized))
        {
            return null;
        }

        try
        {
            var serializer = new XmlSerializer(typeof(T));
            using var reader = new StringReader(normalized);
            return serializer.Deserialize(reader) as T;
        }
        catch
        {
            return ToObject<T>(normalized, omitRootObject);
        }
    }

    /// <summary>
    /// Tries to read an XML document string from typical Dapper results: a plain string, one row as <c>IDictionary&lt;string, object&gt;</c>
    /// (including <see cref="System.Dynamic.ExpandoObject"/> / <c>QueryAsync&lt;dynamic&gt;</c> rows), legacy <c>IDictionary</c>, or a list of rows.
    /// Supports SQL Server <c>[XML_…, …]</c> payloads, plain XML, and the <c>XML_F52E2B61-…</c> column alias pattern.
    /// </summary>
    public static bool TryGetXmlString(object? queryResult, out string? xml)
    {
        xml = null;

        if (queryResult == null)
        {
            return false;
        }

        if (queryResult is string s)
        {
            return TryNormalizeToXmlDocument(s, out xml) && !string.IsNullOrEmpty(xml);
        }

        if (queryResult is IEnumerable list and not string)
        {
            var sb = new StringBuilder();
            bool foundAny = false;
            foreach (object? item in list)
            {
                if (item == null)
                {
                    continue;
                }

                string? val = null;
                if (item is string sVal)
                {
                    val = sVal;
                }
                else if (item is IDictionary<string, object?> d1)
                {
                    string? key = d1.Keys.FirstOrDefault(k => k.StartsWith("XML_", StringComparison.OrdinalIgnoreCase)) ?? d1.Keys.FirstOrDefault();
                    val = key != null ? d1[key]?.ToString() : null;
                }
                else if (item is IDictionary<string, object> d2)
                {
                    string? key = d2.Keys.FirstOrDefault(k => k.StartsWith("XML_", StringComparison.OrdinalIgnoreCase)) ?? d2.Keys.FirstOrDefault();
                    val = key != null ? d2[key]?.ToString() : null;
                }
                else if (item is IDictionary legacy)
                {
                    foreach (DictionaryEntry entry in legacy)
                    {
                        val = entry.Value?.ToString();
                        break;
                    }
                }
                else
                {
                    val = item.ToString();
                }

                if (!string.IsNullOrEmpty(val))
                {
                    _ = sb.Append(val);
                    foundAny = true;
                }
            }

            if (foundAny)
            {
                string combined = sb.ToString();
                // SQL Server legacy XML metadata looks like: [XML_F52E2B61-18A1-11d1-B105-00805F49916B, <data>]
                // When split into rows, it often repeats the wrapper or splits mid-sentence.
                // We strip all occurrences of the wrapper and the boundary characters ']['.

                // 2. Normalize the global start/end
                if (TryNormalizeToXmlDocument(combined, out xml))
                {
                    return !string.IsNullOrEmpty(xml);
                }

                if (combined.TrimStart().StartsWith('<'))
                {
                    xml = combined.Trim();
                    return true;
                }
            }

            return false;
        }

        if (TryGetXmlStringFromRow(queryResult, out string? rowXml) && !string.IsNullOrEmpty(rowXml))
        {
            xml = rowXml;
            return true;
        }

        return false;
    }

    private static bool TryGetXmlStringFromRow(object? row, out string? xml)
    {
        xml = null;

        if (row == null)
        {
            return false;
        }

        if (row is string rowString && TryNormalizeToXmlDocument(rowString, out string? fromString))
        {
            xml = fromString;
            return !string.IsNullOrEmpty(xml);
        }

        // Dapper dynamic rows (ExpandoObject): IDictionary<string, object?> — does not implement non-generic IDictionary.
        if (row is IDictionary<string, object?> stringKeyedNullable)
        {
            return TryGetXmlFromStringKeyedPairs(stringKeyedNullable, out xml);
        }

        if (row is IDictionary<string, object> stringKeyed)
        {
            return TryGetXmlFromStringKeyedPairs(
                stringKeyed.Select(kv => new KeyValuePair<string, object?>(kv.Key, kv.Value)),
                out xml);
        }

        if (row is IDictionary legacy && row is not string)
        {
            foreach (DictionaryEntry entry in legacy)
            {
                string? text = entry.Value as string ?? entry.Value?.ToString();
                if (string.IsNullOrWhiteSpace(text))
                {
                    continue;
                }

                if (TryNormalizeToXmlDocument(text, out string? normalized) && !string.IsNullOrEmpty(normalized))
                {
                    xml = normalized;
                    return true;
                }
            }
        }

        return false;
    }

    /// <summary>
    /// Prefer SQL Server <c>xml</c> column keys (<c>XML_*</c>) when multiple string columns exist.
    /// </summary>
    private static bool TryGetXmlFromStringKeyedPairs(IEnumerable<KeyValuePair<string, object?>> pairs, out string? xml)
    {
        xml = null;

        foreach (var kv in pairs.OrderBy(k => k.Key.StartsWith("XML_", StringComparison.OrdinalIgnoreCase) ? 0 : 1))
        {
            string? text = kv.Value as string ?? kv.Value?.ToString();
            if (TryNormalizeToXmlDocument(text, out string? normalized) && !string.IsNullOrEmpty(normalized))
            {
                xml = normalized;
                return true;
            }
        }

        return false;
    }
}
