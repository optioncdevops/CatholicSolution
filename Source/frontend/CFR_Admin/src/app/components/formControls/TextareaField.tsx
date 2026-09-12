import React, { useCallback, useId, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  sanitizeInputValue,
  type InputValidationRule,
  type SanitizeInputOptions,
} from "@app/utilities/inputValidation";
import {
  themeFieldBorderErrorClass,
  themeFieldBorderNormalClass,
  themeFieldDisabledClass,
  themeFieldReadonlyClass,
  themeFieldTextareaBaseClass,
  themeFieldTextareaShellClass,
  themeFieldWrapperClass,
} from "@designSystem/theme/styles/componentStyle";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import { FormFieldFeedback } from "./FormFieldFeedback";
import { FormFieldLabel } from "./FormFieldLabel";
import type { FormFieldInfoTooltipProp } from "./formControlFieldProps";

interface BaseTextareaFieldProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FormFieldInfoTooltipProp {
  label: string;
  helperText?: string;
  error?: string;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  /** Show character count when `maxLength` is set. Default true. */
  showCharCount?: boolean;
  /** Sanitization on change (letters, alphanumeric, limited special, etc.). See inputValidation.ts. */
  validationRule?: InputValidationRule;
  validationOptions?: SanitizeInputOptions;
  /** Tighter layout for table cells — compact padding and error text. */
  compact?: boolean;
  /** Change handler for controlled usage outside react-hook-form. */
  onValueChange?: (value: string) => void;
  /** Compact table cells: expand to this row count on focus. */
  expandRowsOnFocus?: number;
  /** Compact table cells: show full value in a tooltip when content overflows. */
  showValueTooltip?: boolean;
  wrapperClassName?: string;
  feedbackClassName?: string;
}

export interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseTextareaFieldProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

// ── Character count indicator ───────────────────────────────────────

type CountStatus = "normal" | "warning" | "danger";

const countStatusClasses: Record<CountStatus, string> = {
  normal: "text-foreground-muted/70 dark:text-foreground-muted/60",
  warning: "text-warning-600 dark:text-warning-400",
  danger: "text-danger-600 font-semibold dark:text-danger-400",
};

function CharacterCount({
  length,
  maxLength,
}: {
  length: number;
  maxLength: number;
}) {
  const ratio = maxLength > 0 ? length / maxLength : 0;
  const status: CountStatus =
    ratio >= 0.95 ? "danger" : ratio >= 0.8 ? "warning" : "normal";
  const remaining = maxLength - length;

  return (
    <span
      className={cn(
        "shrink-0 text-[11px] tabular-nums tracking-wide transition-colors duration-200",
        "select-none",
        countStatusClasses[status],
      )}
      aria-live={status !== "normal" ? "polite" : "off"}
      aria-label={`${remaining} characters remaining`}
    >
      <span>{length}</span>
      <span className="opacity-40">/</span>
      <span>{maxLength}</span>
    </span>
  );
}

// ── Component ───────────────────────────────────────────────────────

