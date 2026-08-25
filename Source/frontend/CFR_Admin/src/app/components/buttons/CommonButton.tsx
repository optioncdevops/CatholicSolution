import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import {
  COMMON_BUTTON_GAP_CLASSES,
  COMMON_BUTTON_ICON_SIZE_CLASSES,
  COMMON_BUTTON_SPINNER_SIZE_CLASSES,
  type ButtonSize,
} from "@designSystem/theme/styles/buttonComponentStyle";
import { Tooltip } from "../tooltips/Tooltip";
import { getCommonButtonClassName, type ButtonTone, type ButtonVariant } from "./commonButtonClassName";

export interface CommonButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Button visual style – primary, secondary, outline, etc. */
  variant?: ButtonVariant;
  /** Tone of the button – solid (default) or soft/washed */
  tone?: ButtonTone;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether this button represents a positive/save/confirm action */
  intent?: "default" | "save" | "cancel" | "danger";
  /** Optional icon rendered before the label */
  iconLeft?: ReactNode;
  /** Optional icon rendered after the label */
  iconRight?: ReactNode;
  /** Show loading spinner and disable interactions */
  loading?: boolean;
  /** Full‑width button */
  fullWidth?: boolean;
  /** Semantic button type (defaults to "button") */
  type?: "button" | "submit" | "reset";
  /** Accessible label used when the button has icon‑only content */
  "aria-label"?: string;
  /** Optional tooltip content */
  tooltip?: React.ReactNode;
  /** Optional tooltip side */
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

const gapClasses = COMMON_BUTTON_GAP_CLASSES;
const iconSizeClasses = COMMON_BUTTON_ICON_SIZE_CLASSES;
const spinnerSizeClasses = COMMON_BUTTON_SPINNER_SIZE_CLASSES;

function SpinnerSvg({ size }: { size: ButtonSize }) {
  return (
    <svg className={cn(spinnerSizeClasses[size], "animate-spin")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const CommonButton = React.forwardRef<HTMLButtonElement, CommonButtonProps>(
  (
    {
      variant = "primary",
      tone = "solid",
      size = "md",
      intent = "default",
      iconLeft,
      iconRight,
      loading,
      fullWidth,
      type = "button",
      children,
      className,
      disabled,
      tooltip,
      tooltipSide,
      ...rest
    },
    ref,
  ) => {
    const showSpinner = loading;
    const isDisabled = disabled || loading;

    const iconClasses = cn("shrink-0", iconSizeClasses[size]);

    const buttonElement = (
      <button
        ref={ref}
        type={type}
        className={getCommonButtonClassName({ variant, tone, size, intent, fullWidth, className })}
        disabled={isDisabled}
        {...rest}
      >
        <span className={cn("relative flex items-center justify-center", gapClasses[size])}>
          {showSpinner && (
            <span className="shrink-0">
              <SpinnerSvg size={size} />
            </span>
          )}
          {!showSpinner && iconLeft && <span className={iconClasses}>{iconLeft}</span>}
          {children && <span className="whitespace-nowrap">{children}</span>}
          {!showSpinner && iconRight && <span className={iconClasses}>{iconRight}</span>}
        </span>
      </button>
    );

    if (tooltip) {
      const trigger = isDisabled ? (
        <span className="inline-block cursor-not-allowed">
          {(() => {
            const element = buttonElement as React.ReactElement<{ className?: string }>;
            return React.cloneElement(element, {
              className: cn(element.props.className, "pointer-events-none"),
            });
          })()}
        </span>
      ) : (
        buttonElement
      );

      return (
        <Tooltip content={tooltip} side={tooltipSide}>
          {trigger}
        </Tooltip>
      );
    }

    return buttonElement;
  },
);

CommonButton.displayName = "CommonButton";
