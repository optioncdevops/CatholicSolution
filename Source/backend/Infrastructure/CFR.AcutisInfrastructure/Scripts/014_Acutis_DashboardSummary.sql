-- Copyright (c) OptionC. All rights reserved.
-- Authoritative CFR Admin Dashboard summary — replaces prototype-style metrics computed in the
-- frontend from broad list endpoints with real, SQL-backed platform KPIs, entitlement-integrity
-- checks, and a raw event feed for the selected date range (bucketed client-side, but the events
-- themselves are queried within [@StartDate, @EndDate], not fetched unbounded and filtered later).
--
-- Authoritative tables per KPI:
--   Organizations                -> [core].[Organization] (OrgStatus)
--   Acutis/admin users           -> [auth].[AcutisUser] (IsActive, IsLocked, IsDeleted)
--   Organization member mappings -> [auth].[UserProduct] (CFRUserId+OrgId+ProductId — the real
--                                   member/product mapping the portal's "Your Apps" reads; NOT
--                                   [auth].[OrganizationUser], which this dashboard does not use
--                                   as an entitlement source)
--   Product catalog              -> [core].[Product] (IsActive, IsDeleted)
--   Organization app assignments -> [lic].[OrganizationProduct] (AssignStatus, IsDeleted)
--   Licenses                     -> [lic].[License] (LicenseStatus, ExpiryDate) joined to
--                                   [lic].[OrganizationProduct]
--   Access requests              -> [request].[AccessRequest] + [request].[AccessRequestProduct]
--                                   (same derived-status rule as AccessRequest_CRUD ActionId 3/4:
--                                   header RequestStatus=2 + line LineStatus=1 => info-requested;
--                                   LineStatus=2 => approved; LineStatus=3 => rejected; else pending)
--
-- License health thresholds mirror frontend/CFR_Admin's accessStatusOf: expired = past due,
-- expiring-soon = due within 30 days, active = everything else. Stale request threshold (7 days)
-- mirrors DashboardPage.tsx's STALE_REQUEST_DAYS.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_Dashboard_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Dashboard_CRUD];
GO

