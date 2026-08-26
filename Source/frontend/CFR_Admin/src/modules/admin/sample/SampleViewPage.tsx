/**
 * DEV-ONLY COMPONENT LIBRARY — "View" reference page.
 *
 * Shows every shared display/layout component this app has (badges, tabs, data table,
 * drawer, modal, tooltip, empty state, avatars) with its main option variants. Purely local
 * state, zero dependency on AdminDataContext or any real entity type.
 *
 * TO REMOVE THIS ENTIRELY:
 *   1. Delete this file, `SampleAddPage.tsx`, and `sampleData.ts` (the whole `sample/` folder).
 *   2. Remove the two `/admin/administration/component-library/*` routes from `App.tsx`.
 *   3. Remove the two "Component library" entries from `ADMINISTRATION_ITEMS` in `AdminShell.tsx`.
 * Nothing outside this folder imports from it, so those three edits are the whole removal.
 */
import { useState } from 'react';
import { Eye, Info, Package } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Tooltip } from '@app/components/tooltips/Tooltip';
import { Badge, StatusBadge } from '@app/components/Badge';
import { DetailField } from '@app/components/DetailField';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Drawer } from '@app/components/Drawer';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { BaseModal } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '../lib/confirm';
import { formatDate } from '../utils/formatDate';
import { SAMPLE_TABLE_ROWS, type SampleRow } from './sampleData';

const BADGE_TONES = ['success', 'warning', 'neutral', 'danger', 'info'] as const;
const STATUS_KINDS: Array<{ kind: 'application' | 'organization' | 'user' | 'request' | 'license' | 'access'; statuses: string[] }> = [
  { kind: 'application', statuses: ['active', 'inactive', 'coming-soon'] },
  { kind: 'organization', statuses: ['active', 'trial', 'suspended'] },
  { kind: 'user', statuses: ['active', 'invited', 'deactivated'] },
  { kind: 'request', statuses: ['pending', 'approved', 'rejected', 'info-requested'] },
  { kind: 'license', statuses: ['active', 'suspended', 'expiring-soon', 'expired'] },
  { kind: 'access', statuses: ['active', 'expiring-soon', 'expired'] },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header">
        <div>
          <h2 className="panel-title">{title}</h2>
          {description ? <p className="panel-subtitle">{description}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-3.5 p-4">{children}</div>
    </section>
  );
}

export function SampleViewPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const columns: DataTableColumn<SampleRow>[] = [
    { id: 'name', header: 'Name', value: (row) => row.name, cell: (row) => <span className="font-bold text-[var(--text-primary)]">{row.name}</span> },
    { id: 'category', header: 'Category', value: (row) => row.category, cell: (row) => <span className="text-[var(--text-secondary)]">{row.category}</span> },
    { id: 'status', header: 'Status', value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} kind="application" /> },
    { id: 'amount', header: 'Amount', value: (row) => row.amount, cell: (row) => <span className="font-bold text-[var(--text-primary)]">${row.amount.toFixed(2)}</span> },
    { id: 'updatedAt', header: 'Updated', value: (row) => row.updatedAt, cell: (row) => <span className="text-[var(--text-muted)]">{formatDate(row.updatedAt)}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Component Library — View"
        icon={<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#1E3A8A,#3B82F6)] text-lg text-white" aria-hidden="true"><Eye size={18} /></span>}
        action={<CommonButton variant="headerSecondary" size="sm" iconLeft={<Info size={13} />} onClick={() => setModalOpen(true)}>Open Modal Demo</CommonButton>}
      />

      <SectionCard title="Badges & Status Badges" description="Every Badge tone, and every StatusBadge kind × status combination used across the app.">
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}
        </div>
        <div className="flex flex-col gap-2">
          {STATUS_KINDS.map(({ kind, statuses }) => (
            <div key={kind} className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{kind}</span>
              {statuses.map((status) => <StatusBadge key={status} status={status} kind={kind} />)}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Avatars & Detail Fields">
        <div className="flex flex-wrap items-center gap-3">
          <EntityAvatar name="Jordan Reyes" />
          <EntityAvatar name="Sam Patel" size={40} />
          <EntityAvatar name="Alex Kim" square />
          <EntityAvatar name="Taylor Nguyen" size={48} square />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Customer code" value="CUST-1001" />
          <DetailField label="Plan" value="Growth" />
          <DetailField label="Empty value" value="" />
          <DetailField label="Domain" value="holyfamilyacademy.edu" />
        </div>
      </SectionCard>

      <SectionCard title="Tabs" description="Compound Tabs/TabPanel component with a count badge.">
        <Tabs
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'details', label: 'Details', count: 3 },
            { id: 'history', label: 'History' },
          ]}
        />
        <TabPanel id="overview" activeId={activeTab}><p className="text-sm text-[var(--text-secondary)]">Overview panel content.</p></TabPanel>
        <TabPanel id="details" activeId={activeTab}><p className="text-sm text-[var(--text-secondary)]">Details panel content (3 items).</p></TabPanel>
        <TabPanel id="history" activeId={activeTab}><p className="text-sm text-[var(--text-secondary)]">History panel content.</p></TabPanel>
      </SectionCard>

      <SectionCard title="Data Table" description="Sorting, pagination, and Excel/Word/CSV/print export — all built in.">
        <DataTable
          data={SAMPLE_TABLE_ROWS}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={3}
          exportFileName="component-library-sample"
          exportTitle="Component library — sample rows"
          emptyMessage="No sample rows."
        />
      </SectionCard>

      <SectionCard title="Empty State">
        <EmptyState icon="📦" title="Nothing here yet" description="This is what an empty list looks like, with an optional action button." actionLabel="Take action" onAction={() => {}} />
      </SectionCard>

      <SectionCard title="Drawer, Modal, Tooltip & Confirm Dialog" description="Overlay components — click to open each one.">
        <div className="flex flex-wrap items-center gap-2">
          <CommonButton variant="primary" iconLeft={<Package size={14} />} onClick={() => setDrawerOpen(true)}>Open Drawer</CommonButton>
          <CommonButton variant="outline" onClick={() => setModalOpen(true)}>Open Modal</CommonButton>
          <Tooltip content="This tooltip appears on hover or focus.">
            <CommonButton variant="ghost">Hover for tooltip</CommonButton>
          </Tooltip>
          <CommonButton
            variant="danger"
            tone="soft"
            onClick={() => void confirmAction({ title: 'Confirm this action?', description: 'This is the themed confirmAction() dialog.', confirmLabel: 'Confirm' })}
          >
            Open Confirm Dialog
          </CommonButton>
          <CommonIconButton aria-label="Icon button with tooltip" tooltip="Icon buttons support tooltips too" icon={<Info size={14} />} />
        </div>
      </SectionCard>

      <Drawer open={drawerOpen} title="Sample Drawer" description="Drawer component" onClose={() => setDrawerOpen(false)} footer={<CommonButton variant="primary" onClick={() => setDrawerOpen(false)}>Done</CommonButton>}>
        <div className="grid gap-3">
          <DetailField label="Field one" value="Sample value" />
          <DetailField label="Field two" value="Another value" />
        </div>
      </Drawer>

      <BaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sample Modal" footer={<CommonButton variant="primary" onClick={() => setModalOpen(false)}>Close</CommonButton>}>
        <p className="text-sm text-[var(--text-secondary)]">This is the ported BaseModal component — portal-based, with sizes, height variants, and a sticky footer.</p>
      </BaseModal>
    </div>
  );
}
