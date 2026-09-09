import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeChoiceInputCheckboxClass,
  themeChoiceInputDisabledClass,
  themeChoiceInputErrorClass,
  themeChoiceLabelDisabledClass,
  themeFieldWrapperClass,
  themeHelperClass,
  themeLabelClass,
  themeRequiredMarkClass,
} from "@designSystem/theme/styles/componentStyle";

interface BaseCheckboxProps {
  /** Stable id for the checkbox input (e.g. `chkIsActive`) per the Stable Control IDs standard. */
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
  /** Controlled value (when not using react-hook-form) */
  checked?: boolean;
  /** Default value for uncontrolled mode */
  defaultChecked?: boolean;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onCheckedChange?: (checked: boolean) => void;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  /** Renders the native tri-state "indeterminate" visual (a dash instead of a check) — for a
   * parent row whose children are partially selected. This is a DOM property, not an HTML
   * attribute, so it's applied imperatively via a ref rather than through `checked`. */
  indeterminate?: boolean;
}

export interface CommonCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseCheckboxProps {
  control?: Control<TFieldValues>;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const CheckboxInner = <TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  helperText,
  error,
  required,
  disabled = false,
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  hideLabel = false,
  indeterminate = false,
  control,
  name,
  rules,
}: CommonCheckboxProps<TFieldValues>) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const generatedId = React.useId();
  const inputId = id ?? name ?? `checkbox-${generatedId}`;
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const isChecked = checked ?? internalChecked;

  const handleChange = (
    next: boolean,
    externalOnChange?: (val: boolean) => void,
  ) => {
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
    externalOnChange?.(next);
  };

  const renderCheckbox = (
    fieldChecked?: boolean,
    fieldOnChange?: (val: boolean) => void,
    fieldError?: string,
  ) => {
    const currentChecked = fieldChecked ?? isChecked;
    const mergedError = fieldError ?? error;

    return (
      <div
        className={cn(
          themeFieldWrapperClass,
          hideLabel && "w-auto! gap-0!",
          className,
        )}
      >
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex items-start gap-2",
            hideLabel && "items-center",
            disabled ? themeChoiceLabelDisabledClass : "cursor-pointer",
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="checkbox"
            className={cn(
              themeChoiceInputCheckboxClass,
              disabled && themeChoiceInputDisabledClass,
              !hideLabel && "mt-0.5",
              mergedError && themeChoiceInputErrorClass,
            )}
            checked={currentChecked}
            disabled={disabled}
            onChange={(e) => { handleChange(e.target.checked, fieldOnChange); }}
            aria-label={hideLabel ? label : undefined}
            aria-checked={indeterminate ? 'mixed' : currentChecked}
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
                hideLabel && "sr-only",
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
          renderCheckbox(
            field.value as boolean,
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderCheckbox(undefined, undefined, undefined);
};

export const CommonCheckbox = React.memo(CheckboxInner) as typeof CheckboxInner;
