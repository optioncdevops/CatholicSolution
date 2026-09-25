-- Copyright (c) OptionC. All rights reserved.
-- Migrates the CFR identity column [auth].[User].[CFRUserId] from INT IDENTITY(1,1) to
-- UNIQUEIDENTIFIER (GUID), and every column that carries the same identity by foreign key:
--   [auth].[UserProduct].[CFRUserId]        (FK_CFRUserDetails_CFRUsers)
--   [auth].[CFRLaunch].[CFRUserId]          (FK_CFRLaunch_User)
--   [lic].[ProductAccessLog].[AuthUserId]   (FK_ProductAccessLog_User)
--   [auth].[OrganizationUser].[AuthUserId]  (FK_OrganizationUser_User)
-- plus one additional column discovered while re-pointing [dbo].[Sync_UserProductUpsert] at the
-- new type (no FK constraint, but populated directly from the same identity):
--   [audit].[UserSyncAudit].[CFRUserId]     (no FK - audit/log table)
--
-- All 6 tables are empty in every environment this has been run against so far, so this is a
-- straight DDL migration - no data backfill/conversion is required. SQL Server has NO conversion
-- path at all (implicit or explicit CAST) between INT/BIGINT and UNIQUEIDENTIFIER - unlike, say,
-- INT -> VARCHAR, ALTER COLUMN cannot change these columns in place even though every table is
-- empty, because the type check is schema-level, not row-level ("Operand type clash: int is
-- incompatible with uniqueidentifier"). Every one of these columns is therefore dropped and
-- re-added as UNIQUEIDENTIFIER rather than ALTER COLUMN - including [auth].[User].[CFRUserId],
-- which is also IDENTITY(1,1) and could never have used ALTER COLUMN anyway (SQL Server disallows
-- ALTER COLUMN entirely on an identity column). DEFAULT NEWID() on [auth].[User].[CFRUserId]
-- takes over IDENTITY's old role of generating the value DB-side.
--
-- Idempotent: every DROP/ADD/CREATE below is individually guarded on the current state (does the
-- column already have the target type? does the constraint/index already exist?), not one
-- all-or-nothing block - so this script is safe to resume from any partially-applied state (e.g.
-- a prior run that got partway through) as well as safe to re-run after it has fully succeeded.
-- The proc redefinitions further down use CREATE OR ALTER, which is idempotent on its own.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ===========================================================================================
-- 1. Table/column DDL for the CFRUserId identity and its FK-linked sibling columns.
-- ===========================================================================================

-- 1a. Drop the 4 foreign keys that reference [auth].[User].[CFRUserId] (must go before any of
-- the column swaps below, and before the primary key drop in 1c).
IF OBJECT_ID(N'[auth].[FK_CFRUserDetails_CFRUsers]', N'F') IS NOT NULL
    ALTER TABLE [auth].[UserProduct] DROP CONSTRAINT [FK_CFRUserDetails_CFRUsers];
IF OBJECT_ID(N'[auth].[FK_CFRLaunch_User]', N'F') IS NOT NULL
    ALTER TABLE [auth].[CFRLaunch] DROP CONSTRAINT [FK_CFRLaunch_User];
IF OBJECT_ID(N'[lic].[FK_ProductAccessLog_User]', N'F') IS NOT NULL
    ALTER TABLE [lic].[ProductAccessLog] DROP CONSTRAINT [FK_ProductAccessLog_User];
IF OBJECT_ID(N'[auth].[FK_OrganizationUser_User]', N'F') IS NOT NULL
    ALTER TABLE [auth].[OrganizationUser] DROP CONSTRAINT [FK_OrganizationUser_User];
GO

-- 1b. Drop indexes/unique constraints that include one of the columns being retyped - DROP
-- COLUMN refuses to run while the column is indexed.
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CFRLaunch_UserProduct' AND object_id = OBJECT_ID(N'[auth].[CFRLaunch]'))
    DROP INDEX [IX_CFRLaunch_UserProduct] ON [auth].[CFRLaunch];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CFRUserDetails_CFRUserId' AND object_id = OBJECT_ID(N'[auth].[UserProduct]'))
    DROP INDEX [IX_CFRUserDetails_CFRUserId] ON [auth].[UserProduct];
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UserProduct_User_Product_Org' AND object_id = OBJECT_ID(N'[auth].[UserProduct]'))
    DROP INDEX [UX_UserProduct_User_Product_Org] ON [auth].[UserProduct];
IF OBJECT_ID(N'[auth].[UQ_OrganizationUser]', N'UQ') IS NOT NULL
    ALTER TABLE [auth].[OrganizationUser] DROP CONSTRAINT [UQ_OrganizationUser];
GO

-- 1c. Drop the primary key on [auth].[User].[CFRUserId].
IF OBJECT_ID(N'[auth].[PK_CFRUsers]', N'PK') IS NOT NULL
    ALTER TABLE [auth].[User] DROP CONSTRAINT [PK_CFRUsers];
GO

-- 1d. Drop and re-add each column as UNIQUEIDENTIFIER (see header note on why ALTER COLUMN
-- cannot be used for any of these, identity or not). Each is guarded independently so a prior
-- partial run resumes cleanly instead of re-attempting a column that already succeeded.
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[auth].[User]') AND c.name = N'CFRUserId' AND ty.name <> N'uniqueidentifier')
BEGIN
    ALTER TABLE [auth].[User] DROP COLUMN [CFRUserId];
    ALTER TABLE [auth].[User] ADD [CFRUserId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_User_CFRUserId] DEFAULT NEWID();
END
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[auth].[UserProduct]') AND c.name = N'CFRUserId' AND ty.name <> N'uniqueidentifier')
BEGIN
    ALTER TABLE [auth].[UserProduct] DROP COLUMN [CFRUserId];
    ALTER TABLE [auth].[UserProduct] ADD [CFRUserId] UNIQUEIDENTIFIER NOT NULL;
END
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[auth].[CFRLaunch]') AND c.name = N'CFRUserId' AND ty.name <> N'uniqueidentifier')
BEGIN
    ALTER TABLE [auth].[CFRLaunch] DROP COLUMN [CFRUserId];
    ALTER TABLE [auth].[CFRLaunch] ADD [CFRUserId] UNIQUEIDENTIFIER NOT NULL;
END
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[lic].[ProductAccessLog]') AND c.name = N'AuthUserId' AND ty.name <> N'uniqueidentifier')
BEGIN
    ALTER TABLE [lic].[ProductAccessLog] DROP COLUMN [AuthUserId];
    ALTER TABLE [lic].[ProductAccessLog] ADD [AuthUserId] UNIQUEIDENTIFIER NOT NULL;
END
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(N'[auth].[OrganizationUser]') AND c.name = N'AuthUserId' AND ty.name <> N'uniqueidentifier')
BEGIN
    ALTER TABLE [auth].[OrganizationUser] DROP COLUMN [AuthUserId];
    ALTER TABLE [auth].[OrganizationUser] ADD [AuthUserId] UNIQUEIDENTIFIER NOT NULL;
