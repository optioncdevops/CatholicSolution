import { accessLevelFromCode, type AccessLevel, type UserRightsFeatureNode, type UserRightsPendingChange } from '../types/userRightsTypes';

type RawRow = Record<string, unknown>;

//#region Field extraction
// GetUserRights returns Dapper `dynamic` rows (no typed C# DTO — see userRightsService.ts), so
// JSON keys are the exact SQL column aliases from `auth.GetRightByRoleId`'s third result set:
//   FeatureID, ParentId, GrandParentId, Module, SubModule, ItemDescription, AccessRight
// (confirmed against the live stored procedure — see 016_Acutis_UserAccessVerification.sql for
// how to re-check this against a given database). That result set does NOT project DisplayOrder
// or RoutingUrl, even though it's *sorted* by DisplayOrder — so row order must be preserved
// as-returned rather than re-sorted, and `routingUrl` is intentionally always blank here.
function pickString(row: RawRow, key: string): string {
  const value = row[key];
  if (typeof value === 'string') return value.trim();
  return value != null ? String(value) : '';
}

function pickNumber(row: RawRow, key: string, fallback: number): number {
  const value = row[key];
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function pickLabel(row: RawRow): string {
  // A leaf "activity" row (e.g. FeatureID 11, "Reset Password" under Users) carries neither
  // Module nor SubModule — only Activity — so it must be checked too, not just as a last resort.
  return pickString(row, 'SubModule') || pickString(row, 'Module') || pickString(row, 'Activity') || 'Untitled';
}
//#endregion

/** Builds the module/submenu tree directly from `GetUserRights`'s `userRights` result set — that
 * one result set already carries both the feature catalog (FeatureID/ParentId/labels) AND each
 * feature's grant for the requested role (AccessRight), pre-filtered server-side to
 * `ShowinUserRight = 1`. Sibling order is the order the rows arrived in (the backend's own
 * `ORDER BY DisplayOrder`), not re-sorted client-side — there is no DisplayOrder column to sort
 * by here. */
export function buildUserRightsTree(resultData: unknown): UserRightsFeatureNode[] {
  const root = (resultData && typeof resultData === 'object') ? (resultData as RawRow) : {};
  const rows = (Array.isArray(root.userRights) ? root.userRights : Array.isArray(root.UserRights) ? root.UserRights : []) as RawRow[];

  const nodesById = new Map<number, UserRightsFeatureNode>();
  const childrenByParent = new Map<number, UserRightsFeatureNode[]>();
  const order: number[] = [];

  for (const row of rows) {
    const featureId = pickNumber(row, 'FeatureID', -1);
    if (featureId < 0 || nodesById.has(featureId)) continue;
    const parentId = pickNumber(row, 'ParentId', 0);

    const node: UserRightsFeatureNode = {
      featureId,
      parentId,
      label: pickLabel(row),
      description: pickString(row, 'ItemDescription'),
      routingUrl: '',
      accessLevel: accessLevelFromCode(pickNumber(row, 'AccessRight', 0)),
      children: [],
    };
    nodesById.set(featureId, node);
    order.push(featureId);
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(parentId, siblings);
  }

  const attach = (node: UserRightsFeatureNode): void => {
    const children = childrenByParent.get(node.featureId) ?? [];
    node.children = children;
    children.forEach(attach);
  };

  const roots = order
    .map((id) => nodesById.get(id))
    .filter((node): node is UserRightsFeatureNode => Boolean(node) && (node!.parentId === 0 || !nodesById.has(node!.parentId)));
  roots.forEach(attach);
  return roots;
}

/** Every featureId in a node's own subtree (itself + all descendants) — used both to bulk-apply
 * a permission level to a whole branch and to compute that branch's rolled-up state. */
export function collectSubtreeFeatureIds(node: UserRightsFeatureNode): number[] {
  return [node.featureId, ...node.children.flatMap(collectSubtreeFeatureIds)];
}

export type RowRollup = AccessLevel | 'mixed';

/** Resolves a branch's rolled-up permission state from its pending-change-aware effective level
 * at every feature underneath it: a single level if every feature agrees, otherwise "mixed" (so
 * the row shows no pill as selected, the same way the prior design signaled "mixed"). */
export function computeRowRollup(node: UserRightsFeatureNode, effective: (featureId: number) => AccessLevel): RowRollup {
  const values = collectSubtreeFeatureIds(node).map(effective);
  const first = values[0];
  return values.every((value) => value === first) ? first : 'mixed';
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
export function mergePendingChange(pending: Map<number, AccessLevel>, featureId: number, accessLevel: AccessLevel): Map<number, AccessLevel> {
  const next = new Map(pending);
  next.set(featureId, accessLevel);
  return next;
}

export function toPendingChangeList(pending: Map<number, AccessLevel>): UserRightsPendingChange[] {
  return Array.from(pending.entries()).map(([featureId, accessLevel]) => ({ featureId, accessLevel }));
}
