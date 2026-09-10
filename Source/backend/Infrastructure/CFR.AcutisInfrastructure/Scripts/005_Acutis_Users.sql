-- Copyright (c) OptionC. All rights reserved.
-- Users CRUD: role-only ModuleRights, DateOfBirth, IsActive 0/1, no per-user rights copies.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH(N'auth.AcutisUser', N'DateOfBirth') IS NULL
BEGIN
    ALTER TABLE [auth].[AcutisUser] ADD [DateOfBirth] DATE NULL;
END
GO

-- Uses dynamic SQL throughout: [UserId] no longer exists on auth.ModuleRights once this has run
-- once, and SQL Server binds column names in a static DELETE/ALTER at parse time regardless of the
-- surrounding IF COL_LENGTH guard — so a second run of this script (e.g. against an environment
-- that already applied it) would otherwise fail to even compile this batch.
IF COL_LENGTH(N'auth.ModuleRights', N'UserId') IS NOT NULL
BEGIN
    EXEC(N'DELETE FROM [auth].[ModuleRights] WHERE [UserId] IS NOT NULL;');

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE [name] = N'UQ_ModuleRights_UserFeature'
          AND [object_id] = OBJECT_ID(N'auth.ModuleRights')
    )
        DROP INDEX [UQ_ModuleRights_UserFeature] ON [auth].[ModuleRights];

    IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE [name] = N'UQ_ModuleRights_RoleTemplate'
          AND [object_id] = OBJECT_ID(N'auth.ModuleRights')
    )
        DROP INDEX [UQ_ModuleRights_RoleTemplate] ON [auth].[ModuleRights];

    EXEC(N'ALTER TABLE [auth].[ModuleRights] DROP COLUMN [UserId];');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'UQ_ModuleRights_RoleTemplate'
      AND [object_id] = OBJECT_ID(N'auth.ModuleRights')
)
BEGIN
    CREATE UNIQUE INDEX [UQ_ModuleRights_RoleTemplate]
        ON [auth].[ModuleRights] ([RoleId], [FeatureId])
        WHERE [IsDeleted] = 0;
END
GO

-- A soft-deleted user's email must not block re-registering that same address: the app-level
-- duplicate check in Acutis_Users_CRUD already scopes to IsDeleted = 0, but the table also carries
-- a plain (non-filtered) unique constraint on Email from its original creation, which still blocks
-- it at the database level. Replace it with a filtered unique index, same pattern as
-- UQ_ModuleRights_RoleTemplate above.
DECLARE @EmailConstraintName SYSNAME = (
    SELECT TOP 1 kc.[name]
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic ON ic.[object_id] = kc.[parent_object_id] AND ic.[index_id] = kc.[unique_index_id]
    INNER JOIN sys.columns c ON c.[object_id] = ic.[object_id] AND c.[column_id] = ic.[column_id]
    WHERE kc.[parent_object_id] = OBJECT_ID(N'auth.AcutisUser')
      AND kc.[type] = 'UQ'
      AND c.[name] = N'Email'
);
IF @EmailConstraintName IS NOT NULL
BEGIN
    EXEC(N'ALTER TABLE [auth].[AcutisUser] DROP CONSTRAINT [' + @EmailConstraintName + N'];');
END
GO

DECLARE @EmailIndexName SYSNAME = (
    SELECT TOP 1 i.[name]
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON ic.[object_id] = i.[object_id] AND ic.[index_id] = i.[index_id]
    INNER JOIN sys.columns c ON c.[object_id] = ic.[object_id] AND c.[column_id] = ic.[column_id]
    WHERE i.[object_id] = OBJECT_ID(N'auth.AcutisUser')
      AND i.[is_unique] = 1
      AND i.[name] <> N'UQ_AcutisUser_Email_Active'
      AND c.[name] = N'Email'
);
IF @EmailIndexName IS NOT NULL
BEGIN
    EXEC(N'DROP INDEX [' + @EmailIndexName + N'] ON [auth].[AcutisUser];');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'UQ_AcutisUser_Email_Active'
      AND [object_id] = OBJECT_ID(N'auth.AcutisUser')
)
BEGIN
    CREATE UNIQUE INDEX [UQ_AcutisUser_Email_Active]
        ON [auth].[AcutisUser] ([Email])
        WHERE [IsDeleted] = 0;
