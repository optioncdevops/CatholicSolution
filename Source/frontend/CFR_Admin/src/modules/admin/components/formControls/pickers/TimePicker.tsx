import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFormControlMenuClass,
  resolveFormControlPortalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { FormFieldLabel } from "../FormFieldLabel";
import { AppIcon } from "@app/components/icons";
import { type BasePickerProps, baseFieldClasses } from "./BaseDatePicker";

function formatTimeStringForPicker(
  hour12: number,
  minute: number,
  period: "AM" | "PM",
  format: string,
): string {
  let h24 = hour12 % 12;
  if (period === "PM") {h24 += 12;}

  const HH = `${h24}`.padStart(2, "0");
  const H = `${h24}`;
  const h = hour12 === 12 ? 12 : hour12;
  const hh = `${h}`.padStart(2, "0");
  const mm = `${minute}`.padStart(2, "0");
  const m = `${minute}`;
  const A = period;
  const a = period.toLowerCase();

  let out = format || "hh:mm a";
  out = out
    .split("HH")
    .join(HH)
    .split("hh")
    .join(hh)
    .split("mm")
    .join(mm)
    .split("H")
    .join(H)
    .split("h")
    .join(`${h}`)
    .split("m")
    .join(m)
    .split("A")
    .join(A)
    .split("a")
    .join(a);

  return out;
}

type TimePart = "hour" | "minute" | "period";

function parseTimeFormatOrder(format?: string): TimePart[] {
  if (!format) {return ["hour", "minute", "period"];}

  const tokenRegex = /(H{1,2}|h{1,2}|m{1,2}|a|A)/g;
  const tokens = format.match(tokenRegex);
  if (!tokens) {return ["hour", "minute", "period"];}

  const order: TimePart[] = [];

  tokens.forEach((token) => {
    if (/^h/i.test(token) || token.startsWith("H")) {
      if (!order.includes("hour")) {order.push("hour");}
    } else if (/^m/i.test(token)) {
      if (!order.includes("minute")) {order.push("minute");}
    } else if (/^a/i.test(token)) {
      if (!order.includes("period")) {order.push("period");}
    }
  });

  // Ensure sensible defaults if something was missing
  if (!order.includes("hour")) {order.unshift("hour");}
  if (!order.includes("minute")) {order.push("minute");}
  if (!order.includes("period") && /a|A/.test(format)) {
    order.push("period");
  }

  return order;
}

/** Parses a canonical 'HH:mm' (or 'hh:mm a') string into hour/minute/period parts. */
function parseTimeParts(raw: string): {
  hour12: number | null;
  minute: number | null;
  period: "AM" | "PM" | null;
} {
  const trimmed = raw.trim();
  const ampmMatch = /(am|pm)$/i.exec(trimmed);
  if (ampmMatch) {
    const p = ampmMatch[1].toUpperCase() as "AM" | "PM";
    const timePart = trimmed.replace(/(am|pm)$/i, "").trim();
    const [hStr, mStr] = timePart.split(":");
    const hNum = Number(hStr);
    const mNum = Number(mStr ?? "0");
    if (!Number.isNaN(hNum) && !Number.isNaN(mNum)) {
      let h12 = hNum;
      if (h12 === 12) {h12 = 0;} // 12 AM should be 0 hour
      return { hour12: h12, minute: mNum, period: p };
    }
  }

  const [h24, m] = trimmed.split(":").map(Number);
  if (!Number.isNaN(h24) && !Number.isNaN(m)) {
    const p: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) {h12 = 12;} // Handle 00 as 12
    return { hour12: h12, minute: m, period: p };
  }

  return { hour12: null, minute: null, period: null };
}

function getNextMissingPart(
  hour12: number | null,
  minute: number | null,
  period: "AM" | "PM" | null,
  order: TimePart[],
): TimePart | null {
  for (const part of order) {
    if (part === "hour" && hour12 === null) {return "hour";}
    if (part === "minute" && minute === null) {return "minute";}
    if (part === "period" && !period) {return "period";}
  }
  return null;
}

type TimePickerInnerProps = BasePickerProps & {
  helperText?: string;
  error?: string;
  /** Show a clear icon in the input field to reset the selection. */
  clearable?: boolean;
};

