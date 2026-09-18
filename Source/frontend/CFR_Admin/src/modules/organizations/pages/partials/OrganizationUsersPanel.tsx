import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import { unlinkOrganizationUser } from '../../services/organizationsService';
import type { OrganizationApiItem, OrganizationUserApiItem } from '../../types/organizationTypes';

type ScopedOrgUser = OrganizationUserApiItem & { orgId?: number; orgName?: string };

const columns = (
  onView: (user: ScopedOrgUser) => void,
  onUnlink: (user: ScopedOrgUser) => void,
  unlinkingUserId: number | null,
  readOnly: boolean,
  showRoleColumn: boolean,
  showLinkedOnColumn: boolean,
  showActionsColumn: boolean,
  showOrganizationColumn: boolean,
): DataTableColumn<ScopedOrgUser>[] => [
  {
    id: 'fullName', header: 'User', width: '16rem',
    value: (user) => user.fullName || user.email,
    cell: (user) => (
      <button
        type="button"
        onClick={() => onView(user)}
        className="min-w-0 text-left hover:underline"
        aria-label={`View ${user.fullName || user.email}`}
      >
        <span className="truncate font-bold text-[var(--text-primary)]">{user.fullName || user.email}</span>
      </button>
    ),
  },
  {
    id: 'email', header: 'Email',
    value: (user) => user.email,
    cell: (user) => <span className="text-[var(--text-secondary)]">{user.email}</span>,
  },
  ...(showRoleColumn ? [{
    id: 'role', header: 'Role',
    value: (user: ScopedOrgUser) => user.roleName ?? '',
    cell: (user: ScopedOrgUser) => <span className="text-[var(--text-secondary)]">{user.roleName || '—'}</span>,
  } as DataTableColumn<ScopedOrgUser>] : []),
  {
    id: 'memberStatus', header: 'Membership',
    value: (user) => user.memberStatus ?? '',
    cell: (user) => <StatusBadge status={user.memberStatus || 'inactive'} kind="user" />,
  },
  ...(showOrganizationColumn ? [{
    id: 'orgName', header: 'Organization',
    value: (user: ScopedOrgUser) => user.orgName ?? '',
    cell: (user: ScopedOrgUser) => <span className="text-[var(--text-secondary)]">{user.orgName || '—'}</span>,
  } as DataTableColumn<ScopedOrgUser>] : []),
  {
    id: 'appAccess', header: 'App Access', width: '18rem',
    value: (user) => user.appNames ?? '',
    cell: (user) => {
      const apps = user.appNames ? user.appNames.split(', ').filter(Boolean) : [];
      if (apps.length === 0) return <span className="text-[var(--text-faint)]">No app access</span>;
      // Every app is shown — no "+N more" truncation, since that had no way to expand it.
      // Chips wrap onto additional lines within the cell instead of being hidden.
      return (
        <span className="flex flex-wrap items-center gap-1 py-1">
          {apps.map((app) => (
            <span key={app} className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--text-secondary)]">
              {app}
            </span>
          ))}
        </span>
      );
    },
  },
  {
    id: 'lastActive', header: 'Last Active',
    value: () => '',
    cell: () => <span className="text-[var(--text-faint)]" title="This platform does not yet track member sign-in timestamps.">Not tracked</span>,
  },
  ...(showLinkedOnColumn ? [{
    id: 'linkedDate', header: 'Linked On',
    value: (user: ScopedOrgUser) => user.linkedDate,
    cell: (user: ScopedOrgUser) => <span className="text-[var(--text-muted)]">{formatDate(user.linkedDate)}</span>,
  } as DataTableColumn<ScopedOrgUser>] : []),
  ...(showActionsColumn ? [{
    id: 'actions', header: 'Actions', width: '5.5rem', excludeFromExport: true, sortable: false,
    cell: (user: ScopedOrgUser) => (
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
          disabled={unlinkingUserId === user.authUserId || readOnly}
        />
      </div>
    ),
  } as DataTableColumn<ScopedOrgUser>] : []),
];

type OrganizationUsersPanelProps = {
  orgId?: number;
  organization?: OrganizationApiItem;
  users: ScopedOrgUser[];
  onChanged: () => Promise<void> | void;
  readOnly?: boolean;
  showRoleColumn?: boolean;
  showLinkedOnColumn?: boolean;
  showActionsColumn?: boolean;
  showOrganizationColumn?: boolean;
  exportFileName?: string;
  exportTitle?: string;
};

// View + unlink only — linking a user to an organization from here has been removed. There is no
// "Edit" action: organization members (auth.UserProduct) are a distinct population from CFR
// Admin's own Users module (auth.AcutisUser, internal staff accounts) and have no editable
// profile fields in this system today. "Role" shows the real auth.UserProduct.RoleId resolved
// against auth.AcutisRole when it matches, or a dash when it doesn't — never fabricated. "Last
// Active" is honestly marked "Not tracked" since member sign-in timestamps aren't recorded
// anywhere in the schema.
const OrganizationUsersPanel = ({
  orgId,
  users,
  onChanged,
  readOnly = false,
  showRoleColumn = true,
  showLinkedOnColumn = true,
  showActionsColumn = true,
  showOrganizationColumn = false,
  exportFileName = 'organization-users',
  exportTitle = 'Organization — Users',
}: OrganizationUsersPanelProps) => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [unlinkingUserId, setUnlinkingUserId] = useState<number | null>(null);
  //#endregion

  //#region Handlers
  // Rows carry their own orgId/orgName when this panel is showing users merged across multiple
  // organizations (the CFR User "All" filter) -- falls back to the panel-level org otherwise.
  const handleView = (user: ScopedOrgUser) => {
    const targetOrgId = user.orgId ?? orgId;
    if (targetOrgId == null) return;
    navigate(`/admin/organizations/${targetOrgId}/members/${user.authUserId}`);
  };

  const handleUnlink = async (user: ScopedOrgUser) => {
    if (readOnly) return;
    const targetOrgId = user.orgId ?? orgId;
    if (targetOrgId == null) return;
    const confirmed = await confirmAction({
      title: 'Unlink this user?',
      description: 'This user will lose membership in this organization and its assigned apps.',
      confirmLabel: 'Unlink',
      tone: 'danger',
    });
    if (!confirmed) return;

    setUnlinkingUserId(user.authUserId);
    try {
      await unlinkOrganizationUser(targetOrgId, user.authUserId);
      showToast('User removed from the organization successfully.', 'success');
      await onChanged();
    } catch (error) {
      console.error('Error unlinking user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to unlink user.', 'error');
    } finally {
      setUnlinkingUserId(null);
    }
  };
  //#endregion

  if (users.length === 0) {
    return <EmptyState icon="👥" title="No users linked" description="Users linked to this organization will appear here." />;
  }

  return (
    <DataTable
      data={users}
      columns={columns(handleView, handleUnlink, unlinkingUserId, readOnly, showRoleColumn, showLinkedOnColumn, showActionsColumn, showOrganizationColumn)}
      getRowId={(user) => String(user.authUserId)}
      exportFileName={exportFileName}
      exportTitle={exportTitle}
      emptyMessage="No users found."
    />
  );
};

export default OrganizationUsersPanel;
