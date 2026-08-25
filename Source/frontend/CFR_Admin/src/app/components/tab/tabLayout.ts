import { normalizeTabVariant, type TabVariant } from "./tabVariants";

/** How the tab list behaves on narrow viewports */
export type TabListLayout = "scroll" | "wrap" | "grid" | "stack";

export function getTabListLayout(
  variant: TabVariant,
  orientation: "horizontal" | "vertical",
): TabListLayout {
  const v = normalizeTabVariant(variant);
  if (orientation === "vertical" || v === "vertical") {return "stack";}
  switch (v) {
    case "segmented":
    case "ios":
    case "enclosed":
      return "grid";
    case "pills":
    case "boxed":
      return "wrap";
    default:
      return "scroll";
  }
}

/** Outer shell for horizontal tab lists */
export function tabListShellClass(layout: TabListLayout) {
  return layout === "stack"
    ? "w-full min-w-0"
    : "relative w-full min-w-0 max-w-full";
}

/** Inner tablist flex/grid — no overflow-x-auto here (scroll uses .tab-list-scroll) */
export function tabListInnerLayoutClass(layout: TabListLayout) {
  switch (layout) {
    case "grid":
      return cnGrid();
    case "wrap":
      return "flex w-full flex-wrap gap-2";
    case "scroll":
      return "flex w-max min-w-full gap-1 sm:gap-2";
    case "stack":
    default:
      return "";
  }
}

function cnGrid() {
  return "grid w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-row sm:gap-0.5";
}

/** Per-trigger responsive width inside grid layout */
export function tabTriggerGridClass(layout: TabListLayout) {
  if (layout !== "grid") {return "";}
  return "min-w-0 w-full sm:w-auto sm:flex-none justify-center";
}
