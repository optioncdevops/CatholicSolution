import { useState } from 'react';
import { useToast } from '@shared/app/components/ToastProvider';

const groups = ['All families', 'All staff', 'Students’ parents & staff', 'Students’ parents only', 'Staff only', 'Parish families', 'Transportation group'];
const channels = ['Text', 'Email', 'Voicemail', 'Push'] as const;

export function ArcAlertsNewAlert() {
  const { showToast } = useToast();
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Text', 'Email', 'Push']);
  const [message, setMessage] = useState('');
  const toggleChannel = (channel: string) => setSelectedChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Compose</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">New Alert</h1></div><span className="text-xs font-bold text-slate-400">Multi-channel notification</span></div>
      <section className="surface-card overflow-hidden">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
          <form className="grid gap-5 p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); showToast(selectedChannels.length ? 'Prototype alert validated and queued ✓' : 'Select at least one delivery channel'); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Alert title<input required placeholder="e.g. Early dismissal notice" className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none focus:border-orange-300 focus:bg-white focus:ring-3 focus:ring-orange-100" /></label>
              <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Alert type<select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-3 focus:ring-orange-100"><option>General notice</option><option>Emergency</option><option>Weather</option><option>Transportation</option><option>Event reminder</option><option>Schedule change</option></select></label>
            </div>
            <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Recipients<select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-3 focus:ring-orange-100">{groups.map((group) => <option key={group}>{group}</option>)}</select></label>
            <div><span className="text-xs font-extrabold text-slate-700">Delivery channels</span><div className="mt-2 flex flex-wrap gap-2">{channels.map((channel) => { const active = selectedChannels.includes(channel); return <button key={channel} type="button" onClick={() => toggleChannel(channel)} aria-pressed={active} className={`min-h-10 rounded-xl border px-4 text-xs font-extrabold ${active ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500'}`}>{active ? '✓ ' : ''}{channel}</button>; })}</div></div>
            <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Message<textarea required value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} rows={7} placeholder="Write a clear, actionable message for recipients..." className="resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none focus:border-orange-300 focus:bg-white focus:ring-3 focus:ring-orange-100" /><span className="justify-self-end text-[10px] font-bold text-slate-400">{message.length}/500</span></label>
            <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Send<select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold"><option>Immediately</option><option>Schedule for later</option></select></label><label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Priority<select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold"><option>Normal</option><option>High</option><option>Emergency</option></select></label></div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => showToast('Preview generated')} className="action-secondary">Preview</button><button type="button" onClick={() => showToast('Draft saved')} className="action-secondary">Save draft</button><button type="submit" className="action-primary bg-gradient-to-r from-orange-600 to-red-600 px-5 text-white">Send alert</button></div>
          </form>
          <aside className="border-t border-slate-200 bg-slate-50 p-5 xl:border-l xl:border-t-0">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Pre-send checklist</p>
            <div className="mt-4 grid gap-3">{['Audience is correct', 'Message is concise and actionable', 'Required channels are selected', 'Time-sensitive details are verified'].map((item) => <div key={item} className="flex gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-600"><span className="text-emerald-600">✓</span>{item}</div>)}</div>
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-orange-800"><strong className="block">Emergency alerts</strong>Use emergency priority only for urgent safety, closure, or time-critical communication.</div>
          </aside>
        </div>
      </section>
    </div>
  );
}
