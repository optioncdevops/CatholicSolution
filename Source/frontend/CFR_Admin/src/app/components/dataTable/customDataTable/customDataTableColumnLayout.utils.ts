import type { CSSProperties } from "react";
import type { ColumnDef } from "../partials/useDataTable";

export function parseCssLengthPx(raw: string | undefined): number {
  if (!raw) {return 0;}
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Supports px/rem on {@link ColumnDef.maxWidth} so locked widths can cap flexible columns. */
export function parseMaxWidthCapPx(raw: string | undefined): number | undefined {
  if (!raw?.trim()) {return undefined;}
  const s = raw.trim().toLowerCase();
  const pxM = /^([\d.]+)px$/i.exec(s);
  if (pxM) {
    const n = Number(pxM[1]);
    return Number.isFinite(n) ? n : undefined;
  }
  const remM = /^([\d.]+)rem$/i.exec(s);
  if (remM) {
    const n = Number(remM[1]);
    return Number.isFinite(n) ? n * 16 : undefined;
  }
  return undefined;
}

export function computeLockedColumnWidthPx<T>(
  col: ColumnDef<T>,
  measuredHeaderPx: number,
): number {
  const fromMin = parseCssLengthPx(col.minWidth);
  const fromW =
    col.width?.endsWith("px") || /^\d+(\.\d+)?px$/.test(col.width ?? "")
      ? parseCssLengthPx(col.width)
      : 0;
  let w = Math.max(measuredHeaderPx || fromW || fromMin, fromMin, fromW, 48);
  const cap = parseMaxWidthCapPx(col.maxWidth);
  if (cap != null && Number.isFinite(cap)) {
    w = Math.max(fromMin, Math.min(w, cap));
  }
  return w;
}

export function getHeaderMenuPortalStyle(rect: DOMRect): {
  top: number;
  left: number;
} {
  const menuWidth = 128;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 4;

  const left = Math.max(
    8,
    Math.min(viewportWidth - menuWidth - 8, rect.right - menuWidth),
  );

  const estimatedMenuHeight = 112;
  const canOpenDown =
    rect.bottom + gap + estimatedMenuHeight <= viewportHeight - 8;
  const top = canOpenDown
    ? rect.bottom + gap
    : Math.max(8, rect.top - estimatedMenuHeight - gap);

  return { top, left };
}

export function computeTableMinWidthPx<T>(
  columns: ColumnDef<T>[],
  options?: { defaultColumnMinPx?: number; selectionColumnPx?: number },
): number {
  const defaultMin = options?.defaultColumnMinPx ?? 0;
  let total = options?.selectionColumnPx ?? 0;

  for (const col of columns) {
    if (col.width) {
      total += parseCssLengthPx(col.width);
      continue;
    }
    const min = parseCssLengthPx(col.minWidth);
    total += min > 0 ? min : defaultMin;
  }

  return total;
}

export function mergeColumnCellStyle<T>(
  col: ColumnDef<T>,
  lockPx: number | null,
  leftOffset: number | undefined,
): CSSProperties {
  const sticky =
    leftOffset !== undefined ? { left: leftOffset } : undefined;

  if (col.width) {
    return {
      width: col.width,
      minWidth: col.minWidth ?? col.width,
      maxWidth: col.maxWidth,
      ...sticky,
    };
  }

  if (col.frozen && lockPx != null) {
    return {
      width: `${lockPx}px`,
      minWidth: `${lockPx}px`,
      maxWidth: col.maxWidth,
      ...sticky,
    };
  }

  if (col.minWidth) {
    return {
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      ...sticky,
    };
  }

  return {
    minWidth: 0,
    maxWidth: col.maxWidth,
    ...sticky,
  };
}

export type ColumnTextAlign = "left" | "center" | "right" | undefined;

/** Numeric columns often set align "right" in defs; product default renders left-aligned. */
export function getColumnTextAlignClass(align: ColumnTextAlign): string {
  if (align === "center") {return "text-center";}
  if (align === "right") {return "text-right";}
  return "text-left";
}

export function getColumnHeaderFlexAlignClass(align: ColumnTextAlign): string {
  if (align === "center") {return "justify-center text-center";}
  if (align === "right") {return "justify-end text-right";}
  return "justify-start text-left";
}
