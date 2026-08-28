// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to activate or deactivate an Acutis role.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UserRoleStatusInput
    {
        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the target status (active or inactive).
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}
