import React from "react";
import { cn } from "@app/utilities/cn";
import { themeRequiredMarkClass } from "@designSystem/theme/styles/componentStyle";

interface MandatoryIndicatorProps {
  /** Extra CSS classes for the wrapper. */
  className?: string;
  /**
   * When placed on a dark/brand header, use "brand" to switch
   * to white-friendly colors.
   * @default "default"
   */
  variant?: "default" | "brand";
  /**
   * Horizontal placement when the indicator is a full-width body row.
   * Dialogs / form shells with `showMandatory` use {@link FormBodyMandatoryLegend}.
   * @default "start"
   */
  align?: "start" | "end";
}

/**
 * Shared "* indicates a required field" copy.
 * Prefer {@link FormBodyMandatoryLegend} inside modals / form bodies so titles
 * are not truncated by header actions.
 */
const MandatoryIndicator: React.FC<MandatoryIndicatorProps> = ({
  className,
  variant = "default",
  align = "start",
}) => {
  const isBrand = variant === "brand";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center whitespace-nowrap text-xs",
        align === "end" ? "w-full justify-end" : "inline-flex justify-start",
        isBrand ? "text-white/80" : "text-[var(--text-muted)]",
        className,
      )}
    >
      <span className={cn("mr-1", isBrand ? "font-bold text-white" : themeRequiredMarkClass)}>*</span>{" "}
      indicates a required field
    </div>
  );
};

/**
 * Common body placement for required-field legend (top-right above form fields).
 * Used by BaseModal / YardFormCard `showMandatory` and any dialog body that
 * should match that layout.
 */
export function FormBodyMandatoryLegend({
  className,
}: {
  className?: string;
}) {
  return (
    <MandatoryIndicator align="end" className={cn("mb-3", className)} />
  );
}

export default MandatoryIndicator;
