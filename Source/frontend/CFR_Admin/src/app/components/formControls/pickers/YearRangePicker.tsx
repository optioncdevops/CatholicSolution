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
import { baseFieldClasses, baseLabelClasses } from "./BaseDatePicker";

interface YearRangePickerProps {
  fromLabel: string;
  toLabel: string;
  requiredFrom?: boolean;
  requiredTo?: boolean;
  fromProps?: {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
  };
  toProps?: {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
  };
  /** Show a clear icon in the input field to reset the selection. */
  clearable?: boolean;
}

export const YearRangePicker: React.FC<YearRangePickerProps> = ({
  fromLabel,
  toLabel,
  requiredFrom,
  requiredTo,
  fromProps,
  toProps,
  clearable = true,
}) => {
  const label = `${fromLabel} - ${toLabel}`;
  const [isOpen, setIsOpen] = useState(false);

  const [startYear, setStartYear] = useState<number | null>(
    fromProps?.value
      ? Number(fromProps.value)
      : fromProps?.defaultValue
        ? Number(fromProps.defaultValue)
        : null,
  );
  const [endYear, setEndYear] = useState<number | null>(
    toProps?.value
      ? Number(toProps.value)
      : toProps?.defaultValue
        ? Number(toProps.defaultValue)
        : null,
  );

  // Sync controlled from/to values into internal state during render rather than in an
  // effect — an effect body would paint the previous year for one frame before resetting.
  const [renderedForFromValue, setRenderedForFromValue] = useState(fromProps?.value);
  if (fromProps?.value !== undefined && renderedForFromValue !== fromProps.value) {
    setRenderedForFromValue(fromProps.value);
    setStartYear(fromProps.value ? Number(fromProps.value) : null);
  }

  const [renderedForToValue, setRenderedForToValue] = useState(toProps?.value);
  if (toProps?.value !== undefined && renderedForToValue !== toProps.value) {
    setRenderedForToValue(toProps.value);
    setEndYear(toProps.value ? Number(toProps.value) : null);
  }

  const today = new Date();
  const initialForView = startYear ?? endYear ?? today.getFullYear();
  const [viewYear, setViewYear] = useState(initialForView);
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
          estimatedMenuHeight: 300,
          menuWidth: 288,
        }),
      );
    } catch (error) {
      console.warn("YearRangePicker: Error calculating position", error);
    }
  };

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
        console.warn("YearRangePicker: Error handling click outside", error);
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

  const goPrev = () => {
    setViewYear((y) => y - 16);
  };

  const goNext = () => {
    setViewYear((y) => y + 16);
  };

  const commitRange = (clickedYear: number) => {
    if (startYear === null || (startYear !== null && endYear !== null)) {
      setStartYear(clickedYear);
      setEndYear(null);
      return;
    }

    let s = startYear;
    let e = clickedYear;

    if (e < s) {
      [s, e] = [e, s];
    }

    setStartYear(s);
    setEndYear(e);
    setIsOpen(false);
  };

  const displayText = useMemo(() => {
    if (startYear !== null && endYear !== null) {
      return `${startYear} – ${endYear}`;
    }
    if (startYear !== null) {
      return `${startYear} – …`;
    }
    return "Select year range";
  }, [startYear, endYear]);

  const isInRange = (year: number) => {
    if (startYear === null || endYear === null) {return false;}
    return year > startYear && year < endYear;
  };

  const isStart = (year: number) => startYear !== null && year === startYear;
  const isEnd = (year: number) => endYear !== null && year === endYear;

  const handleClear = () => {
    setStartYear(null);
    setEndYear(null);
    fromProps?.onChange?.("");
    toProps?.onChange?.("");
  };

  const hasValue = startYear !== null || endYear !== null;

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
        <input type="hidden" name={fromProps?.name} value={startYear ?? ""} />
        <input type="hidden" name={toProps?.name} value={endYear ?? ""} />

        <button
          ref={triggerRef}
          type="button"
          className={`${baseFieldClasses} flex items-center justify-between text-left cursor-pointer`}
          onClick={() => { setIsOpen((o) => !o); }}
        >
          <span
            className={
              startYear !== null || endYear !== null ? "" : "text-secondary-400"
            }
          >
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
                <div className="text-[13px] font-medium text-secondary-900 dark:text-secondary-50">
                  Year range
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

              <div className="grid grid-cols-4 gap-2 pt-1 text-[13px]">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const year = viewYear - 7 + idx;
                  const inRange = isInRange(year);
                  const start = isStart(year);
                  const end = isEnd(year);
                  const currentYear = today.getFullYear();
                  const isCurrentYear = year === currentYear;

                  let classes =
                    "rounded-xl px-2 py-1.5 text-center transition-colors text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                  if (inRange) {
                    classes =
                      "rounded-xl px-2 py-1.5 text-center transition-colors bg-primary-600/10 text-secondary-900 dark:text-secondary-100 hover:bg-primary-600/20";
                  }

                  if (start || end) {
                    classes =
                      "rounded-xl px-2 py-1.5 text-center transition-colors bg-primary-600 text-white hover:bg-primary-700";
                  } else if (isCurrentYear && !inRange) {
                    classes += " border border-primary-500/60";
                  }

                  return (
                    <button
                      key={year}
                      type="button"
                      className={classes}
                      onClick={() => { commitRange(year); }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};
