import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeChoiceInputErrorClass,
  themeChoiceInputRadioClass,
  themeChoiceInputDisabledClass,
  themeChoiceLabelDisabledClass,
  themeFieldWrapperClass,
  themeHelperClass,
  themeLabelClass,
  themeRequiredMarkClass,
} from "@designSystem/theme/styles/componentStyle";

interface BaseRadioProps {
  /** Stable id for this radio input (e.g. `rdoLicenseTypeAnnual`) per the Stable Control IDs standard — this is the full id for this specific option, not a group prefix. */
  id?: string;
  label: string;
  /** Value stored in the form when this radio is selected */
  radioValue: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
  /** Controlled value (when not using react-hook-form) */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onValueChange?: (value: string) => void;
}

export interface CommonRadioProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseRadioProps {
  control?: Control<TFieldValues>;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const RadioInner = <TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  radioValue,
  helperText,
  error,
  required,
  disabled = false,
  className,
  value,
  defaultValue,
  onValueChange,
  control,
  name,
  rules,
}: CommonRadioProps<TFieldValues>) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue,
  );
  const generatedId = React.useId();
  const inputId = id ?? (name
    ? `${name}-${radioValue}`
    : `radio-${radioValue}-${generatedId}`);

  const selected = value ?? internalValue;

  const select = (next: string, externalOnChange?: (val: string) => void) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
    externalOnChange?.(next);
  };

  const renderRadio = (
    fieldValue?: string,
    fieldOnChange?: (val: string) => void,
    fieldError?: string,
  ) => {
    const currentSelected = fieldValue ?? selected;
    const mergedError = fieldError ?? error;
    const isChecked = currentSelected === radioValue;

    return (
      <div className={cn(themeFieldWrapperClass, className)}>
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex items-start gap-2",
            disabled ? themeChoiceLabelDisabledClass : "cursor-pointer",
          )}
        >
          <input
            id={inputId}
            type="radio"
            name={name}
            className={cn(
              themeChoiceInputRadioClass,
              disabled && themeChoiceInputDisabledClass,
              "mt-0.5",
              mergedError && themeChoiceInputErrorClass,
            )}
            checked={isChecked}
            disabled={disabled}
            onChange={() => { select(radioValue, fieldOnChange); }}
            aria-invalid={!!mergedError}
            aria-describedby={
              mergedError
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
          />
          <span className="flex flex-col gap-1">
            <span
              className={cn(
                themeLabelClass,
                mergedError && "text-[var(--error)]",
              )}
            >
              {label}
              {required && <span className={themeRequiredMarkClass}>*</span>}
            </span>
            {helperText && !mergedError && (
              <span id={`${inputId}-helper`} className={themeHelperClass}>
                {helperText}
              </span>
            )}
          </span>
        </label>
        {mergedError && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-danger-500"
            role="alert"
            aria-live="polite"
          >
            {mergedError}
          </p>
        )}
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
          renderRadio(
            field.value as string,
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderRadio(undefined, undefined, undefined);
};

export const CommonRadio = React.memo(RadioInner) as typeof RadioInner;
