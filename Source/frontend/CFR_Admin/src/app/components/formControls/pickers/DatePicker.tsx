import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeControlClearButtonClass,
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeControlIconClass,
  themeControlIconHoverClass,
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFieldReadonlyClass,
  themeFormControlMenuClass,
  resolveFormControlPortalLayerClass,
  themeFormControlTextClass,
  themePickerDayDisabledClass,
} from "@designSystem/theme/styles/componentStyle";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { FormFieldLabel } from "../FormFieldLabel";
import { FormFieldFeedback } from "../FormFieldFeedback";
import { AppIcon } from "@app/components/icons";
import {
  type BasePickerProps,
  type CalendarViewMode,
  DEFAULT_DATE_FORMAT,
  DATE_PICKER_CONSTRAINT_MESSAGE,
  DATE_PICKER_INVALID_MESSAGE,
  baseFieldClasses,
  baseFieldShellClasses,
  baseFieldWrapperClasses,
  buildCalendarDays,
  canNavigateToNextMonth,
  canNavigateToNextYearBlock,
  canNavigateToPreviousMonth,
  canNavigateToPreviousYearBlock,
  formatDateDisplay,
  formatDateToISO,
  formatStoredDateForDisplay,
  isDateWithinConstraints,
  isMonthOutsideConstraints,
  isYearOutsideConstraints,
  monthLabels,
  parseDateFormatString,
  parseDateString,
  resolveCalendarViewDate,
  weekdayLabels,
} from "./BaseDatePicker";
import {
  formatDateInputMask,
  isDateWithinAllowedRange,
  isDmySlashDisplayFormat,
  parseManualDateInput,
} from "./dateInputMask";
import {
  DEFAULT_SELECT_CLEARABLE,
  resolvePickerClearable,
} from "../formControlDefaults";

const CALENDAR_POPUP_TAB_INDEX = -1;

type DatePickerInnerProps = BasePickerProps & {
  helperText?: string;
  error?: string;
};

