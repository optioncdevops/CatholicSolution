import type { ReactNode } from "react";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";

import type { FormFieldInfoTooltipProp } from "../formControlFieldProps";

export type ColorPickerInnerProps = FormFieldInfoTooltipProp & {
  label?: string;
  name?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: ReactNode;
  error?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  clearable?: boolean;
  /** Optional advanced native browser picker trigger icon. */
  enableNativePicker?: boolean;
  /** @deprecated Use `enableNativePicker`. */
  showNativePicker?: boolean;
  /** @deprecated Inline control does not show presets by default. */
  presets?: string[];
  /** @deprecated Inline control does not show presets by default. */
  showPresets?: boolean;
  /** @deprecated Inline control always supports hex entry by default. */
  showHexInput?: boolean;
  className?: string;
  tabIndex?: number;
};

export type ColorPickerProps<TFieldValues extends FieldValues = FieldValues> =
  ColorPickerInnerProps & {
    control?: Control<TFieldValues>;
    name?: string;
    rules?: RegisterOptions<TFieldValues>;
  };
