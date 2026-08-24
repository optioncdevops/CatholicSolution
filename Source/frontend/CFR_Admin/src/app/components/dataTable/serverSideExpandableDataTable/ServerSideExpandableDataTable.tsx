import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import EmptyState from "@app/components/common/EmptyState";
import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";
import { showToast } from "@app/components/common/CustomToastMessage";
import { themeDataTableHeadClass } from "@designSystem/theme/styles/componentStyle";
import {
  DATA_TABLE_EXPORT_BTN_CSV_CLASS,
  DATA_TABLE_EXPORT_BTN_EXCEL_CLASS,
  DATA_TABLE_EXPORT_BTN_PRINT_CLASS,
  DATA_TABLE_FULLSCREEN_BTN_CLASS,
  DATA_TABLE_LAYOUT_CLASS,
  DATA_TABLE_SCROLL_BODY_Y_CLASS,
  DATA_TABLE_SCROLL_CONTAINER_CLASS,
  DATA_TABLE_TOOLBAR_SHELL_CLASS,
  getDataTableColumnsButtonClass,
} from "../customDataTable/customDataTable.constants";
import { getColumnTextAlignClass } from "../customDataTable/customDataTableColumnLayout.utils";
import { CustomServerSideDataTablePagination } from "../customServerSideDataTable/components/CustomServerSideDataTablePagination";
import { DataTableFullscreenOverlay } from "../partials/DataTableFullscreenOverlay";
import { DataTableGlobalSearch } from "../partials/DataTableGlobalSearch";
import { DataTableColumnsMenuPortal } from "../partials/DataTableColumnsMenuPortal";
import { DataTableExpandAllControls } from "../partials/DataTableExpandControls";
import { DataTableSortIcon } from "../partials/DataTableSortIcon";
import {
  buildHtmlTableFragment,
  printHtmlTableFragment,
  resolveColumnsForExport,
  resolveServerExportFileBase,
  resolveServerExportPrintTitle,
  runExportAfterPaint,
} from "../partials/tableExportUtils";
import { downloadExcelXlsx } from "../partials/tableExcelExport";
import { downloadTableCsv } from "../partials/tableCsvExport";
import type { ColumnDef } from "../partials/useDataTable";
import { buildServerPageSizeOptions } from "../partials/pageSizeOptionUtils";
import { useServerSideDataTable } from "../partials/useServerSideDataTable";
import type { ServerSideExpandableDataTableProps } from "./ServerSideExpandableDataTable.types";

export type {
  ServerSideExpandableDataTableProps,
  ServerSideExpandableRowDetailsMeta,
  ServerSideFetchParams,
  ServerSideFetchResult,
  SortModel,
} from "./ServerSideExpandableDataTable.types";

function rowKeyAsString(id: string | number): string {
  return String(id);
}

