-- Copyright (c) OptionC. All rights reserved.
-- Align [core].[ProductEnvironment].EnvironmentName with Portal appsettings Environment values.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[core].[CK_ProductEnvironment_EnvironmentName]', N'C') IS NOT NULL
    ALTER TABLE [core].[ProductEnvironment] DROP CONSTRAINT [CK_ProductEnvironment_EnvironmentName];
GO

IF OBJECT_ID(N'[core].[CK__ProductEn__Envir__4BAC3F29]', N'C') IS NOT NULL
    ALTER TABLE [core].[ProductEnvironment] DROP CONSTRAINT [CK__ProductEn__Envir__4BAC3F29];
GO

UPDATE [core].[ProductEnvironment]
SET [EnvironmentName] = CASE [EnvironmentName]
        WHEN N'dev' THEN N'Development'
        WHEN N'qa' THEN N'Pilot'
        WHEN N'uat' THEN N'Staging'
        WHEN N'prod' THEN N'Live'
        ELSE [EnvironmentName]
    END
WHERE [EnvironmentName] IN (N'dev', N'qa', N'uat', N'prod');
GO

ALTER TABLE [core].[ProductEnvironment]
ADD CONSTRAINT [CK_ProductEnvironment_EnvironmentName]
CHECK ([EnvironmentName] IN (N'Development', N'Pilot', N'Staging', N'Live'));
GO
