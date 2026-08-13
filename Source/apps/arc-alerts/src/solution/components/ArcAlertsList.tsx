import { useState } from 'react';
import { EyeIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';

const alerts = [
  { title: 'Weather advisory', type: 'Weather', audience: 'All families', channels: 'Text · Email · Voicemail', sent: 'Today, 10:42 AM', delivered: '2,314 / 2,340', status: 'Delivered' },
  { title: 'Route 4 delay', type: 'Transportation', audience: 'Transport group', channels: 'Text · Voicemail', sent: 'Today, 8:14 AM', delivered: '186 / 188', status: 'Delivered' },
  { title: 'School reopening reminder', type: 'General', audience: 'All school contacts', channels: 'Text · Email', sent: 'Yesterday, 4:30 PM', delivered: '1,874 / 1,891', status: 'Delivered' },
  { title: 'Parish event update', type: 'Event', audience: 'Parish families', channels: 'Email · Voicemail', sent: 'Yesterday, 2:15 PM', delivered: '482 / 486', status: 'Pending' },
  { title: 'Safety drill notice', type: 'Emergency', audience: 'Staff only', channels: 'Text · Email · Voicemail', sent: 'Aug 4, 9:00 AM', delivered: '46 / 46', status: 'Delivered' },
] as const;

export function ArcAlertsList() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const filtered = alerts.filter((item) => `${item.title} ${item.type} ${item.audience}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All' || item.status === status));
  return (
    <div className="grid gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">History</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Alert List</h1></div>
      <section className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4"><label className="flex min-h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-orange-300 focus-within:bg-white"><SearchIcon size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts, audience, or type" className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600"><option>All</option><option>Delivered</option><option>Pending</option></select><button type="button" onClick={() => showToast('Prototype alert-history export prepared')} className="action-secondary">Export</button></div>
        <div className="overflow-x-auto"><table className="cs-enterprise-table w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Alert</th><th className="px-4 py-3">Audience</th><th className="px-4 py-3">Channels</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3">Delivered</th><th className="px-4 py-3">Status</th><th className="w-16 px-5 py-3 text-center"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.title} className="hover:bg-orange-50/30"><td className="px-5 py-3"><strong className="block text-sm text-slate-800">{item.title}</strong><span className="text-[10px] font-bold text-slate-400">{item.type}</span></td><td className="px-4 py-3 text-xs font-semibold text-slate-600">{item.audience}</td><td className="px-4 py-3 text-xs text-slate-500">{item.channels}</td><td className="px-4 py-3 text-xs text-slate-500">{item.sent}</td><td className="px-4 py-3 text-xs font-bold text-slate-700">{item.delivered}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${item.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td><td className="px-5 py-3 text-center"><button type="button" onClick={() => showToast(`${item.title} details opened`)} className="inline-grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 focus-visible:ring-offset-2" aria-label={`View ${item.title} details`} title="View alert details"><EyeIcon size={16} /></button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
