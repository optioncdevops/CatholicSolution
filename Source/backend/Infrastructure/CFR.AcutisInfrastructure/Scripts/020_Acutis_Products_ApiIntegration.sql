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
    @ProductId INT,
    @EnvironmentName NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @EnvironmentName = NULLIF(LTRIM(RTRIM(@EnvironmentName)), N'');

    SELECT
        ISNULL(pe.[EnvironmentName], N'Website') AS [Site],
        pe.[BaseUrl] AS [SiteUrl],
        p.[ProdDescription] AS [SiteDescription]
    FROM [core].[ProductEnvironment] AS pe
    INNER JOIN [core].[Product] AS p ON p.[ProductId] = pe.[ProductId]
    WHERE pe.[ProductId] = @ProductId
      AND (pe.[EnvironmentName] IS NULL OR pe.[EnvironmentName] = @EnvironmentName)
      AND ISNULL(pe.[IsDeleted], 0) = 0
      AND pe.[IsActive] = 1
      AND p.[IsDeleted] = 0
    ORDER BY CASE WHEN pe.[EnvironmentName] IS NULL THEN 1 ELSE 0 END, pe.[EnvironmentName];
END
GO
