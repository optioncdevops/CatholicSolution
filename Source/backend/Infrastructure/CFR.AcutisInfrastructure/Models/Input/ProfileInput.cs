// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to update the signed-in user's own profile fields, including an optional
    /// new profile image — bound from multipart/form-data so the image and the other fields are
    /// saved together in a single request/method, instead of a separate upload-then-save round trip.
    /// </summary>
    public class UpdateProfileInput
    {
        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [Required]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [Required]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [Required]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the contact/phone number, or null to leave it unset.
        /// </summary>
        public string? ContactNumber { get; set; }

        /// <summary>
        /// Gets or sets a new profile image to save (JPG or PNG, max 2MB), or null to leave the
        /// current image unchanged (unless <see cref="RemoveProfileImage"/> is set).
        /// </summary>
        public IFormFile? ProfileImage { get; set; }

        /// <summary>
        /// Gets or sets whether to clear the current profile image. Ignored when
        /// <see cref="ProfileImage"/> is also provided.
        /// </summary>
        public bool RemoveProfileImage { get; set; }
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
