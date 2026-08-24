/** Shared title / generated-at metadata for CSV, Excel, and PDF exports. */
export interface ExportMetadataOptions {
  title?: string;
  includeGeneratedAt?: boolean;
}

/**
 * Export timestamp in Indian date order with a readable 12-hour clock:
 * `dd/MM/yyyy hh:mm:ss AM/PM`.
 * Avoids locale-dependent output that varies by browser/OS.
 */
export function resolveGeneratedAtText(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours = String(hours24 % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `Generated: ${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
}

/** Plain-text metadata lines placed above exported table content. */
export function buildExportMetadataLines(
  options: ExportMetadataOptions = {},
): string[] {
  const lines: string[] = [];
  const title = options.title?.trim();
  if (title) {
    lines.push(title);
  }
  if (options.includeGeneratedAt !== false) {
    lines.push(resolveGeneratedAtText());
  }
  return lines;
}
