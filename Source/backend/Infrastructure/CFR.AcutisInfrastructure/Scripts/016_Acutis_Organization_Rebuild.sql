-- Copyright (c) OptionC. All rights reserved.
-- Drops the old [core].[Organization] and [lic].[OrganizationProduct] tables and recreates them
-- with the new schema: Organization.ID is now an INT IDENTITY (was OrgId BIGINT, manually
-- assigned via MAX+1), and OrganizationProduct is redesigned to carry CFROrgId (link to
-- core.Organization.ID) alongside ProductOrgId (the org's ID inside the individual product's own
-- system) plus a full set of product-specific organization fields.
--
-- Real FK constraints found in the live database (not declared anywhere in the repo's scripts —
-- confirmed via sys.foreign_keys) that must be dropped before Organization/OrganizationProduct
-- can be dropped:
--   FK_License_OrganizationProduct     : lic.License.OrganizationProductId -> lic.OrganizationProduct.OrganizationProductId
--   FK_UserProduct_Organization        : auth.UserProduct.OrgId            -> core.Organization.OrgId
--   FK_ProductAccessLog_Organization   : lic.ProductAccessLog.OrgId        -> core.Organization.OrgId
--
-- NOT covered by this script: after Organization/OrganizationProduct are rebuilt, the OrgId /
-- OrganizationProductId values left behind in lic.License, auth.UserProduct, lic.ProductAccessLog,
-- [request].[AccessRequest], and [auth].[OrganizationUser] no longer match anything (new IDs are
-- INT IDENTITY starting at 1, old ones were BIGINT/manually assigned). Dropping the FK constraints
-- below only removes the enforcement — it does not fix or preserve that data. Decide separately
-- whether those tables need to be migrated/remapped, left alone, or rebuilt too.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Drop the FK constraints that block dropping Organization / OrganizationProduct.
IF OBJECT_ID(N'[lic].[FK_License_OrganizationProduct]', N'F') IS NOT NULL
    ALTER TABLE [lic].[License] DROP CONSTRAINT [FK_License_OrganizationProduct];
GO
IF OBJECT_ID(N'[auth].[FK_UserProduct_Organization]', N'F') IS NOT NULL
    ALTER TABLE [auth].[UserProduct] DROP CONSTRAINT [FK_UserProduct_Organization];
GO
IF OBJECT_ID(N'[lic].[FK_ProductAccessLog_Organization]', N'F') IS NOT NULL
    ALTER TABLE [lic].[ProductAccessLog] DROP CONSTRAINT [FK_ProductAccessLog_Organization];
GO

-- 2. Drop the child table first (it logically depends on Organization).
IF OBJECT_ID(N'[lic].[OrganizationProduct]', N'U') IS NOT NULL
    DROP TABLE [lic].[OrganizationProduct];
GO

-- 3. Drop the parent table.
IF OBJECT_ID(N'[core].[Organization]', N'U') IS NOT NULL
    DROP TABLE [core].[Organization];
GO

-- 4. Recreate Organization with the new schema.
CREATE TABLE [core].[Organization]
(
    [ID]              INT IDENTITY(1,1) NOT NULL,

    [OrgName]         NVARCHAR(255) NULL,
    [OrgState]        NVARCHAR(100) NULL,
    [OrgCountry]      NVARCHAR(100) NULL,
    [ContactEmail]    NVARCHAR(255) NULL,
    [Website]         NVARCHAR(500) NULL,
    [ContactPerson]   NVARCHAR(255) NULL,
    [ContactPhone]    NVARCHAR(50) NULL,

    [InsertedDate]    DATETIME NULL,
    [InsertedBy]      INT NULL,
    [UpdatedDate]     DATETIME NULL,
    [UpdatedBy]       INT NULL,
    [IsDeleted]       BIT NOT NULL DEFAULT (0),

    CONSTRAINT [PK_Organization]
        PRIMARY KEY ([ID])
);
GO

-- 5. Recreate OrganizationProduct with the new schema, FK'd to the new Organization.ID.
CREATE TABLE [lic].[OrganizationProduct]
(
    [OrganizationProductId] INT IDENTITY(1,1) NOT NULL,

    -- CFR unique organization/customer ID
    [CFROrgId]              INT NOT NULL,

    -- Organization ID from the individual product
    [ProductOrgId]          INT NOT NULL,

    [ProductId]             INT NOT NULL,

    -- Product-specific organization details
    [OrgName]               NVARCHAR(255) NULL,
    [OrgState]               NVARCHAR(100) NULL,
    [OrgCountry]             NVARCHAR(100) NULL,
    [ContactEmail]           NVARCHAR(255) NULL,
    [Website]                NVARCHAR(500) NULL,
    [ContactPerson]          NVARCHAR(255) NULL,
    [ContactPhone]           NVARCHAR(50) NULL,

    [OrgStatus]              INT NULL,

    [Address]                NVARCHAR(500) NULL,
    [City]                   NVARCHAR(100) NULL,
    [State]                  NVARCHAR(100) NULL,
    [Zip]                    NVARCHAR(20) NULL,

    -- Product access information
    [AssignStatus]           INT NULL,
    [AssignedBy]             INT NULL,
    [Remarks]                NVARCHAR(1000) NULL,
    [ActiveStartDate]        DATETIME NULL,
    [ActiveEndDate]          DATETIME NULL,

    -- Audit
    [CreatedDate]            DATETIME NOT NULL DEFAULT (GETDATE()),
    [InsertedBy]             INT NULL,
    [UpdatedDate]            DATETIME NULL,
    [UpdatedBy]              INT NULL,
    [IsDeleted]              BIT NOT NULL DEFAULT (0),

    CONSTRAINT [PK_OrganizationProduct]
        PRIMARY KEY ([OrganizationProductId]),

    CONSTRAINT [FK_OrganizationProduct_CFROrganization]
        FOREIGN KEY ([CFROrgId])
        REFERENCES [core].[Organization]([ID])
);
GO
