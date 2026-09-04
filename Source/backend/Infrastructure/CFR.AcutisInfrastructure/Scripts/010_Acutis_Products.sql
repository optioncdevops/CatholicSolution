-- Copyright (c) OptionC. All rights reserved.
-- App Hub and the sign-in showcase read the same Products/GetProducts list
-- as CFR Admin (Acutis_Products_CRUD ActionId 4 / ProductOutput).
-- Do not replace that stored procedure with a hub-only procedure.
-- LogoUrl is a genuine [core].[Product] column read by ProductOutput/HubProductOutput and by
-- request.AccessRequest_CRUD's App Hub query (ActionId 6) — added here idempotently because it
-- was missing on a live database (confirmed via the "Invalid column name 'LogoUrl'" error thrown
-- from Acutis_AccessRequest_CRUD, whose column-existence checks bind against the whole procedure
-- body, not just the executed branch, so a missing column in ANY ActionId's SELECT breaks every
-- ActionId in that procedure).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Product' AND COLUMN_NAME = 'LogoUrl'
)
BEGIN
    ALTER TABLE [core].[Product] ADD [LogoUrl] NVARCHAR(500) NULL;
END
GO