END
GO

-- 1e. Recreate the primary key (was CLUSTERED before this migration).
IF OBJECT_ID(N'[auth].[PK_CFRUsers]', N'PK') IS NULL
    ALTER TABLE [auth].[User] ADD CONSTRAINT [PK_CFRUsers] PRIMARY KEY CLUSTERED ([CFRUserId]);
GO

-- 1f. Recreate the 4 foreign keys.
IF OBJECT_ID(N'[auth].[FK_CFRUserDetails_CFRUsers]', N'F') IS NULL
    ALTER TABLE [auth].[UserProduct]
        ADD CONSTRAINT [FK_CFRUserDetails_CFRUsers] FOREIGN KEY ([CFRUserId]) REFERENCES [auth].[User]([CFRUserId]);
IF OBJECT_ID(N'[auth].[FK_CFRLaunch_User]', N'F') IS NULL
    ALTER TABLE [auth].[CFRLaunch]
        ADD CONSTRAINT [FK_CFRLaunch_User] FOREIGN KEY ([CFRUserId]) REFERENCES [auth].[User]([CFRUserId]);
IF OBJECT_ID(N'[lic].[FK_ProductAccessLog_User]', N'F') IS NULL
    ALTER TABLE [lic].[ProductAccessLog]
        ADD CONSTRAINT [FK_ProductAccessLog_User] FOREIGN KEY ([AuthUserId]) REFERENCES [auth].[User]([CFRUserId]);
