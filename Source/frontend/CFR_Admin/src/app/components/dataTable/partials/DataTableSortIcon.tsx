import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";

export type DataTableSortDirection = "asc" | "desc" | null;

interface DataTableSortIconProps {
  direction: DataTableSortDirection;
  className?: string;
}

const SORT_ICON_SIZE_CLASS = "text-[11px] leading-none";

/** Font Awesome sort indicator for shared data table headers. */
export function DataTableSortIcon({ direction, className }: DataTableSortIconProps) {
  if (direction === "asc") {
    return (
      <AppIcon
        name="sortAsc"
        className={cn(SORT_ICON_SIZE_CLASS, "text-white", className)}
        decorative
      />
    );
  }

  if (direction === "desc") {
    return (
      <AppIcon
        name="sortDesc"
        className={cn(SORT_ICON_SIZE_CLASS, "text-white", className)}
        decorative
      />
    );
  }

  return (
    <AppIcon
      name="sort"
      className={cn(SORT_ICON_SIZE_CLASS, "text-white/50", className)}
      decorative
    />
  );
}
