import { useMemo, useState, type ReactNode } from 'react';
import {
  flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { IconButton } from '../form/Button';
import { FilterSelect } from '../form/SelectField';
import { exportToCsv, exportToExcel, exportToWord, printTable, type ExportColumn } from './exportUtils';

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

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  exportFileName?: string;
  exportTitle?: string;
  emptyMessage?: string;
  maxHeight?: string;
  initialSort?: SortingState;
}

export function DataTable<T>({
  data, columns, getRowId, onRowClick, pageSize = 10, exportFileName = 'export', exportTitle = 'Export', emptyMessage = 'No results found.', maxHeight, initialSort = [],
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSort);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const tanStackColumns = useMemo<ColumnDef<T>[]>(() => columns.map((column) => ({
    id: column.id,
    header: column.header,
    accessorFn: column.value ?? (() => ''),
    cell: (info) => column.cell(info.row.original),
    enableSorting: column.sortable !== false && Boolean(column.value),
    size: undefined,
  })), [columns]);

  const table = useReactTable({
    data,
    columns: tanStackColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => getRowId(row),
  });

  const exportColumns: ExportColumn[] = columns
    .filter((column) => !column.excludeFromExport && column.value)
    .map((column) => ({ header: column.header, value: (row) => column.value!(row as T) }));

  const sortedRows = table.getSortedRowModel().rows.map((row) => row.original);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span className="mr-auto text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-faint)]">Export:</span>
        <IconButton label="Export to Excel" onClick={() => exportToExcel(sortedRows, exportColumns, exportFileName)}><FileSpreadsheet size={15} /></IconButton>
        <IconButton label="Export to Word" onClick={() => exportToWord(sortedRows, exportColumns, exportFileName)}><FileText size={15} /></IconButton>
        <IconButton label="Export to CSV" onClick={() => exportToCsv(sortedRows, exportColumns, exportFileName)}><Download size={15} /></IconButton>
        <IconButton label="Print" onClick={() => printTable(sortedRows, exportColumns, exportTitle)}><Printer size={15} /></IconButton>
      </div>

      <div className="admin-datatable-scroll" style={maxHeight ? { maxHeight } : undefined}>
        <table className="admin-datatable">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = columns.find((item) => item.id === header.column.id)!;
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`${column.pinLeft ? 'admin-datatable__pinned' : ''} ${column.className ?? ''}`}
                      style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"
                        >
                          {column.header}
                          {sortDirection === 'asc' ? <ArrowUp size={12} /> : sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                        </button>
                      ) : column.header}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-[var(--text-muted)]">{emptyMessage}</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={onRowClick ? 'cursor-pointer' : undefined} onClick={() => onRowClick?.(row.original)}>
                  {row.getVisibleCells().map((cell) => {
                    const column = columns.find((item) => item.id === cell.column.id)!;
                    return (
                      <td key={cell.id} className={column.pinLeft ? 'admin-datatable__pinned' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 || data.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[length:var(--admin-text-xs)] text-[var(--text-muted)]">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)} · {data.length} total
          </span>
          <div className="flex items-center gap-1.5">
            <FilterSelect
              label="Rows per page"
              value={String(pagination.pageSize)}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
            >
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
            </FilterSelect>
            <IconButton label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={16} /></IconButton>
            <IconButton label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight size={16} /></IconButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
