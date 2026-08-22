import type { TreeNode } from "./TreeView";

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function nodeMatchesQuery(node: TreeNode, query: string): boolean {
  return node.label.toLowerCase().includes(query);
}

/** Returns a filtered tree copy; does not mutate the source. */
export function filterTreeNodes(nodes: TreeNode[], rawQuery: string): TreeNode[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) {return nodes;}

  const filterList = (list: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];

    for (const node of list) {
      const childList = node.children ?? [];
      const filteredChildren = childList.length ? filterList(childList) : [];
      const selfMatch = nodeMatchesQuery(node, query);
      const hasMatchingChild = filteredChildren.length > 0;

      if (!selfMatch && !hasMatchingChild) {continue;}

      result.push({
        ...node,
        children: selfMatch
          ? node.children
          : hasMatchingChild
            ? filteredChildren
            : undefined,
      });
    }

    return result;
  };

  return filterList(nodes);
}

/** Branch ids to expand so every match remains visible while searching. */
export function getAutoExpandedNodeIds(nodes: TreeNode[], rawQuery: string): Set<string> {
  const query = normalizeSearchText(rawQuery);
  if (!query) {return new Set();}

  const ids = new Set<string>();

  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.children?.length) {
        ids.add(node.id);
        walk(node.children);
      }
    }
  };

  walk(filterTreeNodes(nodes, rawQuery));
  return ids;
}

export function hasMatchingChild(nodes: TreeNode[], rawQuery: string): boolean {
  return filterTreeNodes(nodes, rawQuery).length > 0;
}
