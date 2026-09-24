-- Copyright (c) OptionC. All rights reserved.
-- Adds ActionId 7 (set IsLoginDisabled only) and ActionId 8 (set IsActive only) to
-- [dbo].[Sync_UserProductUpsert], for a product that wants to flip just one of these two
-- flags without resending the whole user payload through the full/partial-update actions
-- (2/3). Mirrors ActionId 5/6's (Deactivate/Reactivate) shape: resolve the org, find the
-- existing row, apply the If-Match RowVersion check, update, audit, return the standard
-- result shape. ActionId 1/2/3/4/5/6 are reproduced unchanged below (T-SQL has no partial
-- ALTER for a procedure body).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Sync_UserProductUpsert]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Sync_UserProductUpsert];
GO

-- Single-user create/update/get/deactivate/reactivate/status-flag for the CFR.DataSync API.
-- Every ActionId resolves @ProductId + @ProductOrgId -> CFROrgId first (via
-- lic.OrganizationProduct); org resolution failure yields ResultCode = ORG_NOT_ONBOARDED
-- for every ActionId, since every route requires productOrgId.
--
-- NOTE: RoleId is stored as an opaque per-product integer with no server-side lookup
-- validation in Phase 1 — no CFR-side catalog of external products' role ids exists in
-- the current schema (only Acutis' own internal auth.AcutisRole, which is unrelated).
-- ROLE_NOT_FOUND is reserved for when/if such a catalog is introduced.
--
-- ActionId 1: Create (POST).            ActionId 5: Deactivate (soft-delete, IsDeleted).
-- ActionId 2: Full update (PUT).        ActionId 6: Reactivate (soft-delete, IsDeleted).
-- ActionId 3: Partial update (PATCH).   ActionId 7: Set IsLoginDisabled only.
-- ActionId 4: Get by external user + org. ActionId 8: Set IsActive only.
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
        -- ActionId 5/6: Deactivate / Reactivate — flip IsDeleted only.
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
        -- ActionId 7/8: Set IsLoginDisabled / IsActive only — leaves the other flag and
        -- IsDeleted untouched. @IsLoginDisabled / @IsActive carry the target value (not a
        -- partial-update fragment) — same parameters ActionId 1/2/3 already use.
        ----------------------------------------------------------------
        IF @ActionId IN (7, 8)
        BEGIN
            DECLARE @FlagExistingRowVersion BINARY(8);
            DECLARE @FlagExistingIsLoginDisabled BIT;
            DECLARE @FlagExistingIsActive BIT;

            SELECT
                @CFRUserId = up.[CFRUserId], @CFRUserDetailId = up.[CFRUserDetailId],
                @FlagExistingRowVersion = up.[RowVersion],
                @FlagExistingIsLoginDisabled = up.[IsLoginDisabled],
                @FlagExistingIsActive = up.[IsActive]
            FROM [auth].[UserProduct] AS up
            WHERE up.[ProductId] = @ProductId AND up.[UserId] = @ExternalUserId
              AND up.[OrgId] = @CFROrgId AND up.[IsDeleted] = 0;

            IF @CFRUserDetailId IS NULL
            BEGIN
                SET @ResultCode = N'USER_NOT_FOUND';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            IF @ExpectedRowVersion IS NOT NULL AND @ExpectedRowVersion <> @FlagExistingRowVersion
            BEGIN
                SET @ResultCode = N'CONCURRENCY_CONFLICT';
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            SELECT @Email = u.[Email] FROM [auth].[User] AS u WHERE u.[CFRUserId] = @CFRUserId;

            IF (@ActionId = 7 AND @FlagExistingIsLoginDisabled = ISNULL(@IsLoginDisabled, 0))
               OR (@ActionId = 8 AND @FlagExistingIsActive = ISNULL(@IsActive, 1))
            BEGIN
                SET @Outcome = N'NoChange';
                SET @RowVersionOut = @FlagExistingRowVersion;
                COMMIT TRANSACTION;
                GOTO ReturnResult;
            END

            SELECT @BeforeJson = (
                SELECT [IsLoginDisabled], [IsActive] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );

            IF @ActionId = 7
            BEGIN
                UPDATE [auth].[UserProduct]
                SET [IsLoginDisabled] = ISNULL(@IsLoginDisabled, 0),
                    [UpdatedDate] = SYSUTCDATETIME(),
                    [UpdatedBy] = @ApiClientId
                WHERE [CFRUserDetailId] = @CFRUserDetailId;

                SET @Outcome = CASE WHEN ISNULL(@IsLoginDisabled, 0) = 1 THEN N'LoginDisabled' ELSE N'LoginEnabled' END;
            END
            ELSE
            BEGIN
                UPDATE [auth].[UserProduct]
                SET [IsActive] = ISNULL(@IsActive, 1),
                    [UpdatedDate] = SYSUTCDATETIME(),
                    [UpdatedBy] = @ApiClientId
                WHERE [CFRUserDetailId] = @CFRUserDetailId;

                SET @Outcome = CASE WHEN ISNULL(@IsActive, 1) = 1 THEN N'MarkedActive' ELSE N'MarkedInactive' END;
            END

            SET @Operation = @Outcome;

            SELECT @RowVersionOut = [RowVersion] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId;

            SELECT @AfterJson = (
                SELECT [IsLoginDisabled], [IsActive] FROM [auth].[UserProduct] WHERE [CFRUserDetailId] = @CFRUserDetailId
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            );

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
            -- Password is set only at identity creation — CFR owns it exclusively from then on,
            -- so a later sync of the same identity never overwrites a password the user may have
            -- already changed inside CFR.
            INSERT INTO [auth].[User] ([Email], [Password], [CreatedDate], [InsertedBy])
            VALUES (@Email, @PasswordEncrypted, SYSUTCDATETIME(), @ApiClientId);

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

            -- Both PUT and PATCH now always apply the caller's values as a full replace — the
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
