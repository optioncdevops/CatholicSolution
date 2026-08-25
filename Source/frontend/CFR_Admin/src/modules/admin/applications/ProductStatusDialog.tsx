import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { confirmAction } from '../lib/confirm';
import { STATUS_IMPACT } from './productValidation';
import type { AdminApplication, ProductStatus } from '../types';

const STATUS_OPTIONS: ProductStatus[] = ['active', 'inactive', 'coming-soon'];

interface ProductStatusDialogProps {
  app: AdminApplication | null;
  onClose: () => void;
  onConfirm: (status: ProductStatus) => void;
  pendingStatus: ProductStatus | null;
  onSelectStatus: (status: ProductStatus | null) => void;
}

export function ProductStatusDialog({ app, onClose, onConfirm, pendingStatus, onSelectStatus }: ProductStatusDialogProps) {
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!app) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    firstOptionRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [app, onClose]);

  if (!app) return null;

  const commitStatusChange = async () => {
    if (!pendingStatus) return;
    const confirmed = await confirmAction({
      title: `Set status to "${pendingStatus.replace('-', ' ')}"?`,
      description: STATUS_IMPACT[pendingStatus],
      confirmLabel: 'Confirm status change',
      tone: pendingStatus === 'inactive' ? 'danger' : 'primary',
    });
    if (confirmed) onConfirm(pendingStatus);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/40 p-4 motion-safe:animate-[fade-in_120ms_ease-out]" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevated)] motion-safe:animate-[pop-in_140ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="status-dialog-title" className="font-display text-base font-extrabold text-[var(--text-primary)]">Change Status — {app.name}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">Current Status <StatusBadge status={app.status} kind="application" /></p>

        <fieldset className="mt-4 flex flex-col gap-2">
          <legend className="sr-only">New Status</legend>
          {STATUS_OPTIONS.map((status, index) => {
            const isCurrent = status === app.status;
            const isSelected = pendingStatus === status;
            return (
              <button
                key={status}
                ref={index === 0 ? firstOptionRef : undefined}
                type="button"
                onClick={() => onSelectStatus(status)}
                disabled={isCurrent}
                aria-pressed={isSelected}
                className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  isSelected ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--line)] hover:bg-[var(--hover)]'
                }`}
              >
                <StatusBadge status={status} kind="application" />
                {isCurrent ? <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Current</span> : null}
              </button>
            );
          })}
        </fieldset>

        <div className="mt-5 flex justify-end gap-2">
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" disabled={!pendingStatus} onClick={() => void commitStatusChange()}>Continue</CommonButton>
        </div>
      </section>
    </div>,
    document.body,
  );
}
