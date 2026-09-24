// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Upsert payload for the per-product role catalog. ProductId is deliberately NOT a property
    /// here — it is resolved only from the authenticated ApiClient, same as UserSyncInput.
    /// </summary>
    public class ProductRoleInput
    {
        /// <summary>Opaque per-product role identifier — the same value later passed as
        /// UserSyncInput.RoleId when creating/updating a user.</summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>Display name for the role.</summary>
        [JsonPropertyName("roleName")]
        public string RoleName { get; set; } = string.Empty;
    }
}
