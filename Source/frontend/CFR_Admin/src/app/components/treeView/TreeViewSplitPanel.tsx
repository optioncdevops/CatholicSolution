import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import { themeCardSurfaceClass, themeHeadingClass, themeTreeEmptyBodyClass, themeTreeEmptyStateClass } from "@designSystem/theme/styles/componentStyle";
import { InputField } from "../formControls/InputField";
import type { TreeNode } from "./TreeView";
import { SelectableTreeNav } from "./SelectableTreeNav";
import { findBranchAncestorIds, findTreeNodeById, isTreeLeaf, resolveInitialLeafSelectionId } from "./treeViewUtils";
import { AppIcon } from "@app/components/icons";
import { filterTreeNodes, getAutoExpandedNodeIds, normalizeSearchText } from "./treeViewSearchUtils";
import {
  treeSplitAsideClass,
  treeSplitCollapsedRailClass,
  treeSplitHeaderClass,
  treeSplitMainClass,
  treeSplitMobileModulesButtonClass,
  treeSplitPanelGridClass,
  treeSplitPanelGridCollapsibleClass,
  treeSplitPanelRootClass,
  treeSplitPanelRootFillClass,
  treeSplitPanelRootViewportClass,
  treeSplitScrollBodyClass,
  treeSplitSearchClass,
  treeSplitToggleButtonClass,
  treeSplitContentHeaderClass,
  treeSplitMobileBarClass,
  TREE_NAV_COLLAPSED_WIDTH_PX,
} from "./treeViewStyles";
import { TreeSplitPanelToggle } from "./TreeSplitPanelToggle";
import { readTreePanelCollapsed, writeTreePanelCollapsed } from "./treeSplitPanelStorage";
import { TreeSplitPanelLayoutProvider } from "./TreeSplitPanelLayoutContext";

type TreeSplitPanelStyle = CSSProperties & {
  "--tree-split-nav-width": string;
  "--tree-split-nav-active-width": string;
  "--tree-split-viewport-offset": string;
};

export interface TreeViewSplitPanelProps {
  data: TreeNode[];
  /** Renders body for the selected leaf — branches never call this */
  renderContent: (node: TreeNode) => ReactNode;
  selectedId?: string | null;
  defaultSelectedId?: string;
  onSelectionChange?: (node: TreeNode | null) => void;
  /**
   * When true (default), only leaf nodes are selectable and load the body.
   * Branch nodes expand/collapse only (standard explorer pattern).
   */
  leafSelectionOnly?: boolean;
  navWidth?: string;
  emptyContent?: ReactNode;
  /** Shown while `isContentLoading` is true */
  renderLoading?: ReactNode | (() => ReactNode);
  /** Page-driven loading flag (e.g. fetch detail for selected leaf) */
  isContentLoading?: boolean;
  navTitle?: ReactNode;
  renderContentHeader?: (node: TreeNode) => ReactNode;
  className?: string;
  /** Fill available workspace height from parent (e.g. page shell card). @default false */
  fillHeight?: boolean;
  /** Minimum panel height (also capped by viewport). @default 420 */
  minHeight?: string | number;
  /**
   * Pixels reserved for app chrome (header, nav, card title, footer buffer).
   * Used in `max-h-[calc(100dvh-offset)]`. @default 220
   */
  viewportOffset?: number;
  /**
   * @deprecated Unused — fill-height panels size from the parent flex shell.
   * Kept for call-site compatibility.
   */
  fillViewportOffset?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** How long tree labels overflow. @default 'ellipsis' */
  labelOverflow?: "ellipsis" | "wrap";
  /** Enable collapse rail on large screens. @default false */
  collapsible?: boolean;
  /** localStorage key for persisting collapse preference (desktop). */
  collapseStorageKey?: string;
  /** Initial collapsed state when no storage value exists. @default false */
  defaultNavCollapsed?: boolean;
}

const defaultEmpty = (
  <div className="text-center">
    <p className={cn("text-sm", themeHeadingClass)}>Select a child item</p>
    <p className="mt-1 text-sm text-[var(--text-muted)]">
      Expand a section in the tree, then choose an endpoint to load its content.
    </p>
  </div>
);

const defaultLoading = (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent"
      role="status"
      aria-label="Loading"
    />
    <p className="text-sm text-[var(--text-muted)]">Loading content…</p>
  </div>
);

function TreeNavEmptyState({ message }: { message: string }) {
  return (
    <p className={themeTreeEmptyStateClass} role="status">
      {message}
    </p>
  );
}

