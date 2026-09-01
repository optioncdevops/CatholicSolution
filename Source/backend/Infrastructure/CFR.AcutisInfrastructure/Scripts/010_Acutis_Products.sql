-- Copyright (c) OptionC. All rights reserved.
-- App Hub product list. ActionId 4 returns Your / Available / Future rows from core.Product.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_Products_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Products_CRUD];
GO

CREATE PROCEDURE [dbo].[Acutis_Products_CRUD]
    @ActionId INT,
    @RequesterEmail NVARCHAR(256) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');

    IF @ActionId = 4
    BEGIN
        SELECT
            CAST(p.[ProductId] AS NVARCHAR(20)) AS [ProductId],
            p.[ProductName] AS [ProductName],
            ISNULL(p.[SubCategoryName], N'') AS [Category],
            ISNULL(p.[ProdDescription], N'') AS [Description],
            ISNULL(
                (
                    SELECT TOP (1) pe.[BaseUrl]
                    FROM [core].[ProductEnvironment] pe
                    WHERE pe.[ProductId] = p.[ProductId]
                      AND pe.[IsDeleted] = 0
                      AND pe.[IsActive] = 1
                      AND pe.[EnvironmentName] = N'prod'
                ),
                ISNULL(
                    (
                        SELECT TOP (1) pe.[BaseUrl]
                        FROM [core].[ProductEnvironment] pe
                        WHERE pe.[ProductId] = p.[ProductId]
                          AND pe.[IsDeleted] = 0
                          AND pe.[IsActive] = 1
                        ORDER BY pe.[ProductEnvironmentId]
                    ),
                    ISNULL(p.[ExternalPageUrl], N'')
                )
            ) AS [ExternalUrl],
            ISNULL(STRING_AGG(f.[FeatureName], N'|') WITHIN GROUP (ORDER BY f.[ProductFeatureId]), N'') AS [FeatureNames],
            CASE
                WHEN @RequesterEmail IS NOT NULL AND (
                    EXISTS (
                        SELECT 1
                        FROM [lic].[OrganizationProduct] op
                        INNER JOIN [auth].[OrganizationUser] ou
                            ON ou.[OrgId] = op.[OrgId]
                           AND ou.[IsDeleted] = 0
                        INNER JOIN [auth].[User] au
                            ON au.[UserId] = ou.[AuthUserId]
                           AND au.[IsDeleted] = 0
                           AND au.[IsActive] = 1
                        WHERE op.[ProductId] = p.[ProductId]
                          AND op.[IsDeleted] = 0
                          AND LOWER(LTRIM(RTRIM(op.[AssignStatus]))) IN (N'active', N'trial')
                          AND LOWER(au.[Email]) = LOWER(@RequesterEmail)
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM [lic].[UserProductAccess] upa
                        INNER JOIN [auth].[OrganizationUser] ou
                            ON ou.[OrganizationUserId] = upa.[OrganizationUserId]
                           AND ou.[IsDeleted] = 0
                        INNER JOIN [auth].[User] au
                            ON au.[UserId] = ou.[AuthUserId]
                           AND au.[IsDeleted] = 0
                           AND au.[IsActive] = 1
                        WHERE upa.[ProductId] = p.[ProductId]
                          AND upa.[IsDeleted] = 0
                          AND LOWER(au.[Email]) = LOWER(@RequesterEmail)
                    )
                ) THEN N'your'
                WHEN CONVERT(INT, p.[IsAvailable]) = 1 THEN N'available'
                ELSE N'future'
            END AS [HubSection],
            CAST(p.[IsActive] AS INT) AS [IsActive],
            CAST(p.[IsAvailable] AS INT) AS [IsAvailable]
        FROM [core].[Product] p
        LEFT JOIN [core].[ProductFeature] f
            ON f.[ProductId] = p.[ProductId]
           AND f.[IsDeleted] = 0
           AND f.[IsActive] = 1
        WHERE p.[IsDeleted] = 0
        GROUP BY
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            p.[IsActive],
            p.[IsAvailable]
        ORDER BY p.[ProductName];

        RETURN 0;
    END
END
GO
