// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to add or update an Acutis role.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UserRolesInput
    {
        /// <summary>
        /// Gets or sets the role identifier. Zero creates a new role.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the role name.
        /// </summary>
        [JsonPropertyName("roleName")]
        public string RoleName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the role description.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the role status (active or inactive).
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = "active";
    }
}
