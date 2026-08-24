import React from "react";
import { cn } from "@app/utilities/cn";
import {
  themeDataTableHeadClass,
  themeDataTableShellClass,
  themeFormSectionTableSlotClass,
} from "@designSystem/theme/styles/componentStyle";
import EmptyState from "@app/components/common/EmptyState";
import { showToast } from "@app/components/common/CustomToastMessage";
import {
  buildHtmlTableFragment,
  printHtmlTableFragment,
  resolveClientExportFileBase,
  resolveClientExportPrintTitle,
  runExportAfterPaint,
} from "./partials/tableExportUtils";
import { downloadExcelXlsx } from "./partials/tableExcelExport";
import { downloadTableCsv } from "./partials/tableCsvExport";
import {
  DATA_TABLE_EXPORT_BTN_CSV_CLASS,
  DATA_TABLE_EXPORT_BTN_EXCEL_CLASS,
  DATA_TABLE_EXPORT_BTN_PRINT_CLASS,
  DATA_TABLE_TOOLBAR_SHELL_CLASS,
} from "./customDataTable/customDataTable.constants";
import { InputField } from "../formControls/InputField";
import { InputWithSuffixField } from "../formControls/InputWithSuffixField";
import { Dropdown } from "../formControls/Dropdown";
import { TextareaField } from "../formControls/TextareaField";
import { CommonCheckbox } from "../formControls/CommonCheckbox";
import {
  ServerSideDropdown,
  type ServerDropdownFetchFn,
  type ServerDropdownOption,
} from "../formControls/ServerSideDropdown";
import { DatePicker } from "../formControls/pickers/DatePicker";
import { MultiSelect } from "../formControls/MultiSelect";
import { resolveSelectClearable } from "../formControls/formControlDefaults";
import { DEFAULT_DATE_FORMAT } from "@app/utilities/dateFormat";
import {
  sanitizeInputValue,
  type InputValidationRule,
  type SanitizeInputOptions,
} from "@app/utilities/inputValidation";
import { DataTableActionButton } from "./partials/DataTableActionButton";
import { DataTableActions } from "./partials/DataTableActions";
import {
  DATA_TABLE_LAYOUT_CLASS,
  DATA_TABLE_SCROLL_CONTAINER_CLASS,
} from "./customDataTable/customDataTable.constants";
import { DATA_TABLE_ADD_ROW_BTN } from "./partials/dataTableActionConfig";
import { DataTableGlobalSearch } from "./partials/DataTableGlobalSearch";
import { AppIcon } from "@app/components/icons";
import {
  getRowsForSubmit,
  getRowsForValidation,
  hasTrailingBlankRow,
  isCellValueEmpty,
  isRowEmpty,
  resolveAutoAddTriggerKey,
  resolveDynamicTableAutoGenerateConfig,
  shouldAutoGenerateRow,
} from "./partials/dynamicTableRowUtils";
import { DynamicTableRowDragHandle } from "./partials/DynamicTableRowDragHandle";
import {
  buildDynamicTableRowOrderStorageKey,
  moveDynamicTableRowByIndex,
  reorderDynamicTableRowsById,
  saveDynamicTableRowOrder,
  type DynamicTableRowOrderStorageConfig,
} from "./partials/dynamicTableRowOrderSettings";

export {
  DYNAMIC_TABLE_INTERNAL_ROW_KEYS,
  getRowsForSubmit,
  getRowsForValidation,
  hasTrailingBlankRow,
  isCellValueEmpty,
  isRowEmpty,
  resolveAutoAddTriggerKey,
  resolveDynamicTableAutoGenerateConfig,
  shouldAutoGenerateRow,
} from "./partials/dynamicTableRowUtils";
export type {
  DynamicTableAutoGenerateConfig,
  DynamicTableAutoGenerateOn,
  DynamicTableRowEmptyOptions,
  DynamicTableRowsForValidationOptions,
} from "./partials/dynamicTableRowUtils";
export {
  applyDynamicTableRowOrder,
  buildDynamicTableRowOrderStorageKey,
  clearDynamicTableRowOrder,
  loadDynamicTableRowOrder,
  moveDynamicTableRowByIndex,
  reorderDynamicTableRowsById,
  saveDynamicTableRowOrder,
} from "./partials/dynamicTableRowOrderSettings";
export type { DynamicTableRowOrderStorageConfig } from "./partials/dynamicTableRowOrderSettings";

// ── Types ────────────────────────────────────────────────────────────

export type CustomDynamicDataTableControlType =
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "date"
  | "checkbox"
  | "textarea"
  | "serverSideDropdown"
  | "inputWithSuffix"
  | "custom";

export interface CustomDynamicDataTableOption {
  label: string;
  value: string | number | boolean;
}

export interface CustomDynamicDataTableColumn<T> {
  key: keyof T | string;
  header: string;
  /** Custom header cell content (e.g. a select-all checkbox). Falls back to `header` text. */
  renderHeader?: () => React.ReactNode;
  /**
   * Excludes this column from row-emptiness checks and auto-row-generation triggers.
   * Use for selection checkboxes and similar meta columns that are not row content.
   */
  excludeFromRowEmptiness?: boolean;
  controlType?: CustomDynamicDataTableControlType;
  placeholder?: string;
  required?: boolean;
  /** Per-row required state (overrides static `required` when set). */
  isRequired?: (row: T, rowIndex: number) => boolean;
  readOnly?: boolean;
  /** When readOnly: "control" shows a disabled field; "text" shows plain text (e.g. S.No). Default "control" for text/number. */
  readOnlyDisplay?: "text" | "control" | "number";
  disabled?: boolean;
  /** Alignment of column values. Default "left". */
  align?: "left" | "center" | "right";
  /** Alignment of column header caption. Default "left". */
  alignHeader?: "left" | "center" | "right";
  /** Per-row disabled state (e.g. code disabled until category is selected). */
  isCellDisabled?: (row: T, rowIndex: number) => boolean;
  options?: CustomDynamicDataTableOption[];
  /** Per-row options for select (overrides static `options`). */
  getOptions?: (row: T, rowIndex: number, rows?: T[]) => CustomDynamicDataTableOption[];
  validationRule?: InputValidationRule;
  sanitizeOptions?: SanitizeInputOptions;
  widthClassName?: string;
  cellClassName?: string;
  maxLength?: number;
  /** Collapsed row count for table textarea cells. Default 1. */
  textareaRows?: number;
  /** Expanded row count when the table textarea is focused. Default 2. */
  textareaExpandedRows?: number;
  /** Allow clearing the value (date, select, multiSelect, server-side dropdown). Default true. */
  clearable?: boolean;
  /** Hides the clear control for this column (`clearable={false}` equivalent). */
  hideClearButton?: boolean;
  /** Enable search in static dropdown / multiSelect. Default true. */
  searchable?: boolean;
  /** Date display/storage format. Defaults to app DEFAULT_DATE_FORMAT (dd/MM/yyyy). */
  dateFormat?: string;
  /** Async option loader for serverSideDropdown control type. */
  fetchOptions?: ServerDropdownFetchFn;
  serverDropdownInitialOptions?: ServerDropdownOption[];
  serverDropdownPageSize?: number;
  serverDropdownAutoLoadOnMount?: boolean;
  serverDropdownSearchOnFocus?: boolean;
  serverDropdownDebounceMs?: number;
  /** Row field used as the trailing suffix when controlType is inputWithSuffix. */
  suffixKey?: keyof T | string;
  /** Resolves suffix label; overrides suffixKey when set. */
  getSuffixLabel?: (row: T, rowIndex: number) => string;
  renderValue?: (row: T, rowIndex: number) => React.ReactNode;
  /** Plain value for CSV/Excel/PDF export. Falls back to the raw cell value when omitted. */
  exportValue?: (row: T, rowIndex: number) => unknown;
  /** Plain value for global search. Falls back to `exportValue`, select labels, then the raw cell value. */
  searchValue?: (row: T, rowIndex: number) => unknown;
  renderEditor?: (params: {
    row: T;
    rowIndex: number;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string;
    disabled?: boolean;
  }) => React.ReactNode;
  validate?: (value: unknown, row: T, rowIndex: number) => string | undefined;
  /** Optional callback invoked when cell field loses focus. */
  onBlur?: (value: unknown, row: T, rowIndex: number) => void;
  /**
   * When true, this column re-validates on each edit without validating the whole table.
   * Use for live checks (e.g. dimension max) while leaving required fields until Save.
   */
  validateOnChange?: boolean;
  /**
   * When true, this column re-validates when the cell loses focus.
   * Use when validation should run only after the user finishes entering a value.
   */
  validateOnBlur?: boolean;
  rules?: unknown;
  /**
   * When table auto-generation uses {@link autoGenerateOn} `"lastField"`, completing
   * this column on the last row appends one blank row. Takes precedence over
   * `lastFieldKey` when set on exactly one column.
   */
  autoAddRowTrigger?: boolean;
  /**
   * For select columns: when false, Dropdown will not auto-select the only remaining option.
   * Defaults to true when omitted.
   */
  autoSelectSingleOption?: boolean;
}

