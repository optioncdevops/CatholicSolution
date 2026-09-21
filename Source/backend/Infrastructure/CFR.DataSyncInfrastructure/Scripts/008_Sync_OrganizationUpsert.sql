-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync — organization onboarding. This is the one deliberate, explicit way a product may
-- create a CFR organization — distinct from Sync_UserProductUpsert, which intentionally refuses
-- to auto-create organizations as a side effect of syncing a user (per the original design: a
-- product must be physically incapable of silently vivifying orgs through the user-sync path).
--
-- Same tenant-isolation rule as user sync: ProductId comes only from the authenticated
-- ApiClient, never from the request body. Keyed on (ProductId, ProductOrgId) — the product's own
-- organization identifier — via lic.OrganizationProduct's existing filtered unique index
-- (UX_OrganizationProduct_Product_ProductOrgId, added in 003_Sync_OrganizationProduct_Extend.sql).
--
-- Deliberately does NOT attempt cross-product organization identity resolution (e.g. matching an
-- existing core.Organization row created under a different product's ProductOrgId to the "same"
-- real-world organization) — every (ProductId, ProductOrgId) pair not already onboarded gets its
-- own new core.Organization row. No existing convention in this schema attempts that de-dup either.
--
-- ActionId 1: Create or update (idempotent — safe to re-run a migration).
-- ActionId 2: Get by ProductOrgId.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Sync_OrganizationUpsert]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Sync_OrganizationUpsert];
GO

CREATE PROCEDURE [dbo].[Sync_OrganizationUpsert]
    @ActionId INT,
    @ProductId INT,
    @ProductOrgId INT,
    @ApiClientId INT = NULL,
    @OrgName NVARCHAR(255) = NULL,
    @OrgState NVARCHAR(100) = NULL,
    @OrgCountry NVARCHAR(100) = NULL,
    @ContactEmail NVARCHAR(255) = NULL,
    @Website NVARCHAR(500) = NULL,
    @ContactPerson NVARCHAR(255) = NULL,
    @ContactPhone NVARCHAR(50) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @Zip NVARCHAR(20) = NULL,
    @DioceseId VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @CFROrgId INT;
    DECLARE @Outcome NVARCHAR(20);

    IF @ActionId = 2
    BEGIN
        SELECT
            op.[CFROrgId], op.[ProductOrgId], op.[OrgName], op.[DioceseId]
        FROM [lic].[OrganizationProduct] AS op
        WHERE op.[ProductId] = @ProductId AND op.[ProductOrgId] = @ProductOrgId AND op.[IsDeleted] = 0;
        RETURN 0;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT @CFROrgId = op.[CFROrgId]
        FROM [lic].[OrganizationProduct] AS op
        WHERE op.[ProductId] = @ProductId AND op.[ProductOrgId] = @ProductOrgId AND op.[IsDeleted] = 0;

        IF @CFROrgId IS NULL
        BEGIN
            INSERT INTO [core].[Organization]
                ([OrgName], [OrgState], [OrgCountry], [ContactEmail], [Website], [ContactPerson], [ContactPhone], [InsertedDate], [InsertedBy], [IsDeleted])
            VALUES
                (@OrgName, @OrgState, @OrgCountry, @ContactEmail, @Website, @ContactPerson, @ContactPhone, SYSUTCDATETIME(), @ApiClientId, 0);

            SET @CFROrgId = SCOPE_IDENTITY();

            INSERT INTO [lic].[OrganizationProduct]
                ([CFROrgId], [ProductOrgId], [ProductId], [OrgName], [OrgState], [OrgCountry], [ContactEmail], [Website], [ContactPerson], [ContactPhone],
                 [OrgStatus], [Address], [City], [State], [Zip], [DioceseId], [AssignStatus], [AssignedBy], [CreatedDate], [InsertedBy], [IsDeleted])
            VALUES
                (@CFROrgId, @ProductOrgId, @ProductId, @OrgName, @OrgState, @OrgCountry, @ContactEmail, @Website, @ContactPerson, @ContactPhone,
                 1, @Address, @City, @State, @Zip, @DioceseId, 1, @ApiClientId, SYSUTCDATETIME(), @ApiClientId, 0);

            SET @Outcome = N'Created';
        END
        ELSE
        BEGIN
            UPDATE [core].[Organization]
            SET [OrgName] = @OrgName, [OrgState] = @OrgState, [OrgCountry] = @OrgCountry,
                [ContactEmail] = @ContactEmail, [Website] = @Website, [ContactPerson] = @ContactPerson, [ContactPhone] = @ContactPhone,
                [UpdatedDate] = SYSUTCDATETIME(), [UpdatedBy] = @ApiClientId
            WHERE [ID] = @CFROrgId;

            UPDATE [lic].[OrganizationProduct]
            SET [OrgName] = @OrgName, [OrgState] = @OrgState, [OrgCountry] = @OrgCountry,
                [ContactEmail] = @ContactEmail, [Website] = @Website, [ContactPerson] = @ContactPerson, [ContactPhone] = @ContactPhone,
                [Address] = @Address, [City] = @City, [State] = @State, [Zip] = @Zip, [DioceseId] = @DioceseId,
                [UpdatedDate] = SYSUTCDATETIME(), [UpdatedBy] = @ApiClientId
            WHERE [CFROrgId] = @CFROrgId AND [ProductId] = @ProductId AND [ProductOrgId] = @ProductOrgId;

            SET @Outcome = N'Updated';
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH

    SELECT @CFROrgId AS [CFROrgId], @ProductOrgId AS [ProductOrgId], @OrgName AS [OrgName], @Outcome AS [Outcome];
END
GO
