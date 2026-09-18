// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.Common
{
    /// <summary>
    /// Payload sent to SMS's SetupNewOrganizationByCFR when a request is approved. Field
    /// names/shape match SMS's own SetupNewOrganizationByCfrInput exactly (confirmed against
    /// OptionC.SMSInfrastructure.Models.Input.CFR.SetupNewOrganizationByCfrInput) - CFROrgID/
    /// CFRUserID are real ints there (validated as "> 0"), not strings. Shared between
    /// microservices (CFR.Acutis calls this at approval time) since it isn't specific to one
    /// project's models.
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

        [JsonPropertyName("cfrOrgID")]
        public int CfrOrgID { get; set; }

        [JsonPropertyName("cfrUserID")]
        public int CfrUserID { get; set; }
    }

    /// <summary>
    /// Response from POST /api/v1/CFR/GetSetupAccessToken.
    /// </summary>
    public class OrgSetupAccessTokenResponse
    {
        [JsonPropertyName("token")]
        public string? Token { get; set; }

        [JsonPropertyName("expiresInMinutes")]
        public int ExpiresInMinutes { get; set; }
    }

    /// <summary>
    /// Response from POST /api/v1/CFR/SetupNewOrganizationByCFR.
    /// </summary>
    public class OrgSetupResult
    {
        [JsonPropertyName("orgId")]
        public int? OrgId { get; set; }

        [JsonPropertyName("userId")]
        public int? UserId { get; set; }

        [JsonPropertyName("errMessage")]
        public string? ErrMessage { get; set; }
    }

    /// <summary>
    /// Minimal envelope matching OptionC's own ResultArgs/ResultArgs&lt;T&gt; JSON shape
    /// (OptionC.Common.ResultArgs, serialized camelCase). Both SMS CFRController endpoints return
    /// this envelope (via ApiResultArgs) rather than the payload directly - GetSetupAccessToken's
    /// Token/ExpiresInMinutes and SetupNewOrganizationByCFR's OrgId/UserId/ErrMessage are nested
    /// under "resultData", not at the top level of the response body.
    /// </summary>
    public class SmsApiEnvelope<T>
    {
        [JsonPropertyName("resultData")]
        public T? ResultData { get; set; }
    }
}
