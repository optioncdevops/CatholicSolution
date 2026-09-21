// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to exchange an Auth0 access token for a CFR Portal session JWT.
    /// Bound from the controller request body and passed to the service layer.
    /// </summary>
    public class Auth0ExchangeInput
    {
        /// <summary>
        /// Gets or sets the Auth0 access token to verify against Auth0's /userinfo endpoint.
        /// </summary>
        [Required]
        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; } = string.Empty;
    }
}
