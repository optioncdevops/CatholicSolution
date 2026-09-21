// Copyright (c) OptionC. All rights reserved.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Create/update payload for the organization onboarding API. ProductId is deliberately NOT a
    /// property here — it is resolved only from the authenticated ApiClient, same rule as
    /// UserSyncInput. <see cref="ExtraFields"/> exists solely so the service layer can detect and
    /// reject a client-supplied "productId" field.
    /// </summary>
    public class OrganizationSyncInput
    {
        /// <summary>The product's own organization identifier.</summary>
        [JsonPropertyName("productOrgId")]
        public int ProductOrgId { get; set; }

        /// <summary>Organization name.</summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        [JsonPropertyName("orgState")]
        public string? OrgState { get; set; }

        [JsonPropertyName("orgCountry")]
        public string? OrgCountry { get; set; }

        [JsonPropertyName("contactEmail")]
        public string? ContactEmail { get; set; }

        [JsonPropertyName("website")]
        public string? Website { get; set; }

        [JsonPropertyName("contactPerson")]
        public string? ContactPerson { get; set; }

        [JsonPropertyName("contactPhone")]
        public string? ContactPhone { get; set; }

        [JsonPropertyName("address")]
        public string? Address { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }

        [JsonPropertyName("zip")]
        public string? Zip { get; set; }

        /// <summary>The product's own diocese identifier, stored on lic.OrganizationProduct.DioceseId.</summary>
        [JsonPropertyName("dioceseId")]
        public string? DioceseId { get; set; }

        /// <summary>Catch-all for unrecognized body fields — used only to detect a rejected "productId".</summary>
        [JsonExtensionData]
        public Dictionary<string, JsonElement>? ExtraFields { get; set; }
    }
}
