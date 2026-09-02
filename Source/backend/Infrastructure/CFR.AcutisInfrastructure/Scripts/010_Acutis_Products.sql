-- Copyright (c) OptionC. All rights reserved.
-- CRUD for [core].[Product] and [lic].[License] / [lic].[OrganizationProduct].
-- ActionId 1: Product GET All (CustomerCount = distinct OrgId, same filters as ActionId 5)
-- ActionId 2: Product GET by ID (CustomerCount = distinct OrgId, same filters as ActionId 5)
-- ActionId 3: Product PUT (Update)
-- ActionId 4: Product Check Name
-- ActionId 5: License GET All
-- ActionId 6: License GET by ID
-- ActionId 7: License POST (Create)
-- ActionId 8: License PUT (Update)
-- ActionId 9: Product customers from [core].[Organization]
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = N'core' AND TABLE_NAME = N'Product' AND COLUMN_NAME = N'ContactPerson'
)
BEGIN
    ALTER TABLE [core].[Product] ADD [ContactPerson] NVARCHAR(200) NULL;
END
GO

IF OBJECT_ID(N'[dbo].[Acutis_Products_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Products_CRUD];
GO

CREATE PROCEDURE [dbo].[Acutis_Products_CRUD]
    @ActionId INT,
    -- Product Parameters
    @ProductId INT = 0,
    @ProductName NVARCHAR(200) = NULL,
    @SubCategoryName NVARCHAR(200) = NULL,
    @ProdDescription NVARCHAR(MAX) = NULL,
    @ExternalPageUrl NVARCHAR(500) = NULL,
    @DefaultAccessDays INT = 365,
    @LogoUrl NVARCHAR(500) = NULL,
    @ContactPerson NVARCHAR(200) = NULL,
    @Features NVARCHAR(MAX) = NULL,
    @IsActive BIT = 1,
    @IsAvailable BIT = 1,
    -- License Parameters
    @LicenseId BIGINT = 0,
    @OrganizationProductId BIGINT = 0,
    @OrgId BIGINT = 0,
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
    SET @SubCategoryName = NULLIF(LTRIM(RTRIM(@SubCategoryName)), N'');
    SET @ProdDescription = NULLIF(LTRIM(RTRIM(@ProdDescription)), N'');
    SET @ExternalPageUrl = NULLIF(LTRIM(RTRIM(@ExternalPageUrl)), N'');
    SET @LogoUrl = NULLIF(LTRIM(RTRIM(@LogoUrl)), N'');
    SET @LicenseType = NULLIF(LTRIM(RTRIM(@LicenseType)), N'');
    SET @LicenseStatus = NULLIF(LTRIM(RTRIM(@LicenseStatus)), N'');
    SET @AssignStatus = NULLIF(LTRIM(RTRIM(@AssignStatus)), N'');
    SET @Remarks = NULLIF(LTRIM(RTRIM(@Remarks)), N'');
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');

    ---------------------------------------------------------------------------
    -- ActionId 1: Product GET All
    ---------------------------------------------------------------------------
    IF @ActionId = 1
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            ISNULL(p.[DefaultAccessDays], 365) AS [DefaultAccessDays],
            p.[LogoUrl],
            p.[IsActive],
            p.[IsAvailable],
            p.[ContactPerson],
            (
                SELECT COUNT(DISTINCT op.[OrgId])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS prod ON prod.[ProductId] = op.[ProductId]
                INNER JOIN [core].[Organization] AS o ON o.[OrgId] = op.[OrgId]
                WHERE op.[ProductId] = p.[ProductId]
                  AND op.[IsDeleted] = 0
                  AND prod.[IsDeleted] = 0
            ) AS [CustomerCount],
            p.[CreatedDate],
            p.[InsertedBy],
            p.[UpdatedDate],
            p.[UpdatedBy],
            p.[IsDeleted]
        FROM [core].[Product] AS p
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
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            ISNULL(p.[DefaultAccessDays], 365) AS [DefaultAccessDays],
            p.[LogoUrl],
            p.[IsActive],
            p.[IsAvailable],
            p.[ContactPerson],
            (
                SELECT COUNT(DISTINCT op.[OrgId])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS prod ON prod.[ProductId] = op.[ProductId]
                INNER JOIN [core].[Organization] AS o ON o.[OrgId] = op.[OrgId]
                WHERE op.[ProductId] = p.[ProductId]
                  AND op.[IsDeleted] = 0
                  AND prod.[IsDeleted] = 0
            ) AS [CustomerCount],
            p.[CreatedDate],
            p.[InsertedBy],
            p.[UpdatedDate],
            p.[UpdatedBy],
            p.[IsDeleted]
        FROM [core].[Product] AS p
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
            [SubCategoryName] = @SubCategoryName,
            [ProdDescription] = @ProdDescription,
            [ExternalPageUrl] = @ExternalPageUrl,
            [DefaultAccessDays] = @DefaultAccessDays,
            [LogoUrl] = @LogoUrl,
            [ContactPerson] = CASE
                WHEN @ContactPerson IS NULL THEN [ContactPerson]
                WHEN LTRIM(RTRIM(@ContactPerson)) = N'' THEN NULL
                ELSE @ContactPerson
            END,
            [IsActive] = @IsActive,
            [IsAvailable] = @IsAvailable,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
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
            op.[OrgId],
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
        INNER JOIN [core].[Organization] AS o ON o.[OrgId] = op.[OrgId]
        LEFT JOIN [lic].[License] AS l ON l.[OrganizationProductId] = op.[OrganizationProductId]
        WHERE (@ProductId = 0 OR op.[ProductId] = @ProductId)
          AND (@OrgId = 0 OR op.[OrgId] = @OrgId)
          AND op.[IsDeleted] = 0
          AND p.[IsDeleted] = 0
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
            op.[OrgId],
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
        INNER JOIN [core].[Organization] AS o ON o.[OrgId] = op.[OrgId]
        WHERE l.[LicenseId] = @LicenseId;

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
            WHERE [OrgId] = @OrgId
              AND [ProductId] = @ProductId
              AND [IsDeleted] = 0;

            IF ISNULL(@OrganizationProductId, 0) = 0
            BEGIN
                INSERT INTO [lic].[OrganizationProduct]
                (
                    [OrgId],
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
                    @ProductId,
                    CASE LOWER(ISNULL(@AssignStatus, N'active'))
                        WHEN N'suspended' THEN N'suspended'
                        WHEN N'revoked' THEN N'revoked'
                        ELSE N'active'
                    END,
                    @InsertedBy,
                    ISNULL(@ActivationDate, SYSUTCDATETIME()),
                    ISNULL(@ExpiryDate, DATEADD(YEAR, 1, SYSUTCDATETIME())),
                    SYSUTCDATETIME(),
                    @InsertedBy,
                    0
                );

                SET @OrganizationProductId = SCOPE_IDENTITY();
                IF ISNULL(@OrganizationProductId, 0) = 0
                BEGIN
                    SELECT @OrganizationProductId = [OrganizationProductId]
                    FROM [lic].[OrganizationProduct]
                    WHERE [OrgId] = @OrgId
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
            INNER JOIN [lic].[OrganizationProduct] AS op
                ON op.[OrganizationProductId] = l.[OrganizationProductId]
            WHERE op.[OrganizationProductId] = @OrganizationProductId
              AND op.[IsDeleted] = 0
              AND LOWER(ISNULL(l.[LicenseStatus], N'active')) NOT IN (N'cancelled', N'expired')
              AND LOWER(ISNULL(op.[AssignStatus], N'active')) NOT IN (N'suspended', N'revoked')
              AND (
                    CAST(ISNULL(l.[ActivationDate], SYSUTCDATETIME()) AS DATE) > CAST(SYSUTCDATETIME() AS DATE)
                 OR l.[ExpiryDate] IS NULL
                 OR CAST(l.[ExpiryDate] AS DATE) >= CAST(SYSUTCDATETIME() AS DATE)
              )
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

        IF @AssignStatus IS NOT NULL
        BEGIN
            UPDATE op
            SET
                op.[AssignStatus] = @AssignStatus,
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
    -- ActionId 9: Product customers from [core].[Organization]
    ---------------------------------------------------------------------------
    IF @ActionId = 9
    BEGIN
        SELECT
            o.[OrgId],
            o.[OrgName],
            o.[OrgStatus],
            ISNULL(NULLIF(LTRIM(RTRIM(o.[ContactEmail])), N''), u.[Email]) AS [ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[InsertedDate],
            o.[UpdatedDate],
            (
                SELECT COUNT(*)
                FROM [auth].[OrganizationUser] AS ou
                WHERE ou.[OrgId] = o.[OrgId]
                  AND ou.[IsDeleted] = 0
            ) AS [UserCount],
            CONCAT(N'ORG-', o.[OrgId]) AS [OrgCode],
            ISNULL(l.[ActivationDate], ISNULL(op.[CreatedDate], o.[InsertedDate])) AS [StartDate],
            l.[ExpiryDate],
            l.[LicenseType],
            ISNULL(l.[LicenseStatus], ISNULL(op.[AssignStatus], o.[OrgStatus])) AS [LicenseStatus]
        FROM [core].[Organization] AS o
        INNER JOIN [lic].[OrganizationProduct] AS op
            ON op.[OrgId] = o.[OrgId]
           AND op.[ProductId] = @ProductId
           AND op.[IsDeleted] = 0
        OUTER APPLY
        (
            SELECT TOP (1)
                l2.[ActivationDate],
                l2.[ExpiryDate],
                l2.[LicenseType],
                l2.[LicenseStatus]
            FROM [lic].[License] AS l2
            WHERE l2.[OrganizationProductId] = op.[OrganizationProductId]
            ORDER BY l2.[CreatedDate] DESC
        ) AS l
        OUTER APPLY
        (
            SELECT TOP (1)
                usr.[Email]
            FROM [auth].[OrganizationUser] AS ou
            INNER JOIN [auth].[User] AS usr ON usr.[CFRUserId] = ou.[AuthUserId]
            WHERE ou.[OrgId] = o.[OrgId]
              AND ou.[IsDeleted] = 0
            ORDER BY ou.[CreatedDate]
        ) AS u
        WHERE o.[IsDeleted] = 0
        ORDER BY o.[OrgName];

        RETURN 0;
    END
END
GO
