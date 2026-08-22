import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import {
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeControlIconClass,
  themeFieldDisabledClass,
  themeFormControlMenuClass,
  resolveFormControlPortalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { AppIcon } from "@app/components/icons";
import {
  baseFieldClasses,
  baseLabelClasses,
  formatMonthDisplay,
  formatMonthValue,
  monthLabels,
  parseMonthString,
  type BasePickerProps,
  themeOptionalLabelSuffixClass,
} from "./BaseDatePicker";

interface MonthPickerProps extends Omit<
  BasePickerProps,
  "onChange" | "value" | "defaultValue"
> {
  value?: string; // YYYY-MM
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Show a clear icon in the input field to reset the selection. */
  clearable?: boolean;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
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
  clearable = true,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ?? defaultValue,
  );
  // Sync the controlled `value` prop into internal state during render rather than in an
  // effect — an effect body would paint the stale value for one frame before resetting.
  const [renderedForValue, setRenderedForValue] = useState(value);
  if (value !== undefined && renderedForValue !== value) {
    setRenderedForValue(value);
    setInternalValue(value);
  }

  const parsed = useMemo(
    () => parseMonthString(internalValue),
    [internalValue],
  );
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());

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
      console.warn("MonthPicker: Error calculating position", error);
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
        console.warn("MonthPicker: Error handling click outside", error);
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

  const displayText =
    parsed &&
    typeof parsed.year === "number" &&
    typeof parsed.month === "number"
      ? formatMonthDisplay(parsed.year, parsed.month)
      : placeholder || "Select month";

  const handleSelectMonth = (monthIndex: number) => {
    const valueStr = formatMonthValue(viewYear, monthIndex);
    setInternalValue(valueStr);
    onChange?.(valueStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInternalValue(undefined);
    onChange?.("");
  };

  const hasValue = !!parsed;

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      <label className={baseLabelClasses}>
        {label} {required && <span className="text-danger-500">*</span>}
        {optional && !required && (
          <span className={themeOptionalLabelSuffixClass}> (optional)</span>
        )}
      </label>
      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={internalValue ?? ""}
          {...rest}
        />

        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={`${baseFieldClasses} flex items-center justify-between text-left ${
            disabled ? themeFieldDisabledClass : "cursor-pointer"
          } ${className || ""}`}
          onClick={() => !disabled && setIsOpen((o) => !o)}
        >
          <span className={parsed ? "" : "text-secondary-400"}>
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
              name="calendar"
              size="controlField"
              className={themeControlFieldIconClass}
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
                  onClick={() => { setViewYear((y) => y - 1); }}
                >
                  <AppIcon
                    name="chevronLeft"
                    size="controlField"
                    className={themeControlIconClass}
                    decorative
                  />
                </button>
                <div className="text-[13px] font-medium text-secondary-900 dark:text-secondary-50">
                  {viewYear}
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 dark:hover:bg-secondary-800"
                  onClick={() => { setViewYear((y) => y + 1); }}
                >
                  <AppIcon
                    name="chevronRight"
                    size="controlField"
                    className={themeControlIconClass}
                    decorative
                  />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[13px]">
                {monthLabels.map((labelText, index) => {
                  const isSelected =
                    parsed?.year === viewYear &&
                    parsed.month === index;
                  const isCurrent =
                    today.getFullYear() === viewYear &&
                    today.getMonth() === index;

                  let classes =
                    "rounded-xl px-2 py-1.5 text-center transition-colors text-secondary-700 hover:bg-secondary-100 dark:text-secondary-100 dark:hover:bg-secondary-800";

                  if (isSelected) {
                    classes =
                      "rounded-xl px-2 py-1.5 text-center transition-colors bg-primary-600 text-white";
                  } else if (isCurrent) {
                    classes += " border border-primary-600/60";
                  }

                  return (
                    <button
                      key={labelText}
                      type="button"
                      className={classes}
                      onClick={() => { handleSelectMonth(index); }}
                    >
                      {labelText}
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
