import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Plus, Power, Search } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { EntityAvatar } from '../components/EntityAvatar';
import { Button, IconButton } from '../components/form/Button';
import { CONTROL_BASE, CONTROL_HEIGHT } from '../components/form/controlStyles';
import { DataTable, type DataTableColumn } from '../components/dataTable/DataTable';
import { confirmAction } from '../lib/confirm';
import { formatDate } from '../utils/formatDate';
import { UserFormDrawer, type NewUserValue } from './UserFormDrawer';
import type { AdminUser, UserStatus } from '../types';

const STATUS_FILTERS: Array<{ id: UserStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'invited', label: 'Invited' }, { id: 'deactivated', label: 'Deactivated' },
];

export function UsersListPage() {
  const { users, organizations, getOrganization, addUser, setUserStatus } = useAdminData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users
      .filter((user) => statusFilter === 'all' || user.status === statusFilter)
      .filter((user) => !normalized || [user.name, user.email].join(' ').toLowerCase().includes(normalized));
  }, [users, query, statusFilter]);

  const handleCreate = (value: NewUserValue) => {
    addUser(value);
    setAddOpen(false);
    showToast(`${value.name} added ✓ (prototype only, not persisted)`);
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.status === 'deactivated') {
      setUserStatus(user.id, 'active');
      showToast(`${user.name} activated ✓`);
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate user?',
      description: `${user.name} will lose access to their account and all assigned applications.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    setUserStatus(user.id, 'deactivated');
    showToast(`${user.name} deactivated`);
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '7rem',
      excludeFromExport: true,
      cell: (user) => (
        <div className="flex items-center gap-0.5">
          <IconButton label={`View ${user.name}`} onClick={() => navigate(`/admin/users/${user.id}`)}><Eye size={15} /></IconButton>
          <IconButton
            label={user.status === 'deactivated' ? `Activate ${user.name}` : `Deactivate ${user.name}`}
            tone={user.status === 'deactivated' ? 'default' : 'danger'}
            onClick={() => void handleToggleStatus(user)}
          >
            <Power size={15} />
          </IconButton>
        </div>
      ),
    },
    {
      id: 'name', header: 'User', width: '16rem',
      value: (user) => `${user.name} (${user.email})`,
      cell: (user) => (
        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
          <EntityAvatar name={user.name} />
          <span>
            <span className="block">{user.name}</span>
            <span className="block text-xs font-semibold text-[var(--text-muted)]">{user.email}</span>
          </span>
        </Link>
      ),
    },
    { id: 'org', header: 'Organization', value: (user) => getOrganization(user.orgId)?.name ?? '—', cell: (user) => <span className="text-[var(--text-secondary)]">{getOrganization(user.orgId)?.name ?? '—'}</span> },
    { id: 'role', header: 'Role', value: (user) => user.role, cell: (user) => <span className="capitalize text-[var(--text-secondary)]">{user.role}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    { id: 'access', header: 'App access', value: (user) => user.appAccessIds.length, cell: (user) => <span className="text-[var(--text-secondary)]">{user.appAccessIds.length}</span> },
    { id: 'lastActive', header: 'Last active', value: (user) => user.lastActiveAt, cell: (user) => <span className="text-[var(--text-muted)]">{user.lastActiveAt === '—' ? '—' : formatDate(user.lastActiveAt)}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Users"
        description={`${users.length} users across all organizations.`}
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>Add user</Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="sr-only">Search users</span>
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className={`${CONTROL_BASE} ${CONTROL_HEIGHT} pl-8 text-[length:var(--admin-text-xs)]`}
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                statusFilter === filter.id ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🙍" title="No users found" description="Try a different search term or status filter." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(user) => user.id}
          exportFileName="catholic-solutions-users"
          exportTitle="Catholic Solutions — Users"
          emptyMessage="No users found."
        />
      )}

      <UserFormDrawer open={addOpen} organizations={organizations} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
