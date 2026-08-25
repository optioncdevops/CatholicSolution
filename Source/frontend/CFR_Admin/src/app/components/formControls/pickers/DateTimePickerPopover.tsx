import React, { useMemo, useState } from "react";
import { cn } from "@app/utilities/cn";
import {
  type CalendarViewMode,
  buildCalendarDays,
  canNavigateToNextMonth,
  canNavigateToNextYearBlock,
  canNavigateToPreviousMonth,
  canNavigateToPreviousYearBlock,
  formatDateDisplay,
  formatDateToISO,
  isMonthOutsideConstraints,
  isYearOutsideConstraints,
  monthLabels,
  parseDateString,
  weekdayLabels,
} from "./BaseDatePicker";
import { AppIcon } from "@app/components/icons";
import {
  themeControlIconClass,
  themePickerDayDisabledClass,
} from "@designSystem/theme/styles/componentStyle";
import {
  formatHHmmFromParts,
  formatTimeForDisplay,
  parseTimePartsFromHHmm,
} from "./dateTimePicker.utils";

export interface DateTimePickerPopoverProps {
  draftDateIso: string;
  draftTimeHhmm: string;
  onSelectDate: (isoDate: string) => void;
  onTimeChange: (hhmm: string, isComplete: boolean) => void;
  onClear: () => void;
  onTodayNow: () => void;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DateTimePickerPopover: React.FC<DateTimePickerPopoverProps> = ({
  draftDateIso,
  draftTimeHhmm,
  onSelectDate,
  onTimeChange,
  onClear,
  onTodayNow,
  showTodayButton = true,
  showClearButton = true,
  minDate,
  maxDate,
}) => {
  const selectedDate = useMemo(
    () => parseDateString(draftDateIso),
    [draftDateIso],
  );
  const initialForView = selectedDate ?? new Date();
  const [viewYear, setViewYear] = useState(initialForView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialForView.getMonth());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");

  const timeParts = useMemo(
    () => parseTimePartsFromHHmm(draftTimeHhmm),
    [draftTimeHhmm],
  );
  const [hour12, setHour12] = useState<number | null>(
    timeParts?.hour12 ?? null,
  );
  const [minute, setMinute] = useState<number | null>(
    timeParts?.minute ?? null,
  );
  const [period, setPeriod] = useState<"AM" | "PM" | null>(
    timeParts?.period ?? null,
  );
  const [activePart, setActivePart] = useState<"hour" | "minute" | "period">(
    "hour",
  );

  // Sync the calendar view and time parts from the draft date/time during render rather
  // than in an effect — an effect body would paint the previous view for one frame before
  // resetting.
  const [renderedForDate, setRenderedForDate] = useState(draftDateIso);
  if (selectedDate && renderedForDate !== draftDateIso) {
    setRenderedForDate(draftDateIso);
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }

  const [renderedForTime, setRenderedForTime] = useState(draftTimeHhmm);
  if (renderedForTime !== draftTimeHhmm) {
    setRenderedForTime(draftTimeHhmm);
    const next = parseTimePartsFromHHmm(draftTimeHhmm);
    if (next) {
      setHour12(next.hour12);
      setMinute(next.minute);
      setPeriod(next.period);
    } else if (!draftTimeHhmm) {
      setHour12(null);
      setMinute(null);
      setPeriod(null);
    }
  }

  const days = useMemo(
    () => buildCalendarDays(viewYear, viewMonth, selectedDate),
    [viewYear, viewMonth, selectedDate],
  );

  const minDateValue = useMemo(() => parseDateString(minDate), [minDate]);
  const maxDateValue = useMemo(() => parseDateString(maxDate), [maxDate]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const periods: ("AM" | "PM")[] = ["AM", "PM"];

  const commitTime = (
    h: number | null,
    m: number | null,
    p: "AM" | "PM" | null,
    isComplete: boolean,
  ) => {
    if (h === null || m === null || !p) {return;}
    const hhmm = formatHHmmFromParts(h, m, p);
    onTimeChange(hhmm, isComplete);
  };

  const handleSelectDate = (date: Date) => {
    const iso = formatDateToISO(date);
    onSelectDate(iso);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    setViewMode("day");
  };

  const goPrev = () => {
    if (viewMode === "year") {
      if (!canNavigateToPreviousYearBlock(viewYear, minDateValue)) {return;}
      setViewYear((y) => y - 12);
    } else {
      if (!canNavigateToPreviousMonth(viewYear, viewMonth, minDateValue)) {
        return;
      }
      setViewMonth((prev) => {
        if (prev === 0) {
          setViewYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      });
    }
  };

  const goNext = () => {
    if (viewMode === "year") {
      if (!canNavigateToNextYearBlock(viewYear, maxDateValue)) {return;}
      setViewYear((y) => y + 12);
    } else {
      if (!canNavigateToNextMonth(viewYear, viewMonth, maxDateValue)) {return;}
      setViewMonth((prev) => {
        if (prev === 11) {
          setViewYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });
    }
  };

  const canGoPrev = useMemo(() => {
    if (viewMode === "year") {
      return canNavigateToPreviousYearBlock(viewYear, minDateValue);
    }
    return canNavigateToPreviousMonth(viewYear, viewMonth, minDateValue);
  }, [viewMode, viewYear, viewMonth, minDateValue]);

  const canGoNext = useMemo(() => {
    if (viewMode === "year") {
      return canNavigateToNextYearBlock(viewYear, maxDateValue);
    }
    return canNavigateToNextMonth(viewYear, viewMonth, maxDateValue);
  }, [viewMode, viewYear, viewMonth, maxDateValue]);

  const headerPreview = useMemo(() => {
    const dateStr = selectedDate
      ? formatDateDisplay(selectedDate, ["Date", "Month", "Year"], "/")
      : "Select date";
    const timeStr =
      hour12 !== null && minute !== null && period
        ? formatTimeForDisplay(formatHHmmFromParts(hour12, minute, period))
        : "Select time";
    return `${dateStr} · ${timeStr}`;
  }, [selectedDate, hour12, minute, period]);

  return (
    <div className="flex max-h-[min(24rem,70vh)] flex-col">
      <div className="border-b border-border px-3 py-2 text-xs font-medium text-foreground">
        {headerPreview}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3 sm:flex-row">
        <div className="w-full shrink-0 sm:w-[17.5rem]">
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              disabled={!canGoPrev}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:hover:bg-secondary-800",
                !canGoPrev && "pointer-events-none opacity-40",
              )}
              onClick={goPrev}
            >
              <AppIcon
                name="chevronLeft"
                size="controlField"
                className={themeControlIconClass}
                decorative
              />
            </button>
            <div className="flex items-center gap-1 text-[13px] font-medium text-secondary-900 dark:text-secondary-50">
              <button
                type="button"
                className={cn(
                  "rounded-lg px-2 py-1 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800",
                  viewMode === "month" &&
                    "bg-secondary-100 text-secondary-900 dark:bg-secondary-800",
                )}
                onClick={() =>
                  { setViewMode((prev) => (prev === "month" ? "day" : "month")); }
                }
              >
                {monthLabels[viewMonth]}
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-lg px-2 py-1 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800",
                  viewMode === "year" &&
                    "bg-secondary-100 text-secondary-900 dark:bg-secondary-800",
                )}
                onClick={() =>
                  { setViewMode((prev) => (prev === "year" ? "day" : "year")); }
                }
              >
                {viewYear}
              </button>
            </div>
            <button
              type="button"
              disabled={!canGoNext}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:hover:bg-secondary-800",
                !canGoNext && "pointer-events-none opacity-40",
              )}
              onClick={goNext}
            >
              <AppIcon
                name="chevronRight"
                size="controlField"
                className={themeControlIconClass}
                decorative
              />
            </button>
          </div>

          {viewMode === "day" && (
            <>
              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-secondary-400">
                {weekdayLabels.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-[13px]">
                {days.map((day) => {
                  const key = formatDateToISO(day.date);
                  const isBeforeMin = !!minDateValue && day.date < minDateValue;
                  const isAfterMax = !!maxDateValue && day.date > maxDateValue;
                  const isDisabled = isBeforeMin || isAfterMax;

                  let colorClasses =
                    "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                  if (!day.inCurrentMonth) {
                    colorClasses =
                      "text-secondary-300 hover:bg-secondary-50 dark:text-secondary-600";
                  }
                  if (day.isSelected) {
                    colorClasses =
                      "bg-primary-600 text-white hover:bg-primary-700";
                  } else if (day.isToday) {
                    colorClasses += " border border-primary-500/60";
                  }
                  if (isDisabled) {
                    colorClasses = themePickerDayDisabledClass;
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                        colorClasses,
                      )}
                      disabled={isDisabled}
                      onClick={
                        isDisabled
                          ? undefined
                          : () => { handleSelectDate(day.date); }
                      }
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === "month" && (
            <div className="grid grid-cols-3 gap-2 pt-1 text-[13px]">
              {monthLabels.map((label, index) => {
                const isSelected =
                  index === viewMonth &&
                  !!selectedDate &&
                  selectedDate.getFullYear() === viewYear;
                const isMonthDisabled = isMonthOutsideConstraints(
                  viewYear,
                  index,
                  minDateValue,
                  maxDateValue,
                );
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isMonthDisabled}
                    className={cn(
                      "rounded-xl px-2 py-1.5 text-center transition-colors",
                      isMonthDisabled
                        ? themePickerDayDisabledClass
                        : isSelected
                          ? "bg-primary-600 text-white"
                          : "text-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800",
                    )}
                    onClick={() => {
                      if (isMonthDisabled) {return;}
                      setViewMonth(index);
                      setViewMode("day");
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === "year" && (
            <div className="grid grid-cols-4 gap-2 pt-1 text-[13px]">
              {Array.from({ length: 16 }).map((_, idx) => {
                const year = viewYear - 7 + idx;
                const isSelected =
                  !!selectedDate && selectedDate.getFullYear() === year;
                const isYearDisabled = isYearOutsideConstraints(
                  year,
                  minDateValue,
                  maxDateValue,
                );
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={isYearDisabled}
                    className={cn(
                      "rounded-xl px-2 py-1.5 text-center transition-colors",
                      isYearDisabled
                        ? themePickerDayDisabledClass
                        : isSelected
                          ? "bg-primary-600 text-white"
                          : "text-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800",
                    )}
                    onClick={() => {
                      if (isYearDisabled) {return;}
                      setViewYear(year);
                      setViewMode("month");
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden w-px shrink-0 bg-border sm:block" />

        <div className="min-w-0 flex-1">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-400">
            Time
          </p>
          <div className="flex gap-2">
            <TimeColumn
              title="Hour"
              active={activePart === "hour"}
              onFocus={() => { setActivePart("hour"); }}
            >
              {hours.map((h) => (
                <TimeOption
                  key={h}
                  selected={h === hour12}
                  onClick={() => {
                    setHour12(h);
                    setActivePart("minute");
                  }}
                >
                  {`${h}`.padStart(2, "0")}
                </TimeOption>
              ))}
            </TimeColumn>
            <TimeColumn
              title="Min"
              active={activePart === "minute"}
              onFocus={() => { setActivePart("minute"); }}
            >
              {minutes.map((m) => (
                <TimeOption
                  key={m}
                  selected={m === minute}
                  onClick={() => {
                    setMinute(m);
                    setActivePart("period");
                  }}
                >
                  {`${m}`.padStart(2, "0")}
                </TimeOption>
              ))}
            </TimeColumn>
            <TimeColumn
              title="AM/PM"
              active={activePart === "period"}
              onFocus={() => { setActivePart("period"); }}
              narrow
            >
              {periods.map((p) => (
                <TimeOption
                  key={p}
                  selected={p === period}
                  onClick={() => {
                    setPeriod(p);
                    commitTime(hour12, minute, p, true);
                  }}
                >
                  {p}
                </TimeOption>
              ))}
            </TimeColumn>
          </div>
        </div>
      </div>

      {(showClearButton || showTodayButton) && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs">
          {showClearButton ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              onClick={onClear}
            >
              Clear
            </button>
          ) : (
            <span />
          )}
          {showTodayButton ? (
            <button
              type="button"
              className="rounded-lg bg-primary-600 px-3 py-1 font-medium text-white hover:bg-primary-700"
              onClick={onTodayNow}
            >
              Today &amp; now
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

function TimeColumn({
  title,
  active,
  onFocus,
  narrow,
  children,
}: {
  title: string;
  active: boolean;
  onFocus: () => void;
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-xl p-2 text-xs",
        narrow && "max-w-[4rem]",
        active
          ? "border border-primary-100 bg-primary-50 dark:border-primary-900/40 dark:bg-primary-950/40"
          : "bg-secondary-50 dark:bg-secondary-900/60",
      )}
      onMouseEnter={onFocus}
    >
      <div
        className={cn(
          "mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide",
          active ? "text-primary-600" : "text-secondary-400",
        )}
      >
        {title}
      </div>
      <div className="max-h-40 space-y-0.5 overflow-y-auto pr-0.5">
        {children}
      </div>
    </div>
  );
}

function TimeOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full rounded-lg px-2 py-1 text-left text-[13px] transition-colors",
        selected
          ? "bg-primary-600 text-white"
          : "text-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
