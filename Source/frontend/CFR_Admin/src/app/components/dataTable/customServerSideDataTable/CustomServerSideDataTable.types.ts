import type { ColumnDef, PageSizeValue } from "../partials/useDataTable";
import type {
  ServerSideFetchParams,
  ServerSideFetchResult,
  SortModel,
} from "../partials/useServerSideDataTable";

export type { ServerSideFetchParams, ServerSideFetchResult, SortModel };

export type ServerSideColumnMeta<T> = ColumnDef<T> & {
  filterType?: "text" | "number" | "date";
  resizable?: boolean;
  aggregate?: "sum";
};

export interface CustomServerSideDataTableProps<T> {
  columns: ColumnDef<T>[];
  fetchData: (
    params: ServerSideFetchParams,
  ) => Promise<ServerSideFetchResult<T>>;
  rowKey: (row: T) => string | number;
  title?: string;
  initialSortBy?: SortModel;
  initialPageSize?: number;
  /**
   * Same convention as {@link PageSizeValue} on `CustomDataTable`: numeric sizes or `"all"`.
   * `"all"` is ignored for server paging; only positive integers appear in the dropdown.
   * When **set** with entries → dropdown shows **only** those sizes (+ `initialPageSize` if missing).
   * When **omitted** or **empty** → **25 / 50 / 75 / 100** (+ `initialPageSize`).
   */
  pageSizeOptions?: readonly PageSizeValue[];
  initialFilters?: Record<string, string>;
  initialSearch?: string;
  debounceMs?: number;
  enableGlobalSearch?: boolean;
  enableExport?: boolean;
  /**
   * Base filename for CSV / Excel (`.xlsx`) — no extension. Sanitized; falls back to legacy
   * `table_export` / `table_export_current_page` when empty.
   */
  exportFileName?: string;
  /** Alias of {@link exportFileName}. */
  pageName?: string;
  enableColumnManager?: boolean;
  enableColumnActions?: boolean;
  enableColumnFilters?: boolean;
  enableRowStriping?: boolean;
  enableFullscreenToggle?: boolean;
  loadingOverride?: boolean;
  loadingMode?: "spinner" | "skeleton" | "progress";
  skeletonRowCount?: number;
  enableMultiSort?: boolean;
  storageKey?: string | null;
  enableGrouping?: boolean;
  groupingField?: string | null;
  enableVirtualization?: boolean;
  rowHeight?: number;
  overscanCount?: number;
  enableStatusBar?: boolean;
  aggregateColumns?: string[];
  innerScroll?: boolean;
  innerScrollMaxHeight?: string;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  enableColumnReorder?: boolean;
  emptyMessage?: string;
  /** Column ids that render action cells with compact icon buttons. */
  compactActionColumnIds?: readonly string[];
}
