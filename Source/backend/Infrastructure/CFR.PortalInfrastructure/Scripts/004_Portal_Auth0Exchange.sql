-- Copyright (c) OptionC. All rights reserved.
-- Email-only member lookup for federated (Auth0) sign-in - Auth0 has already
-- verified the user's identity out of band, so this deliberately does not
-- check a password (unlike Portal_DoLogin).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Portal_GetUserByEmail]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Portal_GetUserByEmail];
GO

CREATE PROCEDURE [dbo].[Portal_GetUserByEmail]
    @Email NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CFRUserId INT;

    SELECT @CFRUserId = u.[CFRUserId]
    FROM [auth].[User] AS u
    WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(LTRIM(RTRIM(@Email)));

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
