import type { ReactNode } from "react";

/** Optional label info icon + tooltip — add to shared form control prop types. */
export interface FormFieldInfoTooltipProp {
  infoTooltip?: ReactNode;
}

/** Controls display of the “(optional)” suffix on field labels. */
export interface FormFieldOptionalLabelProp {
  /** Show “(optional)” when the field is not required. Default true. */
  showOptionalLabel?: boolean;
}

/**
 * Shared clear affordance for Dropdown, MultiSelect, ServerSideDropdown, and pickers.
 * Default: clear is shown when a value exists. Pass `clearable={false}` or `hideClearButton` to hide.
 */
export interface SelectClearableProp {
  /** Show clear control when a value is selected. Default true. */
  clearable?: boolean;
  /** @deprecated Use `clearable` — when set, overrides `clearable`. */
  showClearButton?: boolean;
  /** Hides the clear control (`clearable={false}` equivalent). */
  hideClearButton?: boolean;
}
