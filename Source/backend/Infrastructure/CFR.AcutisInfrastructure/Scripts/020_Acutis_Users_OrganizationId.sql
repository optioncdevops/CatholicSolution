-- Copyright (c) OptionC. All rights reserved.
-- Wires up the previously-dead OrganizationId on Acutis users: adds the column, and updates
-- Acutis_Users to save/return the real value instead of a hardcoded 0 in GetUserById/GetUsersList.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH(N'auth.AcutisUser', N'OrganizationId') IS NULL
BEGIN
    ALTER TABLE [auth].[AcutisUser] ADD [OrganizationId] INT NULL;
END
GO

IF OBJECT_ID(N'[dbo].[Acutis_Users]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Users];
GO

CREATE PROCEDURE [dbo].[Acutis_Users]
    @ActionId INT,
    @UserId BIGINT = 0,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(256) = NULL,
    @Password VARCHAR(50) = NULL,
    @OrganizationId INT = NULL,
    @RoleId INT = NULL,
    @IsActive INT = NULL,
    @IsLocked INT = NULL,
    @DateOfBirth DATE = NULL,
    @ContactNumber NVARCHAR(30) = NULL,
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @OrganizationId = NULLIF(@OrganizationId, 0);

    IF @ActionId = 1
    BEGIN
        IF @UserId = 0
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM [auth].[AcutisUser]
                WHERE [Email] = @Email
                  AND [IsDeleted] = 0
            )
            BEGIN
                SET @ReturnValue = -99;
                RETURN @ReturnValue;
            END

            INSERT INTO [auth].[AcutisUser]
            (
                [RoleId], [Email], [Password], [FirstName], [LastName],
                [DateOfBirth], [ContactNumber], [OrganizationId], [IsActive], [IsLocked], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @RoleId,
                @Email,
                CONVERT(varbinary(300), dbo.EncryptUserPassword(@Password)),
                @FirstName,
                @LastName,
                @DateOfBirth,
                @ContactNumber,
                @OrganizationId,
                CASE WHEN @IsActive = 0 THEN 0 ELSE 1 END,
                CASE WHEN @IsLocked = 1 THEN 1 ELSE 0 END,
                SYSUTCDATETIME(),
                @InsertedBy,
                0
            );

            SET @ReturnValue = CAST(SCOPE_IDENTITY() AS INT);
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser]
            WHERE [Email] = @Email
              AND [UserId] <> @UserId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        -- Last-active-admin protection: block deactivating this user via the edit form if they are
        -- currently the only active Platform Admin (same rule ActionId 2/6 enforce for
        -- status-toggle/delete, repeated here since Save doubles as the edit-status path).
        IF @IsActive = 0 AND EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser] AS u
            INNER JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = u.[RoleId]
            WHERE u.[UserId] = @UserId
              AND u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND r.[RoleName] = N'Platform Admin'
        )
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM [auth].[AcutisUser] AS u2
                INNER JOIN [auth].[AcutisRole] AS r2 ON r2.[RoleId] = u2.[RoleId]
                WHERE u2.[UserId] <> @UserId
                  AND u2.[IsDeleted] = 0
                  AND u2.[IsActive] = 1
                  AND r2.[RoleName] = N'Platform Admin'
            )
            BEGIN
                SET @ReturnValue = -97;
                RETURN @ReturnValue;
            END
        END

        UPDATE [auth].[AcutisUser]
        SET
            [FirstName] = @FirstName,
            [LastName] = @LastName,
            [Email] = @Email,
            [Password] = CASE
                WHEN NULLIF(@Password, '') IS NULL THEN [Password]
                ELSE CONVERT(varbinary(300), dbo.EncryptUserPassword(@Password))
            END,
            [RoleId] = @RoleId,
            [DateOfBirth] = @DateOfBirth,
            [ContactNumber] = @ContactNumber,
            [OrganizationId] = @OrganizationId,
            [IsActive] = CASE WHEN @IsActive = 0 THEN 0 ELSE 1 END,
            [IsLocked] = CASE WHEN @IsLocked = 1 THEN 1 ELSE 0 END,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@UserId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 2
    BEGIN
        -- Last-active-admin protection: refuse to deactivate the only remaining active Platform
        -- Admin. -99 is already used for duplicate-email; use -97 for this distinct failure so the
        -- service layer can map it to its own error message.
        IF @IsActive = 0 AND EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser] AS u
            INNER JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = u.[RoleId]
            WHERE u.[UserId] = @UserId
              AND u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND r.[RoleName] = N'Platform Admin'
        )
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM [auth].[AcutisUser] AS u2
                INNER JOIN [auth].[AcutisRole] AS r2 ON r2.[RoleId] = u2.[RoleId]
                WHERE u2.[UserId] <> @UserId
                  AND u2.[IsDeleted] = 0
                  AND u2.[IsActive] = 1
                  AND r2.[RoleName] = N'Platform Admin'
            )
            BEGIN
                SET @ReturnValue = -97;
                RETURN @ReturnValue;
            END
        END

        UPDATE [auth].[AcutisUser]
        SET [IsActive] = CASE WHEN @IsActive = 0 THEN 0 ELSE 1 END,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@UserId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            CAST(u.[UserId] AS INT) AS [UserId],
            ISNULL(u.[FirstName], N'') AS [FirstName],
            ISNULL(u.[LastName], N'') AS [LastName],
            LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) AS [FullName],
            u.[Email] AS [EMail],
            ISNULL(u.[OrganizationId], 0) AS [OrganizationId],
            ISNULL(o.[OrgName], N'') AS [OrganizationName],
            u.[RoleId],
            r.[RoleName],
            CAST(u.[IsActive] AS INT) AS [IsActive],
            CAST(u.[IsLocked] AS INT) AS [IsLocked],
            CASE WHEN u.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            CONVERT(VARCHAR(10), u.[DateOfBirth], 23) AS [DateOfBirth],
            u.[ContactNumber],
            u.[LastLogin] AS [LastActiveAt]
        FROM [auth].[AcutisUser] AS u
        INNER JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = u.[RoleId]
        LEFT JOIN [core].[Organization] AS o ON o.[ID] = u.[OrganizationId] AND o.[IsDeleted] = 0
        WHERE u.[UserId] = @UserId
          AND u.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 4
    BEGIN
        SELECT
            CAST(u.[UserId] AS INT) AS [UserId],
            ISNULL(u.[FirstName], N'') AS [FirstName],
            ISNULL(u.[LastName], N'') AS [LastName],
            LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) AS [FullName],
            u.[Email] AS [EMail],
            ISNULL(u.[OrganizationId], 0) AS [OrganizationId],
            ISNULL(o.[OrgName], N'') AS [OrganizationName],
            u.[RoleId],
            r.[RoleName],
            CAST(u.[IsActive] AS INT) AS [IsActive],
            CAST(u.[IsLocked] AS INT) AS [IsLocked],
            CASE WHEN u.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            CONVERT(VARCHAR(10), u.[DateOfBirth], 23) AS [DateOfBirth],
            u.[ContactNumber],
            u.[LastLogin] AS [LastActiveAt]
        FROM [auth].[AcutisUser] AS u
        INNER JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = u.[RoleId]
        LEFT JOIN [core].[Organization] AS o ON o.[ID] = u.[OrganizationId] AND o.[IsDeleted] = 0
        WHERE u.[IsDeleted] = 0
        ORDER BY u.[LastName], u.[FirstName], u.[UserId];
        RETURN 0;
    END

    IF @ActionId = 5
    BEGIN
        -- Organization no longer has its own OrgStatus (moved to per-product OrganizationProduct
        -- rows as of 016_Acutis_Organization_Rebuild.sql) — this lookup no longer filters by
        -- status, it lists every non-deleted organization.
        SELECT
            o.[ID] AS [OrganizationId],
            o.[OrgName] AS [Name]
        FROM [core].[Organization] AS o
        WHERE o.[IsDeleted] = 0
        ORDER BY o.[OrgName];

        SELECT r.[RoleId], r.[RoleName]
        FROM [auth].[AcutisRole] AS r
        WHERE r.[IsDeleted] = 0
          AND r.[IsActive] = 1
        ORDER BY r.[RoleId];
        RETURN 0;
    END

    IF @ActionId = 6
    BEGIN
        -- Last-active-admin protection: refuse to delete the only remaining active Platform Admin.
        IF EXISTS (
            SELECT 1
            FROM [auth].[AcutisUser] AS u
            INNER JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = u.[RoleId]
            WHERE u.[UserId] = @UserId
              AND u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND r.[RoleName] = N'Platform Admin'
        )
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM [auth].[AcutisUser] AS u2
                INNER JOIN [auth].[AcutisRole] AS r2 ON r2.[RoleId] = u2.[RoleId]
                WHERE u2.[UserId] <> @UserId
                  AND u2.[IsDeleted] = 0
                  AND u2.[IsActive] = 1
                  AND r2.[RoleName] = N'Platform Admin'
            )
            BEGIN
                SET @ReturnValue = -97;
                RETURN @ReturnValue;
            END
        END

        UPDATE [auth].[AcutisUser]
        SET [IsDeleted] = 1,
            [IsActive] = 0,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@UserId AS INT);
        RETURN @ReturnValue;
    END
END
GO
