import { cn } from "@app/utilities/cn";
import {
  themeTabActiveClass,
  themeTabBoxedActiveClass,
  themeTabBoxedInactiveClass,
  themeTabChromeActiveClass,
  themeTabChromeInactiveClass,
  themeTabChromeListClass,
  themeTabEnclosedActiveClass,
  themeTabEnclosedInactiveClass,
  themeTabEnclosedListClass,
  themeTabFocusClass,
  themeTabFluentActiveClass,
  themeTabFluentInactiveClass,
  themeTabInactiveClass,
  themeTabIosActiveClass,
  themeTabIosInactiveClass,
  themeTabIosListClass,
  themeTabListBorderClass,
  themeTabMaterialActiveClass,
  themeTabMaterialInactiveClass,
  themeTabMinimalActiveClass,
  themeTabMinimalInactiveClass,
  themeTabModuleActiveClass,
  themeTabModuleInactiveClass,
  themeTabModuleListClass,
  themeTabPillActiveClass,
  themeTabPillInactiveClass,
  themeTabSegmentedActiveClass,
  themeTabSegmentedInactiveClass,
  themeTabSegmentedListClass,
  themeTabVerticalActiveClass,
  themeTabVerticalInactiveClass,
  themeTabVerticalListClass,
} from "@designSystem/theme/styles/componentStyle";

/**
 * Tab visual variants — patterns from common design systems:
 * - line / underline — enterprise section tabs
 * - material — Google Material 3 primary tabs
 * - fluent — Microsoft Fluent 2
 * - chrome — browser-style connected tabs
 * - ios / segmented — Apple segmented control
 * - module — premium dashboard module switcher (slate track + navy active)
 * - pills, boxed, enclosed, minimal, vertical
 */
export type TabVariant =
  | "line"
  | "default"
  | "underline"
  | "material"
  | "fluent"
  | "chrome"
  | "ios"
  | "segmented"
  | "module"
  | "pills"
  | "boxed"
  | "enclosed"
  | "minimal"
  | "vertical";

export type TabSize = "sm" | "md";

export function normalizeTabVariant(
  variant: TabVariant = "line",
): Exclude<TabVariant, "default"> {
  return variant === "default" ? "line" : variant;
}

const triggerSizeClass: Record<TabSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const triggerSizeChrome: Record<TabSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const triggerSizeMaterial: Record<TabSize, string> = {
  sm: "px-3 py-2 text-xs tracking-wide",
  md: "px-4 py-2.5 text-sm tracking-wide",
};

const triggerSizeModule: Record<TabSize, string> = {
  sm: "px-3.5 py-2 text-xs font-semibold sm:px-4 sm:text-[13px]",
  md: "px-4 py-2.5 text-sm font-semibold",
};

/** Variant-specific list chrome (layout handled in TabsList) */
export function tabListVariantClass(
  variant: TabVariant,
  orientation: "horizontal" | "vertical",
) {
  const v = normalizeTabVariant(variant);
  if (orientation === "vertical" || v === "vertical") {
    return themeTabVerticalListClass;
  }
  switch (v) {
    case "pills":
      return "border-none";
    case "segmented":
      return themeTabSegmentedListClass;
    case "module":
      return themeTabModuleListClass;
    case "ios":
      return themeTabIosListClass;
    case "enclosed":
      return themeTabEnclosedListClass;
    case "chrome":
      return themeTabChromeListClass;
    case "boxed":
      return "border-none";
    case "minimal":
      return "border-none gap-4 sm:gap-6";
    case "underline":
      return cn(themeTabListBorderClass, "gap-4 sm:gap-6");
    case "material":
    case "fluent":
      return themeTabListBorderClass;
    case "line":
    default:
      return themeTabListBorderClass;
  }
}

export function tabTriggerClass(
  variant: TabVariant,
  isActive: boolean,
  size: TabSize = "md",
  orientation: "horizontal" | "vertical" = "horizontal",
) {
  const v = normalizeTabVariant(variant);
  const sizeClass =
    v === "chrome"
      ? triggerSizeChrome[size]
      : v === "material"
        ? triggerSizeMaterial[size]
        : v === "module"
          ? triggerSizeModule[size]
          : triggerSizeClass[size];

  const base = cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors duration-150",
    themeTabFocusClass,
    sizeClass,
  );

  if (orientation === "vertical" || v === "vertical") {
    return cn(
      base,
      "w-full justify-start rounded-md py-2",
      isActive ? themeTabVerticalActiveClass : themeTabVerticalInactiveClass,
    );
  }

  const lineLike =
    v === "line" || v === "underline" || v === "material" || v === "fluent";
  const rounded = lineLike ? "-mb-px rounded-t-md" : "rounded-md";

  switch (v) {
    case "material":
      return cn(
        base,
        rounded,
        isActive ? themeTabMaterialActiveClass : themeTabMaterialInactiveClass,
      );
    case "fluent":
      return cn(
        base,
        rounded,
        isActive ? themeTabFluentActiveClass : themeTabFluentInactiveClass,
      );
    case "chrome":
      return cn(
        base,
        isActive ? themeTabChromeActiveClass : themeTabChromeInactiveClass,
      );
    case "ios":
      return cn(
        base,
        isActive ? themeTabIosActiveClass : themeTabIosInactiveClass,
      );
    case "minimal":
      return cn(
        base,
        "rounded-md",
        isActive ? themeTabMinimalActiveClass : themeTabMinimalInactiveClass,
      );
    case "enclosed":
      return cn(
        base,
        isActive ? themeTabEnclosedActiveClass : themeTabEnclosedInactiveClass,
      );
    case "pills":
      return cn(
        base,
        isActive ? themeTabPillActiveClass : themeTabPillInactiveClass,
      );
    case "segmented":
      return cn(
        base,
        isActive
          ? themeTabSegmentedActiveClass
          : themeTabSegmentedInactiveClass,
      );
    case "module":
      return cn(
        base,
        isActive ? themeTabModuleActiveClass : themeTabModuleInactiveClass,
      );
    case "boxed":
      return cn(
        base,
        isActive ? themeTabBoxedActiveClass : themeTabBoxedInactiveClass,
      );
    case "underline":
      return cn(
        base,
        "-mb-px rounded-t-md border-b-2 border-transparent pb-2.5",
        isActive
          ? "border-[var(--secondary)] text-[var(--primary)]"
          : themeTabInactiveClass,
      );
    case "line":
    default:
      return cn(
        base,
        rounded,
        isActive ? themeTabActiveClass : themeTabInactiveClass,
      );
  }
}

export function tabsRootClass(
  variant: TabVariant,
  orientation: "horizontal" | "vertical",
) {
  const v = normalizeTabVariant(variant);
  if (orientation === "vertical" || v === "vertical") {
    return "flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:gap-6";
  }
  return "flex w-full min-w-0 max-w-full flex-col";
}

export function tabsContentClass(variant: TabVariant) {
  const v = normalizeTabVariant(variant);
  if (v === "vertical") {return "min-w-0 flex-1 pt-0";}
  if (v === "chrome")
    {return "mt-0 min-w-0 rounded-b-lg border border-t-0 border-border bg-card p-4";}
  return "mt-4 min-w-0";
}
