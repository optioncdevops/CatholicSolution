import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import { unlinkOrganizationUser } from '../../services/organizationsService';
import type { OrganizationApiItem, OrganizationUserApiItem } from '../../types/organizationTypes';

const columns = (
  onView: (user: OrganizationUserApiItem) => void,
  onUnlink: (user: OrganizationUserApiItem) => void,
  unlinkingUserId: number | null,
): DataTableColumn<OrganizationUserApiItem>[] => [
  {
    id: 'fullName', header: 'User', width: '16rem',
    value: (user) => user.fullName || user.email,
    cell: (user) => (
      <button
        type="button"
        onClick={() => onView(user)}
        className="flex min-w-0 items-center gap-2.5 text-left hover:underline"
        aria-label={`View ${user.fullName || user.email}`}
      >
        <EntityAvatar name={user.fullName || user.email} size={28} />
        <span className="truncate font-bold text-[var(--text-primary)]">{user.fullName || user.email}</span>
      </button>
    ),
  },
  {
    id: 'email', header: 'Email',
    value: (user) => user.email,
    cell: (user) => <span className="text-[var(--text-secondary)]">{user.email}</span>,
  },
  {
    id: 'role', header: 'Role',
    value: (user) => user.roleName ?? '',
    cell: (user) => <span className="text-[var(--text-secondary)]">{user.roleName || '—'}</span>,
  },
  {
    id: 'memberStatus', header: 'Membership',
    value: (user) => user.memberStatus ?? '',
    cell: (user) => <StatusBadge status={user.memberStatus === 'active' ? 'active' : 'inactive'} kind="user" />,
  },
  {
    id: 'appCount', header: 'Apps',
    value: (user) => user.appCount,
    cell: (user) => <span className="text-[var(--text-secondary)]">{user.appCount}</span>,
  },
  {
    id: 'lastLogin', header: 'Last Login',
    value: () => '',
    cell: () => <span className="text-[var(--text-faint)]" title="This platform does not yet track member sign-in timestamps.">Not tracked</span>,
  },
  {
    id: 'linkedDate', header: 'Linked On',
    value: (user) => user.linkedDate,
    cell: (user) => <span className="text-[var(--text-muted)]">{formatDate(user.linkedDate)}</span>,
  },
  {
    id: 'actions', header: 'Actions', width: '5.5rem', excludeFromExport: true, sortable: false,
    cell: (user) => (
      <div className="flex items-center justify-center gap-1.5">
        <CommonIconButton
          aria-label={`View ${user.fullName || user.email}`}
          tooltip="View"
          variant="secondary"
          icon={<Eye size={14} />}
          onClick={() => onView(user)}
        />
        <CommonIconButton
          aria-label={`Unlink ${user.fullName || user.email}`}
          tooltip="Unlink"
          variant="danger"
          icon={<Trash2 size={14} />}
          onClick={() => onUnlink(user)}
          disabled={unlinkingUserId === user.authUserId}
        />
      </div>
    ),
  },
];

type OrganizationUsersPanelProps = {
  orgId: number;
  organization: OrganizationApiItem;
  users: OrganizationUserApiItem[];
  onChanged: () => Promise<void> | void;
};

// View + unlink only — linking a user to an organization from here has been removed. There is no
// "Edit" action: organization members (auth.UserProduct) are a distinct population from CFR
// Admin's own Users module (auth.AcutisUser, internal staff accounts) and have no editable
// profile fields in this system today. "Role" shows the real auth.UserProduct.RoleId resolved
// against auth.AcutisRole when it matches, or a dash when it doesn't — never fabricated. "Last
// Login" is honestly marked "Not tracked" since member sign-in timestamps aren't recorded
// anywhere in the schema.
const OrganizationUsersPanel = ({ orgId, organization, users, onChanged }: OrganizationUsersPanelProps) => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [unlinkingUserId, setUnlinkingUserId] = useState<number | null>(null);
  //#endregion

  //#region Handlers
  const handleView = (user: OrganizationUserApiItem) => {
    navigate(`/admin/organizations/${orgId}/members/${user.authUserId}`);
  };

  const handleUnlink = async (user: OrganizationUserApiItem) => {
    const confirmed = await confirmAction({
      title: 'Unlink this user?',
      description: `${user.fullName || user.email} will lose membership in ${organization.orgName} and its assigned apps.`,
      confirmLabel: 'Unlink',
      tone: 'danger',
    });
    if (!confirmed) return;

    setUnlinkingUserId(user.authUserId);
    try {
      await unlinkOrganizationUser(orgId, user.authUserId);
      showToast(`${user.fullName || user.email} removed from ${organization.orgName}.`, 'success');
      await onChanged();
    } catch (error) {
      console.error('Error unlinking user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to unlink user.', 'error');
    } finally {
      setUnlinkingUserId(null);
    }
  };
  //#endregion

  return (
    <div className="flex flex-col gap-4">
      <section className="admin-panel-card">
        <div className="admin-panel-card__header"><h2 className="panel-title">Linked Users</h2></div>
        <p className="px-4 pt-3 text-sm text-[var(--text-muted)]">Users linked to this organization can access the applications assigned to the organization.</p>

        <div className="p-4">
          {users.length === 0 ? (
            <EmptyState icon="👥" title="No users linked" description="Users linked to this organization will appear here." />
          ) : (
            <DataTable
              data={users}
              columns={columns(handleView, handleUnlink, unlinkingUserId)}
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
