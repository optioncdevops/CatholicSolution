import { useState, type FormEvent } from 'react';
import { FileTextIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';

export interface NewSupportTicketInput {
  subject: string;
  productId: string;
  productName: string;
  contact: string;
  message: string;
  attachment?: string;
}

interface SupportTicketFormProps {
  products: CatalogApp[];
  defaultProductId?: string;
  defaultContact?: string;
  onSubmit: (ticket: NewSupportTicketInput) => void;
}

export function SupportTicketForm({ products, defaultProductId, defaultContact, onSubmit }: SupportTicketFormProps) {
  const { user } = useCurrentUser();
  const [attachment, setAttachment] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get('product'));
    const product = products.find((item) => item.id === productId);
    const subject = String(form.get('subject') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (!product || !subject || !message) return;
    onSubmit({ subject, productId, productName: product.name, contact: String(form.get('contact') || 'Member Services'), message, attachment: attachment || undefined });
    event.currentTarget.reset(); setAttachment('');
  };

  const initialProduct = products.some((product) => product.id === defaultProductId) ? defaultProductId : products[0]?.id;
  return (
    <section className="support-panel support-compose-panel">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><p className="dashboard-kicker text-indigo-700">New request</p><h2 className="mt-1 text-lg font-extrabold text-slate-950">Add New Support Ticket</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose the product and support area so your request reaches the right team immediately.</p></div>
      <form onSubmit={submit} className="grid gap-3 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Your name" value={user.name} readOnly/><Field label="Email address" value={user.email} readOnly/></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="support-field"><span>Product <b>*</b></span><select name="product" required defaultValue={initialProduct}><option value="" disabled>Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="support-field"><span>Support area <b>*</b></span><select name="contact" required defaultValue={defaultContact || 'Product Support'}><option>Product Support</option><option>Member Services</option><option>Billing Support</option><option>Account & Access</option></select></label>
        </div>
        <label className="support-field"><span>Subject <b>*</b></span><input name="subject" required placeholder="Briefly describe the issue"/></label>
        <label className="support-field"><span>Message <b>*</b></span><textarea name="message" required rows={6} placeholder="Include what you were doing, what happened, and any error message you saw."/></label>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><FileTextIcon size={15}/><span>{attachment || 'Attach file'}</span><input type="file" className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0]?.name || '')}/></label>
          <button type="submit" className="action-primary bg-brand-navy text-white hover:bg-[#173464]">Submit ticket</button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return <label className="support-field"><span>{label}</span><input value={value} readOnly={readOnly} aria-readonly={readOnly}/></label>;
}
