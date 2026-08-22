/** Maps named icon sizes (and legacy pixel values) to a pixel size for `lucide-react`. */

export type AppIconSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "header"
  /** Top-nav / sidebar submenu group row (icon + label). */
  | "menuMain"
  /** Flyout leaf row or nested child item. */
  | "menuChild"
  /** Chevron / arrow inside menu rows. */
  | "menuChevron"
  /** More overflow trigger ellipsis. */
  | "menuMore"
  | "controlChevron"
  | "controlClear"
  | "controlField";

export const APP_ICON_SIZE_PX: Record<AppIconSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  header: 15,
  menuMain: 13,
  menuChild: 12,
  menuChevron: 10,
  menuMore: 12,
  /** Prefix/suffix, calendar, clock, search, password toggle inside fields. */
  controlField: 13,
  controlChevron: 12,
  controlClear: 12,
};

/** Convert a legacy numeric pixel size to the nearest named `AppIconSize`. */
export function pixelSizeToAppIconSize(size: number): AppIconSize {
  if (size <= 10) {return "xs";}
  if (size <= 12) {return "sm";}
  if (size <= 14) {return "md";}
  if (size <= 16) {return "lg";}
  if (size <= 18) {return "xl";}
  if (size <= 22) {return "2xl";}
  return "3xl";
}

export function resolveAppIconSize(
  size?: AppIconSize | number,
  fallback: AppIconSize = "md",
): AppIconSize {
  if (size === undefined) {return fallback;}
  if (typeof size === "number") {return pixelSizeToAppIconSize(size);}
  return size;
}

/** Resolve a size prop directly to the pixel value `lucide-react` expects. */
export function resolveAppIconPx(size?: AppIconSize | number, fallback: AppIconSize = "md"): number {
  if (typeof size === "number") {return size;}
  return APP_ICON_SIZE_PX[resolveAppIconSize(size, fallback)];
}
