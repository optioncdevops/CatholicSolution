-- Copyright (c) OptionC. All rights reserved.
-- Self-service profile (get/update) and change-password CRUD for the signed-in Acutis user,
-- against the existing [auth].[AcutisUser] table (same table Acutis_DoLogin/Acutis_Users_CRUD use).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[dbo].[Acutis_Profile_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[Acutis_Profile_CRUD];
GO

-- ActionId 1: Get the signed-in user's profile.
-- ActionId 2: Update the signed-in user's FirstName/LastName/Email.
-- ActionId 3: Change the signed-in user's password after verifying the current one.
CREATE PROCEDURE [dbo].[Acutis_Profile_CRUD]
    @ActionId INT,
    @UserId BIGINT,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @Email NVARCHAR(256) = NULL,
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
            u.[Email]
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
        IF NOT EXISTS (
            SELECT 1 FROM [auth].[AcutisUser]
            WHERE [UserId] = @UserId
              AND [IsDeleted] = 0
              AND dbo.DecryptUserPassword([Password]) = @CurrentPassword
        )
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
