import { cn } from "@app/utilities/cn";
import {
  resolveDataTableBadgeVariant,
  type DataTableBadgeVariant,
} from "./dataTableBadgeVariants";

export type { DataTableBadgeVariant } from "./dataTableBadgeVariants";

export interface DataTableBadgeProps {
  label: string;
  variant?: DataTableBadgeVariant;
  className?: string;
}

export function DataTableBadge({
  label,
  variant = "blue",
  className,
}: DataTableBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-xs font-medium leading-tight",
        resolveDataTableBadgeVariant(variant),
        className,
      )}
    >
      {label}
    </span>
  );
}
