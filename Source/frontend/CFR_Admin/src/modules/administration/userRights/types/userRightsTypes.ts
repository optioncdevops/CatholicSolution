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

/**
 * The row's real kind in `auth.ModuleFeatures` — NOT the same thing as {@link AccessLevel} above
 * (that's the permission grant; this is what TYPE of row it is). Derived from confirmed live
 * data, not tree depth: a "Reset Password" activity row sits directly under the "Users" module
 * (one level, not two), so depth alone cannot tell Feature and Activity apart. The real signal:
 *   - `parentId === 0` → **module** (top-level: Dashboard, Products, Users, Administration, …)
 *   - `ParentId` set AND the row's `Activity` column is non-blank (mirrored by
 *     `ModuleFeatures.AccessLevel = 1`) → **activity** (a button/action, e.g. "Reset Password")
 *   - anything else (has a parent, not an activity) → **feature** (a submenu, e.g. "User Roles")
 * Only **feature** rows may be set to Read Only — modules and activities are Access/Denied only.
 */
export type FeatureNodeKind = 'module' | 'feature' | 'activity';

/** One row of `auth.ModuleFeatures`, merged with the signed-in role's `auth.ModuleRights` grant.
 * Every node — module, feature, or activity — carries its own independently-persisted
 * `accessLevel`; there is no separate per-action (view/add/edit/delete) split in the backend
 * model, just this one flag per feature (three-state for Feature rows, two-state otherwise). */
export interface UserRightsFeatureNode {
  featureId: number;
  parentId: number;
  kind: FeatureNodeKind;
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
