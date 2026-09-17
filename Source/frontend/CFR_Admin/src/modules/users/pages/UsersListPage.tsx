import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FilterX, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge, Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { Dropdown } from '@app/components/formControls';
import { confirmAction } from '../../lib/confirm';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { deleteUser, getUsers, updateUserStatus } from '../services/usersService';
import type { UsersApiItem } from '../types/usersTypes';
import { normalizeUsersList } from '../utils/usersHelpers';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';

const ROLE_FILTER_PARAM = 'roleId';

export function UsersListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  const accessLevel = useFeatureAccessLevel('/admin/users');
  const isReadOnly = accessLevel === 'readOnly';
  const location = useLocation();

  // An admin can never deactivate or delete their own account from this list — the backend
  // rejects it too, but disabling it here avoids a round trip just to hit that guard.
  const currentUserId = getStoredAcutisAuth()?.resultData?.user?.userId ?? null;
  const [searchParams, setSearchParams] = useSearchParams();
  //#endregion

  //#region States
  const [rows, setRows] = useState<UsersApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lockedFilter, setLockedFilter] = useState('');
  //#endregion

  // The Role filter lives in the URL (?roleId=), not local state — bookmarkable/shareable, and
  // lets other pages (User Roles' "Manage Rights"-adjacent Users count) deep-link straight to a
  // specific role, matching how RequestsListPage already treats its own status filter.
  const roleFilter = searchParams.get(ROLE_FILTER_PARAM) ?? '';
  const setRoleFilter = useCallback((next: string) => {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (!next) params.delete(ROLE_FILTER_PARAM);
      else params.set(ROLE_FILTER_PARAM, next);
      return params;
    }, { replace: true });
  }, [setSearchParams]);

  // User Roles' "Users" count column links here with the role passed via router state rather
  // than a query param — fold it into the same URL-based filter on arrival so the Role dropdown
  // above reflects it instead of silently filtering behind an unchanged "All Roles" display.
  useEffect(() => {
    const stateRoleId = (location.state as { roleId?: number } | null)?.roleId;
    if (stateRoleId && !searchParams.get(ROLE_FILTER_PARAM)) {
      setRoleFilter(String(stateRoleId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the state this page was entered with
  }, []);

  //#region Functions
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { resultData, statusCode } = await getUsers();
      const nextRows = statusCode === 204 ? [] : normalizeUsersList(resultData);
      setRows(nextRows);
      setLoadError(null);
      setAnnouncement(nextRows.length === 0 ? 'No users found.' : `${nextRows.length} users loaded.`);
    } catch (error) {
      console.error('Error loading users:', error);
      const message = typeof error === 'string' ? error : 'Failed to load users.';
      // Preserve any previously loaded rows — an unrelated failed refresh should not blank out
      // data the admin was already looking at.
      setLoadError(message);
      showToast(message, 'error');
      setAnnouncement(message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `load` doesn't check a cancellation flag internally, so in the rare case this
    // component unmounts while the request is still in flight, its `setRows`/`setLoading` calls
    // would still fire after unmount — the same shape as several other list pages in this app: a
    // real but pre-existing, wider-reaching gap, not something newly introduced or safe to
    // silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  //#endregion

  //#region Handlers
  const handleToggleStatus = useCallback(async (user: UsersApiItem) => {
    if (isReadOnly) return;
    if (user.userId === currentUserId) {
      showToast('You cannot deactivate your own account.', 'error');
      return;
    }
    const nextIsActive = user.isActive === 1 ? 0 : 1;
    if (nextIsActive === 0) {
      const confirmed = await confirmAction({
        title: 'Deactivate user?',
        description: `${user.fullName} will lose access to their account.`,
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!confirmed) return;
    } else {
      const confirmed = await confirmAction({
        title: 'Activate user?',
        description: `${user.fullName} will regain access to their account.`,
        confirmLabel: 'Activate',
      });
      if (!confirmed) return;
    }
    try {
      await updateUserStatus(user.userId, nextIsActive);
      showToast(nextIsActive === 1 ? `${user.fullName} activated.` : `${user.fullName} deactivated.`);
      await load();
    } catch (error) {
      console.error('Error updating user status:', error);
      const fallback = nextIsActive === 1 ? 'Failed to activate user.' : 'Failed to deactivate user.';
      showToast(typeof error === 'string' ? error : fallback, 'error');
    }
  }, [load, showToast, isReadOnly, currentUserId]);

  const handleDelete = useCallback(async (user: UsersApiItem) => {
    if (isReadOnly) return;
    if (user.userId === currentUserId) {
      showToast('You cannot delete your own account.', 'error');
      return;
    }
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
      showToast(typeof error === 'string' ? error : 'Failed to delete user.', 'error');
    }
  }, [load, showToast, isReadOnly, currentUserId]);
  //#endregion

  //#region Columns
  const columns: DataTableColumn<UsersApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7.5rem',
      excludeFromExport: true,
      cell: (user) => {
        const isSelf = user.userId === currentUserId;
        return (
          <div className="flex items-center gap-0.5">
            <CommonIconButton
              aria-label={isReadOnly ? `View ${user.fullName}` : `Edit ${user.fullName}`}
              tooltip={isReadOnly ? 'View' : 'Edit'}
              icon={<Pencil size={14} />}
              onClick={() => navigate('/admin/edit-users', { state: { id: user.userId } })}
            />
            {!isReadOnly && (
              <CommonIconButton
                aria-label={user.isActive === 1 ? `Deactivate ${user.fullName}` : `Activate ${user.fullName}`}
                tooltip={isSelf ? 'You cannot deactivate your own account' : user.isActive === 1 ? 'Deactivate' : 'Activate'}
                variant={user.isActive === 1 ? 'danger' : 'ghost'}
                icon={<Power size={15} />}
                onClick={() => void handleToggleStatus(user)}
                disabled={isSelf}
              />
            )}
            {!isReadOnly && (
              <CommonIconButton
                aria-label={`Delete ${user.fullName}`}
                tooltip={isSelf ? 'You cannot delete your own account' : 'Delete'}
                variant="danger"
                icon={<Trash2 size={14} />}
                onClick={() => void handleDelete(user)}
                disabled={isSelf}
              />
            )}
          </div>
        );
      },
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
    { id: 'contactNumber', header: 'Contact Number', value: (user) => user.contactNumber ?? '—', cell: (user) => <span className="text-[var(--text-secondary)]">{user.contactNumber || '—'}</span> },
    { id: 'dob', header: 'Date of birth', value: (user) => user.dateOfBirth ?? '—', cell: (user) => <span className="text-[var(--text-muted)]">{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    { id: 'locked', header: 'Is Locked?', value: (user) => (user.isLocked === 1 ? 'Yes' : 'No'), cell: (user) => <Badge tone={user.isLocked === 1 ? 'danger' : 'success'}>{user.isLocked === 1 ? 'Yes' : 'No'}</Badge> },
    { id: 'lastActive', header: 'Last Active', value: (user) => user.lastActiveAt ?? '—', cell: (user) => <span className="text-[var(--text-muted)]">{user.lastActiveAt ? formatDateTime(user.lastActiveAt) : '—'}</span> },
  ], [handleDelete, handleToggleStatus, navigate, isReadOnly, currentUserId]);
  //#endregion

  //#region Filters
  const roleOptions = useMemo(() => {
    const byRoleId = new Map<number, string>();
    rows.forEach((user) => { if (!byRoleId.has(user.roleId)) byRoleId.set(user.roleId, user.roleName); });
    return Array.from(byRoleId.entries())
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([roleId, roleName]) => ({ id: String(roleId), value: roleName }));
  }, [rows]);
  const filteredRows = useMemo(() => rows.filter((user) => (
    (!roleFilter || String(user.roleId) === roleFilter)
    && (!statusFilter || user.status === statusFilter)
    && (!lockedFilter || String(user.isLocked) === lockedFilter)
  )), [rows, roleFilter, statusFilter, lockedFilter]);
  const hasActiveFilters = Boolean(roleFilter || statusFilter || lockedFilter);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Users"
        action={!isReadOnly && <CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => navigate('/admin/add-users')}>Add User</CommonButton>}
      />

      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>

      {isReadOnly ? <ReadOnlyBanner featureName="Users" /> : null}

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="w-full max-w-xs">
            <Dropdown
              id="filterUsersRole"
              label="Role"
              searchable={false}
              clearable={false}
              value={roleFilter || 'all'}
              onValueChange={(value) => setRoleFilter(!value || value === 'all' ? '' : value)}
              options={[{ id: 'all', value: 'All Roles' }, ...roleOptions]}
              className="min-h-8"
            />
          </div>
          <div className="w-full max-w-xs">
            <Dropdown
              id="filterUsersStatus"
              label="Status"
              searchable={false}
              clearable={false}
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(!value || value === 'all' ? '' : value)}
              options={[
                { id: 'all', value: 'All Statuses' },
                { id: 'active', value: 'Active' },
                { id: 'inactive', value: 'Inactive' },
              ]}
              className="min-h-8"
            />
          </div>
          <div className="w-full max-w-xs">
            <Dropdown
              id="filterUsersLocked"
              label="Locked"
              searchable={false}
              clearable={false}
              value={lockedFilter || 'all'}
              onValueChange={(value) => setLockedFilter(!value || value === 'all' ? '' : value)}
              options={[
                { id: 'all', value: 'All' },
                { id: '1', value: 'Yes' },
                { id: '0', value: 'No' },
              ]}
              className="min-h-8"
            />
          </div>
          {hasActiveFilters ? (
            <div className="flex shrink-0 items-end pb-0.5">
              <CommonButton
                id="btnClearUsersFilters"
                variant="clearFilter"
                size="sm"
                iconLeft={<FilterX size={14} />}
                onClick={() => { setRoleFilter(''); setStatusFilter(''); setLockedFilter(''); }}
              >
                Clear filter
              </CommonButton>
            </div>
          ) : null}
        </div>
      )}

      {loadError && rows.length === 0 ? (
        <EmptyState icon="⚠️" title="Couldn't load users" description={loadError} actionLabel="Retry" onAction={() => void load()} />
      ) : !loading && rows.length === 0 ? (
        <EmptyState icon="🙍" title="No users found" description="Add a user to get started." />
      ) : !loading && hasActiveFilters && filteredRows.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No users match the selected filters"
          description="Try a different Role, Status, or Locked combination."
          actionLabel="Clear filters"
          onAction={() => { setRoleFilter(''); setStatusFilter(''); setLockedFilter(''); }}
        />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(user) => String(user.userId)}
          exportFileName="catholic-solutions-users"
          exportTitle="Catholic Solutions — Users"
          emptyMessage="No users found."
          loading={loading}
        />
      )}
    </div>
  );
  //#endregion
}

export default UsersListPage;
