/**
 * Column visibility helpers for DataTable (persistence-ready, no API calls).
 */

export type DataTableColumnVisibilityMap = Record<string, boolean>;

/** Stable empty map — use when column settings mode is off (avoids re-render loops). */
export const EMPTY_COLUMN_VISIBILITY_MAP: DataTableColumnVisibilityMap =
  Object.freeze({});

export function columnVisibilityMapsEqual(
  a: DataTableColumnVisibilityMap,
  b: DataTableColumnVisibilityMap,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {return false;}
  return keysA.every((key) => a[key] === b[key]);
}

export interface PersistedDataTableColumnSettings {
  visibility: DataTableColumnVisibilityMap;
}

const STORAGE_PREFIX = "datatable-column-settings";

/** Stable localStorage key: userId + moduleKey + tableKey */
export function buildDataTableColumnSettingsStorageKey(
  userId: string | number,
  moduleKey: string,
  tableKey: string,
): string {
  const safeUser = String(userId).trim() || "anonymous";
  const safeModule = moduleKey.trim() || "default-module";
  const safeTable = tableKey.trim() || "default-table";
  return `${STORAGE_PREFIX}:${safeUser}:${safeModule}:${safeTable}`;
}

/**
 * Merges saved visibility with current columns.
 * - No saved settings → all columns visible.
 * - Unknown / new column ids → visible.
 * - Locked columns → always visible.
 */
export function resolveColumnVisibility(
  columnIds: readonly string[],
  lockedColumnIds: readonly string[],
  saved?: DataTableColumnVisibilityMap | null,
): DataTableColumnVisibilityMap {
  const locked = new Set(lockedColumnIds);
  const result: DataTableColumnVisibilityMap = {};

  for (const id of columnIds) {
    if (locked.has(id)) {
      result[id] = true;
      continue;
    }
    if (saved && Object.prototype.hasOwnProperty.call(saved, id)) {
      result[id] = saved[id];
    } else {
      result[id] = true;
    }
  }

  return result;
}

export function getLockedColumnIds(
  columnIds: readonly string[],
  columns: readonly { id: string; hideable?: boolean }[],
): string[] {
  const hideableFalse = new Set(
    columns.filter((c) => c.hideable === false).map((c) => c.id),
  );
  return columnIds.filter((id) => hideableFalse.has(id));
}

export function visibilityMapToHiddenColumnIds(
  visibility: DataTableColumnVisibilityMap,
): string[] {
  return Object.entries(visibility)
    .filter(([, visible]) => !visible)
    .map(([id]) => id);
}

export function countVisibleHideableColumns(
  visibility: DataTableColumnVisibilityMap,
  hideableColumnIds: readonly string[],
): number {
  return hideableColumnIds.filter((id) => visibility[id]).length;
}

export function loadDataTableColumnSettings(
  storageKey: string,
): PersistedDataTableColumnSettings | null {
  if (typeof window === "undefined") {return null;}
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {return null;}
    const parsed = JSON.parse(raw) as PersistedDataTableColumnSettings;
    const visibility = sanitizePersistedVisibility(parsed?.visibility);
    if (!visibility) {return null;}
    return { visibility };
  } catch {
    return null;
  }
}

/** Page/hook persistence — replace with an API call while keeping the same payload shape. */
export function saveDataTableColumnSettings(
  storageKey: string,
  settings: PersistedDataTableColumnSettings,
): void {
  if (typeof window === "undefined") {return;}
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Quota or private mode — ignore
  }
}

export function toggleVisibilityInMap(
  visibility: DataTableColumnVisibilityMap,
  columnId: string,
  options: {
    lockedColumnIds: readonly string[];
    hideableColumnIds: readonly string[];
  },
): DataTableColumnVisibilityMap {
  const { lockedColumnIds, hideableColumnIds } = options;
  if (lockedColumnIds.includes(columnId)) {
    return enforceLockedVisibility(visibility, lockedColumnIds);
  }

  const next = { ...visibility, [columnId]: !visibility[columnId] };

  if (!next[columnId]) {
    const visibleHideable = countVisibleHideableColumns(next, hideableColumnIds);
    if (visibleHideable <= 0) {
      return visibility;
    }
  }

  return enforceLockedVisibility(next, lockedColumnIds);
}

export function enforceLockedVisibility(
  visibility: DataTableColumnVisibilityMap,
  lockedColumnIds: readonly string[],
): DataTableColumnVisibilityMap {
  const next = { ...visibility };
  for (const id of lockedColumnIds) {
    next[id] = true;
  }
  return next;
}

/** Compare visibility for the current column set (`true` / missing = visible). */
export function areColumnVisibilityMapsEqual(
  a: DataTableColumnVisibilityMap,
  b: DataTableColumnVisibilityMap,
  columnIds: readonly string[],
): boolean {
  for (const id of columnIds) {
    if ((a[id]) !== (b[id])) {
      return false;
    }
  }
  return true;
}

function sanitizePersistedVisibility(
  raw: unknown,
): DataTableColumnVisibilityMap | null {
  if (!raw || typeof raw !== "object") {return null;}
  const result: DataTableColumnVisibilityMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key === "string" && key.length > 0) {
      result[key] = value !== false;
    }
  }
  return result;
}
