// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Dashboard.DashboardCrud (ActionId 1,
    /// result set 2). One row of entitlement-integrity counts — every count here represents a
    /// condition that should never occur once AccessRequest_CRUD ActionId 2 correctly provisions
    /// [lic].[OrganizationProduct] and [auth].[UserProduct] on approval; a non-zero value is real
    /// data drift, not routine dashboard noise, and must never be shown as "all clear".
    /// </summary>
    public class DashboardIntegrityOutput
    {
        /// <summary>Gets or sets the count of approved access requests with no matching active [lic].[OrganizationProduct] row.</summary>
        [JsonPropertyName("approvedRequestsMissingOrganizationProduct")]
        public int ApprovedRequestsMissingOrganizationProduct { get; set; }

        /// <summary>Gets or sets the count of approved access requests with no matching active [auth].[UserProduct] row for the requester.</summary>
        [JsonPropertyName("approvedRequestsMissingUserProduct")]
        public int ApprovedRequestsMissingUserProduct { get; set; }

        /// <summary>Gets or sets the count of active organization-product assignments with no member mapped to them.</summary>
        [JsonPropertyName("activeOrganizationProductsWithoutMembers")]
        public int ActiveOrganizationProductsWithoutMembers { get; set; }

        /// <summary>Gets or sets the count of active member/product mappings whose organization-level assignment is not active.</summary>
        [JsonPropertyName("activeUserProductsWithoutActiveOrganizationProduct")]
        public int ActiveUserProductsWithoutActiveOrganizationProduct { get; set; }

        /// <summary>Gets or sets the count of duplicate active (member, organization, product) mappings beyond the first.</summary>
        [JsonPropertyName("duplicateActiveUserProductMappings")]
        public int DuplicateActiveUserProductMappings { get; set; }

        /// <summary>Gets or sets the count of rejected access requests where the requester still has an active product mapping.</summary>
        [JsonPropertyName("rejectedRequestsWithActiveEntitlements")]
        public int RejectedRequestsWithActiveEntitlements { get; set; }

        /// <summary>Gets or sets the count of expired licenses whose organization-product assignment was never revoked.</summary>
        [JsonPropertyName("expiredLicensesWithActiveOrganizationProduct")]
        public int ExpiredLicensesWithActiveOrganizationProduct { get; set; }

        /// <summary>Gets or sets the count of inactive/suspended organizations that still carry an active product assignment.</summary>
        [JsonPropertyName("inactiveOrganizationsWithActiveProductAssignments")]
        public int InactiveOrganizationsWithActiveProductAssignments { get; set; }

        /// <summary>
        /// Gets the sum of every integrity count — non-zero means at least one condition needs review.
        /// </summary>
        [JsonPropertyName("totalIssues")]
        public int TotalIssues =>
            ApprovedRequestsMissingOrganizationProduct + ApprovedRequestsMissingUserProduct
            + ActiveOrganizationProductsWithoutMembers + ActiveUserProductsWithoutActiveOrganizationProduct
            + DuplicateActiveUserProductMappings + RejectedRequestsWithActiveEntitlements
            + ExpiredLicensesWithActiveOrganizationProduct + InactiveOrganizationsWithActiveProductAssignments;
    }
}
