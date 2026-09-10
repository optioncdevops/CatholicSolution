import { useMemo, type ReactNode } from 'react';
import { CustomDataTable } from './CustomDataTable';
import type { ColumnDef, SortState } from './partials/useDataTable';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  /** Rendered cell content — can be rich JSX (badges, links, avatars). */
  cell: (row: T) => ReactNode;
  /** Plain value used for sorting and every export format. Required unless `sortable` is false and export is not needed for this column. */
  value?: (row: T) => string | number;
  sortable?: boolean;
  /** Sticky/frozen to the left edge of the scroll area — use on at most one leading identity column. */
  pinLeft?: boolean;
  width?: string;
  className?: string;
  /** Exclude this column from Excel/Word/CSV/Print exports (e.g. an actions column). */
  excludeFromExport?: boolean;
}

/** A single `initialSort` entry, TanStack-shaped (`{ id, desc }`) to match this app's older call sites. */
export interface DataTableSort {
  id: string;
  desc?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  exportFileName?: string;
  exportTitle?: string;
  emptyMessage?: string;
  /** Caps the scrollable body height (e.g. '480px', '60vh') instead of growing the page indefinitely. */
  maxHeight?: string;
  initialSort?: DataTableSort[];
}

/**
 * Thin adapter over the fully-featured, ported `CustomDataTable` — every call site in this app
 * uses the simpler `DataTableColumn`/`DataTableProps` shape below, so switching the underlying
 * implementation (e.g. to pick up export/columns-manager/fullscreen/search) never touches a
 * call site. Add new `CustomDataTable` features here, not by bypassing this component.
 */
export function DataTable<T>({
  data, columns, getRowId, onRowClick, pageSize = 25, exportFileName = 'export', exportTitle, emptyMessage = 'No results found.', maxHeight, initialSort,
}: DataTableProps<T>) {
  const mappedColumns = useMemo<ColumnDef<T>[]>(() => columns.map((column) => ({
    id: column.id,
    header: column.header,
    accessor: column.value ?? (() => ''),
    cell: (row) => column.cell(row),
    sortable: column.sortable ?? Boolean(column.value),
    frozen: column.pinLeft,
    width: column.width,
    className: column.className,
    exportable: !column.excludeFromExport,
  })), [columns]);

  const initialSortBy: SortState = initialSort?.[0]
    ? { columnId: initialSort[0].id, direction: initialSort[0].desc ? 'desc' : 'asc' }
    : null;

  return (
    <CustomDataTable
      columns={mappedColumns}
      data={data}
      rowKey={(row) => getRowId(row)}
      onRowClick={onRowClick}
      initialSortBy={initialSortBy}
      initialPageSize={pageSize}
      exportFileName={exportFileName}
      pageName={exportTitle}
      emptyMessage={emptyMessage}
      innerScroll={Boolean(maxHeight)}
      innerScrollMaxHeight={maxHeight}
    />
  );
}
