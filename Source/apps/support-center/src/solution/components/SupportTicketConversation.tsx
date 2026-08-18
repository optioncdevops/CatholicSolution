import { useState, type FormEvent } from 'react';
import { FileTextIcon, MessageIcon, PlusIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { SupportTicket } from './supportData';

interface SupportTicketConversationProps {
  ticket: SupportTicket;
  onNewTicket: () => void;
  onCloseTicket: (ticketId: string) => void;
  onReply: (ticketId: string, message: string) => void;
}

export function SupportTicketConversation({
  ticket,
  onNewTicket,
  onCloseTicket,
  onReply,
}: SupportTicketConversationProps) {
  const { user } = useCurrentUser();
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    onReply(ticket.id, body);
    setMessage('');
  };

  const discardReply = () => setMessage('');

  return (
    <section className="support-panel support-conversation-panel">
      <header className="support-conversation-head">
        <div>
          <div className="support-conversation-head__meta">
            <span className="support-conversation-id">#{ticket.id}</span>
            <span className={`support-ticket-status ${
              ticket.status === 'Resolved'
                ? 'support-ticket-status--resolved'
                : ticket.status === 'Waiting on you'
                  ? 'support-ticket-status--waiting'
                  : 'support-ticket-status--open'
            }`}>{ticket.status}</span>
          </div>
          <h2>{ticket.subject}</h2>
          <p>{ticket.productName} · {ticket.contact} · Updated {ticket.updated}</p>
        </div>
        <button type="button" onClick={onNewTicket} className="action-secondary support-conversation-new">
          <PlusIcon size={14} />
          New ticket
        </button>
      </header>

      <div className="support-conversation-thread" aria-label={`Conversation for ticket ${ticket.id}`}>
        {ticket.messages.map((entry) => (
          <article
            key={entry.id}
            className={`support-message ${entry.authorType === 'member' ? 'support-message--member' : 'support-message--agent'}`}
          >
            <div className="support-message__meta">
              <span className="support-message__avatar">
                {entry.authorType === 'member'
                  ? user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')
                  : 'CS'}
              </span>
              <div>
                <strong>{entry.author}</strong>
                <span>{entry.sentAt}</span>
              </div>
            </div>
            <p>{entry.body}</p>
            {entry.attachment ? (
              <span className="support-message__attachment">
                <FileTextIcon size={14} />
                {entry.attachment}
              </span>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="support-reply-box">
        <div className="support-reply-box__label">
          <span aria-hidden="true"><MessageIcon size={15} /></span>
          <strong>Reply to support</strong>
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Write a reply or provide the information the support team requested…"
        />
        <div className="support-resolution-row">
          <p>
            If you are satisfied with the solution, you may close this ticket. Closed tickets remain visible in Support Center.
          </p>
          <div className="support-resolution-actions">
            <span className="support-close-actions">
              <button type="button" onClick={discardReply} className="action-secondary" disabled={!message.trim()}>
                Discard
              </button>
              <button
                type="button"
                onClick={() => onCloseTicket(ticket.id)}
                className="action-secondary support-close-ticket"
              >
                Close ticket
              </button>
            </span>
            <button type="submit" className="action-primary" disabled={!message.trim()}>
              Send reply
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
