-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync Phase 1 — adds a per-ApiClient override for the bulk-user-sync row cap.
-- Idempotent: safe to re-run against a database that already has these changes.
--
-- [sec].[ApiClient].[MaxBulkUserCount] is nullable: NULL means "use the platform default"
-- (SyncSettings:MaxBulkUserCount in appsettings.json); a non-NULL value overrides it for that
-- one product client (e.g. a client doing a larger one-time migration).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH(N'[sec].[ApiClient]', N'MaxBulkUserCount') IS NULL
BEGIN
    ALTER TABLE [sec].[ApiClient] ADD [MaxBulkUserCount] INT NULL;
END
GO

-- ActionId 1: get an ApiClient by ClientId (HMAC middleware, step 2) — now also returns
--             MaxBulkUserCount so the caller can fall back to the platform default when NULL.
-- ActionId 2: try-insert a (ClientId, Nonce) row (HMAC middleware, step 5). The caller
--             is expected to catch a PK-violation (2627) as "replay detected" — no
--             separate existence check is done here, so the insert itself is the atomic
--             replay guard.
-- ActionId 3: get an idempotency record by (ApiClientId, IdempotencyKey).
-- ActionId 4: save a new idempotency record.
-- ActionId 5: create a new ApiClient row; returns the new ApiClientId via @ReturnValue OUTPUT.
--             @MaxBulkUserCount is optional and stored as-is (NULL = no override, unlike
--             @RateLimitPerMinute which defaults to 60 when omitted).
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
            (@ClientId, @ClientSecret, @ProductId, @DisplayName, ISNULL(@RateLimitPerMinute, 60), @MaxBulkUserCount, @InsertedBy);

        SET @ReturnValue = SCOPE_IDENTITY();
        RETURN 0;
    END
END
GO
