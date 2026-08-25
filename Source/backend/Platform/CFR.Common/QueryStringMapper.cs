// Copyright (c) OptionC. All rights reserved.

using System.Globalization;

namespace CFR.Common
{
    public static class QueryStringMapper
    {
        public static void MapToObject<T>(string queryString, T targetObject) where T : class
        {
            var parsed = System.Web.HttpUtility.ParseQueryString(queryString);

            foreach (var prop in typeof(T).GetProperties())
            {
                string? rawValue = parsed[prop.Name];

                // Skip null/empty/"null"
                if (string.IsNullOrEmpty(rawValue) || rawValue.Equals("null", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                try
                {
                    object? converted = null;
                    var propType = prop.PropertyType;

                    if (propType == typeof(short?) || propType == typeof(short))
                    {
                        converted = short.TryParse(rawValue, out short s) ? s : null;
                    }
                    else if (propType == typeof(int?) || propType == typeof(int))
                    {
                        converted = int.TryParse(rawValue, out int i) ? i : null;
                    }
                    else if (propType == typeof(decimal?) || propType == typeof(decimal))
                    {
                        converted = decimal.TryParse(rawValue, out decimal i) ? i : null;
                    }
                    else if (propType == typeof(bool?) || propType == typeof(bool))
                    {
                        converted = bool.TryParse(rawValue, out bool i) ? i : null;
                    }
                    else if (propType == typeof(DateTime?) || propType == typeof(DateTime))
                    {
                        if (DateTime.TryParse(rawValue, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var d))
                        {
                            converted = d;
                        }
                    }
                    else if (propType == typeof(TimeOnly?) || propType == typeof(TimeOnly))
                    {
                        converted = TimeOnly.TryParse(rawValue, out var output) ? output : null;
                    }
                    else if (propType == typeof(DateOnly?) || propType == typeof(DateOnly))
                    {
                        converted = DateOnly.TryParse(rawValue, out var output) ? output : null;
                    }
                    else if (propType == typeof(string))
                    {
                        converted = rawValue;
                    }
                    else if (propType == typeof(Guid?) || propType == typeof(Guid))
                    {
                        if (Guid.TryParse(rawValue, out var g))
                        {
                            converted = g;
                        }
                    }
                    else if (
                        propType == typeof(List<Guid>) ||
                        (propType.IsGenericType &&
                         propType.GetGenericTypeDefinition() == typeof(List<>) &&
                         propType.GetGenericArguments()[0] == typeof(Guid))
                    )
                    {
#pragma warning disable CA1861 // Avoid constant arrays as arguments
                        string[] stringGuids = rawValue.Split([','], StringSplitOptions.RemoveEmptyEntries);
#pragma warning restore CA1861 // Avoid constant arrays as arguments
                        var guidList = stringGuids
                            .Select(g => Guid.TryParse(g, out var result) ? result : Guid.Empty)
                            .Where(g => g != Guid.Empty)
                            .ToList();

                        converted = guidList;
                    }
                    else if (propType == typeof(string[]))
                    {
                        converted = rawValue.Split([','], StringSplitOptions.RemoveEmptyEntries)
                      .Select(s => s.Trim())
                      .ToArray();
                    }
                    else if (propType == typeof(Guid[]))
                    {
                        converted = rawValue
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => Guid.TryParse(s.Trim(), out var g) ? g : Guid.Empty) // force non-null
                            .ToArray();
                    }
                    else if (propType == typeof(Guid?[]))
                    {
                        converted = rawValue
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => Guid.TryParse(s.Trim(), out var g) ? g : (Guid?)null)
                            .ToArray();
                    }
                    // For array types
                    else if (propType == typeof(int[]))
                    {
                        converted = rawValue
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.TryParse(s.Trim(), out int g) ? g : 0)
                            .ToArray();
                    }
                    else if (propType == typeof(int?[]))
                    {
                        converted = rawValue
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.TryParse(s.Trim(), out int g) ? (int?)g : null)
                            .ToArray();
                    }

                    // For List<int> or List<int?>
                    else if (propType.IsGenericType && propType.GetGenericTypeDefinition() == typeof(List<>))
                    {
                        var elementType = propType.GetGenericArguments()[0];

                        if (elementType == typeof(int))
                        {
                            converted = rawValue
                                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s => int.Parse(s.Trim()))
                                .ToList();
                        }
                        else if (elementType == typeof(int?))
                        {
                            converted = rawValue
                                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s => int.TryParse(s.Trim(), out int i) ? (int?)i : null)
                                .ToList();
                        }
                        else if (elementType == typeof(string))
                        {
                            converted = rawValue
                                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s => s.Trim())
                                .ToList();
                        }
                    }
                    if (converted != null)
                    {
                        prop.SetValue(targetObject, converted);
                    }
                }
                catch
                {
                    // Log if needed
                }
            }
        }
    }
}
