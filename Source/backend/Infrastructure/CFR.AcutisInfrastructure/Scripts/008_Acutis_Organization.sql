-- Copyright (c) OptionC. All rights reserved.
-- Organization list/get/create/update CRUD against [core].[Organization], rebuilt per
-- 016_Acutis_Organization_Rebuild.sql: the table's key is now [ID] (INT IDENTITY, was [OrgId]
-- BIGINT manually assigned via MAX+1) and no longer carries OrgStatus / OrgType / Address / City /
-- State / Zip (moved to [lic].[OrganizationProduct], duplicated per product; OrgType was dropped
-- entirely). [OrgState]/[OrgCountry] are new org-level fields. [lic].[OrganizationProduct]'s link
-- column is now [CFROrgId] (was [OrgId]), and its [OrgStatus]/[AssignStatus] are now INT, not
-- NVARCHAR:
--   OrganizationProduct.OrgStatus     : 1 = Active,  2 = Inactive, 3 = Suspended
--   OrganizationProduct.AssignStatus  : 1 = Active,  2 = Suspended, 3 = Revoked
-- ASSUMPTION — confirm these codes match the actual lookup/enum before relying on this in
-- production; nothing in the schema itself pins these numbers down.
--
-- The @OrgId parameter and the [OrgId] output alias are kept (mapped onto the new [ID] column)
-- so the existing C# DTOs/repository/frontend contract does not also have to change name-for-name
-- just to pick up this table rebuild.
--
-- Real user/product data is still sourced from [auth].[UserProduct] / [auth].[User] (Organization
-- Users tab, ActionId 5/13/14) and [lic].[OrganizationProduct] / [core].[Product] (Products/
-- Licenses tabs) — see 016_Acutis_Organization_Rebuild.sql's header for what is NOT yet migrated
-- on those two tables (their OrgId columns still hold pre-rebuild values).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_Organization_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Organization_CRUD];
GO

