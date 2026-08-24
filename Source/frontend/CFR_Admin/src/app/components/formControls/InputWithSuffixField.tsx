import React, { useId, useMemo } from "react";
import type { HTMLInputTypeAttribute } from "react";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import { themeFieldWrapperClass } from "@designSystem/theme/styles/componentStyle";
import {
  sanitizeInputValue,
  type InputValidationRule,
  type SanitizeInputOptions,
} from "@app/utilities/inputValidation";
import type {
  FormFieldInfoTooltipProp,
  FormFieldOptionalLabelProp,
} from "./formControlFieldProps";
import { FormFieldFeedback } from "./FormFieldFeedback";
import { FormFieldLabel } from "./FormFieldLabel";
import { InputField } from "./InputField";

const inputSuffixClass =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 px-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300";

const inputSuffixErrorClass = "border-danger-400 dark:border-danger-500/70";

interface BaseInputWithSuffixFieldProps
  extends FormFieldInfoTooltipProp, FormFieldOptionalLabelProp {
  label: string;
  optional?: boolean;
  /** Trailing suffix label (e.g. UOM, unit, currency). */
  suffixLabel?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  /** Controlled value (when not using react-hook-form). */
  value?: string | number | null;
  /** Error message — highlights input and suffix borders. */
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hideLabel?: boolean;
  required?: boolean;
  helperText?: string;
  helperTextClassName?: string;
  feedbackClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  maxLength?: number;
  validationRule?: InputValidationRule;
  validationOptions?: SanitizeInputOptions;
  className?: string;
  inputClassName?: string;
  suffixClassName?: string;
  /** Tighter layout for table cells — shorter default placeholder and compact error text. */
  compact?: boolean;
  /** Change handler for controlled usage outside react-hook-form. */
  onValueChange?: (value: string) => void;
  /** Blur handler for input field. */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export interface InputWithSuffixFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseInputWithSuffixFieldProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const InputWithSuffixFieldInner = <
  TFieldValues extends FieldValues = FieldValues,
>({
  label,
  name,
  suffixLabel = "",
  placeholder,
  type = "text",
  value,
  error,
  disabled = false,
  readOnly = false,
  hideLabel = false,
  required,
  optional,
  showOptionalLabel,
  helperText,
  helperTextClassName,
  feedbackClassName,
  wrapperClassName,
  labelClassName,
  infoTooltip,
  maxLength,
  validationRule,
  validationOptions,
  className,
  inputClassName,
  suffixClassName,
  compact = false,
  onValueChange,
  onBlur,
  control,
  rules,
}: InputWithSuffixFieldProps<TFieldValues>) => {
  const reactId = useId();
  const fieldId = name ?? `input-suffix-${reactId.replace(/:/g, "")}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const resolvedPlaceholder = placeholder ?? (compact ? "Qty" : "Enter value");

  const sanitizeOptions = useMemo<SanitizeInputOptions>(
    () => ({
      maxLength,
      ...validationOptions,
    }),
    [maxLength, validationOptions],
  );

  const applySanitization = (raw: string) =>
    validationRule
      ? sanitizeInputValue(raw, validationRule, sanitizeOptions)
      : raw;

  const renderField = (
    fieldError?: string,
    fieldValue?: string,
    fieldOnChange?: (value: string) => void,
    fieldOnBlur?: React.FocusEventHandler<HTMLInputElement>,
  ) => {
    const mergedError = fieldError ?? error;
    const displayValue =
      fieldValue ??
      (value !== undefined && value !== null ? String(value) : "");
    const showSuffix = Boolean(suffixLabel);

    const emitChange = (next: string) => {
      fieldOnChange?.(next);
      onValueChange?.(next);
    };

    return (
      <div
        className={cn(
          themeFieldWrapperClass,
          hideLabel && "gap-0!",
          wrapperClassName,
        )}
      >
        <FormFieldLabel
          label={label}
          htmlFor={fieldId}
          required={required}
          optional={optional}
          showOptionalLabel={showOptionalLabel}
          error={!!mergedError}
          infoTooltip={infoTooltip}
          hideLabel={hideLabel}
          className={labelClassName}
        />

        <div className={cn("flex min-w-0 items-stretch", className)}>
          <div className="min-w-0 flex-1">
            <InputField
              label={label}
              name={fieldId}
              type={type}
              hideLabel
              hideFeedback
              placeholder={resolvedPlaceholder}
              value={displayValue}
              onChange={(e) => {
                emitChange(applySanitization(e.target.value));
              }}
              onBlur={(e) => {
                fieldOnBlur?.(e);
                onBlur?.(e);
              }}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={maxLength}
              validationRule={validationRule}
              validationOptions={validationOptions}
              error={mergedError}
              wrapperClassName="gap-0!"
              className={cn(
                showSuffix && "rounded-r-none",
                compact && "px-2",
                inputClassName,
              )}
            />
          </div>
          {showSuffix ? (
            <span
              className={cn(
                inputSuffixClass,
                mergedError && inputSuffixErrorClass,
                suffixClassName,
              )}
              aria-hidden
            >
              {suffixLabel}
            </span>
          ) : null}
        </div>

        <FormFieldFeedback
          helperText={helperText}
          error={mergedError}
          helperId={helperId}
          errorId={errorId}
          className={cn(
            compact && "text-[10px] leading-tight",
            feedbackClassName,
          )}
          helperClassName={helperTextClassName}
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
            field.value ?? "",
            field.onChange,
            field.onBlur,
          )
        }
      />
    );
  }

  return renderField(
    undefined,
    value !== undefined && value !== null ? String(value) : "",
    undefined,
    undefined,
  );
};

export const InputWithSuffixField = React.memo(
  InputWithSuffixFieldInner,
) as typeof InputWithSuffixFieldInner;
