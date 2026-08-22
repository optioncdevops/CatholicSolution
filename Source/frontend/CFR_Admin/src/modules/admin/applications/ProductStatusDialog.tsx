import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../components/form/Button';
import { StatusBadge } from '../components/Badge';
import { confirmAction } from '../lib/confirm';
import { STATUS_IMPACT } from './productValidation';
import type { AdminApplication, ProductStatus } from '../types';

const STATUS_OPTIONS: ProductStatus[] = ['active', 'inactive', 'coming-soon', 'on-request', 'archived'];

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
      tone: pendingStatus === 'archived' || pendingStatus === 'inactive' ? 'danger' : 'primary',
    });
    if (confirmed) onConfirm(pendingStatus);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/35 p-4 motion-safe:animate-[fade-in_120ms_ease-out]" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        className="w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevated)] motion-safe:animate-[pop-in_140ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="status-dialog-title" className="font-display text-sm font-extrabold text-[var(--text-primary)]">Change status — {app.name}</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Current status: <StatusBadge status={app.status} kind="application" /></p>

        <fieldset className="mt-3 flex flex-col gap-1.5">
          <legend className="sr-only">New status</legend>
          {STATUS_OPTIONS.map((status, index) => (
            <button
              key={status}
              ref={index === 0 ? firstOptionRef : undefined}
              type="button"
              onClick={() => onSelectStatus(status)}
              disabled={status === app.status}
              aria-pressed={pendingStatus === status}
              className={`flex items-center justify-between gap-2 rounded-[var(--radius-control)] border px-3 py-2 text-left text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                pendingStatus === status ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--line)] hover:bg-[var(--hover)]'
              }`}
            >
              <StatusBadge status={status} kind="application" />
              {status === app.status ? <span className="text-[var(--text-faint)]">Current</span> : null}
            </button>
          ))}
        </fieldset>

        {pendingStatus ? (
          <div role="alert" className="mt-3 rounded-[var(--radius-control)] border border-[var(--line-soft)] bg-[var(--surface-muted)] p-3 text-xs leading-6 text-[var(--text-secondary)]">
            <strong className="block text-[var(--text-primary)]">Setting status to "{pendingStatus.replace('-', ' ')}"</strong>
            {STATUS_IMPACT[pendingStatus]}
          </div>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!pendingStatus} onClick={() => void commitStatusChange()}>Continue</Button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
