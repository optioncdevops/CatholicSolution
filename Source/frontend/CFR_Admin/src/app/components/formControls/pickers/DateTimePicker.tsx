import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeFieldDisabledClass,
  themeFormControlMenuClass,
  resolveFormControlPortalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { FormFieldLabel } from "../FormFieldLabel";
import type { FormFieldInfoTooltipProp } from "../formControlFieldProps";
import {
  baseFieldClasses,
  baseFieldWrapperClasses,
  formatDateToISO,
  parseDateFormatString,
} from "./BaseDatePicker";
import {
  combineDateAndTime,
  DEFAULT_DATETIME_DISPLAY_FORMAT,
  DEFAULT_DATETIME_OUTPUT_FORMAT,
  formatDateTimeFieldDisplay,
  formatDateTimeOutput,
  splitDateTime,
  toPickerDateString,
} from "./dateTimePicker.utils";
import { DateTimePickerPopover } from "./DateTimePickerPopover";
import { AppIcon } from "@app/components/icons";

type DateTimePickerInnerProps = FormFieldInfoTooltipProp & {
  label: string;
  name?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  outputFormat?: string;
  displayFormat?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  error?: string;
  helperText?: React.ReactNode;
  className?: string;
  showTodayButton?: boolean;
  showClearButton?: boolean;
};

