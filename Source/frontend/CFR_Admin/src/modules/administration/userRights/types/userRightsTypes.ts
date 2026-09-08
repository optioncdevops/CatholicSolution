/** `auth.ModuleRights.AccessRight` is a plain SQL `int`, not a bit — so a genuine three-state
 * permission (Access / Read Only / Denied) fits in the existing column with no schema change:
 * 0 = Denied, 1 = Access, 2 = Read Only. Menu visibility elsewhere in the app only ever checks
 * `AccessRight > 0`, so Read Only still shows the item, exactly like Access — this page does not
 * change that. Enforcing "view but can't edit" *inside* a page a Read Only role can reach is a
 * separate, app-wide concern outside this page's scope. */
export type AccessLevel = 'access' | 'readOnly' | 'denied';

export const ACCESS_LEVEL_CODE: Record<AccessLevel, number> = { denied: 0, access: 1, readOnly: 2 };

export function accessLevelFromCode(code: number): AccessLevel {
  if (code === 2) return 'readOnly';
  if (code > 0) return 'access';
  return 'denied';
}

/** One row of `auth.ModuleFeatures`, merged with the signed-in role's `auth.ModuleRights` grant.
 * Every node — module, submenu, or activity — carries its own independently-persisted
 * `accessLevel`; there is no separate per-action (view/add/edit/delete) split in the backend
 * model, just this one three-state flag per feature. */
export interface UserRightsFeatureNode {
  featureId: number;
  parentId: number;
  label: string;
  description: string;
  /** Always blank — `GetUserRights` doesn't project a routing URL for this result set. Kept on
   * the type in case a future backend revision adds it; not read anywhere today. */
  routingUrl: string;
  accessLevel: AccessLevel;
  children: UserRightsFeatureNode[];
}

/** A single pending edit, keyed by featureId, queued until Save. */
export interface UserRightsPendingChange {
  featureId: number;
  accessLevel: AccessLevel;
}
