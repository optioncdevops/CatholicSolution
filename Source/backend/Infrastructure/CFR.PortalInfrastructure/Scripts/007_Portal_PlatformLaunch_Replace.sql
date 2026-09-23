-- Copyright (c) OptionC. All rights reserved.
-- Fixes [dbo].[Portal_PlatformLaunch] ActionId 1: it was inserting a new row on every call
-- (e.g. every GetUserProducts fetch from the widget) instead of replacing the member's prior
-- unused code, the same way [dbo].[Portal_CFRLaunch] ActionId 2 already does. Adds a DELETE
-- before the INSERT so each CFR member has at most one live row. ActionId 2 is reproduced
-- unchanged (CREATE OR ALTER replaces the whole procedure body).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE [dbo].[Portal_PlatformLaunch]
    @ActionId INT,
    @Email NVARCHAR(256) = NULL,
    @CodeHash CHAR(64) = NULL,
    @InsertedBy NVARCHAR(100) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;

    -- ActionId 1: create a one-time code for the CFR member matched by email, matched directly
    -- against [auth].[User].[Email] (same case-insensitive, trimmed comparison
    -- [dbo].[Portal_DoLogin] already uses). Replaces any prior row for this member so repeated
    -- calls (e.g. every widget fetch) update in place instead of accumulating rows.
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

        DELETE FROM [auth].[CFRPlatformLaunch]
        WHERE [CFRUserId] = @CFRUserId;

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

-- Explicit cleanup, requested alongside this fix: clear the junk rows accumulated by the old
-- insert-only behavior. This table only ever holds ephemeral, single-use, short-lived codes -
-- nothing here is durable business data.
TRUNCATE TABLE [auth].[CFRPlatformLaunch];
GO
