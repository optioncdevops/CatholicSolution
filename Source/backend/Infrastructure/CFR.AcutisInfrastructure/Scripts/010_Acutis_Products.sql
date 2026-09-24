-- Copyright (c) OptionC. All rights reserved.
-- CRUD for [core].[Product] and [lic].[License] / [lic].[OrganizationProduct].
-- ActionId 1: Product GET All (CustomerCount = distinct CFROrgId, same filters as ActionId 5)
-- ActionId 2: Product GET by ID (CustomerCount = distinct CFROrgId, same filters as ActionId 5)
-- ActionId 3: Product PUT (Update)
-- ActionId 4: Product Check Name
-- ActionId 5: License GET All
-- ActionId 6: License GET by ID
-- ActionId 7: License POST (Create)
-- ActionId 8: License PUT (Update)
-- ActionId 9: Product customers from [lic].[OrganizationProduct] + [core].[Organization]
-- (user counts and contact-email fallback from [auth].[UserProduct] / [auth].[User];
-- latest license from [lic].[License]). CTEs are limited to orgs assigned to @ProductId.
-- ActionId 10: Per-product organization assignment counts (active vs. inactive/revoked vs. total
-- distinct organizations), for the admin dashboard's real App Access Overview — this is genuine
-- lic.OrganizationProduct assignment data, not inferred from the static product catalog.
-- ActionId 11: License DELETE (soft delete via [lic].[License].[IsDeleted])
--
-- Rebuilt per 016_Acutis_Organization_Rebuild.sql: [core].[Organization]'s key is now [ID] (was
-- [OrgId]), and [lic].[OrganizationProduct]'s link column is now [CFROrgId] (was [OrgId]).
-- [OrganizationProduct].[AssignStatus] is now INT, not NVARCHAR:
--   1 = Active, 2 = Suspended, 3 = Revoked   -- ASSUMPTION, confirm against the real enum/lookup.
-- Organization no longer has its own [OrgStatus] (moved to OrganizationProduct, per product
-- assignment) — ActionId 9's per-org "status" below now comes from the license/assignment data
-- instead of a removed org-level column.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

GO

