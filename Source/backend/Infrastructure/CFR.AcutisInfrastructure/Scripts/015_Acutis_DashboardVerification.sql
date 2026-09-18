-- Copyright (c) OptionC. All rights reserved.
-- Documentation only — no schema objects are created, altered, or dropped by this file.
--
-- Ad-hoc verification queries for the CFR Admin Dashboard's authoritative data sources
-- ([dbo].[Acutis_Dashboard], see 014_Acutis_DashboardSummary.sql) and for the
-- [auth.UserProduct] + [lic.OrganizationProduct] approval-provisioning logic in
-- [request].[AccessRequestManage] ActionId 2 (see 008_AccessRequest.sql).
--
-- Each section below is a self-contained batch (separated by GO) so it can be selected and run
-- on its own in SSMS/Azure Data Studio. Before running section 1, 2, or 3, replace the literal
-- sample value (0) in its DECLARE line with the real id you want to check.

-- =============================================================================================
-- 1) Was a specific access request actually approved end-to-end?
--    An approved request must have BOTH an active lic.OrganizationProduct row for its
--    Org+Product AND an active auth.UserProduct row for its requester. If either is missing,
--    the approval was not fully provisioned even though the request header says "approved".
-- =============================================================================================
DECLARE @CheckAccessRequestId INT = 0; -- <-- replace 0 with the AccessRequestId to check

SELECT
    ar.AccessRequestId,
    ar.OrgId,
    ar.RequestedBy,
    arp.ProductId,
    arp.LineStatus,                                   -- 2 = approved, 3 = rejected, 1 = info-requested, else pending
    CASE
        WHEN ar.RequestStatus = 2 AND arp.LineStatus = 1 THEN 'info-requested'
        WHEN arp.LineStatus = 2 THEN 'approved'
        WHEN arp.LineStatus = 3 THEN 'rejected'
        ELSE 'pending'
    END AS DerivedStatus,
    op.OrganizationProductId,
    op.AssignStatus AS OrgProductAssignStatus,
    op.IsDeleted AS OrgProductIsDeleted,
    up.CFRUserDetailId,
    up.IsDeleted AS UserProductIsDeleted,
    up.IsLoginDisabled,
    up.IsActive,
    CASE
        WHEN arp.LineStatus = 2 AND (op.OrganizationProductId IS NULL OR op.AssignStatus <> 'active' OR op.IsDeleted = 1)
            THEN 'INCONSISTENT: approved but no active OrganizationProduct'
        WHEN arp.LineStatus = 2 AND up.CFRUserDetailId IS NULL
            THEN 'INCONSISTENT: approved but no UserProduct mapping for requester'
        WHEN arp.LineStatus = 2 THEN 'OK: fully provisioned'
        ELSE 'N/A: not an approved line'
    END AS ProvisioningCheck
FROM [request].[AccessRequest] ar
INNER JOIN [request].[AccessRequestProduct] arp ON arp.AccessRequestId = ar.AccessRequestId
LEFT JOIN [lic].[OrganizationProduct] op
    ON op.OrgId = ar.OrgId AND op.ProductId = arp.ProductId AND op.AssignStatus = 'active' AND op.IsDeleted = 0
LEFT JOIN [auth].[UserProduct] up
    ON up.OrgId = ar.OrgId AND up.ProductId = arp.ProductId AND up.IsDeleted = 0
    AND up.CFRUserId = ar.RequestedBy
WHERE ar.AccessRequestId = @CheckAccessRequestId;
GO

-- =============================================================================================
-- 2) Is a given organization's app assignment active? (lic.OrganizationProduct — never
--    core.Product.IsActive, which only reflects catalog availability, not any organization's
--    entitlement.)
-- =============================================================================================
DECLARE @CheckOrgId INT = 0;     -- <-- replace 0 with the OrgId to check
DECLARE @CheckProductId INT = 0; -- <-- replace 0 with the ProductId to check

SELECT op.*, p.ProductName, o.OrgName, o.OrgStatus
FROM [lic].[OrganizationProduct] op
INNER JOIN [core].[Product] p ON p.ProductId = op.ProductId
INNER JOIN [core].[Organization] o ON o.OrgId = op.OrgId
WHERE op.OrgId = @CheckOrgId AND op.ProductId = @CheckProductId AND op.IsDeleted = 0;
GO

-- =============================================================================================
-- 3) Is a given member actually entitled to an app? (auth.UserProduct — this, not
--    auth.OrganizationUser, is what the portal's "Your Apps" screen is driven by.)
--    Section 4 below reuses the same @CheckCFRUserId within its own batch.
-- =============================================================================================
DECLARE @CheckCFRUserId INT = 0; -- <-- replace 0 with the CFRUserId to check

SELECT up.*, p.ProductName
FROM [auth].[UserProduct] up
INNER JOIN [core].[Product] p ON p.ProductId = up.ProductId
WHERE up.CFRUserId = @CheckCFRUserId AND up.IsDeleted = 0 AND up.IsLoginDisabled = 0 AND up.IsActive = 1;
GO

-- =============================================================================================
-- 4) Reproduce exactly what the portal's "Your Apps" screen should show for a member: an app
--    appears only when catalog + org assignment + member mapping are ALL active simultaneously.
-- =============================================================================================
DECLARE @CheckCFRUserId INT = 0; -- <-- replace 0 with the CFRUserId to check