export interface CustomDynamicDataTableValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CustomDynamicDataTableRef<T = unknown> {
  validateTable: () => CustomDynamicDataTableValidationResult;
  clearErrors: () => void;
  /** Rows included in validation (trailing blank row may be excluded). */
  getRowsForValidation: () => T[];
  /** Rows to submit after excluding ignored trailing blank row, when configured. */
  getRowsForSubmit: () => T[];
  /** Moves a row by index in the full rows array (no-op when row reorder is disabled). */
  moveRow: (fromIndex: number, toIndex: number) => void;
}

export interface CustomDynamicDataTableProps<T> {
  columns: CustomDynamicDataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  createEmptyRow: () => T;
  onRowsChange: (rows: T[]) => void;

  /** Optional label used only for export filename fallback — not shown in the toolbar. */
  title?: string;
  emptyMessage?: string;

  allowAdd?: boolean;
  allowRemove?: boolean;
  minRows?: number;
  maxRows?: number;

  isLoading?: boolean;
  disabled?: boolean;

  /** Optional per-row class name for styling (e.g. production-change highlights). */
  getRowClassName?: (row: T, rowIndex: number) => string | undefined;

  validateOnChange?: boolean;
  /**
   * When true, validates existing rows before adding another. The first row add has no
   * validation; further adds are blocked until current rows pass required-field checks.
   */
  validatePreviousRowsOnAdd?: boolean;
  onValidationChange?: (result: CustomDynamicDataTableValidationResult) => void;

  /**
   * When true, appends one blank row after the user enters a value in the configured
   * last field on the current final row. Default false (backward compatible).
   * @deprecated Prefer {@link autoGenerateRows} with {@link autoGenerateOn} `"lastField"`.
   */
  autoAddRowOnLastField?: boolean;
  /**
   * When true, excludes a trailing blank row from validation when more than one row
   * exists. Default false (backward compatible).
   * @deprecated Prefer {@link ignoreTrailingBlankRowOnSave}.
   */
  ignoreTrailingBlankRowValidation?: boolean;

  /** Enables Excel-style continuous row entry with an auto-generated trailing blank row. */
  autoGenerateRows?: boolean;
  /** When auto-generation is enabled, controls which cell edit triggers a new row. */
  autoGenerateOn?: "anyField" | "lastField";
  /**
   * When true, drops a trailing blank row from validation/submit when more than one row
   * exists. Single-row tables always validate the lone row.
   */
  ignoreTrailingBlankRowOnSave?: boolean;
  /** Hides the Add button while a trailing blank spare row exists. Default true when auto-generate is on. */
  hideAddButtonWhenAutoGenerate?: boolean;
  /** Hides the Remove button when only one row remains. Default true when auto-generate is on. */
  hideRemoveWhenSingleRow?: boolean;

  /**
   * Column key that triggers auto-add when completed on the last row. Falls back to
   * the column marked with `autoAddRowTrigger`, then the last editable column.
   * Used when {@link autoGenerateOn} is `"lastField"`.
   */
  lastFieldKey?: keyof T | string;

  addButtonLabel?: string;

  /**
   * When `true`, shows a toolbar search box. Default `false` (hidden).
   * Opt in per page when rows are searchable via cell values, `searchValue`,
   * or `exportValue` / select labels. Prefer leaving off for editable entry grids.
   */
  enableGlobalSearch?: boolean;
  /**
   * When `true`, shows the full export toolbar (PDF, Excel, Print, CSV) — same as
   * {@link CustomDataTable}. Default `false`.
   */
  enableExport?: boolean;
  /** Base filename for exports (no extension). Used when {@link enableExport} is `true`. */
  exportFileName?: string;
  /** Alias of {@link exportFileName} for parity with `CustomDataTable`. */
  exportFileBase?: string;
  /** Alias of {@link exportFileName} for parity with `CustomDataTable`. */
  pageName?: string;
  /** Optional custom CSS class name for the table container. */
  className?: string;
  hideActionColumn?: boolean;
  /** Controls visibility of the actions column. Default true. When false, hides the actions column. */
  showActionsColumn?: boolean;
  /** When true, displays the Add Row (+) icon only on the final row. Default false. */
  showAddOnlyOnLastRow?: boolean;

  /**
   * Enables drag-and-drop row reordering via a leading handle column.
   * Disabled while the table is loading, read-only, or global search is filtering rows.
   */
  enableRowReorder?: boolean;
  /** Shows the drag-handle column. Default `true` when {@link enableRowReorder} is on. */
  showRowDragHandle?: boolean;
  /** Called after rows are reordered (`onRowsChange` is always invoked as well). */
  onRowReorder?: (rows: T[]) => void;
  /**
   * When set, persists row id order to localStorage after each reorder.
   * Pair with {@link useDynamicTableRowOrder} to restore order on load.
   */
  rowOrderStorage?: DynamicTableRowOrderStorageConfig;
  /** Optional extra controls rendered before add/remove in the actions column. */
  renderExtraRowActions?: (row: T, rowIndex: number) => React.ReactNode;
}

