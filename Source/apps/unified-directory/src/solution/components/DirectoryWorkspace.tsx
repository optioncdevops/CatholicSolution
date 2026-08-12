import type { ReactNode } from 'react';
import { SearchIcon } from '@shared/app/components/UiIcons';
import type { DirectoryGroup, DirectoryUser, UserStatus } from './directoryData';
import { initials } from './directoryData';

export function UserWorkspace({ users, query, status, onQuery, onStatus, selectedId, onSelect, onAction }: {
  users: DirectoryUser[]; query: string; status: 'All' | UserStatus; onQuery: (value: string) => void; onStatus: (value: 'All' | UserStatus) => void;
  selectedId?: string; onSelect: (id: string) => void; onAction: (message: string) => void;
}) {
  const selected = users.find((user) => user.id === selectedId) ?? users[0];
  return (
    <div className="directory-workspace">
      <section className="directory-list-panel">
        <Toolbar query={query} onQuery={onQuery} placeholder="Search name, email, role or group">
          <select value={status} onChange={(event) => onStatus(event.target.value as 'All' | UserStatus)} className="directory-filter" aria-label="Filter users by status">
            <option>All</option><option>Active</option><option>Invited</option><option>Suspended</option>
          </select>
        </Toolbar>
        <div className="directory-table-wrap">
          <table className="directory-table">
            <thead><tr><th>User</th><th>Role</th><th>Groups</th><th>Status</th><th>Last activity</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id} onClick={() => onSelect(user.id)} className={selected?.id === user.id ? 'is-selected' : ''}>
              <td><div className="directory-person"><span className="directory-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td>
              <td><span className="directory-role">{user.role}</span></td>
              <td><div className="directory-chip-row">{user.groups.slice(0, 2).map((group) => <span key={group}>{group}</span>)}{user.groups.length > 2 ? <span>+{user.groups.length - 2}</span> : null}</div></td>
              <td><Status status={user.status} /></td><td><span className="directory-muted">{user.lastActive}</span></td>
            </tr>)}</tbody>
          </table>
          {users.length === 0 ? <Empty copy="No users match the current filters." /> : null}
        </div>
      </section>
      {selected ? <UserDetails user={selected} onAction={onAction} /> : null}
    </div>
  );
}

export function GroupWorkspace({ groups, query, onQuery, selectedId, onSelect, onAction }: {
  groups: DirectoryGroup[]; query: string; onQuery: (value: string) => void; selectedId?: string; onSelect: (id: string) => void; onAction: (message: string) => void;
}) {
  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];
  return (
    <div className="directory-workspace">
      <section className="directory-list-panel">
        <Toolbar query={query} onQuery={onQuery} placeholder="Search group, owner or connected app" />
        <div className="directory-table-wrap">
          <table className="directory-table">
            <thead><tr><th>Group</th><th>Type</th><th>Members</th><th>Owner</th><th>Connected apps</th></tr></thead>
            <tbody>{groups.map((group) => <tr key={group.id} onClick={() => onSelect(group.id)} className={selected?.id === group.id ? 'is-selected' : ''}>
              <td><strong>{group.name}</strong><small className="directory-cell-sub">{group.description}</small></td><td><span className="directory-role">{group.type}</span></td><td><strong>{group.members}</strong></td><td><span className="directory-muted">{group.owner}</span></td><td><div className="directory-chip-row">{group.apps.map((item) => <span key={item}>{item}</span>)}</div></td>
            </tr>)}</tbody>
          </table>
          {groups.length === 0 ? <Empty copy="No groups match your search." /> : null}
        </div>
      </section>
      {selected ? <GroupDetails group={selected} onAction={onAction} /> : null}
    </div>
  );
}

function Toolbar({ query, onQuery, placeholder, children }: { query: string; onQuery: (value: string) => void; placeholder: string; children?: ReactNode }) {
  return <div className="directory-toolbar"><label className="directory-search"><SearchIcon size={16} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>{children}</div>;
}
function Status({ status }: { status: UserStatus }) { return <span className={`directory-status directory-status--${status.toLowerCase()}`}>{status}</span>; }
function Empty({ copy }: { copy: string }) { return <div className="directory-empty"><strong>No results</strong><span>{copy}</span></div>; }

function UserDetails({ user, onAction }: { user: DirectoryUser; onAction: (message: string) => void }) {
  return <aside className="directory-detail"><div className="directory-detail__identity"><span className="directory-avatar directory-avatar--lg">{initials(user.name)}</span><div><span className="metric-label text-slate-400">Selected user</span><h2>{user.name}</h2><p>{user.email}</p></div></div><Status status={user.status} /><dl className="directory-detail__facts"><Fact label="Role" value={user.role}/><Fact label="Identity source" value={user.source}/><Fact label="Last activity" value={user.lastActive}/></dl><div className="directory-detail__section"><span className="metric-label text-slate-400">Group memberships</span><div className="directory-chip-row directory-chip-row--roomy">{user.groups.map((group) => <span key={group}>{group}</span>)}</div></div><div className="directory-detail__actions"><button type="button" className="directory-detail__primary" onClick={() => onAction(`Edit access for ${user.name}`)}>Edit access</button><button type="button" onClick={() => onAction(user.status === 'Invited' ? `Invitation resent to ${user.email}` : `Password reset flow opened for ${user.name}`)}>{user.status === 'Invited' ? 'Resend invitation' : 'Reset password'}</button><button type="button" className="is-danger" onClick={() => onAction(`${user.name} account status workflow opened`)}>{user.status === 'Suspended' ? 'Restore access' : 'Suspend access'}</button></div></aside>;
}
function GroupDetails({ group, onAction }: { group: DirectoryGroup; onAction: (message: string) => void }) {
  return <aside className="directory-detail"><div><span className="metric-label text-slate-400">Selected group</span><h2 className="mt-1">{group.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p></div><dl className="directory-detail__facts"><Fact label="Type" value={group.type}/><Fact label="Members" value={String(group.members)}/><Fact label="Owner" value={group.owner}/></dl><div className="directory-detail__section"><span className="metric-label text-slate-400">Connected applications</span><div className="directory-chip-row directory-chip-row--roomy">{group.apps.map((app) => <span key={app}>{app}</span>)}</div></div><div className="directory-detail__actions"><button type="button" className="directory-detail__primary" onClick={() => onAction(`Add members to ${group.name}`)}>Add members</button><button type="button" onClick={() => onAction(`Edit ${group.name} settings`)}>Edit group</button><button type="button" onClick={() => onAction(`Access review opened for ${group.name}`)}>Review access</button></div></aside>;
}
function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
