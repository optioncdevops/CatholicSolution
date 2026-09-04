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

IF OBJECT_ID(N'[request].[AccessRequest_CRUD]', N'P') IS NOT NULL
    DROP PROCEDURE [request].[AccessRequest_CRUD];
GO

-- ActionId 1: Save (insert header, product line, history, optional member comment).
-- ActionId 2: Update status (approve / reject / request info).
-- ActionId 3: Get by AccessRequestId (header, timeline, comments).
-- ActionId 4: Get list.
-- ActionId 5: Recipients for the AccessRequested email, matched by product name/id.
-- ActionId 6: App Hub products. [auth].[User] by email -> [auth].[UserProduct] -> [core].[Product].
CREATE PROCEDURE [request].[AccessRequest_CRUD]
    @ActionId INT,
    @AccessRequestId BIGINT = 0,
    @ProductId INT = NULL,
    @ProductName NVARCHAR(100) = NULL,
    @RequesterEmail NVARCHAR(256) = NULL,
    @Comment NVARCHAR(1000) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Note NVARCHAR(500) = NULL,
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
                @OrgId, @RequestedBy, N'member_portal', NULL, 1,
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
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            ISNULL(u.[Email], N'') AS [RequesterEmail],
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
            COALESCE(
                NULLIF(LTRIM(RTRIM(ISNULL(upn.[FirstName], N'') + N' ' + ISNULL(upn.[LastName], N''))), N''),
                ISNULL(u.[Email], N'')
            ) AS [RequesterName],
            ISNULL(u.[Email], N'') AS [RequesterEmail],
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

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        INSERT INTO @Recipients ([EMail])
        SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
        FROM [auth].[UserProduct] up
        INNER JOIN [auth].[User] u
            ON u.[CFRUserId] = up.[CFRUserId]
        WHERE up.[ProductId] = @ProductId
          AND ISNULL(up.[IsDeleted], 0) = 0
          AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;

        INSERT INTO @Recipients ([EMail])
        SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
        FROM [auth].[AcutisUser] u
        INNER JOIN [auth].[AcutisRole] r
            ON r.[RoleId] = u.[RoleId]
           AND r.[IsDeleted] = 0
        INNER JOIN [core].[Product] p
            ON p.[ProductId] = @ProductId
           AND p.[IsDeleted] = 0
        WHERE u.[IsDeleted] = 0
          AND u.[IsActive] = 1
          AND u.[IsLocked] = 0
          AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM @Recipients x WHERE x.[EMail] = LTRIM(RTRIM(u.[Email])))
          AND (
                LOWER(LTRIM(RTRIM(r.[RoleName]))) = LOWER(LTRIM(RTRIM(p.[ProductName])))
             OR LOWER(r.[RoleName]) LIKE N'%' + LOWER(p.[ProductName]) + N'%'
          );

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
    -- as Available (ProductStatus = 1) or Future (ProductStatus = 2).
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
            p.[LogoUrl],
            p.[IsActive],
            CAST(CASE WHEN p.[ProductStatus] = 1 THEN 1 ELSE 0 END AS BIT) AS [IsAvailable],
            CASE
                WHEN assigned.[ProductId] IS NOT NULL THEN N'your'
                WHEN p.[ProductStatus] = 1 THEN N'available'
                ELSE N'future'
            END AS [HubSection]
        FROM [core].[Product] p
        LEFT JOIN (
            SELECT DISTINCT up.[ProductId]
            FROM [auth].[UserProduct] up
            WHERE @HubUserId IS NOT NULL
              AND up.[CFRUserId] = @HubUserId
              AND ISNULL(up.[IsDeleted], 0) = 0
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