const DateTimePickerInner: React.FC<DateTimePickerInnerProps> = ({
  label,
  name,
  required,
  optional,
  disabled = false,
  placeholder = "Select date and time",
  value,
  onChange,
  outputFormat = DEFAULT_DATETIME_OUTPUT_FORMAT,
  displayFormat = DEFAULT_DATETIME_DISPLAY_FORMAT,
  minDate,
  maxDate,
  error,
  helperText,
  infoTooltip,
  className,
  showTodayButton = true,
  showClearButton = true,
}) => {
  const groupId = useId();
  const fieldName = name ?? `datetime-${groupId}`;
  const errorId = `${fieldName}-error`;
  const helperId = `${fieldName}-helper`;

  const dateDisplayFormat = useMemo(() => {
    const config = parseDateFormatString(displayFormat);
    if (config) {
      return displayFormat.split(/\s+/)[0] ?? displayFormat;
    }
    return displayFormat;
  }, [displayFormat]);

  const initialSplit = splitDateTime(value ?? null);
  const [draftDate, setDraftDate] = useState(initialSplit.date);
  const [draftTime, setDraftTime] = useState(initialSplit.time);
  const hadCompleteValueRef = useRef(Boolean(value?.trim()));
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 520,
    placement: "bottom" as "top" | "bottom",
  });

  useEffect(() => {
    const next = splitDateTime(value ?? null);
    const complete = Boolean(combineDateAndTime(next.date, next.time));

    const applySync = () => {
      if (complete) {
        hadCompleteValueRef.current = true;
        setDraftDate(next.date);
        setDraftTime(next.time);
        return;
      }
      if (!value?.trim() && hadCompleteValueRef.current) {
        hadCompleteValueRef.current = false;
        setDraftDate("");
        setDraftTime("");
      }
    };

    queueMicrotask(applySync);
  }, [value]);

  const emitCombined = useCallback(
    (nextDate: string, nextTime: string) => {
      const combined = combineDateAndTime(nextDate, nextTime);
      if (!combined) {
        onChange?.(null);
        return;
      }
      onChange?.(formatDateTimeOutput(combined, outputFormat));
    },
    [onChange, outputFormat],
  );

  const updatePlacement = useCallback(() => {
    if (!triggerRef.current || typeof window === "undefined") {return;}
    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 420,
          menuWidth: 520,
        }),
      );
    } catch {
      // placement fallback
    }
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !document.body) {return;}

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) {return;}
      const insideWrapper = wrapperRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideWrapper && !insideMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {setIsOpen(false);}
    };

    updatePlacement();
    const timeoutId = window.setTimeout(updatePlacement, 0);
    const rafId = requestAnimationFrame(updatePlacement);

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isOpen, updatePlacement]);

  const displayText = useMemo(() => {
    const formatted = formatDateTimeFieldDisplay(
      draftDate,
      draftTime,
      dateDisplayFormat,
    );
    return formatted || placeholder;
  }, [draftDate, draftTime, dateDisplayFormat, placeholder]);

  const hasDisplayValue = Boolean(
    combineDateAndTime(draftDate, draftTime) ||
    draftDate.trim() ||
    draftTime.trim(),
  );
  const hasCompleteValue = Boolean(combineDateAndTime(draftDate, draftTime));

  const handleClear = () => {
    setDraftDate("");
    setDraftTime("");
    onChange?.(null);
    setIsOpen(false);
  };

  const handleTodayNow = () => {
    const now = new Date();
    const iso = formatDateToISO(now);
    const hh = `${now.getHours()}`.padStart(2, "0");
    const mm = `${now.getMinutes()}`.padStart(2, "0");
    const time = `${hh}:${mm}`;
    setDraftDate(iso);
    setDraftTime(time);
    emitCombined(iso, time);
    setIsOpen(false);
  };

  const handleSelectDate = (iso: string) => {
    setDraftDate(iso);
    setDraftTime((time) => {
      emitCombined(iso, time);
      return time;
    });
  };

  const handleTimeChange = (hhmm: string, isComplete: boolean) => {
    setDraftTime(hhmm);
    setDraftDate((date) => {
      emitCombined(date, hhmm);
      if (isComplete && date) {
        setIsOpen(false);
      }
      return date;
    });
  };

  const errorClasses = error
    ? "!border-danger-400 hover:!border-danger-400 focus-visible:!border-danger-400"
    : "";

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn(baseFieldWrapperClasses, className)} ref={wrapperRef}>
      <FormFieldLabel
        label={label}
        htmlFor={fieldName}
        required={required}
        optional={optional}
        error={!!error}
        infoTooltip={infoTooltip}
      />
      <div className="relative">
        <input type="hidden" name={fieldName} value={value ?? ""} readOnly />
        <button
          ref={triggerRef}
          type="button"
          id={fieldName}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            baseFieldClasses,
            "flex items-center justify-between text-left",
            disabled ? themeFieldDisabledClass : "cursor-pointer",
            errorClasses,
          )}
          onClick={() => !disabled && setIsOpen((open) => !open)}
        >
          <span
            className={cn(
              "truncate",
              hasCompleteValue || (draftDate && draftTime)
                ? "text-foreground"
                : hasDisplayValue
                  ? "text-foreground"
                  : error
                    ? "text-danger-500"
                    : "text-secondary-400",
            )}
          >
            {displayText}
          </span>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {hasDisplayValue && showClearButton && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear date and time"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
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
              name="calendarClock"
              size="controlField"
              className={cn(
                themeControlFieldIconClass,
                error && "text-danger-500 dark:text-danger-400",
              )}
              decorative
            />
          </div>
        </button>

        {isOpen &&
          !disabled &&
          typeof document !== "undefined" &&
          document.body &&
          createPortal(
            <div
              ref={menuRef}
              role="dialog"
              aria-label={`${label} picker`}
              className={cn(
                "fixed overflow-hidden backdrop-blur-sm animate-popup",
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
              <DateTimePickerPopover
                draftDateIso={draftDate}
                draftTimeHhmm={draftTime}
                onSelectDate={handleSelectDate}
                onTimeChange={handleTimeChange}
                onClear={handleClear}
                onTodayNow={handleTodayNow}
                showTodayButton={showTodayButton}
                showClearButton={showClearButton}
                minDate={toPickerDateString(minDate)}
                maxDate={toPickerDateString(maxDate)}
              />
            </div>,
            document.body,
          )}
      </div>
      {helperText && !error ? (
        <p id={helperId} className="mt-1 text-xs text-foreground-muted">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="mt-1 text-xs text-danger-500"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export interface DateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends DateTimePickerInnerProps {
  control?: Control<TFieldValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const DateTimePickerComponent = <
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  name,
  rules,
  helperText,
  error,
  onChange,
  value,
  ...rest
}: DateTimePickerProps<TFieldValues>) => {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <DateTimePickerInner
            {...rest}
            name={field.name}
            value={(field.value as string | null | undefined) ?? null}
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
    <DateTimePickerInner
      {...rest}
      name={name}
      value={value}
      onChange={onChange}
      helperText={helperText}
      error={error}
    />
  );
};

export const DateTimePicker = React.memo(
  DateTimePickerComponent,
) as typeof DateTimePickerComponent;
