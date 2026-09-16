import { useState } from "react";
import { EntityAvatar } from "@app/components/EntityAvatar";
import { resolveProductLogoUrl } from "../utils/productHelpers";
import { cn } from "@app/utilities/cn";

export function isImageIcon(icon: string): boolean {
  if (!icon) return false;
  return (
    icon.startsWith("data:") ||
    icon.startsWith("blob:") ||
    icon.startsWith("/") ||
    /^https?:\/\//i.test(icon)
  );
}

export interface ProductIconProps {
  icon?: string | null;
  src?: string | null;
  name: string;
  gradient?: string;
  size?: number;
  className?: string;
}

export function ProductIcon({
  icon,
  src,
  name,
  size = 36,
  className,
}: ProductIconProps) {
  const [hasError, setHasError] = useState(false);

  const rawIcon = icon ?? src ?? "";

  // Prop-driven reset, adjusted during render rather than in an effect (React's own recommended
  // pattern for "state that resets when a prop identity changes") — a new `icon` deserves a fresh
  // attempt, not the previous icon's stale error flag.
  const [renderedForIcon, setRenderedForIcon] = useState(rawIcon);
  if (renderedForIcon !== rawIcon) {
    setRenderedForIcon(rawIcon);
    setHasError(false);
  }

  const isImage =
    Boolean(rawIcon) &&
    (isImageIcon(rawIcon) || (!rawIcon.includes("📦") && rawIcon.length > 2));

  const resolved = isImage && rawIcon
    ? rawIcon.startsWith("data:") ||
      rawIcon.startsWith("blob:") ||
      /^https?:\/\//i.test(rawIcon)
      ? rawIcon
      : resolveProductLogoUrl(rawIcon) || rawIcon
    : null;

  if (resolved && !hasError) {
    return (
      <img
        src={resolved}
        alt=""
        onError={() => setHasError(true)}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-lg object-cover", className)}
        aria-hidden="true"
      />
    );
  }

  return className ? (
    <span className={className}>
      <EntityAvatar name={name} size={size} square />
    </span>
  ) : (
    <EntityAvatar name={name} size={size} square />
  );
}
