-- Copyright (c) OptionC. All rights reserved.
-- Forgot/reset password CRUD for Acutis, backed by the existing shared [auth].[PasswordResetToken]
-- table. [UserScope] is constrained (CK__PasswordR__UserS__6FE99F9F) to 'member' or 'staff' only;
-- Acutis is the internal admin console, so its rows use 'staff'.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_PasswordReset_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_PasswordReset_CRUD];
GO

CREATE PROCEDURE [dbo].[Acutis_PasswordReset_CRUD]
    @ActionId INT,
    @Email NVARCHAR(256) = NULL,
    @TokenHash NVARCHAR(128) = NULL,
    @ExpiresAtUtc DATETIME2 = NULL,
    @NewPassword NVARCHAR(200) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;

    DECLARE @Scope NVARCHAR(20) = N'staff';

    -- ActionId 1: Request a password reset. Invalidates prior unused tokens for the matched
    -- user and stores the new token hash. Returns one row only when an active, unlocked account
    -- matches @Email; the API layer reports "no account found" when no row comes back (this app
    -- deliberately reveals account existence on this internal admin endpoint).
    IF @ActionId = 1
    BEGIN
        DECLARE @UserId BIGINT;
        DECLARE @HasActiveToken BIT = 0;

        SELECT TOP (1) @UserId = u.[UserId]
        FROM [auth].[AcutisUser] AS u
        WHERE u.[Email] = @Email
          AND u.[IsActive] = 1
          AND u.[IsLocked] = 0
          AND u.[IsDeleted] = 0;

        IF @UserId IS NULL
        BEGIN
            SET @ReturnValue = 0;
            RETURN @ReturnValue;
        END

        -- While an earlier link for this account is still unused AND unexpired, it is still a
        -- fully valid way in — a fresh request must not replace it and must not trigger another
        -- email. Without this, every resubmission immediately invalidates the still-good link and
        -- fires a brand new email, so "wait a couple of minutes and click again" (or an attacker
        -- repeatedly submitting someone else's address) silently defeats the 30-minute window
        -- entirely and can email-bomb the account holder's inbox. A new email is only ever sent
        -- again once the previous link has actually been used or has genuinely expired.
        IF EXISTS (
            SELECT 1
            FROM [auth].[PasswordResetToken] AS t
            WHERE t.[UserId] = @UserId
              AND t.[UserScope] = @Scope
              AND t.[UsedAt] IS NULL
              AND t.[ExpiresAt] > SYSUTCDATETIME()
        )
        BEGIN
            SET @HasActiveToken = 1;
        END

        IF @HasActiveToken = 1
        BEGIN
            -- Report the same account row (so the API layer can tell this apart from "no account
            -- found") but issue no new token and send no new email — the still-active link from
            -- the earlier request remains the one to use.
            SELECT
                u.[UserId],
                u.[Email],
                u.[FirstName],
                u.[LastName],
                CAST(1 AS BIT) AS [RateLimited]
            FROM [auth].[AcutisUser] AS u
            WHERE u.[UserId] = @UserId;

            SET @ReturnValue = @UserId;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[PasswordResetToken]
        SET [UsedAt] = SYSUTCDATETIME()
        WHERE [UserId] = @UserId
          AND [UserScope] = @Scope
          AND [UsedAt] IS NULL;

        INSERT INTO [auth].[PasswordResetToken] ([UserScope], [UserId], [TokenHash], [ExpiresAt], [CreatedDate])
        VALUES (@Scope, @UserId, @TokenHash, @ExpiresAtUtc, SYSUTCDATETIME());

        SELECT
            u.[UserId],
            u.[Email],
            u.[FirstName],
            u.[LastName],
            CAST(0 AS BIT) AS [RateLimited]
        FROM [auth].[AcutisUser] AS u
        WHERE u.[UserId] = @UserId;

        SET @ReturnValue = @UserId;
        RETURN @ReturnValue;
    END

    -- ActionId 2: Complete a password reset. Validates the token hash is unused and unexpired,
    -- updates the password (encrypted the same way as Acutis_Users_CRUD), and marks the token
    -- consumed so it cannot be replayed.
    -- Claiming the token is a single atomic UPDATE (not a SELECT followed by a separate UPDATE) —
    -- SQL Server row-locks the matched row for the duration of the UPDATE, so two concurrent
    -- completions racing on the same still-unused token can never both succeed: only the first
    -- UPDATE's WHERE clause can still see [UsedAt] IS NULL, the second sees it already set and
    -- claims nothing. A SELECT-then-UPDATE pair would leave a window where both could read the
    -- token as valid before either commits its own UPDATE.
    IF @ActionId = 2
    BEGIN
        DECLARE @ClaimedToken TABLE ([TokenId] BIGINT, [UserId] BIGINT);
        DECLARE @TokenId BIGINT;
        DECLARE @ResetUserId BIGINT;

        UPDATE [auth].[PasswordResetToken]
        SET [UsedAt] = SYSUTCDATETIME()
        OUTPUT INSERTED.[TokenId], INSERTED.[UserId] INTO @ClaimedToken ([TokenId], [UserId])
        WHERE [TokenHash] = @TokenHash
          AND [UserScope] = @Scope
          AND [UsedAt] IS NULL
          AND [ExpiresAt] > SYSUTCDATETIME();

        SELECT TOP (1) @TokenId = [TokenId], @ResetUserId = [UserId] FROM @ClaimedToken;

        IF @TokenId IS NULL
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisUser]
        SET [Password] = dbo.EncryptUserPassword(@NewPassword)
        WHERE [UserId] = @ResetUserId;

        SET @ReturnValue = @ResetUserId;
        RETURN @ReturnValue;
    END
END
GO
