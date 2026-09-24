-- Copyright (c) OptionC. All rights reserved.
-- New, standalone stored procedure for the Products page's Api Integration tab
-- (Site / Site Url / Site Description), scoped to the caller's current appsettings
-- Environment (Development/Pilot/Staging/Live). Does not touch [dbo].[Acutis_Products].
-- Site / Site Url come from [core].[ProductEnvironment] (EnvironmentName / BaseUrl), which
-- already exists and is shared with the Portal microservice's member app-launch feature.
-- A [core].[ProductEnvironment] row with a NULL EnvironmentName is the product's public
-- website (e.g. https://www.optionc.com/ for ProductId 1) - not tied to any one environment,
-- so it is always returned alongside the row matching the caller's current environment.
-- Site Description reuses [core].[Product].[ProdDescription] — no new column added.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE [dbo].[Acutis_ProductApiIntegration]
    @ActionId INT,
    @ProductId INT = NULL,
    @ProductEnvironmentId INT = NULL,
    @SiteUrl NVARCHAR(255) = NULL,
    @SiteDescription NVARCHAR(MAX) = NULL,
    @UpdatedBy BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        SELECT
            pe.[ProductEnvironmentId],
            ISNULL(pe.[EnvironmentName], N'Website') AS [Site],
            pe.[BaseUrl] AS [SiteUrl],
            pe.[Description] AS [SiteDescription]
        FROM [core].[ProductEnvironment] AS pe
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = pe.[ProductId]
        WHERE pe.[ProductId] = @ProductId
          AND ISNULL(pe.[IsDeleted], 0) = 0
          AND pe.[IsActive] = 1
          AND p.[IsDeleted] = 0
        ORDER BY CASE WHEN pe.[EnvironmentName] IS NULL THEN 1 ELSE 0 END, pe.[EnvironmentName];
    END
    ELSE IF @ActionId = 2
    BEGIN
        -- 1. Update [core].[ProductEnvironment].[BaseUrl] and [Description]
        UPDATE [core].[ProductEnvironment]
        SET 
            [BaseUrl] = @SiteUrl,
            [Description] = @SiteDescription,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [ProductEnvironmentId] = @ProductEnvironmentId;
    END
END
GO
