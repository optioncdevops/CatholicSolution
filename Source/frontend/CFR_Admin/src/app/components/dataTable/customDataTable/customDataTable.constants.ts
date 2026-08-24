import type { ColumnDef } from "../partials/useDataTable";

/** Descendant selectors — overrides default `sm` icon buttons inside matching cells. */
export const COMPACT_ACTION_ICON_TD =
  "[&_button]:!h-6 [&_button]:!w-6 [&_button]:!min-h-0 [&_button]:!min-w-0 [&_button_svg]:!h-3 [&_button_svg]:!w-3 [&_button_svg]:!shrink-0";

export const DEFAULT_COMPACT_ACTION_COLUMN_IDS = ["actions"] as const;

/** Table scroll wrapper — horizontal scroll stays inside the card; vertical scroll when enabled. */
export const DATA_TABLE_SCROLL_CONTAINER_CLASS =
  "relative w-full min-w-0 max-w-full overflow-x-auto";

/** Vertical scroll modifier for innerScroll / fullscreen table bodies. */
export const DATA_TABLE_SCROLL_BODY_Y_CLASS = "overflow-y-auto";

/** Responsive table: full width within container; grows horizontally inside scroll area when needed. */
export const DATA_TABLE_LAYOUT_CLASS = "min-w-full w-max table-auto text-sm";

/** Collapse cell borders for matrix / report tables (`showCellBorders`). */
export const DATA_TABLE_BORDERED_LAYOUT_CLASS = "border-collapse";

/** Body cell borders — tuned for the app's own surface/stripe tokens, not a raw Tailwind scale. */
export const DATA_TABLE_BODY_CELL_BORDER_CLASS = "border border-[var(--line-soft)]";

/**
 * Header cell borders — darker than body so lines stay visible on the
 * primary-tinted header background.
 */
export const DATA_TABLE_HEADER_CELL_BORDER_CLASS = "border border-[var(--line-strong)]";

export const EXPORT_BTN_CLASS =
  "cursor-pointer p-1.5 rounded transition-colors disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]";

/** Shared toolbar shell — client and server-side tables. This app has no dark theme, so every
 * color here is a CSS-custom-property token from theme.css, not a raw Tailwind color scale
 * (which would otherwise flip dark under the *system's* light/dark preference via `dark:`). */
export const DATA_TABLE_TOOLBAR_SHELL_CLASS =
  "flex flex-col gap-1.5 border-b border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1.5 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between";

const DATA_TABLE_TOOLBAR_BTN_BASE =
  "inline-flex cursor-pointer items-center justify-center rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50";

export const DATA_TABLE_HEADER_MENU_ITEM_CLASS =
  "flex w-full cursor-pointer items-center px-2 py-1.5 text-left text-[var(--text-secondary)] hover:bg-[var(--hover)]";

export const DATA_TABLE_HEADER_MENU_BTN_CLASS =
  "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--hover)]";

export const DATA_TABLE_FULLSCREEN_BTN_CLASS = `${DATA_TABLE_TOOLBAR_BTN_BASE} h-7 w-7 shrink-0 border-[var(--line)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)]`;

/** Export toolbar icon buttons — subtle accent on hover, matching this app's tone tokens. */
export const DATA_TABLE_EXPORT_BTN_EXCEL_CLASS = `${EXPORT_BTN_CLASS} text-[var(--text-muted)] hover:bg-[var(--success-bg)] hover:text-[var(--success)]`;
export const DATA_TABLE_EXPORT_BTN_PRINT_CLASS = `${EXPORT_BTN_CLASS} text-[var(--text-muted)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]`;
export const DATA_TABLE_EXPORT_BTN_CSV_CLASS = `${EXPORT_BTN_CLASS} text-[var(--text-muted)] hover:bg-[var(--info-bg)] hover:text-[var(--info)]`;

const DATA_TABLE_COLUMNS_BTN_BASE = `${DATA_TABLE_TOOLBAR_BTN_BASE} gap-1 px-2 py-1.5 text-[11px]`;

/** Column visibility trigger — default, hover, open/active, focus, disabled. */
export function getDataTableColumnsButtonClass(options: {
  isOpen?: boolean;
  hasHiddenColumns?: boolean;
}): string {
  const { isOpen = false, hasHiddenColumns = false } = options;
  const isActive = isOpen || hasHiddenColumns;

  if (isActive) {
    return `${DATA_TABLE_COLUMNS_BTN_BASE} border-[var(--primary)]/70 bg-[var(--primary-muted)] text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]`;
  }

  return `${DATA_TABLE_COLUMNS_BTN_BASE} border-[var(--line)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--line-strong)] hover:bg-[var(--hover)]`;
}

/** Whether a column should skip text truncation (action/icon columns). */
export function isDataTableActionColumn<T>(
  col: ColumnDef<T>,
  compactActionColumnIds: readonly string[] = DEFAULT_COMPACT_ACTION_COLUMN_IDS,
): boolean {
  if (col.compactIcons === true) {
    return true;
  }
  if (col.compactIcons === false) {
    return false;
  }
  const id = col.id?.trim().toLowerCase() ?? "";
  return (
    compactActionColumnIds.includes(col.id) || /^(actions?|action)$/.test(id)
  );
}
