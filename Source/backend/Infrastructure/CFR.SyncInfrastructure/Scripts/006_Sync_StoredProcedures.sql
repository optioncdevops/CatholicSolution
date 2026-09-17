-- Copyright (c) OptionC. All rights reserved.
-- CFR.Sync Phase 1 — stored procedures for HMAC client lookups / replay / idempotency
-- ([sec].[Security_Manage]) and the single-user create/update/get/deactivate/reactivate
-- flow ([dbo].[Sync_UserProductUpsert]). Both follow the repo's one-SP-per-module-surface,
-- @ActionId-discriminated convention (see [dbo].[Acutis_Users] for the reference shape).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[sec].[Security_Manage]', N'P') IS NOT NULL
    DROP PROCEDURE [sec].[Security_Manage];
GO

-- ActionId 1: get an ApiClient by ClientId (HMAC middleware, step 2).
-- ActionId 2: try-insert a (ClientId, Nonce) row (HMAC middleware, step 5). The caller
--             is expected to catch a PK-violation (2627) as "replay detected" — no
--             separate existence check is done here, so the insert itself is the atomic
--             replay guard.
-- ActionId 3: get an idempotency record by (ApiClientId, IdempotencyKey).
-- ActionId 4: save a new idempotency record.
-- ActionId 5: create a new ApiClient row; returns the new ApiClientId via @ReturnValue OUTPUT.
CREATE PROCEDURE [sec].[Security_Manage]
    @ActionId INT,
    @ClientId NVARCHAR(100) = NULL,
    @Nonce NVARCHAR(100) = NULL,
    @ApiClientId INT = NULL,
    @IdempotencyKey NVARCHAR(200) = NULL,
    @RequestHash VARBINARY(32) = NULL,
    @ResponseStatusCode INT = NULL,
    @ResponseBody NVARCHAR(MAX) = NULL,
    @ExpiresDate DATETIME = NULL,
    @ClientSecretEncrypted VARBINARY(200) = NULL,
    @ProductId INT = NULL,
    @DisplayName NVARCHAR(255) = NULL,
    @AllowedScopes NVARCHAR(500) = NULL,
    @RateLimitPerMinute INT = NULL,
    @InsertedBy NVARCHAR(100) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        SELECT
            [ApiClientId], [ClientId], [ClientSecretEncrypted], [ProductId],
            [AllowedScopes], [RateLimitPerMinute], [IsActive],
            [PreviousSecretEncrypted], [PreviousSecretExpiresDate]
        FROM [sec].[ApiClient]
        WHERE [ClientId] = @ClientId;
        RETURN 0;
    END

    IF @ActionId = 2
    BEGIN
        INSERT INTO [sec].[RequestNonce] ([ClientId], [Nonce])
        VALUES (@ClientId, @Nonce);
        RETURN 0;
    END

    IF @ActionId = 3
    BEGIN
        SELECT [ResponseStatusCode], [ResponseBody], [RequestHash]
        FROM [sec].[IdempotencyRecord]
        WHERE [ApiClientId] = @ApiClientId AND [IdempotencyKey] = @IdempotencyKey;
        RETURN 0;
    END

    IF @ActionId = 4
    BEGIN
        INSERT INTO [sec].[IdempotencyRecord]
            ([ApiClientId], [IdempotencyKey], [RequestHash], [ResponseStatusCode], [ResponseBody], [ExpiresDate])
        VALUES
            (@ApiClientId, @IdempotencyKey, @RequestHash, @ResponseStatusCode, @ResponseBody, @ExpiresDate);
        RETURN 0;
    END

    IF @ActionId = 5
    BEGIN
        INSERT INTO [sec].[ApiClient]
            ([ClientId], [ClientSecretEncrypted], [ProductId], [DisplayName], [AllowedScopes], [RateLimitPerMinute], [InsertedBy])
        VALUES
            (@ClientId, @ClientSecretEncrypted, @ProductId, @DisplayName, @AllowedScopes, ISNULL(@RateLimitPerMinute, 60), @InsertedBy);

        SET @ReturnValue = SCOPE_IDENTITY();
        RETURN 0;
    END
END
GO

