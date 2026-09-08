-- Copyright (c) OptionC. All rights reserved.
-- Access Request CRUD against [request] tables.
-- Header RequestStatus: 1=pending, 2=in_review, 3=completed, 4=cancelled.
-- Line LineStatus: 1=pending, 2=approved, 3=rejected.
-- RequestType: 1=new, 2=renewal.
-- Requester identity: [auth].[User] by email -> CFRUserId.
-- Name, org, and product assignment: [auth].[UserProduct] by CFRUserId.
-- [auth].[User] columns: CFRUserId, Email (no UserId / FirstName / LastName / OrgId / IsDeleted).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'Address'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [Address] NVARCHAR(300) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'City'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [City] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'State'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [State] NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'core' AND TABLE_NAME = 'Organization' AND COLUMN_NAME = 'Zip'
)
BEGIN
    ALTER TABLE [core].[Organization] ADD [Zip] NVARCHAR(20) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'RequesterFirstName'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [RequesterFirstName] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'RequesterLastName'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [RequesterLastName] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'ContactEmail'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [ContactEmail] NVARCHAR(256) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'ContactPhone'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [ContactPhone] NVARCHAR(30) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'request' AND TABLE_NAME = 'AccessRequest' AND COLUMN_NAME = 'OrganizationType'
)
BEGIN
    ALTER TABLE [request].[AccessRequest] ADD [OrganizationType] NVARCHAR(100) NULL;
END
GO

