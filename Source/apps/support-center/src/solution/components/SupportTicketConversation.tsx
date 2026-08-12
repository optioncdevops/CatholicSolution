import { useState, type FormEvent } from 'react';
import { FileTextIcon, MessageIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { SupportTicket } from './supportData';

export function SupportTicketConversation({ ticket, onClose, onReply }: {
  ticket: SupportTicket;
  onClose: () => void;
  onReply: (ticketId: string, message: string) => void;
}) {
  const { user } = useCurrentUser();
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    onReply(ticket.id, body); setMessage('');
  };
  return (
    <section className="support-panel support-conversation-panel min-h-0">
      <header className="support-conversation-head">
        <div><div className="flex flex-wrap items-center gap-2"><span className="dashboard-kicker text-sky-700">#{ticket.id}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600">{ticket.status}</span></div><h2>{ticket.subject}</h2><p>{ticket.productName} · {ticket.contact} · Updated {ticket.updated}</p></div>
        <button type="button" onClick={onClose} className="support-conversation-close">Close</button>
      </header>
      <div className="support-conversation-thread scrollbar-thin" aria-label={`Conversation for ticket ${ticket.id}`}>
        {ticket.messages.map((entry) => <article key={entry.id} className={`support-message ${entry.authorType === 'member' ? 'support-message--member' : 'support-message--agent'}`}>
          <div className="support-message__meta"><span className="support-message__avatar">{entry.authorType === 'member' ? user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') : 'CS'}</span><div><strong>{entry.author}</strong><span>{entry.sentAt}</span></div></div>
          <p>{entry.body}</p>
          {entry.attachment ? <span className="support-message__attachment"><FileTextIcon size={14}/>{entry.attachment}</span> : null}
        </article>)}
      </div>
      <form onSubmit={submit} className="support-reply-box"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-sky-700"><MessageIcon size={15}/></span><strong>Reply to support</strong></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Write a reply or provide the information the support team requested…"/><div className="flex justify-end"><button type="submit" className="action-primary bg-brand-navy text-white hover:bg-[#173464]">Send reply</button></div></form>
    </section>
  );
}
