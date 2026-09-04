// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO for updating the platform-wide, file-backed email configuration (SMTP + branding).
    /// Persisted to _configurationSettings.json via ConfSettingsService — not a database row.
    /// </summary>
    public class EmailSettingsInput
    {
        /// <summary>
        /// Gets or sets whether outgoing mail sending is enabled.
        /// </summary>
        public bool SendMailEnabled { get; set; }

        /// <summary>
        /// Gets or sets the SMTP server host.
        /// </summary>
        public string SmtpServer { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP server port.
        /// </summary>
        public int SmtpPort { get; set; }

        /// <summary>
        /// Gets or sets the display name shown as the outgoing mail sender.
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP authentication username / mailbox address.
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP authentication password. Write-only — left blank to keep the
        /// currently stored password unchanged; only overwritten when a non-blank value is supplied.
        /// </summary>
        public string? Password { get; set; }

        /// <summary>
        /// Gets or sets whether SSL/TLS is enabled for the SMTP connection.
        /// </summary>
        public bool IsSslEnabled { get; set; }

        /// <summary>
        /// Gets or sets the CC address applied to outgoing mail, if any.
        /// </summary>
        public string? CcMailId { get; set; }

        /// <summary>
        /// Gets or sets the "Contact Us" address shown in the email disclaimer footer.
        /// </summary>
        public string? ContactUsMailId { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide accent color (hex) substituted for every template's
        /// [AccentColor] merge tag.
        /// </summary>
        public string? AccentColor { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide email body font family.
        /// </summary>
        public string? FontFamily { get; set; }

        /// <summary>
        /// Gets or sets the platform-wide email body base font size in pixels.
        /// </summary>
        public int? BaseFontSize { get; set; }

        /// <summary>
        /// Gets or sets this API's own base URL (e.g. "https://localhost:5051" in local
        /// development), used to build the email logo's absolute image URL. Separate from any
        /// front-end/portal URL — those hosts can differ, most obviously in local development.
        /// </summary>
        public string? ApiBaseUrl { get; set; }
    }
}
