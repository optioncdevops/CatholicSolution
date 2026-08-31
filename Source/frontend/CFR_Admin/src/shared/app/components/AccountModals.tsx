import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';
import { changePassword, getProfile, updateProfile, updateStoredAcutisUser } from '@shared/auth/services/authService';
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
  const { user, initials } = useCurrentUser();
  const { showToast } = useToast();

  //#region Profile state
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  //#endregion

  //#region Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  //#endregion

  // Seed form fields from the current user and clear transient state whenever a modal opens.
  // Adjusted during render rather than in an effect: an effect body would paint the previous
  // values for one frame before resetting, which is visible when reopening a modal after a save.
  const [renderedFor, setRenderedFor] = useState<AccountModal>(null);
  if (renderedFor !== modal) {
    setRenderedFor(modal);
    if (modal === 'profile') {
      setProfileError('');
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
    if (modal === 'password') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setVisible({});
    }
  }

  // Refresh the profile fields from the server (the JWT-derived defaults above may be stale)
  // whenever the profile modal opens.
  useEffect(() => {
    if (modal !== 'profile') return undefined;
    let cancelled = false;
    void (async () => {
      try {
        setProfileLoading(true);
        const { resultData } = await getProfile();
        if (cancelled || !resultData) return;
        const profile = resultData as { firstName?: string; lastName?: string; email?: string };
        setFirstName(profile.firstName ?? user.firstName);
        setLastName(profile.lastName ?? user.lastName);
        setEmail(profile.email ?? user.email);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading profile:', error);
        showToast('Failed to load your profile.', 'error');
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per modal open, not on every user/showToast identity change
  }, [modal]);

  if (!modal) return null;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setProfileError('Please fill in your first name, last name, and email.');
      return;
    }

    setProfileError('');
    setProfileSaving(true);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      updateStoredAcutisUser({ firstName: firstName.trim(), lastName: lastName.trim(), eMail: email.trim() });
      showToast('Profile updated.', 'success');
      onClose();
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update profile.';
      setProfileError(message);
      showToast(message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const score = [newPassword.length >= 8, /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword), /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)].filter(Boolean).length;
  const strengthLabels = ['Weak — add more characters', 'Fair — add a number or symbol', 'Good — almost there', 'Strong password'];
  const strengthColors = ['is-empty', 'is-weak', 'is-fair', 'is-good', 'is-strong'];

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('Please fill in all password fields.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (score < 3) { setPasswordError('Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.'); return; }

    setPasswordError('');
    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      showToast('Password changed.', 'success');
      onClose();
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to change password.';
      setPasswordError(message);
      showToast(message, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleVisible = (key: string) => setVisible((state) => ({ ...state, [key]: !state[key] }));
  const recoveryUrl = resolvePlatformUrl(`/forgot-password${typeof window !== 'undefined' ? `?returnUrl=${encodeURIComponent(window.location.href)}` : ''}`);

  if (modal === 'profile') return (
    <DialogShell
      title="Edit profile"
      description="Update the details shown across Catholic Solutions."
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} className="action-secondary">Cancel</button>
          <button type="submit" form="profile-form" className="action-primary" disabled={profileSaving || profileLoading}>{profileSaving ? 'Saving…' : 'Save changes'}</button>
        </>
      )}
    >
      <form id="profile-form" onSubmit={(event) => void saveProfile(event)} className="account-dialog__form">
        <div className="account-dialog__identity">
          <span className="account-dialog__avatar" aria-hidden="true">{initials}</span>
          <p>
            <span>Profile photo</span>
            <strong>Initials shown across the platform</strong>
          </p>
        </div>
        {([['First name', firstName, setFirstName, 'text'], ['Last name', lastName, setLastName, 'text'], ['Email address', email, setEmail, 'email']] as const).map(([label, value, setter, type]) => (
          <label key={label} className="account-dialog__field">
            {label}
            <input type={type} value={value} onChange={(event) => setter(event.target.value)} className={inputClass} disabled={profileLoading || profileSaving} />
          </label>
        ))}
        {profileError ? <p className="account-dialog__error">{profileError}</p> : null}
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
          disabled={passwordSaving}
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
          <button type="submit" form="password-form" className="action-primary" disabled={passwordSaving}>{passwordSaving ? 'Updating…' : 'Update password'}</button>
        </>
      )}
    >
      <form id="password-form" onSubmit={(event) => void savePassword(event)} className="account-dialog__form">
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
