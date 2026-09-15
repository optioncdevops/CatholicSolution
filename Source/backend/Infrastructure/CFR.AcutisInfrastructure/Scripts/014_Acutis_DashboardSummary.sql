-- Copyright (c) OptionC. All rights reserved.
-- Authoritative CFR Admin Dashboard summary — replaces prototype-style metrics computed in the
-- frontend from broad list endpoints with real, SQL-backed platform KPIs, entitlement-integrity
-- checks, and a raw event feed for the selected date range (bucketed client-side, but the events
-- themselves are queried within [@StartDate, @EndDate], not fetched unbounded and filtered later).
--
-- Authoritative tables per KPI:
--   Organizations                -> [core].[Organization] (rebuilt per 016_Acutis_Organization_
--                                   Rebuild.sql: key is now [ID], no org-level status column
--                                   anymore — status only exists per product assignment on
--                                   [lic].[OrganizationProduct].[OrgStatus] now)
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
    @EndDate DATETIME2 = NULL,
    @IssueKey NVARCHAR(100) = NULL
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
        -- Active/Inactive/Suspended Organizations: Organization itself carries no status anymore
        -- (moved to per-product OrganizationProduct.OrgStatus) — these now count DISTINCT
        -- organizations that have at least one non-deleted product assignment at that status.
        -- An org with assignments in more than one status bucket (or none at all) means these
        -- three numbers will not necessarily sum to TotalOrganizations. ASSUMPTION — confirm this
        -- derivation matches how "organization status" should be reported now.
        SELECT
            (SELECT COUNT(*) FROM [core].[Organization]) AS [TotalOrganizations],
            (SELECT COUNT(DISTINCT [CFROrgId]) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [OrgStatus] = 1) AS [ActiveOrganizations],
            (SELECT COUNT(DISTINCT [CFROrgId]) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [OrgStatus] = 2) AS [InactiveOrganizations],
            (SELECT COUNT(DISTINCT [CFROrgId]) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [OrgStatus] = 3) AS [SuspendedOrganizations],

            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0) AS [TotalAcutisUsers],
            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [IsLocked] = 0) AS [ActiveAcutisUsers],
            (SELECT COUNT(*) FROM [auth].[AcutisUser] WHERE [IsDeleted] = 0 AND [IsLocked] = 1) AS [LockedAcutisUsers],

            (SELECT COUNT(DISTINCT [CFRUserId]) FROM [auth].[UserProduct] WHERE ISNULL([IsDeleted], 0) = 0) AS [TotalOrganizationMembers],
            (SELECT COUNT(DISTINCT [CFRUserId]) FROM [auth].[UserProduct]
                WHERE ISNULL([IsDeleted], 0) = 0 AND ISNULL([IsLoginDisabled], 0) = 0 AND ISNULL([IsLockedOut], 0) = 0) AS [ActiveOrganizationMembers],

            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0) AS [TotalProducts],
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1) AS [ActiveCatalogProducts],
            -- ActiveCatalogProducts above is IsActive=1 regardless of ProductStatus — it counts a
            -- "coming soon" product as active too, since IsActive just means "not disabled". These
            -- two split that same IsActive=1 population by the real lifecycle status the Products
            -- pages already use (ProductStatus: 1=active, 2=coming soon), so the dashboard can show
            -- a genuinely-active count separately from an upcoming one instead of conflating them.
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [ProductStatus] = 1) AS [ActiveProducts],
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [ProductStatus] = 2) AS [UpcomingProducts],
            -- The remaining non-deleted products: IsActive = 0 (disabled from the catalog) — the
            -- same "Inactive" bucket the Products list page's own status filter counts, so this
            -- number always reconciles: ActiveProducts + UpcomingProducts + InactiveProducts = TotalProducts.
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 0) AS [InactiveProducts],

            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [AssignStatus] = 1) AS [ActiveOrganizationProductAssignments],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] WHERE NOT ([IsDeleted] = 0 AND [AssignStatus] = 1)) AS [InactiveOrganizationProductAssignments],
            (SELECT COUNT(DISTINCT [ProductId]) FROM [lic].[OrganizationProduct] WHERE [IsDeleted] = 0 AND [AssignStatus] = 1) AS [TotalAssignedProducts],

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
                WHERE op.[CFROrgId] = RL.[OrgId] AND op.[ProductId] = RL.[ProductId] AND op.[IsDeleted] = 0 AND op.[AssignStatus] = 1
            )) AS [ApprovedRequestsMissingOrganizationProduct],

            -- Approved requests that never got the member's own product mapping.
            (SELECT COUNT(*) FROM RequestLines RL WHERE RL.[DerivedStatus] = N'approved' AND NOT EXISTS (
                SELECT 1 FROM [auth].[UserProduct] up
                WHERE up.[CFRUserId] = RL.[RequestedBy] AND up.[OrgId] = RL.[OrgId] AND up.[ProductId] = RL.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
            )) AS [ApprovedRequestsMissingUserProduct],

            -- Org-level assignments that are active but no member is actually mapped to them.
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] op
                WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = 1 AND NOT EXISTS (
                    SELECT 1 FROM [auth].[UserProduct] up WHERE up.[OrgId] = op.[CFROrgId] AND up.[ProductId] = op.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
                )) AS [ActiveOrganizationProductsWithoutMembers],

            -- Member mappings that are active but the organization's own assignment isn't.
            (SELECT COUNT(*) FROM [auth].[UserProduct] up
                WHERE ISNULL(up.[IsDeleted], 0) = 0 AND NOT EXISTS (
                    SELECT 1 FROM [lic].[OrganizationProduct] op WHERE op.[CFROrgId] = up.[OrgId] AND op.[ProductId] = up.[ProductId] AND op.[IsDeleted] = 0 AND op.[AssignStatus] = 1
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
                  AND op.[IsDeleted] = 0 AND op.[AssignStatus] = 1) AS [ExpiredLicensesWithActiveOrganizationProduct],

            -- Organizations that are inactive/suspended but still carry an active app assignment.
            -- Organization has no status of its own anymore, so "inactive/suspended" here now
            -- means the SAME OrganizationProduct row disagrees with itself: its own [OrgStatus]
            -- (2=Inactive/3=Suspended) says the org side is down, but [AssignStatus] (1=Active)
            -- still says the assignment is live. ASSUMPTION — confirm this is the right
            -- replacement for what used to be a genuine org-vs-assignment cross-check.
            (SELECT COUNT(DISTINCT op.[CFROrgId]) FROM [lic].[OrganizationProduct] op
                WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = 1 AND op.[OrgStatus] IN (2, 3)) AS [InactiveOrganizationsWithActiveProductAssignments];

        -- Result set 3: Raw trend events within the requested range — one row per event, for the
        -- frontend's existing bucketing utilities to group into daily/weekly/monthly series, and
        -- for the Recent Activity feed to name the actual organization/product involved and link
        -- to it instead of a generic, unlinked sentence. OrgId/OrgName/ProductId/ProductName are
        -- NULL for event types that aren't tied to a single organization+product pair (a
        -- multi-line access request has no one product at the header level).
        SELECT
            N'OrgCreated' AS [EventType], o.[InsertedDate] AS [EventDate],
            o.[ID] AS [OrgId], o.[OrgName],
            CAST(NULL AS INT) AS [ProductId], CAST(NULL AS NVARCHAR(200)) AS [ProductName]
        FROM [core].[Organization] o
        WHERE o.[InsertedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT
            N'RequestSubmitted', ar.[RequestedDate],
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200)),
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200))
        FROM [request].[AccessRequest] ar
        WHERE ar.[IsDeleted] = 0 AND ar.[RequestedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT
            N'RequestApproved', arp.[ReviewedDate],
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200)),
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200))
        FROM [request].[AccessRequestProduct] arp
        WHERE arp.[IsDeleted] = 0 AND arp.[LineStatus] = 2 AND arp.[ReviewedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT
            N'RequestRejected', arp.[ReviewedDate],
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200)),
            CAST(NULL AS INT), CAST(NULL AS NVARCHAR(200))
        FROM [request].[AccessRequestProduct] arp
        WHERE arp.[IsDeleted] = 0 AND arp.[LineStatus] = 3 AND arp.[ReviewedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT
            N'LicenseCreated', l.[CreatedDate],
            op.[CFROrgId], lo.[OrgName],
            op.[ProductId], lp.[ProductName]
        FROM [lic].[License] l
        INNER JOIN [lic].[OrganizationProduct] op ON op.[OrganizationProductId] = l.[OrganizationProductId]
        LEFT JOIN [core].[Organization] lo ON lo.[ID] = op.[CFROrgId]
        LEFT JOIN [core].[Product] lp ON lp.[ProductId] = op.[ProductId]
        WHERE l.[CreatedDate] BETWEEN @StartDate AND @EndDate

        UNION ALL

        SELECT
            N'OrgProductAssignmentCreated', op.[CreatedDate],
            op.[CFROrgId], ao.[OrgName],
            op.[ProductId], ap.[ProductName]
        FROM [lic].[OrganizationProduct] op
        LEFT JOIN [core].[Organization] ao ON ao.[ID] = op.[CFROrgId]
        LEFT JOIN [core].[Product] ap ON ap.[ProductId] = op.[ProductId]
        WHERE op.[IsDeleted] = 0 AND op.[CreatedDate] BETWEEN @StartDate AND @EndDate;

        RETURN 0;
    END

    -- ActionId 2: Drill into one specific entitlement-integrity check (@IssueKey matches one of
    -- DashboardIntegrityApiItem's field names) and return the actual flagged rows behind that
    -- count — the Dashboard's Priority Alerts panel "Review" links open these instead of dumping
    -- the admin on the generic, unfiltered Organizations/Requests list, which for these
    -- multi-table-join conditions was correctly showing nothing filtered at all. Every branch here
    -- mirrors the exact WHERE clause used to compute the matching ActionId 1 integrity count, so
    -- the row count returned here always reconciles with that KPI number.
    IF @ActionId = 2
    BEGIN
        IF @IssueKey = N'activeOrganizationProductsWithoutMembers'
        BEGIN
            SELECT
                op.[CFROrgId] AS [OrgId], o.[OrgName], op.[ProductId], p.[ProductName],
                CAST(NULL AS BIGINT) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
                N'Active app assignment with no member mapped' AS [Detail]
            FROM [lic].[OrganizationProduct] op
            INNER JOIN [core].[Organization] o ON o.[ID] = op.[CFROrgId]
            INNER JOIN [core].[Product] p ON p.[ProductId] = op.[ProductId]
            WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = 1 AND NOT EXISTS (
                SELECT 1 FROM [auth].[UserProduct] up WHERE up.[OrgId] = op.[CFROrgId] AND up.[ProductId] = op.[ProductId] AND ISNULL(up.[IsDeleted], 0) = 0
            )
            ORDER BY o.[OrgName], p.[ProductName];
            RETURN 0;
        END

        IF @IssueKey = N'activeUserProductsWithoutActiveOrganizationProduct'
        BEGIN
            SELECT
                up.[OrgId], up.[OrgName], up.[ProductId], p.[ProductName],
                up.[CFRUserId] AS [MemberUserId], LTRIM(RTRIM(ISNULL(up.[FirstName], N'') + N' ' + ISNULL(up.[LastName], N''))) AS [MemberName],
                N'Member has an active product mapping, but the organization''s assignment for it isn''t active' AS [Detail]
            FROM [auth].[UserProduct] up
            INNER JOIN [core].[Product] p ON p.[ProductId] = up.[ProductId]
            WHERE ISNULL(up.[IsDeleted], 0) = 0 AND NOT EXISTS (
                SELECT 1 FROM [lic].[OrganizationProduct] op WHERE op.[CFROrgId] = up.[OrgId] AND op.[ProductId] = up.[ProductId] AND op.[IsDeleted] = 0 AND op.[AssignStatus] = 1
            )
            ORDER BY up.[OrgName], p.[ProductName];
            RETURN 0;
        END

        IF @IssueKey = N'duplicateActiveUserProductMappings'
        BEGIN
            SELECT
                up.[OrgId], MAX(up.[OrgName]) AS [OrgName], up.[ProductId], MAX(p.[ProductName]) AS [ProductName],
                up.[CFRUserId] AS [MemberUserId], LTRIM(RTRIM(ISNULL(MAX(up.[FirstName]), N'') + N' ' + ISNULL(MAX(up.[LastName]), N''))) AS [MemberName],
                CONCAT(N'This member has ', COUNT(*), N' active mappings for the same organization and product') AS [Detail]
            FROM [auth].[UserProduct] up
            INNER JOIN [core].[Product] p ON p.[ProductId] = up.[ProductId]
            WHERE ISNULL(up.[IsDeleted], 0) = 0
            GROUP BY up.[CFRUserId], up.[OrgId], up.[ProductId]
            HAVING COUNT(*) > 1
            ORDER BY MAX(up.[OrgName]);
            RETURN 0;
        END

        IF @IssueKey = N'expiredLicensesWithActiveOrganizationProduct'
        BEGIN
            SELECT
                op.[CFROrgId] AS [OrgId], o.[OrgName], op.[ProductId], p.[ProductName],
                CAST(NULL AS BIGINT) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
                CONCAT(N'License expired ', DATEDIFF(DAY, CAST(l.[ExpiryDate] AS DATE), CAST(SYSUTCDATETIME() AS DATE)), N' day(s) ago, but the app assignment is still active') AS [Detail]
            FROM [lic].[License] l
            INNER JOIN [lic].[OrganizationProduct] op ON op.[OrganizationProductId] = l.[OrganizationProductId]
            INNER JOIN [core].[Organization] o ON o.[ID] = op.[CFROrgId]
            INNER JOIN [core].[Product] p ON p.[ProductId] = op.[ProductId]
            WHERE LOWER(ISNULL(l.[LicenseStatus], N'active')) <> N'suspended'
              AND l.[ExpiryDate] IS NOT NULL
              AND DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST(l.[ExpiryDate] AS DATE)) < 0
              AND op.[IsDeleted] = 0 AND op.[AssignStatus] = 1
            ORDER BY l.[ExpiryDate];
            RETURN 0;
        END

        IF @IssueKey = N'expiredLicenses'
        BEGIN
            SELECT
                op.[CFROrgId] AS [OrgId], o.[OrgName], op.[ProductId], p.[ProductName],
                CAST(NULL AS BIGINT) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
                CONCAT(N'License expired ', DATEDIFF(DAY, CAST(l.[ExpiryDate] AS DATE), CAST(SYSUTCDATETIME() AS DATE)), N' day(s) ago') AS [Detail]
            FROM [lic].[License] l
            INNER JOIN [lic].[OrganizationProduct] op ON op.[OrganizationProductId] = l.[OrganizationProductId]
            INNER JOIN [core].[Organization] o ON o.[ID] = op.[CFROrgId]
            INNER JOIN [core].[Product] p ON p.[ProductId] = op.[ProductId]
            WHERE LOWER(ISNULL(l.[LicenseStatus], N'active')) <> N'suspended'
              AND l.[ExpiryDate] IS NOT NULL
              AND DATEDIFF(DAY, CAST(SYSUTCDATETIME() AS DATE), CAST(l.[ExpiryDate] AS DATE)) < 0
            ORDER BY l.[ExpiryDate];
            RETURN 0;
        END

        -- Unknown/unsupported key — empty result set rather than an error, so the frontend just
        -- shows "no rows" instead of a hard failure for a key this drill-down doesn't cover yet.
        SELECT
            CAST(NULL AS INT) AS [OrgId], CAST(NULL AS NVARCHAR(200)) AS [OrgName],
            CAST(NULL AS INT) AS [ProductId], CAST(NULL AS NVARCHAR(200)) AS [ProductName],
            CAST(NULL AS BIGINT) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
            CAST(NULL AS NVARCHAR(400)) AS [Detail]
        WHERE 1 = 0;
        RETURN 0;
    END
END
GO
