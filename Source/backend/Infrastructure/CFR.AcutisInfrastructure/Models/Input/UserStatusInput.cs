// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to activate or deactivate an Acutis user.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UserStatusInput
    {
        /// <summary>
        /// Gets or sets the user identifier.
        /// </summary>
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the active flag. 1 = active, 0 = inactive.
        /// </summary>
        [JsonPropertyName("isActive")]
        public int IsActive { get; set; }
    }
}
