// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
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
        /// Gets or sets the number of minutes this template's own link (e.g. a password reset
        /// link) stays valid before expiring. Null for templates with no such link.
        /// </summary>
        [JsonPropertyName("linkExpiryMinutes")]
        public int? LinkExpiryMinutes { get; set; }

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
    }
}
