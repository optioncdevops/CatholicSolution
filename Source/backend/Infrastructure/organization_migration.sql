-- Copyright (c) OptionC. All rights reserved.
-- Migrates organizations from OPTIONC COM / FFIS into CFRPortal.
--
-- CORRECTED for the current schema (post 016_Acutis_Organization_Rebuild.sql):
--   core.Organization   : key is now [ID] (INT IDENTITY, was OrgId BIGINT manually assigned).
--                          No longer has OrgStatus / Address / City / State / Zip at all.
--   lic.OrganizationProduct : link column is now [CFROrgId] (was OrgId), requires [ProductOrgId]
--                          (NOT NULL - defaulted to CFROrgId, no external product-system id yet,
--                          same convention as 008_Acutis_Organization.sql ActionId 8),
--                          and now carries its OWN per-product copy of OrgName/OrgState/OrgCountry/
--                          ContactEmail/Website/ContactPerson/ContactPhone/OrgStatus PLUS
--                          Address/City/State/Zip (Organization no longer carries these at all,
--                          so this is the only place they can live now).
--                          AssignStatus and OrgStatus are INT, not NVARCHAR:
--                            OrgStatus    : 1 = Active, 2 = Inactive, 3 = Suspended
--                            AssignStatus : 1 = Active, 2 = Suspended, 3 = Revoked
--
-- Because [ID] is now an IDENTITY column but this migration still needs to preserve the source
-- system's OrganizationID as the primary key (the whole 15000-15999 product split depends on it),
-- Stage 1A/1B insert with SET IDENTITY_INSERT ON.

