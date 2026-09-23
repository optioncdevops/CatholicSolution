-- Copyright (c) OptionC. All rights reserved.
-- Platform launch: lets a trusted external caller (e.g. CFR.DataSync's client-credentials
-- context, on behalf of a linked SMS/product session) hand a browser a one-time code that
-- establishes a real CFR Portal session - the same short-lived, single-use code + exchange
-- shape already proven by [dbo].[Portal_CFRLaunch] (10-minute expiry, hashed at rest, consumed
-- once), not a standing shared credential. Used for "return to CFR's own App Hub, already
-- signed in" links from a product's App Switcher widget.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[auth].[CFRPlatformLaunch]', N'U') IS NULL
BEGIN
    CREATE TABLE [auth].[CFRPlatformLaunch]
    (
        [PlatformLaunchId] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CFRPlatformLaunch] PRIMARY KEY,
        [CFRUserId] INT NOT NULL,
        [CodeHash] CHAR(64) NOT NULL,
        [ExpiresAt] DATETIME2(7) NOT NULL,
        [IsUsed] BIT NOT NULL CONSTRAINT [DF_CFRPlatformLaunch_IsUsed] DEFAULT (0),
        [UsedAt] DATETIME2(7) NULL,
        [InsertedBy] NVARCHAR(100) NULL,
        [InsertedDate] DATETIME2(7) NOT NULL CONSTRAINT [DF_CFRPlatformLaunch_InsertedDate] DEFAULT (SYSUTCDATETIME())
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_CFRPlatformLaunch_CodeHash' AND object_id = OBJECT_ID(N'[auth].[CFRPlatformLaunch]')
)
BEGIN
    CREATE UNIQUE INDEX [UX_CFRPlatformLaunch_CodeHash] ON [auth].[CFRPlatformLaunch] ([CodeHash]);
END
GO

IF OBJECT_ID(N'[dbo].[Portal_PlatformLaunch]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Portal_PlatformLaunch];
GO

CREATE PROCEDURE [dbo].[Portal_PlatformLaunch]
    @ActionId INT,
    @Email NVARCHAR(256) = NULL,
    @CodeHash CHAR(64) = NULL,
    @InsertedBy NVARCHAR(100) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;

    -- ActionId 1: create a one-time code for the CFR member matched by email. The caller is a
    -- trusted machine client (not a signed-in Portal user), so the target member comes from
    -- @Email, matched directly against [auth].[User].[Email] - the same case-insensitive,
    -- trimmed comparison [dbo].[Portal_DoLogin] already uses, so this has no dependency on the
    -- computed NormalizedEmail column.
    IF @ActionId = 1
    BEGIN
        DECLARE @CFRUserId INT;
        SELECT @CFRUserId = u.[CFRUserId]
        FROM [auth].[User] AS u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(LTRIM(RTRIM(@Email)));

        IF @CFRUserId IS NULL
        BEGIN
            SET @ReturnValue = -1;
            RETURN @ReturnValue;
        END

        DECLARE @ComputedExpiresAt DATETIME2(7) = DATEADD(MINUTE, 10, SYSUTCDATETIME());

        INSERT INTO [auth].[CFRPlatformLaunch]
        (
            [CFRUserId], [CodeHash], [ExpiresAt], [InsertedBy]
        )
        VALUES
        (
            @CFRUserId, @CodeHash, @ComputedExpiresAt, @InsertedBy
        );

        SET @ReturnValue = 1;
        RETURN @ReturnValue;
    END

    -- ActionId 2: consume a code and return the member's Portal login profile (same column
    -- shape as [dbo].[Portal_DoLogin]'s member SELECT) so the caller can mint a normal session
    -- JWT via the same token generator normal password login uses.
    IF @ActionId = 2
    BEGIN
        DECLARE @FoundLaunchId BIGINT;
        DECLARE @FoundUserId INT;
        DECLARE @FoundExpiresAt DATETIME2(7);
        DECLARE @FoundIsUsed BIT;

        SELECT
            @FoundLaunchId = l.[PlatformLaunchId],
            @FoundUserId = l.[CFRUserId],
            @FoundExpiresAt = l.[ExpiresAt],
            @FoundIsUsed = l.[IsUsed]
        FROM [auth].[CFRPlatformLaunch] AS l
        WHERE l.[CodeHash] = @CodeHash;

        IF @FoundLaunchId IS NULL
        BEGIN
            SET @ReturnValue = -1;
            RETURN @ReturnValue;
        END

        IF @FoundExpiresAt <= SYSUTCDATETIME()
        BEGIN
            SET @ReturnValue = -2;
            RETURN @ReturnValue;
        END

        -- Idempotent within the expiry window (mirrors Portal_CFRLaunch ActionId 3) so a retried
        -- exchange doesn't fail as "already used".
        IF @FoundIsUsed = 0
        BEGIN
            UPDATE [auth].[CFRPlatformLaunch]
            SET [IsUsed] = 1,
                [UsedAt] = SYSUTCDATETIME()
            WHERE [PlatformLaunchId] = @FoundLaunchId
              AND [IsUsed] = 0
              AND [ExpiresAt] > SYSUTCDATETIME();
        END

        SET @ReturnValue = 1;

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
        WHERE u.[CFRUserId] = @FoundUserId;

        RETURN @ReturnValue;
    END
END
GO
