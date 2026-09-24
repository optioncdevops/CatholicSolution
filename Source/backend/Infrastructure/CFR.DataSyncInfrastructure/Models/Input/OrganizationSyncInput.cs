// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Create/update payload for the organization onboarding API. ProductId is deliberately NOT a
    /// property here — it is resolved only from the authenticated ApiClient, same rule as
    /// UserSyncInput.
    /// </summary>
    public class OrganizationSyncInput
    {
        /// <summary>The product's own organization identifier.</summary>
        [JsonPropertyName("productOrgId")]
        public int ProductOrgId { get; set; }

        /// <summary>Organization name.</summary>
        [JsonPropertyName("orgName")]
        public string OrgName { get; set; } = string.Empty;

        /// <summary>Organization state/province.</summary>
        [JsonPropertyName("orgState")]
        public string? OrgState { get; set; }

        /// <summary>Organization country.</summary>
        [JsonPropertyName("orgCountry")]
        public string? OrgCountry { get; set; }

        /// <summary>Organization contact email.</summary>
        [JsonPropertyName("contactEmail")]
        public string? ContactEmail { get; set; }

        /// <summary>Organization website.</summary>
        [JsonPropertyName("website")]
        public string? Website { get; set; }

        /// <summary>Organization contact person.</summary>
        [JsonPropertyName("contactPerson")]
        public string? ContactPerson { get; set; }

        /// <summary>Organization contact phone.</summary>
        [JsonPropertyName("contactPhone")]
        public string? ContactPhone { get; set; }

        /// <summary>Organization street address.</summary>
        [JsonPropertyName("address")]
        public string? Address { get; set; }

        /// <summary>Organization city.</summary>
        [JsonPropertyName("city")]
        public string? City { get; set; }

        /// <summary>Organization state/province (address line).</summary>
        [JsonPropertyName("state")]
        public string? State { get; set; }

        /// <summary>Organization postal/zip code.</summary>
        [JsonPropertyName("zip")]
        public string? Zip { get; set; }

        /// <summary>The product's own diocese identifier, stored on lic.OrganizationProduct.DioceseId.</summary>
        [JsonPropertyName("dioceseId")]
        public string? DioceseId { get; set; }
    }
}
