import type { TreeNode } from "./TreeView";

/** Leaf = selectable endpoint (no child nodes) */
export function isTreeLeaf(node: TreeNode): boolean {
  return !node.children?.length;
}

/** Depth-first search for a node by id */
export function findTreeNodeById(
  nodes: TreeNode[],
  id: string,
): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {return node;}
    if (node.children?.length) {
      const found = findTreeNodeById(node.children, id);
      if (found) {return found;}
    }
  }
  return undefined;
}

/** First leaf node (no children) — default selection for split panels */
export function findFirstLeafNode(nodes: TreeNode[]): TreeNode | undefined {
  for (const node of nodes) {
    if (isTreeLeaf(node)) {return node;}
    if (node.children?.length) {
      const child = findFirstLeafNode(node.children);
      if (child) {return child;}
    }
  }
  return undefined;
}

/** Ids of branch nodes on the path to `targetId` (folders only, not the target itself) */
export function findBranchAncestorIds(
  nodes: TreeNode[],
  targetId: string,
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {return ancestors;}
    if (node.children?.length) {
      const found = findBranchAncestorIds(node.children, targetId, [
        ...ancestors,
        node.id,
      ]);
      if (found) {return found;}
    }
  }
  return null;
}

/** Resolve initial selection: only leaf ids are valid */
export function resolveInitialLeafSelectionId(
  nodes: TreeNode[],
  preferredId?: string,
): string | null {
  if (preferredId) {
    const preferred = findTreeNodeById(nodes, preferredId);
    if (preferred && isTreeLeaf(preferred)) {return preferredId;}
  }
  return findFirstLeafNode(nodes)?.id ?? null;
}

/** Collect all node ids for validation */
export function collectTreeNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      ids.push(n.id);
      if (n.children?.length) {walk(n.children);}
    }
  };
  walk(nodes);
  return ids;
}
