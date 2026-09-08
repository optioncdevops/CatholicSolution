// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to add or update an email template.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class EmailTemplateInput
    {
        /// <summary>
        /// Gets or sets the template identifier; 0 for a new template.
        /// </summary>
        [JsonPropertyName("templateId")]
        public int TemplateId { get; set; }

        /// <summary>
        /// Gets or sets the stable code used to look up this template at send time (e.g. "PasswordReset").
        /// Required only when creating a new template; ignored on update.
        /// </summary>
        [JsonPropertyName("templateCode")]
        public string? TemplateCode { get; set; }

        /// <summary>
        /// Gets or sets the email subject line. May contain [placeholder] merge tags.
        /// </summary>
        [Required]
        [JsonPropertyName("subject")]
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email body. May contain [placeholder] merge tags.
        /// </summary>
        [Required]
        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the template status ("active" / "inactive").
        /// </summary>
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        /// <summary>
        /// Gets or sets the accent color (hex, e.g. "#1d4ed8") used for this template's button and
        /// link color at send time. Null falls back to the built-in default.
        /// </summary>
        [JsonPropertyName("accentColor")]
        public string? AccentColor { get; set; }

        /// <summary>
        /// Gets or sets an absolute logo image URL shown above this template's body at send time.
        /// Null falls back to the shared text brand header (or no header, per microservice config).
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets the CSS font-family stack used for this template's body at send time.
        /// Null falls back to the built-in default.
        /// </summary>
        [JsonPropertyName("fontFamily")]
        public string? FontFamily { get; set; }

        /// <summary>
        /// Gets or sets the base body font size in pixels for this template at send time.
        /// Null falls back to the built-in default.
        /// </summary>
        [JsonPropertyName("baseFontSize")]
        public int? BaseFontSize { get; set; }
    }

    /// <summary>
    /// Input DTO used to send a test email using ad-hoc (possibly unsaved) subject/body content.
    /// Bound from the controller request body and passed to the service.
    /// </summary>
    public class SendTestEmailInput
    {
        /// <summary>
        /// Gets or sets the template code of the editor template being tested (e.g. "PasswordReset").
        /// </summary>
        [Required]
        [JsonPropertyName("templateCode")]
        public string TemplateCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the subject line to send, exactly as currently shown in the editor.
        /// </summary>
        [Required]
        [JsonPropertyName("subject")]
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the body to send, exactly as currently shown in the editor.
        /// </summary>
        [Required]
        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the recipient address for the test email.
        /// </summary>
        [Required]
        [JsonPropertyName("toAddress")]
        public string ToAddress { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the accent color to test-send with, exactly as currently shown in the editor.
        /// </summary>
        [JsonPropertyName("accentColor")]
        public string? AccentColor { get; set; }

        /// <summary>
        /// Gets or sets the logo URL to test-send with, exactly as currently shown in the editor.
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets the font family to test-send with, exactly as currently shown in the editor.
        /// </summary>
        [JsonPropertyName("fontFamily")]
        public string? FontFamily { get; set; }

        /// <summary>
        /// Gets or sets the base font size to test-send with, exactly as currently shown in the editor.
        /// </summary>
        [JsonPropertyName("baseFontSize")]
        public int? BaseFontSize { get; set; }
    }
}
