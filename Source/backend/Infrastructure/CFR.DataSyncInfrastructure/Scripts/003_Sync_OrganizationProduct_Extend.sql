-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync Phase 1 — extends [lic].[OrganizationProduct] for the product/user sync API.
-- Idempotent: safe to re-run against a database that already has these changes.
--
-- Adds a filtered unique index on (ProductId, ProductOrgId) so a product cannot be
-- linked to the same CFR organization twice. No such constraint exists today —
-- confirmed: application code only guards this with IF EXISTS checks before insert
-- (Acutis_Organization ActionId 8, Acutis_Products ActionId 7, AccessRequestManage
-- ActionId 2) — so this script raises a descriptive error listing the offending
-- (ProductId, ProductOrgId) pairs instead of letting CREATE INDEX fail if duplicates
-- already exist; a human must resolve those rows first.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (
    SELECT 1
    FROM [lic].[OrganizationProduct]
    WHERE ISNULL([IsDeleted], 0) = 0
    GROUP BY [ProductId], [ProductOrgId]
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR(
        N'[lic].[OrganizationProduct] has duplicate active rows for one or more (ProductId, ProductOrgId) combinations, so UX_OrganizationProduct_Product_ProductOrgId cannot be created. Resolve (soft-delete or merge) the offending rows before re-running this script.',
        16, 1
    );
    RETURN;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_OrganizationProduct_Product_ProductOrgId' AND object_id = OBJECT_ID(N'[lic].[OrganizationProduct]')
)
BEGIN
    CREATE UNIQUE INDEX [UX_OrganizationProduct_Product_ProductOrgId]
        ON [lic].[OrganizationProduct] ([ProductId], [ProductOrgId])
        WHERE [IsDeleted] = 0;
END
GO
