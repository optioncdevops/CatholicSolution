import type { UserRightsFeatureNode, UserRightsPendingChange } from '../types/userRightsTypes';

type RawRow = Record<string, unknown>;

//#region Defensive field extraction
// GetUserRights returns Dapper `dynamic` rows (no typed C# DTO — see userRightsService.ts), so
// row keys arrive as whatever the unchecked-in stored procedure aliases its columns as. Reading
// every field across the plausible casings/aliases means a live-DB naming difference degrades to
// a missing label/description instead of crashing the page.
function pick(row: RawRow, keys: string[]): unknown {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function pickString(row: RawRow, keys: string[]): string {
  const value = pick(row, keys);
  if (typeof value === 'string') return value.trim();
  return value != null ? String(value) : '';
}

function pickNumber(row: RawRow, keys: string[], fallback: number): number {
  const value = pick(row, keys);
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function pickBoolean(row: RawRow, keys: string[]): boolean {
  const value = pick(row, keys);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'on';
  return false;
}

const FEATURE_ID_KEYS = ['FeatureID', 'FeatureId', 'featureID', 'featureId'];
const PARENT_ID_KEYS = ['ParentId', 'ParentID', 'parentId'];
const MODULE_KEYS = ['Module', 'module'];
const SUBMODULE_KEYS = ['SubModule', 'subModule'];
const ACTIVITY_KEYS = ['Activity', 'activity'];
const DESCRIPTION_KEYS = ['ItemDescription', 'Description', 'description', 'itemDescription'];
const DISPLAY_ORDER_KEYS = ['DisplayOrder', 'displayOrder'];
const ROUTING_URL_KEYS = ['RoutingUrl', 'RoutingURL', 'routingUrl'];
const SHOW_IN_USER_RIGHT_KEYS = ['ShowinUserRight', 'ShowInUserRight', 'showinUserRight', 'showInUserRight'];
const IS_DELETED_KEYS = ['IsDeleted', 'isDeleted'];
const ACCESS_RIGHT_KEYS = ['AccessRight', 'accessRight', 'UserRight', 'userRight'];

function pickLabel(row: RawRow): string {
  return pickString(row, SUBMODULE_KEYS) || pickString(row, ACTIVITY_KEYS) || pickString(row, MODULE_KEYS) || 'Untitled';
}
//#endregion

/** Builds the module/submenu/activity tree from the `modules` result set (the feature catalog),
 * merging in each feature's current grant from the `userRights` result set (already scoped to
 * the requested role by the backend). Rows explicitly marked deleted or hidden from the rights
 * screen (`ShowinUserRight`) are dropped; a row missing that flag entirely is kept, since we
 * cannot distinguish "not shown" from "column not present under this casing" otherwise. */
export function buildUserRightsTree(resultData: unknown): UserRightsFeatureNode[] {
  const root = (resultData && typeof resultData === 'object') ? (resultData as RawRow) : {};
  const moduleRows = (Array.isArray(root.modules) ? root.modules : Array.isArray(root.Modules) ? root.Modules : []) as RawRow[];
  const rightRows = (Array.isArray(root.userRights) ? root.userRights : Array.isArray(root.UserRights) ? root.UserRights : []) as RawRow[];

  const accessByFeatureId = new Map<number, boolean>();
  for (const row of rightRows) {
    const featureId = pickNumber(row, FEATURE_ID_KEYS, -1);
    if (featureId >= 0) accessByFeatureId.set(featureId, pickBoolean(row, ACCESS_RIGHT_KEYS));
  }

  const nodesById = new Map<number, UserRightsFeatureNode>();
  const childrenByParent = new Map<number, UserRightsFeatureNode[]>();
  const order: number[] = [];

  for (const row of moduleRows) {
    if (pickBoolean(row, IS_DELETED_KEYS)) continue;
    if (pick(row, SHOW_IN_USER_RIGHT_KEYS) !== undefined && !pickBoolean(row, SHOW_IN_USER_RIGHT_KEYS)) continue;

    const featureId = pickNumber(row, FEATURE_ID_KEYS, -1);
    if (featureId < 0 || nodesById.has(featureId)) continue;
    const parentId = pickNumber(row, PARENT_ID_KEYS, 0);

    const node: UserRightsFeatureNode = {
      featureId,
      parentId,
      label: pickLabel(row),
      description: pickString(row, DESCRIPTION_KEYS),
      routingUrl: pickString(row, ROUTING_URL_KEYS),
      displayOrder: pickNumber(row, DISPLAY_ORDER_KEYS, 0),
      accessRight: accessByFeatureId.get(featureId) ?? false,
      children: [],
    };
    nodesById.set(featureId, node);
    order.push(featureId);
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(parentId, siblings);
  }

  const byOrder = (a: UserRightsFeatureNode, b: UserRightsFeatureNode) => a.displayOrder - b.displayOrder || a.featureId - b.featureId;

  const attach = (node: UserRightsFeatureNode): void => {
    const children = (childrenByParent.get(node.featureId) ?? []).sort(byOrder);
    node.children = children;
    children.forEach(attach);
  };

  const roots = order
    .map((id) => nodesById.get(id))
    .filter((node): node is UserRightsFeatureNode => Boolean(node) && (node!.parentId === 0 || !nodesById.has(node!.parentId)));
  roots.forEach(attach);
  return roots.sort(byOrder);
}

/** Every featureId in a node's own subtree (itself + all descendants) — used both to bulk-apply
 * a toggle to a whole branch and to compute that branch's rolled-up checkbox state. */
export function collectSubtreeFeatureIds(node: UserRightsFeatureNode): number[] {
  return [node.featureId, ...node.children.flatMap(collectSubtreeFeatureIds)];
}

export type RowRollup = 'checked' | 'unchecked' | 'mixed';

/** Resolves a node's effective (pending-change-aware) access state, and — for a branch — whether
 * every feature underneath agrees, so the row can render a real check, an empty box, or a
 * indeterminate dash. */
export function computeRowRollup(node: UserRightsFeatureNode, effective: (featureId: number) => boolean): RowRollup {
  const values = collectSubtreeFeatureIds(node).map(effective);
  const allChecked = values.every(Boolean);
  const allUnchecked = values.every((value) => !value);
  if (allChecked) return 'checked';
  if (allUnchecked) return 'unchecked';
  return 'mixed';
}

interface FlatRightsRow {
  node: UserRightsFeatureNode;
  depth: number;
}

/** Depth-first flatten, recursing only into expanded branches — mirrors the prior prototype's
 * traversal so collapse/expand behavior stays familiar. */
export function flattenUserRightsTree(nodes: UserRightsFeatureNode[], depth: number, expanded: Set<number>): FlatRightsRow[] {
  return nodes.flatMap((node) => {
    const row: FlatRightsRow = { node, depth };
    if (node.children.length > 0 && expanded.has(node.featureId)) {
      return [row, ...flattenUserRightsTree(node.children, depth + 1, expanded)];
    }
    return [row];
  });
}

export function collectAllFeatureIds(nodes: UserRightsFeatureNode[]): number[] {
  return nodes.flatMap(collectSubtreeFeatureIds);
}

/** Merges a queued change into the pending map, replacing any earlier queued value for the same
 * feature (never appending a duplicate entry). */
export function mergePendingChange(pending: Map<number, boolean>, featureId: number, accessRight: boolean): Map<number, boolean> {
  const next = new Map(pending);
  next.set(featureId, accessRight);
  return next;
}

export function toPendingChangeList(pending: Map<number, boolean>): UserRightsPendingChange[] {
  return Array.from(pending.entries()).map(([featureId, accessRight]) => ({ featureId, accessRight }));
}