export function TreeViewSplitPanel({
  data,
  renderContent,
  selectedId: selectedIdProp,
  defaultSelectedId,
  onSelectionChange,
  leafSelectionOnly = true,
  navWidth = "280px",
  emptyContent = defaultEmpty,
  renderLoading = defaultLoading,
  isContentLoading = false,
  navTitle,
  renderContentHeader,
  className,
  fillHeight = false,
  minHeight = 420,
  viewportOffset = 220,
  searchable = true,
  searchPlaceholder = "Search...",
  searchValue: searchValueProp,
  onSearchChange,
  labelOverflow = "ellipsis",
  collapsible = false,
  collapseStorageKey,
  defaultNavCollapsed = false,
}: TreeViewSplitPanelProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(() => {
    if (!collapsible) { return false; }
    if (collapseStorageKey) { return readTreePanelCollapsed(collapseStorageKey); }
    return defaultNavCollapsed;
  });
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  const [internalSearch, setInternalSearch] = useState("");
  const isSearchControlled = searchValueProp !== undefined;
  const searchValue = isSearchControlled ? searchValueProp : internalSearch;
  const isSearchActive = searchable && normalizeSearchText(searchValue).length > 0;

  const setSearchValue = useCallback(
    (value: string) => {
      if (!isSearchControlled) { setInternalSearch(value); }
      onSearchChange?.(value);
    },
    [isSearchControlled, onSearchChange],
  );

  const initialId = useMemo(() => resolveInitialLeafSelectionId(data, defaultSelectedId), [data, defaultSelectedId]);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(initialId);

  const isControlled = selectedIdProp !== undefined;
  const selectedId = isControlled ? selectedIdProp : internalSelectedId;

  const filteredData = useMemo(() => (isSearchActive ? filterTreeNodes(data, searchValue) : data), [data, isSearchActive, searchValue]);

  const selectionOpenIds = useMemo(() => {
    if (!selectedId) { return undefined; }
    const ids = findBranchAncestorIds(data, selectedId);
    return ids?.length ? new Set(ids) : undefined;
  }, [data, selectedId]);

  const searchExpandedIds = useMemo(
    () => (isSearchActive ? getAutoExpandedNodeIds(data, searchValue) : undefined),
    [data, isSearchActive, searchValue],
  );

  const selectedNode = useMemo(() => {
    if (!selectedId) { return undefined; }
    const node = findTreeNodeById(data, selectedId);
    if (!node) { return undefined; }
    if (leafSelectionOnly && !isTreeLeaf(node)) { return undefined; }
    return node;
  }, [data, selectedId, leafSelectionOnly]);

  useEffect(() => {
    if (!collapsible || !collapseStorageKey) { return; }
    writeTreePanelCollapsed(collapseStorageKey, isNavCollapsed);
  }, [collapsible, collapseStorageKey, isNavCollapsed]);

  // Adopt the resolved initial leaf id once data/defaultSelectedId make one available.
  // Adjusted during render (not in an effect) — the condition is self-guarding
  // (`internalSelectedId === null` only until this first fires), so it cannot loop.
  if (!isControlled && initialId && internalSelectedId === null) {
    setInternalSelectedId(initialId);
  }

  const handleSelect = useCallback(
    (node: TreeNode) => {
      if (leafSelectionOnly && !isTreeLeaf(node)) { return; }
      if (!isControlled) { setInternalSelectedId(node.id); }
      onSelectionChange?.(node);
      if (collapsible && typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
        setMobileTreeOpen(false);
      }
    },
    [collapsible, isControlled, leafSelectionOnly, onSelectionChange],
  );

  const toggleNavCollapsed = useCallback(() => {
    setIsNavCollapsed((value) => !value);
  }, []);

  const navActiveWidth = collapsible && isNavCollapsed ? `${TREE_NAV_COLLAPSED_WIDTH_PX}px` : navWidth;

  const minHeightCss = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  const splitStyle: TreeSplitPanelStyle = {
    "--tree-split-nav-width": navWidth,
    "--tree-split-nav-active-width": navActiveWidth,
    "--tree-split-viewport-offset": `${viewportOffset}px`,
    ...(!fillHeight ? { minHeight: `min(${minHeightCss}, calc(100dvh - ${viewportOffset}px))` } : {}),
  };

  const showBody = Boolean(selectedNode);
  const showLoading = showBody && isContentLoading;
  const hasTreeData = data.length > 0;
  const showNoSearchResults = isSearchActive && filteredData.length === 0;
  const showDesktopCollapsedRail = collapsible && isNavCollapsed;
  const showMobileNav = !collapsible || mobileTreeOpen;
  const showMobileModulesButton = collapsible && !mobileTreeOpen;

  const treeNavBody = (
    <>
      {searchable ? (
        <div className={treeSplitSearchClass}>
          <InputField
            label="Search tree"
            hideLabel
            name="tree-split-search"
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            startIcon={<AppIcon name="search" size="controlField" className="text-[var(--text-muted)]" decorative />}
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}

      <div className={treeSplitScrollBodyClass}>
        {!hasTreeData ? (
          <TreeNavEmptyState message="No items available" />
        ) : showNoSearchResults ? (
          <TreeNavEmptyState message="No matching items found" />
        ) : (
          <SelectableTreeNav
            data={filteredData}
            selectedId={selectedId}
            onSelect={handleSelect}
            leafSelectionOnly={leafSelectionOnly}
            selectionOpenIds={selectionOpenIds}
            forceOpenIds={searchExpandedIds}
            defaultExpandLevelZero={!isSearchActive}
            labelOverflow={labelOverflow}
          />
        )}
      </div>
    </>
  );

  return (
    <div
      className={cn(treeSplitPanelRootClass, fillHeight ? treeSplitPanelRootFillClass : treeSplitPanelRootViewportClass, themeCardSurfaceClass, className)}
      style={splitStyle}
    >
      <div className={cn(treeSplitPanelGridClass, collapsible && treeSplitPanelGridCollapsibleClass)}>
        <aside
          className={cn(
            treeSplitAsideClass,
            collapsible
              ? cn(
                "max-lg:w-full",
                showDesktopCollapsedRail && "lg:w-[var(--tree-split-nav-active-width)]",
                !showDesktopCollapsedRail && "lg:w-[var(--tree-split-nav-active-width)] lg:min-w-[240px] lg:max-w-[300px]",
                !showMobileNav && "max-lg:hidden",
              )
              : "w-full md:w-[var(--tree-split-nav-width)] md:min-w-[240px] md:max-w-[300px]",
          )}
        >
          {showDesktopCollapsedRail ? (
            <div className={treeSplitCollapsedRailClass}>
              <TreeSplitPanelToggle panelExpanded={false} onToggle={toggleNavCollapsed} tooltipSide="right" />
              <AppIcon name="folderTree" size="controlField" className="text-[var(--text-muted)]" decorative />
              <span className="sr-only">{navTitle ?? "Tree navigation"}</span>
            </div>
          ) : null}

          <div className={cn("flex h-full min-h-0 flex-1 flex-col overflow-hidden", showDesktopCollapsedRail && "lg:hidden")}>
            {navTitle ? (
              <div className={treeSplitHeaderClass}>
                <div className="flex items-center justify-between gap-2">
                  <div className={cn("min-w-0 truncate text-sm font-semibold", themeHeadingClass)}>{navTitle}</div>
                  <div className="flex shrink-0 items-center gap-1">
                    {collapsible ? (
                      <>
                        <TreeSplitPanelToggle
                          panelExpanded
                          onToggle={toggleNavCollapsed}
                          tooltipSide="left"
                          className="hidden lg:inline-flex"
                        />
                        <button
                          type="button"
                          aria-label="Close modules"
                          onClick={() => setMobileTreeOpen(false)}
                          className={cn(treeSplitToggleButtonClass, "lg:hidden")}
                        >
                          <AppIcon name="chevronLeft" size="controlClear" decorative />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {treeNavBody}
          </div>
        </aside>

        <main className={cn(treeSplitMainClass, collapsible && !showMobileNav && "max-lg:col-span-full max-lg:w-full")}>
          {showMobileModulesButton ? (
            <div className={treeSplitMobileBarClass}>
              <button type="button" className={treeSplitMobileModulesButtonClass} aria-expanded={mobileTreeOpen} onClick={() => setMobileTreeOpen(true)}>
                <AppIcon name="folderTree" size="controlField" decorative />
                <span>{navTitle ?? "Modules"}</span>
              </button>
            </div>
          ) : null}

          {showBody ? (
            <>
              {renderContentHeader && !showLoading && <div className={treeSplitContentHeaderClass}>{renderContentHeader(selectedNode!)}</div>}
              {fillHeight ? (
                <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable]">
                  {showLoading ? (
                    <div className="flex min-h-[12rem] items-center justify-center px-4 py-4 sm:px-6 sm:py-5">
                      {typeof renderLoading === "function" ? renderLoading() : renderLoading}
                    </div>
                  ) : (
                    <TreeSplitPanelLayoutProvider fillHeight>
                      <div className="w-full min-w-0">{renderContent(selectedNode!)}</div>
                    </TreeSplitPanelLayoutProvider>
                  )}
                </div>
              ) : (
                <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable]">
                  {showLoading ? (
                    <div className="px-4 py-4 sm:px-6 sm:py-5">{typeof renderLoading === "function" ? renderLoading() : renderLoading}</div>
                  ) : (
                    <div className="px-4 py-4 sm:px-6 sm:py-5">{renderContent(selectedNode!)}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={themeTreeEmptyBodyClass}>{emptyContent}</div>
          )}
        </main>
      </div>
    </div>
  );
}
