-- 023_Acutis_MenuUpdates.sql
-- All CFR Admin menu changes for the product-suggestion feature, in one script:
--   1) Adds/normalizes "SaaS Request" as its own standalone TOP-LEVEL menu item (ParentId = NULL,
--      same level as Dashboard / Products / Organizations / Requests / CFR User / Administration),
--      routing to /admin/product-requests (the product-suggestion review page). If a row from an
--      earlier version of this script already exists under any of its prior names/codes
--      ('liAdminProductRequests', 'liSaaSRequests', 'liProductRequest'), it's normalized in place
--      to this final name/code rather than creating a duplicate. Otherwise a fresh row is
--      inserted, cloning structural columns from the existing "Products" top-level row (same
--      shape: a plain top-level item routing straight to a list page) so nothing here is invented.
--   2) The existing Access Requests menu (RoutingUrl = /admin/requests) is relabeled
--      "Product Request". Its RoutingUrl, position, and role grants are unchanged - it still
--      shows the same Access Requests page, only the nav label changes.
--   3) Adds "CFR Settings" as a new Administration submenu entry, routing to
--      /admin/administration-cfr-settings - a real page exists at that route
--      (src/modules/administration/cfrSettings/pages/CfrSettingsPage.tsx): it loads Acutis
--      users into a single dropdown. Cloned from the existing "Email Templates" row's
--      structural columns, same way 013_Acutis_EmailSettingsMenu.sql added Email Settings.
-- Requires 021/022 (tables + stored procedure) to have already been run.
-- Idempotent — safe to re-run.

SET NOCOUNT ON;

---------------------------------------------------------------------------
-- 1) "SaaS Request" standalone top-level item
---------------------------------------------------------------------------
DECLARE @ProductsTemplateFeatureId INT;
DECLARE @SaaSRequestFeatureId INT;
DECLARE @NewFeatureId INT;
DECLARE @NextTopLevelDisplayOrder INT;

-- "Products" is an existing top-level item with the same shape we want (ParentId = NULL, routes
-- straight to its own list page) - clone its structural columns instead of guessing them.
-- The frontend's normalizeMenuPath() remaps the legacy '/admin/applications' URL to
-- '/admin/products' at render time, so the row stored in the database may still say the old
-- path - match either.
SELECT @ProductsTemplateFeatureId = FeatureID
FROM [auth].[ModuleFeatures]
WHERE RoutingUrl IN (N'/admin/products', N'/admin/applications') AND ISNULL(ParentId, 0) = 0 AND IsDeleted = 0;

IF @ProductsTemplateFeatureId IS NULL
BEGIN
    RAISERROR(N'Could not find the top-level "Products" row (RoutingUrl = ''/admin/products'' or ''/admin/applications'', ParentId = 0) in auth.ModuleFeatures — needed as the structural template. Aborting.', 16, 1);
    RETURN;
END

SELECT @NextTopLevelDisplayOrder = ISNULL(MAX(DisplayOrder), 0) + 1
FROM [auth].[ModuleFeatures]
WHERE ISNULL(ParentId, 0) = 0 AND IsDeleted = 0;

-- Find any earlier row from a prior version of this script, by any of its historical MenuCodes.
SELECT @SaaSRequestFeatureId = FeatureID
FROM [auth].[ModuleFeatures]
WHERE MenuCode IN (N'liAdminProductRequests', N'liSaaSRequests', N'liProductRequest', N'liSaaSRequest')
  AND IsDeleted = 0;

IF @SaaSRequestFeatureId IS NOT NULL
BEGIN
    UPDATE [auth].[ModuleFeatures]
    SET ParentId = NULL,
        SubModule = N'SaaS Request',
        MenuCode = N'liSaaSRequest',
        RoutingUrl = N'/admin/product-requests',
        MenuIcon = N'Package'
    WHERE FeatureID = @SaaSRequestFeatureId;

    PRINT N'Normalized SaaS Request (FeatureID = ' + CAST(@SaaSRequestFeatureId AS NVARCHAR(20)) + N') as a top-level menu item.';
END
ELSE
BEGIN
    -- Clone the Products row's structural columns; only override what must genuinely differ.
    INSERT INTO [auth].[ModuleFeatures]
        (Module, ParentId, SubModule, Activity, MenuCode, RoutingUrl, DisplayOrder,
         HasSubModule, ShowinUserRight, ItemDescription, AccessLevel, SubModule2, SubModuleTabName,
         IsHideMenu, GrandParentId, IsDeleted, MenuIcon)
    SELECT
        Module, NULL, N'SaaS Request', Activity, N'liSaaSRequest', N'/admin/product-requests', @NextTopLevelDisplayOrder,
        HasSubModule, ShowinUserRight, N'Review and approve or reject publicly suggested products before they join the catalog.', AccessLevel, SubModule2, SubModuleTabName,
        IsHideMenu, GrandParentId, 0, N'Package'
    FROM [auth].[ModuleFeatures]
    WHERE FeatureID = @ProductsTemplateFeatureId;

    SET @SaaSRequestFeatureId = SCOPE_IDENTITY();

    -- Grant the same per-role access Products already has, rather than guessing AccessRight values.
    INSERT INTO [auth].[ModuleRights] (RoleId, FeatureId, AccessRight)
    SELECT RoleId, @SaaSRequestFeatureId, AccessRight
    FROM [auth].[ModuleRights]
    WHERE FeatureId = @ProductsTemplateFeatureId;

    PRINT N'Added SaaS Request (FeatureID = ' + CAST(@SaaSRequestFeatureId AS NVARCHAR(20)) + N') as a top-level menu item.';
