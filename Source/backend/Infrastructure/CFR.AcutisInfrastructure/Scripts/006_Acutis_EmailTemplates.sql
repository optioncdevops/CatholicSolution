-- Copyright (c) OptionC. All rights reserved.
-- Email Templates CRUD for Acutis, backed by the existing [adm].[EmailTemplate] table.
-- Seeds the four templates the CFR Admin "Email Templates" screen already presents, including
-- PasswordReset — the one AcutisPasswordService loads at send time instead of a hard-coded body.
-- Also upgrades an already-seeded PasswordReset row from an earlier run of this script (back when
-- its Subject/Body were the original, plainer content) to the current premium HTML content —
-- idempotent and non-destructive: only touches the row when its Subject still matches that
-- original seed exactly and Body does not already contain this redesign's marker text, so an
-- admin who customized the Subject or already has the redesigned content keeps their own content.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Lets an admin configure how long a template's own reset/verification link stays valid, straight
-- from the template editor, instead of that duration being a hard-coded backend constant the
-- [ExpiryMinutes] placeholder merely echoed. NULL for every template except PasswordReset, which
-- is the only one with a real, time-limited link today.
IF COL_LENGTH(N'adm.EmailTemplate', N'LinkExpiryMinutes') IS NULL
BEGIN
    ALTER TABLE [adm].[EmailTemplate] ADD [LinkExpiryMinutes] INT NULL;
END
GO

