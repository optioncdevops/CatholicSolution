// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Header/product-line fields needed by AccessRequestRepository.PersistOrgSetupResultAsync to
    /// create [core].[Organization] (if it doesn't exist yet) and write SMS's returned OrgId into
    /// [lic].[OrganizationProduct].
    /// </summary>
    public class OrgSetupPersistContext
    {
        public int? CFROrgId { get; set; }

        public int? ProductId { get; set; }

        public string? OrgName { get; set; }

        public string? OrgState { get; set; }

        public string? ContactEmail { get; set; }

        public string? ContactPhone { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }
    }
}
