-- Copyright (c) OptionC. All rights reserved.
-- Adds ActionId 4 to [dbo].[Portal_CFRLaunch]: create a launch code for a CFR member resolved
-- by email instead of by ICurrentUserService.UserId, so a trusted machine client (CFR.DataSync,
-- on behalf of a linked SMS/App-Switcher session) can start a real, already-signed-in launch
-- into any of that member's assigned products - the same one-time CFRLaunch code + ExchangeToken
-- mechanism CFR's own App Hub "Launch" button already uses (ActionId 2/3, unchanged below),
-- just with a different, explicitly-trusted way to say who the code is for. ActionId 1/2/3 are
-- reproduced unchanged (CREATE OR ALTER replaces the whole procedure body).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE [dbo].[Portal_CFRLaunch]
    @ActionId INT,
    @CFRUserId INT = NULL,
    @ProductId INT = NULL,
    @CodeHash CHAR(64) = NULL,
    @ExpiresAt DATETIME2(7) = NULL,
    @InsertedBy BIGINT = NULL,
    @EnvironmentName NVARCHAR(20) = NULL,
    @Email NVARCHAR(256) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @EnvironmentName = LTRIM(RTRIM(NULLIF(@EnvironmentName, N'')));
    IF @EnvironmentName IS NULL
        SET @EnvironmentName = N'Development';

    -- Hub products: assigned = Your Apps; ProductStatus 1 unassigned = Available; ProductStatus 2 = Future.
    -- Launch BaseUrl comes from [core].[ProductEnvironment] for the login EnvironmentName.
    -- Request is allowed only when the member has RoleId 4 or 9 on [auth].[UserProduct].
    IF @ActionId = 1
    BEGIN
        DECLARE @CanRequest BIT = 0;
        IF EXISTS (
            SELECT 1
            FROM [auth].[UserProduct]
            WHERE [CFRUserId] = @CFRUserId
              AND ISNULL([IsDeleted], 0) = 0
              AND [RoleId] IN (4, 9)
        )
            SET @CanRequest = 1;

        DECLARE @UserOrgId BIGINT = NULL;
        SELECT TOP (1) @UserOrgId = up.[OrgId]
        FROM [auth].[UserProduct] up
        WHERE up.[CFRUserId] = @CFRUserId
          AND ISNULL(up.[IsDeleted], 0) = 0
          AND up.[OrgId] IS NOT NULL
        ORDER BY up.[CFRUserDetailId];

        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            pe.[BaseUrl],
            p.[LogoName] AS [LogoUrl],
            p.[IsActive],
            CAST(CASE WHEN p.[ProductStatus] = 1 THEN 1 ELSE 0 END AS BIT) AS [IsAvailable],
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN N'your'
                WHEN p.[ProductStatus] = 1 THEN N'available'
                ELSE N'future'
            END AS [HubSection],
            CAST(
                CASE
                    WHEN assigned.[ProductId] IS NULL
                     AND p.[ProductStatus] = 1
                     AND @CanRequest = 1
                    THEN 1
                    ELSE 0
                END AS BIT
            ) AS [CanRequest],
            CAST(
                CASE
                    WHEN @UserOrgId IS NOT NULL AND EXISTS (
                        SELECT 1
                        FROM [request].[AccessRequest] ar
                        INNER JOIN [request].[AccessRequestProduct] arp
                            ON arp.[AccessRequestId] = ar.[AccessRequestId]
                           AND arp.[IsDeleted] = 0
                        WHERE ar.[IsDeleted] = 0
                          AND ar.[OrgId] = @UserOrgId
                          AND arp.[ProductId] = p.[ProductId]
                          AND arp.[LineStatus] = 2
                    ) THEN 1
                    ELSE 0
                END AS BIT
            ) AS [IsOrgApproved],
            ISNULL((
                SELECT STRING_AGG(f.[FeatureName], ', ') WITHIN GROUP (ORDER BY f.[ProductFeatureId])
                FROM [core].[ProductFeature] f
                WHERE f.[ProductId] = p.[ProductId]
                  AND f.[IsActive] = 1
                  AND f.[IsDeleted] = 0
            ), '') AS [Features],
            contactUser.[UserId] AS [ContactUserId],
            LTRIM(RTRIM(contactUser.[Email])) AS [ContactEmail]
        FROM [core].[Product] AS p
        LEFT JOIN (
            SELECT DISTINCT up.[ProductId]
            FROM [auth].[UserProduct] AS up
            WHERE up.[CFRUserId] = @CFRUserId
              AND ISNULL(up.[IsDeleted], 0) = 0
              AND ISNULL(up.[IsLoginDisabled], 0) = 0
              AND ISNULL(up.[IsActive], 1) = 1
        ) AS assigned
            ON assigned.[ProductId] = p.[ProductId]
        LEFT JOIN [core].[ProductEnvironment] AS pe
            ON pe.[ProductId] = p.[ProductId]
           AND pe.[EnvironmentName] = @EnvironmentName
           AND ISNULL(pe.[IsDeleted], 0) = 0
           AND pe.[IsActive] = 1
        LEFT JOIN [auth].[AcutisUser] AS contactUser
            ON (
                (p.[ContactUserId] IS NOT NULL AND p.[ContactUserId] = contactUser.[UserId])
                OR (p.[ContactUserId] IS NULL AND (
                    contactUser.[UserId] = TRY_CAST(p.[ContactPerson] AS INT)
                    OR LTRIM(RTRIM(ISNULL(contactUser.[FirstName], N'') + N' ' + ISNULL(contactUser.[LastName], N''))) = LTRIM(RTRIM(p.[ContactPerson]))
                ))
            )
            AND contactUser.[IsDeleted] = 0
            AND contactUser.[IsActive] = 1
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

    -- Replace any prior row for this user+product. ExpiresAt is computed in SQL (10 minutes).
    IF @ActionId = 2
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM [auth].[User]
            WHERE [CFRUserId] = @CFRUserId
        )
        BEGIN
            SET @ReturnValue = -1;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -2;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
              AND [IsActive] = 1
        )
        BEGIN
            SET @ReturnValue = -3;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[ProductEnvironment]
            WHERE [ProductId] = @ProductId
              AND [EnvironmentName] = @EnvironmentName
              AND ISNULL([IsDeleted], 0) = 0
              AND [IsActive] = 1
              AND NULLIF(LTRIM(RTRIM([BaseUrl])), N'') IS NOT NULL
        )
        BEGIN
            SET @ReturnValue = -4;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [auth].[UserProduct]
            WHERE [CFRUserId] = @CFRUserId
              AND [ProductId] = @ProductId
              AND ISNULL([IsDeleted], 0) = 0
              AND ISNULL([IsLoginDisabled], 0) = 0
              AND ISNULL([IsActive], 1) = 1
        )
        BEGIN
            SET @ReturnValue = -5;
            RETURN @ReturnValue;
        END

        -- Replace any prior launch row for this user and product, then insert a new code.
        -- ExpiresAt is computed here from SYSUTCDATETIME() so app/SQL clock skew cannot shrink the window.
        DELETE FROM [auth].[CFRLaunch]
        WHERE [CFRUserId] = @CFRUserId
          AND [ProductId] = @ProductId;

        DECLARE @ComputedExpiresAt DATETIME2(7) = DATEADD(MINUTE, 10, SYSUTCDATETIME());

        INSERT INTO [auth].[CFRLaunch]
        (
            [CFRUserId], [ProductId], [CodeHash], [ExpiresAt], [InsertedBy], [IsUsed]
        )
        VALUES
        (
            @CFRUserId, @ProductId, @CodeHash, @ComputedExpiresAt, @InsertedBy, 0
        );

        DECLARE @LaunchId BIGINT = SCOPE_IDENTITY();
        SET @ReturnValue = CAST(@LaunchId AS INT);

        SELECT
            CAST(@LaunchId AS INT) AS [LaunchId],
            p.[ProductId],
            p.[ProductName],
            pe.[BaseUrl],
            @ComputedExpiresAt AS [ExpiresAt]
        FROM [core].[Product] AS p
        INNER JOIN [core].[ProductEnvironment] AS pe
            ON pe.[ProductId] = p.[ProductId]
           AND pe.[EnvironmentName] = @EnvironmentName
           AND ISNULL(pe.[IsDeleted], 0) = 0
           AND pe.[IsActive] = 1
        WHERE p.[ProductId] = @ProductId;

        RETURN @ReturnValue;
    END

    -- Exchange a launch code. First call consumes it; later calls with the same code
    -- still succeed until ExpiresAt so SMS retries and Swagger retests do not fail as "already used".
    IF @ActionId = 3
    BEGIN
        DECLARE @FoundLaunchId BIGINT;
        DECLARE @FoundUserId INT;
        DECLARE @FoundProductId INT;
        DECLARE @FoundExpiresAt DATETIME2(7);
        DECLARE @FoundIsUsed BIT;

        SELECT
            @FoundLaunchId = l.[LaunchId],
            @FoundUserId = l.[CFRUserId],
            @FoundProductId = l.[ProductId],
            @FoundExpiresAt = l.[ExpiresAt],
            @FoundIsUsed = l.[IsUsed]
        FROM [auth].[CFRLaunch] AS l
        WHERE l.[CodeHash] = @CodeHash;

        IF @FoundLaunchId IS NULL
        BEGIN
            SET @ReturnValue = -1;
            RETURN @ReturnValue;
        END

        IF @FoundProductId <> @ProductId
        BEGIN
            SET @ReturnValue = -4;
            RETURN @ReturnValue;
        END

        IF @FoundExpiresAt <= SYSUTCDATETIME()
        BEGIN
            SET @ReturnValue = -2;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @FoundProductId
              AND [IsDeleted] = 0
              AND [IsActive] = 1
        )
        BEGIN
            SET @ReturnValue = -6;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [auth].[UserProduct]
            WHERE [CFRUserId] = @FoundUserId
              AND [ProductId] = @FoundProductId
              AND ISNULL([IsDeleted], 0) = 0
              AND ISNULL([IsLoginDisabled], 0) = 0
              AND ISNULL([IsActive], 1) = 1
        )
        BEGIN
            SET @ReturnValue = -5;
            RETURN @ReturnValue;
        END

        IF @FoundIsUsed = 0
        BEGIN
            UPDATE [auth].[CFRLaunch]
            SET [IsUsed] = 1,
                [UsedAt] = SYSUTCDATETIME()
            WHERE [LaunchId] = @FoundLaunchId
              AND [IsUsed] = 0
              AND [ExpiresAt] > SYSUTCDATETIME()
              AND [ProductId] = @ProductId;
        END

        SET @ReturnValue = 1;

        SELECT
            CAST(@FoundLaunchId AS INT) AS [LaunchId],
            u.[CFRUserId],
            u.[Email] AS [EMail],
            p.[ProductId]
        FROM [auth].[User] AS u
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = @FoundProductId
        WHERE u.[CFRUserId] = @FoundUserId;

        RETURN @ReturnValue;
    END

    -- ActionId 4: same as ActionId 2 (create a launch code), but for a trusted machine client
    -- that has an email, not a signed-in Portal user - @CFRUserId is resolved from @Email first
    -- (matched directly against [auth].[User].[Email], same as [dbo].[Portal_DoLogin]), then the
    -- rest is identical to ActionId 2's checks and insert.
    IF @ActionId = 4
    BEGIN
        DECLARE @MachineCFRUserId INT;
        SELECT @MachineCFRUserId = u.[CFRUserId]
        FROM [auth].[User] AS u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(LTRIM(RTRIM(@Email)));

        IF @MachineCFRUserId IS NULL
        BEGIN
            SET @ReturnValue = -1;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -2;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
              AND [IsActive] = 1
        )
        BEGIN
            SET @ReturnValue = -3;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [core].[ProductEnvironment]
            WHERE [ProductId] = @ProductId
              AND [EnvironmentName] = @EnvironmentName
              AND ISNULL([IsDeleted], 0) = 0
              AND [IsActive] = 1
              AND NULLIF(LTRIM(RTRIM([BaseUrl])), N'') IS NOT NULL
        )
        BEGIN
            SET @ReturnValue = -4;
            RETURN @ReturnValue;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [auth].[UserProduct]
            WHERE [CFRUserId] = @MachineCFRUserId
              AND [ProductId] = @ProductId
              AND ISNULL([IsDeleted], 0) = 0
              AND ISNULL([IsLoginDisabled], 0) = 0
              AND ISNULL([IsActive], 1) = 1
        )
        BEGIN
            SET @ReturnValue = -5;
            RETURN @ReturnValue;
        END

        DELETE FROM [auth].[CFRLaunch]
        WHERE [CFRUserId] = @MachineCFRUserId
          AND [ProductId] = @ProductId;

        DECLARE @MachineComputedExpiresAt DATETIME2(7) = DATEADD(MINUTE, 10, SYSUTCDATETIME());

        INSERT INTO [auth].[CFRLaunch]
        (
            [CFRUserId], [ProductId], [CodeHash], [ExpiresAt], [InsertedBy], [IsUsed]
        )
        VALUES
        (
            @MachineCFRUserId, @ProductId, @CodeHash, @MachineComputedExpiresAt, @InsertedBy, 0
        );

        DECLARE @MachineLaunchId BIGINT = SCOPE_IDENTITY();
        SET @ReturnValue = CAST(@MachineLaunchId AS INT);

        SELECT
            CAST(@MachineLaunchId AS INT) AS [LaunchId],
            p.[ProductId],
            p.[ProductName],
            pe.[BaseUrl],
            @MachineComputedExpiresAt AS [ExpiresAt]
        FROM [core].[Product] AS p
        INNER JOIN [core].[ProductEnvironment] AS pe
            ON pe.[ProductId] = p.[ProductId]
           AND pe.[EnvironmentName] = @EnvironmentName
           AND ISNULL(pe.[IsDeleted], 0) = 0
           AND pe.[IsActive] = 1
        WHERE p.[ProductId] = @ProductId;

        RETURN @ReturnValue;
    END
END
GO
