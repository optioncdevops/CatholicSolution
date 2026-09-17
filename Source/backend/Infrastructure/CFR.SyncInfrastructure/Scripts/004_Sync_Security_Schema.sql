-- Copyright (c) OptionC. All rights reserved.
-- CFR.Sync Phase 1 — new [sec] schema: HMAC API-client registry, replay-nonce ledger,
-- and idempotency-key store. Idempotent: safe to re-run.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'sec')
BEGIN
    EXEC('CREATE SCHEMA [sec]');
END
GO

-- One row per downstream product's signing credential.
--
-- DEVIATION FROM THE LITERAL SPEC, DELIBERATE: the spec describes storing a
-- "PBKDF2-SHA256 hash" of the client secret. That works for password-style login
-- (client resends the secret, server hashes what it received and compares hashes)
-- but NOT for HMAC request signing — the server must independently compute
-- HMAC-SHA256(canonicalString, ClientSecret) using the *actual* secret bytes, and a
-- one-way hash cannot be reversed back into those bytes. So the secret is stored
-- AES-256-GCM ENCRYPTED (reversible, decryption key from HmacSettings config — see
-- CFR.Sync/appsettings.json), not hashed. ClientSecretEncrypted holds
-- Nonce(12) || Tag(16) || Ciphertext concatenated. Previous* columns support
-- zero-downtime secret rotation (Phase 2 admin endpoint) — the old secret keeps
-- validating until PreviousSecretExpiresDate passes.
IF OBJECT_ID(N'[sec].[ApiClient]', N'U') IS NULL
BEGIN
    CREATE TABLE [sec].[ApiClient]
    (
        [ApiClientId]                 INT IDENTITY(1,1) NOT NULL,
        [ClientId]                    NVARCHAR(100) NOT NULL,
        [ClientSecretEncrypted]       VARBINARY(200) NOT NULL,
        [ProductId]                   INT NOT NULL,
        [DisplayName]                 NVARCHAR(255) NULL,
        [AllowedScopes]               NVARCHAR(500) NOT NULL, -- comma-separated: users:write,users:bulk,orgs:read
        [RateLimitPerMinute]          INT NOT NULL CONSTRAINT [DF_ApiClient_RateLimitPerMinute] DEFAULT (60),
        [IsActive]                    BIT NOT NULL CONSTRAINT [DF_ApiClient_IsActive] DEFAULT (1),
        [SecretRotatedDate]           DATETIME NULL,
        [PreviousSecretEncrypted]     VARBINARY(200) NULL,
        [PreviousSecretExpiresDate]   DATETIME NULL,
        [CreatedDate]                 DATETIME NOT NULL CONSTRAINT [DF_ApiClient_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [InsertedBy]                  NVARCHAR(100) NULL,

        CONSTRAINT [PK_ApiClient] PRIMARY KEY ([ApiClientId]),
        CONSTRAINT [UX_ApiClient_ClientId] UNIQUE ([ClientId])
    );
END
GO

-- Replay-protection ledger: a request is a replay if (ClientId, Nonce) already
-- exists. The PK violation itself IS the replay signal — no separate SELECT needed.
-- A hosted service (Phase 2) purges rows older than the clock-skew window.
IF OBJECT_ID(N'[sec].[RequestNonce]', N'U') IS NULL
BEGIN
    CREATE TABLE [sec].[RequestNonce]
    (
        [ClientId]     NVARCHAR(100) NOT NULL,
        [Nonce]        NVARCHAR(100) NOT NULL,
        [RequestedAt]  DATETIME NOT NULL CONSTRAINT [DF_RequestNonce_RequestedAt] DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT [PK_RequestNonce] PRIMARY KEY ([ClientId], [Nonce])
    );
END
GO

-- One row per (ApiClientId, IdempotencyKey): stores the exact response returned the
-- first time a key was used, so a retried request with the same key gets the same
-- response instead of re-running the operation. A hosted service (Phase 2) purges
-- rows past ExpiresDate.
IF OBJECT_ID(N'[sec].[IdempotencyRecord]', N'U') IS NULL
BEGIN
    CREATE TABLE [sec].[IdempotencyRecord]
    (
        [ApiClientId]          INT NOT NULL,
        [IdempotencyKey]       NVARCHAR(200) NOT NULL,
        [RequestHash]          VARBINARY(32) NOT NULL, -- SHA-256 of the raw request body
        [ResponseStatusCode]   INT NOT NULL,
        [ResponseBody]         NVARCHAR(MAX) NOT NULL,
        [CreatedDate]          DATETIME NOT NULL CONSTRAINT [DF_IdempotencyRecord_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [ExpiresDate]          DATETIME NOT NULL,

        CONSTRAINT [PK_IdempotencyRecord] PRIMARY KEY ([ApiClientId], [IdempotencyKey])
    );
END
GO
