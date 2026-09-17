// src/components/data-table/DataTable.tsx
// Further split candidate: table header/body JSX (~700 lines) → customDataTable/components/CustomDataTableTable.tsx
import React from "react";
import { createPortal } from "react-dom";
import {
  useDataTable,
  type ColumnDef,
  type ClientPageSizeOption,
} from "./partials/useDataTable";
import { buildClientPageSizeOptions } from "./partials/pageSizeOptionUtils";
import {
  EMPTY_COLUMN_VISIBILITY_MAP,
  resolveColumnVisibility,
  toggleVisibilityInMap,
  visibilityMapToHiddenColumnIds,
  type DataTableColumnVisibilityMap,
} from "./partials/columnVisibilitySettings";
import { showToast } from "@app/components/common/CustomToastMessage";

import { DataTableFullscreenOverlay } from "./partials/DataTableFullscreenOverlay";
import { cn } from "@app/utilities/cn";
import {
  themeDataTableHeadClass,
  themeDataTableShellClass,
  themeFormSectionTableSlotClass,
  resolveDataTablePortalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import {
  COMPACT_ACTION_ICON_TD,
  DATA_TABLE_BORDERED_LAYOUT_CLASS,
  DATA_TABLE_HEADER_CELL_BORDER_CLASS,
  DATA_TABLE_LAYOUT_CLASS,
  DATA_TABLE_SCROLL_BODY_Y_CLASS,
  DATA_TABLE_SCROLL_CONTAINER_CLASS,
  DATA_TABLE_HEADER_MENU_BTN_CLASS,
  DATA_TABLE_HEADER_MENU_ITEM_CLASS,
  DEFAULT_COMPACT_ACTION_COLUMN_IDS,
} from "./customDataTable/customDataTable.constants";
import {
  computeLockedColumnWidthPx,
  getColumnHeaderFlexAlignClass,
  getColumnTextAlignClass,
  getHeaderMenuPortalStyle,
  mergeColumnCellStyle as mergeColumnCellStyleUtil,
} from "./customDataTable/customDataTableColumnLayout.utils";
export type {
  CustomDataTableProps,
  DataTableColumnVisibilityMap,
  DataTableGroupHeaderCell,
  DataTableGroupHeaderRow,
} from "./customDataTable/CustomDataTable.types";
import type { CustomDataTableProps } from "./customDataTable/CustomDataTable.types";
import { CustomDataTableToolbar } from "./customDataTable/components/CustomDataTableToolbar";
import { CustomDataTablePagination } from "./customDataTable/components/CustomDataTablePagination";
import { CustomDataTableTooltipPortal } from "./customDataTable/components/CustomDataTableTooltipPortal";
import { CustomDataTableBodyCells } from "./customDataTable/components/CustomDataTableBodyCells";
import {
  buildAllBodyCells,
  buildHeaderFilterOccupancy,
  isHeaderFilterSlotOccupied,
  resolveMainHeaderCells,
} from "./customDataTable/dataTableCellSpan.utils";
import EmptyState from "@app/components/common/EmptyState";
import { DataTableSortIcon } from "./partials/DataTableSortIcon";
import { DataTableColumnFilterInput } from "./partials/DataTableColumnFilterInput";
import {
  buildHtmlTableFragment,
  resolveColumnsForExport,
  printHtmlTableFragment,
  resolveClientExportFileBase,
  resolveClientExportPrintTitle,
  runExportAfterPaint,
} from "./partials/tableExportUtils";
import { downloadTableCsv } from "./partials/tableCsvExport";

export function CustomDataTable<T>(props: CustomDataTableProps<T>) {
  const {
    columns,
    data,
    rowKey,
    initialSortBy,
    initialPageSize,
    pageSizeOptions,
    enablePagination = true,
    enableGroupingBy,
    enableGlobalSearch = true,
    enableExport = true,
    exportFileName,
    pageName,
    enableColumnManager = true,
    enableColumnSettings = false,
    columnVisibility,
    onColumnVisibilityChange,
    onColumnVisibilitySave,
    enableColumnActions = true,
    enableColumnFilters = true,
    enableRowStriping = true,
    enableFullscreenToggle = true,
    loading = false,
    loadingMode = "spinner",
    skeletonRowCount = 6,
    innerScroll = false,
    innerScrollMaxHeight = "480px",
    fillContainer = false,
    enableRowSelection = false,
    disableRowSelection = false,
    selectedRowIds: externalSelectedRowIds,
    isRowSelectable,
    selectionColumnHeaderLabel,
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    enableColumnReorder = false,
    density = "compact",
    compactActionColumnIds = DEFAULT_COMPACT_ACTION_COLUMN_IDS,
    emptyMessage = "No data available",
    emptyDescription,
    groupHeaderRows,
    showCellBorders = false,
    expandControls,
  } = props;

  /** Explicit opt-in only — persistence props are ignored when this is false. */
  const columnSettingsEnabled = enableColumnSettings;

  const cellPy = density === "comfortable" ? "py-2" : "py-0.5";

  const compactIconCellClass = (col: ColumnDef<T>) => {
    if (col.compactIcons === false) { return ""; }
    if (col.compactIcons === true || compactActionColumnIds.includes(col.id)) {
      return COMPACT_ACTION_ICON_TD;
    }
    return "";
  };

  /** Sticky / selection cells must track row striping (`group` on `<tr>`). This app has no dark
   * theme, so these are the same CSS-var tokens used everywhere else, not a raw Tailwind scale. */
  const frozenStripedCellClass =
    "sticky z-10 border-r border-[var(--line-soft)] group-odd:bg-[var(--surface)] group-even:bg-[var(--row-stripe)]";
  const selectionStripedCellClass =
    "border-r border-[var(--line-soft)] group-odd:bg-[var(--surface)] group-even:bg-[var(--row-stripe)]";
  const cellTextClass = "min-w-0 align-middle leading-snug";

  const exportFileBase = React.useMemo(
    () => resolveClientExportFileBase(exportFileName, pageName),
    [exportFileName, pageName],
  );

  const [globalSearch, setGlobalSearch] = React.useState("");
  const [activeFilterColumnId, setActiveFilterColumnId] = React.useState<
    string | null
  >(null);
  const [openMenuForColumnId, setOpenMenuForColumnId] = React.useState<
    string | null
  >(null);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = React.useState(false);
  /** Legacy immediate hide/show (enableColumnSettings === false). */
  const [legacyHiddenColumnIds, setLegacyHiddenColumnIds] = React.useState<
    string[]
  >([]);
  const [draftVisibility, setDraftVisibility] =
    React.useState<DataTableColumnVisibilityMap>({});
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isFullscreenTogglingRef = React.useRef(false);
  const isLoading = loading;
  const columnManagerRef = React.useRef<HTMLDivElement | null>(null);
  const headerMenuRef = React.useRef<HTMLDivElement | null>(null);
  const headerCellRefs = React.useRef<(HTMLTableCellElement | null)[]>([]);
  const selectionHeaderRef = React.useRef<HTMLTableCellElement | null>(null);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  /** Pixel widths from header measure; stable across sort so columns do not reflow. */
  const [lockedColumnWidths, setLockedColumnWidths] = React.useState<
    number[] | null
  >(null);
  const [lockedSelectionColumnWidth, setLockedSelectionColumnWidth] =
    React.useState<number | null>(null);
  const [columnWidthLockEpoch, setColumnWidthLockEpoch] = React.useState(0);
  const tableBodyRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[] | null>(null);
  const [selectedRowIds, setSelectedRowIds] = React.useState<
    Set<string | number>
  >(new Set());

  // Sync the controlled `selectedRowIds` prop into internal state during render rather than in an
  // effect — an effect body would paint the previous selection for one frame before resetting.
  const [renderedForExternalSelectedRowIds, setRenderedForExternalSelectedRowIds] =
    React.useState(externalSelectedRowIds);
  if (
    externalSelectedRowIds !== undefined &&
    renderedForExternalSelectedRowIds !== externalSelectedRowIds
  ) {
    setRenderedForExternalSelectedRowIds(externalSelectedRowIds);
    const items = Array.isArray(externalSelectedRowIds)
      ? externalSelectedRowIds
      : Array.from(externalSelectedRowIds);
    setSelectedRowIds(new Set(items));
  }
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

  const safeData = React.useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const effectiveInitialPageSize: ClientPageSizeOption = initialPageSize ?? 25;

  const resolvedPageSizeOptions = React.useMemo(
    () => buildClientPageSizeOptions(effectiveInitialPageSize, pageSizeOptions),
    [effectiveInitialPageSize, pageSizeOptions],
  );

  /** Grid / column-manager columns — excludes export-only fields. */
  const displayColumns = React.useMemo(
    () => columns.filter((c) => !c.exportOnly),
    [columns],
  );

  const columnIds = React.useMemo(
    () => displayColumns.map((c) => c.id),
    [displayColumns],
  );

  const lockedColumnIds = React.useMemo(
    () => displayColumns.filter((c) => c.hideable === false).map((c) => c.id),
    [displayColumns],
  );

  const hideableColumnIds = React.useMemo(
    () => displayColumns.filter((c) => c.hideable !== false).map((c) => c.id),
    [displayColumns],
  );

  const isVisibilityControlled =
    columnSettingsEnabled &&
    columnVisibility !== undefined &&
    onColumnVisibilityChange !== undefined;

  const [internalVisibility, setInternalVisibility] =
    React.useState<DataTableColumnVisibilityMap>(() =>
      resolveColumnVisibility(columnIds, lockedColumnIds, null),
    );

  // Re-derive internal visibility (uncontrolled mode) during render rather than in an effect,
  // sentinel-keyed on the combination of primitives that used to drive the effect's deps array.
  const internalVisibilitySyncKey = `${columnSettingsEnabled ? 1 : 0}:${isVisibilityControlled ? 1 : 0}:${columnIds.join("")}:${lockedColumnIds.join("")}`;
  const [renderedForInternalVisibilitySyncKey, setRenderedForInternalVisibilitySyncKey] =
    React.useState(internalVisibilitySyncKey);
  if (renderedForInternalVisibilitySyncKey !== internalVisibilitySyncKey) {
    setRenderedForInternalVisibilitySyncKey(internalVisibilitySyncKey);
    if (columnSettingsEnabled && !isVisibilityControlled) {
      setInternalVisibility((prev) =>
        resolveColumnVisibility(columnIds, lockedColumnIds, prev),
      );
    }
  }

  const appliedVisibility = React.useMemo(() => {
    if (!columnSettingsEnabled) { return EMPTY_COLUMN_VISIBILITY_MAP; }
    return isVisibilityControlled
      ? resolveColumnVisibility(columnIds, lockedColumnIds, columnVisibility)
      : internalVisibility;
  }, [
    columnSettingsEnabled,
    isVisibilityControlled,
    columnVisibility,
    internalVisibility,
    columnIds,
    lockedColumnIds,
  ]);

  const hiddenColumnIds = React.useMemo(() => {
    if (!columnSettingsEnabled) {
      return legacyHiddenColumnIds;
    }
    return visibilityMapToHiddenColumnIds(appliedVisibility);
  }, [columnSettingsEnabled, legacyHiddenColumnIds, appliedVisibility]);

  const orderedColumns = React.useMemo(() => {
    const baseOrder = columnOrder ?? displayColumns.map((c) => c.id);
    const byId = new Map(displayColumns.map((c) => [c.id, c]));
    return baseOrder
      .map((id) => byId.get(id))
      .filter((c): c is ColumnDef<T> => !!c);
  }, [displayColumns, columnOrder]);

  const visibleColumns = React.useMemo(() => {
    if (!columnSettingsEnabled) {
      return orderedColumns.filter(
        (c) => c.hideable === false || !legacyHiddenColumnIds.includes(c.id),
      );
    }
    return orderedColumns.filter((c) => appliedVisibility[c.id]);
  }, [
    columnSettingsEnabled,
    orderedColumns,
    legacyHiddenColumnIds,
    appliedVisibility,
  ]);

  const applyColumnVisibility = React.useCallback(
    (next: DataTableColumnVisibilityMap, options?: { persist?: boolean }) => {
      if (!columnSettingsEnabled) { return; }
      const normalized = resolveColumnVisibility(
        columnIds,
        lockedColumnIds,
        next,
      );
      if (isVisibilityControlled) {
        onColumnVisibilityChange?.(normalized);
      } else {
        setInternalVisibility(normalized);
      }
      if (options?.persist) {
        onColumnVisibilitySave?.(normalized);
      }
    },
    [
      columnSettingsEnabled,
      columnIds,
      lockedColumnIds,
      isVisibilityControlled,
      onColumnVisibilityChange,
      onColumnVisibilitySave,
    ],
  );

  const resetColumnManagerDraft = React.useCallback(() => {
    if (!columnSettingsEnabled) { return; }
    setDraftVisibility({ ...appliedVisibility });
  }, [columnSettingsEnabled, appliedVisibility]);

  const openColumnManager = React.useCallback(() => {
    if (!columnSettingsEnabled) {
      setIsColumnManagerOpen((prev) => !prev);
      return;
    }
    setDraftVisibility({ ...appliedVisibility });
    setIsColumnManagerOpen((prev) => !prev);
  }, [columnSettingsEnabled, appliedVisibility]);

  const handleColumnManagerUpdate = React.useCallback(() => {
    applyColumnVisibility(draftVisibility, {
      persist: Boolean(onColumnVisibilitySave),
    });
    setIsColumnManagerOpen(false);
  }, [applyColumnVisibility, draftVisibility, onColumnVisibilitySave]);

  const handleColumnManagerCancel = React.useCallback(() => {
    resetColumnManagerDraft();
    setIsColumnManagerOpen(false);
  }, [resetColumnManagerDraft]);

  const columnLayoutSignature = React.useMemo(
    () =>
      `${enableRowSelection ? 1 : 0}:${selectionColumnHeaderLabel ?? ""}:${visibleColumns.map((c) => c.id).join("\u0001")}`,
    [enableRowSelection, selectionColumnHeaderLabel, visibleColumns],
  );

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (timeoutId) { clearTimeout(timeoutId); }
      timeoutId = setTimeout(() => {
        setLockedColumnWidths(null);
        setLockedSelectionColumnWidth(null);
        setColumnWidthLockEpoch((e) => e + 1);
      }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (timeoutId) { clearTimeout(timeoutId); }
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const hasColumnWidthLocks =
    lockedColumnWidths !== null &&
    lockedColumnWidths.length === visibleColumns.length;

  const getLockedDataColumnWidthPx = (
    col: ColumnDef<T>,
    colIndex: number,
  ): number | null => {
    if (!hasColumnWidthLocks || lockedColumnWidths === null) { return null; }
    const measured = lockedColumnWidths[colIndex];
    return computeLockedColumnWidthPx(col, measured);
  };

  const mergeColumnCellStyle = (
    col: ColumnDef<T>,
    colIndex: number,
    leftOffset: number | undefined,
  ): React.CSSProperties =>
    mergeColumnCellStyleUtil(
      col,
      col.frozen ? getLockedDataColumnWidthPx(col, colIndex) : null,
      leftOffset,
  );

  // When all columns are hidden, clear the locked widths during render (sentinel-keyed on the
  // same layout signature the effect below uses) rather than as a synchronous effect reset.
  const [renderedForEmptyColumnsLayoutSignature, setRenderedForEmptyColumnsLayoutSignature] =
    React.useState<string | null>(null);
  if (
    !visibleColumns.length &&
    renderedForEmptyColumnsLayoutSignature !== columnLayoutSignature
  ) {
    setRenderedForEmptyColumnsLayoutSignature(columnLayoutSignature);
    setLockedColumnWidths((prev) => (prev === null ? prev : null));
    setLockedSelectionColumnWidth((prev) => (prev === null ? prev : null));
  }

  // Snapshot header widths when layout changes (not when sort changes) — stops column "dance" on
  // sort. `columnLayoutSignature` is a deliberate proxy for "did the set/order/visibility of
  // columns change" — adding `visibleColumns` itself would re-run this on every render where its
  // array identity changes for unrelated reasons (e.g. a sort-triggered re-render), reintroducing
  // the exact column-width "dance" this effect was written to stop.
  React.useLayoutEffect(() => {
    if (!visibleColumns.length) { return; }

    const nextWidths = visibleColumns.map((col, index) => {
      const el = headerCellRefs.current[index];
      const rectW = el ? Math.ceil(el.getBoundingClientRect().width) : 0;
      return computeLockedColumnWidthPx(col, rectW);
    });

    const headersNotMeasured = visibleColumns.every((_, index) => {
      const el = headerCellRefs.current[index];
      return !el || el.getBoundingClientRect().width < 1;
    });
    if (headersNotMeasured) { return; }

    if (enableRowSelection) {
      const selEl = selectionHeaderRef.current;
      const selW = selEl
        ? Math.max(Math.ceil(selEl.getBoundingClientRect().width), 32)
        : 32;
      setLockedSelectionColumnWidth((prev) => (prev === selW ? prev : selW));
    } else {
      setLockedSelectionColumnWidth((prev) => (prev === null ? prev : null));
    }

    setLockedColumnWidths((prev) => {
      if (
        prev?.length === nextWidths.length &&
        prev.every((p, i) => Math.abs(p - nextWidths[i]) <= 1)
      ) {
        return prev;
      }
      return nextWidths;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above the effect
  }, [columnLayoutSignature, columnWidthLockEpoch, enableRowSelection]);

  // Runtime-computed left offsets for frozen columns (based on actual rendered widths)
  const [frozenLefts, setFrozenLefts] = React.useState<(number | null)[]>(
    [],
  );

  /** Header menu / legacy Columns popover: immediate hide/show unless advanced draft mode. */
  const toggleColumnVisibility = (columnId: string) => {
    if (!columnSettingsEnabled) {
      const isHidden = legacyHiddenColumnIds.includes(columnId);
      if (isHidden) {
        setLegacyHiddenColumnIds((prev) =>
          prev.filter((id) => id !== columnId),
        );
        return;
      }

      const col = displayColumns.find((c) => c.id === columnId);
      if (!col || col.hideable === false) { return; }

      const visibleHideableCount = displayColumns.filter(
        (c) => c.hideable !== false && !legacyHiddenColumnIds.includes(c.id),
      ).length;
      if (visibleHideableCount <= 1) { return; }

      setFilters((filterPrev) => {
        if (!filterPrev[columnId]) { return filterPrev; }
        const next = { ...filterPrev };
        delete next[columnId];
        return next;
      });
      setActiveFilterColumnId((filterColId) =>
        filterColId === columnId ? null : filterColId,
      );
      setLegacyHiddenColumnIds((prev) => [...prev, columnId]);
      return;
    }

    const isCurrentlyVisible = appliedVisibility[columnId];
    const next = toggleVisibilityInMap(appliedVisibility, columnId, {
      lockedColumnIds,
      hideableColumnIds,
    });
    if (isCurrentlyVisible && !next[columnId]) {
      setFilters((filterPrev) => {
        if (!filterPrev[columnId]) { return filterPrev; }
        const cleaned = { ...filterPrev };
        delete cleaned[columnId];
        return cleaned;
      });
      setActiveFilterColumnId((filterColId) =>
        filterColId === columnId ? null : filterColId,
      );
    }
    applyColumnVisibility(next, {
      persist: Boolean(onColumnVisibilitySave),
    });
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    setColumnOrder((prev) => {
      const base = prev ?? displayColumns.map((c) => c.id);
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

  const setRowSelected = (row: T, selected: boolean) => {
    const key = rowKey(row, safeData.indexOf(row));
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(key);
      } else {
        next.delete(key);
      }
      if (onSelectionChange) {
        const selectedRows = safeData.filter((r, i) => next.has(rowKey(r, i)));
        onSelectionChange(selectedRows);
      }
      return next;
    });
  };

  const filteredData = React.useMemo(() => {
    if (!globalSearch) { return safeData; }
    const needle = globalSearch.toLowerCase();

    // Search only in currently visible columns for a smoother UX
    const searchColumns = visibleColumns.length > 0 ? visibleColumns : displayColumns;

    return safeData.filter((row) =>
      searchColumns.some((col) => {
        try {
          const value = col.accessor(row);
          if (value == null) { return false; }
          return String(value).toLowerCase().includes(needle);
        } catch {
          return false;
        }
      }),
    );
  }, [safeData, displayColumns, visibleColumns, globalSearch]);

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
  // the same layout signature) rather than as a synchronous effect reset.
  const [renderedForEmptyFrozenLeftsSignature, setRenderedForEmptyFrozenLeftsSignature] =
    React.useState<string | null>(null);
  if (
    !visibleColumns.length &&
    renderedForEmptyFrozenLeftsSignature !== columnLayoutSignature
  ) {
    setRenderedForEmptyFrozenLeftsSignature(columnLayoutSignature);
    setFrozenLefts((prev) => (prev.length === 0 ? prev : []));
  }

  // Measure actual widths for frozen columns so multiple frozen columns don't overlap
  React.useLayoutEffect(() => {
    if (!visibleColumns.length) { return; }

    const widths = visibleColumns.map((col, index) => {
      if (
        lockedColumnWidths?.length === visibleColumns.length
      ) {
        const measured = lockedColumnWidths[index];
        return computeLockedColumnWidthPx(col, measured);
      }
      const el = headerCellRefs.current[index];
      const domWidth = el?.offsetWidth ?? 0;
      if (domWidth > 0) { return computeLockedColumnWidthPx(col, domWidth); }
      const parsed =
        (col.width && parseFloat(col.width)) ||
        (col.minWidth && parseFloat(col.minWidth)) ||
        0;
      return computeLockedColumnWidthPx(col, parsed);
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
  }, [visibleColumns, hiddenColumnIds, lockedColumnWidths]);

  // Close column header three-dot menu when clicking outside
  React.useEffect(() => {
    if (!openMenuForColumnId) { return; }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) { return; }
      if (headerMenuRef.current?.contains(target)) { return; }
      if (
        target instanceof Element &&
        target.closest("[data-datatable-header-menu-trigger]")
      ) {
        return;
      }
      setOpenMenuForColumnId(null);
      setHeaderMenuPosition(null);
    }

    // Defer so the opening click does not immediately close the menu.
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

  const {
    pageRows,
    sortedRows,
    totalRows,
    pageIndex,
    pageSize,
    effectivePageSize,
    pageCount,
    sortState,
    filters,
    setSortState,
    setFilters,
    setPageIndex,
    setPageSize,
    grouped,
  } = useDataTable<T>({
    data: filteredData,
    columns: displayColumns,
    initialSortBy,
    initialPageSize: effectiveInitialPageSize,
    enableGroupingBy,
  });

  const displayRows = enablePagination ? pageRows : sortedRows;
  const resolveGlobalRowIndex = React.useCallback(
    (rowIndex: number) =>
      enablePagination ? rowIndex + pageIndex * effectivePageSize : rowIndex,
    [enablePagination, pageIndex, effectivePageSize],
  );

  const resolvedMainHeaderCells = React.useMemo(
    () => resolveMainHeaderCells(visibleColumns),
    [visibleColumns],
  );

  const headerFilterOccupancy = React.useMemo(
    () => buildHeaderFilterOccupancy(visibleColumns),
    [visibleColumns],
  );

  const dataHeaderRowCount = (groupHeaderRows?.length ?? 0) + 1;

  const bodyCellMatrix = React.useMemo(() => {
    return buildAllBodyCells(visibleColumns, displayRows, resolveGlobalRowIndex);
  }, [visibleColumns, displayRows, resolveGlobalRowIndex]);

  const hasNoData = !isLoading && displayRows.length === 0;

  const hasActiveColumnFilters = React.useMemo(
    () => Object.values(filters).some((value) => value?.trim()),
    [filters],
  );

  /** Filter row is opt-in via column header menu — not shown for every column by default. */
  const showColumnFilterRow =
    enableColumnFilters &&
    activeFilterColumnId !== null &&
    !isLoading &&
    safeData.length > 0;

  const clearAllColumnFilters = React.useCallback(() => {
    setFilters({});
    setPageIndex(0);
    setActiveFilterColumnId(null);
  }, [setFilters, setPageIndex]);

  const handleColumnFilterChange = React.useCallback(
    (columnId: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [columnId]: value,
      }));
      setPageIndex(0);
    },
    [setFilters, setPageIndex],
  );

  const toggleSortForColumn = (columnId: string) => {
    setSortState((prev) => {
      if (prev?.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnId, direction: "desc" };
      }
      return null;
    });
  };

  const allColumnsExportRef = React.useRef(columns);
  const visibleColumnsExportRef = React.useRef(visibleColumns);
  const sortedRowsExportRef = React.useRef(sortedRows);
  React.useLayoutEffect(() => {
    allColumnsExportRef.current = columns;
    visibleColumnsExportRef.current = visibleColumns;
    sortedRowsExportRef.current = sortedRows;
  }, [columns, visibleColumns, sortedRows]);

  const [exportBusy, setExportBusy] = React.useState(false);
  const exportBusyRef = React.useRef(false);

  /** Builds CSV/HTML only on click; refs avoid stale data without per-render memoization of export blobs. */
  const runClientExport = React.useCallback((task: () => void | Promise<void>) => {
    if (exportBusyRef.current) { return; }
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

  const handleExportCsv = React.useCallback(() => {
    runClientExport(() => {
      const cols = resolveExportColumns();
      downloadTableCsv(
        cols,
        sortedRowsExportRef.current,
        `${exportFileBase}.csv`,
        { title: resolveClientExportPrintTitle(exportFileBase) },
      );
    });
  }, [exportFileBase, runClientExport, resolveExportColumns]);

  const handleExportExcel = React.useCallback(() => {
    // exceljs is a large dependency — load it only when Excel export is actually used.
    runClientExport(async () => {
      const { downloadExcelXlsx } = await import("./partials/tableExcelExport");
      downloadExcelXlsx(
        resolveExportColumns(),
        sortedRowsExportRef.current,
        `${exportFileBase}.xlsx`,
        { title: resolveClientExportPrintTitle(exportFileBase) },
      );
    });
  }, [exportFileBase, runClientExport, resolveExportColumns]);

  const handleExportPrint = React.useCallback(() => {
    runClientExport(() => {
      const cols = resolveExportColumns();
      const html = buildHtmlTableFragment(cols, sortedRowsExportRef.current);
      printHtmlTableFragment(
        html,
        resolveClientExportPrintTitle(exportFileBase),
      );
    });
  }, [exportFileBase, runClientExport, resolveExportColumns]);

  const canExport = sortedRows.length > 0;
  const useFillLayout = fillContainer && innerScroll && !isFullscreen;

  // Extract table content to reuse in both normal and fullscreen modes
  const tableContent = (
    <div
      ref={tableContainerRef}
      data-slot="section-table"
      className={cn(
        themeDataTableShellClass,
        themeFormSectionTableSlotClass,
        "min-w-0 overflow-hidden",
        isFullscreen
          ? "flex max-h-[95vh] w-full max-w-[95vw] flex-col"
          : "max-w-full",
        useFillLayout && "flex max-h-full min-h-0 flex-col",
      )}
    >
      <div className={cn(useFillLayout && "shrink-0")}>
        <CustomDataTableToolbar
          enableExport={enableExport}
          exportBusy={exportBusy}
          canExport={canExport}
          handleExportExcel={handleExportExcel}
          handleExportPrint={handleExportPrint}
          handleExportCsv={handleExportCsv}
          enableColumnManager={enableColumnManager}
          columnManagerRef={columnManagerRef}
          hiddenColumnIds={hiddenColumnIds}
          openColumnManager={openColumnManager}
          isColumnManagerOpen={isColumnManagerOpen}
          columnSettingsEnabled={columnSettingsEnabled}
          orderedColumns={orderedColumns}
          draftVisibility={draftVisibility}
          appliedVisibility={appliedVisibility}
          hideableColumnIds={hideableColumnIds}
          lockedColumnIds={lockedColumnIds}
          enableColumnReorder={enableColumnReorder}
          setDraftVisibility={setDraftVisibility}
          handleColumnManagerCancel={handleColumnManagerCancel}
          handleColumnManagerUpdate={handleColumnManagerUpdate}
          moveColumn={moveColumn}
          legacyHiddenColumnIds={legacyHiddenColumnIds}
          columns={displayColumns}
          setLegacyHiddenColumnIds={setLegacyHiddenColumnIds}
          toggleColumnVisibility={toggleColumnVisibility}
          enableFullscreenToggle={enableFullscreenToggle}
          isFullscreen={isFullscreen}
          isFullscreenTogglingRef={isFullscreenTogglingRef}
          setIsFullscreen={setIsFullscreen}
          enableGlobalSearch={enableGlobalSearch}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          setPageIndex={setPageIndex}
          expandControls={expandControls}
        />
      </div>

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
            : innerScroll || isFullscreen
              ? DATA_TABLE_SCROLL_BODY_Y_CLASS
              : undefined,
          isLoading &&
          (loadingMode === "spinner" || loadingMode === "progress") &&
          "min-h-[220px]",
          isFullscreen && "min-h-0 flex-1",
          // Cap to parent: grow with rows, shrink+scroll only when overflowing.
          useFillLayout && "min-h-0 shrink",
        )}
        style={
          useFillLayout
            ? undefined
            : innerScroll && !isLoading
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
        {/* If, for some reason, all columns are hidden, show a friendly message instead of a broken table */}
        {visibleColumns.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
            All columns are hidden. Use the{" "}
            <span className="font-medium">Columns</span> menu to show at least
            one column.
          </div>
        ) : (
          <table
            ref={tableRef}
            className={cn(
              DATA_TABLE_LAYOUT_CLASS,
              showCellBorders && DATA_TABLE_BORDERED_LAYOUT_CLASS,
            )}
          >
            {pageName ? <caption className="sr-only">{pageName}</caption> : null}
            <thead
              className={cn(
                themeDataTableHeadClass,
                innerScroll ? "sticky top-0 z-30" : "",
                showCellBorders && "[&_th]:border [&_th]:border-slate-400/85 dark:[&_th]:border-slate-500/80",
              )}
            >
              {groupHeaderRows?.map((groupRow, groupRowIndex) => (
                <tr key={`group-header-${groupRowIndex}`}>
                  {enableRowSelection && groupRowIndex === 0 && (
                    <th
                      ref={(el) => {
                        selectionHeaderRef.current = el;
                      }}
                      rowSpan={dataHeaderRowCount}
                      className={cn(
                        "px-1.5 py-0.5 text-center align-middle text-[11px] font-semibold text-primary-900 select-none dark:text-primary-100 bg-primary-100/95 dark:bg-primary-950/55 border-r border-primary-200/90 dark:border-primary-800/60",
                        selectionColumnHeaderLabel
                          ? "max-w-[10rem] normal-case"
                          : "w-8 py-0.5 uppercase tracking-wide",
                        showCellBorders && DATA_TABLE_HEADER_CELL_BORDER_CLASS,
                      )}
                      style={
                        lockedSelectionColumnWidth != null
                          ? {
                            width: lockedSelectionColumnWidth,
                            minWidth: lockedSelectionColumnWidth,
                          }
                          : undefined
                      }
                    >
                      {selectionColumnHeaderLabel ? (
                        <span className="block max-w-[12rem] text-left leading-snug break-words whitespace-normal sm:max-w-[14rem]">
                          {selectionColumnHeaderLabel}
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          disabled={disableRowSelection}
                          className={`h-3 w-3 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-600 ${disableRowSelection
                            ? "opacity-50 cursor-not-allowed bg-slate-100"
                            : "text-primary-600"
                            }`}
                          checked={
                            displayRows.length > 0 &&
                            displayRows.every((r, i) =>
                              selectedRowIds.has(rowKey(r, i)),
                            )
                          }
                          onChange={(e) => {
                            if (disableRowSelection) { return; }
                            const checked = e.target.checked;
                            displayRows.forEach((r) => { setRowSelected(r, checked); },
                            );
                          }}
                        />
                      )}
                    </th>
                  )}
                  {groupRow.cells.map((cell) => (
                    <th
                      key={cell.key}
                      colSpan={cell.colSpan && cell.colSpan > 1 ? cell.colSpan : undefined}
                      rowSpan={cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      className={cn(
                        "px-1.5 py-1 text-[11px] font-semibold text-primary-900 dark:text-primary-100 bg-primary-100/95 dark:bg-primary-950/55 align-middle",
                        getColumnTextAlignClass(cell.align),
                        showCellBorders && DATA_TABLE_HEADER_CELL_BORDER_CLASS,
                        cell.className,
                      )}
                    >
                      {cell.content}
                    </th>
                  ))}
                </tr>
              ))}

              {/* Header row */}
              <tr>
                {enableRowSelection && !groupHeaderRows?.length && (
                  <th
                    ref={(el) => {
                      selectionHeaderRef.current = el;
                    }}
                    className={`px-1.5 py-0.5 text-center align-middle text-[11px] font-semibold text-primary-900 select-none dark:text-primary-100 bg-primary-100/95 dark:bg-primary-950/55 border-r border-primary-200/90 dark:border-primary-800/60 ${selectionColumnHeaderLabel
                        ? "max-w-[10rem] normal-case"
                        : "w-8 py-0.5 uppercase tracking-wide"
                    }`}
                    style={
                      lockedSelectionColumnWidth != null
                        ? {
                            width: lockedSelectionColumnWidth,
                            minWidth: lockedSelectionColumnWidth,
                          }
                        : undefined
                    }
                  >
                    {selectionColumnHeaderLabel ? (
                      <span className="block max-w-[12rem] text-left leading-snug break-words whitespace-normal sm:max-w-[14rem]">
                        {selectionColumnHeaderLabel}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        disabled={disableRowSelection}
                        className={`h-3 w-3 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-600 ${disableRowSelection
                          ? "opacity-50 cursor-not-allowed bg-slate-100"
                          : "text-primary-600"
                          }`}
                        checked={
                          displayRows.length > 0 &&
                          displayRows
                            .filter((r) => !isRowSelectable || isRowSelectable(r))
                            .every((r, i) => selectedRowIds.has(rowKey(r, i)))
                        }
                        onChange={(e) => {
                          if (disableRowSelection) { return; }
                          const checked = e.target.checked;
                          displayRows.forEach((r) => {
                            if (!isRowSelectable || isRowSelectable(r)) {
                              setRowSelected(r, checked);
                            }
                          });
                        }}
                      />
                    )}
                  </th>
                )}
                {resolvedMainHeaderCells.map(
                  ({ column: col, columnIndex: colIndex, colSpan, rowSpan }) => {
                  const isSorted =
                      sortState?.columnId === col.id
                      ? sortState.direction
                      : null;
                    const isFilterOpen =
                      activeFilterColumnId === col.id ||
                      Boolean(filters[col.id]?.trim());
                  const isMenuOpen = openMenuForColumnId === col.id;

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
                        colSpan={colSpan > 1 ? colSpan : undefined}
                        rowSpan={rowSpan > 1 ? rowSpan : undefined}
                        scope="col"
                        aria-sort={
                          col.sortable
                            ? isSorted === "asc"
                              ? "ascending"
                              : isSorted === "desc"
                                ? "descending"
                                : "none"
                            : undefined
                        }
                      ref={(el) => {
                        headerCellRefs.current[colIndex] = el;
                      }}
                        className={cn(
                          // Solid (not tinted) background — a semi-transparent header lets content
                          // scrolling underneath the frozen column show through and overlap its text.
                          `px-1.5 py-0.5 text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide select-none bg-[var(--table-header-bg)] align-middle ${getColumnTextAlignClass(col.align)}`,
                        isFrozen
                          ? "sticky z-20 border-r border-[var(--table-header-border)] bg-[var(--table-header-bg)]"
                            : "",
                          showCellBorders && DATA_TABLE_HEADER_CELL_BORDER_CLASS,
                          col.className,
                          col.headerClassName,
                        )}
                      style={mergeColumnCellStyle(col, colIndex, leftOffset)}
                    >
                      <div className="flex w-full min-h-0 items-center justify-between gap-1">
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
                              "flex min-w-0 flex-1 items-center gap-1",
                              col.align === "right" && "justify-end",
                              col.align === "center" && "justify-center",
                              col.sortable && !hasNoData
                                ? "cursor-pointer"
                                : "cursor-default",
                            )}
                          onClick={() => {
                              if (!col.sortable || hasNoData) { return; }
                            toggleSortForColumn(col.id);
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
                          {col.headerNode != null ? (
                            <span
                              className={cn(
                                "flex min-w-0 break-words whitespace-normal leading-snug",
                                col.align === "right"
                                  ? "min-w-0 flex-1 text-right"
                                  : col.align === "center"
                                    ? "w-full flex-1 justify-center text-center"
                                    : "flex-1 text-left",
                                getColumnHeaderFlexAlignClass(col.align),
                              )}
                            >
                              {col.headerNode}
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "leading-snug break-words whitespace-normal",
                                col.align === "right"
                                  ? "min-w-0 flex-1 text-right"
                                  : "flex-1 text-left",
                              )}
                            >
                              {col.header}
                            </span>
                          )}
                            {col.sortable && !hasNoData && (
                            <span
                                className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                              aria-hidden
                            >
                                <DataTableSortIcon direction={isSorted} />
                            </span>
                          )}
                        </button>

                        {/* Column actions menu (three dots) */}
                          {hasHeaderMenu && !hasNoData && (
                          <div
                            className={cn(
                              "flex shrink-0 items-center justify-end",
                              isMenuOpen ? "relative z-40" : "relative",
                            )}
                          >
                            <button
                              type="button"
                              data-datatable-header-menu-trigger=""
                                className={cn(
                                  DATA_TABLE_HEADER_MENU_BTN_CLASS,
                                  isFilterOpen && "bg-[var(--table-header-hover)]",
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
                                    "fixed w-32 rounded-md border border-[var(--line)] bg-[var(--surface)] py-1 text-xs shadow-lg",
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
                                          "cursor-not-allowed text-[var(--text-faint)]",
                                      )}
                                    onClick={() => {
                                        if (!col.sortable) { return; }
                                      toggleSortForColumn(col.id);
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

                                  {/* Hide column */}
                                  {hideable && (
                                    <button
                                      type="button"
                                        className={DATA_TABLE_HEADER_MENU_ITEM_CLASS}
                                      onClick={() => {
                                        // Clear per-column filter when hiding
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

              {/* On-demand single-column filter row (via column ⋮ menu → Filter) */}
              {showColumnFilterRow && (
                <tr className="bg-[var(--surface-muted)] border-t border-[var(--line)]">
                  {enableRowSelection && (
                    <th
                      className="px-1.5 py-0.5"
                      aria-hidden
                      style={
                        lockedSelectionColumnWidth != null
                          ? {
                              width: lockedSelectionColumnWidth,
                              minWidth: lockedSelectionColumnWidth,
                            }
                          : undefined
                      }
                    />
                  )}
                  {visibleColumns.map((col, colIndex) => {
                    if (isHeaderFilterSlotOccupied(headerFilterOccupancy, colIndex)) {
                      return null;
                    }
                    return (
                      <th
                        key={col.id}
                        className={cn(
                          "px-1.5 py-0.5 align-top",
                          showCellBorders && DATA_TABLE_HEADER_CELL_BORDER_CLASS,
                        )}
                      >
                        {col.filterable && col.id === activeFilterColumnId ? (
                          <DataTableColumnFilterInput
                            value={filters[col.id] ?? ""}
                            onChange={(value) => {
                              handleColumnFilterChange(col.id, value);
                            }}
                            placeholder={`Filter ${col.header}…`}
                            aria-label={`Filter ${col.header}`}
                            autoFocus
                          />
                        ) : null}
                    </th>
                    );
                  })}
                </tr>
              )}
            </thead>

            <tbody className="bg-[var(--surface)] divide-y divide-[var(--line-soft)]">
              {/* Skeleton rows while loading */}
              {isLoading && loadingMode === "skeleton"
                ? Array.from({ length: skeletonRowCount }).map(
                    (_, rowIndex) => (
                      <tr
                        key={`skeleton-${rowIndex}`}
                      className={`group animate-pulse ${enableRowStriping
                            ? rowIndex % 2 === 0
                              ? "bg-[var(--surface)]"
                              : "bg-[var(--surface-muted)]"
                            : "bg-[var(--surface)]"
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
                            className={`px-1.5 ${cellPy} ${cellTextClass} ${isFrozen ? frozenStripedCellClass : ""
                              }`}
                              style={mergeColumnCellStyle(
                                col,
                                colIndex,
                                leftOffset,
                              )}
                            >
                              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  )
                : /* Optional grouping header rows */ enableGroupingBy &&
                    grouped
                  ? Array.from(grouped.entries()).map(([groupKey, rows]) => (
                      <React.Fragment key={groupKey}>
                        <tr className="bg-[var(--surface-muted)]">
                          <td
                            colSpan={
                              visibleColumns.length +
                              (enableRowSelection ? 1 : 0)
                            }
                            className="px-1.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]"
                          >
                            {enableGroupingBy}:{" "}
                            <strong className="text-[var(--text-primary)]">
                              {groupKey}
                            </strong>{" "}
                            <span className="ml-1 text-[var(--text-muted)]">
                              ({rows.length} rows)
                            </span>
                          </td>
                        </tr>
                      {(() => {
                        const groupBodyCells = buildAllBodyCells(
                          visibleColumns,
                          rows,
                          (idx) => idx,
                        );
                        return rows.map((row, rowIndex) => {
                          const key = rowKey(row, rowIndex);
                          return (
                            <tr
                              key={key}
                              className={`group transition-colors hover:bg-[var(--hover)] ${enableRowStriping
                                  ? "odd:bg-[var(--surface)] even:bg-[var(--row-stripe)]"
                                  : "bg-[var(--surface)]"
                              }`}
                            >
                              <CustomDataTableBodyCells
                                resolvedCells={groupBodyCells[rowIndex] ?? []}
                                row={row}
                                rowIndex={rowIndex}
                                frozenLefts={frozenLefts}
                                cellPy={cellPy}
                                cellTextClass={cellTextClass}
                                frozenStripedCellClass={frozenStripedCellClass}
                                compactIconCellClass={compactIconCellClass}
                                compactActionColumnIds={compactActionColumnIds}
                                showCellBorders={showCellBorders}
                                resolveGlobalRowIndex={(idx) => idx}
                              />
                            </tr>
                          );
                        });
                      })()}
                      </React.Fragment>
                    ))
                  : displayRows.map((row, rowIndex) => {
                      const key = rowKey(row, rowIndex);
                      const handleClick = onRowClick
                      ? () => { onRowClick(row); }
                        : undefined;
                      const handleDoubleClick = onRowDoubleClick
                      ? () => { onRowDoubleClick(row); }
                        : undefined;
                      const isSelected = selectedRowIds.has(
                        rowKey(row, rowIndex),
                      );
                      return (
                        <tr
                          key={key}
                        className={`group transition-colors hover:bg-[var(--hover)] ${enableRowStriping
                              ? "odd:bg-[var(--surface)] even:bg-[var(--row-stripe)]"
                              : "bg-[var(--surface)]"
                          } ${onRowClick || onRowDoubleClick
                              ? "cursor-pointer"
                              : ""
                          }`}
                          onClick={handleClick}
                          onDoubleClick={handleDoubleClick}
                        >
                          {enableRowSelection && (
                            <td
                              className={`px-1.5 ${cellPy} text-center align-middle ${selectionStripedCellClass}`}
                              style={
                                lockedSelectionColumnWidth != null
                                  ? {
                                      width: lockedSelectionColumnWidth,
                                      minWidth: lockedSelectionColumnWidth,
                                    }
                                  : undefined
                              }
                            >
                              {(() => {
                                const isRowDisabled = disableRowSelection || (isRowSelectable ? !isRowSelectable(row) : false);
                                return (
                                  <input
                                    type="checkbox"
                                    disabled={isRowDisabled}
                                    className={`h-3 w-3 rounded border-slate-300 focus:ring-primary-500 dark:border-slate-600 ${isRowDisabled
                                      ? "cursor-not-allowed bg-slate-100 opacity-50"
                                      : "text-primary-600"
                                      }`}
                                    checked={isSelected}
                                    onClick={(e) => { e.stopPropagation(); }}
                                    onChange={(e) => {
                                      if (isRowDisabled) { return; }
                                      setRowSelected(row, e.target.checked);
                                    }}
                                  />
                                );
                              })()}
                            </td>
                          )}
                        <CustomDataTableBodyCells
                          resolvedCells={bodyCellMatrix[rowIndex] ?? []}
                          row={row}
                          rowIndex={rowIndex}
                          frozenLefts={frozenLefts}
                          cellPy={cellPy}
                          cellTextClass={cellTextClass}
                          frozenStripedCellClass={frozenStripedCellClass}
                          compactIconCellClass={compactIconCellClass}
                          compactActionColumnIds={compactActionColumnIds}
                          showCellBorders={showCellBorders}
                          resolveGlobalRowIndex={resolveGlobalRowIndex}
                        />
                        </tr>
                      );
                    })}

              {!isLoading && displayRows.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      visibleColumns.length + (enableRowSelection ? 1 : 0)
                    }
                    className="px-3 py-4"
                  >
                    <EmptyState
                      title={
                        hasActiveColumnFilters || globalSearch.trim()
                          ? "No matching records"
                          : emptyMessage
                      }
                      description={
                        hasActiveColumnFilters || globalSearch.trim()
                          ? "No rows match the current search or column filters. Clear filters or broaden your search to see results."
                          : emptyDescription !== undefined
                            ? emptyDescription || undefined
                            : "Try adjusting filters, changing your search, or updating the date range to see results here."
                      }
                      action={
                        hasActiveColumnFilters ? (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary-muted)]"
                            onClick={clearAllColumnFilters}
                          >
                            Clear column filters
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Center spinner loader overlay */}
        {isLoading && loadingMode === "spinner" && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[var(--surface)]/70">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        )}

        {/* Progressive 'in-progress' overlay with spinner */}
        {isLoading && loadingMode === "progress" && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[var(--surface)]/75">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                Loading data...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progressive bottom loader */}
      {isLoading && loadingMode === "progress" && (
        <div className="h-1 w-full bg-gradient-to-l from-primary-500 via-analyze-400 to-primary-700 animate-pulse" />
      )}

      {enablePagination && (
        <div className={cn(useFillLayout && "shrink-0")}>
          <CustomDataTablePagination
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={pageCount}
            totalRows={totalRows}
            resolvedPageSizeOptions={resolvedPageSizeOptions}
            setPageSize={setPageSize}
            setPageIndex={setPageIndex}
          />
        </div>
      )}

      {/* Global interaction blocker while loading (prevents any clicks) */}
      {isLoading && (
        <div className="pointer-events-auto absolute inset-0 z-50 bg-slate-200/5 backdrop-blur-[0.8px] cursor-not-allowed" />
      )}
    </div>
  );

  const tooltipPortal = (
    <CustomDataTableTooltipPortal tooltip={tooltipPosition} />
  );

  // Render fullscreen in portal to avoid parent container constraints (e.g., CommonCard)
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

  // Normal rendering when not fullscreen
  return (
    <>
      {tableContent}
      {tooltipPortal}
    </>
  );
}
