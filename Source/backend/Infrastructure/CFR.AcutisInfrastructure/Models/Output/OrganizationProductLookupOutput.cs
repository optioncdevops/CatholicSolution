// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Existing [lic].[OrganizationProduct] row lookup used by AccessRequestRepository.PersistOrgSetupResultAsync
    /// to decide whether to update or insert the organization-product license/assignment.
    /// </summary>
    public class OrganizationProductLookupOutput
    {
        public int OrganizationProductId { get; set; }

        public bool IsDeleted { get; set; }
    }
}
