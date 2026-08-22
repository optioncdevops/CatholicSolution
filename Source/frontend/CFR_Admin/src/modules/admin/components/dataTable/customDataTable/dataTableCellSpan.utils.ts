import type { ColumnDef } from "../partials/useDataTable";

export function resolveCellSpanValue<T>(
  span: number | ((row: T, rowIndex: number) => number) | undefined,
  row: T,
  rowIndex: number,
  defaultValue = 1,
): number {
  if (span === undefined) {
    return defaultValue;
  }
  return typeof span === "function" ? span(row, rowIndex) : span;
}

export function resolveCellClassName<T>(
  className: string | ((row: T, rowIndex: number) => string) | undefined,
  row: T,
  rowIndex: number,
): string {
  if (!className) {
    return "";
  }
  return typeof className === "function" ? className(row, rowIndex) : className;
}

type OccupancyKey = string;

function occupancyKey(row: number, col: number): OccupancyKey {
  return `${row}:${col}`;
}

function isOccupied(
  occupancy: Map<OccupancyKey, boolean>,
  row: number,
  col: number,
): boolean {
  return occupancy.get(occupancyKey(row, col)) === true;
}

function markOccupied(
  occupancy: Map<OccupancyKey, boolean>,
  startRow: number,
  startCol: number,
  rowSpan: number,
  colSpan: number,
): void {
  for (let r = startRow; r < startRow + rowSpan; r += 1) {
    for (let c = startCol; c < startCol + colSpan; c += 1) {
      occupancy.set(occupancyKey(r, c), true);
    }
  }
}

export interface ResolvedBodyCell<T> {
  column: ColumnDef<T>;
  columnIndex: number;
  colSpan: number;
  rowSpan: number;
};

export function resolveBodyCellsForRow<T>({
  columns,
  row,
  rowIndex,
  displayIndex,
  occupancy,
}: {
  columns: ColumnDef<T>[];
  row: T;
  rowIndex: number;
  displayIndex: number;
  occupancy: Map<OccupancyKey, boolean>;
}): ResolvedBodyCell<T>[] {
  const cells: ResolvedBodyCell<T>[] = [];

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    if (isOccupied(occupancy, displayIndex, columnIndex)) {
      continue;
    }

    const column = columns[columnIndex];
    const rawColSpan = resolveCellSpanValue(column.colSpan, row, rowIndex, 1);
    const rawRowSpan = resolveCellSpanValue(column.rowSpan, row, rowIndex, 1);

    if (rawColSpan === 0 || rawRowSpan === 0) {
      markOccupied(occupancy, displayIndex, columnIndex, 1, 1);
      continue;
    }

    const colSpan = Math.max(
      1,
      Math.min(rawColSpan, columns.length - columnIndex),
    );
    const rowSpan = Math.max(1, rawRowSpan);

    markOccupied(occupancy, displayIndex, columnIndex, rowSpan, colSpan);
    cells.push({ column, columnIndex, colSpan, rowSpan });
  }

  return cells;
}

export function buildAllBodyCells<T>(
  columns: ColumnDef<T>[],
  rows: T[],
  resolveRowIndex: (displayIndex: number) => number,
): ResolvedBodyCell<T>[][] {
  const occupancy = new Map<OccupancyKey, boolean>();
  return rows.map((row, displayIndex) =>
    resolveBodyCellsForRow({
      columns,
      row,
      rowIndex: resolveRowIndex(displayIndex),
      displayIndex,
      occupancy,
    }),
  );
}

export interface ResolvedHeaderCell<T> {
  column: ColumnDef<T>;
  columnIndex: number;
  colSpan: number;
  rowSpan: number;
};

export function resolveMainHeaderCells<T>(
  columns: ColumnDef<T>[],
): ResolvedHeaderCell<T>[] {
  const occupancy = new Map<OccupancyKey, boolean>();
  const cells: ResolvedHeaderCell<T>[] = [];

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    if (isOccupied(occupancy, 0, columnIndex)) {
      continue;
    }

    const column = columns[columnIndex];
    const rawColSpan = column.headerColSpan ?? 1;
    const rawRowSpan = column.headerRowSpan ?? 1;

    if (rawColSpan === 0 || rawRowSpan === 0) {
      markOccupied(occupancy, 0, columnIndex, 1, 1);
      continue;
    }

    const colSpan = Math.max(
      1,
      Math.min(rawColSpan, columns.length - columnIndex),
    );
    const rowSpan = Math.max(1, rawRowSpan);

    markOccupied(occupancy, 0, columnIndex, rowSpan, colSpan);
    cells.push({ column, columnIndex, colSpan, rowSpan });
  }

  return cells;
}

export function buildHeaderFilterOccupancy<T>(
  columns: ColumnDef<T>[],
): Map<OccupancyKey, boolean> {
  const occupancy = new Map<OccupancyKey, boolean>();

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    if (isOccupied(occupancy, 0, columnIndex)) {
      continue;
    }

    const column = columns[columnIndex];
    const rawColSpan = column.headerColSpan ?? 1;
    const rawRowSpan = column.headerRowSpan ?? 1;

    if (rawColSpan === 0 || rawRowSpan === 0) {
      markOccupied(occupancy, 0, columnIndex, 1, 1);
      continue;
    }

    const colSpan = Math.max(
      1,
      Math.min(rawColSpan, columns.length - columnIndex),
    );
    const rowSpan = Math.max(1, rawRowSpan);

    markOccupied(occupancy, 0, columnIndex, rowSpan, colSpan);
  }

  return occupancy;
}

export function isHeaderFilterSlotOccupied(
  occupancy: Map<OccupancyKey, boolean>,
  columnIndex: number,
): boolean {
  return isOccupied(occupancy, 1, columnIndex);
}
