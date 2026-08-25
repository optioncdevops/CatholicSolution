import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, title, description, onClose, children, footer }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/30 motion-safe:animate-[fade-in_140ms_ease-out]" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-elevated)] motion-safe:animate-[slide-in-right_180ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-4">
          <div className="min-w-0">
            <h2 id="admin-drawer-title" className="font-display text-sm font-extrabold text-[var(--text-primary)]">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--hover)]"
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="flex items-center justify-end gap-2 border-t border-[var(--line-soft)] px-5 py-3">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
