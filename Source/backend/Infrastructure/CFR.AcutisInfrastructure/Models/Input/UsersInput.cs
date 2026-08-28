// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to add or update an Acutis user.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UsersInput
    {
        /// <summary>
        /// Gets or sets the user identifier. Zero creates a new user.
        /// </summary>
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

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
        /// Gets or sets the email address used as the login name.
        /// </summary>
        [JsonPropertyName("eMail")]
        public string EMail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the plain-text password. Empty on update keeps the existing encrypted password.
        /// </summary>
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("organizationId")]
        public int OrganizationId { get; set; }

        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the active flag. 1 = active, 0 = inactive.
        /// </summary>
        [JsonPropertyName("isActive")]
        public int IsActive { get; set; } = 1;

        /// <summary>
        /// Gets or sets the locked flag. 1 = locked, 0 = unlocked.
        /// </summary>
        [JsonPropertyName("isLocked")]
        public int IsLocked { get; set; }

        /// <summary>
        /// Gets or sets the date of birth.
        /// </summary>
        [JsonPropertyName("dateOfBirth")]
        public DateTime? DateOfBirth { get; set; }
    }
}
