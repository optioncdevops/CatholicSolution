import { useState, type FormEvent } from 'react';
import { FileTextIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';

interface SupportTicketFormProps {
  products: CatalogApp[];
  onSubmit: (ticket: { subject: string; productId: string; productName: string; contact: string }) => void;
}

export function SupportTicketForm({ products, onSubmit }: SupportTicketFormProps) {
  const { user } = useCurrentUser();
  const [attachment, setAttachment] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get('product'));
    const product = products.find((item) => item.id === productId);
    const subject = String(form.get('subject') || '').trim();
    if (!product || !subject) return;
    onSubmit({ subject, productId, productName: product.name, contact: String(form.get('contact') || 'Member Services') });
    event.currentTarget.reset(); setAttachment('');
  };

  return (
    <section className="support-panel">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><p className="dashboard-kicker text-indigo-700">Need more help?</p><h2 className="mt-1 text-base font-extrabold text-slate-950">Start a support ticket</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose the product first so your request reaches the right Catholic Solutions support team.</p></div>
      <form onSubmit={submit} className="grid gap-3 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Your name" value={user.name} readOnly/><Field label="Organization" value="St. Mary's Catholic School" readOnly/></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Email address" value={user.email} readOnly/><Field label="Telephone" value={user.phone} readOnly/></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="support-field"><span>Product <b>*</b></span><select name="product" required defaultValue="optionc-school"><option value="" disabled>Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="support-field"><span>I want to contact <b>*</b></span><select name="contact" required defaultValue="Product Support"><option>Product Support</option><option>Member Services</option><option>Billing Support</option><option>Account & Access</option></select></label>
        </div>
        <label className="support-field"><span>Subject <b>*</b></span><input name="subject" required placeholder="Briefly describe the issue" /></label>
        <label className="support-field"><span>Message <b>*</b></span><textarea name="message" required rows={4} placeholder="Include what you were doing, what happened, and any error message you saw." /></label>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><FileTextIcon size={15}/><span>{attachment || 'Attach file'}</span><input type="file" className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0]?.name || '')} /></label>
          <button type="submit" className="action-primary bg-brand-navy text-white hover:bg-[#173464]">Submit ticket</button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return <label className="support-field"><span>{label}</span><input value={value} readOnly={readOnly} aria-readonly={readOnly} /></label>;
}
