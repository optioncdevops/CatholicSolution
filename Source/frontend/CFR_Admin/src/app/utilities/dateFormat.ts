import {
  DEFAULT_DATE_FORMAT,
  DATE_PICKER_CONSTRAINT_MESSAGE,
  DATE_PICKER_INVALID_MESSAGE,
  formatDateDisplay,
  parseDateFormatString,
  parseDateString,
} from "../../modules/admin/components/formControls/pickers/BaseDatePicker";
import {
  formatDateTimeFieldDisplay,
  splitDateTime,
} from "../../modules/admin/components/formControls/pickers/dateTimePicker.utils";
import {
  DATE_DISPLAY_FORMAT,
  formatDateInputMask,
  parseManualDateInput,
} from "../../modules/admin/components/formControls/pickers/dateInputMask";

/** Format an ISO or dd/MM/yyyy date string for UI display. */
export function formatDateStringForDisplay(
  value?: string | null,
  format: string = DEFAULT_DATE_FORMAT,
): string {
  if (!value?.trim()) {return "";}
  // Strip time / Z so "2026-07-23T00:00:00Z" formats as dd/MM/yyyy.
  const dateOnly = value.trim().includes("T")
    ? value.trim().split("T")[0]
    : value.trim();
  const date = parseDateString(dateOnly);
  if (!date) {return value;}
  const pattern = parseDateFormatString(format);
  if (!pattern) {return value;}
  return formatDateDisplay(date, pattern.order, pattern.separator);
}

/**
 * Normalizes API datetime strings so `Date` can parse them reliably.
 * - Trims .NET 7-digit fractional seconds to milliseconds
 * - ISO strings without a timezone offset are left as-is so the browser
 *   parses them as local time (the backend stores local IST, not UTC).
 */
function normalizeApiDateTimeForParsing(value: string): string {
  let normalized = value.trim();

  // 2026-07-21T16:54:00.1234567 → 2026-07-21T16:54:00.123
  normalized = normalized.replace(/(\.\d{3})\d+/, "$1");

  return normalized;
}

function formatLocalDateTimeParts(date: Date): { date: string; time: string } {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

/**
 * Format a date/time value for UI display.
 * Date-only → dd/mm/yyyy. With time → dd/mm/yyyy h:mm AM/PM (local timezone).
 * UTC / offset ISO strings from the API are converted to the browser's local time.
 */
export function formatDateTimeStringForDisplay(value?: string | null): string {
  if (!value?.trim()) {return "";}

  const trimmed = value.trim();

  // ISO datetime from API → parse as instant, then render in local timezone.
  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{1,2}:\d{2}/.test(trimmed)) {
    const parsed = new Date(normalizeApiDateTimeForParsing(trimmed.replace(" ", "T")));
    if (!Number.isNaN(parsed.getTime())) {
      const local = formatLocalDateTimeParts(parsed);
      return formatDateTimeFieldDisplay(local.date, local.time);
    }
  }

  const { date, time } = splitDateTime(trimmed);
  if (date && time) {
    return formatDateTimeFieldDisplay(date, time);
  }

  const ampmMatch = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (ampmMatch) {
    const dateStr = formatDateStringForDisplay(ampmMatch[1]);
    return `${dateStr} ${ampmMatch[2]} ${ampmMatch[3].toUpperCase()}`;
  }

  const slashDateTimeMatch = /^(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (slashDateTimeMatch) {
    return `${slashDateTimeMatch[1]} ${slashDateTimeMatch[2]} ${slashDateTimeMatch[3].toUpperCase()}`;
  }

  if (date) {
    return formatDateStringForDisplay(date);
  }

  return formatDateStringForDisplay(trimmed) || trimmed;
}

/** Format an ISO datetime or date string to date-only string for display (dd/MM/yyyy). */
export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr?.trim()) { return ""; }
  const baseDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  return formatDateStringForDisplay(baseDate) || dateStr;
}

export {
  DEFAULT_DATE_FORMAT,
  DATE_DISPLAY_FORMAT,
  DATE_PICKER_CONSTRAINT_MESSAGE,
  DATE_PICKER_INVALID_MESSAGE,
  formatDateInputMask,
  parseManualDateInput,
};
