import type {
  CustomDynamicDataTableColumn,
  CustomDynamicDataTableProps,
} from "../CustomDynamicDataTable";

/** Internal row keys excluded from empty-row detection. */
export const DYNAMIC_TABLE_INTERNAL_ROW_KEYS = [
  "id",
  "tempId",
  "_rowId",
  "__rowId",
  "actions",
] as const;

export type DynamicTableAutoGenerateOn = "anyField" | "lastField";

export interface DynamicTableAutoGenerateConfig {
  autoGenerateRows: boolean;
  autoGenerateOn: DynamicTableAutoGenerateOn;
  ignoreTrailingBlankRowOnSave: boolean;
  hideAddButtonWhenAutoGenerate: boolean;
  hideRemoveWhenSingleRow: boolean;
}

export interface DynamicTableRowEmptyOptions {
  /** Additional keys to ignore when checking row emptiness. */
  ignoreKeys?: string[];
}

export interface DynamicTableRowsForValidationOptions {
  /** When true, drops a trailing blank row when there is more than one row. */
  ignoreTrailingBlankRow?: boolean;
}

export function isCellValueEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && value === 0) ||
    (typeof value === "boolean" && !value) ||
    (Array.isArray(value) && value.length === 0)
  );
}

function getRowRecord(row: unknown): Record<string, unknown> {
  return row as Record<string, unknown>;
}

function getCellValue<T>(row: T, key: keyof T | string): unknown {
  return getRowRecord(row)[key as string];
}

function buildIgnoredKeySet(options?: DynamicTableRowEmptyOptions): Set<string> {
  return new Set<string>([
    ...DYNAMIC_TABLE_INTERNAL_ROW_KEYS,
    ...(options?.ignoreKeys ?? []),
  ]);
}

/**
 * Returns true when a row has no entered values in configured editable columns.
 * Ignores internal keys such as id, tempId, _rowId, and actions.
 */