const TimePickerInner: React.FC<TimePickerInnerProps> = ({
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
  showTodayButton,
  showClearButton,
  hideLabel = false,
  helperText,
  error,
  infoTooltip,
  clearable = true,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ?? defaultValue,
  );
  const initialTimeParts = internalValue ? parseTimeParts(internalValue) : null;
  const [hour12, setHour12] = useState<number | null>(initialTimeParts?.hour12 ?? null);
  const [minute, setMinute] = useState<number | null>(initialTimeParts?.minute ?? null);
  const [period, setPeriod] = useState<"AM" | "PM" | null>(initialTimeParts?.period ?? null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
  }>({ top: 0, left: 0, width: 0, placement: "bottom" });

  // Sync the controlled `value` prop (and the hour/minute/period parts derived from it) into
  // internal state during render rather than in an effect — an effect body would paint the
  // previous values for one frame before resetting, which is visible on programmatic value
  // changes. User-driven selection (handleSelectHour/Minute/Period, handleNow, handleClear)
  // sets hour12/minute/period directly and does not depend on this sync.
  const [renderedForValue, setRenderedForValue] = useState(value);
  if (value !== undefined && renderedForValue !== value) {
    setRenderedForValue(value);
    setInternalValue(value);
    const parts = value ? parseTimeParts(value) : { hour12: null, minute: null, period: null };
    setHour12(parts.hour12);
    setMinute(parts.minute);
    setPeriod(parts.period);
  }

  const updatePlacement = () => {
    if (!triggerRef.current || typeof window === "undefined" || !document.body)
      {return;}

    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 400,
          menuWidth: 320,
        }),
      );
    } catch (error) {
      console.warn("TimePicker: Error calculating position", error);
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
        console.warn("TimePicker: Error handling click outside", error);
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

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const periods: ("AM" | "PM")[] = ["AM", "PM"];

  const displayTimeFormat = displayFormat ?? format ?? "hh:mm a";
  const effectiveOutputTimeFormat = outputFormat ?? "HH:mm";
  const timeOrder = useMemo(
    () => parseTimeFormatOrder(displayTimeFormat),
    [displayTimeFormat],
  );
  const [activePart, setActivePart] = useState<TimePart>(
    () =>
      getNextMissingPart(null, null, null, timeOrder) ?? timeOrder[0] ?? "hour",
  );

  // When the popover opens or values change, move the "next" step highlight. Adjusted
  // during render (guarded by a sentinel) rather than in an effect, so the previous
  // highlight never paints for one frame before the update.
  const activePartSyncKey = `${isOpen}|${hour12}|${minute}|${period}|${timeOrder.join(",")}`;
  const [renderedForActivePart, setRenderedForActivePart] = useState(activePartSyncKey);
  if (isOpen && renderedForActivePart !== activePartSyncKey) {
    setRenderedForActivePart(activePartSyncKey);
    const next = getNextMissingPart(hour12, minute, period, timeOrder);
    if (next) {
      setActivePart(next);
    }
  } else if (renderedForActivePart !== activePartSyncKey) {
    setRenderedForActivePart(activePartSyncKey);
  }

  const commitTime = (
    h12: number | null,
    m: number | null,
    p: "AM" | "PM" | null,
  ) => {
    if (h12 === null || m === null || !p) {return;}
    let h24 = h12 % 12;
    if (p === "PM") {h24 += 12;}
    const canonical = `${`${h24}`.padStart(2, "0")}:${`${m}`.padStart(2, "0")}`;
    setInternalValue(canonical);
    const formatted = formatTimeStringForPicker(
      h12,
      m,
      p,
      effectiveOutputTimeFormat,
    );
    onChange?.(formatted);
  };

  const handleSelectHour = (h: number) => {
    setHour12(h);
    commitTime(h, minute, period);
    const next = getNextMissingPart(h, minute, period, timeOrder);
    if (next) {
      setActivePart(next);
    }
  };

  const handleSelectMinute = (m: number) => {
    setMinute(m);
    commitTime(hour12, m, period);
    const next = getNextMissingPart(hour12, m, period, timeOrder);
    if (next) {
      setActivePart(next);
    }
  };

  const handleSelectPeriod = (p: "AM" | "PM") => {
    setPeriod(p);
    commitTime(hour12, minute, p);
    const next = getNextMissingPart(hour12, minute, p, timeOrder);
    if (next) {
      setActivePart(next);
    }
  };

  const displayText = useMemo(() => {
    if (hour12 === null || minute === null || !period)
      {return placeholder || "Select time";}
    return formatTimeStringForPicker(hour12, minute, period, displayTimeFormat);
  }, [hour12, minute, period, placeholder, displayTimeFormat]);

  const handleClear = () => {
    setInternalValue(undefined);
    setHour12(null);
    setMinute(null);
    setPeriod(null);
    onChange?.("");
    setIsOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    const h24 = now.getHours();
    const m = now.getMinutes();
    const p: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    let h12Val = h24 % 12;
    if (h12Val === 0) {h12Val = 12;}

    const canonical = `${`${h24}`.padStart(2, "0")}:${`${m}`.padStart(2, "0")}`;
    setInternalValue(canonical);
    setHour12(h12Val);
    setMinute(m);
    setPeriod(p);

    const formatted = formatTimeStringForPicker(
      h12Val,
      m,
      p,
      effectiveOutputTimeFormat,
    );
    onChange?.(formatted);
    setIsOpen(false);
  };

  const errorClasses = error
    ? "!border-danger-400 hover:!border-danger-400 focus-visible:!border-danger-400 dark:!border-danger-400"
    : "";

  const hasValue = hour12 !== null && minute !== null && !!period;

  return (
    <div
      className={cn("flex flex-col gap-1", hideLabel && "gap-0!")}
      ref={wrapperRef}
    >
      <FormFieldLabel
        label={label}
        htmlFor={name}
        required={required}
        optional={optional}
        error={!!error}
        infoTooltip={infoTooltip}
        hideLabel={hideLabel}
      />
      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={
            hour12 !== null && minute !== null && period
              ? formatTimeStringForPicker(
                  hour12,
                  minute,
                  period,
                  effectiveOutputTimeFormat,
                )
              : ""
          }
          {...rest}
        />

        <button
          ref={triggerRef}
          type="button"
          id={name}
          disabled={disabled}
          className={`${baseFieldClasses} flex items-center justify-between text-left ${
            disabled ? themeFieldDisabledClass : "cursor-pointer"
          } ${errorClasses} ${className || ""}`}
          onClick={() => !disabled && setIsOpen((o) => !o)}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
        >
          <span
            className={
              hasValue ? "" : error ? "text-danger-500" : "text-secondary-400"
            }
          >
            {displayText}
          </span>
          <div className="ml-2 flex items-center gap-1">
            {hasValue && clearable && !disabled && (
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
              name="clock"
              size="controlField"
              className={cn(
                themeControlFieldIconClass,
                error && "text-red-500 dark:text-red-400",
                disabled && themeFieldDisabledIconClass,
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
              className={cn(
                "fixed w-80 p-3 backdrop-blur-sm animate-popup",
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
              <div className="mb-2 flex items-center justify-between px-1 text-[13px] font-medium text-secondary-900 dark:text-secondary-50">
                <span>Pick time</span>
                <span className="text-xs text-secondary-400">
                  {hour12 !== null && minute !== null && period
                    ? displayText
                    : "HH:MM"}
                </span>
              </div>
              <div className="flex gap-3">
                <div
                  className={`flex-1 rounded-xl p-2 text-xs text-secondary-500 dark:text-secondary-400 ${
                    activePart === "hour"
                      ? "bg-primary-50 border border-primary-100 dark:bg-secondary-900/80 dark:border-primary-900/40"
                      : "bg-secondary-50 dark:bg-secondary-900/60"
                  }`}
                >
                  <div
                    className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide ${
                      activePart === "hour"
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-secondary-400"
                    }`}
                  >
                    Hour
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {hours.map((h) => {
                      const isSelected = h === hour12;
                      return (
                        <button
                          key={h}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[13px] transition-colors ${
                            isSelected
                              ? "bg-primary-600 text-white"
                              : "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800"
                          }`}
                          onClick={() => { handleSelectHour(h); }}
                        >
                          <span>{`${h}`.padStart(2, "0")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-xl p-2 text-xs text-secondary-500 dark:text-secondary-400 ${
                    activePart === "minute"
                      ? "bg-primary-50 border border-primary-100 dark:bg-secondary-900/80 dark:border-primary-900/40"
                      : "bg-secondary-50 dark:bg-secondary-900/60"
                  }`}
                >
                  <div
                    className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide ${
                      activePart === "minute"
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-secondary-400"
                    }`}
                  >
                    Minutes
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {minutes.map((m) => {
                      const isSelected = m === minute;
                      return (
                        <button
                          key={m}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[13px] transition-colors ${
                            isSelected
                              ? "bg-primary-600 text-white"
                              : "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800"
                          }`}
                          onClick={() => { handleSelectMinute(m); }}
                        >
                          <span>{`${m}`.padStart(2, "0")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div
                  className={`w-16 rounded-xl p-2 text-xs text-secondary-500 dark:text-secondary-400 ${
                    activePart === "period"
                      ? "bg-primary-50 border border-primary-100 dark:bg-secondary-900/80 dark:border-primary-900/40"
                      : "bg-secondary-50 dark:bg-secondary-900/60"
                  }`}
                >
                  <div
                    className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide ${
                      activePart === "period"
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-secondary-400"
                    }`}
                  >
                    Period
                  </div>
                  <div className="space-y-1">
                    {periods.map((p) => {
                      const isSelected = p === period;
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[13px] transition-colors ${
                            isSelected
                              ? "bg-primary-600 text-white"
                              : "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800"
                          }`}
                          onClick={() => { handleSelectPeriod(p); }}
                        >
                          <span>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(showClearButton || showTodayButton) && (
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  {showClearButton && (
                    <button
                      type="button"
                      className="rounded-lg px-2 py-1 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  )}
                  {showTodayButton && (
                    <button
                      type="button"
                      className="ml-auto rounded-lg bg-primary-600 px-3 py-1 font-medium text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                      onClick={handleNow}
                    >
                      Now
                    </button>
                  )}
                </div>
              )}
            </div>,
            document.body,
          )}
      </div>
      {helperText && !error && (
        <p
          id={`${name}-helper`}
          className="mt-1 text-xs text-secondary-500 dark:text-secondary-400"
        >
          {helperText}
        </p>
      )}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-xs text-danger-500"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export interface TimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BasePickerProps {
  control?: Control<TFieldValues>;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
  helperText?: string;
  error?: string;
}

const TimePickerComponent = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  helperText,
  error,
  onChange,
  ...rest
}: TimePickerProps<TFieldValues>) => {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <TimePickerInner
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
    <TimePickerInner
      {...rest}
      name={name}
      onChange={onChange}
      helperText={helperText}
      error={error}
    />
  );
};

export const TimePicker = React.memo(
  TimePickerComponent,
) as typeof TimePickerComponent;
