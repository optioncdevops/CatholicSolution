-- Copyright (c) OptionC. All rights reserved.
-- CFR.Sync Phase 1 — new [audit] schema: insert-only sync audit trail. Idempotent:
-- safe to re-run.
--
-- NOTE: this script creates the table only. Restricting UPDATE/DELETE grants on it
-- (so it is enforced as insert-only, not just insert-only by convention) requires a
-- DBA with permission-management access on the live database/login — the app's own
-- migration login typically cannot grant/deny permissions on itself. Track that as a
-- follow-up with whoever owns CFRPortal's security.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'audit')
BEGIN
    EXEC('CREATE SCHEMA [audit]');
END
GO

IF OBJECT_ID(N'[audit].[UserSyncAudit]', N'U') IS NULL
BEGIN
    CREATE TABLE [audit].[UserSyncAudit]
    (
        [AuditId]           BIGINT IDENTITY(1,1) NOT NULL,
        [TraceId]            NVARCHAR(100) NOT NULL,
        [ApiClientId]        INT NOT NULL,
        [ProductId]          INT NOT NULL,
        [Operation]          NVARCHAR(50) NOT NULL, -- Created|Updated|Reactivated|NoChange|Deactivated|EmailRebind
        [CFRUserId]          BIGINT NULL,
        [CFRUserDetailId]    BIGINT NULL,
        [Email]              NVARCHAR(256) NULL,
        [BeforeJson]         NVARCHAR(MAX) NULL,
        [AfterJson]          NVARCHAR(MAX) NULL,
        [ResultCode]         NVARCHAR(50) NOT NULL,
        [SourceIp]           NVARCHAR(64) NULL,
        [RequestedAt]        DATETIME NOT NULL CONSTRAINT [DF_UserSyncAudit_RequestedAt] DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT [PK_UserSyncAudit] PRIMARY KEY ([AuditId])
    );

    CREATE INDEX [IX_UserSyncAudit_CFRUserId] ON [audit].[UserSyncAudit] ([CFRUserId]);
    CREATE INDEX [IX_UserSyncAudit_ApiClientId_RequestedAt] ON [audit].[UserSyncAudit] ([ApiClientId], [RequestedAt]);
END
GO