IF OBJECT_ID(N'[auth].[FK_OrganizationUser_User]', N'F') IS NULL
    ALTER TABLE [auth].[OrganizationUser]
        ADD CONSTRAINT [FK_OrganizationUser_User] FOREIGN KEY ([AuthUserId]) REFERENCES [auth].[User]([CFRUserId]);
GO

-- 1g. Recreate the indexes/unique constraint dropped in step 1b, unchanged in shape.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CFRLaunch_UserProduct' AND object_id = OBJECT_ID(N'[auth].[CFRLaunch]'))
    CREATE NONCLUSTERED INDEX [IX_CFRLaunch_UserProduct] ON [auth].[CFRLaunch] ([CFRUserId], [ProductId], [IsUsed]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CFRUserDetails_CFRUserId' AND object_id = OBJECT_ID(N'[auth].[UserProduct]'))
    CREATE NONCLUSTERED INDEX [IX_CFRUserDetails_CFRUserId] ON [auth].[UserProduct] ([CFRUserId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UserProduct_User_Product_Org' AND object_id = OBJECT_ID(N'[auth].[UserProduct]'))
    CREATE UNIQUE NONCLUSTERED INDEX [UX_UserProduct_User_Product_Org] ON [auth].[UserProduct] ([CFRUserId], [ProductId], [OrgId]);
IF OBJECT_ID(N'[auth].[UQ_OrganizationUser]', N'UQ') IS NULL
    ALTER TABLE [auth].[OrganizationUser]
        ADD CONSTRAINT [UQ_OrganizationUser] UNIQUE ([AuthUserId], [OrgId], [LegacyUserId]);
GO

-- ===========================================================================================
-- 2. [audit].[UserSyncAudit].[CFRUserId] - not FK-linked (it's a log table), but
-- [dbo].[Sync_UserProductUpsert] inserts the resolved CFRUserId into it directly, and
-- UNIQUEIDENTIFIER has no implicit or explicit conversion to/from BIGINT, so this column has to
-- move to the same type or every audited create/update/deactivate/reactivate call would fail.
-- Same DROP+ADD approach as section 1 (no ALTER COLUMN path between BIGINT and UNIQUEIDENTIFIER).
-- ===========================================================================================
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSyncAudit_CFRUserId' AND object_id = OBJECT_ID(N'[audit].[UserSyncAudit]'))
    DROP INDEX [IX_UserSyncAudit_CFRUserId] ON [audit].[UserSyncAudit];
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    JOIN sys.types ty ON ty.user_type_id = c.user_type_id
    WHERE c.object_id = OBJECT_ID(N'[audit].[UserSyncAudit]') AND c.name = N'CFRUserId' AND ty.name <> N'uniqueidentifier'
)
BEGIN
    ALTER TABLE [audit].[UserSyncAudit] DROP COLUMN [CFRUserId];
    ALTER TABLE [audit].[UserSyncAudit] ADD [CFRUserId] UNIQUEIDENTIFIER NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSyncAudit_CFRUserId' AND object_id = OBJECT_ID(N'[audit].[UserSyncAudit]'))
    CREATE NONCLUSTERED INDEX [IX_UserSyncAudit_CFRUserId] ON [audit].[UserSyncAudit] ([CFRUserId]);
GO

-- ===========================================================================================
-- 3. [dbo].[Sync_ProductsForUser] - local @CFRUserId variable only, no other change needed.
-- ===========================================================================================
CREATE OR ALTER PROCEDURE [dbo].[Sync_ProductsForUser]
    @Email NVARCHAR(256),
    @EnvironmentName NVARCHAR(20) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @EnvironmentName = LTRIM(RTRIM(NULLIF(@EnvironmentName, N'')));
    IF @EnvironmentName IS NULL
        SET @EnvironmentName = N'Development';

    DECLARE @CFRUserId UNIQUEIDENTIFIER;
    SELECT @CFRUserId = u.[CFRUserId]
    FROM [auth].[User] AS u
    WHERE u.[Email] = LOWER(LTRIM(RTRIM(@Email)));

    IF @CFRUserId IS NULL
    BEGIN
        SET @ReturnValue = -1;
        RETURN @ReturnValue;
    END

    -- Launch URL comes from [core].[ProductEnvironment] for the caller's environment, the same
    -- source [dbo].[Portal_CFRLaunch] ActionId 1 uses - not the static [core].[Product].
    -- [ExternalPageUrl], which is not kept in sync per environment. A product with no active
    -- ProductEnvironment row for this environment is not launchable here, so it's excluded.
    SELECT
        p.[ProductId],
        p.[ProductName],
        p.[ShortName],
        p.[SubCategoryName],
        pe.[BaseUrl] AS [ExternalPageUrl],
        p.[LogoName],
        p.[NavigationTarget]
    FROM [core].[Product] AS p
    INNER JOIN [auth].[UserProduct] AS up
        ON up.[ProductId] = p.[ProductId]
       AND up.[CFRUserId] = @CFRUserId
       AND ISNULL(up.[IsDeleted], 0) = 0
       AND ISNULL(up.[IsLoginDisabled], 0) = 0
       AND ISNULL(up.[IsActive], 1) = 1
    INNER JOIN [core].[ProductEnvironment] AS pe
        ON pe.[ProductId] = p.[ProductId]
       AND pe.[EnvironmentName] = @EnvironmentName
       AND ISNULL(pe.[IsDeleted], 0) = 0
       AND pe.[IsActive] = 1
       AND NULLIF(LTRIM(RTRIM(pe.[BaseUrl])), N'') IS NOT NULL
    WHERE p.[IsDeleted] = 0
      AND p.[IsActive] = 1
    ORDER BY p.[ProductName];

    SET @ReturnValue = 1;
    RETURN @ReturnValue;
END
GO

-- ===========================================================================================
-- 4. [dbo].[Sync_UserProductUpsert] - @CFRUserId/@ExistingCFRUserId become UNIQUEIDENTIFIER, and
-- the [auth].[User] identity-create INSERT (previously relying on SCOPE_IDENTITY() against the
-- IDENTITY column) now generates the GUID explicitly with NEWID() BEFORE the insert and supplies
-- it in the column/VALUES list, since [CFRUserId] is no longer an IDENTITY column.
-- ===========================================================================================
CREATE OR ALTER PROCEDURE [dbo].[Sync_UserProductUpsert]
    @ActionId INT,
    @ProductId INT,
    @ProductOrgId INT,
    @ApiClientId INT,
    @TraceId NVARCHAR(100),
    @ExternalUserId NVARCHAR(200) = NULL,
    @Email NVARCHAR(256) = NULL,
    @FirstName NVARCHAR(200) = NULL,
    @LastName NVARCHAR(200) = NULL,
    @RoleId INT = NULL,
    @IsLoginDisabled BIT = NULL,
    @IsActive BIT = NULL,
    @PasswordEncrypted VARBINARY(300) = NULL,
    @ExpectedRowVersion BINARY(8) = NULL,
    @SourceIp NVARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @CFROrgId INT;
    DECLARE @OrgName NVARCHAR(255);
    DECLARE @ResultCode NVARCHAR(50) = N'OK';
    DECLARE @CFRUserId UNIQUEIDENTIFIER;
    DECLARE @CFRUserDetailId BIGINT;
    DECLARE @Outcome NVARCHAR(20);
    DECLARE @Operation NVARCHAR(50);
    DECLARE @BeforeJson NVARCHAR(MAX) = NULL;
    DECLARE @AfterJson NVARCHAR(MAX) = NULL;
    DECLARE @RowVersionOut BINARY(8) = NULL;
    DECLARE @NormalizedEmail NVARCHAR(256) = LOWER(LTRIM(RTRIM(@Email)));

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Every ActionId resolves the org first.
        SELECT @CFROrgId = op.[CFROrgId], @OrgName = op.[OrgName]
        FROM [lic].[OrganizationProduct] AS op
        WHERE op.[ProductId] = @ProductId
          AND op.[ProductOrgId] = @ProductOrgId
          AND op.[IsDeleted] = 0
          AND op.[OrgStatus] = 1 -- 1 = Active (see 016_Acutis_Organization_Rebuild.sql)
          AND (op.[ActiveEndDate] IS NULL OR op.[ActiveEndDate] >= SYSUTCDATETIME());

        IF @CFROrgId IS NULL
        BEGIN
            SET @ResultCode = N'ORG_NOT_ONBOARDED';
            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        ----------------------------------------------------------------
        -- ActionId 4: Get - read-only, no identity resolution/creation.
        ----------------------------------------------------------------
        IF @ActionId = 4
        BEGIN
            SELECT
                @CFRUserId = up.[CFRUserId], @CFRUserDetailId = up.[CFRUserDetailId],
                @RowVersionOut = up.[RowVersion]
            FROM [auth].[UserProduct] AS up
            WHERE up.[ProductId] = @ProductId AND up.[UserId] = @ExternalUserId
              AND up.[OrgId] = @CFROrgId AND up.[IsDeleted] = 0;

            IF @CFRUserDetailId IS NULL
            BEGIN
                SET @ResultCode = N'USER_NOT_FOUND';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            SELECT @Email = u.[Email] FROM [auth].[User] AS u WHERE u.[CFRUserId] = @CFRUserId;
            SET @Outcome = N'NoChange';
            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        ----------------------------------------------------------------
        -- ActionId 5/6: Deactivate / Reactivate - flip status only.
        ----------------------------------------------------------------
        IF @ActionId IN (5, 6)
        BEGIN
            DECLARE @ExistingRowVersion BINARY(8);
            DECLARE @ExistingIsDeleted BIT;

            SELECT
                @CFRUserId = up.[CFRUserId], @CFRUserDetailId = up.[CFRUserDetailId],
                @ExistingRowVersion = up.[RowVersion], @ExistingIsDeleted = up.[IsDeleted]
            FROM [auth].[UserProduct] AS up
            WHERE up.[ProductId] = @ProductId AND up.[UserId] = @ExternalUserId AND up.[OrgId] = @CFROrgId;

            IF @CFRUserDetailId IS NULL
            BEGIN
                SET @ResultCode = N'USER_NOT_FOUND';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            IF @ExpectedRowVersion IS NOT NULL AND @ExpectedRowVersion <> @ExistingRowVersion
            BEGIN
                SET @ResultCode = N'CONCURRENCY_CONFLICT';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            SELECT @BeforeJson = (
                SELECT [IsDeleted] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );

            -- No Status column - active/inactive is IsDeleted alone (0/1).
            UPDATE [auth].[UserProduct]
            SET [IsDeleted] = CASE WHEN @ActionId = 5 THEN 1 ELSE 0 END,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @ApiClientId
            WHERE [CFRUserDetailId] = @CFRUserDetailId;

            SELECT @RowVersionOut = [RowVersion] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId;
            SELECT @Email = u.[Email] FROM [auth].[User] AS u WHERE u.[CFRUserId] = @CFRUserId;

            SET @AfterJson = (
                SELECT [IsDeleted] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );
            SET @Outcome = CASE WHEN @ActionId = 5 THEN N'Deactivated' ELSE N'Reactivated' END;
            SET @Operation = @Outcome;

            INSERT INTO [audit].[UserSyncAudit]
                ([TraceId], [ApiClientId], [ProductId], [Operation], [CFRUserId], [CFRUserDetailId], [Email], [BeforeJson], [AfterJson], [ResultCode], [SourceIp])
            VALUES
                (@TraceId, @ApiClientId, @ProductId, @Operation, @CFRUserId, @CFRUserDetailId, @Email, @BeforeJson, @AfterJson, @ResultCode, @SourceIp);

            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        ----------------------------------------------------------------
        -- ActionId 1/2/3: Create / Full update / Partial update.
        ----------------------------------------------------------------

        -- Resolve or create the CFR identity by normalized email. A concurrent insert
        -- hitting the same email raises a unique-index violation (2601/2627) here,
        -- which the CATCH block below turns into a re-select instead of a failure -
        -- so concurrent bulk rows converge on one identity rather than erroring.
        -- No NormalizedEmail column on auth.User - normalize inline against the raw Email column.
        SELECT @CFRUserId = u.[CFRUserId] FROM [auth].[User] AS u WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = @NormalizedEmail;

        IF @CFRUserId IS NULL
        BEGIN
            -- Password is set only at identity creation - CFR owns it exclusively from then on,
            -- so a later sync of the same identity never overwrites a password the user may have
            -- already changed inside CFR.
            -- [CFRUserId] is no longer IDENTITY (it is UNIQUEIDENTIFIER DEFAULT NEWID()) - the
            -- GUID is generated here, before the insert, and supplied explicitly instead of
            -- relying on SCOPE_IDENTITY() afterwards.
            SET @CFRUserId = NEWID();

            INSERT INTO [auth].[User] ([CFRUserId], [Email], [Password], [CreatedDate], [InsertedBy])
                VALUES (@CFRUserId, @Email, @PasswordEncrypted, SYSUTCDATETIME(), @ApiClientId);
        END

        -- Existing membership row for this external user, regardless of which CFR
        -- identity it currently points at (needed to detect an email-rebind).
        DECLARE @ExistingCFRUserId UNIQUEIDENTIFIER;
        DECLARE @TargetHasActiveRow BIT = 0;

        SELECT
            @CFRUserDetailId = up.[CFRUserDetailId], @ExistingCFRUserId = up.[CFRUserId],
            @ExistingRowVersion = up.[RowVersion], @ExistingIsDeleted = up.[IsDeleted]
        FROM [auth].[UserProduct] AS up
        WHERE up.[ProductId] = @ProductId AND up.[UserId] = @ExternalUserId AND up.[OrgId] = @CFROrgId;

        IF @ActionId = 1 AND @CFRUserDetailId IS NOT NULL AND @ExistingIsDeleted = 0
        BEGIN
            SET @ResultCode = N'USER_ALREADY_EXISTS';
            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        IF @ActionId IN (2, 3) AND @CFRUserDetailId IS NULL
        BEGIN
            SET @ResultCode = N'USER_NOT_FOUND';
            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        IF @CFRUserDetailId IS NOT NULL AND @ExpectedRowVersion IS NOT NULL AND @ExpectedRowVersion <> @ExistingRowVersion
        BEGIN
            SET @ResultCode = N'CONCURRENCY_CONFLICT';
            COMMIT TRANSACTION;
            GOTO ReturnResult;
        END

        -- Email-rebind guard: the existing row belongs to a different CFR identity
        -- than the one the (possibly new) email resolves to.
        IF @CFRUserDetailId IS NOT NULL AND @ExistingCFRUserId <> @CFRUserId
        BEGIN
            IF EXISTS (
                SELECT 1 FROM [auth].[UserProduct]
                WHERE [CFRUserId] = @CFRUserId AND [ProductId] = @ProductId AND [OrgId] = @CFROrgId AND [IsDeleted] = 0
            )
            BEGIN
                SET @ResultCode = N'EMAIL_REBIND_CONFLICT';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END
        END

        IF @CFRUserDetailId IS NULL
        BEGIN
            -- Create.
            -- auth.UserProduct has no InsertedBy column (confirmed against the live schema) -
            -- only CreatedDate/UpdatedDate/UpdatedBy exist; who created the row isn't tracked.
            INSERT INTO [auth].[UserProduct]
                ([CFRUserId], [UserId], [ProductId], [OrgId], [OrgName], [FirstName], [LastName], [RoleId],
                 [IsLoginDisabled], [IsActive], [IsDeleted], [CreatedDate])
            VALUES
                (@CFRUserId, @ExternalUserId, @ProductId, @CFROrgId, @OrgName, @FirstName, @LastName, @RoleId,
                 ISNULL(@IsLoginDisabled, 0), ISNULL(@IsActive, 1), 0, SYSUTCDATETIME());

            SET @CFRUserDetailId = SCOPE_IDENTITY();
            SET @Outcome = N'Created';
            SET @Operation = N'Created';
        END
        ELSE
        BEGIN
            SELECT @BeforeJson = (
                SELECT [FirstName], [LastName], [RoleId], [IsLoginDisabled], [IsActive], [IsDeleted]
                FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );

            -- Both PUT and PATCH now always apply the caller's values as a full replace - the
            -- per-field "was it actually supplied" tracking this used to need (@IsFieldSupplied_*)
            -- added parameter-mapping surface no real caller used, so it was removed.
            DECLARE @NewFirstName NVARCHAR(200) = @FirstName,
                    @NewLastName NVARCHAR(200) = @LastName,
                    @NewRoleId INT = @RoleId,
                    @NewIsLoginDisabled BIT = ISNULL(@IsLoginDisabled, 0),
                    @NewIsActive BIT = ISNULL(@IsActive, 1);

            IF @ExistingIsDeleted = 0
               AND @ExistingCFRUserId = @CFRUserId
               AND ISNULL(@NewFirstName, N'') = ISNULL((SELECT [FirstName] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId), N'')
               AND ISNULL(@NewLastName, N'') = ISNULL((SELECT [LastName] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId), N'')
               AND @NewRoleId = (SELECT [RoleId] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId)
               AND @NewIsLoginDisabled = (SELECT [IsLoginDisabled] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId)
               AND @NewIsActive = (SELECT [IsActive] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId)
            BEGIN
                SET @Outcome = N'NoChange';
                SET @Operation = N'NoChange';
            END
            ELSE
            BEGIN
                UPDATE [auth].[UserProduct]
                SET [CFRUserId] = @CFRUserId,
                    [OrgName] = @OrgName,
                    [FirstName] = @NewFirstName,
                    [LastName] = @NewLastName,
                    [RoleId] = @NewRoleId,
                    [IsLoginDisabled] = @NewIsLoginDisabled,
                    [IsActive] = @NewIsActive,
                    [IsDeleted] = 0,
                    [UpdatedDate] = SYSUTCDATETIME(),
                    [UpdatedBy] = @ApiClientId
                WHERE [CFRUserDetailId] = @CFRUserDetailId;

                SET @Outcome = CASE
                    WHEN @ExistingIsDeleted = 1 THEN N'Reactivated'
                    WHEN @ExistingCFRUserId <> @CFRUserId THEN N'Updated'
                    ELSE N'Updated'
                END;
                SET @Operation = CASE WHEN @ExistingCFRUserId <> @CFRUserId THEN N'EmailRebind' ELSE @Outcome END;
            END

            SELECT @AfterJson = (
                SELECT [FirstName], [LastName], [RoleId], [IsLoginDisabled], [IsActive], [IsDeleted]
                FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );
        END

        SELECT @RowVersionOut = [RowVersion] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId;

        INSERT INTO [audit].[UserSyncAudit]
            ([TraceId], [ApiClientId], [ProductId], [Operation], [CFRUserId], [CFRUserDetailId], [Email], [BeforeJson], [AfterJson], [ResultCode], [SourceIp])
        VALUES
            (@TraceId, @ApiClientId, @ProductId, @Operation, @CFRUserId, @CFRUserDetailId, @Email, @BeforeJson, @AfterJson, @ResultCode, @SourceIp);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;

        IF ERROR_NUMBER() IN (2601, 2627) AND @ActionId IN (1, 2, 3)
        BEGIN
            -- Concurrent insert raced us to the same normalized email; re-select and retry
            -- the membership upsert once, non-recursively, by re-invoking this action.
            EXEC [dbo].[Sync_UserProductUpsert]
                @ActionId = @ActionId, @ProductId = @ProductId, @ProductOrgId = @ProductOrgId,
                @ApiClientId = @ApiClientId, @TraceId = @TraceId, @ExternalUserId = @ExternalUserId,
                @Email = @Email, @FirstName = @FirstName, @LastName = @LastName, @RoleId = @RoleId,
                @IsLoginDisabled = @IsLoginDisabled, @IsActive = @IsActive, @PasswordEncrypted = @PasswordEncrypted,
                @ExpectedRowVersion = @ExpectedRowVersion, @SourceIp = @SourceIp;
            RETURN;
        END;

        THROW;
    END CATCH

    ReturnResult:
    SELECT
        @ResultCode AS [ResultCode],
        @CFRUserId AS [CFRUserId],
        @CFRUserDetailId AS [CFRUserDetailId],
        @CFROrgId AS [CFROrgId],
        @Email AS [Email],
        @Outcome AS [Outcome],
        @RowVersionOut AS [RowVersionBytes];
END
GO
