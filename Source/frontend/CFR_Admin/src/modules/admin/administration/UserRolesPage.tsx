import { useMemo, useState } from 'react';
import { Copy, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { InputField } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '../utils/formatDate';
import { confirmAction } from '../lib/confirm';
import { RoleFormDrawer, type RoleFormValue } from './RoleFormDrawer';
import type { AdminRole } from '../types';

export function UserRolesPage() {
  const { roles, addRole, updateRole, duplicateRole, deleteRole } = useAdminData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [drawerTarget, setDrawerTarget] = useState<'create' | AdminRole | null>(null);
  const [drawerReadOnly, setDrawerReadOnly] = useState(false);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return roles.filter((role) => !normalized || [role.name, role.description, role.landingPage].join(' ').toLowerCase().includes(normalized));
  }, [roles, query]);

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

  const handleDuplicate = (role: AdminRole) => {
    duplicateRole(role.id);
    showToast(`${role.name} duplicated ✓`);
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
      width: '9rem',
      excludeFromExport: true,
      cell: (role) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton aria-label={`Edit ${role.name}`} icon={<Pencil size={14} />} onClick={() => { setDrawerReadOnly(false); setDrawerTarget(role); }} />
          <CommonIconButton aria-label={`Duplicate ${role.name}`} icon={<Copy size={14} />} onClick={() => handleDuplicate(role)} />
          <CommonIconButton aria-label={`View ${role.name}`} icon={<Eye size={14} />} onClick={() => { setDrawerReadOnly(true); setDrawerTarget(role); }} />
          <CommonIconButton aria-label={`Delete ${role.name}`} variant="danger" icon={<Trash2 size={14} />} onClick={() => void handleDelete(role)} />
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
    { id: 'landingPage', header: 'Landing page', value: (role) => role.landingPage, cell: (role) => <span className="text-[var(--text-secondary)]">{role.landingPage}</span> },
    { id: 'createdAt', header: 'Created', value: (role) => role.createdAt, cell: (role) => <span className="text-[var(--text-muted)]">{formatDate(role.createdAt)}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="User roles"
        action={<CommonButton variant="primary" iconLeft={<Plus size={14} />} onClick={() => { setDrawerReadOnly(false); setDrawerTarget('create'); }}>Add user role</CommonButton>}
      />

      <InputField
        label="Search roles"
        hideLabel
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, description, landing page"
        startIcon={<Search size={13} />}
        className="min-h-8 text-xs placeholder:text-xs"
        wrapperClassName="max-w-sm"
      />

      {rows.length === 0 ? (
        <EmptyState icon="🧑‍💼" title="No roles found" description="Try a different search term." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(role) => role.id}
          exportFileName="catholic-solutions-user-roles"
          exportTitle="Catholic Solutions — User Roles"
          emptyMessage="No roles found."
        />
      )}

      <RoleFormDrawer
        target={drawerTarget}
        readOnly={drawerReadOnly}
        onClose={() => setDrawerTarget(null)}
        onCreate={handleCreate}
        onSave={handleSave}
      />
    </div>
  );
}
