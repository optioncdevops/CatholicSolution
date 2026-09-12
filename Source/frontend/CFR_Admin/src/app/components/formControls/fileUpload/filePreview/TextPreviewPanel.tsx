import { useEffect, useState } from "react";
import { cn } from "@app/utilities/cn";
import { themeCardMutedSurfaceClass } from "@designSystem/theme/styles/componentStyle";

interface TextPreviewPanelProps {
  file: File;
  mode: "text" | "csv" | "json";
}

function parseCsvRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export function TextPreviewPanel({ file, mode }: TextPreviewPanelProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Standard cancellable async-load effect: resetting content/error at the start of each
    // fetch-on-dependency-change cycle is the necessary and correct pattern here (preserved as-is
    // per this review's own instruction not to rewrite working async loading effects) — the
    // actual content isn't known until `file.text()` resolves below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContent(null);
    setError(null);

    file
      .text()
      .then((text) => {
        if (!cancelled) {setContent(text);}
      })
      .catch(() => {
        if (!cancelled) {setError("Could not read this file for preview.");}
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (error) {
    return <p className="p-6 text-sm text-foreground-muted">{error}</p>;
  }

  if (content === null) {
    return (
      <p className="p-6 text-sm text-foreground-muted">Loading preview…</p>
    );
  }

  if (mode === "csv") {
    const rows = parseCsvRows(content);
    return (
      <div
        className={cn(
          "h-full w-full overflow-auto p-3",
          themeCardMutedSurfaceClass,
        )}
      >
        <table className="min-w-full border-collapse text-left text-xs">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`csv-row-${rowIndex}`}
                className="border-b border-border/60"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`csv-cell-${rowIndex}-${cellIndex}`}
                    className="px-3 py-2 text-foreground"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const display =
    mode === "json"
      ? (() => {
          try {
            return JSON.stringify(JSON.parse(content), null, 2);
          } catch {
            return content;
          }
        })()
      : content;

  return (
    <div
      className={cn(
        "h-full w-full overflow-auto p-3",
        themeCardMutedSurfaceClass,
      )}
    >
      <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-4 text-xs leading-relaxed text-foreground">
        {display}
      </pre>
    </div>
  );
}
