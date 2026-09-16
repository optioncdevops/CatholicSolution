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

        /// <summary>
        /// True when a reset token was already issued for this user within the resend cooldown
        /// window (see Acutis_PasswordReset's @ResendCooldownSeconds) — no new token was
        /// issued and no new email should be sent; the still-active link from the earlier request
        /// remains the one to use.
        /// </summary>
        [JsonPropertyName("rateLimited")]
        public bool RateLimited { get; set; }
    }
}
