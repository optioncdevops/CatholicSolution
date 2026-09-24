-- Copyright (c) OptionC. All rights reserved.
-- Allows the new "sent-to-vendor" product-line status on [request].[AccessRequestProduct].
-- LineStatus: 1 = requested, 2 = approved, 3 = rejected, 4 = sent-to-vendor
-- (see [request].[AccessRequestManage] ActionId 2 in 025_Acutis_AccessRequest_PerProduct_Approval.sql).
-- Two things blocked Send to Vendor, both only knowing 1/2/3:
--   * CK_AccessRequestProduct_LineStatus (CHECK constraint) - widened below to 1/2/3/4.
--   * FK_AccessRequestProduct_LineStatus -> [request].[LineStatusLookup] - a row for 4 is added below.
-- Idempotent: safe to re-run.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[request].[LineStatusLookup]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [request].[LineStatusLookup] WHERE [LineStatus] = 4)
BEGIN
    INSERT INTO [request].[LineStatusLookup] ([LineStatus], [StatusLabel])
    VALUES (4, N'Sent to Vendor');
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = N'CK_AccessRequestProduct_LineStatus'
      AND [parent_object_id] = OBJECT_ID(N'[request].[AccessRequestProduct]')
)
BEGIN
    ALTER TABLE [request].[AccessRequestProduct] DROP CONSTRAINT [CK_AccessRequestProduct_LineStatus];
END
GO

ALTER TABLE [request].[AccessRequestProduct] WITH CHECK
    ADD CONSTRAINT [CK_AccessRequestProduct_LineStatus] CHECK ([LineStatus] IN (1, 2, 3, 4));
GO
