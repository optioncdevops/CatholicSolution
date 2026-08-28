/**
 * Adapted port of the reference project's `buttonComponentStyle.ts` — same exported
 * symbol names, values rebuilt on CFR_Admin's own CSS-custom-property tokens
 * (`modules/theme.css`, `shared/designSystem/styles.css`) instead of the reference
 * project's foreign Tailwind color scale.
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "headerSecondary"
  | "success"
  | "warning"
  | "info"
  | "clearFilter";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonTone = "solid" | "soft";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "success"
  | "warning"
  | "info";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

const CONTROL_TRANSITION = "transition-colors duration-150";

export const COMMON_BUTTON_BASE_CLASSES =
  "relative inline-flex cursor-pointer items-center justify-center rounded-[var(--admin-control-radius)] font-medium tracking-normal " +
  CONTROL_TRANSITION +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 gap-2 ";

export const COMMON_BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-[length:var(--admin-text-2xs)]",
  sm: "h-8 px-3 text-[length:var(--admin-text-xs)]",
  md: "h-9 px-4 text-[length:var(--admin-text-base)]",
  lg: "h-10 px-5 text-[length:var(--admin-text-lg)]",
};

export const COMMON_BUTTON_GAP_CLASSES: Record<ButtonSize, string> = {
  xs: "gap-1.5",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2",
};

export const COMMON_BUTTON_ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "[&>svg]:h-3.5 [&>svg]:w-3.5",
  sm: "[&>svg]:h-4 [&>svg]:w-4",
  md: "[&>svg]:h-4 [&>svg]:w-4",
  lg: "[&>svg]:h-5 [&>svg]:w-5",
};

export const COMMON_BUTTON_SPINNER_SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/** Every variant carries its own distinct, always-visible background — none render as a plain
 * white/transparent surface, so a button reads as a button regardless of what it sits on. */
export const COMMON_BUTTON_SOLID_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-[var(--primary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)]",
  secondary: "border border-transparent bg-[var(--secondary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--secondary-hover)]",
  ghost: "border border-transparent bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--hover)]",
  danger: "border border-transparent bg-[var(--error)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  outline: "border border-[var(--line-strong)] bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:bg-[var(--hover)]",
  headerSecondary: "border border-transparent bg-[var(--secondary)] font-semibold text-[var(--primary)] shadow-[var(--shadow-soft)] hover:bg-[var(--secondary-hover)]",
  success: "border border-transparent bg-[var(--success)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  warning: "border border-transparent bg-[var(--warning)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  info: "border border-transparent bg-[var(--info)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  clearFilter: "border border-[var(--error)]/30 bg-[var(--error-bg)] text-[var(--error)] hover:opacity-90",
};

export const COMMON_BUTTON_SOFT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80",
  secondary: "border border-transparent bg-[var(--secondary)]/10 text-[var(--secondary-hover)] hover:bg-[var(--secondary)]/18",
  ghost: "border border-transparent bg-[var(--surface-muted)]/60 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]",
  danger: "border border-transparent bg-[var(--error-bg)] text-[var(--error)] hover:opacity-80",
  outline: "border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--hover)]",
  headerSecondary: "border border-transparent bg-[var(--secondary)] font-semibold text-[var(--primary)] shadow-[var(--shadow-soft)] hover:bg-[var(--secondary-hover)]",
  success: "border border-transparent bg-[var(--success-bg)] text-[var(--success)] hover:opacity-80",
  warning: "border border-transparent bg-[var(--warning-bg)] text-[var(--warning)] hover:opacity-80",
  info: "border border-transparent bg-[var(--info-bg)] text-[var(--info)] hover:opacity-80",
  clearFilter: "border border-[var(--error)]/20 bg-[var(--error-bg)]/50 text-[var(--error)] hover:bg-[var(--error-bg)]",
};

export const COMMON_ICON_BUTTON_BASE_CLASSES =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--admin-control-radius)] border border-transparent " +
  CONTROL_TRANSITION +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export const COMMON_ICON_BUTTON_SIZE_CLASSES: Record<IconButtonSize, string> = {
  xs: "h-6 w-6 text-[11px]",
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export const COMMON_ICON_BUTTON_ICON_SIZE: Record<IconButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
};

export const COMMON_ICON_BUTTON_SOLID_VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: "border-transparent bg-[var(--primary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)]",
  secondary: "border-transparent bg-[var(--secondary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--secondary-hover)]",
  ghost: "border-transparent bg-[var(--surface-muted)]/60 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]",
  danger: "border-transparent bg-[var(--error)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  outline: "border-[var(--line-strong)] bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:bg-[var(--hover)]",
  success: "border-transparent bg-[var(--success)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  warning: "border-transparent bg-[var(--warning)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
  info: "border-transparent bg-[var(--info)] text-white shadow-[var(--shadow-soft)] hover:opacity-90",
};

export const COMMON_ICON_BUTTON_SOFT_VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: "border-transparent bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80",
  secondary: "border-transparent bg-[var(--secondary)]/10 text-[var(--secondary-hover)] hover:bg-[var(--secondary)]/18",
  ghost: "border-transparent bg-[var(--surface-muted)]/60 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]",
  danger: "border-transparent bg-[var(--error-bg)] text-[var(--error)] hover:opacity-80",
  outline: "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--hover)]",
  success: "border-transparent bg-[var(--success-bg)] text-[var(--success)] hover:opacity-80",
  warning: "border-transparent bg-[var(--warning-bg)] text-[var(--warning)] hover:opacity-80",
  info: "border-transparent bg-[var(--info-bg)] text-[var(--info)] hover:opacity-80",
};
