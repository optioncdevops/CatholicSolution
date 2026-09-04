// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Login response wrapper mapped from stored procedure StoredProc.PortalAuth.DoLogin.
    /// </summary>
    public class PortalLoginQueryResult
    {
        /// <summary>
        /// Gets or sets the authenticated member profile.
        /// </summary>
        [JsonPropertyName("user")]
        public PortalLoginUserResult? User { get; set; }
    }

    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.PortalAuth.DoLogin.
    /// Holds the authenticated CFR member returned to the service and controller.
    /// </summary>
    public class PortalLoginUserResult
    {
        /// <summary>
        /// Gets or sets the CFR member identifier.
        /// </summary>
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [JsonPropertyName("eMail")]
        public string? EMail { get; set; }

        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        /// <summary>
        /// Gets or sets the JWT issued after a successful login.
        /// </summary>
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;
    }
}
