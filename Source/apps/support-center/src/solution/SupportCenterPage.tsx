import { useState } from 'react';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { CheckCircleIcon, ClockIcon, HelpCircleIcon, MessageIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById, launchableApps } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { SupportResourcePanel } from '@/solution/components/SupportResourcePanel';
import { SupportTicketForm } from '@/solution/components/SupportTicketForm';
import { SupportTicketList } from '@/solution/components/SupportTicketList';
import { initialSupportTickets, type SupportTicket } from '@/solution/components/supportData';

const app = getAppById('support-center')!;
const supportProducts = launchableApps.filter((item) => item.id !== 'support-center');

export function SupportCenterPage() {
  const { showToast } = useToast();
  const [resourceProduct, setResourceProduct] = useState('all');
  const [tickets, setTickets] = useState<SupportTicket[]>(initialSupportTickets);

  const addTicket = (input: { subject: string; productId: string; productName: string; contact: string }) => {
    const next: SupportTicket = { id: `CS-${Math.floor(53000 + Math.random() * 900)}`, ...input, status: 'Open', updated: 'Just now' };
    setTickets((items) => [next, ...items]);
    showToast(`Support ticket #${next.id} created ✓`);
  };

  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack">
        <DashboardHeader eyebrow="Member services" title="Support Center" status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Support available</span>} />

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="support-summary"><span className="support-summary__icon bg-sky-50 text-sky-700"><HelpCircleIcon size={18}/></span><div><strong>Product-aware help</strong><span>Resources for every connected Catholic Solutions app</span></div></div>
          <div className="support-summary"><span className="support-summary__icon bg-amber-50 text-amber-700"><ClockIcon size={18}/></span><div><strong>Business-day response</strong><span>Monday–Friday, 8:00 AM–5:00 PM ET</span></div></div>
          <div className="support-summary"><span className="support-summary__icon bg-emerald-50 text-emerald-700"><CheckCircleIcon size={18}/></span><div><strong>One support history</strong><span>Track requests across School, Parish, Finance, Alerts and more</span></div></div>
        </section>

        <section className="grid min-h-0 gap-4 xl:grid-cols-[0.92fr_1.18fr_0.82fr]">
          <SupportResourcePanel products={supportProducts} selectedProduct={resourceProduct} onProductChange={setResourceProduct} onOpen={(title) => showToast(`${title} would open in the help viewer`)} />
          <SupportTicketForm products={supportProducts} onSubmit={addTicket} />
          <SupportTicketList tickets={tickets} onOpen={(ticket) => showToast(`Opening ticket #${ticket.id}: ${ticket.subject}`)} />
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-navy text-white"><MessageIcon size={16}/></span><div><strong className="block text-sm text-slate-950">Need help choosing where to send your request?</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">Member Services can route account, billing, product, and organization questions to the right team.</span></div></div>
          <button type="button" onClick={() => showToast('Member Services contact options would open here')} className="action-secondary shrink-0">Contact Member Services</button>
        </section>
      </main>
    </AppLayout>
  );
}