const DatePickerInner: React.FC<DatePickerInnerProps> = ({
  id,
  label,
  required,
  optional,
  className,
  placeholder,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  format,
  displayFormat,
  outputFormat,
  displayOrder = ["Date", "Month", "Year"],
  separator = " ",
  minDate,
  maxDate,
  isDateDisabled,
  showTodayButton = true,
  clearable = DEFAULT_SELECT_CLEARABLE,
  showClearButton,
  hideClearButton,
  hideLabel = false,
  infoTooltip,
  helperText,
  error,
  readOnly,
  tabIndex,
}) => {
  // Clear affordance on trigger + calendar footer
  const resolvedShowClearButton = resolvePickerClearable(clearable, {
    showClearButton,
    hideClearButton,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ?? defaultValue,
  );
  const [draftText, setDraftText] = useState("");
  const [localError, setLocalError] = useState<string | undefined>();
  const isTypingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);

  const selectedDate = useMemo(
    () => parseDateString(internalValue),
    [internalValue],
  );
  const initialForView = selectedDate ?? new Date();
  const [viewYear, setViewYear] = useState(initialForView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialForView.getMonth());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, placement: "bottom", maxHeight: 320 });

  // Sync with controlled value — prop-driven reset, adjusted during render rather than in an
  // effect (React's own recommended pattern for "state that mirrors a prop when it changes").
  // The sentinel tracks every `value` identity change (matching the effect's old `[value]`
  // dependency exactly), but only pushes it into `internalValue` when actually defined, so a
  // `value` that goes controlled -> uncontrolled -> controlled-with-the-same-value-again still
  // re-syncs correctly instead of a stale sentinel silently skipping it.
  const [renderedForValue, setRenderedForValue] = useState(value);
  if (renderedForValue !== value) {
    setRenderedForValue(value);
    if (value !== undefined) {
      setInternalValue(value);
    }
  }

  const effectiveDisplayFormat = displayFormat ?? format ?? DEFAULT_DATE_FORMAT;

  const formatConfig = useMemo(
    () => parseDateFormatString(effectiveDisplayFormat),
    [effectiveDisplayFormat],
  );
  const effectiveOrder = formatConfig?.order ?? displayOrder;
  const effectiveSeparator = formatConfig?.separator ?? separator;
  const usesDmyMask = isDmySlashDisplayFormat(
    effectiveOrder,
    effectiveSeparator,
  );

  useEffect(() => {
    if (isTypingRef.current) {return;}
    setDraftText(
      formatStoredDateForDisplay(
        internalValue,
        effectiveOrder,
        effectiveSeparator,
      ),
    );
  }, [internalValue, effectiveOrder, effectiveSeparator]);

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
      console.warn("DatePicker: Error calculating position", error);
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
          return;
        }

        const insideWrapper = wrapper.contains(target);
        const insideTrigger = trigger?.contains(target);
        const insideMenu = menu?.contains(target);

        if (!insideWrapper && !insideTrigger && !insideMenu) {
          setIsOpen(false);
        }
      } catch (error) {
        console.warn("DatePicker: Error handling click outside", error);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
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

  useEffect(() => {
    if (isOpen) {updatePlacement();}
  }, [isOpen, viewMode, viewYear, viewMonth]);

  // For output, prefer explicit outputFormat, otherwise reuse display format,
  // finally fall back to ISO.
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

  const days = useMemo(
    () => buildCalendarDays(viewYear, viewMonth, selectedDate),
    [viewYear, viewMonth, selectedDate],
  );

  const handleSelectDate = (date: Date) => {
    const iso = formatDateToISO(date);
    isTypingRef.current = false;
    setLocalError(undefined);
    setInternalValue(iso);
    setDraftText(formatDateDisplay(date, effectiveOrder, effectiveSeparator));
    onChange?.(formatOutputValue(date));
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    setViewMode("day");
    setIsOpen(false);
  };

  const minDateValue = useMemo(() => parseDateString(minDate), [minDate]);
  const maxDateValue = useMemo(() => parseDateString(maxDate), [maxDate]);

  const revertDraftToCommitted = () => {
    setDraftText(
      formatStoredDateForDisplay(
        internalValue,
        effectiveOrder,
        effectiveSeparator,
      ),
    );
  };

  const commitDraft = () => {
    isTypingRef.current = false;
    const trimmed = draftText.trim();

    if (!trimmed) {
      setLocalError(undefined);
      if (internalValue) {
        setInternalValue(undefined);
        onChange?.("");
      }
      setDraftText("");
      return;
    }

    const parsed = parseManualDateInput(
      trimmed,
      effectiveOrder,
      effectiveSeparator,
    );

    if (!parsed.ok) {
      setLocalError(DATE_PICKER_INVALID_MESSAGE);
      revertDraftToCommitted();
      return;
    }

    if (
      !isDateWithinAllowedRange(parsed.date, {
        minDate: minDateValue,
        maxDate: maxDateValue,
        isDateDisabled,
      })
    ) {
      setLocalError(DATE_PICKER_CONSTRAINT_MESSAGE);
      revertDraftToCommitted();
      return;
    }

    setLocalError(undefined);
    const iso = formatDateToISO(parsed.date);
    setInternalValue(iso);
    setDraftText(parsed.normalized);
    onChange?.(formatOutputValue(parsed.date));
    setViewYear(parsed.date.getFullYear());
    setViewMonth(parsed.date.getMonth());
  };

  const effectivePlaceholder = placeholder ?? DEFAULT_DATE_FORMAT;
  const mergedError = error ?? localError;
  const isExplicitReadOnly = readOnly === true;
  const isDisabled = Boolean(disabled);
  const isReadOnly = isExplicitReadOnly && !isDisabled;
  const isInteractionBlocked = isDisabled || isExplicitReadOnly;
  const hasValue = !!selectedDate;
  const showClearIcon =
    resolvedShowClearButton &&
    !isInteractionBlocked &&
    (hasValue || Boolean(draftText.trim()));

  const applyDraftValue = (raw: string) => {
    const next = usesDmyMask ? formatDateInputMask(raw) : raw;
    setDraftText(next);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {return;}
      const cursor = next.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  const handleDraftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    applyDraftValue(event.target.value);
    if (localError) {setLocalError(undefined);}
  };

  const openCalendar = () => {
    if (isInteractionBlocked) {return;}
    const viewDate = resolveCalendarViewDate(
      selectedDate,
      minDateValue,
      maxDateValue,
    );
    setViewYear(viewDate.getFullYear());
    setViewMonth(viewDate.getMonth());
    setViewMode("day");
    setIsOpen(true);
    requestAnimationFrame(() => { updatePlacement(); });
  };

  const handlePickerBlurCapture = () => {
    window.setTimeout(() => {
      if (skipBlurCommitRef.current) {
        skipBlurCommitRef.current = false;
        return;
      }
      const active = document.activeElement;
      const focusWithinPicker =
        wrapperRef.current?.contains(active) ||
        menuRef.current?.contains(active);

      if (focusWithinPicker) {
        return;
      }

      commitDraft();
      setIsOpen(false);
    }, 0);
  };

  const markSkipBlurCommit = () => {
    skipBlurCommitRef.current = true;
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (isOpen) {
        setIsOpen(false);
        return;
      }
      isTypingRef.current = false;
      setLocalError(undefined);
      revertDraftToCommitted();
      event.currentTarget.blur();
    }
  };

  const handleCalendarButtonKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCalendar();
      return;
    }
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
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

  const isTodaySelectable = useMemo(() => {
    const today = parseDateString(formatDateToISO(new Date()));
    if (!today) {return false;}
    return isDateWithinConstraints(
      today,
      minDateValue,
      maxDateValue,
      isDateDisabled,
    );
  }, [minDateValue, maxDateValue, isDateDisabled]);

  const handleClear = () => {
    isTypingRef.current = false;
    setLocalError(undefined);
    setInternalValue(undefined);
    setDraftText("");
    onChange?.("");
    setIsOpen(false);
    setViewMode("day");
  };

  const handleSelectToday = () => {
    const today = new Date();
    const iso = formatDateToISO(today);

    const todayDate = parseDateString(iso);
    if (!todayDate) {return;}

    if (minDateValue && todayDate < minDateValue) {return;}
    if (maxDateValue && todayDate > maxDateValue) {return;}
    if (isDateDisabled?.(todayDate)) {return;}

    isTypingRef.current = false;
    setLocalError(undefined);
    setInternalValue(iso);
    setDraftText(formatDateDisplay(today, effectiveOrder, effectiveSeparator));
    onChange?.(formatOutputValue(today));
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
    setViewMode("day");
  };

  const triggerStateClasses = isDisabled
    ? themeFieldDisabledClass
    : isReadOnly
      ? themeFieldReadonlyClass
      : "";
  const triggerErrorClasses = mergedError ? themeFieldBorderErrorClass : "";

  return (
    <div
      className={cn(baseFieldWrapperClasses, hideLabel && "gap-0!")}
      ref={wrapperRef}
      onBlurCapture={handlePickerBlurCapture}
    >
      <FormFieldLabel
        label={label}
        htmlFor={id ?? name}
        required={required}
        optional={optional}
        error={!!mergedError}
        infoTooltip={infoTooltip}
        hideLabel={hideLabel}
      />
      <div className="relative">
        {/* Hidden field for native form submissions */}
        <input
          type="hidden"
          name={name}
          value={selectedDate ? formatOutputValue(selectedDate) : ""}
          tabIndex={-1}
          aria-hidden="true"
        />

        <div
          ref={triggerRef}
          className={cn(
            isInteractionBlocked ? baseFieldShellClasses : baseFieldClasses,
            "flex items-center gap-0 px-0",
            triggerStateClasses,
            triggerErrorClasses,
            !isInteractionBlocked && className,
          )}
        >
          <input
            ref={inputRef}
            type="text"
            id={id ?? name}
            autoComplete="off"
            inputMode="numeric"
            disabled={isDisabled}
            readOnly={isExplicitReadOnly || undefined}
            placeholder={effectivePlaceholder}
            value={draftText}
            maxLength={usesDmyMask ? 10 : undefined}
            tabIndex={tabIndex}
            onChange={handleDraftChange}
            onFocus={openCalendar}
            onClick={openCalendar}
            onKeyDown={handleDraftKeyDown}
            aria-invalid={!!mergedError}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-describedby={
              mergedError
                ? `${name}-error`
                : helperText
                  ? `${name}-helper`
                  : undefined
            }
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent px-3 shadow-none outline-none focus-visible:ring-0",
              themeFormControlTextClass,
              isInteractionBlocked ? "cursor-not-allowed" : "cursor-text",
            )}
          />
          <div className="mr-2 flex shrink-0 items-center gap-1">
            {showClearIcon && (
              <span
                role="button"
                aria-label="Clear selection"
                tabIndex={-1}
                className={cn(themeControlClearButtonClass, "cursor-pointer")}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  markSkipBlurCommit();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleClear();
                }}
              >
                <AppIcon
                  name="clear"
                  size="controlClear"
                  className={themeControlClearIconClass}
                />
              </span>
            )}
            <button
              type="button"
              aria-label="Open calendar"
              tabIndex={0}
              disabled={isInteractionBlocked}
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60",
                isInteractionBlocked
                  ? cn("cursor-not-allowed", themeFieldDisabledIconClass)
                  : cn(themeControlFieldIconClass, themeControlIconHoverClass),
                mergedError &&
                  !isInteractionBlocked &&
                  "text-red-500 dark:text-red-400",
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                markSkipBlurCommit();
              }}
              onFocus={openCalendar}
              onClick={openCalendar}
              onKeyDown={handleCalendarButtonKeyDown}
            >
              <AppIcon name="calendar" size="controlField" decorative />
            </button>
          </div>
        </div>

        {isOpen &&
          !isInteractionBlocked &&
          typeof document !== "undefined" &&
          document.body &&
          createPortal(
            <div
              ref={menuRef}
              className={cn(
                "fixed w-72 overflow-y-auto overscroll-contain p-3 backdrop-blur-sm animate-popup",
                resolveFormControlPortalLayerClass(),
                themeFormControlMenuClass,
                menuStyle.placement === "top" && "animate-popup-top",
              )}
              style={{
                top: `${menuStyle.top}px`,
                left: `${menuStyle.left}px`,
                width: `${menuStyle.width}px`,
                maxHeight: menuStyle.maxHeight
                  ? `${menuStyle.maxHeight}px`
                  : undefined,
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                markSkipBlurCommit();
              }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  tabIndex={CALENDAR_POPUP_TAB_INDEX}
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
                    tabIndex={CALENDAR_POPUP_TAB_INDEX}
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
                    tabIndex={CALENDAR_POPUP_TAB_INDEX}
                    className={`rounded-lg px-2 py-1 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800 ${
                      viewMode === "year"
                        ? "bg-secondary-100 text-secondary-900 dark:bg-secondary-800"
                        : ""
                    }`}
                    onClick={() => {
                      setViewMode((prev) => {
                        if (prev === "year") {return "day";}
                        const clamped = resolveCalendarViewDate(
                          selectedDate ??
                            new Date(viewYear, viewMonth, 1),
                          minDateValue,
                          maxDateValue,
                        );
                        setViewYear(clamped.getFullYear());
                        setViewMonth(clamped.getMonth());
                        return "year";
                      });
                    }}
                  >
                    {viewYear}
                  </button>
                </div>
                <button
                  type="button"
                  tabIndex={CALENDAR_POPUP_TAB_INDEX}
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
                      const baseDayClasses =
                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors";

                      let colorClasses =
                        "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                      const isBeforeMin =
                        !!minDateValue && day.date < minDateValue;
                      const isAfterMax =
                        !!maxDateValue && day.date > maxDateValue;
                      const isCustomDisabled =
                        !!isDateDisabled && isDateDisabled(day.date);
                      const isDisabled =
                        isBeforeMin || isAfterMax || isCustomDisabled;

                      if (!day.inCurrentMonth) {
                        colorClasses =
                          "text-secondary-300 hover:bg-secondary-50 dark:text-secondary-600 dark:hover:bg-secondary-800/60";
                      }

                      if (day.isSelected) {
                        colorClasses =
                          "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600";
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
                          tabIndex={CALENDAR_POPUP_TAB_INDEX}
                          className={`${baseDayClasses} ${colorClasses}`}
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
                        tabIndex={CALENDAR_POPUP_TAB_INDEX}
                        disabled={isMonthDisabled}
                        className={cn(
                          "rounded-xl px-2 py-1.5 text-center transition-colors",
                          isMonthDisabled
                            ? themePickerDayDisabledClass
                            : isSelected
                              ? "bg-primary-600 text-white"
                              : "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800",
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
                    const currentYear = new Date().getFullYear();
                    const isCurrentYear = year === currentYear;
                    const isYearDisabled = isYearOutsideConstraints(
                      year,
                      minDateValue,
                      maxDateValue,
                    );

                    let classes =
                      "rounded-xl px-2 py-1.5 text-center transition-colors text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                    if (isYearDisabled) {
                      classes = cn(
                        "rounded-xl px-2 py-1.5 text-center transition-colors",
                        themePickerDayDisabledClass,
                      );
                    } else if (isSelected) {
                      classes =
                        "rounded-xl px-2 py-1.5 text-center transition-colors bg-primary-600 text-white";
                    } else if (isCurrentYear) {
                      classes += " border border-primary-500/60";
                    }

                    return (
                      <button
                        key={year}
                        type="button"
                        tabIndex={CALENDAR_POPUP_TAB_INDEX}
                        disabled={isYearDisabled}
                        className={classes}
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

              {(showTodayButton && isTodaySelectable) || resolvedShowClearButton ? (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-xs">
                  {resolvedShowClearButton && (
                    <button
                      type="button"
                      tabIndex={CALENDAR_POPUP_TAB_INDEX}
                      className="rounded-md border border-secondary-300 px-3 py-1 font-medium text-secondary-700 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  )}
                  {showTodayButton && isTodaySelectable && (
                    <button
                      type="button"
                      tabIndex={CALENDAR_POPUP_TAB_INDEX}
                      className="ml-auto rounded-md bg-primary-600 px-3 py-1 font-medium text-white shadow-sm transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                      onClick={handleSelectToday}
                    >
                      Today
                    </button>
                  )}
                </div>
              ) : null}
            </div>,
            document.body,
          )}
      </div>
      <FormFieldFeedback
        helperText={helperText}
        error={mergedError}
        helperId={name ? `${name}-helper` : undefined}
        errorId={name ? `${name}-error` : undefined}
      />
    </div>
  );
};

export interface DatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BasePickerProps {
  control?: Control<TFieldValues>;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
  helperText?: string;
  error?: string;
}

const DatePickerComponent = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  helperText,
  error,
  onChange,
  ...rest
}: DatePickerProps<TFieldValues>) => {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <DatePickerInner
            {...rest}
            name={field.name}
            value={field.value}
            onChange={(val) => {
              field.onChange(val);
              onChange?.(val);
            }}
            helperText={helperText}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <DatePickerInner
      {...rest}
      name={name}
      onChange={onChange}
      helperText={helperText}
      error={error}
    />
  );
};

export const DatePicker = React.memo(
  DatePickerComponent,
) as typeof DatePickerComponent;
