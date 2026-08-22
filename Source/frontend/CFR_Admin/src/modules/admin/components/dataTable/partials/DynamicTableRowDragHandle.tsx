import React from "react";
import { cn } from "@app/utilities/cn";
import { AppIcon } from "@app/components/icons";

export interface DynamicTableRowDragHandleProps {
  disabled?: boolean;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: (event: React.DragEvent<HTMLButtonElement>) => void;
}

/**
 * Accessible drag handle for dynamic table row reordering.
 * Attach row-level drop targets on the parent `<tr>`.
 */
export function DynamicTableRowDragHandle({
  disabled = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: DynamicTableRowDragHandleProps) {
  return (
    <button
      type="button"
      data-row-drag-handle
      draggable={!disabled}
      disabled={disabled}
      aria-label="Drag to reorder row"
      title={disabled ? "Row reorder unavailable" : "Drag to reorder row"}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        !disabled &&
          "cursor-grab hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-800 dark:hover:text-slate-300",
        disabled && "cursor-not-allowed opacity-40",
        isDragging && "cursor-grabbing text-primary-600 dark:text-primary-400",
      )}
      onDragStart={(event) => {
        event.stopPropagation();
        onDragStart(event);
      }}
      onDragEnd={(event) => {
        event.stopPropagation();
        onDragEnd(event);
      }}
    >
      <AppIcon name="rowDragHandle" size={14} decorative />
    </button>
  );
}
