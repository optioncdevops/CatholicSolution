/**
 * Row order helpers for CustomDynamicDataTable (localStorage persistence).
 */

export interface DynamicTableRowOrderStorageConfig {
  userId: string | number;
  moduleKey: string;
  tableKey: string;
}

const STORAGE_PREFIX = "dynamic-table-row-order";

/** Stable localStorage key: userId + moduleKey + tableKey */
export function buildDynamicTableRowOrderStorageKey(
  userId: string | number,
  moduleKey: string,
  tableKey: string,
): string {
  const safeUser = String(userId).trim() || "anonymous";
  const safeModule = moduleKey.trim() || "default-module";
  const safeTable = tableKey.trim() || "default-table";
  return `${STORAGE_PREFIX}:${safeUser}:${safeModule}:${safeTable}`;
}

export function loadDynamicTableRowOrder(
  storageKey: string,
): string[] | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {return null;}
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {return null;}
    return parsed.map((id) => String(id));
  } catch {
    return null;
  }
}

export function saveDynamicTableRowOrder(
  storageKey: string,
  rowIds: readonly string[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(rowIds));
  } catch {
    // quota / private mode
  }
}

export function clearDynamicTableRowOrder(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}

/** Applies saved id order; unknown / new rows are appended in their original order. */
export function applyDynamicTableRowOrder<T>(
  rows: readonly T[],
  getRowId: (row: T) => string | number,
  savedOrder: readonly string[],
): T[] {
  if (!savedOrder.length || rows.length === 0) {return [...rows];}

  const byId = new Map(rows.map((row) => [String(getRowId(row)), row]));
  const ordered: T[] = [];
  const seen = new Set<string>();

  for (const id of savedOrder) {
    const row = byId.get(id);
    if (row) {
      ordered.push(row);
      seen.add(id);
    }
  }

  for (const row of rows) {
    const id = String(getRowId(row));
    if (!seen.has(id)) {ordered.push(row);}
  }

  return ordered;
}

export function rowOrdersEqualById<T>(
  a: readonly T[],
  b: readonly T[],
  getRowId: (row: T) => string | number,
): boolean {
  if (a.length !== b.length) {return false;}
  return a.every((row, index) => String(getRowId(row)) === String(getRowId(b[index])));
}

/** Reorders rows by moving the row with `fromRowId` to the index of `toRowId`. */
export function reorderDynamicTableRowsById<T>(
  rows: readonly T[],
  getRowId: (row: T) => string | number,
  fromRowId: string | number,
  toRowId: string | number,
): T[] {
  const fromIndex = rows.findIndex(
    (row) => String(getRowId(row)) === String(fromRowId),
  );
  const toIndex = rows.findIndex(
    (row) => String(getRowId(row)) === String(toRowId),
  );
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {return [...rows];}

  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/** Reorders rows by array index (for imperative ref API). */
export function moveDynamicTableRowByIndex<T>(
  rows: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= rows.length ||
    toIndex >= rows.length ||
    fromIndex === toIndex
  ) {
    return [...rows];
  }

  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
