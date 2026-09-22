-- Copyright (c) OptionC. All rights reserved.
-- "Suggest a product" public request/approval workflow. A visitor on the CFR site submits a
-- proposed product (no login required); it lands here as a pending row, NOT in [core].[Product].
-- An admin reviews pending rows and Approves or Rejects. Approving copies the request into the
-- real catalog: a new [core].[Product] row + its [core].[ProductFeature] rows, exactly mirroring
-- how 010_Acutis_Products.sql's ActionId 3 (Product PUT) writes features - soft-delete/reinsert of
-- normalized child rows, not a delimited string column.
--
-- Tables (schema [request], alongside [request].[AccessRequest*] from 008_AccessRequest.sql):
--   [request].[ProductRequest]             - header: one row per submitted suggestion
--   [request].[ProductRequestFeature]      - child: normalized feature list for a request
--   [request].[ProductRequestStatusHistory] - audit trail of status changes (submitted/approved/rejected)
--
-- RequestStatus / StatusValue enum: 1 = pending, 2 = approved, 3 = rejected.
--
-- Stored procedure [dbo].[Acutis_ProductRequest] ActionId map:
--   ActionId 1: Insert a new product request (public submit, no @InsertedBy - anonymous)
--   ActionId 2: GET All product requests (admin review list), optional @RequestStatus filter
--   ActionId 3: GET by Id (header + features), for the admin review/detail view
--   ActionId 4: Approve - transaction: insert into [core].[Product] + [core].[ProductFeature],
--               mark the request approved, link it to the new ProductId
--   ActionId 5: Reject - mark the request rejected with a reason, no catalog changes
--   ActionId 6: GET notification recipients - who to email when a request comes in. Placeholder
--               fallback to the 'Platform Admin' role (same fallback 008_AccessRequest.sql's
--               ActionId 5 uses for products with no contact set) until the real recipient(s) are
--               decided - swap the WHERE clause once that's confirmed.
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

---------------------------------------------------------------------------
-- Stored procedure
---------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[Acutis_ProductRequest]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_ProductRequest];
GO

