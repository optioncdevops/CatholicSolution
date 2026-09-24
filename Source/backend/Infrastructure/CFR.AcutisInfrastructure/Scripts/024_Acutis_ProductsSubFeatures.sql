-- 024_Acutis_ProductsSubFeatures.sql

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

DECLARE @ProductsFeatureId INT;
SELECT @ProductsFeatureId = FeatureID FROM [auth].[ModuleFeatures] WHERE MenuCode = N'liAdminProducts' AND IsDeleted = 0;

IF @ProductsFeatureId IS NULL
BEGIN
    RAISERROR(N'Could not find Products module row (liAdminProducts). Aborting.', 16, 1);
    RETURN;
END

-- Drop all existing child features and their rights to ensure a clean slate
DELETE FROM [auth].[ModuleRights] 
WHERE FeatureId IN (SELECT FeatureID FROM [auth].[ModuleFeatures] WHERE ParentId = @ProductsFeatureId);

DELETE FROM [auth].[ModuleFeatures] 
WHERE ParentId = @ProductsFeatureId;

-- Helper table to store features to insert
DECLARE @FeaturesToAdd TABLE (
    SubModule NVARCHAR(100),
    MenuCode NVARCHAR(100),
    RoutingUrl NVARCHAR(256),
    ItemDescription NVARCHAR(256),
    DisplayOrder INT
);

INSERT INTO @FeaturesToAdd (SubModule, MenuCode, RoutingUrl, ItemDescription, DisplayOrder)
VALUES 
    (N'Products details', N'liProductsDetails', N'/admin/product-details', N'View detailed information about a product', 1),
    (N'Edit Products', N'liProductsEdit', N'/admin/edit-products', N'Modify product settings and configurations', 2),
    (N'Organizations', N'liProductsOrganizations', N'/admin/product-organizations', N'View and manage organizations mapped to this product', 3),
    (N'License Details', N'liProductsLicenseDetails', N'/admin/product-license-details', N'Manage active licenses and view license status', 4),
    (N'Create License', N'liProductsCreateLicense', N'/admin/add-product-license', N'Issue a new license for an organization', 5),
    (N'License History', N'liProductsLicenseHistory', N'/admin/product-license-history', N'View historical and expired license records', 6),
    (N'API integration', N'liProductsApiIntegration', N'/admin/product-api-integration', N'Configure API integrations and view credentials', 7);

DECLARE @SubModule NVARCHAR(100);
DECLARE @MenuCode NVARCHAR(100);
DECLARE @RoutingUrl NVARCHAR(256);
DECLARE @ItemDesc NVARCHAR(256);
DECLARE @Order INT;
DECLARE @NewFeatureId INT;

DECLARE cur CURSOR FOR SELECT SubModule, MenuCode, RoutingUrl, ItemDescription, DisplayOrder FROM @FeaturesToAdd ORDER BY DisplayOrder;
OPEN cur;
FETCH NEXT FROM cur INTO @SubModule, @MenuCode, @RoutingUrl, @ItemDesc, @Order;

WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO [auth].[ModuleFeatures]
        (Module, ParentId, SubModule, Activity, MenuCode, RoutingUrl, DisplayOrder,
         HasSubModule, ShowinUserRight, ItemDescription, AccessLevel, SubModule2, SubModuleTabName,
         IsHideMenu, GrandParentId, IsDeleted, MenuIcon)
    SELECT
        Module, @ProductsFeatureId, @SubModule, N'', @MenuCode, @RoutingUrl, @Order,
        0, 1, @ItemDesc, 0, NULL, NULL,
        0, NULL, 0, NULL
    FROM [auth].[ModuleFeatures]
    WHERE FeatureID = @ProductsFeatureId;

    SET @NewFeatureId = SCOPE_IDENTITY();

    -- Grant default 'Access' (AccessRight = 1) to all roles that have access to the parent module
    INSERT INTO [auth].[ModuleRights] (RoleId, FeatureId, AccessRight)
    SELECT RoleId, @NewFeatureId, 1
    FROM [auth].[ModuleRights]
    WHERE FeatureId = @ProductsFeatureId AND IsDeleted = 0;

    PRINT N'Added child feature: ' + @SubModule;

    FETCH NEXT FROM cur INTO @SubModule, @MenuCode, @RoutingUrl, @ItemDesc, @Order;
END

CLOSE cur;
DEALLOCATE cur;
GO
