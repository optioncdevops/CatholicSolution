import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  /** Plain-text/number value for this column, used by every export format. */
  value: (row: Record<string, unknown>) => string | number;
}

function buildRows<T>(data: T[], columns: ExportColumn[]) {
  return data.map((row) => {
    const record: Record<string, string | number> = {};
    for (const column of columns) record[column.header] = column.value(row as Record<string, unknown>);
    return record;
  });
}

export function exportToExcel<T>(data: T[], columns: ExportColumn[], fileName: string) {
  const rows = buildRows(data, columns);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtmlTable<T>(data: T[], columns: ExportColumn[]) {
  const rows = buildRows(data, columns);
  const head = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(String(row[column.header]))}</td>`).join('')}</tr>`)
    .join('');
  return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** Word-compatible HTML export — opens correctly in Microsoft Word without a docx-generation dependency. */
export function exportToWord<T>(data: T[], columns: ExportColumn[], fileName: string) {
  const table = buildHtmlTable(data, columns);
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${escapeHtml(fileName)}</title></head>
    <body>${table}</body>
  </html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printTable<T>(data: T[], columns: ExportColumn[], title: string) {
  const table = buildHtmlTable(data, columns);
  const printWindow = window.open('', '_blank', 'width=1000,height=700');
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #12233f; }
      h1 { font-size: 16px; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
      th { background: #f1f5f9; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
    </style>
  </head><body><h1>${escapeHtml(title)}</h1>${table}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => printWindow.print();
}

export function exportToCsv<T>(data: T[], columns: ExportColumn[], fileName: string) {
  const rows = buildRows(data, columns);
  const escapeCsv = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    columns.map((column) => escapeCsv(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column.header])).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
