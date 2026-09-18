// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Contact/org fields needed to call SMS's SetupNewOrganizationByCFR when a request is
    /// approved. OrganizationName/Address/City/State/Zip are read directly from
    /// request.AccessRequest (staged there at submission time - see ActionId 7 in
    /// 008_AccessRequest.sql) rather than from core.Organization, since that row isn't created
    /// until approval itself. DioceseId is set on request.AccessRequest at submission time by a
    /// follow-up UPDATE in AccessRequestRepository.SaveAccessRequestAsync (CFR.Portal), since SMS
    /// requires DioId.
    /// </summary>
    public class OrgSetupContextOutput
    {
        public int? OrgId { get; set; }

        public int? CFRUserId { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? OrganizationName { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Zip { get; set; }

        public int? DioceseId { get; set; }

        /// <summary>
        /// Name of the first (lowest AccessRequestProductId) product on this request, used to pick
        /// which SMS setup endpoint to call - e.g. "Parish Hub" routes to SetupNewParishOrganizationByCFR
        /// instead of the generic SetupNewOrganizationByCFR.
        /// </summary>
        public string? ProductName { get; set; }
    }
}
