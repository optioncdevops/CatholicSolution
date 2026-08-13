import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
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
    const next: SupportTicket = { id: `CS-${Math.floor(53000 + Math.random() * 900)}`, subject: input.subject, productId: input.productId, productName: input.productName, contact: input.contact, status: 'Open', updated: 'Just now', messages: [{ id: `m${Date.now()}`, author: user.name, authorType: 'member', sentAt: 'Just now', body: input.message, attachment: input.attachment }] };
    setTickets((items) => [next, ...items]); setSearchParams({ ticket: next.id }); showToast(`Support ticket #${next.id} started ✓`);
  };
  const reply = (ticketId: string, body: string) => { setTickets((items) => items.map((ticket) => ticket.id === ticketId ? { ...ticket, status: 'Open', updated: 'Just now', messages: [...ticket.messages, { id: `m${Date.now()}`, author: user.name, authorType: 'member', sentAt: 'Just now', body }] } : ticket)); showToast('Reply added to the support conversation ✓'); };
  const closeTicket = (ticketId: string) => { setTickets((items) => items.map((ticket) => ticket.id === ticketId ? { ...ticket, status: 'Resolved', updated: 'Just now' } : ticket)); showToast(`Ticket #${ticketId} closed ✓`); openNewTicket(); };

  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack support-center-page">
        <DashboardHeader eyebrow="Member services" title="Support Center" status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Support available</span>}/>
        <section className="support-main-card">
          <header className="support-main-card__head"><div><strong>Support workspace</strong><span>Start a new request or continue an existing conversation.</span></div><span>Business days · 8:00 AM–5:00 PM ET</span></header>
          <div className="support-workspace support-workspace--inside">
            <SupportTicketList tickets={tickets} selectedId={selectedTicket?.id} onOpen={openTicket} onNew={openNewTicket}/>
            {selectedTicket ? <SupportTicketConversation ticket={selectedTicket} onCancel={openNewTicket} onCloseTicket={closeTicket} onReply={reply}/> : <SupportTicketForm key={`${defaultProductId}-${defaultContact}`} products={supportProducts} defaultProductId={defaultProductId} defaultContact={defaultContact} onSubmit={addTicket}/>}          
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
