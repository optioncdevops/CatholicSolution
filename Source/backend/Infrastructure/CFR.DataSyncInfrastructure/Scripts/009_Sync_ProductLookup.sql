-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync Phase 1 — read-only "which active products can this CFR user launch" lookup,
-- for a product's own backend to power an in-product app switcher without a live CFR browser
-- session. Reuses the exact [core].[Product] <> [auth].[UserProduct] <> [core].[ProductEnvironment]
-- join already proven in [dbo].[Portal_CFRLaunch] ActionId 1 (CFR.PortalInfrastructure), matched
-- here by email via [auth].[User].[NormalizedEmail] (added by 001_Sync_AuthUser_Extend.sql) since
-- the caller is a machine client, not a signed-in CFR member — there is no CFRUserId available to
-- it directly. The returned URL is the per-environment [core].[ProductEnvironment].[BaseUrl] for
-- @EnvironmentName (defaults to Development), not the static [core].[Product].[ExternalPageUrl].
-- Deliberately NOT scoped to the calling ApiClient's own ProductId (unlike Sync_UserProductUpsert):
-- an app switcher is inherently cross-product by design, and this only ever returns one named
-- user's own data, never a bulk/anonymous listing.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Sync_ProductsForUser]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Sync_ProductsForUser];
GO

CREATE PROCEDURE [dbo].[Sync_ProductsForUser]
    @Email NVARCHAR(256),
    @EnvironmentName NVARCHAR(20) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @EnvironmentName = LTRIM(RTRIM(NULLIF(@EnvironmentName, N'')));
    IF @EnvironmentName IS NULL
        SET @EnvironmentName = N'Development';

    DECLARE @CFRUserId INT;
    SELECT @CFRUserId = u.[CFRUserId]
    FROM [auth].[User] AS u
    WHERE u.[NormalizedEmail] = LOWER(LTRIM(RTRIM(@Email)));

    IF @CFRUserId IS NULL
    BEGIN
        SET @ReturnValue = -1;
        RETURN @ReturnValue;
    END

    -- Launch URL comes from [core].[ProductEnvironment] for the caller's environment, the same
    -- source [dbo].[Portal_CFRLaunch] ActionId 1 uses - not the static [core].[Product].
    -- [ExternalPageUrl], which is not kept in sync per environment. A product with no active
    -- ProductEnvironment row for this environment is not launchable here, so it's excluded.
    SELECT
        p.[ProductId],
        p.[ProductName],
        p.[ShortName],
        p.[SubCategoryName],
        pe.[BaseUrl] AS [ExternalPageUrl],
        p.[LogoName],
        p.[NavigationTarget]
    FROM [core].[Product] AS p
    INNER JOIN [auth].[UserProduct] AS up
        ON up.[ProductId] = p.[ProductId]
       AND up.[CFRUserId] = @CFRUserId
       AND ISNULL(up.[IsDeleted], 0) = 0
       AND ISNULL(up.[IsLoginDisabled], 0) = 0
       AND ISNULL(up.[IsActive], 1) = 1
    INNER JOIN [core].[ProductEnvironment] AS pe
        ON pe.[ProductId] = p.[ProductId]
       AND pe.[EnvironmentName] = @EnvironmentName
       AND ISNULL(pe.[IsDeleted], 0) = 0
       AND pe.[IsActive] = 1
       AND NULLIF(LTRIM(RTRIM(pe.[BaseUrl])), N'') IS NOT NULL
    WHERE p.[IsDeleted] = 0
      AND p.[IsActive] = 1
    ORDER BY p.[ProductName];

    SET @ReturnValue = 1;
    RETURN @ReturnValue;
END
GO

-- Registers the OptionC SMS product backend as a CFR.DataSync API client so it can call
-- Auth/Login then Products/GetUserProducts server-to-server. ClientSecret is plaintext (see
-- 006_Sync_StoredProcedures.sql's header note — encryption-at-rest was never implemented for
-- this table despite 004_Sync_Security_Schema.sql's column comment). DO NOT COMMIT A REAL
-- SECRET LITERAL HERE — replace '<SMS_CLIENT_SECRET>' below with the actual value out-of-band
-- (paste it in only when running this script against a given environment's database, matching
-- whatever value is configured in that environment's OptionC.SMS CfrDataSyncSettings:ClientSecret)
-- before executing. The same ClientId/ClientSecret pair is already used, the same way, by
-- OptionC.Acutis/appsettings.*.json's CfrSync section (an unrelated bulk-migration tool) —
-- reuse that same secret value here for the same product's live per-user lookup.
IF NOT EXISTS (SELECT 1 FROM [sec].[ApiClient] WHERE [ClientId] = N'sms-client')
BEGIN
    INSERT INTO [sec].[ApiClient] ([ClientId], [ClientSecret], [ProductId], [DisplayName], [RateLimitPerMinute], [IsActive])
    VALUES (N'sms-client', N'<SMS_CLIENT_SECRET>', 1, N'OptionC SMS', 60, 1);
END
GO
