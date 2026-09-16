-- Copyright (c) OptionC. All rights reserved.
-- Renames deployed stored procedures to drop the "_CRUD" suffix, matching the updated
-- source scripts. Uses sp_rename so the existing procedure body/permissions are preserved
-- (no DROP/CREATE). Idempotent: each rename only runs if the old name still exists and the
-- new name doesn't already exist, so this script is safe to re-run.
--
-- Run this against whichever database(s) actually host these procedures. If CFR.Acutis and
-- CFR.Portal point at separate databases, run the relevant section against each.

-- ============================================================================
-- Acutis-owned procedures
-- ============================================================================

IF OBJECT_ID(N'[dbo].[Acutis_PasswordReset_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_PasswordReset]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_PasswordReset_CRUD]', N'Acutis_PasswordReset', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_Profile_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_Profile]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_Profile_CRUD]', N'Acutis_Profile', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_Users_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_Users]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_Users_CRUD]', N'Acutis_Users', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_UserRoles_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_UserRoles]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_UserRoles_CRUD]', N'Acutis_UserRoles', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_EmailTemplates_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_EmailTemplates]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_EmailTemplates_CRUD]', N'Acutis_EmailTemplates', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_Organization_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_Organization]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_Organization_CRUD]', N'Acutis_Organization', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_Products_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_Products]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_Products_CRUD]', N'Acutis_Products', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Acutis_Dashboard_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Acutis_Dashboard]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Acutis_Dashboard_CRUD]', N'Acutis_Dashboard', N'OBJECT';
GO

-- [request] schema — renamed to AccessRequestManage, not bare AccessRequest, because
-- [request].[AccessRequest] already exists as a TABLE and SQL Server requires schema-scoped
-- object names (tables, procedures, views, etc.) to be unique within a schema.
IF OBJECT_ID(N'[request].[AccessRequest_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[request].[AccessRequestManage]', N'P') IS NULL
    EXEC sp_rename N'[request].[AccessRequest_CRUD]', N'AccessRequestManage', N'OBJECT';
GO

-- ============================================================================
-- Portal-owned procedures
-- ============================================================================

IF OBJECT_ID(N'[dbo].[Portal_CFRLaunch_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Portal_CFRLaunch]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Portal_CFRLaunch_CRUD]', N'Portal_CFRLaunch', N'OBJECT';
GO

IF OBJECT_ID(N'[dbo].[Portal_Sso_CRUD]', N'P') IS NOT NULL
   AND OBJECT_ID(N'[dbo].[Portal_Sso]', N'P') IS NULL
    EXEC sp_rename N'[dbo].[Portal_Sso_CRUD]', N'Portal_Sso', N'OBJECT';
GO

-- ============================================================================
-- Verify: should return the 11 procedures under their new names, none with _CRUD.
-- ============================================================================
SELECT s.name AS SchemaName, p.name AS ProcedureName
FROM sys.procedures p
INNER JOIN sys.schemas s ON s.schema_id = p.schema_id
WHERE p.name LIKE '%CRUD%'
   OR p.name IN (
        N'Acutis_PasswordReset', N'Acutis_Profile', N'Acutis_Users', N'Acutis_UserRoles',
        N'Acutis_EmailTemplates', N'Acutis_Organization', N'Acutis_Products', N'Acutis_Dashboard',
        N'AccessRequestManage', N'Portal_CFRLaunch', N'Portal_Sso'
   )
ORDER BY SchemaName, ProcedureName;
