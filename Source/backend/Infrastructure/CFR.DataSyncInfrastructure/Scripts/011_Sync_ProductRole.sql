-- Copyright (c) OptionC. All rights reserved.
-- Product role catalog — closes the gap [dbo].[Sync_UserProductUpsert] already called out
-- ("no CFR-side catalog of external products' role ids exists in the current schema").
-- Lets a product register/self-declare which opaque RoleId values it uses and their display
-- names, then read that list back — e.g. to populate a role dropdown, or to validate a
-- roleId before pushing a user. RoleId here is the same opaque per-product integer already
-- stored on [auth].[UserProduct].[RoleId] — this table does not change that column or add
-- FK enforcement to it (Phase 1, same as Sync_UserProductUpsert's own note).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[core].[ProductRole]', N'U') IS NULL
BEGIN
    CREATE TABLE [core].[ProductRole]
    (
        [ProductRoleId] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ProductRole] PRIMARY KEY,
        [ProductId] INT NOT NULL CONSTRAINT [FK_ProductRole_Product] REFERENCES [core].[Product]([ProductId]),
        [RoleId] INT NOT NULL,
        [RoleName] NVARCHAR(200) NOT NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT [DF_ProductRole_IsDeleted] DEFAULT (0),
        [CreatedDate] DATETIME2(7) NOT NULL CONSTRAINT [DF_ProductRole_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [UpdatedDate] DATETIME2(7) NULL
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_ProductRole_ProductId_RoleId' AND object_id = OBJECT_ID(N'[core].[ProductRole]')
)
BEGIN
    -- One active row per (ProductId, RoleId) — a soft-deleted row doesn't block re-adding the
    -- same RoleId, matching the IsDeleted-filtered-unique pattern used elsewhere in this schema.
    CREATE UNIQUE INDEX [UX_ProductRole_ProductId_RoleId] ON [core].[ProductRole] ([ProductId], [RoleId])
    WHERE [IsDeleted] = 0;
END
GO

IF OBJECT_ID(N'[dbo].[Sync_ProductRole]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Sync_ProductRole];
GO

-- ActionId 1: Upsert one role row for the calling product (insert, or rename if RoleId already
--             exists for that ProductId). ActionId 2: List active roles for the calling product.
CREATE PROCEDURE [dbo].[Sync_ProductRole]
    @ActionId INT,
    @ProductId INT,
    @RoleId INT = NULL,
    @RoleName NVARCHAR(200) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;

    IF @ActionId = 1
    BEGIN
        IF EXISTS (
            SELECT 1 FROM [core].[ProductRole]
            WHERE [ProductId] = @ProductId AND [RoleId] = @RoleId AND [IsDeleted] = 0
        )
        BEGIN
            UPDATE [core].[ProductRole]
            SET [RoleName] = @RoleName,
                [UpdatedDate] = SYSUTCDATETIME()
            WHERE [ProductId] = @ProductId AND [RoleId] = @RoleId AND [IsDeleted] = 0;

            SET @ReturnValue = 1;
            RETURN @ReturnValue;
        END

        INSERT INTO [core].[ProductRole] ([ProductId], [RoleId], [RoleName])
        VALUES (@ProductId, @RoleId, @RoleName);

        SET @ReturnValue = CAST(SCOPE_IDENTITY() AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 2
    BEGIN
        SELECT [RoleId], [RoleName]
        FROM [core].[ProductRole]
        WHERE [ProductId] = @ProductId AND [IsDeleted] = 0
        ORDER BY [RoleId];
        RETURN 0;
    END
END
GO
