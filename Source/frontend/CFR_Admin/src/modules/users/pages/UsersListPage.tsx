import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge, Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '../../lib/confirm';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { deleteUser, getUsers, updateUserStatus } from '../services/usersService';
import type { UsersApiItem } from '../types/usersTypes';
import { normalizeUsersList } from '../utils/usersHelpers';

export function UsersListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  //#endregion

  //#region States
  const [rows, setRows] = useState<UsersApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region Functions
  const load = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getUsers();
      setRows(statusCode === 204 ? [] : normalizeUsersList(resultData));
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    void load();
  }, [load]);
  //#endregion

  //#region Handlers
  const handleToggleStatus = useCallback(async (user: UsersApiItem) => {
    const nextIsActive = user.isActive === 1 ? 0 : 1;
    if (nextIsActive === 0) {
      const confirmed = await confirmAction({
        title: 'Deactivate user?',
        description: `${user.fullName} will lose access to their account.`,
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    try {
      await updateUserStatus(user.userId, nextIsActive);
      showToast(nextIsActive === 1 ? `${user.fullName} activated.` : `${user.fullName} deactivated.`);
      await load();
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast(nextIsActive === 1 ? 'Failed to activate user.' : 'Failed to deactivate user.');
    }
  }, [load, showToast]);

  const handleDelete = useCallback(async (user: UsersApiItem) => {
    const confirmed = await confirmAction({
      title: 'Delete this user?',
      description: `${user.fullName} will be removed and will no longer be able to sign in.`,
      confirmLabel: 'Delete user',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteUser(user.userId);
      showToast(`${user.fullName} deleted.`);
      await load();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to delete user.');
    }
  }, [load, showToast]);
  //#endregion

  //#region Columns
  const columns: DataTableColumn<UsersApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7.5rem',
      excludeFromExport: true,
      cell: (user) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton
            aria-label={`Edit ${user.fullName}`}
            tooltip="Edit"
            icon={<Pencil size={14} />}
            onClick={() => navigate('/admin/edit-users', { state: { id: user.userId } })}
          />
          <CommonIconButton
            aria-label={user.isActive === 1 ? `Deactivate ${user.fullName}` : `Activate ${user.fullName}`}
            tooltip={user.isActive === 1 ? 'Deactivate' : 'Activate'}
            variant={user.isActive === 1 ? 'danger' : 'ghost'}
            icon={<Power size={15} />}
            onClick={() => void handleToggleStatus(user)}
          />
          <CommonIconButton
            aria-label={`Delete ${user.fullName}`}
            tooltip="Delete"
            variant="danger"
            icon={<Trash2 size={14} />}
            onClick={() => void handleDelete(user)}
          />
        </div>
      ),
    },
    {
      id: 'username',
      header: 'Username',
      width: '12rem',
      value: (user) => user.fullName,
      cell: (user) => <span className="font-bold text-[var(--text-primary)]">{user.fullName}</span>,
    },
    {
      id: 'email',
      header: 'Email',
      width: '16rem',
      value: (user) => user.eMail,
      cell: (user) => <span className="text-[var(--text-secondary)]">{user.eMail}</span>,
    },
    { id: 'role', header: 'Role', value: (user) => user.roleName, cell: (user) => <span className="capitalize text-[var(--text-secondary)]">{user.roleName}</span> },
    { id: 'dob', header: 'Date of birth', value: (user) => user.dateOfBirth ?? '—', cell: (user) => <span className="text-[var(--text-muted)]">{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    { id: 'locked', header: 'Locked', value: (user) => (user.isLocked === 1 ? 'Locked' : 'Unlocked'), cell: (user) => <Badge tone={user.isLocked === 1 ? 'danger' : 'success'}>{user.isLocked === 1 ? 'Locked' : 'Unlocked'}</Badge> },
    { id: 'lastActive', header: 'Last Active', value: (user) => user.lastActiveAt ?? '—', cell: (user) => <span className="text-[var(--text-muted)]">{user.lastActiveAt ? formatDateTime(user.lastActiveAt) : '—'}</span> },
  ], [handleDelete, handleToggleStatus, navigate]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Users"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => navigate('/admin/add-users')}>Add User</CommonButton>}
      />

      {!loading && rows.length === 0 ? (
        <EmptyState icon="🙍" title="No users found" description="Add a user to get started." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(user) => String(user.userId)}
          exportFileName="catholic-solutions-users"
          exportTitle="Catholic Solutions — Users"
          emptyMessage="No users found."
        />
      )}
    </div>
  );
  //#endregion
}

export default UsersListPage;
