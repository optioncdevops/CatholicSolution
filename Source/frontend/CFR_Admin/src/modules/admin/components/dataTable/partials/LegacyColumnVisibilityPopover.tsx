import type { ColumnDef } from "./useDataTable";
import {
  COLUMN_VISIBILITY_LABEL_CLASS,
  COLUMN_VISIBILITY_POPOVER_LIST_CLASS,
} from "./columnVisibilityPopover.styles";

interface LegacyColumnVisibilityPopoverProps<T> {
  orderedColumns: ColumnDef<T>[];
  hiddenColumnIds: string[];
  allColumns: ColumnDef<T>[];
  enableColumnReorder?: boolean;
  onShowAll: () => void;
  onToggleColumn: (columnId: string) => void;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
}

/** Immediate column hide/show — no draft Update / Cancel footer. */
export function LegacyColumnVisibilityPopover<T>({
  orderedColumns,
  hiddenColumnIds,
  allColumns,
  enableColumnReorder = false,
  onShowAll,
  onToggleColumn,
  onMoveColumn,
}: LegacyColumnVisibilityPopoverProps<T>) {
  const hideableCount = allColumns.filter((c) => c.hideable !== false).length;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-4 px-3 pb-2">
        <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-100">
          Columns
        </span>
        <button
          type="button"
          className="shrink-0 whitespace-nowrap text-[11px] text-primary-600 hover:underline dark:text-primary-400"
          onClick={onShowAll}
        >
          Show all
        </button>
      </div>
      <div className={COLUMN_VISIBILITY_POPOVER_LIST_CLASS}>
        {orderedColumns.map((col, index) => {
          const isVisible = !hiddenColumnIds.includes(col.id);
          const hideable = col.hideable !== false;
          if (!hideable) {
            return (
              <div
                key={col.id}
                className="flex items-center justify-between gap-3 rounded px-2 py-1 opacity-60"
              >
                <span className={COLUMN_VISIBILITY_LABEL_CLASS}>
                  {col.header}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                  Locked
                </span>
              </div>
            );
          }

          const visibleHideableCount =
            hideableCount - hiddenColumnIds.length;
          const cannotHideLastVisible =
            isVisible && visibleHideableCount <= 1;

          return (
            <div
              key={col.id}
              className="flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-1">
                <span className={COLUMN_VISIBILITY_LABEL_CLASS}>
                  {col.header}
                </span>
                {enableColumnReorder && (
                  <div className="flex flex-col text-[8px] leading-none text-slate-400">
                    <button
                      type="button"
                      className={`hover:text-slate-700 dark:hover:text-slate-200 ${
                        index === 0 ? "cursor-default opacity-30" : ""
                      }`}
                      disabled={index === 0}
                      onClick={() => { onMoveColumn(index, index - 1); }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className={`hover:text-slate-700 dark:hover:text-slate-200 ${
                        index === orderedColumns.length - 1
                          ? "cursor-default opacity-30"
                          : ""
                      }`}
                      disabled={index === orderedColumns.length - 1}
                      onClick={() => { onMoveColumn(index, index + 1); }}
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={cannotHideLastVisible}
                onClick={() => { onToggleColumn(col.id); }}
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                  isVisible
                    ? "bg-primary-500"
                    : "bg-slate-300 dark:bg-slate-700"
                } ${cannotHideLastVisible ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                aria-pressed={isVisible}
                aria-label={`${isVisible ? "Hide" : "Show"} ${col.header}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                    isVisible ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
