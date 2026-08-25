// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common;

/// <summary>
/// Reads values from Dapper dynamic / <see cref="IDictionary{TKey,TValue}"/> rows (e.g. stored procedures with spaced column aliases).
/// </summary>
public static class DictionaryValueHelper
{
    public static int GetInt(IDictionary<string, object> d, string key)
    {
        ArgumentNullException.ThrowIfNull(d);
        if (!d.TryGetValue(key, out object? v) || v is null or DBNull)
        {
            return 0;
        }
        return Convert.ToInt32(v);
    }

    public static string? GetString(IDictionary<string, object> d, string key)
    {
        ArgumentNullException.ThrowIfNull(d);
        if (!d.TryGetValue(key, out object? v) || v is null or DBNull)
        {
            return null;
        }
        return v.ToString();
    }

    public static DateTime? GetDateTime(IDictionary<string, object> d, string key)
    {
        ArgumentNullException.ThrowIfNull(d);
        if (!d.TryGetValue(key, out object? v) || v is null or DBNull)
        {
            return null;
        }
        return Convert.ToDateTime(v);
    }

    public static bool GetBoolean(IDictionary<string, object> d, string key)
    {
        ArgumentNullException.ThrowIfNull(d);
        if (!d.TryGetValue(key, out object? v) || v is null or DBNull)
        {
            return false;
        }
        return Convert.ToBoolean(v);
    }

    public static object? GetValue<TValue>(IDictionary<string, TValue> d, params string[] keys)
    {
        ArgumentNullException.ThrowIfNull(d);
        ArgumentNullException.ThrowIfNull(keys);
        foreach (string k in keys)
        {
            if (d.TryGetValue(k, out TValue? vExact) && vExact is not null and not DBNull)
            {
                return vExact;
            }
        }

        foreach (var kv in d)
        {
            if (kv.Value is null or DBNull)
            {
                continue;
            }
            foreach (string key in keys)
            {
                if (string.Equals(kv.Key, key, StringComparison.OrdinalIgnoreCase))
                {
                    return kv.Value;
                }
            }
        }
        return null;
    }

    public static int TryInt(IDictionary<string, object> d, params string[] keys)
    {
        object? v = GetValue(d, keys);
        if (v is null or DBNull)
        {
            return 0;
        }
        try
        {
            return Convert.ToInt32(v, System.Globalization.CultureInfo.InvariantCulture);
        }
        catch
        {
            return 0;
        }
    }

    public static string? TryStr(IDictionary<string, object> d, params string[] keys)
    {
        object? v = GetValue(d, keys);
        if (v is DateTime dt)
        {
            return dt.ToString("MM/dd/yyyy", System.Globalization.CultureInfo.InvariantCulture);
        }
        return v?.ToString();
    }

    public static bool TryBool(IDictionary<string, object> d, params string[] keys)
    {
        object? v = GetValue(d, keys);
        if (v is null or DBNull)
        {
            return false;
        }
        try
        {
            return Convert.ToBoolean(v);
        }
        catch
        {
            string? s = v.ToString();
            if (string.Equals(s, "True", StringComparison.OrdinalIgnoreCase) || s == "1")
            {
                return true;
            }
            return false;
        }
    }

    public static void FormatBooleanFields(IDictionary<string, object> row, params string[] keys)
    {
        ArgumentNullException.ThrowIfNull(row);
        ArgumentNullException.ThrowIfNull(keys);
        foreach (string key in keys)
        {
            if (row.TryGetValue(key, out object? val))
            {
                if (val != null)
                {
                    string str = val.ToString()?.ToLowerInvariant() ?? string.Empty;
                    row[key] = str is "true" or "1" or "yes" ? "Yes" : "No";
                }
                else
                {
                    row[key] = "No";
                }
            }
        }
    }

    public static void FormatDateFields(IDictionary<string, object> row, params string[] keys)
    {
        ArgumentNullException.ThrowIfNull(row);
        ArgumentNullException.ThrowIfNull(keys);
        foreach (string key in keys)
        {
            if (row.TryGetValue(key, out object? val))
            {
                if (val != null && !string.IsNullOrWhiteSpace(val.ToString()))
                {
                    if (DateTime.TryParse(val.ToString(), out var dt))
                    {
                        row[key] = dt.Year <= 1900 ? "" : dt.ToString("MM/dd/yyyy");
                    }
                }
                else
                {
                    row[key] = "";
                }
            }
        }
    }

    public static void FormatDateTimeField(IDictionary<string, object> row, string key, string defaultIfEmpty = "")
    {
        ArgumentNullException.ThrowIfNull(row);
        if (row.TryGetValue(key, out object? val))
        {
            if (val != null && !string.IsNullOrWhiteSpace(val.ToString()) && val.ToString() != "(none)")
            {
                if (DateTime.TryParse(val.ToString(), out var dt))
                {
                    row[key] = dt.ToString("MM/dd/yyyy HH:mm:ss tt");
                    return;
                }
            }
            row[key] = defaultIfEmpty;
        }
    }

    public static Dictionary<string, dynamic> ConvertToTableDictionary(List<dynamic> tables)
    {
        var response = new Dictionary<string, dynamic>();
        if (tables != null)
        {
            for (int i = 0; i < tables.Count; i++)
            {
                string key = $"Table{i + 1}";
                response[key] = tables[i];
            }
        }
        return response;
    }

    public static List<List<IDictionary<string, object?>>>? ExtractTables(object settingsData)
    {
        try
        {
            dynamic data = settingsData;
            if (data.Tables is not IEnumerable<object> tablesObj)
            {
                return null;
            }

            List<List<IDictionary<string, object?>>> tables = [];
            foreach (object tableObj in tablesObj)
            {
                List<IDictionary<string, object?>> rows = [];
                if (tableObj is IEnumerable<object> rowEnumerable)
                {
                    foreach (object row in rowEnumerable)
                    {
                        if (row is IDictionary<string, object?> typed)
                        {
                            rows.Add(typed);
                        }
                        else if (row is IDictionary<string, object> nonNull)
                        {
                            rows.Add(nonNull.ToDictionary(pair => pair.Key, pair => (object?)pair.Value));
                        }
                        else if (row != null)
                        {
                            IDictionary<string, object> dict = (IDictionary<string, object>)row;
                            rows.Add(dict.ToDictionary(pair => pair.Key, pair => pair.Value is DBNull ? null : (object?)pair.Value));
                        }
                    }
                }

                tables.Add(rows);
            }

            return tables;
        }
        catch (Exception)
        {
            return null;
        }
    }
}
