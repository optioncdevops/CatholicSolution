-- Copyright (c) OptionC. All rights reserved.
-- Upgrades an already-seeded [adm].[EmailTemplate] "PasswordReset" row (inserted by
-- 006_Acutis_EmailTemplates.sql before this redesign) to the new premium HTML content.
-- Idempotent and non-destructive: only touches the row when its Subject still matches the
-- original seed's Subject exactly (some environments picked up incidental whitespace/encoding
-- drift in Body when 006's seed was first run, so Body is not compared character-for-character)
-- and Body does not already contain this redesign's marker text, so an admin who customized the
-- Subject or already re-ran this script keeps their own content untouched.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

UPDATE [adm].[EmailTemplate]
SET
    [Subject] = N'Reset your Catholic Solutions password',
    [Body] = N'<div style="font-family:''Segoe UI'',Helvetica,Arial,sans-serif;color:#0f172a;"><h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a;">Reset your password</h1><p style="margin:0 0 20px;font-size:13px;color:#64748b;">Hi [FirstName], we received a request to reset the password on your Catholic Solutions account.</p><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#1e293b;">Click the button below to choose a new password. For your security, this link can only be used once.</p><div style="text-align:center;margin:0 0 26px;"><a href="[ResetLink]" style="display:inline-block;padding:14px 34px;background-color:#1d4ed8;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Reset Password</a></div><div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:0 0 22px;"><p style="margin:0;font-size:12.5px;color:#1d4ed8;font-weight:700;">This link expires in [ExpiryMinutes] minutes and can only be used once.</p></div><p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">If the button above doesn''t work, copy and paste this link into your browser:</p><p style="margin:0 0 22px;font-size:12px;word-break:break-all;"><a href="[ResetLink]" style="color:#1d4ed8;">[ResetLink]</a></p><p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">If you didn''t request this, you can safely ignore this email. Your password will stay the same.</p></div>',
    [UpdatedDate] = SYSUTCDATETIME()
WHERE [TemplateCode] = N'PasswordReset'
  AND [IsDeleted] = 0
  AND [Subject] = N'Reset your CFR Acutis password'
  AND [Body] NOT LIKE N'%Reset Password</a>%' ESCAPE N'\';
GO
