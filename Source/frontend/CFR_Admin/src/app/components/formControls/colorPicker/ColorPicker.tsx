import React from "react";
import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ColorPickerField } from "./ColorPickerField";
import type { ColorPickerProps } from "./colorPicker.types";

const ColorPickerComponent = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  helperText,
  error,
  onChange,
  value,
  ...rest
}: ColorPickerProps<TFieldValues>) => {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name as never}
        rules={rules}
        render={({ field, fieldState }) => (
          <ColorPickerField
            {...rest}
            name={field.name}
            value={(field.value) ?? null}
            onChange={(val) => {
              field.onChange(val);
              onChange?.(val);
            }}
            helperText={helperText}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <ColorPickerField
      {...rest}
      name={name}
      value={value}
      onChange={onChange}
      helperText={helperText}
      error={error}
    />
  );
};

export const ColorPicker = React.memo(
  ColorPickerComponent,
) as typeof ColorPickerComponent;

export type { ColorPickerProps, ColorPickerInnerProps } from "./colorPicker.types";
export {
  DEFAULT_COLOR_PRESETS,
  COLOR_PICKER_DEFAULT_PLACEHOLDER,
} from "./colorPicker.constants";
export {
  expandShortHex,
  isValidHexColor,
  normalizeHexColor,
  sanitizeHexDraftInput,
} from "./colorPicker.utils";
