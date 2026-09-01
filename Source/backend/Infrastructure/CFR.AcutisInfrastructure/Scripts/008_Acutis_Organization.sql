-- Copyright (c) OptionC. All rights reserved.
-- Organization list/get/create/update CRUD against the existing [core].[Organization] table,
-- extended with Website / ContactPerson / ContactPhone (idempotent ALTER — safe to re-run on an
-- already up-to-date database), plus real user/product data sourced from the existing
-- [auth].[OrganizationUser] / [auth].[AuthUser] and [lic].[OrganizationProduct] / [core].[Product]
-- link tables.
-- OrgId is NOT an IDENTITY column (matches the MAX+1 pattern already used for
-- auth.AcutisRole and adm.EmailTemplate in this codebase) — Create assigns the next value itself.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'Website'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [Website] NVARCHAR(300) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'ContactPerson'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [ContactPerson] NVARCHAR(200) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'ContactPhone'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [ContactPhone] NVARCHAR(30) NULL;
END
GO

IF OBJECT_ID(N'[dbo].[Acutis_Organization_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Organization_CRUD];
GO

-- ActionId 1: Get list of organizations, with real user/product counts.
-- ActionId 2: Get one organization by OrgId.
-- ActionId 3: Update an organization's identity and contact fields.
-- ActionId 4: Create a new organization.
-- ActionId 5: Get the real users linked to an organization.
-- ActionId 6: Get the real products assigned to an organization.
-- ActionId 7: Get products NOT yet assigned to an organization (assign dropdown source).
-- ActionId 8: Assign a product to an organization.
-- ActionId 9: Remove (soft-delete) a product assignment from an organization.
CREATE PROCEDURE [dbo].[Acutis_Organization_CRUD]
    @ActionId INT,
    @OrgId BIGINT = 0,
    @OrgName NVARCHAR(200) = NULL,
    @OrgStatus NVARCHAR(20) = NULL,
    @ContactEmail NVARCHAR(256) = NULL,
    @Website NVARCHAR(300) = NULL,
    @ContactPerson NVARCHAR(200) = NULL,
    @ContactPhone NVARCHAR(30) = NULL,
    @UpdatedBy BIGINT = NULL,
    @ProductId INT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);

    IF @ActionId = 1
    BEGIN
        SELECT
            o.[OrgId],
            o.[OrgName],
            o.[OrgStatus],
            o.[ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[InsertedDate],
            o.[UpdatedDate],
            (SELECT COUNT(*) FROM [auth].[OrganizationUser] AS ou WHERE ou.[OrgId] = o.[OrgId] AND ou.[IsDeleted] = 0) AS [UserCount],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] AS op WHERE op.[OrgId] = o.[OrgId] AND op.[IsDeleted] = 0) AS [ProductCount]
        FROM [core].[Organization] AS o
        WHERE o.[IsDeleted] = 0
        ORDER BY o.[OrgName];
        RETURN 0;
    END

    IF @ActionId = 2
    BEGIN
        SELECT
            o.[OrgId],
            o.[OrgName],
            o.[OrgStatus],
            o.[ContactEmail],
            o.[Website],
            o.[ContactPerson],
            o.[ContactPhone],
            o.[InsertedDate],
            o.[UpdatedDate],
            (SELECT COUNT(*) FROM [auth].[OrganizationUser] AS ou WHERE ou.[OrgId] = o.[OrgId] AND ou.[IsDeleted] = 0) AS [UserCount],
            (SELECT COUNT(*) FROM [lic].[OrganizationProduct] AS op WHERE op.[OrgId] = o.[OrgId] AND op.[IsDeleted] = 0) AS [ProductCount]
        FROM [core].[Organization] AS o
        WHERE o.[OrgId] = @OrgId
          AND o.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 3
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM [core].[Organization]
            WHERE [OrgId] = @OrgId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [core].[Organization]
        SET
            [OrgName] = @OrgName,
            [OrgStatus] = @OrgStatus,
            [ContactEmail] = @ContactEmail,
            [Website] = @Website,
            [ContactPerson] = @ContactPerson,
            [ContactPhone] = @ContactPhone,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [OrgId] = @OrgId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@OrgId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 4
    BEGIN
        SELECT @OrgId = ISNULL(MAX([OrgId]), 0) + 1 FROM [core].[Organization];

        INSERT INTO [core].[Organization]
        (
            [OrgId], [OrgName], [OrgStatus], [ContactEmail], [Website], [ContactPerson], [ContactPhone],
            [InsertedDate], [InsertedBy], [IsDeleted]
        )
        VALUES
        (
            @OrgId, @OrgName, @OrgStatus, @ContactEmail, @Website, @ContactPerson, @ContactPhone,
            SYSUTCDATETIME(), @UpdatedBy, 0
        );

        SET @ReturnValue = CAST(@OrgId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 5
    BEGIN
        SELECT
            au.[AuthUserId],
            au.[Email],
            au.[FirstName],
            au.[LastName],
            ou.[MemberStatus],
            ou.[CreatedDate] AS [LinkedDate]
        FROM [auth].[OrganizationUser] AS ou
        INNER JOIN [auth].[AuthUser] AS au ON au.[AuthUserId] = ou.[AuthUserId]
        WHERE ou.[OrgId] = @OrgId
          AND ou.[IsDeleted] = 0
          AND au.[IsDeleted] = 0
        ORDER BY au.[FirstName], au.[LastName];
        RETURN 0;
    END

    IF @ActionId = 6
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            op.[AssignStatus],
            op.[CreatedDate] AS [AssignedDate]
        FROM [lic].[OrganizationProduct] AS op
        INNER JOIN [core].[Product] AS p ON p.[ProductId] = op.[ProductId]
        WHERE op.[OrgId] = @OrgId
          AND op.[IsDeleted] = 0
          AND p.[IsDeleted] = 0
        ORDER BY p.[ProductName];
        RETURN 0;
    END

    IF @ActionId = 7
    BEGIN
        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName]
        FROM [core].[Product] AS p
        WHERE p.[IsDeleted] = 0
          AND NOT EXISTS (
              SELECT 1 FROM [lic].[OrganizationProduct] AS op
              WHERE op.[OrgId] = @OrgId
                AND op.[ProductId] = p.[ProductId]
                AND op.[IsDeleted] = 0
          )
        ORDER BY p.[ProductName];
        RETURN 0;
    END

    IF @ActionId = 8
    BEGIN
        IF EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [OrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        IF EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [OrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 1
        )
        BEGIN
            UPDATE [lic].[OrganizationProduct]
            SET [AssignStatus] = 'active',
                [CreatedDate] = SYSUTCDATETIME(),
                [IsDeleted] = 0
            WHERE [OrgId] = @OrgId AND [ProductId] = @ProductId;
        END
        ELSE
        BEGIN
            INSERT INTO [lic].[OrganizationProduct]
            (
                [OrgId], [ProductId], [AssignStatus], [CreatedDate], [IsDeleted]
            )
            VALUES
            (
                @OrgId, @ProductId, 'active', SYSUTCDATETIME(), 0
            );
        END

        SET @ReturnValue = CAST(@ProductId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 9
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM [lic].[OrganizationProduct]
            WHERE [OrgId] = @OrgId AND [ProductId] = @ProductId AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [lic].[OrganizationProduct]
        SET [AssignStatus] = 'inactive',
            [IsDeleted] = 1
        WHERE [OrgId] = @OrgId AND [ProductId] = @ProductId;

        SET @ReturnValue = CAST(@ProductId AS INT);
        RETURN @ReturnValue;
    END
END
GO
