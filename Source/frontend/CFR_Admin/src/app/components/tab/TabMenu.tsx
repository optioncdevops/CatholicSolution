import type { ReactNode } from "react";
import type { TabVariant } from "./tabVariants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

export interface Tab {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TabMenuProps {
  tabs: Tab[];
  /**
   * Visual style (tech-standard patterns):
   * - `line` / `default`, `underline` — section tabs
   * - `material` — Google Material 3
   * - `fluent` — Microsoft Fluent 2
   * - `chrome` — browser connected tabs
   * - `ios` / `segmented` — Apple segmented (wraps on mobile, no scrollbar)
   * - `pills`, `boxed`, `enclosed`, `minimal`, `vertical`
   */
  variant?: TabVariant;
  size?: "sm" | "md";
  keepMounted?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (tabId: string) => void;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

export const TabMenu = ({
  tabs,
  variant = "line",
  size = "md",
  keepMounted = false,
  value,
  defaultValue,
  onValueChange,
  className,
  listClassName,
  contentClassName,
}: TabMenuProps) => {
  const initial = defaultValue ?? tabs[0]?.id ?? "";

  if (tabs.length === 0) {return null;}

  return (
    <Tabs
      className={className}
      variant={variant}
      size={size}
      keepMounted={keepMounted}
      value={value}
      defaultValue={value === undefined ? initial : undefined}
      onValueChange={onValueChange}
    >
      <TabsList className={listClassName}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            icon={tab.icon}
            badge={tab.badge}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className={contentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
