-- Copyright (c) OptionC. All rights reserved.
-- Fixes the "More Information Needed" / Welcome / "Access Approved" email templates: their seed
-- bodies (006_Acutis_EmailTemplates.sql) were plain text with literal blank-line separators
-- ("Hi [FirstName],\n\n...\n\n[Note]") instead of real HTML block elements. Browsers and email
-- clients collapse consecutive whitespace/newlines when rendering HTML, so the paragraph breaks
-- visually disappeared everywhere this body is rendered - the WYSIWYG editor, and every actual
-- sent email.
--
-- 006's own seed INSERTs are updated to the fixed HTML for any brand-new environment, but that
-- IF NOT EXISTS guard never re-fires once a row already exists - this script backfills already-
-- seeded environments. Each UPDATE is guarded on the row still holding the EXACT original
-- plain-text body, so an environment where an admin already edited one of these templates through
-- the UI is left untouched - only a still-pristine, never-edited row gets upgraded.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hi [FirstName],</p><p>Your Catholic Solutions account is ready. Sign in to get started with your organization''s workspace.</p>'
WHERE [TemplateCode] = N'Welcome'
  AND [IsDeleted] = 0
  AND [Body] = N'Hi [FirstName],

Your Catholic Solutions account is ready. Sign in to get started with your organization''s workspace.';
GO

UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hi [FirstName],</p><p>Your request for access to [AppName] has been approved. You can now launch it from App Hub.</p>'
WHERE [TemplateCode] = N'AccessApproved'
  AND [IsDeleted] = 0
  AND [Body] = N'Hi [FirstName],

Your request for access to [AppName] has been approved. You can now launch it from App Hub.';
GO

UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hi [FirstName],</p><p>We need a bit more information to process your request for [AppName]:</p><p>[Note]</p>'
WHERE [TemplateCode] = N'AccessInfo'
  AND [IsDeleted] = 0
  AND [Body] = N'Hi [FirstName],

We need a bit more information to process your request for [AppName]:

[Note]';
GO
