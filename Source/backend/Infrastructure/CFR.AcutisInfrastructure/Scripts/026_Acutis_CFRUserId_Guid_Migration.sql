-- Copyright (c) OptionC. All rights reserved.
-- Re-points every Acutis-owned stored procedure that reads/writes the CFR identity
-- ([auth].[User].[CFRUserId], migrated to UNIQUEIDENTIFIER by
-- 012_Sync_CFRUserId_Guid_Migration.sql in CFR.DataSyncInfrastructure) at the new GUID type.
--
-- [dbo].[Acutis_CFRUsers] and [dbo].[Acutis_Products] were read in full and matched via
-- sys.sql_modules - both only ever SELECT/JOIN the CFRUserId column directly (no local
-- DECLARE, no CAST(... AS INT/BIGINT) applied to it), so the column's own type change already
-- covers them with no proc body edit required. They are intentionally NOT redefined here.
--
-- [dbo].[Acutis_Dashboard] and [dbo].[Acutis_Organization] DO need body changes - see the
-- comments directly above each CREATE OR ALTER PROCEDURE below.
--
-- [request].[AccessRequestManage] is also redefined here (not in a Portal/DataSync script)
-- because [request].[AccessRequest]/[AccessRequestProduct]/[AccessRequestStatusHistory]/
-- [AccessRequestComment] are already owned by CFR.AcutisInfrastructure's Scripts folder (see
-- 008_AccessRequest.sql, 021/022_Acutis_ProductRequest_*.sql, 025_Acutis_AccessRequest_*.sql).
-- Two of its columns carry the CFR identity and are migrated here too - see section 2 below.
--
-- Idempotent: table/column guards check the current type before altering; CREATE OR ALTER
-- PROCEDURE is idempotent on its own.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ===========================================================================================
-- 1. [request].[AccessRequest].[RequestedBy] - single-purpose CFRUserId column (always the
-- member who submitted the request, resolved via [auth].[User].[Email] -> [CFRUserId], or the
-- literal 0 "no identity yet" sentinel for a public/anonymous submission - see
-- [request].[AccessRequestManage] ActionId 7). No FK constraint and no index references it.
-- SQL Server has no conversion path at all between BIGINT and UNIQUEIDENTIFIER (not even
-- explicit CAST), so ALTER COLUMN cannot change the type in place ("Operand type clash") - this
-- swaps the column out instead, same as every other CFRUserId-typed column in this migration.
--
-- Unlike the tables in 012_Sync_CFRUserId_Guid_Migration.sql, this one is public-facing (the
-- external Request Access page), so it cannot be assumed empty at migration time even though it
-- was 0 rows when this migration was planned - a real submission can land between planning and
-- running this script. The existing 0 sentinel maps 1:1 to the GUID-shaped equivalent
-- ('00000000-0000-0000-0000-000000000000'); any OTHER existing value would reference a
-- pre-migration integer CFRUserId that no longer maps to anything (the identity itself was
-- regenerated as a random GUID by 012_Sync_CFRUserId_Guid_Migration.sql) - that case raises a
-- descriptive error instead of silently discarding data, same pattern
-- 001_Sync_AuthUser_Extend.sql already uses for its own can't-proceed-automatically case.
-- ===========================================================================================

-- 1a. Recovery: an earlier attempt at this exact migration can leave the column dropped but not
-- yet re-added (ALTER...ADD ... NOT NULL fails outright on a non-empty table) - add it back
-- nullable so any row written in the meantime can be backfilled below.
IF COL_LENGTH(N'[request].[AccessRequest]', N'RequestedBy') IS NULL
    ALTER TABLE [request].[AccessRequest] ADD [RequestedBy] UNIQUEIDENTIFIER NULL;
GO

-- 1b. Still the old BIGINT type - swap it for a nullable GUID column, refusing to guess at any
-- value other than the 0 sentinel. Everything that references [RequestedBy] by name here runs as
-- dynamic SQL (EXEC), not directly in this batch: once RequestedBy is already UNIQUEIDENTIFIER
-- (a re-run after this section already succeeded), "[RequestedBy] <> 0" compares a GUID column
-- against an int/tinyint literal, which SQL Server rejects ("Operand type clash") at COMPILE
-- time for the WHOLE BATCH - even inside an IF branch that would never execute at runtime,
-- because ordinary batches (unlike a stored procedure body) are fully type-checked up front.
-- Dynamic SQL defers that compilation to execution time, when the outer metadata-only guard has
-- already confirmed the column really is still BIGINT, so the comparison is always type-valid
-- whenever it actually runs. The ADD and the UPDATE that references the new column are further
-- split into two separate EXEC() calls - SQL Server resolves a dynamic string as one compiled
-- unit, so a column added earlier IN THE SAME STRING is still "Invalid column name" to a later
-- statement in that same string; only a genuinely separate EXEC() sees the already-committed DDL.
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[request].[AccessRequest]') AND c.name = N'RequestedBy' AND ty.name <> N'uniqueidentifier')
BEGIN
    DECLARE @RequestedByBadRowCount INT;
    EXEC sp_executesql N'SELECT @Count = COUNT(*) FROM [request].[AccessRequest] WHERE [RequestedBy] <> 0', N'@Count INT OUTPUT', @Count = @RequestedByBadRowCount OUTPUT;

    IF @RequestedByBadRowCount > 0
    BEGIN
        RAISERROR(N'[request].[AccessRequest] has RequestedBy values other than the 0 sentinel - these reference a pre-migration CFRUserId that no longer maps to anything after the identity GUID migration. Resolve these rows manually before re-running this script.', 16, 1);
        RETURN;
    END

    EXEC(N'ALTER TABLE [request].[AccessRequest] ADD [RequestedBy_New] UNIQUEIDENTIFIER NULL;');
    EXEC(N'UPDATE [request].[AccessRequest] SET [RequestedBy_New] = CAST(N''00000000-0000-0000-0000-000000000000'' AS UNIQUEIDENTIFIER);');
    EXEC(N'ALTER TABLE [request].[AccessRequest] DROP COLUMN [RequestedBy];');
    EXEC sp_rename N'[request].[AccessRequest].[RequestedBy_New]', N'RequestedBy', N'COLUMN';
END
GO

-- 1c. Backfill any row left NULL by the 1a recovery path (a row written between a prior failed
-- run and this one).
UPDATE [request].[AccessRequest] SET [RequestedBy] = CAST(N'00000000-0000-0000-0000-000000000000' AS UNIQUEIDENTIFIER) WHERE [RequestedBy] IS NULL;
GO

-- 1d. Enforce NOT NULL now that every row has a value.
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[request].[AccessRequest]') AND name = N'RequestedBy' AND is_nullable = 1)
    ALTER TABLE [request].[AccessRequest] ALTER COLUMN [RequestedBy] UNIQUEIDENTIFIER NOT NULL;
GO

-- ===========================================================================================
-- 2. [request].[AccessRequestStatusHistory].[ChangedByMember] - same single-purpose CFRUserId
-- column (its sibling [ChangedByStaff] is a completely separate column holding
-- [auth].[AcutisUser].[UserId] and is NOT touched - staff ids are not part of this migration).
-- No FK constraint and no index references it. Stays NULLable (unlike RequestedBy, a NULL here
-- already means "not a member-driven status change" - e.g. a staff decision). Same
-- can't-be-assumed-empty reasoning and 0-sentinel backfill as section 1 above.
-- ===========================================================================================
-- Same dynamic-SQL reasoning as section 1b (including splitting the ADD from the UPDATE that
-- references the new column into separate EXEC() calls - see the comment there for why).
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[request].[AccessRequestStatusHistory]') AND c.name = N'ChangedByMember' AND ty.name <> N'uniqueidentifier')
BEGIN
    DECLARE @ChangedByMemberBadRowCount INT;
    EXEC sp_executesql N'SELECT @Count = COUNT(*) FROM [request].[AccessRequestStatusHistory] WHERE [ChangedByMember] IS NOT NULL AND [ChangedByMember] <> 0', N'@Count INT OUTPUT', @Count = @ChangedByMemberBadRowCount OUTPUT;

    IF @ChangedByMemberBadRowCount > 0
    BEGIN
        RAISERROR(N'[request].[AccessRequestStatusHistory] has ChangedByMember values other than NULL/the 0 sentinel - these reference a pre-migration CFRUserId that no longer maps to anything after the identity GUID migration. Resolve these rows manually before re-running this script.', 16, 1);
        RETURN;
    END

    EXEC(N'ALTER TABLE [request].[AccessRequestStatusHistory] ADD [ChangedByMember_New] UNIQUEIDENTIFIER NULL;');
    EXEC(N'UPDATE [request].[AccessRequestStatusHistory] SET [ChangedByMember_New] = CASE WHEN [ChangedByMember] = 0 THEN CAST(N''00000000-0000-0000-0000-000000000000'' AS UNIQUEIDENTIFIER) ELSE NULL END;');
    EXEC(N'ALTER TABLE [request].[AccessRequestStatusHistory] DROP COLUMN [ChangedByMember];');
    EXEC sp_rename N'[request].[AccessRequestStatusHistory].[ChangedByMember_New]', N'ChangedByMember', N'COLUMN';
