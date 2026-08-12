import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { KpiCard } from '@shared/app/components/KpiCard';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';

const app = getAppById('optionc-parish')!;
const masses = [['Today 6:30 PM', 'Feast of the Transfiguration — Solemn Mass', 'Fr. Robert · Choir & altar servers confirmed'], ['Fri 6:00 AM', 'First Friday Mass & Adoration', 'Adoration until 9:00 AM · Main chapel'], ['Sat 5:00 PM', 'Confessions, then Vigil Mass 6:00 PM', 'Two confessors available'], ['Sun 8 & 10 AM', 'Sunday Masses + 12:00 PM Family Mass', "Family Mass — children's liturgy of the Word"]] as const;
const events = [['AUG', '09', 'House blessing — Fernandes family', 'Confirmed · Fr. Robert · 4:30 PM'], ['AUG', '10', "Confirmation — Bishop's visit", 'Grade 10 candidates · rehearsal Aug 9, 5 PM'], ['AUG', '15', 'Assumption of Mary — Holy Day', 'Masses 6:30 AM, 12:10 PM & 7:00 PM'], ['AUG', '24', 'First Communion — Batch 4', '22 children · classes on track']] as const;
const columns = [
  { title: 'New', color: 'bg-blue-500', cards: [['Baptism request', 'Maria Fernandes', 'Aug 12'], ['Mass intention', 'Thomas family', 'Aug 10']] },
  { title: 'Preparation', color: 'bg-amber-500', cards: [['First Communion', '12 candidates', 'Aug 20'], ['Marriage preparation', 'Joseph & Anu', 'Sep 02']] },
  { title: 'Scheduled', color: 'bg-violet-500', cards: [['Confirmation', '24 candidates', 'Aug 25'], ['House blessing', 'D’Souza family', 'Aug 14']] },
  { title: 'Completed', color: 'bg-emerald-500', cards: [['Baptism certificate', 'Aaron Mathew', 'Aug 03'], ['Marriage register', 'Peter & Lina', 'Jul 29']] },
];

