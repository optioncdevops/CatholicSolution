import { FileTextIcon, PhoneIcon, ShieldCheckIcon } from './ArcAlertsIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import archangelGabriel from '@/solution/assets/archangel-gabriel.png';

const steps = [
  <>Dial the toll-free number, <strong>1-877-251-8899</strong>.</>,
  <>When prompted, enter your <strong>Organization ID Number</strong> and press #. Then enter your 4-digit <strong>Organization PIN Number</strong> and press #.</>,
  <>Choose a recipient group: <strong>Students’ Parents & Staff (1)</strong>, <strong>Students’ Parents Only (2)</strong>, or <strong>Staff Only (3)</strong>.</>,
  <>Record your voice message after the tone and press # when finished. Press <strong>1</strong> to accept the alert or <strong>2</strong> to record it again.</>,
  <>You’ll receive a confirmation number. Press <strong>1</strong> to hear it again, or any other key to send and complete the Voice Alert.</>,
];

export function ArcAlertsAbout() {
  const { showToast } = useToast();
  return (
    <div className="grid gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">About</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">About ArcAlerts</h1></div>

      <section className="surface-card overflow-hidden">
        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-4">
            <img src={archangelGabriel} alt="Archangel Gabriel artwork used by ArcAlerts" className="mx-auto h-full max-h-[300px] w-full rounded-xl border border-amber-200 object-cover shadow-sm" />
          </div>
          <div className="p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-orange-700"><ShieldCheckIcon size={14} />Emergency communication</span>
            <h2 className="mt-4 text-xl font-extrabold text-slate-900">Flexible notifications for schools and staff</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">OptionC’s ArcAlerts is a flexible notification system that allows you to communicate quickly with your students’ parents and your staff. You can use ArcAlerts to communicate weather-related closings, changes in schedules, reminders for events, or other types of notifications.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {['Weather closings', 'Schedule changes', 'Event reminders'].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-700">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-600">Voice alert</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">Send a Voice Alert From Your Phone</h2></div><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700"><PhoneIcon size={19} /></span></div>
          <p className="mt-2 text-sm text-slate-500">Send a message directly from your phone using the guided call flow below.</p>
          <ol className="mt-4 grid gap-3">{steps.map((step, index) => <li key={index} className="grid grid-cols-[30px_1fr] gap-3 text-sm leading-6 text-slate-600"><span className="grid size-7 place-items-center rounded-full bg-slate-900 text-[11px] font-black text-white">{index + 1}</span><span>{step}</span></li>)}</ol>
          <button type="button" onClick={() => showToast('Printable voice alert instructions would open here')} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"><FileTextIcon size={16} />Print these instructions</button>
        </div>
        <aside className="surface-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Phone credentials</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-600">Organization ID</span><strong className="mt-1 block text-xl text-slate-900">19997</strong></div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-600">Organization PIN</span><strong className="mt-1 block text-xl text-slate-900">1910</strong></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Keep these values available to authorized staff who may need to send phone-based voice alerts.</p>
        </aside>
      </section>
    </div>
  );
}
