// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Payload sent to the external organization-registration API when a public Request Access
    /// submission is saved. Field names/shape match the external API's own parameter list exactly
    /// (all string, matching its VARCHAR(100) signature) - not CFR's own naming conventions.
    /// </summary>
    public class ExternalOrganizationRequestPayload
    {
        [JsonPropertyName("userName")]
        public string UserName { get; set; } = string.Empty;

        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        [JsonPropertyName("dioId")]
        public string DioId { get; set; } = string.Empty;

        [JsonPropertyName("organizationName")]
        public string OrganizationName { get; set; } = string.Empty;

        [JsonPropertyName("contactNo")]
        public string ContactNo { get; set; } = string.Empty;

        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; } = string.Empty;

        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;

        [JsonPropertyName("city")]
        public string City { get; set; } = string.Empty;

        [JsonPropertyName("state")]
        public string State { get; set; } = string.Empty;

        [JsonPropertyName("postalCode")]
        public string PostalCode { get; set; } = string.Empty;
    }
}
