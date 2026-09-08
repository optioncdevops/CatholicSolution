-- Copyright (c) OptionC. All rights reserved.
-- This script used to SEED two demo [auth].[User] rows (Carl Lapp / Maria Santos), link them to
-- the first organization, and create a demo access request, so App Hub/GetAccessRequests had
-- something to resolve/join against during early development. Now that the platform has real
-- organizations, users, and requests, those demo rows only pollute real counts (Organization
-- Users tab, dashboard KPIs/recent activity) — this script now REMOVES (soft-deletes) exactly
-- those previously-seeded demo rows instead of inserting them. It is idempotent: re-running it
-- against a database that never had the demo rows, or one where they're already removed, is a
-- no-op for every step below.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

DECLARE @CarlUserId BIGINT;
DECLARE @MariaUserId BIGINT;

SELECT @CarlUserId = [CFRUserId]
FROM [auth].[User]
WHERE LOWER(LTRIM(RTRIM([Email]))) = N'carl.lapp@optionc.com';

SELECT @MariaUserId = [CFRUserId]
FROM [auth].[User]
WHERE LOWER(LTRIM(RTRIM([Email]))) = N'maria.santos@optionc.com';

-- Demo access request (and its product line + status history) submitted by Carl.
IF @CarlUserId IS NOT NULL
BEGIN
    UPDATE arp
    SET arp.[IsDeleted] = 1
    FROM [request].[AccessRequestProduct] AS arp
    INNER JOIN [request].[AccessRequest] AS ar ON ar.[AccessRequestId] = arp.[AccessRequestId]
    WHERE ar.[RequestedBy] = @CarlUserId
      AND ar.[Source] = N'member_portal';

    UPDATE [request].[AccessRequest]
    SET [IsDeleted] = 1
    WHERE [RequestedBy] = @CarlUserId
      AND [Source] = N'member_portal';
END

-- Demo organization memberships for both demo users.
UPDATE [auth].[OrganizationUser]
SET [IsDeleted] = 1,
    [MemberStatus] = N'inactive',
    [UpdatedDate] = SYSUTCDATETIME()
WHERE [AuthUserId] IN (@CarlUserId, @MariaUserId)
  AND [IsDeleted] = 0;

-- [auth].[User] itself has no IsDeleted/IsActive (or any status) column — confirmed against the
-- live database — so the demo CFRUserId/Email rows for Carl/Maria are intentionally left as-is
-- here: once the two steps above clear their OrganizationUser and AccessRequest rows, they're
-- fully unlinked and harmless (nothing in this app lists auth.User directly; every real feature
-- reads through OrganizationUser/UserProduct/AccessRequest, none of which reference them anymore).
GO
