// Copyright (c) OptionC. All rights reserved.

using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using System.Text.Json.Serialization;

namespace CFR.Base;

/// <summary>
/// Drops any property marked <see cref="JsonExtensionDataAttribute"/> (e.g. UserSyncInput's
/// ExtraFields) from the generated Swagger schema. Such a property exists only so the service
/// layer can detect unexpected body fields (like a rejected "productId") — it is not a real,
/// documented input a caller is meant to fill in, so leaving it visible only produces Swagger's
/// generic "additionalProp1/additionalProp2/additionalProp3" example noise on the request body.
/// </summary>
public class ExtensionDataSchemaFilter: ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties is not { Count: > 0 })
        {
            return;
        }

        foreach (PropertyInfo property in context.Type.GetProperties())
        {
            if (property.GetCustomAttribute<JsonExtensionDataAttribute>() == null)
            {
                continue;
            }

            string? matchingKey = schema.Properties.Keys.FirstOrDefault(key => string.Equals(key, property.Name, StringComparison.OrdinalIgnoreCase));
            if (matchingKey != null)
            {
                schema.Properties.Remove(matchingKey);
            }
        }
    }
}