-- AccentColor/LogoUrl/FontFamily/BaseFontSize used to be per-template branding overrides here.
-- Branding is now platform-wide instead (the admin Email Settings page, file-backed — see
-- ConfSettingsService/SMTPMailConfig in CFR.CommonService), so this procedure no longer reads or
-- writes those four columns; a template is Subject/Body content only. The columns themselves are
-- deliberately left in place on [adm].[EmailTemplate] (not dropped) rather than risk an
-- irreversible schema change — they're just unused dead columns now.
IF OBJECT_ID(N'[dbo].[Acutis_EmailTemplates]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_EmailTemplates];
GO

-- ActionId 1: Save (insert when @TemplateId = 0, otherwise update Subject/Body/Status).
-- ActionId 2: Get by TemplateId.
-- ActionId 3: Get list (all templates).
-- ActionId 4: Get by TemplateCode (used internally by AcutisPasswordService to load PasswordReset).
CREATE PROCEDURE [dbo].[Acutis_EmailTemplates]
    @ActionId INT,
    @TemplateId INT = 0,
    @TemplateCode NVARCHAR(50) = NULL,
    @Subject NVARCHAR(200) = NULL,
    @Body NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(20) = NULL,
    @LinkExpiryMinutes INT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);

    IF @ActionId = 1
    BEGIN
        IF @TemplateId = 0
        BEGIN
            IF @TemplateCode IS NULL OR EXISTS (
                SELECT 1 FROM [adm].[EmailTemplate]
                WHERE [TemplateCode] = @TemplateCode AND [IsDeleted] = 0
            )
            BEGIN
                SET @ReturnValue = -99;
                RETURN @ReturnValue;
            END

            -- TemplateId is not an IDENTITY column; assign the next value the same way
            -- 004_Acutis_UserRoles.sql does for [auth].[AcutisRole].[RoleId].
            SELECT @TemplateId = ISNULL(MAX([TemplateId]), 0) + 1
            FROM [adm].[EmailTemplate];

            INSERT INTO [adm].[EmailTemplate]
            (
                [TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [LinkExpiryMinutes], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @TemplateId,
                @TemplateCode,
                @Subject,
                @Body,
                CASE WHEN @Status = N'inactive' THEN 0 ELSE 1 END,
                @LinkExpiryMinutes,
                SYSUTCDATETIME(),
                @UpdatedBy,
                0
            );

            SET @ReturnValue = @TemplateId;
            RETURN @ReturnValue;
        END

        UPDATE [adm].[EmailTemplate]
        SET
            [Subject] = @Subject,
            [Body] = @Body,
            [IsActive] = CASE
                WHEN @Status = N'inactive' THEN 0
                WHEN @Status = N'active' THEN 1
                ELSE [IsActive]
            END,
            [LinkExpiryMinutes] = @LinkExpiryMinutes,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UpdatedBy
        WHERE [TemplateId] = @TemplateId
          AND [IsDeleted] = 0;

        SET @ReturnValue = @TemplateId;
        RETURN @ReturnValue;
    END

    IF @ActionId = 2
    BEGIN
        SELECT
            t.[TemplateId],
            t.[TemplateCode],
            t.[Subject],
            t.[Body],
            CASE WHEN t.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            t.[LinkExpiryMinutes],
            t.[CreatedDate],
            t.[UpdatedDate]
        FROM [adm].[EmailTemplate] AS t
        WHERE t.[TemplateId] = @TemplateId
          AND t.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            t.[TemplateId],
            t.[TemplateCode],
            t.[Subject],
            t.[Body],
            CASE WHEN t.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            t.[LinkExpiryMinutes],
            t.[CreatedDate],
            t.[UpdatedDate]
        FROM [adm].[EmailTemplate] AS t
        WHERE t.[IsDeleted] = 0
        ORDER BY t.[TemplateCode];
        RETURN 0;
    END

    IF @ActionId = 4
    BEGIN
        SELECT TOP (1)
            t.[TemplateId],
            t.[TemplateCode],
            t.[Subject],
            t.[Body],
            CASE WHEN t.[IsActive] = 1 THEN N'active' ELSE N'inactive' END AS [Status],
            t.[LinkExpiryMinutes],
            t.[CreatedDate],
            t.[UpdatedDate]
        FROM [adm].[EmailTemplate] AS t
        WHERE t.[TemplateCode] = @TemplateCode
          AND t.[IsActive] = 1
          AND t.[IsDeleted] = 0;
        RETURN 0;
    END
END
GO

-- Seed the four templates the CFR Admin screen presents. Idempotent — safe to re-run.
-- TemplateId is not an IDENTITY column, so each insert assigns MAX(TemplateId) + 1 itself.
DECLARE @SeedTemplateId INT;

IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'PasswordReset')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [LinkExpiryMinutes], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'PasswordReset',
        N'Reset your Catholic Solutions password',
        N'<div style="font-family:''Segoe UI'',Helvetica,Arial,sans-serif;color:#0f172a;"><p style="margin:0 0 4px;font-size:13px;color:#64748b;">Hi [FirstName],</p><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style="text-align:center;margin:0 0 26px;"><a href="[ResetLink]" style="display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Reset Password</a></div><div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;"><p style="margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">If the button above doesn''t work, copy and paste this link into your browser:</p><p style="margin:0;font-size:12px;word-break:break-all;"><a href="[ResetLink]" style="color:[AccentColor];">[ResetLink]</a></p></div>',
        1,
        15,
        SYSUTCDATETIME(),
        0
    );
END

-- Backfill for an environment where the PasswordReset row already existed before this column was
-- added (the IF NOT EXISTS seed above only fires for a brand-new row) — keeps the configurable
-- value in sync with AcutisPasswordService's own fallback default instead of showing blank.
UPDATE [adm].[EmailTemplate]
SET [LinkExpiryMinutes] = 15
WHERE [TemplateCode] = N'PasswordReset'
  AND [LinkExpiryMinutes] IS NULL;

IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'Welcome')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'Welcome',
        N'Welcome to Catholic Solutions',
        N'<p>Hi [FirstName],</p><p>Your Catholic Solutions account is ready. Sign in to get started with your organization''s workspace.</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'AccessApproved')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'AccessApproved',
        N'Your application access request was approved',
        N'<p>Hi [FirstName],</p><p>Your request for access to [AppName] has been approved. You can now launch it from App Hub.</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'AccessInfo')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'AccessInfo',
        N'More information needed for your request',
        N'<p>Hi [FirstName],</p><p>We need a bit more information to process your request for [AppName]:</p><p>[Note]</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- Sent to the product's contact user when an admin clicks Send to Vendor on the Access Requests