IF OBJECT_ID(N'[request].[AccessRequest_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [request].[AccessRequest_CRUD];
GO

-- ActionId 1: Save (insert header, product line, history, optional member comment).
-- ActionId 2: Update status (approve / reject / request info).
-- ActionId 3: Get by AccessRequestId (header, timeline, comments).
-- ActionId 4: Get list.
-- ActionId 5: Recipients for the AccessRequested email, matched by product name/id.
-- ActionId 6: App Hub products. [auth].[User] by email -> [auth].[UserProduct] -> [core].[Product].
-- ActionId 7: Public Request Access save (create/reuse org with address, request header, product lines).
CREATE PROCEDURE [request].[AccessRequest_CRUD]
    @ActionId INT,
    @AccessRequestId BIGINT = 0,
    @ProductId INT = NULL,
    @ProductName NVARCHAR(100) = NULL,
    @RequesterEmail NVARCHAR(256) = NULL,
    @Comment NVARCHAR(1000) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Note NVARCHAR(500) = NULL,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @OrganizationType NVARCHAR(100) = NULL,
    @OrganizationName NVARCHAR(200) = NULL,
    @Address NVARCHAR(300) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(50) = NULL,
    @Zip NVARCHAR(20) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @ProductsJson NVARCHAR(MAX) = NULL,
    @InsertedBy BIGINT = NULL,
    @UpdatedBy BIGINT = NULL,
    @ReturnValue INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @ProductId = NULLIF(@ProductId, 0);
    SET @AccessRequestId = ISNULL(@AccessRequestId, 0);
    SET @ProductName = NULLIF(LTRIM(RTRIM(@ProductName)), N'');
    SET @RequesterEmail = NULLIF(LTRIM(RTRIM(@RequesterEmail)), N'');
    SET @Comment = NULLIF(LTRIM(RTRIM(@Comment)), N'');
    SET @Note = NULLIF(LTRIM(RTRIM(@Note)), N'');
    SET @FirstName = NULLIF(LTRIM(RTRIM(@FirstName)), N'');
    SET @LastName = NULLIF(LTRIM(RTRIM(@LastName)), N'');
    SET @OrganizationType = NULLIF(LTRIM(RTRIM(@OrganizationType)), N'');
    SET @OrganizationName = NULLIF(LTRIM(RTRIM(@OrganizationName)), N'');
    SET @Address = NULLIF(LTRIM(RTRIM(@Address)), N'');
    SET @City = NULLIF(LTRIM(RTRIM(@City)), N'');
    SET @State = NULLIF(LTRIM(RTRIM(@State)), N'');
    SET @Zip = NULLIF(LTRIM(RTRIM(@Zip)), N'');
    SET @Phone = NULLIF(LTRIM(RTRIM(@Phone)), N'');
    SET @ProductsJson = NULLIF(LTRIM(RTRIM(@ProductsJson)), N'');
    SET @Status = LOWER(REPLACE(LTRIM(RTRIM(ISNULL(@Status, N''))), N'_', N'-'));

    IF @ActionId = 1
    BEGIN
        DECLARE @RequestedBy BIGINT;
        DECLARE @OrgId BIGINT;
        DECLARE @NewRequestId BIGINT;
        DECLARE @ActorId BIGINT;

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        IF @ProductId IS NULL OR NOT EXISTS (
            SELECT 1
            FROM [core].[Product]
            WHERE [ProductId] = @ProductId
              AND [IsDeleted] = 0
        )
        BEGIN
            SET @ReturnValue = -97;
            RETURN @ReturnValue;
        END

        SELECT @RequestedBy = u.[CFRUserId]
        FROM [auth].[User] u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);

        IF @RequestedBy IS NULL
        BEGIN
            SET @ReturnValue = -98;
            RETURN @ReturnValue;
        END

        SELECT TOP (1) @OrgId = up.[OrgId]
        FROM [auth].[UserProduct] up
        WHERE up.[CFRUserId] = @RequestedBy
          AND ISNULL(up.[IsDeleted], 0) = 0
          AND up.[OrgId] IS NOT NULL
        ORDER BY up.[CFRUserDetailId];

        IF @OrgId IS NULL
        BEGIN
            SET @ReturnValue = -96;
            RETURN @ReturnValue;
        END

        SET @ActorId = ISNULL(@InsertedBy, @RequestedBy);

        IF EXISTS (
            SELECT 1
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId]
               AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
              AND ar.[RequestedBy] = @RequestedBy
              AND ar.[OrgId] = @OrgId
              AND arp.[ProductId] = @ProductId
              AND ar.[RequestStatus] IN (1, 2)
              AND arp.[LineStatus] = 1
        )
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO [request].[AccessRequest]
            (
                [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
                [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @OrgId, @RequestedBy, N'member_portal', @Comment, 1,
                SYSUTCDATETIME(), SYSUTCDATETIME(), @ActorId, 0
            );

            SET @NewRequestId = SCOPE_IDENTITY();

            INSERT INTO [request].[AccessRequestProduct]
            (
                [AccessRequestId], [ProductId], [RequestType], [LineStatus],
                [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @NewRequestId, @ProductId, 1, 1,
                SYSUTCDATETIME(), @ActorId, 0
            );

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @NewRequestId, NULL, 1, N'Request submitted',
                @RequestedBy, NULL, SYSUTCDATETIME(), @ActorId
            );

            IF @Comment IS NOT NULL
            BEGIN
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @NewRequestId, N'member', @RequestedBy, @Comment,
                    SYSUTCDATETIME(), @ActorId
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@NewRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SET @ReturnValue = 0;
            RETURN @ReturnValue;
        END CATCH
    END

    IF @ActionId = 7
    BEGIN
        DECLARE @PublicRequestedBy BIGINT;
        DECLARE @PublicOrgId BIGINT;
        DECLARE @PublicRequestId BIGINT;
        DECLARE @PublicActorId BIGINT;
        DECLARE @ContactPerson NVARCHAR(200);
        DECLARE @ResolvedProducts TABLE ([ProductId] INT NOT NULL PRIMARY KEY);

        IF @OrganizationName IS NULL OR @RequesterEmail IS NULL OR @FirstName IS NULL OR @LastName IS NULL
           OR @Address IS NULL OR @City IS NULL OR @State IS NULL OR @Zip IS NULL
        BEGIN
            SET @ReturnValue = -93;
            RETURN @ReturnValue;
        END

        IF @ProductsJson IS NOT NULL AND ISJSON(@ProductsJson) = 1
        BEGIN
            INSERT INTO @ResolvedProducts ([ProductId])
            SELECT DISTINCT resolved.[ProductId]
            FROM OPENJSON(@ProductsJson) AS j
            CROSS APPLY (
                SELECT
                    TRY_CAST(JSON_VALUE(j.[value], '$.productId') AS INT) AS [ParsedId],
                    NULLIF(LTRIM(RTRIM(JSON_VALUE(j.[value], '$.productName'))), N'') AS [Name]
            ) AS parsed
            CROSS APPLY (
                SELECT COALESCE(
                    (
                        SELECT p.[ProductId]
                        FROM [core].[Product] p
                        WHERE p.[IsDeleted] = 0
                          AND parsed.[ParsedId] IS NOT NULL
                          AND parsed.[ParsedId] > 0
                          AND p.[ProductId] = parsed.[ParsedId]
                    ),
                    (
                        SELECT p.[ProductId]
                        FROM [core].[Product] p
                        WHERE p.[IsDeleted] = 0
                          AND parsed.[Name] IS NOT NULL
                          AND p.[ProductName] = parsed.[Name]
                    )
                ) AS [ProductId]
            ) AS resolved
            WHERE resolved.[ProductId] IS NOT NULL;
        END

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            IF @ProductId IS NULL AND @ProductName IS NOT NULL
            BEGIN
                SELECT @ProductId = p.[ProductId]
                FROM [core].[Product] p
                WHERE p.[IsDeleted] = 0
                  AND p.[ProductName] = @ProductName;
            END

            IF @ProductId IS NOT NULL
            BEGIN
                INSERT INTO @ResolvedProducts ([ProductId])
                SELECT @ProductId
                WHERE EXISTS (
                    SELECT 1 FROM [core].[Product]
                    WHERE [ProductId] = @ProductId AND [IsDeleted] = 0
                );
            END
        END

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            SET @ReturnValue = -97;
            RETURN @ReturnValue;
        END

        SELECT @PublicRequestedBy = u.[CFRUserId]
        FROM [auth].[User] u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);

        IF @PublicRequestedBy IS NULL
        BEGIN
            BEGIN TRY
                INSERT INTO [auth].[User] ([Email], [Password], [CreatedDate], [InsertedBy])
                VALUES (@RequesterEmail, CONVERT(VARBINARY(64), NEWID()), SYSUTCDATETIME(), -1);

                SELECT @PublicRequestedBy = u.[CFRUserId]
                FROM [auth].[User] u
                WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);
            END TRY
            BEGIN CATCH
                SELECT @PublicRequestedBy = u.[CFRUserId]
                FROM [auth].[User] u
                WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);
            END CATCH
        END

        SELECT TOP (1) @PublicOrgId = o.[OrgId]
        FROM [core].[Organization] o
        WHERE o.[IsDeleted] = 0
          AND LOWER(LTRIM(RTRIM(o.[OrgName]))) = LOWER(@OrganizationName)
          AND LOWER(LTRIM(RTRIM(ISNULL(o.[ContactEmail], N'')))) = LOWER(@RequesterEmail)
        ORDER BY o.[OrgId];

        SET @ContactPerson = LTRIM(RTRIM(ISNULL(@FirstName, N'') + N' ' + ISNULL(@LastName, N'')));
        SET @PublicActorId = ISNULL(@InsertedBy, @PublicRequestedBy);

        DELETE FROM rp
        FROM @ResolvedProducts rp
        WHERE EXISTS (
            SELECT 1
            FROM [request].[AccessRequest] ar
            INNER JOIN [request].[AccessRequestProduct] arp
                ON arp.[AccessRequestId] = ar.[AccessRequestId]
               AND arp.[IsDeleted] = 0
            WHERE ar.[IsDeleted] = 0
              AND arp.[ProductId] = rp.[ProductId]
              AND ar.[RequestStatus] IN (1, 2)
              AND arp.[LineStatus] = 1
              AND (
                    (@PublicRequestedBy IS NOT NULL AND ar.[RequestedBy] = @PublicRequestedBy)
                 OR LOWER(LTRIM(RTRIM(ISNULL(ar.[ContactEmail], N'')))) = LOWER(@RequesterEmail)
              )
        );

        IF NOT EXISTS (SELECT 1 FROM @ResolvedProducts)
        BEGIN
            SET @ReturnValue = -99;
            RETURN @ReturnValue;
        END

        BEGIN TRY
            BEGIN TRANSACTION;

            IF @PublicOrgId IS NULL
            BEGIN
                SELECT @PublicOrgId = ISNULL(MAX([OrgId]), 0) + 1 FROM [core].[Organization];

                INSERT INTO [core].[Organization]
                (
                    [OrgId], [OrgName], [OrgStatus], [ContactEmail], [ContactPerson], [ContactPhone],
                    [Address], [City], [State], [Zip],
                    [InsertedDate], [InsertedBy], [IsDeleted]
                )
                VALUES
                (
                    @PublicOrgId, @OrganizationName, N'inactive', @RequesterEmail, @ContactPerson, @Phone,
                    @Address, @City, @State, @Zip,
                    SYSUTCDATETIME(), @PublicActorId, 0
                );
            END
            ELSE
            BEGIN
                UPDATE [core].[Organization]
                SET
                    [ContactEmail] = ISNULL(@RequesterEmail, [ContactEmail]),
                    [ContactPerson] = ISNULL(NULLIF(@ContactPerson, N''), [ContactPerson]),
                    [ContactPhone] = ISNULL(@Phone, [ContactPhone]),
                    [Address] = ISNULL(@Address, [Address]),
                    [City] = ISNULL(@City, [City]),
                    [State] = ISNULL(@State, [State]),
                    [Zip] = ISNULL(@Zip, [Zip]),
                    [UpdatedDate] = SYSUTCDATETIME(),
                    [UpdatedBy] = @PublicActorId
                WHERE [OrgId] = @PublicOrgId
                  AND [IsDeleted] = 0;
            END

            INSERT INTO [request].[AccessRequest]
            (
                [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
                [RequesterFirstName], [RequesterLastName], [ContactEmail], [ContactPhone], [OrganizationType],
                [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                @PublicOrgId, @PublicRequestedBy, N'external_page', @Comment, 1,
                @FirstName, @LastName, @RequesterEmail, @Phone, @OrganizationType,
                SYSUTCDATETIME(), SYSUTCDATETIME(), @PublicActorId, 0
            );

            SET @PublicRequestId = SCOPE_IDENTITY();

            INSERT INTO [request].[AccessRequestProduct]
            (
                [AccessRequestId], [ProductId], [RequestType], [LineStatus],
                [InsertedDate], [InsertedBy], [IsDeleted]
            )
            SELECT
                @PublicRequestId, rp.[ProductId], 1, 1,
                SYSUTCDATETIME(), @PublicActorId, 0
            FROM @ResolvedProducts rp;

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @PublicRequestId, NULL, 1, N'Request submitted',
                @PublicRequestedBy, NULL, SYSUTCDATETIME(), @PublicActorId
            );

            IF @Comment IS NOT NULL
            BEGIN
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @PublicRequestId, N'member', ISNULL(@PublicRequestedBy, 0), @Comment,
                    SYSUTCDATETIME(), @PublicActorId
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@PublicRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SET @ReturnValue = 0;
            RETURN @ReturnValue;
        END CATCH
    END

    IF @ActionId = 2
    BEGIN
        DECLARE @LineId BIGINT;
        DECLARE @LineStatus INT;
        DECLARE @LineProductId INT;
        DECLARE @HeaderStatus INT;
        DECLARE @NextLineStatus INT;
        DECLARE @NextHeaderStatus INT;
        DECLARE @HistoryStatus INT;
        DECLARE @HistoryLineId BIGINT;
        DECLARE @AccessDays INT;

        IF @AccessRequestId <= 0 OR @Status NOT IN (N'approved', N'rejected', N'info-requested', N'in-review')
        BEGIN
            SET @ReturnValue = -93;
            RETURN @ReturnValue;
        END

        SELECT
            @HeaderStatus = ar.[RequestStatus]
        FROM [request].[AccessRequest] ar
        WHERE ar.[AccessRequestId] = @AccessRequestId
          AND ar.[IsDeleted] = 0;

        IF @HeaderStatus IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        SELECT TOP (1)
            @LineId = arp.[AccessRequestProductId],
            @LineStatus = arp.[LineStatus],
            @LineProductId = arp.[ProductId]
        FROM [request].[AccessRequestProduct] arp
        WHERE arp.[AccessRequestId] = @AccessRequestId
          AND arp.[IsDeleted] = 0
        ORDER BY arp.[AccessRequestProductId];

        IF @LineId IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        IF @LineStatus <> 1
        BEGIN
            SET @ReturnValue = -94;
            RETURN @ReturnValue;
        END

        SET @NextLineStatus = @LineStatus;
        SET @NextHeaderStatus = @HeaderStatus;
        SET @HistoryLineId = NULL;
        SET @HistoryStatus = @HeaderStatus;

        IF @Status IN (N'info-requested', N'in-review')
        BEGIN
            SET @NextHeaderStatus = 2;
            SET @HistoryStatus = 2;
            SET @HistoryLineId = NULL;
        END
        ELSE IF @Status = N'approved'
        BEGIN
            SET @NextLineStatus = 2;
            SET @HistoryStatus = 2;
            SET @HistoryLineId = @LineId;
        END
        ELSE IF @Status = N'rejected'
        BEGIN
            SET @NextLineStatus = 3;
            SET @HistoryStatus = 3;
            SET @HistoryLineId = @LineId;
        END

        SELECT @AccessDays = ISNULL(p.[DefaultAccessDays], 365)
        FROM [core].[Product] p
        WHERE p.[ProductId] = @LineProductId;

        BEGIN TRY
            BEGIN TRANSACTION;

            UPDATE [request].[AccessRequestProduct]
            SET
                [LineStatus] = @NextLineStatus,
                [ReviewedBy] = CASE WHEN @Status IN (N'approved', N'rejected') THEN @UpdatedBy ELSE [ReviewedBy] END,
                [ReviewedDate] = CASE WHEN @Status IN (N'approved', N'rejected') THEN SYSUTCDATETIME() ELSE [ReviewedDate] END,
                [DecisionRemarks] = CASE WHEN @Status IN (N'approved', N'rejected') THEN @Note ELSE [DecisionRemarks] END,
                [ApprovedStartDate] = CASE
                    WHEN @Status = N'approved' THEN CAST(SYSUTCDATETIME() AS DATE)
                    ELSE [ApprovedStartDate]
                END,
                [ApprovedExpiryDate] = CASE
                    WHEN @Status = N'approved' THEN DATEADD(DAY, ISNULL(@AccessDays, 365), CAST(SYSUTCDATETIME() AS DATE))
                    ELSE [ApprovedExpiryDate]
                END,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [AccessRequestProductId] = @LineId
              AND [IsDeleted] = 0;

            IF NOT EXISTS (
                SELECT 1
                FROM [request].[AccessRequestProduct]
                WHERE [AccessRequestId] = @AccessRequestId
                  AND [IsDeleted] = 0
                  AND [LineStatus] = 1
            )
                SET @NextHeaderStatus = 3;

            UPDATE [request].[AccessRequest]
            SET
                [RequestStatus] = @NextHeaderStatus,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [AccessRequestId] = @AccessRequestId
              AND [IsDeleted] = 0;

            INSERT INTO [request].[AccessRequestStatusHistory]
            (
                [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
                [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
            )
            VALUES
            (
                @AccessRequestId, @HistoryLineId, @HistoryStatus, @Note,
                NULL, @UpdatedBy, SYSUTCDATETIME(), @UpdatedBy
            );

            IF @Note IS NOT NULL
            BEGIN
                INSERT INTO [request].[AccessRequestComment]
                (
                    [AccessRequestId], [AuthorScope], [AuthorId], [CommentText],
                    [InsertedDate], [InsertedBy]
                )
                VALUES
                (
                    @AccessRequestId, N'staff', ISNULL(@UpdatedBy, 0), @Note,
                    SYSUTCDATETIME(), @UpdatedBy
                );
            END

            COMMIT TRANSACTION;
            SET @ReturnValue = CAST(@AccessRequestId AS INT);
            RETURN @ReturnValue;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SET @ReturnValue = 0;
            RETURN @ReturnValue;
        END CATCH
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            CAST(ar.[AccessRequestId] AS INT) AS [AccessRequestId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            ISNULL(o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            o.[Address] AS [Address],
            o.[City] AS [City],
            o.[State] AS [State],
            o.[Zip] AS [Zip],
            ar.[ContactPhone] AS [Phone],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(ar.[RequesterFirstName], N'') + N' ' + ISNULL(ar.[RequesterLastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(ar.[ContactEmail], N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterEmail],
            CAST(p.[ProductId] AS NVARCHAR(20)) AS [ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            CASE
                WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                WHEN arp.[LineStatus] = 2 THEN N'approved'
                WHEN arp.[LineStatus] = 3 THEN N'rejected'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[OrgId] = ar.[OrgId]
        LEFT JOIN [auth].[User] u
            ON u.[CFRUserId] = ar.[RequestedBy]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = ar.[RequestedBy]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) upn
        LEFT JOIN [core].[Product] p
            ON p.[ProductId] = arp.[ProductId]
        WHERE ar.[AccessRequestId] = @AccessRequestId
          AND ar.[IsDeleted] = 0
        ORDER BY arp.[AccessRequestProductId];

        SELECT
            CASE
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 1 THEN N'submitted'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 2 THEN N'info-requested'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 3 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 4 THEN N'rejected'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 2 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 3 THEN N'rejected'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), h.[InsertedDate], 127) AS [At],
            h.[Remarks] AS [Note],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(staff.[FirstName], N'') + N' ' + ISNULL(staff.[LastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(memberProfile.[FirstName], N'') + N' ' + ISNULL(memberProfile.[LastName], N''))), N''),
                member.[Email],
                N'System'
            ) AS [Actor]
        FROM [request].[AccessRequestStatusHistory] h
        LEFT JOIN [auth].[AcutisUser] staff
            ON staff.[UserId] = h.[ChangedByStaff]
        LEFT JOIN [auth].[User] member
            ON member.[CFRUserId] = h.[ChangedByMember]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = h.[ChangedByMember]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) memberProfile
        WHERE h.[AccessRequestId] = @AccessRequestId
        ORDER BY h.[InsertedDate], h.[StatusHistoryId];

        SELECT
            CAST(c.[CommentId] AS INT) AS [CommentId],
            c.[CommentText] AS [Comment],
            COALESCE(
                NULLIF(LTRIM(RTRIM(
                    CASE
                        WHEN c.[AuthorScope] = N'staff' THEN ISNULL(staff.[FirstName], N'') + N' ' + ISNULL(staff.[LastName], N'')
                        ELSE ISNULL(memberProfile.[FirstName], N'') + N' ' + ISNULL(memberProfile.[LastName], N'')
                    END
                )), N''),
                member.[Email],
                N'System'
            ) AS [Actor],
            CONVERT(VARCHAR(33), c.[InsertedDate], 127) AS [At]
        FROM [request].[AccessRequestComment] c
        LEFT JOIN [auth].[AcutisUser] staff
            ON c.[AuthorScope] = N'staff'
           AND staff.[UserId] = c.[AuthorId]
        LEFT JOIN [auth].[User] member
            ON c.[AuthorScope] = N'member'
           AND member.[CFRUserId] = c.[AuthorId]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE c.[AuthorScope] = N'member'
              AND up.[CFRUserId] = c.[AuthorId]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) memberProfile
        WHERE c.[AccessRequestId] = @AccessRequestId
        ORDER BY c.[InsertedDate], c.[CommentId];

        RETURN @ReturnValue;
    END

    IF @ActionId = 4
    BEGIN
        SELECT
            CAST(ar.[AccessRequestId] AS INT) AS [AccessRequestId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            ISNULL(o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            o.[Address] AS [Address],
            o.[City] AS [City],
            o.[State] AS [State],
            o.[Zip] AS [Zip],
            ar.[ContactPhone] AS [Phone],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(ar.[RequesterFirstName], N'') + N' ' + ISNULL(ar.[RequesterLastName], N''))), N''),
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(ar.[ContactEmail], N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            COALESCE(
                NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterEmail],
            CAST(p.[ProductId] AS NVARCHAR(20)) AS [ProductId],
            ISNULL(p.[ProductName], N'') AS [ProductName],
            CASE
                WHEN ar.[RequestStatus] = 2 AND arp.[LineStatus] = 1 THEN N'info-requested'
                WHEN arp.[LineStatus] = 2 THEN N'approved'
                WHEN arp.[LineStatus] = 3 THEN N'rejected'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[OrgId] = ar.[OrgId]
        LEFT JOIN [auth].[User] u
            ON u.[CFRUserId] = ar.[RequestedBy]
        OUTER APPLY (
            SELECT TOP (1) up.[FirstName], up.[LastName]
            FROM [auth].[UserProduct] up
            WHERE up.[CFRUserId] = ar.[RequestedBy]
              AND ISNULL(up.[IsDeleted], 0) = 0
            ORDER BY up.[CFRUserDetailId]
        ) upn
        LEFT JOIN [core].[Product] p
            ON p.[ProductId] = arp.[ProductId]
        WHERE ar.[IsDeleted] = 0
        ORDER BY ar.[RequestedDate] DESC, ar.[AccessRequestId] DESC;

        RETURN @ReturnValue;
    END

    IF @ActionId = 5
    BEGIN
        DECLARE @Recipients TABLE ([EMail] NVARCHAR(256) NOT NULL);
        DECLARE @ProductContactPerson NVARCHAR(200);
        DECLARE @ProductContactUserId BIGINT;

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        SELECT
            @ProductContactPerson = p.[ContactPerson],
            @ProductContactUserId = p.[ContactUserId]
        FROM [core].[Product] p
        WHERE p.[ProductId] = @ProductId;

        IF @ProductContactUserId IS NOT NULL OR (@ProductContactPerson IS NOT NULL AND LTRIM(RTRIM(@ProductContactPerson)) <> N'')
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM [auth].[AcutisUser] u
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
              AND (
                  (@ProductContactUserId IS NOT NULL AND u.[UserId] = @ProductContactUserId)
                  OR (@ProductContactUserId IS NULL AND (
                      u.[UserId] = TRY_CAST(@ProductContactPerson AS INT)
                      OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(@ProductContactPerson))
                  ))
              );
        END

        IF NOT EXISTS (SELECT 1 FROM @Recipients)
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM [auth].[AcutisUser] u
            INNER JOIN [auth].[AcutisRole] r
                ON r.[RoleId] = u.[RoleId]
               AND r.[IsDeleted] = 0
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND r.[RoleName] = N'Platform Admin'
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;
        END

        SELECT [EMail] FROM @Recipients;
        RETURN 0;
    END

    -- App Hub: products assigned to the member (Your Apps) plus every other core.Product
    -- as Available (ProductStatus = 1) or Future.
    IF @ActionId = 6
    BEGIN
        DECLARE @HubUserId BIGINT = NULL;

        IF @RequesterEmail IS NOT NULL
        BEGIN
            SELECT @HubUserId = u.[CFRUserId]
            FROM [auth].[User] u
            WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);
        END

        SELECT
            p.[ProductId],
            p.[ProductName],
            p.[SubCategoryName],
            p.[ProdDescription],
            p.[ExternalPageUrl],
            p.[IsActive],
            p.[ProductStatus],
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN N'your'
                WHEN p.[ProductStatus] = 1 THEN N'available'
                ELSE N'future'
            END AS [HubSection],
            (
                SELECT STRING_AGG(CAST(pf.[FeatureName] AS NVARCHAR(MAX)), ',')
                FROM [core].[ProductFeature] pf
                WHERE pf.[ProductId] = p.[ProductId]
                  AND pf.[IsDeleted] = 0
                  AND pf.[IsActive] = 1
            ) AS [Features],
            (
                SELECT TOP 1 u.[UserId]
                FROM [auth].[AcutisUser] u
                WHERE u.[IsDeleted] = 0
                  AND u.[IsActive] = 1
                  AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
                  AND (
                      (p.[ContactUserId] IS NOT NULL AND u.[UserId] = p.[ContactUserId])
                      OR (p.[ContactUserId] IS NULL AND (
                          u.[UserId] = TRY_CAST(p.[ContactPerson] AS INT)
                          OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(p.[ContactPerson]))
                      ))
                  )
            ) AS [ContactUserId],
            (
                SELECT TOP 1 LTRIM(RTRIM(u.[Email]))
                FROM [auth].[AcutisUser] u
                WHERE u.[IsDeleted] = 0
                  AND u.[IsActive] = 1
                  AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
                  AND (
                      (p.[ContactUserId] IS NOT NULL AND u.[UserId] = p.[ContactUserId])
                      OR (p.[ContactUserId] IS NULL AND (
                          u.[UserId] = TRY_CAST(p.[ContactPerson] AS INT)
                          OR LTRIM(RTRIM(ISNULL(u.[FirstName], N'') + N' ' + ISNULL(u.[LastName], N''))) = LTRIM(RTRIM(p.[ContactPerson]))
                      ))
                  )
            ) AS [ContactEmail]
        FROM [core].[Product] p
        LEFT JOIN (
            SELECT DISTINCT up.[ProductId]
            FROM [auth].[UserProduct] up
            INNER JOIN [lic].[OrganizationProduct] op
                ON op.[OrgId] = up.[OrgId]
               AND op.[ProductId] = up.[ProductId]
               AND op.[IsDeleted] = 0
               AND op.[AssignStatus] = N'active'
            WHERE @HubUserId IS NOT NULL
              AND up.[CFRUserId] = @HubUserId
              AND ISNULL(up.[IsDeleted], 0) = 0
              AND up.[OrgId] IS NOT NULL
        ) assigned
            ON assigned.[ProductId] = p.[ProductId]
        WHERE p.[IsDeleted] = 0
        ORDER BY
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN 0
                WHEN p.[ProductStatus] = 1 THEN 1
                ELSE 2
            END,
            p.[ProductName];

        RETURN 0;
    END
END
GO
