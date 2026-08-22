import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@app/utilities/cn";
import {
  getTabListLayout,
  tabListInnerLayoutClass,
  tabListShellClass,
  tabTriggerGridClass,
} from "./tabLayout";
import {
  normalizeTabVariant,
  tabListVariantClass,
  tabTriggerClass,
  tabsContentClass,
  tabsRootClass,
  type TabSize,
  type TabVariant,
} from "./tabVariants";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabVariant;
  size: TabSize;
  orientation: "horizontal" | "vertical";
  layout: ReturnType<typeof getTabListLayout>;
  keepMounted: boolean;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {throw new Error("Tabs compound components must be used within <Tabs>");}
  return ctx;
}

export interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabVariant;
  size?: TabSize;
  orientation?: "horizontal" | "vertical";
  keepMounted?: boolean;
  className?: string;
}

export function Tabs({
  children,
  defaultValue,
  value: valueProp,
  onValueChange,
  variant = "line",
  size = "md",
  orientation: orientationProp,
  keepMounted = false,
  className,
}: TabsProps) {
  const baseId = useId();
  const normalized = normalizeTabVariant(variant);
  const orientation =
    orientationProp ?? (normalized === "vertical" ? "vertical" : "horizontal");
  const layout = getTabListLayout(variant, orientation);

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const handleChange = useCallback(
    (next: string) => {
      if (!isControlled) {setInternalValue(next);}
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctx = useMemo(
    () => ({
      value,
      onValueChange: handleChange,
      variant,
      size,
      orientation,
      layout,
      keepMounted,
      baseId,
    }),
    [value, handleChange, variant, size, orientation, layout, keepMounted, baseId],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn(tabsRootClass(variant, orientation), className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function TabsList({ children, className, "aria-label": ariaLabel }: TabsListProps) {
  const { variant, orientation, layout } = useTabsContext();
  const v = normalizeTabVariant(variant);
  const isVertical = orientation === "vertical" || v === "vertical";

  const listClasses = cn(
    tabListVariantClass(variant, orientation),
    !isVertical && tabListInnerLayoutClass(layout),
    isVertical && "flex w-full flex-col gap-0.5",
    className,
  );

  if (isVertical) {
    return (
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={ariaLabel ?? "Sections"}
        className={cn(tabListShellClass(layout), "shrink-0")}
      >
        <div className={listClasses}>{children}</div>
      </div>
    );
  }

  if (layout === "scroll") {
    return (
      <div className={tabListShellClass(layout)}>
        <div
          role="tablist"
          aria-orientation="horizontal"
          aria-label={ariaLabel ?? "Sections"}
          className={cn("tab-list-scroll", listClasses)}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={tabListShellClass(layout)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label={ariaLabel ?? "Sections"}
        className={listClasses}
      >
        {children}
      </div>
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function TabsTrigger({
  value,
  children,
  disabled,
  icon,
  badge,
  className,
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange, variant, size, orientation, layout, baseId } =
    useTabsContext();
  const isActive = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        tabTriggerClass(variant, isActive, size, orientation),
        tabTriggerGridClass(layout),
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      {icon && <span className="inline-flex shrink-0 [&>svg]:size-4">{icon}</span>}
      <span className="truncate">{children}</span>
      {badge != null && (
        <span className="ml-0.5 inline-flex min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-[var(--secondary)]/15 px-1.5 py-px text-[10px] font-semibold text-[var(--secondary-hover)]">
          {badge}
        </span>
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: activeValue, keepMounted, variant, baseId } = useTabsContext();
  const isActive = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!keepMounted && !isActive) {return null;}

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={cn(tabsContentClass(variant), !isActive && "hidden", className)}
    >
      {children}
    </div>
  );
}
