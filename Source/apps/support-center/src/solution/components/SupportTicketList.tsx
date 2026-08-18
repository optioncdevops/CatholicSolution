import { useMemo, useState } from 'react';
import { ChevronRightIcon, ClockIcon, PlusIcon } from '@shared/app/components/UiIcons';
import type { SupportTicket } from './supportData';

interface SupportTicketListProps {
  tickets: SupportTicket[];
  selectedId?: string;
  composing?: boolean;
  onOpen: (ticket: SupportTicket) => void;
  onNew: () => void;
}

const statusClass: Record<SupportTicket['status'], string> = {
  Open: 'support-ticket-status support-ticket-status--open',
  'Waiting on you': 'support-ticket-status support-ticket-status--waiting',
  Resolved: 'support-ticket-status support-ticket-status--resolved',
};

export function SupportTicketList({ tickets, selectedId, composing = false, onOpen, onNew }: SupportTicketListProps) {
  const [hideResolved, setHideResolved] = useState(true);
  const visible = useMemo(
    () => tickets.filter((ticket) => !hideResolved || ticket.status !== 'Resolved'),
    [hideResolved, tickets],
  );

  return (
    <section className="support-panel support-ticket-inbox">
      <header className="support-ticket-inbox__head">
        <div className="support-ticket-inbox__title">
          <h2>Your tickets</h2>
          <span>{visible.length} shown</span>
        </div>
        {!composing ? (
          <button type="button" onClick={onNew} className="action-primary support-ticket-inbox__new">
            <PlusIcon size={14} />
            New ticket
          </button>
        ) : null}
        <label className="support-ticket-inbox__filter">
          <input
            type="checkbox"
            checked={hideResolved}
            onChange={(event) => setHideResolved(event.target.checked)}
          />
          Hide resolved
        </label>
      </header>

      <div className="support-ticket-scroll" role="list">
        {visible.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            role="listitem"
            onClick={() => onOpen(ticket)}
            className={`support-ticket-row ${selectedId === ticket.id ? 'is-selected' : ''}`}
          >
            <span className="support-ticket-row__icon" aria-hidden="true"><ClockIcon size={15} /></span>
            <span className="support-ticket-row__body">
              <span className="support-ticket-row__meta">
                <strong>#{ticket.id}</strong>
                <span className={statusClass[ticket.status]}>{ticket.status}</span>
              </span>
              <span className="support-ticket-row__subject">{ticket.subject}</span>
              <span className="support-ticket-row__detail">{ticket.productName} · {ticket.updated}</span>
            </span>
            <ChevronRightIcon size={14} className="support-ticket-row__chevron" />
          </button>
        ))}
        {!visible.length ? (
          <div className="support-ticket-empty">No tickets match this view.</div>
        ) : null}
      </div>
    </section>
  );
}
