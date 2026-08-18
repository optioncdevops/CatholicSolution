import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@shared/app/components/KpiCard';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';

const recentAlerts = [
  ['WX', 'Weather advisory', 'All families · 10:42 AM', 'Delivered'],
  ['TR', 'Route 4 delay', 'Transport group · 8:14 AM', 'Delivered'],
  ['RM', 'School reopening reminder', 'All school contacts · Yesterday', 'Delivered'],
  ['EV', 'Parish event update', 'Parish families · Yesterday', 'Pending'],
] as const;
const channels = [['Text', '99.2%', 99], ['Email', '98.7%', 98], ['Voicemail', '96.4%', 96]] as const;

export function ArcAlertsHome() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Home</p>
          <h1 className="dashboard-heading">Communication overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="portal-status-badge portal-status-badge--success">All systems operational</span>
          <button type="button" onClick={() => navigate('/new-alert')} className="action-primary arc-primary-action">+ New alert</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Reachable contacts" value="2,340" detail="+18 this month" accentClass="bg-orange-500" icon="C" />
        <KpiCard label="Delivery rate" value="98.6%" detail="+0.8% vs last month" accentClass="bg-orange-500" icon="%" />
        <KpiCard label="Average delivery" value="42 sec" detail="Target under 60 sec" accentClass="bg-orange-500" icon="T" />
        <KpiCard label="Active incidents" value="0" detail="All systems clear" accentClass="bg-orange-500" icon="0" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <section className="surface-card p-4 sm:p-5">
          <PanelHeader title="Delivery trend" description="Successful deliveries across all channels during the last seven days" action={<span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-extrabold text-orange-700">98.6% current</span>} />
          <svg viewBox="0 0 1000 250" className="mt-2 h-auto w-full" role="img" aria-label="Delivery trend line chart">
            <defs><linearGradient id="alertLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f97316" /><stop offset="1" stopColor="#dc2626" /></linearGradient><linearGradient id="alertArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fb923c" stopOpacity="0.25" /><stop offset="1" stopColor="#fb923c" stopOpacity="0" /></linearGradient></defs>
            {[40,90,140,190].map((y) => <line key={y} x1="45" y1={y} x2="970" y2={y} stroke="#eee4dd" />)}
            <path d="M55 180 C170 160,220 95,335 115 S520 60,620 85 S790 45,955 65 L955 215 L55 215 Z" fill="url(#alertArea)" />
            <path d="M55 180 C170 160,220 95,335 115 S520 60,620 85 S790 45,955 65" fill="none" stroke="url(#alertLine)" strokeWidth="4" strokeLinecap="round" />
            {([[55,180],[210,125],[365,110],[520,82],[675,78],[815,55],[955,65]] as const).map(([x,y], index) => <circle key={index} cx={x} cy={y} r="6" fill="white" stroke="#f97316" strokeWidth="3" />)}
            {['Thu','Fri','Sat','Sun','Mon','Tue','Wed'].map((day, index) => <text key={day} x={55 + index * 150} y="240" fontSize="12" fontWeight="700" fill="#94a0b8">{day}</text>)}
          </svg>
        </section>

        <section className="surface-card p-4 sm:p-5">
          <PanelHeader title="Delivery by channel" description="Provider-level performance" />
          <div className="mt-4 grid gap-3">{channels.map(([label, value, percent]) => <div key={label}><div className="mb-1.5 flex justify-between text-xs font-bold"><span className="text-slate-700">{label}</span><span className="text-slate-400">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-orange-50"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600" style={{ width: `${percent}%` }} /></div></div>)}</div>
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><strong className="block">All providers operational</strong>SMS, email, and voicemail services are reporting normally.</div>
        </section>
      </div>

      <section className="surface-card overflow-hidden">
        <div className="p-4 pb-2 sm:px-5"><PanelHeader title="Recent alerts" description="Latest communication activity" action={<button type="button" onClick={() => navigate('/alerts')} className="text-xs font-extrabold text-orange-700 hover:underline">View all →</button>} /></div>
        <div className="grid divide-y divide-orange-50 lg:grid-cols-2 lg:divide-x lg:divide-y-0">{recentAlerts.map(([icon, title, detail, status]) => <button key={title} type="button" onClick={() => showToast(`${title} details would open here`)} className="flex items-center gap-3 px-5 py-3.5 text-left hover:bg-orange-50/50"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-orange-100 bg-orange-50">{icon}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-800">{title}</strong><span className="mt-0.5 block text-xs text-slate-400">{detail}</span></span><span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{status}</span></button>)}</div>
      </section>
    </div>
  );
}
