import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { KpiCard } from '@shared/app/components/KpiCard';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';

const transactions = [
  ['🎓', 'Term 1 tuition batch', 'Fee collection', '+ $450,000', 'Received', true],
  ['⛪', 'Sunday offertory', 'Donations', '+ $86,500', 'Received', true],
  ['🏢', 'Skyline Estates', 'Building rent', '− $240,000', 'Paid', false],
  ['🚌', 'Route 4 bus service', 'Transport', '− $68,000', 'Pending', false],
  ['⛺', 'Camp fee refund — batch 2', 'Refunds', '− $9,850', 'Clearing', false],
] as const;

const budgets = [
  ['School operations', '72% of $1M', 72, 'bg-emerald-500'],
  ['Parish programs', '54% of $600K', 54, 'bg-sky-500'],
  ['Maintenance', '88% of $400K', 88, 'bg-amber-500'],
] as const;

const metrics = [
  { label: 'Pending tuition fees', value: '$840K', detail: '63 students · reminders sent', icon: '⌛', accent: 'bg-rose-500', bars: [40, 55, 48, 70, 62, 90] },
  { label: 'Collected this month', value: '$1.21M', detail: '+8% vs July', icon: '↗', accent: 'bg-emerald-500', bars: [35, 50, 66, 58, 74, 84] },
] as const;

function Sparkline({ bars, accent }: { bars: readonly number[]; accent: string }) {
  return <div className="flex h-9 items-end gap-1.5" aria-hidden="true">{bars.map((height, index) => <span key={index} className={`flex-1 rounded-t-sm ${index === bars.length - 1 ? accent : 'bg-emerald-100'}`} style={{ height: `${height}%` }} />)}</div>;
}

export function MattMoneyAdminDashboard() {
  const { showToast } = useToast();
  return (
    <>
      <DashboardHeader
        eyebrow="Billing & finance · Administrator"
        title="Administrator dashboard"
        status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Account available</span>}
        actions={<button type="button" onClick={() => showToast('Financial report would open here')} className="action-secondary border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">Export report</button>}
      />

      <section aria-label="Account and collection summary" className="grid gap-4 xl:grid-cols-4">
        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-teal-700 to-emerald-500 p-5 text-white shadow-[0_18px_40px_rgba(5,150,105,.16)] sm:p-6 xl:col-span-2">
          <span className="pointer-events-none absolute -bottom-20 -right-16 size-56 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-start justify-between gap-3"><div><p className="metric-label text-white/75">Organization account</p><p className="mt-1 text-xs font-semibold text-white/70">Primary operating account · Available funds</p></div><span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white/90">Primary</span></div>
          <h2 className="relative mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">$4,280,450</h2>
          <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/20 pt-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Account ending</p><p className="mt-1 text-sm font-bold tracking-[0.18em] text-white/90">•••• 4921</p></div><p className="max-w-[18rem] text-right text-[10px] font-extrabold uppercase tracking-wide text-white/80">Primary organization account</p></div>
        </article>
        {metrics.map((metric) => <KpiCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} icon={metric.icon} accentClass={metric.accent} footer={<Sparkline bars={metric.bars} accent={metric.accent} />} />)}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="surface-card overflow-hidden">
          <div className="p-5 pb-3 sm:p-6 sm:pb-3"><PanelHeader title="Recent transactions" action={<button type="button" onClick={() => showToast('Full ledger would open here')} className="text-xs font-extrabold text-emerald-700 hover:underline hover:underline-offset-4">View ledger →</button>} /></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead><tr className="border-y border-slate-100 bg-slate-50/80 text-[10px] uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3 sm:px-6">Payee / Payer</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Amount</th><th className="px-5 py-3 sm:px-6">Status</th></tr></thead><tbody>{transactions.map(([icon, name, category, amount, status, positive]) => <tr key={name} className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/40"><td className="px-5 py-3.5 font-bold text-slate-800 sm:px-6"><span className="mr-3 inline-grid size-9 place-items-center rounded-xl border border-emerald-100 bg-emerald-50">{icon}</span>{name}</td><td className="px-3 py-3.5 text-slate-500">{category}</td><td className={`px-3 py-3.5 font-extrabold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{amount}</td><td className="px-5 py-3.5 sm:px-6"><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${status === 'Received' || status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{status}</span></td></tr>)}</tbody></table></div>
        </section>

        <div className="grid gap-5">
          <section className="surface-card p-5 sm:p-6"><PanelHeader title="Budgets · Term 1" description="Planned utilization across active cost centers" /><div className="mt-5 grid gap-5">{budgets.map(([label, value, percent, accent]) => <div key={label}><div className="mb-2 flex justify-between gap-4 text-xs font-bold"><span className="text-slate-600">{label}</span><span className="text-slate-400">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${accent}`} style={{ width: `${percent}%` }} /></div></div>)}</div></section>
          <section className="surface-card p-5 sm:p-6"><PanelHeader title="Quick actions" description="Common finance operations" /><div className="mt-4 grid gap-2 sm:grid-cols-2">{['🧾 New invoice', '💸 Add expense', '✅ Approvals (5)', '📑 Reports'].map((label) => <button key={label} type="button" onClick={() => showToast(`${label.slice(2)} would open here`)} className="action-secondary justify-start border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">{label}</button>)}</div></section>
        </div>
      </div>
    </>
  );
}
