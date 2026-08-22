import { APP_ICONS, isAppIconName, type AppIconName } from "./appIcons";
import { resolveAppIconPx, type AppIconSize } from "./iconSize";

export interface AppIconProps {
  name: AppIconName | (string & {});
  size?: AppIconSize | number;
  className?: string;
  /** Shorthand for aria-hidden on decorative icons */
  decorative?: boolean;
  title?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * Thin `lucide-react` wrapper keyed by the reference project's `AppIconName` map, so the
 * ported dataTable/formControls code (which calls `<AppIcon name="..." />`) keeps working
 * against CFR_Admin's own icon library convention (`lucide-react`) instead of a second,
 * foreign Font-Awesome-based icon system.
 */
export function AppIcon({
  name,
  size,
  className,
  decorative = false,
  title,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: AppIconProps) {
  const px = resolveAppIconPx(size, "md");
  const Icon = isAppIconName(name) ? APP_ICONS[name] : undefined;

  if (!Icon) {
    return null;
  }

  const hidden = ariaHidden ?? (decorative ? true : undefined);

  return (
    <Icon
      size={px}
      className={className}
      aria-hidden={hidden}
      aria-label={ariaLabel ?? title}
      {...(title ? { role: "img" } : {})}
    >
      {title ? <title>{title}</title> : null}
    </Icon>
  );
}

export type { AppIconName, AppIconSize };
