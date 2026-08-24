import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from "react";
import type { ColumnDef } from "../../partials/useDataTable";
import { ColumnVisibilityPopover } from "../../partials/ColumnVisibilityPopover";
import { LegacyColumnVisibilityPopover } from "../../partials/LegacyColumnVisibilityPopover";
import { DataTableColumnsMenuPortal } from "../../partials/DataTableColumnsMenuPortal";
import { DataTableGlobalSearch } from "../../partials/DataTableGlobalSearch";
import type { DataTableColumnVisibilityMap } from "../../partials/columnVisibilitySettings";
import { DataTableExpandAllControls } from "../../partials/DataTableExpandControls";
import {
  DATA_TABLE_EXPORT_BTN_CSV_CLASS,
  DATA_TABLE_EXPORT_BTN_EXCEL_CLASS,
  DATA_TABLE_EXPORT_BTN_PRINT_CLASS,
  DATA_TABLE_FULLSCREEN_BTN_CLASS,
  DATA_TABLE_TOOLBAR_SHELL_CLASS,
  getDataTableColumnsButtonClass,
} from "../customDataTable.constants";
import { AppIcon } from "@app/components/icons";

export interface CustomDataTableToolbarProps<T> {
  enableExport: boolean;
  exportBusy: boolean;
  canExport: boolean;
  handleExportExcel: () => void;
  handleExportPrint: () => void;
  handleExportCsv: () => void;
  enableColumnManager: boolean;
  columnManagerRef: RefObject<HTMLDivElement | null>;
  hiddenColumnIds: string[];
  openColumnManager: () => void;
  isColumnManagerOpen: boolean;
  columnSettingsEnabled: boolean;
  orderedColumns: ColumnDef<T>[];
  draftVisibility: DataTableColumnVisibilityMap;
  appliedVisibility: DataTableColumnVisibilityMap;
  hideableColumnIds: string[];
  lockedColumnIds: string[];
  enableColumnReorder: boolean;
  setDraftVisibility: (visibility: DataTableColumnVisibilityMap) => void;
  handleColumnManagerCancel: () => void;
  handleColumnManagerUpdate: () => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  legacyHiddenColumnIds: string[];
  columns: ColumnDef<T>[];
  setLegacyHiddenColumnIds: Dispatch<SetStateAction<string[]>>;
  toggleColumnVisibility: (columnId: string) => void;
  enableFullscreenToggle: boolean;
  expandControls?: {
    visible?: boolean;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    isExpandAllDisabled?: boolean;
    isCollapseAllDisabled?: boolean;
  };
  isFullscreen: boolean;
  isFullscreenTogglingRef: MutableRefObject<boolean>;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  enableGlobalSearch: boolean;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  setPageIndex: (index: number) => void;
}

export function CustomDataTableToolbar<T>({
  enableExport,
  exportBusy,
  canExport,
  handleExportExcel,
  handleExportPrint,
  handleExportCsv,
  enableColumnManager,
  columnManagerRef,
  hiddenColumnIds,
  openColumnManager,
  isColumnManagerOpen,
  columnSettingsEnabled,
  orderedColumns,
  draftVisibility,
  appliedVisibility,
  hideableColumnIds,
  lockedColumnIds,
  enableColumnReorder,
  setDraftVisibility,
  handleColumnManagerCancel,
  handleColumnManagerUpdate,
  moveColumn,
  legacyHiddenColumnIds,
  columns,
  setLegacyHiddenColumnIds,
  toggleColumnVisibility,
  enableFullscreenToggle,
  expandControls,
  isFullscreen,
  isFullscreenTogglingRef,
  setIsFullscreen,
  enableGlobalSearch,
  globalSearch,
  setGlobalSearch,
  setPageIndex,
}: CustomDataTableToolbarProps<T>) {
  const showExpandControls = expandControls && expandControls.visible !== false;

  return (
    <div className={DATA_TABLE_TOOLBAR_SHELL_CLASS}>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {showExpandControls && (
          <DataTableExpandAllControls
            onExpandAll={expandControls.onExpandAll}
            onCollapseAll={expandControls.onCollapseAll}
            isExpandAllDisabled={expandControls.isExpandAllDisabled}
            isCollapseAllDisabled={expandControls.isCollapseAllDisabled}
          />
        )}
        {enableExport && (
          <div className="flex shrink-0 items-center">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Export:
            </span>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              className={DATA_TABLE_EXPORT_BTN_EXCEL_CLASS}
              title={canExport ? "Export to Excel (.xlsx)" : "No records to export"}
              onClick={handleExportExcel}
            >
              <AppIcon name="fileSpreadsheet" size={16} />
            </button>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              className={DATA_TABLE_EXPORT_BTN_PRINT_CLASS}
              title={canExport ? "Print" : "No records to export"}
              onClick={handleExportPrint}
            >
              <AppIcon name="printer" size={16} />
            </button>
            <button
              type="button"
              disabled={exportBusy || !canExport}
              onClick={handleExportCsv}
              className={DATA_TABLE_EXPORT_BTN_CSV_CLASS}
              title={canExport ? "Download CSV" : "No records to export"}
            >
              <AppIcon name="download" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:min-w-0 sm:flex-1">
        {enableColumnManager && (
          <div className="relative shrink-0" ref={columnManagerRef}>
            <button
              type="button"
              aria-expanded={isColumnManagerOpen}
              aria-haspopup="dialog"
              className={getDataTableColumnsButtonClass({
                isOpen: isColumnManagerOpen,
                hasHiddenColumns: hiddenColumnIds.length > 0,
              })}
              onClick={openColumnManager}
            >
              <AppIcon name="columns3" size={14} />
              <span>Columns</span>
            </button>

            <DataTableColumnsMenuPortal
              anchorRef={columnManagerRef}
              isOpen={isColumnManagerOpen}
              onRequestClose={handleColumnManagerCancel}
            >
              {columnSettingsEnabled ? (
                <ColumnVisibilityPopover
                  orderedColumns={orderedColumns}
                  draftVisibility={draftVisibility}
                  appliedVisibility={appliedVisibility}
                  hideableColumnIds={hideableColumnIds}
                  lockedColumnIds={lockedColumnIds}
                  enableColumnReorder={enableColumnReorder}
                  showDraftFooter
                  onDraftChange={setDraftVisibility}
                  onCancel={handleColumnManagerCancel}
                  onUpdate={handleColumnManagerUpdate}
                  onMoveColumn={moveColumn}
                />
              ) : (
                <LegacyColumnVisibilityPopover
                  orderedColumns={orderedColumns}
                  hiddenColumnIds={legacyHiddenColumnIds}
                  allColumns={columns}
                  enableColumnReorder={enableColumnReorder}
                  onShowAll={() => { setLegacyHiddenColumnIds([]); }}
                  onToggleColumn={toggleColumnVisibility}
                  onMoveColumn={moveColumn}
                />
              )}
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
              if (isFullscreenTogglingRef.current) { return; }

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
            className="sm:w-56"
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
