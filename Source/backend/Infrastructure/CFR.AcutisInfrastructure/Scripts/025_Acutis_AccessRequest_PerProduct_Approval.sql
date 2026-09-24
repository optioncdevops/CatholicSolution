-- Copyright (c) OptionC. All rights reserved.
-- Re-defines [request].[AccessRequestManage] so status changes (ActionId 2) act on a SPECIFIC
-- product line instead of always grabbing "the first line by AccessRequestProductId" for the
-- request. That old behavior was fine when a request only ever had one product line, but the
-- public Request Access page (ActionId 7) lets a requester select multiple products in a single
-- submission, creating several [request].[AccessRequestProduct] rows under one AccessRequestId.
-- Approving/rejecting always silently acted on the lowest-id line regardless of which product the
-- admin actually meant - e.g. approving what the admin thought was a "Parish Hub" request instead
-- resolved to that request's "SMS" line, routed to the wrong SMS gateway BaseUrl in
-- AccessRequestService.SetupNewOrganizationAsync, and failed with a connection error.
--
-- New optional @AccessRequestProductId parameter (ActionId 2 only): when supplied, that exact line
-- is acted on (validated to belong to @AccessRequestId). When NULL (legacy callers), falls back to
-- the first PENDING (LineStatus = 1) line - strictly safer than the old "first line, any status"
-- behavior, since it can no longer re-target an already-decided line. New output parameter
-- @ResolvedAccessRequestProductId reports back which line was actually acted on, so the caller
-- (AccessRequestService) can look up SMS org-setup context for that exact product instead of
-- guessing.
--
-- ActionId 3 and 4 (get by id / list) now also project [AccessRequestProductId] per row, so the
-- Admin UI can pass it back on the next approve/reject call for that specific line.
--
-- Everything else (ActionId 1, 5, 6, 7 bodies; table/column DDL) is unchanged from
-- 008_AccessRequest.sql - only ActionId 2/3/4 and the parameter list/normalization block differ.
--
-- Status flow (LineStatus): 1 = requested -> 4 = sent-to-vendor -> 2 = approved, or 3 = rejected.
-- ActionId 2 @Status 'sent-to-vendor' moves a requested line to 4 (CFR.Acutis emails the product's
-- contact user first); 'approved' is only allowed from 4; 'rejected' from 1 or 4. ActionId 3/4 project
-- LineStatus 4 as 'sent-to-vendor', and ActionId 1/7 treat a sent-to-vendor line as still open.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[request].[AccessRequestManage]', N'P') IS NOT NULL
    DROP PROCEDURE [request].[AccessRequestManage];
GO

