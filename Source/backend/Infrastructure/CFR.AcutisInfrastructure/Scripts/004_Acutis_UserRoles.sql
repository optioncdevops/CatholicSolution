-- Copyright (c) OptionC. All rights reserved.
-- CRUD for [auth].[AcutisRole]. RoleId is not an identity column.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_UserRoles]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_UserRoles];
GO

CREATE PROCEDURE [dbo].[Acutis_UserRoles]
    @ActionId INT,
    @RoleId INT = 0,
    @RoleName NVARCHAR(100) = NULL,
    @Description NVARCHAR(300) = NULL,
    @Status NVARCHAR(20) = NULL,
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);

    IF @ActionId = 1
    BEGIN
        IF @RoleId = 0
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM [auth].[AcutisRole]
                WHERE [RoleName] = @RoleName
                  AND [IsDeleted] = 0
            )
            BEGIN
                SET @ReturnValue = -99;
                RETURN @ReturnValue;
            END

            SELECT @RoleId = ISNULL(MAX([RoleId]), 0) + 1
            FROM [auth].[AcutisRole];

            INSERT INTO [auth].[AcutisRole]
            (
                [RoleId], [RoleName], [Description], [IsActive], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @RoleId,
                @RoleName,
                @Description,
                CASE WHEN @Status = N'inactive' THEN 0 ELSE 1 END,
                SYSUTCDATETIME(),
                @InsertedBy,
                0
            );

            INSERT INTO [auth].[ModuleRights]
            (
                [RoleId], [FeatureId], [AccessRight], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            SELECT
                @RoleId,
                t.[FeatureId],
                t.[AccessRight],
                SYSUTCDATETIME(),
                @InsertedBy,
                0
            FROM [auth].[ModuleRights] AS t
            WHERE t.[RoleId] = 1
              AND t.[IsDeleted] = 0
              AND NOT EXISTS (
                  SELECT 1
                  FROM [auth].[ModuleRights] AS x
                  WHERE x.[RoleId] = @RoleId
                    AND x.[FeatureId] = t.[FeatureId]
                    AND x.[IsDeleted] = 0
              );

            SET @ReturnValue = @RoleId;
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1
            FROM [auth].[AcutisRole]
            WHERE [RoleName] = @RoleName
              AND [RoleId] <> @RoleId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisRole]
        SET
            [RoleName] = @RoleName,
            [Description] = @Description,
            [IsActive] = CASE
                WHEN @Status = N'inactive' THEN 0
                WHEN @Status = N'active' THEN 1
                ELSE [IsActive]
            END,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [RoleId] = @RoleId
          AND [IsDeleted] = 0;

        SET @ReturnValue = @RoleId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 2
    BEGIN
        -- Deactivating a role that's still assigned to active users would silently strand those
        -- users' sign-in/authorization (a role's ModuleRights stop being a valid grant once its
        -- own role is inactive) — block it here the same way ActionId 5 (delete) already blocks
        -- removing an in-use role, rather than letting it happen invisibly.
        IF @Status = N'inactive' AND EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser]
            WHERE [RoleId] = @RoleId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisRole]
        SET [IsActive] = CASE WHEN @Status = N'inactive' THEN 0 ELSE 1 END,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [RoleId] = @RoleId
          AND [IsDeleted] = 0;

        SET @ReturnValue = @RoleId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            r.[RoleId],
            r.[RoleName],
            ISNULL(r.[Description], N'') AS [Description],
            CASE WHEN r.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            r.[CreatedDate],
            LTRIM(RTRIM(CONCAT(cb.[FirstName], ' ', cb.[LastName]))) AS [CreatedBy],
            r.[UpdatedDate] AS [ModifiedDate],
            LTRIM(RTRIM(CONCAT(mb.[FirstName], ' ', mb.[LastName]))) AS [ModifiedBy],
            (SELECT COUNT(1) FROM [auth].[AcutisUser] AS u WHERE u.[RoleId] = r.[RoleId] AND u.[IsDeleted] = 0) AS [UsersCount]
        FROM [auth].[AcutisRole] AS r
        LEFT JOIN [auth].[AcutisUser] cb ON r.[InsertedBy] = cb.[UserId]
        LEFT JOIN [auth].[AcutisUser] mb ON r.[UpdatedBy] = mb.[UserId]
        WHERE r.[RoleId] = @RoleId
          AND r.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 4
    BEGIN
        SELECT
            r.[RoleId],
            r.[RoleName],
            ISNULL(r.[Description], N'') AS [Description],
            CASE WHEN r.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            r.[CreatedDate],
            LTRIM(RTRIM(CONCAT(cb.[FirstName], ' ', cb.[LastName]))) AS [CreatedBy],
            r.[UpdatedDate] AS [ModifiedDate],
            LTRIM(RTRIM(CONCAT(mb.[FirstName], ' ', mb.[LastName]))) AS [ModifiedBy],
            (SELECT COUNT(1) FROM [auth].[AcutisUser] AS u WHERE u.[RoleId] = r.[RoleId] AND u.[IsDeleted] = 0) AS [UsersCount]
        FROM [auth].[AcutisRole] AS r
        LEFT JOIN [auth].[AcutisUser] cb ON r.[InsertedBy] = cb.[UserId]
        LEFT JOIN [auth].[AcutisUser] mb ON r.[UpdatedBy] = mb.[UserId]
        WHERE r.[IsDeleted] = 0
        ORDER BY r.[RoleName], r.[RoleId];
        RETURN 0;
    END

    IF @ActionId = 5
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser]
            WHERE [RoleId] = @RoleId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisRole]
        SET [IsDeleted] = 1,
            [IsActive] = 0,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [RoleId] = @RoleId
          AND [IsDeleted] = 0;

        UPDATE [auth].[ModuleRights]
        SET [IsDeleted] = 1,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [RoleId] = @RoleId
          AND [IsDeleted] = 0;

        SET @ReturnValue = @RoleId;
        RETURN @ReturnValue;
    END
END
GO
