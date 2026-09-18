import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';
import { storeCentralAuthHandoff } from '@/modules/authentication/utils/authenticationHelpers';
import { useToast } from './ToastProvider';

export type AccountModal = 'profile' | 'password' | null;
interface AccountModalsProps { modal: AccountModal; onClose: () => void; }

function DialogShell({ title, description, onClose, children, footer }: { title: string; description: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [onClose]);

  return createPortal(
    <div className="account-dialog-backdrop" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" className="account-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header className="account-dialog__header">
          <div>
            <h2 id="account-dialog-title">{title}</h2>
            <p>{description}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="account-dialog__close" aria-label={`Close ${title}`}>✕</button>
        </header>
        <div className="account-dialog__body">{children}</div>
        <footer className="account-dialog__footer">{footer}</footer>
      </section>
    </div>,
    document.body,
  );
}

const inputClass = 'account-dialog__input';

export function AccountModals({ modal, onClose }: AccountModalsProps) {
  const { user, initials, updateUser } = useCurrentUser();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [passwordError, setPasswordError] = useState('');

  // Seed the profile fields from the current user, and clear the password fields, whenever
  // a modal opens or the underlying user changes. Adjusted during render rather than in an
  // effect: an effect body would paint the previous values for one frame before resetting,
  // which is visible when reopening the profile modal after a save. `user` is a stable
  // state object from UserProvider, so the identity comparison cannot loop.
  const [renderedFor, setRenderedFor] = useState({ modal, user });
  if (renderedFor.modal !== modal || renderedFor.user !== user) {
    setRenderedFor({ modal, user });
    if (modal === 'profile') { setName(user.name); setEmail(user.email); setPhone(user.phone); }
    if (modal === 'password') { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setVisible({}); }
  }

  if (!modal) return null;

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) { showToast('Please fill in your name and email'); return; }
    updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    onClose();
    showToast('Profile updated ✓');
  };
  const score = [newPassword.length >= 8, /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword), /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)].filter(Boolean).length;
  const strengthLabels = ['Weak — add more characters', 'Fair — add a number or symbol', 'Good — almost there', 'Strong password'];
  const strengthColors = ['is-empty', 'is-weak', 'is-fair', 'is-good', 'is-strong'];
  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('Please fill in all password fields'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setPasswordError(''); onClose(); showToast('Password updated successfully ✓');
  };
  const toggleVisible = (key: string) => setVisible((state) => ({ ...state, [key]: !state[key] }));
  // Handed off via sessionStorage instead of a ?returnUrl= query param — /forgot-password is on
  // this same platform origin, so it can read the value back without it sitting in the URL.
  if (typeof window !== 'undefined') storeCentralAuthHandoff({ returnUrl: window.location.href });
  const recoveryUrl = resolvePlatformUrl('/forgot-password');

  if (modal === 'profile') return (
    <DialogShell
      title="Edit profile"
      description="Update the details shown across Catholic Solutions."
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} className="action-secondary">Cancel</button>
          <button type="submit" form="profile-form" className="action-primary">Save changes</button>
        </>
      )}
    >
      <form id="profile-form" onSubmit={saveProfile} className="account-dialog__form">
        <div className="account-dialog__identity">
          <span className="account-dialog__avatar" aria-hidden="true">{initials}</span>
          <p>
            <span>Profile photo</span>
            <strong>Initials shown across the platform</strong>
          </p>
        </div>
        {([['Full name', name, setName, 'text'], ['Email address', email, setEmail, 'email'], ['Phone number', phone, setPhone, 'tel']] as const).map(([label, value, setter, type]) => (
          <label key={label} className="account-dialog__field">
            {label}
            <input type={type} value={value} onChange={(event) => setter(event.target.value)} className={inputClass} />
          </label>
        ))}
      </form>
    </DialogShell>
  );

  const passwordField = (label: string, key: string, value: string, setter: (value: string) => void) => (
    <label className="account-dialog__field">
      {label}
      <span className="account-dialog__password">
        <input
          type={visible[key] ? 'text' : 'password'}
          value={value}
          onChange={(event) => setter(event.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => toggleVisible(key)}
          className="account-dialog__reveal"
          aria-label={`${visible[key] ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {visible[key] ? 'Hide' : 'Show'}
        </button>
      </span>
    </label>
  );

  return (
    <DialogShell
      title="Change password"
      description="Choose a strong password you do not use elsewhere."
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} className="action-secondary">Cancel</button>
          <button type="submit" form="password-form" className="action-primary">Update password</button>
        </>
      )}
    >
      <form id="password-form" onSubmit={savePassword} className="account-dialog__form">
        <div>
          {passwordField('Current password', 'current', currentPassword, setCurrentPassword)}
          <a href={recoveryUrl} className="account-recovery-link">Forgot your current password? Start account recovery</a>
        </div>
        <div>
          {passwordField('New password', 'new', newPassword, setNewPassword)}
          <div className="account-dialog__strength" aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <span key={bar} className={bar <= score ? strengthColors[score] : 'is-empty'} />
            ))}
          </div>
          <p className="account-dialog__hint">{newPassword ? strengthLabels[Math.max(score - 1, 0)] : 'Use 8+ characters with a number and a symbol.'}</p>
        </div>
        <div>
          {passwordField('Confirm new password', 'confirm', confirmPassword, setConfirmPassword)}
          {passwordError ? <p className="account-dialog__error">{passwordError}</p> : null}
        </div>
      </form>
    </DialogShell>
  );
}
