import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useCurrentUser } from '@shared/app/context/UserContext';
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

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" className="my-6 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="relative bg-gradient-to-r from-brand-navy to-brand-navy-light px-6 py-5 text-white">
          <h2 id="account-dialog-title" className="font-serif text-xl font-bold">{title}</h2>
          <p className="mt-1 text-xs text-white/70">{description}</p>
          <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl bg-white/10 font-bold hover:bg-white/20" aria-label={`Close ${title}`}>✕</button>
        </header>
        <div className="p-6">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4">{footer}</footer>
      </section>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';

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
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-600'];
  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('Please fill in all password fields'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setPasswordError(''); onClose(); showToast('Password updated successfully ✓');
  };
  const toggleVisible = (key: string) => setVisible((state) => ({ ...state, [key]: !state[key] }));

  if (modal === 'profile') return (
    <DialogShell title="Edit Profile" description="Update your basic details below." onClose={onClose} footer={<><button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" form="profile-form" className="action-primary bg-gradient-to-r from-violet-700 to-pink-600 text-white">Save changes</button></>}>
      <form id="profile-form" onSubmit={saveProfile} className="grid gap-4">
        <div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-gradient-to-r from-violet-700 to-pink-600 text-lg font-extrabold text-white">{initials}</span><p className="text-xs text-slate-400">Profile photo<strong className="block text-sm text-slate-700">Initials shown across the app</strong></p></div>
        {([['Full name','👤',name,setName,'text'],['Email address','✉️',email,setEmail,'email'],['Phone number','📱',phone,setPhone,'tel']] as const).map(([label,icon,value,setter,type]) => <label key={label} className="text-xs font-extrabold text-slate-700">{label}<span className="relative mt-2 block"><span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span><input type={type} value={value} onChange={(event) => setter(event.target.value)} className={inputClass} /></span></label>)}
        <label className="text-xs font-extrabold text-slate-700">Role / Organization<span className="relative mt-2 block"><span className="absolute left-3 top-1/2 -translate-y-1/2">🏛️</span><input value={user.role} disabled className={inputClass} /></span><span className="mt-1.5 block text-[11px] font-semibold leading-5 text-slate-400">Role and organization are managed by your OptionC administrator.</span></label>
      </form>
    </DialogShell>
  );

  const passwordField = (label: string, key: string, value: string, setter: (value: string) => void) => <label className="text-xs font-extrabold text-slate-700">{label}<span className="relative mt-2 block"><span className="absolute left-3 top-1/2 -translate-y-1/2">🔒</span><input type={visible[key] ? 'text' : 'password'} value={value} onChange={(event) => setter(event.target.value)} className={`${inputClass} pr-11`} /><button type="button" onClick={() => toggleVisible(key)} className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg hover:bg-slate-100" aria-label={`${visible[key] ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>👁️</button></span></label>;
  return (
    <DialogShell title="Change Password" description="Choose a strong password you don't use elsewhere." onClose={onClose} footer={<><button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" form="password-form" className="action-primary bg-gradient-to-r from-violet-700 to-pink-600 text-white">Update password</button></>}>
      <form id="password-form" onSubmit={savePassword} className="grid gap-4">
        {passwordField('Current password','current',currentPassword,setCurrentPassword)}
        <div>{passwordField('New password','new',newPassword,setNewPassword)}<div className="mt-2 flex gap-1.5">{[1,2,3,4].map((bar) => <span key={bar} className={`h-1.5 flex-1 rounded-full ${bar <= score ? strengthColors[score] : 'bg-slate-200'}`} />)}</div><p className="mt-1.5 text-[11px] font-bold text-slate-400">{newPassword ? strengthLabels[Math.max(score - 1, 0)] : 'Use 8+ characters with a number and a symbol.'}</p></div>
        <div>{passwordField('Confirm new password','confirm',confirmPassword,setConfirmPassword)}{passwordError ? <p className="mt-1.5 text-[11px] font-bold text-rose-600">{passwordError}</p> : null}</div>
      </form>
    </DialogShell>
  );
}
