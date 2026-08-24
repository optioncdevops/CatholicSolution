import {
  DEFAULT_DATE_FORMAT,
  formatDateDisplay,
  formatDateToISO,
  parseDateFormatString,
  parseDateString,
} from "./BaseDatePicker";

/** Default combined datetime string for APIs and storage. */
export const DEFAULT_DATETIME_OUTPUT_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

/** Default trigger display format. */
export const DEFAULT_DATETIME_DISPLAY_FORMAT = "dd/MM/yyyy hh:mm a";

export const DATETIME_PREVIEW_PLACEHOLDER = "Select date and time";

/** Format 24h `HH:mm` for display as `h:mm AM/PM`. */
export function formatTimeForDisplay(hhmm: string): string {
  const parsed = parseTimeToHourMinute(hhmm);
  if (!parsed) {return hhmm;}

  const h24 = Number(parsed.hours);
  const minute = parsed.minutes;
  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) {h12 = 12;}

  return `${h12}:${minute} ${period}`;
}

export function parseTimePartsFromHHmm(
  hhmm: string,
): { hour12: number; minute: number; period: "AM" | "PM" } | null {
  const parsed = parseTimeToHourMinute(hhmm);
  if (!parsed) {return null;}

  const h24 = Number(parsed.hours);
  const minute = Number(parsed.minutes);
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) {hour12 = 12;}

  return { hour12, minute, period };
}

export function formatHHmmFromParts(
  hour12: number,
  minute: number,
  period: "AM" | "PM",
): string {
  let h24 = hour12 % 12;
  if (period === "PM") {h24 += 12;}
  return `${`${h24}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

/** Formatted text for the single DateTimePicker trigger. */
export function formatDateTimeFieldDisplay(
  datePart: string,
  timePart: string,
  dateDisplayFormat: string = DEFAULT_DATE_FORMAT,
): string {
  const hasDate = Boolean(datePart?.trim());
  const hasTime = Boolean(timePart?.trim());
  if (!hasDate && !hasTime) {return "";}

  const dateStr = hasDate
    ? (() => {
        const parsed = parseDateString(datePart);
        if (!parsed) {return datePart;}
        const config = parseDateFormatString(dateDisplayFormat);
        if (config) {
          return formatDateDisplay(parsed, config.order, config.separator);
        }
        return formatDateToISO(parsed);
      })()
    : "";

  const timeStr = hasTime ? formatTimeForDisplay(timePart) : "";

  if (hasDate && hasTime) {return `${dateStr} ${timeStr}`;}
  if (hasDate) {return dateStr;}
  return timeStr;
}

/**
 * Normalizes a date part to `yyyy-MM-dd` when parseable.
 */
export function normalizeDatePart(date?: string | null): string {
  const trimmed = date?.trim() ?? "";
  if (!trimmed) {return "";}
  const parsed = parseDateString(trimmed);
  return parsed ? formatDateToISO(parsed) : trimmed;
}

/**
 * Normalizes a time part to 24-hour `HH:mm` when parseable.
 */
export function normalizeTimePart(time?: string | null): string {
  const parsed = parseTimeToHourMinute(time?.trim() ?? "");
  if (!parsed) {return time?.trim() ?? "";}
  return `${parsed.hours}:${parsed.minutes}`;
}

/**
 * Combines date and time strings into `yyyy-MM-ddTHH:mm:ss`.
 * Returns `null` when either part is missing or cannot be parsed.
 */
export function combineDateAndTime(
  date?: string | null,
  time?: string | null,
): string | null {
  const datePart = normalizeDatePart(date);
  const timePart = normalizeTimePart(time);
  if (!datePart || !timePart) {return null;}

  const parsedDate = parseDateString(datePart);
  const parsedTime = parseTimeToHourMinute(timePart);
  if (!parsedDate || !parsedTime) {return null;}

  const isoDate = formatDateToISO(parsedDate);
  const { hours, minutes } = parsedTime;
  return `${isoDate}T${hours}:${minutes}:00`;
}

/**
 * Splits a combined datetime value into date (`yyyy-MM-dd`) and time (`HH:mm`) parts.
 */
export function splitDateTime(value?: string | null): {
  date: string;
  time: string;
} {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {return { date: "", time: "" };}

  const isoMatch = /^(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}:\d{2})(?::\d{2})?/.exec(trimmed);
  if (isoMatch) {
    return {
      date: isoMatch[1],
      time: normalizeTimePart(isoMatch[2]),
    };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { date: trimmed, time: "" };
  }

  const parsed = parseDateString(trimmed);
  if (parsed) {
    return { date: formatDateToISO(parsed), time: "" };
  }

  return { date: "", time: "" };
}

/**
 * Formats a combined datetime for `onChange` / field value using `outputFormat`.
 */
export function formatDateTimeOutput(
  combined: string,
  outputFormat: string = DEFAULT_DATETIME_OUTPUT_FORMAT,
): string {
  if (outputFormat === DEFAULT_DATETIME_OUTPUT_FORMAT) {
    return combined;
  }

  const { date, time } = splitDateTime(combined);
  const timeSegments = `${time}:00:00`.split(":");
  const hours = timeSegments[0] ?? "00";
  const minutes = timeSegments[1] ?? "00";
  const seconds = timeSegments[2] ?? "00";

  return outputFormat
    .replace(/yyyy-MM-dd/g, date)
    .replace(/HH:mm:ss/g, `${hours}:${minutes}:${seconds}`)
    .replace(/HH:mm/g, `${hours}:${minutes}`);
}

/** Read-only preview when parts are incomplete. */
export function formatDateTimePreview(
  date?: string | null,
  time?: string | null,
): string {
  return combineDateAndTime(date, time) ?? DATETIME_PREVIEW_PLACEHOLDER;
}

function parseTimeToHourMinute(
  time: string,
): { hours: string; minutes: string } | null {
  if (!time) {return null;}

  const h24 = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (h24) {
    const hour = Number(h24[1]);
    const minute = Number(h24[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return {
        hours: `${hour}`.padStart(2, "0"),
        minutes: `${minute}`.padStart(2, "0"),
      };
    }
  }

  const h12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
  if (h12) {
    let hour = Number(h12[1]) % 12;
    const minute = Number(h12[2]);
    const period = h12[3].toUpperCase();
    if (period === "PM") {hour += 12;}
    if (minute >= 0 && minute <= 59) {
      return {
        hours: `${hour}`.padStart(2, "0"),
        minutes: `${minute}`.padStart(2, "0"),
      };
    }
  }

  return null;
}

export function toPickerDateString(
  value?: string | Date,
): string | undefined {
  if (value == null || value === "") {return undefined;}
  if (value instanceof Date) {return formatDateToISO(value);}
  return value;
}
