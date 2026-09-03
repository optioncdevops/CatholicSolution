import { BaseModal } from '@app/components/modal/BaseModal';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { confirmAction } from '@/modules/lib/confirm';
import { ORG_STATUS_OPTIONS } from '../../utils/organizationHelpers';
import type { OrganizationApiItem } from '../../types/organizationTypes';

const STATUS_IMPACT: Record<string, string> = {
  active: 'This organization and its linked users will have normal access to their assigned products.',
  inactive: 'This organization is not currently active — access is paused but no data is removed.',
  suspended: 'Linked users will lose access to this organization\'s assigned products until it is reactivated.',
};

interface OrganizationStatusDialogProps {
  organization: OrganizationApiItem | null;
  onClose: () => void;
  onConfirm: (status: string) => void;
  pendingStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}

export function OrganizationStatusDialog({ organization, onClose, onConfirm, pendingStatus, onSelectStatus }: OrganizationStatusDialogProps) {
  const commitStatusChange = async () => {
    if (!pendingStatus) return;
    const statusLabel = ORG_STATUS_OPTIONS.find((option) => option.id === pendingStatus)?.value ?? pendingStatus;
    const confirmed = await confirmAction({
      title: `Set status to "${statusLabel}"?`,
      description: STATUS_IMPACT[pendingStatus] ?? '',
      confirmLabel: 'Confirm status change',
      tone: pendingStatus === 'suspended' ? 'danger' : 'primary',
    });
    if (confirmed) onConfirm(pendingStatus);
  };

  return (
    <BaseModal
      isOpen={Boolean(organization)}
      onClose={onClose}
      title={organization ? `Change Status — ${organization.orgName}` : ''}
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
      {organization ? (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">New Status</legend>
            {ORG_STATUS_OPTIONS.map((option) => {
              const isCurrent = option.id === organization.orgStatus;
              const isSelected = pendingStatus === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectStatus(option.id)}
                  disabled={isCurrent}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                    isSelected || isCurrent ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--line)] hover:bg-[var(--hover)]'
                  }`}
                >
                  <StatusBadge status={option.id} kind="organization" />
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