END
GO

-- ===========================================================================================
-- NOTE ON [request].[AccessRequestComment].[AuthorId] (BIGINT, NOT NULL) - NOT migrated here.
-- This single column is genuinely dual-purpose: for AuthorScope = 'staff' it holds
-- [auth].[AcutisUser].[UserId] (stays BIGINT, out of scope); for AuthorScope = 'member' it
-- held the member's CFRUserId (now a GUID, and UNIQUEIDENTIFIER has no conversion to/from
-- BIGINT at all). A single physical column cannot hold both an AcutisUser BIGINT id and a
-- CFRUserId GUID without a real schema change (e.g. a separate nullable
-- AuthorCfrUserId UNIQUEIDENTIFIER column). That is a design decision, not a mechanical type
-- migration, so it was deliberately left alone rather than guessed at here.
--
-- Consequence, applied consistently in [request].[AccessRequestManage] below: member-authored
-- comments (AuthorScope = 'member') now store the existing "no identity yet" sentinel (0) in
-- [AuthorId] instead of the member's real CFRUserId, and the comment-author display for those
-- rows falls back to "System" (same fallback the procedure already used for an unresolved
-- author) instead of showing the member's name. Staff-authored comments are completely
-- unaffected. Follow up separately if per-member comment attribution needs to keep working.
-- ===========================================================================================

-- ===========================================================================================
-- 3. [dbo].[Acutis_Dashboard] ActionId 2 - the [MemberUserId] placeholder column returned for
-- issue keys that have no member row to report (activeOrganizationProductsWithoutMembers,
-- expiredLicensesWithActiveOrganizationProduct, expiredLicenses, and the unknown-key fallback)
-- was CAST(NULL AS BIGINT) so its type matched the other two branches, which project the real
-- up.[CFRUserId] AS [MemberUserId]. Now that CFRUserId is a GUID, the NULL placeholder has to
-- match with CAST(NULL AS UNIQUEIDENTIFIER) instead - everything else in this procedure is
-- unchanged (it never declares or casts a CFRUserId-typed variable itself).
-- ===========================================================================================
CREATE OR ALTER PROCEDURE [dbo].[Acutis_Dashboard]
    @ActionId INT,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @IssueKey NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        -- Defensive defaults only - the service always supplies a resolved range; this just
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
        -- (moved to per-product OrganizationProduct.OrgStatus) - these now count DISTINCT
        -- organizations that have at least one non-deleted product assignment at that status.
        -- An org with assignments in more than one status bucket (or none at all) means these
        -- three numbers will not necessarily sum to TotalOrganizations. ASSUMPTION - confirm this
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
                WHERE ISNULL([IsDeleted], 0) = 0 AND ISNULL([IsLoginDisabled], 0) = 0 AND ISNULL([IsActive], 1) = 1) AS [ActiveOrganizationMembers],

            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0) AS [TotalProducts],
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1) AS [ActiveCatalogProducts],
            -- ActiveCatalogProducts above is IsActive=1 regardless of ProductStatus - it counts a
            -- "coming soon" product as active too, since IsActive just means "not disabled". These
            -- two split that same IsActive=1 population by the real lifecycle status the Products
            -- pages already use (ProductStatus: 1=active, 2=coming soon), so the dashboard can show
            -- a genuinely-active count separately from an upcoming one instead of conflating them.
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [ProductStatus] = 1) AS [ActiveProducts],
            (SELECT COUNT(*) FROM [core].[Product] WHERE [IsDeleted] = 0 AND [IsActive] = 1 AND [ProductStatus] = 2) AS [UpcomingProducts],
            -- The remaining non-deleted products: IsActive = 0 (disabled from the catalog) - the
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
        -- should-never-happen condition once AccessRequestManage ActionId 2 correctly provisions
        -- access on approval - non-zero values indicate real data drift, not normal operation.
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

            -- Extra rows beyond the first for the same (member, org, product) - should be exactly one.
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
            -- still says the assignment is live. ASSUMPTION - confirm this is the right
            -- replacement for what used to be a genuine org-vs-assignment cross-check.
            (SELECT COUNT(DISTINCT op.[CFROrgId]) FROM [lic].[OrganizationProduct] op
                WHERE op.[IsDeleted] = 0 AND op.[AssignStatus] = 1 AND op.[OrgStatus] IN (2, 3)) AS [InactiveOrganizationsWithActiveProductAssignments];

        -- Result set 3: Raw trend events within the requested range - one row per event, for the
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
    -- count - the Dashboard's Priority Alerts panel "Review" links open these instead of dumping
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
                CAST(NULL AS UNIQUEIDENTIFIER) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
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
                CAST(NULL AS UNIQUEIDENTIFIER) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
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
                CAST(NULL AS UNIQUEIDENTIFIER) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
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

        -- Unknown/unsupported key - empty result set rather than an error, so the frontend just
        -- shows "no rows" instead of a hard failure for a key this drill-down doesn't cover yet.
        SELECT
            CAST(NULL AS INT) AS [OrgId], CAST(NULL AS NVARCHAR(200)) AS [OrgName],
            CAST(NULL AS INT) AS [ProductId], CAST(NULL AS NVARCHAR(200)) AS [ProductName],
            CAST(NULL AS UNIQUEIDENTIFIER) AS [MemberUserId], CAST(NULL AS NVARCHAR(200)) AS [MemberName],
            CAST(NULL AS NVARCHAR(400)) AS [Detail]
        WHERE 1 = 0;
        RETURN 0;
    END
END
GO

