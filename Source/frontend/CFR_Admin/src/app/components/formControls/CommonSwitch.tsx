import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeChoiceLabelDisabledClass,
  themeHelperClass,
  themeLabelClass,
  themeRequiredMarkClass,
  themeSwitchDisabledThumbClass,
  themeSwitchDisabledTrackClass,
} from "@designSystem/theme/styles/componentStyle";

type SwitchSize = "xs" | "sm" | "md" | "lg";

interface BaseSwitchProps {
  label: string;
  /** Optional helper / hint text shown below the switch */
  helperText?: string;
  /** Error message to show below the switch and highlight the border */
  error?: string;
  /** Whether the switch is required */
  required?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  /** Size of the switch */
  size?: SwitchSize;
  /** Label position relative to the switch */
  labelPosition?: "left" | "right";
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Controlled value (when not using react-hook-form) */
  checked?: boolean;
  /** Default value for uncontrolled mode */
  defaultChecked?: boolean;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface CommonSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseSwitchProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const switchSizeMap: Record<
  SwitchSize,
  { track: string; thumb: string; translate: string; label: string }
> = {
  xs: {
    track: "h-3.5 w-7",
    thumb: "h-3 w-3",
    translate: "translate-x-3.5",
    label: "text-[13px]",
  },
  sm: {
    track: "h-4 w-7.5",
    thumb: "h-3.5 w-3.5",
    translate: "translate-x-4",
    label: "text-[13px]",
  },
  md: {
    track: "h-5 w-9",
    thumb: "h-4 w-4",
    translate: "translate-x-5",
    label: "text-[13px]",
  },
  lg: {
    track: "h-6 w-11",
    thumb: "h-5 w-5",
    translate: "translate-x-6",
    label: "text-[13px]",
  },
};

const SwitchInner = <TFieldValues extends FieldValues = FieldValues>({
  label,
  helperText,
  error,
  required,
  size = "md",
  labelPosition = "right",
  disabled = false,
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  control,
  name,
  rules,
}: CommonSwitchProps<TFieldValues>) => {
  const [internalChecked, setInternalChecked] =
    React.useState<boolean>(defaultChecked);
  const generatedId = React.useId();
  const switchId = name || `switch-${generatedId}`;

  const isChecked = checked ?? internalChecked;

  const handleChange = (
    newChecked: boolean,
    externalOnChange?: (val: boolean) => void,
  ) => {
    if (checked === undefined) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
    externalOnChange?.(newChecked);
  };

  const renderSwitch = (
    fieldChecked?: boolean,
    fieldOnChange?: (val: boolean) => void,
    fieldError?: string,
  ) => {
    const currentChecked = fieldChecked ?? isChecked;
    const mergedError = fieldError ?? error;
    const isDisabled = disabled;
    const sizeConfig = switchSizeMap[size];

    const switchTrackClasses = cn(
      "relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out",
      sizeConfig.track,
      isDisabled
        ? themeSwitchDisabledTrackClass
        : currentChecked
          ? "bg-primary-600 dark:bg-primary-500"
          : "bg-border dark:bg-muted",
      isDisabled ? "cursor-not-allowed" : "cursor-pointer",
      mergedError && "border border-danger-400",
    );

    const switchThumbClasses = cn(
      "inline-block transform rounded-full transition-transform duration-200 ease-in-out",
      sizeConfig.thumb,
      isDisabled ? themeSwitchDisabledThumbClass : "bg-white",
      currentChecked ? sizeConfig.translate : "translate-x-0.5",
    );

    const containerClasses = cn("flex flex-col gap-1", className);

    const switchContainerClasses = cn(
      "flex items-center gap-2",
      labelPosition === "left" ? "flex-row" : "flex-row-reverse justify-end",
    );

    return (
      <div className={containerClasses}>
        <div className={switchContainerClasses}>
          <label
            className={cn(
              themeLabelClass,
              sizeConfig.label,
              isDisabled ? themeChoiceLabelDisabledClass : "cursor-pointer",
            )}
            htmlFor={switchId}
          >
            {label} {required && <span className={themeRequiredMarkClass}>*</span>}
          </label>

          <label
            className={cn(
              "relative inline-flex items-center",
              isDisabled && "cursor-not-allowed",
              !isDisabled && "cursor-pointer",
            )}
          >
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentChecked}
              onChange={(e) => { handleChange(e.target.checked, fieldOnChange); }}
              disabled={isDisabled}
              id={switchId}
              aria-invalid={!!mergedError}
              aria-describedby={
                mergedError
                  ? `${switchId}-error`
                  : helperText
                    ? `${switchId}-helper`
                    : undefined
              }
            />
            <div className={switchTrackClasses}>
              <span className={switchThumbClasses} />
            </div>
          </label>
        </div>

        {(helperText || mergedError) && (
          <div className="ml-0">
            {helperText && !mergedError && (
              <p id={`${switchId}-helper`} className={themeHelperClass}>
                {helperText}
              </p>
            )}
            {mergedError && (
              <p
                id={`${switchId}-error`}
                className="text-xs text-danger-500"
                role="alert"
                aria-live="polite"
              >
                {mergedError}
              </p>
            )}
          </div>
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
          renderSwitch(
            field.value as boolean,
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderSwitch(undefined, undefined, undefined);
};

export const CommonSwitch = React.memo(SwitchInner) as typeof SwitchInner;
