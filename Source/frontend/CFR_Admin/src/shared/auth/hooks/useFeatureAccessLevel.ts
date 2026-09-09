import { useEffect, useState } from 'react';
import { ACUTIS_AUTH_CHANGED_EVENT } from '../constants/storageKeys';
import { getStoredAcutisAuth } from '../services/authService';
import { normalizeMenuPath } from '../utils/menuHelpers';
import type { AcutisModuleRight } from '../types/authTypes';

export type FeatureAccessLevel = 'access' | 'readOnly' | 'denied';

/** `AcutisModuleRight.userRight` passes the raw `auth.ModuleRights.AccessRight` int straight
 * through (see `Acutis_DoLogin`'s `ISNULL(rr.AccessRight, 0) AS UserRight`): 0 = Denied,
 * 1 = Access, 2 = Read Only — the same three values the User Rights page now persists. */
function levelFromUserRight(userRight: number): FeatureAccessLevel {
  if (userRight === 2) return 'readOnly';
  if (userRight > 0) return 'access';
  return 'denied';
}

function findByRoute(rights: AcutisModuleRight[], routingPath: string): AcutisModuleRight | undefined {
  const normalized = normalizeMenuPath(routingPath);
  return rights.find((right) => normalizeMenuPath(right.routingUrl) === normalized);
}

/**
 * The signed-in user's access level for the page at `routingPath`, from the same `moduleRights`
 * already loaded at login (no extra API call). Defaults to `'access'` when the route carries no
 * rights row at all (e.g. Dashboard, Profile) — those pages were never rights-gated to begin
 * with, so "no matching row" must not read as Denied.
 *
 * Like the rest of this app's rights model, this reflects rights as of the user's last sign-in —
 * a change made on the User Rights page takes effect the next time this user logs in, not live.
 */
export function useFeatureAccessLevel(routingPath: string): FeatureAccessLevel {
  const [level, setLevel] = useState<FeatureAccessLevel>(() => {
    const rights = getStoredAcutisAuth()?.resultData?.moduleRights ?? [];
    const match = findByRoute(rights, routingPath);
    return match ? levelFromUserRight(match.userRight) : 'access';
  });

  useEffect(() => {
    const refresh = () => {
      const rights = getStoredAcutisAuth()?.resultData?.moduleRights ?? [];
      const match = findByRoute(rights, routingPath);
      setLevel(match ? levelFromUserRight(match.userRight) : 'access');
    };
    refresh();
    window.addEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [routingPath]);

  return level;
}
