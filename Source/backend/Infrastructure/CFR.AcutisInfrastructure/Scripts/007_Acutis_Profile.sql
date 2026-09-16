-- Copyright (c) OptionC. All rights reserved.
-- Self-service profile (get/update) and change-password CRUD for the signed-in Acutis user,
-- against the existing [auth].[AcutisUser] table (same table Acutis_DoLogin/Acutis_Users use).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = N'auth' AND TABLE_NAME = N'AcutisUser' AND COLUMN_NAME = N'ProfileImageUrl'
)
BEGIN
    ALTER TABLE [auth].[AcutisUser] ADD [ProfileImageUrl] NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = N'auth' AND TABLE_NAME = N'AcutisUser' AND COLUMN_NAME = N'ContactNumber'
)
BEGIN
    ALTER TABLE [auth].[AcutisUser] ADD [ContactNumber] NVARCHAR(30) NULL;
END
GO

IF OBJECT_ID(N'[dbo].[Acutis_Profile]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Profile];
GO

-- ActionId 1: Get the signed-in user's profile.
-- ActionId 2: Update the signed-in user's FirstName/LastName/Email/ProfileImageUrl/ContactNumber.
-- ActionId 3: Change the signed-in user's password after verifying the current one.
CREATE PROCEDURE [dbo].[Acutis_Profile]
    @ActionId INT,
    @UserId BIGINT,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(256) = NULL,
    @ProfileImageUrl NVARCHAR(500) = NULL,
    @ContactNumber NVARCHAR(30) = NULL,
    @CurrentPassword NVARCHAR(200) = NULL,
    @NewPassword NVARCHAR(200) = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ReturnValue = 0;

    IF @ActionId = 1
    BEGIN
        SELECT
            u.[UserId],
            u.[FirstName],
            u.[LastName],
            u.[Email],
            u.[ProfileImageUrl],
            u.[ContactNumber]
        FROM [auth].[AcutisUser] AS u
        WHERE u.[UserId] = @UserId
          AND u.[IsDeleted] = 0;
        RETURN 0;
    END

    IF @ActionId = 2
    BEGIN
        IF EXISTS (
            SELECT 1 FROM [auth].[AcutisUser]
            WHERE [Email] = @Email
              AND [UserId] <> @UserId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisUser]
        SET
            [FirstName] = @FirstName,
            [LastName] = @LastName,
            [Email] = @Email,
            [ProfileImageUrl] = @ProfileImageUrl,
            [ContactNumber] = @ContactNumber,
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UserId
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@UserId AS INT);
        RETURN @ReturnValue;
    END

    IF @ActionId = 3
    BEGIN
        -- Compare via DecryptUserPassword (matches how Acutis_DoLogin verifies credentials) —
        -- EncryptUserPassword is not guaranteed deterministic, so re-encrypting and comparing
        -- ciphertext would reject a correct current password.
        --
        -- Two differences from the original version of this check, both to match
        -- Acutis_DoLogin's own proven-working call exactly (see 005_Acutis_Users.sql) instead of
        -- a guessed variant:
        --  1) [Password] is explicitly CONVERT(VARBINARY(128), ...) before being decrypted,
        --     rather than passed to dbo.DecryptUserPassword as-is. Login already does this
        --     conversion; automated testing showed this procedure throwing a generic error on a
        --     current-password check for an account that logs in fine, which is consistent with
        --     DecryptUserPassword needing that same explicit conversion here too.
        --  2) The stored password is fetched into a variable and decrypted on its own, rather
        --     than calling dbo.DecryptUserPassword([Password]) directly inside a WHERE clause
        --     alongside [UserId] = @UserId — SQL Server does not guarantee AND-ed predicates
        --     evaluate in the order they're written, so a scalar UDF called that way can run
        --     against other rows before the UserId filter narrows the scan to just this one.
        --     Isolating the one row first guarantees the function only ever sees this user's
        --     own data.
        DECLARE @StoredPassword VARBINARY(128);

        SELECT @StoredPassword = CONVERT(VARBINARY(128), [Password])
        FROM [auth].[AcutisUser]
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        IF @StoredPassword IS NULL OR dbo.DecryptUserPassword(@StoredPassword) <> @CurrentPassword
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        UPDATE [auth].[AcutisUser]
        SET
            [Password] = dbo.EncryptUserPassword(@NewPassword),
            [UpdatedDate] = SYSUTCDATETIME(),
            [UpdatedBy] = @UserId
        WHERE [UserId] = @UserId
          AND [IsDeleted] = 0;

        SET @ReturnValue = CAST(@UserId AS INT);
        RETURN @ReturnValue;
    END
END
GO
