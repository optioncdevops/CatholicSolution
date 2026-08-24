import type { ClientPageSizeOption, PageSizeValue } from "./useDataTable";

export const DEFAULT_CLIENT_NUMERIC_PAGE_SIZES = [25, 50, 75, 100] as const;

/** Matches {@link DEFAULT_CLIENT_NUMERIC_PAGE_SIZES}; server paging ignores `"all"`. */
export const DEFAULT_SERVER_NUMERIC_PAGE_SIZES = [25, 50, 75, 100] as const;

/**
 * Same element type as {@link PageSizeValue}. Allows accidental `"all"` in props;
 * server-side builders strip it.
 */
export type ServerPageSizeOptionsInput = readonly PageSizeValue[];

function dedupePreserveOrder(items: ClientPageSizeOption[]): ClientPageSizeOption[] {
  const seen = new Set<string | number>();
  const out: ClientPageSizeOption[] = [];
  for (const x of items) {
    const key = x === "all" ? ("all" as const) : x;
    if (seen.has(key)) {continue;}
    seen.add(key);
    out.push(x);
  }
  return out;
}

function isValidClientOption(x: ClientPageSizeOption): boolean {
  return (
    x === "all" ||
    (typeof x === "number" && Number.isFinite(x) && x > 0)
  );
}

/**
 * Client table page sizes:
 * - If `custom` is omitted or empty → default numerics (25, 50, 75, 100) + `"all"` (sorted, `"all"` last), merged with numeric `initialPageSize`.
 * - If `custom` has entries → **only** those (sanitized/deduped, order preserved), then ensure `initialPageSize` appears if missing.
 */
export function buildClientPageSizeOptions(
  initialPageSize: ClientPageSizeOption,
  custom?: readonly ClientPageSizeOption[],
): ClientPageSizeOption[] {
  const initialNum =
    typeof initialPageSize === "number" && initialPageSize > 0
      ? initialPageSize
      : null;

  const useDefaults = custom === undefined || custom.length === 0;

  if (useDefaults) {
    const nums = [
      ...new Set([
        ...DEFAULT_CLIENT_NUMERIC_PAGE_SIZES,
        ...(initialNum !== null ? [initialNum] : []),
      ]),
    ].sort((a, b) => a - b);
    return [...nums, "all"];
  }

  const sanitized = custom.filter(isValidClientOption);
  const result = dedupePreserveOrder(sanitized.length > 0 ? sanitized : []);

  if (result.length === 0) {
    const nums = [
      ...new Set([
        ...DEFAULT_CLIENT_NUMERIC_PAGE_SIZES,
        ...(initialNum !== null ? [initialNum] : []),
      ]),
    ].sort((a, b) => a - b);
    return [...nums, "all"];
  }

  if (initialNum !== null && !result.includes(initialNum)) {
    result.push(initialNum);
  }
  if (initialPageSize === "all" && !result.includes("all")) {
    result.push("all");
  }
  return dedupePreserveOrder(result);
}

/**
 * Server table: positive integers only; `"all"` is stripped.
 * - If `custom` is omitted or empty → default numerics + `initialPageSize`.
 * - Else → **only** sanitized numbers from `custom` (falls back to defaults if none valid).
 */
export function buildServerPageSizeOptions(
  initialPageSize: number,
  custom?: ServerPageSizeOptionsInput,
): number[] {
  const initial =
    typeof initialPageSize === "number" &&
    Number.isFinite(initialPageSize) &&
    initialPageSize > 0
      ? initialPageSize
      : 20;

  const numsFrom = (arr: readonly PageSizeValue[]): number[] =>
    arr.filter(
      (x): x is number =>
        typeof x === "number" && Number.isFinite(x) && x > 0,
    );

  const useDefaults = custom === undefined || custom.length === 0;

  let values: number[];
  if (useDefaults) {
    values = [...DEFAULT_SERVER_NUMERIC_PAGE_SIZES];
  } else {
    const picked = numsFrom(custom);
    values =
      picked.length > 0 ? picked : [...DEFAULT_SERVER_NUMERIC_PAGE_SIZES];
  }

  return [...new Set([...values, initial])].sort((a, b) => a - b);
}
