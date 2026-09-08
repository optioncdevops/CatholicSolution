-- 013_Acutis_EmailSettingsMenu.sql
-- Adds "Email Settings" as a real Administration submenu entry so it appears in the
-- Administration dropdown alongside User Roles / Rights / Email Templates, instead of only
-- being reachable via the button on the Email Templates page.
--
-- auth.ModuleFeatures/auth.ModuleRights have no seed script anywhere in this repo — the
-- existing "Email Templates" row was evidently added directly against the live database. This
-- script clones that row's structural columns (Module, Activity, HasSubModule, ShowinUserRight,
-- AccessLevel, SubModule2, SubModuleTabName, GrandParentId) instead of guessing them, and copies
-- its auth.ModuleRights grants per role, so nothing here is invented. Idempotent — safe to re-run.
--
-- Note: auth.ModuleRights has no IsDeleted column on this database (confirmed via sp_help), even
-- though Acutis_DoLogin's checked-in query filters on rr.IsDeleted = 0 — a pre-existing drift
-- between the repo's SQL and the live schema, unrelated to this script, left as-is here.

SET NOCOUNT ON;

DECLARE @AdminParentId INT;
DECLARE @TemplateFeatureId INT;
DECLARE @NewFeatureId INT;
DECLARE @NextDisplayOrder INT;

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
    WHERE MenuCode = N'liAdminEmailSettings' AND IsDeleted = 0
)
BEGIN
    SELECT @NextDisplayOrder = ISNULL(MAX(DisplayOrder), 0) + 1
    FROM [auth].[ModuleFeatures]
    WHERE ParentId = @AdminParentId AND IsDeleted = 0;

    -- Clone the Email Templates row's structural columns; only override what must genuinely differ.
    INSERT INTO [auth].[ModuleFeatures]
        (Module, ParentId, SubModule, Activity, MenuCode, RoutingUrl, DisplayOrder,
         HasSubModule, ShowinUserRight, ItemDescription, AccessLevel, SubModule2, SubModuleTabName,
         IsHideMenu, GrandParentId, IsDeleted, MenuIcon)
    SELECT
        Module, ParentId, N'Email Settings', Activity, N'liAdminEmailSettings', N'/admin/administration-email-settings', @NextDisplayOrder,
        HasSubModule, ShowinUserRight, N'SMTP and branding configuration shared by every outgoing email.', AccessLevel, SubModule2, SubModuleTabName,
        IsHideMenu, GrandParentId, 0, N'settings'
    FROM [auth].[ModuleFeatures]
    WHERE FeatureID = @TemplateFeatureId;

    SET @NewFeatureId = SCOPE_IDENTITY();

    -- Grant the same per-role access Email Templates already has, rather than guessing AccessRight values.
    INSERT INTO [auth].[ModuleRights] (RoleId, FeatureId, AccessRight)
    SELECT RoleId, @NewFeatureId, AccessRight
    FROM [auth].[ModuleRights]
    WHERE FeatureId = @TemplateFeatureId;

    PRINT N'Added Email Settings (FeatureID = ' + CAST(@NewFeatureId AS NVARCHAR(20)) + N') under Administration (FeatureID = ' + CAST(@AdminParentId AS NVARCHAR(20)) + N').';
END
ELSE
BEGIN
    PRINT N'Email Settings menu row already exists — nothing to do.';
END

-- Verify
SELECT FeatureID, Module, ParentId, SubModule, MenuCode, RoutingUrl, DisplayOrder, MenuIcon, IsHideMenu, IsDeleted
FROM [auth].[ModuleFeatures]
WHERE MenuCode = N'liAdminEmailSettings';

SELECT mr.ModuleRightsId, mr.RoleId, mr.FeatureId, mr.AccessRight
FROM [auth].[ModuleRights] AS mr
INNER JOIN [auth].[ModuleFeatures] AS mf ON mf.FeatureID = mr.FeatureId
WHERE mf.MenuCode = N'liAdminEmailSettings';
GO
