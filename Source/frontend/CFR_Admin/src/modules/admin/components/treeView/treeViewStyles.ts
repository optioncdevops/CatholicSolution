import { cn } from "@app/utilities/cn";
import {
  themeTreeBranchRowClass,
  themeTreeChevronButtonClass,
  themeTreeGuideLineClass,
  themeTreeLeafRowClass,
  themeTreeLeafSelectedClass,
  themeTreeRowBaseClass,
  themeTreeSplitAsideClass,
  themeTreeSplitCollapsedRailClass,
  themeTreeSplitHeaderClass,
  themeTreeSplitMainClass,
  themeTreeSplitMobileBarClass,
  themeTreeSplitMobileModulesButtonClass,
  themeTreeSplitPanelGridClass,
  themeTreeSplitPanelGridCollapsibleClass,
  themeTreeSplitPanelRootClass,
  themeTreeSplitPanelRootFillClass,
  themeTreeSplitPanelRootFillViewportClass,
  themeTreeSplitPanelRootViewportClass,
  themeTreeSplitScrollBodyClass,
  themeTreeSplitSearchClass,
  themeTreeSplitToggleButtonClass,
  themeTreeSplitContentHeaderClass,
} from "@designSystem/theme/styles/componentStyle";

/** Collapsed rail width for `TreeViewSplitPanel` (px). */
export const TREE_NAV_COLLAPSED_WIDTH_PX = 44;

export function treeRowIndentStyle(level: number) {
  return { paddingLeft: `${8 + level * 12}px` };
}

export function treeBranchRowClass() {
  return cn(themeTreeRowBaseClass, themeTreeBranchRowClass, "min-h-[36px]");
}

export function treeLeafRowClass(isSelected: boolean) {
  return cn(themeTreeRowBaseClass, themeTreeLeafRowClass, "min-h-[32px]", isSelected && themeTreeLeafSelectedClass);
}

export function treeChevronButtonClass() {
  return themeTreeChevronButtonClass;
}

export function treeGuideLineClass(level: number) {
  return cn(themeTreeGuideLineClass, level > 0 ? "ml-5" : "ml-3");
}

export function treeExpandableRowClass(level: number) {
  return cn(themeTreeRowBaseClass, themeTreeBranchRowClass, level > 0 && "ml-1");
}

export function treeDisplayLeafClass(level: number) {
  return cn(themeTreeRowBaseClass, "min-h-[32px] font-medium text-[var(--primary)]", level > 0 && "ml-1");
}

export const treeSplitPanelRootClass = themeTreeSplitPanelRootClass;
export const treeSplitPanelRootFillClass = themeTreeSplitPanelRootFillClass;
export const treeSplitPanelRootFillViewportClass = themeTreeSplitPanelRootFillViewportClass;
export const treeSplitPanelRootViewportClass = themeTreeSplitPanelRootViewportClass;
export const treeSplitPanelGridClass = themeTreeSplitPanelGridClass;
export const treeSplitPanelGridCollapsibleClass = themeTreeSplitPanelGridCollapsibleClass;
export const treeSplitAsideClass = themeTreeSplitAsideClass;
export const treeSplitHeaderClass = themeTreeSplitHeaderClass;
export const treeSplitSearchClass = themeTreeSplitSearchClass;
export const treeSplitScrollBodyClass = themeTreeSplitScrollBodyClass;
export const treeSplitMainClass = themeTreeSplitMainClass;
export const treeSplitCollapsedRailClass = themeTreeSplitCollapsedRailClass;
export const treeSplitToggleButtonClass = themeTreeSplitToggleButtonClass;
export const treeSplitMobileModulesButtonClass = themeTreeSplitMobileModulesButtonClass;
export const treeSplitContentHeaderClass = themeTreeSplitContentHeaderClass;
export const treeSplitMobileBarClass = themeTreeSplitMobileBarClass;
