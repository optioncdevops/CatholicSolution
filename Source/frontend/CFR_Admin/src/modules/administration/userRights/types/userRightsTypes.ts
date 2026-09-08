/** One row of `auth.ModuleFeatures`, merged with the signed-in role's `auth.ModuleRights` grant.
 * Every node — module, submenu, or activity — carries its own independently-persisted
 * `accessRight` flag; there is no separate view/add/edit/delete split in the backend model. */
export interface UserRightsFeatureNode {
  featureId: number;
  parentId: number;
  label: string;
  description: string;
  routingUrl: string;
  displayOrder: number;
  accessRight: boolean;
  children: UserRightsFeatureNode[];
}

/** A single pending edit, keyed by featureId, queued until Save. */
export interface UserRightsPendingChange {
  featureId: number;
  accessRight: boolean;
}
