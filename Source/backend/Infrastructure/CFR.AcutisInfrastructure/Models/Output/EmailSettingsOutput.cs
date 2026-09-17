// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO for the platform-wide, file-backed email configuration (SMTP + branding),
    /// read from _configurationSettings.json via ConfSettingsService — not a database row.
    /// The SMTP password is never returned; <see cref="HasPassword"/> only indicates whether one
    /// is currently set, so the editor can show a placeholder instead of leaking the secret.
    /// </summary>
    public class EmailSettingsOutput
    {
        /// <summary>
        /// Gets or sets whether outgoing mail sending is enabled ("1"/"0" in the file, exposed as a bool).
        /// </summary>
        [JsonPropertyName("sendMailEnabled")]
        public bool SendMailEnabled { get; set; }

        /// <summary>
        /// Gets or sets the SMTP server host (e.g. "smtp.gmail.com").
        /// </summary>
        [JsonPropertyName("smtpServer")]
        public string SmtpServer { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP server port.
        /// </summary>
        [JsonPropertyName("smtpPort")]
        public int SmtpPort { get; set; }

        /// <summary>
        /// Gets or sets the display name shown as the outgoing mail sender.
        /// </summary>
        [JsonPropertyName("displayName")]
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP authentication username / mailbox address.
        /// </summary>
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets whether a password is currently configured. The password itself is
        /// write-only and never returned by this endpoint.
        /// </summary>
        [JsonPropertyName("hasPassword")]
        public bool HasPassword { get; set; }

        /// <summary>
        /// Gets or sets whether SSL/TLS is enabled for the SMTP connection.
        /// </summary>
        [JsonPropertyName("isSslEnabled")]
        public bool IsSslEnabled { get; set; }

        /// <summary>
        /// Gets or sets the CC address applied to outgoing mail, if any.
        /// </summary>
        [JsonPropertyName("ccMailId")]
        public string? CcMailId { get; set; }

        /// <summary>
        /// Gets or sets the "Contact Us" address shown in the email disclaimer footer.
        /// </summary>
        [JsonPropertyName("contactUsMailId")]
        public string? ContactUsMailId { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide accent color (hex) substituted for every template's
        /// [AccentColor] merge tag.
        /// </summary>
        [JsonPropertyName("accentColor")]
        public string? AccentColor { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide email body font family.
        /// </summary>
        [JsonPropertyName("fontFamily")]
        public string? FontFamily { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide email body base font size in pixels.
        /// </summary>
        [JsonPropertyName("baseFontSize")]
        public int? BaseFontSize { get; set; }

        /// <summary>
        /// Gets or sets the stored file name of the uploaded platform email logo image, or null
        /// when none is uploaded.
        /// </summary>
        [JsonPropertyName("logoFileName")]
        public string? LogoFileName { get; set; }

        /// <summary>
        /// Gets or sets the absolute, publicly reachable URL of the uploaded platform email logo
        /// image (via EmailSettingsController.GetEmailLogo), or null when none is uploaded.
        /// </summary>
        [JsonPropertyName("logoImageUrl")]
        public string? LogoImageUrl { get; set; }

        /// <summary>
        /// Gets or sets this API's own base URL (e.g. "https://localhost:5051" in local
        /// development), used to build the email logo's absolute image URL. Separate from any
        /// front-end/portal URL — those hosts can differ, most obviously in local development.
        /// </summary>
        [JsonPropertyName("apiBaseUrl")]
        public string? ApiBaseUrl { get; set; }

        /// <summary>
        /// Gets or sets the full name of the admin who last saved these settings, or null if
        /// they have never been saved through the editor (e.g. still on their file defaults).
        /// </summary>
        [JsonPropertyName("lastUpdatedByName")]
        public string? LastUpdatedByName { get; set; }

        /// <summary>
        /// Gets or sets the UTC timestamp these settings were last saved.
        /// </summary>
        [JsonPropertyName("lastUpdatedDate")]
        public DateTime? LastUpdatedDate { get; set; }
    }
}
