// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to authenticate a CFR Portal member.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class PortalAuthenticationInput
    {
        /// <summary>
        /// Gets or sets the login email address.
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
    }
}
