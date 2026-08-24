import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";

interface DataTableRowExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function DataTableRowExpandToggle({
  expanded,
  onToggle,
  label,
  disabled = false,
  className,
}: DataTableRowExpandToggleProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) {
          onToggle();
        }
      }}
      disabled={disabled}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md",
        "text-foreground-muted transition-colors duration-150",
        "hover:bg-primary-50 hover:text-primary-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        "disabled:cursor-default disabled:opacity-45",
        "dark:hover:bg-primary-950/50 dark:hover:text-primary-300",
        className,
      )}
      aria-expanded={expanded}
      aria-label={label ?? (expanded ? "Collapse row" : "Expand row")}
      title={label ?? (expanded ? "Collapse row" : "Expand row")}
    >
      <AppIcon
        name="chevronRight"
        size={12}
        decorative
        className={cn(
          "transition-transform duration-200 ease-out",
          expanded && "rotate-90",
        )}
      />
    </button>
  );
}

interface DataTableExpandAllControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isExpandAllDisabled?: boolean;
  isCollapseAllDisabled?: boolean;
  className?: string;
}

export function DataTableExpandAllControls({
  onExpandAll,
  onCollapseAll,
  isExpandAllDisabled = false,
  isCollapseAllDisabled = false,
  className,
}: DataTableExpandAllControlsProps) {
  const actionClass = cn(
    "inline-flex h-7 items-center gap-1.5 px-2.5",
    "text-[11px] font-medium text-foreground-muted",
    "transition-colors duration-150 hover:bg-primary-50 hover:text-primary-700",
    "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "dark:hover:bg-primary-950/50 dark:hover:text-primary-300",
  );

  return (
    <div
      className={cn(
        "inline-flex shrink-0 divide-x divide-border overflow-hidden rounded-md border border-border bg-card shadow-sm",
        className,
      )}
      role="group"
      aria-label="Expand and collapse rows"
    >
      <button
        type="button"
        onClick={onExpandAll}
        disabled={isExpandAllDisabled}
        className={actionClass}
        title="Expand all rows"
      >
        <AppIcon name="chevronsDown" size={12} decorative />
        <span>Expand All</span>
      </button>
      <button
        type="button"
        onClick={onCollapseAll}
        disabled={isCollapseAllDisabled}
        className={actionClass}
        title="Collapse all rows"
      >
        <AppIcon name="chevronsUp" size={12} decorative />
        <span>Collapse All</span>
      </button>
    </div>
  );
}
