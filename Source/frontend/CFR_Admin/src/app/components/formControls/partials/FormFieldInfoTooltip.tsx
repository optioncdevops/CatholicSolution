import type { ReactNode } from "react";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import { cn } from "@app/utilities/cn";

function FilledInfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

export interface FormFieldInfoTooltipProps {
  content: ReactNode;
  /** Accessible name source — usually the field label text. */
  label: string;
  className?: string;
}

/** Info icon beside a form label; shows {@link content} on hover and keyboard focus. */
export function FormFieldInfoTooltip({
  content,
  label,
  className,
}: FormFieldInfoTooltipProps) {
  const ariaLabel = `More information about ${label}`;

  return (
    <Tooltip
      content={content}
      side="top"
      className="max-w-[16rem] whitespace-normal font-normal"
    >
      <button
        type="button"
        tabIndex={0}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          "text-slate-400 transition-colors",
          "hover:text-primary-600 dark:hover:text-primary-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1",
          className,
        )}
        onClick={(e) => { e.preventDefault(); }}
      >
        <FilledInfoIcon className="h-[13px] w-[13px]" />
      </button>
    </Tooltip>
  );
}