export function ServerSideExpandableDataTable<T>(
  props: ServerSideExpandableDataTableProps<T>,
) {
  const {
    columns,
    fetchData,
    rowKey,
    title,
    initialSortBy,
    initialPageSize,
    pageSizeOptions,
    initialSearch,
    debounceMs = 250,
    enableGlobalSearch = true,
    enableExport = false,
    exportFileName,
    exportTitle,
    pageName,
    enableColumnManager = true,
    enableFullscreenToggle = true,
    enableRowStriping = true,
    enableMultiSort = true,
    enableExpandControls = true,
    loadingOverride,
    emptyMessage = "No data available",
    refreshToken,
    renderRowDetails,
    loadRowDetails,
    onExpandedChange,
    expandOnRowClick = true,
    expandToggleStyle = "plus",
    expandTogglePosition = "first",
    getRowClassName,
    headerContent,
    tableLayout = "auto",
    storageKey = null,
  } = props;

  const effectiveInitialPageSize = initialPageSize ?? 25;
  const resolvedPageSizeOptions = useMemo(
    () => buildServerPageSizeOptions(effectiveInitialPageSize, pageSizeOptions),
    [effectiveInitialPageSize, pageSizeOptions],
  );

  const {
    rows,
    totalRows,
    pageIndex,
    pageSize,
    pageCount,
    sortModel,
    globalSearch,
    loading,
    error,
    setSortModel,
    setGlobalSearch,
    setPageIndex,
    setPageSize,
    refresh,
  } = useServerSideDataTable<T>({
    fetchData,
    initialSortBy,
    initialPageSize: effectiveInitialPageSize,
    initialSearch,
    debounceMs,
    storageKey,
  });

  const prevRefreshToken = useRef(refreshToken);
  useEffect(() => {
    if (prevRefreshToken.current === refreshToken) {
      return;
    }
    prevRefreshToken.current = refreshToken;
    refresh();
  }, [refreshToken, refresh]);

  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [rowPatches, setRowPatches] = useState<Map<string, Partial<T>>>(
    () => new Map(),
  );
  const [detailsLoadingIds, setDetailsLoadingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [detailsLoadedIds, setDetailsLoadedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>([]);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullscreenTogglingRef = useRef(false);
  const columnManagerRef = useRef<HTMLDivElement | null>(null);
  const rowRequestIdsRef = useRef<Map<string, number>>(new Map());

  // New page / sort / search → clear expansion and row patches, during render rather than in
  // an effect (sentinel-keyed on the joined page/sort/search identity).
  const pageSortSearchKey = `${pageIndex}:${pageSize}:${globalSearch}:${JSON.stringify(sortModel)}`;
  const [renderedForPageSortSearchKey, setRenderedForPageSortSearchKey] =
    useState(pageSortSearchKey);
  if (renderedForPageSortSearchKey !== pageSortSearchKey) {
    setRenderedForPageSortSearchKey(pageSortSearchKey);
    setExpandedRowIds(new Set());
    setRowPatches(new Map());
    setDetailsLoadingIds(new Set());
    setDetailsLoadedIds(new Set());
  }

  // Parent refresh / pagination refresh → drop stale expanded details, during render rather
  // than in an effect (sentinel-keyed on `loading`).
  const [renderedForLoading, setRenderedForLoading] = useState(loading);
  if (renderedForLoading !== loading) {
    setRenderedForLoading(loading);
    if (loading) {
      setExpandedRowIds(new Set());
      setRowPatches(new Map());
      setDetailsLoadingIds(new Set());
      setDetailsLoadedIds(new Set());
    }
  }

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (col) =>
          !col.exportOnly &&
          (col.hideable === false || !hiddenColumnIds.includes(col.id)),
      ),
    [columns, hiddenColumnIds],
  );

  const hideableColumns = useMemo(
    () => columns.filter((col) => !col.exportOnly && col.hideable !== false),
    [columns],
  );

  const [exportBusy, setExportBusy] = useState(false);
  const exportBusyRef = useRef(false);

  const fetchFullData = useCallback(async (): Promise<T[]> => {
    const fetchLen = totalRows > 0 ? totalRows : 10000;
    const result = await fetchData({
      pageIndex: 0,
      pageSize: fetchLen,
      sort: sortModel,
      filters: {},
      filterModel: [],
      globalSearch: globalSearch ?? "",
    });
    return result.rows ?? [];
  }, [fetchData, totalRows, sortModel, globalSearch]);

  const handleExport = useCallback(
    (format: "excel" | "csv" | "print") => {
      if (exportBusyRef.current) { return; }
      exportBusyRef.current = true;
      setExportBusy(true);

      void runExportAfterPaint(async () => {
        try {
          const fullData = await fetchFullData();
          if (!fullData || fullData.length === 0) {
            showToast.warning("No data available to export.");
            return;
          }
          const cols = resolveColumnsForExport(columns, visibleColumns);
          const base = resolveServerExportFileBase(
            exportFileName,
            pageName || title,
            fullData.length,
            totalRows,
          );

          if (format === "excel") {
            await downloadExcelXlsx(cols, fullData, `${base}.xlsx`, {
              title: exportTitle || resolveServerExportPrintTitle(base),
            });
          } else if (format === "csv") {
            downloadTableCsv(cols, fullData, `${base}.csv`, {
              title: exportTitle || resolveServerExportPrintTitle(base),
            });
          } else if (format === "print") {
            const html = buildHtmlTableFragment(cols, fullData);
            printHtmlTableFragment(
              html,
              exportTitle || resolveServerExportPrintTitle(base),
            );
          }
        } catch (err: unknown) {
          console.error("Export error:", err);
          showToast.error(
            err instanceof Error ? err.message : "Export failed.",
          );
        }
      }).finally(() => {
        exportBusyRef.current = false;
        setExportBusy(false);
      });
    },
    [
      fetchFullData,
      totalRows,
      columns,
      visibleColumns,
      exportFileName,
      pageName,
      title,
      exportTitle,
    ],
  );

  const resolveDisplayRow = useCallback(
    (row: T): T => {
      const id = rowKeyAsString(rowKey(row));
      const patch = rowPatches.get(id);
      return patch ? ({ ...row, ...patch } as T) : row;
    },
    [rowKey, rowPatches],
  );

  const runLoadRowDetails = useCallback(
    async (row: T) => {
      if (!loadRowDetails) {
        return;
      }
      const id = rowKeyAsString(rowKey(row));
      if (detailsLoadedIds.has(id) || detailsLoadingIds.has(id)) {
        return;
      }

      const requestId = (rowRequestIdsRef.current.get(id) ?? 0) + 1;
      rowRequestIdsRef.current.set(id, requestId);
      setDetailsLoadingIds((prev) => new Set(prev).add(id));
      try {
        const result = await loadRowDetails(row);
        if (requestId !== rowRequestIdsRef.current.get(id)) {
          return;
        }
        setRowPatches((prev) => {
          const next = new Map(prev);
          next.set(id, { ...(prev.get(id) ?? {}), ...(result as Partial<T>) });
          return next;
        });
        setDetailsLoadedIds((prev) => new Set(prev).add(id));
      } catch {
        // Caller / loadRowDetails should surface toasts; keep row expandable.
      } finally {
        setDetailsLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [detailsLoadedIds, detailsLoadingIds, loadRowDetails, rowKey],
  );

  const toggleRow = useCallback(
    (row: T) => {
      if (!renderRowDetails) {
        return;
      }
      const id = rowKeyAsString(rowKey(row));
      const willExpand = !expandedRowIds.has(id);
      setExpandedRowIds((prev) => {
        const next = new Set(prev);
        if (willExpand) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      const displayRow = resolveDisplayRow(row);
      onExpandedChange?.(rowKey(row), willExpand, displayRow);

      if (willExpand) {
        void runLoadRowDetails(displayRow);
      }
    },
    [
      expandedRowIds,
      onExpandedChange,
      renderRowDetails,
      resolveDisplayRow,
      rowKey,
      runLoadRowDetails,
    ],
  );

  const expandAll = useCallback(() => {
    if (!renderRowDetails) {
      return;
    }
    const next = new Set(rows.map((row) => rowKeyAsString(rowKey(row))));
    setExpandedRowIds(next);
    rows.forEach((row) => {
      void runLoadRowDetails(resolveDisplayRow(row));
    });
  }, [renderRowDetails, resolveDisplayRow, rowKey, rows, runLoadRowDetails]);

  const collapseAll = useCallback(() => {
    setExpandedRowIds(new Set());
  }, []);

  const toggleSortForColumn = useCallback(
    (columnId: string, additive: boolean) => {
      setSortModel((prev) => {
        const existing = prev.find((s) => s.columnId === columnId);
        if (!additive) {
          if (!existing) {
            return [{ columnId, direction: "asc" }];
          }
          if (existing.direction === "asc") {
            return [{ columnId, direction: "desc" }];
          }
          return [];
        }
        if (!existing) {
          return [...prev, { columnId, direction: "asc" }];
        }
        if (existing.direction === "asc") {
          return prev.map((s) =>
            s.columnId === columnId ? { ...s, direction: "desc" } : s,
          );
        }
        return prev.filter((s) => s.columnId !== columnId);
      });
      setPageIndex(0);
    },
    [setPageIndex, setSortModel],
  );

  const isLoading = loadingOverride ?? loading;
  const hasTrailingExpandColumn =
    Boolean(renderRowDetails) && expandTogglePosition === "last";
  const colSpan =
    visibleColumns.length + (hasTrailingExpandColumn ? 1 : 0);

  const renderExpandToggle = (row: T, isExpanded: boolean) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleRow(row);
      }}
      className="flex-shrink-0 rounded border border-border bg-background p-0.5 text-primary-600 transition-colors hover:bg-muted"
      aria-label={isExpanded ? "Collapse row" : "Expand row"}
    >
      {expandToggleStyle === "doubleArrow" ? (
        isExpanded ? (
          <AppIcon name="chevronsLeft" size={14} />
        ) : (
          <AppIcon name="chevronsRight" size={14} />
        )
      ) : isExpanded ? (
        <span className="text-lg leading-none">-</span>
      ) : (
        <span className="text-lg leading-none">+</span>
      )}
    </button>
  );

  const renderBodyCell = (
    col: ColumnDef<T>,
    row: T,
    displayRow: T,
    rowIndex: number,
    isExpanded: boolean,
    isFirstVisible: boolean,
  ) => {
    const content = col.cell
      ? col.cell(displayRow, rowIndex)
      : String(col.accessor(displayRow) ?? "");

    return (
      <td
        key={col.id}
        className={cn(
          "px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800",
          getColumnTextAlignClass(col.align),
          typeof col.cellClassName === "function"
            ? col.cellClassName(displayRow, rowIndex)
            : col.cellClassName,
          col.className,
        )}
        style={{
          width: col.width,
          minWidth: col.minWidth,
          maxWidth: col.maxWidth,
        }}
      >
        {isFirstVisible &&
        renderRowDetails &&
        expandTogglePosition === "first" ? (
          <div className="flex items-center gap-2">
            {renderExpandToggle(row, isExpanded)}
            <div className="min-w-0 flex-1">{content}</div>
          </div>
        ) : (
          content
        )}
      </td>
    );
  };

  const tableShellClass = cn(
    "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-950",
    isFullscreen && "flex h-full min-h-0 w-full flex-col",
  );

  const tableBody = (
    <div className={tableShellClass}>
      <div className={DATA_TABLE_TOOLBAR_SHELL_CLASS}>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {title ? (
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              {title}
            </span>
          ) : null}
          {headerContent ? (
            <div className="min-w-0 flex-1">{headerContent}</div>
          ) : null}
          {error ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {error}
            </span>
          ) : null}
          {enableExport ? (
            <div className="flex shrink-0 items-center">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Export:
              </span>
              <button
                type="button"
                disabled={exportBusy || totalRows === 0}
                className={DATA_TABLE_EXPORT_BTN_EXCEL_CLASS}
                title={totalRows > 0 ? "Export all to Excel (.xlsx)" : "No records to export"}
                onClick={() => { handleExport("excel"); }}
              >
                <AppIcon name="fileSpreadsheet" size={16} />
              </button>
              <button
                type="button"
                disabled={exportBusy || totalRows === 0}
                className={DATA_TABLE_EXPORT_BTN_PRINT_CLASS}
                title={totalRows > 0 ? "Print all" : "No records to export"}
                onClick={() => { handleExport("print"); }}
              >
                <AppIcon name="printer" size={16} />
              </button>
              <button
                type="button"
                disabled={exportBusy || totalRows === 0}
                onClick={() => { handleExport("csv"); }}
                className={DATA_TABLE_EXPORT_BTN_CSV_CLASS}
                title={totalRows > 0 ? "Download CSV (all)" : "No records to export"}
              >
                <AppIcon name="download" size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:min-w-0 sm:flex-1">
          {renderRowDetails && enableExpandControls ? (
            <DataTableExpandAllControls
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              isExpandAllDisabled={rows.length === 0}
              isCollapseAllDisabled={expandedRowIds.size === 0}
            />
          ) : null}
          {enableColumnManager && hideableColumns.length > 0 ? (
            <div className="relative shrink-0" ref={columnManagerRef}>
              <button
                type="button"
                className={getDataTableColumnsButtonClass({
                  isOpen: isColumnManagerOpen,
                  hasHiddenColumns: hiddenColumnIds.length > 0,
                })}
                onClick={() => {
                  setIsColumnManagerOpen((open) => !open);
                }}
                aria-expanded={isColumnManagerOpen}
                aria-haspopup="dialog"
              >
                <AppIcon name="columns3" size={14} />
                <span>Columns</span>
              </button>
              {isColumnManagerOpen ? (
                <DataTableColumnsMenuPortal
                  anchorRef={columnManagerRef}
                  isOpen={isColumnManagerOpen}
                  onRequestClose={() => { setIsColumnManagerOpen(false); }}
                >
                  <div className="space-y-1 px-2">
                    {hideableColumns.map((col) => {
                      const checked = !hiddenColumnIds.includes(col.id);
                      return (
                        <label
                          key={col.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setHiddenColumnIds((prev) =>
                                checked
                                  ? [...prev, col.id]
                                  : prev.filter((id) => id !== col.id),
                              );
                            }}
                          />
                          <span className="truncate">{col.header}</span>
                        </label>
                      );
                    })}
                  </div>
                </DataTableColumnsMenuPortal>
              ) : null}
            </div>
          ) : null}
          {enableFullscreenToggle ? (
            <button
              type="button"
              className={DATA_TABLE_FULLSCREEN_BTN_CLASS}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isFullscreenTogglingRef.current) {
                  return;
                }
                isFullscreenTogglingRef.current = true;
                setIsFullscreen((prev) => !prev);
                window.setTimeout(() => {
                  isFullscreenTogglingRef.current = false;
                }, 300);
              }}
            >
              <AppIcon
                name={isFullscreen ? "minimize2" : "maximize2"}
                size={14}
              />
            </button>
          ) : null}
          {enableGlobalSearch ? (
            <DataTableGlobalSearch
              className="sm:w-56"
              value={globalSearch}
              onChange={(value) => {
                setGlobalSearch(value);
                setPageIndex(0);
              }}
            />
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          DATA_TABLE_SCROLL_CONTAINER_CLASS,
          isFullscreen && "min-h-0 flex-1",
        )}
      >
        <div className={DATA_TABLE_SCROLL_BODY_Y_CLASS}>
          <table
            className={cn(
              "border-collapse text-left",
              tableLayout === "fixed" ? "w-full table-fixed" : DATA_TABLE_LAYOUT_CLASS,
            )}
          >
            <thead
              className={cn(
                themeDataTableHeadClass,
                "sticky top-0 z-30",
              )}
            >
              <tr>
                {visibleColumns.map((col) => {
                  const sortEntry = sortModel.find((s) => s.columnId === col.id);
                  const sortDirection = sortEntry?.direction ?? null;
                  const sortOrder =
                    sortEntry && sortModel.length > 1
                      ? sortModel.indexOf(sortEntry) + 1
                      : null;
                  return (
                    <th
                      key={col.id}
                      className={cn(
                        "px-2.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-900 select-none dark:text-primary-100 align-middle",
                        getColumnTextAlignClass(col.align),
                        col.headerClassName,
                        col.className,
                      )}
                      style={{
                        width: col.width,
                        minWidth: col.minWidth,
                        maxWidth: col.maxWidth,
                      }}
                    >
                      <button
                        type="button"
                        className={cn(
                          "inline-flex max-w-full items-center gap-1.5",
                          col.align === "right" && "w-full justify-end",
                          col.sortable ? "cursor-pointer" : "cursor-default",
                        )}
                        onClick={(e) => {
                          if (!col.sortable) {
                            return;
                          }
                          toggleSortForColumn(
                            col.id,
                            enableMultiSort && e.shiftKey,
                          );
                        }}
                      >
                        <span className="truncate leading-snug">
                          {col.headerNode ?? col.header}
                        </span>
                        {col.sortable ? (
                          <span className="inline-flex shrink-0 items-center">
                            <DataTableSortIcon direction={sortDirection} />
                            {sortOrder ? (
                              <span className="ml-0.5 text-[10px] text-primary-700 dark:text-primary-400">
                                {sortOrder}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </button>
                    </th>
                  );
                })}
                {hasTrailingExpandColumn ? (
                  <th className="w-10 px-2.5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-primary-900 select-none dark:text-primary-100">
                    {" "}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={Math.max(colSpan, 1)}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(colSpan, 1)}
                    className="px-4 py-6"
                  >
                    <EmptyState title={emptyMessage} />
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => {
                  const id = rowKeyAsString(rowKey(row));
                  const displayRow = resolveDisplayRow(row);
                  const isExpanded = expandedRowIds.has(id);
                  const isLoadingDetails = detailsLoadingIds.has(id);
                  return (
                    <React.Fragment key={id}>
                      <tr
                        className={cn(
                          enableRowStriping &&
                            rowIndex % 2 === 1 &&
                            "bg-slate-50/60 dark:bg-slate-900/40",
                          isExpanded && "bg-primary-50/30 dark:bg-primary-950/20",
                          expandOnRowClick &&
                            renderRowDetails &&
                            "cursor-pointer",
                          getRowClassName?.(displayRow),
                        )}
                        onClick={() => {
                          if (expandOnRowClick && renderRowDetails) {
                            toggleRow(row);
                          }
                        }}
                      >
                        {visibleColumns.map((col, colIndex) =>
                          renderBodyCell(
                            col,
                            row,
                            displayRow,
                            rowIndex,
                            isExpanded,
                            colIndex === 0,
                          ),
                        )}
                        {hasTrailingExpandColumn ? (
                          <td className="border-b border-slate-200 px-2 py-1.5 text-center dark:border-slate-800">
                            {renderExpandToggle(row, isExpanded)}
                          </td>
                        ) : null}
                      </tr>
                      {isExpanded && renderRowDetails ? (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                          <td
                            colSpan={Math.max(colSpan, 1)}
                            className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {renderRowDetails(displayRow, {
                              isLoadingDetails,
                            })}
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomServerSideDataTablePagination
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={pageCount}
        totalRows={totalRows}
        resolvedPageSizeOptions={resolvedPageSizeOptions}
        setPageSize={setPageSize}
        setPageIndex={setPageIndex}
        onRefresh={refresh}
      />
    </div>
  );

  if (isFullscreen) {
    return (
      <DataTableFullscreenOverlay
        open={isFullscreen}
        onClose={() => {
          setIsFullscreen(false);
        }}
        isTogglingRef={isFullscreenTogglingRef}
      >
        {tableBody}
      </DataTableFullscreenOverlay>
    );
  }

  return tableBody;
}
