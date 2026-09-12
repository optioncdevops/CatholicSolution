import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import {
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeControlIconClass,
  themeFormControlMenuClass,
  resolveFormControlPortalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { AppIcon } from "@app/components/icons";
import {
  type BasePickerProps,
  type CalendarViewMode,
  type DatePart,
  DEFAULT_DATE_FORMAT,
  baseFieldClasses,
  baseLabelClasses,
  buildCalendarDays,
  formatDateDisplay,
  formatDateToISO,
  monthLabels,
  parseDateFormatString,
  parseDateString,
  weekdayLabels,
} from "./BaseDatePicker";

interface DateRangePickerProps {
  fromLabel: string;
  toLabel: string;
  requiredFrom?: boolean;
  requiredTo?: boolean;
  fromProps?: Omit<BasePickerProps, "label">;
  toProps?: Omit<BasePickerProps, "label">;
  /**
   * Optional human-readable format e.g. "dd/MM/yyyy", "yyyy-MM-dd".
   * Controls both display and output if `outputFormat` is not provided.
   */
  format?: string;
  /**
   * Output / submitted format, e.g. "yyyy-MM-dd" or "dd/MM/yyyy".
   * - Controls what goes to the caller via fromProps/toProps onChange and hidden inputs.
   * - If omitted, falls back to `format`, then ISO "yyyy-MM-dd".
   */
  outputFormat?: string;
  displayOrder?: DatePart[];
  separator?: string;
  /** Show a clear icon in the input field to reset the selection. */
  clearable?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromLabel,
  toLabel,
  requiredFrom,
  requiredTo,
  fromProps,
  toProps,
  format = DEFAULT_DATE_FORMAT,
  outputFormat,
  displayOrder = ["Date", "Month", "Year"],
  separator = " ",
  clearable = true,
}) => {
  const label = `${fromLabel} - ${toLabel}`;
  const [isOpen, setIsOpen] = useState(false);
  const [startValue, setStartValue] = useState<string | undefined>(
    fromProps?.value ?? fromProps?.defaultValue,
  );
  const [endValue, setEndValue] = useState<string | undefined>(
    toProps?.value ?? toProps?.defaultValue,
  );

  // Sync with controlled values — prop-driven resets, adjusted during render rather than in an
  // effect (React's own recommended pattern for "state that mirrors a prop when it changes").
  // Each sentinel tracks every identity change (matching the old effect's dependency array
  // exactly) but only pushes into the value state when actually defined, so a value that goes
  // controlled -> uncontrolled -> controlled-with-the-same-value-again still re-syncs correctly.
  const [renderedForFromValue, setRenderedForFromValue] = useState(fromProps?.value);
  if (renderedForFromValue !== fromProps?.value) {
    setRenderedForFromValue(fromProps?.value);
    if (fromProps?.value !== undefined) {
      setStartValue(fromProps.value);
    }
  }

  const [renderedForToValue, setRenderedForToValue] = useState(toProps?.value);
  if (renderedForToValue !== toProps?.value) {
    setRenderedForToValue(toProps?.value);
    if (toProps?.value !== undefined) {
      setEndValue(toProps.value);
    }
  }

  const startDate = useMemo(() => parseDateString(startValue), [startValue]);
  const endDate = useMemo(() => parseDateString(endValue), [endValue]);

  const initialForView = startDate ?? endDate ?? new Date();
  const [viewYear, setViewYear] = useState(initialForView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialForView.getMonth());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
  }>({ top: 0, left: 0, width: 0, placement: "bottom" });

  const updatePlacement = () => {
    if (!triggerRef.current || typeof window === "undefined" || !document.body)
      {return;}

    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 400,
          menuWidth: 288,
        }),
      );
    } catch (error) {
      console.warn("DateRangePicker: Error calculating position", error);
    }
  };

  // Close on outside click and update placement
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !document.body) {return;}

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      try {
        const target = e.target as Node | null;
        if (!target) {return;}

        const trigger = triggerRef.current;
        const menu = menuRef.current;
        const wrapper = wrapperRef.current;

        if (!wrapper) {
          setIsOpen(false);
          setHoverDate(null);
          return;
        }

        const insideWrapper = wrapper.contains(target);
        const insideTrigger = trigger?.contains(target);
        const insideMenu = menu?.contains(target);

        if (!insideWrapper && !insideTrigger && !insideMenu) {
          setIsOpen(false);
          setHoverDate(null);
        }
      } catch (error) {
        console.warn("DateRangePicker: Error handling click outside", error);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHoverDate(null);
      }
    };

    const handleScrollOrResize = () => {
      updatePlacement();
    };

    updatePlacement();

    // Update placement after a short delay to get actual menu dimensions
    const timeoutId = setTimeout(() => {
      updatePlacement();
    }, 0);

    // Also update after menu renders to get accurate height
    const rafId = requestAnimationFrame(() => {
      updatePlacement();
      // One more update after menu is fully rendered
      setTimeout(() => {
        updatePlacement();
      }, 50);
    });

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen]);

  const days = useMemo(
    () => buildCalendarDays(viewYear, viewMonth, null),
    [viewYear, viewMonth],
  );

  const goPrev = () => {
    if (viewMode === "year") {
      setViewYear((y) => y - 12);
    } else {
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
      setViewYear((y) => y + 12);
    } else {
      setViewMonth((prev) => {
        if (prev === 11) {
          setViewYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });
    }
  };

  const handleSelectDate = (clicked: Date) => {
    if (!startDate || (startDate && endDate)) {
      // start new range
      setStartValue(formatDateToISO(clicked));
      setEndValue(undefined);
      setHoverDate(null);
      fromProps?.onChange?.(formatDateToISO(clicked));
      toProps?.onChange?.("");
      return;
    }

    // we have start but no end
    let newStart = startDate;
    let newEnd = clicked;

    if (newEnd < newStart) {
      [newStart, newEnd] = [newEnd, newStart];
    }

    const startIso = formatDateToISO(newStart);
    const endIso = formatDateToISO(newEnd);

    setStartValue(startIso);
    setEndValue(endIso);
    fromProps?.onChange?.(startIso);
    toProps?.onChange?.(endIso);
    setIsOpen(false);
    setHoverDate(null);
  };

  const effectiveDisplayFormat = format;
  const formatConfig = useMemo(
    () => parseDateFormatString(effectiveDisplayFormat),
    [effectiveDisplayFormat],
  );
  const effectiveOrder = formatConfig?.order ?? displayOrder;
  const effectiveSeparator = formatConfig?.separator ?? separator;

  const effectiveOutputFormat = outputFormat ?? effectiveDisplayFormat;
  const outputConfig = useMemo(
    () => parseDateFormatString(effectiveOutputFormat),
    [effectiveOutputFormat],
  );

  const formatOutputValue = (date: Date): string => {
    if (outputConfig) {
      return formatDateDisplay(
        date,
        outputConfig.order,
        outputConfig.separator,
      );
    }
    return formatDateToISO(date);
  };

  const displayText = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDateDisplay(
        startDate,
        effectiveOrder,
        effectiveSeparator,
      )} – ${formatDateDisplay(endDate, effectiveOrder, effectiveSeparator)}`;
    }
    if (startDate) {
      return `${formatDateDisplay(
        startDate,
        effectiveOrder,
        effectiveSeparator,
      )} – …`;
    }
    return "Select date range";
  }, [startDate, endDate, effectiveOrder, effectiveSeparator]);

  const isInRange = (date: Date) => {
    if (!startDate) {return false;}

    if (endDate) {
      return date > startDate && date < endDate;
    }

    if (hoverDate) {
      if (hoverDate > startDate) {
        return date > startDate && date < hoverDate;
      }
      if (hoverDate < startDate) {
        return date < startDate && date > hoverDate;
      }
    }

    return false;
  };

  const isStart = (date: Date) =>
    !!startDate &&
    date.getFullYear() === startDate.getFullYear() &&
    date.getMonth() === startDate.getMonth() &&
    date.getDate() === startDate.getDate();

  const isEnd = (date: Date) =>
    !!endDate &&
    date.getFullYear() === endDate.getFullYear() &&
    date.getMonth() === endDate.getMonth() &&
    date.getDate() === endDate.getDate();

  const handleClear = () => {
    setStartValue(undefined);
    setEndValue(undefined);
    fromProps?.onChange?.("");
    toProps?.onChange?.("");
    setHoverDate(null);
  };

  const hasValue = !!startDate || !!endDate;

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      <label className={baseLabelClasses}>
        {label}{" "}
        {(requiredFrom || requiredTo) && (
          <span className="text-danger-500">*</span>
        )}
      </label>
      <div className="relative">
        {/* Hidden fields for form submit */}
        <input
          type="hidden"
          name={fromProps?.name}
          value={startDate ? formatOutputValue(startDate) : ""}
        />
        <input
          type="hidden"
          name={toProps?.name}
          value={endDate ? formatOutputValue(endDate) : ""}
        />

        <button
          ref={triggerRef}
          type="button"
          className={`${baseFieldClasses} flex items-center justify-between text-left cursor-pointer`}
          onClick={() => { setIsOpen((o) => !o); }}
        >
          <span className={startDate || endDate ? "" : "text-secondary-400"}>
            {displayText}
          </span>
          <div className="ml-2 flex items-center gap-1">
            {hasValue && clearable && (
              <span
                role="button"
                aria-label="Clear selection"
                tabIndex={-1}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 dark:text-secondary-500 dark:hover:bg-secondary-700 dark:hover:text-secondary-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <AppIcon
                  name="xCircle"
                  size="controlClear"
                  className={themeControlClearIconClass}
                  decorative
                />
              </span>
            )}
            <AppIcon
              name="calendar"
              size="controlField"
              className={themeControlFieldIconClass}
              decorative
            />
          </div>
        </button>

        {isOpen &&
          typeof document !== "undefined" &&
          document.body &&
          createPortal(
            <div
              ref={menuRef}
              className={cn(
                "fixed w-72 p-3 backdrop-blur-sm animate-popup",
                resolveFormControlPortalLayerClass(),
                themeFormControlMenuClass,
                menuStyle.placement === "top" && "animate-popup-top",
              )}
              style={{
                top: `${menuStyle.top}px`,
                left: `${menuStyle.left}px`,
                width: `${menuStyle.width}px`,
              }}
              onMouseDown={(e) => { e.stopPropagation(); }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:hover:bg-secondary-800"
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
                    className={`rounded-lg px-2 py-1 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800 ${
                      viewMode === "month"
                        ? "bg-secondary-100 text-secondary-900 dark:bg-secondary-800"
                        : ""
                    }`}
                    onClick={() =>
                      { setViewMode((prev) =>
                        prev === "month" ? "day" : "month",
                      ); }
                    }
                  >
                    {monthLabels[viewMonth]}
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-2 py-1 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800 ${
                      viewMode === "year"
                        ? "bg-secondary-100 text-secondary-900 dark:bg-secondary-800"
                        : ""
                    }`}
                    onClick={() =>
                      { setViewMode((prev) => (prev === "year" ? "day" : "year")); }
                    }
                  >
                    {viewYear}
                  </button>
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:hover:bg-secondary-800"
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
                      const inRange = isInRange(day.date);
                      const isStartDay = isStart(day.date);
                      const isEndDay = isEnd(day.date);

                      const baseClasses =
                        "flex h-8 w-8 items-center justify-center transition-colors";

                      let colorClasses =
                        "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                      if (!day.inCurrentMonth) {
                        colorClasses =
                          "text-secondary-300 hover:bg-secondary-50 dark:text-secondary-600 dark:hover:bg-secondary-800/60";
                      }

                      if (inRange) {
                        colorClasses =
                          "bg-primary-600/10 text-secondary-900 hover:bg-primary-600/20 dark:text-secondary-100";
                      }

                      if (isStartDay || isEndDay) {
                        colorClasses =
                          "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600";
                      } else if (day.isToday && !inRange) {
                        colorClasses += " border border-primary-500/60";
                      }

                      let roundedClasses = "rounded-full";
                      if (inRange || isStartDay || isEndDay) {
                        if (isStartDay && isEndDay) {
                          roundedClasses = "rounded-full";
                        } else if (isStartDay) {
                          roundedClasses = "rounded-l-full";
                        } else if (isEndDay) {
                          roundedClasses = "rounded-r-full";
                        } else {
                          roundedClasses = "rounded-none";
                        }
                      }

                      return (
                        <button
                          key={key}
                          type="button"
                          className={`${baseClasses} ${roundedClasses} ${colorClasses}`}
                          onClick={() => { handleSelectDate(day.date); }}
                          onMouseEnter={() => { setHoverDate(day.date); }}
                          onMouseLeave={() => { setHoverDate(null); }}
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
                  {monthLabels.map((labelText, index) => (
                    <button
                      key={labelText}
                      type="button"
                      className="rounded-xl px-2 py-1.5 text-center text-secondary-700 transition-colors hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800"
                      onClick={() => {
                        setViewMonth(index);
                        setViewMode("day");
                      }}
                    >
                      {labelText}
                    </button>
                  ))}
                </div>
              )}

              {viewMode === "year" && (
                <div className="grid grid-cols-4 gap-2 pt-1 text-[13px]">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const year = viewYear - 7 + idx;
                    const currentYear = new Date().getFullYear();
                    const isCurrentYear = year === currentYear;

                    let classes =
                      "rounded-xl px-2 py-1.5 text-center transition-colors text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                    if (isCurrentYear) {
                      classes += " border border-primary-600/60";
                    }

                    return (
                      <button
                        key={year}
                        type="button"
                        className={classes}
                        onClick={() => {
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
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};
