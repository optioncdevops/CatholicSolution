import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';

const app = getAppById('optionc-school')!;
const calendar = [
  ['Mon', '3', 'Classes', 'bg-blue-50 text-blue-700'],
  ['Tue', '4', 'Classes', 'bg-blue-50 text-blue-700'],
  ['Wed', '5', 'Unit test', 'bg-amber-50 text-amber-700'],
  ['Thu', '6', 'Today', 'bg-white/20 text-white'],
  ['Fri', '7', 'Sports day', 'bg-emerald-50 text-emerald-700'],
  ['Sat', '8', 'Holiday', 'bg-slate-100 text-slate-500'],
  ['Sun', '9', 'Holiday', 'bg-slate-100 text-slate-500'],
] as const;
const approvals = [
  { initials: 'AK', color: 'bg-sky-500', type: 'Student leave', title: 'Arun K · Grade 9B', detail: 'Aug 12–14 · Family function · Parent note attached', approve: 'Approved ✓', reject: 'Sent for review' },
  { initials: 'MS', color: 'bg-pink-500', type: 'Staff leave', title: 'Ms. Meera S', detail: "Aug 6 · Grade 7 Math · Doctor's note attached", approve: 'Approved ✓', reject: 'Sent for review' },
  { initials: 'VR', color: 'bg-violet-500', type: 'Admission', title: 'Vikram R · Grade 6', detail: 'Documents verified · Awaiting final approval', approve: 'Admission approved ✓', reject: 'Sent for review' },
];

export function OptionCSchoolPage() {
  const { showToast } = useToast();
  return (
    <AppLayout app={app} className="school-app">
      <div className="dashboard-content grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid gap-4 xl:sticky xl:top-[88px]">
          <section className="school-profile-card">
            <div className="school-profile-card__identity">
              <div className="school-profile-card__avatar">CL</div>
              <div className="min-w-0"><h2>Carl Lapp</h2><p>School administrator</p></div>
            </div>
            <div className="school-profile-card__stats">
              {([['842', 'Students'], ['46', 'Staff'], ['3', 'Pending']] as const).map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
          </section>

          <section className="surface-card p-5">
            <PanelHeader title="Attendance today" description="Live attendance snapshot" />
            <div className="mt-4 flex items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-full bg-[conic-gradient(#1d4ed8_0_94%,#fbbf24_94%_97%,#d7e4f2_97%_100%)]"><div className="grid size-[58px] place-items-center rounded-full bg-white font-display text-base font-extrabold">94%</div></div>
              <div className="grid min-w-0 gap-2 text-xs font-semibold text-slate-600">
                <span><i className="mr-2 inline-block size-2 rounded bg-blue-700" />791 Present</span>
                <span><i className="mr-2 inline-block size-2 rounded bg-amber-400" />27 Late</span>
                <span><i className="mr-2 inline-block size-2 rounded bg-slate-300" />24 Absent</span>
              </div>
            </div>
          </section>

          <section className="surface-card p-4">
            <PanelHeader title="Quick actions" />
            <div className="mt-2 grid gap-1">
              {['New admission', 'Mark attendance', 'Report cards', 'Staff directory'].map((label) => <button key={label} type="button" onClick={() => showToast(`${label} would open here`)} className="school-quick-action">{label}</button>)}
            </div>
          </section>
        </aside>

        <main className="dashboard-stack min-w-0">
          <DashboardHeader
            eyebrow="School operations"
            title="This week"
            description="Calendar, attendance, and approvals for your school."
            status={<span className="portal-status-badge portal-status-badge--info">Week 32 · Term 1</span>}
            actions={<button type="button" onClick={() => showToast('School overview report would open here')} className="action-secondary">View overview</button>}
          />

          <section className="surface-card p-5 sm:p-6">
            <PanelHeader title="School calendar" description="Seven-day academic and activity schedule" action={<button type="button" onClick={() => showToast('Full timetable would open here')} className="text-xs font-extrabold text-blue-700 hover:underline hover:underline-offset-4">Open timetable →</button>} />
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {calendar.map(([day, date, event, badge], index) => <div key={day} className={`rounded-xl border p-3 text-center ${index === 3 ? 'border-blue-600 bg-gradient-to-br from-blue-700 to-sky-400 text-white shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200'}`}><span className={`text-[10px] font-extrabold uppercase tracking-wide ${index === 3 ? 'text-white/80' : 'text-slate-400'}`}>{day}</span><strong className="my-1.5 block font-display text-lg">{date}</strong><span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-extrabold ${badge}`}>{event}</span></div>)}
            </div>
          </section>

          <section className="surface-card overflow-hidden">
            <div className="p-5 pb-3 sm:p-6 sm:pb-3"><PanelHeader title="Approvals waiting on you" description="Three items need an administrator decision" /></div>
            <div className="divide-y divide-slate-100">
              {approvals.map((item) => <article key={item.title} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6"><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold text-white ${item.color}`}>{item.initials}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-slate-800">{item.title}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-500">{item.type}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p></div><div className="flex gap-2"><button type="button" onClick={() => showToast(item.approve)} className="action-primary bg-blue-700 text-white hover:bg-blue-800">Approve</button><button type="button" onClick={() => showToast(item.reject)} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Review</button></div></article>)}
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