const TextareaFieldInner = <TFieldValues extends FieldValues = FieldValues>({
  label,
  placeholder,
  required,
  optional,
  className,
  helperText,
  infoTooltip,
  error,
  hideLabel = false,
  showCharCount = true,
  compact = false,
  onValueChange,
  expandRowsOnFocus,
  showValueTooltip = false,
  wrapperClassName,
  feedbackClassName,
  control,
  name,
  rules,
  maxLength,
  validationRule,
  validationOptions,
  rows = 4,
  value,
  onChange,
  disabled,
  readOnly,
  id,
  ...props
}: TextareaFieldProps<TFieldValues>) => {
  const reactId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const fieldId = id ?? name ?? `textarea-${reactId.replace(/:/g, "")}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const sanitizeOptions = useMemo<SanitizeInputOptions>(
    () => ({
      ...validationOptions,
      ...(maxLength != null ? { maxLength: Number(maxLength) } : {}),
    }),
    [validationOptions, maxLength],
  );

  const applySanitization = useCallback(
    (raw: string): string => {
      if (!validationRule) {return raw;}
      return sanitizeInputValue(raw, validationRule, sanitizeOptions);
    },
    [validationRule, sanitizeOptions],
  );

  const handleValueChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    fieldOnChange?: React.ChangeEventHandler<HTMLTextAreaElement>,
    externalOnChange?: React.ChangeEventHandler<HTMLTextAreaElement>,
  ) => {
    const raw = e.target.value;
    const next = validationRule ? applySanitization(raw) : raw;
    const nextEvent = {
      ...e,
      target: { ...e.target, value: next },
      currentTarget: { ...e.currentTarget, value: next },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    fieldOnChange?.(nextEvent);
    externalOnChange?.(nextEvent);
    onValueChange?.(next);
  };

  const renderField = (
    fieldError?: string,
    fieldProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    currentLength?: number,
  ) => {
    const mergedError = fieldError ?? error;
    const isDisabled = Boolean(disabled || fieldProps?.disabled);
    const isReadOnly = Boolean(readOnly || fieldProps?.readOnly);
    const borderAndRingClasses = isDisabled
      ? themeFieldDisabledClass
      : isReadOnly
        ? themeFieldReadonlyClass
        : mergedError
          ? themeFieldBorderErrorClass
          : themeFieldBorderNormalClass;
    const shellClasses =
      isDisabled || isReadOnly
        ? themeFieldTextareaShellClass
        : themeFieldTextareaBaseClass;

    const displayValue =
      fieldProps?.value !== undefined && fieldProps?.value !== null
        ? String(fieldProps.value)
        : value !== undefined && value !== null
          ? String(value)
          : "";

    const length = currentLength ?? displayValue.length;

    const effectiveRows =
      compact && expandRowsOnFocus != null
        ? isFocused
          ? expandRowsOnFocus
          : rows
        : rows;

    const textareaElement = (
      <textarea
        id={fieldId}
        className={cn(
          shellClasses,
          borderAndRingClasses,
          compact ? "resize-none px-2 py-1" : "resize-y",
          className,
        )}
        placeholder={placeholder}
        rows={effectiveRows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        value={displayValue}
        aria-invalid={!!mergedError}
        aria-describedby={
          mergedError ? errorId : helperText ? helperId : undefined
        }
        {...props}
        {...fieldProps}
        onFocus={(e) => {
          if (compact && expandRowsOnFocus != null) {setIsFocused(true);}
          fieldProps?.onFocus?.(e);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (compact && expandRowsOnFocus != null) {setIsFocused(false);}
          if (e.target.value && typeof e.target.value === "string") {
            const trimmed = e.target.value.trim();
            if (trimmed !== e.target.value) {
              const nextEvent = {
                ...e,
                target: { ...e.target, value: trimmed },
                currentTarget: { ...e.currentTarget, value: trimmed },
              } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
              fieldProps?.onChange?.(nextEvent);
              onChange?.(nextEvent);
              e.target.value = trimmed;
            }
          }
          fieldProps?.onBlur?.(e);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          handleValueChange(e, fieldProps?.onChange, onChange);
        }}
      />
    );

    const wrappedTextarea =
      showValueTooltip && displayValue.trim() ? (
        <Tooltip
          content={displayValue}
          side="top"
          className="max-w-xs whitespace-normal wrap-break-word font-normal"
        >
          <span className="block w-full">{textareaElement}</span>
        </Tooltip>
      ) : (
        textareaElement
      );

    return (
      <div
        className={cn(
          themeFieldWrapperClass,
          hideLabel && "gap-0!",
          wrapperClassName,
        )}
      >
        {!hideLabel ? (
          <div
            className={cn(
              showCharCount &&
                typeof maxLength === "number" &&
                "flex items-start justify-between gap-3",
            )}
          >
            <FormFieldLabel
              label={label}
              htmlFor={fieldId}
              required={required}
              optional={optional}
              error={!!mergedError}
              infoTooltip={infoTooltip}
            />
            {showCharCount && typeof maxLength === "number" && (
              <CharacterCount length={length} maxLength={maxLength} />
            )}
          </div>
        ) : (
          <>
            {showCharCount && typeof maxLength === "number" && (
              <div className="flex justify-end">
                <CharacterCount length={length} maxLength={maxLength} />
              </div>
            )}
            <FormFieldLabel label={label} htmlFor={fieldId} hideLabel />
          </>
        )}
        {wrappedTextarea}
        <FormFieldFeedback
          helperText={helperText}
          error={mergedError}
          helperId={helperId}
          errorId={errorId}
          className={cn(
            compact && "text-[10px] leading-tight",
            feedbackClassName,
          )}
        />
      </div>
    );
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) =>
          renderField(
            fieldState.error?.message,
            {
              ...field,
              value: field.value ?? "",
            },
            (field.value as string | undefined)?.length,
          )
        }
      />
    );
  }

  return renderField(
    undefined,
    undefined,
    value != null ? String(value).length : 0,
  );
};

export const TextareaField = React.memo(
  TextareaFieldInner,
) as typeof TextareaFieldInner;
