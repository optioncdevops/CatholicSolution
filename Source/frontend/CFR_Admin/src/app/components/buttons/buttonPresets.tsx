import { AppIcon } from "../icons";
import type { CommonButtonProps } from "./CommonButton";

type ButtonPreset = Pick<CommonButtonProps, "variant" | "tone" | "size" | "iconLeft">;

/**
 * Centralized button presets for common actions. Only the presets actually consumed by
 * the ported dataTable/formControls code are kept (`cancel`, `delete`) — add more here if
 * a newly-ported file needs another preset.
 *
 * @example
 * ```tsx
 * <CommonButton {...BUTTON_PRESETS.cancel} onClick={handleCancel}>Cancel</CommonButton>
 * ```
 */
export const BUTTON_PRESETS = {
  cancel: {
    variant: "outline",
    size: "sm",
    iconLeft: <AppIcon name="x" />,
  },
  delete: {
    variant: "danger",
    size: "sm",
    iconLeft: <AppIcon name="trash2" />,
  },
} as const satisfies Record<string, ButtonPreset>;

export type ButtonPresetKey = keyof typeof BUTTON_PRESETS;
