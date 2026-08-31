// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to request a password reset email for an Acutis user.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class ForgotPasswordInput
    {
        /// <summary>
        /// Gets or sets the account email address (login user name).
        /// </summary>
        [Required]
        [JsonPropertyName("userName")]
        public string UserName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Input DTO used to complete a password reset with a previously issued token.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class ResetPasswordInput
    {
        /// <summary>
        /// Gets or sets the reset token delivered to the user's email address.
        /// </summary>
        [Required]
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the new plain-text password to set.
        /// </summary>
        [Required]
        [JsonPropertyName("newPassword")]
        public string NewPassword { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the confirmation of the new password; must match NewPassword.
        /// </summary>
        [Required]
        [JsonPropertyName("confirmPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
