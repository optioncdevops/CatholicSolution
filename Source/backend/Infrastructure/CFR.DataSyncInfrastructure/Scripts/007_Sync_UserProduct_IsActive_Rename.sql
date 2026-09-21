-- Copyright (c) OptionC. All rights reserved.
-- CFR.DataSync Phase 1 — renames [auth].[UserProduct].[IsLockedOut] to [IsActive], inverting its
-- semantics: IsActive = 1 now means the membership is active/usable (i.e. NOT locked out),
-- matching the natural reading of an "IsActive" column name. Idempotent: safe to re-run.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH(N'[auth].[UserProduct]', N'IsLockedOut') IS NOT NULL
   AND COL_LENGTH(N'[auth].[UserProduct]', N'IsActive') IS NULL
BEGIN
    EXEC sp_rename N'[auth].[UserProduct].[IsLockedOut]', N'IsActive', N'COLUMN';
END
GO

-- sp_rename takes effect immediately, but a same-batch statement referencing the new name still
-- resolves against cached pre-rename metadata — this must be its own batch.
IF COL_LENGTH(N'[auth].[UserProduct]', N'IsActive') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.extended_properties WHERE name = N'CFRSync_IsActive_Inverted' AND major_id = OBJECT_ID(N'[auth].[UserProduct]'))
BEGIN
    -- Existing values were stored under IsLockedOut's meaning (1 = locked out) — invert them so
    -- IsActive keeps its own, opposite meaning (1 = active/usable).
    UPDATE [auth].[UserProduct]
    SET [IsActive] = CASE WHEN [IsActive] = 1 THEN 0 ELSE 1 END;

    EXEC sys.sp_addextendedproperty
        @name = N'CFRSync_IsActive_Inverted', @value = 1,
        @level0type = N'SCHEMA', @level0name = N'auth',
        @level1type = N'TABLE', @level1name = N'UserProduct';
END
GO