-- ActionId 1: Get summary — three result sets: (1) platform KPIs, one row; (2) entitlement
-- integrity metrics, one row; (3) raw trend events within [@StartDate, @EndDate], one row per
-- event, for the frontend to bucket (daily/weekly/monthly) the same way it already buckets
-- client-loaded data today.
CREATE PROCEDURE [dbo].[Acutis_Dashboard_CRUD]
    @ActionId INT,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        -- Defensive defaults only — the service always supplies a resolved range; this just
        -- keeps the trend result set bounded if it's ever called without one.
        SET @StartDate = ISNULL(@StartDate, DATEADD(DAY, -29, CAST(SYSUTCDATETIME() AS DATE)));
        SET @EndDate = ISNULL(@EndDate, SYSUTCDATETIME());

        ;WITH RequestLines AS (
            SELECT
                ar.[AccessRequestId], ar.[OrgId], ar.[RequestedBy], ar.[RequestedDate],
                arp.[ProductId], arp.[LineStatus],
                CASE
                    WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                    WHEN arp.[LineStatus] = 2 THEN N'approved'
                    WHEN arp.[LineStatus] = 3 THEN N'rejected'
                    ELSE N'pending'
                END AS [DerivedStatus]
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId] AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
        )
        -- Result set 1: Platform KPIs (one row).
        SELECT
            (SELECT COUNT(*) FROM [core].[Organization]) AS [TotalOrganizations],
            (SELECT COUNT(*) FROM [core].[Organization] WHERE [OrgStatus] = N'active') AS [ActiveOrganizations],
            (SELECT COUNT(*) FROM [core].[Organization] WHERE [OrgStatus] = N'inactive') AS [InactiveOrganizations],
            (SELECT COUNT(*) FROM [core].[Organization] WHERE [OrgStatus] = N'suspended') AS [SuspendedOrganizations],

            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0) AS [TotalAcutisUsers],
            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [IsLocked] = 0) AS [ActiveAcutisUsers],
            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0 AND [IsLocked] = 1) AS [LockedAcutisUsers],

            (SELECT COUNT(DISTINCT [CFRUserId]) FROM [auth].[UserProduct] WHERE ISNULL([IsDeleted], 0) = 0) AS [TotalOrganizationMembers],
            (SELECT COUNT(DISTINCT [CFRUserId]) FROM [auth].[UserProduct]
                WHERE ISNULL([IsDeleted], 0) = 0 AND ISNULL([IsLoginDisabled], 0) = 0 AND ISNULL([IsLockedOut], 0) = 0) AS [ActiveOrganizationMembers],

            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0) AS [TotalProducts],
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1) AS [ActiveCatalogProducts],

            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [AssignStatus] = N'active') AS [ActiveOrganizationProductAssignments],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] WHERE NOT ([IsDeleted] = 0 AND [AssignStatus] = N'active')) AS [InactiveOrganizationProductAssignments],
            (SELECT COUNT(DISTINCT [ProductId]) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [AssignStatus] = N'active') AS [TotalAssignedProducts],

            (SELECT COUNT(*) FROM [lic].[License]) AS [TotalLicenses],
            (SELECT COUNT(*) FROM [lic].[License]
                WHERE LOWER(ISNULL([LicenseStatus], N'active')) <> N'suspended'
                  AND ([ExpiryDate] IS NULL OR DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST([ExpiryDate] AS DATE)) > 30)) AS [ActiveLicenses],
            (SELECT COUNT(*) FROM [lic].[License]
                WHERE LOWER(ISNULL([LicenseStatus], N'active')) <> N'suspended'
                  AND [ExpiryDate] IS NOT NULL
                  AND DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST([ExpiryDate] AS DATE)) BETWEEN 0 AND 30) AS [ExpiringLicenses],
            (SELECT COUNT(*) FROM [lic].[License]
                WHERE LOWER(ISNULL([LicenseStatus], N'active')) <> N'suspended'
                  AND [ExpiryDate] IS NOT NULL
                  AND DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST([ExpiryDate] AS DATE)) < 0) AS [ExpiredLicenses],
            (SELECT COUNT(*) FROM [lic].[License] WHERE LOWER(ISNULL([LicenseStatus], N'active')) = N'suspended') AS [SuspendedLicenses],

            (SELECT COUNT(*) FROM RequestLines WHERE [DerivedStatus] = N'pending') AS [PendingAccessRequests],
            (SELECT COUNT(*) FROM RequestLines WHERE [DerivedStatus] = N'approved') AS [ApprovedAccessRequests],
            (SELECT COUNT(*) FROM RequestLines WHERE [DerivedStatus] = N'rejected') AS [RejectedAccessRequests],
            (SELECT COUNT(*) FROM RequestLines WHERE [DerivedStatus] = N'info-requested') AS [InfoRequestedAccessRequests],
            (SELECT COUNT(*) FROM RequestLines WHERE [DerivedStatus] = N'pending' AND DATEDIFF(DAY, [RequestedDate], SYSUTCDATETIME()) >= 7) AS [StaleAccessRequests];

        ;WITH RequestLines AS (
            SELECT
                ar.[AccessRequestId], ar.[OrgId], ar.[RequestedBy], ar.[RequestedDate],
                arp.[ProductId], arp.[LineStatus],
                CASE
                    WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                    WHEN arp.[LineStatus] = 2 THEN N'approved'
                    WHEN arp.[LineStatus] = 3 THEN N'rejected'
                    ELSE N'pending'
                END AS [DerivedStatus]
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId] AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
        )
        -- Result set 2: Entitlement integrity metrics (one row). Every count here is a
        -- should-never-happen condition once AccessRequest_CRUD ActionId 2 correctly provisions
        -- access on approval — non-zero values indicate real data drift, not normal operation.
        SELECT
            -- Approved requests that never got an active org-level assignment.
            (SELECT COUNT(*) FROM RequestLines RL WHERE RL.[DerivedStatus] = N'approved' AND NOT EXISTS (
                SELECT 1 FROM [lic].[OrganizationProduct] op
                WHERE op.[OrgId] = RL.[OrgId] AND op.[ProductId] = RL.[ProductId] AND op.[IsDeleted] = 0 AND op.[AssignStatus] = N'active'
            )) AS [ApprovedRequestsMissingOrganizationProduct],

            -- Approved requests that never got the member's own product mapping.
            (SELECT COUNT(*) FROM RequestLines RL WHERE RL.[DerivedStatus] = N'approved' AND NOT EXISTS (
                SELECT 1 FROM [auth].[UserProduct] up
                WHERE up.[CFRUserId] = RL.[RequestedBy] AND up.[OrgId] = RL.[OrgId] AND up.[ProductId] = RL.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
            )) AS [ApprovedRequestsMissingUserProduct],

            -- Org-level assignments that are active but no member is actually mapped to them.
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] op
                WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = N'active' AND NOT EXISTS (
                    SELECT 1 FROM [auth].[UserProduct] up WHERE up.[OrgId] = op.[OrgId] AND up.[ProductId] = op.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
                )) AS [ActiveOrganizationProductsWithoutMembers],

            -- Member mappings that are active but the organization's own assignment isn't.
            (SELECT COUNT(*) FROM [auth].[UserProduct] up
                WHERE ISNULL(up.[IsDeleted], 0) = 0 AND NOT EXISTS (
                    SELECT 1 FROM [lic].[OrganizationProduct] op WHERE op.[OrgId] = up.[OrgId] AND op.[ProductId] = up.[ProductId] AND op.[IsDeleted] = 0 AND op.[AssignStatus] = N'active'
                )) AS [ActiveUserProductsWithoutActiveOrganizationProduct],

            -- Extra rows beyond the first for the same (member, org, product) — should be exactly one.
            (SELECT ISNULL(SUM([Extra]), 0) FROM (
                SELECT COUNT(*) - 1 AS [Extra]
                FROM [auth].[UserProduct]
                WHERE ISNULL([IsDeleted], 0) = 0
                GROUP BY [CFRUserId], [OrgId], [ProductId]
                HAVING COUNT(*) > 1
            ) dup) AS [DuplicateActiveUserProductMappings],

            -- Rejected requests where the member still somehow has active access.
            (SELECT COUNT(*) FROM RequestLines RL WHERE RL.[DerivedStatus] = N'rejected' AND EXISTS (
                SELECT 1 FROM [auth].[UserProduct] up
                WHERE up.[CFRUserId] = RL.[RequestedBy] AND up.[OrgId] = RL.[OrgId] AND up.[ProductId] = RL.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
            )) AS [RejectedRequestsWithActiveEntitlements],

            -- Licenses past expiry whose org-level assignment was never revoked.
            (SELECT COUNT(*) FROM [lic].[License] l
                INNER JOIN [lic].[OrganizationProduct] op ON op.[OrganizationProductId] = l.[OrganizationProductId]
                WHERE LOWER(ISNULL(l.[LicenseStatus], N'active')) <> N'suspended'
                  AND l.[ExpiryDate] IS NOT NULL
                  AND DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST(l.[ExpiryDate] AS DATE)) < 0
                  AND op.[IsDeleted] = 0 AND op.[AssignStatus] = N'active') AS [ExpiredLicensesWithActiveOrganizationProduct],

            -- Organizations that are inactive/suspended but still carry an active app assignment.
            (SELECT COUNT(DISTINCT op.[OrgId]) FROM [lic].[OrganizationProduct] op
                INNER JOIN [core].[Organization] o ON o.[OrgId] = op.[OrgId]
                WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = N'active' AND o.[OrgStatus] IN (N'inactive', N'suspended')) AS [InactiveOrganizationsWithActiveProductAssignments];

        -- Result set 3: Raw trend events within the requested range — one row per event, for the
        -- frontend's existing bucketing utilities to group into daily/weekly/monthly series.
        SELECT N'OrgCreated' AS [EventType], o.[InsertedDate] AS [EventDate]
        FROM [core].[Organization] o
        WHERE o.[InsertedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT N'RequestSubmitted', ar.[RequestedDate]
        FROM [request].[AccessRequest] ar
        WHERE ar.[IsDeleted] = 0 AND ar.[RequestedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT N'RequestApproved', arp.[ReviewedDate]
        FROM [request].[AccessRequestProduct] arp
        WHERE arp.[IsDeleted] = 0 AND arp.[LineStatus] = 2 AND arp.[ReviewedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT N'RequestRejected', arp.[ReviewedDate]
        FROM [request].[AccessRequestProduct] arp
        WHERE arp.[IsDeleted] = 0 AND arp.[LineStatus] = 3 AND arp.[ReviewedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT N'LicenseCreated', l.[CreatedDate]
        FROM [lic].[License] l
        WHERE l.[CreatedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT N'OrgProductAssignmentCreated', op.[CreatedDate]
        FROM [lic].[OrganizationProduct] op
        WHERE op.[IsDeleted] = 0 AND op.[CreatedDate] BETWEEN @StartDate AND @EndDate;

        RETURN 0;
    END
END
GO
