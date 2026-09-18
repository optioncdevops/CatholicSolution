-- Copyright (c) OptionC. All rights reserved.
-- CFR.Sync Phase 1 — extends [auth].[UserProduct] for the product/user sync API.
-- Idempotent: safe to re-run against a database that already has these changes.
--
--   1. Adds UpdatedDate, UpdatedBy, RowVersion (rowversion, for If-Match/ETag
--      concurrency), and Status (tinyint: 1=Active 2=Suspended 3=Deactivated).
--   2. Adds the two filtered unique indexes the sync API relies on to avoid
--      duplicate (member, product, org) rows, plus a lookup index by
--      (ProductId, OrgId). None of these constraints exist today — duplicates are
--      currently prevented only by application-level IF EXISTS checks (confirmed:
--      Acutis_Dashboard even carries a "DuplicateActiveUserProductMappings"
--      integrity check specifically because this can and does happen) — so this
--      script raises a descriptive error listing offending rows instead of letting
--      CREATE INDEX fail if duplicates already exist; a human must resolve those
--      rows (soft-delete or merge) before re-running.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1a. UpdatedDate / UpdatedBy / RowVersion / Status.
IF COL_LENGTH(N'[auth].[UserProduct]', N'UpdatedDate') IS NULL
BEGIN
    ALTER TABLE [auth].[UserProduct] ADD [UpdatedDate] DATETIME NULL;
END
GO

IF COL_LENGTH(N'[auth].[UserProduct]', N'UpdatedBy') IS NULL
BEGIN
    ALTER TABLE [auth].[UserProduct] ADD [UpdatedBy] INT NULL;
END
GO

IF COL_LENGTH(N'[auth].[UserProduct]', N'RowVersion') IS NULL
BEGIN
    ALTER TABLE [auth].[UserProduct] ADD [RowVersion] ROWVERSION;
END
GO

IF COL_LENGTH(N'[auth].[UserProduct]', N'Status') IS NULL
BEGIN
    ALTER TABLE [auth].[UserProduct] ADD [Status] TINYINT NOT NULL CONSTRAINT [DF_UserProduct_Status] DEFAULT (1);
END
GO

-- 1b. Backfill Status from the existing IsDeleted flag for any pre-existing rows
-- (new rows default to 1=Active via the column default above).
UPDATE [auth].[UserProduct]
SET [Status] = 3
WHERE [Status] = 1 AND ISNULL([IsDeleted], 0) = 1;
GO

-- 2a. Duplicate-active-row guard for (CFRUserId, ProductId, OrgId).
IF EXISTS (
    SELECT 1
    FROM [auth].[UserProduct]
    WHERE ISNULL([IsDeleted], 0) = 0
    GROUP BY [CFRUserId], [ProductId], [OrgId]
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR(
        N'[auth].[UserProduct] has duplicate active rows for one or more (CFRUserId, ProductId, OrgId) combinations, so UX_UserProduct_User_Product_Org cannot be created. Resolve (soft-delete or merge) the offending rows before re-running this script.',
        16, 1
    );
    RETURN;
END
GO

-- 2b. Duplicate-active-row guard for (ProductId, UserId, OrgId).
IF EXISTS (
    SELECT 1
    FROM [auth].[UserProduct]
    WHERE ISNULL([IsDeleted], 0) = 0
    GROUP BY [ProductId], [UserId], [OrgId]
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR(
        N'[auth].[UserProduct] has duplicate active rows for one or more (ProductId, UserId, OrgId) combinations, so UX_UserProduct_Product_ExternalUser_Org cannot be created. Resolve (soft-delete or merge) the offending rows before re-running this script.',
        16, 1
    );
    RETURN;
END
GO

-- 2c. Filtered unique indexes + lookup index.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_UserProduct_User_Product_Org' AND object_id = OBJECT_ID(N'[auth].[UserProduct]')
)
BEGIN
    CREATE UNIQUE INDEX [UX_UserProduct_User_Product_Org]
        ON [auth].[UserProduct] ([CFRUserId], [ProductId], [OrgId])
        WHERE [IsDeleted] = 0;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_UserProduct_Product_ExternalUser_Org' AND object_id = OBJECT_ID(N'[auth].[UserProduct]')
)
BEGIN
    CREATE UNIQUE INDEX [UX_UserProduct_Product_ExternalUser_Org]
        ON [auth].[UserProduct] ([ProductId], [UserId], [OrgId])
        WHERE [IsDeleted] = 0;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_UserProduct_ProductId_OrgId' AND object_id = OBJECT_ID(N'[auth].[UserProduct]')
)
BEGIN
    CREATE INDEX [IX_UserProduct_ProductId_OrgId] ON [auth].[UserProduct] ([ProductId], [OrgId]);
END
GO
