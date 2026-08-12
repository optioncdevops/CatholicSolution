import { useState } from 'react';
import { useToast } from '@shared/app/components/ToastProvider';

const preferenceItems = [
  ['Delivery confirmations', 'Notify me when an alert has completed delivery.'],
  ['Failed-delivery warnings', 'Notify me when a channel falls below the configured success threshold.'],
  ['Scheduled alert reminders', 'Remind me 15 minutes before a scheduled alert is sent.'],
  ['Daily activity digest', 'Send a daily summary when ArcAlerts has communication activity.'],
] as const;

export function ArcAlertsPreferences() {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ 'Delivery confirmations': true, 'Failed-delivery warnings': true, 'Scheduled alert reminders': true, 'Daily activity digest': false });
  return (
    <div className="grid gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Personalization</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">User Preferences</h1></div>
      <section className="surface-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div><h2 className="text-base font-extrabold text-slate-900">Notifications</h2><div className="mt-4 divide-y divide-slate-100">{preferenceItems.map(([title, detail]) => <button key={title} type="button" onClick={() => setEnabled((current) => ({ ...current, [title]: !current[title] }))} aria-pressed={enabled[title]} className="flex w-full items-center justify-between gap-4 py-4 text-left"><span><strong className="block text-sm text-slate-800">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{detail}</span></span><span className={`relative h-6 w-11 shrink-0 rounded-full ${enabled[title] ? 'bg-orange-500' : 'bg-slate-300'}`}><i className={`absolute top-1 size-4 rounded-full bg-white transition-all ${enabled[title] ? 'left-6' : 'left-1'}`} /></span></button>)}</div></div>
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-extrabold text-slate-900">Compose defaults</h2><div className="mt-4 grid gap-4"><label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Default audience<select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold"><option>All families</option><option>All staff</option><option>Students’ parents & staff</option></select></label><label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Default alert type<select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold"><option>General notice</option><option>Weather</option><option>Emergency</option></select></label><label className="grid gap-1.5 text-xs font-extrabold text-slate-700">Time display<select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold"><option>12-hour</option><option>24-hour</option></select></label></div></aside>
        </div>
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4"><button type="button" onClick={() => showToast('ArcAlerts prototype preferences saved ✓')} className="action-primary bg-slate-900 px-5 text-white">Save preferences</button></div>
      </section>
    </div>
  );
}