IF OBJECT_ID(N'[dbo].[Sync_UserProductUpsert]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Sync_UserProductUpsert];
GO

-- Single-user create/update/get/deactivate/reactivate for the CFR.Sync API. Every
-- ActionId resolves @ProductId + @ProductOrgId -> CFROrgId first (via
-- lic.OrganizationProduct); org resolution failure yields ResultCode = ORG_NOT_ONBOARDED
-- for every ActionId, since every route requires productOrgId.
--
-- NOTE: RoleId is stored as an opaque per-product integer with no server-side lookup
-- validation in Phase 1 — no CFR-side catalog of external products' role ids exists in
-- the current schema (only Acutis' own internal auth.AcutisRole, which is unrelated).
-- ROLE_NOT_FOUND is reserved for when/if such a catalog is introduced.
--
-- ActionId 1: Create (POST).            ActionId 4: Get by external user + org.
-- ActionId 2: Full update (PUT).        ActionId 5: Deactivate.
-- ActionId 3: Partial update (PATCH).    ActionId 6: Reactivate.
--
-- Returns exactly one row: ResultCode, CFRUserId, CFRUserDetailId, CFROrgId, Email,
-- Outcome, RowVersionBytes. ResultCode = 'OK' on success; otherwise one of
-- ORG_NOT_ONBOARDED | ORG_INACTIVE | USER_ALREADY_EXISTS | USER_NOT_FOUND |
-- CONCURRENCY_CONFLICT | EMAIL_REBIND_CONFLICT — the C# service layer maps these to
-- SyncErrorCodes / HTTP status.
CREATE PROCEDURE [dbo].[Sync_UserProductUpsert]
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
    @IsFieldSupplied_FirstName BIT = 1,
    @IsFieldSupplied_LastName BIT = 1,
    @IsFieldSupplied_RoleId BIT = 1,
    @IsFieldSupplied_IsLoginDisabled BIT = 1,
    @IsFieldSupplied_IsActive BIT = 1,
    @ExpectedRowVersion BINARY(8) = NULL,
    @SourceIp NVARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @CFROrgId INT;
    DECLARE @OrgName NVARCHAR(255);
    DECLARE @ResultCode NVARCHAR(50) = N'OK';
    DECLARE @CFRUserId BIGINT;
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
        -- ActionId 4: Get — read-only, no identity resolution/creation.
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
        -- ActionId 5/6: Deactivate / Reactivate — flip status only.
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

            -- No Status column — active/inactive is IsDeleted alone (0/1).
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
        -- which the CATCH block below turns into a re-select instead of a failure —
        -- so concurrent bulk rows converge on one identity rather than erroring.
        -- No NormalizedEmail column on auth.User — normalize inline against the raw Email column.
        SELECT @CFRUserId = u.[CFRUserId] FROM [auth].[User] AS u WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = @NormalizedEmail;

        IF @CFRUserId IS NULL
        BEGIN
            INSERT INTO [auth].[User] ([Email], [Password], [CreatedDate], [InsertedBy])
            VALUES (@Email, NULL, SYSUTCDATETIME(), @ApiClientId);

            SET @CFRUserId = SCOPE_IDENTITY();
        END

        -- Existing membership row for this external user, regardless of which CFR
        -- identity it currently points at (needed to detect an email-rebind).
        DECLARE @ExistingCFRUserId BIGINT;
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
            -- auth.UserProduct has no InsertedBy column (confirmed against the live schema) —
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

            DECLARE @NewFirstName NVARCHAR(200), @NewLastName NVARCHAR(200), @NewRoleId INT,
                    @NewIsLoginDisabled BIT, @NewIsActive BIT;

            SELECT
                @NewFirstName = CASE WHEN @IsFieldSupplied_FirstName = 1 THEN @FirstName ELSE [FirstName] END,
                @NewLastName = CASE WHEN @IsFieldSupplied_LastName = 1 THEN @LastName ELSE [LastName] END,
                @NewRoleId = CASE WHEN @IsFieldSupplied_RoleId = 1 THEN @RoleId ELSE [RoleId] END,
                @NewIsLoginDisabled = CASE WHEN @IsFieldSupplied_IsLoginDisabled = 1 THEN ISNULL(@IsLoginDisabled, 0) ELSE [IsLoginDisabled] END,
                @NewIsActive = CASE WHEN @IsFieldSupplied_IsActive = 1 THEN ISNULL(@IsActive, 1) ELSE [IsActive] END
            FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId;

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
                @IsLoginDisabled = @IsLoginDisabled, @IsActive = @IsActive,
                @IsFieldSupplied_FirstName = @IsFieldSupplied_FirstName,
                @IsFieldSupplied_LastName = @IsFieldSupplied_LastName,
                @IsFieldSupplied_RoleId = @IsFieldSupplied_RoleId,
                @IsFieldSupplied_IsLoginDisabled = @IsFieldSupplied_IsLoginDisabled,
                @IsFieldSupplied_IsActive = @IsFieldSupplied_IsActive,
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
