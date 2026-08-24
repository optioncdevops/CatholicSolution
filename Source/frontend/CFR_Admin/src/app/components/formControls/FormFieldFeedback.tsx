import type { ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import {
  themeFieldFeedbackErrorClass,
  themeFieldFeedbackHelperClass,
  themeFieldFeedbackSlotClass,
} from "@designSystem/theme/styles/componentStyle";

export interface FormFieldFeedbackProps {
  helperText?: ReactNode;
  error?: string;
  helperId?: string;
  errorId?: string;
  className?: string;
  helperClassName?: string;
}

export function FormFieldFeedback({
  helperText,
  error,
  helperId,
  errorId,
  className,
  helperClassName,
}: FormFieldFeedbackProps) {
  const hasHelper = Boolean(helperText) && !error;
  const hasError = Boolean(error);
  const hasContent = hasHelper || hasError;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={cn(themeFieldFeedbackSlotClass, className)}>
      {hasError ? (
        <p id={errorId} className={themeFieldFeedbackErrorClass} role="alert">
          {error}
        </p>
      ) : hasHelper ? (
        <p
          id={helperId}
          className={cn(themeFieldFeedbackHelperClass, helperClassName)}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
