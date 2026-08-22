import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@app/utilities/cn";
import {
  themeFieldBaseClass,
  themeFieldBorderErrorClass,
  themeFieldDisabledActionButtonClass,
  themeFieldDisabledClass,
  themeFieldWrapperClass,
  themeFormControlPlaceholderClass,
  themeFormControlTextClass,
  themeControlClearIconClass,
  themeControlFieldIconClass,
  themeHelperClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "../FormFieldLabel";
import {
  COLOR_PICKER_DEFAULT_PLACEHOLDER,
  EMPTY_SWATCH_CLASS,
} from "./colorPicker.constants";
import type { ColorPickerInnerProps } from "./colorPicker.types";
import { AppIcon } from "@app/components/icons";
import {
  hexToStyleBackground,
  normalizeHexColor,
  sanitizeHexDraftInput,
} from "./colorPicker.utils";

export const ColorPickerField: React.FC<ColorPickerInnerProps> = ({
  label,
  name,
  required,
  optional,
  disabled = false,
  placeholder = "#RRGGBB",
  helperText,
  error,
  infoTooltip,
  value,
  onChange,
  clearable = true,
  enableNativePicker = true,
  showNativePicker,
  showHexInput = true,
  className,
  tabIndex,
}) => {
  const groupId = useId();
  const fieldName = name ?? `color-${groupId}`;
  const inputId = `${fieldName}-hex`;
  const errorId = `${fieldName}-error`;
  const helperId = `${fieldName}-helper`;
  const committed = useMemo(() => normalizeHexColor(value), [value]);
  const [draft, setDraft] = useState(committed ?? "");
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const nativePickerEnabled = enableNativePicker || !!showNativePicker;

  useEffect(() => {
    setDraft(committed ?? "");
  }, [committed]);

  const emitChange = useCallback(
    (next: string | null) => {
      onChange?.(next);
    },
    [onChange],
  );

  const commitDraft = useCallback(() => {
    if (!showHexInput) {return;}
    const normalized = normalizeHexColor(draft);
    if (normalized) {
      setDraft(normalized);
      emitChange(normalized);
      return;
    }
    // Revert invalid/empty draft to last committed value.
    setDraft(committed ?? "");
  }, [committed, draft, emitChange, showHexInput]);

  const clearValue = useCallback(() => {
    if (!clearable || disabled) {return;}
    setDraft("");
    emitChange(null);
  }, [clearable, disabled, emitChange]);

  const swatchStyle = committed
    ? { backgroundColor: hexToStyleBackground(committed) }
    : undefined;
  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  const chromeClasses = error ? themeFieldBorderErrorClass : "";

  return (
    <div className={cn(themeFieldWrapperClass, className)}>
      {label ? (
        <FormFieldLabel
          label={label}
          htmlFor={inputId}
          required={required}
          optional={optional}
          error={!!error}
          infoTooltip={infoTooltip}
        />
      ) : null}

      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 px-2.5",
          themeFieldBaseClass,
          chromeClasses,
          disabled && themeFieldDisabledClass,
        )}
        role="group"
        aria-label={label ? undefined : "Color picker"}
      >
        <input
          type="hidden"
          name={fieldName}
          value={committed ?? ""}
          readOnly
        />
        <input
          ref={nativeInputRef}
          type="color"
          className="sr-only"
          tabIndex={-1}
          disabled={disabled || !nativePickerEnabled}
          value={committed ?? "#2563EB"}
          aria-label={
            label ? `${label} native color picker` : "Native color picker"
          }
          onChange={(e) => {
            const normalized = normalizeHexColor(e.target.value);
            if (!normalized) {return;}
            setDraft(normalized);
            emitChange(normalized);
          }}
        />

        <span
          className={cn(
            "h-4 w-4 shrink-0 rounded-full border border-border",
            !committed && EMPTY_SWATCH_CLASS,
          )}
          style={swatchStyle}
          title={committed ?? "No color selected"}
          aria-hidden
        />

        <input
          id={inputId}
          type="text"
          name={`${fieldName}-draft`}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={!showHexInput}
          value={!showHexInput ? (committed ?? "") : draft}
          placeholder={placeholder || COLOR_PICKER_DEFAULT_PLACEHOLDER}
          tabIndex={tabIndex}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            if (!showHexInput) {return;}
            setDraft(sanitizeHexDraftInput(e.target.value));
          }}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent p-0 font-mono uppercase tracking-wide text-foreground focus:outline-none",
            themeFormControlTextClass,
            themeFormControlPlaceholderClass,
            !showHexInput && "font-normal normal-case",
          )}
        />

        {nativePickerEnabled ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => nativeInputRef.current?.click()}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25",
              disabled && themeFieldDisabledActionButtonClass,
            )}
            aria-label="Open color picker"
            title="Open color picker"
          >
            <AppIcon
              name="palette"
              size="controlField"
              className={themeControlFieldIconClass}
              decorative
            />
          </button>
        ) : null}

        {clearable && committed ? (
          <button
            type="button"
            disabled={disabled}
            onClick={clearValue}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25",
              disabled && themeFieldDisabledActionButtonClass,
            )}
            aria-label="Clear color"
            title="Clear color"
          >
            <AppIcon
              name="x"
              size="controlClear"
              className={themeControlClearIconClass}
              decorative
            />
          </button>
        ) : null}
      </div>

      {helperText ? (
        <p id={helperId} className={themeHelperClass}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
