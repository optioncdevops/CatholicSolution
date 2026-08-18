import { useSearchParams } from 'react-router-dom';
import { getAppById } from '@shared/app/config/appCatalog';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { useToast } from '@shared/app/components/ToastProvider';
import { MattMoneyAdminDashboard } from './MattMoneyAdminDashboard';
import { MattMoneyMemberDashboard } from './MattMoneyMemberDashboard';

const app = getAppById('matt-money')!;
type DashboardView = 'admin' | 'member';
type SectionId = 'overview' | 'billing' | 'payments' | 'reconciliation' | 'reports' | 'methods' | 'statements';

type NavItem = { id: SectionId; label: string };
const adminSections: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'billing', label: 'Billing' },
  { id: 'payments', label: 'Payments' },
  { id: 'reconciliation', label: 'Reconciliation' },
  { id: 'reports', label: 'Reports' },
];
const memberSections: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments' },
  { id: 'methods', label: 'Payment methods' },
  { id: 'statements', label: 'Statements' },
];

function RoleSelector({ value, onChange }: { value: DashboardView; onChange: (view: DashboardView) => void }) {
  return (
    <div className="matt-role-selector matt-role-selector--nav" role="group" aria-label="Matt Money workspace">
      <button type="button" className={value === 'admin' ? 'is-active' : ''} aria-pressed={value === 'admin'} onClick={() => onChange('admin')}>Administrator</button>
      <button type="button" className={value === 'member' ? 'is-active' : ''} aria-pressed={value === 'member'} onClick={() => onChange('member')}>Member</button>
    </div>
  );
}

function FinanceNavigation({ view, section, onViewChange, onSectionChange }: {
  view: DashboardView;
  section: SectionId;
  onViewChange: (view: DashboardView) => void;
  onSectionChange: (section: SectionId) => void;
}) {
  const sections = view === 'admin' ? adminSections : memberSections;
  return (
    <div className="matt-finance-nav" data-workspace={view}>
      <nav className="matt-finance-nav__modules" aria-label={`${view === 'admin' ? 'Administrator' : 'Member'} finance modules`}>
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? 'is-active' : ''}
            onClick={() => onSectionChange(item.id)}
            aria-current={section === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="matt-finance-nav__workspace">
        <span className="matt-finance-nav__workspace-label">Workspace</span>
        <RoleSelector value={view} onChange={onViewChange} />
      </div>
    </div>
  );
}

const sectionContent: Record<Exclude<SectionId, 'overview'>, { eyebrow: string; title: string; description: string; metrics: Array<[string,string]>; rows: Array<[string,string,string]> }> = {
  billing: { eyebrow: 'Administrator · Billing', title: 'Billing workspace', description: 'Create, review, and follow up on organization charges from one place.', metrics: [['63','Open charges'],['$840K','Outstanding'],['18','Due this week']], rows: [['Term 1 tuition','63 accounts','$840,000'],['Student activity fees','42 accounts','$31,500'],['Transportation','18 accounts','$12,600']] },
  payments: { eyebrow: 'Payments', title: 'Payment activity', description: 'Review recent payment activity and payment processing status.', metrics: [['128','This month'],['$1.21M','Collected'],['99.2%','Successful']], rows: [['Tuition batch','Received','$450,000'],['Sunday offertory','Received','$86,500'],['Card settlement','Processing','$42,780']] },
  reconciliation: { eyebrow: 'Administrator · Reconciliation', title: 'Reconciliation', description: 'Match deposits, settlements, and ledger activity before monthly close.', metrics: [['24','Matched today'],['3','Needs review'],['Aug 31','Next close']], rows: [['Bank deposit 8241','Matched','$186,400'],['Card settlement 778','Matched','$42,780'],['Manual adjustment','Review','$1,250']] },
  reports: { eyebrow: 'Administrator · Reports', title: 'Finance reports', description: 'Standard operational and accounting reports for your organization.', metrics: [['12','Saved reports'],['4','Scheduled'],['Today','Last refresh']], rows: [['A/R aging','Ready','PDF / CSV'],['Collections summary','Ready','PDF / CSV'],['Monthly reconciliation','Ready','PDF / CSV']] },
  methods: { eyebrow: 'Member · Payment methods', title: 'Payment methods', description: 'Manage the payment methods available for your household account.', metrics: [['2','Saved methods'],['1','Primary'],['Active','Auto-pay']], rows: [['Visa •••• 2481','Primary','Expires 08/29'],['Bank •••• 7342','Backup','Verified']] },
  statements: { eyebrow: 'Member · Statements', title: 'Statements', description: 'Review and download household statements and annual payment history.', metrics: [['8','Statements'],['$7,480','Paid this year'],['Aug 2026','Latest']], rows: [['August 2026','Ready','$1,050.00'],['July 2026','Ready','$1,230.00'],['June 2026','Ready','$1,050.00']] },
};

function SectionWorkspace({ section }: { section: Exclude<SectionId, 'overview'> }) {
  const { showToast } = useToast();
  const content = sectionContent[section];
  return <section className="matt-module-workspace"><header><div><span>{content.eyebrow}</span><h2>{content.title}</h2><p>{content.description}</p></div><button type="button" onClick={() => showToast(`${content.title} export prepared`)}>Export</button></header><div className="matt-module-metrics">{content.metrics.map(([value,label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div><div className="matt-module-table"><div className="matt-module-table__head"><span>Item</span><span>Status</span><span>Amount / detail</span></div>{content.rows.map((row) => <div key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><b>{row[2]}</b></div>)}</div></section>;
}

export function MattMoneyPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const view: DashboardView = searchParams.get('view') === 'member' ? 'member' : 'admin';
  const allowedSections = view === 'admin' ? adminSections : memberSections;
  const requestedSection = searchParams.get('section') as SectionId | null;
  const section: SectionId = allowedSections.some((item) => item.id === requestedSection) ? requestedSection! : 'overview';
  const updateParams = (nextView: DashboardView, nextSection: SectionId) => { const updated = new URLSearchParams(searchParams); updated.set('view', nextView); updated.set('section', nextSection); setSearchParams(updated, { replace: true }); };
  const setView = (next: DashboardView) => updateParams(next, 'overview');
  const setSection = (next: SectionId) => updateParams(view, next);
  const currentLabel = allowedSections.find((item) => item.id === section)?.label ?? 'Overview';
  const roleLabel = view === 'admin' ? 'Administrator' : 'Member';
  const pageTitle = section === 'overview' ? (view === 'admin' ? 'Finance overview' : 'Account overview') : currentLabel;

  return (
    <AppLayout app={app} className="matt-money-app">
      <main className="dashboard-content dashboard-stack matt-money-shell">
        <FinanceNavigation view={view} section={section} onViewChange={setView} onSectionChange={setSection}/>
        <DashboardHeader
          eyebrow={`Matt Money · ${roleLabel} workspace`}
          title={pageTitle}
          status={<span className="matt-account-status">{view === 'admin' ? 'Organization account' : 'Household account'}</span>}
          actions={<button type="button" className="action-secondary matt-header-export" onClick={() => showToast(view === 'admin' ? 'Financial report export prepared' : 'Statement download prepared')}>{view === 'admin' ? 'Export report' : 'Download statement'}</button>}
        />
        {section === 'overview' ? (view === 'admin' ? <MattMoneyAdminDashboard/> : <MattMoneyMemberDashboard/>) : <SectionWorkspace section={section as Exclude<SectionId,'overview'>}/>} 
      </main>
    </AppLayout>
  );
}
