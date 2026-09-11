// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Administration.UserRolesCrud.
    /// Holds one Acutis role row returned to the service and controller.
    /// </summary>
    public class UserRolesOutput
    {
        /// <summary>
        /// Gets or sets the role identifier.
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
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the created timestamp.
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime? CreatedDate { get; set; }

        /// <summary>
        /// Gets or sets the number of active Acutis users currently assigned this role.
        /// </summary>
        [JsonPropertyName("usersCount")]
        public int UsersCount { get; set; }
    }
}
