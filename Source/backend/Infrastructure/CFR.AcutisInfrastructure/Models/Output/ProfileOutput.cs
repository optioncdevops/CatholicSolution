// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Profile.ProfileCrud (ActionId 1).
    /// Holds the signed-in user's own profile fields.
    /// </summary>
    public class ProfileOutput
    {
        /// <summary>
        /// Gets or sets the user identifier.
        /// </summary>
        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the relative URL of the uploaded profile image, or null when none is set.
        /// </summary>
        [JsonPropertyName("profileImageUrl")]
        public string? ProfileImageUrl { get; set; }
    }
}