-- page (CFR.Acutis AccessRequestService.SendToVendorEmailAsync). Text matches that method's
-- built-in fallback body.
IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'AccessSentToVendor')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'AccessSentToVendor',
        N'New customer request for [AppName]: [OrganizationName]',
        N'<p>Hello [ContactName],</p><p>A new product request for <strong>[AppName]</strong> has come through Catholic Solutions, and you have been requested for this product. Please reach out to the requester; the requester''s details are below.</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Submitted: [SubmittedDate]<br/>Notes: [Note]</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- The frontend's merge-tag list and AccessRequestService both fully support this 5th template
-- code (sent to the product support user - requester on CC - when a request is submitted from the
-- Request Access page; see CFR.Portal AccessRequestService.NotifyAdminsOfNewRequestAsync). It had no seed row here, so
-- it never appeared in the admin editor and always silently sent AccessRequestService's hardcoded
-- fallback body instead. Text matches that exact fallback (AccessRequestService.SendNewRequestEmailAsync).
IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'AccessRequested')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'AccessRequested',
        N'Review needed: [AppName] access request from [OrganizationName]',
        N'<p>Hello [SupportUserName],</p><p>A new access request for <strong>[AppName]</strong> has come through Catholic Solutions, and you have been requested for this product. Please review the request; the requester''s details are below.</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Submitted: [SubmittedDate]<br/>Goals &amp; context: [AdditionalInfo]</p><p><a href="[ReviewLink]">Review this request</a></p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- Sent to admins when a visitor submits the public "Suggest a product" form (CFR.Portal's
-- ProductRequestService.NotifyAdminsOfNewRequestAsync). Had no seed row here, same gap
-- AccessRequested had above, so it always silently sent that service's hardcoded fallback body
-- instead of appearing in the admin editor. Text matches that exact fallback.
IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'ProductRequested')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'ProductRequested',
        N'New product suggestion: [ProductName]',
        N'<p>A visitor has suggested a new product for the platform.</p><p><strong>Product:</strong> [ProductName] ([ShortName])</p><p><strong>Description:</strong> [Description]</p><p><strong>Production URL:</strong> [ProductionUrl]</p><p><strong>Features:</strong> [Features]</p><p><strong>Submitted by:</strong> [RequesterName] ([RequesterEmail])</p><p><a href="[ReviewLink]">Review this suggestion</a></p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- Sent back to the requester when an admin approves their suggestion (CFR.Acutis's
-- ProductRequestService.NotifyRequesterOfDecisionAsync, approved: true). Had no seed row here,
-- same gap ProductRequested had above, so it always silently sent that service's hardcoded
-- fallback body instead of appearing in the admin editor. Text matches that exact fallback.
IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'ProductRequestApproved')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'ProductRequestApproved',
        N'Your product suggestion was approved: [ProductName]',
        N'<p>Hi [FirstName],</p><p>Good news — your suggested product, [ProductName], has been approved and added to the platform.</p><p><strong>Client ID:</strong> [ClientId]</p><p><strong>Security Key:</strong> [SecurityKey]</p><p>Keep this security key confidential — use it with your Client ID for API access.</p><p><strong>Reviewer notes:</strong> [Remarks]</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- Upgrade guard: moves a ProductRequestApproved row seeded by an earlier run of this script onto
