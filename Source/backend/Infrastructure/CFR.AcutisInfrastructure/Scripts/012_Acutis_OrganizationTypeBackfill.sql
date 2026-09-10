-- Copyright (c) OptionC. All rights reserved.
-- One-time backfill for [core].[Organization].[OrgType] on existing rows that were created
-- before Organization Type was ever set (shows as "—" in the admin Organizations list today).
-- This is intentionally narrow and safe:
--   - Only fills rows where [OrgType] IS NULL — never overwrites a value someone already set.
--   - Only infers 'Parish' from the organization's own name containing "Parish", "Chapel", or
--     "Cathedral" — the real organizations in this platform are named things like "Christ the
--     King Parish (Latin Mass)", "Corpus Christi Chapel (Latin Mass)", "Epiphany Cathedral
--     Parish", so the name itself is a reliable, honest signal here — not a guess applied
--     platform-wide.
--   - Similarly infers 'Catholic School' from a name containing "School" ("Holy Rosary School -
--     Medford", "Immaculate Conception Catholic School") — same honest-signal reasoning as Parish.
--   - Every organization still left blank after those two passes (no Parish/Chapel/Cathedral/
--     School in the name — e.g. "Test Org", generically-named test rows) is set to 'Other' so the
--     Type column always shows a value, since Organization Type is now a required field going
--     forward and the admin list should not display "—" for any row. 'Other' is a genuine, listed
--     option in ORG_TYPE_OPTIONS (frontend/CFR_Admin's organizationHelpers.ts) — not a fabricated
--     value — and any of these can still be corrected to a real type via Edit.
-- Re-running this script is safe (idempotent): once a row's OrgType is set, the IS NULL guard
-- means it's never touched again.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

UPDATE [core].[Organization]
SET [OrgType] = N'Parish'
WHERE [IsDeleted] = 0
  AND [OrgType] IS NULL
  AND (
        [OrgName] LIKE N'%Parish%'
     OR [OrgName] LIKE N'%Chapel%'
     OR [OrgName] LIKE N'%Cathedral%'
  );
GO

UPDATE [core].[Organization]
SET [OrgType] = N'Catholic School'
WHERE [IsDeleted] = 0
  AND [OrgType] IS NULL
  AND [OrgName] LIKE N'%School%';
GO

UPDATE [core].[Organization]
SET [OrgType] = N'Other'
WHERE [IsDeleted] = 0
  AND (NULLIF(LTRIM(RTRIM([OrgType])), N'') IS NULL);
GO
