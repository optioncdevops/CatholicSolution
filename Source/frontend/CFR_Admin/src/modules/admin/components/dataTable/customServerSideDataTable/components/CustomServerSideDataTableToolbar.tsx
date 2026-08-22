import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from "react";
import type { ColumnDef } from "../../partials/useDataTable";
import { DataTableGlobalSearch } from "../../partials/DataTableGlobalSearch";
import { DataTableColumnsMenuPortal } from "../../partials/DataTableColumnsMenuPortal";
import { LegacyColumnVisibilityPopover } from "../../partials/LegacyColumnVisibilityPopover";
import {
  DATA_TABLE_EXPORT_BTN_CSV_CLASS,
  DATA_TABLE_EXPORT_BTN_EXCEL_CLASS,
  DATA_TABLE_EXPORT_BTN_PRINT_CLASS,
  DATA_TABLE_FULLSCREEN_BTN_CLASS,
  DATA_TABLE_TOOLBAR_SHELL_CLASS,
  getDataTableColumnsButtonClass,
} from "../../customDataTable/customDataTable.constants";
import { AppIcon } from "@app/components/icons";

export interface CustomServerSideDataTableToolbarProps<T> {
  title?: string;
  error: string | null;
  enableExport: boolean;
  exportBusy: boolean;
  canExport: boolean;
  handleExportExcelServer: () => void;
  handleExportPrintServer: () => void;
  handleExportCsvServer: () => void;
  enableGlobalSearch: boolean;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  setPageIndex: (index: number) => void;
  enableColumnManager: boolean;
  columnManagerRef: RefObject<HTMLDivElement | null>;
  hiddenColumnIds: string[];
  isColumnManagerOpen: boolean;
  setIsColumnManagerOpen: Dispatch<SetStateAction<boolean>>;
  setHiddenColumnIds: Dispatch<SetStateAction<string[]>>;
  orderedColumns: ColumnDef<T>[];
  columns: ColumnDef<T>[];
  enableColumnReorder: boolean;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  toggleColumnVisibility: (columnId: string) => void;
  enableFullscreenToggle: boolean;
  isFullscreen: boolean;
  isFullscreenTogglingRef: MutableRefObject<boolean>;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
}

export function CustomServerSideDataTableToolbar<T>({
  title,
  enableExport,
  exportBusy,
  canExport,
  handleExportExcelServer,
  handleExportPrintServer,
  handleExportCsvServer,
  enableGlobalSearch,
  globalSearch,
  setGlobalSearch,
  setPageIndex,
  enableColumnManager,
  columnManagerRef,
  hiddenColumnIds,
  isColumnManagerOpen,
  setIsColumnManagerOpen,
  setHiddenColumnIds,
  orderedColumns,
  columns,
  enableColumnReorder,
  moveColumn,
  toggleColumnVisibility,
  enableFullscreenToggle,
  isFullscreen,
  isFullscreenTogglingRef,
  setIsFullscreen,
}: CustomServerSideDataTableToolbarProps<T>) {
  return (
    <div className={DATA_TABLE_TOOLBAR_SHELL_CLASS}>
      <div className="flex flex-wrap items-center gap-3">
        {title && (
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {title}
          </span>
        )}
   

        {enableExport && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Export:
            </span>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              className={DATA_TABLE_EXPORT_BTN_EXCEL_CLASS}
              title={canExport ? "Export to Excel (.xlsx)" : "No records to export"}
              onClick={handleExportExcelServer}
            >
              <AppIcon name="fileSpreadsheet" size={16} />
            </button>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              className={DATA_TABLE_EXPORT_BTN_PRINT_CLASS}
              title={canExport ? "Print" : "No records to export"}
              onClick={handleExportPrintServer}
            >
              <AppIcon name="printer" size={16} />
            </button>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              onClick={handleExportCsvServer}
              className={DATA_TABLE_EXPORT_BTN_CSV_CLASS}
              title={canExport ? "Download CSV" : "No records to export"}
            >
              <AppIcon name="download" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
        {enableColumnManager && (
          <div className="relative" ref={columnManagerRef}>
            <button
              type="button"
              aria-expanded={isColumnManagerOpen}
              aria-haspopup="dialog"
              className={getDataTableColumnsButtonClass({
                isOpen: isColumnManagerOpen,
                hasHiddenColumns: hiddenColumnIds.length > 0,
              })}
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
              <LegacyColumnVisibilityPopover
                orderedColumns={orderedColumns}
                hiddenColumnIds={hiddenColumnIds}
                allColumns={columns}
                enableColumnReorder={enableColumnReorder}
                onShowAll={() => { setHiddenColumnIds([]); }}
                onToggleColumn={toggleColumnVisibility}
                onMoveColumn={moveColumn}
              />
            </DataTableColumnsMenuPortal>
          </div>
        )}

        {enableFullscreenToggle && (
          <button
            type="button"
            className={DATA_TABLE_FULLSCREEN_BTN_CLASS}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isFullscreenTogglingRef.current) {return;}

              isFullscreenTogglingRef.current = true;
              setIsFullscreen((prev) => !prev);
              setTimeout(() => {
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
  );
}
