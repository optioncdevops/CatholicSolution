-- Copyright (c) OptionC. All rights reserved.
-- Rename existing Portal SSO launch objects to CFRLaunch (idempotent).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[auth].[SsoLaunch]', N'U') IS NOT NULL AND OBJECT_ID(N'[auth].[CFRLaunch]', N'U') IS NULL
BEGIN
    EXEC sp_rename N'[auth].[SsoLaunch]', N'CFRLaunch';

    IF OBJECT_ID(N'[auth].[PK_SsoLaunch]', N'PK') IS NOT NULL
        EXEC sp_rename N'[auth].[PK_SsoLaunch]', N'PK_CFRLaunch', N'OBJECT';

    IF OBJECT_ID(N'[auth].[DF_SsoLaunch_CreatedAt]', N'D') IS NOT NULL
        EXEC sp_rename N'[auth].[DF_SsoLaunch_CreatedAt]', N'DF_CFRLaunch_CreatedAt', N'OBJECT';

    IF OBJECT_ID(N'[auth].[DF_SsoLaunch_IsUsed]', N'D') IS NOT NULL
        EXEC sp_rename N'[auth].[DF_SsoLaunch_IsUsed]', N'DF_CFRLaunch_IsUsed', N'OBJECT';

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_SsoLaunch_CodeHash' AND object_id = OBJECT_ID(N'[auth].[CFRLaunch]'))
        EXEC sp_rename N'[auth].[CFRLaunch].[UQ_SsoLaunch_CodeHash]', N'UQ_CFRLaunch_CodeHash', N'INDEX';

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SsoLaunch_UserProduct' AND object_id = OBJECT_ID(N'[auth].[CFRLaunch]'))
        EXEC sp_rename N'[auth].[CFRLaunch].[IX_SsoLaunch_UserProduct]', N'IX_CFRLaunch_UserProduct', N'INDEX';
END
GO

IF OBJECT_ID(N'[dbo].[Portal_Sso]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Portal_Sso];
GO

-- [dbo].[Portal_CFRLaunch] is owned by 001_Portal_Sso.sql / 003_Portal_CFRLaunch_ProductEnvironment.sql.
-- Do not recreate it here or a later 003 apply would be undone by re-running 002.
