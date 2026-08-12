import type { ReactNode } from 'react';
import { SearchIcon } from '@shared/app/components/UiIcons';
import { resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';
import type { DirectoryGroup, DirectoryUser } from './directoryData';
import { initials } from './directoryData';

export function UserWorkspace({ users, query, selectedId, onQuery, onSelect, onManageAccess, onToggleActive, onAction }: {
  users: DirectoryUser[];
  query: string;
  selectedId?: string;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
  onManageAccess: (user: DirectoryUser) => void;
  onToggleActive: (id: string) => void;
  onAction: (message: string) => void;
}) {
  const selected = users.find((user) => user.id === selectedId) ?? users[0];
  return (
    <div className="directory-workspace directory-workspace--scalable">
      <section className="directory-list-panel">
        <Toolbar query={query} onQuery={onQuery} placeholder="Search name, email, application or group">
          <span className="directory-result-count">{users.length} users</span>
        </Toolbar>
        <div className="directory-table-wrap directory-table-wrap--users scrollbar-thin">
          <table className="directory-table directory-table--users">
            <thead><tr><th>User</th><th>SaaS applications</th><th>Groups</th><th>Last activity</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id} onClick={() => onSelect(user.id)} className={selected?.id === user.id ? 'is-selected' : ''}>
              <td><div className="directory-person"><span className="directory-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td>
              <td><ChipList items={user.applications} max={2}/></td>
              <td><ChipList items={user.groups} max={2}/></td>
              <td><span className="directory-muted">{user.lastActive}</span></td>
            </tr>)}</tbody>
          </table>
          {users.length === 0 ? <Empty copy="No users match the current search." /> : null}
        </div>
      </section>
      {selected ? <UserDetails user={selected} onManageAccess={onManageAccess} onToggleActive={onToggleActive} onAction={onAction} /> : <EmptyDetail />}
    </div>
  );
}

export function GroupWorkspace({ groups, users, query, selectedId, onQuery, onSelect, onManageMembers, onAction }: {
  groups: DirectoryGroup[];
  users: DirectoryUser[];
  query: string;
  selectedId?: string;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
  onManageMembers: (group: DirectoryGroup) => void;
  onAction: (message: string) => void;
}) {
  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];
  return (
    <div className="directory-workspace directory-workspace--scalable">
      <section className="directory-list-panel">
        <Toolbar query={query} onQuery={onQuery} placeholder="Search group, owner or connected application">
          <span className="directory-result-count">{groups.length} groups</span>
        </Toolbar>
        <div className="directory-table-wrap directory-table-wrap--groups scrollbar-thin">
          <table className="directory-table directory-table--groups">
            <thead><tr><th>Group</th><th>Members</th><th>Owner</th><th>Connected apps</th></tr></thead>
            <tbody>{groups.map((group) => <tr key={group.id} onClick={() => onSelect(group.id)} className={selected?.id === group.id ? 'is-selected' : ''}>
              <td><strong>{group.name}</strong><small className="directory-cell-sub">{group.description}</small></td>
              <td><strong>{group.memberIds.length}</strong></td>
              <td><span className="directory-muted">{group.owner}</span></td>
              <td><ChipList items={group.apps} max={2}/></td>
            </tr>)}</tbody>
          </table>
          {groups.length === 0 ? <Empty copy="No groups match your search." /> : null}
        </div>
      </section>
      {selected ? <GroupDetails group={selected} users={users} onManageMembers={onManageMembers} onAction={onAction} /> : <EmptyDetail />}
    </div>
  );
}

function Toolbar({ query, onQuery, placeholder, children }: { query: string; onQuery: (value: string) => void; placeholder: string; children?: ReactNode }) {
  return <div className="directory-toolbar"><label className="directory-search"><SearchIcon size={16}/><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder}/></label>{children}</div>;
}

function ChipList({ items, max }: { items: string[]; max: number }) {
  return <div className="directory-chip-row">{items.slice(0, max).map((item) => <span key={item}>{item}</span>)}{items.length > max ? <span>+{items.length - max}</span> : null}</div>;
}

function UserDetails({ user, onManageAccess, onToggleActive }: { user: DirectoryUser; onManageAccess: (user: DirectoryUser) => void; onToggleActive: (id: string) => void; onAction: (message: string) => void }) {
  const resetUrl = resolvePlatformUrl(`/forgot-password?email=${encodeURIComponent(user.email)}`);
  return (
    <aside className="directory-detail directory-detail--scrollable">
      <div className="directory-detail__identity"><span className="directory-avatar directory-avatar--lg">{initials(user.name)}</span><div><span className="metric-label text-slate-400">{user.active ? 'Active user' : 'Inactive user'}</span><h2>{user.name}</h2><p>{user.email}</p></div></div>
      <dl className="directory-detail__facts"><Fact label="Phone" value={user.phone}/><Fact label="Directory source" value={user.source}/><Fact label="Last activity" value={user.lastActive}/></dl>
      <DetailSection label="SaaS application access" items={user.applications} empty="No applications assigned"/>
      <DetailSection label="Group memberships" items={user.groups} empty="No groups assigned"/>
      <div className="directory-detail__actions">
        <button type="button" className="directory-detail__primary" onClick={() => onManageAccess(user)}>Manage access</button>
        <a className="directory-detail__link-action" href={resetUrl}>Reset password</a>
        <button type="button" className={user.active ? 'is-danger' : ''} onClick={() => onToggleActive(user.id)}>{user.active ? 'Move to Inactive Users' : 'Reactivate user'}</button>
      </div>
    </aside>
  );
}

function GroupDetails({ group, users, onManageMembers, onAction }: { group: DirectoryGroup; users: DirectoryUser[]; onManageMembers: (group: DirectoryGroup) => void; onAction: (message: string) => void }) {
  const members = group.memberIds.map((id) => users.find((user) => user.id === id)).filter((user): user is DirectoryUser => Boolean(user));
  return (
    <aside className="directory-detail directory-detail--scrollable">
      <div><span className="metric-label text-slate-400">Selected group</span><h2 className="mt-1">{group.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p></div>
      <dl className="directory-detail__facts"><Fact label="Members" value={String(group.memberIds.length)}/><Fact label="Owner" value={group.owner}/></dl>
      <DetailSection label="Connected applications" items={group.apps} empty="No applications connected"/>
      <div className="directory-detail__section"><span className="metric-label text-slate-400">Members</span><div className="directory-member-preview">{members.slice(0, 6).map((member) => <div key={member.id}><span className="directory-avatar">{initials(member.name)}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div>)}{members.length > 6 ? <p>+{members.length - 6} more members</p> : null}</div></div>
      <div className="directory-detail__actions"><button type="button" className="directory-detail__primary" onClick={() => onManageMembers(group)}>Add / manage users</button><button type="button" onClick={() => onAction(`Access review opened for ${group.name}`)}>Review group access</button></div>
    </aside>
  );
}

function DetailSection({ label, items, empty }: { label: string; items: string[]; empty: string }) {
  return <div className="directory-detail__section"><span className="metric-label text-slate-400">{label}</span>{items.length ? <div className="directory-chip-row directory-chip-row--roomy">{items.map((item) => <span key={item}>{item}</span>)}</div> : <p className="directory-detail__empty-copy">{empty}</p>}</div>;
}
function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Empty({ copy }: { copy: string }) { return <div className="directory-empty"><strong>No results</strong><span>{copy}</span></div>; }
function EmptyDetail() { return <aside className="directory-detail directory-detail--empty"><strong>Select a record</strong><span>Choose a user or group to review its details.</span></aside>; }
