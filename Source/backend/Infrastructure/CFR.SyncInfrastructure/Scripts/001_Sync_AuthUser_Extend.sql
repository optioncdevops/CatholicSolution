-- Copyright (c) OptionC. All rights reserved.
-- CFR.Sync Phase 1 — extends [auth].[User] for the product/user sync API.
-- Idempotent: safe to re-run against a database that already has these changes.
--
--   1. Adds a computed, persisted NormalizedEmail column (LOWER(LTRIM(RTRIM(Email))))
--      and a unique index on it, so "one person = one CFR identity" is enforced by
--      the database, not just by application code.
--   2. Makes Password nullable — CFR.Sync creates auth.User rows for members it has
--      never seen a password for; CFR's own onboarding flow sets Password later.
--   3. Adds UpdatedDate / UpdatedBy — not present on auth.User today (confirmed via
--      every existing script that touches this table); CFR.Sync needs them to track
--      who/when last touched a synced identity.
--
-- Before creating the unique index, this script raises a descriptive error listing
-- any existing case-insensitive duplicate emails instead of letting CREATE INDEX fail
-- with an opaque duplicate-key error — those rows must be resolved by a human first.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1a. NormalizedEmail computed column.
IF COL_LENGTH(N'[auth].[User]', N'NormalizedEmail') IS NULL
BEGIN
    ALTER TABLE [auth].[User]
        ADD [NormalizedEmail] AS (LOWER(LTRIM(RTRIM([Email])))) PERSISTED;
END
GO

-- 1b. Duplicate-email guard, run every time — cheap, and protects against a duplicate
-- being inserted between an earlier run of this script and today by some other path.
IF EXISTS (
    SELECT 1
    FROM [auth].[User]
    WHERE [NormalizedEmail] IS NOT NULL
    GROUP BY [NormalizedEmail]
    HAVING COUNT(*) > 1
)
BEGIN
    DECLARE @DupList NVARCHAR(MAX) = (
        SELECT STRING_AGG(CAST([NormalizedEmail] AS NVARCHAR(MAX)), N', ')
        FROM (
            SELECT DISTINCT [NormalizedEmail]
            FROM [auth].[User]
            WHERE [NormalizedEmail] IS NOT NULL
            GROUP BY [NormalizedEmail]
            HAVING COUNT(*) > 1
        ) AS dups
    );

    RAISERROR(
        N'[auth].[User] has case-insensitive duplicate emails, so UX_User_NormalizedEmail cannot be created: %s. Resolve these rows (merge or update) before re-running this script.',
        16, 1, @DupList
    );
    RETURN;
END
GO

-- 1c. Unique index over the normalized email — only created once duplicates are clear.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_User_NormalizedEmail' AND object_id = OBJECT_ID(N'[auth].[User]')
)
BEGIN
    CREATE UNIQUE INDEX [UX_User_NormalizedEmail] ON [auth].[User] ([NormalizedEmail]);
END
GO

-- 2. Password becomes nullable — CFR.Sync-created identities have no password until
-- CFR's own onboarding flow sets one.
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[auth].[User]') AND name = N'Password' AND is_nullable = 0
)
BEGIN
    DECLARE @PasswordType NVARCHAR(128) = (
        SELECT t.name + CASE WHEN t.name IN (N'varbinary', N'binary', N'varchar', N'nvarchar', N'char', N'nchar')
                              THEN N'(' + CASE WHEN c.max_length = -1 THEN N'MAX' ELSE CAST(
                                  CASE WHEN t.name IN (N'nvarchar', N'nchar') THEN c.max_length / 2 ELSE c.max_length END AS NVARCHAR(10)) END + N')'
                              ELSE N'' END
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'[auth].[User]') AND c.name = N'Password'
    );

    EXEC(N'ALTER TABLE [auth].[User] ALTER COLUMN [Password] ' + @PasswordType + N' NULL');
END
GO

-- 3. UpdatedDate / UpdatedBy — not present on auth.User today.
IF COL_LENGTH(N'[auth].[User]', N'UpdatedDate') IS NULL
BEGIN
    ALTER TABLE [auth].[User] ADD [UpdatedDate] DATETIME NULL;
END
GO

IF COL_LENGTH(N'[auth].[User]', N'UpdatedBy') IS NULL
BEGIN
    ALTER TABLE [auth].[User] ADD [UpdatedBy] INT NULL;
END
GO
