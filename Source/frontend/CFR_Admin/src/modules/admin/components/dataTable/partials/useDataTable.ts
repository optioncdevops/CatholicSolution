// src/components/data-table/useDataTable.ts
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface ColumnDef<T> {
  id: string;
  /** Plain-text title for CSV, tooltips, and column picker. */
  header: string;
  /** When set, replaces the default truncated header label in the table (e.g. controls). */
  headerNode?: ReactNode;
  accessor: (row: T) => unknown;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  /** Whether this column can be hidden via the UI. Defaults to true. */
  hideable?: boolean;
  /** Whether this column shows the header actions menu (three dots). Defaults to true. */
  headerMenu?: boolean;
  /** Whether this column is frozen to the left when horizontally scrolling. */
  frozen?: boolean;
  /** Fixed or relative width, e.g. '120px', '10%', '8rem' */
  width?: string;
  /** Minimum width to prevent columns from becoming too narrow */
  minWidth?: string;
  /** Maximum width to avoid overly wide columns */
  maxWidth?: string;
  /** Text alignment for both header and cells */
  align?: "left" | "center" | "right";
  /** Optional custom renderer for cell content */
  cell?: (row: T, index: number) => ReactNode;
  /**
   * Number of columns this body cell should span.
   * Return `0` to skip rendering when another cell spans over this position.
   */
  colSpan?: number | ((row: T, rowIndex: number) => number);
  /**
   * Number of rows this body cell should span.
   * Return `0` to skip rendering when another cell spans over this position.
   */
  rowSpan?: number | ((row: T, rowIndex: number) => number);
  /** Optional extra classes on the column header cell. */
  headerClassName?: string;
  /**
   * Optional extra classes on body cells. Merged with default table cell styles.
   */
  cellClassName?: string | ((row: T, rowIndex: number) => string);
  /** Optional extra classes applied to both header and body cells for this column. */
  className?: string;
  /** Column header colspan (static). Use `0` on spanned-over header slots. */
  headerColSpan?: number;
  /** Column header rowspan (static). Filter row respects covered slots when set. */
  headerRowSpan?: number;
  /**
   * When `true`, body cells use smaller icon buttons. When `false`, never compact (overrides
   * `compactActionColumnIds` on `CustomDataTable`). When omitted, that table prop decides by column id.
   */
  compactIcons?: boolean;
  /** Include in CSV/Excel/print exports. Defaults to true. Action columns excluded separately by id. */
  exportable?: boolean;
  /**
   * When true, the column is omitted from the grid / column manager but still
   * included in CSV/Excel/PDF/print when exportable (industry-standard export-only fields).
   */
  exportOnly?: boolean;
  /** Optional custom accessor for exporting to CSV/Excel/print. Falls back to accessor. */
  exportAccessor?: (row: T) => unknown;
}

export type SortState = { columnId: string; direction: "asc" | "desc" } | null;

/** Client-side page size; `"all"` shows every filtered row on one page. */
export type ClientPageSizeOption = number | "all";

/** @deprecated Prefer {@link ClientPageSizeOption} */
export type PageSizeValue = ClientPageSizeOption;

export interface UseDataTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  initialSortBy?: SortState;
  /** Starting row count or `"all"` (default `20`). */
  initialPageSize?: ClientPageSizeOption;
  enableGroupingBy?: string | null;
}

export function useDataTable<T>(opts: UseDataTableOptions<T>) {
  const {
    data,
    columns,
    initialSortBy = null,
    initialPageSize = 20,
    enableGroupingBy = null,
  } = opts;

  const [sortState, setSortState] = useState<SortState>(initialSortBy);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] =
    useState<ClientPageSizeOption>(initialPageSize);

  // 1) filter
  const filtered = useMemo(() => {
    const hasFilters = Object.values(filters).some((v) => v?.trim());
    if (!hasFilters) {return data;}

    return data.filter((row) =>
      columns.every((col) => {
        const f = filters[col.id];
        if (!f?.trim()) {return true;}
        const val = col.accessor(row);
        return String(val ?? "")
          .toLowerCase()
          .includes(f.toLowerCase());
      })
    );
  }, [data, filters, columns]);

  // 2) sort
  const sorted = useMemo(() => {
    if (!sortState) {return filtered;}
    const { columnId, direction } = sortState;
    const col = columns.find((c) => c.id === columnId);
    if (!col) {return filtered;}
    const factor = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const va = col.accessor(a);
      const vb = col.accessor(b);
      if (va == null && vb == null) {return 0;}
      if (va == null) {return -1 * factor;}
      if (vb == null) {return 1 * factor;}
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * factor;
      }
      const sa = String(va);
      const sb = String(vb);
      if (sa < sb) {return -1 * factor;}
      if (sa > sb) {return 1 * factor;}
      return 0;
    });
  }, [filtered, sortState, columns]);

  // 3) grouping (simple single-column grouping, optional)
  const groupBy = enableGroupingBy;
  const grouped = useMemo(() => {
    if (!groupBy) {return null;}
    const col = columns.find((c) => c.id === groupBy);
    if (!col) {return null;}

    const map = new Map<string, T[]>();
    sorted.forEach((row) => {
      const key = String(col.accessor(row) ?? "(blank)");
      if (!map.has(key)) {map.set(key, []);}
      map.get(key)!.push(row);
    });
    return map; // Map<groupKey, T[]>
  }, [sorted, groupBy, columns]);

  // 4) pagination
  const totalRows = sorted.length;

  const pageCount =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(totalRows / pageSize));

  const safePageIndex =
    pageSize === "all"
      ? 0
      : Math.min(pageIndex, Math.max(0, pageCount - 1));

  const pageRows = useMemo(() => {
    if (pageSize === "all") {return sorted;}
    const start = safePageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePageIndex, pageSize]);

  /** Numeric stride for row indices / page sizing (`Math.max` avoids 0 when no rows). */
  const effectivePageSize =
    pageSize === "all" ? Math.max(totalRows, 1) : pageSize;

  return {
    // data
    pageRows,
    totalRows,
    pageIndex: safePageIndex,
    pageSize,
    effectivePageSize,
    pageCount,
    sortedRows: sorted,
    grouped,

    // state
    sortState,
    filters,

    // actions
    setSortState,
    setFilters,
    setPageIndex,
    setPageSize,
  };
}