// ── Style constants (aligned with CustomDataTable) ───────────────────

const TABLE_CONTAINER = cn(
  themeDataTableShellClass,
  themeFormSectionTableSlotClass,
  "min-w-0 overflow-hidden",
);

const THEAD = themeDataTableHeadClass;

const TH =
  "px-2 py-1.5 text-[11px] font-semibold text-primary-900  tracking-wide select-none dark:text-primary-100 text-left align-middle";

const TD_BASE = "px-2 py-1 text-xs align-top";

const ROW_BORDER = "border-b border-slate-100 dark:border-slate-800";

const REORDER_TH =
  "w-9 min-w-9 px-1 py-1.5 text-center align-middle select-none";

const REORDER_TD = "w-9 min-w-9 px-1 py-1 text-center align-middle";

const ERROR_TEXT =
  "mt-0.5 text-[10px] leading-tight text-danger-600 dark:text-danger-400";

const SPINNER_OVERLAY =
  "absolute inset-0 z-[60] flex items-center justify-center bg-white/70 dark:bg-slate-950/70";

// ── Helpers ──────────────────────────────────────────────────────────

function getCellValue<T>(row: T, key: keyof T | string): unknown {
  return (row as Record<string, unknown>)[key as string];
}

function setCellValue<T>(row: T, key: keyof T | string, value: unknown): T {
  return { ...row, [key as string]: value };
}

function isColumnClearable<T>(col: CustomDynamicDataTableColumn<T>): boolean {
  if (col.hideClearButton) {return false;}
  return resolveSelectClearable(col.clearable);
}

function resolveCellDisabled<T>(
  tableDisabled: boolean,
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
): boolean {
  return (
    tableDisabled || !!col.disabled || !!col.isCellDisabled?.(row, rowIndex)
  );
}

function resolveColumnRequired<T>(
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
): boolean {
  if (col.isRequired) {
    return col.isRequired(row, rowIndex);
  }
  return !!col.required;
}

function resolveSelectOptions<T>(
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
): CustomDynamicDataTableOption[] {
  return col.getOptions?.(row, rowIndex) ?? col.options ?? [];
}

function mapOptionsForSelectControls(
  options: CustomDynamicDataTableOption[],
): { id: string; value: string }[] {
  return options.map((opt) => ({
    id: String(opt.value),
    value: opt.label,
  }));
}

/** MultiSelect stores string[] of option ids (same id shape as select). */
function normalizeMultiSelectValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (value == null || value === "") {
    return [];
  }
  return [String(value)];
}

function formatMultiSelectDisplay<T>(
  value: unknown,
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
): string {
  const ids = normalizeMultiSelectValue(value);
  if (ids.length === 0) {return "";}

  const options = resolveSelectOptions(col, row, rowIndex);
  return ids
    .map((id) => options.find((opt) => String(opt.value) === id)?.label ?? id)
    .join(", ");
}

function sanitizeDynamicCellValue<T>(
  raw: string,
  col: CustomDynamicDataTableColumn<T>,
): string {
  if (!col.validationRule) {return raw;}
  return sanitizeInputValue(raw, col.validationRule, {
    maxLength: col.maxLength,
    ...col.sanitizeOptions,
  });
}

function resolveSuffixLabel<T>(
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
): string {
  if (col.getSuffixLabel) {
    return col.getSuffixLabel(row, rowIndex);
  }

  if (col.suffixKey) {
    const value = getCellValue(row, col.suffixKey);
    return value != null ? String(value) : "";
  }

  return "";
}

function EditableCellShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0 w-full", className)}>{children}</div>;
}

function resolveColumnTextAlign(
  align?: "left" | "center" | "right",
): string | undefined {
  if (align === "right") {return "text-right";}
  if (align === "center") {return "text-center";}
  return undefined;
}

function resolveNumericInputClass(
  cellClassName?: string,
  align?: "left" | "center" | "right",
): string | undefined {
  if (align === "right" || cellClassName?.includes("text-right")) {
    return "text-right";
  }
  return undefined;
}

function renderReadOnlyCell<T>(
  col: CustomDynamicDataTableColumn<T>,
  row: T,
  rowIndex: number,
  value: unknown,
  fieldName: string,
): React.ReactNode {
  const useTextDisplay =
    col.readOnlyDisplay === "text" ||
    (col.readOnlyDisplay !== "control" && !!col.renderValue);

  if (useTextDisplay) {
    const displayContent =
      col.controlType === "multiSelect"
        ? formatMultiSelectDisplay(value, col, row, rowIndex)
        : col.renderValue
          ? col.renderValue(row, rowIndex)
          : value != null
            ? String(value)
            : "";

    return (
      <span
        className={cn(
          "text-xs text-slate-700 dark:text-slate-200 leading-7",
          resolveColumnTextAlign(col.align),
          col.cellClassName,
        )}
      >
        {displayContent}
      </span>
    );
  }

  const controlType = col.controlType ?? "text";

  if (controlType === "multiSelect") {
    return (
      <MultiSelect
        label={col.header}
        name={fieldName}
        hideLabel
        placeholder={col.placeholder ?? "Select…"}
        options={mapOptionsForSelectControls(
          resolveSelectOptions(col, row, rowIndex),
        )}
        value={normalizeMultiSelectValue(value)}
        disabled
        searchable={col.searchable ?? true}
        clearable={isColumnClearable(col)}
      />
    );
  }

  const displayValue = value != null ? String(value) : "";

  if (controlType === "textarea") {
    return (
      <TextareaField
        label={col.header}
        name={fieldName}
        hideLabel
        compact
        showCharCount={false}
        placeholder={col.placeholder}
        value={displayValue}
        disabled
        readOnly
        maxLength={col.maxLength}
        validationRule={col.validationRule}
        validationOptions={col.sanitizeOptions}
        rows={col.textareaRows ?? 1}
        expandRowsOnFocus={col.textareaExpandedRows ?? 2}
        showValueTooltip
      />
    );
  }

  if (controlType === "inputWithSuffix") {
    return (
      <InputWithSuffixField
        label={col.header}
        name={fieldName}
        hideLabel
        compact
        placeholder={col.placeholder}
        value={displayValue}
        suffixLabel={resolveSuffixLabel(col, row, rowIndex)}
        disabled
        readOnly
        maxLength={col.maxLength}
        validationRule={col.validationRule}
        validationOptions={col.sanitizeOptions}
        inputClassName={resolveNumericInputClass(col.cellClassName, col.align)}
      />
    );
  }

  if (controlType === "checkbox") {
    return (
      <div className="grid min-h-9 place-items-center">
        <CommonCheckbox
          label={col.header}
          name={fieldName}
          hideLabel
          checked={!!value}
          disabled
          className="w-auto! gap-0!"
        />
      </div>
    );
  }

  return (
    <InputField
      label={col.header}
      name={fieldName}
      type={controlType === "number" ? "number" : "text"}
      hideLabel
      placeholder={col.placeholder}
      value={displayValue}
      disabled
      readOnly
      className={resolveNumericInputClass(col.cellClassName, col.align)}
    />
  );
}

