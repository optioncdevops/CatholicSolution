import { useSearchParams } from 'react-router-dom';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { MattMoneyAdminDashboard } from './MattMoneyAdminDashboard';
import { MattMoneyMemberDashboard } from './MattMoneyMemberDashboard';

const app = getAppById('matt-money')!;
type DashboardView = 'admin' | 'member';

const views: Array<{ id: DashboardView; icon: string; title: string; description: string }> = [
  { id: 'admin', icon: '🏢', title: 'Administrator', description: 'Organization finance, collections, budgets and approvals' },
  { id: 'member', icon: '👤', title: 'Member', description: 'Household balance, scheduled charges and payment history' },
];

function DashboardSwitcher({ value, onChange }: { value: DashboardView; onChange: (view: DashboardView) => void }) {
  return (
    <nav className="matt-workspace-switcher" aria-label="Matt Money dashboard view">
      <div className="matt-workspace-switcher__label">
        <span>Dashboard view</span>
        <strong>Choose your workspace</strong>
      </div>
      <div className="matt-workspace-switcher__options">
        {views.map((view) => {
          const selected = value === view.id;
          return (
            <button
              key={view.id}
              type="button"
              className={`matt-workspace-option ${selected ? 'is-active' : ''}`}
              aria-pressed={selected}
              onClick={() => onChange(view.id)}
            >
              <span className="matt-workspace-option__icon" aria-hidden="true">{view.icon}</span>
              <span className="matt-workspace-option__copy"><strong>{view.title}</strong><small>{view.description}</small></span>
              <span className="matt-workspace-option__state">{selected ? 'Current' : 'Switch'}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MattMoneyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: DashboardView = searchParams.get('view') === 'member' ? 'member' : 'admin';
  const setView = (next: DashboardView) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('view', next);
    setSearchParams(updated, { replace: true });
  };

  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack">
        <DashboardSwitcher value={view} onChange={setView} />
        {view === 'admin' ? <MattMoneyAdminDashboard /> : <MattMoneyMemberDashboard />}
      </main>
    </AppLayout>
  );
}
