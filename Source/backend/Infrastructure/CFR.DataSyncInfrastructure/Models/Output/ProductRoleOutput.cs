// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// One role row for the calling product — returned both from the upsert action and as an
    /// entry in the list returned by the get-roles action.
    /// </summary>
    public class ProductRoleOutput
    {
        /// <summary>Opaque per-product role identifier.</summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>Display name for the role.</summary>
        [JsonPropertyName("roleName")]
        public string RoleName { get; set; } = string.Empty;
    }
}
