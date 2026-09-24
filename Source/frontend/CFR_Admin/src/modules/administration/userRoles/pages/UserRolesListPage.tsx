import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, ShieldCheck, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Badge, formatStatusLabel } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '../../../lib/confirm';
import { formatDate } from '../../../utils/formatDate';
import UserRoleFormModal from './partials/UserRoleFormModal';
import { deleteUserRole, getUserRoles, updateUserRoleStatus } from '../services/userRolesService';
import type { UserRolesApiItem } from '../types/userRolesTypes';
import { normalizeUserRolesList } from '../utils/userRolesHelpers';

export function UserRolesListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  const accessLevel = useFeatureAccessLevel('/admin/administration-user-roles');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [rows, setRows] = useState<UserRolesApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRolesApiItem | null>(null);
  //#endregion

  //#region Functions
  const load = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getUserRoles();
      setRows(statusCode === 204 ? [] : normalizeUserRolesList(resultData));
    } catch (error) {
      console.error('Error loading user roles:', error);
      showToast('Failed to load user roles.', 'error');
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
        const { resultData, statusCode } = await getUserRoles();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeUserRolesList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user roles:', error);
        showToast('Failed to load user roles.', 'error');
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
  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (role: UserRolesApiItem) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRole(null);
  };

  const handleToggleActive = useCallback(async (role: UserRolesApiItem) => {
    if (isReadOnly || role.usersCount > 0) return;
    if (role.status !== 'active') {
      const confirmed = await confirmAction({
        title: 'Activate this role?',
        description: 'This role will become assignable to users.',
        confirmLabel: 'Activate',
      });
      if (!confirmed) return;

      try {
        await updateUserRoleStatus(role.roleId, 'active');
        showToast('Role activated successfully.');
        await load();
      } catch (error) {
        console.error('Error activating user role:', error);
        showToast('Failed to activate user role.', 'error');
      }
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate this role?',
      description: 'This role will no longer be assignable to users.',
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await updateUserRoleStatus(role.roleId, 'inactive');
      showToast('Role deactivated successfully.');
      await load();
    } catch (error) {
      console.error('Error deactivating user role:', error);
      showToast('Failed to deactivate user role.', 'error');
    }
  }, [load, showToast, isReadOnly]);

  const handleDelete = useCallback(async (role: UserRolesApiItem) => {
    if (isReadOnly || role.usersCount > 0) return;
    const confirmed = await confirmAction({
      title: 'Delete this record?',
      description: 'Are you sure you want to delete this record? This action cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      const response = await deleteUserRole(role.roleId);
      if (response.statusCode === 409) {
        showToast(response.statusMessage || 'This role is assigned to one or more users.', 'conflict');
        return;
      }
      showToast('Role deleted successfully.');
      await load();
    } catch (error) {
      console.error('Error deleting user role:', error);
      showToast(typeof error === 'string' ? error : 'Failed to delete user role.', 'error');
    }
  }, [load, showToast, isReadOnly]);
  //#endregion

  //#region Columns
  const columns: DataTableColumn<UserRolesApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7rem',
      excludeFromExport: true,
      cell: (role) => {
        const inUse = role.usersCount > 0;
        const isActive = role.status === 'active';
        return (
          <div className="flex items-center gap-0.5">
            <CommonIconButton aria-label={`Edit ${role.roleName}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => handleOpenEdit(role)} />
            <CommonIconButton
              id={`ibtnManageRightsUserRole${role.roleId}`}
              aria-label={`Manage rights for ${role.roleName}`}
              tooltip="Manage Rights"
              icon={<ShieldCheck size={14} />}
              onClick={() => navigate(`/admin/administration-rights?roleId=${role.roleId}`)}
            />
            {!isReadOnly && (
              <CommonIconButton
                aria-label={isActive ? `Deactivate ${role.roleName}` : `Activate ${role.roleName}`}
                tooltip={inUse ? 'Cannot deactivate: users are assigned to this role. Reassign users first.' : (isActive ? 'Deactivate' : 'Activate')}
                variant={isActive ? 'success' : 'danger'}
                icon={isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                onClick={() => void handleToggleActive(role)}
                disabled={inUse}
              />
            )}
            {!isReadOnly && (
              <CommonIconButton
                aria-label={`Delete ${role.roleName}`}
                tooltip={inUse ? 'Cannot delete: users are assigned to this role. Reassign users first.' : 'Delete'}
                variant="danger"
                icon={<Trash2 size={14} />}
                onClick={() => void handleDelete(role)}
                disabled={inUse}
              />
            )}
          </div>
        );
      },
    },
    {
      id: 'name', header: 'Name', width: '13rem',
      value: (role) => role.roleName,
      cell: (role) => <span className="font-bold text-[var(--text-primary)]">{role.roleName}</span>,
    },
    {
      id: 'description', header: 'Description',
      value: (role) => role.description,
      cell: (role) => <span className="text-[var(--text-secondary)]">{role.description || '—'}</span>,
    },
    {
      id: 'usersCount', header: 'Users', width: '6rem',
      value: (role) => role.usersCount,
      cell: (role) => {
        if (role.usersCount === 0) return <Badge tone="neutral">0</Badge>;
        return (
          <Link to="/admin/users" state={{ roleId: role.roleId }} className="hover:opacity-80 transition-opacity inline-block cursor-pointer" title="View Users">
            <Badge tone="info">{role.usersCount}</Badge>
          </Link>
        );
      },
    },
    { id: 'createdAt', header: 'Created Date', value: (role) => role.createdDate ?? '—', cell: (role) => <span className="text-[var(--text-muted)]">{role.createdDate ? formatDate(role.createdDate) : '—'}</span> },
    { id: 'createdBy', header: 'Created By', value: (role) => role.createdBy ?? '—', cell: (role) => <span className="text-[var(--text-secondary)]">{role.createdBy ?? '—'}</span> },
    { id: 'modifiedDate', header: 'Modified Date', value: (role) => role.modifiedDate ?? '—', cell: (role) => <span className="text-[var(--text-muted)]">{role.modifiedDate ? formatDate(role.modifiedDate) : '—'}</span> },
    { id: 'modifiedBy', header: 'Modified By', value: (role) => role.modifiedBy ?? '—', cell: (role) => <span className="text-[var(--text-secondary)]">{role.modifiedBy ?? '—'}</span> },
    { id: 'status', header: 'Status', value: (role) => role.status, cell: (role) => <Badge tone={role.status === 'active' ? 'success' : 'neutral'}>{formatStatusLabel(role.status)}</Badge> },
  ], [handleDelete, handleToggleActive, isReadOnly]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="User Roles"
        action={!isReadOnly && <CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={handleOpenCreate}>Add User Role</CommonButton>}
      />

      {isReadOnly ? <ReadOnlyBanner featureName="User Roles" /> : null}

      {!loading && rows.length === 0 ? (
        <EmptyState icon="🧑‍💼" title="No roles yet" description="Add a role to get started." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(role) => String(role.roleId)}
          exportFileName="catholic-solutions-user-roles"
          exportTitle="Catholic Solutions — User Roles"
          emptyMessage="No roles found."
        />
      )}

      <UserRoleFormModal open={formOpen} role={editingRole} onClose={handleCloseForm} onSaved={load} readOnly={isReadOnly} />
    </div>
  );
  //#endregion
}

export default UserRolesListPage;