function resolveSelectSearchLabel<T>(
  row: T,
  col: CustomDynamicDataTableColumn<T>,
  rowIndex: number,
  raw: unknown,
): string | null {
  if (raw == null || raw === "") {return null;}

  if (col.controlType === "multiSelect" && Array.isArray(raw)) {
    const opts =
      col.getOptions?.(row, rowIndex) ?? col.options ?? [];
    return raw
      .map((v) => {
        const match = opts.find(
          (o) => String(o.value) === String(v) || String((o as { id?: unknown }).id) === String(v),
        );
        return match?.label ?? String(v);
      })
      .join(" ");
  }

  if (col.controlType === "select" || col.controlType === "serverSideDropdown") {
    const opts =
      col.getOptions?.(row, rowIndex) ?? col.options ?? [];
    const match = opts.find(
      (o) =>
        String(o.value) === String(raw) ||
        String((o as { id?: unknown }).id) === String(raw),
    );
    if (match?.label) {return match.label;}
  }

  return null;
}

/** Prefer human-readable text (export/label) over raw IDs for global search. */
function getSearchableCellText<T>(
  row: T,
  col: CustomDynamicDataTableColumn<T>,
  rowIndex: number,
): string {
  if (col.searchValue) {
    const custom = col.searchValue(row, rowIndex);
    if (custom != null && custom !== "") {
      return String(custom);
    }
  }

  if (col.exportValue) {
    const exported = col.exportValue(row, rowIndex);
    if (exported != null && exported !== "") {
      return String(exported);
    }
  }

  const raw = getCellValue(row, col.key);
  const selectLabel = resolveSelectSearchLabel(row, col, rowIndex, raw);
  if (selectLabel) {return selectLabel;}

  if (col.renderValue) {
    const rendered = col.renderValue(row, rowIndex);
    if (typeof rendered === "string" || typeof rendered === "number") {
      return String(rendered);
    }
  }

  if (raw == null || raw === "") {return "";}
  return String(raw);
}

function rowMatchesSearch<T>(
  row: T,
  columns: CustomDynamicDataTableColumn<T>[],
  needle: string,
  rowIndex: number,
): boolean {
  return columns.some((col) => {
    const text = getSearchableCellText(row, col, rowIndex);
    if (!text) {return false;}
    return text.toLowerCase().includes(needle);
  });
}

// ── Component (inner) ────────────────────────────────────────────────

