import ExcelJS from "exceljs";
import type { ColumnDef } from "./useDataTable";
import { triggerBlobDownload, valueToExportCell } from "./tableExportUtils";
import {
  buildExportMetadataLines,
  type ExportMetadataOptions,
} from "./tableExportMetadata";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const MAX_COLUMN_WIDTH = 48;
const MIN_COLUMN_WIDTH = 12;

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF1F5F9" },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFCBD5E1" } },
  left: { style: "thin", color: { argb: "FFCBD5E1" } },
  bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
  right: { style: "thin", color: { argb: "FFCBD5E1" } },
};

const DATA_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  horizontal: "left",
  vertical: "top",
  wrapText: true,
};

const HEADER_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
};

function resolveColumnWidth<T>(col: ColumnDef<T>, rows: T[]): number {
  const headerLen = col.header.length;
  const maxDataLen = rows.reduce((max, row) => {
    return Math.max(max, valueToExportCell(col.exportAccessor ? col.exportAccessor(row) : col.accessor(row)).length);
  }, 0);
  return Math.min(
    MAX_COLUMN_WIDTH,
    Math.max(MIN_COLUMN_WIDTH, headerLen, maxDataLen) + 2,
  );
}

export type TableExcelExportOptions = ExportMetadataOptions;

/** Builds and downloads an industry-standard `.xlsx` workbook with metadata, borders, and filters. */
export async function downloadExcelXlsx<T>(
  cols: ColumnDef<T>[],
  rows: T[],
  filename: string,
  options: TableExcelExportOptions = {},
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CFR Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Export");
  const metadataLines = buildExportMetadataLines(options);
  const columnCount = Math.max(cols.length, 1);
  let currentRow = 0;

  if (metadataLines.length > 0) {
    metadataLines.forEach((line, index) => {
      currentRow += 1;
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = line;
      if (index === 0 && options.title?.trim()) {
        row.getCell(1).font = { bold: true, size: 14 };
      } else {
        row.getCell(1).font = { size: 10, color: { argb: "FF64748B" } };
      }
      if (columnCount > 1) {
        sheet.mergeCells(currentRow, 1, currentRow, columnCount);
      }
    });
    currentRow += 1;
    sheet.getRow(currentRow);
  }

  const headerRowNumber = currentRow + 1;
  if (cols.length > 0) {
    const headerRow = sheet.getRow(headerRowNumber);
    headerRow.values = cols.map((col) => col.header);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: "FF1E293B" } };
      cell.alignment = HEADER_ALIGNMENT;
      cell.fill = HEADER_FILL;
      cell.border = THIN_BORDER;
    });
    currentRow = headerRowNumber;

    rows.forEach((rowData) => {
      currentRow += 1;
      const dataRow = sheet.getRow(currentRow);
      cols.forEach((col, index) => {
        const cell = dataRow.getCell(index + 1);
        cell.value = valueToExportCell(
          col.exportAccessor ? col.exportAccessor(rowData) : col.accessor(rowData),
        );
        cell.numFmt = "@";
        cell.alignment = DATA_ALIGNMENT;
        cell.border = THIN_BORDER;
      });
    });

    sheet.columns.forEach((column: Partial<ExcelJS.Column>, index: number) => {
      const col = cols[index];
      if (!col) { return; }
      column.width = resolveColumnWidth(col, rows);
    });

    // Keep metadata timestamp fully readable across the merged header cells.
    const generatedLine = metadataLines.find((line) =>
      line.startsWith("Generated:"),
    );
    if (generatedLine && sheet.getColumn(1).width != null) {
      sheet.getColumn(1).width = Math.max(
        sheet.getColumn(1).width ?? MIN_COLUMN_WIDTH,
        Math.min(MAX_COLUMN_WIDTH, generatedLine.length + 2),
      );
    }

    sheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
  } else if (metadataLines.length === 0) {
    sheet.getCell(1, 1).value = "No columns to export.";
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: XLSX_MIME });
  const safeName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  triggerBlobDownload(blob, safeName);
}
