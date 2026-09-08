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

-- AccentColor/LogoUrl/FontFamily/BaseFontSize used to be per-template branding overrides here.
-- Branding is now platform-wide instead (the admin Email Settings page, file-backed — see
-- ConfSettingsService/SMTPMailConfig in CFR.CommonService), so this procedure no longer reads or
-- writes those four columns; a template is Subject/Body content only. The columns themselves are
-- deliberately left in place on [adm].[EmailTemplate] (not dropped) rather than risk an
-- irreversible schema change — they're just unused dead columns now.
IF OBJECT_ID(N'[dbo].[Acutis_EmailTemplates_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_EmailTemplates_CRUD];
GO

-- ActionId 1: Save (insert when @TemplateId = 0, otherwise update Subject/Body/Status).
-- ActionId 2: Get by TemplateId.
-- ActionId 3: Get list (all templates).
-- ActionId 4: Get by TemplateCode (used internally by AcutisPasswordService to load PasswordReset).
CREATE PROCEDURE [dbo].[Acutis_EmailTemplates_CRUD]
    @ActionId INT,
    @TemplateId INT = 0,
    @TemplateCode NVARCHAR(50) = NULL,
    @Subject NVARCHAR(200) = NULL,
    @Body NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(20) = NULL,
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
                [TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @TemplateId,
                @TemplateCode,
                @Subject,
                @Body,
                CASE WHEN @Status = N'inactive' THEN 0 ELSE 1 END,
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

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'PasswordReset',
        N'Reset your Catholic Solutions password',
        N'<div style="font-family:''Segoe UI'',Helvetica,Arial,sans-serif;color:#0f172a;"><p style="margin:0 0 4px;font-size:13px;color:#64748b;">Hi [FirstName],</p><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;">We received a request to reset the password for your Catholic Solutions account. Click the button below to choose a new password.</p><div style="text-align:center;margin:0 0 26px;"><a href="[ResetLink]" style="display:inline-block;padding:14px 34px;background-color:[AccentColor];color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Reset Password</a></div><div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;"><p style="margin:0;font-size:12.5px;color:[AccentColor];font-weight:700;">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">If the button above doesn''t work, copy and paste this link into your browser:</p><p style="margin:0;font-size:12px;word-break:break-all;"><a href="[ResetLink]" style="color:[AccentColor];">[ResetLink]</a></p></div>',
        1,
        SYSUTCDATETIME(),
        0
    );
END

IF NOT EXISTS (SELECT 1 FROM [adm].[EmailTemplate] WHERE [TemplateCode] = N'Welcome')
BEGIN
    SELECT @SeedTemplateId = ISNULL(MAX([TemplateId]), 0) + 1 FROM [adm].[EmailTemplate];

    INSERT INTO [adm].[EmailTemplate] ([TemplateId], [TemplateCode], [Subject], [Body], [IsActive], [CreatedDate], [IsDeleted])
    VALUES
    (
        @SeedTemplateId,
        N'Welcome',
        N'Welcome to Catholic Solutions',
        N'Hi [FirstName],

Your Catholic Solutions account is ready. Sign in to get started with your organization''s workspace.',
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
        N'Hi [FirstName],

Your request for access to [AppName] has been approved. You can now launch it from App Hub.',
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
        N'Hi [FirstName],

We need a bit more information to process your request for [AppName]:

[Note]',
        1,
        SYSUTCDATETIME(),
        0
    );
END

-- The frontend's merge-tag list and AccessRequestService both fully support this 5th template
-- code (sent to admins when a member submits a new access request); it had no seed row here, so
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
        N'New access request for [AppName]',
        N'<p>A member has requested access and needs an admin review.</p><p><strong>Requester:</strong> [RequesterName] ([RequesterEmail])</p><p><strong>Organization:</strong> [OrganizationName]</p><p><strong>Application:</strong> [AppName]</p><p><a href="[ReviewLink]">Review this request</a></p>',
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
