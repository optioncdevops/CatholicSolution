import type { Dispatch, SetStateAction } from "react";
import type { ServerPageSizeOption } from "../../partials/useServerSideDataTable";
import { AppIcon } from "@app/components/icons";

export interface CustomServerSideDataTablePaginationProps {
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  totalRows: number;
  resolvedPageSizeOptions: readonly ServerPageSizeOption[];
  setPageSize: (size: ServerPageSizeOption) => void;
  setPageIndex: Dispatch<SetStateAction<number>>;
  onRefresh: () => void;
}

export function CustomServerSideDataTablePagination({
  pageSize,
  pageIndex,
  pageCount,
  totalRows,
  resolvedPageSizeOptions,
  setPageSize,
  setPageIndex,
  onRefresh,
}: CustomServerSideDataTablePaginationProps) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-1.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1.5">
        <span>Rows per page:</span>
        <select
          className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={String(pageSize)}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isFinite(next) || next <= 0) {return;}
            setPageSize(next);
            setPageIndex(0);
          }}
        >
          {resolvedPageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="ml-2 text-slate-500 dark:text-slate-400">
          Rows: {totalRows} • Page {pageIndex + 1} of {pageCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          disabled={pageIndex === 0}
          onClick={() => { setPageIndex(0); }}
          title="First page"
        >
          <AppIcon name="chevronsLeft" size={14} />
        </button>
        <button
          type="button"
          className="h-7 px-3 rounded-full border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          disabled={pageIndex === 0}
          onClick={() => { setPageIndex((p) => Math.max(0, p - 1)); }}
          title="Previous page"
        >
          Prev
        </button>
        <span className="text-slate-500 dark:text-slate-400 px-1">
          {pageIndex + 1} / {pageCount}
        </span>
        <button
          type="button"
          className="h-7 px-3 rounded-full border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => { setPageIndex((p) => Math.min(pageCount - 1, p + 1)); }}
          title="Next page"
        >
          Next
        </button>
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => { setPageIndex(pageCount - 1); }}
          title="Last page"
        >
          <AppIcon name="chevronsRight" size={14} />
        </button>
        <button
          type="button"
          className="ml-2 h-7 px-3 rounded-full border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={onRefresh}
          title="Refresh"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
