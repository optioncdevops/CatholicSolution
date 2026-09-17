// Copyright (c) OptionC. All rights reserved.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CFR.SyncInfrastructure.Models.Input
{
    /// <summary>
    /// Create/update payload for the single-user sync API. ProductId is deliberately NOT a
    /// property here — it is resolved only from the authenticated ApiClient. <see cref="ExtraFields"/>
    /// exists solely so the service layer can detect and reject a client-supplied "productId" field
    /// (System.Text.Json silently drops unknown properties by default, which would not satisfy the
    /// spec's hard PRODUCT_SCOPE_VIOLATION rule without this catch-all).
    /// </summary>
    public class UserSyncInput
    {
        /// <summary>The product's own user identifier.</summary>
        [JsonPropertyName("externalUserId")]
        public string ExternalUserId { get; set; } = string.Empty;

        /// <summary>The product's own organization identifier.</summary>
        [JsonPropertyName("productOrgId")]
        public int ProductOrgId { get; set; }

        /// <summary>User email address.</summary>
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>User first name.</summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>User last name.</summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        /// <summary>Opaque per-product role identifier.</summary>
        [JsonPropertyName("roleId")]
        public int? RoleId { get; set; }

        /// <summary>Login-disabled flag; defaults to false when omitted on create.</summary>
        [JsonPropertyName("isLoginDisabled")]
        public bool? IsLoginDisabled { get; set; }

        /// <summary>Active/usable flag; defaults to true when omitted on create.</summary>
        [JsonPropertyName("isActive")]
        public bool? IsActive { get; set; }

        /// <summary>Catch-all for unrecognized body fields — used only to detect a rejected "productId".</summary>
        [JsonExtensionData]
        public Dictionary<string, JsonElement>? ExtraFields { get; set; }
    }
}