-- the current body ([ClientId]/[SecurityKey] merge tags - the product's [sec].[ApiClient] login).
-- Matches either earlier exact seed (the original remarks-only body, or the later one that showed
-- [ProductId] instead of [ClientId]), so a row an admin has since customized is left untouched.
UPDATE [adm].[EmailTemplate]
SET
    [Body] = N'<p>Hi [FirstName],</p><p>Good news — your suggested product, [ProductName], has been approved and added to the platform.</p><p><strong>Client ID:</strong> [ClientId]</p><p><strong>Security Key:</strong> [SecurityKey]</p><p>Keep this security key confidential — use it with your Client ID for API access.</p><p><strong>Reviewer notes:</strong> [Remarks]</p>',
    [UpdatedDate] = SYSUTCDATETIME()
WHERE [TemplateCode] = N'ProductRequestApproved'
  AND [IsDeleted] = 0
  AND [Body] IN (
      N'<p>Hi [FirstName],</p><p>Good news — your suggested product, [ProductName], has been approved and added to the platform.</p><p><strong>Reviewer notes:</strong> [Remarks]</p>',
      N'<p>Hi [FirstName],</p><p>Good news — your suggested product, [ProductName], has been approved and added to the platform.</p><p><strong>Product ID:</strong> [ProductId]</p><p><strong>Security Key:</strong> [SecurityKey]</p><p>Keep this security key confidential — it identifies your product for API access.</p><p><strong>Reviewer notes:</strong> [Remarks]</p>'
  );

-- Sent back to the requester when an admin rejects their suggestion (CFR.Acutis's
-- ProductRequestService.NotifyRequesterOfDecisionAsync, approved: false). Same gap as above.
IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'ProductRequestRejected')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'ProductRequestRejected',
        N'Your product suggestion was not approved: [ProductName]',
        N'<p>Hi [FirstName],</p><p>Thanks for suggesting [ProductName]. After review, we won''t be adding it at this time.</p><p><strong>Notes:</strong> [Remarks]</p>',
        1,
        SYSUTCDATETIME(),
        0
    );
END
GO

-- Upgrade guard: brings a pre-existing PasswordReset row seeded before the premium-HTML redesign
-- up to date. See the header comment above for the exact non-destructive matching conditions.
UPDATE [adm].[EmailTemplate]
SET
    [Subject] = N'Reset your Catholic Solutions password',
    [Body] = N'<div style="font-family:''Segoe UI'',Helvetica,Arial,sans-serif;color:#0f172a;"><p style="margin:0 0 4px;font-size:13px;color:#64748b;">Hi [FirstName],</p><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style="text-align:center;margin:0 0 26px;"><a href="[ResetLink]" style="display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Reset Password</a></div><div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;"><p style="margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">If the button above doesn''t work, copy and paste this link into your browser:</p><p style="margin:0;font-size:12px;word-break:break-all;"><a href="[ResetLink]" style="color:[AccentColor];">[ResetLink]</a></p></div>',
    [UpdatedDate] = SYSUTCDATETIME()
WHERE [TemplateCode] = N'PasswordReset'
  AND [IsDeleted] = 0
  AND [Subject] = N'Reset your CFR Acutis password'
  AND [Body] NOT LIKE N'%Reset Password</a>%' ESCAPE N'\';
GO

-- Upgrade guard #2: strips the redundant "Reset your password" heading and the closing
-- "if you didn't request this" line from a row still on the first HTML redesign, since the
-- subject line already says "Reset your password" and the disclaimer line is no longer wanted.
-- Guarded on the old heading still being present, so a row an admin has since customized (and
-- therefore no longer contains that exact heading) is left untouched.
UPDATE [adm].[EmailTemplate]
SET
    [Body] = N'<div style="font-family:''Segoe UI'',Helvetica,Arial,sans-serif;color:#0f172a;"><p style="margin:0 0 4px;font-size:13px;color:#64748b;">Hi [FirstName],</p><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style="text-align:center;margin:0 0 26px;"><a href="[ResetLink]" style="display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Reset Password</a></div><div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;"><p style="margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">If the button above doesn''t work, copy and paste this link into your browser:</p><p style="margin:0;font-size:12px;word-break:break-all;"><a href="[ResetLink]" style="color:[AccentColor];">[ResetLink]</a></p></div>',
    [UpdatedDate] = SYSUTCDATETIME()
WHERE [TemplateCode] = N'PasswordReset'
  AND [IsDeleted] = 0
  AND [Subject] = N'Reset your Catholic Solutions password'
  AND [Body] LIKE N'%<h1%Reset your password</h1>%' ESCAPE N'\';
GO
