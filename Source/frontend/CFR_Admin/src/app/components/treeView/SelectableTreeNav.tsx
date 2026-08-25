import { useMemo, useState } from "react";
import { cn } from "@app/utilities/cn";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import type { TreeNode } from "./TreeView";
import { findBranchAncestorIds, isTreeLeaf } from "./treeViewUtils";
import { AppIcon } from "@app/components/icons";
import { treeBranchRowClass, treeChevronButtonClass, treeGuideLineClass, treeLeafRowClass, treeRowIndentStyle } from "./treeViewStyles";

export interface SelectableTreeNavProps {
  data: TreeNode[];
  selectedId: string | null;
  onSelect: (node: TreeNode) => void;
  /**
   * Standard master-detail: branches expand/collapse only; leaves load content.
   * @default true
   */
  leafSelectionOnly?: boolean;
  /** Branch ids for the current selection path (use full tree, not filtered). */
  selectionOpenIds?: Set<string>;
  /** Extra branch ids that should render expanded (e.g. search matches). */
  forceOpenIds?: Set<string>;
  /** When false, top-level branches start collapsed unless in `forceOpenIds`. @default true */
  defaultExpandLevelZero?: boolean;
  /** @default 'ellipsis' */
  labelOverflow?: "ellipsis" | "wrap";
  className?: string;
}

function TreeNavLabel({ label, labelOverflow }: { label: string; labelOverflow: "ellipsis" | "wrap" }) {
  if (labelOverflow === "wrap") {
    return <span className="min-w-0 flex-1 text-sm leading-snug break-words">{label}</span>;
  }

  return (
    <div className="min-w-0 flex-1">
      <Tooltip content={label} side="right">
        <span className="block min-w-0 truncate text-sm">{label}</span>
      </Tooltip>
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedId: string | null;
  onSelect: (node: TreeNode) => void;
  leafSelectionOnly: boolean;
  openIds: Set<string>;
  forceOpenIds?: Set<string>;
  defaultExpandLevelZero: boolean;
  expandedOverrides: Record<string, boolean>;
  setExpandedOverride: (id: string, open: boolean) => void;
  labelOverflow: "ellipsis" | "wrap";
}

function TreeNavItem({
  node,
  level,
  selectedId,
  onSelect,
  leafSelectionOnly,
  openIds,
  forceOpenIds,
  defaultExpandLevelZero,
  expandedOverrides,
  setExpandedOverride,
  labelOverflow,
}: TreeItemProps) {
  const hasChildren = Boolean(node.children?.length);
  const isBranch = hasChildren;
  const isLeaf = isTreeLeaf(node);
  const isSelected = isLeaf && selectedId === node.id;

  const defaultOpen = openIds.has(node.id) || (defaultExpandLevelZero && level === 0 && isBranch);
  const searchForcedOpen = Boolean(forceOpenIds?.has(node.id));
  const isOpen =
    isBranch &&
    (searchForcedOpen && expandedOverrides[node.id]
      ? true
      : expandedOverrides[node.id] !== undefined
        ? expandedOverrides[node.id]
        : defaultOpen);

  const toggleOpen = () => {
    if (isBranch) {setExpandedOverride(node.id, !isOpen);}
  };

  const handleRowClick = () => {
    if (isBranch && leafSelectionOnly) {
      toggleOpen();
      return;
    }
    if (isLeaf) {onSelect(node);}
    else if (!leafSelectionOnly) {onSelect(node);}
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleOpen();
  };

  return (
    <div className="min-w-0 select-none">
      <div
        role="treeitem"
        aria-selected={isLeaf ? isSelected : undefined}
        aria-current={isSelected ? "page" : undefined}
        aria-expanded={isBranch ? isOpen : undefined}
        className={cn(
          "min-w-0 w-full",
          level > 0 && "ml-1",
          isBranch ? treeBranchRowClass() : treeLeafRowClass(isSelected),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        )}
        style={treeRowIndentStyle(level)}
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleRowClick();
          }
        }}
      >
        {isBranch ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={isOpen ? "Collapse section" : "Expand section"}
            className={treeChevronButtonClass()}
            onClick={handleChevronClick}
          >
            {isOpen ? (
              <AppIcon name="chevronDown" size="menuChevron" className="text-[var(--secondary-hover)]" />
            ) : (
              <AppIcon name="chevronRight" size="menuChevron" className="text-[var(--primary)]/80" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
          </span>
        )}

        {isBranch && (
          <span className="shrink-0 text-[var(--primary)]/80">
            {isOpen ? <AppIcon name="folderOpen" size="menuMain" decorative /> : <AppIcon name="folder" size="menuMain" decorative />}
          </span>
        )}

        <TreeNavLabel label={node.label} labelOverflow={labelOverflow} />
      </div>

      {isOpen && isBranch && (
        <div className={cn(treeGuideLineClass(level), "min-w-0")}>
          {node.children!.map((child) => (
            <TreeNavItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              leafSelectionOnly={leafSelectionOnly}
              openIds={openIds}
              forceOpenIds={forceOpenIds}
              defaultExpandLevelZero={defaultExpandLevelZero}
              expandedOverrides={expandedOverrides}
              setExpandedOverride={setExpandedOverride}
              labelOverflow={labelOverflow}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SelectableTreeNav({
  data,
  selectedId,
  onSelect,
  leafSelectionOnly = true,
  selectionOpenIds,
  forceOpenIds,
  defaultExpandLevelZero = true,
  labelOverflow = "ellipsis",
  className,
}: SelectableTreeNavProps) {
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

  const openIds = useMemo(() => {
    const merged = new Set<string>();
    if (selectionOpenIds) {
      selectionOpenIds.forEach((id) => merged.add(id));
    } else if (selectedId) {
      const ids = findBranchAncestorIds(data, selectedId);
      ids?.forEach((id) => merged.add(id));
    }
    return merged;
  }, [data, selectedId, selectionOpenIds]);

  const setExpandedOverride = (id: string, open: boolean) => {
    setExpandedOverrides((prev) => ({ ...prev, [id]: open }));
  };

  return (
    <nav className={cn("min-w-0 space-y-0.5", className)} role="tree" aria-label="Tree navigation">
      {data.map((node) => (
        <TreeNavItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          leafSelectionOnly={leafSelectionOnly}
          openIds={openIds}
          forceOpenIds={forceOpenIds}
          defaultExpandLevelZero={defaultExpandLevelZero}
          expandedOverrides={expandedOverrides}
          setExpandedOverride={setExpandedOverride}
          labelOverflow={labelOverflow}
        />
      ))}
    </nav>
  );
}
