import { isValidElement } from "react";
import type { ColumnDef } from "./useDataTable";

const MAX_DEPTH = 2;
const MAX_ARRAY_ITEMS = 80;
const MAX_OBJECT_KEYS = 16;

/** Strip HTML tags for plain-text export; collapses whitespace. */
export function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Plain cell text for CSV/HTML export — never React nodes.
 * Bounded depth/key/array limits — avoids JSON.stringify on whole rows/objects.
 */
export function valueToExportCell(value: unknown, depth = 0): string {
  if (value == null) {return "";}
  if (isValidElement(value)) {return "";}
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }
  if (typeof value === "object") {
    if (depth > MAX_DEPTH) {return "…";}
    if (Array.isArray(value)) {
      return value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((v) => valueToExportCell(v, depth + 1))
        .join(", ");
    }
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o).slice(0, MAX_OBJECT_KEYS);
    if (keys.length === 0) {return "";}
    return keys
      .map((k) => `${k}: ${valueToExportCell(o[k], depth + 1)}`)
      .join("; ");
  }
  let s = String(value);
  if (/<[^>]+>/.test(s)) {
    s = stripHtmlTags(s);
  }
  return s;
}

export function escapeHtmlAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape one CSV field (RFC 4180). Quotes only when required. */
export function escapeCsvField(cell: string): string {
  const needsQuotes =
    /[",\r\n]/.test(cell) || cell.startsWith(" ") || cell.endsWith(" ");
  if (!needsQuotes) {
    return cell;
  }
  return `"${cell.replace(/"/g, '""')}"`;
}

export function isExcludedFromExportColumn<T>(col: ColumnDef<T>): boolean {
  if (col.exportable === false) {return true;}
  const id = col.id?.trim().toLowerCase() ?? "";
  if (/^(actions?|action)$/.test(id)) {return true;}
  if (!String(col.header ?? "").trim()) {return true;}
  return false;
}

/** Visible columns minus action/non-exportable/blank-header columns. */
export function filterColumnsForExport<T>(
  cols: ColumnDef<T>[],
): ColumnDef<T>[] {
  return cols.filter((c) => !isExcludedFromExportColumn(c));
}

/**
 * Resolves export columns from the full column definition order:
 * currently visible (and exportable) columns plus any `exportOnly` columns.
 * Preserves definition order so Status and similar fields land in a predictable place.
 */
export function resolveColumnsForExport<T>(
  allColumns: ColumnDef<T>[],
  visibleColumns: ColumnDef<T>[],
): ColumnDef<T>[] {
  const visibleExportIds = new Set(
    filterColumnsForExport(visibleColumns).map((c) => c.id),
  );
  return allColumns.filter((c) => {
    if (c.exportOnly) {
      return !isExcludedFromExportColumn(c);
    }
    return visibleExportIds.has(c.id);
  });
}

export function buildCsvString<T>(
  cols: ColumnDef<T>[],
  rows: T[],
): string {
  if (cols.length === 0) {return "";}
  const headerLine = cols.map((c) => escapeCsvField(c.header)).join(",");
  const lines = rows.map((row) =>
    cols
      .map((c) =>
        escapeCsvField(
          valueToExportCell(c.exportAccessor ? c.exportAccessor(row) : c.accessor(row)),
        ),
      )
      .join(","),
  );
  return [headerLine, ...lines].join("\n");
}

/** Minimal HTML table fragment (used for Excel-compatible export and print). */
export function buildHtmlTableFragment<T>(
  cols: ColumnDef<T>[],
  rows: T[],
): string {
  if (cols.length === 0) {
    return '<p style="font-family:sans-serif;font-size:12px;">No columns to export.</p>';
  }
  const thead = `<thead><tr>${cols
    .map((c) => `<th>${escapeHtmlAttr(c.header)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${cols
          .map(
            (c) =>
              `<td>${escapeHtmlAttr(valueToExportCell(c.exportAccessor ? c.exportAccessor(row) : c.accessor(row)))}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("")}</tbody>`;
  return `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:12px;">${thead}${tbody}</table>`;
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvUtf8(csvContent: string, filename: string): void {
  const blob = new Blob([`\ufeff${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  triggerBlobDownload(blob, filename);
}

/** Excel opens HTML saved as .xls without extra packages. */
export function downloadExcelHtmlFragment(
  tableFragment: string,
  filename: string,
): void {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/></head><body>${tableFragment}</body></html>`;
  const blob = new Blob([doc], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerBlobDownload(
    blob,
    filename.endsWith(".xls") ? filename : `${filename}.xls`,
  );
}

/** Opens print dialog; user can choose Save as PDF (browser-dependent). */
export function printHtmlTableFragment(
  tableFragment: string,
  documentTitle: string,
): void {
  const w = window.open("", "_blank");
  if (!w) {
    throw new Error(
      "Unable to open print window. Allow pop-ups for this site, then try again.",
    );
  }
  const safeTitle = escapeHtmlAttr(documentTitle);
  w.document.open();
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${safeTitle}</title>
<style>
  body{font-family:sans-serif;font-size:12px;padding:16px;}
  table{border-collapse:collapse;width:100%;}
  td,th{border:1px solid #ccc;padding:6px;text-align:left;}
  th{background:#f5f5f5;}
</style></head><body>
<h2 style="font-size:14px;margin-top:0;">${safeTitle}</h2>
${tableFragment}
<script>
  window.onload = function(){ window.focus(); window.print(); };
</script>
</body></html>`);
  w.document.close();
}

/** Server-side: choose filename hint — full snapshot vs current page only. */
export function serverExportBasename(
  loadedRowCount: number,
  totalRecords: number,
): "table_export" | "table_export_current_page" {
  if (totalRecords > 0 && loadedRowCount >= totalRecords) {
    return "table_export";
  }
  return "table_export_current_page";
}

const KNOWN_EXPORT_EXT = /\.(csv|xls|xlsx|pdf)$/i;

function stripKnownExportExtension(raw: string): string {
  return raw.trim().replace(KNOWN_EXPORT_EXT, "").trim();
}

/**
 * Produces a safe, download-friendly base filename (no extension).
 * Page name is the source of truth. List screens that still pass `_Records`
 * are normalized to `_List` (e.g. Vendor_Records → Vendor_List).
 */
export function sanitizeExportFileName(name: string): string {
  let s = name.trim();
  if (!s) {return "";}
  s = s.replace(/[<>:"/\\|?*]/g, "");
  s = Array.from(s).filter((char) => char.charCodeAt(0) > 31).join("");
  s = s.replace(/-/g, "_");
  s = s.replace(/\s+/g, "_");
  s = s.replace(/_Records$/i, "_List");
  s = s.replace(/_{2,}/g, "_");
  s = s.replace(/^\.+/, "");
  s = s.replace(/^_+|_+$/g, "");
  if (!s) {return "";}
  return s.length > 180 ? s.slice(0, 180) : s;
}

/** Human-readable heading for print / Save-as-PDF from a file base (underscores → spaces). */
export function humanizeExportTitleFromBase(fileBase: string): string {
  const core = fileBase.replace(/_current_page$/i, "").trim();
  const human = core.replace(/_/g, " ").trim();
  return human.length > 0 ? human : "Table export";
}

function firstNonEmptyExportLabel(
  exportFileName?: string,
  pageName?: string,
): string {
  const a = exportFileName?.trim();
  if (a) {return stripKnownExportExtension(a);}
  const b = pageName?.trim();
  if (b) {return stripKnownExportExtension(b);}
  return "";
}

/** Client table: resolved base for `table_export` fallback. */
export function resolveClientExportFileBase(
  exportFileName?: string,
  pageName?: string,
): string {
  const sanitized = sanitizeExportFileName(
    firstNonEmptyExportLabel(exportFileName, pageName),
  );
  return sanitized || "table_export";
}

export function resolveClientExportPrintTitle(fileBase: string): string {
  if (fileBase === "table_export") {return "Table export";}
  return humanizeExportTitleFromBase(fileBase);
}

/** Server table: same defaults as today when no custom label is provided. */
export function resolveServerExportFileBase(
  exportFileName: string | undefined,
  pageName: string | undefined,
  loadedRowCount: number,
  totalRecords: number,
): string {
  const sanitized = sanitizeExportFileName(
    firstNonEmptyExportLabel(exportFileName, pageName),
  );
  if (sanitized) {
    const isPartial =
      totalRecords > 0 && loadedRowCount < totalRecords;
    return isPartial ? `${sanitized}_current_page` : sanitized;
  }
  return serverExportBasename(loadedRowCount, totalRecords);
}

export function resolveServerExportPrintTitle(fileBase: string): string {
  if (
    fileBase === "table_export" ||
    fileBase === "table_export_current_page"
  ) {
    return "Table export";
  }
  return humanizeExportTitleFromBase(fileBase);
}

/** Maps dynamic editable-table columns to {@link ColumnDef} for shared export helpers. */
export function mapDynamicColumnsForExport<T>(
  columns: readonly { key: keyof T | string; header: string }[],
  getValue: (row: T, key: keyof T | string) => unknown,
): ColumnDef<T>[] {
  return columns.map((col) => ({
    id: String(col.key),
    header: col.header,
    accessor: (row) => getValue(row, col.key),
    exportable: true,
  }));
}

/**
 * Runs export work after the next animation frame so the UI can paint (busy cursor/disabled buttons).
 * Performs synchronous string/file build inside the callback — only invoked on user action.
 */
export function runExportAfterPaint(task: () => void | Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(() => {
      void Promise.resolve()
        .then(() => task())
        .then(resolve)
        .catch((e) => {
          reject(e instanceof Error ? e : new Error(String(e)));
        });
    });
  });
}