-- ActionId 1: Save (insert header, product line, history, optional member comment).
-- ActionId 2: Update status (approve / reject / request info) for ONE product line, identified by
-- @AccessRequestProductId when given, else the first pending (LineStatus = 1) line. Approving
-- GRANTS real access as part of the same transaction — activates/creates the org's
-- [lic].[OrganizationProduct] row and the requester's [auth].[UserProduct] row for THAT product —
-- not just a status flag.
-- ActionId 3: Get by AccessRequestId (header + one row per product line, timeline, comments).
-- ActionId 4: Get list (one row per product line).
-- ActionId 5: Recipients for the AccessRequested email, matched by product name/id: the product's
-- [ProductSupportUser] first, else its contact person, else Platform Admins.
-- ActionId 6: App Hub products. [auth].[User] by email -> [auth].[UserProduct] -> [core].[Product].
-- ActionId 7: Public Request Access save (create/reuse org with address, request header, product lines).
CREATE PROCEDURE [request].[AccessRequestManage]
    @ActionId INT,
    @AccessRequestId BIGINT = 0,
    @AccessRequestProductId BIGINT = NULL,
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
    @ReturnValue INT = NULL OUTPUT,
    @ResolvedAccessRequestProductId BIGINT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @ReturnValue = 0;
    SET @InsertedBy = NULLIF(@InsertedBy, 0);
    SET @UpdatedBy = NULLIF(@UpdatedBy, 0);
    SET @ProductId = NULLIF(@ProductId, 0);
    SET @AccessRequestId = ISNULL(@AccessRequestId, 0);
    SET @AccessRequestProductId = NULLIF(@AccessRequestProductId, 0);
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
              AND arp.[LineStatus] IN (1, 4) -- requested or sent to vendor
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
            THROW;
        END CATCH
    END

    IF @ActionId = 7
    BEGIN
        DECLARE @PublicRequestedBy BIGINT;
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

        -- No longer auto-creates an [auth].[User] row for a not-yet-known requester email -
        -- @PublicRequestedBy simply stays NULL in that case. request.AccessRequest doesn't need
        -- it (RequesterFirstName/RequesterLastName/ContactEmail already carry the requester's
        -- identity independently - see ActionId 3/4's RequesterName/RequesterEmail COALESCE).
        -- NOTE: without a CFRUserId, the SMS org-setup call at approval (SetupNewOrganizationAsync)
        -- will be missing CfrUserID for these requests and report it as a missing required field -
        -- a real [auth].[User]/CFRUserId has to exist through some other path (e.g. the member
        -- eventually logging in / registering for real) before that call can succeed.
        SELECT @PublicRequestedBy = u.[CFRUserId]
        FROM [auth].[User] u
        WHERE LOWER(LTRIM(RTRIM(u.[Email]))) = LOWER(@RequesterEmail);

        -- No [core].[Organization] lookup/creation here anymore - [OrgId] is inserted as 0 below
        -- until approval, when a real Organization row is created from the org fields staged on
        -- [request].[AccessRequest] itself (see ActionId 2).
        SET @ContactPerson = LTRIM(RTRIM(ISNULL(@FirstName, N'') + N' ' + ISNULL(@LastName, N'')));
        -- @PublicRequestedBy is NULL for a not-yet-known requester (no [auth].[User] row is
        -- created here anymore - that's a separate user-migration process). [RequestedBy]/
        -- [InsertedBy]/[ChangedByMember] below don't allow NULL, so 0 is used as the "no CFR
        -- identity yet" sentinel, same convention already used for [AuthorId] below.
        SET @PublicActorId = ISNULL(ISNULL(@InsertedBy, @PublicRequestedBy), 0);

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
              AND arp.[LineStatus] IN (1, 4) -- requested or sent to vendor
              -- Only a duplicate for the SAME organization: the same person may request the same
              -- product for a different organization. Public requests carry no real OrgId yet
              -- ([OrgId] = 0 until approval), so the organization is matched by its staged name.
              AND LOWER(LTRIM(RTRIM(ISNULL(ar.[OrganizationName], N'')))) = LOWER(@OrganizationName)
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

            -- The org itself (OrganizationName/Address/City/State/Zip) is staged directly on this
            -- row instead of creating a [core].[Organization] row here - that only happens at
            -- approval (ActionId 2), once the request is actually accepted. [OrgId] is 0 (no real
            -- org yet) until then.
            INSERT INTO [request].[AccessRequest]
            (
                [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
                [RequesterFirstName], [RequesterLastName], [ContactEmail], [ContactPhone], [OrganizationType],
                [OrganizationName], [Address], [City], [State], [Zip],
                [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
            )
            VALUES
            (
                0, ISNULL(@PublicRequestedBy, 0), N'external_page', @Comment, 1,
                @FirstName, @LastName, @RequesterEmail, @Phone, @OrganizationType,
                @OrganizationName, @Address, @City, @State, @Zip,
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
                ISNULL(@PublicRequestedBy, 0), NULL, SYSUTCDATETIME(), @PublicActorId
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
            THROW;
        END CATCH
    END

    IF @ActionId = 2
    BEGIN
        DECLARE @LineId BIGINT;
        DECLARE @LineStatus INT;
        DECLARE @LineProductId INT;
        DECLARE @HeaderStatus INT;
        DECLARE @HeaderOrgId BIGINT;
        DECLARE @HeaderRequestedBy BIGINT;
        DECLARE @NextLineStatus INT;
        DECLARE @NextHeaderStatus INT;
        DECLARE @HistoryStatus INT;
        DECLARE @HistoryLineId BIGINT;
        DECLARE @AccessDays INT;
        DECLARE @ExistingUserProductId BIGINT;
        DECLARE @ExistingUserProductIsDeleted BIT;
        DECLARE @MemberUserId BIGINT;
        DECLARE @MemberOrgName NVARCHAR(200);
        DECLARE @MemberFirstName NVARCHAR(100);
        DECLARE @MemberLastName NVARCHAR(100);
        DECLARE @MemberRoleId INT;
        DECLARE @MemberIsLoginDisabled BIT;
        DECLARE @MemberIsLockedOut BIT;
        DECLARE @ExistingOrgProductId BIGINT;
        DECLARE @ExistingOrgProductIsDeleted BIT;

        IF @AccessRequestId <= 0 OR @Status NOT IN (N'sent-to-vendor', N'approved', N'rejected', N'info-requested', N'in-review')
        BEGIN
            SET @ReturnValue = -93;
            RETURN @ReturnValue;
        END

        SELECT
            @HeaderStatus = ar.[RequestStatus],
            @HeaderOrgId = ar.[OrgId],
            @HeaderRequestedBy = ar.[RequestedBy]
        FROM [request].[AccessRequest] ar
        WHERE ar.[AccessRequestId] = @AccessRequestId
          AND ar.[IsDeleted] = 0;

        IF @HeaderStatus IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        -- Acts on ONE specific product line: the caller's @AccessRequestProductId when given
        -- (validated to belong to this request), else the first still-pending (LineStatus = 1)
        -- line - a request can have several product lines (see ActionId 7's multi-product public
        -- submit), so "just the lowest AccessRequestProductId regardless of its status" used to
        -- silently act on the wrong product once its first line was already decided.
        IF @AccessRequestProductId IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @LineId = arp.[AccessRequestProductId],
                @LineStatus = arp.[LineStatus],
                @LineProductId = arp.[ProductId]
            FROM [request].[AccessRequestProduct] arp
            WHERE arp.[AccessRequestId] = @AccessRequestId
              AND arp.[AccessRequestProductId] = @AccessRequestProductId
              AND arp.[IsDeleted] = 0;
        END
        ELSE
        BEGIN
            SELECT TOP (1)
                @LineId = arp.[AccessRequestProductId],
                @LineStatus = arp.[LineStatus],
                @LineProductId = arp.[ProductId]
            FROM [request].[AccessRequestProduct] arp
            WHERE arp.[AccessRequestId] = @AccessRequestId
              AND arp.[IsDeleted] = 0
              AND arp.[LineStatus] = 1
            ORDER BY arp.[AccessRequestProductId];
        END

        IF @LineId IS NULL
        BEGIN
            SET @ReturnValue = -95;
            RETURN @ReturnValue;
        END

        SET @ResolvedAccessRequestProductId = @LineId;

        -- Allowed transitions (LineStatus 1 = requested, 4 = sent-to-vendor, 2 = approved, 3 = rejected):
        --   requested      -> sent-to-vendor / rejected / info-requested (line stays requested)
        --   sent-to-vendor -> approved / rejected
        IF NOT (
               (@Status IN (N'sent-to-vendor', N'info-requested', N'in-review') AND @LineStatus = 1)
            OR (@Status = N'approved' AND @LineStatus = 4)
            OR (@Status = N'rejected' AND @LineStatus IN (1, 4))
        )
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
        ELSE IF @Status = N'sent-to-vendor'
        BEGIN
            SET @NextLineStatus = 4;
            SET @HistoryStatus = 4;
            SET @HistoryLineId = @LineId;
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

        -- [core].[Product] has no [DefaultAccessDays] column in this database - @AccessDays stays
        -- NULL here and the ISNULL(@AccessDays, 365) below still applies the same 365-day default.
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
                  AND [LineStatus] IN (1, 4) -- requested or still with the vendor
            )
                SET @NextHeaderStatus = 3;

            UPDATE [request].[AccessRequest]
            SET
                [RequestStatus] = @NextHeaderStatus,
                [UpdatedDate] = SYSUTCDATETIME(),
                [UpdatedBy] = @UpdatedBy
            WHERE [AccessRequestId] = @AccessRequestId
              AND [IsDeleted] = 0;

            -- Approving a request must actually GRANT access, not just flip a status flag — both
            -- gates that [request].[AccessRequestManage] ActionId 6 (App Hub) and Portal_CFRLaunch
            -- check have to be satisfied: an active [lic].[OrganizationProduct] row for the
            -- org+product, and an [auth].[UserProduct] row for the member+org+product.
            -- Neither [core].[Organization] nor [lic].[OrganizationProduct] is created here anymore.
            -- The approve click's real provisioning now happens in C#
            -- (AccessRequestService.SetupNewOrganizationAsync calls SMS FIRST, before any CFR-side
            -- Organization row exists; AccessRequestRepository.PersistOrgSetupResultAsync then
            -- creates [core].[Organization] and [lic].[OrganizationProduct] from SMS's returned
            -- OrgId, but only once SMS confirms success). [auth].[User] is likewise never created
            -- here - that's a separate, external migration process. The [auth].[UserProduct]
            -- reactivation in step 2/3 below only covers a member who already has other product
            -- access in this org (so @HeaderOrgId is already real from a prior approval) - it has
            -- nothing to do with SMS and is unaffected by any of the above.
            IF @Status = N'approved'
            BEGIN
                -- Resolve the member's identity fields from their existing membership row for
                --    this org, if any. [UserId]/[RoleId] on [auth].[UserProduct] are product-side
                --    values supplied by the individual product system (see the CFR.DataSync upsert in
                --    006_Sync_StoredProcedures.sql) — CFR has no value of its own to invent for a
                --    member who has never been assigned a product here before, so @MemberUserId
                --    stays NULL for a brand-new member+org (e.g. a public Request Access submission
                --    for a brand-new organization) and is checked for below.
                SELECT TOP (1)
                    @MemberUserId = [UserId], @MemberOrgName = [OrgName],
                    @MemberFirstName = [FirstName], @MemberLastName = [LastName], @MemberRoleId = [RoleId],
                    @MemberIsLoginDisabled = ISNULL([IsLoginDisabled], 0)
                FROM [auth].[UserProduct]
                WHERE [CFRUserId] = @HeaderRequestedBy AND [OrgId] = @HeaderOrgId AND ISNULL([IsDeleted], 0) = 0
                ORDER BY [CFRUserDetailId];

                -- Prevent a duplicate mapping: reactivate the member's soft-deleted row for
                --    this exact org+product if one exists, otherwise insert a new one — but only
                --    when the previous step actually found an existing membership row to clone identity from.
                --    Without @MemberUserId (product-side UserId is NOT NULL on this table), there is
                --    nothing valid to insert here yet; the row is created later by the normal
                --    CFR.DataSync upsert once the product system (e.g. OptionC via the SMS org-setup
                --    call) provisions the member and reports their product-side identity back.
                SELECT TOP (1) @ExistingUserProductId = [CFRUserDetailId], @ExistingUserProductIsDeleted = ISNULL([IsDeleted], 0)
                FROM [auth].[UserProduct]
                WHERE [CFRUserId] = @HeaderRequestedBy AND [OrgId] = @HeaderOrgId AND [ProductId] = @LineProductId
                ORDER BY [CFRUserDetailId];

                IF @ExistingUserProductId IS NOT NULL AND @ExistingUserProductIsDeleted = 1
                BEGIN
                    UPDATE [auth].[UserProduct]
                    SET [IsDeleted] = 0
                    WHERE [CFRUserDetailId] = @ExistingUserProductId;
                END
                ELSE IF @ExistingUserProductId IS NULL AND @MemberUserId IS NOT NULL
                BEGIN
                    INSERT INTO [auth].[UserProduct]
                    (
                        [CFRUserId], [UserId], [ProductId], [OrgId], [OrgName], [RoleId], [FirstName], [LastName],
                        [IsDeleted], [IsLoginDisabled]
                    )
                    VALUES
                    (
                        @HeaderRequestedBy, @MemberUserId, @LineProductId, @HeaderOrgId, @MemberOrgName, @MemberRoleId, @MemberFirstName, @MemberLastName,
                        0, @MemberIsLoginDisabled
                    );
                END
                -- else: already assigned, or no existing membership to clone from yet — nothing to do.
            END

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
            THROW;
        END CATCH
    END

    IF @ActionId = 3
    BEGIN
        SELECT
            CAST(ar.[AccessRequestId] AS INT) AS [AccessRequestId],
            CAST(arp.[AccessRequestProductId] AS INT) AS [AccessRequestProductId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[OrganizationName])), N''), o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            -- Address/City/State/Zip are staged directly on this row at submission (ActionId 7) -
            -- core.Organization only gets created at approval (ActionId 2), so ar.* is read first,
            -- falling back to the Organization row (State only - it never carried Address/City/Zip)
            -- for already-approved requests.
            ar.[Address] AS [Address],
            ar.[City] AS [City],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[State])), N''), o.[OrgState]) AS [State],
            ar.[Zip] AS [Zip],
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
                WHEN arp.[LineStatus] = 4 THEN N'sent-to-vendor'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[ID] = ar.[OrgId]
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
          AND (@AccessRequestProductId IS NULL OR arp.[AccessRequestProductId] = @AccessRequestProductId)
        ORDER BY arp.[AccessRequestProductId];

        SELECT
            CASE
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 1 THEN N'submitted'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 2 THEN N'info-requested'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 3 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NULL AND h.[StatusValue] = 4 THEN N'rejected'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 2 THEN N'approved'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 3 THEN N'rejected'
                WHEN h.[AccessRequestProductId] IS NOT NULL AND h.[StatusValue] = 4 THEN N'sent-to-vendor'
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
            CAST(arp.[AccessRequestProductId] AS INT) AS [AccessRequestProductId],
            CAST(ar.[OrgId] AS INT) AS [OrganizationId],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[OrganizationName])), N''), o.[OrgName], N'') AS [OrganizationName],
            ar.[OrganizationType] AS [OrganizationType],
            -- Address/City/State/Zip are staged directly on this row at submission (ActionId 7) -
            -- core.Organization only gets created at approval (ActionId 2), so ar.* is read first,
            -- falling back to the Organization row (State only - it never carried Address/City/Zip)
            -- for already-approved requests.
            ar.[Address] AS [Address],
            ar.[City] AS [City],
            COALESCE(NULLIF(LTRIM(RTRIM(ar.[State])), N''), o.[OrgState]) AS [State],
            ar.[Zip] AS [Zip],
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
                WHEN arp.[LineStatus] = 4 THEN N'sent-to-vendor'
                ELSE N'pending'
            END AS [Status],
            CONVERT(VARCHAR(33), ar.[RequestedDate], 127) AS [SubmittedAt]
        FROM [request].[AccessRequest] ar
        INNER JOIN [request].[AccessRequestProduct] arp
            ON arp.[AccessRequestId] = ar.[AccessRequestId]
           AND arp.[IsDeleted] = 0
        LEFT JOIN [core].[Organization] o
            ON o.[ID] = ar.[OrgId]
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
        DECLARE @ProductSupportUser VARCHAR(100);

        IF @ProductId IS NULL AND @ProductName IS NOT NULL
        BEGIN
            SELECT @ProductId = p.[ProductId]
            FROM [core].[Product] p
            WHERE p.[IsDeleted] = 0
              AND p.[ProductName] = @ProductName;
        END

        SELECT
            @ProductContactPerson = p.[ContactPerson],
            @ProductContactUserId = p.[ContactUserId],
            @ProductSupportUser = NULLIF(LTRIM(RTRIM(p.[ProductSupportUser])), '')
        FROM [core].[Product] p
        WHERE p.[ProductId] = @ProductId;

        -- 1st choice: the product's support user(s) - [core].[Product].[ProductSupportUser] holds
        -- [auth].[AcutisUser].[UserId] value(s) (one id, or several comma/semicolon separated).
        IF @ProductSupportUser IS NOT NULL
        BEGIN
            INSERT INTO @Recipients ([EMail])
            SELECT DISTINCT LTRIM(RTRIM(u.[Email]))
            FROM STRING_SPLIT(REPLACE(@ProductSupportUser, ';', ','), ',') s
            INNER JOIN [auth].[AcutisUser] u
                ON u.[UserId] = TRY_CAST(LTRIM(RTRIM(s.[value])) AS BIGINT)
            WHERE u.[IsDeleted] = 0
              AND u.[IsActive] = 1
              AND u.[IsLocked] = 0
              AND NULLIF(LTRIM(RTRIM(u.[Email])), N'') IS NOT NULL;
        END

        -- 2nd choice (no usable support user): the product's contact person, then Platform Admins below.
        IF NOT EXISTS (SELECT 1 FROM @Recipients)
           AND (@ProductContactUserId IS NOT NULL OR (@ProductContactPerson IS NOT NULL AND LTRIM(RTRIM(@ProductContactPerson)) <> N''))
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
            p.[LogoName] AS [LogoUrl],
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
                ON op.[CFROrgId] = up.[OrgId]
               AND op.[ProductId] = up.[ProductId]
               AND op.[IsDeleted] = 0
               AND op.[AssignStatus] = 1 -- Active
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