-- ===========================================================================================
-- 4. [dbo].[Acutis_Organization] - @AuthUserId becomes UNIQUEIDENTIFIER (used only in ActionId
-- 13/14 to identify a member, always a CFRUserId - member.CFRUserId comparisons, never mixed
-- with OrgId/ProductId/RoleId/DioceseId, which stay INT unchanged).
--
-- ActionId 13 (unlink) used to end with
-- "SET @ReturnValue = CAST(@AuthUserId AS INT); RETURN @ReturnValue;" - a T-SQL RETURN can only
-- return an INT, and @AuthUserId is now a GUID, so that CAST is both meaningless and would fail.
-- Every other read-only/action ActionId in this procedure already just does RETURN 0 for
-- success (the caller already has the id it passed in - it does not need it echoed back), so
-- ActionId 13 now does the same instead of trying to echo the (now non-integer) identity back
-- through the return code.
-- ===========================================================================================
CREATE OR ALTER PROCEDURE [dbo].[Acutis_Organization]
    @ActionId INT,
    @OrgId INT = 0,
    @OrgName NVARCHAR(255) = NULL,
    @OrgState NVARCHAR(100) = NULL,
    @OrgCountry NVARCHAR(100) = NULL,
    @ContactEmail NVARCHAR(255) = NULL,
    @Website NVARCHAR(500) = NULL,
    @ContactPerson NVARCHAR(255) = NULL,
    @ContactPhone NVARCHAR(50) = NULL,
    @DioceseId INT = NULL,
    @UpdatedBy INT = NULL,
    @ProductId INT = NULL,
    @AuthUserId UNIQUEIDENTIFIER = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);

    IF @ActionId = 1
    BEGIN
        SELECT
            o.[ID] AS [OrgId],
            o.[OrgName],
            o.[OrgState],
            o.[OrgCountry],
            o.[ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[DioceseId],
            o.[InsertedDate],
            o.[UpdatedDate],
            (SELECT COUNT(DISTINCT up.[CFRUserId]) FROM [auth].[UserProduct] AS up WHERE up.[OrgId] = o.[ID] AND ISNULL(up.[IsDeleted], 0) = 0) AS [UserCount],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] AS op WHERE op.[CFROrgId] = o.[ID] AND op.[IsDeleted] = 0) AS [ProductCount]
        FROM [core].[Organization] AS o
        WHERE o.[IsDeleted] = 0
        ORDER BY o.[OrgName];
        RETURN 0;
    END

    IF @ActionId = 2
    BEGIN
        SELECT
            o.[ID] AS [OrgId],
            o.[OrgName],
            o.[OrgState],
            o.[OrgCountry],
            o.[ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[DioceseId],
            o.[InsertedDate],
            o.[UpdatedDate],
            (SELECT COUNT(DISTINCT up.[CFRUserId]) FROM [auth].[UserProduct] AS up WHERE up.[OrgId] = o.[ID] AND ISNULL(up.[IsDeleted], 0) = 0) AS [UserCount],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] AS op WHERE op.[CFROrgId] = o.[ID] AND op.[IsDeleted] = 0) AS [ProductCount]
        FROM [core].[Organization] AS o
        WHERE o.[ID] = @OrgId
          AND o.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 3
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM [core].[Organization]
            WHERE [ID] = @OrgId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [core].[Organization]
        SET
            [OrgName] = @OrgName,
            [OrgState] = @OrgState,
            [OrgCountry] = @OrgCountry,
            [ContactEmail] = @ContactEmail,
            [Website] = @Website,
            [ContactPerson] = @ContactPerson,
            [ContactPhone] = @ContactPhone,
            [DioceseId] = @DioceseId,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [ID] = @OrgId
          AND [IsDeleted] = 0;

        SET @ReturnValue = @OrgId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 4
    BEGIN
        INSERT INTO [core].[Organization]
        (
            [OrgName], [OrgState], [OrgCountry], [ContactEmail], [Website], [ContactPerson], [ContactPhone], [DioceseId],
            [InsertedDate], [InsertedBy], [IsDeleted]
        )
        VALUES
        (
            @OrgName, @OrgState, @OrgCountry, @ContactEmail, @Website, @ContactPerson, @ContactPhone, @DioceseId,
            SYSUTCDATETIME(), @UpdatedBy, 0
        );

        SET @OrgId = CAST(SCOPE_IDENTITY() AS INT);
        SET @ReturnValue = @OrgId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 5
    BEGIN
        -- [auth].[UserProduct] is one row per (CFRUserId, ProductId) within an org, but
        -- FirstName/LastName/RoleId/IsLoginDisabled are per-member, not per-product -
        -- MAX(...) here just picks that member's (identical, repeated) value across their rows,
        -- it is not an aggregate over different values. RoleName is a best-effort LEFT JOIN
        -- against the only role table this codebase has (auth.AcutisRole, built for CFR Admin
        -- staff) - shown when the RoleId happens to match, NULL otherwise (never fabricated).
        -- MemberStatus is derived: a member with a login-disabled row is "inactive". (auth.UserProduct
        -- has no IsLocked column despite appearing in an earlier screenshot - confirmed via the
        -- live "Invalid column name 'IsLocked'" error; only IsLoginDisabled is real here.)
        -- AppCount only counts products the ORGANIZATION currently has active
        -- (lic.OrganizationProduct) AND that this specific member is individually assigned
        -- (auth.UserProduct) - same org-aware gate as the App Hub's "Your Apps"
        -- (request.AccessRequestManage ActionId 6).
        SELECT
            up.[CFRUserId] AS [AuthUserId],
            u.[Email],
            LTRIM(RTRIM(ISNULL(MAX(up.[FirstName]), N'') + N' ' + ISNULL(MAX(up.[LastName]), N''))) AS [FullName],
            MAX(r.[RoleName]) AS [RoleName],
            CASE WHEN MAX(CASE WHEN ISNULL(up.[IsLoginDisabled], 0) = 1 THEN 1 ELSE 0 END) = 1
                 THEN N'inactive' ELSE N'active' END AS [MemberStatus],
            MIN(up.[CreatedDate]) AS [LinkedDate],
            -- App access for a linked member is simply the organization's own active product
            -- assignments (the same set shown on the Products tab) - every member linked to the
            -- org has access to every product the org currently has active. This intentionally
            -- does NOT also require the member's own auth.UserProduct row to reference that same
            -- ProductId - that requirement made AppCount/AppNames disagree with the Products tab
            -- (e.g. "Products 3" but "No app access") whenever a member's individual UserProduct
            -- rows didn't happen to cover every product the org has assigned.
            (
                SELECT COUNT(DISTINCT op.[ProductId])
                FROM [lic].[OrganizationProduct] AS op
                WHERE op.[CFROrgId] = @OrgId
                  AND op.[IsDeleted] = 0
                  AND op.[AssignStatus] = 1 -- Active
            ) AS [AppCount],
            (
                SELECT STRING_AGG(p2.[ProductName], N', ') WITHIN GROUP (ORDER BY p2.[ProductName])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS p2
                    ON p2.[ProductId] = op.[ProductId]
                   AND p2.[IsDeleted] = 0
                WHERE op.[CFROrgId] = @OrgId
                  AND op.[IsDeleted] = 0
                  AND op.[AssignStatus] = 1 -- Active
            ) AS [AppNames]
        FROM [auth].[UserProduct] AS up
        LEFT JOIN [auth].[User] AS u ON u.[CFRUserId] = up.[CFRUserId]
        LEFT JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = up.[RoleId] AND r.[IsDeleted] = 0
        WHERE up.[OrgId] = @OrgId
          AND ISNULL(up.[IsDeleted], 0) = 0
        GROUP BY up.[CFRUserId], u.[Email]
        ORDER BY [FullName];
        RETURN 0;
    END

    IF @ActionId = 6
    BEGIN
        -- No [op].[IsDeleted] filter here (unlike ActionId 7) - a deactivated mapping must still
        -- show up in this list, as Inactive, so the admin can Activate it again from the same row.
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            op.[AssignStatus],
            op.[CreatedDate] AS [AssignedDate],
            -- '9999-12-31' is the open-ended "no defined end" sentinel set at assignment time (see
            -- ActionId 8) - surfaced as NULL ("No expiry") rather than that literal sentinel date.
            CASE WHEN op.[ActiveEndDate] >= '9999-01-01' THEN NULL ELSE op.[ActiveEndDate] END AS [ExpiryDate]
        FROM [lic].[OrganizationProduct] AS op
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        WHERE op.[CFROrgId] = @OrgId
          AND p.[IsDeleted] = 0
        ORDER BY p.[ProductName];
        RETURN 0;
    END

    IF @ActionId = 7
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName]
        FROM [core].[Product] AS p
        WHERE p.[IsDeleted] = 0
          AND NOT EXISTS (
              SELECT 1 FROM [lic].[OrganizationProduct] AS op
              WHERE op.[CFROrgId] = @OrgId
                AND op.[ProductId] = p.[ProductId]
          )
        ORDER BY p.[ProductName];
        RETURN 0;
    END

    IF @ActionId = 8
    BEGIN
        IF EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [CFROrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [CFROrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 1
        )
        BEGIN
            UPDATE [lic].[OrganizationProduct]
            SET [AssignStatus] = 1, -- Active
                [CreatedDate] = SYSUTCDATETIME(),
                [ActiveStartDate] = SYSUTCDATETIME(),
                [ActiveEndDate] = '9999-12-31',
                [IsDeleted] = 0
            WHERE [CFROrgId] = @OrgId AND [ProductId] = @ProductId;
        END
        ELSE
        BEGIN
            -- ActiveStartDate/ActiveEndDate are NOT NULL with no default; '9999-12-31' is the
            -- open-ended "no defined end" sentinel until real assignment terms are tracked.
            -- ProductOrgId has no external-product-system value available here yet - defaulted to
            -- @OrgId until the individual product integrations supply their own org id.
            -- OrgName/OrgState/OrgCountry/ContactEmail/ContactPerson/ContactPhone are snapshotted
            -- from [core].[Organization] at assignment time (OrganizationProduct carries its own
            -- per-product copy of these). OrgStatus is set to 1/Active alongside AssignStatus.
            -- Address/City/State/Zip have no source at this point - Organization no longer
            -- carries them - left NULL until set some other way.
            INSERT INTO [lic].[OrganizationProduct]
            (
                [CFROrgId], [ProductOrgId], [ProductId],
                [OrgName], [OrgState], [OrgCountry], [ContactEmail], [ContactPerson], [ContactPhone],
                [OrgStatus], [AssignStatus], [ActiveStartDate], [ActiveEndDate], [CreatedDate], [IsDeleted]
            )
            SELECT
                @OrgId, @OrgId, @ProductId,
                O.[OrgName], O.[OrgState], O.[OrgCountry], O.[ContactEmail], O.[ContactPerson], O.[ContactPhone],
                1, 1, SYSUTCDATETIME(), '9999-12-31', SYSUTCDATETIME(), 0
            FROM [core].[Organization] O
            WHERE O.[ID] = @OrgId;
        END

        SET @ReturnValue = CAST(@ProductId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 9
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [CFROrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        -- The check constraint only allows Active(1) / Suspended(2) / Revoked(3) on
        -- [AssignStatus] - Deactivate uses Revoked(3), not an "Inactive" code.
        UPDATE [lic].[OrganizationProduct]
        SET [AssignStatus] = 3, -- Revoked
            [IsDeleted] = 1
        WHERE [CFROrgId] = @OrgId AND [ProductId] = @ProductId;

        SET @ReturnValue = CAST(@ProductId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 10
    BEGIN
        SELECT
            l.[LicenseId],
            l.[OrganizationProductId],
            p.[ProductId],
            p.[ProductName],
            l.[LicenseType],
            l.[ActivationDate],
            l.[ExpiryDate],
            l.[LicenseStatus],
            l.[Remarks],
            l.[CreatedDate]
        FROM [lic].[License] AS l
        INNER JOIN [lic].[OrganizationProduct] AS op ON op.[OrganizationProductId] = l.[OrganizationProductId]
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        WHERE op.[CFROrgId] = @OrgId
          AND op.[IsDeleted] = 0
        ORDER BY l.[CreatedDate] DESC;
        RETURN 0;
    END

    IF @ActionId = 11
    BEGIN
        -- Same shape as ActionId 10 but across every organization (no @OrgId filter), plus
        -- OrgId/OrgName - the cross-org "Licenses" KPI on the admin dashboard has no other
        -- source, since every other license query in this codebase is scoped to one org/product.
        SELECT
            l.[LicenseId],
            l.[OrganizationProductId],
            op.[CFROrgId] AS [OrgId],
            o.[OrgName],
            p.[ProductId],
            p.[ProductName],
            l.[LicenseType],
            l.[ActivationDate],
            l.[ExpiryDate],
            l.[LicenseStatus],
            l.[Remarks],
            l.[CreatedDate]
        FROM [lic].[License] AS l
        INNER JOIN [lic].[OrganizationProduct] AS op ON op.[OrganizationProductId] = l.[OrganizationProductId]
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        INNER JOIN [core].[Organization] AS o ON o.[ID] = op.[CFROrgId]
        WHERE op.[IsDeleted] = 0
        ORDER BY l.[CreatedDate] DESC;
        RETURN 0;
    END

    IF @ActionId = 13
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM [auth].[UserProduct]
            WHERE [OrgId] = @OrgId AND [CFRUserId] = @AuthUserId AND ISNULL([IsDeleted], 0) = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        -- Unlinking removes ALL of this member's product assignment rows within this org - since
        -- auth.UserProduct is the real link table, that is what "no longer a member" means here.
        UPDATE [auth].[UserProduct]
        SET [IsDeleted] = 1
        WHERE [OrgId] = @OrgId AND [CFRUserId] = @AuthUserId;

        -- @AuthUserId is now a GUID and RETURN can only return an INT - every other read-only
        -- ActionId in this procedure already just does RETURN 0 for success (the caller already
        -- has the id it passed in), so this does the same instead of trying to echo it back.
        RETURN 0;
    END

    IF @ActionId = 14
    BEGIN
        -- Two result sets: (1) the membership header (sourced from [auth].[UserProduct], grouped
        -- the same way as ActionId 5), (2) the member's effective app access within THIS
        -- organization - every product the organization currently has active (lic.OrganizationProduct),
        -- same rule as ActionId 5's AppCount/AppNames (not additionally gated by the member's own
        -- auth.UserProduct row for that ProductId - see the comment on ActionId 5 for why).
        SELECT
            up.[CFRUserId] AS [AuthUserId],
            u.[Email],
            LTRIM(RTRIM(ISNULL(MAX(up.[FirstName]), N'') + N' ' + ISNULL(MAX(up.[LastName]), N''))) AS [FullName],
            up.[OrgId],
            MAX(up.[OrgName]) AS [OrgName],
            MAX(r.[RoleName]) AS [RoleName],
            CASE WHEN MAX(CASE WHEN ISNULL(up.[IsLoginDisabled], 0) = 1 THEN 1 ELSE 0 END) = 1
                 THEN N'inactive' ELSE N'active' END AS [MemberStatus],
            MIN(up.[CreatedDate]) AS [LinkedDate]
        FROM [auth].[UserProduct] AS up
        LEFT JOIN [auth].[User] AS u ON u.[CFRUserId] = up.[CFRUserId]
        LEFT JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = up.[RoleId] AND r.[IsDeleted] = 0
        WHERE up.[OrgId] = @OrgId
          AND up.[CFRUserId] = @AuthUserId
          AND ISNULL(up.[IsDeleted], 0) = 0
        GROUP BY up.[CFRUserId], up.[OrgId], u.[Email];

        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName]
        FROM [lic].[OrganizationProduct] AS op
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId] AND p.[IsDeleted] = 0
        WHERE op.[CFROrgId] = @OrgId
          AND op.[IsDeleted] = 0
          AND op.[AssignStatus] = 1 -- Active
        ORDER BY p.[ProductName];

        RETURN 0;
    END

    IF @ActionId = 15
    BEGIN
        SELECT
            [DioceseId],
            [DioceseName],
            [Address],
            [City],
            [State]
        FROM [core].[Diocese]
        WHERE [IsDeleted] = 0
        ORDER BY [DioceseName];
        RETURN 0;
    END
END
GO

-- ===========================================================================================
-- 5. [request].[AccessRequestManage] - every local variable that resolves/holds a member's
-- CFRUserId becomes UNIQUEIDENTIFIER: @RequestedBy (ActionId 1), @PublicRequestedBy (ActionId 7),
-- @HeaderRequestedBy (ActionId 2), @HubUserId (ActionId 6). Their matching table columns
-- ([request].[AccessRequest].[RequestedBy], [request].[AccessRequestStatusHistory].[ChangedByMember])
-- were migrated to UNIQUEIDENTIFIER above (section 1/2).
--
-- @ActorId / @PublicActorId stay BIGINT (they only ever feed the InsertedBy-style audit columns,
-- which are not part of this migration), but each used to fall back to a CFRUserId variable when
-- @InsertedBy was NULL (ISNULL(@InsertedBy, @RequestedBy) / ISNULL(ISNULL(@InsertedBy,
-- @PublicRequestedBy), 0)) - now a BIGINT/UNIQUEIDENTIFIER type clash with no conversion path.
-- Both now fall back straight to the 0 "no identity yet" sentinel this same procedure already
-- uses elsewhere, instead of trying to borrow a GUID into a BIGINT slot.
--
-- [request].[AccessRequestComment].[AuthorId] intentionally stays BIGINT (see the NOTE above
-- section 3) - it cannot represent a member's GUID identity without a real schema change. Every
-- INSERT that used to put a CFRUserId in AuthorId for a member-authored comment now stores the
-- existing 0 sentinel instead, and the ActionId 3 comment-author SELECT no longer attempts to
-- resolve a member's name/email from AuthorId (that lookup is impossible now - AuthorId doesn't
-- carry the identity anymore) - those rows fall back to "System" the same way an unresolved
-- author already did. Staff-authored comments (AuthorScope = 'staff', AuthorId = AcutisUser.UserId)
-- are completely unaffected.
-- ===========================================================================================
CREATE OR ALTER PROCEDURE [request].[AccessRequestManage]
    @ActionId INT,
    @AccessRequestId BIGINT = 0,
    @AccessRequestProductId BIGINT = NULL,
    @ProductId INT = NULL,
    @ProductName NVARCHAR(100) = NULL,
    @RequesterEmail NVARCHAR(256) = NULL,
    @Comment NVARCHAR(1000) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Note NVARCHAR(500) = NULL,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @OrganizationType NVARCHAR(100) = NULL,
    @OrganizationName NVARCHAR(200) = NULL,
    @Address NVARCHAR(300) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(50) = NULL,
    @Zip NVARCHAR(20) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @ProductsJson NVARCHAR(MAX) = NULL,
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT,
    @ResolvedAccessRequestProductId BIGINT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @ProductId = NULLIF(@ProductId, 0);
    SET @AccessRequestId = ISNULL(@AccessRequestId, 0);
    SET @AccessRequestProductId = NULLIF(@AccessRequestProductId, 0);
    SET @ProductName = NULLIF(LTRIM(RTRIM(@ProductName)), N'');
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');
    SET @Comment = NULLIF(LTRIM(RTRIM(@Comment)), N'');
    SET @Note = NULLIF(LTRIM(RTRIM(@Note)), N'');
    SET @FirstName = NULLIF(LTRIM(RTRIM(@FirstName)), N'');
    SET @LastName = NULLIF(LTRIM(RTRIM(@LastName)), N'');
    SET @OrganizationType = NULLIF(LTRIM(RTRIM(@OrganizationType)), N'');
    SET @OrganizationName = NULLIF(LTRIM(RTRIM(@OrganizationName)), N'');
    SET @Address = NULLIF(LTRIM(RTRIM(@Address)), N'');
    SET @City = NULLIF(LTRIM(RTRIM(@City)), N'');
    SET @State = NULLIF(LTRIM(RTRIM(@State)), N'');
    SET @Zip = NULLIF(LTRIM(RTRIM(@Zip)), N'');
    SET @Phone = NULLIF(LTRIM(RTRIM(@Phone)), N'');
    SET @ProductsJson = NULLIF(LTRIM(RTRIM(@ProductsJson)), N'');
    SET @Status = LOWER(REPLACE(LTRIM(RTRIM(ISNULL(@Status, N''))), N'_', N'-'));

    IF @ActionId = 1
    BEGIN
        DECLARE @RequestedBy UNIQUEIDENTIFIER;
        DECLARE @OrgId BIGINT;
        DECLARE @NewRequestId BIGINT;
        DECLARE @ActorId BIGINT;

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        IF @ProductId IS NULL OR NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -97;
            RETURN @ReturnValue;
        END

        SELECT @RequestedBy = u.[CFRUserId]
        FROM [auth].[User] u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);

        IF @RequestedBy IS NULL
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        SELECT TOP (1) @OrgId = up.[OrgId]
        FROM [auth].[UserProduct] up
        WHERE up.[CFRUserId] = @RequestedBy
          AND ISNULL(up.[IsDeleted], 0) = 0
          AND up.[OrgId] IS NOT NULL
        ORDER BY up.[CFRUserDetailId];

        IF @OrgId IS NULL
        BEGIN
            SET @ReturnValue = -96;
            RETURN @ReturnValue;
        END

        -- @RequestedBy is now a GUID and can no longer be a fallback for the BIGINT audit actor
        -- id - falls back to the 0 "no identity yet" sentinel instead (see header note).
        SET @ActorId = ISNULL(@InsertedBy, 0);

        IF EXISTS (
            SELECT 1
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId]
               AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
              AND ar.[RequestedBy] = @RequestedBy
              AND ar.[OrgId] = @OrgId
              AND arp.[ProductId] = @ProductId
              AND ar.[RequestStatus] IN (1, 2)
              AND arp.[LineStatus] IN (1, 4) -- requested or sent to vendor
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO [request].[AccessRequest]
            (
                [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
                [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @OrgId, @RequestedBy, N'member_portal', @Comment, 1,
                SYSUTCDATETIME(), SYSUTCDATETIME(), @ActorId, 0
            );

            SET @NewRequestId = SCOPE_IDENTITY();

            INSERT INTO [request].[AccessRequestProduct]
            (
                [AccessRequestId], [ProductId], [RequestType], [LineStatus],
                [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @NewRequestId, @ProductId, 1, 1,
                SYSUTCDATETIME(), @ActorId, 0
            );

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @NewRequestId, NULL, 1, N'Request submitted',
                @RequestedBy, NULL, SYSUTCDATETIME(), @ActorId
            );

            IF @Comment IS NOT NULL
            BEGIN
                -- [AccessRequestComment].[AuthorId] stays BIGINT and can no longer hold this
                -- member's GUID CFRUserId (see header note) - stores the 0 sentinel instead.
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @NewRequestId, N'member', 0, @Comment,
                    SYSUTCDATETIME(), @ActorId
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@NewRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    IF @ActionId = 7
    BEGIN
        DECLARE @PublicRequestedBy UNIQUEIDENTIFIER;
        DECLARE @PublicRequestId BIGINT;
        DECLARE @PublicActorId BIGINT;
        DECLARE @ContactPerson NVARCHAR(200);
        DECLARE @ResolvedProducts TABLE ([ProductId] INT NOT NULL PRIMARY KEY);

        IF @OrganizationName IS NULL OR @RequesterEmail IS NULL OR @FirstName IS NULL OR @LastName IS NULL
           OR @Address IS NULL OR @City IS NULL OR @State IS NULL OR @Zip IS NULL
        BEGIN
            SET @ReturnValue = -93;
            RETURN @ReturnValue;
        END

        IF @ProductsJson IS NOT NULL AND ISJSON(@ProductsJson) = 1
        BEGIN
            INSERT INTO @ResolvedProducts ([ProductId])
            SELECT DISTINCT resolved.[ProductId]
            FROM OPENJSON(@ProductsJson) AS j
            CROSS APPLY (
                SELECT
                    TRY_CAST(JSON_VALUE(j.[value], '$.productId') AS INT) AS [ParsedId],
                    NULLIF(LTRIM(RTRIM(JSON_VALUE(j.[value], '$.productName'))), N'') AS [Name]
            ) AS parsed
            CROSS APPLY (
                SELECT COALESCE(
                    (
                        SELECT p.[ProductId]
                        FROM [core].[Product] p
                        WHERE p.[IsDeleted] = 0
                          AND parsed.[ParsedId] IS NOT NULL
                          AND parsed.[ParsedId] > 0
                          AND p.[ProductId] = parsed.[ParsedId]
                    ),
                    (
                        SELECT p.[ProductId]
                        FROM [core].[Product] p
                        WHERE p.[IsDeleted] = 0
                          AND parsed.[Name] IS NOT NULL
                          AND p.[ProductName] = parsed.[Name]
                    )
                ) AS [ProductId]
            ) AS resolved
            WHERE resolved.[ProductId] IS NOT NULL;
        END

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            IF @ProductId IS NULL AND @ProductName IS NOT NULL
            BEGIN
                SELECT @ProductId = p.[ProductId]
                FROM [core].[Product] p
                WHERE p.[IsDeleted] = 0
                  AND p.[ProductName] = @ProductName;
            END

            IF @ProductId IS NOT NULL
            BEGIN
                INSERT INTO @ResolvedProducts ([ProductId])
                SELECT @ProductId
                WHERE EXISTS (
                    SELECT 1 FROM [core].[Product]
                    WHERE [ProductId] = @ProductId AND [IsDeleted] = 0
                );
            END
        END

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            SET @ReturnValue = -97;
            RETURN @ReturnValue;
        END

        -- No longer auto-creates an [auth].[User] row for a not-yet-known requester email -
        -- @PublicRequestedBy simply stays NULL in that case. request.AccessRequest doesn't need
        -- it (RequesterFirstName/RequesterLastName/ContactEmail already carry the requester's
        -- identity independently - see ActionId 3/4's RequesterName/RequesterEmail COALESCE).
        -- NOTE: without a CFRUserId, the SMS org-setup call at approval (SetupNewOrganizationAsync)
        -- will be missing CfrUserID for these requests and report it as a missing required field -
        -- a real [auth].[User]/CFRUserId has to exist through some other path (e.g. the member
        -- eventually logging in / registering for real) before that call can succeed.
        SELECT @PublicRequestedBy = u.[CFRUserId]
        FROM [auth].[User] u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);

        -- No [core].[Organization] lookup/creation here anymore - [OrgId] is inserted as 0 below
        -- until approval, when a real Organization row is created from the org fields staged on
        -- [request].[AccessRequest] itself (see ActionId 2).
        SET @ContactPerson = LTRIM(RTRIM(ISNULL(@FirstName, N'') + N' ' + ISNULL(@LastName, N'')));
        -- @PublicRequestedBy is NULL for a not-yet-known requester (no [auth].[User] row is
        -- created here anymore - that's a separate user-migration process). @PublicRequestedBy is
        -- now a GUID and can no longer be a fallback for the BIGINT audit actor id - falls back
        -- straight to the 0 "no identity yet" sentinel instead (see header note).
        SET @PublicActorId = ISNULL(@InsertedBy, 0);

        DELETE FROM rp
        FROM @ResolvedProducts rp
        WHERE EXISTS (
            SELECT 1
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId]
               AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
              AND arp.[ProductId] = rp.[ProductId]
              AND ar.[RequestStatus] IN (1, 2)
              AND arp.[LineStatus] IN (1, 4) -- requested or sent to vendor
              -- Only a duplicate for the SAME organization: the same person may request the same
              -- product for a different organization. Public requests carry no real OrgId yet
              -- ([OrgId] = 0 until approval), so the organization is matched by its staged name.
              AND LOWER(LTRIM(RTRIM(ISNULL(ar.[OrganizationName], N'')))) = LOWER(@OrganizationName)
              AND (
                    (@PublicRequestedBy IS NOT NULL AND ar.[RequestedBy] = @PublicRequestedBy)
                 OR LOWER(LTRIM(RTRIM(ISNULL(ar.[ContactEmail], N'')))) = LOWER(@RequesterEmail)
              )
        );

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        BEGIN TRY
            BEGIN TRANSACTION;

            -- The org itself (OrganizationName/Address/City/State/Zip) is staged directly on this
            -- row instead of creating a [core].[Organization] row here - that only happens at
            -- approval (ActionId 2), once the request is actually accepted. [OrgId] is 0 (no real
            -- org yet) until then. [RequestedBy] is UNIQUEIDENTIFIER NOT NULL - falls back to the
            -- GUID-shaped equivalent of the old int 0 sentinel when the requester has no
            -- [auth].[User] row yet.
            INSERT INTO [request].[AccessRequest]
            (
                [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
                [RequesterFirstName], [RequesterLastName], [ContactEmail], [ContactPhone], [OrganizationType],
                [OrganizationName], [Address], [City], [State], [Zip],
                [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                0, ISNULL(@PublicRequestedBy, CAST(N'00000000-0000-0000-0000-000000000000' AS UNIQUEIDENTIFIER)), N'external_page', @Comment, 1,
                @FirstName, @LastName, @RequesterEmail, @Phone, @OrganizationType,
                @OrganizationName, @Address, @City, @State, @Zip,
                SYSUTCDATETIME(), SYSUTCDATETIME(), @PublicActorId, 0
            );

            SET @PublicRequestId = SCOPE_IDENTITY();

            INSERT INTO [request].[AccessRequestProduct]
            (
                [AccessRequestId], [ProductId], [RequestType], [LineStatus],
                [InsertedDate], [InsertedBy], [IsDeleted]
            )
            SELECT
                @PublicRequestId, rp.[ProductId], 1, 1,
                SYSUTCDATETIME(), @PublicActorId, 0
            FROM @ResolvedProducts rp;

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @PublicRequestId, NULL, 1, N'Request submitted',
                @PublicRequestedBy, NULL, SYSUTCDATETIME(), @PublicActorId
            );

            IF @Comment IS NOT NULL
            BEGIN
                -- [AccessRequestComment].[AuthorId] stays BIGINT and can no longer hold this
                -- member's GUID CFRUserId (see header note) - stores the 0 sentinel instead,
                -- regardless of whether @PublicRequestedBy was resolved.
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @PublicRequestId, N'member', 0, @Comment,
                    SYSUTCDATETIME(), @PublicActorId
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@PublicRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    IF @ActionId = 2
    BEGIN
        DECLARE @LineId BIGINT;
        DECLARE @LineStatus INT;
        DECLARE @LineProductId INT;
        DECLARE @HeaderStatus INT;
        DECLARE @HeaderOrgId BIGINT;
        DECLARE @HeaderRequestedBy UNIQUEIDENTIFIER;
        DECLARE @NextLineStatus INT;
        DECLARE @NextHeaderStatus INT;
        DECLARE @HistoryStatus INT;
        DECLARE @HistoryLineId BIGINT;
        DECLARE @AccessDays INT;
        DECLARE @ExistingUserProductId BIGINT;
        DECLARE @ExistingUserProductIsDeleted BIT;
        DECLARE @MemberUserId BIGINT;
        DECLARE @MemberOrgName NVARCHAR(200);
        DECLARE @MemberFirstName NVARCHAR(100);
        DECLARE @MemberLastName NVARCHAR(100);
        DECLARE @MemberRoleId INT;
        DECLARE @MemberIsLoginDisabled BIT;
        DECLARE @MemberIsLockedOut BIT;
        DECLARE @ExistingOrgProductId BIGINT;
        DECLARE @ExistingOrgProductIsDeleted BIT;

        IF @AccessRequestId <= 0 OR @Status NOT IN (N'sent-to-vendor', N'approved', N'rejected', N'info-requested', N'in-review')
        BEGIN
            SET @ReturnValue = -93;
            RETURN @ReturnValue;
        END

        SELECT
            @HeaderStatus = ar.[RequestStatus],
            @HeaderOrgId = ar.[OrgId],
            @HeaderRequestedBy = ar.[RequestedBy]
        FROM [request].[AccessRequest] ar
        WHERE ar.[AccessRequestId] = @AccessRequestId
          AND ar.[IsDeleted] = 0;

        IF @HeaderStatus IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        -- Acts on ONE specific product line: the caller's @AccessRequestProductId when given
        -- (validated to belong to this request), else the first still-pending (LineStatus = 1)
        -- line - a request can have several product lines (see ActionId 7's multi-product public
        -- submit), so "just the lowest AccessRequestProductId regardless of its status" used to
        -- silently act on the wrong product once its first line was already decided.
        IF @AccessRequestProductId IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @LineId = arp.[AccessRequestProductId],
                @LineStatus = arp.[LineStatus],
                @LineProductId = arp.[ProductId]
            FROM [request].[AccessRequestProduct] arp
            WHERE arp.[AccessRequestId] = @AccessRequestId
              AND arp.[AccessRequestProductId] = @AccessRequestProductId
              AND arp.[IsDeleted] = 0;
        END
        ELSE
        BEGIN
            SELECT TOP (1)
                @LineId = arp.[AccessRequestProductId],
                @LineStatus = arp.[LineStatus],
                @LineProductId = arp.[ProductId]
            FROM [request].[AccessRequestProduct] arp
            WHERE arp.[AccessRequestId] = @AccessRequestId
              AND arp.[IsDeleted] = 0
              AND arp.[LineStatus] = 1
            ORDER BY arp.[AccessRequestProductId];
        END

        IF @LineId IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        SET @ResolvedAccessRequestProductId = @LineId;

        -- Allowed transitions (LineStatus 1 = requested, 4 = sent-to-vendor, 2 = approved, 3 = rejected):
        --   requested      -> sent-to-vendor / rejected / info-requested (line stays requested)
        --   sent-to-vendor -> approved / rejected
        IF NOT (
               (@Status IN (N'sent-to-vendor', N'info-requested', N'in-review') AND @LineStatus = 1)
            OR (@Status = N'approved' AND @LineStatus = 4)
            OR (@Status = N'rejected' AND @LineStatus IN (1, 4))
        )
        BEGIN
            SET @ReturnValue = -94;
            RETURN @ReturnValue;
        END

        SET @NextLineStatus = @LineStatus;
        SET @NextHeaderStatus = @HeaderStatus;
        SET @HistoryLineId = NULL;
        SET @HistoryStatus = @HeaderStatus;

        IF @Status IN (N'info-requested', N'in-review')
        BEGIN
            SET @NextHeaderStatus = 2;
            SET @HistoryStatus = 2;
            SET @HistoryLineId = NULL;
        END
        ELSE IF @Status = N'sent-to-vendor'
        BEGIN
            SET @NextLineStatus = 4;
            SET @HistoryStatus = 4;
            SET @HistoryLineId = @LineId;
        END
        ELSE IF @Status = N'approved'
        BEGIN
            SET @NextLineStatus = 2;
            SET @HistoryStatus = 2;
            SET @HistoryLineId = @LineId;
        END
        ELSE IF @Status = N'rejected'
        BEGIN
            SET @NextLineStatus = 3;
            SET @HistoryStatus = 3;
            SET @HistoryLineId = @LineId;
        END

        -- [core].[Product] has no [DefaultAccessDays] column in this database - @AccessDays stays
        -- NULL here and the ISNULL(@AccessDays, 365) below still applies the same 365-day default.
        BEGIN TRY
            BEGIN TRANSACTION;

            UPDATE [request].[AccessRequestProduct]
            SET
                [LineStatus] = @NextLineStatus,
                [ReviewedBy] = CASE WHEN @Status IN (N'approved', N'rejected') THEN @UpdatedBy ELSE [ReviewedBy] END,
                [ReviewedDate] = CASE WHEN @Status IN (N'approved', N'rejected') THEN SYSUTCDATETIME() ELSE [ReviewedDate] END,
                [DecisionRemarks] = CASE WHEN @Status IN (N'approved', N'rejected') THEN @Note ELSE [DecisionRemarks] END,
                [ApprovedStartDate] = CASE
                    WHEN @Status = N'approved' THEN CAST(SYSUTCDATETIME() AS DATE)
                    ELSE [ApprovedStartDate]
                END,
                [ApprovedExpiryDate] = CASE
                    WHEN @Status = N'approved' THEN DATEADD(DAY, ISNULL(@AccessDays, 365), CAST(SYSUTCDATETIME() AS DATE))
                    ELSE [ApprovedExpiryDate]
                END,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [AccessRequestProductId] = @LineId
              AND [IsDeleted] = 0;

            IF NOT EXISTS (
                SELECT 1
                FROM [request].[AccessRequestProduct]
                WHERE [AccessRequestId] = @AccessRequestId
                  AND [IsDeleted] = 0
                  AND [LineStatus] IN (1, 4) -- requested or still with the vendor
            )
                SET @NextHeaderStatus = 3;

            UPDATE [request].[AccessRequest]
            SET
                [RequestStatus] = @NextHeaderStatus,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [AccessRequestId] = @AccessRequestId
              AND [IsDeleted] = 0;

            -- Approving a request must actually GRANT access, not just flip a status flag - both
            -- gates that [request].[AccessRequestManage] ActionId 6 (App Hub) and Portal_CFRLaunch
            -- check have to be satisfied: an active [lic].[OrganizationProduct] row for the
            -- org+product, and an [auth].[UserProduct] row for the member+org+product.
            -- Neither [core].[Organization] nor [lic].[OrganizationProduct] is created here anymore.
            -- The approve click's real provisioning now happens in C#
            -- (AccessRequestService.SetupNewOrganizationAsync calls SMS FIRST, before any CFR-side
            -- Organization row exists; AccessRequestRepository.PersistOrgSetupResultAsync then
            -- creates [core].[Organization] and [lic].[OrganizationProduct] from SMS's returned
            -- OrgId, but only once SMS confirms success). [auth].[User] is likewise never created
            -- here - that's a separate, external migration process. The [auth].[UserProduct]
            -- reactivation in step 2/3 below only covers a member who already has other product
            -- access in this org (so @HeaderOrgId is already real from a prior approval) - it has
            -- nothing to do with SMS and is unaffected by any of the above.
            IF @Status = N'approved'
            BEGIN
                -- Resolve the member's identity fields from their existing membership row for
                --    this org, if any. [UserId]/[RoleId] on [auth].[UserProduct] are product-side
                --    values supplied by the individual product system (see the CFR.DataSync upsert in
                --    006_Sync_StoredProcedures.sql) - CFR has no value of its own to invent for a
                --    member who has never been assigned a product here before, so @MemberUserId
                --    stays NULL for a brand-new member+org (e.g. a public Request Access submission
                --    for a brand-new organization) and is checked for below.
                SELECT TOP (1)
                    @MemberUserId = [UserId], @MemberOrgName = [OrgName],
                    @MemberFirstName = [FirstName], @MemberLastName = [LastName], @MemberRoleId = [RoleId],
                    @MemberIsLoginDisabled = ISNULL([IsLoginDisabled], 0)
                FROM [auth].[UserProduct]
                WHERE [CFRUserId] = @HeaderRequestedBy AND [OrgId] = @HeaderOrgId AND ISNULL([IsDeleted], 0) = 0
                ORDER BY [CFRUserDetailId];

                -- Prevent a duplicate mapping: reactivate the member's soft-deleted row for
                --    this exact org+product if one exists, otherwise insert a new one - but only
                --    when the previous step actually found an existing membership row to clone identity from.
                --    Without @MemberUserId (product-side UserId is NOT NULL on this table), there is
                --    nothing valid to insert here yet; the row is created later by the normal
                --    CFR.DataSync upsert once the product system (e.g. OptionC via the SMS org-setup
                --    call) provisions the member and reports their product-side identity back.
                SELECT TOP (1) @ExistingUserProductId = [CFRUserDetailId], @ExistingUserProductIsDeleted = ISNULL([IsDeleted], 0)
                FROM [auth].[UserProduct]
                WHERE [CFRUserId] = @HeaderRequestedBy AND [OrgId] = @HeaderOrgId AND [ProductId] = @LineProductId
                ORDER BY [CFRUserDetailId];

                IF @ExistingUserProductId IS NOT NULL AND @ExistingUserProductIsDeleted = 1
                BEGIN
                    UPDATE [auth].[UserProduct]
                    SET [IsDeleted] = 0
                    WHERE [CFRUserDetailId] = @ExistingUserProductId;
                END
                ELSE IF @ExistingUserProductId IS NULL AND @MemberUserId IS NOT NULL
                BEGIN
                    INSERT INTO [auth].[UserProduct]
                    (
                        [CFRUserId], [UserId], [ProductId], [OrgId], [OrgName], [RoleId], [FirstName], [LastName],
                        [IsDeleted], [IsLoginDisabled]
                    )
                    VALUES
                    (
                        @HeaderRequestedBy, @MemberUserId, @LineProductId, @HeaderOrgId, @MemberOrgName, @MemberRoleId, @MemberFirstName, @MemberLastName,
                        0, @MemberIsLoginDisabled
                    );
                END
                -- else: already assigned, or no existing membership to clone from yet - nothing to do.
            END

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @AccessRequestId, @HistoryLineId, @HistoryStatus, @Note,
                NULL, @UpdatedBy, SYSUTCDATETIME(), @UpdatedBy
            );

            IF @Note IS NOT NULL
            BEGIN
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @AccessRequestId, N'staff', ISNULL(@UpdatedBy, 0), @Note,
                    SYSUTCDATETIME(), @UpdatedBy
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@AccessRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            CAST(ar.[AccessRequestId] AS INT) AS [AccessRequestId],
            CAST(arp.[AccessRequestProductId] AS INT) AS [AccessRequestProductId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[OrganizationName])), N''), o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            -- Address/City/State/Zip are staged directly on this row at submission (ActionId 7) -
            -- core.Organization only gets created at approval (ActionId 2), so ar.* is read first,
            -- falling back to the Organization row (State only - it never carried Address/City/Zip)
            -- for already-approved requests.
            ar.[Address] AS [Address],
            ar.[City] AS [City],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[State])), N''), o.[OrgState]) AS [State],
            ar.[Zip] AS [Zip],
            ar.[ContactPhone] AS [Phone],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(ar.[RequesterFirstName], N'') + N' ' + ISNULL(ar.[RequesterLastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(ar.[ContactEmail], N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterEmail],
            CAST(p.[ProductId] AS NVARCHAR(20)) AS [ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            CASE
                WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                WHEN arp.[LineStatus] = 2 THEN N'approved'
                WHEN arp.[LineStatus] = 3 THEN N'rejected'
                WHEN arp.[LineStatus] = 4 THEN N'sent-to-vendor'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[ID] = ar.[OrgId]
        LEFT JOIN [auth].[User] u
            ON u.[CFRUserId] = ar.[RequestedBy]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = ar.[RequestedBy]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) upn
        LEFT JOIN [core].[Product] p
            ON p.[ProductId] = arp.[ProductId]
        WHERE ar.[AccessRequestId] = @AccessRequestId
          AND ar.[IsDeleted] = 0
          AND (@AccessRequestProductId IS NULL OR arp.[AccessRequestProductId] = @AccessRequestProductId)
        ORDER BY arp.[AccessRequestProductId];

        SELECT
            CASE
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 1 THEN N'submitted'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 2 THEN N'info-requested'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 3 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 4 THEN N'rejected'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 2 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 3 THEN N'rejected'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 4 THEN N'sent-to-vendor'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), h.[InsertedDate], 127) AS [At],
            h.[Remarks] AS [Note],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(staff.[FirstName], N'') + N' ' + ISNULL(staff.[LastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(memberProfile.[FirstName], N'') + N' ' + ISNULL(memberProfile.[LastName], N''))), N''),
                member.[Email],
                N'System'
            ) AS [Actor]
        FROM [request].[AccessRequestStatusHistory] h
        LEFT JOIN [auth].[AcutisUser] staff
            ON staff.[UserId] = h.[ChangedByStaff]
        LEFT JOIN [auth].[User] member
            ON member.[CFRUserId] = h.[ChangedByMember]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = h.[ChangedByMember]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) memberProfile
        WHERE h.[AccessRequestId] = @AccessRequestId
        ORDER BY h.[InsertedDate], h.[StatusHistoryId];

        -- [AuthorId] no longer carries the member's identity for AuthorScope = 'member' rows
        -- (see header note) - the member/memberProfile name lookup that used to join on it was
        -- removed rather than compared against a type it can no longer match; those rows fall
        -- back to "System", same as any other unresolved author.
        SELECT
            CAST(c.[CommentId] AS INT) AS [CommentId],
            c.[CommentText] AS [Comment],
            COALESCE(
                NULLIF(LTRIM(RTRIM(
                    CASE
                        WHEN c.[AuthorScope] = N'staff' THEN ISNULL(staff.[FirstName], N'') + N' ' + ISNULL(staff.[LastName], N'')
                        ELSE N''
                    END
                )), N''),
                N'System'
            ) AS [Actor],
            CONVERT(VARCHAR(33), c.[InsertedDate], 127) AS [At]
        FROM [request].[AccessRequestComment] c
        LEFT JOIN [auth].[AcutisUser] staff
            ON c.[AuthorScope] = N'staff'
           AND staff.[UserId] = c.[AuthorId]
        WHERE c.[AccessRequestId] = @AccessRequestId
        ORDER BY c.[InsertedDate], c.[CommentId];

        RETURN @ReturnValue;
    END

    IF @ActionId = 4
    BEGIN
        SELECT
            CAST(ar.[AccessRequestId] AS INT) AS [AccessRequestId],
            CAST(arp.[AccessRequestProductId] AS INT) AS [AccessRequestProductId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[OrganizationName])), N''), o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            -- Address/City/State/Zip are staged directly on this row at submission (ActionId 7) -
            -- core.Organization only gets created at approval (ActionId 2), so ar.* is read first,
            -- falling back to the Organization row (State only - it never carried Address/City/Zip)
            -- for already-approved requests.
            ar.[Address] AS [Address],
            ar.[City] AS [City],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[State])), N''), o.[OrgState]) AS [State],
            ar.[Zip] AS [Zip],
            ar.[ContactPhone] AS [Phone],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(ar.[RequesterFirstName], N'') + N' ' + ISNULL(ar.[RequesterLastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(ar.[ContactEmail], N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterEmail],
            CAST(p.[ProductId] AS NVARCHAR(20)) AS [ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            CASE
                WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                WHEN arp.[LineStatus] = 2 THEN N'approved'
                WHEN arp.[LineStatus] = 3 THEN N'rejected'
                WHEN arp.[LineStatus] = 4 THEN N'sent-to-vendor'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[ID] = ar.[OrgId]
        LEFT JOIN [auth].[User] u
            ON u.[CFRUserId] = ar.[RequestedBy]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = ar.[RequestedBy]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) upn
        LEFT JOIN [core].[Product] p
            ON p.[ProductId] = arp.[ProductId]
        WHERE ar.[IsDeleted] = 0
        ORDER BY ar.[RequestedDate] DESC, ar.[AccessRequestId] DESC;

        RETURN @ReturnValue;
    END

    IF @ActionId = 5
    BEGIN
        DECLARE @Recipients TABLE ([EMail] NVARCHAR(256) NOT NULL);
        DECLARE @ProductContactPerson NVARCHAR(200);
        DECLARE @ProductContactUserId BIGINT;
        DECLARE @ProductSupportUser VARCHAR(100);

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        SELECT
            @ProductContactPerson = p.[ContactPerson],
            @ProductContactUserId = p.[ContactUserId],
            @ProductSupportUser = NULLIF(LTRIM(RTRIM(p.[ProductSupportUser])), '')
        FROM [core].[Product] p
        WHERE p.[ProductId] = @ProductId;

        -- 1st choice: the product's support user(s) - [core].[Product].[ProductSupportUser] holds
        -- [auth].[AcutisUser].[UserId] value(s) (one id, or several comma/semicolon separated).
        IF @ProductSupportUser IS NOT NULL
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM STRING_SPLIT(REPLACE(@ProductSupportUser, ';', ','), ',') s
            INNER JOIN [auth].[AcutisUser] u
                ON u.[UserId] = TRY_CAST(LTRIM(RTRIM(s.[value])) AS BIGINT)
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;
        END

        -- 2nd choice (no usable support user): the product's contact person, then Platform Admins below.
        IF NOT EXISTS (SELECT 1 FROM @Recipients)
           AND (@ProductContactUserId IS NOT NULL OR (@ProductContactPerson IS NOT NULL AND LTRIM(RTRIM(@ProductContactPerson)) <> N''))
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM [auth].[AcutisUser] u
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
              AND (
                  (@ProductContactUserId IS NOT NULL AND u.[UserId] = @ProductContactUserId)
                  OR (@ProductContactUserId IS NULL AND (
                      u.[UserId] = TRY_CAST(@ProductContactPerson AS INT)
                      OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(@ProductContactPerson))
                  ))
              );
        END

        IF NOT EXISTS (SELECT 1 FROM @Recipients)
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM [auth].[AcutisUser] u
            INNER JOIN [auth].[AcutisRole] r
                ON r.[RoleId] = u.[RoleId]
               AND r.[IsDeleted] = 0
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND r.[RoleName] = N'Platform Admin'
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;
        END

        SELECT [EMail] FROM @Recipients;
        RETURN 0;
    END

    -- App Hub: products assigned to the member (Your Apps) plus every other core.Product
    -- as Available (ProductStatus = 1) or Future.
    IF @ActionId = 6
    BEGIN
        DECLARE @HubUserId UNIQUEIDENTIFIER = NULL;

        IF @RequesterEmail IS NOT NULL
        BEGIN
            SELECT @HubUserId = u.[CFRUserId]
            FROM [auth].[User] u
            WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);
        END

        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            p.[LogoName] AS [LogoUrl],
            p.[IsActive],
            p.[ProductStatus],
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN N'your'
                WHEN p.[ProductStatus] = 1 THEN N'available'
                ELSE N'future'
            END AS [HubSection],
            (
                SELECT STRING_AGG(CAST(pf.[FeatureName] AS NVARCHAR(MAX)), ',')
                FROM [core].[ProductFeature] pf
                WHERE pf.[ProductId] = p.[ProductId]
                  AND pf.[IsDeleted] = 0
                  AND pf.[IsActive] = 1
            ) AS [Features],
            (
                SELECT TOP 1 u.[UserId]
                FROM [auth].[AcutisUser] u
                WHERE u.[IsDeleted] = 0
                  AND u.[IsActive] = 1
                  AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
                  AND (
                      (p.[ContactUserId] IS NOT NULL AND u.[UserId] = p.[ContactUserId])
                      OR (p.[ContactUserId] IS NULL AND (
                          u.[UserId] = TRY_CAST(p.[ContactPerson] AS INT)
                          OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(p.[ContactPerson]))
                      ))
                  )
            ) AS [ContactUserId],
            (
                SELECT TOP 1 LTRIM(RTRIM(u.[Email]))
                FROM [auth].[AcutisUser] u
                WHERE u.[IsDeleted] = 0
                  AND u.[IsActive] = 1
                  AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
                  AND (
                      (p.[ContactUserId] IS NOT NULL AND u.[UserId] = p.[ContactUserId])
                      OR (p.[ContactUserId] IS NULL AND (
                          u.[UserId] = TRY_CAST(p.[ContactPerson] AS INT)
                          OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(p.[ContactPerson]))
                      ))
                  )
            ) AS [ContactEmail]
        FROM [core].[Product] p
        LEFT JOIN (
            SELECT DISTINCT up.[ProductId]
            FROM [auth].[UserProduct] up
            INNER JOIN [lic].[OrganizationProduct] op
                ON op.[CFROrgId] = up.[OrgId]
               AND op.[ProductId] = up.[ProductId]
               AND op.[IsDeleted] = 0
               AND op.[AssignStatus] = 1 -- Active
            WHERE @HubUserId IS NOT NULL
              AND up.[CFRUserId] = @HubUserId
              AND ISNULL(up.[IsDeleted], 0) = 0
              AND up.[OrgId] IS NOT NULL
        ) assigned
            ON assigned.[ProductId] = p.[ProductId]
        WHERE p.[IsDeleted] = 0
        ORDER BY
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN 0
                WHEN p.[ProductStatus] = 1 THEN 1
                ELSE 2
            END,
            p.[ProductName];

        RETURN 0;
    END
END
GO