CREATE PROCEDURE [dbo].[Acutis_ProductRequest]
    @ActionId INT,
    -- Product request parameters
    @ProductRequestId INT = 0,
    @ProductName NVARCHAR(200) = NULL,
    @ShortName NVARCHAR(100) = NULL,
    @SubCategoryName NVARCHAR(200) = NULL,
    @ProdDescription NVARCHAR(MAX) = NULL,
    @ExternalPageUrl NVARCHAR(500) = NULL,
    @NavigationTarget NVARCHAR(50) = NULL,
    @Features NVARCHAR(MAX) = NULL, -- pipe-delimited, same wire format as Acutis_Products
    @RequesterName NVARCHAR(200) = NULL,
    @RequesterEmail NVARCHAR(256) = NULL,
    @OrganizationName NVARCHAR(200) = NULL,
    @RequestStatus INT = NULL,
    @DecisionRemarks NVARCHAR(1000) = NULL,
    -- Audit & output parameters
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @ProductName = NULLIF(LTRIM(RTRIM(@ProductName)), N'');
    SET @ShortName = NULLIF(LTRIM(RTRIM(@ShortName)), N'');
    SET @SubCategoryName = NULLIF(LTRIM(RTRIM(@SubCategoryName)), N'');
    SET @ProdDescription = NULLIF(LTRIM(RTRIM(@ProdDescription)), N'');
    SET @ExternalPageUrl = NULLIF(LTRIM(RTRIM(@ExternalPageUrl)), N'');
    SET @NavigationTarget = NULLIF(LTRIM(RTRIM(@NavigationTarget)), N'');
    SET @RequesterName = NULLIF(LTRIM(RTRIM(@RequesterName)), N'');
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');
    SET @OrganizationName = NULLIF(LTRIM(RTRIM(@OrganizationName)), N'');
    SET @DecisionRemarks = NULLIF(LTRIM(RTRIM(@DecisionRemarks)), N'');

    ---------------------------------------------------------------------------
    -- ActionId 1: Insert a new product request (public submit)
    ---------------------------------------------------------------------------
    IF @ActionId = 1
    BEGIN
        IF @ProductName IS NULL OR @ProdDescription IS NULL OR @RequesterName IS NULL OR @RequesterEmail IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        DECLARE @NewRequestId INT;

        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO [request].[ProductRequest]
            (
                [ProductName], [ShortName], [SubCategoryName], [ProdDescription], [ExternalPageUrl],
                [NavigationTarget], [RequesterName], [RequesterEmail], [OrganizationName],
                [RequestStatus], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @ProductName, @ShortName, @SubCategoryName, @ProdDescription, @ExternalPageUrl,
                @NavigationTarget, @RequesterName, @RequesterEmail, @OrganizationName,
                1, SYSUTCDATETIME(), @InsertedBy, 0
            );

            SET @NewRequestId = SCOPE_IDENTITY();

            IF @Features IS NOT NULL
            BEGIN
                INSERT INTO [request].[ProductRequestFeature]
                (
                    [ProductRequestId], [FeatureName], [InsertedDate], [IsDeleted]
                )
                SELECT
                    @NewRequestId,
                    LTRIM(RTRIM(value)),
                    SYSUTCDATETIME(),
                    0
                FROM STRING_SPLIT(@Features, '|')
                WHERE LTRIM(RTRIM(value)) <> N'';
            END

            INSERT INTO [request].[ProductRequestStatusHistory]
            (
                [ProductRequestId], [StatusValue], [Remarks], [ChangedBy], [InsertedDate]
            )
            VALUES
            (
                @NewRequestId, 1, N'Request submitted', NULL, SYSUTCDATETIME()
            );

            COMMIT TRANSACTION;
            SET @ReturnValue = @NewRequestId;
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    ---------------------------------------------------------------------------
    -- ActionId 2: GET All product requests (admin review list)
    ---------------------------------------------------------------------------
    IF @ActionId = 2
    BEGIN
        SELECT
            r.[ProductRequestId],
            r.[ProductName],
            r.[ShortName],
            r.[SubCategoryName],
            r.[ProdDescription],
            r.[ExternalPageUrl],
            r.[NavigationTarget],
            r.[RequesterName],
            r.[RequesterEmail],
            r.[OrganizationName],
            r.[RequestStatus],
            r.[ReviewedBy],
            r.[ReviewedDate],
            r.[DecisionRemarks],
            r.[ApprovedProductId],
            r.[InsertedDate]
        FROM [request].[ProductRequest] AS r
        WHERE r.[IsDeleted] = 0
          AND (@RequestStatus IS NULL OR r.[RequestStatus] = @RequestStatus)
        ORDER BY r.[InsertedDate] DESC;

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 3: GET by Id (header + features)
    ---------------------------------------------------------------------------
    IF @ActionId = 3
    BEGIN
        SELECT
            r.[ProductRequestId],
            r.[ProductName],
            r.[ShortName],
            r.[SubCategoryName],
            r.[ProdDescription],
            r.[ExternalPageUrl],
            r.[NavigationTarget],
            r.[RequesterName],
            r.[RequesterEmail],
            r.[OrganizationName],
            r.[RequestStatus],
            r.[ReviewedBy],
            r.[ReviewedDate],
            r.[DecisionRemarks],
            r.[ApprovedProductId],
            r.[InsertedDate]
        FROM [request].[ProductRequest] AS r
        WHERE r.[ProductRequestId] = @ProductRequestId
          AND r.[IsDeleted] = 0;

        SELECT
            f.[FeatureName]
        FROM [request].[ProductRequestFeature] AS f
        WHERE f.[ProductRequestId] = @ProductRequestId
          AND f.[IsDeleted] = 0
        ORDER BY f.[ProductRequestFeatureId];

        RETURN 0;
    END

    ---------------------------------------------------------------------------
    -- ActionId 4: Approve - copy the request into [core].[Product] / [core].[ProductFeature]
    ---------------------------------------------------------------------------
    IF @ActionId = 4
    BEGIN
        DECLARE @ExistingStatus INT;
        DECLARE @ApproveProductName NVARCHAR(200);
        DECLARE @ApproveShortName NVARCHAR(100);
        DECLARE @ApproveSubCategoryName NVARCHAR(200);
        DECLARE @ApproveProdDescription NVARCHAR(MAX);
        DECLARE @ApproveExternalPageUrl NVARCHAR(500);
        DECLARE @ApproveNavigationTarget NVARCHAR(50);
        DECLARE @NewProductId INT;

        SELECT
            @ExistingStatus = r.[RequestStatus],
            @ApproveProductName = r.[ProductName],
            @ApproveShortName = r.[ShortName],
            @ApproveSubCategoryName = r.[SubCategoryName],
            @ApproveProdDescription = r.[ProdDescription],
            @ApproveExternalPageUrl = r.[ExternalPageUrl],
            @ApproveNavigationTarget = r.[NavigationTarget]
        FROM [request].[ProductRequest] AS r
        WHERE r.[ProductRequestId] = @ProductRequestId
          AND r.[IsDeleted] = 0;

        IF @ExistingStatus IS NULL OR @ExistingStatus <> 1
        BEGIN
            SET @ReturnValue = -95; -- not found, or already reviewed
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1 FROM [core].[Product]
            WHERE LOWER(LTRIM(RTRIM([ProductName]))) = LOWER(@ApproveProductName)
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99; -- a product with this name already exists
            RETURN @ReturnValue;
        END

        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO [core].[Product]
            (
                [ProductName], [ShortName], [SubCategoryName], [ProdDescription], [ExternalPageUrl],
                [IsActive], [ProductStatus], [NavigationTarget], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @ApproveProductName, @ApproveShortName, @ApproveSubCategoryName, @ApproveProdDescription,
                @ApproveExternalPageUrl, 1, 1, @ApproveNavigationTarget, SYSUTCDATETIME(), @UpdatedBy, 0
            );

            SET @NewProductId = SCOPE_IDENTITY();

            INSERT INTO [core].[ProductFeature]
            (
                [ProductId], [FeatureName], [IsActive], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            SELECT
                @NewProductId,
                f.[FeatureName],
                1,
                SYSUTCDATETIME(),
                @UpdatedBy,
                0
            FROM [request].[ProductRequestFeature] AS f
            WHERE f.[ProductRequestId] = @ProductRequestId
              AND f.[IsDeleted] = 0;

            UPDATE [request].[ProductRequest]
            SET
                [RequestStatus] = 2,
                [ReviewedBy] = @UpdatedBy,
                [ReviewedDate] = SYSUTCDATETIME(),
                [DecisionRemarks] = @DecisionRemarks,
                [ApprovedProductId] = @NewProductId,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [ProductRequestId] = @ProductRequestId;

            INSERT INTO [request].[ProductRequestStatusHistory]
            (
                [ProductRequestId], [StatusValue], [Remarks], [ChangedBy], [InsertedDate]
            )
            VALUES
            (
                @ProductRequestId, 2, @DecisionRemarks, @UpdatedBy, SYSUTCDATETIME()
            );

            COMMIT TRANSACTION;
            SET @ReturnValue = @NewProductId;
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    ---------------------------------------------------------------------------
    -- ActionId 5: Reject - no catalog changes, just records the decision
    ---------------------------------------------------------------------------
    IF @ActionId = 5
    BEGIN
        IF @ProductRequestId <= 0 OR NOT EXISTS (
            SELECT 1 FROM [request].[ProductRequest]
            WHERE [ProductRequestId] = @ProductRequestId
              AND [RequestStatus] = 1
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -95; -- not found, or already reviewed
            RETURN @ReturnValue;
        END

        UPDATE [request].[ProductRequest]
        SET
            [RequestStatus] = 3,
            [ReviewedBy] = @UpdatedBy,
            [ReviewedDate] = SYSUTCDATETIME(),
            [DecisionRemarks] = @DecisionRemarks,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [ProductRequestId] = @ProductRequestId;

        INSERT INTO [request].[ProductRequestStatusHistory]
        (
            [ProductRequestId], [StatusValue], [Remarks], [ChangedBy], [InsertedDate]
        )
        VALUES
        (
            @ProductRequestId, 3, @DecisionRemarks, @UpdatedBy, SYSUTCDATETIME()
        );

        SET @ReturnValue = @ProductRequestId;
        RETURN @ReturnValue;
    END

    ---------------------------------------------------------------------------
    -- ActionId 6: GET notification recipients for a new product request.
    -- PLACEHOLDER: falls back to the 'Platform Admin' role, same as
    -- 008_AccessRequest.sql's ActionId 5 fallback (there's no product/contact to check yet
    -- since the product doesn't exist until approval) - swap this once the real recipient(s)
    -- are decided.
    ---------------------------------------------------------------------------
    IF @ActionId = 6
    BEGIN
        SELECT DISTINCT LTRIM(RTRIM(u.[Email])) AS [EMail]
        FROM [auth].[AcutisUser] u
        INNER JOIN [auth].[AcutisRole] r
            ON r.[RoleId] = u.[RoleId]
           AND r.[IsDeleted] = 0
        WHERE u.[IsDeleted] = 0
          AND u.[IsActive] = 1
          AND u.[IsLocked] = 0
          AND r.[RoleName] = N'Platform Admin'
          AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;

        RETURN 0;
    END
END
GO
