import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import {
  themeFieldWrapperClass,
  themeFieldBaseClass,
  themeFieldShellClass,
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFieldReadonlyClass,
} from "@designSystem/theme/styles/componentStyle";
import { authFieldHelperTextClass } from "@designSystem/theme/styles/authLayoutStyle";
import { FormFieldLabel } from "./FormFieldLabel";
import { FormFieldFeedback } from "./FormFieldFeedback";
import type {
  FormFieldInfoTooltipProp,
  FormFieldOptionalLabelProp,
} from "./formControlFieldProps";
import { AppIcon } from "@app/components/icons";
import {
  sanitizeInputValue,
  type InputValidationRule,
  type SanitizeInputOptions,
} from "@app/utilities/inputValidation";

interface BaseInputFieldProps
  extends
  React.InputHTMLAttributes<HTMLInputElement>,
  FormFieldInfoTooltipProp,
  FormFieldOptionalLabelProp {
  label: string;
  type?: string;
  /** Optional icon shown inside the input on the left side */
  startIcon?: React.ReactNode;
  /** Optional icon shown inside the input on the right side (for non-password fields) */
  endIcon?: React.ReactNode;
  /** Optional helper / hint text shown below the input */
  helperText?: string;
  /** Optional classes for the helper line (e.g. hide on small screens). */
  helperTextClassName?: string;
  /** Classes for the outer label+control stack (e.g. gap tuning in dense forms). */
  wrapperClassName?: string;
  /** Classes for the field label. */
  labelClassName?: string;
  /** Optional action aligned to the right of the label row (e.g. “Forgot password?”). */
  labelAction?: React.ReactNode;
  /** Error message to show below the input and highlight the border */
  error?: string;
  /** When true and there is no error, shows success border (e.g. inline validation). */
  valid?: boolean;
  /** Message shown in success styling when `valid` is true */
  validMessage?: string;
  /** Regular expression that the full value must satisfy; useful for restrictions like letters-only */
  allowedPattern?: RegExp;
  /** Convenience flag to allow only English letters (A–Z, a–z) and spaces */
  lettersOnly?: boolean;
  /** Sanitization rule applied on every change (typing, paste, autofill). See inputValidation.ts. */
  validationRule?: InputValidationRule;
  /** Decimal places when validationRule is `decimalOnly` (default 2). */
  decimalPlaces?: number;
  /** Options for validationRule (merged with maxLength / decimalPlaces from props). */
  validationOptions?: SanitizeInputOptions;
  /** `auth` uses tenant card/border tokens (sign-in surfaces). */
  variant?: "default" | "auth";
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  /** Suppress helper/error line — use when a parent composite field renders feedback. */
  hideFeedback?: boolean;
  /**
   * How to surface `error` text.
   * - `inline` (default): message below the field (forms)
   * - `tooltip`: keep error border only; full message on hover/focus (dense table cells)
   */
  errorDisplay?: "inline" | "tooltip";
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
}

export interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseInputFieldProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const InputFieldInner = <TFieldValues extends FieldValues = FieldValues>({
  label,
  type = "text",
  placeholder,
  required,
  optional,
  showOptionalLabel,
  className,
  startIcon,
  endIcon,
  helperText,
  helperTextClassName,
  wrapperClassName,
  labelClassName,
  labelAction,
  infoTooltip,
  error,
  valid = false,
  validMessage,
  allowedPattern,
  lettersOnly,
  validationRule,
  decimalPlaces,
  validationOptions,
  maxLength,
  variant = "default",
  hideLabel = false,
  hideFeedback = false,
  errorDisplay = "inline",
  control,
  name,
  rules,
  ...props
}: InputFieldProps<TFieldValues>) => {
  const [showPassword, setShowPassword] = useState(false);
  const reactId = useId();
  const fieldId =
    name ??
    (typeof props.id === "string"
      ? props.id
      : `input-${reactId.replace(/:/g, "")}`);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const effectivePattern = useMemo(
    () => (lettersOnly && !allowedPattern ? /^[A-Za-z\s]*$/ : allowedPattern),
    [lettersOnly, allowedPattern],
  );

  const sanitizeOptions = useMemo<SanitizeInputOptions>(
    () => ({
      ...validationOptions,
      ...(maxLength != null ? { maxLength: Number(maxLength) } : {}),
      ...(decimalPlaces != null ? { decimalPlaces } : {}),
    }),
    [validationOptions, maxLength, decimalPlaces],
  );

  const applySanitization = useCallback(
    (raw: string): string => {
      if (!validationRule) { return raw; }
      return sanitizeInputValue(raw, validationRule, sanitizeOptions);
    },
    [validationRule, sanitizeOptions],
  );

  const usePatternGuard = !!effectivePattern && !validationRule;

  const hasStartIcon = !!startIcon;
  const hasEndIcon = !!endIcon || isPassword;

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldOnChange?: React.ChangeEventHandler<HTMLInputElement>,
    externalOnChange?: React.ChangeEventHandler<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const next = validationRule ? applySanitization(raw) : raw;

    const nextEvent = {
      ...e,
      target: { ...e.target, value: next },
      currentTarget: { ...e.currentTarget, value: next },
    } as React.ChangeEvent<HTMLInputElement>;

    fieldOnChange?.(nextEvent);
    externalOnChange?.(nextEvent);
  };

  const renderField = (
    fieldError?: string,
    fieldProps?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => {
    const mergedError = fieldError ?? error;
    const showSuccess = valid && !mergedError;
    const isDisabled = Boolean(props.disabled || fieldProps?.disabled);
    const isReadOnly = Boolean(props.readOnly || fieldProps?.readOnly);

    const isAuthVariant = variant === "auth";

    const borderAndRingClasses = mergedError
      ? themeFieldBorderErrorClass
      : showSuccess
        ? "border-success-500 hover:border-success-500 focus:border-success-600 focus:ring-2 focus:ring-success-500/20 focus-visible:border-success-600 focus-visible:ring-success-500/20 dark:border-success-500 dark:hover:border-success-500 dark:focus:border-success-600 dark:focus:ring-success-500/25 dark:focus-visible:ring-success-500/25"
        : isAuthVariant
          ? "border-border hover:border-primary-500/60 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 dark:border-border dark:hover:border-primary-400/70 dark:focus:border-primary-400 dark:focus:ring-primary-400/25"
          : "";

    const inputBaseClasses = isAuthVariant
      ? "min-h-10 h-auto w-full rounded-md border bg-background px-3 py-2.5 text-[0.875rem] leading-[1.35] text-foreground shadow-none transition-[color,background-color,border-color,box-shadow] placeholder:text-foreground-subtle focus:bg-background focus:outline-none focus:ring-2 focus:ring-offset-0 dark:border-primary-600/50 dark:bg-primary-950/45 dark:text-foreground dark:placeholder:text-white/45 dark:focus:bg-primary-950/45"
      : isDisabled || isReadOnly
        ? themeFieldShellClass
        : themeFieldBaseClass;

    const helperId = helperText ? `${fieldId}-helper` : undefined;
    const errorId = mergedError ? `${fieldId}-error` : undefined;
    const validId =
      showSuccess && validMessage ? `${fieldId}-valid` : undefined;
    const describedBy =
      [errorId, validId, helperId].filter(Boolean).join(" ") || undefined;
    const showInlineFeedback = !hideFeedback && errorDisplay !== "tooltip";
    const isTooltipMode = errorDisplay === "tooltip";
    const showErrorTooltip = isTooltipMode && Boolean(mergedError);

    const fieldBody = (
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
          labelAction={labelAction}
          className={labelClassName}
        />
        <div
          className={
            hasStartIcon || hasEndIcon
              ? "relative"
              : isPassword
                ? "relative"
                : ""
          }
        >
          {hasStartIcon && (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5",
                isAuthVariant
                  ? "text-foreground-muted"
                  : "text-muted-foreground",
                isDisabled && themeFieldDisabledIconClass,
                mergedError && "text-danger-500 dark:text-danger-400",
              )}
            >
              {startIcon}
            </span>
          )}
          <input
            type={inputType}
            placeholder={placeholder}
            maxLength={maxLength}
            {...props}
            {...fieldProps}
            id={fieldId}
            onChange={(e) => {
              handleValueChange(
                e,
                fieldProps?.onChange,
                props.onChange,
              );
            }}
            onBlur={(e) => {
              if (e.target.value && typeof e.target.value === "string") {
                const trimmed = e.target.value.trim();
                if (trimmed !== e.target.value) {
                  const nextEvent = {
                    ...e,
                    target: { ...e.target, value: trimmed },
                    currentTarget: { ...e.currentTarget, value: trimmed },
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  fieldProps?.onChange?.(nextEvent);
                  props.onChange?.(nextEvent);
                  e.target.value = trimmed;
                }
              }
              fieldProps?.onBlur?.(e);
              props.onBlur?.(e);
            }}
            onKeyDown={(e) => {
              if (usePatternGuard && e.key.length === 1) {
                const input = e.currentTarget;
                const value = input.value;
                const start = input.selectionStart ?? value.length;
                const end = input.selectionEnd ?? value.length;
                const nextValue =
                  value.slice(0, start) + e.key + value.slice(end);

                if (!effectivePattern.test(nextValue)) {
                  e.preventDefault();
                  return;
                }
              }
              props.onKeyDown?.(e);
              fieldProps?.onKeyDown?.(e);
            }}
            onPaste={(e) => {
              if (usePatternGuard) {
                const paste = e.clipboardData.getData("text");
                const input = e.currentTarget;
                const value = input.value;
                const start = input.selectionStart ?? value.length;
                const end = input.selectionEnd ?? value.length;
                const nextValue =
                  value.slice(0, start) + paste + value.slice(end);

                if (!effectivePattern.test(nextValue)) {
                  e.preventDefault();
                  return;
                }
              }
              props.onPaste?.(e);
              fieldProps?.onPaste?.(e);
            }}
            aria-invalid={!!mergedError}
            aria-describedby={describedBy}
            className={cn(
              inputBaseClasses,
              hasStartIcon && "pl-10",
              hasEndIcon && "pr-10",
              isDisabled
                ? themeFieldDisabledClass
                : isReadOnly
                  ? themeFieldReadonlyClass
                  : !isAuthVariant && borderAndRingClasses,
              isAuthVariant && !isDisabled && !isReadOnly && borderAndRingClasses,
              className,
              fieldProps?.className,
            )}
          />
          {isPassword ? (
            <Tooltip content={showPassword ? "Hide password" : "Show password"}>
              <button
                type="button"
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center pr-3 transition-colors hover:text-foreground",
                  isAuthVariant
                    ? "text-foreground-muted"
                    : "text-muted-foreground",
                )}
                onClick={() => { setShowPassword((prev) => !prev); }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AppIcon name="eye" size="controlField" decorative />
                ) : (
                  <AppIcon name="eyeOff" size="controlField" decorative />
                )}
              </button>
            </Tooltip>
          ) : (
            endIcon && (
              <span
                className={cn(
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground",
                  isDisabled && themeFieldDisabledIconClass,
                )}
              >
                {endIcon}
              </span>
            )
          )}
        </div>
        {showInlineFeedback ? (
          <FormFieldFeedback
            helperText={
              mergedError
                ? undefined
                : showSuccess && validMessage
                  ? validMessage
                  : helperText
            }
            error={mergedError}
            helperId={showSuccess && validMessage ? validId : helperId}
            errorId={errorId}
            helperClassName={cn(
              helperTextClassName,
              isAuthVariant && authFieldHelperTextClass,
              showSuccess &&
              validMessage &&
              !mergedError &&
              "text-success-600 dark:text-success-400",
            )}
          />
        ) : null}
        {showErrorTooltip ? (
          <span id={errorId} className="sr-only" role="alert">
            {mergedError}
          </span>
        ) : null}
      </div>
    );

    if (isTooltipMode) {
      return (
        <Tooltip
          content={
            mergedError ? (
              <span className="block max-w-56 whitespace-normal text-left leading-snug">
                {mergedError}
              </span>
            ) : undefined
          }
          side="top"
          triggerClassName="w-full min-w-0 max-w-full"
        >
          {fieldBody}
        </Tooltip>
      );
    }

    return fieldBody;
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <ControlledInputField
            field={field}
            fieldState={fieldState}
            validationRule={validationRule}
            applySanitization={applySanitization}
            renderField={renderField}
          />
        )}
      />
    );
  }

  return renderField(undefined, undefined);
};

interface ControlledInputFieldProps {
  field: any;
  fieldState: any;
  validationRule?: InputValidationRule;
  applySanitization: (raw: string) => string;
  renderField: (error?: string, props?: any) => React.ReactNode;
}

const ControlledInputField = ({
  field,
  fieldState,
  validationRule,
  applySanitization,
  renderField,
}: ControlledInputFieldProps) => {
  const { value, onChange } = field;

  useEffect(() => {
    if (validationRule && value !== undefined && value !== null) {
      const raw = String(value);
      const formatted = applySanitization(raw);
      if (formatted !== raw) {
        onChange(formatted);
      }
    }
  }, [value, validationRule, applySanitization, onChange]);

  const formattedValue = useMemo(() => {
    const raw = value ?? "";
    return validationRule ? applySanitization(String(raw)) : raw;
  }, [value, validationRule, applySanitization]);

  return renderField(fieldState.error?.message, {
    ...field,
    value: formattedValue,
  });
};

export const InputField = React.memo(InputFieldInner) as typeof InputFieldInner;
