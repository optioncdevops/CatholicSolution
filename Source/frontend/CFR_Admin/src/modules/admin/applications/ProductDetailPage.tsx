import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Pencil, RefreshCw } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { Button } from '../components/form/Button';
import { EntityAvatar } from '../components/EntityAvatar';
import { Tabs, TabPanel } from '../components/Tabs';
import { formatDate } from '../utils/formatDate';
import { getProductWarnings } from './productValidation';
import { ProductWarningsBanner } from './ProductWarningsBanner';
import { ProductEditDrawer } from './ProductEditDrawer';
import { ProductStatusDialog } from './ProductStatusDialog';
import type { AdminApplication, ProductStatus } from '../types';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line-soft)] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}

export function ProductDetailPage() {
  const { appId } = useParams();
  const { getApplication, applications, organizations, updateApplication, setApplicationStatus } = useAdminData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [editing, setEditing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);

  const app = appId ? getApplication(appId) : undefined;
  if (!app) return <Navigate to="/admin/applications" replace />;

  const warnings = getProductWarnings(app, applications);
  const customers = organizations.filter((org) => org.appIds.includes(app.id));

  const handleSave = (next: AdminApplication) => {
    updateApplication(next);
    setEditing(false);
    showToast(`${next.name} updated ✓`);
  };

  const handleConfirmStatus = (status: ProductStatus) => {
    setApplicationStatus(app.id, status);
    showToast(`${app.name} status changed to ${status.replace('-', ' ')} ✓`);
    setChangingStatus(false);
    setPendingStatus(null);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        description={app.category}
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={() => setChangingStatus(true)}>Change status</Button>
            <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditing(true)}>Edit</Button>
          </div>
        )}
      />

      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
        <StatusBadge status={app.status} kind="application" />
        <span className="text-xs font-semibold capitalize text-[var(--text-muted)]">{app.visibility} · {app.navigationTarget.replace('-', ' ')}</span>
      </div>

      <ProductWarningsBanner warnings={warnings} />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'basic', label: 'Basic details' },
          { id: 'customers', label: 'Customers', count: customers.length },
          { id: 'technical', label: 'Technical' },
        ]}
      />

      <TabPanel id="basic" activeId={activeTab}>
        <div className="flex flex-col gap-4">
          <section className="admin-panel-card">
            <div className="admin-panel-card__header"><h2 className="panel-title">Overview</h2></div>
            <div className="p-4">
              <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{app.description || 'No description yet.'}</p>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Product ID" value={app.id} />
            <Field label="Category" value={app.category} />
            <Field label="Ownership" value={app.ownership.replace('-', ' ')} />
            <Field label="Deployment model" value={app.deploymentModel.replace('-', ' ')} />
            <Field label="Production domain" value={app.productionUrl || 'Not configured'} />
            <Field label="Visibility" value={app.visibility} />
            <Field label="Navigation target" value={app.navigationTarget.replace('-', ' ')} />
            <Field label="Last updated" value={formatDate(app.updatedAt)} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header"><h2 className="panel-title">Features</h2></div>
              {app.features.length === 0 ? (
                <p className="p-4 text-xs text-[var(--text-muted)]">No features listed.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5 p-4">
                  {app.features.map((feature) => <li key={feature} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">{feature}</li>)}
                </ul>
              )}
            </section>
            <section className="admin-panel-card">
              <div className="admin-panel-card__header"><h2 className="panel-title">Integrations</h2></div>
              {app.integrations.length === 0 ? (
                <p className="p-4 text-xs text-[var(--text-muted)]">No integrations listed.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5 p-4">
                  {app.integrations.map((integration) => <li key={integration} className="rounded-full bg-[var(--info-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--info)]">{integration}</li>)}
                </ul>
              )}
            </section>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="customers" activeId={activeTab}>
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Customers</h2>
              <p className="panel-subtitle">Organizations with this product assigned.</p>
            </div>
            <span className="text-xs font-bold text-[var(--text-secondary)]">{customers.length} organization{customers.length === 1 ? '' : 's'}</span>
          </div>
          {customers.length === 0 ? (
            <EmptyState icon="🏢" title="No customers yet" description="Assign this product to an organization to see it listed here." />
          ) : (
            <ul className="divide-y divide-[var(--line-soft)]">
              {customers.map((org) => (
                <li key={org.id}>
                  <Link to={`/admin/organizations/${org.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]">
                    <EntityAvatar name={org.name} size={32} square />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{org.name}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{org.domain} · {org.plan} plan</p>
                    </div>
                    <StatusBadge status={org.status} kind="organization" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </TabPanel>

      <TabPanel id="technical" activeId={activeTab}>
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Technical metadata</h2>
              <p className="panel-subtitle">Read-only — reflects the underlying registry record and is not editable in this console.</p>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Field label="Registry reference" value={app.registryRef} />
            <Field label="Application source location" value={app.sourceLocation} />
          </div>
        </section>
      </TabPanel>

      <ProductEditDrawer app={editing ? app : null} onClose={() => setEditing(false)} onSave={handleSave} />
      <ProductStatusDialog
        app={changingStatus ? app : null}
        pendingStatus={pendingStatus}
        onSelectStatus={setPendingStatus}
        onClose={() => { setChangingStatus(false); setPendingStatus(null); }}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}
