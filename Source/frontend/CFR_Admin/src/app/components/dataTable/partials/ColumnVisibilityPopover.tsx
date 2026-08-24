import type { ColumnDef } from "./useDataTable";
import {
  areColumnVisibilityMapsEqual,
  countVisibleHideableColumns,
  resolveColumnVisibility,
  toggleVisibilityInMap,
  type DataTableColumnVisibilityMap,
} from "./columnVisibilitySettings";
import {
  COLUMN_VISIBILITY_LABEL_CLASS,
  COLUMN_VISIBILITY_POPOVER_LIST_CLASS,
} from "./columnVisibilityPopover.styles";

interface ColumnVisibilityPopoverProps<T> {
  orderedColumns: ColumnDef<T>[];
  draftVisibility: DataTableColumnVisibilityMap;
  /** Applied visibility — used to detect draft changes and disable Update when unchanged. */
  appliedVisibility: DataTableColumnVisibilityMap;
  hideableColumnIds: string[];
  lockedColumnIds: string[];
  enableColumnReorder?: boolean;
  onDraftChange: (visibility: DataTableColumnVisibilityMap) => void;
  onCancel: () => void;
  onUpdate: () => void;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  /** When false, hides Update / Cancel (draft settings mode only). */
  showDraftFooter?: boolean;
}

/** Columns menu body — host/portal supplies shell + positioning. */
export function ColumnVisibilityPopover<T>({
  orderedColumns,
  draftVisibility,
  appliedVisibility,
  hideableColumnIds,
  lockedColumnIds,
  enableColumnReorder = false,
  onDraftChange,
  onCancel,
  onUpdate,
  onMoveColumn,
  showDraftFooter = true,
}: ColumnVisibilityPopoverProps<T>) {
  const columnIds = orderedColumns.map((c) => c.id);

  const handleToggle = (columnId: string) => {
    onDraftChange(
      toggleVisibilityInMap(draftVisibility, columnId, {
        lockedColumnIds,
        hideableColumnIds,
      }),
    );
  };

  const handleShowAll = () => {
    onDraftChange(
      resolveColumnVisibility(columnIds, lockedColumnIds, undefined),
    );
  };

  const hiddenCount = hideableColumnIds.filter(
    (id) => !draftVisibility[id],
  ).length;

  const hasDraftChanges = !areColumnVisibilityMapsEqual(
    draftVisibility,
    appliedVisibility,
    columnIds,
  );

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-4 px-3 pb-2">
        <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-100">
          Columns
        </span>
        <button
          type="button"
          className="shrink-0 whitespace-nowrap text-[11px] text-primary-600 hover:underline dark:text-primary-400"
          onClick={handleShowAll}
        >
          Show all
        </button>
      </div>

      <div className={COLUMN_VISIBILITY_POPOVER_LIST_CLASS}>
        {orderedColumns.map((col, index) => {
          const isLocked = col.hideable === false;
          const isVisible = draftVisibility[col.id];

          if (isLocked) {
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

          const canHide =
            isVisible ||
            countVisibleHideableColumns(draftVisibility, hideableColumnIds) > 1;

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
                  <div className="flex flex-col text-[10px] text-slate-400">
                    <button
                      type="button"
                      className={`leading-none hover:text-slate-700 dark:hover:text-slate-200 ${
                        index === 0 ? "cursor-default opacity-30" : ""
                      }`}
                      disabled={index === 0}
                      onClick={() => { onMoveColumn(index, index - 1); }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className={`leading-none hover:text-slate-700 dark:hover:text-slate-200 ${
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
                disabled={!canHide && isVisible}
                onClick={() => { handleToggle(col.id); }}
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                  isVisible
                    ? "bg-primary-500"
                    : "bg-slate-300 dark:bg-slate-700"
                } ${!canHide && isVisible ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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

      {showDraftFooter && (
        <div className="mt-2 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-3 pt-2 dark:border-slate-700">
          <span className="whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
            {hiddenCount > 0 ? `${hiddenCount} hidden` : "All visible"}
          </span>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={!hasDraftChanges}
              className="rounded bg-primary-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
              onClick={onUpdate}
            >
              Update
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
