// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Administration.EmailTemplatesCrud.
    /// Holds one email template row returned to the service and controller.
    /// </summary>
    public class EmailTemplateOutput
    {
        /// <summary>
        /// Gets or sets the template identifier.
        /// </summary>
        [JsonPropertyName("templateId")]
        public int TemplateId { get; set; }

        /// <summary>
        /// Gets or sets the stable code used to look up this template at send time.
        /// </summary>
        [JsonPropertyName("templateCode")]
        public string TemplateCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email subject line.
        /// </summary>
        [JsonPropertyName("subject")]
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email body.
        /// </summary>
        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the template status ("active" / "inactive").
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets when the template was created.
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// Gets or sets when the template was last updated.
        /// </summary>
        [JsonPropertyName("updatedDate")]
        public DateTime? UpdatedDate { get; set; }

        /// <summary>
        /// Gets or sets the accent color (hex) used for this template's button and link color at
        /// send time. Always populated — the stored procedure substitutes the built-in default
        /// when the row has none set.
        /// </summary>
        [JsonPropertyName("accentColor")]
        public string AccentColor { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets an absolute logo image URL shown above this template's body at send time,
        /// or null to use the shared text brand header (or no header, per microservice config).
        /// </summary>
        [JsonPropertyName("logoUrl")]
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Gets or sets the CSS font-family stack used for this template's body at send time.
        /// Always populated — the stored procedure substitutes the built-in default when the row
        /// has none set.
        /// </summary>
        [JsonPropertyName("fontFamily")]
        public string FontFamily { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the base body font size in pixels for this template at send time. Always
        /// populated — the stored procedure substitutes the built-in default when the row has none
        /// set.
        /// </summary>
        [JsonPropertyName("baseFontSize")]
        public int BaseFontSize { get; set; }
    }
}
