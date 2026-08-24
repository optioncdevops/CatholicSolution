import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { cn } from "@app/utilities/cn";
import { themeCardMutedSurfaceClass } from "@designSystem/theme/styles/componentStyle";

interface XlsxPreviewPanelProps {
  file: File;
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) {return "";}
  if (value instanceof Date) {return value.toISOString();}
  return String(value);
}

export function XlsxPreviewPanel({ file }: XlsxPreviewPanelProps) {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setWorkbook(null);
    setError(null);
    setLoading(true);

    file
      .arrayBuffer()
      .then((buffer) => {
        if (cancelled) {return;}
        try {
          const nextWorkbook = XLSX.read(buffer, {
            type: "array",
            cellDates: true,
          });
          setWorkbook(nextWorkbook);
          setActiveSheet(0);
        } catch {
          setError("Could not read this spreadsheet.");
        }
      })
      .catch(() => {
        if (!cancelled) {setError("Could not read this spreadsheet.");}
      })
      .finally(() => {
        if (!cancelled) {setLoading(false);}
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const rows = useMemo(() => {
    if (!workbook?.SheetNames.length) {return [];}
    const sheetName =
      workbook.SheetNames[activeSheet] ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {return [];}
    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];
  }, [workbook, activeSheet]);

  if (loading) {
    return (
      <p className="p-6 text-sm text-foreground-muted">Loading spreadsheet…</p>
    );
  }

  if (error) {
    return <p className="p-6 text-sm text-foreground-muted">{error}</p>;
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col p-3",
        themeCardMutedSurfaceClass,
      )}
    >
      {workbook && workbook.SheetNames.length > 1 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {workbook.SheetNames.map((name, index) => (
            <button
              key={name}
              type="button"
              onClick={() => { setActiveSheet(index); }}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                index === activeSheet
                  ? "bg-primary-600 text-white"
                  : "bg-background text-foreground-muted hover:bg-background-muted",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-background">
        <table className="min-w-full border-collapse text-left text-xs">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-b border-border/60">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="max-w-[240px] truncate whitespace-nowrap px-3 py-2 text-foreground"
                    title={cellToText(cell)}
                  >
                    {cellToText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? (
          <p className="p-6 text-sm text-foreground-muted">
            This sheet is empty.
          </p>
        ) : null}
      </div>
    </div>
  );
}
