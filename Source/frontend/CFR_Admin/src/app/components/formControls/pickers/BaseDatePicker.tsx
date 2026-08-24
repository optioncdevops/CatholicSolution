import type { ReactNode } from "react";
import type React from "react";
import {
  themeFieldBaseClass,
  themeFieldShellClass,
  themeFieldWrapperClass,
  themeFormControlMenuClass,
  themeLabelClass,
  themeOptionalLabelSuffixClass,
} from "@designSystem/theme/styles/componentStyle";

export { themeOptionalLabelSuffixClass };

export type DatePart = "Date" | "Month" | "Year";

export type BasePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "readOnly"
> & {
  label: string;
  /** Validation error message string */
  error?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** When true, the field is display-only (no typing, no calendar). */
  readOnly?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Optional human-readable display format e.g. "dd/MM/yyyy", "yyyy-MM-dd".
   * Controls ONLY how the value is shown in the input.
   * If provided, it will be converted into displayOrder + separator.
   */
  format?: string;
  /**
   * Optional clearer alias for format; takes precedence over `format` for display.
   */
  displayFormat?: string;
  /**
   * Output / submitted format, e.g. "yyyy-MM-dd" or "dd/MM/yyyy".
   * - Controls what goes to `onChange` and the hidden input value.
   * - If omitted, falls back to `displayFormat`/`format`, then ISO "yyyy-MM-dd".
   */
  outputFormat?: string;
  /**
   * Explicit display order override, e.g. ["Date","Month","Year"].
   * Ignored when `format` is provided.
   */
  displayOrder?: DatePart[];
  /**
   * Explicit separator override, e.g. "/", "-", " ".
   * Ignored when `format` is provided.
   */
  separator?: string;
  /** Optional minimum selectable date (YYYY-MM-DD, ISO-like). */
  minDate?: string;
  /** Optional maximum selectable date (YYYY-MM-DD, ISO-like). */
  maxDate?: string;
  /** Custom predicate to disable specific dates. */
  isDateDisabled?: (date: Date) => boolean;
  /** Show a quick 'Today' shortcut button inside the calendar. Default true. */
  showTodayButton?: boolean;
  /**
   * Show clear affordance on the field and in the calendar popup.
   * Default true. Prefer `clearable`; `showClearButton` is a legacy alias.
   */
  clearable?: boolean;
  /** @deprecated Use `clearable` — when set, overrides `clearable`. */
  showClearButton?: boolean;
  /** Hides the clear control (`clearable={false}` equivalent). */
  hideClearButton?: boolean;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  /** Short help beside the label (info icon + tooltip). */
  infoTooltip?: ReactNode;
};

export const baseLabelClasses = themeLabelClass;
export const baseFieldClasses = themeFieldBaseClass;
export const baseFieldShellClasses = themeFieldShellClass;
export const baseFieldWrapperClasses = themeFieldWrapperClass;

export const popoverClasses = `absolute z-20 mt-2 w-72 p-3 backdrop-blur-sm ${themeFormControlMenuClass}`;

/** Default display and output format for date pickers (dd/MM/yyyy). */
export const DEFAULT_DATE_FORMAT = "dd/MM/yyyy";

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type CalendarViewMode = "day" | "month" | "year";

export function parseDateString(value?: string): Date | null {
  if (!value) {return null;}
  const trimmed = value.trim();
  if (!trimmed) {return null;}

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const d = Number(isoMatch[3]);
    const dt = new Date(y, m - 1, d);
    if (!Number.isNaN(dt.getTime())) {return dt;}
  }

  const dmyMatch = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
  if (dmyMatch) {
    const d = Number(dmyMatch[1]);
    const m = Number(dmyMatch[2]);
    const y = Number(dmyMatch[3]);
    const dt = new Date(y, m - 1, d);
    if (!Number.isNaN(dt.getTime())) {return dt;}
  }

  return null;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(
  date: Date | null,
  order: DatePart[],
  separator: string,
): string {
  if (!date) {return "";}
  const day = `${date.getDate()}`.padStart(2, "0");
  // Always use numeric month (01-12) so formats like dd/MM/yyyy render as 03/12/2025
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;

  const parts = order.map((part) => {
    switch (part) {
      case "Date":
        return day;
      case "Month":
        return month;
      case "Year":
        return year;
      default:
        return "";
    }
  });

  return parts.join(separator);
}

