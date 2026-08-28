import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
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
      showToast('Failed to load user roles.');
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
        showToast('Failed to load user roles.');
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
    if (role.status !== 'active') {
      try {
        await updateUserRoleStatus(role.roleId, 'active');
        showToast(`${role.roleName} activated ✓`);
        await load();
      } catch (error) {
        console.error('Error activating user role:', error);
        showToast('Failed to activate user role.');
      }
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate this role?',
      description: `"${role.roleName}" will no longer be assignable to users.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await updateUserRoleStatus(role.roleId, 'inactive');
      showToast(`${role.roleName} deactivated`);
      await load();
    } catch (error) {
      console.error('Error deactivating user role:', error);
      showToast('Failed to deactivate user role.');
    }
  }, [load, showToast]);

  const handleDelete = useCallback(async (role: UserRolesApiItem) => {
    const confirmed = await confirmAction({
      title: 'Delete this role?',
      description: `"${role.roleName}" will be permanently removed from the role catalog.`,
      confirmLabel: 'Delete role',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      const response = await deleteUserRole(role.roleId);
      if (response.statusCode === 409) {
        showToast(response.statusMessage || 'This role is assigned to one or more users.');
        return;
      }
      showToast(`${role.roleName} deleted`);
      await load();
    } catch (error) {
      console.error('Error deleting user role:', error);
      showToast(typeof error === 'string' ? error : 'Failed to delete user role.');
    }
  }, [load, showToast]);
  //#endregion

  //#region Columns
  const columns: DataTableColumn<UserRolesApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7rem',
      excludeFromExport: true,
      cell: (role) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton aria-label={`Edit ${role.roleName}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => handleOpenEdit(role)} />
          <CommonIconButton aria-label={role.status === 'active' ? `Deactivate ${role.roleName}` : `Activate ${role.roleName}`} tooltip={role.status === 'active' ? 'Deactivate' : 'Activate'} variant={role.status === 'active' ? 'danger' : 'ghost'} icon={role.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} onClick={() => void handleToggleActive(role)} />
          <CommonIconButton aria-label={`Delete ${role.roleName}`} tooltip="Delete" variant="danger" icon={<Trash2 size={14} />} onClick={() => void handleDelete(role)} />
        </div>
      ),
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
    { id: 'createdAt', header: 'Created', value: (role) => role.createdDate ?? '—', cell: (role) => <span className="text-[var(--text-muted)]">{role.createdDate ? formatDate(role.createdDate) : '—'}</span> },
    { id: 'status', header: 'Status', value: (role) => role.status, cell: (role) => <Badge tone={role.status === 'active' ? 'success' : 'neutral'}>{role.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
  ], [handleDelete, handleToggleActive]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="User Roles"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={handleOpenCreate}>Add User Role</CommonButton>}
      />

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

      <UserRoleFormModal open={formOpen} role={editingRole} onClose={handleCloseForm} onSaved={load} />
    </div>
  );
  //#endregion
}

export default UserRolesListPage;