function CustomDynamicDataTableInner<T>(
  props: CustomDynamicDataTableProps<T>,
  ref: React.ForwardedRef<CustomDynamicDataTableRef<T>>,
) {
  const {
    columns,
    rows,
    getRowId,
    createEmptyRow,
    onRowsChange,
    title,
    emptyMessage = "No data available",
    allowAdd = true,
    allowRemove = true,
    minRows = 0,
    maxRows,
    isLoading = false,
    disabled = false,
    getRowClassName,
    validateOnChange = false,
    validatePreviousRowsOnAdd = false,
    onValidationChange,
    autoAddRowOnLastField = false,
    ignoreTrailingBlankRowValidation = false,
    autoGenerateRows,
    autoGenerateOn,
    ignoreTrailingBlankRowOnSave,
    hideAddButtonWhenAutoGenerate,
    hideRemoveWhenSingleRow,
    lastFieldKey,
    addButtonLabel = "Add Row",
    enableGlobalSearch = false,
    enableExport = false,
    exportFileName,
    exportFileBase: exportFileBaseProp,
    pageName,
    showActionsColumn = true,
    className,
    hideActionColumn,
    showAddOnlyOnLastRow = false,
    enableRowReorder = false,
    showRowDragHandle,
    onRowReorder,
    rowOrderStorage,
    renderExtraRowActions,
  } = props;

  const isActionColumnHidden = hideActionColumn ?? !showActionsColumn;

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [exportBusy, setExportBusy] = React.useState(false);
  const exportBusyRef = React.useRef(false);
  const [draggingRowId, setDraggingRowId] = React.useState<
    string | number | null
  >(null);
  const [dragOverRowId, setDragOverRowId] = React.useState<
    string | number | null
  >(null);

  const showReorderColumn = enableRowReorder && (showRowDragHandle ?? true);

  const isGlobalSearchFiltering =
    enableGlobalSearch && globalSearch.trim().length > 0;

  const canRowReorder =
    enableRowReorder &&
    !disabled &&
    !isLoading &&
    !isGlobalSearchFiltering &&
    rows.length > 1;

  const rowOrderStorageKey = React.useMemo(
    () =>
      rowOrderStorage
        ? buildDynamicTableRowOrderStorageKey(
            rowOrderStorage.userId,
            rowOrderStorage.moduleKey,
            rowOrderStorage.tableKey,
          )
        : null,
    [rowOrderStorage],
  );

  const exportFileBase = React.useMemo(
    () => resolveClientExportFileBase(exportFileName || exportFileBaseProp, pageName ?? title),
    [exportFileName, exportFileBaseProp, pageName, title],
  );

  const displayRows = React.useMemo(() => {
    const trimmed = globalSearch.trim().toLowerCase();
    if (!enableGlobalSearch || !trimmed) {return rows;}
    return rows.filter((row, rowIndex) =>
      rowMatchesSearch(row, columns, trimmed, rowIndex),
    );
  }, [rows, columns, globalSearch, enableGlobalSearch]);

  /** Blank placeholder / trailing auto-rows must not appear in PDF/Excel/CSV/print. */
  const exportRows = React.useMemo(
    () => displayRows.filter((row) => !isRowEmpty(row, columns)),
    [displayRows, columns],
  );

  const exportColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        id: String(col.key),
        header: col.header,
        accessor: (row: T) => {
          const rowIndex = exportRows.indexOf(row);
          const idx = rowIndex >= 0 ? rowIndex : 0;
          if (col.exportValue) {
            return col.exportValue(row, idx);
          }
          if (col.renderValue) {
            return col.renderValue(row, idx);
          }
          if (col.controlType === "select" && col.getOptions) {
            const val = getCellValue(row, col.key);
            const opts = col.getOptions(row, idx);
            const match = opts?.find(
              (o) =>
                o.value === String(val) ||
                (o as CustomDynamicDataTableOption & { id?: string | number }).id ===
                  String(val),
            );
            if (match) {
              return match.label;
            }
          }
          return getCellValue(row, col.key);
        },
        exportable: true,
      })),
    [columns, exportRows],
  );

  const exportColumnsRef = React.useRef(exportColumns);
  const displayRowsExportRef = React.useRef(exportRows);
  React.useLayoutEffect(() => {
    exportColumnsRef.current = exportColumns;
    displayRowsExportRef.current = exportRows;
  }, [exportColumns, exportRows]);

  const showToolbar = enableGlobalSearch || enableExport;
  const canExport = enableExport && exportRows.length > 0;

  const runClientExport = React.useCallback((task: () => void) => {
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

  const handleExportCsv = React.useCallback(() => {
    runClientExport(() => {
      downloadTableCsv(
        exportColumnsRef.current,
        displayRowsExportRef.current,
        `${exportFileBase}.csv`,
        { title: resolveClientExportPrintTitle(exportFileBase) },
      );
    });
  }, [exportFileBase, runClientExport]);

  const handleExportExcel = React.useCallback(() => {
    runClientExport(() =>
      downloadExcelXlsx(
        exportColumnsRef.current,
        displayRowsExportRef.current,
        `${exportFileBase}.xlsx`,
        { title: resolveClientExportPrintTitle(exportFileBase) },
      ),
    );
  }, [exportFileBase, runClientExport]);

  const handleExportPrint = React.useCallback(() => {
    runClientExport(() => {
      const html = buildHtmlTableFragment(
        exportColumnsRef.current,
        displayRowsExportRef.current,
      );
      printHtmlTableFragment(
        html,
        resolveClientExportPrintTitle(exportFileBase),
      );
    });
  }, [exportFileBase, runClientExport]);

  const totalColumns =
    columns.length + (showReorderColumn ? 1 : 0) + (isActionColumnHidden ? 0 : 1);

  const commitRowReorder = React.useCallback(
    (fromRowId: string | number, toRowId: string | number) => {
      if (!canRowReorder || String(fromRowId) === String(toRowId)) {return;}

      const next = reorderDynamicTableRowsById(
        rows,
        getRowId,
        fromRowId,
        toRowId,
      );
      onRowsChange(next);
      onRowReorder?.(next);

      if (rowOrderStorageKey) {
        saveDynamicTableRowOrder(
          rowOrderStorageKey,
          next.map((row) => String(getRowId(row))),
        );
      }
    },
    [
      canRowReorder,
      rows,
      getRowId,
      onRowsChange,
      onRowReorder,
      rowOrderStorageKey,
    ],
  );

  const handleRowDragStart =
    (rowId: string | number) => (event: React.DragEvent) => {
      if (!canRowReorder) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(rowId));
      setDraggingRowId(rowId);
      setDragOverRowId(rowId);
    };

  const handleRowDragOver =
    (rowId: string | number) =>
    (event: React.DragEvent<HTMLTableRowElement>) => {
      if (!canRowReorder || draggingRowId == null) {return;}
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (String(dragOverRowId) !== String(rowId)) {
        setDragOverRowId(rowId);
      }
    };

  const handleRowDrop = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
  };

  const handleRowDragEnd = () => {
    if (
      canRowReorder &&
      draggingRowId != null &&
      dragOverRowId != null &&
      String(draggingRowId) !== String(dragOverRowId)
    ) {
      commitRowReorder(draggingRowId, dragOverRowId);
    }
    setDraggingRowId(null);
    setDragOverRowId(null);
  };

  const autoGenerateConfig = React.useMemo(
    () =>
      resolveDynamicTableAutoGenerateConfig({
        autoGenerateRows,
        autoGenerateOn,
        autoAddRowOnLastField,
        ignoreTrailingBlankRowOnSave,
        ignoreTrailingBlankRowValidation,
        hideAddButtonWhenAutoGenerate,
        hideRemoveWhenSingleRow,
      }),
    [
      autoGenerateRows,
      autoGenerateOn,
      autoAddRowOnLastField,
      ignoreTrailingBlankRowOnSave,
      ignoreTrailingBlankRowValidation,
      hideAddButtonWhenAutoGenerate,
      hideRemoveWhenSingleRow,
    ],
  );

  const autoAddTriggerKey = React.useMemo(
    () => resolveAutoAddTriggerKey(columns, lastFieldKey),
    [columns, lastFieldKey],
  );

  const resolveValidationRows = React.useCallback(
    (targetRows: T[]) =>
      getRowsForValidation(targetRows, columns, {
        ignoreTrailingBlankRow: autoGenerateConfig.ignoreTrailingBlankRowOnSave,
      }),
    [columns, autoGenerateConfig.ignoreTrailingBlankRowOnSave],
  );

  // ── Validation engine ──────────────────────────────────────────────

  const runValidation = React.useCallback(
    (targetRows: T[]): CustomDynamicDataTableValidationResult => {
      const newErrors: Record<string, string> = {};

      targetRows.forEach((row, rowIndex) => {
        const rowId = getRowId(row);
        for (const col of columns) {
          if (col.readOnly) {continue;}

          const value = getCellValue(row, col.key);
          const errorKey = `${rowId}.${col.key as string}`;
          const cellDisabled = resolveCellDisabled(false, col, row, rowIndex);
          const isRequired = resolveColumnRequired(col, row, rowIndex);

          if (isRequired && !cellDisabled) {
            if (isCellValueEmpty(value)) {
              newErrors[errorKey] = "This field is required.";
              continue;
            }
          }

          if (col.validate) {
            const msg = col.validate(value, row, rowIndex);
            if (msg) {
              newErrors[errorKey] = msg;
            }
          }
        }
      });

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    [columns, getRowId],
  );

  // ── Expose ref API ─────────────────────────────────────────────────

  React.useImperativeHandle(
    ref,
    () => ({
      validateTable: () => {
        const validationRows = resolveValidationRows(rows);
        const result = runValidation(validationRows);
        setErrors(result.errors);
        onValidationChange?.(result);
        return result;
      },
      clearErrors: () => {
        setErrors({});
      },
      getRowsForValidation: () => resolveValidationRows(rows),
      getRowsForSubmit: () =>
        getRowsForSubmit(rows, columns, {
          ignoreTrailingBlankRow:
            autoGenerateConfig.ignoreTrailingBlankRowOnSave,
        }),
      moveRow: (fromIndex: number, toIndex: number) => {
        if (!enableRowReorder || disabled || isLoading) {return;}
        const next = moveDynamicTableRowByIndex(rows, fromIndex, toIndex);
        onRowsChange(next);
        onRowReorder?.(next);
        if (rowOrderStorageKey) {
          saveDynamicTableRowOrder(
            rowOrderStorageKey,
            next.map((row) => String(getRowId(row))),
          );
        }
      },
    }),
    [
      rows,
      resolveValidationRows,
      runValidation,
      onValidationChange,
      columns,
      autoGenerateConfig.ignoreTrailingBlankRowOnSave,
      enableRowReorder,
      disabled,
      isLoading,
      onRowsChange,
      onRowReorder,
      rowOrderStorageKey,
      getRowId,
    ],
  );

  // Sync error state with the latest `rows` identity during render rather than in an effect —
  // sentinel-guarded on `rows` (mirrors the previous ref-comparison, now via useState so the
  // comparison itself happens during render per React's "storing info from previous renders").
  // The `onValidationChange` callback is a genuine "notify external system" side effect, so it
  // stays in a small useEffect keyed off the pending result computed below.
  const [prevRowsForErrorSync, setPrevRowsForErrorSync] = React.useState<T[]>(rows);
  const [pendingValidationResult, setPendingValidationResult] =
    React.useState<CustomDynamicDataTableValidationResult | null>(null);
  if (rows !== prevRowsForErrorSync) {
    setPrevRowsForErrorSync(rows);
    const currentIds = new Set(rows.map((r) => String(getRowId(r))));

    if (validateOnChange) {
      const result = runValidation(resolveValidationRows(rows));
      setErrors(result.errors);
      setPendingValidationResult(result);
    } else {
      // Clean up errors for deleted rows
      setErrors((prev) => {
        const cleaned = { ...prev };
        let changed = false;
        for (const key of Object.keys(cleaned)) {
          const rowId = key.split(".")[0];
          if (!currentIds.has(rowId)) {
            delete cleaned[key];
            changed = true;
          }
        }

        if (validatePreviousRowsOnAdd && Object.keys(cleaned).length > 0) {
          // Re-run validation for remaining rows to update errors
          const result = runValidation(resolveValidationRows(rows));
          setPendingValidationResult(result);
          return result.errors;
        }

        return changed ? cleaned : prev;
      });
    }
  }

  // Notify the external `onValidationChange` callback whenever a new re-validation result
  // is queued. Uses a ref (not state) to track "already notified for this result" so the
  // effect never needs to call setState on `pendingValidationResult` itself — refs are a
  // legitimate mutable escape hatch for effect bookkeeping and are exempt from this rule.
  const notifiedValidationResultRef = React.useRef<typeof pendingValidationResult>(null);
  React.useEffect(() => {
    if (
      pendingValidationResult &&
      notifiedValidationResultRef.current !== pendingValidationResult
    ) {
      notifiedValidationResultRef.current = pendingValidationResult;
      onValidationChange?.(pendingValidationResult);
    }
  }, [pendingValidationResult, onValidationChange]);

  // ── Row mutations ──────────────────────────────────────────────────

  const handleAddRow = () => {
    if (disabled) {return;}
    if (maxRows !== undefined && rows.length >= maxRows) {return;}

    if (validatePreviousRowsOnAdd && rows.length > 0) {
      const result = runValidation(resolveValidationRows(rows));
      if (!result.isValid) {
        setErrors(result.errors);
        onValidationChange?.(result);
        return;
      }
      setErrors({});
    }

    const newRow = createEmptyRow();
    const next = [...rows, newRow];
    onRowsChange(next);

    if (validateOnChange) {
      const result = runValidation(resolveValidationRows(next));
      setErrors(result.errors);
      onValidationChange?.(result);
    }
  };

  const handleRemoveRow = (displayIndex: number) => {
    if (disabled) {return;}
    if (rows.length <= minRows) {return;}
    const row = displayRows[displayIndex];
    if (!row) {return;}
    const next = rows.filter((r) => getRowId(r) !== getRowId(row));
    onRowsChange(next);
  };

  const handleCellChange = (
    row: T,
    _displayRowIndex: number,
    key: keyof T | string,
    value: unknown,
  ) => {
    const actualRowIndex = rows.findIndex((r) => getRowId(r) === getRowId(row));
    if (actualRowIndex === -1) {return;}

    const updated = setCellValue(row, key, value);
    const next = rows.map((r, i) => (i === actualRowIndex ? updated : r));

    const shouldAppendBlankRow = shouldAutoGenerateRow({
      enabled: autoGenerateConfig.autoGenerateRows,
      disabled,
      mode: autoGenerateConfig.autoGenerateOn,
      triggerKey: autoAddTriggerKey,
      columns,
      previousRows: rows,
      nextRows: next,
      rowIndex: actualRowIndex,
      changedKey: key,
      value,
      maxRows,
    });
    const finalRows = shouldAppendBlankRow ? [...next, createEmptyRow()] : next;

    onRowsChange(finalRows);

    const rowId = getRowId(row);
    const errorKey = `${rowId}.${key as string}`;
    const changedCol = columns.find((col) => String(col.key) === String(key));

    if (validateOnChange) {
      const result = runValidation(resolveValidationRows(finalRows));
      setErrors(result.errors);
      onValidationChange?.(result);
      return;
    }

    if (changedCol?.validateOnChange) {
      const validationRow =
        resolveValidationRows(finalRows).find((r) => getRowId(r) === rowId) ??
        finalRows[actualRowIndex];
      const validationRowIndex = finalRows.findIndex(
        (r) => getRowId(r) === rowId,
      );

      setErrors((prev) => {
        const cleaned = { ...prev };

        const applyColError = (
          col: CustomDynamicDataTableColumn<T>,
          targetRow: T,
          targetIndex: number,
        ) => {
          const colErrorKey = `${rowId}.${String(col.key)}`;
          if (col.readOnly) {
            delete cleaned[colErrorKey];
            return;
          }

          // Live column validation: custom rules only (required waits for Save).
          if (col.validate) {
            const cellValue = getCellValue(targetRow, col.key);
            const msg = col.validate(cellValue, targetRow, targetIndex);
            if (msg) {
              cleaned[colErrorKey] = msg;
            } else {
              delete cleaned[colErrorKey];
            }
            return;
          }

          delete cleaned[colErrorKey];
        };

        if (validationRow) {
          applyColError(changedCol, validationRow, validationRowIndex);

          // Re-check sibling live-validated columns on the same row (cross-field rules).
          for (const relatedCol of columns) {
            if (
              relatedCol.validateOnChange &&
              String(relatedCol.key) !== String(key)
            ) {
              applyColError(relatedCol, validationRow, validationRowIndex);
            }
          }
        }

        return cleaned;
      });
      return;
    }

    if (errors[errorKey]) {
      setErrors((prev) => {
        const cleaned = { ...prev };
        delete cleaned[errorKey];
        return cleaned;
      });
    }
  };

  const handleCellBlur = (
    col: CustomDynamicDataTableColumn<T>,
    row: T,
    rowIndex: number,
  ) => {
    col.onBlur?.(getCellValue(row, col.key), row, rowIndex);

    if (!col.validateOnBlur) {
      return;
    }

    const rowId = getRowId(row);
    const validationRow =
      resolveValidationRows(rows).find((r) => getRowId(r) === rowId) ?? row;
    const validationRowIndex = rows.findIndex((r) => getRowId(r) === rowId);

    setErrors((prev) => {
      const cleaned = { ...prev };

      const applyColError = (
        targetCol: CustomDynamicDataTableColumn<T>,
        targetRow: T,
        targetIndex: number,
      ) => {
        const colErrorKey = `${rowId}.${String(targetCol.key)}`;
        if (targetCol.readOnly) {
          delete cleaned[colErrorKey];
          return;
        }

        if (targetCol.validate) {
          const cellValue = getCellValue(targetRow, targetCol.key);
          const msg = targetCol.validate(cellValue, targetRow, targetIndex);
          if (msg) {
            cleaned[colErrorKey] = msg;
          } else {
            delete cleaned[colErrorKey];
          }
          return;
        }

        delete cleaned[colErrorKey];
      };

      if (validationRow) {
        applyColError(col, validationRow, validationRowIndex);

        for (const relatedCol of columns) {
          if (
            relatedCol.validateOnBlur &&
            String(relatedCol.key) !== String(col.key)
          ) {
            applyColError(relatedCol, validationRow, validationRowIndex);
          }
        }
      }

      return cleaned;
    });
  };

  // ── Cell editor renderer ───────────────────────────────────────────

  const renderCellEditor = (
    col: CustomDynamicDataTableColumn<T>,
    row: T,
    rowIndex: number,
  ) => {
    const rowId = getRowId(row);
    const value = getCellValue(row, col.key);
    const errorKey = `${rowId}.${col.key as string}`;
    const error = errors[errorKey];
    const cellDisabled = resolveCellDisabled(disabled, col, row, rowIndex);
    const cellReadOnly = col.readOnly;
    const fieldName = `${rowId}-${col.key as string}`;

    if (cellReadOnly) {
      return renderReadOnlyCell(col, row, rowIndex, value, fieldName);
    }

    if (col.controlType === "custom" && col.renderEditor) {
      return (
        <EditableCellShell>
          {col.renderEditor({
            row,
            rowIndex,
            value,
            onChange: (v) => { handleCellChange(row, rowIndex, col.key, v); },
            error: error,
            disabled: cellDisabled,
          })}
        </EditableCellShell>
      );
    }

    const onChange = (v: unknown) =>
      { handleCellChange(row, rowIndex, col.key, v); };

    switch (col.controlType) {
      case "number":
        return (
          <EditableCellShell>
            <InputField
              label={col.header}
              name={fieldName}
              type="number"
              hideLabel
              errorDisplay="tooltip"
              placeholder={col.placeholder}
              value={value !== undefined && value !== null ? String(value) : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                if (col.validationRule) {
                  onChange(sanitizeDynamicCellValue(raw, col));
                  return;
                }
                onChange(raw === "" ? "" : Number(raw));
              }}
              onBlur={() => { handleCellBlur(col, row, rowIndex); }}
              disabled={cellDisabled}
              maxLength={col.maxLength}
              validationRule={col.validationRule}
              error={error}
              className={resolveNumericInputClass(col.cellClassName, col.align)}
            />
          </EditableCellShell>
        );

      case "date":
        return (
          <EditableCellShell>
            <DatePicker
              label={col.header}
              name={fieldName}
              hideLabel
              format={col.dateFormat ?? DEFAULT_DATE_FORMAT}
              placeholder={col.placeholder ?? DEFAULT_DATE_FORMAT}
              value={value != null ? String(value) : ""}
              onChange={(val: string) => { onChange(val); }}
              disabled={cellDisabled}
              showClearButton={isColumnClearable(col)}
              error={error}
            />
          </EditableCellShell>
        );

      case "select":
        return (
          <EditableCellShell>
            <Dropdown
              label={col.header}
              name={fieldName}
              hideLabel
              placeholder={col.placeholder ?? "Select…"}
              options={mapOptionsForSelectControls(
                resolveSelectOptions(col, row, rowIndex),
              )}
              value={value != null ? String(value) : ""}
              onValueChange={(val: string | undefined) => { onChange(val ?? ""); }}
              disabled={cellDisabled}
              searchable={col.searchable ?? true}
              required={col.required}
              autoSelectSingleOption={col.autoSelectSingleOption}
              error={error}
              {...(col.clearable === false ? { clearable: false } : {})}
              {...(col.hideClearButton ? { hideClearButton: true } : {})}
            />
          </EditableCellShell>
        );

      case "multiSelect":
        return (
          <EditableCellShell>
            <MultiSelect
              label={col.header}
              name={fieldName}
              hideLabel
              placeholder={col.placeholder ?? "Select…"}
              options={mapOptionsForSelectControls(
                resolveSelectOptions(col, row, rowIndex),
              )}
              value={normalizeMultiSelectValue(value)}
              onValueChange={(val: string[]) => { onChange(val); }}
              disabled={cellDisabled}
              clearable={isColumnClearable(col)}
              searchable={col.searchable ?? true}
              required={col.required}
              error={error}
            />
          </EditableCellShell>
        );

      case "serverSideDropdown": {
        if (!col.fetchOptions) {
          return (
            <span className={ERROR_TEXT}>
              Column &quot;{col.header}&quot; requires fetchOptions.
            </span>
          );
        }
        return (
          <EditableCellShell>
            <ServerSideDropdown
              label={col.header}
              name={fieldName}
              hideLabel
              fetchOptions={col.fetchOptions}
              placeholder={col.placeholder ?? "Select…"}
              value={value != null ? String(value) : ""}
              onValueChange={(val: string | undefined) => { onChange(val ?? ""); }}
              disabled={cellDisabled}
              clearable={isColumnClearable(col)}
              optional={!col.required}
              required={col.required}
              initialOptions={col.serverDropdownInitialOptions}
              pageSize={col.serverDropdownPageSize}
              autoLoadOnMount={col.serverDropdownAutoLoadOnMount}
              searchOnFocus={col.serverDropdownSearchOnFocus}
              debounceMs={col.serverDropdownDebounceMs}
              error={error}
            />
          </EditableCellShell>
        );
      }

      case "checkbox":
        return (
          <EditableCellShell className="grid min-h-9 place-items-center">
            <CommonCheckbox
              label={col.header}
              name={fieldName}
              hideLabel
              checked={!!value}
              onCheckedChange={(checked: boolean) => { onChange(checked); }}
              disabled={cellDisabled}
              className="w-auto! gap-0!"
              error={error}
            />
          </EditableCellShell>
        );

      case "inputWithSuffix":
        return (
          <EditableCellShell>
            <InputWithSuffixField
              label={col.header}
              name={fieldName}
              hideLabel
              compact
              required={col.required}
              placeholder={col.placeholder}
              value={value != null ? String(value) : ""}
              suffixLabel={resolveSuffixLabel(col, row, rowIndex)}
              onValueChange={onChange}
              onBlur={() => { handleCellBlur(col, row, rowIndex); }}
              disabled={cellDisabled}
              maxLength={col.maxLength}
              validationRule={col.validationRule}
              validationOptions={col.sanitizeOptions}
              error={error}
              inputClassName={resolveNumericInputClass(col.cellClassName, col.align)}
            />
          </EditableCellShell>
        );

      case "textarea":
        return (
          <EditableCellShell>
            <TextareaField
              label={col.header}
              name={fieldName}
              hideLabel
              compact
              showCharCount={false}
              required={col.required}
              placeholder={col.placeholder}
              value={value != null ? String(value) : ""}
              onValueChange={onChange}
              disabled={cellDisabled}
              maxLength={col.maxLength}
              validationRule={col.validationRule}
              validationOptions={col.sanitizeOptions}
              rows={col.textareaRows ?? 1}
              expandRowsOnFocus={col.textareaExpandedRows ?? 2}
              error={error}
            />
          </EditableCellShell>
        );

      default:
        return (
          <EditableCellShell>
            <InputField
              label={col.header}
              name={fieldName}
              type="text"
              hideLabel
              errorDisplay="tooltip"
              placeholder={col.placeholder}
              value={value != null ? String(value) : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                onChange(
                  col.validationRule ? sanitizeDynamicCellValue(raw, col) : raw,
                );
              }}
              onBlur={() => { handleCellBlur(col, row, rowIndex); }}
              disabled={cellDisabled}
              maxLength={col.maxLength}
              validationRule={col.validationRule}
              error={error}
              className={resolveNumericInputClass(col.cellClassName, col.align)}
            />
          </EditableCellShell>
        );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  const trailingBlankExists = hasTrailingBlankRow(rows, columns);
  const showAddButton =
    allowAdd &&
    !(
      autoGenerateConfig.autoGenerateRows &&
      autoGenerateConfig.hideAddButtonWhenAutoGenerate &&
      trailingBlankExists
    );
  const showRemoveButton =
    allowRemove &&
    !(autoGenerateConfig.hideRemoveWhenSingleRow && rows.length === 1);

  const canAdd =
    showAddButton &&
    !disabled &&
    (maxRows === undefined || rows.length < maxRows);
  const canRemoveRow = showRemoveButton && !disabled && rows.length > minRows;

  return (
    <div data-slot="section-table" className={cn(TABLE_CONTAINER, className)}>
      {showToolbar && (
        <div className={DATA_TABLE_TOOLBAR_SHELL_CLASS}>
          {enableExport && (
            <div className="flex shrink-0 items-center">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Export:
              </span>
              <button
                type="button"
                disabled={exportBusy || !canExport || isLoading}
                className={DATA_TABLE_EXPORT_BTN_EXCEL_CLASS}
                title={canExport ? "Export to Excel (.xlsx)" : "No records to export"}
                onClick={handleExportExcel}
              >
                <AppIcon name="fileSpreadsheet" size={16} />
              </button>
              <button
                type="button"
                disabled={exportBusy || !canExport || isLoading}
                className={DATA_TABLE_EXPORT_BTN_PRINT_CLASS}
                title={canExport ? "Print" : "No records to export"}
                onClick={handleExportPrint}
              >
                <AppIcon name="printer" size={16} />
              </button>
              <button
                type="button"
                disabled={exportBusy || !canExport || isLoading}
                className={DATA_TABLE_EXPORT_BTN_CSV_CLASS}
                title={canExport ? "Download CSV" : "No records to export"}
                onClick={handleExportCsv}
              >
                <AppIcon name="download" size={16} />
              </button>
            </div>
          )}

          {enableGlobalSearch && (
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:min-w-0 sm:flex-1">
              <DataTableGlobalSearch
                className="sm:ml-auto sm:w-56"
                value={globalSearch}
                disabled={disabled || isLoading}
                onChange={setGlobalSearch}
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={DATA_TABLE_SCROLL_CONTAINER_CLASS}>
        <table className={DATA_TABLE_LAYOUT_CLASS}>
          <thead className={THEAD}>
            <tr>
              {showReorderColumn && (
                <th className={cn(TH, REORDER_TH)} aria-label="Reorder rows" />
              )}
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    TH,
                    col.controlType === "checkbox" && "text-center",
                    resolveColumnTextAlign(col.alignHeader ?? col.align),
                    col.widthClassName,
                  )}
                >
                  {col.renderHeader ? col.renderHeader() : col.header}
                  {!col.renderHeader && col.required && !col.readOnly && (
                    <span className="text-danger-500">*</span>
                  )}
                </th>
              ))}
              {!isActionColumnHidden && (
                <th className={cn(TH, "text-left")} style={{ width: 80 }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-slate-950">
            {displayRows.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isDraggingRow =
                draggingRowId != null &&
                String(draggingRowId) === String(rowId);
              const isDragOverRow =
                dragOverRowId != null &&
                String(dragOverRowId) === String(rowId) &&
                !isDraggingRow;

              return (
                <tr
                  key={rowId}
                  className={cn(
                    ROW_BORDER,
                    "transition-[opacity,box-shadow]",
                    getRowClassName?.(row, rowIndex),
                    isDraggingRow && "opacity-50",
                    isDragOverRow &&
                      "shadow-[inset_0_2px_0_0] shadow-primary-500 dark:shadow-primary-400",
                  )}
                  onDragOver={
                    canRowReorder ? handleRowDragOver(rowId) : undefined
                  }
                  onDrop={canRowReorder ? handleRowDrop : undefined}
                >
                  {showReorderColumn && (
                    <td className={cn(REORDER_TD)}>
                      <DynamicTableRowDragHandle
                        disabled={!canRowReorder}
                        isDragging={isDraggingRow}
                        onDragStart={handleRowDragStart(rowId)}
                        onDragEnd={handleRowDragEnd}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={cn(
                        TD_BASE,
                        /* Checkbox columns: middle-align in tall editable rows (beats TD_BASE align-top) */
                        col.controlType === "checkbox" && "!align-middle text-center",
                        resolveColumnTextAlign(col.align),
                        col.cellClassName,
                      )}
                    >
                      {renderCellEditor(col, row, rowIndex)}
                    </td>
                  ))}
                  {!isActionColumnHidden && (
                    <td className={cn(TD_BASE, "text-left align-middle")}>
                      <DataTableActions>
                        {renderExtraRowActions?.(row, rowIndex)}
                        {showRemoveButton && (
                          <DataTableActionButton
                            action="remove"
                            onClick={() => { handleRemoveRow(rowIndex); }}
                            disabled={!canRemoveRow}
                          />
                        )}
                        {showAddButton && (!showAddOnlyOnLastRow || rowIndex === displayRows.length - 1) && (
                          <DataTableActionButton
                            action="add"
                            onClick={handleAddRow}
                            disabled={!canAdd}
                          />
                        )}
                      </DataTableActions>
                    </td>
                  )}
                </tr>
              );
            })}

            {!isLoading && rows.length > 0 && displayRows.length === 0 && (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  No matching rows.
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={totalColumns} className="px-3 py-4">
                  <EmptyState
                    title={emptyMessage}
                    size="sm"
                    action={
                      canAdd ? (
                        <button
                          type="button"
                          className={DATA_TABLE_ADD_ROW_BTN}
                          onClick={handleAddRow}
                        >
                          <AppIcon name="plus" size={12} decorative />
                          {addButtonLabel}
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Loading overlay */}
        {isLoading && (
          <div className={SPINNER_OVERLAY}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="pointer-events-auto absolute inset-0 z-50 bg-slate-200/5 cursor-not-allowed" />
      )}
    </div>
  );
}

// ── forwardRef wrapper ───────────────────────────────────────────────

export const CustomDynamicDataTable = React.forwardRef(
  CustomDynamicDataTableInner,
) as <T>(
  props: CustomDynamicDataTableProps<T> & {
    ref?: React.Ref<CustomDynamicDataTableRef<T>>;
  },
) => React.ReactElement | null;
