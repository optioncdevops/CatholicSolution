import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { AccountModals, type AccountModal } from './AccountModals';
import { ChevronDownIcon, LockIcon, LogOutIcon, UserIcon } from './UiIcons';
import { useAuth } from '@shared/auth/AuthProvider';
import { buildCentralLogoutUrl } from '@shared/auth/centralAuth';
import { environment } from '@shared/platform/config/environment';

interface ProfileMenuProps {
  gradient?: string;
}

export function ProfileMenu({ gradient }: ProfileMenuProps) {
  const navigate = useNavigate();
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

    if (environment.appId === 'platform') {
      navigate('/login', { replace: true });
      return;
    }

    const target = buildCentralLogoutUrl(window.location.href);
    if (target) window.location.assign(target);
  };

  return (
    <>
      <div className="profile-menu" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`${user.name} account menu`}
          className={`profile-menu__trigger ${open ? 'profile-menu__trigger--open' : ''}`}
          title={user.name}
        >
          <span className="profile-menu__avatar" style={gradient ? { background: gradient } : undefined}>{initials}</span>
          <span className="profile-menu__trigger-copy">
            <span>{user.name}</span>
            <small>Administrator</small>
          </span>
          <ChevronDownIcon size={14} className={`profile-menu__chevron ${open ? 'profile-menu__chevron--open' : ''}`} />
        </button>

        {open ? (
          <div id={menuId} role="menu" className="profile-menu__panel">
            <div className="profile-menu__summary">
              <span className="profile-menu__summary-avatar" style={gradient ? { background: gradient } : undefined}>{initials}</span>
              <div>
                <p>{user.name}</p>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="profile-menu__role">{user.role}</div>

            <div className="profile-menu__actions">
              <button type="button" role="menuitem" onClick={() => openModal('profile')}><span><UserIcon size={17} /></span><div><strong>Profile</strong><small>Personal and contact details</small></div></button>
              <button type="button" role="menuitem" onClick={() => openModal('password')}><span><LockIcon size={17} /></span><div><strong>Security</strong><small>Password and account access</small></div></button>
            </div>

            <div className="profile-menu__divider" />
            <button type="button" role="menuitem" onClick={handleSignOut} className="profile-menu__signout"><LogOutIcon size={17} /><span>Sign out</span></button>
          </div>
        ) : null}
      </div>
      <AccountModals modal={modal} onClose={() => setModal(null)} />
    </>
  );
}
