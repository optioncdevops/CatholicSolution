import type { ColumnDef } from "../../partials/useDataTable";
import { cn } from "@app/utilities/cn";
import {
  DATA_TABLE_BODY_CELL_BORDER_CLASS,
  DEFAULT_COMPACT_ACTION_COLUMN_IDS,
  isDataTableActionColumn,
} from "../customDataTable.constants";
import {
  getColumnTextAlignClass,
  mergeColumnCellStyle,
} from "../customDataTableColumnLayout.utils";
import {
  resolveCellClassName,
  type ResolvedBodyCell,
} from "../dataTableCellSpan.utils";
import { valueToExportCell } from "../../partials/tableExportUtils";

export interface CustomDataTableBodyCellsProps<T> {
  resolvedCells: ResolvedBodyCell<T>[];
  row: T;
  rowIndex: number;
  frozenLefts: (number | null)[];
  cellPy: string;
  cellTextClass: string;
  frozenStripedCellClass: string;
  compactIconCellClass: (col: ColumnDef<T>) => string;
  compactActionColumnIds?: readonly string[];
  showCellBorders?: boolean;
  resolveGlobalRowIndex: (rowIndex: number) => number;
}

export function CustomDataTableBodyCells<T>({
  resolvedCells,
  row,
  rowIndex,
  frozenLefts,
  cellPy,
  cellTextClass,
  frozenStripedCellClass,
  compactIconCellClass,
  compactActionColumnIds = DEFAULT_COMPACT_ACTION_COLUMN_IDS,
  showCellBorders,
  resolveGlobalRowIndex,
}: CustomDataTableBodyCellsProps<T>) {
  const globalRowIndex = resolveGlobalRowIndex(rowIndex);

  return (
    <>
      {resolvedCells.map(({ column, columnIndex, colSpan, rowSpan }) => {
        const isFrozen = column.frozen === true;
        const leftOffset = isFrozen
          ? (frozenLefts[columnIndex] ?? 0)
          : undefined;
        const isActionColumn = isDataTableActionColumn(
          column,
          compactActionColumnIds,
        );
        const plainText = column.cell
          ? null
          : valueToExportCell(column.accessor(row));

        return (
          <td
            key={column.id}
            colSpan={colSpan > 1 ? colSpan : undefined}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            className={cn(
              `max-w-[20rem] px-1.5 ${cellPy} text-xs text-slate-800 dark:text-slate-100 ${cellTextClass}`,
              getColumnTextAlignClass(column.align),
              isFrozen ? frozenStripedCellClass : "",
              compactIconCellClass(column),
              showCellBorders && DATA_TABLE_BODY_CELL_BORDER_CLASS,
              column.className,
              resolveCellClassName(column.cellClassName, row, globalRowIndex),
            )}
            style={mergeColumnCellStyle(column, columnIndex, leftOffset)}
          >
            {column.cell ? (
              column.cell(row, globalRowIndex)
            ) : (
              <span
                className={cn(
                  "block min-w-0",
                  !isActionColumn && "truncate",
                )}
                title={!isActionColumn && plainText ? plainText : undefined}
              >
                {plainText}
              </span>
            )}
          </td>
        );
      })}
    </>
  );
}
