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
            u.[LastName]
        FROM [auth].[AcutisUser] AS u
        WHERE u.[UserId] = @UserId;

        SET @ReturnValue = @UserId;
        RETURN @ReturnValue;
    END

    -- ActionId 2: Complete a password reset. Validates the token hash is unused and unexpired,
    -- updates the password (encrypted the same way as Acutis_Users_CRUD), and marks the token
    -- consumed so it cannot be replayed.
    IF @ActionId = 2
    BEGIN
        DECLARE @TokenId BIGINT;
        DECLARE @ResetUserId BIGINT;

        SELECT TOP (1)
            @TokenId = t.[TokenId],
            @ResetUserId = t.[UserId]
        FROM [auth].[PasswordResetToken] AS t
        WHERE t.[TokenHash] = @TokenHash
          AND t.[UserScope] = @Scope
          AND t.[UsedAt] IS NULL
          AND t.[ExpiresAt] > SYSUTCDATETIME();

        IF @TokenId IS NULL
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisUser]
        SET [Password] = dbo.EncryptUserPassword(@NewPassword)
        WHERE [UserId] = @ResetUserId;

        UPDATE [auth].[PasswordResetToken]
        SET [UsedAt] = SYSUTCDATETIME()
        WHERE [TokenId] = @TokenId;

        SET @ReturnValue = @ResetUserId;
        RETURN @ReturnValue;
    END
END
GO
