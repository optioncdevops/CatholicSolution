import { useEffect, useRef, useState } from 'react';
import { CheckIcon, MailIcon, UserIcon } from '@shared/app/components/UiIcons';
import { ProductLogoIcon } from '@shared/app/components/ProductLogoIcon';
import { useToast } from '@shared/app/components/ToastProvider';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';
import { saveAccessRequest } from '@/modules/requests/services/accessRequestService';
import { toSaveAccessRequestPayload } from '@/modules/requests/utils/accessRequestHelpers';
import { validateSaveAccessRequest } from '@/modules/requests/validator/AccessRequestValidator';

type RequestInterestModalProps = {
  app: CatalogApp | null;
  onClose: () => void;
  onSubmitted: (app: CatalogApp, message?: string) => void;
};

export function RequestInterestModal({ app, onClose, onSubmitted }: RequestInterestModalProps) {
  //#region Hooks
  const { user } = useCurrentUser();
  const { showToast } = useToast();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const requestRef = useRef<HTMLButtonElement | null>(null);
  //#endregion

  //#region States
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, sendToEmail: app?.contactEmail || '', reason: '' });
  const submittingRef = useRef(false);
  submittingRef.current = submitting;
  //#endregion

  //#region Effects
  useEffect(() => {
    if (!app) return;
    setSubmitted(false);
    setSubmitting(false);
    setForm({ name: user.name, email: user.email, sendToEmail: app.contactEmail || '', reason: '' });
    // Only re-seed when a request is (re)opened for a given app — depending on user.name/email here
    // wiped whatever the requester had already typed into sendToEmail/reason on any unrelated profile update.
  }, [app]);

  useEffect(() => {
    if (!app) return undefined;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [app, onClose]);

  useEffect(() => {
    if (!app) return;
    if (submitted) closeRef.current?.focus();
    else requestRef.current?.focus();
  }, [app, submitted]);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequest = async () => {
    if (!app || submitting || submitted) return;
    const payload = toSaveAccessRequestPayload(app, form);
    const messages = validateSaveAccessRequest(payload);
    if (messages.length) {
      showToast(messages.join(' '));
      return;
    }
    setSubmitting(true);
    try {
      const message = await saveAccessRequest(payload);
      setSubmitted(true);
      onSubmitted(app, message);
    } catch (error) {
      console.error('Error submitting access request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to submit access request.');
    } finally {
      setSubmitting(false);
    }
  };
  //#endregion

  //#region Render
  if (!app) return null;

  return (
    <div className="hub-request-overlay" onMouseDown={handleClose}>
      <section
        className={`hub-request-modal ${submitted ? 'hub-request-modal--received' : 'hub-request-modal--confirm'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hub-request-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="hub-request-modal__close" onClick={handleClose} disabled={submitting} aria-label="Close request">×</button>
        <ProductLogoIcon app={app} className="hub-request-modal__icon" />
        {submitted ? (
          <>
            <span className="hub-request-modal__status"><CheckIcon size={13}/> Request received</span>
            <h2 id="hub-request-title">Thank you for your interest!</h2>
            <p>Thank you for your interest in <strong>{app.name}</strong>. Your request has been successfully received.</p>
            <p className="hub-request-modal__service-copy">Our <strong>Member Services team</strong> will review your request and contact you <strong>within 24 hours</strong> to discuss access, subscription options, and the next steps.</p>
            <div className="hub-request-modal__identity" aria-label="Request contact information">
              <div><UserIcon size={16}/><span><small>Member</small><strong>{form.name}</strong></span></div>
              <div><MailIcon size={16}/><span><small>Contact email</small><strong>{form.email}</strong></span></div>
            </div>
            <div className="hub-request-modal__notice hub-request-modal__notice--next">
              <strong>What happens next?</strong>
              <span>A member of our team will contact you using your registered email address with further details.</span>
            </div>
            <button type="button" className="hub-request-modal__primary" onClick={handleClose}>Close</button>
          </>
        ) : (
          <>
            <span className="hub-request-modal__status hub-request-modal__status--confirm">Access on request</span>
            <h2 id="hub-request-title">Request access to {app.name}</h2>
            <p>Member Services will review this request and follow up about access and next steps.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Requester Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} disabled={submitting} className="auth-input auth-input--plain" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Requester Email</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} disabled={submitting} className="auth-input auth-input--plain" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Send to Email</label>
                <input type="email" name="sendToEmail" value={form.sendToEmail} onChange={handleInputChange} disabled={submitting} placeholder="admin@example.com" className="auth-input auth-input--plain" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Reason / Additional Information</label>
                <textarea name="reason" value={form.reason} onChange={handleInputChange} disabled={submitting} rows={3} className="auth-input auth-input--plain py-2.5 resize-y"></textarea>
              </div>
            </div>
            <div className="hub-request-modal__notice">
              <strong>Ready to request?</strong>
              <span>Submit this request and our team will contact you using your registered email address.</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="hub-request-modal__secondary bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-bold transition-colors" onClick={handleClose} disabled={submitting}>Cancel</button>
              <button ref={requestRef} type="button" className="hub-request-modal__primary py-2.5 rounded-lg font-bold transition-colors" onClick={() => void handleRequest()} disabled={submitting} autoFocus>
                {submitting ? 'Submitting…' : 'Request'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
  //#endregion
}
