import { useMemo, useState } from 'react';
import { ChevronRightIcon, ClockIcon, PlusIcon } from '@shared/app/components/UiIcons';
import type { SupportTicket } from './supportData';

interface SupportTicketListProps {
  tickets: SupportTicket[];
  selectedId?: string;
  onOpen: (ticket: SupportTicket) => void;
  onNew: () => void;
}

const statusStyle: Record<SupportTicket['status'], string> = {
  Open: 'bg-sky-50 text-sky-700 ring-sky-100',
  'Waiting on you': 'bg-amber-50 text-amber-700 ring-amber-100',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export function SupportTicketList({ tickets, selectedId, onOpen, onNew }: SupportTicketListProps) {
  const [hideResolved, setHideResolved] = useState(false);
  const visible = useMemo(() => tickets.filter((ticket) => !hideResolved || ticket.status !== 'Resolved'), [hideResolved, tickets]);
  return (
    <section className="support-panel support-ticket-inbox min-h-0">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3"><div><p className="dashboard-kicker text-emerald-700">Your requests</p><h2 className="mt-1 text-base font-extrabold text-slate-950">Support tickets</h2></div><button type="button" onClick={onNew} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-brand-navy px-3 text-[11px] font-extrabold text-white hover:bg-[#173464]"><PlusIcon size={14}/>New ticket</button></div>
        <label className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={hideResolved} onChange={(event) => setHideResolved(event.target.checked)} className="size-4 accent-brand-navy"/>Hide resolved tickets</label>
      </div>
      <div className="support-ticket-scroll divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
        {visible.map((ticket) => (
          <button key={ticket.id} type="button" onClick={() => onOpen(ticket)} className={`group flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-slate-50 sm:px-5 ${selectedId === ticket.id ? 'bg-sky-50/70' : ''}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><ClockIcon size={16}/></span>
            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-950">#{ticket.id}</strong><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ring-1 ${statusStyle[ticket.status]}`}>{ticket.status}</span></span><span className="mt-1 block text-sm font-bold leading-5 text-slate-700">{ticket.subject}</span><span className="mt-1 block text-[11px] text-slate-400">{ticket.productName} · {ticket.updated}</span></span>
            <ChevronRightIcon size={15} className="mt-3 shrink-0 text-slate-300 group-hover:text-slate-600"/>
          </button>
        ))}
        {!visible.length ? <div className="px-5 py-10 text-center text-sm text-slate-500">No support tickets match this view.</div> : null}
      </div>
    </section>
  );
}
