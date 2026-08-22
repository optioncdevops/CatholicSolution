import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AppIcon, type AppIconName } from "../icons";
import { cn } from "@app/utilities/cn";
import {
  COMMON_ICON_BUTTON_BASE_CLASSES,
  COMMON_ICON_BUTTON_ICON_SIZE,
  COMMON_ICON_BUTTON_SIZE_CLASSES,
  COMMON_ICON_BUTTON_SOLID_VARIANT_CLASSES,
  COMMON_ICON_BUTTON_SOFT_VARIANT_CLASSES,
  type IconButtonSize,
  type IconButtonVariant,
} from "@designSystem/theme/styles/buttonComponentStyle";

import { Tooltip } from "../tooltips/Tooltip";

export type { IconButtonVariant, IconButtonSize };

export type IconButtonTone = "solid" | "soft";

export interface CommonIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
  /** Optional tooltip content */
  tooltip?: React.ReactNode;
  /** Optional tooltip side */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Visual style of the icon button */
  variant?: IconButtonVariant;
  /** Tone – solid (default) or soft/washed */
  tone?: IconButtonTone;
  /** Size – maps to button size scale */
  size?: IconButtonSize;
  /** Icon element to render inside the button (takes precedence over iconName) */
  icon?: ReactNode;
  /** Icon key from APP_ICONS */
  iconName?: AppIconName;
  /** @deprecated Use iconName */
  iconComponent?: AppIconName;
  /** Override icon size when using iconName */
  iconSize?: number;
  /** Accessible label (required for icon-only buttons) */
  "aria-label": string;
  /** Semantic button type (defaults to "button") */
  type?: "button" | "submit" | "reset";
  /** Show small loading spinner instead of icon */
  loading?: boolean;
}

const sizeMap = COMMON_ICON_BUTTON_SIZE_CLASSES;
const iconSizeMap = COMMON_ICON_BUTTON_ICON_SIZE;
const solidIconVariantClasses = COMMON_ICON_BUTTON_SOLID_VARIANT_CLASSES;
const softIconVariantClasses = COMMON_ICON_BUTTON_SOFT_VARIANT_CLASSES;

const iconSpinner = (
  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const CommonIconButton = forwardRef<HTMLButtonElement, CommonIconButtonProps>((props, ref) => {
  const {
    variant = "ghost",
    tone = "soft",
    size = "sm",
    icon,
    iconName,
    iconSize,
    type = "button",
    loading,
    className,
    disabled,
    tooltip,
    tooltipSide,
    ...rest
  } = props;

  const variantClasses = tone === "solid" ? solidIconVariantClasses[variant] : softIconVariantClasses[variant];

  const sizeClasses = sizeMap[size];
  const isDisabled = disabled || loading;

  const legacyIconName = "iconComponent" in props ? props.iconComponent : undefined;
  const resolvedIconName = iconName ?? legacyIconName;

  const resolvedIcon: ReactNode = loading
    ? iconSpinner
    : icon ?? (resolvedIconName ? <AppIcon name={resolvedIconName} size={iconSize ?? iconSizeMap[size]} decorative /> : null);

  const buttonElement = (
    <button
      ref={ref}
      type={type}
      className={cn(COMMON_ICON_BUTTON_BASE_CLASSES, sizeClasses, variantClasses, className)}
      disabled={isDisabled}
      {...rest}
    >
      {resolvedIcon}
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
});

CommonIconButton.displayName = "CommonIconButton";
