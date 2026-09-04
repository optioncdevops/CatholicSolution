-- Copyright (c) OptionC. All rights reserved.
-- Portal member login, assigned products, and one-time CFR launch codes.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[auth].[CFRLaunch]', N'U') IS NULL
BEGIN
    CREATE TABLE [auth].[CFRLaunch]
    (
        [LaunchId] BIGINT IDENTITY(1, 1) NOT NULL
            CONSTRAINT [PK_CFRLaunch] PRIMARY KEY,
        [CFRUserId] INT NOT NULL,
        [ProductId] INT NOT NULL,
        [CodeHash] CHAR(64) NOT NULL,
        [CreatedAt] DATETIME2(7) NOT NULL
            CONSTRAINT [DF_CFRLaunch_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [ExpiresAt] DATETIME2(7) NOT NULL,
        [UsedAt] DATETIME2(7) NULL,
        [IsUsed] BIT NOT NULL
            CONSTRAINT [DF_CFRLaunch_IsUsed] DEFAULT (0),
        [InsertedBy] BIGINT NULL
    );

    CREATE UNIQUE INDEX [UQ_CFRLaunch_CodeHash]
        ON [auth].[CFRLaunch] ([CodeHash]);

    CREATE INDEX [IX_CFRLaunch_UserProduct]
        ON [auth].[CFRLaunch] ([CFRUserId], [ProductId], [IsUsed]);
END
GO

IF OBJECT_ID(N'[dbo].[Portal_DoLogin]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Portal_DoLogin];
GO

CREATE PROCEDURE [dbo].[Portal_DoLogin]
    @Email NVARCHAR(256),
    @Password VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CFRUserId INT;

    SELECT @CFRUserId = u.[CFRUserId]
    FROM [auth].[User] AS u
    WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(LTRIM(RTRIM(@Email)))
      AND dbo.DecryptUserPassword(CONVERT(VARBINARY(128), u.[Password])) = @Password;

    SELECT
        u.[CFRUserId] AS [UserId],
        u.[Email] AS [EMail],
        ISNULL((
            SELECT TOP (1) up.[FirstName]
            FROM [auth].[UserProduct] AS up
            WHERE up.[CFRUserId] = u.[CFRUserId]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ), N'') AS [FirstName],
        ISNULL((
            SELECT TOP (1) up.[LastName]
            FROM [auth].[UserProduct] AS up
            WHERE up.[CFRUserId] = u.[CFRUserId]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ), N'') AS [LastName]
    FROM [auth].[User] AS u
    WHERE u.[CFRUserId] = @CFRUserId;
END
GO

IF OBJECT_ID(N'[dbo].[Portal_CFRLaunch_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Portal_CFRLaunch_CRUD];
GO

CREATE PROCEDURE [dbo].[Portal_CFRLaunch_CRUD]
    @ActionId INT,
    @CFRUserId INT = NULL,
    @ProductId INT = NULL,
    @CodeHash CHAR(64) = NULL,
    @ExpiresAt DATETIME2(7) = NULL,
    @InsertedBy BIGINT = NULL,
    @EnvironmentName NVARCHAR(20) = NULL,
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
            ) AS [CanRequest]
        FROM [core].[Product] AS p
        LEFT JOIN (
            SELECT DISTINCT up.[ProductId]
            FROM [auth].[UserProduct] AS up
            WHERE up.[CFRUserId] = @CFRUserId
              AND ISNULL(up.[IsDeleted], 0) = 0
              AND ISNULL(up.[IsLoginDisabled], 0) = 0
              AND ISNULL(up.[IsLockedOut], 0) = 0
        ) AS assigned
            ON assigned.[ProductId] = p.[ProductId]
        LEFT JOIN [core].[ProductEnvironment] AS pe
            ON pe.[ProductId] = p.[ProductId]
           AND pe.[EnvironmentName] = @EnvironmentName
           AND ISNULL(pe.[IsDeleted], 0) = 0
           AND pe.[IsActive] = 1
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
              AND ISNULL([IsLockedOut], 0) = 0
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
              AND ISNULL([IsLockedOut], 0) = 0
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
END
GO
