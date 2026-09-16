-- Copyright (c) OptionC. All rights reserved.
-- CFR Users listing for the CFR Admin "CFR User" page, exposed through the existing Users
-- (Administration) controller/service/repository as an extra action rather than a separate
-- vertical. Deliberately its own stored procedure though: it reads [auth].[User]/[auth].[UserProduct]
-- (CFR portal members), a completely different table family from Acutis_Users' own
-- [auth].[AcutisUser] (internal Acutis staff) - Status here is a genuine activation signal from
-- [auth].[User].[AuthOId] (populated = active, NULL/empty = pending).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_CFRUsers]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_CFRUsers];
GO

-- ActionId 1: Get CFR users, one row per (member, organization) membership. Scoped to @OrgId
-- when it is a positive value, or every organization in a single query when @OrgId is NULL or 0.
CREATE PROCEDURE [dbo].[Acutis_CFRUsers]
    @ActionId INT,
    @OrgId INT = NULL,
    @IsAuth INT = NULL,
    @ProductIds VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActionId = 1
    BEGIN
        -- Result 1: Counts for the tabs (always calculates across all users in the org)
        SELECT 
            ISNULL(SUM(CASE WHEN u.[AuthOId] IS NOT NULL THEN 1 ELSE 0 END), 0) AS ActiveCount,
            ISNULL(SUM(CASE WHEN u.[AuthOId] IS NULL THEN 1 ELSE 0 END), 0) AS PendingCount
        FROM (
            SELECT up.[CFRUserId], up.[OrgId]
            FROM [auth].[UserProduct] AS up
            WHERE ISNULL(up.[IsDeleted], 0) = 0
              AND (@OrgId IS NULL OR @OrgId = 0 OR up.[OrgId] = @OrgId)
              AND (@ProductIds IS NULL OR @ProductIds = '' OR (
                  SELECT COUNT(*) FROM STRING_SPLIT(@ProductIds, ',')
              ) = (
                  SELECT COUNT(DISTINCT op.[ProductId])
                  FROM [lic].[OrganizationProduct] op 
                  INNER JOIN STRING_SPLIT(@ProductIds, ',') ss ON op.[ProductId] = CAST(ss.[value] AS INT)
                  WHERE op.[CFROrgId] = up.[OrgId] 
                    AND op.[IsDeleted] = 0 
                    AND op.[AssignStatus] = 1
              ))
            GROUP BY up.[CFRUserId], up.[OrgId]
        ) base
        LEFT JOIN [auth].[User] AS u ON u.[CFRUserId] = base.[CFRUserId];

        -- Result 2: The filtered user list
        SELECT
            up.[CFRUserId] AS [AuthUserId],
            u.[Email],
            LTRIM(RTRIM(ISNULL(MAX(up.[FirstName]), N'') + N' ' + ISNULL(MAX(up.[LastName]), N''))) AS [FullName],
            MAX(r.[RoleName]) AS [RoleName],
            up.[OrgId],
            MAX(up.[OrgName]) AS [OrgName],
            CASE WHEN MAX(CASE WHEN u.[AuthOId] IS NOT NULL THEN 1 ELSE 0 END) = 1
                 THEN N'active' ELSE N'pending' END AS [Status],
            MIN(up.[CreatedDate]) AS [LinkedDate],
            (
                SELECT COUNT(DISTINCT op.[ProductId])
                FROM [lic].[OrganizationProduct] AS op
                WHERE op.[CFROrgId] = up.[OrgId]
                  AND op.[IsDeleted] = 0
                  AND op.[AssignStatus] = 1 -- Active
            ) AS [AppCount],
            (
                SELECT STRING_AGG(p2.[ProductName], N', ') WITHIN GROUP (ORDER BY p2.[ProductName])
                FROM [lic].[OrganizationProduct] AS op
                INNER JOIN [core].[Product] AS p2
                    ON p2.[ProductId] = op.[ProductId]
                   AND p2.[IsDeleted] = 0
                WHERE op.[CFROrgId] = up.[OrgId]
                  AND op.[IsDeleted] = 0
                  AND op.[AssignStatus] = 1 -- Active
            ) AS [AppNames]
        FROM [auth].[UserProduct] AS up
        LEFT JOIN [auth].[User] AS u ON u.[CFRUserId] = up.[CFRUserId]
        LEFT JOIN [auth].[AcutisRole] AS r ON r.[RoleId] = up.[RoleId] AND r.[IsDeleted] = 0
        WHERE ISNULL(up.[IsDeleted], 0) = 0
          AND (@OrgId IS NULL OR @OrgId = 0 OR up.[OrgId] = @OrgId)
          AND (@ProductIds IS NULL OR @ProductIds = '' OR (
              SELECT COUNT(*) FROM STRING_SPLIT(@ProductIds, ',')
          ) = (
              SELECT COUNT(DISTINCT op.[ProductId])
              FROM [lic].[OrganizationProduct] op 
              INNER JOIN STRING_SPLIT(@ProductIds, ',') ss ON op.[ProductId] = CAST(ss.[value] AS INT)
              WHERE op.[CFROrgId] = up.[OrgId] 
                AND op.[IsDeleted] = 0 
                AND op.[AssignStatus] = 1
          ))
          AND (
              @IsAuth IS NULL 
              OR (@IsAuth = 1 AND u.[AuthOId] IS NOT NULL) 
              OR (@IsAuth = 0 AND u.[AuthOId] IS NULL)
          )
        GROUP BY up.[CFRUserId], u.[Email], up.[OrgId]
        ORDER BY [FullName];
        RETURN 0;
    END
END
GO
