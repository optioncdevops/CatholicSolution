import type { ColumnDef, SortState, ClientPageSizeOption } from "../partials/useDataTable";
import type { DataTableColumnVisibilityMap } from "../partials/columnVisibilitySettings";
import type { ReactNode } from "react";

export type { DataTableColumnVisibilityMap } from "../partials/columnVisibilitySettings";

/** A single cell in an optional grouped header row above column headers. */
export interface DataTableGroupHeaderCell {
  key: string;
  content: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  align?: "left" | "center" | "right";
  className?: string;
};

/** Optional multi-row grouped header rendered above the main column header row. */
export interface DataTableGroupHeaderRow {
  cells: DataTableGroupHeaderCell[];
};

export interface CustomDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  /** Optional table or page title to show in the toolbar */
  title?: string;
  /** Initial sorting state */
  initialSortBy?: SortState;
  /**
   * Starting page size (`number` or `"all"`). Default `25` when omitted (ensure the chosen value is listed if you pass custom options).
   */
  initialPageSize?: ClientPageSizeOption;
  /**
   * When **set** with at least one entry → dropdown shows **only** these values (sanitized), plus `initialPageSize` if missing.
   * When **omitted** or **empty array** → default **25 / 50 / 75 / 100 / All**.
   */
  pageSizeOptions?: readonly ClientPageSizeOption[];
  /**
   * When `false`, hides the pagination footer and renders all filtered/sorted rows at once.
   * Sorting, filtering, search, export, and selection still work. Default `true`.
   */
  enablePagination?: boolean;
  /** Enable simple single-column grouping by this column id */
  enableGroupingBy?: string | null;
  /** Enable top-right global search box */
  enableGlobalSearch?: boolean;
  /** Enable export actions (PDF, Excel, Print, CSV) */
  enableExport?: boolean;
  /**
   * Base filename for CSV / Excel (`.xlsx`) downloads — no extension. Sanitized for safe downloads.
   * Print / PDF flows use a humanized title derived from this value. Falls back to `table_export` when empty.
   */
  exportFileName?: string;
  /** Alias of {@link exportFileName} for call sites that prefer “page” wording. */
  pageName?: string;
  /** Enable column visibility manager (Columns button) */
  enableColumnManager?: boolean;
  /**
   * When `true`, the Columns popover uses draft toggles with Update / Cancel and optional
   * page-owned persistence via {@link columnVisibility} / save callbacks.
   * When `false` (default), columns hide/show immediately as before.
   */
  enableColumnSettings?: boolean;
  /**
   * Optional table id (e.g. `sample-list`) for advanced column settings; not required for
   * default tables. Persistence is handled by the page, not inside the table.
   */
  tableKey?: string;
  /**
   * Applied column visibility (`true` = visible). Only used when {@link enableColumnSettings}
   * is `true`. With {@link onColumnVisibilityChange}, the parent controls visibility state.
   */
  columnVisibility?: DataTableColumnVisibilityMap;
  /** Applies visibility from the column settings popover (Update). Advanced mode only. */
  onColumnVisibilityChange?: (visibility: DataTableColumnVisibilityMap) => void;
  /** Optional persist hook on Update (and header hide when provided). Advanced mode only. */
  onColumnVisibilitySave?: (visibility: DataTableColumnVisibilityMap) => void;
  /** Enable per-column header actions menu (three dots) */
  enableColumnActions?: boolean;
  /** Enable per-column filters row and filter option in header menu */
  enableColumnFilters?: boolean;
  /** Enable zebra striping for rows */
  enableRowStriping?: boolean;
  /** Enable fullscreen toggle button */
  enableFullscreenToggle?: boolean;
  expandControls?: {
    visible?: boolean;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    isExpandAllDisabled?: boolean;
    isCollapseAllDisabled?: boolean;
  };
  /** External loading flag to control loader display */
  loading?: boolean;
  /** Loading mode: centered spinner, skeleton rows, or progressive border loaders */
  loadingMode?: "spinner" | "skeleton" | "progress";
  /** Number of skeleton rows to show when loadingMode is 'skeleton' */
  skeletonRowCount?: number;
  /** Enable inner vertical scrolling for table body (header & footer stay fixed inside card) */
  innerScroll?: boolean;
  /** Max height for inner scroll area when innerScroll is enabled (any valid CSS height, e.g. '480px', '60vh') */
  innerScrollMaxHeight?: string;
  /**
   * When `true` with {@link innerScroll}, the table sizes to its rows and caps at the
   * parent height. Pagination stays under the data; a scrollbar appears only when
   * rows overflow the available space (no forced empty body gap).
   */
  fillContainer?: boolean;
  /** Enable row selection via a leading checkbox column */
  enableRowSelection?: boolean;
  /** Disable row selection (makes checkboxes visible but disabled) */
  disableRowSelection?: boolean;
  /** Controlled selection row keys/ids */
  selectedRowIds?: Set<string | number> | string[] | number[];
  /** Predicate determining whether a specific row's selection checkbox is selectable/enabled */
  isRowSelectable?: (row: T) => boolean;
  /**
   * When set, the selection column header shows this label instead of a “select all on page” checkbox.
   * Row-level checkboxes are unchanged.
   */
  selectionColumnHeaderLabel?: string;
  /** Called whenever the set of selected rows changes */
  onSelectionChange?: (rows: T[]) => void;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Called when a row is double-clicked */
  onRowDoubleClick?: (row: T) => void;
  /** Allow columns to be reordered from the column manager (using up/down controls) */
  enableColumnReorder?: boolean;
  /**
   * Row density — controls vertical padding of data cells.
   * - `"compact"` (default): tight rows (`py-0.5`)
   * - `"comfortable"`: spacious rows (`py-2`)
   */
  density?: "compact" | "comfortable";
  /**
   * Column ids whose body cells shrink nested icon buttons (e.g. `CommonIconButton` in an actions column).
   * Ignored when a column sets {@link ColumnDef.compactIcons} to `false`. Pass `[]` to disable the default.
   * @default ["actions"]
   */
  compactActionColumnIds?: readonly string[];
  /** Custom title shown when the table has no rows to display */
  emptyMessage?: string;
  /**
   * Optional description below {@link emptyMessage}. Pass an empty string to hide the default hint.
   */
  emptyDescription?: string;
  /**
   * Optional grouped header rows rendered above the main column header row.
   * Useful for matrix-style reports and multi-tier column groups.
   */
  groupHeaderRows?: DataTableGroupHeaderRow[];
  /**
   * When `true`, renders visible borders on header and body cells for complex report layouts.
   */
  showCellBorders?: boolean;
}
