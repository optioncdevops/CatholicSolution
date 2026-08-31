-- Copyright (c) OptionC. All rights reserved.
-- Organization list/get/update CRUD against the existing [core].[Organization] table, extended
-- with Website / ContactPerson / ContactPhone (idempotent ALTER — safe to re-run on an already
-- up-to-date database), plus real user/product counts sourced from the existing
-- [auth].[OrganizationUser] and [lic].[OrganizationProduct] link tables.
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
END
GO
