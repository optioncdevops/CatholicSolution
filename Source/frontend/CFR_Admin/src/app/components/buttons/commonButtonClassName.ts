import { cn } from "@app/utilities/cn";
import {
  COMMON_BUTTON_BASE_CLASSES,
  COMMON_BUTTON_SIZE_CLASSES,
  COMMON_BUTTON_SOLID_VARIANT_CLASSES,
  COMMON_BUTTON_SOFT_VARIANT_CLASSES,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from "@designSystem/theme/styles/buttonComponentStyle";

export type { ButtonSize, ButtonTone, ButtonVariant };

export interface CommonButtonClassNameOptions {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  intent?: "default" | "save" | "cancel" | "danger";
  fullWidth?: boolean;
  className?: string;
}

function resolveEffectiveVariant(
  variant: ButtonVariant,
  intent: "default" | "save" | "cancel" | "danger",
): ButtonVariant {
  const isDanger = intent === "danger" || variant === "danger";
  const isCancel = intent === "cancel";
  const isSave = intent === "save";

  if (isDanger) {return "danger";}
  if (isCancel && variant === "primary") {return "outline";}
  if (isSave && variant === "secondary") {return "primary";}
  return variant;
}

/**
 * Surface classes for `CommonButton` — use on `<Link>` (or other elements) when a real
 * `<button>` is not appropriate, so visuals stay aligned with the design system.
 */
export function getCommonButtonClassName({
  variant = "primary",
  tone = "solid",
  size = "md",
  intent = "default",
  fullWidth = false,
  className,
}: CommonButtonClassNameOptions): string {
  const effectiveVariant = resolveEffectiveVariant(variant, intent);
  const variantClasses =
    tone === "solid"
      ? COMMON_BUTTON_SOLID_VARIANT_CLASSES[effectiveVariant]
      : COMMON_BUTTON_SOFT_VARIANT_CLASSES[effectiveVariant];

  return cn(
    COMMON_BUTTON_BASE_CLASSES,
    COMMON_BUTTON_SIZE_CLASSES[size],
    variantClasses,
    fullWidth ? "w-full" : "w-auto",
    className,
  );
}