SELECT p.ProductId, p.ProductName, o.OrgName
FROM [auth].[UserProduct] up
INNER JOIN [core].[Product] p ON p.ProductId = up.ProductId AND p.IsActive = 1 AND p.IsDeleted = 0
INNER JOIN [lic].[OrganizationProduct] op
    ON op.OrgId = up.OrgId AND op.ProductId = up.ProductId AND op.AssignStatus = 'active' AND op.IsDeleted = 0
INNER JOIN [core].[Organization] o ON o.OrgId = up.OrgId AND o.OrgStatus = 'active'
WHERE up.CFRUserId = @CheckCFRUserId AND up.IsDeleted = 0 AND up.IsLoginDisabled = 0 AND up.IsActive = 1;
GO

-- =============================================================================================
-- 5) Find every currently-inconsistent grant across the whole platform (the same 8 conditions
--    [dbo].[Acutis_Dashboard] ActionId 1 counts for the Access Integrity panel — this
--    section lists the actual offending rows instead of just a count). No parameters needed.
-- =============================================================================================

-- 5a. Approved requests with no active OrganizationProduct for their Org+Product.
SELECT ar.AccessRequestId, ar.OrgId, arp.ProductId
FROM [request].[AccessRequest] ar
INNER JOIN [request].[AccessRequestProduct] arp ON arp.AccessRequestId = ar.AccessRequestId AND arp.LineStatus = 2
WHERE NOT EXISTS (
    SELECT 1 FROM [lic].[OrganizationProduct] op
    WHERE op.OrgId = ar.OrgId AND op.ProductId = arp.ProductId AND op.AssignStatus = 'active' AND op.IsDeleted = 0
);

-- 5b. Approved requests with no active UserProduct mapping for the requester.
SELECT ar.AccessRequestId, ar.OrgId, ar.RequestedBy, arp.ProductId
FROM [request].[AccessRequest] ar
INNER JOIN [request].[AccessRequestProduct] arp ON arp.AccessRequestId = ar.AccessRequestId AND arp.LineStatus = 2
WHERE NOT EXISTS (
    SELECT 1 FROM [auth].[UserProduct] up
    WHERE up.OrgId = ar.OrgId AND up.ProductId = arp.ProductId AND up.CFRUserId = ar.RequestedBy AND up.IsDeleted = 0
);

-- 5c. Active organization app assignments with zero active members mapped to them.
SELECT op.OrganizationProductId, op.OrgId, op.ProductId
FROM [lic].[OrganizationProduct] op
WHERE op.AssignStatus = 'active' AND op.IsDeleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM [auth].[UserProduct] up
    WHERE up.OrgId = op.OrgId AND up.ProductId = op.ProductId AND up.IsDeleted = 0
  );

-- 5d. Active member mappings whose organization's assignment for that product is not active.
SELECT up.CFRUserDetailId, up.OrgId, up.ProductId
FROM [auth].[UserProduct] up
WHERE up.IsDeleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM [lic].[OrganizationProduct] op
    WHERE op.OrgId = up.OrgId AND op.ProductId = up.ProductId AND op.AssignStatus = 'active' AND op.IsDeleted = 0
  );

-- 5e. The same member with more than one active mapping to the same Org+Product.
SELECT CFRUserId, OrgId, ProductId, COUNT(*) AS MappingCount
FROM [auth].[UserProduct]
WHERE IsDeleted = 0
GROUP BY CFRUserId, OrgId, ProductId
HAVING COUNT(*) > 1;

-- 5f. Rejected requests where the requester still has an active mapping to that product.
SELECT ar.AccessRequestId, ar.OrgId, ar.RequestedBy, arp.ProductId
FROM [request].[AccessRequest] ar
INNER JOIN [request].[AccessRequestProduct] arp ON arp.AccessRequestId = ar.AccessRequestId AND arp.LineStatus = 3
WHERE EXISTS (
    SELECT 1 FROM [auth].[UserProduct] up
    WHERE up.OrgId = ar.OrgId AND up.ProductId = arp.ProductId AND up.CFRUserId = ar.RequestedBy AND up.IsDeleted = 0
);

-- 5g. Expired licenses whose organization app assignment was never revoked.
SELECT l.LicenseId, op.OrgId, op.ProductId, l.ExpiryDate
FROM [lic].[License] l
INNER JOIN [lic].[OrganizationProduct] op ON op.OrganizationProductId = l.OrganizationProductId
WHERE l.ExpiryDate < SYSUTCDATETIME() AND op.AssignStatus = 'active' AND op.IsDeleted = 0;

-- 5h. Inactive/suspended organizations that still carry an active app assignment.
SELECT o.OrgId, o.OrgName, o.OrgStatus, op.ProductId
FROM [core].[Organization] o
INNER JOIN [lic].[OrganizationProduct] op ON op.OrgId = o.OrgId AND op.AssignStatus = 'active' AND op.IsDeleted = 0
WHERE o.OrgStatus <> 'active';
GO

-- =============================================================================================
-- 6) Smoke-test the dashboard summary stored procedure directly (bypasses the API/service
--    layers — useful for confirming the SQL itself before wiring up the .NET stack, or for
--    diagnosing a summary API failure). Adjust the date range as needed.
-- =============================================================================================
EXEC [dbo].[Acutis_Dashboard]
    @ActionId = 1,
    @StartDate = '2026-08-01T00:00:00',
    @EndDate = '2026-09-08T23:59:59';
GO
