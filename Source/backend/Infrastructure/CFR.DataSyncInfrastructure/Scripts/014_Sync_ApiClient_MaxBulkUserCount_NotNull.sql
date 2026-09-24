-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync Phase 1 — sec.ApiClient.MaxBulkUserCount becomes the sole source of truth for the
-- bulk-user-sync row cap (the SyncSettings:MaxBulkUserCount platform-default fallback in
-- appsettings.json is removed on the application side by this same change).
-- Idempotent: safe to re-run against a database that already has these changes.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Backfill any row that still has no override — 500 matches the removed platform default.
UPDATE [sec].[ApiClient] SET [MaxBulkUserCount] = 500 WHERE [MaxBulkUserCount] IS NULL;
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[sec].[ApiClient]') AND name = N'MaxBulkUserCount' AND is_nullable = 1
)
BEGIN
    ALTER TABLE [sec].[ApiClient] ALTER COLUMN [MaxBulkUserCount] INT NOT NULL;
END
GO

-- A NOT NULL column with no default would fail any future INSERT that omits it — this keeps
-- ActionId 5's ISNULL(@MaxBulkUserCount, 500) fallback (added below) backed by a real DB default too.
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints dc
    JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'[sec].[ApiClient]') AND c.name = N'MaxBulkUserCount'
)
BEGIN
    ALTER TABLE [sec].[ApiClient] ADD CONSTRAINT [DF_ApiClient_MaxBulkUserCount] DEFAULT (500) FOR [MaxBulkUserCount];
END
GO

-- ActionId 1: get an ApiClient by ClientId (HMAC middleware, step 2) — MaxBulkUserCount is now
--             always a real value (NOT NULL), the sole source for the bulk-sync row cap.
-- ActionId 2: try-insert a (ClientId, Nonce) row (HMAC middleware, step 5). The caller
--             is expected to catch a PK-violation (2627) as "replay detected" — no
--             separate existence check is done here, so the insert itself is the atomic
--             replay guard.
-- ActionId 3: get an idempotency record by (ApiClientId, IdempotencyKey).
-- ActionId 4: save a new idempotency record.
-- ActionId 5: create a new ApiClient row; returns the new ApiClientId via @ReturnValue OUTPUT.
--             @MaxBulkUserCount falls back to 500 when omitted, same as @RateLimitPerMinute's
--             fallback to 60 — the column itself also carries that default for any other insert path.
CREATE OR ALTER PROCEDURE [sec].[Security_Manage]
    @ActionId INT,
    @ClientId NVARCHAR(100) = NULL,
    @Nonce NVARCHAR(100) = NULL,
    @ApiClientId INT = NULL,
    @IdempotencyKey NVARCHAR(200) = NULL,
    @RequestHash VARBINARY(32) = NULL,
    @ResponseStatusCode INT = NULL,
    @ResponseBody NVARCHAR(MAX) = NULL,
    @ExpiresDate DATETIME = NULL,
    @ClientSecret NVARCHAR(200) = NULL,
    @ProductId INT = NULL,
    @DisplayName NVARCHAR(255) = NULL,
    @RateLimitPerMinute INT = NULL,
    @MaxBulkUserCount INT = NULL,
    @InsertedBy NVARCHAR(100) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        SELECT
            [ApiClientId], [ClientId], [ClientSecret], [ProductId],
            [RateLimitPerMinute], [MaxBulkUserCount], [IsActive]
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
            ([ClientId], [ClientSecret], [ProductId], [DisplayName], [RateLimitPerMinute], [MaxBulkUserCount], [InsertedBy])
        VALUES
            (@ClientId, @ClientSecret, @ProductId, @DisplayName, ISNULL(@RateLimitPerMinute, 60), ISNULL(@MaxBulkUserCount, 500), @InsertedBy);

        SET @ReturnValue = SCOPE_IDENTITY();
        RETURN 0;
    END
END
GO
