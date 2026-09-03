import { useEffect, useState } from 'react';
import { Mail, Phone, Plus, Trash2, User } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown } from '@app/components/formControls';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import { getLinkableUsers, linkOrganizationUser, unlinkOrganizationUser } from '../../services/organizationsService';
import type { LinkableUserApiItem, OrganizationApiItem, OrganizationUserApiItem } from '../../types/organizationTypes';

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

// Linking is the only way anywhere in the app that populates auth.OrganizationUser — a user
// must already have a real account (created via the Users module) before they can be linked
// here; this panel does not create accounts, only the org membership link.
const OrganizationUsersPanel = ({ orgId, organization, users, onChanged }: OrganizationUsersPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkableUsers, setLinkableUsers] = useState<LinkableUserApiItem[]>([]);
  const [linkableUsersLoading, setLinkableUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [linking, setLinking] = useState(false);
  const [unlinkingUserId, setUnlinkingUserId] = useState<number | null>(null);
  //#endregion

  //#region Effects
  // Loaded fresh each time the modal opens, so a user linked/unlinked elsewhere (or the org's
  // own linked-users refresh) is always reflected in the dropdown, not a stale snapshot.
  useEffect(() => {
    if (!linkModalOpen) return undefined;
    let cancelled = false;
    void (async () => {
      setLinkableUsersLoading(true);
      try {
        const { resultData, statusCode } = await getLinkableUsers(orgId);
        if (cancelled) return;
        setLinkableUsers(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as LinkableUserApiItem[]);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading linkable users:', error);
        showToast('Failed to load users available to link.', 'error');
      } finally {
        if (!cancelled) setLinkableUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkModalOpen, orgId, showToast]);
  //#endregion

  //#region Handlers
  const openLinkModal = () => {
    setSelectedUserId('');
    setLinkModalOpen(true);
  };

  const handleLink = async () => {
    if (!selectedUserId) return;
    const user = linkableUsers.find((item) => String(item.authUserId) === selectedUserId);
    setLinking(true);
    try {
      await linkOrganizationUser({ orgId, authUserId: Number(selectedUserId) });
      showToast(`${user?.email ?? 'User'} linked to ${organization.orgName}.`, 'success');
      setLinkModalOpen(false);
      await onChanged();
    } catch (error) {
      console.error('Error linking user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to link user.', 'error');
    } finally {
      setLinking(false);
    }
  };

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
        <div className="admin-panel-card__header flex items-center justify-between">
          <h2 className="panel-title">Linked Users</h2>
          <CommonButton variant="outline" size="sm" iconLeft={<Plus size={14} />} onClick={openLinkModal}>Link User</CommonButton>
        </div>

        <div className="p-4">
          {users.length === 0 ? (
            <EmptyState icon="👥" title="No users linked" description={'Click "Link User" above to give someone membership in this organization.'} />
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

      <BaseModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Link User to Organization"
        size="sm"
        footer={(
          <>
            <CommonButton variant="outline" onClick={() => setLinkModalOpen(false)} disabled={linking}>Cancel</CommonButton>
            <CommonButton variant="primary" iconLeft={<Plus size={14} />} onClick={() => void handleLink()} loading={linking} disabled={!selectedUserId || linking}>Link User</CommonButton>
          </>
        )}
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            Only users who already have an account in the Users module can be linked here — this adds them as a member of {organization.orgName}, it does not create a new account.
          </p>
          <Dropdown
            label="User"
            searchable
            clearable={false}
            value={selectedUserId || undefined}
            onValueChange={(value) => setSelectedUserId(value ?? '')}
            options={linkableUsers.map((user) => ({ id: String(user.authUserId), value: user.email }))}
            placeholder={linkableUsersLoading ? 'Loading users…' : linkableUsers.length === 0 ? 'No other users available to link' : 'Select a user…'}
            disabled={linking || linkableUsersLoading || linkableUsers.length === 0}
          />
        </div>
      </BaseModal>
    </div>
  );
};

export default OrganizationUsersPanel;
