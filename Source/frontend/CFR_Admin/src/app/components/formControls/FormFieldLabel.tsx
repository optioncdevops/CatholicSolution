import { cn } from "@app/utilities/cn";
import {
  themeLabelClass,
  themeRequiredMarkClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldInfoTooltip } from "./partials/FormFieldInfoTooltip";

export interface FormFieldLabelProps {
  id?: string;
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** @deprecated No longer rendered — this app never shows an "(optional)" label suffix. Kept so existing callers still type-check. */
  optional?: boolean;
  /** @deprecated No longer rendered, see {@link optional}. */
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
      {required && <span className={themeRequiredMarkClass}>*</span>}
      {infoTooltip ? (
        <FormFieldInfoTooltip content={infoTooltip} label={label} />
      ) : null}
      {labelAddon}
    </span>
  );

  const labelClasses = cn(
    themeLabelClass,
    error && "text-[var(--error)]",
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
