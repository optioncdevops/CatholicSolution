-- Copyright (c) OptionC. All rights reserved.
-- "Suggest a product" public request/approval workflow - TABLES ONLY.
-- A visitor on the CFR site submits a proposed product (no login required); it lands here as a
-- pending row, NOT in [core].[Product]. An admin reviews pending rows and Approves or Rejects.
-- Approving copies the request into the real catalog: a new [core].[Product] row + its
-- [core].[ProductFeature] rows - see 022_Acutis_ProductRequest_StoredProcedure.sql.
--
-- Tables (schema [request], alongside [request].[AccessRequest*] from 008_AccessRequest.sql):
--   [request].[ProductRequest]              - header: one row per submitted suggestion
--   [request].[ProductRequestFeature]       - child: normalized feature list for a request
--   [request].[ProductRequestStatusHistory] - audit trail of status changes (submitted/approved/rejected)
--
-- RequestStatus / StatusValue enum: 1 = pending, 2 = approved, 3 = rejected.
--
-- Run BEFORE 022_Acutis_ProductRequest_StoredProcedure.sql (the stored procedure references these tables).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

---------------------------------------------------------------------------
-- Tables (idempotent - create only if missing)
---------------------------------------------------------------------------
IF OBJECT_ID(N'[request].[ProductRequest]', N'U') IS NULL
BEGIN
    CREATE TABLE [request].[ProductRequest]
    (
        [ProductRequestId]  INT IDENTITY(1,1) NOT NULL,

        -- Proposed product fields (same shape as [core].[Product])
        [ProductName]       NVARCHAR(200) NOT NULL,
        [ShortName]         NVARCHAR(100) NULL,
        [SubCategoryName]   NVARCHAR(200) NULL,
        [ProdDescription]   NVARCHAR(MAX) NOT NULL,
        [ExternalPageUrl]   NVARCHAR(500) NULL,
        [NavigationTarget]  NVARCHAR(50) NULL,

        -- Who submitted it (public form - no login, so no CFRUserId to stamp)
        [RequesterName]     NVARCHAR(200) NOT NULL,
        [RequesterEmail]    NVARCHAR(256) NOT NULL,
        [OrganizationName]  NVARCHAR(200) NULL,

        -- Review / approval
        [RequestStatus]     INT NOT NULL DEFAULT (1), -- 1=pending, 2=approved, 3=rejected
        [ReviewedBy]        BIGINT NULL,
        [ReviewedDate]      DATETIME2 NULL,
        [DecisionRemarks]   NVARCHAR(1000) NULL,
        [ApprovedProductId] INT NULL, -- set to the new core.Product.ProductId once approved

        -- Audit
        [InsertedDate]      DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        [InsertedBy]        BIGINT NULL,
        [UpdatedDate]       DATETIME2 NULL,
        [UpdatedBy]         BIGINT NULL,
        [IsDeleted]         BIT NOT NULL DEFAULT (0),

        CONSTRAINT [PK_ProductRequest]
            PRIMARY KEY ([ProductRequestId]),

        CONSTRAINT [FK_ProductRequest_Product]
            FOREIGN KEY ([ApprovedProductId])
            REFERENCES [core].[Product]([ProductId])
    );
END
GO

IF OBJECT_ID(N'[request].[ProductRequestFeature]', N'U') IS NULL
BEGIN
    CREATE TABLE [request].[ProductRequestFeature]
    (
        [ProductRequestFeatureId] INT IDENTITY(1,1) NOT NULL,
        [ProductRequestId]        INT NOT NULL,
        [FeatureName]             NVARCHAR(200) NOT NULL,

        [InsertedDate]            DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        [IsDeleted]               BIT NOT NULL DEFAULT (0),

        CONSTRAINT [PK_ProductRequestFeature]
            PRIMARY KEY ([ProductRequestFeatureId]),

        CONSTRAINT [FK_ProductRequestFeature_ProductRequest]
            FOREIGN KEY ([ProductRequestId])
            REFERENCES [request].[ProductRequest]([ProductRequestId])
    );
END
GO

IF OBJECT_ID(N'[request].[ProductRequestStatusHistory]', N'U') IS NULL
BEGIN
    CREATE TABLE [request].[ProductRequestStatusHistory]
    (
        [StatusHistoryId]   INT IDENTITY(1,1) NOT NULL,
        [ProductRequestId]  INT NOT NULL,
        [StatusValue]       INT NOT NULL, -- 1=submitted, 2=approved, 3=rejected
        [Remarks]           NVARCHAR(500) NULL,
        [ChangedBy]         BIGINT NULL, -- NULL for the initial public submission

        [InsertedDate]      DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT [PK_ProductRequestStatusHistory]
            PRIMARY KEY ([StatusHistoryId]),

        CONSTRAINT [FK_ProductRequestStatusHistory_ProductRequest]
            FOREIGN KEY ([ProductRequestId])
            REFERENCES [request].[ProductRequest]([ProductRequestId])
    );
END
GO