export function OptionCParishPage() {
  const { showToast } = useToast();
  return (
    <AppLayout app={app} className="bg-gradient-to-br from-[#f4f3ff] to-[#fbf3ff]">
      <main className="dashboard-content dashboard-stack">
        <DashboardHeader
          eyebrow="Parish administration"
          title="St. Joseph's Parish"
          status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">486 families active</span>}
          actions={<button type="button" onClick={() => showToast('Parish report would open here')} className="action-secondary border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50">Parish report</button>}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Registered families" value="486" detail="+6 new this month" accentClass="bg-emerald-500" icon="👪" />
          <KpiCard label="Open requests" value="12" detail="2 need attention" accentClass="bg-violet-500" icon="✝" />
          <KpiCard label="Masses this week" value="11" detail="incl. 2 feast-day Masses" accentClass="bg-amber-500" icon="🕯" />
          <KpiCard label="Offertory · August" value="$86,500" detail="+12% vs July" accentClass="bg-blue-500" icon="$" />
          <KpiCard label="Sacraments YTD" value="73" detail="28 baptisms · 22 communions" accentClass="bg-rose-500" icon="📜" />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="surface-card p-5">
            <PanelHeader title="This week at St. Joseph's" description="Upcoming Mass schedule" action={<button type="button" onClick={() => showToast('Full Mass schedule would open here')} className="text-xs font-extrabold text-emerald-700 hover:underline hover:underline-offset-4">View schedule →</button>} />
            <div className="mt-3 divide-y divide-slate-100">{masses.map(([time, title, place]) => <button key={`${time}-${title}`} type="button" onClick={() => showToast(`${title} details would open here`)} className="flex w-full items-center gap-3 py-3 text-left"><span className="min-w-20 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-center text-xs font-extrabold text-emerald-700">{time}</span><span><strong className="block text-sm text-slate-800">{title}</strong><span className="mt-0.5 block text-xs text-slate-400">{place}</span></span></button>)}</div>
          </section>

          <section className="surface-card p-5">
            <PanelHeader title="Upcoming events" description="Next parish activities" />
            <div className="mt-3 divide-y divide-slate-100">{events.map(([month, day, title, detail]) => <button key={title} type="button" onClick={() => showToast(`${title} details would open here`)} className="flex w-full gap-3 py-3 text-left"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-center"><span><small className="block text-[8px] font-extrabold text-violet-600">{month}</small><strong className="font-display text-base text-slate-800">{day}</strong></span></span><span className="min-w-0"><strong className="block truncate text-sm text-slate-800">{title}</strong><span className="mt-1 block text-xs text-slate-400">{detail}</span></span></button>)}</div>
          </section>

          <section className="surface-card p-5">
            <PanelHeader title="Offertory & giving" description="Synced financial snapshot" action={<button type="button" onClick={() => showToast('Opening Matt Money')} className="text-xs font-extrabold text-teal-700 hover:underline hover:underline-offset-4">Open Matt Money →</button>} />
            <div className="mt-5 grid gap-4">{([['Sunday offertory', '$52,300', 82, 'bg-emerald-500'], ['Online giving', '$24,700', 46, 'bg-teal-500'], ['Candles & intentions', '$9,500', 22, 'bg-amber-500']] as const).map(([label, value, width, color]) => <div key={label}><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-slate-700">{label}</span><span className="text-slate-400">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-violet-50"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div></div>)}</div>
            <p className="mt-4 rounded-xl border border-dashed border-violet-100 bg-violet-50/45 p-3 text-[11px] leading-5 text-slate-500">Building-fund pledge drive is at 68% of its $500K goal. Online giving is up 21% since the parish app launch.</p>
          </section>
        </div>

        <section className="surface-card p-5">
          <PanelHeader title="Recent sacrament records" description="Latest completed sacramental entries" action={<button type="button" onClick={() => showToast('Sacrament register would open here')} className="action-primary bg-emerald-800 text-white hover:bg-emerald-900">Open register</button>} />
          <div className="mt-4 grid gap-3 md:grid-cols-3">{([['✝️', 'Rodrigues family', 'Baptism · Aug 02 · Fr. Robert'], ['🕯️', 'Almeida', 'Mass intention · Aug 03 · Recorded'], ['💍', "D'Cruz & Nayak", 'Marriage · Jul 26 · Certificate issued']] as const).map(([icon, name, detail]) => <article key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="grid size-9 place-items-center rounded-lg bg-violet-100">{icon}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-800">{name}</strong><span className="text-xs text-slate-400">{detail}</span></span><button type="button" onClick={() => showToast(`Certificate for ${name} would open here`)} className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700 hover:bg-emerald-100">Certificate</button></article>)}</div>
        </section>

        <section>
          <PanelHeader title="Request board" description="Sacrament and parish service workflow" action={<button type="button" onClick={() => showToast('New parish request form would open here')} className="action-primary bg-emerald-800 text-white hover:bg-emerald-900">+ Add request</button>} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">{columns.map((column) => <div key={column.title} className="rounded-2xl border border-violet-100 bg-white/75 p-3 shadow-[var(--shadow-soft)] backdrop-blur"><div className="flex items-center justify-between px-1 pb-3"><h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700"><span className={`mr-2 inline-block size-2 rounded-full ${column.color}`} />{column.title}</h3><span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-extrabold text-violet-700">{column.cards.length}</span></div>{column.cards.map(([title, owner, due]) => <button key={title} type="button" onClick={() => showToast(`${title} details would open here`)} className="mb-2.5 w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-violet-200 hover:shadow-[var(--shadow-soft)]"><strong className="block text-sm text-slate-800">{title}</strong><span className="mt-1 block text-xs text-slate-400">{owner}</span><span className="mt-3 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold text-violet-700">Due {due}</span></button>)}</div>)}</div>
        </section>
      </main>
    </AppLayout>
  );
}
