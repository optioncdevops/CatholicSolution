import { useState } from 'react';
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '../utils/formatDate';
import { confirmAction } from '../lib/confirm';
import { RoleFormModal, type RoleFormValue } from './RoleFormModal';
import type { AdminRole } from '../types';

export function UserRolesPage() {
  const { roles, addRole, updateRole, deleteRole, toggleRoleActive } = useAdminData();
  const { showToast } = useToast();
  const [drawerTarget, setDrawerTarget] = useState<'create' | AdminRole | null>(null);

  const handleToggleActive = async (role: AdminRole) => {
    if (!role.active) {
      toggleRoleActive(role.id);
      showToast(`${role.name} activated ✓`);
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate this role?',
      description: `"${role.name}" will no longer be assignable to users.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    toggleRoleActive(role.id);
    showToast(`${role.name} deactivated`);
  };

  const handleCreate = (value: RoleFormValue) => {
    addRole(value);
    setDrawerTarget(null);
    showToast(`${value.name} added ✓ (prototype only, not persisted)`);
  };

  const handleSave = (role: AdminRole) => {
    updateRole(role);
    setDrawerTarget(null);
    showToast(`${role.name} updated ✓`);
  };

  const handleDelete = async (role: AdminRole) => {
    const confirmed = await confirmAction({
      title: 'Delete this role?',
      description: `"${role.name}" will be permanently removed from the role catalog.`,
      confirmLabel: 'Delete role',
      tone: 'danger',
    });
    if (!confirmed) return;
    deleteRole(role.id);
    showToast(`${role.name} deleted`);
  };

  const columns: DataTableColumn<AdminRole>[] = [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7rem',
      excludeFromExport: true,
      cell: (role) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton aria-label={`Edit ${role.name}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => setDrawerTarget(role)} />
          <CommonIconButton aria-label={role.active ? `Deactivate ${role.name}` : `Activate ${role.name}`} tooltip={role.active ? 'Deactivate' : 'Activate'} variant={role.active ? 'danger' : 'ghost'} icon={role.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} onClick={() => void handleToggleActive(role)} />
          <CommonIconButton aria-label={`Delete ${role.name}`} tooltip="Delete" variant="danger" icon={<Trash2 size={14} />} onClick={() => void handleDelete(role)} />
        </div>
      ),
    },
    {
      id: 'name', header: 'Name', width: '13rem',
      value: (role) => role.name,
      cell: (role) => <span className="font-bold text-[var(--text-primary)]">{role.name}</span>,
    },
    {
      id: 'description', header: 'Description',
      value: (role) => role.description,
      cell: (role) => <span className="text-[var(--text-secondary)]">{role.description || '—'}</span>,
    },
    { id: 'landingPage', header: 'Landing Page', value: (role) => role.landingPage, cell: (role) => <span className="text-[var(--text-secondary)]">{role.landingPage}</span> },
    { id: 'createdAt', header: 'Created', value: (role) => role.createdAt, cell: (role) => <span className="text-[var(--text-muted)]">{formatDate(role.createdAt)}</span> },
    { id: 'status', header: 'Status', value: (role) => (role.active ? 'active' : 'inactive'), cell: (role) => <Badge tone={role.active ? 'success' : 'neutral'}>{role.active ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="User Roles"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => setDrawerTarget('create')}>Add User Role</CommonButton>}
      />

      {roles.length === 0 ? (
        <EmptyState icon="🧑‍💼" title="No roles yet" description="Add a role to get started." />
      ) : (
        <DataTable
          data={roles}
          columns={columns}
          getRowId={(role) => role.id}
          exportFileName="catholic-solutions-user-roles"
          exportTitle="Catholic Solutions — User Roles"
          emptyMessage="No roles found."
        />
      )}

      <RoleFormModal
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
        onCreate={handleCreate}
        onSave={handleSave}
      />
    </div>
  );
}
