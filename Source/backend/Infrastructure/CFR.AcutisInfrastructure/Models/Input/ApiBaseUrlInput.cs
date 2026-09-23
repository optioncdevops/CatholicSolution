// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to set this API's own public base URL, used to build the email logo's
    /// absolute image link. Bound from the controller request body on POST SaveApiBaseUrl. Moved
    /// to its own dedicated save action (off the CFR Settings page) so it can be edited without
    /// resubmitting the rest of the SMTP/branding form.
    /// </summary>
    public class ApiBaseUrlInput
    {
        /// <summary>
        /// Gets or sets this API's own public base URL (e.g. "https://cfrapi.example.com/acutis").
        /// Must be an absolute https URL, never a localhost/loopback address.
        /// </summary>
        [JsonPropertyName("apiBaseUrl")]
        public string? ApiBaseUrl { get; set; }
    }
}
