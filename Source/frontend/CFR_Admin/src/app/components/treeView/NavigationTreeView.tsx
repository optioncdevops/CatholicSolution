import { useState } from "react";
import { cn } from "@app/utilities/cn";
import { themePanelSurfaceClass } from "@designSystem/theme/styles/componentStyle";
import { AppIcon } from "@app/components/icons";
import { treeChevronButtonClass, treeExpandableRowClass, treeGuideLineClass, treeRowIndentStyle } from "./treeViewStyles";

export interface NavNode {
  id: string;
  label: string;
  type: "folder" | "file";
  children?: NavNode[];
}

interface NavigationTreeItemProps {
  node: NavNode;
  level?: number;
}

const NavigationTreeItem = ({ node, level = 0 }: NavigationTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = Boolean(node.children?.length);
  const isFolder = node.type === "folder";

  const toggle = () => hasChildren && setIsOpen((o) => !o);

  return (
    <div className="select-none" role="none">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
        className={cn(treeExpandableRowClass(level), !isFolder && "font-normal text-[var(--text-muted)]")}
        style={treeRowIndentStyle(level)}
        onClick={toggle}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            className={treeChevronButtonClass()}
            aria-label={isOpen ? "Collapse folder" : "Expand folder"}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {isOpen ? (
              <AppIcon name="chevronDown" size={14} className="text-[var(--secondary-hover)]" />
            ) : (
              <AppIcon name="chevronRight" size={14} className="text-[var(--primary)]/80" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 shrink-0" aria-hidden />
        )}

        <span className={cn("shrink-0", isFolder && isOpen ? "text-[var(--secondary-hover)]" : "text-[var(--primary-hover)]")}>
          {isFolder ? isOpen ? <AppIcon name="folderOpen" size={16} /> : <AppIcon name="folder" size={16} /> : <AppIcon name="fileText" size={16} />}
        </span>

        <span className="min-w-0 flex-1 truncate text-sm">{node.label}</span>
      </div>

      {isOpen && hasChildren && (
        <div className={treeGuideLineClass(level)}>
          {node.children!.map((child) => (
            <NavigationTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export interface NavigationTreeViewProps {
  data: NavNode[];
  className?: string;
  "aria-label"?: string;
}

export const NavigationTreeView = ({ data, className, "aria-label": ariaLabel }: NavigationTreeViewProps) => {
  return (
    <div className={cn("p-3", themePanelSurfaceClass, className)} role="tree" aria-label={ariaLabel ?? "Document tree"}>
      {data.map((node) => (
        <NavigationTreeItem key={node.id} node={node} />
      ))}
    </div>
  );
};
