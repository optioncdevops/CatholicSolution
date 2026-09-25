import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";

export interface DataTableGlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Wrapper width classes (e.g. `sm:w-56`). */
  className?: string;
}

/** Toolbar search with clear (×) when the field has a value. */
export function DataTableGlobalSearch({
  value,
  onChange,
  placeholder = "Search",
  disabled = false,
  className,
}: DataTableGlobalSearchProps) {
  const hasValue = value.length > 0;

  return (
    <div
      className={cn(
        "relative w-full min-w-[10rem] max-w-sm sm:max-w-none sm:shrink-0",
        className,
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        maxLength={100}
        disabled={disabled}
        className={cn(
          "w-full rounded border border-[var(--line)] bg-[var(--surface)] py-1.5 text-xs text-[var(--text-secondary)] placeholder:text-[var(--text-faint)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60",
          hasValue ? "pl-3 pr-8" : "px-3",
        )}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
      />
      {hasValue && !disabled && (
        <button
          type="button"
          className="absolute right-1 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-secondary)]"
          title="Clear search"
          aria-label="Clear search"
          onClick={() => { onChange(""); }}
        >
          <AppIcon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
