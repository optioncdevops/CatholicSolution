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
  const initialProduct = products.some((product) => product.id === defaultProductId) ? defaultProductId : products[0]?.id;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get('product'));
    const product = products.find((item) => item.id === productId);
    const subject = String(form.get('subject') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (!product || !subject || !message) return;
    onSubmit({
      subject,
      productId,
      productName: product.name,
      contact: String(form.get('contact') || 'Member Services'),
      message,
      attachment: attachment || undefined,
    });
    event.currentTarget.reset();
    setAttachment('');
  };

  return (
    <section className="support-panel support-compose-panel">
      <header className="support-compose-head">
        <div>
          <h2>New support request</h2>
          <p>Signed in as <strong>{user.name}</strong> · {user.email}</p>
        </div>
      </header>

      <form onSubmit={submit} className="support-compose-form">
        <div className="support-compose-grid-2">
          <label className="support-field">
            <span>Product <b>*</b></span>
            <select name="product" required defaultValue={initialProduct}>
              <option value="" disabled>Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label className="support-field">
            <span>Support area <b>*</b></span>
            <select name="contact" required defaultValue={defaultContact || 'Member Services'}>
              <option>Member Services</option>
              <option>Product Support</option>
              <option>Billing Support</option>
              <option>Account & Access</option>
            </select>
          </label>
        </div>

        <label className="support-field">
          <span>Subject <b>*</b></span>
          <input name="subject" required placeholder="Briefly describe the issue" />
        </label>

        <label className="support-field support-message-field">
          <span>Message <b>*</b></span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Include what you were doing, what happened, what you expected, and any error message you saw."
          />
        </label>

        <div className="support-compose-actions">
          <label className="support-attachment-button">
            <FileTextIcon size={15} />
            <span>{attachment || 'Attach file'}</span>
            <input
              type="file"
              className="sr-only"
              onChange={(event) => setAttachment(event.target.files?.[0]?.name || '')}
            />
          </label>
          <button type="submit" className="action-primary">Start ticket</button>
        </div>
      </form>
    </section>
  );
}
