import { useEffect, useRef } from 'react';
import { CheckIcon, MailIcon, UserIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';

export function RequestInterestModal({ app, onClose }: { app: CatalogApp | null; onClose: () => void }) {
  const { user } = useCurrentUser();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!app) return undefined;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [app, onClose]);

  if (!app) return null;

  return (
    <div className="hub-request-overlay" onMouseDown={onClose}>
      <section className="hub-request-modal hub-request-modal--received" role="dialog" aria-modal="true" aria-labelledby="hub-request-title" onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeRef} type="button" className="hub-request-modal__close" onClick={onClose} aria-label="Close request information">×</button>
        <span className="hub-request-modal__icon" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
        <span className="hub-request-modal__status"><CheckIcon size={13}/> Request received</span>
        <h2 id="hub-request-title">Thank you for your interest!</h2>
        <p>Thank you for your interest in <strong>{app.name}</strong>. Your request has been successfully received.</p>
        <p className="hub-request-modal__service-copy">Our <strong>Member Services team</strong> will review your request and contact you <strong>within 24 hours</strong> to discuss access, subscription options, and the next steps.</p>
        <div className="hub-request-modal__identity" aria-label="Request contact information">
          <div><UserIcon size={16}/><span><small>Member</small><strong>{user.name}</strong></span></div>
          <div><MailIcon size={16}/><span><small>Contact email</small><strong>{user.email}</strong></span></div>
        </div>
        <div className="hub-request-modal__notice hub-request-modal__notice--next">
          <strong>What happens next?</strong>
          <span>A member of our team will contact you using your registered email address with further details.</span>
        </div>
        <button type="button" className="hub-request-modal__primary" onClick={onClose}>Close</button>
      </section>
    </div>
  );
}
