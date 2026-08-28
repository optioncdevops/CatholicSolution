import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Power } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '../../lib/confirm';
import { formatDate } from '../../utils/formatDate';
import UserFormModal from './partials/UserFormModal';
import { getUsers, updateUserStatus } from '../services/usersService';
import type { UsersApiItem, UserStatusValue } from '../types/usersTypes';
import { normalizeUsersList } from '../utils/usersHelpers';

const STATUS_FILTERS: Array<{ id: UserStatusValue | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' }, { id: 'active', label: 'Active' }, { id: 'invited', label: 'Invited' }, { id: 'deactivated', label: 'Deactivated' },
];

export function UsersListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  //#endregion

  //#region States
  const [rows, setRows] = useState<UsersApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UserStatusValue | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);
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
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getUsers();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeUsersList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading users:', error);
        showToast('Failed to load users.');
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);
  //#endregion

  //#region Handlers
  const handleToggleStatus = useCallback(async (user: UsersApiItem) => {
    if (user.status === 'deactivated') {
      try {
        await updateUserStatus(user.userId, 'active');
        showToast(`${user.fullName} activated ✓`);
        await load();
      } catch (error) {
        console.error('Error activating user:', error);
        showToast('Failed to activate user.');
      }
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate user?',
      description: `${user.fullName} will lose access to their account.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await updateUserStatus(user.userId, 'deactivated');
      showToast(`${user.fullName} deactivated`);
      await load();
    } catch (error) {
      console.error('Error deactivating user:', error);
      showToast('Failed to deactivate user.');
    }
  }, [load, showToast]);
  //#endregion

  //#region Columns
  const filteredRows = useMemo(() => rows.filter((user) => statusFilter === 'all' || user.status === statusFilter), [rows, statusFilter]);

  const columns: DataTableColumn<UsersApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7rem',
      excludeFromExport: true,
      cell: (user) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton aria-label={`View ${user.fullName}`} icon={<Eye size={15} />} onClick={() => navigate(`/admin/users/${user.userId}`)} />
          <CommonIconButton
            aria-label={user.status === 'deactivated' ? `Activate ${user.fullName}` : `Deactivate ${user.fullName}`}
            variant={user.status === 'deactivated' ? 'ghost' : 'danger'}
            icon={<Power size={15} />}
            onClick={() => void handleToggleStatus(user)}
          />
        </div>
      ),
    },
    {
      id: 'name', header: 'User', width: '16rem',
      value: (user) => `${user.fullName} (${user.eMail})`,
      cell: (user) => (
        <button type="button" onClick={() => navigate(`/admin/users/${user.userId}`)} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
          <EntityAvatar name={user.fullName} />
          <span>
            <span className="block">{user.fullName}</span>
            <span className="block text-xs font-semibold text-[var(--text-muted)]">{user.eMail}</span>
          </span>
        </button>
      ),
    },
    { id: 'org', header: 'Organization', value: (user) => user.organizationName ?? '—', cell: (user) => <span className="text-[var(--text-secondary)]">{user.organizationName ?? '—'}</span> },
    { id: 'role', header: 'Role', value: (user) => user.roleName, cell: (user) => <span className="capitalize text-[var(--text-secondary)]">{user.roleName}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    { id: 'lastActive', header: 'Last Active', value: (user) => user.lastActiveAt ?? '—', cell: (user) => <span className="text-[var(--text-muted)]">{user.lastActiveAt ? formatDate(user.lastActiveAt) : '—'}</span> },
  ], [handleToggleStatus, navigate]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Users"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => setAddOpen(true)}>Add User</CommonButton>}
      />

      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? rows.length : rows.filter((user) => user.status === filter.id).length;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`admin-filter-chip ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="🙍" title="No users found" description="Try a different status filter." />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(user) => String(user.userId)}
          exportFileName="catholic-solutions-users"
          exportTitle="Catholic Solutions — Users"
          emptyMessage="No users found."
        />
      )}

      <UserFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </div>
  );
  //#endregion
}

export default UsersListPage;
