import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';

const schedule = [
  { item: 'Tuition · September installment', date: 'Sep 1, 2026', amount: '$1,050.00', status: 'Auto-pay' },
  { item: 'Student activity fee', date: 'Sep 10, 2026', amount: '$125.00', status: 'Scheduled' },
  { item: 'Lunch program', date: 'Sep 15, 2026', amount: '$65.00', status: 'Optional' },
] as const;

const payments = [
  { date: 'Aug 1', description: 'Tuition · August installment', amount: '$1,050.00', method: 'Visa •••• 2481' },
  { date: 'Jul 15', description: 'Technology fee', amount: '$180.00', method: 'Visa •••• 2481' },
  { date: 'Jul 1', description: 'Tuition · July installment', amount: '$1,050.00', method: 'Bank •••• 7342' },
] as const;

export function MattMoneyMemberDashboard() {
  const { showToast } = useToast();
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-teal-700 to-emerald-500 p-5 text-white shadow-[0_18px_40px_rgba(5,150,105,.15)] md:col-span-1"><span className="metric-label text-white/70">Amount due</span><h2 className="mt-3 font-display text-3xl font-extrabold">$1,240.00</h2><p className="mt-2 text-xs font-semibold text-white/75">Due September 1, 2026</p><button type="button" onClick={() => showToast('Secure payment flow would open here')} className="mt-5 min-h-10 rounded-xl bg-white px-4 text-xs font-extrabold text-emerald-800 shadow-sm hover:bg-emerald-50">Make a payment</button></article>
        <article className="surface-card p-5"><span className="metric-label text-slate-400">Next auto-pay</span><h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900">$1,050.00</h2><p className="mt-2 text-xs font-semibold text-slate-500">Sep 1 · Visa ending 2481</p><div className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">✓ Auto-pay is active</div></article>
        <article className="surface-card p-5"><span className="metric-label text-slate-400">Paid this year</span><h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900">$7,480.00</h2><p className="mt-2 text-xs font-semibold text-slate-500">12 successful payments</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[72%] rounded-full bg-emerald-500" /></div><p className="mt-2 text-[10px] font-bold text-slate-400">72% of annual plan complete</p></article>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <section className="surface-card overflow-hidden"><div className="p-5 pb-3 sm:p-6 sm:pb-3"><PanelHeader title="Upcoming charges" description="Scheduled items for your household account" /></div><div className="overflow-x-auto"><table className="cs-enterprise-table w-full min-w-[620px] border-collapse text-left"><thead><tr className="border-y border-slate-100 bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><th className="px-5 py-3 sm:px-6">Item</th><th className="px-3 py-3">Due date</th><th className="px-3 py-3">Amount</th><th className="px-5 py-3 sm:px-6">Payment</th></tr></thead><tbody>{schedule.map((row) => <tr key={row.item} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 text-xs font-extrabold text-slate-800 sm:px-6">{row.item}</td><td className="px-3 py-4 text-xs text-slate-500">{row.date}</td><td className="px-3 py-4 text-xs font-extrabold text-slate-800">{row.amount}</td><td className="px-5 py-4 sm:px-6"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">{row.status}</span></td></tr>)}</tbody></table></div></section>
        <section className="surface-card p-5 sm:p-6"><PanelHeader title="Payment methods" description="Methods available for your account" /><div className="mt-4 grid gap-3"><button type="button" onClick={() => showToast('Payment method details would open here')} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-emerald-200 hover:bg-emerald-50"><span><strong className="block text-xs text-slate-800">Visa •••• 2481</strong><small className="mt-1 block text-[10px] font-semibold text-slate-400">Primary · Expires 08/29</small></span><span className="text-xs font-extrabold text-emerald-700">Manage</span></button><button type="button" onClick={() => showToast('Add payment method flow would open here')} className="action-secondary justify-center border border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-700">+ Add payment method</button></div></section>
      </div>

      <section className="surface-card overflow-hidden"><div className="p-5 pb-3 sm:p-6 sm:pb-3"><PanelHeader title="Recent payments" description="Latest successful household transactions" /></div><div className="grid divide-y divide-slate-100">{payments.map((payment) => <div key={`${payment.date}-${payment.description}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_8rem] sm:items-center sm:px-6"><span className="text-[11px] font-bold text-slate-400">{payment.date}</span><strong className="text-xs text-slate-800">{payment.description}</strong><span className="text-xs text-slate-500">{payment.method}</span><span className="text-right text-xs font-extrabold text-emerald-700">{payment.amount}</span></div>)}</div></section>
    </>
  );
}