-- ActionId 1: Get list of organizations, with real user/product counts.
-- ActionId 2: Get one organization by OrgId (-> Organization.ID).
-- ActionId 3: Update an organization's identity and contact fields.
-- ActionId 4: Create a new organization (ID is now IDENTITY — no more MAX+1 assignment).
-- ActionId 5: Get the real users linked to an organization, sourced from [auth].[UserProduct]
-- (grouped by CFRUserId — the table carries FirstName/LastName/RoleId/IsLoginDisabled
-- directly, one row per product assignment, so this collapses those rows into one per member)
-- rather than the near-empty [auth].[OrganizationUser] table. Includes per-member effective app
-- count within this organization.
-- ActionId 6: Get every product ever mapped to an organization (active AND inactive), so the
-- Products/Apps tab can show Inactive mappings with an Activate action instead of hiding them.
-- ActionId 7: Get products with no mapping row at all for this organization (assign dropdown
-- source) — a previously-deactivated product is intentionally excluded here; reactivating it
-- goes through ActionId 8 (Activate) from the unified list, not through this "assign new" list.
-- ActionId 8: Assign (or reactivate/"Activate") a product for an organization.
-- ActionId 9: Deactivate (soft-delete) a product assignment from an organization. The mapping
-- row is kept (IsDeleted = 1, AssignStatus = 3/Revoked — the check constraint only allows
-- Active/Suspended/Revoked, not Inactive) so history/expiry data is preserved and ActionId 8 can
-- reactivate it later — this is never a hard delete.
-- ActionId 10: Get the real licenses issued against an organization's assigned products.
-- ActionId 11: Get every license issued across ALL organizations (same shape as ActionId 10,
-- plus OrgId/OrgName) — backs the admin dashboard's platform-wide "Licenses" KPI.
-- ActionId 13: Unlink (soft-delete) a user from an organization — soft-deletes every
-- [auth].[UserProduct] row for that CFRUserId within this OrgId, since that table is now the
-- real link. Linking a user is not supported here — membership is only ever created outside
-- this procedure.
-- ActionId 14: Get one member's organization-membership detail (from [auth].[UserProduct]) plus
-- their effective app access within this organization, for the Organization Users tab's
-- user-detail view.
CREATE PROCEDURE [dbo].[Acutis_Organization_CRUD]
    @ActionId INT,
    @OrgId INT = 0,
    @OrgName NVARCHAR(255) = NULL,
    @OrgState NVARCHAR(100) = NULL,
    @OrgCountry NVARCHAR(100) = NULL,
    @ContactEmail NVARCHAR(255) = NULL,
    @Website NVARCHAR(500) = NULL,
    @ContactPerson NVARCHAR(255) = NULL,
    @ContactPhone NVARCHAR(50) = NULL,
    @UpdatedBy INT = NULL,
    @ProductId INT = NULL,
    @AuthUserId BIGINT = NULL,
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
            [OrgName], [OrgState], [OrgCountry], [ContactEmail], [Website], [ContactPerson], [ContactPhone],
            [InsertedDate], [InsertedBy], [IsDeleted]
        )
        VALUES
        (
            @OrgName, @OrgState, @OrgCountry, @ContactEmail, @Website, @ContactPerson, @ContactPhone,
            SYSUTCDATETIME(), @UpdatedBy, 0
        );

        SET @OrgId = CAST(SCOPE_IDENTITY() AS INT);
        SET @ReturnValue = @OrgId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 5
    BEGIN
        -- [auth].[UserProduct] is one row per (CFRUserId, ProductId) within an org, but
        -- FirstName/LastName/RoleId/IsLoginDisabled are per-member, not per-product —
        -- MAX(...) here just picks that member's (identical, repeated) value across their rows,
        -- it is not an aggregate over different values. RoleName is a best-effort LEFT JOIN
        -- against the only role table this codebase has (auth.AcutisRole, built for CFR Admin
        -- staff) — shown when the RoleId happens to match, NULL otherwise (never fabricated).
        -- MemberStatus is derived: a member with a login-disabled row is "inactive". (auth.UserProduct
        -- has no IsLocked column despite appearing in an earlier screenshot — confirmed via the
        -- live "Invalid column name 'IsLocked'" error; only IsLoginDisabled is real here.)
        -- AppCount only counts products the ORGANIZATION currently has active
        -- (lic.OrganizationProduct) AND that this specific member is individually assigned
        -- (auth.UserProduct) — same org-aware gate as the App Hub's "Your Apps"
        -- (request.AccessRequest_CRUD ActionId 6).
        SELECT
            up.[CFRUserId] AS [AuthUserId],
            u.[Email],
            LTRIM(RTRIM(ISNULL(MAX(up.[FirstName]), N'') + N' ' + ISNULL(MAX(up.[LastName]), N''))) AS [FullName],
            MAX(r.[RoleName]) AS [RoleName],
            CASE WHEN MAX(CASE WHEN ISNULL(up.[IsLoginDisabled], 0) = 1 THEN 1 ELSE 0 END) = 1
                 THEN N'inactive' ELSE N'active' END AS [MemberStatus],
            MIN(up.[CreatedDate]) AS [LinkedDate],
            -- App access for a linked member is simply the organization's own active product
            -- assignments (the same set shown on the Products tab) — every member linked to the
            -- org has access to every product the org currently has active. This intentionally
            -- does NOT also require the member's own auth.UserProduct row to reference that same
            -- ProductId — that requirement made AppCount/AppNames disagree with the Products tab
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
        -- No [op].[IsDeleted] filter here (unlike ActionId 7) — a deactivated mapping must still
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
            -- ActionId 8) — surfaced as NULL ("No expiry") rather than that literal sentinel date.
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
            -- ProductOrgId has no external-product-system value available here yet — defaulted to
            -- @OrgId until the individual product integrations supply their own org id.
            -- OrgName/OrgState/OrgCountry/ContactEmail/ContactPerson/ContactPhone are snapshotted
            -- from [core].[Organization] at assignment time (OrganizationProduct carries its own
            -- per-product copy of these). OrgStatus is set to 1/Active alongside AssignStatus.
            -- Address/City/State/Zip have no source at this point — Organization no longer
            -- carries them — left NULL until set some other way.
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
        -- [AssignStatus] — Deactivate uses Revoked(3), not an "Inactive" code.
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
        -- OrgId/OrgName — the cross-org "Licenses" KPI on the admin dashboard has no other
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

        -- Unlinking removes ALL of this member's product assignment rows within this org — since
        -- auth.UserProduct is the real link table, that is what "no longer a member" means here.
        UPDATE [auth].[UserProduct]
        SET [IsDeleted] = 1
        WHERE [OrgId] = @OrgId AND [CFRUserId] = @AuthUserId;

        SET @ReturnValue = CAST(@AuthUserId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 14
    BEGIN
        -- Two result sets: (1) the membership header (sourced from [auth].[UserProduct], grouped
        -- the same way as ActionId 5), (2) the member's effective app access within THIS
        -- organization — every product the organization currently has active (lic.OrganizationProduct),
        -- same rule as ActionId 5's AppCount/AppNames (not additionally gated by the member's own
        -- auth.UserProduct row for that ProductId — see the comment on ActionId 5 for why).
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
END
GO
