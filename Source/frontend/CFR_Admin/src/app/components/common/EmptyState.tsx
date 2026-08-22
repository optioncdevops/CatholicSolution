import React from "react";
import { cn } from "@app/utilities/cn";
import { AppIcon, type AppIconName } from "../icons";

// ── Types ────────────────────────────────────────────────────────────

export type EmptyStateVariant = "default" | "card" | "minimal" | "table";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps {
  /** Icon displayed inside the circular holder */
  icon?: AppIconName;
  /** Primary title — short and descriptive (e.g. "No records found") */
  title?: string;
  /** Secondary description giving context or guidance */
  description?: string;
  /** @deprecated Use `title` instead. Kept for backward-compatibility. */
  message?: string;
  /** Optional CTA element (button, link, etc.) rendered below the text */
  action?: React.ReactNode;
  /**
   * `"default"` – dashed border, soft surface (tables / content areas)
   * `"card"`    – solid border, card surface, subtle shadow (standalone)
   * `"minimal"` – transparent, compact (side panels / small sections)
   * `"table"`   – full-width, no border (inside table body cells)
   */
  variant?: EmptyStateVariant;
  /** Controls overall height, icon size, and text scale */
  size?: EmptyStateSize;
  /** Extra Tailwind classes on the outermost wrapper */
  className?: string;
}

// ── Variant × slot style map — adapted to CFR_Admin's admin theme tokens ──

interface SlotClasses {
  container: string;
  iconWrap: string;
  title: string;
  description: string;
}

const variantStyles: Record<EmptyStateVariant, SlotClasses> = {
  default: {
    container: "rounded-[var(--radius-panel)] border border-dashed border-[var(--line)] bg-[var(--surface-muted)]/60",
    iconWrap: "bg-[var(--primary-muted)] text-[var(--primary)] ring-1 ring-[var(--line)]",
    title: "text-[var(--text-primary)]",
    description: "text-[var(--text-muted)]",
  },
  card: {
    container: "rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]",
    iconWrap: "bg-[var(--primary-muted)] text-[var(--primary)] ring-1 ring-[var(--line)] shadow-[var(--shadow-soft)]",
    title: "text-[var(--text-primary)]",
    description: "text-[var(--text-muted)]",
  },
  minimal: {
    container: "bg-transparent",
    iconWrap: "bg-[var(--primary-muted)] text-[var(--primary)]",
    title: "text-[var(--text-secondary)]",
    description: "text-[var(--text-muted)]",
  },
  table: {
    container: "rounded-[var(--radius-control)] bg-[var(--surface-muted)]/40",
    iconWrap: "bg-[var(--primary-muted)] text-[var(--primary)] ring-1 ring-[var(--line)]",
    title: "text-[var(--text-secondary)]",
    description: "text-[var(--text-muted)]",
  },
};

// ── Size presets ─────────────────────────────────────────────────────

interface SizePreset {
  container: string;
  iconWrap: string;
  iconPx: number;
  title: string;
  description: string;
  gap: string;
  textGap: string;
}

const sizeStyles: Record<EmptyStateSize, SizePreset> = {
  sm: {
    container: "min-h-[100px] px-4 py-5",
    iconWrap: "h-9 w-9",
    iconPx: 16,
    title: "text-xs",
    description: "text-[10px] leading-relaxed",
    gap: "gap-2.5",
    textGap: "gap-0.5",
  },
  md: {
    container: "min-h-[160px] px-6 py-7",
    iconWrap: "h-11 w-11",
    iconPx: 20,
    title: "text-[13px]",
    description: "text-xs leading-relaxed",
    gap: "gap-3",
    textGap: "gap-1",
  },
  lg: {
    container: "min-h-[240px] px-8 py-10",
    iconWrap: "h-14 w-14",
    iconPx: 26,
    title: "text-base",
    description: "text-sm leading-relaxed",
    gap: "gap-4",
    textGap: "gap-1.5",
  },
};

// ── Component ────────────────────────────────────────────────────────

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: iconName = "inbox",
  title,
  description,
  message,
  action,
  variant = "default",
  size = "md",
  className,
}) => {
  const displayTitle = title ?? message;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <section
      role="status"
      aria-label={displayTitle ?? "Empty state"}
      className={cn("flex flex-col items-center justify-center text-center", s.container, s.gap, v.container, className)}
    >
      <div className={cn("flex items-center justify-center rounded-full", s.iconWrap, v.iconWrap)} aria-hidden="true">
        <AppIcon name={iconName} size={s.iconPx} decorative />
      </div>

      {(displayTitle || description) && (
        <div className={cn("flex flex-col items-center max-w-xs", s.textGap)}>
          {displayTitle && <h3 className={cn("font-semibold leading-snug", s.title, v.title)}>{displayTitle}</h3>}
          {description && <p className={cn(s.description, v.description)}>{description}</p>}
        </div>
      )}

      {action && <div className="mt-1">{action}</div>}
    </section>
  );
};

export default EmptyState;
