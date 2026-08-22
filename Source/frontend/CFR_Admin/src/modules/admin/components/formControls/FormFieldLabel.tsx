import { cn } from "@app/utilities/cn";
import {
  themeLabelClass,
  themeOptionalLabelSuffixClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldInfoTooltip } from "./partials/FormFieldInfoTooltip";

export interface FormFieldLabelProps {
  id?: string;
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  /** When false, hides the “(optional)” suffix even if `optional` is true. Default true. */
  showOptionalLabel?: boolean;
  error?: boolean;
  infoTooltip?: React.ReactNode;
  /**
   * Extra control rendered inline after the info icon (e.g. view / map icon),
   * matching the info-icon placement next to the label text.
   */
  labelAddon?: React.ReactNode;
  className?: string;
  hideLabel?: boolean;
  /** Optional action on the right of the label row (e.g. “Forgot password?”). */
  labelAction?: React.ReactNode;
}

/** Shared field label with required/optional markers and optional info tooltip. */
export function FormFieldLabel({
  id,
  label,
  htmlFor,
  required,
  optional,
  showOptionalLabel = true,
  error,
  infoTooltip,
  labelAddon,
  className,
  hideLabel = false,
  labelAction,
}: FormFieldLabelProps) {
  const labelText = (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-danger-500">*</span>}
      {optional && !required && showOptionalLabel && (
        <span className={themeOptionalLabelSuffixClass}> (optional)</span>
      )}
      {infoTooltip ? (
        <FormFieldInfoTooltip content={infoTooltip} label={label} />
      ) : null}
      {labelAddon}
    </span>
  );

  const labelClasses = cn(
    themeLabelClass,
    error && "text-danger-600 dark:text-danger-400",
    hideLabel && "sr-only",
    className,
  );

  const labelNode = htmlFor ? (
    <label id={id} htmlFor={htmlFor} className={labelClasses}>
      {labelText}
    </label>
  ) : (
    <span id={id} className={labelClasses}>
      {labelText}
    </span>
  );

  if (labelAction) {
    return (
      <div className="flex items-center justify-between gap-3">
        {labelNode}
        {labelAction}
      </div>
    );
  }

  return labelNode;
}
