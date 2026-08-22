/**
 * Shared defaults for RebarPro form controls.
 */

import { themeFieldDisabledClass } from "@designSystem/theme/styles/componentStyle";

/** Select controls show a clear icon when a value is selected. Default: enabled. */
export const DEFAULT_SELECT_CLEARABLE = true as const;

/** Returns shared disabled field classes when `disabled` is true. */
export function resolveFieldDisabledClass(disabled?: boolean): string {
  return disabled ? themeFieldDisabledClass : "";
}

/**
 * Resolves whether clearing is allowed.
 * `undefined` and `true` enable clear; only explicit `false` disables it.
 */
export function resolveSelectClearable(clearable?: boolean): boolean {
  return clearable !== false;
}

/**
 * Resolves clear affordance for select-like controls.
 * `hideClearButton` takes precedence over `clearable`.
 */
export function resolveControlClearable(
  clearable: boolean = DEFAULT_SELECT_CLEARABLE,
  hideClearButton?: boolean,
): boolean {
  if (hideClearButton) {return false;}
  return resolveSelectClearable(clearable);
}

/**
 * DatePicker legacy `showClearButton` overrides `clearable` when explicitly set.
 */
export function resolvePickerClearable(
  clearable: boolean = DEFAULT_SELECT_CLEARABLE,
  options?: { showClearButton?: boolean; hideClearButton?: boolean },
): boolean {
  if (options?.hideClearButton) {return false;}
  if (options?.showClearButton !== undefined) {return options.showClearButton;}
  return resolveSelectClearable(clearable);
}

/** Whether a single-select value is considered selected (for clear icon visibility). */
export function hasDropdownValue(
  value: string | number | undefined | null,
): boolean {
  if (value == null) {return false;}
  return String(value).trim() !== "";
}

/** Whether a multi-select has one or more selected values. */
export function hasMultiSelectValues(
  value: string[] | undefined | null,
): boolean {
  return Array.isArray(value) && value.length > 0;
}