END

---------------------------------------------------------------------------
-- 2) The existing Access Requests menu -> "Product Request"
---------------------------------------------------------------------------
DECLARE @AccessRequestsFeatureId INT;

SELECT @AccessRequestsFeatureId = FeatureID
FROM [auth].[ModuleFeatures]
WHERE RoutingUrl = N'/admin/requests' AND ISNULL(ParentId, 0) = 0 AND IsDeleted = 0;

IF @AccessRequestsFeatureId IS NULL
BEGIN
    RAISERROR(N'Could not find the top-level Access Requests row (RoutingUrl = ''/admin/requests'', ParentId = 0) in auth.ModuleFeatures. Aborting.', 16, 1);
    RETURN;
END

UPDATE [auth].[ModuleFeatures]
SET SubModule = N'Product Request'
WHERE FeatureID = @AccessRequestsFeatureId;

PRINT N'Relabeled FeatureID = ' + CAST(@AccessRequestsFeatureId AS NVARCHAR(20)) + N' (Access Requests page) to "Product Request".';

---------------------------------------------------------------------------
-- 3) Add "CFR Settings" under Administration
---------------------------------------------------------------------------
DECLARE @AdminParentId INT;
DECLARE @TemplateFeatureId INT;
DECLARE @NewCfrSettingsFeatureId INT;
DECLARE @NextAdminDisplayOrder INT;

SELECT @AdminParentId = FeatureID
FROM [auth].[ModuleFeatures]
WHERE MenuCode = N'liAdministration' AND IsDeleted = 0;

IF @AdminParentId IS NULL
BEGIN
    RAISERROR(N'Could not find the Administration parent row (MenuCode = ''liAdministration'') in auth.ModuleFeatures. Aborting.', 16, 1);
    RETURN;
END

SELECT @TemplateFeatureId = FeatureID
FROM [auth].[ModuleFeatures]
WHERE MenuCode = N'liAdminEmailTemplates' AND IsDeleted = 0;

IF @TemplateFeatureId IS NULL
BEGIN
    RAISERROR(N'Could not find the Email Templates row (MenuCode = ''liAdminEmailTemplates'') in auth.ModuleFeatures — needed as the template for matching auth.ModuleRights grants. Aborting.', 16, 1);
    RETURN;
END

IF NOT EXISTS (
    SELECT 1 FROM [auth].[ModuleFeatures]
    WHERE MenuCode = N'liAdminCfrSettings' AND IsDeleted = 0
)
BEGIN
    SELECT @NextAdminDisplayOrder = ISNULL(MAX(DisplayOrder), 0) + 1
    FROM [auth].[ModuleFeatures]
    WHERE ParentId = @AdminParentId AND IsDeleted = 0;

    -- Clone the Email Templates row's structural columns; only override what must genuinely differ.
    INSERT INTO [auth].[ModuleFeatures]
        (Module, ParentId, SubModule, Activity, MenuCode, RoutingUrl, DisplayOrder,
         HasSubModule, ShowinUserRight, ItemDescription, AccessLevel, SubModule2, SubModuleTabName,
         IsHideMenu, GrandParentId, IsDeleted, MenuIcon)
    SELECT
        Module, ParentId, N'CFR Settings', Activity, N'liAdminCfrSettings', N'/admin/administration-cfr-settings', @NextAdminDisplayOrder,
        HasSubModule, ShowinUserRight, N'CFR-wide configuration settings.', AccessLevel, SubModule2, SubModuleTabName,
        IsHideMenu, GrandParentId, 0, N'Settings'
    FROM [auth].[ModuleFeatures]
    WHERE FeatureID = @TemplateFeatureId;

    SET @NewCfrSettingsFeatureId = SCOPE_IDENTITY();

    -- Grant the same per-role access Email Templates already has, rather than guessing AccessRight values.
    INSERT INTO [auth].[ModuleRights] (RoleId, FeatureId, AccessRight)
    SELECT RoleId, @NewCfrSettingsFeatureId, AccessRight
    FROM [auth].[ModuleRights]
    WHERE FeatureId = @TemplateFeatureId;

    PRINT N'Added CFR Settings (FeatureID = ' + CAST(@NewCfrSettingsFeatureId AS NVARCHAR(20)) + N') under Administration (FeatureID = ' + CAST(@AdminParentId AS NVARCHAR(20)) + N').';
END
ELSE
BEGIN
    PRINT N'CFR Settings menu row already exists — nothing to do.';
END

-- Verify
SELECT FeatureID, Module, ParentId, SubModule, MenuCode, RoutingUrl, DisplayOrder, MenuIcon, IsHideMenu, IsDeleted
FROM [auth].[ModuleFeatures]
WHERE MenuCode IN (N'liSaaSRequest', N'liAdminCfrSettings') OR FeatureID = @AccessRequestsFeatureId;

SELECT mr.ModuleRightsId, mr.RoleId, mr.FeatureId, mr.AccessRight
FROM [auth].[ModuleRights] AS mr
INNER JOIN [auth].[ModuleFeatures] AS mf ON mf.FeatureID = mr.FeatureId
WHERE mf.MenuCode IN (N'liSaaSRequest', N'liAdminCfrSettings') OR mf.FeatureID = @AccessRequestsFeatureId;
GO
