// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to authenticate an Acutis user.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class AcutisAuthenticationInput
    {
        /// <summary>
        /// Gets or sets the login user name (email address).
        /// </summary>
        [Required]
        [JsonPropertyName("userName")]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the plain-text password to verify.
        /// </summary>
        [Required]
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the optional client IP address.
        /// </summary>
        [JsonPropertyName("ipAddress")]
        public string? IPAddress { get; set; }
    }
}
