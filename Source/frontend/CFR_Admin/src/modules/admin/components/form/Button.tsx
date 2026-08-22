import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:border-[var(--primary-hover)]',
  secondary: 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--text-faint)] hover:bg-[var(--hover)] hover:text-[var(--primary)]',
  danger: 'border-[var(--error)] bg-[var(--surface)] text-[var(--error)] hover:bg-[var(--error-bg)]',
  ghost: 'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({ variant = 'secondary', icon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex min-h-[var(--admin-control-height)] items-center justify-center gap-1.5 rounded-[var(--admin-control-radius)] border px-3 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: 'default' | 'danger';
}

/** Icon-only action button — always requires an accessible label and shows a native tooltip. */
export function IconButton({ label, tone = 'default', className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
        tone === 'danger'
          ? 'text-[var(--text-secondary)] hover:bg-[var(--error-bg)] hover:text-[var(--error)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--primary)]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