IF OBJECT_ID(N'[dbo].[Acutis_Products]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Products];
GO

CREATE PROCEDURE [dbo].[Acutis_Products]
    @ActionId INT,
    -- Product Parameters
    @ProductId INT = 0,
    @ProductName NVARCHAR(200) = NULL,
    @ShortName NVARCHAR(100) = NULL,
    @SubCategoryName NVARCHAR(200) = NULL,
    @ProdDescription NVARCHAR(MAX) = NULL,
    @ExternalPageUrl NVARCHAR(500) = NULL,
    @LogoName NVARCHAR(500) = NULL,
    @ContactUserId BIGINT = NULL,
    @ProductSupportUser BIGINT = NULL,
    @Features NVARCHAR(MAX) = NULL,
    @IsActive BIT = 1,
    @ProductStatus INT = NULL,
    @NavigationTarget NVARCHAR(50) = NULL,
    -- License Parameters
    @LicenseId BIGINT = 0,
    @OrganizationProductId BIGINT = 0,
    @OrgId INT = 0,
    @LicenseType NVARCHAR(50) = NULL,
    @ActivationDate DATETIME2 = NULL,
    @ExpiryDate DATETIME2 = NULL,
    @LicenseStatus NVARCHAR(50) = NULL,
    @AssignStatus NVARCHAR(50) = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
    -- Audit & Output Parameters
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @RequesterEmail NVARCHAR(256) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @ProductName = NULLIF(LTRIM(RTRIM(@ProductName)), N'');
    SET @ShortName = NULLIF(LTRIM(RTRIM(@ShortName)), N'');
    SET @SubCategoryName = NULLIF(LTRIM(RTRIM(@SubCategoryName)), N'');
    SET @ProdDescription = NULLIF(LTRIM(RTRIM(@ProdDescription)), N'');
    SET @ExternalPageUrl = NULLIF(LTRIM(RTRIM(@ExternalPageUrl)), N'');
    SET @LogoName = NULLIF(LTRIM(RTRIM(@LogoName)), N'');
    SET @LicenseType = NULLIF(LTRIM(RTRIM(@LicenseType)), N'');
    SET @NavigationTarget = NULLIF(LTRIM(RTRIM(@NavigationTarget)), N'');
    SET @LicenseStatus = NULLIF(LTRIM(RTRIM(@LicenseStatus)), N'');
    SET @Remarks = NULLIF(LTRIM(RTRIM(@Remarks)), N'');
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');

    DECLARE @AssignStatusInt INT = NULL;
    IF @AssignStatus IS NOT NULL
    BEGIN
        SET @AssignStatus = LOWER(LTRIM(RTRIM(@AssignStatus)));
        SET @AssignStatusInt = CASE
            WHEN @AssignStatus IN (N'1', N'active') THEN 1
            WHEN @AssignStatus IN (N'2', N'inactive', N'suspended') THEN 2
            WHEN @AssignStatus IN (N'3', N'revoked', N'cancelled', N'canceled') THEN 3
            WHEN ISNUMERIC(@AssignStatus) = 1 THEN CAST(@AssignStatus AS INT)
            ELSE 1
        END;
    END;

    ---------------------------------------------------------------------------
    -- ActionId 1: Product GET All
    ---------------------------------------------------------------------------
    IF @ActionId = 1
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[ShortName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            p.[LogoName],
            p.[IsActive],
            p.[ProductStatus],
            p.[NavigationTarget],
            p.[ContactUserId],
            NULLIF(LTRIM(RTRIM(ISNULL(cu.[FirstName], N'') + N' ' + ISNULL(cu.[LastName], N''))), N'') AS [ContactPerson],
            p.[ProductSupportUser],
            NULLIF(LTRIM(RTRIM(ISNULL(psu.[FirstName], N'') + N' ' + ISNULL(psu.[LastName], N''))), N'') AS [ProductSupportUserName],
            (
                SELECT COUNT(DISTINCT op.[CFROrgId])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS prod ON prod.[ProductId] = op.[ProductId]
                INNER JOIN [core].[Organization] AS o ON o.[ID] = op.[CFROrgId]
                WHERE op.[ProductId] = p.[ProductId]
                  AND op.[IsDeleted] = 0
                  AND prod.[IsDeleted] = 0
            ) AS [CustomerCount],
            p.[CreatedDate],
            p.[InsertedBy],
            p.[UpdatedDate],
            p.[UpdatedBy],
            NULLIF(LTRIM(RTRIM(ISNULL(ub.[FirstName], N'') + N' ' + ISNULL(ub.[LastName], N''))), N'') AS [UpdatedByName],
            p.[IsDeleted],
            ac.[ClientId],
            ac.[ClientSecret]
        FROM [core].[Product] AS p
        LEFT JOIN [auth].[AcutisUser] AS cu
            ON cu.[UserId] = p.[ContactUserId]
           AND cu.[IsDeleted] = 0
        LEFT JOIN [auth].[AcutisUser] AS psu
            ON psu.[UserId] = p.[ProductSupportUser]
           AND psu.[IsDeleted] = 0
        LEFT JOIN [auth].[AcutisUser] AS ub
            ON ub.[UserId] = p.[UpdatedBy]
        OUTER APPLY (
            SELECT TOP (1) x.[ClientId], x.[ClientSecret]
            FROM [sec].[ApiClient] AS x
            WHERE x.[ProductId] = p.[ProductId] AND x.[IsActive] = 1
            ORDER BY x.[ApiClientId] DESC
        ) AS ac
        WHERE p.[IsDeleted] = 0
        ORDER BY p.[ProductName];

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 2: Product GET by ID
    ---------------------------------------------------------------------------
    IF @ActionId = 2
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[ShortName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            p.[LogoName],
            p.[IsActive],
            p.[ProductStatus],
            p.[NavigationTarget],
            p.[ContactUserId],
            NULLIF(LTRIM(RTRIM(ISNULL(cu.[FirstName], N'') + N' ' + ISNULL(cu.[LastName], N''))), N'') AS [ContactPerson],
            p.[ProductSupportUser],
            NULLIF(LTRIM(RTRIM(ISNULL(psu.[FirstName], N'') + N' ' + ISNULL(psu.[LastName], N''))), N'') AS [ProductSupportUserName],
            (
                SELECT COUNT(DISTINCT op.[CFROrgId])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS prod ON prod.[ProductId] = op.[ProductId]
                INNER JOIN [core].[Organization] AS o ON o.[ID] = op.[CFROrgId]
                WHERE op.[ProductId] = p.[ProductId]
                  AND op.[IsDeleted] = 0
                  AND prod.[IsDeleted] = 0
            ) AS [CustomerCount],
            p.[CreatedDate],
            p.[InsertedBy],
            p.[UpdatedDate],
            NULLIF(LTRIM(RTRIM(ISNULL(ub.[FirstName], N'') + N' ' + ISNULL(ub.[LastName], N''))), N'') AS [UpdatedByName],
            p.[IsDeleted],
            ac.[ClientId],
            ac.[ClientSecret]
        FROM [core].[Product] AS p
        LEFT JOIN [auth].[AcutisUser] AS cu
            ON cu.[UserId] = p.[ContactUserId]
           AND cu.[IsDeleted] = 0
        LEFT JOIN [auth].[AcutisUser] AS psu
            ON psu.[UserId] = p.[ProductSupportUser]
           AND psu.[IsDeleted] = 0
        LEFT JOIN [auth].[AcutisUser] AS ub
            ON ub.[UserId] = p.[UpdatedBy]
        OUTER APPLY (
            SELECT TOP (1) x.[ClientId], x.[ClientSecret]
            FROM [sec].[ApiClient] AS x
            WHERE x.[ProductId] = p.[ProductId] AND x.[IsActive] = 1
            ORDER BY x.[ApiClientId] DESC
        ) AS ac
        WHERE p.[ProductId] = @ProductId
          AND p.[IsDeleted] = 0;

        SELECT
            f.[FeatureName]
        FROM [core].[ProductFeature] AS f
        WHERE f.[ProductId] = @ProductId
          AND f.[IsDeleted] = 0
          AND f.[IsActive] = 1
        ORDER BY f.[ProductFeatureId];

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 3: Product PUT (Update)
    ---------------------------------------------------------------------------
    IF @ActionId = 3
    BEGIN
        IF @ProductId <= 0 OR NOT EXISTS (
            SELECT 1 FROM [core].[Product]
            WHERE [ProductId] = @ProductId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        IF @ContactUserId IS NOT NULL AND @ContactUserId > 0 AND NOT EXISTS (
            SELECT 1 FROM [auth].[AcutisUser]
            WHERE [UserId] = @ContactUserId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        IF @ProductName IS NOT NULL AND EXISTS (
            SELECT 1 FROM [core].[Product]
            WHERE LOWER(LTRIM(RTRIM([ProductName]))) = LOWER(@ProductName)
              AND [ProductId] <> @ProductId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [core].[Product]
        SET
            [ProductName] = ISNULL(@ProductName, [ProductName]),
            [ShortName] = ISNULL(@ShortName, [ShortName]),
            [SubCategoryName] = ISNULL(@SubCategoryName, [SubCategoryName]),
            [ProdDescription] = ISNULL(@ProdDescription, [ProdDescription]),
            [ExternalPageUrl] = ISNULL(@ExternalPageUrl, [ExternalPageUrl]),
            [LogoName] = ISNULL(@LogoName, [LogoName]),
            [ContactUserId] = CASE
                WHEN @ContactUserId IS NULL THEN [ContactUserId]
                WHEN @ContactUserId = 0 THEN NULL
                ELSE @ContactUserId
            END,
            [ContactPerson] = CASE
                WHEN @ContactUserId IS NULL THEN [ContactPerson]
                WHEN @ContactUserId = 0 THEN NULL
                ELSE
                (
                    SELECT NULLIF(LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))), N'')
                    FROM [auth].[AcutisUser] AS u
                    WHERE u.[UserId] = @ContactUserId
                      AND u.[IsDeleted] = 0
                )
            END,
            [ProductSupportUser] = CASE
                WHEN @ProductSupportUser IS NULL THEN [ProductSupportUser]
                WHEN @ProductSupportUser = 0 THEN NULL
                ELSE @ProductSupportUser
            END,
            [IsActive] = ISNULL(@IsActive, [IsActive]),
            [ProductStatus] = CASE
                WHEN @IsActive = 0 THEN NULL
                WHEN @ProductStatus = 2 THEN 2
                WHEN @ProductStatus = 1 THEN 1
                ELSE [ProductStatus]
            END,
            [NavigationTarget] = ISNULL(@NavigationTarget, [NavigationTarget]),
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = ISNULL(@UpdatedBy, [UpdatedBy])
        WHERE [ProductId] = @ProductId;

        IF @Features IS NOT NULL
        BEGIN
            UPDATE [core].[ProductFeature]
            SET [IsDeleted] = 1,
                [IsActive] = 0,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [ProductId] = @ProductId;

            INSERT INTO [core].[ProductFeature]
            (
                [ProductId], [FeatureName], [IsActive], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            SELECT
                @ProductId,
                LTRIM(RTRIM(value)),
                1,
                SYSUTCDATETIME(),
                @UpdatedBy,
                0
            FROM STRING_SPLIT(@Features, '|')
            WHERE LTRIM(RTRIM(value)) <> N'';
        END

        SET @ReturnValue = @ProductId;
        RETURN @ReturnValue;
    END

    ---------------------------------------------------------------------------
    -- ActionId 4: Product Check Name
    ---------------------------------------------------------------------------
    IF @ActionId = 4
    BEGIN
        IF EXISTS (
            SELECT 1 FROM [core].[Product]
            WHERE LOWER(LTRIM(RTRIM([ProductName]))) = LOWER(@ProductName)
              AND [IsDeleted] = 0
              AND (@ProductId = 0 OR [ProductId] <> @ProductId)
        )
            SELECT CAST(1 AS BIT);
        ELSE
            SELECT CAST(0 AS BIT);

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 5: License GET All
    ---------------------------------------------------------------------------
    IF @ActionId = 5
    BEGIN
        SELECT
            ISNULL(l.[LicenseId], 0) AS [LicenseId],
            op.[OrganizationProductId],
            op.[CFROrgId] AS [OrgId],
            ISNULL(o.[OrgName], N'') AS [OrgName],
            op.[ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            l.[LicenseType],
            ISNULL(l.[ActivationDate], op.[CreatedDate]) AS [ActivationDate],
            l.[ExpiryDate],
            ISNULL(l.[LicenseStatus], N'active') AS [LicenseStatus],
            op.[AssignStatus],
            l.[IssuedBy],
            l.[Remarks],
            ISNULL(l.[CreatedDate], op.[CreatedDate]) AS [CreatedDate]
        FROM [lic].[OrganizationProduct] AS op
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        INNER JOIN [core].[Organization] AS o ON o.[ID] = op.[CFROrgId]
        LEFT JOIN [lic].[License] AS l ON l.[OrganizationProductId] = op.[OrganizationProductId]
        WHERE (@ProductId = 0 OR op.[ProductId] = @ProductId)
          AND (@OrgId = 0 OR op.[CFROrgId] = @OrgId)
          AND op.[IsDeleted] = 0
          AND p.[IsDeleted] = 0
          AND (l.[LicenseId] IS NULL OR l.[IsDeleted] = 0)
        ORDER BY ISNULL(l.[CreatedDate], op.[CreatedDate]) DESC, ISNULL(l.[LicenseId], 0) DESC;

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 6: License GET by ID
    ---------------------------------------------------------------------------
    IF @ActionId = 6
    BEGIN
        SELECT
            l.[LicenseId],
            op.[OrganizationProductId],
            op.[CFROrgId] AS [OrgId],
            ISNULL(o.[OrgName], N'') AS [OrgName],
            op.[ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            l.[LicenseType],
            l.[ActivationDate],
            l.[ExpiryDate],
            ISNULL(l.[LicenseStatus], N'active') AS [LicenseStatus],
            op.[AssignStatus],
            l.[IssuedBy],
            l.[Remarks],
            l.[CreatedDate]
        FROM [lic].[License] AS l
        INNER JOIN [lic].[OrganizationProduct] AS op ON op.[OrganizationProductId] = l.[OrganizationProductId]
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        INNER JOIN [core].[Organization] AS o ON o.[ID] = op.[CFROrgId]
        WHERE l.[LicenseId] = @LicenseId
          AND l.[IsDeleted] = 0;

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 7: License POST (Create)
    ---------------------------------------------------------------------------
    IF @ActionId = 7
    BEGIN
        IF ISNULL(@OrganizationProductId, 0) = 0 AND @OrgId > 0 AND @ProductId > 0
        BEGIN
            SELECT @OrganizationProductId = ISNULL([OrganizationProductId], 0)
            FROM [lic].[OrganizationProduct]
            WHERE [CFROrgId] = @OrgId
              AND [ProductId] = @ProductId
              AND [IsDeleted] = 0;

            IF ISNULL(@OrganizationProductId, 0) = 0
            BEGIN
                -- ProductOrgId has no external-product-system value available here yet —
                -- defaulted to @OrgId until the individual product integrations supply their own.
                INSERT INTO [lic].[OrganizationProduct]
                (
                    [CFROrgId],
                    [ProductOrgId],
                    [ProductId],
                    [AssignStatus],
                    [AssignedBy],
                    [ActiveStartDate],
                    [ActiveEndDate],
                    [CreatedDate],
                    [InsertedBy],
                    [IsDeleted]
                )
                VALUES
                (
                    @OrgId,
                    @OrgId,
                    @ProductId,
                    ISNULL(@AssignStatusInt, 1),
                    CASE WHEN @InsertedBy IS NULL OR @InsertedBy > 2147483647 THEN NULL ELSE CAST(@InsertedBy AS INT) END,
                    ISNULL(@ActivationDate, SYSUTCDATETIME()),
                    ISNULL(@ExpiryDate, DATEADD(YEAR, 1, SYSUTCDATETIME())),
                    SYSUTCDATETIME(),
                    CASE WHEN @InsertedBy IS NULL OR @InsertedBy > 2147483647 THEN NULL ELSE CAST(@InsertedBy AS INT) END,
                    0
                );

                SET @OrganizationProductId = SCOPE_IDENTITY();
                IF ISNULL(@OrganizationProductId, 0) = 0
                BEGIN
                    SELECT @OrganizationProductId = [OrganizationProductId]
                    FROM [lic].[OrganizationProduct]
                    WHERE [CFROrgId] = @OrgId
                      AND [ProductId] = @ProductId
                      AND [IsDeleted] = 0;
                END
            END
        END

        IF ISNULL(@OrganizationProductId, 0) = 0
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1
            FROM [lic].[License] AS l
            WHERE l.[OrganizationProductId] = @OrganizationProductId
              AND l.[IsDeleted] = 0
              AND LOWER(ISNULL(l.[LicenseStatus], N'active')) NOT IN (N'cancelled')
              AND CAST(@ActivationDate AS DATE) <= CAST(ISNULL(l.[ExpiryDate], '9999-12-31') AS DATE)
              AND CAST(@ExpiryDate AS DATE) >= CAST(ISNULL(l.[ActivationDate], '1900-01-01') AS DATE)
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        INSERT INTO [lic].[License]
        (
            [OrganizationProductId],
            [LicenseType],
            [ActivationDate],
            [ExpiryDate],
            [LicenseStatus],
            [IssuedBy],
            [Remarks],
            [CreatedDate],
            [InsertedBy]
        )
        VALUES
        (
            @OrganizationProductId,
            CASE LOWER(ISNULL(@LicenseType, N'subscription'))
                WHEN N'trial' THEN N'trial'
                WHEN N'perpetual' THEN N'perpetual'
                ELSE N'subscription'
            END,
            CAST(ISNULL(@ActivationDate, SYSUTCDATETIME()) AS DATE),
            CAST(@ExpiryDate AS DATE),
            CASE LOWER(ISNULL(@LicenseStatus, N'active'))
                WHEN N'expired' THEN N'expired'
                WHEN N'cancelled' THEN N'cancelled'
                ELSE N'active'
            END,
            @InsertedBy,
            @Remarks,
            SYSUTCDATETIME(),
            @InsertedBy
        );

        SET @LicenseId = SCOPE_IDENTITY();
        IF ISNULL(@LicenseId, 0) = 0
        BEGIN
            SELECT @LicenseId = MAX([LicenseId])
            FROM [lic].[License]
            WHERE [OrganizationProductId] = @OrganizationProductId;
        END

        SET @ReturnValue = CAST(ISNULL(@LicenseId, 0) AS INT);
        RETURN @ReturnValue;
    END

    ---------------------------------------------------------------------------
    -- ActionId 8: License PUT (Update)
    ---------------------------------------------------------------------------
    IF @ActionId = 8
    BEGIN
        IF @LicenseId <= 0 OR NOT EXISTS (
            SELECT 1 FROM [lic].[License]
            WHERE [LicenseId] = @LicenseId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        UPDATE [lic].[License]
        SET
            [LicenseType] = ISNULL(@LicenseType, [LicenseType]),
            [ActivationDate] = ISNULL(@ActivationDate, [ActivationDate]),
            [ExpiryDate] = @ExpiryDate,
            [LicenseStatus] = ISNULL(@LicenseStatus, [LicenseStatus]),
            [Remarks] = @Remarks,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [LicenseId] = @LicenseId;

        IF @AssignStatusInt IS NOT NULL
        BEGIN
            UPDATE op
            SET
                op.[AssignStatus] = @AssignStatusInt,
                op.[UpdatedDate] = SYSUTCDATETIME(),
                op.[UpdatedBy] = @UpdatedBy
            FROM [lic].[OrganizationProduct] AS op
            INNER JOIN [lic].[License] AS l ON l.[OrganizationProductId] = op.[OrganizationProductId]
            WHERE l.[LicenseId] = @LicenseId;
        END

        SET @ReturnValue = CAST(@LicenseId AS INT);
        RETURN @ReturnValue;
    END

    ---------------------------------------------------------------------------
    -- ActionId 9: Organizations subscribed to a product
    ---------------------------------------------------------------------------
    IF @ActionId = 9
    BEGIN
        -- Same output columns. Member counts and contact-email fallback stay on
        -- [auth].[UserProduct] / [auth].[User] for this ProductId only, so Parish Hub
        -- (and similar products) do not scan every member row of every assigned org.
        ;WITH AssignedOrgs AS (
            SELECT
                op.[OrganizationProductId],
                op.[CFROrgId] AS [OrgId],
                op.[OrgStatus],
                op.[AssignStatus],
                op.[CreatedDate]
            FROM [lic].[OrganizationProduct] AS op
            WHERE op.[ProductId] = @ProductId
              AND op.[IsDeleted] = 0
        ),
        UserCounts AS (
            SELECT up.[OrgId], COUNT(DISTINCT up.[CFRUserId]) AS [UserCount]
            FROM [auth].[UserProduct] AS up
            WHERE up.[ProductId] = @ProductId
              AND ISNULL(up.[IsDeleted], 0) = 0
            GROUP BY up.[OrgId]
        ),
        LatestLicense AS (
            SELECT
                l2.[OrganizationProductId],
                l2.[ActivationDate],
                l2.[ExpiryDate],
                l2.[LicenseType],
                l2.[LicenseStatus],
                ROW_NUMBER() OVER (PARTITION BY l2.[OrganizationProductId] ORDER BY l2.[CreatedDate] DESC) AS rn
            FROM [lic].[License] AS l2
            INNER JOIN AssignedOrgs AS a ON a.[OrganizationProductId] = l2.[OrganizationProductId]
            WHERE l2.[IsDeleted] = 0
        )
        SELECT
            o.[ID] AS [OrgId],
            o.[OrgName],
            a.[OrgStatus],
            ISNULL(NULLIF(LTRIM(RTRIM(o.[ContactEmail])), N''), u.[Email]) AS [ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[InsertedDate],
            o.[UpdatedDate],
            ISNULL(uc.[UserCount], 0) AS [UserCount],
            CONCAT(N'ORG-', o.[ID]) AS [OrgCode],
            ISNULL(l.[ActivationDate], ISNULL(a.[CreatedDate], o.[InsertedDate])) AS [StartDate],
            l.[ExpiryDate],
            l.[LicenseType],
            ISNULL(l.[LicenseStatus], CAST(a.[AssignStatus] AS NVARCHAR(20))) AS [LicenseStatus]
        FROM AssignedOrgs AS a
        INNER JOIN [core].[Organization] AS o
            ON o.[ID] = a.[OrgId]
           AND o.[IsDeleted] = 0
        LEFT JOIN UserCounts AS uc ON uc.[OrgId] = o.[ID]
        LEFT JOIN LatestLicense AS l ON l.[OrganizationProductId] = a.[OrganizationProductId] AND l.rn = 1
        OUTER APPLY (
            SELECT TOP (1) usr.[Email]
            FROM [auth].[UserProduct] AS up
            INNER JOIN [auth].[User] AS usr ON usr.[CFRUserId] = up.[CFRUserId]
            WHERE NULLIF(LTRIM(RTRIM(o.[ContactEmail])), N'') IS NULL
              AND up.[OrgId] = o.[ID]
              AND up.[ProductId] = @ProductId
              AND ISNULL(up.[IsDeleted], 0) = 0
              AND usr.[Email] IS NOT NULL
            ORDER BY up.[CreatedDate]
        ) AS u
        ORDER BY o.[OrgName];

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 10: Per-product organization assignment summary
    ---------------------------------------------------------------------------
    IF @ActionId = 10
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            (
                SELECT COUNT(DISTINCT op.[CFROrgId])
                FROM [lic].[OrganizationProduct] AS op
                WHERE op.[ProductId] = p.[ProductId]
                  AND op.[IsDeleted] = 0
                  AND op.[AssignStatus] = 1 -- Active
            ) AS [ActiveOrgCount],
            (
                SELECT COUNT(DISTINCT op.[CFROrgId])
                FROM [lic].[OrganizationProduct] AS op
                WHERE op.[ProductId] = p.[ProductId]
                  AND (op.[IsDeleted] = 1 OR op.[AssignStatus] <> 1)
            ) AS [InactiveOrgCount],
            (
                SELECT COUNT(DISTINCT op.[CFROrgId])
                FROM [lic].[OrganizationProduct] AS op
                WHERE op.[ProductId] = p.[ProductId]
            ) AS [TotalOrgCount]
        FROM [core].[Product] AS p
        WHERE p.[IsDeleted] = 0
        ORDER BY p.[ProductName];

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 11: License DELETE (soft delete)
    ---------------------------------------------------------------------------
    IF @ActionId = 11
    BEGIN
        IF @LicenseId <= 0 OR NOT EXISTS (
            SELECT 1 FROM [lic].[License]
            WHERE [LicenseId] = @LicenseId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        UPDATE [lic].[License]
        SET
            [IsDeleted] = 1,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [LicenseId] = @LicenseId;

        SET @ReturnValue = CAST(@LicenseId AS INT);
        RETURN @ReturnValue;
    END
END
GO
