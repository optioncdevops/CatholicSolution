import type { ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import { themeFieldDisabledActionButtonClass } from "@designSystem/theme/styles/componentStyle";

export interface RichTextToolbarButtonProps {
  label: string;
  icon: ReactNode;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function RichTextToolbarButton({
  label,
  icon,
  pressed = false,
  disabled = false,
  onClick,
}: RichTextToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => { event.preventDefault(); }}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-muted transition-colors",
        "hover:bg-background hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/35",
        "disabled:cursor-not-allowed",
        disabled && themeFieldDisabledActionButtonClass,
        pressed &&
          "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-100",
      )}
    >
      {icon}
    </button>
  );
}
