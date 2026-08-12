import { AlertTriangleIcon, BellIcon, CheckCircleIcon, MailIcon, MessageIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';

const practices = [
  { icon: AlertTriangleIcon, title: 'Use emergency priority intentionally', detail: 'Reserve emergency priority for safety incidents, closures, evacuations, or similarly urgent situations.' },
  { icon: MessageIcon, title: 'Lead with the action', detail: 'Put the most important instruction first. Keep text alerts concise and avoid unnecessary context.' },
  { icon: BellIcon, title: 'Use multiple channels for critical alerts', detail: 'For urgent notices, combine text, email, voicemail, and push so recipients have more than one path to the message.' },
  { icon: MailIcon, title: 'Use clear subject lines', detail: 'For email, identify the organization, topic, and urgency without using all caps or vague wording.' },
  { icon: ShieldCheckIcon, title: 'Verify audience and timing', detail: 'Double-check the recipient group, dates, locations, and schedule before sending or scheduling a message.' },
  { icon: CheckCircleIcon, title: 'Review delivery results', detail: 'Check completion and failed-delivery patterns after important communications and follow up when necessary.' },
] as const;

export function ArcAlertsBestPractices() {
  return (
    <div className="grid gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Guidance</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Best Practices</h1></div>
      <section className="surface-card p-5 sm:p-6"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{practices.map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="grid size-10 place-items-center rounded-xl bg-white text-orange-600 shadow-sm"><Icon size={18} /></span><h2 className="mt-4 text-sm font-extrabold text-slate-900">{title}</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">{detail}</p></article>)}</div></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="surface-card p-5"><h2 className="text-sm font-extrabold text-slate-900">Before you send</h2><div className="mt-3 grid gap-2">{['Correct audience selected', 'Clear call to action included', 'Dates, times, and locations verified', 'Spelling and phone numbers reviewed', 'Appropriate channels selected'].map((item) => <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="text-emerald-600">✓</span>{item}</div>)}</div></div><div className="surface-card p-5"><h2 className="text-sm font-extrabold text-slate-900">After you send</h2><div className="mt-3 grid gap-2">{['Confirm overall delivery rate', 'Review channel failures', 'Resend or follow up when needed', 'Archive duplicate drafts', 'Document emergency communications'].map((item) => <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="text-orange-600">→</span>{item}</div>)}</div></div></section>
    </div>
  );
}
