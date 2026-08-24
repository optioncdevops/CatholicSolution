import React from "react";
import { createPortal } from "react-dom";
import type { ColumnDef } from "../partials/useDataTable";
import {
  useServerSideDataTable,
  type FilterModelItem,
} from "../partials/useServerSideDataTable";
import { buildServerPageSizeOptions } from "../partials/pageSizeOptionUtils";
import { getColumnTextAlignClass, getHeaderMenuPortalStyle } from "../customDataTable/customDataTableColumnLayout.utils";
import { showToast } from "@app/components/common/CustomToastMessage";
import {
  buildHtmlTableFragment,
  resolveColumnsForExport,
  printHtmlTableFragment,
  resolveServerExportFileBase,
  resolveServerExportPrintTitle,
  runExportAfterPaint,
} from "../partials/tableExportUtils";
import { downloadExcelXlsx } from "../partials/tableExcelExport";
import { downloadTableCsv } from "../partials/tableCsvExport";
import {
  DATA_TABLE_SCROLL_BODY_Y_CLASS,
  DATA_TABLE_SCROLL_CONTAINER_CLASS,
  DATA_TABLE_HEADER_MENU_BTN_CLASS,
  DATA_TABLE_HEADER_MENU_ITEM_CLASS,
} from "../customDataTable/customDataTable.constants";
import EmptyState from "@app/components/common/EmptyState";
import type {
  CustomServerSideDataTableProps,
  ServerSideColumnMeta,
  SortModel,
} from "./CustomServerSideDataTable.types";
import { CustomServerSideDataTableToolbar } from "./components/CustomServerSideDataTableToolbar";
import { CustomServerSideDataTablePagination } from "./components/CustomServerSideDataTablePagination";
import { CustomServerSideDataTableStatusBar } from "./components/CustomServerSideDataTableStatusBar";
import { CustomServerSideDataTableTooltipPortal } from "./components/CustomServerSideDataTableTooltipPortal";
import { DataTableFullscreenOverlay } from "../partials/DataTableFullscreenOverlay";
import { DataTableSortIcon } from "../partials/DataTableSortIcon";
import { cn } from "@app/utilities/cn";
import { resolveDataTablePortalLayerClass } from "@designSystem/theme/styles/componentStyle";

export type {
  CustomServerSideDataTableProps,
  ServerSideFetchParams,
  ServerSideFetchResult,
  SortModel,
} from "./CustomServerSideDataTable.types";

