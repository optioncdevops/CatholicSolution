import { EmptyState } from '@shared/app/components/EmptyState';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import type { LiveOrganizationUserApiItem } from '../../types/liveOrganizationTypes';

const columns: DataTableColumn<LiveOrganizationUserApiItem>[] = [
  {
    id: 'name', header: 'Name', width: '12rem',
    value: (user) => `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    cell: (user) => <span className="font-bold text-[var(--text-primary)]">{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'}</span>,
  },
  {
    id: 'email', header: 'Email',
    value: (user) => user.email,
    cell: (user) => <span className="text-[var(--text-secondary)]">{user.email}</span>,
  },
  {
    id: 'memberStatus', header: 'Status',
    value: (user) => user.memberStatus ?? '',
    cell: (user) => <Badge tone={user.memberStatus === 'active' ? 'success' : 'neutral'}>{user.memberStatus || '—'}</Badge>,
  },
  {
    id: 'linkedDate', header: 'Linked On',
    value: (user) => user.linkedDate,
    cell: (user) => <span className="text-[var(--text-muted)]">{formatDate(user.linkedDate)}</span>,
  },
];

type OrganizationUsersPanelProps = {
  users: LiveOrganizationUserApiItem[];
};

const OrganizationUsersPanel = ({ users }: OrganizationUsersPanelProps) => {
  if (users.length === 0) {
    return <EmptyState icon="👥" title="No users linked" description="Users linked to this organization will appear here." />;
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowId={(user) => String(user.authUserId)}
      exportFileName="organization-users"
      exportTitle="Organization — Users"
      emptyMessage="No users found."
    />
  );
};

export default OrganizationUsersPanel;
