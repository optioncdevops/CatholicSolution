import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { resolveProfileImageUrl } from '@shared/auth/profileImage';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChevronDownIcon, LockIcon, LogOutIcon, UserIcon } from './UiIcons';
import { useAuth } from '@shared/auth/AuthProvider';
import { buildCentralLogoutUrl } from '@shared/auth/centralAuth';
import { environment } from '@shared/platform/config/environment';

interface ProfileMenuProps {
  gradient?: string;
}

export function ProfileMenu({ gradient }: ProfileMenuProps) {
  const { signOut } = useAuth();
  const { user, initials } = useCurrentUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const avatarImageUrl = resolveProfileImageUrl(user.profileImageUrl);

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

  const handleSignOut = () => {
    setOpen(false);
    // CFRAdmin has its own distinct login page on its own origin — sign out locally
    // via /logout instead of bouncing through CFR's central login/logout domain.
    if (environment.appId === 'cfr-admin') {
      signOut();
      navigate(`/logout?client_id=cfr-admin&returnUrl=${encodeURIComponent('/admin')}`, { replace: true });
      return;
    }
    signOut();
    const target = buildCentralLogoutUrl(window.location.href);
    if (target) window.location.replace(target);
  };

  return (
    <>
      <div className="profile-menu" ref={wrapperRef}>
        <button
          id="menuProfile"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={`${user.name} account menu`}
          className={`profile-menu__trigger ${open ? 'profile-menu__trigger--open' : ''}`}
          title={user.name}
        >
          <span className="profile-menu__avatar" style={gradient ? { background: gradient } : undefined} aria-hidden="true">
            {avatarImageUrl ? <img src={avatarImageUrl} alt="" /> : initials}
          </span>
          <span className="profile-menu__trigger-copy">
            <span>{user.name}</span>
            <small>{user.roleName || 'Account'}</small>
          </span>
          <ChevronDownIcon size={14} className={`profile-menu__chevron ${open ? 'profile-menu__chevron--open' : ''}`} />
        </button>

        {open ? (
          <div id={menuId} role="menu" className="profile-menu__panel" aria-label="Account menu">
            <div className="profile-menu__summary" style={gradient ? { '--profile-accent': gradient } as CSSProperties : undefined}>
              <span className="profile-menu__summary-avatar" style={gradient ? { background: gradient } : undefined} aria-hidden="true">
                {avatarImageUrl ? <img src={avatarImageUrl} alt="" /> : initials}
              </span>
              <div>
                <span className="profile-menu__eyebrow">Signed in as</span>
                <p>{user.name}</p>
                <span className="profile-menu__email">{user.email}</span>
              </div>
            </div>

            <div className="profile-menu__actions">
              <button id="menuItemProfile" type="button" role="menuitem" onClick={() => { setOpen(false); navigate('/admin/profile'); }}>
                <span aria-hidden="true"><UserIcon size={16} /></span>
                <div>
                  <strong>Profile</strong>
                  <small>Personal and contact details</small>
                </div>
              </button>
              <button id="menuItemChangePassword" type="button" role="menuitem" onClick={() => { setOpen(false); setPasswordModalOpen(true); }}>
                <span aria-hidden="true"><LockIcon size={16} /></span>
                <div>
                  <strong>Change Password</strong>
                  <small>Update your account password</small>
                </div>
              </button>
            </div>

            <div className="profile-menu__divider" role="separator" />
            <button id="menuItemSignOut" type="button" role="menuitem" onClick={handleSignOut} className="profile-menu__signout">
              <LogOutIcon size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : null}
      </div>
      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </>
  );
}
