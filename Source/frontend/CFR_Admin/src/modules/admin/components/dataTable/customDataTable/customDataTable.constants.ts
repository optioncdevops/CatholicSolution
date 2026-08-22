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

/** Body cell borders — tuned for white / striped row backgrounds. */
export const DATA_TABLE_BODY_CELL_BORDER_CLASS =
  "border border-slate-200/90 dark:border-slate-700/80";

/**
 * Header cell borders — darker than body so lines stay visible on the
 * primary-tinted header background.
 */
export const DATA_TABLE_HEADER_CELL_BORDER_CLASS =
  "border border-slate-400/85 dark:border-slate-500/80";

export const EXPORT_BTN_CLASS =
  "cursor-pointer p-1.5 rounded transition-colors disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/45";

/** Shared toolbar shell — client and server-side tables. */
export const DATA_TABLE_TOOLBAR_SHELL_CLASS =
  "flex flex-col gap-1.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between";

const DATA_TABLE_TOOLBAR_BTN_BASE =
  "inline-flex cursor-pointer items-center justify-center rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-50";

export const DATA_TABLE_HEADER_MENU_ITEM_CLASS =
  "flex w-full cursor-pointer items-center px-2 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800";

export const DATA_TABLE_HEADER_MENU_BTN_CLASS =
  "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800";

/** Fullscreen toggle — readable hover/focus in dark mode. */
export const DATA_TABLE_FULLSCREEN_BTN_CLASS = `${DATA_TABLE_TOOLBAR_BTN_BASE} h-7 w-7 shrink-0 border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100`;

/** Export toolbar icon buttons — light accent on hover, navy surface in dark mode. */
export const DATA_TABLE_EXPORT_BTN_EXCEL_CLASS = `${EXPORT_BTN_CLASS} text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300`;
export const DATA_TABLE_EXPORT_BTN_PRINT_CLASS = `${EXPORT_BTN_CLASS} text-slate-500 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-300`;
export const DATA_TABLE_EXPORT_BTN_CSV_CLASS = `${EXPORT_BTN_CLASS} text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300`;

const DATA_TABLE_COLUMNS_BTN_BASE = `${DATA_TABLE_TOOLBAR_BTN_BASE} gap-1 px-2 py-1.5 text-[11px]`;

/** Column visibility trigger — default, hover, open/active, focus, disabled. */
export function getDataTableColumnsButtonClass(options: {
  isOpen?: boolean;
  hasHiddenColumns?: boolean;
}): string {
  const { isOpen = false, hasHiddenColumns = false } = options;
  const isActive = isOpen || hasHiddenColumns;

  if (isActive) {
    return `${DATA_TABLE_COLUMNS_BTN_BASE} border-primary-400/70 bg-primary-50 text-primary-700 hover:border-primary-500 hover:bg-primary-100 dark:border-primary-500/55 dark:bg-primary-950/35 dark:text-primary-200 dark:hover:border-primary-400/70 dark:hover:bg-primary-900/45 dark:hover:text-primary-100`;
  }

  return `${DATA_TABLE_COLUMNS_BTN_BASE} border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100`;
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
