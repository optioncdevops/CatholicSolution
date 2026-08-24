import type { ReactNode } from "react";
import type { ColumnDef, PageSizeValue } from "../partials/useDataTable";
import type {
  ServerSideFetchParams,
  ServerSideFetchResult,
  SortModel,
} from "../partials/useServerSideDataTable";

export type { ServerSideFetchParams, ServerSideFetchResult, SortModel };

export interface ServerSideExpandableRowDetailsMeta {
  /** True while `loadRowDetails` is in flight for this row. */
  isLoadingDetails: boolean;
}

export interface ServerSideExpandableDataTableProps<T> {
  columns: ColumnDef<T>[];
  fetchData: (
    params: ServerSideFetchParams,
  ) => Promise<ServerSideFetchResult<T>>;
  rowKey: (row: T) => string | number;

  title?: string;
  initialSortBy?: SortModel;
  initialPageSize?: number;
  pageSizeOptions?: readonly PageSizeValue[];
  initialSearch?: string;
  debounceMs?: number;

  enableGlobalSearch?: boolean;
  enableExport?: boolean;
  exportFileName?: string;
  exportTitle?: string;
  pageName?: string;
  enableColumnManager?: boolean;
  enableFullscreenToggle?: boolean;
  enableRowStriping?: boolean;
  enableMultiSort?: boolean;
  /** Show Expand All / Collapse All in the toolbar. Default true when details are enabled. */
  enableExpandControls?: boolean;

  loadingOverride?: boolean;
  emptyMessage?: string;
  /**
   * When this value changes, the table re-fetches the current page
   * (same role as calling refresh on CustomServerSideDataTable).
   */
  refreshToken?: number | string;

  /** Nested panel under an expanded row. */
  renderRowDetails?: (
    row: T,
    meta: ServerSideExpandableRowDetailsMeta,
  ) => ReactNode;

  /**
   * Optional lazy loader invoked once per row when first expanded.
   * Returned fields are shallow-merged onto the grid row for that page.
   */
  loadRowDetails?: (row: T) => Promise<Partial<T> | T>;

  onExpandedChange?: (
    rowId: string | number,
    expanded: boolean,
    row: T,
  ) => void;

  expandOnRowClick?: boolean;
  expandToggleStyle?: "plus" | "doubleArrow";
  expandTogglePosition?: "first" | "last";
  getRowClassName?: (row: T) => string | undefined;
  headerContent?: ReactNode;
  tableLayout?: "fixed" | "auto";
  storageKey?: string | null;
}
