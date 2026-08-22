import type { ColumnDef } from "./useDataTable";
import {
  buildCsvString,
  downloadCsvUtf8,
  escapeCsvField,
} from "./tableExportUtils";
import {
  buildExportMetadataLines,
  type ExportMetadataOptions,
} from "./tableExportMetadata";

/** RFC 4180 CSV with optional title + generated-at preamble (blank line before headers). */
export function buildCsvExportContent<T>(
  cols: ColumnDef<T>[],
  rows: T[],
  metadata: ExportMetadataOptions = {},
): string {
  const preamble = buildExportMetadataLines(metadata).map(escapeCsvField);
  const tablePart = buildCsvString(cols, rows);
  const sections: string[] = [];

  if (preamble.length > 0) {
    sections.push(preamble.join("\r\n"));
    sections.push("");
  }
  if (tablePart) {
    sections.push(tablePart);
  }

  return sections.join("\r\n");
}

export function downloadTableCsv<T>(
  cols: ColumnDef<T>[],
  rows: T[],
  filename: string,
  metadata: ExportMetadataOptions = {},
): void {
  downloadCsvUtf8(
    buildCsvExportContent(cols, rows, metadata),
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
}
