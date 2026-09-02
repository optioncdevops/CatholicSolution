-- Copyright (c) OptionC. All rights reserved.
-- Demo [auth].[User] rows so App Hub access requests resolve RequestedBy
-- and Admin GetAccessRequests can join requester name/email.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

DECLARE @CarlUserId BIGINT;
DECLARE @MariaUserId BIGINT;
DECLARE @OrgId BIGINT;
DECLARE @ProductId INT;
DECLARE @RequestId BIGINT;

IF NOT EXISTS (
    SELECT 1
    FROM [auth].[User]
    WHERE LOWER(LTRIM(RTRIM([Email]))) = N'carl.lapp@optionc.com'
      AND [IsDeleted] = 0
)
BEGIN
    INSERT INTO [auth].[User] ([Email], [FirstName], [LastName], [IsActive], [IsDeleted])
    VALUES (N'carl.lapp@optionc.com', N'Carl', N'Lapp', 1, 0);
END

IF NOT EXISTS (
    SELECT 1
    FROM [auth].[User]
    WHERE LOWER(LTRIM(RTRIM([Email]))) = N'maria.santos@optionc.com'
      AND [IsDeleted] = 0
)
BEGIN
    INSERT INTO [auth].[User] ([Email], [FirstName], [LastName], [IsActive], [IsDeleted])
    VALUES (N'maria.santos@optionc.com', N'Maria', N'Santos', 1, 0);
END

SELECT @CarlUserId = [UserId]
FROM [auth].[User]
WHERE LOWER(LTRIM(RTRIM([Email]))) = N'carl.lapp@optionc.com'
  AND [IsDeleted] = 0;

SELECT @MariaUserId = [UserId]
FROM [auth].[User]
WHERE LOWER(LTRIM(RTRIM([Email]))) = N'maria.santos@optionc.com'
  AND [IsDeleted] = 0;

SELECT TOP (1) @OrgId = [OrgId]
FROM [core].[Organization]
WHERE [IsDeleted] = 0
ORDER BY [OrgId];

IF @OrgId IS NOT NULL AND @CarlUserId IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [auth].[OrganizationUser]
        WHERE [AuthUserId] = @CarlUserId
          AND [OrgId] = @OrgId
          AND [IsDeleted] = 0
   )
BEGIN
    INSERT INTO [auth].[OrganizationUser] ([OrgId], [AuthUserId], [MemberStatus], [CreatedDate], [IsDeleted])
    VALUES (@OrgId, @CarlUserId, N'active', SYSUTCDATETIME(), 0);
END

IF @OrgId IS NOT NULL AND @MariaUserId IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [auth].[OrganizationUser]
        WHERE [AuthUserId] = @MariaUserId
          AND [OrgId] = @OrgId
          AND [IsDeleted] = 0
   )
BEGIN
    INSERT INTO [auth].[OrganizationUser] ([OrgId], [AuthUserId], [MemberStatus], [CreatedDate], [IsDeleted])
    VALUES (@OrgId, @MariaUserId, N'active', SYSUTCDATETIME(), 0);
END

SELECT TOP (1) @ProductId = [ProductId]
FROM [core].[Product]
WHERE [IsDeleted] = 0
  AND CONVERT(INT, [IsAvailable]) = 1
ORDER BY [ProductName];

IF @ProductId IS NULL
BEGIN
    SELECT TOP (1) @ProductId = [ProductId]
    FROM [core].[Product]
    WHERE [IsDeleted] = 0
    ORDER BY [ProductName];
END

IF @OrgId IS NOT NULL AND @CarlUserId IS NOT NULL AND @ProductId IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [request].[AccessRequest] WHERE [IsDeleted] = 0)
BEGIN
    INSERT INTO [request].[AccessRequest]
    (
        [OrgId], [RequestedBy], [Source], [Justification], [RequestStatus],
        [RequestedDate], [InsertedDate], [InsertedBy], [IsDeleted]
    )
    VALUES
    (
        @OrgId, @CarlUserId, N'member_portal', NULL, 1,
        SYSUTCDATETIME(), SYSUTCDATETIME(), @CarlUserId, 0
    );

    SET @RequestId = SCOPE_IDENTITY();

    INSERT INTO [request].[AccessRequestProduct]
    (
        [AccessRequestId], [ProductId], [RequestType], [LineStatus],
        [InsertedDate], [InsertedBy], [IsDeleted]
    )
    VALUES
    (
        @RequestId, @ProductId, 1, 1,
        SYSUTCDATETIME(), @CarlUserId, 0
    );

    INSERT INTO [request].[AccessRequestStatusHistory]
    (
        [AccessRequestId], [AccessRequestProductId], [StatusValue], [Remarks],
        [ChangedByMember], [ChangedByStaff], [InsertedDate], [InsertedBy]
    )
    VALUES
    (
        @RequestId, NULL, 1, N'Request submitted',
        @CarlUserId, NULL, SYSUTCDATETIME(), @CarlUserId
    );
END
GO