USE [CFRPortal];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY

    BEGIN TRANSACTION;


    /* ============================================================
       STAGE 1A
       INSERT ORGANIZATIONS FROM OPTIONC COM

       Base data comes from:
           optionccom.dbo.Organization_BASE

       Filter:
           IsDemoSchool = 0
           SchoolCategory = 1

       NOTE:
           15000-15999 are inserted from OPTIONC COM first.
           They will be updated from FFIS in the next step.
           Address/City/State/Zip are NOT set here - core.Organization has no such columns
           anymore. They are populated on lic.OrganizationProduct in STAGE 2.
       ============================================================ */

    SET IDENTITY_INSERT [CFRPortal].[core].[Organization] ON;

    INSERT INTO [CFRPortal].[core].[Organization]
    (
        [ID],
        [OrgName],
        [OrgState],
        [OrgCountry],
        [ContactEmail],
        [Website],
        [ContactPerson],
        [ContactPhone],
        [InsertedDate],
        [InsertedBy],
        [UpdatedDate],
        [UpdatedBy],
        [IsDeleted]
    )
    SELECT
        S.[OrganizationID],

        S.[OrganizationName],

        S.[OrgState],

        S.[OrgCountry],

        COALESCE
        (
            NULLIF(S.[PrincipalEMail], ''),
            NULLIF(S.[SchoolEMail], '')
        ),

        S.[SiteURL],

        NULLIF
        (
            LTRIM
            (
                RTRIM
                (
                    COALESCE(S.[PrincipalFirst], '')
                    +
                    CASE
                        WHEN NULLIF(S.[PrincipalFirst], '') IS NOT NULL
                         AND NULLIF(S.[PrincipalLast], '') IS NOT NULL
                        THEN ' '
                        ELSE ''
                    END
                    +
                    COALESCE(S.[PrincipalLast], '')
                )
            ),
            ''
        ),

        S.[OrgMainPhone],

        SYSUTCDATETIME(),

        NULL,

        NULL,

        NULL,

        0

    FROM [optionccom].[dbo].[Organization_BASE] S

    WHERE S.[IsDemoSchool] = 0
      AND S.[SchoolCategory] = 1

      /* Do not insert an existing ID */
      AND NOT EXISTS
      (
          SELECT 1
          FROM [CFRPortal].[core].[Organization] T
          WHERE T.[ID] = S.[OrganizationID]
      );


    PRINT 'STAGE 1A COMPLETED - OPTIONC COM organizations inserted';


    /* ============================================================
       STAGE 1B
       INSERT ORGANIZATIONS WHICH EXIST ONLY IN FFIS

       If an organization does not exist in OPTIONC COM,
       insert it from FFIS.

       This prevents duplicate ID.
       ============================================================ */

    INSERT INTO [CFRPortal].[core].[Organization]
    (
        [ID],
        [OrgName],
        [OrgState],
        [OrgCountry],
        [ContactEmail],
        [Website],
        [ContactPerson],
        [ContactPhone],
        [InsertedDate],
        [InsertedBy],
        [UpdatedDate],
        [UpdatedBy],
        [IsDeleted]
    )
    SELECT
        F.[OrganizationID],

        F.[OrganizationName],

        F.[OrgState],

        F.[OrgCountry],

        COALESCE
        (
            NULLIF(F.[PrincipalEMail], ''),
            NULLIF(F.[SchoolEMail], '')
        ),

        F.[SiteURL],

        NULLIF
        (
            LTRIM
            (
                RTRIM
                (
                    COALESCE(F.[PrincipalFirst], '')
                    +
                    CASE
                        WHEN NULLIF(F.[PrincipalFirst], '') IS NOT NULL
                         AND NULLIF(F.[PrincipalLast], '') IS NOT NULL
                        THEN ' '
                        ELSE ''
                    END
                    +
                    COALESCE(F.[PrincipalLast], '')
                )
            ),
            ''
        ),

        F.[OrgMainPhone],

        SYSUTCDATETIME(),

        NULL,

        NULL,

        NULL,

        0

    FROM [optionccom_ffis].[dbo].[Organization_BASE] F

    WHERE F.[IsDemoSchool] = 0
      AND F.[SchoolCategory] = 1

      /* Insert only if ID is not already present */
      AND NOT EXISTS
      (
          SELECT 1
          FROM [CFRPortal].[core].[Organization] T
          WHERE T.[ID] = F.[OrganizationID]
      );

    SET IDENTITY_INSERT [CFRPortal].[core].[Organization] OFF;


    PRINT 'STAGE 1B COMPLETED - FFIS-only organizations inserted';


    /* ============================================================
       STAGE 1C
       UPDATE 15000-15999 FROM PARISH / FFIS

       IMPORTANT:

       The OPTIONC COM record is the BASE record.

       For ID 15000-15999:
           OPTIONC COM data
                  +
           FFIS / Parish data
                  ↓
           UPDATE core.Organization

       We do NOT INSERT another record.

       Only columns that still exist on core.Organization are updated here.
       Address/City/State/Zip are handled in STAGE 2, against OrganizationProduct.
       ============================================================ */

    UPDATE O
    SET

        /* Organization Name */
        O.[OrgName] =
            COALESCE
            (
                NULLIF(F.[OrganizationName], ''),
                O.[OrgName]
            ),

        /* Existing OrgState */
        O.[OrgState] =
            COALESCE
            (
                NULLIF(F.[OrgState], ''),
                O.[OrgState]
            ),

        /* Country */
        O.[OrgCountry] =
            COALESCE
            (
                NULLIF(F.[OrgCountry], ''),
                O.[OrgCountry]
            ),

        /* Email */
        O.[ContactEmail] =
            COALESCE
            (
                NULLIF(F.[PrincipalEMail], ''),
                NULLIF(F.[SchoolEMail], ''),
                O.[ContactEmail]
            ),

        /* Website */
        O.[Website] =
            COALESCE
            (
                NULLIF(F.[SiteURL], ''),
                O.[Website]
            ),

        /* Contact Person */
        O.[ContactPerson] =
            COALESCE
            (
                NULLIF
                (
                    LTRIM
                    (
                        RTRIM
                        (
                            COALESCE(F.[PrincipalFirst], '')
                            +
                            CASE
                                WHEN NULLIF(F.[PrincipalFirst], '') IS NOT NULL
                                 AND NULLIF(F.[PrincipalLast], '') IS NOT NULL
                                THEN ' '
                                ELSE ''
                            END
                            +
                            COALESCE(F.[PrincipalLast], '')
                        )
                    ),
                    ''
                ),
                O.[ContactPerson]
            ),

        /* Phone */
        O.[ContactPhone] =
            COALESCE
            (
                NULLIF(F.[OrgMainPhone], ''),
                O.[ContactPhone]
            ),

        O.[UpdatedDate] =
            SYSUTCDATETIME(),

        O.[IsDeleted] =
            0

    FROM [CFRPortal].[core].[Organization] O

    INNER JOIN [optionccom_ffis].[dbo].[Organization_BASE] F

        ON O.[ID] = F.[OrganizationID]

    WHERE O.[ID] BETWEEN 15000 AND 15999

      AND F.[IsDemoSchool] = 0
      AND F.[SchoolCategory] = 1;


    PRINT 'STAGE 1C COMPLETED - 15000-15999 updated from Parish/FFIS';


    /* ============================================================
       RESOLVE ADDRESS DATA PER ORGANIZATION

       Address/City/State/Zip no longer live on core.Organization - they now live only
       on lic.OrganizationProduct (a per-product snapshot). This resolves, for every
       organization, which source row is authoritative for that address data using the
       same precedence STAGE 1A/1B/1C used for the rest of the fields:
           - ID 15000-15999 : FFIS overrides OPTIONC COM (FFIS is more current for these).
           - all other IDs  : OPTIONC COM if present, else the FFIS-only row (STAGE 1B case).
       ============================================================ */

    SELECT
        O.[ID] AS [OrgId],

        CASE WHEN O.[ID] BETWEEN 15000 AND 15999 THEN 2 ELSE 1 END AS [ProductId],

        CASE
            WHEN O.[ID] BETWEEN 15000 AND 15999
                THEN COALESCE(NULLIF(F.[OrgAddress], ''), NULLIF(S.[OrgAddress], ''))
            ELSE COALESCE(NULLIF(S.[OrgAddress], ''), NULLIF(F.[OrgAddress], ''))
        END AS [Address],

        CASE
            WHEN O.[ID] BETWEEN 15000 AND 15999
                THEN COALESCE(NULLIF(F.[OrgCity], ''), NULLIF(S.[OrgCity], ''))
            ELSE COALESCE(NULLIF(S.[OrgCity], ''), NULLIF(F.[OrgCity], ''))
        END AS [City],

        CASE
            WHEN O.[ID] BETWEEN 15000 AND 15999
                THEN COALESCE(NULLIF(F.[OrgState], ''), NULLIF(S.[OrgState], ''))
            ELSE COALESCE(NULLIF(S.[OrgState], ''), NULLIF(F.[OrgState], ''))
        END AS [State],

        CASE
            WHEN O.[ID] BETWEEN 15000 AND 15999
                THEN COALESCE(NULLIF(F.[OrgPostalCode], ''), NULLIF(S.[OrgPostalCode], ''))
            ELSE COALESCE(NULLIF(S.[OrgPostalCode], ''), NULLIF(F.[OrgPostalCode], ''))
        END AS [Zip]

    INTO #OrgProductAddress

    FROM [CFRPortal].[core].[Organization] O

    LEFT JOIN [optionccom].[dbo].[Organization_BASE] S
        ON S.[OrganizationID] = O.[ID]
       AND S.[IsDemoSchool] = 0
       AND S.[SchoolCategory] = 1

    LEFT JOIN [optionccom_ffis].[dbo].[Organization_BASE] F
        ON F.[OrganizationID] = O.[ID]
       AND F.[IsDemoSchool] = 0
       AND F.[SchoolCategory] = 1;


    PRINT 'ADDRESS RESOLUTION COMPLETED - #OrgProductAddress populated';


    /* ============================================================
       STAGE 2
       CREATE ORGANIZATION PRODUCT

       Product Mapping:

           OrgId 15000-15999 -> ProductId 2
           Other OrgIds      -> ProductId 1

       lic.OrganizationProduct now carries its own snapshot of the org's identity fields
       PLUS Address/City/State/Zip (resolved above into #OrgProductAddress) - this is the
       "organization product sub table" entry the address data actually belongs on now.

       ProductOrgId has no external-product-system value available yet, so it is defaulted
       to CFROrgId - same convention already used in 008_Acutis_Organization.sql ActionId 8.

       Active dates:
           2021-01-01
           2030-12-31
       ============================================================ */

    INSERT INTO [CFRPortal].[lic].[OrganizationProduct]
    (
        [CFROrgId],
        [ProductOrgId],
        [ProductId],
        [OrgName],
        [OrgState],
        [OrgCountry],
        [ContactEmail],
        [Website],
        [ContactPerson],
        [ContactPhone],
        [OrgStatus],
        [Address],
        [City],
        [State],
        [Zip],
        [AssignStatus],
        [AssignedBy],
        [Remarks],
        [ActiveStartDate],
        [ActiveEndDate],
        [CreatedDate],
        [InsertedBy],
        [UpdatedDate],
        [UpdatedBy],
        [IsDeleted]
    )
    SELECT

        O.[ID],

        /* ProductOrgId - defaulted to CFROrgId until product integrations supply their own */
        O.[ID],

        CASE
            WHEN O.[ID] BETWEEN 15000 AND 15999
                THEN 2
            ELSE 1
        END,

        O.[OrgName],
        O.[OrgState],
        O.[OrgCountry],
        O.[ContactEmail],
        O.[Website],
        O.[ContactPerson],
        O.[ContactPhone],

        /* OrgStatus: 1 = Active */
        1,

        AP.[Address],
        AP.[City],
        AP.[State],
        AP.[Zip],

        /* AssignStatus: 1 = Active */
        1,

        NULL,

        /* Remarks EMPTY */
        NULL,

        /* Active Start */
        CAST('2021-01-01 00:00:00' AS DATETIME),

        /* Active End */
        CAST('2030-12-31 23:59:59' AS DATETIME),

        SYSUTCDATETIME(),

        NULL,

        NULL,

        NULL,

        0

    FROM [CFRPortal].[core].[Organization] O

    INNER JOIN #OrgProductAddress AP
        ON AP.[OrgId] = O.[ID]

    WHERE NOT EXISTS
    (
        SELECT 1

        FROM [CFRPortal].[lic].[OrganizationProduct] OP

        WHERE OP.[CFROrgId] = O.[ID]

          AND OP.[ProductId] =
              CASE
                  WHEN O.[ID] BETWEEN 15000 AND 15999
                      THEN 2
                  ELSE 1
              END
    );


    PRINT 'STAGE 2 COMPLETED - OrganizationProduct inserted with Address/City/State/Zip';


    /* ============================================================
       STAGE 3
       CREATE LICENSE

       Activation:
           2021-01-01

       Expiry:
           2030-12-31

       Remarks = NULL

       lic.License was not part of the 016 rebuild - its columns are unchanged, still
       keyed only by OrganizationProductId, so this stage is otherwise as before.
       ============================================================ */

    INSERT INTO [CFRPortal].[lic].[License]
    (
        [OrganizationProductId],
        [LicenseType],
        [ActivationDate],
        [ExpiryDate],
        [LicenseStatus],
        [IssuedBy],
        [Remarks],
        [CreatedDate],
        [InsertedBy],
        [UpdatedDate],
        [UpdatedBy]
    )
    SELECT

        OP.[OrganizationProductId],

        'subscription',

        CAST('2021-01-01' AS date),

        CAST('2030-12-31' AS date),

        'active',

        NULL,

        /* Remarks EMPTY */
        NULL,

        SYSUTCDATETIME(),

        NULL,

        NULL,

        NULL

    FROM [CFRPortal].[lic].[OrganizationProduct] OP

    WHERE OP.[ProductId] IN (1, 2)

      AND NOT EXISTS
      (
          SELECT 1

          FROM [CFRPortal].[lic].[License] L

          WHERE L.[OrganizationProductId] =
                OP.[OrganizationProductId]
      );


    PRINT 'STAGE 3 COMPLETED - License inserted';


    /* ============================================================
       STAGE 4
       UPDATE ORGANIZATION PRODUCT DATES

       This guarantees all migrated Product records have:

           ActiveStartDate = 2021-01-01
           ActiveEndDate   = 2030-12-31

           Remarks = NULL
       ============================================================ */

    UPDATE OP

    SET

        OP.[ActiveStartDate] =
            CAST('2021-01-01 00:00:00' AS DATETIME),

        OP.[ActiveEndDate] =
            CAST('2030-12-31 23:59:59' AS DATETIME),

        OP.[Remarks] =
            NULL,

        OP.[UpdatedDate] =
            SYSUTCDATETIME()

    FROM [CFRPortal].[lic].[OrganizationProduct] OP

    WHERE OP.[ProductId] IN (1, 2);


    /* ============================================================
       UPDATE LICENSE REMARKS

       Make Remarks empty.
       ============================================================ */

    UPDATE L

    SET
        L.[Remarks] = NULL

    FROM [CFRPortal].[lic].[License] L

    INNER JOIN [CFRPortal].[lic].[OrganizationProduct] OP

        ON OP.[OrganizationProductId] =
           L.[OrganizationProductId]

    WHERE OP.[ProductId] IN (1, 2);


    PRINT 'STAGE 4 COMPLETED - Dates and Remarks updated';


    DROP TABLE #OrgProductAddress;


    /* ============================================================
       COMMIT
       ============================================================ */

    COMMIT TRANSACTION;


    PRINT '';
    PRINT '============================================================';
    PRINT 'MIGRATION COMPLETED SUCCESSFULLY';
    PRINT '============================================================';


    /* ============================================================
       VALIDATION 1
       ORGANIZATION COUNT
       ============================================================ */

    SELECT
        'core.Organization' AS [TableName],
        COUNT(*) AS [TotalRecords]
    FROM [CFRPortal].[core].[Organization];


    /* ============================================================
       VALIDATION 2
       ORGANIZATION PRODUCT
       ============================================================ */

    SELECT
        [ProductId],
        COUNT(*) AS [OrganizationCount]
    FROM [CFRPortal].[lic].[OrganizationProduct]

    WHERE [ProductId] IN (1, 2)

    GROUP BY [ProductId]

    ORDER BY [ProductId];


    /* ============================================================
       VALIDATION 3
       LICENSE
       ============================================================ */

    SELECT
        [LicenseStatus],
        [ActivationDate],
        [ExpiryDate],
        COUNT(*) AS [LicenseCount]

    FROM [CFRPortal].[lic].[License] L

    INNER JOIN [CFRPortal].[lic].[OrganizationProduct] OP

        ON OP.[OrganizationProductId] =
           L.[OrganizationProductId]

    WHERE OP.[ProductId] IN (1, 2)

    GROUP BY
        [LicenseStatus],
        [ActivationDate],
        [ExpiryDate];


    /* ============================================================
       VALIDATION 4
       CHECK 15000-15999

       Address/City/State/Zip now come from OrganizationProduct (OP), not Organization (O) -
       Organization no longer carries those columns.
       ============================================================ */

    SELECT
        O.[ID] AS [OrgId],
        O.[OrgName],
        O.[OrgState],
        O.[OrgCountry],

        OP.[Address],
        OP.[City],
        OP.[State],
        OP.[Zip],

        O.[ContactEmail],
        O.[Website],
        O.[ContactPerson],
        O.[ContactPhone],

        OP.[ProductId],
        OP.[OrgStatus],
        OP.[AssignStatus],
        OP.[ActiveStartDate],
        OP.[ActiveEndDate],
        OP.[Remarks]

    FROM [CFRPortal].[core].[Organization] O

    LEFT JOIN [CFRPortal].[lic].[OrganizationProduct] OP

        ON OP.[CFROrgId] = O.[ID]

    WHERE O.[ID] BETWEEN 15000 AND 15999

    ORDER BY O.[ID];


END TRY

BEGIN CATCH

    /* ============================================================
       ROLLBACK
       ============================================================ */

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    IF OBJECT_ID('tempdb..#OrgProductAddress') IS NOT NULL
        DROP TABLE #OrgProductAddress;


    PRINT '';
    PRINT '============================================================';
    PRINT 'MIGRATION FAILED';
    PRINT 'ALL CHANGES HAVE BEEN ROLLED BACK';
    PRINT '============================================================';


    SELECT
        ERROR_NUMBER() AS [ErrorNumber],
        ERROR_MESSAGE() AS [ErrorMessage],
        ERROR_LINE() AS [ErrorLine],
        ERROR_PROCEDURE() AS [ErrorProcedure];


    THROW;

END CATCH;
GO
