import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { CheckCircleIcon, ClockIcon, HelpCircleIcon, MessageIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { availableSwitcherApps, getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { SupportTicketConversation } from '@/solution/components/SupportTicketConversation';
import { SupportTicketForm, type NewSupportTicketInput } from '@/solution/components/SupportTicketForm';
import { SupportTicketList } from '@/solution/components/SupportTicketList';
import { initialSupportTickets, type SupportTicket } from '@/solution/components/supportData';

const app = getAppById('support-center')!;
const supportProducts = availableSwitcherApps.filter((item) => item.id !== 'support-center');

export function SupportCenterPage() {
  const { showToast } = useToast();
  const { user } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const selectedId = searchParams.get('ticket') || undefined;
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);
  const defaultProductId = searchParams.get('product') || undefined;
  const defaultContact = searchParams.get('contact') || undefined;

  const openTicket = (ticket: SupportTicket) => setSearchParams({ ticket: ticket.id });
  const openNewTicket = () => setSearchParams({ view: 'new' });
  const addTicket = (input: NewSupportTicketInput) => {
    const next: SupportTicket = {
      id: `CS-${Math.floor(53000 + Math.random() * 900)}`,
      subject: input.subject,
      productId: input.productId,
      productName: input.productName,
      contact: input.contact,
      status: 'Open',
      updated: 'Just now',
      messages: [{ id: `m${Date.now()}`, author: user.name, authorType: 'member', sentAt: 'Just now', body: input.message, attachment: input.attachment }],
    };
    setTickets((items) => [next, ...items]);
    setSearchParams({ ticket: next.id });
    showToast(`Support ticket #${next.id} created ✓`);
  };
  const reply = (ticketId: string, body: string) => {
    setTickets((items) => items.map((ticket) => ticket.id === ticketId ? { ...ticket, status: 'Open', updated: 'Just now', messages: [...ticket.messages, { id: `m${Date.now()}`, author: user.name, authorType: 'member', sentAt: 'Just now', body }] } : ticket));
    showToast('Reply added to the support conversation ✓');
  };

  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack">
        <DashboardHeader eyebrow="Member services" title="Support Center" status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Support available</span>} />

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="support-summary"><span className="support-summary__icon bg-sky-50 text-sky-700"><HelpCircleIcon size={18}/></span><div><strong>Product-aware support</strong><span>Every ticket is routed to the right Catholic Solutions team</span></div></div>
          <div className="support-summary"><span className="support-summary__icon bg-amber-50 text-amber-700"><ClockIcon size={18}/></span><div><strong>Business-day response</strong><span>Monday–Friday, 8:00 AM–5:00 PM ET</span></div></div>
          <div className="support-summary"><span className="support-summary__icon bg-emerald-50 text-emerald-700"><CheckCircleIcon size={18}/></span><div><strong>Complete conversation history</strong><span>Keep every update and reply attached to its ticket</span></div></div>
        </section>

        <section className="support-workspace">
          <SupportTicketList tickets={tickets} selectedId={selectedTicket?.id} onOpen={openTicket} onNew={openNewTicket}/>
          {selectedTicket
            ? <SupportTicketConversation ticket={selectedTicket} onClose={openNewTicket} onReply={reply}/>
            : <SupportTicketForm key={`${defaultProductId}-${defaultContact}`} products={supportProducts} defaultProductId={defaultProductId} defaultContact={defaultContact} onSubmit={addTicket}/>
          }
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-navy text-white"><MessageIcon size={16}/></span><div><strong className="block text-sm text-slate-950">Not sure which support area to choose?</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">Member Services can route account, billing, product, and organization questions to the right team.</span></div></div>
          <button type="button" onClick={() => setSearchParams({ view: 'new', contact: 'Member Services' })} className="action-secondary shrink-0">Contact Member Services</button>
        </section>
      </main>
    </AppLayout>
  );
}
