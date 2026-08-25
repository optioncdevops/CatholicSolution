import type { Dispatch, SetStateAction } from "react";
import type { ClientPageSizeOption, PageSizeValue } from "../../partials/useDataTable";
import { AppIcon } from "@app/components/icons";

export interface CustomDataTablePaginationProps {
  pageSize: PageSizeValue;
  pageIndex: number;
  pageCount: number;
  totalRows: number;
  resolvedPageSizeOptions: readonly ClientPageSizeOption[];
  setPageSize: (size: PageSizeValue) => void;
  setPageIndex: Dispatch<SetStateAction<number>>;
}

export function CustomDataTablePagination({
  pageSize,
  pageIndex,
  pageCount,
  totalRows,
  resolvedPageSizeOptions,
  setPageSize,
  setPageIndex,
}: CustomDataTablePaginationProps) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-1.5 border-t border-[var(--line)] bg-[var(--surface-muted)] text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1.5">
        <span>Rows per page:</span>
        <select
          className="h-7 rounded border border-[var(--line)] bg-[var(--surface)] px-2 text-xs text-[var(--text-secondary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={pageSize === "all" ? "all" : String(pageSize)}
          onChange={(e) => {
            const raw = e.target.value;
            const next: PageSizeValue = raw === "all" ? "all" : Number(raw);
            setPageSize(next);
            setPageIndex(0);
          }}
        >
          {resolvedPageSizeOptions.map((opt) =>
            opt === "all" ? (
              <option key="all" value="all">
                All
              </option>
            ) : (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ),
          )}
        </select>
        <span className="ml-2 text-[var(--text-muted)]">
          Rows: {totalRows} • Page {pageIndex + 1} of {pageCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:hover:bg-transparent"
          disabled={pageIndex === 0}
          onClick={() => { setPageIndex(0); }}
          title="First page"
        >
          <AppIcon name="chevronsLeft" size={14} />
        </button>
        <button
          type="button"
          className="h-7 px-3 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:hover:bg-transparent"
          disabled={pageIndex === 0}
          onClick={() => { setPageIndex((p) => Math.max(0, p - 1)); }}
          title="Previous page"
        >
          Prev
        </button>
        <span className="text-[var(--text-muted)] px-1">
          {pageIndex + 1} / {pageCount}
        </span>
        <button
          type="button"
          className="h-7 px-3 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:hover:bg-transparent"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => { setPageIndex((p) => Math.min(pageCount - 1, p + 1)); }}
          title="Next page"
        >
          Next
        </button>
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:hover:bg-transparent"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => { setPageIndex(pageCount - 1); }}
          title="Last page"
        >
          <AppIcon name="chevronsRight" size={14} />
        </button>
      </div>
    </div>
  );
}
