/** Shared Columns popover layout — width follows labels; height follows rows.
 * Positioning (`absolute` / `fixed`) is applied by the host or portal wrapper.
 */
export const COLUMN_VISIBILITY_POPOVER_SHELL_CLASS =
  "z-35 mt-0 flex w-max min-w-[11rem] max-w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface)] py-2 text-xs shadow-lg";

export const COLUMN_VISIBILITY_POPOVER_LIST_CLASS =
  "min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2";

export const COLUMN_VISIBILITY_LABEL_CLASS =
  "whitespace-nowrap text-[var(--text-secondary)]";

/**
 * Viewport-safe max height for in-flow / absolute hosts.
 * Prefer {@link DataTableColumnsMenuPortal} + fixed placement in clipped shells.
 */
export function resolveColumnVisibilityPopoverMaxHeight(): string {
  // Never tie max-height to a short table body — that clips the menu when few
  // rows are visible. Viewport caps keep the panel usable in modals and pages.
  return "min(70vh, 32rem)";
}