export function isRowEmpty<T>(
  row: T,
  columns: CustomDynamicDataTableColumn<T>[],
  options?: DynamicTableRowEmptyOptions,
): boolean {
  const ignoredKeys = buildIgnoredKeySet(options);

  for (const col of columns) {
    if (col.readOnly) {continue;}
    if (col.excludeFromRowEmptiness) {continue;}

    const key = String(col.key);
    if (ignoredKeys.has(key)) {continue;}

    const value = getCellValue(row, col.key);
    if (!isCellValueEmpty(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalizes rows before validation/submit.
 * - Single row: always included (even when blank).
 * - Multiple rows: trailing blank row is excluded when `ignoreTrailingBlankRow` is enabled.
 */
export function getRowsForValidation<T>(
  rows: T[],
  columns: CustomDynamicDataTableColumn<T>[],
  options?: DynamicTableRowsForValidationOptions,
): T[] {
  if (!rows.length || !options?.ignoreTrailingBlankRow) {
    return rows;
  }

  if (rows.length === 1) {
    return rows;
  }

  const lastRow = rows[rows.length - 1];
  if (isRowEmpty(lastRow, columns)) {
    return rows.slice(0, -1);
  }

  return rows;
}

/** Alias of {@link getRowsForValidation} for submit-time normalization. */
export function getRowsForSubmit<T>(
  rows: T[],
  columns: CustomDynamicDataTableColumn<T>[],
  options?: DynamicTableRowsForValidationOptions,
): T[] {
  return getRowsForValidation(rows, columns, options);
}

/** Resolves the column key that triggers auto-add when completed on the last row. */
export function resolveAutoAddTriggerKey<T>(
  columns: CustomDynamicDataTableColumn<T>[],
  lastFieldKey?: keyof T | string,
): string | undefined {
  if (lastFieldKey != null && lastFieldKey !== "") {
    return String(lastFieldKey);
  }

  const triggerColumn = columns.find((col) => col.autoAddRowTrigger);
  if (triggerColumn) {
    return String(triggerColumn.key);
  }

  const editableColumns = columns.filter((col) => !col.readOnly);
  const lastEditable = editableColumns[editableColumns.length - 1];
  return lastEditable ? String(lastEditable.key) : undefined;
}

/** @deprecated Prefer {@link shouldAutoGenerateRow}. */
export function shouldAutoAddRowOnLastField(params: {
  enabled: boolean;
  disabled: boolean;
  triggerKey: string | undefined;
  rowIndex: number;
  rowsLength: number;
  changedKey: keyof unknown | string;
  value: unknown;
  maxRows?: number;
}): boolean {
  if (!params.enabled || params.disabled) {return false;}
  if (!params.triggerKey) {return false;}
  if (String(params.changedKey) !== params.triggerKey) {return false;}
  if (params.rowIndex !== params.rowsLength - 1) {return false;}
  if (isCellValueEmpty(params.value)) {return false;}
  if (params.maxRows !== undefined && params.rowsLength >= params.maxRows) {return false;}
  return true;
}

/** Resolves auto-generate settings with backward-compatible legacy prop fallbacks. */
export function resolveDynamicTableAutoGenerateConfig<T>(
  props: Pick<
    CustomDynamicDataTableProps<T>,
    | "autoGenerateRows"
    | "autoGenerateOn"
    | "autoAddRowOnLastField"
    | "ignoreTrailingBlankRowOnSave"
    | "ignoreTrailingBlankRowValidation"
    | "hideAddButtonWhenAutoGenerate"
    | "hideRemoveWhenSingleRow"
  >,
): DynamicTableAutoGenerateConfig {
  const enabled =
    props.autoGenerateRows ?? props.autoAddRowOnLastField ?? false;

  const autoGenerateOn: DynamicTableAutoGenerateOn =
    props.autoGenerateOn ??
    (props.autoAddRowOnLastField === true && props.autoGenerateRows === undefined
      ? "lastField"
      : "anyField");

  const ignoreTrailingBlankRowOnSave =
    props.ignoreTrailingBlankRowOnSave ??
    props.ignoreTrailingBlankRowValidation ??
    false;

  const hideAddButtonWhenAutoGenerate =
    props.hideAddButtonWhenAutoGenerate ?? (enabled ? true : false);

  const hideRemoveWhenSingleRow =
    props.hideRemoveWhenSingleRow ?? (enabled ? true : false);

  return {
    autoGenerateRows: enabled,
    autoGenerateOn,
    ignoreTrailingBlankRowOnSave,
    hideAddButtonWhenAutoGenerate,
    hideRemoveWhenSingleRow,
  };
}

/** True when the final row is an empty spare row. */
export function hasTrailingBlankRow<T>(
  rows: T[],
  columns: CustomDynamicDataTableColumn<T>[],
): boolean {
  if (!rows.length) {return false;}
  return isRowEmpty(rows[rows.length - 1], columns);
}

/**
 * Determines whether a blank spare row should be appended after a cell edit.
 * Prevents duplicate blank rows when a trailing spare already exists.
 */
export function shouldAutoGenerateRow<T>(params: {
  enabled: boolean;
  disabled: boolean;
  mode: DynamicTableAutoGenerateOn;
  triggerKey: string | undefined;
  columns: CustomDynamicDataTableColumn<T>[];
  previousRows: T[];
  nextRows: T[];
  rowIndex: number;
  changedKey: keyof T | string;
  value: unknown;
  maxRows?: number;
}): boolean {
  if (!params.enabled || params.disabled) {return false;}
  if (params.maxRows !== undefined && params.nextRows.length >= params.maxRows) {
    return false;
  }
  if (params.rowIndex !== params.previousRows.length - 1) {return false;}

  const prevLastRow = params.previousRows[params.rowIndex];
  const nextLastRow = params.nextRows[params.rowIndex];

  if (params.mode === "lastField") {
    if (!params.triggerKey) {return false;}
    if (String(params.changedKey) !== params.triggerKey) {return false;}
    if (isCellValueEmpty(params.value)) {return false;}
  } else {
    if (isCellValueEmpty(params.value)) {return false;}
    const col = params.columns.find(
      (column) => String(column.key) === String(params.changedKey),
    );
    if (col?.readOnly) {return false;}
    // Meta columns (e.g. selection checkbox) never spawn a new row.
    if (col?.excludeFromRowEmptiness) {return false;}
    if (!isRowEmpty(prevLastRow, params.columns)) {return false;}
  }

  if (isRowEmpty(nextLastRow, params.columns)) {return false;}

  if (hasTrailingBlankRow(params.previousRows, params.columns)) {
    return params.rowIndex === params.previousRows.length - 1;
  }

  return true;
}