export function parseDateFormatString(
  format?: string,
): { order: DatePart[]; separator: string } | null {
  if (!format) {return null;}

  // Match basic tokens like dd, mm, yyyy (case-insensitive)
  const tokenRegex = new RegExp("(d{1,2}|m{1,2}|y{2,4})", "gi");
  const tokens = format.match(tokenRegex);
  if (!tokens) {return null;}

  const order: DatePart[] = tokens.map((token) => {
    const t = token.toLowerCase();
    if (t.startsWith("d")) {return "Date";}
    if (t.startsWith("m")) {return "Month";}
    return "Year";
  });

  // First non-letter run as separator (/, -, ., space, etc.)
  const sepRegex = new RegExp("[^A-Za-z]+");
  const sepMatch = sepRegex.exec(format);
  const separator = sepMatch ? sepMatch[0] : " ";

  return { order, separator };
}

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function buildCalendarDays(
  viewYear: number,
  viewMonth: number,
  selected: Date | null,
): CalendarDay[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0-6, Sunday start
  const startDate = new Date(viewYear, viewMonth, 1 - firstWeekday);

  const days: CalendarDay[] = [];
  const today = new Date();

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const inCurrentMonth = d.getMonth() === viewMonth;
    const isToday =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();

    const isSelected =
      !!selected &&
      d.getFullYear() === selected.getFullYear() &&
      d.getMonth() === selected.getMonth() &&
      d.getDate() === selected.getDate();

    days.push({ date: d, inCurrentMonth, isToday, isSelected });
  }

  return days;
}

export function parseMonthString(
  value?: string,
): { year: number; month: number } | null {
  if (!value) {return null;}
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) {return null;}
  return { year: y, month: m - 1 };
}

export function formatMonthValue(year: number, month: number): string {
  return `${year}-${`${month + 1}`.padStart(2, "0")}`;
}

export function formatMonthDisplay(year: number, month: number): string {
  return `${monthLabels[month]} ${year}`;
}

/** Shown when a manually typed date fails strict format/calendar validation. */
export const DATE_PICKER_INVALID_MESSAGE =
  "Enter a valid date in dd/MM/yyyy format.";

/** Shown when a parsed date violates min/max or custom disabled rules. */
export const DATE_PICKER_CONSTRAINT_MESSAGE = "Selected date is not available.";

export function isValidCalendarDate(
  year: number,
  month: number,
  day: number,
): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1000 ||
    year > 9999
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isDateWithinConstraints(
  date: Date,
  minDate: Date | null | undefined,
  maxDate: Date | null | undefined,
  isDateDisabled?: (date: Date) => boolean,
): boolean {
  if (minDate && date < minDate) {return false;}
  if (maxDate && date > maxDate) {return false;}
  if (isDateDisabled?.(date)) {return false;}
  return true;
}

/** True when the entire calendar year is outside min/max bounds. */
export function isYearOutsideConstraints(
  year: number,
  minDate?: Date | null,
  maxDate?: Date | null,
): boolean {
  if (minDate && year < minDate.getFullYear()) {return true;}
  if (maxDate && year > maxDate.getFullYear()) {return true;}
  return false;
}

/** True when the entire month (0–11) is outside min/max bounds. */
export function isMonthOutsideConstraints(
  year: number,
  monthIndex: number,
  minDate?: Date | null,
  maxDate?: Date | null,
): boolean {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  if (maxDate && monthStart > maxDate) {return true;}
  if (minDate && monthEnd < minDate) {return true;}
  return false;
}

