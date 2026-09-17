-- Copyright (c) OptionC. All rights reserved.
-- Server-side, role-based authorization lookup: given a role and an admin page's RoutingUrl,
-- returns that role's auth.ModuleRights.AccessRight for it (0 = Denied, 1 = Access, 2 = Read
-- Only), the exact same value Acutis_DoLogin already returns to the frontend for client-side
-- menu/page gating (see 005_Acutis_Users.sql) - this lets a later request re-check the same
-- right server-side instead of only trusting the client's cached copy from login.
--
-- auth.ModuleFeatures/auth.ModuleRights have no seed script anywhere in this repo (existing rows
-- were added directly against each environment's database - see 013_Acutis_EmailSettingsMenu.sql)
-- so this keys off RoutingUrl, a value that is stable and known from the frontend's own route
-- table, rather than FeatureID, which is not under source control and may differ per environment.
-- A RoutingUrl with no matching, non-deleted auth.ModuleFeatures row - or a role with no
-- auth.ModuleRights row for it - returns 0 (Denied), failing closed rather than open.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_GetFeatureAccessRight]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_GetFeatureAccessRight];
GO

CREATE PROCEDURE [dbo].[Acutis_GetFeatureAccessRight]
    @RoleId INT,
    @RoutingUrl NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 ISNULL(rr.[AccessRight], 0) AS [AccessRight]
    FROM [auth].[ModuleFeatures] AS m
    LEFT JOIN [auth].[ModuleRights] AS rr
        ON rr.[RoleId] = @RoleId
       AND rr.[FeatureId] = m.[FeatureID]
       AND rr.[IsDeleted] = 0
    WHERE m.[RoutingUrl] = @RoutingUrl
      AND m.[IsDeleted] = 0;
END
GO
