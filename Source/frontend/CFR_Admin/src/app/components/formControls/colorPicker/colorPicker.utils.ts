const LONG_HEX_PATTERN = /^[0-9A-Fa-f]{6}$/;
const SHORT_HEX_PATTERN = /^[0-9A-Fa-f]{3}$/;

const UNSAFE_COLOR_PATTERN =
  /url\s*\(|expression\s*\(|var\s*\(|@import|javascript:/i;

/** Expand #RGB to #RRGGBB (digits only, no #). */
export function expandShortHex(hex: string): string {
  if (hex.length !== 3) {return hex;}
  return hex
    .split("")
    .map((c) => c + c)
    .join("");
}

/** Returns true when value normalizes to a safe #RRGGBB hex color. */
export function isValidHexColor(value: string | null | undefined): boolean {
  return normalizeHexColor(value) !== null;
}

/**
 * Normalize user input to uppercase #RRGGBB, or null when empty/invalid.
 * Rejects non-hex CSS (url, var, expression, etc.).
 */
export function normalizeHexColor(
  value: string | null | undefined,
): string | null {
  if (value == null) {return null;}
  const trimmed = value.trim();
  if (!trimmed) {return null;}
  if (UNSAFE_COLOR_PATTERN.test(trimmed)) {return null;}

  let raw = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!SHORT_HEX_PATTERN.test(raw) && !LONG_HEX_PATTERN.test(raw)) {
    return null;
  }
  if (SHORT_HEX_PATTERN.test(raw)) {
    raw = expandShortHex(raw);
  }
  return `#${raw.toUpperCase()}`;
}

/** Restrict manual hex draft to safe characters and max length (# + 6 hex). */
export function sanitizeHexDraftInput(value: string): string {
  let next = value.replace(/[^#0-9A-Fa-f]/gi, "");
  const hashIndex = next.indexOf("#");
  if (hashIndex > 0) {
    next = next.replace(/#/g, "");
    next = `#${next}`;
  } else if (hashIndex === -1 && next.length > 0) {
    next = `#${next}`;
  }
  if (next.startsWith("#")) {
    const digits = next.slice(1, 7);
    return `#${digits}`;
  }
  return next.slice(0, 6);
}

/** Safe inline background for validated hex only. */
export function hexToStyleBackground(hex: string | null): string | undefined {
  const normalized = normalizeHexColor(hex);
  return normalized ?? undefined;
}
