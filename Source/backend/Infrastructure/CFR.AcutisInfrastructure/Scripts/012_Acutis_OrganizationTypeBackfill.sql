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
--   - Deliberately does NOT touch generically-named rows ("Test Org", "testtt", "Test
--     Organization", etc.) — there's no real signal to infer a type from a name like that, and
--     guessing one would be fabricated data. Those are left NULL ("—" in the list) until someone
--     sets a real type via Edit.
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
