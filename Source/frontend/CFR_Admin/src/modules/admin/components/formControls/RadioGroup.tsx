import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeChoiceInputDisabledClass,
  themeChoiceInputErrorClass,
  themeChoiceInputRadioClass,
  themeChoiceLabelDisabledClass,
  themeFieldWrapperClass,
  themeHelperClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "./FormFieldLabel";
import type { FormFieldInfoTooltipProp } from "./formControlFieldProps";

interface RadioOption {
  /** Identifier sent to API / stored in form (e.g., ID or code) */
  id: string | number;
  /** Human readable label/value shown to the user */
  value: string;
}

interface BaseRadioGroupProps extends FormFieldInfoTooltipProp {
  label: string;
  options: RadioOption[];
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
  className?: string;
  /** Controlled value (when not using react-hook-form) */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onValueChange?: (value: string) => void;
  tabIndex?: number;
}

export interface RadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseRadioGroupProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const RadioGroupInner = <TFieldValues extends FieldValues = FieldValues>({
  label,
  options,
  helperText,
  error,
  required,
  optional,
  infoTooltip,
  disabled = false,
  direction = "horizontal",
  className,
  value,
  defaultValue,
  onValueChange,
  control,
  name,
  rules,
  tabIndex,
}: RadioGroupProps<TFieldValues>) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue,
  );

  const selected = value ?? internalValue;

  const setSelected = (
    next: string,
    externalOnChange?: (val: string) => void,
  ) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
    externalOnChange?.(next);
  };

  const renderGroup = (
    fieldValue?: string,
    fieldOnChange?: (val: string) => void,
    fieldError?: string,
  ) => {
    const currentSelected = fieldValue ?? selected;
    const mergedError = fieldError ?? error;

    const groupClasses =
      direction === "horizontal"
        ? "flex flex-wrap gap-3"
        : "flex flex-col gap-2";

    return (
      <div className={cn(themeFieldWrapperClass, className)}>
        <FormFieldLabel
          label={label}
          htmlFor={name}
          required={required}
          optional={optional}
          error={!!mergedError}
          infoTooltip={infoTooltip}
        />

        <div
          className={groupClasses}
          role="radiogroup"
          aria-invalid={!!mergedError}
        >
          {options.map((opt) => {
            const id = String(opt.id);
            const isChecked = currentSelected === id;
            const optionInputId = name ? `${name}-${id}` : `radio-${id}`;
            return (
              <label
                key={id}
                htmlFor={optionInputId}
                className={cn(
                  "inline-flex items-center gap-2 text-[13px] text-foreground",
                  disabled ? themeChoiceLabelDisabledClass : "cursor-pointer",
                )}
              >
                <input
                  id={optionInputId}
                  type="radio"
                  name={name}
                  className={cn(
                    themeChoiceInputRadioClass,
                    disabled && themeChoiceInputDisabledClass,
                    mergedError && themeChoiceInputErrorClass,
                  )}
                  checked={isChecked}
                  disabled={disabled}
                  tabIndex={tabIndex}
                  onChange={() => { setSelected(id, fieldOnChange); }}
                />
                <span>{opt.value}</span>
              </label>
            );
          })}
        </div>

        {helperText && !mergedError && (
          <p id={`${name}-helper`} className={themeHelperClass}>
            {helperText}
          </p>
        )}
        {mergedError && (
          <p
            id={`${name}-error`}
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
          renderGroup(
            field.value as string,
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderGroup(undefined, undefined, undefined);
};

export const RadioGroup = React.memo(RadioGroupInner) as typeof RadioGroupInner;
