import type { DatePart } from "./BaseDatePicker";
import {
  DEFAULT_DATE_FORMAT,
  isDateWithinConstraints,
  parseStrictDisplayDate,
  type StrictDisplayDateParseResult,
} from "./BaseDatePicker";

/** Standard RebarPro date display / manual-entry format. */
export const DATE_DISPLAY_FORMAT = DEFAULT_DATE_FORMAT;

export const DEFAULT_DMY_ORDER: DatePart[] = ["Date", "Month", "Year"];
export const DEFAULT_DMY_SEPARATOR = "/";

/** Strip non-digits and cap at ddMMyyyy (8 digits). */
export function extractDateDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

/** Clamp day/month segments while typing so impossible values cannot remain. */
export function sanitizeDateMaskDigits(digits: string): string {
  let next = digits.slice(0, 8);
  if (!next) {return "";}

  if (Number(next[0]) > 3) {
    next = `3${next.slice(1)}`;
  }

  if (next.length >= 2) {
    const day = Number(next.slice(0, 2));
    if (day === 0) {
      next = next.slice(0, 1);
    } else if (day > 31) {
      next = `31${next.slice(2)}`;
    }
  }

  if (next.length >= 3 && Number(next[2]) > 1) {
    next = `${next.slice(0, 2)}1${next.slice(3)}`;
  }

  if (next.length >= 4) {
    const month = Number(next.slice(2, 4));
    if (month === 0) {
      next = next.slice(0, 3);
    } else if (month > 12) {
      next = `${next.slice(0, 2)}12${next.slice(4)}`;
    }
  }

  return next;
}

/**
 * Apply dd/MM/yyyy input mask from typed digits or slash-separated input.
 * Day is capped at 31 and month at 12 while typing.
 * @example formatDateInputMask("25062026") => "25/06/2026"
 * @example formatDateInputMask("99132026") => "31/12/2026"
 */
export function formatDateInputMask(value: string): string {
  const digits = sanitizeDateMaskDigits(extractDateDigits(value));
  if (digits.length <= 2) {return digits;}
  if (digits.length <= 4) {return `${digits.slice(0, 2)}/${digits.slice(2)}`;}
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** True when the masked value is a complete dd/MM/yyyy string. */
export function isCompleteDmyInput(value: string): boolean {
  return formatDateInputMask(value).length === DATE_DISPLAY_FORMAT.length;
}

export function isDmySlashDisplayFormat(
  order: DatePart[],
  separator: string,
): boolean {
  return (
    order.length === 3 &&
    order[0] === "Date" &&
    order[1] === "Month" &&
    order[2] === "Year" &&
    separator === "/"
  );
}

/** Strictly parse manual date input (masked dd/MM/yyyy or configured display format). */
export function parseManualDateInput(
  value: string,
  order: DatePart[] = DEFAULT_DMY_ORDER,
  separator: string = DEFAULT_DMY_SEPARATOR,
): StrictDisplayDateParseResult {
  const trimmed = value.trim();
  if (!trimmed) {return { ok: false, reason: "empty" };}

  const usesDmyMask = isDmySlashDisplayFormat(order, separator);
  const normalizedInput = usesDmyMask ? formatDateInputMask(trimmed) : trimmed;

  if (!normalizedInput) {return { ok: false, reason: "empty" };}
  if (usesDmyMask && !isCompleteDmyInput(normalizedInput)) {
    return { ok: false, reason: "invalid" };
  }

  return parseStrictDisplayDate(normalizedInput, order, separator);
}

export function isDateWithinAllowedRange(
  date: Date,
  constraints: {
    minDate?: Date | null;
    maxDate?: Date | null;
    isDateDisabled?: (date: Date) => boolean;
  },
): boolean {
  return isDateWithinConstraints(
    date,
    constraints.minDate,
    constraints.maxDate,
    constraints.isDateDisabled,
  );
}
