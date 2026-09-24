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

-- "New Access Request" (sent to the product support user, requester on CC, when the Request Access
-- form is submitted). Its old text was addressed to "[RequesterName]" / "admin review" and carried
-- only the requester, organization and application - wrong recipient and missing the address,
-- phone, submitted date and goals. Upgraded from the original seed body and from the edited copy
-- saved in the admin editor ("Dear [RequesterName] ... Thanks, Admin Team"); any other custom text
-- is left alone.
UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hello [SupportUserName],</p><p>A new access request for <strong>[AppName]</strong> has come through Catholic Solutions, and you have been requested for this product. Please review the request; the requester''s details are below.</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Submitted: [SubmittedDate]<br/>Goals &amp; context: [AdditionalInfo]</p><p><a href="[ReviewLink]">Review this request</a></p>'
WHERE [TemplateCode] = N'AccessRequested'
  AND [IsDeleted] = 0
  AND [Body] IN (
      N'<p>A member has requested access and needs an admin review.</p><p><strong>Requester:</strong> [RequesterName] ([RequesterEmail])</p><p><strong>Organization:</strong> [OrganizationName]</p><p><strong>Application:</strong> [AppName]</p><p><a href="[ReviewLink]">Review this request</a></p>',
      N'<p><b>Dear [RequesterName]</b></p><p><br></p><p>A member has requested access and needs an admin review.</p><p><br></p><p><strong>Requester:</strong> [RequesterName]&nbsp;</p><p><b>Email Id : </b>[RequesterEmail]</p><p><strong>Organization:</strong> [OrganizationName]</p><p><strong>Application:</strong> [AppName]</p><p><br></p><p><a href="[ReviewLink]">Review this request</a></p><p><br></p><p><b>Thanks</b></p><p><b>Admin Team</b></p>'
  );
GO

-- Its subject must not read like the Send to Vendor email's ("New customer request for [AppName]:
-- [OrganizationName]"), so the earlier "New access request for ..." subjects are replaced. A custom
-- subject is left alone.
UPDATE [adm].[EmailTemplate]
SET [Subject] = N'Review needed: [AppName] access request from [OrganizationName]'
WHERE [TemplateCode] = N'AccessRequested'
  AND [IsDeleted] = 0
  AND LTRIM(RTRIM([Subject])) IN (N'New access request for [AppName]', N'New access request for [AppName]: [OrganizationName]');
GO

-- "Request Sent to Vendor": a copy of the first draft of this email was saved as a template before
-- the wording was finalized (generic "Hello," greeting, Organization type / Application rows).
-- Upgrades only that exact draft body to the current text (same as 006's seed and
-- AccessRequestService.SendToVendorEmailAsync's fallback) - an admin-edited template is left alone.
UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hello [ContactName],</p><p>A new product request for <strong>[AppName]</strong> has come through Catholic Solutions, and you have been requested for this product. Please reach out to the requester; the requester''s details are below.</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Submitted: [SubmittedDate]<br/>Notes: [Note]</p>'
WHERE [TemplateCode] = N'AccessSentToVendor'
  AND [IsDeleted] = 0
  AND [Body] IN (
      N'<p>Hello,</p><p>A Catholic Solutions access request for <strong>[AppName]</strong> has been sent to you. Please contact the requester and add them to [AppName].</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Organization type: [OrganizationType]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Application: [AppName]<br/>Submitted: [SubmittedDate]<br/>Notes: [Note]</p>',
      N'<p>Hello [ContactName],</p><p>A new product request for <strong>[AppName]</strong> has come through Catholic Solutions, and you are listed as the contact for this product. Please reach out to the requester and add them to [AppName].</p><p><strong>Request details</strong><br/>Organization: [OrganizationName]<br/>Address: [OrganizationAddress]<br/>Contact name: [RequesterName]<br/>Contact email: [RequesterEmail]<br/>Contact phone: [Phone]<br/>Submitted: [SubmittedDate]<br/>Notes: [Note]</p>'
  );
GO

UPDATE [adm].[EmailTemplate]
SET [Body] = N'<p>Hi [FirstName],</p><p>We need a bit more information to process your request for [AppName]:</p><p>[Note]</p>'
WHERE [TemplateCode] = N'AccessInfo'
  AND [IsDeleted] = 0
  AND [Body] = N'Hi [FirstName],

We need a bit more information to process your request for [AppName]:

[Note]';
GO
