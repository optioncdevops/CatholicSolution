import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";

export interface DataTableColumnFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
};

/** Compact per-column filter control for table header rows. */
export function DataTableColumnFilterInput({
  value,
  onChange,
  placeholder = "Filter…",
  className,
  autoFocus,
  "aria-label": ariaLabel,
}: DataTableColumnFilterInputProps) {
  return (
    <div className={cn("relative flex min-w-0 items-center", className)}>
      <span
        className="pointer-events-none absolute left-1.5 inline-flex text-foreground-muted"
        aria-hidden
      >
        <AppIcon name="filter" size={12} decorative />
      </span>
      <input
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => { onChange(event.target.value); }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full rounded-md border border-slate-300 bg-white py-0.5 pr-2 pl-6 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}
