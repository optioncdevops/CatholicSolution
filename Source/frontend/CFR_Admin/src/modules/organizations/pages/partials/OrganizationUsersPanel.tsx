import { EmptyState } from '@shared/app/components/EmptyState';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import type { OrganizationUserApiItem } from '../../types/organizationTypes';

const columns: DataTableColumn<OrganizationUserApiItem>[] = [
  {
    id: 'email', header: 'Email', width: '16rem',
    value: (user) => user.email,
    cell: (user) => <span className="font-bold text-[var(--text-primary)]">{user.email}</span>,
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
  users: OrganizationUserApiItem[];
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
