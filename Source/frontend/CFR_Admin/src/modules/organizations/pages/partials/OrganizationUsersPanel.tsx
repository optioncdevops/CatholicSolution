import { useState } from 'react';
import { Mail, Phone, Trash2, User } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonIconButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import { unlinkOrganizationUser } from '../../services/organizationsService';
import type { OrganizationApiItem, OrganizationUserApiItem } from '../../types/organizationTypes';

const columns = (onUnlink: (user: OrganizationUserApiItem) => void, unlinkingUserId: number | null): DataTableColumn<OrganizationUserApiItem>[] => [
  {
    id: 'email', header: 'Email', width: '16rem',
    value: (user) => user.email,
    cell: (user) => <span className="font-bold text-[var(--text-primary)]">{user.email}</span>,
  },
  {
    id: 'memberStatus', header: 'Status',
    value: (user) => user.memberStatus ?? '',
    cell: (user) => <Badge tone={user.memberStatus === 'active' ? 'success' : 'neutral'}>{user.memberStatus || '—'}</Badge>,
  },
  {
    id: 'linkedDate', header: 'Linked On',
    value: (user) => user.linkedDate,
    cell: (user) => <span className="text-[var(--text-muted)]">{formatDate(user.linkedDate)}</span>,
  },
  {
    id: 'actions', header: 'Actions', width: '4rem', excludeFromExport: true, sortable: false,
    cell: (user) => (
      <CommonIconButton
        aria-label={`Remove ${user.email}`}
        tooltip="Remove"
        variant="danger"
        icon={<Trash2 size={14} />}
        onClick={() => onUnlink(user)}
        disabled={unlinkingUserId === user.authUserId}
      />
    ),
  },
];

function ContactDetail({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]" aria-hidden="true">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.625rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
        <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

type OrganizationUsersPanelProps = {
  orgId: number;
  organization: OrganizationApiItem;
  users: OrganizationUserApiItem[];
  onChanged: () => Promise<void> | void;
};

// View + remove only — linking a user to an organization from here has been removed.
const OrganizationUsersPanel = ({ orgId, organization, users, onChanged }: OrganizationUsersPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [unlinkingUserId, setUnlinkingUserId] = useState<number | null>(null);
  //#endregion

  //#region Handlers
  const handleUnlink = async (user: OrganizationUserApiItem) => {
    const confirmed = await confirmAction({
      title: 'Remove this user?',
      description: `${user.email} will lose access to ${organization.orgName}.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;

    setUnlinkingUserId(user.authUserId);
    try {
      await unlinkOrganizationUser(orgId, user.authUserId);
      showToast(`${user.email} removed from ${organization.orgName}.`, 'success');
      await onChanged();
    } catch (error) {
      console.error('Error unlinking user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to remove user.', 'error');
    } finally {
      setUnlinkingUserId(null);
    }
  };
  //#endregion

  const hasPrimaryContact = Boolean(organization.contactPerson || organization.contactPhone || organization.contactEmail);

  return (
    <div className="flex flex-col gap-4">
      {hasPrimaryContact ? (
        <section className="admin-panel-card">
          <div className="admin-panel-card__header"><h2 className="panel-title">Primary Contact</h2></div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <ContactDetail icon={User} label="Contact Person" value={organization.contactPerson} />
            <ContactDetail icon={Phone} label="Contact Number" value={organization.contactPhone} />
            <ContactDetail icon={Mail} label="Contact Email" value={organization.contactEmail} />
          </div>
        </section>
      ) : null}

      <section className="admin-panel-card">
        <div className="admin-panel-card__header"><h2 className="panel-title">Linked Users</h2></div>

        <div className="p-4">
          {users.length === 0 ? (
            <EmptyState icon="👥" title="No users linked" description="Users linked to this organization will appear here." />
          ) : (
            <DataTable
              data={users}
              columns={columns(handleUnlink, unlinkingUserId)}
              getRowId={(user) => String(user.authUserId)}
              exportFileName="organization-users"
              exportTitle="Organization — Users"
              emptyMessage="No users found."
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default OrganizationUsersPanel;
