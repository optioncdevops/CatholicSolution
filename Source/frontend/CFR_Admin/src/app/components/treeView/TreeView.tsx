import { useState } from "react";
import { cn } from "@app/utilities/cn";
import { themePanelSurfaceClass } from "@designSystem/theme/styles/componentStyle";
import { AppIcon } from "@app/components/icons";
import {
  treeChevronButtonClass,
  treeDisplayLeafClass,
  treeExpandableRowClass,
  treeGuideLineClass,
  treeRowIndentStyle,
} from "./treeViewStyles";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeItemProps {
  node: TreeNode;
  level?: number;
}

const TreeItem = ({ node, level = 0 }: TreeItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = Boolean(node.children?.length);

  const toggle = () => hasChildren && setIsOpen((o) => !o);

  return (
    <div className="select-none" role="none">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
        className={cn(hasChildren ? treeExpandableRowClass(level) : treeDisplayLeafClass(level))}
        style={treeRowIndentStyle(level)}
        onClick={toggle}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            className={treeChevronButtonClass()}
            aria-label={isOpen ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {isOpen ? (
              <AppIcon name="chevronDown" size={16} className="text-[var(--secondary-hover)]" />
            ) : (
              <AppIcon name="chevronRight" size={16} className="text-[var(--primary)]/80" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{node.label}</span>
      </div>
      {isOpen && hasChildren && (
        <div className={treeGuideLineClass(level)}>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export interface TreeViewProps {
  data: TreeNode[];
  className?: string;
  "aria-label"?: string;
}

export const TreeView = ({ data, className, "aria-label": ariaLabel }: TreeViewProps) => {
  return (
    <div className={cn("p-2", themePanelSurfaceClass, className)} role="tree" aria-label={ariaLabel ?? "Hierarchy"}>
      {data.map((node) => (
        <TreeItem key={node.id} node={node} />
      ))}
    </div>
  );
};