END
GO

IF OBJECT_ID(N'[dbo].[Acutis_Users_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Users_CRUD];
GO

CREATE PROCEDURE [dbo].[Acutis_Users_CRUD]
    @ActionId INT,
    @UserId BIGINT = 0,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(256) = NULL,
    @Password VARCHAR(50) = NULL,
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
                [DateOfBirth], [ContactNumber], [IsActive], [IsLocked], [CreatedDate], [InsertedBy], [IsDeleted]
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
            CAST(0 AS INT) AS [OrganizationId],
            CAST(N'' AS NVARCHAR(200)) AS [OrganizationName],
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
            CAST(0 AS INT) AS [OrganizationId],
            CAST(N'' AS NVARCHAR(200)) AS [OrganizationName],
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
        WHERE u.[IsDeleted] = 0
        ORDER BY u.[LastName], u.[FirstName], u.[UserId];
        RETURN 0;
    END

    IF @ActionId = 5
    BEGIN
        SELECT
            CAST(o.[OrgId] AS INT) AS [OrganizationId],
            o.[OrgName] AS [Name]
        FROM [core].[Organization] AS o
        WHERE o.[IsDeleted] = 0
          AND o.[OrgStatus] = N'active'
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

IF OBJECT_ID(N'[dbo].[Acutis_DoLogin]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_DoLogin];
GO

CREATE PROCEDURE [dbo].[Acutis_DoLogin]
    @Email NVARCHAR(256),
    @Password VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId BIGINT;

    SELECT @UserId = u.[UserId]
    FROM [auth].[AcutisUser] AS u
    WHERE u.[Email] = @Email
      AND u.[IsDeleted] = 0
      AND u.[IsActive] = 1
      AND u.[IsLocked] = 0
      AND dbo.DecryptUserPassword(CONVERT(VARBINARY(128), u.[Password])) = @Password;

    IF @UserId IS NOT NULL
    BEGIN
        UPDATE [auth].[AcutisUser]
        SET [LastLogin] = SYSUTCDATETIME(),
            [UpdatedDate] = SYSUTCDATETIME()
        WHERE [UserId] = @UserId;
    END

    SELECT
        CAST(u.[UserId] AS INT) AS [UserId],
        CAST(0 AS INT) AS [AccessLevel],
        u.[RoleId],
        u.[Email] AS [EMail],
        u.[FirstName],
        u.[LastName],
        LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) AS [FullName],
        CAST(NULL AS INT) AS [OrganizationId],
        CASE WHEN u.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
        CAST(N'/admin' AS NVARCHAR(256)) AS [LandingURL],
        u.[LastLogin] AS [LastActiveAt]
    FROM [auth].[AcutisUser] AS u
    WHERE u.[UserId] = @UserId;

    SELECT
        COALESCE(NULLIF(LTRIM(RTRIM(m.[SubModule])), N''), m.[Module]) AS [DisplayName],
        COALESCE(NULLIF(LTRIM(RTRIM(m.[MenuCode])), N''), m.[SubModule], m.[Module]) AS [ModuleName],
        ISNULL(rr.[AccessRight], 0) AS [UserRight],
        u.[RoleId],
        m.[FeatureID],
        CASE WHEN ISNULL(m.[ParentId], 0) = 0 THEN 1 ELSE 2 END AS [LevelId],
        ISNULL(m.[ParentId], 0) AS [ParentId],
        ISNULL(m.[IsHideMenu], 0) AS [IsHideMenu],
        ISNULL(m.[DisplayOrder], 0) AS [DisplayOrder],
        ISNULL(m.[MenuIcon], N'') AS [Icon],
        ISNULL(m.[RoutingUrl], N'') AS [RoutingUrl]
    FROM [auth].[AcutisUser] AS u
    INNER JOIN [auth].[ModuleFeatures] AS m ON m.[IsDeleted] = 0
    LEFT JOIN [auth].[ModuleRights] AS rr
        ON rr.[RoleId] = u.[RoleId]
       AND rr.[FeatureId] = m.[FeatureID]
       AND rr.[IsDeleted] = 0
    WHERE u.[UserId] = @UserId
    ORDER BY ISNULL(m.[DisplayOrder], 0), m.[FeatureID];
END
GO
