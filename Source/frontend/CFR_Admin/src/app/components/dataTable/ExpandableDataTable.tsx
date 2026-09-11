import React, { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import EmptyState from "@app/components/common/EmptyState";
import { getColumnHeaderFlexAlignClass, getColumnTextAlignClass } from "./customDataTable/customDataTableColumnLayout.utils";
import {
  DATA_TABLE_HEADER_MENU_BTN_CLASS,
  DATA_TABLE_HEADER_MENU_ITEM_CLASS,
} from "./customDataTable/customDataTable.constants";
import { DataTableGlobalSearch } from "./partials/DataTableGlobalSearch";
import { DataTableFullscreenOverlay } from "./partials/DataTableFullscreenOverlay";
import { DataTableColumnsMenuPortal } from "./partials/DataTableColumnsMenuPortal";
import { AppIcon } from "@app/components/icons";
import { DataTableSortIcon } from "./partials/DataTableSortIcon";
import { cn } from "@app/utilities/cn";
import { themeDataTableHeadClass } from "@designSystem/theme/styles/componentStyle";

/** Rows may carry nested children for expand/collapse; not part of `T` itself. */
type RowWithChildren<T> = T & { children?: T[] };

export interface ExpandableColumn<T> {
    id: string;
    header: string;
    headerNode?: ReactNode;
    accessor: (row: T) => unknown;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    align?: "left" | "center" | "right";
    sortable?: boolean;
    filterable?: boolean;
    hideable?: boolean;
    frozen?: boolean;
    cell?: (row: T, index: number) => React.ReactNode;
}

export interface ExpandableDataTableProps<T> {
    title?: string;
    data: T[];
    columns: ExpandableColumn<T>[];
    rowKey: (row: T) => string | number;
    defaultExpanded?: boolean;
    enableGlobalSearch?: boolean;
    enableExport?: boolean;
    enableColumnManager?: boolean;
    enableColumnActions?: boolean;
    enableFullscreenToggle?: boolean;
    enablePagination?: boolean;
    initialPageSize?: number;
    enableRowSelection?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    renderRowDetails?: (row: T) => React.ReactNode;
    expandOnRowClick?: boolean;
    /** Collapsed/expanded toggle appearance in the row */
    expandToggleStyle?: "plus" | "doubleArrow";
    /** Expand toggle placement. `first` renders inline in the first visible cell, `last` renders a dedicated last column. */
    expandTogglePosition?: "first" | "last";
    /** When `expandTogglePosition` is `first`, render the toggle before or after the first cell content. */
    expandToggleInlineOrder?: "before" | "after";
    /** Whether the expand icon itself toggles the row. */
    expandToggleClickable?: boolean;
    enableExpandControls?: boolean;
    /** Max height for the table body area (enables internal scroll). */
    maxBodyHeight?: string;
    /** Custom content rendered in the table top bar (e.g. summary stats). */
    headerContent?: ReactNode;
    /** Removes outer card chrome when nested inside another container. */
    embedded?: boolean;
    /** Table column layout — use `auto` when fixed layout creates excess empty space between columns. */
    tableLayout?: "fixed" | "auto";
    loading?: boolean;
    /** Optional per-row `<tr>` class names (e.g. parent vs child styling). */
    getRowClassName?: (row: T) => string | undefined;
    /** Fired when a row is expanded or collapsed (useful for lazy-loading child rows). */
    onExpandedChange?: (rowId: string | number, expanded: boolean, row: T) => void;
}

export function ExpandableDataTable<T>({
    data,
    columns,
    rowKey,
    defaultExpanded = false,
    enableGlobalSearch = true,
    enableExport = true,
    enableColumnManager = true,
    enableColumnActions,
    enableFullscreenToggle = true,
    enablePagination = true,
    initialPageSize = 10,
    enableRowSelection = false,
    onSelectionChange,
    renderRowDetails,
    expandOnRowClick = false,
    expandToggleStyle = "plus",
    expandTogglePosition = "first",
    expandToggleInlineOrder = "before",
    expandToggleClickable = true,
    enableExpandControls = true,
    maxBodyHeight,
    headerContent,
    embedded = false,
    tableLayout = "fixed",
    loading = false,
    getRowClassName,
    onExpandedChange,
}: ExpandableDataTableProps<T>) {
    // Nested/embedded tables keep a clean header (no per-column ⋮ menu).
    const columnActionsEnabled = enableColumnActions ?? !embedded;
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
        new Set(defaultExpanded ? getAllRowIds(data) : [])
    );
    const [globalSearch, setGlobalSearch] = useState("");
    const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>([]);
    const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isFullscreenTogglingRef = useRef(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());
    const [openMenuForColumnId, setOpenMenuForColumnId] = useState<string | null>(null);
    const [activeFilterColumnId, setActiveFilterColumnId] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

    const columnManagerRef = useRef<HTMLDivElement | null>(null);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);
    const headerMenuRef = useRef<HTMLDivElement | null>(null);

    function getAllRowIds(rows: T[], includeChildren = true): (string | number)[] {
        const ids: (string | number)[] = [];
        rows.forEach((row) => {
            ids.push(rowKey(row));
            const children = (row as RowWithChildren<T>).children;
            if (includeChildren && children) {
                ids.push(...getAllRowIds(children, true));
            }
        });
        return ids;
    }

    const toggleRow = (id: string | number, row?: T) => {
        const willExpand = !expandedRows.has(id);
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        if (onExpandedChange && row !== undefined) {
            onExpandedChange(id, willExpand, row);
        }
    };

    const expandAll = () => {
        setExpandedRows(new Set(getAllRowIds(data)));
    };

    const collapseAll = () => {
        setExpandedRows(new Set());
    };

    const visibleColumns = useMemo(
        () => columns.filter((c) => !hiddenColumnIds.includes(c.id)),
        [columns, hiddenColumnIds]
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

    const toggleSort = (columnId: string) => {
        if (sortColumn === columnId) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else {
                setSortColumn(null);
                setSortDirection("asc");
            }
        } else {
            setSortColumn(columnId);
            setSortDirection("asc");
        }
    };

    // Plain (non-memoized) recursive helper — useCallback can't wrap a function that calls
    // itself by its own const binding, since that binding isn't initialized yet inside its own
    // initializer. `flatData` below intentionally lists `rowKey`/`expandedRows` directly instead
    // of `flattenRows` itself, since those are flattenRows' only real dependencies.
    const flattenRows = (rows: T[], level = 0): (T & { _level: number })[] => {
        const result: (T & { _level: number })[] = [];
        rows.forEach((row) => {
            const rowId = rowKey(row);
            result.push({ ...row, _level: level });
            const children = (row as RowWithChildren<T>).children;
            if (children && expandedRows.has(rowId)) {
                result.push(...flattenRows(children, level + 1));
            }
        });
        return result;
    };

    const filteredData = useMemo(() => {
        if (!globalSearch) {return data;}
        const needle = globalSearch.toLowerCase();

        const filterRows = (rows: T[]): T[] => {
            return rows.filter((row) => {
                const matchesSearch = visibleColumns.some((col) => {
                    try {
                        const value = col.accessor(row);
                        if (value == null) {return false;}
                        return String(value).toLowerCase().includes(needle);
                    } catch {
                        return false;
                    }
                });

                if (matchesSearch) {return true;}

                const children = (row as RowWithChildren<T>).children;
                if (children) {
                    const filteredChildren = filterRows(children);
                    if (filteredChildren.length > 0) {
                        return true;
                    }
                }

                return false;
            });
        };

        return filterRows(data);
    }, [data, globalSearch, visibleColumns]);

    const sortedData = useMemo(() => {
        if (!sortColumn) {return filteredData;}

        const column = columns.find((c) => c.id === sortColumn);
        if (!column) {return filteredData;}

        const sortRows = (rows: T[]): T[] => {
            const sorted = [...rows].sort((a, b) => {
                const aVal = column.accessor(a);
                const bVal = column.accessor(b);

                if (aVal == null && bVal == null) {return 0;}
                if (aVal == null) {return 1;}
                if (bVal == null) {return -1;}

                const aStr = String(aVal);
                const bStr = String(bVal);

                const comparison = aStr.localeCompare(bStr, undefined, { numeric: true });
                return sortDirection === "asc" ? comparison : -comparison;
            });

            return sorted.map((row) => {
                const children = (row as RowWithChildren<T>).children;
                return {
                    ...row,
                    children: children ? sortRows(children) : undefined,
                };
            });
        };

        return sortRows(filteredData);
    }, [filteredData, sortColumn, sortDirection, columns]);

    // flattenRows is a plain (non-memoized) recursive function; rowKey/expandedRows below are
    // its actual dependencies, so exhaustive-deps' "missing: flattenRows" is a false positive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const flatData = useMemo(() => flattenRows(sortedData), [sortedData, rowKey, expandedRows]);

    const pageCount = Math.ceil(flatData.length / pageSize);
    const paginatedData = enablePagination
        ? flatData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        : flatData;

    const hasNoData = !loading && paginatedData.length === 0;
    const canExport = flatData.length > 0;
    const showToolbar =
        Boolean(headerContent) ||
        enableExport ||
        enableGlobalSearch ||
        enableExpandControls ||
        enableColumnManager ||
        enableFullscreenToggle;

    const exportBtnClass =
        "p-1.5 rounded transition-colors disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed";

    const exportToCSV = () => {
        const headers = visibleColumns.map((c) => c.header);
        const lines = [
            headers.join(","),
            ...flatData.map((row) =>
                visibleColumns
                    .map((c) => {
                        const val = c.accessor(row);
                        if (val == null) {return "";}
                        const text = String(val).replace(/"/g, '""');
                        return `"${text}"`;
                    })
                    .join(",")
            ),
        ];
        const csvContent = lines.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "expandable_table_export.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const setRowSelected = (row: T & { _level: number }, selected: boolean) => {
        const key = rowKey(row);
        setSelectedRowIds((prev) => {
            const next = new Set(prev);
            if (selected) {
                next.add(key);
            } else {
                next.delete(key);
            }
            if (onSelectionChange) {
                const selectedRows = flatData.filter((r) => next.has(rowKey(r)));
                onSelectionChange(selectedRows);
            }
            return next;
        });
    };

    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);

    useEffect(() => {
        if (!openMenuForColumnId) {return;}
        function handleClickOutside(event: MouseEvent) {
            if (!headerMenuRef.current) {return;}
            if (!headerMenuRef.current.contains(event.target as Node)) {
                setOpenMenuForColumnId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenuForColumnId]);

    const renderRow = (row: T & { _level: number }, rowIndex: number) => {
        const rowId = rowKey(row);
        const children = (row as RowWithChildren<T>).children;
        const hasChildren = children && children.length > 0;
        const isExpanded = expandedRows.has(rowId);
        const isSelected = selectedRowIds.has(rowId);
        const showExpandToggle = Boolean(hasChildren || renderRowDetails);
        const hasTrailingExpandColumn = expandTogglePosition === "last";

        const expandToggleButton =
            expandTogglePosition === "first" && showExpandToggle ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!expandToggleClickable) {return;}
                        toggleRow(rowId, row);
                    }}
                    className={`flex-shrink-0 rounded border border-border bg-background p-0.5 text-primary-600 transition-colors ${
                        expandToggleClickable ? "hover:bg-muted" : "cursor-default opacity-70"
                    }`}
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
            ) : null;
        const useFirstColumnExpandLayout =
            expandTogglePosition === "first" && Boolean(expandToggleButton);

        return (
            <React.Fragment key={rowId}>
            <tr
                className={cn(
                    "border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors cursor-pointer",
                    isExpanded && renderRowDetails ? "bg-primary-50/30" : "",
                    getRowClassName?.(row),
                )}
                onClick={() => {
                    if (expandOnRowClick && (hasChildren || renderRowDetails)) {
                        toggleRow(rowId, row);
                    }
                }}
            >
                {enableRowSelection && (
                    <td className="px-2 py-2 text-center w-8">
                        <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                            checked={isSelected}
                            onChange={(e) => { setRowSelected(row, e.target.checked); }}
                        />
                    </td>
                )}
                {visibleColumns.map((col, colIndex) => (
                    <td
                        key={col.id}
                        className={cn(
                            `px-1.5 py-1 text-xs text-slate-800 dark:text-slate-100`,
                            getColumnTextAlignClass(col.align),
                            col.frozen ? "sticky z-10 bg-white dark:bg-slate-950" : ""
                        )}
                        style={{
                            width: col.width,
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                            left: col.frozen ? 0 : undefined,
                        }}
                    >
                        {colIndex === 0 && useFirstColumnExpandLayout ? (
                            <div
                                className="flex items-center justify-start gap-2"
                                style={{ paddingLeft: `${row._level * 24}px` }}
                            >
                                {expandToggleInlineOrder === "before"
                                    ? expandToggleButton
                                    : null}
                                <div
                                    className={cn(
                                        "flex min-w-0 items-center",
                                        expandToggleInlineOrder === "after"
                                            ? "shrink-0"
                                            : "flex-1",
                                        getColumnHeaderFlexAlignClass(col.align),
                                    )}
                                >
                                    {col.cell ? col.cell(row, rowIndex) : (col.accessor(row) as React.ReactNode)}
                                </div>
                                {expandToggleInlineOrder === "after"
                                    ? expandToggleButton
                                    : null}
                            </div>
                        ) : (
                            <div
                                className={cn(
                                    "flex min-w-0 w-full items-center",
                                    getColumnHeaderFlexAlignClass(col.align),
                                )}
                                style={
                                    colIndex === 0 && row._level
                                        ? { paddingLeft: `${row._level * 24}px` }
                                        : undefined
                                }
                            >
                                {col.cell ? col.cell(row, rowIndex) : (col.accessor(row) as React.ReactNode)}
                            </div>
                        )}
                    </td>
                ))}
                {hasTrailingExpandColumn && (
                    <td className="w-8 px-1.5 py-1 text-center text-xs text-slate-800 dark:text-slate-100">
                        {showExpandToggle ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!expandToggleClickable) {return;}
                                    toggleRow(rowId, row);
                                }}
                                className={`flex-shrink-0 rounded border border-border bg-background p-0.5 text-primary-600 transition-colors ${
                                    expandToggleClickable ? "hover:bg-muted" : "cursor-default opacity-70"
                                }`}
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
                        ) : (
                            <span className="inline-block w-5" />
                        )}
                    </td>
                )}
            </tr>
            {isExpanded && renderRowDetails && (
                <tr className="bg-slate-50/50">
                    <td
                        colSpan={visibleColumns.length + (enableRowSelection ? 1 : 0) + (hasTrailingExpandColumn ? 1 : 0)}
                        className="px-6 py-4 border-b border-slate-200 dark:border-slate-800"
                    >
                        {renderRowDetails(row)}
                    </td>
                </tr>
            )}
            </React.Fragment>
        );
    };

    const tableContent = (
        <div
            ref={tableContainerRef}
            className={cn(
                "relative overflow-hidden transition-all duration-200",
                embedded
                    ? "w-full border-0 bg-transparent shadow-none"
                    : "w-full rounded-xl border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950",
                isFullscreen && "flex h-full min-h-0 w-full flex-col",
            )}
        >
            {/* Toolbar / summary bar */}
            {showToolbar ? (
            <div className="flex flex-col gap-1.5 border-b border-slate-200 bg-slate-50/90 px-2 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                {headerContent ? (
                    <div className="min-w-0 flex-1">{headerContent}</div>
                ) : enableExport ? (
                    <div className="flex items-center">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            Export To:
                        </span>
                        <button
                            type="button"
                            disabled={!canExport}
                            className={`${exportBtnClass} text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-slate-800`}
                            title={canExport ? "Export to PDF" : "No records to export"}
                        >
                            <AppIcon name="fileText" size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={!canExport}
                            className={`${exportBtnClass} text-slate-500 hover:text-green-600 hover:bg-green-50 dark:text-slate-400 dark:hover:bg-slate-800`}
                            title={canExport ? "Export to Excel" : "No records to export"}
                        >
                            <AppIcon name="fileSpreadsheet" size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={!canExport}
                            className={`${exportBtnClass} text-slate-500 hover:text-primary-700 hover:bg-primary-50 dark:text-slate-400 dark:hover:bg-slate-800`}
                            title={canExport ? "Print" : "No records to export"}
                        >
                            <AppIcon name="printer" size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={!canExport}
                            onClick={exportToCSV}
                            className={`${exportBtnClass} text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:bg-slate-800`}
                            title={canExport ? "Download CSV" : "No records to export"}
                        >
                            <AppIcon name="download" size={16} />
                        </button>
                    </div>
                ) : null}

                <div
                    className={cn(
                        "flex w-full shrink-0 items-center gap-2 sm:w-auto sm:justify-end",
                        !headerContent && !enableExport && "sm:ml-auto",
                    )}
                >
                    {enableExpandControls ? (
                        <>
                            <button
                                type="button"
                                onClick={expandAll}
                                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                Expand All
                            </button>
                            <button
                                type="button"
                                onClick={collapseAll}
                                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                Collapse All
                            </button>
                        </>
                    ) : null}

                    {enableColumnManager && (
                        <div className="relative" ref={columnManagerRef}>
                            <button
                                type="button"
                                className={`inline-flex items-center gap-1 rounded border px-2 py-1.5 text-[11px] transition-colors ${hiddenColumnIds.length > 0
                                    ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/60 dark:bg-primary-900/20 dark:text-primary-300"
                                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    }`}
                                onClick={() => { setIsColumnManagerOpen((prev) => !prev); }}
                            >
                                <AppIcon name="columns3" size={14} />
                                <span>Columns</span>
                            </button>

                            <DataTableColumnsMenuPortal
                                anchorRef={columnManagerRef}
                                isOpen={isColumnManagerOpen}
                                onRequestClose={() => { setIsColumnManagerOpen(false); }}
                            >
                                <div className="flex shrink-0 items-center justify-between gap-4 px-3 pb-2">
                                    <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-100">
                                        Columns
                                    </span>
                                    <button
                                        type="button"
                                        className="shrink-0 whitespace-nowrap text-[11px] text-primary-600 hover:underline dark:text-primary-400"
                                        onClick={() => { setHiddenColumnIds([]); }}
                                    >
                                        Show all
                                    </button>
                                </div>
                                <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2">
                                    {columns.map((col) => {
                                        const isVisible = !hiddenColumnIds.includes(col.id);
                                        const hideable = col.hideable !== false;

                                        return (
                                            <div
                                                key={col.id}
                                                className="flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                <span className="whitespace-nowrap text-slate-700 dark:text-slate-100">
                                                    {col.header}
                                                </span>
                                                {hideable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { toggleColumnVisibility(col.id); }}
                                                        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${isVisible
                                                            ? "bg-primary-500"
                                                            : "bg-slate-300 dark:bg-slate-700"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${isVisible ? "translate-x-3" : "translate-x-0"
                                                                }`}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </DataTableColumnsMenuPortal>
                        </div>
                    )}

                    {enableFullscreenToggle && (
                        <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            onClick={() => {
                                if (isFullscreenTogglingRef.current) {return;}
                                isFullscreenTogglingRef.current = true;
                                setIsFullscreen((prev) => !prev);
                                window.setTimeout(() => {
                                    isFullscreenTogglingRef.current = false;
                                }, 300);
                            }}
                        >
                            {isFullscreen ? <AppIcon name="minimize2" size={14} /> : <AppIcon name="maximize2" size={14} />}
                        </button>
                    )}

                    {enableGlobalSearch && (
                        <DataTableGlobalSearch
                            className="flex-1 sm:flex-none sm:w-56"
                            value={globalSearch}
                            onChange={(next) => {
                                setPageIndex(0);
                                setGlobalSearch(next);
                            }}
                        />
                    )}
                </div>
            </div>
            ) : null}

            {/* Table */}
            <div
                className={cn(
                    "overflow-x-auto",
                    isFullscreen ? "flex-1 overflow-y-auto" : "",
                    maxBodyHeight && !isFullscreen ? "overflow-y-auto" : "",
                )}
                style={
                    maxBodyHeight && !isFullscreen
                        ? { maxHeight: maxBodyHeight }
                        : undefined
                }
            >
                <table
                    className={cn(
                        "min-w-full text-sm",
                        tableLayout === "auto" ? "w-max min-w-full table-auto" : "table-fixed",
                    )}
                >
                    <thead
                        className={cn(
                            themeDataTableHeadClass,
                            "sticky top-0 z-20",
                        )}
                    >
                        <tr>
                            {enableRowSelection && (
                                <th className="px-2 py-2 w-8 text-center text-xs font-semibold text-primary-900 uppercase tracking-wide dark:text-primary-100">
                                    <input
                                        type="checkbox"
                                        className="h-3 w-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                                        checked={
                                            paginatedData.length > 0 &&
                                            paginatedData.every((r) => selectedRowIds.has(rowKey(r)))
                                        }
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            paginatedData.forEach((r) => { setRowSelected(r, checked); });
                                        }}
                                    />
                                </th>
                            )}
                            {visibleColumns.map((col) => {
                                const isSorted = sortColumn === col.id;
                                const isMenuOpen = openMenuForColumnId === col.id;
                                const isFilterOpen = activeFilterColumnId === col.id;
                                const hideable = col.hideable !== false;
                                return (
                                    <th
                                        key={col.id}
                                        className={`px-2 py-2 text-xs font-semibold text-primary-900 uppercase tracking-wide dark:text-primary-100 ${getColumnTextAlignClass(col.align)} ${col.frozen ? "sticky z-30 bg-primary-100/95 dark:bg-primary-950/55" : ""}`}
                                        style={{
                                            width: col.width,
                                            minWidth: col.minWidth,
                                            maxWidth: col.maxWidth,
                                            left: col.frozen ? 0 : undefined,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            {col.headerNode != null ? (
                                                <div
                                                    className={cn(
                                                        "flex flex-1 min-w-0 items-center",
                                                        col.align === "center" && "justify-center",
                                                        col.align === "right" && "justify-end",
                                                    )}
                                                >
                                                    {col.headerNode}
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "flex items-center gap-1 flex-1 min-w-0",
                                                        col.align === "right" && "justify-end",
                                                        col.sortable && !hasNoData ? "cursor-pointer" : "cursor-default"
                                                    )}
                                                    onClick={() => {
                                                        if (col.sortable && !hasNoData) {toggleSort(col.id);}
                                                    }}
                                                >
                                                    <span className={cn(
                                                        "truncate",
                                                        col.align === "right" ? "min-w-0 flex-1 text-right" : "flex-1 text-left"
                                                    )}>{col.header}</span>
                                                    {col.sortable && !hasNoData && (
                                                        <span className="inline-flex items-center flex-shrink-0">
                                                            <DataTableSortIcon
                                                                direction={
                                                                    isSorted ? sortDirection : null
                                                                }
                                                            />
                                                        </span>
                                                    )}
                                                </button>
                                            )}

                                            {/* Column actions menu (three dots) */}
                                            {!hasNoData && columnActionsEnabled && col.headerNode == null && <div
                                                className="relative"
                                                ref={isMenuOpen ? headerMenuRef : null}
                                            >
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        DATA_TABLE_HEADER_MENU_BTN_CLASS,
                                                        isFilterOpen && "bg-slate-100 dark:bg-slate-800",
                                                    )}
                                                    onClick={() => {
                                                        setOpenMenuForColumnId((prev) =>
                                                            prev === col.id ? null : col.id
                                                        );
                                                    }}
                                                >
                                                    <span className="text-base leading-none">⋮</span>
                                                </button>

                                                {isMenuOpen && (
                                                    <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-slate-200 bg-white py-1 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                DATA_TABLE_HEADER_MENU_ITEM_CLASS,
                                                                !col.sortable &&
                                                                    "cursor-not-allowed text-slate-400 dark:text-slate-600",
                                                            )}
                                                            onClick={() => {
                                                                if (!col.sortable) {return;}
                                                                toggleSort(col.id);
                                                                setOpenMenuForColumnId(null);
                                                            }}
                                                        >
                                                            Sort
                                                        </button>

                                                        {col.filterable && (
                                                            <button
                                                                type="button"
                                                                className={DATA_TABLE_HEADER_MENU_ITEM_CLASS}
                                                                onClick={() => {
                                                                    setActiveFilterColumnId((prev) =>
                                                                        prev === col.id ? null : col.id
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
                                                                        prev === col.id ? null : prev
                                                                    );
                                                                    toggleColumnVisibility(col.id);
                                                                    setOpenMenuForColumnId(null);
                                                                }}
                                                            >
                                                                Hide column
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>}
                                        </div>
                                    </th>
                                );
                            })}
                            {expandTogglePosition === "last" && (
                                <th className="w-8 px-1.5 py-1.5 text-center text-[11px] font-semibold text-primary-900 uppercase tracking-wide dark:text-primary-100">
                                </th>
                            )}
                        </tr>

                        {/* Column filter row */}
                        {activeFilterColumnId && !hasNoData && (
                            <tr className="bg-slate-50 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                {enableRowSelection && <th className="px-2 py-0.5"></th>}
                                {visibleColumns.map((col) => (
                                    <th key={col.id} className="px-1.5 py-0.5">
                                        {col.filterable && col.id === activeFilterColumnId && (
                                            <input
                                                className="w-full rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                                                placeholder="Filter..."
                                                value={columnFilters[col.id] ?? ""}
                                                onChange={(e) =>
                                                    { setColumnFilters((prev) => ({
                                                        ...prev,
                                                        [col.id]: e.target.value,
                                                    })); }
                                                }
                                            />
                                        )}
                                    </th>
                                ))}
                                {expandTogglePosition === "last" && <th className="px-1.5 py-0.5"></th>}
                            </tr>
                        )}
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length + (enableRowSelection ? 1 : 0) + (expandTogglePosition === "last" ? 1 : 0)}
                                    className="px-3 py-4"
                                >
                                    <EmptyState
                                        title="No data available"
                                        description="Try adjusting filters or changing your search to see results here."
                                    />
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => renderRow(row, index + pageIndex * pageSize))
                        )}
                    </tbody>
                </table>
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    </div>
                )}
            </div>

            {/* Pagination */}
            {enablePagination && flatData.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-300">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPageIndex(0);
                            }}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-300">
                            {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, flatData.length)} of{" "}
                            {flatData.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => { setPageIndex(0); }}
                                disabled={pageIndex === 0}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <AppIcon name="chevronsLeft" size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPageIndex((prev) => Math.max(0, prev - 1)); }}
                                disabled={pageIndex === 0}
                                className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <span className="px-2 text-slate-600 dark:text-slate-300">
                                {pageIndex + 1} / {pageCount}
                            </span>
                            <button
                                type="button"
                                onClick={() => { setPageIndex((prev) => Math.min(pageCount - 1, prev + 1)); }}
                                disabled={pageIndex >= pageCount - 1}
                                className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPageIndex(pageCount - 1); }}
                                disabled={pageIndex >= pageCount - 1}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <AppIcon name="chevronsRight" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isFullscreen) {
        return (
            <DataTableFullscreenOverlay
                open={isFullscreen}
                onClose={() => { setIsFullscreen(false); }}
                isTogglingRef={isFullscreenTogglingRef}
            >
                {tableContent}
            </DataTableFullscreenOverlay>
        );
    }

    return tableContent;
}
