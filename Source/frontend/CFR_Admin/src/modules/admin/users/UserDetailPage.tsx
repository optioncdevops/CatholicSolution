import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { confirmAction } from '../lib/confirm';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';

export function UserDetailPage() {
  const { userId } = useParams();
  const { getUser, getOrganization, applications, setUserStatus, grantUserAccess, revokeUserAccess } = useAdminData();
  const { showToast } = useToast();
  const [appToGrant, setAppToGrant] = useState('');

  const user = userId ? getUser(userId) : undefined;
  if (!user) return <Navigate to="/admin/users" replace />;

  const org = getOrganization(user.orgId);
  const accessibleApps = applications.filter((app) => user.appAccessIds.includes(app.id));
  const grantableApps = applications.filter((app) => !user.appAccessIds.includes(app.id));

  const handleActivate = () => { setUserStatus(user.id, 'active'); showToast(`${user.name} activated ✓`); };
  const handleDeactivate = async () => {
    const confirmed = await confirmAction({
      title: 'Deactivate user?',
      description: `${user.name} will lose access to their account and all assigned applications.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    setUserStatus(user.id, 'deactivated');
    showToast(`${user.name} deactivated`);
  };
  const handleGrant = () => {
    if (!appToGrant) return;
    const app = applications.find((item) => item.id === appToGrant);
    grantUserAccess(user.id, appToGrant);
    if (app) showToast(`Granted ${user.name} access to ${app.name} ✓`);
    setAppToGrant('');
  };
  const handleRevoke = (appId: string, appName: string) => {
    revokeUserAccess(user.id, appId);
    showToast(`Revoked ${user.name}'s access to ${appName}`);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={user.name}
        icon={<EntityAvatar name={user.name} size={40} />}
        action={(
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} kind="user" />
            {user.status === 'deactivated' ? (
              <button type="button" onClick={handleActivate} className="action-primary">Activate</button>
            ) : (
              <button type="button" onClick={() => void handleDeactivate()} className="rounded-[var(--radius-control)] border border-[var(--error)] px-3 py-2 text-xs font-bold text-[var(--error)] hover:bg-[var(--error-bg)]">Deactivate</button>
            )}
          </div>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Organization', org?.name ?? '—'],
          ['Email', user.email],
          ['Role', user.role],
          ['Status', user.status],
          ['Last active', user.lastActiveAt],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
            <p className="mt-1 truncate text-sm font-bold capitalize text-[var(--text-primary)]">
              {label === 'Organization' && org ? <Link to={`/admin/organizations/${org.id}`} className="hover:underline">{value}</Link> : value}
            </p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="panel-title">Application Access</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={appToGrant}
            onChange={(event) => setAppToGrant(event.target.value)}
            aria-label="Grant access to an application"
            className="rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 py-2 text-xs font-bold text-[var(--text-secondary)]"
          >
            <option value="">Select an application to grant…</option>
            {grantableApps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
          </select>
          <button type="button" onClick={handleGrant} disabled={!appToGrant} className="action-primary disabled:cursor-not-allowed disabled:opacity-50">Grant Access</button>
        </div>
        {accessibleApps.length === 0 ? (
          <EmptyState icon="🔐" title="No application access" description="Grant access to an application above." />
        ) : (
          <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]">
            {accessibleApps.map((app) => (
              <li key={app.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">{app.name}</p>
                </div>
                <button type="button" onClick={() => handleRevoke(app.id, app.name)} className="shrink-0 rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--error)] hover:text-[var(--error)]">
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
