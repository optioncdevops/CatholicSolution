import { BaseModal } from '@app/components/modal/BaseModal';
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

  return (
    <BaseModal
      isOpen={Boolean(app)}
      onClose={onClose}
      title={app ? `Change Status — ${app.name}` : ''}
      size="sm"
      closeOnOverlayClick={false}
      autoFocus={false}
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" disabled={!pendingStatus} onClick={() => void commitStatusChange()}>Continue</CommonButton>
        </>
      )}
    >
      {app ? (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">New Status</legend>
            {STATUS_OPTIONS.map((status) => {
              const isCurrent = status === app.status;
              const isSelected = pendingStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onSelectStatus(status)}
                  disabled={isCurrent}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                    isSelected || isCurrent ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--line)] hover:bg-[var(--hover)]'
                  }`}
                >
                  <StatusBadge status={status} kind="application" />
                  {isCurrent ? <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Current</span> : null}
                </button>
              );
            })}
          </fieldset>
        </div>
      ) : null}
    </BaseModal>
  );
}