/**
 * Resolve which month/year the calendar should show when opening.
 * Prefer the selected date; otherwise today. Clamp into [minDate, maxDate]
 * so DOB-style maxDate pickers don't open on an all-disabled future grid.
 */
export function resolveCalendarViewDate(
  selected: Date | null | undefined,
  minDate?: Date | null,
  maxDate?: Date | null,
): Date {
  let date = selected
    ? new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
    : new Date();
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (maxDate) {
    const max = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate(),
    );
    if (date > max) {date = max;}
  }
  if (minDate) {
    const min = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate(),
    );
    if (date < min) {date = min;}
  }
  return date;
}

/**
 * Prev month nav: allow moving earlier while any selectable date still exists
 * before the current month (do not block just because the adjacent month is
 * still past maxDate — that would trap the view on an all-disabled month).
 */
export function canNavigateToPreviousMonth(
  year: number,
  monthIndex: number,
  minDate?: Date | null,
): boolean {
  if (!minDate) {return true;}
  const currentMonthStart = new Date(year, monthIndex, 1);
  return minDate < currentMonthStart;
}

export function canNavigateToNextMonth(
  year: number,
  monthIndex: number,
  maxDate?: Date | null,
): boolean {
  if (!maxDate) {return true;}
  const currentMonthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return maxDate > currentMonthEnd;
}

/** Year grid years are [viewYear - 7, viewYear - 7 + 15]. */
export function canNavigateToPreviousYearBlock(
  viewYear: number,
  minDate?: Date | null,
): boolean {
  if (!minDate) {return true;}
  const blockStart = viewYear - 7;
  return minDate.getFullYear() < blockStart;
}

export function canNavigateToNextYearBlock(
  viewYear: number,
  maxDate?: Date | null,
): boolean {
  if (!maxDate) {return true;}
  const blockEnd = viewYear - 7 + 15;
  return maxDate.getFullYear() > blockEnd;
}

export type StrictDisplayDateParseResult =
  | { ok: true; date: Date; normalized: string }
  | { ok: false; reason: "empty" | "invalid" };

function buildStrictDisplayDatePattern(
  order: DatePart[],
  separator: string,
): RegExp {
  const tokenPatterns = order.map((part) => {
    switch (part) {
      case "Date":
      case "Month":
        return "(\\d{1,2})";
      case "Year":
        return "(\\d{4})";
      default:
        return "";
    }
  });
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${tokenPatterns.join(escapedSeparator)}$`);
}

/** Strictly parse a display-format date string (rejects rollover dates like 32/06/2026). */
export function parseStrictDisplayDate(
  input: string,
  order: DatePart[],
  separator: string,
): StrictDisplayDateParseResult {
  const trimmed = input.trim();
  if (!trimmed) {return { ok: false, reason: "empty" };}

  const pattern = buildStrictDisplayDatePattern(order, separator);
  const match = trimmed.match(pattern);
  if (!match) {return { ok: false, reason: "invalid" };}

  let day = 0;
  let month = 0;
  let year = 0;

  order.forEach((part, index) => {
    const value = Number(match[index + 1]);
    switch (part) {
      case "Date":
        day = value;
        break;
      case "Month":
        month = value;
        break;
      case "Year":
        year = value;
        break;
    }
  });

  if (!isValidCalendarDate(year, month, day)) {
    return { ok: false, reason: "invalid" };
  }

  const date = new Date(year, month - 1, day);
  return {
    ok: true,
    date,
    normalized: formatDateDisplay(date, order, separator),
  };
}

export function formatStoredDateForDisplay(
  value: string | undefined,
  order: DatePart[],
  separator: string,
): string {
  const parsed = parseDateString(value);
  if (!parsed) {return "";}
  return formatDateDisplay(parsed, order, separator);
}
