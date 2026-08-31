// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.AcutisAuth.PasswordResetCrud (ActionId 1).
    /// Holds the matched user's identity used to compose the reset email. Never returned to the client.
    /// </summary>
    public class ForgotPasswordUserResult
    {
        /// <summary>
        /// Gets or sets the user identifier. Maps from the bigint [auth].[AcutisUser].UserId column.
        /// </summary>
        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        /// <summary>
        /// Gets or sets the email address the reset link is sent to.
        /// </summary>
        [JsonPropertyName("email")]
        public string? Email { get; set; }

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
    }
}
