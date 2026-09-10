// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Dashboard.DashboardCrud (ActionId 1,
    /// result set 1). One row of authoritative, current-state platform KPIs — every count is a
    /// real SQL aggregate against its source-of-truth table, never inferred from static catalog
    /// size or a client-side list filter.
    /// </summary>
    public class DashboardKpiOutput
    {
        /// <summary>Gets or sets the total organization count ([core].[Organization]).</summary>
        [JsonPropertyName("totalOrganizations")]
        public int TotalOrganizations { get; set; }

        /// <summary>Gets or sets the count of organizations with OrgStatus = 'active'.</summary>
        [JsonPropertyName("activeOrganizations")]
        public int ActiveOrganizations { get; set; }

        /// <summary>Gets or sets the count of organizations with OrgStatus = 'inactive'.</summary>
        [JsonPropertyName("inactiveOrganizations")]
        public int InactiveOrganizations { get; set; }

        /// <summary>Gets or sets the count of organizations with OrgStatus = 'suspended'.</summary>
        [JsonPropertyName("suspendedOrganizations")]
        public int SuspendedOrganizations { get; set; }

        /// <summary>Gets or sets the total non-deleted Acutis/admin console user count ([auth].[AcutisUser]).</summary>
        [JsonPropertyName("totalAcutisUsers")]
        public int TotalAcutisUsers { get; set; }

        /// <summary>Gets or sets the count of Acutis users that are active and not locked.</summary>
        [JsonPropertyName("activeAcutisUsers")]
        public int ActiveAcutisUsers { get; set; }

        /// <summary>Gets or sets the count of Acutis users currently locked out.</summary>
        [JsonPropertyName("lockedAcutisUsers")]
        public int LockedAcutisUsers { get; set; }

        /// <summary>Gets or sets the count of distinct members mapped to at least one organization ([auth].[UserProduct]), the portal's real member/product mapping — not [auth].[OrganizationUser].</summary>
        [JsonPropertyName("totalOrganizationMembers")]
        public int TotalOrganizationMembers { get; set; }

        /// <summary>Gets or sets the count of distinct members with no disabled/locked mapping.</summary>
        [JsonPropertyName("activeOrganizationMembers")]
        public int ActiveOrganizationMembers { get; set; }

        /// <summary>Gets or sets the total non-deleted product catalog count ([core].[Product]).</summary>
        [JsonPropertyName("totalProducts")]
        public int TotalProducts { get; set; }

        /// <summary>Gets or sets the count of catalog products flagged active (catalog-level only — see activeOrganizationProductAssignments for real entitlement). Includes both genuinely-active and coming-soon products (both carry IsActive = 1); see activeProducts/upcomingProducts to split those apart.</summary>
        [JsonPropertyName("activeCatalogProducts")]
        public int ActiveCatalogProducts { get; set; }

        /// <summary>Gets or sets the count of catalog products with ProductStatus = 1 (genuinely active, not coming soon).</summary>
        [JsonPropertyName("activeProducts")]
        public int ActiveProducts { get; set; }

        /// <summary>Gets or sets the count of catalog products with ProductStatus = 2 (coming soon / not yet launched).</summary>
        [JsonPropertyName("upcomingProducts")]
        public int UpcomingProducts { get; set; }

        /// <summary>Gets or sets the count of catalog products with IsActive = 0 (disabled from the catalog). ActiveProducts + UpcomingProducts + InactiveProducts always reconciles to TotalProducts.</summary>
        [JsonPropertyName("inactiveProducts")]
        public int InactiveProducts { get; set; }

        /// <summary>Gets or sets the count of organization-product assignment rows currently active ([lic].[OrganizationProduct]).</summary>
        [JsonPropertyName("activeOrganizationProductAssignments")]
        public int ActiveOrganizationProductAssignments { get; set; }

        /// <summary>Gets or sets the count of organization-product assignment rows not currently active (revoked, suspended, or soft-deleted).</summary>
        [JsonPropertyName("inactiveOrganizationProductAssignments")]
        public int InactiveOrganizationProductAssignments { get; set; }

        /// <summary>Gets or sets the count of distinct products with at least one active organization assignment.</summary>
        [JsonPropertyName("totalAssignedProducts")]
        public int TotalAssignedProducts { get; set; }

        /// <summary>Gets or sets the total license count ([lic].[License]).</summary>
        [JsonPropertyName("totalLicenses")]
        public int TotalLicenses { get; set; }

        /// <summary>Gets or sets the count of licenses not suspended and not within 30 days of (or past) expiry.</summary>
        [JsonPropertyName("activeLicenses")]
        public int ActiveLicenses { get; set; }

        /// <summary>Gets or sets the count of licenses expiring within 30 days.</summary>
        [JsonPropertyName("expiringLicenses")]
        public int ExpiringLicenses { get; set; }

        /// <summary>Gets or sets the count of licenses past their expiry date.</summary>
        [JsonPropertyName("expiredLicenses")]
        public int ExpiredLicenses { get; set; }

        /// <summary>Gets or sets the count of licenses with LicenseStatus = 'suspended'.</summary>
        [JsonPropertyName("suspendedLicenses")]
        public int SuspendedLicenses { get; set; }

        /// <summary>Gets or sets the count of access-request product lines currently pending review.</summary>
        [JsonPropertyName("pendingAccessRequests")]
        public int PendingAccessRequests { get; set; }

        /// <summary>Gets or sets the count of access-request product lines approved.</summary>
        [JsonPropertyName("approvedAccessRequests")]
        public int ApprovedAccessRequests { get; set; }

        /// <summary>Gets or sets the count of access-request product lines rejected.</summary>
        [JsonPropertyName("rejectedAccessRequests")]
        public int RejectedAccessRequests { get; set; }

        /// <summary>Gets or sets the count of access-request product lines awaiting more information from the requester.</summary>
        [JsonPropertyName("infoRequestedAccessRequests")]
        public int InfoRequestedAccessRequests { get; set; }

        /// <summary>Gets or sets the count of pending access requests open 7 or more days.</summary>
        [JsonPropertyName("staleAccessRequests")]
        public int StaleAccessRequests { get; set; }
    }
}