export function CustomServerSideDataTable<T>(
  props: CustomServerSideDataTableProps<T>,
) {
  type ColumnMeta = ServerSideColumnMeta<T>;

  const {
    columns: inputColumns,
    fetchData,
    rowKey,
    title,
    initialSortBy,
    initialPageSize,
    pageSizeOptions,
    initialFilters,
    initialSearch,
    debounceMs,
    enableGlobalSearch = true,
    enableExport = true,
    exportFileName,
    pageName,
    enableColumnManager = true,
    enableColumnActions = true,
    enableColumnFilters = true,
    enableRowStriping = true,
    enableFullscreenToggle = true,
    loadingOverride,
    loadingMode = "spinner",
    skeletonRowCount = 6,
    enableMultiSort = true,
    storageKey = null,
    enableGrouping = false,
    groupingField = null,
    enableVirtualization = false,
    // When virtualization is enabled, we will auto-measure row height if not provided
    rowHeight,
    overscanCount = 6,
    enableStatusBar = true,
    aggregateColumns = [],
    innerScroll = false,
    innerScrollMaxHeight = "480px",
    enableRowSelection = false,
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    enableColumnReorder = false,
    emptyMessage = "No data available",
  } = props;

  const columns = inputColumns as ColumnMeta[];

  const effectiveInitialPageSize = initialPageSize ?? 25;

  const resolvedPageSizeOptions = React.useMemo(
    () => buildServerPageSizeOptions(effectiveInitialPageSize, pageSizeOptions),
    [effectiveInitialPageSize, pageSizeOptions],
  );

  const buildFilterModel = React.useCallback(
    (filt: Record<string, string>) =>
      Object.entries(filt)
        .filter(([, v]) => v?.trim())
        .map<FilterModelItem>(([columnId, value]) => {
          const col = columns.find((c) => c.id === columnId);
          return {
            columnId,
            value,
            type: col?.filterType,
            operator:
              col?.filterType === "number" || col?.filterType === "date"
                ? "equals"
                : "contains",
          };
        }),
    [columns],
  );

  const {
    rows,
    totalRows,
    pageIndex,
    pageSize,
    effectiveNumericPageSize,
    pageCount,
    sortModel,
    filters,
    globalSearch,
    loading: serverLoading,
    error,
    setSortModel,
    setFilters,
    setGlobalSearch,
    setPageIndex,
    setPageSize,
    refresh,
  } = useServerSideDataTable<T>({
    fetchData,
    initialSortBy,
    initialPageSize: effectiveInitialPageSize,
    initialFilters,
    initialSearch,
    debounceMs,
    storageKey: storageKey ? `${storageKey}:data` : null,
    groupBy: groupingField,
    buildFilterModel,
  });

  const [activeFilterColumnId, setActiveFilterColumnId] = React.useState<
    string | null
  >(null);
  const [openMenuForColumnId, setOpenMenuForColumnId] = React.useState<
    string | null
  >(null);
  const [hiddenColumnIds, setHiddenColumnIds] = React.useState<string[]>([]);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isFullscreenTogglingRef = React.useRef(false);
  const columnManagerRef = React.useRef<HTMLDivElement | null>(null);
  const headerMenuRef = React.useRef<HTMLDivElement | null>(null);
  const headerCellRefs = React.useRef<(HTMLTableCellElement | null)[]>([]);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[] | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >({});
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedRowIds, setSelectedRowIds] = React.useState<
    Set<string | number>
  >(new Set());
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const headerButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(
    new Map(),
  );
  const [headerMenuPosition, setHeaderMenuPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const [draggingColumnId, setDraggingColumnId] = React.useState<string | null>(
    null,
  );
  const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(
    null,
  );
  const tableBodyRef = React.useRef<HTMLDivElement | null>(null);
  const [virtualRange, setVirtualRange] = React.useState({
    start: 0,
    end: 0,
    offsetTop: 0,
  });
  const [measuredRowHeight, setMeasuredRowHeight] = React.useState<
    number | null
  >(null);

  const effectiveRowHeight = React.useMemo(() => {
    if (!enableVirtualization) {return null;}
    if (typeof rowHeight === "number") {return rowHeight;}
    return measuredRowHeight ?? 22; // fallback matches CustomDataTable natural height
  }, [enableVirtualization, rowHeight, measuredRowHeight]);

  const fullStorageKey = storageKey ? `${storageKey}:ui` : null;

  // Restore UI state during render (sentinel-keyed on `fullStorageKey`, which can change if
  // `storageKey` changes) rather than as a mount/key-change effect.
  const [renderedForFullStorageKey, setRenderedForFullStorageKey] =
    React.useState<string | null>(null);
  if (fullStorageKey && renderedForFullStorageKey !== fullStorageKey) {
    setRenderedForFullStorageKey(fullStorageKey);
    try {
      const raw = localStorage.getItem(fullStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.hiddenColumnIds) {setHiddenColumnIds(parsed.hiddenColumnIds);}
        if (parsed.columnOrder) {setColumnOrder(parsed.columnOrder);}
        if (parsed.columnWidths) {setColumnWidths(parsed.columnWidths);}
      }
    } catch {
      // ignore parse errors
    }
  }

  // Persist UI state
  React.useEffect(() => {
    if (!fullStorageKey) {return;}
    try {
      localStorage.setItem(
        fullStorageKey,
        JSON.stringify({
          hiddenColumnIds,
          columnOrder,
          columnWidths,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, [hiddenColumnIds, columnOrder, columnWidths, fullStorageKey]);

  const orderedColumns = React.useMemo(() => {
    const displayColumns = columns.filter((c) => !c.exportOnly);
    const baseOrder = columnOrder ?? displayColumns.map((c) => c.id);
    const byId = new Map(displayColumns.map((c) => [c.id, c]));
    return baseOrder
      .map((id) => byId.get(id))
      .filter((c): c is ColumnDef<T> => !!c);
  }, [columns, columnOrder]);

  const visibleColumns = React.useMemo(
    () => orderedColumns.filter((c) => !hiddenColumnIds.includes(c.id)),
    [orderedColumns, hiddenColumnIds],
  );

  // Virtualization range calculator
  React.useEffect(() => {
    if (!enableVirtualization) {return;}
    if (!effectiveRowHeight) {return;}
    const el = tableBodyRef.current;
    if (!el) {return;}
    const handle = () => {
      const scrollTop = el.scrollTop;
      const viewportHeight = el.clientHeight;
      const start = Math.max(
        0,
        Math.floor(scrollTop / effectiveRowHeight) - overscanCount,
      );
      const end =
        Math.ceil((scrollTop + viewportHeight) / effectiveRowHeight) +
        overscanCount;
      setVirtualRange((prev) => {
        if (
          prev.start === start &&
          prev.end === end &&
          prev.offsetTop === start * effectiveRowHeight
        ) {
          return prev;
        }
        return {
          start,
          end,
          offsetTop: start * effectiveRowHeight,
        };
      });
    };
    handle();
    el.addEventListener("scroll", handle);
    return () => {
      el.removeEventListener("scroll", handle);
    };
  }, [enableVirtualization, effectiveRowHeight, overscanCount, rows.length]);

  // Measure natural row height to sync virtualization with actual DOM height
  React.useLayoutEffect(() => {
    if (!enableVirtualization) {return;}
    const el = tableBodyRef.current;
    if (!el) {return;}
    const raf = requestAnimationFrame(() => {
      const firstRow = el.querySelector("tbody tr");
      if (firstRow) {
        const h = firstRow.getBoundingClientRect().height;
        if (h > 0 && Math.abs((measuredRowHeight ?? 0) - h) > 0.5) {
          setMeasuredRowHeight(h);
        }
      }
    });
    return () => { cancelAnimationFrame(raf); };
  }, [enableVirtualization, rows, visibleColumns, measuredRowHeight]);

  const aggregates = React.useMemo(() => {
    const cols = columns.filter(
      (c) =>
        (c).aggregate === "sum" ||
        aggregateColumns.includes(c.id),
    );
    if (!cols.length) {return [];}
    const sums: { id: string; header: string; value: number }[] = [];
    cols.forEach((c) => {
      const total = rows.reduce((acc, r) => {
        const v = Number(c.accessor(r));
        return Number.isFinite(v) ? acc + v : acc;
      }, 0);
      sums.push({ id: c.id, header: c.header, value: total });
    });
    return sums;
  }, [rows, columns, aggregateColumns]);

  const groupedRows = React.useMemo(() => {
    if (!enableGrouping || !groupingField) {return null;}
    const groups = new Map<string, { key: string; rows: T[] }>();
    const col = columns.find((c) => c.id === groupingField);
    if (!col) {return null;}
    rows.forEach((r) => {
      const key = String(col.accessor(r) ?? "(blank)");
      if (!groups.has(key)) {groups.set(key, { key, rows: [] });}
      groups.get(key)!.rows.push(r);
    });
    return Array.from(groups.values());
  }, [enableGrouping, groupingField, rows, columns]);

  // Runtime-computed left offsets for frozen columns
  const [frozenLefts, setFrozenLefts] = React.useState<(number | null)[]>(
    [],
  );

  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const isHidden = prev.includes(columnId);
      if (isHidden) {
        return prev.filter((id) => id !== columnId);
      }
      const visibleCount = columns.length - prev.length;
      if (visibleCount <= 1) {return prev;}
      return [...prev, columnId];
    });
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    setColumnOrder((prev) => {
      const base = prev ?? columns.map((c) => c.id);
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= base.length ||
        toIndex >= base.length
      ) {
        return base;
      }
      const next = [...base];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const startResize = (colId: string, startX: number) => {
    const currentWidth =
      columnWidths[colId] ??
      (() => {
        const col = columns.find((c) => c.id === colId);
        const parsed = col?.width ? parseFloat(col.width) : NaN;
        return Number.isFinite(parsed) ? parsed : 140;
      })();

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setColumnWidths((prev) => ({
        ...prev,
        [colId]: Math.max(80, currentWidth + delta),
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDragStart = (colId: string) => {
    setDraggingColumnId(colId);
  };

  const handleDragEnter = (colId: string) => {
    setDragOverColumnId(colId);
  };

  const handleDragEnd = () => {
    if (
      draggingColumnId &&
      dragOverColumnId &&
      draggingColumnId !== dragOverColumnId
    ) {
      const fromIndex = orderedColumns.findIndex(
        (c) => c.id === draggingColumnId,
      );
      const toIndex = orderedColumns.findIndex(
        (c) => c.id === dragOverColumnId,
      );
      moveColumn(fromIndex, toIndex);
    }
    setDraggingColumnId(null);
    setDragOverColumnId(null);
  };

  const setRowSelected = (row: T, selected: boolean) => {
    const key = rowKey(row);
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(key);
      } else {
        next.delete(key);
      }
      if (onSelectionChange) {
        const selectedRows = rows.filter((r) => next.has(rowKey(r)));
        onSelectionChange(selectedRows);
      }
      return next;
    });
  };

  // Close column manager is handled by DataTableColumnsMenuPortal
  // (outside click / Escape) so the fixed portal is not treated as "outside".

  // Prevent body scroll when in fullscreen
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // When all columns are hidden, clear frozen-column offsets during render (sentinel-keyed on
  // the visible-columns signature) rather than as a synchronous effect reset.
  const visibleColumnsSignature = visibleColumns.map((c) => c.id).join("");
  const [renderedForEmptyFrozenLeftsSignature, setRenderedForEmptyFrozenLeftsSignature] =
    React.useState<string | null>(null);
  if (
    !visibleColumns.length &&
    renderedForEmptyFrozenLeftsSignature !== visibleColumnsSignature
  ) {
    setRenderedForEmptyFrozenLeftsSignature(visibleColumnsSignature);
    setFrozenLefts((prev) => (prev.length === 0 ? prev : []));
  }

  // Measure actual widths for frozen columns
  React.useLayoutEffect(() => {
    if (!visibleColumns.length) {return;}

    const widths = visibleColumns.map((col, index) => {
      const el = headerCellRefs.current[index];
      const domWidth = el?.offsetWidth ?? 0;
      if (domWidth > 0) {return domWidth;}
      const parsed =
        (col.width && parseFloat(col.width)) ||
        (col.minWidth && parseFloat(col.minWidth)) ||
        0;
      return parsed;
    });

    const next: (number | null)[] = [];
    let acc = 0;
    visibleColumns.forEach((col, index) => {
      if (!col.frozen) {
        next[index] = null;
        return;
      }
      next[index] = acc;
      acc += widths[index];
    });

    setFrozenLefts((prev) => {
      if (
        prev.length === next.length &&
        prev.every((value, index) => value === next[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [visibleColumns, hiddenColumnIds]);

  // Close column header three-dot menu when clicking outside
  React.useEffect(() => {
    if (!openMenuForColumnId) {return;}

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) {return;}
      if (headerMenuRef.current?.contains(target)) {return;}
      if (
        target instanceof Element &&
        target.closest("[data-datatable-header-menu-trigger]")
      ) {
        return;
      }
      setOpenMenuForColumnId(null);
      setHeaderMenuPosition(null);
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuForColumnId]);

  // Clear the header menu position during render (sentinel-keyed on `openMenuForColumnId`)
  // rather than as a synchronous effect reset.
  const [renderedForOpenMenuForColumnId, setRenderedForOpenMenuForColumnId] =
    React.useState(openMenuForColumnId);
  if (renderedForOpenMenuForColumnId !== openMenuForColumnId) {
    setRenderedForOpenMenuForColumnId(openMenuForColumnId);
    if (!openMenuForColumnId) {
      setHeaderMenuPosition(null);
    }
  }

  const toggleSortForColumn = (columnId: string, additive: boolean) => {
    setSortModel((prev) => {
      const existingIndex = prev.findIndex((s) => s.columnId === columnId);
      const next: SortModel = additive ? [...prev] : [];
      
      if (existingIndex === -1) {
        next.push({ columnId, direction: "asc" });
      } else {
        const current = prev[existingIndex];
        if (current.direction === "asc") {
          if (additive) {
            next[existingIndex] = { ...current, direction: "desc" };
          } else {
            next.push({ columnId, direction: "desc" });
          }
        } else {
          // remove if toggled off
          if (additive) {
            next.splice(existingIndex, 1);
          }
        }
      }
      return next;
    });
    setPageIndex(0);
  };

  const allColumnsExportRef = React.useRef(columns);
  const visibleColumnsExportRef = React.useRef(visibleColumns);
  const rowsExportRef = React.useRef(rows);
  const totalRowsExportRef = React.useRef(totalRows);
  React.useLayoutEffect(() => {
    allColumnsExportRef.current = columns;
    visibleColumnsExportRef.current = visibleColumns;
    rowsExportRef.current = rows;
    totalRowsExportRef.current = totalRows;
  }, [columns, visibleColumns, rows, totalRows]);

  const [exportBusy, setExportBusy] = React.useState(false);
  const exportBusyRef = React.useRef(false);

  const runServerExport = React.useCallback((task: () => void) => {
    if (exportBusyRef.current) {return;}
    exportBusyRef.current = true;
    setExportBusy(true);
    void runExportAfterPaint(task)
      .catch((e: unknown) => {
        showToast.error(e instanceof Error ? e.message : "Export failed.");
      })
      .finally(() => {
        exportBusyRef.current = false;
        setExportBusy(false);
      });
  }, []);

  const resolveExportColumns = React.useCallback(
    () =>
      resolveColumnsForExport(
        allColumnsExportRef.current,
        visibleColumnsExportRef.current,
      ),
    [],
  );

  const handleExportCsvServer = React.useCallback(() => {
    runServerExport(() => {
      const cols = resolveExportColumns();
      const rowData = rowsExportRef.current;
      const base = resolveServerExportFileBase(
        exportFileName,
        pageName,
        rowData.length,
        totalRowsExportRef.current,
      );
      downloadTableCsv(cols, rowData, `${base}.csv`, {
        title: resolveServerExportPrintTitle(base),
      });
    });
  }, [exportFileName, pageName, runServerExport, resolveExportColumns]);

  const handleExportExcelServer = React.useCallback(() => {
    runServerExport(() => {
      const cols = resolveExportColumns();
      const rowData = rowsExportRef.current;
      const base = resolveServerExportFileBase(
        exportFileName,
        pageName,
        rowData.length,
        totalRowsExportRef.current,
      );
      return downloadExcelXlsx(cols, rowData, `${base}.xlsx`, {
        title: resolveServerExportPrintTitle(base),
      });
    });
  }, [exportFileName, pageName, runServerExport, resolveExportColumns]);

  const handleExportPrintServer = React.useCallback(() => {
    runServerExport(() => {
      const cols = resolveExportColumns();
      const rowData = rowsExportRef.current;
      const html = buildHtmlTableFragment(cols, rowData);
      const base = resolveServerExportFileBase(
        exportFileName,
        pageName,
        rowData.length,
        totalRowsExportRef.current,
      );
      printHtmlTableFragment(html, resolveServerExportPrintTitle(base));
    });
  }, [exportFileName, pageName, runServerExport, resolveExportColumns]);

  const isLoading = loadingOverride ?? serverLoading;
  const hasNoData = !isLoading && rows.length === 0;
  const canExport = rows.length > 0;
  const showSkeleton = isLoading && loadingMode === "skeleton";

  const tableContent = (
    <div
      ref={tableContainerRef}
      className={`relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950 transition-all duration-200 ${
        isFullscreen
          ? "flex max-h-[95vh] w-full max-w-[95vw] flex-col"
          : "w-full"
      }`}
    >
      <CustomServerSideDataTableToolbar
        title={title}
        error={error}
        enableExport={enableExport}
        exportBusy={exportBusy}
        canExport={canExport}
        handleExportExcelServer={handleExportExcelServer}
        handleExportPrintServer={handleExportPrintServer}
        handleExportCsvServer={handleExportCsvServer}
        enableGlobalSearch={enableGlobalSearch}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        setPageIndex={setPageIndex}
        enableColumnManager={enableColumnManager}
        columnManagerRef={columnManagerRef}
        hiddenColumnIds={hiddenColumnIds}
        isColumnManagerOpen={isColumnManagerOpen}
        setIsColumnManagerOpen={setIsColumnManagerOpen}
        setHiddenColumnIds={setHiddenColumnIds}
        orderedColumns={orderedColumns}
        columns={columns}
        enableColumnReorder={enableColumnReorder}
        moveColumn={moveColumn}
        toggleColumnVisibility={toggleColumnVisibility}
        enableFullscreenToggle={enableFullscreenToggle}
        isFullscreen={isFullscreen}
        isFullscreenTogglingRef={isFullscreenTogglingRef}
        setIsFullscreen={setIsFullscreen}
      />

      {/* Progressive top loader */}
      {isLoading && loadingMode === "progress" && (
        <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-analyze-400 to-primary-700 animate-pulse" />
      )}

      {/* Table */}
      <div
        ref={tableBodyRef}
        className={cn(
          DATA_TABLE_SCROLL_CONTAINER_CLASS,
          isLoading &&
            (loadingMode === "progress" ||
              loadingMode === "skeleton" ||
              loadingMode === "spinner")
            ? "overflow-hidden"
            : innerScroll
              ? DATA_TABLE_SCROLL_BODY_Y_CLASS
              : undefined,
          isLoading && (loadingMode === "spinner" || loadingMode === "progress")
            ? "min-h-[220px]"
            : undefined,
          isFullscreen ? "min-h-0 flex-1" : undefined,
        )}
        style={
          innerScroll && !isLoading
            ? {
                maxHeight: isFullscreen
                  ? "calc(95vh - 200px)"
                  : innerScrollMaxHeight,
              }
            : isFullscreen
              ? { height: "100%" }
              : undefined
        }
      >
        {visibleColumns.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            All columns are hidden. Use the{" "}
            <span className="font-medium">Columns</span> menu to show at least
            one column.
          </div>
        ) : (
          <table className="min-w-full text-sm table-fixed">
            <thead
              className={`border-y border-primary-200/90 bg-primary-100/95 dark:border-primary-800/55 dark:bg-primary-950/55 ${
                innerScroll ? "sticky top-0 z-30" : ""
              }`}
            >
              <tr>
                {enableRowSelection && (
                  <th className="px-1.5 py-0.5 w-8 text-center text-[11px] font-semibold text-primary-900 uppercase tracking-wide select-none dark:text-primary-100 bg-primary-100/95 dark:bg-primary-950/55 border-r border-primary-200/90 dark:border-primary-800/60">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                      checked={
                        rows.length > 0 &&
                        rows.every((r) => selectedRowIds.has(rowKey(r)))
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        rows.forEach((r) => { setRowSelected(r, checked); });
                      }}
                    />
                  </th>
                )}
                {visibleColumns.map((col, colIndex) => {
                  const metaCol = col as ColumnMeta;
                  const sortEntry = sortModel.find(
                    (s) => s.columnId === col.id,
                  );
                  const isSorted = sortEntry?.direction ?? null;
                  const sortOrder =
                    sortEntry && sortModel
                      ? sortModel.indexOf(sortEntry) + 1
                      : null;
                  const isFilterOpen = activeFilterColumnId === col.id;
                  const isMenuOpen = openMenuForColumnId === col.id;
                  const hasFilterValue = !!filters[col.id];

                  const hideable = col.hideable !== false;
                  const hasHeaderMenu =
                    enableColumnActions && col.headerMenu !== false;
                  const isFrozen = col.frozen === true;
                  const leftOffset = isFrozen
                    ? (frozenLefts[colIndex] ?? 0)
                    : undefined;
                  return (
                    <th
                      key={col.id}
                      ref={(el) => {
                        headerCellRefs.current[colIndex] = el;
                      }}
                      draggable={enableColumnReorder}
                      onDragStart={() => { handleDragStart(col.id); }}
                      onDragEnter={() => { handleDragEnter(col.id); }}
                      onDragEnd={handleDragEnd}
                      className={`relative px-1.5 py-1 text-[11px] font-semibold text-primary-900 uppercase tracking-wide select-none dark:text-primary-100 ${getColumnTextAlignClass(col.align)} ${
                        isFrozen
                          ? "sticky z-20 bg-primary-100/95 dark:bg-primary-950/55 border-r border-primary-200/90 dark:border-primary-800/60"
                          : ""
                      }`}
                      style={{
                        width: columnWidths[col.id]
                          ? `${columnWidths[col.id]}px`
                          : col.width,
                        minWidth: col.minWidth,
                        maxWidth: col.maxWidth,
                        left: leftOffset,
                      }}
                    >
                      <div className="relative flex items-center justify-between gap-1">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) {
                              headerButtonRefs.current.set(col.id, el);
                            } else {
                              headerButtonRefs.current.delete(col.id);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1 flex-1 min-w-0",
                            col.align === "right" && "justify-end",
                            col.sortable && !hasNoData ? "cursor-pointer" : "cursor-default"
                          )}
                          onClick={(e) => {
                            if (!col.sortable || hasNoData) {return;}
                            const additive = enableMultiSort && e.shiftKey;
                            toggleSortForColumn(col.id, additive);
                          }}
                          onMouseEnter={() => {
                            const button = headerButtonRefs.current.get(col.id);
                            if (button) {
                              const rect = button.getBoundingClientRect();
                              setTooltipPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                text: col.header,
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipPosition(null);
                          }}
                        >
                          <span className={cn(
                            "truncate flex items-center gap-1",
                            col.align === "right" ? "min-w-0 flex-1 text-right justify-end" : "flex-1 text-left justify-start"
                          )}>
                            {col.header}
                            {hasFilterValue && (
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                            )}
                          </span>
                          {col.sortable && !hasNoData && (
                            <span className="inline-flex items-center flex-shrink-0">
                              <DataTableSortIcon direction={isSorted} />
                              {sortOrder && sortModel.length > 1 && (
                                <span className="ml-1 text-[10px] text-primary-700 dark:text-primary-400">
                                  {sortOrder}
                                </span>
                              )}
                            </span>
                          )}
                        </button>

                        {/* Resize handle */}
                        {metaCol.resizable !== false && (
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              startResize(col.id, e.clientX);
                            }}
                          />
                        )}

                        {/* Column actions menu */}
                        {hasHeaderMenu && !hasNoData && (
                          <div
                            className={
                              isMenuOpen ? "relative z-40" : "relative"
                            }
                          >
                            <button
                              type="button"
                              data-datatable-header-menu-trigger=""
                              className={cn(
                                DATA_TABLE_HEADER_MENU_BTN_CLASS,
                                isFilterOpen && "bg-slate-100 dark:bg-slate-800",
                              )}
                              onMouseDown={(e) => { e.stopPropagation(); }}
                              onClick={(e) => {
                                const next =
                                  openMenuForColumnId === col.id
                                    ? null
                                    : col.id;
                                setOpenMenuForColumnId(next);
                                if (next) {
                                  setHeaderMenuPosition(
                                    getHeaderMenuPortalStyle(
                                      e.currentTarget.getBoundingClientRect(),
                                    ),
                                  );
                                } else {
                                  setHeaderMenuPosition(null);
                                }
                              }}
                            >
                              <span className="text-base leading-none">⋮</span>
                            </button>

                            {isMenuOpen &&
                              createPortal(
                                <div
                                  ref={headerMenuRef}
                                  className={cn(
                                    "fixed w-32 rounded-md border border-slate-200 bg-white py-1 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900",
                                    resolveDataTablePortalLayerClass(),
                                  )}
                                  style={
                                    headerMenuPosition ?? { top: 8, left: 8 }
                                  }
                                  onMouseDown={(e) => { e.stopPropagation(); }}
                                >
                                  <button
                                    type="button"
                                    className={cn(
                                      DATA_TABLE_HEADER_MENU_ITEM_CLASS,
                                      !col.sortable &&
                                        "cursor-not-allowed text-slate-400 dark:text-slate-600",
                                    )}
                                    onClick={() => {
                                      if (!col.sortable) {return;}
                                      toggleSortForColumn(col.id, false);
                                      setOpenMenuForColumnId(null);
                                    }}
                                  >
                                    Sort
                                  </button>

                                  {enableColumnFilters && col.filterable && (
                                    <button
                                      type="button"
                                      className={DATA_TABLE_HEADER_MENU_ITEM_CLASS}
                                      onClick={() => {
                                        setActiveFilterColumnId((prev) =>
                                          prev === col.id ? null : col.id,
                                        );
                                        setOpenMenuForColumnId(null);
                                      }}
                                    >
                                      {isFilterOpen ? "Hide filter" : "Filter"}
                                    </button>
                                  )}

                                  {hideable && (
                                    <button
                                      type="button"
                                      className={DATA_TABLE_HEADER_MENU_ITEM_CLASS}
                                      onClick={() => {
                                        setActiveFilterColumnId((prev) =>
                                          prev === col.id ? null : prev,
                                        );
                                        toggleColumnVisibility(col.id);
                                        setOpenMenuForColumnId(null);
                                      }}
                                    >
                                      Hide column
                                    </button>
                                  )}
                                </div>,
                                document.body,
                              )}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* On-demand single-column filter row */}
              {enableColumnFilters && activeFilterColumnId && !hasNoData && (
                <tr className="bg-slate-50 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  {visibleColumns.map((col) => (
                    <th key={col.id} className="px-1.5 py-0.5">
                      {col.filterable && col.id === activeFilterColumnId && (
                        <input
                          type={
                            (col as ColumnMeta).filterType === "number"
                              ? "number"
                              : (col as ColumnMeta).filterType === "date"
                                ? "date"
                                : "text"
                          }
                          className="w-full rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                          placeholder="Filter..."
                          value={filters[col.id] ?? ""}
                          onChange={(e) => {
                            setFilters((prev) => ({
                              ...prev,
                              [col.id]: e.target.value,
                            }));
                            setPageIndex(0);
                          }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              )}
            </thead>

            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-950 dark:divide-slate-800">
              {showSkeleton
                ? Array.from({ length: skeletonRowCount }).map(
                    (_, rowIndex) => (
                      <tr
                        key={`skeleton-${rowIndex}`}
                        className={`animate-pulse ${
                          enableRowStriping
                            ? rowIndex % 2 === 0
                              ? "bg-white dark:bg-slate-950"
                              : "bg-slate-50 dark:bg-slate-900"
                            : "bg-white dark:bg-slate-950"
                        }`}
                      >
                        {visibleColumns.map((col, colIndex) => {
                          const isFrozen = col.frozen === true;
                          const leftOffset = isFrozen
                            ? (frozenLefts[colIndex] ?? 0)
                            : undefined;
                          return (
                            <td
                              key={col.id}
                              className={`px-1.5 py-0.5 ${
                                isFrozen
                                  ? "sticky z-10 bg-white dark:bg-slate-950 border-r border-primary-100 dark:border-slate-700"
                                  : ""
                              }`}
                              style={{
                                width: columnWidths[col.id]
                                  ? `${columnWidths[col.id]}px`
                                  : col.width,
                                minWidth: col.minWidth,
                                maxWidth: col.maxWidth,
                                left: leftOffset,
                              }}
                            >
                              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  )
                : (() => {
                    const flatRows: (| { type: "group"; key: string; count: number }
                      | { type: "row"; data: T })[] = [];

                    if (groupedRows) {
                      groupedRows.forEach((g) => {
                        const isExpanded = expandedGroups.has(g.key);
                        flatRows.push({
                          type: "group",
                          key: g.key,
                          count: g.rows.length,
                        });
                        if (isExpanded) {
                          g.rows.forEach((r) =>
                            flatRows.push({ type: "row", data: r }),
                          );
                        }
                      });
                    } else {
                      rows.forEach((r) =>
                        flatRows.push({ type: "row", data: r }),
                      );
                    }

                    const renderable = enableVirtualization
                      ? flatRows.slice(
                          virtualRange.start,
                          Math.min(flatRows.length, virtualRange.end),
                        )
                      : flatRows;

                    const offsetTop =
                      enableVirtualization &&
                      virtualRange.offsetTop &&
                      flatRows.length
                        ? virtualRange.offsetTop
                        : 0;

                    return (
                      <>
                        {enableVirtualization && offsetTop > 0 && (
                          <tr style={{ height: `${offsetTop}px` }}>
                            <td
                              colSpan={
                                visibleColumns.length +
                                (enableRowSelection ? 1 : 0)
                              }
                            />
                          </tr>
                        )}
                        {renderable.map((entry, idx) => {
                          if (entry.type === "group") {
                            return (
                              <tr
                                key={`group-${entry.key}-${idx}`}
                                className="bg-slate-100 dark:bg-slate-900"
                                style={
                                  enableVirtualization && effectiveRowHeight
                                    ? { height: `${effectiveRowHeight}px` }
                                    : undefined
                                }
                              >
                                <td
                                  colSpan={
                                    visibleColumns.length +
                                    (enableRowSelection ? 1 : 0)
                                  }
                                  className="px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                                  onClick={() => {
                                    setExpandedGroups((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(entry.key)) {
                                        next.delete(entry.key);
                                      } else {
                                        next.add(entry.key);
                                      }
                                      return next;
                                    });
                                  }}
                                >
                                  {expandedGroups.has(entry.key) ? "▼" : "►"}{" "}
                                  {groupingField ?? "Group"}: {entry.key}{" "}
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ({entry.count} rows)
                                  </span>
                                </td>
                              </tr>
                            );
                          }

                          const row = entry.data;
                          const key = rowKey(row);
                          const handleClick = onRowClick
                            ? () => { onRowClick(row); }
                            : undefined;
                          const handleDoubleClick = onRowDoubleClick
                            ? () => { onRowDoubleClick(row); }
                            : undefined;
                          const isSelected = selectedRowIds.has(rowKey(row));

                          return (
                            <tr
                              key={key}
                              className={`transition-colors hover:bg-primary-50/60 dark:hover:bg-slate-800 ${
                                enableRowStriping
                                  ? "odd:bg-white even:bg-primary-50/40 dark:odd:bg-slate-950 dark:even:bg-slate-900"
                                  : "bg-white dark:bg-slate-950"
                              } ${
                                onRowClick || onRowDoubleClick
                                  ? "cursor-pointer"
                                  : ""
                              }`}
                              onClick={handleClick}
                              onDoubleClick={handleDoubleClick}
                              style={
                                enableVirtualization && effectiveRowHeight
                                  ? { height: `${effectiveRowHeight}px` }
                                  : undefined
                              }
                            >
                              {enableRowSelection && (
                                <td className="px-1.5 py-0.5 text-center align-middle bg-white dark:bg-slate-950 border-r border-primary-100 dark:border-slate-700">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                                    checked={isSelected}
                                    onClick={(e) => { e.stopPropagation(); }}
                                    onChange={(e) =>
                                      { setRowSelected(row, e.target.checked); }
                                    }
                                  />
                                </td>
                              )}
                              {visibleColumns.map((col, colIndex) => {
                                const isFrozen = col.frozen === true;
                                const leftOffset = isFrozen
                                  ? (frozenLefts[colIndex] ?? 0)
                                  : undefined;
                                return (
                                  <td
                                    key={col.id}
                                    className={cn(
                                      `px-1.5 py-0.5 text-xs text-slate-800 truncate dark:text-slate-100`,
                                      getColumnTextAlignClass(col.align),
                                      isFrozen
                                        ? "sticky z-10 bg-white dark:bg-slate-950 border-r border-primary-100 dark:border-slate-700"
                                        : ""
                                    )}
                                    style={{
                                      width: columnWidths[col.id]
                                        ? `${columnWidths[col.id]}px`
                                        : col.width,
                                      minWidth: col.minWidth,
                                      maxWidth: col.maxWidth,
                                      left: leftOffset,
                                    }}
                                  >
                                    {col.cell
                                      ? col.cell(
                                          row,
                                          (enableVirtualization
                                            ? virtualRange.start + idx
                                            : idx) +
                                            pageIndex *
                                              effectiveNumericPageSize,
                                        )
                                      : String(col.accessor(row) ?? "")}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        {enableVirtualization && flatRows.length > 0 && (
                          <tr
                            style={{
                              height: Math.max(
                                0,
                                effectiveRowHeight
                                  ? flatRows.length * effectiveRowHeight -
                                      virtualRange.end * effectiveRowHeight
                                  : 0,
                              ),
                            }}
                          >
                            <td
                              colSpan={
                                visibleColumns.length +
                                (enableRowSelection ? 1 : 0)
                              }
                            />
                          </tr>
                        )}
                      </>
                    );
                  })()}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      visibleColumns.length + (enableRowSelection ? 1 : 0)
                    }
                    className="px-3 py-4"
                  >
                    <EmptyState
                      title={emptyMessage}
                      description="Try adjusting filters, changing your search, or refreshing."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Center spinner loader overlay */}
        {isLoading && loadingMode === "spinner" && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 dark:bg-slate-950/70">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Progressive bottom loader */}
      {isLoading && loadingMode === "progress" && (
        <div className="h-1 w-full bg-gradient-to-l from-primary-500 via-analyze-400 to-primary-700 animate-pulse" />
      )}

      {enableStatusBar && (
        <CustomServerSideDataTableStatusBar
          aggregates={aggregates}
        />
      )}

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

      {/* Global interaction blocker while loading */}
      {isLoading && (
        <div className="pointer-events-auto absolute inset-0 z-50 bg-slate-200/5 backdrop-blur-[0.8px] cursor-not-allowed" />
      )}
    </div>
  );

  const tooltipPortal = (
    <CustomServerSideDataTableTooltipPortal tooltip={tooltipPosition} />
  );

  if (isFullscreen) {
    return (
      <>
        <DataTableFullscreenOverlay
          open={isFullscreen}
          onClose={() => { setIsFullscreen(false); }}
          isTogglingRef={isFullscreenTogglingRef}
        >
          {tableContent}
        </DataTableFullscreenOverlay>
        {tooltipPortal}
      </>
    );
  }

  return (
    <>
      {tableContent}
      {tooltipPortal}
    </>
  );
}
