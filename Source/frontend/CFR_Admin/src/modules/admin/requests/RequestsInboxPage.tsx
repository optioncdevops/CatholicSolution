import { useMemo, useState } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { Drawer } from '../components/Drawer';
import { EntityAvatar } from '../components/EntityAvatar';
import { Button } from '../components/form/Button';
import { FilterSelect } from '../components/form/SelectField';
import { DataTable, type DataTableColumn } from '../components/dataTable/DataTable';
import type { AccessRequest, RequestStatus } from '../types';

const STATUS_FILTERS: Array<{ id: RequestStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' }, { id: 'info-requested', label: 'Info requested' },
];

export function RequestsInboxPage() {
  const { requests, applications, organizations, getApplication, getOrganization, resolveRequest } = useAdminData();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [appFilter, setAppFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [selected, setSelected] = useState<AccessRequest | null>(null);
  const [infoNote, setInfoNote] = useState('');

  const rows = useMemo(() => requests
    .filter((request) => statusFilter === 'all' || request.status === statusFilter)
    .filter((request) => appFilter === 'all' || request.appId === appFilter)
    .filter((request) => orgFilter === 'all' || request.orgId === orgFilter), [requests, statusFilter, appFilter, orgFilter]);

  const activeRequest = selected ? requests.find((request) => request.id === selected.id) ?? null : null;

  const act = (status: RequestStatus, note?: string) => {
    if (!activeRequest) return;
    resolveRequest(activeRequest.id, status, note);
    const app = getApplication(activeRequest.appId);
    const verb = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Requested more information for';
    showToast(`${verb} ${app?.name ?? 'application'} request from ${activeRequest.requesterName} ✓`);
    setInfoNote('');
    if (status !== 'info-requested') setSelected(null);
  };

  const columns: DataTableColumn<AccessRequest>[] = [
    {
      id: 'requester', header: 'Requester', pinLeft: true, width: '15rem',
      value: (request) => `${request.requesterName} (${request.requesterEmail})`,
      cell: (request) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={request.requesterName} />
          <span>
            <span className="block font-bold text-[var(--text-primary)]">{request.requesterName}</span>
            <span className="block text-xs text-[var(--text-muted)]">{request.requesterEmail}</span>
          </span>
        </div>
      ),
    },
    { id: 'org', header: 'Organization', value: (request) => getOrganization(request.orgId)?.name ?? '—', cell: (request) => <span className="text-[var(--text-secondary)]">{getOrganization(request.orgId)?.name ?? '—'}</span> },
    { id: 'app', header: 'Application', value: (request) => getApplication(request.appId)?.name ?? request.appId, cell: (request) => <span className="text-[var(--text-secondary)]">{getApplication(request.appId)?.name ?? request.appId}</span> },
    { id: 'status', header: 'Status', value: (request) => request.status, cell: (request) => <StatusBadge status={request.status} kind="request" /> },
    { id: 'submittedAt', header: 'Submitted', value: (request) => request.submittedAt, cell: (request) => <span className="text-[var(--text-muted)]">{request.submittedAt}</span> },
    {
      id: 'review', header: 'Review', sortable: false, excludeFromExport: true,
      cell: (request) => <Button variant="secondary" onClick={() => setSelected(request)}>Review</Button>,
    },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Access requests" description={`${requests.filter((r) => r.status === 'pending').length} pending review.`} />

      <div className="flex flex-wrap items-center gap-2">
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
        <FilterSelect label="Filter by application" value={appFilter} onChange={(event) => setAppFilter(event.target.value)}>
          <option value="all">All applications</option>
          {applications.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
        </FilterSelect>
        <FilterSelect label="Filter by organization" value={orgFilter} onChange={(event) => setOrgFilter(event.target.value)}>
          <option value="all">All organizations</option>
          {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </FilterSelect>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="📭" title="No requests found" description="Try a different filter combination." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(request) => request.id}
          initialSort={[{ id: 'submittedAt', desc: true }]}
          exportFileName="catholic-solutions-access-requests"
          exportTitle="Catholic Solutions — Access Requests"
          emptyMessage="No requests found."
        />
      )}

      <Drawer
        open={Boolean(activeRequest)}
        title={activeRequest ? `${activeRequest.requesterName}'s request` : ''}
        description={activeRequest ? getApplication(activeRequest.appId)?.name : undefined}
        onClose={() => { setSelected(null); setInfoNote(''); }}
        footer={activeRequest && activeRequest.status === 'pending' ? (
          <>
            <button type="button" onClick={() => act('rejected')} className="rounded-[var(--radius-control)] border border-[var(--error)] px-3 py-2 text-xs font-bold text-[var(--error)] hover:bg-[var(--error-bg)]">Reject</button>
            <button type="button" onClick={() => act('info-requested', infoNote || 'More information requested.')} className="action-secondary">Request info</button>
            <button type="button" onClick={() => act('approved')} className="action-primary">Approve</button>
          </>
        ) : undefined}
      >
        {activeRequest ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Requester</p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{activeRequest.requesterName}</p>
              <p className="text-xs text-[var(--text-muted)]">{activeRequest.requesterEmail}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{getOrganization(activeRequest.orgId)?.name}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Status timeline</p>
              <ol className="flex flex-col gap-3 border-l-2 border-[var(--line)] pl-3.5">
                {activeRequest.timeline.map((entry, index) => (
                  <li key={index} className="relative">
                    <span className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-[var(--secondary)]" aria-hidden="true" />
                    <p className="text-xs font-bold capitalize text-[var(--text-primary)]">{entry.status.replace('-', ' ')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{entry.actor} · {entry.at}</p>
                    {entry.note ? <p className="mt-0.5 text-xs italic text-[var(--text-secondary)]">{entry.note}</p> : null}
                  </li>
                ))}
              </ol>
            </div>

            {activeRequest.status === 'pending' ? (
              <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
                Note (optional, used for "Request info")
                <textarea value={infoNote} onChange={(event) => setInfoNote(event.target.value)} rows={3} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal leading-6 text-[var(--text-primary)]" />
              </label>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
