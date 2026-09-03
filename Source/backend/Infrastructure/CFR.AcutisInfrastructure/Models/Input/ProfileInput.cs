// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to update the signed-in user's own profile fields.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class UpdateProfileInput
    {
        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [Required]
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [Required]
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [Required]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the relative URL of the uploaded profile image (from UploadProfileImage), or null to clear it.
        /// </summary>
        [JsonPropertyName("profileImageUrl")]
        public string? ProfileImageUrl { get; set; }
    }

    /// <summary>
    /// Input DTO used to change the signed-in user's own password.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class ChangePasswordInput
    {
        /// <summary>
        /// Gets or sets the current plain-text password, verified before the change is applied.
        /// </summary>
        [Required]
        [JsonPropertyName("currentPassword")]
        public string CurrentPassword { get; set; } = string.Empty;

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
