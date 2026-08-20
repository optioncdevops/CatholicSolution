import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { AccountModals, type AccountModal } from './AccountModals';
import { ChevronDownIcon, LockIcon, LogOutIcon, UserIcon } from './UiIcons';
import { useAuth } from '@shared/auth/AuthProvider';
import { buildCentralLogoutUrl } from '@shared/auth/centralAuth';

interface ProfileMenuProps {
  gradient?: string;
}

export function ProfileMenu({ gradient }: ProfileMenuProps) {
  const { signOut } = useAuth();
  const { user, initials } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<AccountModal>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, []);

  const openModal = (next: Exclude<AccountModal, null>) => {
    setOpen(false);
    setModal(next);
  };

  const handleSignOut = () => {
    setOpen(false);
    signOut();
    const target = buildCentralLogoutUrl(window.location.href);
    if (target) window.location.replace(target);
  };

  return (
    <>
      <div className="profile-menu" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={`${user.name} account menu`}
          className={`profile-menu__trigger ${open ? 'profile-menu__trigger--open' : ''}`}
          title={user.name}
        >
          <span className="profile-menu__avatar" style={gradient ? { background: gradient } : undefined} aria-hidden="true">{initials}</span>
          <span className="profile-menu__trigger-copy">
            <span>{user.name}</span>
            <small>Account</small>
          </span>
          <ChevronDownIcon size={14} className={`profile-menu__chevron ${open ? 'profile-menu__chevron--open' : ''}`} />
        </button>

        {open ? (
          <div id={menuId} role="menu" className="profile-menu__panel" aria-label="Account menu">
            <div className="profile-menu__summary" style={gradient ? { '--profile-accent': gradient } as CSSProperties : undefined}>
              <span className="profile-menu__summary-avatar" style={gradient ? { background: gradient } : undefined} aria-hidden="true">{initials}</span>
              <div>
                <span className="profile-menu__eyebrow">Signed in as</span>
                <p>{user.name}</p>
                <span className="profile-menu__email">{user.email}</span>
              </div>
            </div>

            <div className="profile-menu__actions">
              <button type="button" role="menuitem" onClick={() => openModal('profile')}>
                <span aria-hidden="true"><UserIcon size={16} /></span>
                <div>
                  <strong>Profile</strong>
                  <small>Personal and contact details</small>
                </div>
              </button>
              <button type="button" role="menuitem" onClick={() => openModal('password')}>
                <span aria-hidden="true"><LockIcon size={16} /></span>
                <div>
                  <strong>Change password</strong>
                  <small>Update your account password</small>
                </div>
              </button>
            </div>

            <div className="profile-menu__divider" role="separator" />
            <button type="button" role="menuitem" onClick={handleSignOut} className="profile-menu__signout">
              <LogOutIcon size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : null}
      </div>
      <AccountModals modal={modal} onClose={() => setModal(null)} />
    </>
  );
}
