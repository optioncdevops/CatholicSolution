import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { confirmAction } from '../../lib/confirm';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { getUserById, updateUserStatus } from '../services/usersService';
import type { UsersApiItem } from '../types/usersTypes';
import { normalizeUser } from '../utils/usersHelpers';
import { formatDate } from '../../utils/formatDate';

export function UserDetailPage() {
  //#region Hooks
  const { userId } = useParams();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const numericId = Number(userId);
  const [user, setUser] = useState<UsersApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  //#endregion

  //#region Functions
  const load = useCallback(async () => {
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setMissing(true);
      setLoading(false);
      return;
    }
    try {
      const { resultData } = await getUserById(numericId);
      const row = normalizeUser(resultData);
      if (!row) {
        setMissing(true);
        setUser(null);
        return;
      }
      setUser(row);
      setMissing(false);
    } catch (error) {
      console.error('Error loading user details:', error);
      showToast('Failed to load user.');
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, [numericId, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(numericId) || numericId <= 0) {
      const timer = window.setTimeout(() => {
        if (cancelled) return;
        setMissing(true);
        setLoading(false);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
    void (async () => {
      try {
        const { resultData } = await getUserById(numericId);
        if (cancelled) return;
        const row = normalizeUser(resultData);
        if (!row) {
          setMissing(true);
          setUser(null);
          return;
        }
        setUser(row);
        setMissing(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user details:', error);
        showToast('Failed to load user.');
        setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId, showToast]);
  //#endregion

  //#region Handlers
  const handleActivate = async () => {
    if (!user) return;
    try {
      await updateUserStatus(user.userId, 'active');
      showToast(`${user.fullName} activated ✓`);
      await load();
    } catch (error) {
      console.error('Error activating user:', error);
      showToast('Failed to activate user.');
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    const confirmed = await confirmAction({
      title: 'Deactivate user?',
      description: `${user.fullName} will lose access to their account.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await updateUserStatus(user.userId, 'deactivated');
      showToast(`${user.fullName} deactivated`);
      await load();
    } catch (error) {
      console.error('Error deactivating user:', error);
      showToast('Failed to deactivate user.');
    }
  };
  //#endregion

  //#region Render
  if (!loading && missing) return <Navigate to="/admin/users" replace />;
  if (loading || !user) {
    return <div className="grid min-h-[40vh] place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" aria-label="Loading" /></div>;
  }

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={user.fullName}
        icon={<EntityAvatar name={user.fullName} size={40} />}
        action={(
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} kind="user" />
            {user.status === 'deactivated' ? (
              <button type="button" onClick={() => void handleActivate()} className="action-primary">Activate</button>
            ) : (
              <button type="button" onClick={() => void handleDeactivate()} className="rounded-[var(--radius-control)] border border-[var(--error)] px-3 py-2 text-xs font-bold text-[var(--error)] hover:bg-[var(--error-bg)]">Deactivate</button>
            )}
          </div>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Organization', user.organizationName || '—'],
          ['Email', user.eMail],
          ['Role', user.roleName],
          ['Status', user.status],
          ['Last active', user.lastActiveAt ? formatDate(user.lastActiveAt) : '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
            <p className="mt-1 truncate text-sm font-bold capitalize text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="panel-title">Application Access</h2>
        <EmptyState icon="🔐" title="Application access is not wired yet" description="Grant and revoke will be connected in a later slice." />
      </section>
    </div>
  );
  //#endregion
}

export default UserDetailPage;
